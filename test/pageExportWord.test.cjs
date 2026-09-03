// Tests for the pure helpers behind PagePractice.tsx's "Export to Word" screen.

const { test, describe } = require('node:test');
const assert = require('node:assert');

const { indexToLetter, buildTermSection, buildExportQuestions } = require('../src/app/pages/PageExportWord.ts');

describe('indexToLetter', () => {
	test('labels the first 26 terms A through Z', () => {
		assert.strictEqual(indexToLetter(0), 'A');
		assert.strictEqual(indexToLetter(1), 'B');
		assert.strictEqual(indexToLetter(25), 'Z');
	});

	test('rolls over into double letters past Z, spreadsheet-column style', () => {
		assert.strictEqual(indexToLetter(26), 'AA');
		assert.strictEqual(indexToLetter(27), 'AB');
		assert.strictEqual(indexToLetter(51), 'AZ');
		assert.strictEqual(indexToLetter(52), 'BA');
	});
});

describe('buildTermSection', () => {
	const terms = [
		{ term: 'Wide data', definition: 'Values of one variable spread across columns.' },
		{ term: 'Discrete value', definition: 'A variable with a limited number of possible values.' },
		{ term: 'Continuous value', definition: 'A variable with a large range of possible values.' },
	];

	test('keeps rows in selection order, one per term', () => {
		const { rows } = buildTermSection(terms);
		assert.deepStrictEqual(rows.map((r) => r.number), [1, 2, 3]);
		assert.deepStrictEqual(rows.map((r) => r.definition), terms.map((t) => t.definition));
	});

	test('alphabetizes the term list and letters it A, B, C...', () => {
		const { termList } = buildTermSection(terms);
		assert.deepStrictEqual(termList, [
			{ letter: 'A', term: 'Continuous value' },
			{ letter: 'B', term: 'Discrete value' },
			{ letter: 'C', term: 'Wide data' },
		]);
	});

	test('each row\'s Term matches the same letter assigned in the term list', () => {
		const { rows } = buildTermSection(terms);
		// terms[0] is "Wide data" -> letter C in the alphabetized term list.
		assert.strictEqual(rows[0].term, 'C. Wide data');
		// terms[1] is "Discrete value" -> letter B.
		assert.strictEqual(rows[1].term, 'B. Discrete value');
		// terms[2] is "Continuous value" -> letter A.
		assert.strictEqual(rows[2].term, 'A. Continuous value');
	});

	test('returns empty rows and term list for no terms', () => {
		assert.deepStrictEqual(buildTermSection([]), { rows: [], termList: [] });
	});
});

describe('buildExportQuestions', () => {
	const questions = [
		{ prompt: 'What is EDA?', answers: ['Exploratory Data Analysis', 'Estimated Data Average', 'External Data Access'] },
		{ prompt: 'Pick the ratio variable.', answers: ['Revenue', 'Star rating', 'ZIP Code'] },
	];

	test('keeps one question per input, in order', () => {
		const exported = buildExportQuestions(questions);
		assert.strictEqual(exported.length, 2);
		assert.strictEqual(exported[0].prompt, 'What is EDA?');
		assert.strictEqual(exported[1].prompt, 'Pick the ratio variable.');
	});

	test('every choice from the source answers is present exactly once, with exactly one marked correct', () => {
		const [exported] = buildExportQuestions([questions[0]]);
		assert.strictEqual(exported.choices.length, 3);
		assert.deepStrictEqual(
			exported.choices.map((c) => c.text).sort(),
			[...questions[0].answers].sort(),
		);
		assert.strictEqual(exported.choices.filter((c) => c.correct).length, 1);
	});

	test('the correct choice is always the first authored answer -- the source of truth for correctness', () => {
		for (let i = 0; i < 20; i++) {
			const [exported] = buildExportQuestions([questions[1]]);
			const correct = exported.choices.find((c) => c.correct);
			assert.strictEqual(correct.text, questions[1].answers[0]);
		}
	});

	test('returns an empty list for no questions', () => {
		assert.deepStrictEqual(buildExportQuestions([]), []);
	});
});
