// Tests for src/server/app_quizviews.ts
//
// Exercises the pure sanitizers that guard the quizview create route. The
// DB-touching route itself is integration-tested separately; here we verify the
// input normalization that runs before any query.

const { test, describe } = require('node:test');
const assert = require('node:assert');

const {
	sanitize_text,
	sanitize_page,
	sanitize_correct,
	summarize_quizviews,
	MAX_TEXT_LENGTH,
	MAX_PAGE_LENGTH,
} = require('../src/server/app_quizviews.ts');

describe('sanitize_text', () => {
	test('accepts and trims a normal value', () => {
		assert.strictEqual(sanitize_text('Who introduced EDA?'), 'Who introduced EDA?');
		assert.strictEqual(sanitize_text('  John Tukey  '), 'John Tukey');
	});

	test('rejects missing, empty, and non-string values', () => {
		assert.strictEqual(sanitize_text(undefined), null);
		assert.strictEqual(sanitize_text(null), null);
		assert.strictEqual(sanitize_text(''), null);
		assert.strictEqual(sanitize_text('   '), null);
		assert.strictEqual(sanitize_text(42), null);
		assert.strictEqual(sanitize_text({}), null);
		assert.strictEqual(sanitize_text(['a']), null);
	});

	test('caps length at the column width', () => {
		const long = 'a'.repeat(MAX_TEXT_LENGTH + 50);
		assert.strictEqual(sanitize_text(long).length, MAX_TEXT_LENGTH);
	});
});

describe('sanitize_page', () => {
	test('accepts and trims a slug', () => {
		assert.strictEqual(sanitize_page(' course_dv/dv01-eda/index '), 'course_dv/dv01-eda/index');
	});

	test('degrades to null instead of failing', () => {
		assert.strictEqual(sanitize_page(undefined), null);
		assert.strictEqual(sanitize_page(''), null);
		assert.strictEqual(sanitize_page(7), null);
	});

	test('caps length at the narrower page column width', () => {
		const long = 'a'.repeat(MAX_PAGE_LENGTH + 50);
		assert.strictEqual(sanitize_page(long).length, MAX_PAGE_LENGTH);
	});
});

describe('sanitize_correct', () => {
	test('maps a real boolean to the tinyint column', () => {
		assert.strictEqual(sanitize_correct(true), 1);
		assert.strictEqual(sanitize_correct(false), 0);
	});

	test('treats anything non-boolean as incorrect', () => {
		assert.strictEqual(sanitize_correct('true'), 0);
		assert.strictEqual(sanitize_correct(1), 0);
		assert.strictEqual(sanitize_correct(undefined), 0);
		assert.strictEqual(sanitize_correct(null), 0);
		assert.strictEqual(sanitize_correct({}), 0);
	});
});

describe('summarize_quizviews', () => {
	// Q1: 3 of 5 correct (60%). Q2: 1 of 4 correct (25%).
	const ROWS = [
		{ question: 'Q1', answer: 'Right', correct: 1, n: 3 },
		{ question: 'Q1', answer: 'Wrong A', correct: 0, n: 2 },
		{ question: 'Q2', answer: 'Right', correct: 1, n: 1 },
		{ question: 'Q2', answer: 'Wrong A', correct: 0, n: 2 },
		{ question: 'Q2', answer: 'Wrong B', correct: 0, n: 1 },
	];

	test('groups rows into one entry per question', () => {
		const summary = summarize_quizviews(ROWS);
		assert.strictEqual(summary.length, 2);
		assert.deepStrictEqual(summary.map((q) => q.question).sort(), ['Q1', 'Q2']);
	});

	test('totals answers and computes percent correct', () => {
		const summary = summarize_quizviews(ROWS);
		const q1 = summary.find((q) => q.question === 'Q1');
		assert.strictEqual(q1.total, 5);
		assert.strictEqual(q1.correct, 3);
		assert.strictEqual(q1.percent_correct, 60);

		const q2 = summary.find((q) => q.question === 'Q2');
		assert.strictEqual(q2.total, 4);
		assert.strictEqual(q2.correct, 1);
		assert.strictEqual(q2.percent_correct, 25);
	});

	test('sorts questions by percent correct, lowest first', () => {
		const summary = summarize_quizviews(ROWS);
		assert.deepStrictEqual(summary.map((q) => q.question), ['Q2', 'Q1']);
	});

	test('sorts answers within a question by selection count', () => {
		const summary = summarize_quizviews(ROWS);
		const q2 = summary.find((q) => q.question === 'Q2');
		assert.deepStrictEqual(
			q2.answers.map((a) => [a.answer, a.count]),
			[['Wrong A', 2], ['Right', 1], ['Wrong B', 1]],
		);
	});

	test('flags which answer was the correct one', () => {
		const summary = summarize_quizviews(ROWS);
		const q1 = summary.find((q) => q.question === 'Q1');
		assert.strictEqual(q1.answers.find((a) => a.answer === 'Right').correct, true);
		assert.strictEqual(q1.answers.find((a) => a.answer === 'Wrong A').correct, false);
	});

	test('handles string counts from the mysql driver', () => {
		const summary = summarize_quizviews([
			{ question: 'Q1', answer: 'Right', correct: '1', n: '3' },
			{ question: 'Q1', answer: 'Wrong', correct: '0', n: '1' },
		]);
		assert.strictEqual(summary[0].total, 4);
		assert.strictEqual(summary[0].percent_correct, 75);
	});

	test('returns an empty array for no rows', () => {
		assert.deepStrictEqual(summarize_quizviews([]), []);
	});

	test('breaks ties alphabetically so ordering is stable', () => {
		const rows = [
			{ question: 'Beta', answer: 'A', correct: 1, n: 1 },
			{ question: 'Alpha', answer: 'A', correct: 1, n: 1 },
		];
		const summary = summarize_quizviews(rows);
		assert.deepStrictEqual(summary.map((q) => q.question), ['Alpha', 'Beta']);
	});
});
