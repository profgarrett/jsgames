// Tests for src/server/app_quizsessions.ts
//
// Exercises the pure helpers backing the live-quiz-session routes: input
// sanitization, join-code generation, each student's independently-shuffled
// question order and self-paced progress tracking, and the
// results/leaderboard math. The DB-touching routes themselves are
// integration-tested separately.

const { test, describe } = require('node:test');
const assert = require('node:assert');

const {
	sanitize_text,
	sanitize_page,
	sanitize_questions,
	generate_code,
	correct_option_text,
	compute_participant_progress,
	shuffle_indices,
	parse_question_order,
	summarize_session_results,
	build_leaderboard,
	display_name_for,
	count_stored_questions,
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

describe('shuffle_indices', () => {
	test('is a permutation of [0, length)', () => {
		const order = shuffle_indices(6);
		assert.deepStrictEqual([...order].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5]);
	});

	test('handles length 0 and 1', () => {
		assert.deepStrictEqual(shuffle_indices(0), []);
		assert.deepStrictEqual(shuffle_indices(1), [0]);
	});

	test('does not always produce the same order (sanity check on randomness)', () => {
		const orders = new Set();
		for (let i = 0; i < 30; i++) orders.add(JSON.stringify(shuffle_indices(8)));
		assert.ok(orders.size > 1, 'expected at least two distinct shuffles across 30 tries');
	});
});

describe('parse_question_order', () => {
	test('returns a valid stored order unchanged', () => {
		assert.deepStrictEqual(parse_question_order('[2,0,1]', 3), [2, 0, 1]);
	});

	test('falls back to sequential order for null (pre-migration participant rows)', () => {
		assert.deepStrictEqual(parse_question_order(null, 4), [0, 1, 2, 3]);
	});

	test('falls back to sequential order for unparseable JSON', () => {
		assert.deepStrictEqual(parse_question_order('not json', 3), [0, 1, 2]);
	});

	test('falls back to sequential order when the length does not match the deck', () => {
		assert.deepStrictEqual(parse_question_order('[0,1]', 3), [0, 1, 2]);
	});

	test('falls back to sequential order for an out-of-range index', () => {
		assert.deepStrictEqual(parse_question_order('[0,1,5]', 3), [0, 1, 2]);
	});

	test('falls back to sequential order for a duplicate index', () => {
		assert.deepStrictEqual(parse_question_order('[0,1,1]', 3), [0, 1, 2]);
	});
});

describe('compute_participant_progress', () => {
	test('a student with no answers yet is on question 0 with a clean tally', () => {
		assert.deepStrictEqual(compute_participant_progress([]), { next_index: 0, correct_count: 0, incorrect_count: 0 });
	});

	test('next_index is the count of questions answered so far', () => {
		const rows = [{ question_index: 0, correct: 1 }, { question_index: 1, correct: 0 }];
		assert.strictEqual(compute_participant_progress(rows).next_index, 2);
	});

	test('splits the tally into correct and incorrect', () => {
		const rows = [
			{ question_index: 0, correct: 1 },
			{ question_index: 1, correct: 0 },
			{ question_index: 2, correct: 1 },
		];
		const progress = compute_participant_progress(rows);
		assert.strictEqual(progress.correct_count, 2);
		assert.strictEqual(progress.incorrect_count, 1);
	});

	test('handles string 1/0 correct flags from the mysql driver', () => {
		const rows = [{ question_index: 0, correct: '1' }, { question_index: 1, correct: '0' }];
		const progress = compute_participant_progress(rows);
		assert.strictEqual(progress.correct_count, 1);
		assert.strictEqual(progress.incorrect_count, 1);
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

	test('puts the question with the most wrong answers first', () => {
		const rows = [
			{ question_index: 0, answer: 'Right', correct: 1, username: 'alice' },
			{ question_index: 1, answer: 'B', correct: 0, username: 'alice' },
			{ question_index: 1, answer: 'C', correct: 0, username: 'bob' },
		];
		const summary = summarize_session_results(questions, rows);
		assert.deepStrictEqual(summary.map((q) => q.question), ['Q2', 'Q1']);
	});

	test('ranks by count of wrong answers, not by percent correct', () => {
		// Q1: 2 of 6 wrong (67% correct). Q2: 1 of 1 wrong (0% correct).
		// The raw count wins, so the question more students missed leads.
		const rows = [
			...['a', 'b', 'c', 'd'].map((username) => (
				{ question_index: 0, answer: 'Right', correct: 1, username }
			)),
			...['e', 'f'].map((username) => (
				{ question_index: 0, answer: 'Wrong', correct: 0, username }
			)),
			{ question_index: 1, answer: 'B', correct: 0, username: 'a' },
		];
		const summary = summarize_session_results(questions, rows);
		assert.deepStrictEqual(summary.map((q) => q.question), ['Q1', 'Q2']);
		assert.strictEqual(summary[0].percent_correct, 67);
	});

	test('breaks a tie in wrong answers with the lower percent correct', () => {
		// One wrong answer each: Q1 got it wrong once out of two, Q2 once out of one.
		const rows = [
			{ question_index: 0, answer: 'Right', correct: 1, username: 'alice' },
			{ question_index: 0, answer: 'Wrong', correct: 0, username: 'bob' },
			{ question_index: 1, answer: 'B', correct: 0, username: 'alice' },
		];
		const summary = summarize_session_results(questions, rows);
		assert.deepStrictEqual(summary.map((q) => q.question), ['Q2', 'Q1']);
	});

	test('falls back to asked order when nothing separates two questions', () => {
		const rows = [
			{ question_index: 0, answer: 'Wrong', correct: 0, username: 'alice' },
			{ question_index: 1, answer: 'B', correct: 0, username: 'bob' },
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

	test('sorts a question nobody answered below the answered ones', () => {
		const rows = [
			{ question_index: 1, answer: 'A', correct: 1, username: 'alice' },
		];
		const summary = summarize_session_results(questions, rows);
		assert.deepStrictEqual(summary.map((q) => q.question), ['Q2', 'Q1']);
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
		assert.deepStrictEqual(board, [
			{ username: 'alice', display_name: 'alice', correct: 2 },
			{ username: 'bob', display_name: 'bob', correct: 1 },
		]);
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

	test('shows a roster nickname instead of the login email', () => {
		const rows = [
			{ question_index: 0, answer: 'Right', correct: 1,
				username: 'bj000@mix.wvu.edu', nickname: 'Bob Jones' },
		];
		const board = build_leaderboard(rows);

		assert.strictEqual(board[0].display_name, 'Bob Jones');
		// The account stays on the entry as the stable key.
		assert.strictEqual(board[0].username, 'bj000@mix.wvu.edu');
	});

	test('falls back to the username for a student with no nickname', () => {
		const rows = [
			{ question_index: 0, answer: 'Right', correct: 1, username: 'nw02@mix.wvu.edu', nickname: null },
			{ question_index: 0, answer: 'Right', correct: 1, username: 'sm01@mix.wvu.edu' },
		];
		assert.deepStrictEqual(
			build_leaderboard(rows).map((e) => e.display_name),
			['nw02@mix.wvu.edu', 'sm01@mix.wvu.edu'],
		);
	});

	test('two students sharing a nickname are still scored separately', () => {
		// Merging them because their display names match would silently halve
		// the board on a projector.
		const rows = [
			{ question_index: 0, answer: 'Right', correct: 1, username: 'bj000@x.edu', nickname: 'Bob Jones' },
			{ question_index: 1, answer: 'Right', correct: 1, username: 'bj000@x.edu', nickname: 'Bob Jones' },
			{ question_index: 0, answer: 'Right', correct: 1, username: 'bj001@x.edu', nickname: 'Bob Jones' },
		];
		const board = build_leaderboard(rows);

		assert.strictEqual(board.length, 2);
		assert.deepStrictEqual(board.map((e) => e.correct), [2, 1]);
	});

	test('ties sort by the name shown, not by the underlying email', () => {
		// Sorting by username would put zeb's account first; the board reads by
		// what the room can see.
		const rows = [
			{ question_index: 0, answer: 'Right', correct: 1, username: 'aa99@x.edu', nickname: 'Zeb Young' },
			{ question_index: 0, answer: 'Right', correct: 1, username: 'zz11@x.edu', nickname: 'Anna Adams' },
		];
		assert.deepStrictEqual(
			build_leaderboard(rows).map((e) => e.display_name),
			['Anna Adams', 'Zeb Young'],
		);
	});

	test('a name is picked up even from a row where the student answered wrong', () => {
		const rows = [
			{ question_index: 0, answer: 'Wrong', correct: 0, username: 'bj000@x.edu', nickname: 'Bob Jones' },
			{ question_index: 1, answer: 'Right', correct: 1, username: 'bj000@x.edu', nickname: 'Bob Jones' },
		];
		assert.strictEqual(build_leaderboard(rows)[0].display_name, 'Bob Jones');
	});
});


describe('display_name_for', () => {
	test('prefers the nickname', () => {
		assert.strictEqual(display_name_for('bj000@mix.wvu.edu', 'Bob Jones'), 'Bob Jones');
	});

	test('falls back to the username when there is no nickname', () => {
		assert.strictEqual(display_name_for('bj000@mix.wvu.edu', null), 'bj000@mix.wvu.edu');
		assert.strictEqual(display_name_for('bj000@mix.wvu.edu', undefined), 'bj000@mix.wvu.edu');
	});

	test('treats a blank or whitespace-only nickname as absent', () => {
		// users.nickname is nullable and a hand-edited row can hold ''; showing
		// an empty name on a projector is worse than showing the email.
		assert.strictEqual(display_name_for('bj000@mix.wvu.edu', ''), 'bj000@mix.wvu.edu');
		assert.strictEqual(display_name_for('bj000@mix.wvu.edu', '   '), 'bj000@mix.wvu.edu');
	});

	test('trims a padded nickname', () => {
		assert.strictEqual(display_name_for('bj000@mix.wvu.edu', '  Bob Jones  '), 'Bob Jones');
	});
});


describe('count_stored_questions', () => {
	test('counts the questions in a stored deck', () => {
		const deck = JSON.stringify([
			{ prompt: 'a', options: [] },
			{ prompt: 'b', options: [] },
		]);
		assert.strictEqual(count_stored_questions(deck), 2);
	});

	test('returns 0 for an empty deck', () => {
		assert.strictEqual(count_stored_questions('[]'), 0);
	});

	test('returns 0 rather than throwing on unusable input', () => {
		// One corrupt questions_json should cost that row its count, not take
		// down the whole past-sessions list.
		assert.strictEqual(count_stored_questions('not json'), 0);
		assert.strictEqual(count_stored_questions('{"prompt":"a"}'), 0);
		assert.strictEqual(count_stored_questions(null), 0);
		assert.strictEqual(count_stored_questions(undefined), 0);
		assert.strictEqual(count_stored_questions(7), 0);
	});
});
