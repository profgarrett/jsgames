// Tests for src/shared/kcs.ts
//
// Ported from the two `if (DEBUG) { ... }` blocks that used to live inside
// kcs.ts: (1) mapping Excel functions to knowledge-component tags via
// get_function_kcs, and (2) the data-driven complexity RULES, each of which
// already carries its own expected `triggered` cases in rule.tests.

const { test, describe } = require('node:test');
const assert = require('node:assert');

const { get_function_kcs, RULES } = require('../src/shared/kcs.ts');
const { parseFeedback } = require('../src/shared/parseFeedback.js');

describe('get_function_kcs', () => {
	// The original DEBUG cases.
	test('=sum(1) tags as FUNCTION_RANGE', () => {
		assert.strictEqual(get_function_kcs('=sum(1)')[0].tag, 'FUNCTION_RANGE');
	});

	test('=sum(1)+min(1) leads with FUNCTION_RANGE', () => {
		assert.strictEqual(get_function_kcs('=sum(1)+min(1)')[0].tag, 'FUNCTION_RANGE');
	});

	// A few extra cases exercising other rows of the FUNCTION_KCS table.
	test('=if(a1>1,1,0) tags as FUNCTION_IF', () => {
		assert.strictEqual(get_function_kcs('=if(a1>1,1,0)')[0].tag, 'FUNCTION_IF');
	});

	test('=left(a1,2) tags as FUNCTION_TEXT_CUT', () => {
		assert.strictEqual(get_function_kcs('=left(a1,2)')[0].tag, 'FUNCTION_TEXT_CUT');
	});

	test('a formula with no functions yields no tags', () => {
		assert.deepStrictEqual(get_function_kcs('=a1+b1'), []);
	});
});

describe('complexity RULES', () => {
	// Each rule ships its own table of { solution_f, triggered } expectations.
	// Generate one assertion per case so failures pinpoint the exact rule + formula.
	for (const rule of RULES) {
		if (!Array.isArray(rule.tests)) continue;
		for (const t of rule.tests) {
			test(`${rule.tag}: ${t.solution_f} -> triggered=${t.triggered}`, () => {
				const actual = rule.if(t.solution_f, parseFeedback(t.solution_f));
				assert.strictEqual(actual, t.triggered);
			});
		}
	}
});
