// Tests for src/app/pages/PageQuizResults.tsx
//
// The component itself needs a DOM to render, so here we cover the pure
// percentage helper used for the per-answer bars.

const { test, describe } = require('node:test');
const assert = require('node:assert');

const { answer_share } = require('../src/app/pages/PageQuizResults.tsx');

describe('answer_share', () => {
	test('returns a whole-number percentage of the question total', () => {
		assert.strictEqual(answer_share(3, 5), 60);
		assert.strictEqual(answer_share(1, 4), 25);
		assert.strictEqual(answer_share(5, 5), 100);
		assert.strictEqual(answer_share(0, 5), 0);
	});

	test('rounds to the nearest whole percent', () => {
		assert.strictEqual(answer_share(1, 3), 33);
		assert.strictEqual(answer_share(2, 3), 67);
	});

	test('returns 0 rather than NaN when the total is zero or negative', () => {
		assert.strictEqual(answer_share(0, 0), 0);
		assert.strictEqual(answer_share(3, 0), 0);
		assert.strictEqual(answer_share(3, -1), 0);
	});
});
