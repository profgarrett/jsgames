// Tests for the pure helpers behind PagePractice.tsx's "Export to Blackboard" button.

const { test, describe } = require('node:test');
const assert = require('node:assert');

const {
	cleanField,
	buildMultipleChoiceRow,
	buildMatchingRows,
	buildBlackboardFile,
	blackboardFileName,
	MATCHING_PROMPT,
	MAX_MATCHING_PAIRS,
} = require('../src/app/pages/PageExportBlackboard.ts');

describe('cleanField', () => {
	test('replaces tabs and line breaks so a field cannot split a row', () => {
		assert.strictEqual(cleanField('a\tb\nc\r\nd'), 'a b c d');
	});

	test('collapses repeated whitespace and trims the ends', () => {
		assert.strictEqual(cleanField('  one   two  '), 'one two');
	});
});

describe('buildMultipleChoiceRow', () => {
	test('writes MC, the prompt, then each choice followed by correct/incorrect', () => {
		const row = buildMultipleChoiceRow({
			prompt: 'What is EDA?',
			choices: [
				{ text: 'Estimated Data Average', correct: false },
				{ text: 'Exploratory Data Analysis', correct: true },
			],
		});
		assert.strictEqual(row, 'MC\tWhat is EDA?\tEstimated Data Average\tincorrect\tExploratory Data Analysis\tcorrect');
	});
});

describe('buildMatchingRows', () => {
	const terms = [
		{ term: 'Wide data', definition: 'Values of one variable spread across columns.' },
		{ term: 'Discrete value', definition: 'A variable with a limited number of possible values.' },
	];

	test('one MAT row pairing each definition (left) with its term (right)', () => {
		assert.deepStrictEqual(buildMatchingRows(terms), [
			[
				'MAT', MATCHING_PROMPT,
				'Values of one variable spread across columns.', 'Wide data',
				'A variable with a limited number of possible values.', 'Discrete value',
			].join('\t'),
		]);
	});

	test('no terms means no matching row', () => {
		assert.deepStrictEqual(buildMatchingRows([]), []);
	});

	test('splits into parts past Blackboard\'s 100-answer limit', () => {
		const many = Array.from({ length: MAX_MATCHING_PAIRS + 1 }, (_, i) => ({ term: `T${i}`, definition: `D${i}` }));
		const rows = buildMatchingRows(many);
		assert.strictEqual(rows.length, 2);
		assert.ok(rows[0].startsWith(`MAT\t${MATCHING_PROMPT} (Part 1 of 2)\t`));
		assert.strictEqual(rows[0].split('\t').length, 2 + MAX_MATCHING_PAIRS * 2);
		assert.strictEqual(rows[1], `MAT\t${MATCHING_PROMPT} (Part 2 of 2)\tD100\tT100`);
	});
});

describe('buildBlackboardFile', () => {
	const terms = [{ term: 'Wide data', definition: 'Values of one variable spread across columns.' }];
	const questions = [
		{ prompt: 'What is EDA?', answers: ['Exploratory Data Analysis', 'Estimated Data Average', 'External Data Access'] },
		{ prompt: 'Pick the ratio variable.', answers: ['Revenue', 'Star rating', 'ZIP Code'] },
	];

	test('matching first, then one MC row per question, with no blank or trailing lines', () => {
		const lines = buildBlackboardFile(terms, questions).split('\n');
		assert.strictEqual(lines.length, 3);
		assert.ok(lines[0].startsWith('MAT\t'));
		assert.ok(lines[1].startsWith('MC\tWhat is EDA?\t'));
		assert.ok(lines[2].startsWith('MC\tPick the ratio variable.\t'));
		assert.ok(lines.every((line) => line.trim() !== ''));
	});

	test('the first authored answer is the one marked correct, wherever it is shuffled to', () => {
		for (let i = 0; i < 20; i++) {
			const fields = buildBlackboardFile([], [questions[1]]).split('\t');
			const pairs = [];
			for (let j = 2; j < fields.length; j += 2) pairs.push([fields[j], fields[j + 1]]);
			assert.deepStrictEqual(pairs.filter(([, flag]) => flag === 'correct'), [['Revenue', 'correct']]);
			assert.strictEqual(pairs.length, 3);
		}
	});

	test('empty selection produces an empty file', () => {
		assert.strictEqual(buildBlackboardFile([], []), '');
	});
});

describe('blackboardFileName', () => {
	test('turns the page slug into a safe .txt file name', () => {
		assert.strictEqual(blackboardFileName('course_dv/dv01-eda'), 'course_dv-dv01-eda-blackboard.txt');
	});

	test('drops a trailing /index so lesson pages get the lesson name', () => {
		assert.strictEqual(blackboardFileName('course_dv/dv01-eda/index'), 'course_dv-dv01-eda-blackboard.txt');
		assert.strictEqual(blackboardFileName('index'), 'quiz-blackboard.txt');
	});

	test('falls back to a generic name for an empty slug', () => {
		assert.strictEqual(blackboardFileName(''), 'quiz-blackboard.txt');
	});
});
