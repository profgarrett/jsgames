// Tests for src/app/pages/LiveQuizInstructor.tsx
//
// Exercises the pure helpers that turn selected key terms into multiple-choice
// quiz questions: picking distractor definitions, and assembling the
// question/answers shape the rest of the live-quiz pipeline (buildQuiz,
// app_quizsessions.ts) already expects.

const { test, describe } = require('node:test');
const assert = require('node:assert');

const { pick_distractors, buildTermQuestions } = require('../src/app/pages/LiveQuizInstructor.tsx');

const TERMS = [
	{ term: 'Primary Key', definition: 'A unique identifier for each record in a table.' },
	{ term: 'Foreign Key', definition: 'A column referencing the primary key of another table.' },
	{ term: 'Index', definition: 'A structure that speeds up lookups on a column.' },
	{ term: 'Schema', definition: 'The structure describing a database\'s tables and columns.' },
	{ term: 'Join', definition: 'Combining rows from two or more tables based on a related column.' },
	{ term: 'Normalization', definition: 'Organizing data to reduce redundancy.' },
];

describe('pick_distractors', () => {
	test('never includes the term\'s own definition', () => {
		const term = TERMS[0];
		for (let i = 0; i < 20; i++) {
			assert.ok(!pick_distractors(term, TERMS, 4).includes(term.definition));
		}
	});

	test('never includes the term itself even if another term shares its definition text', () => {
		const dup = { term: 'Primary Key', definition: 'Some other definition entirely.' };
		const distractors = pick_distractors(TERMS[0], [...TERMS, dup], 4);
		assert.ok(!distractors.includes(dup.definition));
	});

	test('returns at most `count` distractors', () => {
		assert.strictEqual(pick_distractors(TERMS[0], TERMS, 4).length, 4);
		assert.strictEqual(pick_distractors(TERMS[0], TERMS, 2).length, 2);
	});

	test('returns fewer distractors than requested when the pool is small', () => {
		const smallPool = TERMS.slice(0, 2);
		assert.strictEqual(pick_distractors(smallPool[0], smallPool, 4).length, 1);
	});

	test('returns nothing when there are no other terms', () => {
		assert.deepStrictEqual(pick_distractors(TERMS[0], [TERMS[0]], 4), []);
	});

	test('de-duplicates identical definition text across different terms', () => {
		const withDuplicate = [...TERMS, { term: 'Key Alias', definition: TERMS[1].definition }];
		const distractors = pick_distractors(TERMS[0], withDuplicate, 10);
		const occurrences = distractors.filter((d) => d === TERMS[1].definition).length;
		assert.strictEqual(occurrences, 1);
	});

	test('is not always the same order (sanity check on randomness)', () => {
		const orders = new Set();
		for (let i = 0; i < 30; i++) orders.add(JSON.stringify(pick_distractors(TERMS[0], TERMS, 4)));
		assert.ok(orders.size > 1, 'expected at least two distinct distractor sets across 30 tries');
	});
});

describe('buildTermQuestions', () => {
	test('produces one question per selected term', () => {
		const questions = buildTermQuestions([TERMS[0], TERMS[1]], TERMS);
		assert.strictEqual(questions.length, 2);
	});

	test('phrases the prompt around the term', () => {
		const [question] = buildTermQuestions([TERMS[0]], TERMS);
		assert.match(question.prompt, /Primary Key/);
	});

	test('the first answer is always the term\'s real definition', () => {
		for (const term of TERMS) {
			const [question] = buildTermQuestions([term], TERMS);
			assert.strictEqual(question.answers[0], term.definition);
		}
	});

	test('includes up to 4 distractors alongside the correct definition', () => {
		const [question] = buildTermQuestions([TERMS[0]], TERMS);
		assert.strictEqual(question.answers.length, 5);
	});

	test('degrades to fewer answers when the page has few terms, but never below 2', () => {
		const twoTerms = TERMS.slice(0, 2);
		const [question] = buildTermQuestions([twoTerms[0]], twoTerms);
		assert.strictEqual(question.answers.length, 2);
	});

	test('skips a term entirely if it has no possible distractors', () => {
		const onlyTerm = [TERMS[0]];
		assert.deepStrictEqual(buildTermQuestions(onlyTerm, onlyTerm), []);
	});

	test('does not mutate the input arrays', () => {
		const selected = [TERMS[0]];
		const before = JSON.stringify(TERMS);
		buildTermQuestions(selected, TERMS);
		assert.strictEqual(JSON.stringify(TERMS), before);
	});
});
