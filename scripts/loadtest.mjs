#!/usr/bin/env node
/**
 * Load-test runner for the synthetic `loadtest` lesson.
 *
 * Walks a virtual user through the whole lesson exactly like the React client:
 *   1. POST /api/users/login                          (cookie-session auth)
 *   2. GET  /  + same-origin assets                   (only with --assets)
 *   3. POST /api/levels/new_level_by_code/loadtest    (create a level)
 *   4. POST /api/levels/level/:id?validate_only=0     (answer the last page; the
 *      server appends the next page) -- repeated until the level is completed
 *   5. GET  /api/levels/clear_all_profgarrett_test_pages/  (cleanup)
 *
 * Run one lesson at a time, or many concurrent virtual users, to generate load.
 * Nothing is hard-coded: target + credentials come from the environment.
 *
 * Usage:
 *   TEST_PASSWORD=... node scripts/loadtest.mjs [flags]
 *   npm run loadtest -- [flags]
 *
 * Config (env):
 *   BASE_URL        default http://localhost:8080
 *   TEST_USER       default profgarrett+test@gmail.com
 *   TEST_PASSWORD   required (no default -- never commit a password)
 *
 * Flags:
 *   --concurrency N   parallel virtual users (default 1 = sequential)
 *   --iterations N    lessons each worker plays (default 1)
 *   --duration S      run for S seconds instead of a fixed iteration count
 *   --url URL         override BASE_URL
 *   --assets          also load / and its same-origin static assets per lesson
 *   --no-clean        skip the clear-test-pages cleanup at the end
 *   --verbose         log every lesson/step
 *   --help            show this help
 *
 * The cleanup endpoint only authorizes the test user or `profgarrett`, matching
 * the README. Only run this against a server you own.
 *
 * Measurement notes:
 *   - Latency is measured through full body consumption, not just response
 *     headers. `fetch` resolves as soon as headers arrive, so timing that alone
 *     would report ~0 ms for a 5 MB bundle. Every response body is drained.
 *   - Every request is tagged with an endpoint label, and successful and failed
 *     requests are kept in separate latency distributions. A fast 500 must not
 *     be allowed to pull the success p50 down.
 */

// ---------------------------------------------------------------------------
// Arg + env parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
	const args = { concurrency: 1, iterations: 1, duration: 0, clean: true, assets: false, verbose: false, help: false, url: '' };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		const next = () => argv[++i];
		switch (a) {
			case '--concurrency': args.concurrency = Math.max(1, parseInt(next(), 10) || 1); break;
			case '--iterations': args.iterations = Math.max(1, parseInt(next(), 10) || 1); break;
			case '--duration': args.duration = Math.max(0, parseFloat(next()) || 0); break;
			case '--url': args.url = next(); break;
			case '--assets': args.assets = true; break;
			case '--no-clean': args.clean = false; break;
			case '--verbose': args.verbose = true; break;
			case '--help': case '-h': args.help = true; break;
			default: console.error(`Unknown flag: ${a}`); args.help = true;
		}
	}
	return args;
}

const HELP = `Load-test runner for the synthetic "loadtest" lesson.

  TEST_PASSWORD=... node scripts/loadtest.mjs [flags]
  npm run loadtest -- --concurrency 10 --duration 30

Env:   BASE_URL (default http://localhost:8080), TEST_USER
       (default profgarrett+test@gmail.com), TEST_PASSWORD (required)
Flags: --concurrency N | --iterations N | --duration S | --url URL
       --assets | --no-clean | --verbose | --help

--assets additionally loads / and every same-origin script/stylesheet/icon it
references, once per lesson, so each iteration models a student arriving with a
cold browser cache. Without it the run is API-only.`;

// ---------------------------------------------------------------------------
// Tiny cookie jar (cookie-session sets `session` + `session.sig`)
// ---------------------------------------------------------------------------

function makeJar() {
	const store = new Map();
	return {
		capture(res) {
			const set = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [];
			for (const line of set) {
				const [pair] = line.split(';');
				const eq = pair.indexOf('=');
				if (eq > 0) store.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
			}
		},
		header() {
			return [...store.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
		},
		get size() { return store.size; },
	};
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

/**
	Issue one request and time it through full body consumption.

	The body is ALWAYS drained, even on an error status. undici keeps the
	underlying socket checked out until the body is read or cancelled, so an
	un-drained error response leaks a connection from the pool -- which shows up
	as mysterious stalls precisely when the server starts returning errors,
	i.e. exactly when you are trying to measure it.

	`parse` is one of 'json' | 'text' | 'drain'.
*/
async function apiFetch(base, jar, path, { method = 'GET', body, accept = 'application/json', parse = 'json' } = {}) {
	const headers = { Accept: accept };
	if (body !== undefined) headers['Content-Type'] = 'application/json';
	const cookie = jar.header();
	if (cookie) headers.Cookie = cookie;

	const started = performance.now();
	const res = await fetch(base + path, { method, headers, body, redirect: 'manual' });
	jar.capture(res);

	let json = null;
	let text = null;
	let bytes = 0;

	if (parse === 'drain') {
		bytes = (await res.arrayBuffer()).byteLength;
	} else {
		text = await res.text();
		bytes = Buffer.byteLength(text);
		if (parse === 'json') {
			try { json = JSON.parse(text); } catch { json = null; }
		}
	}

	const ms = performance.now() - started;
	return { res, ms, bytes, json, text };
}

async function login(base, jar, stats, username, password) {
	const { res, ms, json } = await apiFetch(base, jar, '/api/users/login', {
		method: 'POST',
		body: JSON.stringify({ username, password }),
	});
	stats.record('login', ms, res.ok);
	if (res.status === 401) throw new Error('Login failed (401): check TEST_USER / TEST_PASSWORD');
	if (!res.ok) throw new Error(`Login failed (${res.status})`);
	if (!json || !json.logged_in) throw new Error('Login did not return logged_in:true');
	if (jar.size === 0) throw new Error('No session cookie returned by login');
}

// ---------------------------------------------------------------------------
// Static assets
// ---------------------------------------------------------------------------

/**
	Pull same-origin asset URLs out of the HTML shell.

	Deliberately NOT hard-coded: webpack stamps the bundle as
	main.<date>.<chunkhash>.js, so the filename changes on every build. Parsing
	the shell means the load test follows whatever the current build emits.

	Cross-origin URLs (the jsdelivr bootstrap CSS, Google's gsi/client) are
	skipped on purpose -- we are measuring this server, and hammering a CDN both
	pollutes the numbers and is rude.
*/
const ASSET_ATTR_RE = /(?:src|href)\s*=\s*["']([^"']+)["']/gi;

function extractAssets(html) {
	const out = new Set();
	if (typeof html !== 'string') return [];

	ASSET_ATTR_RE.lastIndex = 0;
	let m;
	while ((m = ASSET_ATTR_RE.exec(html)) !== null) {
		const url = m[1];
		// Same-origin, absolute-path assets only. Drops //cdn..., https://...,
		// data: URIs and in-page #anchors.
		if (!url || !url.startsWith('/') || url.startsWith('//')) continue;
		out.add(url);
	}

	/*
		sql-wasm.js fetches its .wasm payload at runtime, so the binary never
		appears in the HTML. It is by far the largest same-origin asset a
		student downloads, so omitting it would understate static load badly.
	*/
	if (out.has('/static/sql-wasm.js')) out.add('/static/sql-wasm.wasm');

	return [...out];
}

/**
	Load the SPA shell and its assets the way a browser would: HTML first, then
	every referenced asset in parallel.
*/
async function loadPageAssets(base, jar, stats) {
	const shell = await apiFetch(base, jar, '/', { accept: 'text/html', parse: 'text' });
	stats.record('html', shell.ms, shell.res.ok);
	stats.bytes += shell.bytes;
	if (!shell.res.ok) throw new Error(`Shell page load failed (${shell.res.status})`);

	const urls = extractAssets(shell.text);
	if (urls.length === 0) return 0;

	const results = await Promise.all(urls.map(async (u) => {
		const r = await apiFetch(base, jar, u, { accept: '*/*', parse: 'drain' });
		stats.record('asset', r.ms, r.res.ok);
		stats.bytes += r.bytes;
		return r.res.ok;
	}));

	const failed = results.filter((ok) => !ok).length;
	if (failed > 0) throw new Error(`${failed} of ${urls.length} static assets failed to load`);

	return urls.length;
}

// ---------------------------------------------------------------------------
// Answering pages: mirror the fields each page schema accepts as user input
// ---------------------------------------------------------------------------

function answerPage(page) {
	switch (page.type) {
		case 'IfPageTextSchema':
			page.client_read = true; break;
		case 'IfPageFormulaSchema':
			page.client_f = page.solution_f || '=a1+b1'; break;
		case 'IfPageChoiceSchema':
			page.client = (page.client_items && page.client_items[0]) || 'Neutral'; break;
		case 'IfPageNumberAnswerSchema':
		case 'IfPageSliderSchema':
			page.client = 1; break;
		case 'IfPageShortTextAnswerSchema':
		case 'IfPageLongTextAnswerSchema':
			page.client = 'load test'; break;
		case 'IfPageSqlSchema':
			page.client_sql = page.solution_sql || 'SELECT 1'; break;
		default:
			// Unknown page type: try the most common field so the run can proceed.
			page.client_read = true;
	}
}

async function playLesson(base, jar, stats, args, workerId) {
	if (args.assets) await loadPageAssets(base, jar, stats);

	// Create a fresh level.
	let level;
	{
		const { res, ms, json } = await apiFetch(base, jar, '/api/levels/new_level_by_code/loadtest', { method: 'POST' });
		stats.record('create_level', ms, res.ok);
		if (!res.ok) throw new Error(`Create level failed (${res.status})`);
		level = json;
		if (!level) throw new Error('Create level returned unparseable JSON');
	}

	const maxSteps = (level.pages?.length || 1) * 3 + 10; // safety valve against loops
	let steps = 0;
	while (!level.completed) {
		if (++steps > maxSteps) throw new Error(`Exceeded ${maxSteps} steps without completing (id ${level._id})`);
		answerPage(level.pages[level.pages.length - 1]);

		const { res, ms, json } = await apiFetch(base, jar, `/api/levels/level/${level._id}?validate_only=0`, {
			method: 'POST',
			body: JSON.stringify(level),
		});
		stats.record('submit_page', ms, res.ok);
		/*
			The posted level grows by one page per step, so request size climbs
			monotonically within a lesson and the aggregate submit_page
			distribution is a mixture of ten different payload sizes. Tracking
			by step separates them.
		*/
		if (res.ok) stats.recordStep(steps, ms);

		if (!res.ok) throw new Error(`Page submit failed (${res.status}) at step ${steps}`);
		level = json;
		if (!level) throw new Error(`Page submit returned unparseable JSON at step ${steps}`);
		if (level._error) throw new Error(`Server error: ${level._error}`);
	}
	stats.lessons++;
	if (args.verbose) console.log(`[w${workerId}] completed lesson ${level._id} in ${steps} steps`);
	return steps;
}

// ---------------------------------------------------------------------------
// Stats
//
// Two things the earlier version got wrong, both fixed here:
//
//   1. A failed request was counted twice -- once by record() and again by the
//      worker's catch block -- so the error count was double the truth.
//      Request-level failures and lesson-level failures are now separate
//      counters that measure different things.
//   2. Failed requests were pushed into the same latency array as successes,
//      so a fast 500 dragged the reported p50 down. Success and error samples
//      now live in separate distributions.
// ---------------------------------------------------------------------------

// Order endpoints appear in the report; anything unlisted is appended.
const LABEL_ORDER = ['login', 'html', 'asset', 'create_level', 'submit_page', 'cleanup'];

function makeStats() {
	return {
		by: new Map(),      // label -> { ok: [ms], err: [ms] }
		steps: new Map(),   // step number -> [ms]
		lessons: 0,
		lessonsFailed: 0,
		bytes: 0,
		errors: [],

		bucket(label) {
			let b = this.by.get(label);
			if (!b) { b = { ok: [], err: [] }; this.by.set(label, b); }
			return b;
		},
		record(label, ms, ok) {
			const b = this.bucket(label);
			(ok ? b.ok : b.err).push(ms);
		},
		recordStep(step, ms) {
			let a = this.steps.get(step);
			if (!a) { a = []; this.steps.set(step, a); }
			a.push(ms);
		},
		get requests() {
			let n = 0;
			for (const b of this.by.values()) n += b.ok.length + b.err.length;
			return n;
		},
		get failures() {
			let n = 0;
			for (const b of this.by.values()) n += b.err.length;
			return n;
		},
	};
}

/**
	Nearest-rank percentile.

	The previous implementation used floor(p/100 * len), which returns the 6th
	of 10 samples for p50 instead of the 5th -- biased high, and visibly wrong
	on short runs.
*/
function pct(sorted, p) {
	if (sorted.length === 0) return 0;
	const rank = Math.ceil((p / 100) * sorted.length);
	return sorted[Math.min(sorted.length - 1, Math.max(0, rank - 1))];
}

function fmtBytes(n) {
	if (n < 1024) return `${n} B`;
	if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
	return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

// A p95 drawn from a handful of samples is noise, not a measurement.
const MIN_SAMPLES_FOR_P95 = 20;
const MIN_SAMPLES_FOR_P99 = 100;

function latencyRow(label, samples, errCount) {
	const s = [...samples].sort((a, b) => a - b);
	const n = s.length;
	const cell = (v, enough) => (n === 0 ? '-' : enough ? v.toFixed(1) : '~' + v.toFixed(1));
	return [
		label.padEnd(14),
		String(n).padStart(6),
		cell(pct(s, 50), true).padStart(9),
		cell(pct(s, 95), n >= MIN_SAMPLES_FOR_P95).padStart(9),
		cell(pct(s, 99), n >= MIN_SAMPLES_FOR_P99).padStart(9),
		cell(n ? s[n - 1] : 0, true).padStart(9),
		String(errCount).padStart(7),
	].join('');
}

function report(stats, wallMs, args) {
	const line = (k, v) => console.log(`  ${k.padEnd(18)} ${v}`);
	const requests = stats.requests;
	const failures = stats.failures;

	/*
		Throughput counts only requests issued inside the timed window. The
		one-off login and cleanup happen outside it, so including them would
		divide a slightly-too-large numerator by the wall time and overstate
		the rate -- badly, on a short run.
	*/
	let timedRequests = 0;
	for (const [label, b] of stats.by.entries()) {
		if (label === 'login' || label === 'cleanup') continue;
		timedRequests += b.ok.length + b.err.length;
	}

	console.log('\n=== Load test results ===');
	line('Wall time', `${(wallMs / 1000).toFixed(2)} s`);
	line('Concurrency', args.concurrency);
	line('Lessons completed', stats.lessons);
	line('Lessons failed', stats.lessonsFailed);
	line('Requests', requests);
	line('Failed requests', `${failures}${requests ? ` (${((failures / requests) * 100).toFixed(2)}%)` : ''}`);
	line('Throughput', `${(timedRequests / (wallMs / 1000)).toFixed(1)} req/s`);
	line('Lesson rate', `${(stats.lessons / (wallMs / 1000) * 60).toFixed(1)} lessons/min`);
	line('Transferred', fmtBytes(stats.bytes));

	// Per-endpoint latency. An aggregate number tells you something is slow;
	// this tells you what.
	const labels = [
		...LABEL_ORDER.filter((l) => stats.by.has(l)),
		...[...stats.by.keys()].filter((l) => !LABEL_ORDER.includes(l)),
	];

	console.log('\nLatency by endpoint -- successful requests only (ms)');
	console.log('  ' + ['endpoint'.padEnd(14), 'n'.padStart(6), 'p50'.padStart(9),
		'p95'.padStart(9), 'p99'.padStart(9), 'max'.padStart(9), 'errors'.padStart(7)].join(''));
	for (const label of labels) {
		const b = stats.by.get(label);
		console.log('  ' + latencyRow(label, b.ok, b.err.length));
	}
	console.log('  (~ marks a percentile with too few samples to be meaningful)');

	// Failed requests get their own distribution. Mixing them into the success
	// pool would let fast errors flatter the p50.
	const failed = labels.filter((l) => stats.by.get(l).err.length > 0);
	if (failed.length) {
		console.log('\nLatency of FAILED requests (ms)');
		for (const label of failed) {
			const s = [...stats.by.get(label).err].sort((a, b) => a - b);
			console.log(`  ${label.padEnd(14)}${String(s.length).padStart(6)}  p50 ${pct(s, 50).toFixed(1)}  max ${s[s.length - 1].toFixed(1)}`);
		}
	}

	// Payload grows one page per step, so this exposes whether the
	// whole-level-repost contract is itself a scaling problem.
	if (stats.steps.size > 1) {
		console.log('\nsubmit_page latency by step (payload grows each step)');
		for (const step of [...stats.steps.keys()].sort((a, b) => a - b)) {
			const s = [...stats.steps.get(step)].sort((a, b) => a - b);
			console.log(`  step ${String(step).padStart(2)}${String(s.length).padStart(7)}   p50 ${pct(s, 50).toFixed(1).padStart(8)} ms   max ${s[s.length - 1].toFixed(1).padStart(8)} ms`);
		}
	}

	if (stats.errors.length) {
		console.log(`\nLesson errors (${stats.errors.length}):`);
		const counts = {};
		for (const e of stats.errors) counts[e] = (counts[e] || 0) + 1;
		for (const [msg, n] of Object.entries(counts)) console.log(`  ${n}x ${msg}`);
	}
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
	const args = parseArgs(process.argv.slice(2));
	if (args.help) { console.log(HELP); return; }

	const base = (args.url || process.env.BASE_URL || 'http://localhost:8080').replace(/\/$/, '');
	const username = process.env.TEST_USER || 'profgarrett+test@gmail.com';
	const password = process.env.TEST_PASSWORD;
	if (!password) {
		console.error('TEST_PASSWORD env var is required. Example:\n  TEST_PASSWORD=secret npm run loadtest -- --concurrency 5');
		process.exitCode = 1;
		return;
	}

	console.log(`Target        ${base}`);
	console.log(`User          ${username}`);
	console.log(`Concurrency   ${args.concurrency}`);
	console.log(`Static assets ${args.assets ? 'yes (page load per lesson)' : 'no (API only, --assets to enable)'}`);
	console.log(args.duration ? `Duration      ${args.duration} s` : `Iterations    ${args.iterations} / worker`);

	const stats = makeStats();

	// One shared login; the cookie is reused by all virtual users (same test user).
	const authJar = makeJar();
	await login(base, authJar, stats, username, password);
	console.log('Login OK. Starting...\n');

	const deadline = args.duration ? performance.now() + args.duration * 1000 : 0;
	const t0 = performance.now();

	const worker = async (id) => {
		let done = 0;
		while (deadline ? performance.now() < deadline : done < args.iterations) {
			try {
				await playLesson(base, authJar, stats, args, id);
			} catch (e) {
				// Lesson-level failure. The underlying request failure, if there
				// was one, is already counted in its endpoint bucket -- counting
				// it again here is what previously doubled the error total.
				stats.lessonsFailed++;
				stats.errors.push(e.message);
				if (args.verbose) console.error(`[w${id}] ${e.message}`);
			}
			done++;
		}
	};

	await Promise.all(Array.from({ length: args.concurrency }, (_, i) => worker(i + 1)));
	const wallMs = performance.now() - t0;

	if (args.clean) {
		const { res, ms, json } = await apiFetch(base, authJar, '/api/levels/clear_all_profgarrett_test_pages/');
		stats.record('cleanup', ms, res.ok);
		if (res.ok) {
			console.log(`\nCleanup: ${(json && json.message) || 'done'}`);
		} else {
			console.log(`\nCleanup failed (${res.status}). Run manually: GET ${base}/api/levels/clear_all_profgarrett_test_pages/`);
		}
	} else {
		console.log('\nSkipped cleanup (--no-clean). Test levels remain in the DB.');
	}

	report(stats, wallMs, args);

	if (stats.failures > 0 || stats.lessonsFailed > 0) process.exitCode = 1;
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
