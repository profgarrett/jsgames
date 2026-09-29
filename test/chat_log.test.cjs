// Tests for the read-only chat log (src/app/if/IfPlayComponents/ChatLog.tsx) and for the
// score view rendering levels that contain chat pages (src/app/if/LevelScore.tsx).
//
// Needs src/server/secret.js to exist (IfLevelSchemaFactory loads it through other tutorials).

const { test, describe } = require('node:test');
const assert = require('node:assert');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const { get_page_schema_as_class } = require('../src/shared/IfPageSchemas.ts');
const ChatLogModule = require('../src/app/if/IfPlayComponents/ChatLog.tsx');
const ChatLog = ChatLogModule.default;
const { build_chat_log } = ChatLogModule;
const { LevelScore } = require('../src/app/if/LevelScore.tsx');
const { IfLevelSchemaFactory } = require('../src/server/IfLevelSchemaFactory.ts');

const t = (s) => new Date('2026-09-29T14:00:' + s + 'Z');

const make_page = (extra = {}) => get_page_schema_as_class({
	type: 'IfPageChatSchema', code: 'tutorial', description: 'd', instruction: 'i',
	tabs: [{ title: 'Family', body: 'b' }, { title: 'Teaching assistant', body: 'b' }],
	history: [
		{ code: 'server_initialized', dt: t('00') },
		{ code: 'server_create', dt: t('01') },
		{ code: 'server_page_completed', dt: t('50') },
	],
	...extra,
});

describe('build_chat_log', () => {
	test('merges start, messages, tab opens and completion in time order', () => {
		const page = make_page({
			client_messages: [
				{ role: 'user', text: 'How much is taxable?', dt: t('10') },
				{ role: 'assistant', text: 'It depends.', dt: t('12') },
			],
			client_tab_views: [
				{ tab_i: 1, title: 'Teaching assistant', dt_opened: t('05'), dt_closed: t('08'), seconds: 3 },
				{ tab_i: 0, title: 'Family', dt_opened: t('20'), dt_closed: null, seconds: null },
			],
		});
		const rows = build_chat_log(page);
		assert.deepStrictEqual(rows.map( r => r.label ),
			['Page shown', 'Tab opened', 'Participant', 'AI', 'Tab opened', 'Page completed']);
		assert.strictEqual(rows[1].text, 'Teaching assistant (3s)');
		assert.strictEqual(rows[4].text, 'Family (still open)');
	});

	test('handles dates stored as strings and pages with no activity', () => {
		const page = make_page({
			client_messages: [{ role: 'user', text: 'hi', dt: '2026-09-29T14:00:30Z' }],
		});
		assert.strictEqual(build_chat_log(page)[1].label, 'Participant');
		const empty = get_page_schema_as_class({ type: 'IfPageChatSchema', description: 'd', instruction: 'i' });
		assert.deepStrictEqual(build_chat_log(empty), []);
	});
});

describe('build_chat_log answers', () => {
	test('answer edits appear in time order, keeping the last of each run', () => {
		const page = make_page({
			question: 'How much?', question_id: 's1_post_estimate', client_answer: 14000,
			client_messages: [{ role: 'user', text: 'hi', dt: t('20') }],
			history: [
				{ code: 'server_create', dt: t('01') },
				{ code: 'client_update', dt: t('10'), client_answer: 1 },
				{ code: 'client_update', dt: t('11'), client_answer: 12 },
				{ code: 'client_update', dt: t('12'), client_answer: 12000 },
				{ code: 'client_update', dt: t('30'), client_answer: 14000 },
				{ code: 'server_page_completed', dt: t('40') },
			],
		});
		const rows = build_chat_log(page);
		assert.deepStrictEqual(rows.map( r => r.label + ':' + r.text ),
			['Page shown:', 'Answer:12000', 'Participant:hi', 'Answer:14000', 'Page completed:']);
		const html = renderToStaticMarkup(React.createElement(ChatLog, { page }));
		assert.ok(html.includes('answer: <b>14000</b>'));
		assert.ok(html.includes('s1_post_estimate'));
	});
});

describe('ChatLog rendering', () => {
	test('escapes participant text', () => {
		const page = make_page({
			client_messages: [{ role: 'user', text: '<img src=x onerror="alert(1)">', dt: t('10') }],
		});
		const html = renderToStaticMarkup(React.createElement(ChatLog, { page }));
		assert.ok(!html.includes('<img src=x'));
		assert.ok(html.includes('&lt;img src=x'));
		assert.ok(html.includes('1 of 6 messages sent'));
	});

	test('static (FAQ) pages say so and show the content collapsed', () => {
		const page = make_page({ static_html: '<p>FAQ body</p>', tags: ['condition_faq'] });
		const html = renderToStaticMarkup(React.createElement(ChatLog, { page }));
		assert.ok(html.includes('Static advisor (no chat)'));
		assert.ok(html.includes('FAQ body'));
		assert.ok(html.includes('condition_faq'));
	});
});

describe('LevelScore with taxstudy', () => {
	test('renders a completed attempt in each condition without throwing', async () => {
		const log = console.log;
		console.log = () => {};
		const seen = new Set();
		try {
			for(let i = 0; i < 40 && seen.size < 3; i++) {
				let level = await IfLevelSchemaFactory.create('taxstudy', 'score' + i);
				while(!level.completed) {
					level.pages[level.pages.length - 1].debug_answer();
					level = await IfLevelSchemaFactory.addPageOrMarkAsComplete(level);
				}
				const condition = level.pages.find( p => p.template_id === 's1_advisor' ).tags[0];
				if(seen.has(condition)) continue;
				seen.add(condition);

				const html = renderToStaticMarkup(React.createElement(LevelScore, { level }));
				assert.ok(html.includes('Page 56'));
				assert.ok(!html.includes('Page 57'));
				assert.strictEqual((html.match(/answer: <b>/g) || []).length, 3);
				assert.strictEqual((html.match(/Tab opens|tab opens/g) || []).length, 3);
			}
		} finally {
			console.log = log;
		}
		assert.strictEqual(seen.size, 3);
	});
});
