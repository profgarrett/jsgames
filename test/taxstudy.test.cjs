// Tests for the Tax Decision Support study (src/server/tutorials/taxstudy.ts) and the
// mechanics it added: one condition per participant (versions_by_condition), static
// (FAQ) chat pages, per-page chat settings, and template_id/condition in exports.
//
// Needs src/server/secret.js to exist (IfLevelSchemaFactory loads it through other tutorials).

const { test, describe } = require('node:test');
const assert = require('node:assert');

const { IfLevelSchemaFactory, condition_index } = require('../src/server/IfLevelSchemaFactory.ts');
const { get_page_schema_as_class, build_answers_from_level, get_level_condition } = require('../src/shared/IfPageSchemas.ts');
const { build_chat_request, get_response_text, CHAT_MODEL } = require('../src/server/openai_chat.ts');

const CONDITIONS = ['condition_faq', 'condition_short_ai', 'condition_long_ai'];
const N_PARTICIPANTS = 150;

// Build and fully complete one taxstudy level, auto-answering each page.
async function run_participant(username) {
	let level = await IfLevelSchemaFactory.create('taxstudy', username);
	let guard = 0;
	while(!level.completed) {
		if(guard++ > 200) throw new Error('taxstudy did not finish');
		level.pages[level.pages.length - 1].debug_answer();
		level = await IfLevelSchemaFactory.addPageOrMarkAsComplete(level);
	}
	return level;
}

// Quiet the schema's "Invalid key" logging while building many levels.
async function quietly(fn) {
	const log = console.log;
	console.log = () => {};
	try { return await fn(); } finally { console.log = log; }
}

describe('condition_index', () => {
	test('is deterministic and in range', () => {
		for(let seed = 0; seed < 500; seed++) {
			const i = condition_index(seed, 3);
			assert.ok(i >= 0 && i < 3);
			assert.strictEqual(condition_index(seed, 3), i);
		}
	});

	test('is roughly uniform', () => {
		const counts = [0, 0, 0];
		for(let seed = 0; seed < 30000; seed++) counts[condition_index(seed, 3)]++;
		counts.forEach( c => assert.ok(c > 9500 && c < 10500, 'count ' + c) );
	});
});

describe('IfPageChatSchema static mode and settings', () => {
	const base = { type: 'IfPageChatSchema', code: 'tutorial', description: 'd', instruction: 'i' };

	test('defaults for existing chat pages', () => {
		const p = get_page_schema_as_class(base);
		assert.strictEqual(p.is_static(), false);
		assert.strictEqual(p.static_html, '');
		assert.strictEqual(p.max_tokens, 2000);
	});

	test('max_tokens is clamped, and null falls back to the default', () => {
		assert.strictEqual(get_page_schema_as_class({ ...base, max_tokens: 99999 }).max_tokens, 32000);
		assert.strictEqual(get_page_schema_as_class({ ...base, max_tokens: 0 }).max_tokens, 1);
		assert.strictEqual(get_page_schema_as_class({ ...base, max_tokens: null }).max_tokens, 2000);
	});

	test('static page: debug_answer sends no messages but can advance', () => {
		const p = get_page_schema_as_class({ ...base, static_html: '<p>FAQ</p>' });
		assert.strictEqual(p.is_static(), true);
		p.debug_answer();
		assert.deepStrictEqual(p.client_messages, []);
		assert.strictEqual(p.correct, true);
	});
});

describe('openai_chat', () => {
	test('builds a Responses API request with low reasoning and no stored copy', () => {
		const r = build_chat_request('SYS', [
			{ role: 'user', text: 'Hi', dt: new Date() },
			{ role: 'assistant', text: 'Hello', dt: new Date() },
		], 2000);
		assert.strictEqual(CHAT_MODEL, 'gpt-6.1-sol');
		assert.strictEqual(r.model, 'gpt-6.1-sol');
		assert.strictEqual(r.instructions, 'SYS');
		assert.deepStrictEqual(r.input, [{ role: 'user', content: 'Hi' }, { role: 'assistant', content: 'Hello' }]);
		assert.deepStrictEqual(r.reasoning, { effort: 'low' });
		assert.strictEqual(r.max_output_tokens, 2000);
		assert.strictEqual(r.store, false);
		assert.strictEqual(r.temperature, undefined);
		assert.strictEqual(r.max_tokens, undefined);
	});

	test('reads the reply text and skips reasoning items', () => {
		const json = {
			status: 'completed',
			output: [
				{ type: 'reasoning', summary: [] },
				{ type: 'message', role: 'assistant', content: [
					{ type: 'output_text', text: 'Part one. ', annotations: [] },
					{ type: 'output_text', text: 'Part two.', annotations: [] },
				] },
			],
		};
		assert.strictEqual(get_response_text(json), 'Part one. Part two.');
	});

	test('returns empty text when the model ran out while reasoning', () => {
		assert.strictEqual(get_response_text({ status: 'incomplete', incomplete_details: { reason: 'max_output_tokens' }, output: [{ type: 'reasoning' }] }), '');
		assert.strictEqual(get_response_text(null), '');
		assert.strictEqual(get_response_text({}), '');
	});
});

describe('get_level_condition', () => {
	test('finds the first condition_ tag, string or object form', () => {
		assert.strictEqual(get_level_condition({ pages: [{ tags: [] }, { tags: ['x', 'condition_faq'] }] }), 'condition_faq');
		assert.strictEqual(get_level_condition({ pages: [{ tags: [{ tag: 'condition_long_ai' }] }] }), 'condition_long_ai');
		assert.strictEqual(get_level_condition({ pages: [{ tags: ['x'] }] }), '');
	});
});

describe('taxstudy level', async () => {
	const levels = await quietly( async () => {
		const out = [];
		for(let i = 0; i < N_PARTICIPANTS; i++) out.push(await run_participant('sim' + i));
		return out;
	});

	test('every participant completes all 67 pages, with unique variable names', () => {
		levels.forEach( level => {
			assert.strictEqual(level.completed, true);
			assert.strictEqual(level.pages.length, 67);
			const ids = level.pages.map( p => p.template_id );
			assert.ok(ids.every( id => typeof id === 'string' && id !== '' ));
			assert.strictEqual(new Set(ids).size, ids.length);
		});
	});

	test('each participant has one condition on all 4 condition pages', () => {
		levels.forEach( level => {
			const tagged = level.pages.filter( p => p.tags.some( t => CONDITIONS.includes(t) ) );
			assert.deepStrictEqual(tagged.map( p => p.template_id ).sort(),
				['s1_advisor', 's2_advisor', 's3_advisor', 'scenario_instructions']);
			assert.strictEqual(new Set(tagged.map( p => p.tags.find( t => CONDITIONS.includes(t) ) )).size, 1);
		});
	});

	test('advisor pages match their condition', () => {
		levels.forEach( level => {
			const condition = get_level_condition(level);
			level.pages.filter( p => p.type === 'IfPageChatSchema' ).forEach( p => {
				assert.strictEqual(p.tabs.length, 6);
				assert.strictEqual(p.tabs[5].title, 'Video transcript');
				if(condition === 'condition_faq') {
					assert.ok(p.is_static());
					assert.strictEqual(p.solution_system_prompt, '');
					assert.deepStrictEqual(p.client_messages, []);
				} else {
					assert.ok(!p.is_static());
					assert.ok(p.solution_system_prompt.length > 0);
					assert.strictEqual(p.max_turns, 30);
					if(condition === 'condition_short_ai') {
						assert.ok(p.solution_system_prompt.includes('short, conversational'));
						assert.strictEqual(p.max_tokens, 2000);
					} else {
						assert.ok(p.solution_system_prompt.includes('formal, thorough'));
						assert.strictEqual(p.max_tokens, 4000);
					}
				}
			});
		});
	});

	test('all 3 conditions and all 6 scenario orders occur', () => {
		const order = level => level.pages.filter( p => /_video$/.test(p.template_id) ).map( p => p.template_id.substr(0, 2) ).join('');
		assert.strictEqual(new Set(levels.map(get_level_condition)).size, 3);
		assert.strictEqual(new Set(levels.map(order)).size, 6);
	});

	test('condition is not tied to scenario order', () => {
		// With a shared seed stream, each first scenario would map to exactly one condition.
		const first = level => level.pages.find( p => /_video$/.test(p.template_id) ).template_id;
		const pairs = new Set(levels.map( l => first(l) + '|' + get_level_condition(l) ));
		assert.ok(pairs.size >= 8, 'only ' + pairs.size + ' of 9 first-scenario x condition pairs seen');
	});

	test('knowledge items and the attention check are scored silently', () => {
		const level = levels[0];
		['TaxBody', 'TaxReduce', 'TaxMarginal', 'TaxLiability', 'TaxFiling', 'TaxRetire', 'end_attcheck'].forEach( id => {
			const p = level.pages.find( q => q.template_id === id );
			assert.strictEqual(p.correct_required, false);
			assert.strictEqual(p.show_feedback_on, false);
			assert.ok(p.client_items.includes(p.solution));
		});
	});

	test('export rows carry template_id and condition', () => {
		levels.slice(0, 10).forEach( level => {
			const rows = build_answers_from_level(level);
			assert.strictEqual(rows.length, 67);
			const condition = get_level_condition(level);
			assert.ok(CONDITIONS.includes(condition));
			rows.forEach( r => assert.strictEqual(r.condition, condition) );
			assert.deepStrictEqual(rows.map( r => r.template_id ), level.pages.map( p => p.template_id ));
		});
	});
});
