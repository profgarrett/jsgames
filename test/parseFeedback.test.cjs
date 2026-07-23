// Tests for src/shared/parseFeedback.js
//
// parseFeedback is the formula parser that feeds both the KC tagging
// (get_function_kcs) and the complexity RULES, so its output contract matters.
// It returns an ordered array of { has, args } groups:
//   functions, symbols, [invalid_tokens], references, values
// `args` within each group is de-duplicated and sorted. Expectations below were
// captured from the live parser, not assumed.

const { test, describe } = require('node:test');
const assert = require('node:assert');

const { parseFeedback, parseFormula } = require('../src/shared/parseFeedback.js');

// Collapse the [{has, args}] array into { has: args } for easy assertions.
const groups = (formula) => {
	const out = {};
	for (const g of parseFeedback(formula)) out[g.has] = g.args;
	return out;
};

describe('parseFeedback - structure', () => {
	test('always returns functions, symbols, references, values (in order)', () => {
		const keys = parseFeedback('=a1+b1').map((g) => g.has);
		assert.deepStrictEqual(keys, ['functions', 'symbols', 'references', 'values']);
	});

	test('empty formula yields four empty groups and no invalid_tokens', () => {
		assert.deepStrictEqual(groups(''), {
			functions: [], symbols: [], references: [], values: [],
		});
	});

	test('invalid_tokens group is only present when something is invalid', () => {
		assert.strictEqual('invalid_tokens' in groups('=a1'), false);
		assert.strictEqual('invalid_tokens' in groups('=foo'), true);
	});
});

describe('parseFeedback - functions', () => {
	test('extracts function names in lower case', () => {
		assert.deepStrictEqual(groups('=sum(a1)').functions, ['sum']);
	});

	test('multiple functions are de-duplicated and sorted', () => {
		assert.deepStrictEqual(groups('=sum(a1)*max(a2)').functions, ['max', 'sum']);
	});
});

describe('parseFeedback - symbols', () => {
	test('math operator', () => {
		assert.deepStrictEqual(groups('=1+2').symbols, ['+']);
	});

	test('concatenation operator', () => {
		assert.deepStrictEqual(groups('=a1&b1').symbols, ['&']);
	});

	test('logical operator', () => {
		assert.deepStrictEqual(groups('=if(a1>1,"y","n")').symbols, ['>']);
	});
});

describe('parseFeedback - references', () => {
	test('valid cell references are captured', () => {
		assert.deepStrictEqual(groups('=a1+b1').references, ['a1', 'b1']);
	});

	test('duplicate references are collapsed', () => {
		assert.deepStrictEqual(groups('=a1+a1').references, ['a1']);
	});

	test('range references (a1:b1) are kept as a single reference', () => {
		assert.deepStrictEqual(groups('=sum(a1:b1)').references, ['a1:b1']);
	});
});

describe('parseFeedback - invalid tokens', () => {
	test('bare words are invalid, not references', () => {
		const g = groups('=foo');
		assert.deepStrictEqual(g.invalid_tokens, ['foo']);
		assert.deepStrictEqual(g.references, []);
	});

	test('multi-letter column refs (aa1) are rejected', () => {
		assert.deepStrictEqual(groups('=aa1').invalid_tokens, ['aa1']);
	});
});

describe('parseFeedback - values', () => {
	test('numbers are parsed to integers', () => {
		assert.deepStrictEqual(groups('=5').values, [5]);
	});

	test('quoted text is captured as a string', () => {
		assert.deepStrictEqual(groups('="hello"').values, ['hello']);
	});

	test('booleans are normalized to real booleans, not references', () => {
		assert.deepStrictEqual(groups('=true').values, [true]);
		assert.deepStrictEqual(groups('=false').values, [false]);
		assert.deepStrictEqual(groups('=true').references, []);
	});
});

describe('parseFormula - tokenizer', () => {
	test('tokenizes a function call into function/operand tokens', () => {
		const tokens = parseFormula('=sum(a1)').map((t) => ({ token: t.token, type: t.type, subtype: t.subtype }));
		assert.deepStrictEqual(tokens, [
			{ token: 'sum', type: 'function', subtype: 'start' },
			{ token: 'a1', type: 'operand', subtype: 'range' },
			{ token: '', type: 'function', subtype: 'stop' },
		]);
	});
});
