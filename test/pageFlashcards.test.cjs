// Tests for extractFlashcards in src/app/pages/PageFlashcards.tsx
//
// Flashcards are built from the bold-bullet term convention used across the
// course content, e.g.  - **Primary Key**: A unique identifier ...

const { test, describe } = require('node:test');
const assert = require('node:assert');

const { extractFlashcards } = require('../src/app/pages/PageFlashcards.tsx');

describe('extractFlashcards', () => {
	test('extracts a basic bold-bullet term', () => {
		const cards = extractFlashcards('- **Primary Key**: A unique identifier for each record.');
		assert.strictEqual(cards.length, 1);
		assert.strictEqual(cards[0].term, 'Primary Key');
		assert.strictEqual(cards[0].definition, 'A unique identifier for each record.');
	});

	test('accepts *, +, and indented list markers', () => {
		const md = [
			'* **Alpha**: first',
			'+ **Beta**: second',
			'  - **Gamma**: third',
		].join('\n');
		const cards = extractFlashcards(md);
		assert.deepStrictEqual(cards.map((c) => c.term), ['Alpha', 'Beta', 'Gamma']);
	});

	test('accepts a dash separator as well as a colon', () => {
		const cards = extractFlashcards('- **Schema** - the structure of the database');
		assert.strictEqual(cards.length, 1);
		assert.strictEqual(cards[0].definition, 'the structure of the database');
	});

	test('strips inline emphasis and code from the definition', () => {
		const cards = extractFlashcards('- **Float**: Non-whole numbers, e.g. `1.2`, sometimes called **double**.');
		assert.strictEqual(cards[0].definition, 'Non-whole numbers, e.g. 1.2, sometimes called double.');
	});

	test('ignores non-term bullets and prose', () => {
		const md = [
			'# Heading',
			'Some paragraph text.',
			'- A plain bullet with no bold term.',
			'- **Record**: A horizontal row in a table.',
		].join('\n');
		const cards = extractFlashcards(md);
		assert.strictEqual(cards.length, 1);
		assert.strictEqual(cards[0].term, 'Record');
	});

	test('deduplicates repeated terms (case-insensitive)', () => {
		const md = [
			'- **Field**: A single value in a record.',
			'- **field**: A duplicate that should be dropped.',
		].join('\n');
		const cards = extractFlashcards(md);
		assert.strictEqual(cards.length, 1);
		assert.strictEqual(cards[0].definition, 'A single value in a record.');
	});

	test('returns empty array for empty or termless input', () => {
		assert.deepStrictEqual(extractFlashcards(''), []);
		assert.deepStrictEqual(extractFlashcards('Just some text.'), []);
	});
});
