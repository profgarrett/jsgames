// Tests for src/app/pages/QuizResultsTable.tsx
//
// The table itself needs a DOM to render, so here we cover the pure helper
// behind the "# wrong" column -- the count the live-session breakdown is
// ordered by.

const { test, describe } = require('node:test');
const assert = require('node:assert');

const { wrong_count } = require('../src/app/pages/QuizResultsTable.tsx');

describe('wrong_count', () => {
	test('is the answers that were not correct', () => {
		assert.strictEqual(wrong_count(10, 4), 6);
		assert.strictEqual(wrong_count(3, 3), 0);
	});

	test('is zero for a question nobody answered', () => {
		assert.strictEqual(wrong_count(0, 0), 0);
	});

	test('never goes negative on inconsistent counts', () => {
		assert.strictEqual(wrong_count(2, 5), 0);
	});
});
