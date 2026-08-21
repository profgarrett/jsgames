// Tests for src/server/app_traffic.ts
//
// The routes need a database; what is covered here is everything that decides
// *which* rows those routes will count. A filter bug does not throw -- it
// quietly reports the wrong population -- so the parsing and the WHERE builder
// are worth pinning down.

const { test, describe } = require('node:test');
const assert = require('node:assert');

const {
	parse_id,
	parse_date,
	next_day,
	parse_flag,
	parse_text,
	default_start,
	build_traffic_filter,
	shape_page_row,
	shape_user_row,
	DEFAULT_DAYS,
} = require('../src/server/app_traffic.ts');


describe('parse_id', () => {
	test('accepts positive integers as number or string', () => {
		assert.strictEqual(parse_id(7), 7);
		assert.strictEqual(parse_id('7'), 7);
		assert.strictEqual(parse_id(' 7 '), 7);
	});

	test('rejects anything that is not a positive integer', () => {
		assert.strictEqual(parse_id(0), null);
		assert.strictEqual(parse_id(-3), null);
		assert.strictEqual(parse_id(1.5), null);
		assert.strictEqual(parse_id(''), null);
		assert.strictEqual(parse_id('abc'), null);
		assert.strictEqual(parse_id(undefined), null);
		assert.strictEqual(parse_id(null), null);
		assert.strictEqual(parse_id({}), null);
	});
});


describe('parse_date', () => {
	test('accepts a well-formed date', () => {
		assert.strictEqual(parse_date('2026-08-21'), '2026-08-21');
		assert.strictEqual(parse_date('  2026-08-21  '), '2026-08-21');
	});

	test('rejects a wrong shape', () => {
		assert.strictEqual(parse_date('8/21/2026'), null);
		assert.strictEqual(parse_date('2026-8-21'), null);
		assert.strictEqual(parse_date('2026-08-21T00:00:00'), null);
		assert.strictEqual(parse_date(20260821), null);
		assert.strictEqual(parse_date(undefined), null);
	});

	test('rejects a date that does not exist', () => {
		assert.strictEqual(parse_date('2026-02-31'), null);
		assert.strictEqual(parse_date('2026-13-01'), null);
		assert.strictEqual(parse_date('2026-00-10'), null);
	});

	test('accepts a real leap day and rejects a fake one', () => {
		assert.strictEqual(parse_date('2024-02-29'), '2024-02-29');
		assert.strictEqual(parse_date('2026-02-29'), null);
	});
});


describe('next_day', () => {
	test('advances one day', () => {
		assert.strictEqual(next_day('2026-08-21'), '2026-08-22');
	});

	test('rolls over a month and a year', () => {
		assert.strictEqual(next_day('2026-08-31'), '2026-09-01');
		assert.strictEqual(next_day('2026-12-31'), '2027-01-01');
	});

	test('rolls over a leap day', () => {
		assert.strictEqual(next_day('2024-02-28'), '2024-02-29');
		assert.strictEqual(next_day('2026-02-28'), '2026-03-01');
	});
});


describe('parse_flag', () => {
	test('is false unless explicitly set', () => {
		assert.strictEqual(parse_flag(undefined), false);
		assert.strictEqual(parse_flag(''), false);
		assert.strictEqual(parse_flag('0'), false);
		assert.strictEqual(parse_flag('false'), false);
	});

	test('accepts the usual truthy spellings', () => {
		assert.strictEqual(parse_flag('1'), true);
		assert.strictEqual(parse_flag('true'), true);
		assert.strictEqual(parse_flag('TRUE'), true);
		assert.strictEqual(parse_flag('yes'), true);
	});
});


describe('parse_text', () => {
	test('trims a usable value', () => {
		assert.strictEqual(parse_text('/pages/intro'), '/pages/intro');
		assert.strictEqual(parse_text('  a@b.com  '), 'a@b.com');
	});

	test('treats blank and non-string as "not filtering"', () => {
		assert.strictEqual(parse_text(''), null);
		assert.strictEqual(parse_text('   '), null);
		assert.strictEqual(parse_text(undefined), null);
		assert.strictEqual(parse_text(null), null);
		assert.strictEqual(parse_text(7), null);
		assert.strictEqual(parse_text(['/x']), null);
	});
});


describe('default_start', () => {
	test('is DEFAULT_DAYS behind the given date', () => {
		assert.strictEqual(default_start(new Date(Date.UTC(2026, 7, 21))), '2026-07-22');
		assert.strictEqual(DEFAULT_DAYS, 30);
	});

	test('crosses a year boundary', () => {
		assert.strictEqual(default_start(new Date(Date.UTC(2026, 0, 10))), '2025-12-11');
	});
});


describe('build_traffic_filter', () => {
	const now = new Date(Date.UTC(2026, 7, 21, 15, 0, 0));

	test('every placeholder has a value', () => {
		const cases = [
			{},
			{ start: '2026-01-01', end: '2026-06-30' },
			{ idsection: '4' },
			{ students_only: '1' },
			{ start: '2026-01-01', end: '2026-06-30', idsection: '4', students_only: '1' },
			{ page: '/pages/intro' },
			{ username: 'a@b.com' },
			{ page: '/pages/intro', username: 'a@b.com', idsection: '4', students_only: '1' },
		];

		cases.forEach( query => {
			const { where, values } = build_traffic_filter(query, now);
			const placeholders = (where.match(/\?/g) || []).length;
			assert.strictEqual(placeholders, values.length,
				'placeholder/value mismatch for ' + JSON.stringify(query));
		});
	});

	test('defaults to the last DEFAULT_DAYS through today', () => {
		const { filter, values } = build_traffic_filter({}, now);

		assert.strictEqual(filter.start, '2026-07-22');
		assert.strictEqual(filter.end, '2026-08-21');
		assert.strictEqual(values[0], '2026-07-22 00:00:00');

		// The upper bound is exclusive and one day past the end date, so a visit
		// that started today is still counted.
		assert.strictEqual(values[1], '2026-08-22 00:00:00');
	});

	test('an unusable date falls back to the default rather than erroring', () => {
		const { filter } = build_traffic_filter({ start: 'yesterday', end: '2026-02-31' }, now);
		assert.strictEqual(filter.start, '2026-07-22');
		assert.strictEqual(filter.end, '2026-08-21');
	});

	test('omits the membership subquery when nothing narrows it', () => {
		const { where, values, filter } = build_traffic_filter({}, now);

		assert.ok(!where.includes('EXISTS'));
		assert.strictEqual(values.length, 2);
		assert.strictEqual(filter.idsection, null);
		assert.strictEqual(filter.students_only, false);
	});

	test('scopes to a section through an EXISTS, not a join', () => {
		const { where, values, filter } = build_traffic_filter({ idsection: '12' }, now);

		assert.ok(where.includes('EXISTS'));
		assert.ok(where.includes('users_sections.idsection = ?'));

		// A JOIN would multiply pageview rows by matching enrollments and inflate
		// every count, so the query must not contain one.
		assert.ok(!/JOIN\s+users_sections\s+ON\s+users_sections\.iduser\s*=\s*pageviews/i.test(where));

		assert.strictEqual(values[2], 12);
		assert.strictEqual(filter.idsection, 12);
	});

	test('a non-numeric section is ignored rather than matching nothing', () => {
		const { where, filter } = build_traffic_filter({ idsection: 'all' }, now);
		assert.ok(!where.includes('EXISTS'));
		assert.strictEqual(filter.idsection, null);
	});

	test('students_only restricts the role, and works without a section', () => {
		const { where, values, filter } = build_traffic_filter({ students_only: '1' }, now);

		assert.ok(where.includes("users_sections.role = 'student'"));
		assert.ok(where.includes('EXISTS'));

		// The role is a literal, not a parameter, so no extra value appears.
		assert.strictEqual(values.length, 2);
		assert.strictEqual(filter.students_only, true);
	});

	test('the section and the role narrow together', () => {
		const { where, values } = build_traffic_filter(
			{ idsection: '3', students_only: 'true' }, now);

		assert.ok(where.includes('users_sections.idsection = ?'));
		assert.ok(where.includes("users_sections.role = 'student'"));
		assert.deepStrictEqual(values.slice(2), [3]);
	});

	test('user values are never interpolated into the sql', () => {
		const { where } = build_traffic_filter(
			{ idsection: '3', start: '2026-01-01', end: '2026-01-31' }, now);

		assert.ok(!where.includes('2026-01-01'));
		assert.ok(!where.includes('3'));
	});

	test('scopes to one page, as the by-user drill-down does', () => {
		const { where, values, filter } = build_traffic_filter({ page: '/pages/intro' }, now);

		assert.ok(where.includes('pageviews.page = ?'));
		assert.strictEqual(values[2], '/pages/intro');
		assert.strictEqual(filter.page, '/pages/intro');
		assert.strictEqual(filter.username, null);
	});

	test('scopes to one user, as the by-page drill-down does', () => {
		const { where, values, filter } = build_traffic_filter({ username: ' a@b.com ' }, now);

		assert.ok(where.includes('pageviews.username = ?'));
		assert.strictEqual(values[2], 'a@b.com');
		assert.strictEqual(filter.username, 'a@b.com');
		assert.strictEqual(filter.page, null);
	});

	test('a blank scope value does not become a match on the empty string', () => {
		const { where, values } = build_traffic_filter({ page: '', username: '  ' }, now);

		assert.ok(!where.includes('pageviews.page = ?'));
		assert.ok(!where.includes('pageviews.username = ?'));
		assert.strictEqual(values.length, 2);
	});

	test('both scopes and the section narrow together, in value order', () => {
		const { values } = build_traffic_filter(
			{ page: '/x', username: 'a@b.com', idsection: '9' }, now);

		// Dates first, then page, username, section -- the order the clauses are
		// pushed, which is what keeps the placeholders lined up with the values.
		assert.deepStrictEqual(values.slice(2), ['/x', 'a@b.com', 9]);
	});

	test('a missing query object is treated as no filter', () => {
		const { values } = build_traffic_filter(undefined, now);
		assert.strictEqual(values.length, 2);
	});
});


describe('row shaping', () => {
	test('turns driver strings into numbers', () => {
		const row = shape_page_row({
			page: '/pages/intro',
			views: '12',
			users: '4',
			active_seconds: '900',
			open_seconds: '1800',
			last_datetime: '2026-08-21T14:03:00Z',
		});

		assert.strictEqual(row.views, 12);
		assert.strictEqual(row.users, 4);
		assert.strictEqual(row.active_seconds, 900);
		assert.strictEqual(row.open_seconds, 1800);
		assert.strictEqual(row.page, '/pages/intro');
		assert.strictEqual(row.last_datetime, '2026-08-21T14:03:00Z');
	});

	test('drops columns that are not part of the report', () => {
		const row = shape_user_row({
			username: 'a@b.com', views: 1, active_seconds: 0, open_seconds: 0,
			last_datetime: null, ip: '10.0.0.1', hashed_password: 'nope',
		});

		assert.deepStrictEqual(Object.keys(row).sort(),
			['active_seconds', 'last_datetime', 'open_seconds', 'username', 'views']);
	});

	test('carries the distinct-page count only when the query selected it', () => {
		const with_pages = shape_user_row({
			username: 'a@b.com', views: '6', pages: '3',
			active_seconds: '60', open_seconds: '90', last_datetime: null,
		});
		assert.strictEqual(with_pages.pages, 3);

		// The per-page drill-down does not select it, and NaN in the column
		// would render as an empty cell that looks like real data.
		const without = shape_user_row({
			username: 'a@b.com', views: '6',
			active_seconds: '60', open_seconds: '90', last_datetime: null,
		});
		assert.ok(!('pages' in without));
	});
});
