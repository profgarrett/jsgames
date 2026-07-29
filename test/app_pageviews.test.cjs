// Tests for src/server/app_pageviews.ts
//
// Exercises the pure sanitize_page helper that guards the pageview create
// route. The DB-touching routes are integration-tested separately; here we
// verify the input normalization that runs before any query.

const { test, describe } = require('node:test');
const assert = require('node:assert');

const {
	sanitize_page,
	MAX_PAGE_LENGTH,
	reuse_cutoff_mysql,
	REUSE_WINDOW_MINUTES,
	parse_active,
	parse_active_seconds,
	build_heartbeat_update,
	ACTIVE_SECONDS_SLACK,
} = require('../src/server/app_pageviews.ts');

describe('sanitize_page', () => {
	test('accepts and trims a normal path', () => {
		assert.strictEqual(sanitize_page('/pages/intro'), '/pages/intro');
		assert.strictEqual(sanitize_page('  /ifgame  '), '/ifgame');
	});

	test('rejects missing or empty values', () => {
		assert.strictEqual(sanitize_page(undefined), null);
		assert.strictEqual(sanitize_page(null), null);
		assert.strictEqual(sanitize_page(''), null);
		assert.strictEqual(sanitize_page('   '), null);
	});

	test('rejects non-string values', () => {
		assert.strictEqual(sanitize_page(42), null);
		assert.strictEqual(sanitize_page({}), null);
		assert.strictEqual(sanitize_page(['/x']), null);
	});

	test('caps length at the column width', () => {
		const long = '/' + 'a'.repeat(MAX_PAGE_LENGTH + 50);
		const result = sanitize_page(long);
		assert.strictEqual(result.length, MAX_PAGE_LENGTH);
	});
});

describe('reuse_cutoff_mysql', () => {
	test('returns a mysql datetime string', () => {
		const cutoff = reuse_cutoff_mysql(new Date(Date.UTC(2026, 0, 15, 12, 30, 0)));
		assert.match(cutoff, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
	});

	test('is exactly the window behind the given time', () => {
		const now = new Date(Date.UTC(2026, 0, 15, 12, 30, 0));
		assert.strictEqual(reuse_cutoff_mysql(now), '2026-01-15 12:25:00');
		assert.strictEqual(REUSE_WINDOW_MINUTES, 5);
	});

	test('handles rolling back across an hour boundary', () => {
		const now = new Date(Date.UTC(2026, 0, 15, 12, 2, 0));
		assert.strictEqual(reuse_cutoff_mysql(now), '2026-01-15 11:57:00');
	});

	test('defaults to the current time', () => {
		const before = Date.now() - REUSE_WINDOW_MINUTES * 60 * 1000;
		const cutoff = Date.parse(reuse_cutoff_mysql().replace(' ', 'T') + 'Z');
		// Within a couple of seconds of "now minus the window".
		assert.ok(Math.abs(cutoff - before) < 3000);
	});
});

describe('parse_active', () => {
	test('reads the falsy spellings as inactive', () => {
		assert.strictEqual(parse_active('0'), false);
		assert.strictEqual(parse_active('false'), false);
		assert.strictEqual(parse_active('no'), false);
		assert.strictEqual(parse_active('FALSE'), false);
		assert.strictEqual(parse_active(' 0 '), false);
	});

	test('reads the truthy spellings as active', () => {
		assert.strictEqual(parse_active('1'), true);
		assert.strictEqual(parse_active('true'), true);
	});

	test('treats a missing flag as active for older cached clients', () => {
		assert.strictEqual(parse_active(undefined), true);
		assert.strictEqual(parse_active(null), true);
	});

	test('ignores non-string values (e.g. repeated query params)', () => {
		// Express turns ?active=0&active=1 into an array; don't trust it.
		assert.strictEqual(parse_active(['0', '1']), true);
		assert.strictEqual(parse_active({}), true);
	});
});

describe('parse_active_seconds', () => {
	test('accepts plain non-negative integers', () => {
		assert.strictEqual(parse_active_seconds('0'), 0);
		assert.strictEqual(parse_active_seconds('90'), 90);
		assert.strictEqual(parse_active_seconds('86400'), 86400);
	});

	test('returns null when absent, so the column is left alone', () => {
		// An older cached client reports no total; that is not evidence the
		// student did nothing, so the stored value must not be overwritten.
		assert.strictEqual(parse_active_seconds(undefined), null);
		assert.strictEqual(parse_active_seconds(null), null);
		assert.strictEqual(parse_active_seconds(''), null);
		assert.strictEqual(parse_active_seconds('   '), null);
	});

	test('rejects anything that is not a plain integer', () => {
		// Number() would accept every one of these.
		assert.strictEqual(parse_active_seconds('1e9'), null);
		assert.strictEqual(parse_active_seconds('0x10'), null);
		assert.strictEqual(parse_active_seconds('Infinity'), null);
		assert.strictEqual(parse_active_seconds('12.5'), null);
		assert.strictEqual(parse_active_seconds('-5'), null);
		assert.strictEqual(parse_active_seconds('12abc'), null);
		assert.strictEqual(parse_active_seconds(' 12 '), 12);
	});

	test('rejects non-string values', () => {
		assert.strictEqual(parse_active_seconds(90), null);
		assert.strictEqual(parse_active_seconds(['1', '2']), null);
		assert.strictEqual(parse_active_seconds({}), null);
	});

	test('caps an absurd value at the INT column width', () => {
		// The SQL clamp narrows this much further; this only stops the
		// UPDATE from erroring on an out-of-range value.
		assert.strictEqual(parse_active_seconds('999999999999999'), 2147483647);
	});
});

describe('build_heartbeat_update', () => {
	const NOW = '2026-07-29 14:00:00';
	const CUTOFF = '2026-07-29 13:55:00';
	const count_placeholders = (sql) => (sql.match(/\?/g) || []).length;

	// The clause list and the value list are assembled in parallel, so a
	// mismatch would silently bind the wrong value to the wrong slot. Check
	// every combination of what a client might report.
	for (const active of [true, false]) {
		for (const seconds of [null, 0, 120]) {
			test(`placeholders match values (active=${active}, seconds=${seconds})`, () => {
				const { sql, values } = build_heartbeat_update(NOW, active, seconds, 7, 'nathan', CUTOFF);
				assert.strictEqual(count_placeholders(sql), values.length);
			});
		}
	}

	test('always advances end_datetime and scopes to the owning user', () => {
		const { sql, values } = build_heartbeat_update(NOW, false, null, 7, 'nathan', CUTOFF);
		assert.match(sql, /SET end_datetime = \?/);
		assert.match(sql, /WHERE idpageview = \? AND username = \?/);
		assert.deepStrictEqual(values, [NOW, 7, 'nathan', CUTOFF]);
	});

	test('refuses to extend a row that has gone quiet', () => {
		// Without this predicate a laptop closed at 11:45pm and reopened at 2am
		// keeps extending the same row: no reload fires, so no load event is
		// sent, and the visit is recorded as hours of reading.
		const { sql } = build_heartbeat_update(NOW, true, 120, 7, 'nathan', CUTOFF);
		assert.match(sql, /AND end_datetime >= \?/);
	});

	test('the staleness cutoff is bound last, after the row predicates', () => {
		const { values } = build_heartbeat_update(NOW, true, 120, 7, 'nathan', CUTOFF);
		assert.strictEqual(values[values.length - 1], CUTOFF);
		assert.strictEqual(values[values.length - 2], 'nathan');
		assert.strictEqual(values[values.length - 3], 7);
	});

	test('an active heartbeat also advances active_datetime', () => {
		const { sql, values } = build_heartbeat_update(NOW, true, null, 7, 'nathan', CUTOFF);
		assert.match(sql, /active_datetime = \?/);
		assert.deepStrictEqual(values, [NOW, NOW, 7, 'nathan', CUTOFF]);
	});

	test('an inactive heartbeat leaves active_datetime alone', () => {
		const { sql } = build_heartbeat_update(NOW, false, 120, 7, 'nathan', CUTOFF);
		assert.ok(!sql.includes('active_datetime'));
	});

	test('omits active_seconds entirely when none was reported', () => {
		// Leaving the clause out preserves the stored value; setting it to 0
		// would erase a real total whenever an old client checks in.
		const { sql } = build_heartbeat_update(NOW, true, null, 7, 'nathan', CUTOFF);
		assert.ok(!sql.includes('active_seconds'));
	});

	test('clamps a reported total both upward and downward', () => {
		const { sql, values } = build_heartbeat_update(NOW, false, 120, 7, 'nathan', CUTOFF);
		// Monotonic, and never more than the server-measured open duration.
		assert.match(sql, /active_seconds = GREATEST\(active_seconds, LEAST\(/);
		assert.match(sql, /TIMESTAMPDIFF\(SECOND, start_datetime, \?\) \+ \?/);
		assert.deepStrictEqual(values, [NOW, 120, NOW, ACTIVE_SECONDS_SLACK, 7, 'nathan', CUTOFF]);
	});

	test('zero seconds is still reported, not treated as missing', () => {
		const { sql, values } = build_heartbeat_update(NOW, false, 0, 7, 'nathan', CUTOFF);
		assert.ok(sql.includes('active_seconds'));
		assert.deepStrictEqual(values, [NOW, 0, NOW, ACTIVE_SECONDS_SLACK, 7, 'nathan', CUTOFF]);
	});
});
