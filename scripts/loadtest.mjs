#!/usr/bin/env node
/**
 * Load-test runner for the synthetic `loadtest` lesson.
 *
 * Walks a virtual user through the whole lesson exactly like the React client:
 *   1. POST /api/users/login                          (cookie-session auth)
 *   2. POST /api/levels/new_level_by_code/loadtest    (create a level)
 *   3. POST /api/levels/level/:id?validate_only=0     (answer the last page; the
 *      server appends the next page) -- repeated until the level is completed
 *   4. GET  /api/levels/clear_all_profgarrett_test_pages/  (cleanup)
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
 *   --no-clean        skip the clear-test-pages cleanup at the end
 *   --verbose         log every lesson/step
 *   --help            show this help
 *
 * The cleanup endpoint only authorizes the test user or `profgarrett`, matching
 * the README. Only run this against a server you own.
 */

// ---------------------------------------------------------------------------
// Arg + env parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
	const args = { concurrency: 1, iterations: 1, duration: 0, clean: true, verbose: false, help: false, url: '' };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		const next = () => argv[++i];
		switch (a) {
			case '--concurrency': args.concurrency = Math.max(1, parseInt(next(), 10) || 1); break;
			case '--iterations': args.iterations = Math.max(1, parseInt(next(), 10) || 1); break;
			case '--duration': args.duration = Math.max(0, parseFloat(next()) || 0); break;
			case '--url': args.url = next(); break;
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
       --no-clean | --verbose | --help`;

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

async function apiFetch(base, jar, path, { method = 'GET', body } = {}) {
	const headers = { Accept: 'application/json' };
	if (body !== undefined) headers['Content-Type'] = 'application/json';
	const cookie = jar.header();
	if (cookie) headers.Cookie = cookie;

	const started = performance.now();
	const res = await fetch(base + path, { method, headers, body, redirect: 'manual' });
	const ms = performance.now() - started;
	jar.capture(res);
	return { res, ms };
}

async function login(base, jar, username, password) {
	const { res } = await apiFetch(base, jar, '/api/users/login', {
		method: 'POST',
		body: JSON.stringify({ username, password }),
	});
	if (res.status === 401) throw new Error('Login failed (401): check TEST_USER / TEST_PASSWORD');
	if (!res.ok) throw new Error(`Login failed (${res.status})`);
	const json = await res.json().catch(() => ({}));
	if (!json.logged_in) throw new Error('Login did not return logged_in:true');
	if (jar.size === 0) throw new Error('No session cookie returned by login');
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

async function playLesson(base, jar, stats, verbose, workerId) {
	// Create a fresh level.
	{
		const { res, ms } = await apiFetch(base, jar, '/api/levels/new_level_by_code/loadtest', { method: 'POST' });
		stats.record(ms, res.ok);
		if (!res.ok) throw new Error(`Create level failed (${res.status})`);
		var level = await res.json();
	}

	const maxSteps = (level.pages?.length || 1) * 3 + 10; // safety valve against loops
	let steps = 0;
	while (!level.completed) {
		if (++steps > maxSteps) throw new Error(`Exceeded ${maxSteps} steps without completing (id ${level._id})`);
		answerPage(level.pages[level.pages.length - 1]);

		const { res, ms } = await apiFetch(base, jar, `/api/levels/level/${level._id}?validate_only=0`, {
			method: 'POST',
			body: JSON.stringify(level),
		});
		stats.record(ms, res.ok);
		if (!res.ok) throw new Error(`Page submit failed (${res.status}) at step ${steps}`);
		level = await res.json();
		if (level._error) throw new Error(`Server error: ${level._error}`);
	}
	stats.lessons++;
	if (verbose) console.log(`[w${workerId}] completed lesson ${level._id} in ${steps} steps`);
	return steps;
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

function makeStats() {
	return {
		latencies: [], requests: 0, failures: 0, lessons: 0, errors: [],
		record(ms, ok) { this.latencies.push(ms); this.requests++; if (!ok) this.failures++; },
	};
}

function pct(sorted, p) {
	if (sorted.length === 0) return 0;
	return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
}

function report(stats, wallMs) {
	const s = [...stats.latencies].sort((a, b) => a - b);
	const sum = s.reduce((a, b) => a + b, 0);
	const line = (k, v) => console.log(`  ${k.padEnd(18)} ${v}`);
	console.log('\n=== Load test results ===');
	line('Wall time', `${(wallMs / 1000).toFixed(2)} s`);
	line('Lessons completed', stats.lessons);
	line('Requests', stats.requests);
	line('Failed requests', stats.failures);
	line('Throughput', `${(stats.requests / (wallMs / 1000)).toFixed(1)} req/s`);
	if (s.length) {
		line('Latency min', `${s[0].toFixed(1)} ms`);
		line('Latency p50', `${pct(s, 50).toFixed(1)} ms`);
		line('Latency p95', `${pct(s, 95).toFixed(1)} ms`);
		line('Latency max', `${s[s.length - 1].toFixed(1)} ms`);
		line('Latency avg', `${(sum / s.length).toFixed(1)} ms`);
	}
	if (stats.errors.length) {
		console.log(`  Errors (${stats.errors.length}):`);
		const counts = {};
		for (const e of stats.errors) counts[e] = (counts[e] || 0) + 1;
		for (const [msg, n] of Object.entries(counts)) console.log(`    ${n}x ${msg}`);
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
	console.log(args.duration ? `Duration      ${args.duration} s` : `Iterations    ${args.iterations} / worker`);

	const stats = makeStats();

	// One shared login; the cookie is reused by all virtual users (same test user).
	const authJar = makeJar();
	await login(base, authJar, username, password);
	console.log('Login OK. Starting...\n');

	const deadline = args.duration ? performance.now() + args.duration * 1000 : 0;
	const t0 = performance.now();

	const worker = async (id) => {
		let done = 0;
		while (deadline ? performance.now() < deadline : done < args.iterations) {
			try {
				await playLesson(base, authJar, stats, args.verbose, id);
			} catch (e) {
				stats.failures++;
				stats.errors.push(e.message);
				if (args.verbose) console.error(`[w${id}] ${e.message}`);
			}
			done++;
		}
	};

	await Promise.all(Array.from({ length: args.concurrency }, (_, i) => worker(i + 1)));
	const wallMs = performance.now() - t0;

	report(stats, wallMs);

	if (args.clean) {
		const { res } = await apiFetch(base, authJar, '/api/levels/clear_all_profgarrett_test_pages/');
		if (res.ok) {
			const j = await res.json().catch(() => ({}));
			console.log(`\nCleanup: ${j.message || 'done'}`);
		} else {
			console.log(`\nCleanup failed (${res.status}). Run manually: GET ${base}/api/levels/clear_all_profgarrett_test_pages/`);
		}
	} else {
		console.log('\nSkipped cleanup (--no-clean). Test levels remain in the DB.');
	}

	if (stats.failures > 0) process.exitCode = 1;
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
