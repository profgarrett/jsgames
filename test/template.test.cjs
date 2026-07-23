// Tests for src/shared/template.ts
//
// Ported from the `if (DEBUG) { ... }` assertion block that used to live inside
// template.ts. Several template features (randOf, popCell, popColumn) are
// randomized, so the non-deterministic cases are wrapped in a repeat loop to
// make coverage meaningful and reduce the chance of a lucky pass.

const { test, describe } = require('node:test');
const assert = require('node:assert');

const { get_compiled_template_values, fill_template } = require('../src/shared/template.ts');

// Shared fixtures (mirror the originals from the DEBUG block).
const basepage = { column_titles: ['as', 'bs', 'cs'] };
const baselevel = { type: 'IfLevelSchema', _id: '999' };

// Number of times to run each randomized assertion.
const RAND_RUNS = 100;
const repeat = (fn) => { for (let i = 0; i < RAND_RUNS; i++) fn(); };

describe('get_compiled_template_values - numeric ranges', () => {
	test('[1-1] resolves to exactly 1', () => {
		repeat(() => {
			const values = get_compiled_template_values({ ...basepage, template_values: { n: '[1-1]' } });
			assert.strictEqual(values.n, 1);
		});
	});

	test('[1-9] resolves within [0,10]', () => {
		repeat(() => {
			const values = get_compiled_template_values({ ...basepage, template_values: { n: '[1-9]' } });
			assert.ok(typeof values.n === 'number' && values.n >= 0 && values.n <= 10, `got ${values.n}`);
		});
	});

	test('[10-100] resolves within [10,100]', () => {
		repeat(() => {
			const values = get_compiled_template_values({ ...basepage, template_values: { n: '[10-100]' } });
			assert.ok(typeof values.n === 'number' && values.n >= 10 && values.n <= 100, `got ${values.n}`);
		});
	});
});

describe('get_compiled_template_values - randOf', () => {
	test('randOf(x,y,z) only returns a listed option', () => {
		repeat(() => {
			const values = get_compiled_template_values({ ...basepage, template_values: { x: 'randOf(x,y,z)' } });
			assert.ok(['x', 'y', 'z'].includes(values.x), `got ${values.x}`);
		});
	});
});

describe('get_compiled_template_values - popCell', () => {
	test('popCell() over two columns yields a1/b1 and matching title', () => {
		repeat(() => {
			const values = get_compiled_template_values({
				...basepage,
				column_titles: ['test1', 'test2'],
				template_values: { x: 'popCell()' },
			});
			assert.ok(values.x_ref == 'a1' || values.x_ref === 'b1', `got ref ${values.x_ref}`);
			assert.ok(values.x_title == 'test1' || values.x_title === 'test2', `got title ${values.x_title}`);
		});
	});

	test('popCell() over a single column yields a1 / test1', () => {
		repeat(() => {
			const values = get_compiled_template_values({
				...basepage,
				column_titles: ['test1'],
				template_values: { x: 'popCell()' },
			});
			assert.strictEqual(values.x_ref, 'a1');
			assert.strictEqual(values.x_title, 'test1');
		});
	});

	test('popCell(a1,b1) is limited to the listed refs', () => {
		repeat(() => {
			const values = get_compiled_template_values({ ...basepage, template_values: { x: 'popCell(a1,b1)' } });
			assert.ok(values.x_ref == 'a1' || values.x_ref === 'b1', `got ${values.x_ref}`);
		});
	});

	test('popCell(a1) always yields a1', () => {
		repeat(() => {
			const values = get_compiled_template_values({ ...basepage, template_values: { x: 'popCell(a1)' } });
			assert.strictEqual(values.x_ref, 'a1');
		});
	});

	test('two popCell(c1,b1) draws never return a1', () => {
		repeat(() => {
			const values = get_compiled_template_values({
				column_titles: ['aTitle', 'bTitle', 'cTitle'],
				template_values: { x1: 'popCell(c1,b1)', x2: 'popCell(c1,b1)' },
			}, baselevel);
			assert.notStrictEqual(values.x1_ref, 'a1');
			assert.notStrictEqual(values.x2_ref, 'a1');
		});
	});
});

describe('get_compiled_template_values - popColumn', () => {
	test('popColumn(aTitle,bTitle) x2 avoids cTitle and does not repeat', () => {
		repeat(() => {
			const values = get_compiled_template_values({
				t1_titles: ['aTitle', 'bTitle', 'cTitle'],
				template_values: { x1: 'popColumn(aTitle,bTitle)', x2: 'popColumn(aTitle,bTitle)' },
			}, baselevel);
			assert.notStrictEqual(values.x1, 'cTitle');
			assert.notStrictEqual(values.x2, 'cTitle');
			assert.notStrictEqual(values.x1, values.x2);
		});
	});

	test('popColumn across t1/t2/t3 titles avoids cTitle and does not repeat', () => {
		repeat(() => {
			const values = get_compiled_template_values({
				t1_titles: ['aTitle'],
				t2_titles: ['bTitle'],
				t3_titles: ['cTitle'],
				template_values: { x1: 'popColumn(aTitle,bTitle)', x2: 'popColumn(aTitle,bTitle)' },
			}, baselevel);
			assert.notStrictEqual(values.x1, 'cTitle');
			assert.notStrictEqual(values.x2, 'cTitle');
			assert.notStrictEqual(values.x1, values.x2);
		});
	});

	test('popColumn() x3 covers all titles with no repeats', () => {
		repeat(() => {
			const values = get_compiled_template_values({
				t1_titles: ['aTitle', 'bTitle', 'cTitle'],
				template_values: { x1: 'popColumn()', x2: 'popColumn()', x3: 'popColumn()' },
			}, baselevel);
			const titles = ['aTitle', 'bTitle', 'cTitle'];
			assert.ok(titles.includes(values.x1), `got ${values.x1}`);
			assert.ok(titles.includes(values.x2), `got ${values.x2}`);
			assert.ok(titles.includes(values.x3), `got ${values.x3}`);
			assert.ok(values.x1 !== values.x2 && values.x2 !== values.x3, 'expected distinct draws');
		});
	});
});

describe('fill_template', () => {
	test('a lone {n} number is returned as a number, not a string', () => {
		assert.strictEqual(fill_template('{n}', { n: 1 }), 1);
	});

	test('repeated tokens are all substituted', () => {
		assert.strictEqual(fill_template('Hello {n} and {n}', { n: 1, x: 1, y: 1 }), 'Hello 1 and 1');
	});

	test('adjacent tokens concatenate into a string', () => {
		assert.strictEqual(fill_template('{n}{x}', { n: 1, x: 'bob', y: 1 }), '1bob');
	});

	test('cell ref and title tokens resolve from compiled values', () => {
		const values = get_compiled_template_values({
			...basepage,
			column_titles: ['test1'],
			template_values: { x: 'popCell()' },
		});
		assert.strictEqual(fill_template('Yo {x_ref}', values), 'Yo a1');
		assert.strictEqual(fill_template('Yo {x_title}', values), 'Yo test1');
	});
});
