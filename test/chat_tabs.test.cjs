// Tests for the info tabs on IfPageChatSchema (src/shared/IfPageSchemas.ts):
// sanitizing client_tab_views, closing open views on submit, and the export rows.

const { test, describe } = require('node:test');
const assert = require('node:assert');

const { get_page_schema_as_class, sanitize_chat_tab_views } = require('../src/shared/IfPageSchemas.ts');

const TABS = [
	{ title: 'A', body: 'Body A' },
	{ title: 'B', body: '<b>Body B</b>' },
];

const make_page = (extra = {}) => get_page_schema_as_class({
	type: 'IfPageChatSchema', code: 'tutorial', description: 'd', instruction: 'i',
	tabs: TABS, ...extra,
});

describe('sanitize_chat_tab_views', () => {
	test('drops bad entries, fixes titles, recomputes seconds', () => {
		const t0 = new Date('2026-01-01T00:00:00Z');
		const t1 = new Date('2026-01-01T00:00:12.34Z');
		const out = sanitize_chat_tab_views([
			{ tab_i: 0, title: 'FORGED', dt_opened: t0, dt_closed: t1, seconds: 9999 },
			{ tab_i: 5, dt_opened: t0, dt_closed: t1 },        // out of range
			{ tab_i: 1.5, dt_opened: t0, dt_closed: t1 },      // not an integer
			{ tab_i: 1, dt_opened: 'garbage', dt_closed: t1 }, // bad date
			null, 'x',
			{ tab_i: 1, dt_opened: t0.toISOString(), dt_closed: null },
		], TABS, null);

		assert.strictEqual(out.length, 2);
		assert.strictEqual(out[0].title, 'A');
		assert.strictEqual(out[0].seconds, 12.3);
		assert.strictEqual(out[1].tab_i, 1);
		assert.strictEqual(out[1].dt_closed, null);
		assert.strictEqual(out[1].seconds, null);
	});

	test('closes open views when close_open_at is given, and clamps', () => {
		const t0 = new Date('2026-01-01T00:00:00Z');
		const out = sanitize_chat_tab_views([{ tab_i: 1, dt_opened: t0, dt_closed: null }], TABS, new Date('2026-01-01T00:00:30Z'));
		assert.strictEqual(out[0].seconds, 30);

		const neg = sanitize_chat_tab_views([{ tab_i: 0, dt_opened: t0, dt_closed: new Date(t0.getTime() - 5000) }], TABS);
		assert.strictEqual(neg[0].seconds, 0);

		const long = sanitize_chat_tab_views([{ tab_i: 0, dt_opened: t0, dt_closed: new Date(t0.getTime() + 10*60*60*1000) }], TABS);
		assert.strictEqual(long[0].seconds, 3600);
	});

	test('caps the number of views and handles non-arrays', () => {
		const t0 = new Date();
		const many = Array.from({ length: 900 }, () => ({ tab_i: 0, dt_opened: t0, dt_closed: t0 }));
		assert.strictEqual(sanitize_chat_tab_views(many, TABS).length, 500);
		assert.deepStrictEqual(sanitize_chat_tab_views('nope', TABS), []);
		assert.deepStrictEqual(sanitize_chat_tab_views(undefined, TABS), []);
	});
});

describe('IfPageChatSchema tabs', () => {
	test('tabs default to [] and survive a JSON round trip', () => {
		assert.deepStrictEqual(get_page_schema_as_class({ type: 'IfPageChatSchema', description: 'd', instruction: 'i' }).tabs, []);
		const p = make_page();
		const p2 = get_page_schema_as_class(JSON.parse(JSON.stringify(p.toJson())));
		assert.deepStrictEqual(p2.tabs, TABS);
	});

	test('updateUserFields (server side) sanitizes and closes open views without bloating history', () => {
		const p = make_page();
		const history_before = p.history.length;
		p.updateUserFields({
			client_tab_views: [{ tab_i: 1, title: 'X', dt_opened: new Date(Date.now() - 4000), dt_closed: null, seconds: 999 }],
		});
		assert.strictEqual(p.client_tab_views.length, 1);
		assert.strictEqual(p.client_tab_views[0].title, 'B');
		assert.ok(p.client_tab_views[0].dt_closed instanceof Date);
		assert.ok(p.client_tab_views[0].seconds >= 3.5 && p.client_tab_views[0].seconds <= 10);
		assert.strictEqual(p.history.length, history_before);
	});

	test('completed pages ignore tab view updates', () => {
		const p = make_page({ completed: true });
		p.updateUserFields({ client_tab_views: [{ tab_i: 0, dt_opened: new Date(), dt_closed: new Date() }] });
		assert.deepStrictEqual(p.client_tab_views, []);
	});

	test('debug_answer records a sample view; clear resets it', () => {
		const p = make_page();
		p.debug_answer();
		assert.strictEqual(p.client_tab_views.length, 1);
		p.clear_answer_and_all_results();
		assert.deepStrictEqual(p.client_tab_views, []);
	});
});
