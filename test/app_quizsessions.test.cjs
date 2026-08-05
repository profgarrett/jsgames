// Tests for src/server/app_quizsessions.ts
//
// Exercises the pure helpers backing the live-quiz-session routes: input
// sanitization, join-code generation, and the results/leaderboard math. The
// DB-touching routes themselves are integration-tested separately.

const { test, describe } = require('node:test');
const assert = require('node:assert');

const {
	sanitize_text,
	sanitize_page,
	sanitize_questions,
	generate_code,
	correct_option_text,
	summarize_session_results,
	build_leaderboard,
	MAX_TEXT_LENGTH,
	MAX_PAGE_LENGTH,
} = require('../src/server/app_quizsessions.ts');

describe('sanitize_text', () => {
	test('accepts and trims a normal value', () => {
		assert.strictEqual(sanitize_text('  Who introduced EDA?  '), 'Who introduced EDA?');
	});

	test('rejects missing, empty, and non-string values', () => {
		assert.strictEqual(sanitize_text(undefined), null);
		assert.strictEqual(sanitize_text(''), null);
		assert.strictEqual(sanitize_text('   '), null);
		assert.strictEqual(sanitize_text(42), null);
	});

	test('caps length at the column width', () => {
		const long = 'a'.repeat(MAX_TEXT_LENGTH + 50);
		assert.strictEqual(sanitize_text(long).length, MAX_TEXT_LENGTH);
	});
});

describe('sanitize_page', () => {
	test('accepts a slug and degrades bad input to null', () => {
		assert.strictEqual(sanitize_page(' course_dv/dv01-eda/index '), 'course_dv/dv01-eda/index');
		assert.strictEqual(sanitize_page(undefined), null);
		assert.strictEqual(sanitize_page(7), null);
	});

	test('caps length at the narrower page column width', () => {
		const long = 'a'.repeat(MAX_PAGE_LENGTH + 50);
		assert.strictEqual(sanitize_page(long).length, MAX_PAGE_LENGTH);
	});
});

const VALID_QUESTIONS = [
	{
		prompt: 'Who first introduced Exploratory Data Analysis?',
		options: [
			{ text: 'John Tukey', isCorrect: true },
			{ text: 'Frank Anscombe', isCorrect: false },
			{ text: 'Edward Tufte', isCorrect: false },
		],
	},
	{
		prompt: '2 + 2?',
		options: [
			{ text: '4', isCorrect: true },
			{ text: '5', isCorrect: false },
		],
	},
];

describe('sanitize_questions', () => {
	test('accepts a well-formed deck and trims text', () => {
		const result = sanitize_questions([
			{ prompt: '  Q1  ', options: [{ text: ' A ', isCorrect: true }, { text: 'B', isCorrect: false }] },
		]);
		assert.deepStrictEqual(result, [
			{ prompt: 'Q1', options: [{ text: 'A', isCorrect: true }, { text: 'B', isCorrect: false }] },
		]);
	});

	test('accepts a realistic multi-question deck', () => {
		const result = sanitize_questions(VALID_QUESTIONS);
		assert.strictEqual(result.length, 2);
	});

	test('rejects a non-array, empty array, or oversized array', () => {
		assert.strictEqual(sanitize_questions(undefined), null);
		assert.strictEqual(sanitize_questions('nope'), null);
		assert.strictEqual(sanitize_questions([]), null);
		assert.strictEqual(sanitize_questions(new Array(201).fill(VALID_QUESTIONS[1])), null);
	});

	test('rejects a question with fewer than two options', () => {
		const bad = [{ prompt: 'Q1', options: [{ text: 'A', isCorrect: true }] }];
		assert.strictEqual(sanitize_questions(bad), null);
	});

	test('rejects a question missing a prompt', () => {
		const bad = [{ prompt: '', options: [{ text: 'A', isCorrect: true }, { text: 'B', isCorrect: false }] }];
		assert.strictEqual(sanitize_questions(bad), null);
	});

	test('rejects a question with zero correct options', () => {
		const bad = [{ prompt: 'Q1', options: [{ text: 'A', isCorrect: false }, { text: 'B', isCorrect: false }] }];
		assert.strictEqual(sanitize_questions(bad), null);
	});

	test('rejects a question with more than one correct option', () => {
		const bad = [{ prompt: 'Q1', options: [{ text: 'A', isCorrect: true }, { text: 'B', isCorrect: true }] }];
		assert.strictEqual(sanitize_questions(bad), null);
	});

	test('rejects an option with unusable text', () => {
		const bad = [{ prompt: 'Q1', options: [{ text: '', isCorrect: true }, { text: 'B', isCorrect: false }] }];
		assert.strictEqual(sanitize_questions(bad), null);
	});
});

describe('generate_code', () => {
	test('produces a 6-character code from the unambiguous alphabet', () => {
		const code = generate_code();
		assert.strictEqual(code.length, 6);
		assert.match(code, /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/);
	});

	test('does not include visually ambiguous characters', () => {
		for (let i = 0; i < 200; i++) {
			assert.doesNotMatch(generate_code(), /[0O1I]/);
		}
	});
});

describe('correct_option_text', () => {
	test('returns the text of the option flagged correct', () => {
		assert.strictEqual(correct_option_text(VALID_QUESTIONS[0]), 'John Tukey');
		assert.strictEqual(correct_option_text(VALID_QUESTIONS[1]), '4');
	});
});

describe('summarize_session_results', () => {
	const questions = [
		{ prompt: 'Q1', options: [{ text: 'Right', isCorrect: true }, { text: 'Wrong', isCorrect: false }] },
		{ prompt: 'Q2', options: [{ text: 'A', isCorrect: true }, { text: 'B', isCorrect: false }, { text: 'C', isCorrect: false }] },
	];

	test('includes every option even if nobody picked it', () => {
		const rows = [
			{ question_index: 0, answer: 'Right', correct: 1, username: 'alice' },
		];
		const summary = summarize_session_results(questions, rows);
		assert.strictEqual(summary[0].answers.length, 2);
		assert.strictEqual(summary[0].answers.find((a) => a.answer === 'Wrong').count, 0);
	});

	test('keeps questions in asked order, not percent-correct order', () => {
		const rows = [
			{ question_index: 0, answer: 'Right', correct: 1, username: 'alice' },
			{ question_index: 1, answer: 'B', correct: 0, username: 'alice' },
		];
		const summary = summarize_session_results(questions, rows);
		assert.deepStrictEqual(summary.map((q) => q.question), ['Q1', 'Q2']);
	});

	test('computes totals and percent correct per question', () => {
		const rows = [
			{ question_index: 0, answer: 'Right', correct: 1, username: 'alice' },
			{ question_index: 0, answer: 'Wrong', correct: 0, username: 'bob' },
			{ question_index: 0, answer: 'Wrong', correct: 0, username: 'carol' },
		];
		const summary = summarize_session_results(questions, rows);
		assert.strictEqual(summary[0].total, 3);
		assert.strictEqual(summary[0].correct, 1);
		assert.strictEqual(summary[0].percent_correct, 33);
	});

	test('handles a question nobody answered', () => {
		const summary = summarize_session_results(questions, []);
		assert.strictEqual(summary[0].total, 0);
		assert.strictEqual(summary[0].percent_correct, 0);
		assert.deepStrictEqual(summary[0].answers.map((a) => a.count), [0, 0]);
	});
});

describe('build_leaderboard', () => {
	test('ranks participants by number of correct answers, most first', () => {
		const rows = [
			{ question_index: 0, answer: 'Right', correct: 1, username: 'alice' },
			{ question_index: 1, answer: 'A', correct: 1, username: 'alice' },
			{ question_index: 0, answer: 'Right', correct: 1, username: 'bob' },
			{ question_index: 1, answer: 'B', correct: 0, username: 'bob' },
		];
		const board = build_leaderboard(rows);
		assert.deepStrictEqual(board, [{ username: 'alice', correct: 2 }, { username: 'bob', correct: 1 }]);
	});

	test('ignores incorrect answers entirely', () => {
		const rows = [{ question_index: 0, answer: 'Wrong', correct: 0, username: 'alice' }];
		assert.deepStrictEqual(build_leaderboard(rows), []);
	});

	test('breaks ties alphabetically by username', () => {
		const rows = [
			{ question_index: 0, answer: 'Right', correct: 1, username: 'zeb' },
			{ question_index: 0, answer: 'Right', correct: 1, username: 'anna' },
		];
		assert.deepStrictEqual(
			build_leaderboard(rows).map((e) => e.username),
			['anna', 'zeb'],
		);
	});

	test('limits to the top 5', () => {
		const rows = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((username) => (
			{ question_index: 0, answer: 'Right', correct: 1, username }
		));
		assert.strictEqual(build_leaderboard(rows).length, 5);
	});
});
