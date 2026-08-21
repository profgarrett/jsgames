// Tests for the client side of the admin traffic report.
//
// The components need a DOM to render; covered here are the pure helpers that
// decide what the numbers say, which rows get requested, and which of the two
// views is being asked for.

const { test, describe } = require('node:test');
const assert = require('node:assert');

const {
	format_duration,
	average_seconds,
	format_datetime,
	sort_rows,
	VIEW_LABELS,
} = require('../src/app/admin/AdminTrafficTable.tsx');

const {
	traffic_query,
	date_input_value,
	view_endpoint,
	detail_endpoint,
	detail_scope,
	rows_from_json,
} = require('../src/app/admin/AdminTrafficContainer.tsx');

const { page_to_row, user_to_row } = require('../src/app/admin/iTraffic.ts');


describe('format_duration', () => {
	test('shows seconds under a minute', () => {
		assert.strictEqual(format_duration(1), '1s');
		assert.strictEqual(format_duration(59), '59s');
	});

	test('shows whole minutes under an hour', () => {
		assert.strictEqual(format_duration(60), '1m');
		assert.strictEqual(format_duration(90), '2m');   // rounds
		assert.strictEqual(format_duration(3500), '58m');
	});

	test('shows hours and minutes above an hour', () => {
		assert.strictEqual(format_duration(3600), '1h 0m');
		assert.strictEqual(format_duration(3660), '1h 1m');
		assert.strictEqual(format_duration(7500), '2h 5m');
	});

	test('never prints sixty minutes', () => {
		// Both of these round the minutes to 60, which must carry into the hour
		// rather than printing '60m' or '1h 60m'.
		assert.strictEqual(format_duration(3599), '1h 0m');
		assert.strictEqual(format_duration(7180), '2h 0m');
	});

	test('handles zero and nonsense without producing NaN', () => {
		assert.strictEqual(format_duration(0), '0m');
		assert.strictEqual(format_duration(-5), '0m');
		assert.strictEqual(format_duration(NaN), '0m');
	});
});


describe('average_seconds', () => {
	test('divides and rounds', () => {
		assert.strictEqual(average_seconds(900, 3), 300);
		assert.strictEqual(average_seconds(100, 3), 33);
	});

	test('is zero rather than NaN with no visits', () => {
		assert.strictEqual(average_seconds(0, 0), 0);
		assert.strictEqual(average_seconds(50, 0), 0);
	});
});


describe('format_datetime', () => {
	test('is empty for a row with no visits', () => {
		assert.strictEqual(format_datetime(null), '');
		assert.strictEqual(format_datetime(''), '');
		assert.strictEqual(format_datetime('not a date'), '');
	});

	test('renders a real timestamp', () => {
		assert.notStrictEqual(format_datetime('2026-08-21T14:03:00Z'), '');
	});
});


describe('row normalization', () => {
	test('a page row keeps its distinct-user count as breadth', () => {
		const row = page_to_row({
			page: '/pages/intro', views: 10, users: 4,
			active_seconds: 100, open_seconds: 200, last_datetime: null,
		});

		assert.strictEqual(row.key, '/pages/intro');
		assert.strictEqual(row.breadth, 4);
		assert.strictEqual(row.views, 10);
	});

	test('a user row keeps its distinct-page count as breadth', () => {
		const row = user_to_row({
			username: 'a@b.com', views: 10, pages: 7,
			active_seconds: 100, open_seconds: 200, last_datetime: null,
		});

		assert.strictEqual(row.key, 'a@b.com');
		assert.strictEqual(row.breadth, 7);
	});

	test('breadth is null when the drill-down did not count it', () => {
		const row = user_to_row({
			username: 'a@b.com', views: 10,
			active_seconds: 100, open_seconds: 200, last_datetime: null,
		});

		assert.strictEqual(row.breadth, null);
	});
});


describe('rows_from_json', () => {
	const page = { page: '/x', views: 1, users: 1, active_seconds: 1, open_seconds: 1, last_datetime: null };
	const user = { username: 'a@b.com', views: 1, pages: 1, active_seconds: 1, open_seconds: 1, last_datetime: null };

	test('reads either endpoint, since a drill-down calls the other one', () => {
		assert.deepStrictEqual(rows_from_json({ pages: [page] }).map(r => r.key), ['/x']);
		assert.deepStrictEqual(rows_from_json({ users: [user] }).map(r => r.key), ['a@b.com']);
	});

	test('is empty rather than throwing on an unexpected payload', () => {
		assert.deepStrictEqual(rows_from_json({}), []);
		assert.deepStrictEqual(rows_from_json(null), []);
		assert.deepStrictEqual(rows_from_json({ pages: 'nope' }), []);
	});
});


describe('view wiring', () => {
	test('a view loads its own endpoint', () => {
		assert.ok(view_endpoint('pages').endsWith('/pages'));
		assert.ok(view_endpoint('users').endsWith('/users'));
	});

	test('a drill-down loads the other view', () => {
		assert.strictEqual(detail_endpoint('pages'), view_endpoint('users'));
		assert.strictEqual(detail_endpoint('users'), view_endpoint('pages'));
	});

	test('a drill-down is scoped by the row it was opened from', () => {
		assert.deepStrictEqual(detail_scope('pages', '/pages/intro'), { page: '/pages/intro' });
		assert.deepStrictEqual(detail_scope('users', 'a@b.com'), { username: 'a@b.com' });
	});

	test('each view names its own columns', () => {
		assert.strictEqual(VIEW_LABELS.pages.label, 'Page');
		assert.strictEqual(VIEW_LABELS.pages.breadth, 'Users');
		assert.strictEqual(VIEW_LABELS.users.label, 'User');
		assert.strictEqual(VIEW_LABELS.users.breadth, 'Pages');

		// The drill-down column is the other view's label, in both directions.
		assert.strictEqual(VIEW_LABELS.pages.detail, VIEW_LABELS.users.label);
		assert.strictEqual(VIEW_LABELS.users.detail, VIEW_LABELS.pages.label);
	});
});


describe('sort_rows', () => {
	const rows = [
		{ key: '/b', views: 10, breadth: 5, active_seconds: 100, open_seconds: 900, last_datetime: '2026-08-01T00:00:00Z' },
		{ key: '/a', views: 2, breadth: 1, active_seconds: 400, open_seconds: 500, last_datetime: '2026-08-20T00:00:00Z' },
		{ key: '/c', views: 5, breadth: 9, active_seconds: 250, open_seconds: 100, last_datetime: '2026-08-10T00:00:00Z' },
	];

	const order = (sort) => sort_rows(rows, sort).map( r => r.key );

	test('does not mutate the array it was given', () => {
		sort_rows(rows, 'views');
		assert.strictEqual(rows[0].key, '/b');
	});

	test('sorts the label column ascending, everything else descending', () => {
		assert.deepStrictEqual(order('label'), ['/a', '/b', '/c']);
		assert.deepStrictEqual(order('views'), ['/b', '/c', '/a']);
		assert.deepStrictEqual(order('breadth'), ['/c', '/b', '/a']);
		assert.deepStrictEqual(order('active_seconds'), ['/a', '/c', '/b']);
		assert.deepStrictEqual(order('open_seconds'), ['/b', '/a', '/c']);
		assert.deepStrictEqual(order('last_datetime'), ['/a', '/c', '/b']);
	});

	test('sorts by the derived average, not by the total', () => {
		// /a: 200s per visit, /c: 50s, /b: 10s -- a different order than the
		// active_seconds totals would give.
		assert.deepStrictEqual(order('average'), ['/a', '/c', '/b']);
	});

	test('a null breadth sorts as zero rather than scrambling the order', () => {
		const mixed = [
			{ key: 'a', views: 1, breadth: null, active_seconds: 1, open_seconds: 1, last_datetime: null },
			{ key: 'b', views: 1, breadth: 3, active_seconds: 1, open_seconds: 1, last_datetime: null },
		];

		assert.deepStrictEqual(sort_rows(mixed, 'breadth').map(r => r.key), ['b', 'a']);
	});
});


describe('traffic_query', () => {
	const base = { start: '2026-01-01', end: '2026-01-31', idsection: '', students_only: false };

	test('carries the dates', () => {
		assert.strictEqual(traffic_query(base), 'start=2026-01-01&end=2026-01-31');
	});

	test('omits an unset section and an unset flag', () => {
		assert.ok(!traffic_query(base).includes('idsection'));
		assert.ok(!traffic_query(base).includes('students_only'));
	});

	test('includes the section and the flag when set', () => {
		const query = traffic_query({ ...base, idsection: '12', students_only: true });
		assert.ok(query.includes('idsection=12'));
		assert.ok(query.includes('students_only=1'));
	});

	test('adds the drill-down scope, keeping the filter', () => {
		const by_page = traffic_query(base, detail_scope('pages', '/pages/a b'));
		assert.ok(by_page.includes('page=%2Fpages%2Fa%20b'));
		assert.ok(by_page.includes('start=2026-01-01'));

		const by_user = traffic_query(base, detail_scope('users', 'a+b@c.com'));
		assert.ok(by_user.includes('username=a%2Bb%40c.com'));
	});

	test('omits an empty scope', () => {
		assert.ok(!traffic_query(base, {}).includes('page='));
		assert.ok(!traffic_query(base, { page: '' }).includes('page='));
	});

	test('escapes its values', () => {
		const query = traffic_query({ ...base, start: 'a b&c=d' });
		assert.ok(query.includes('start=a%20b%26c%3Dd'));
	});

	test('returns an empty string when nothing is set', () => {
		assert.strictEqual(
			traffic_query({ start: '', end: '', idsection: '', students_only: false }), '');
	});
});


describe('date_input_value', () => {
	test('formats today and an offset in the local calendar', () => {
		const now = new Date(2026, 7, 21, 12, 0, 0);  // local noon, August 21
		assert.strictEqual(date_input_value(0, now), '2026-08-21');
		assert.strictEqual(date_input_value(30, now), '2026-07-22');
	});

	test('pads single-digit months and days', () => {
		assert.strictEqual(date_input_value(0, new Date(2026, 0, 5, 12, 0, 0)), '2026-01-05');
	});
});
