// Tests for appendKeyTermsSection in src/app/pages/PageFlashcards.tsx
//
// Every reading ends with a "Key Terms" section built from the same bold-bullet
// terms the flashcard deck uses, sorted alphabetically. Pages that already
// carry a Key Terms section have it rebuilt in place rather than duplicated.

const { test, describe } = require('node:test');
const assert = require('node:assert');

const { appendKeyTermsSection } = require('../src/app/pages/PageFlashcards.tsx');

/* The bullet lines of the rendered Key Terms section, in order. */
const keyTermBullets = (markdown) => {
	const lines = markdown.split('\n');
	const start = lines.findIndex((line) => /^#{1,6}\s+key\s+terms\s*$/i.test(line));
	assert.notStrictEqual(start, -1, 'expected a Key Terms heading');

	// The section runs to the next heading at the same level or higher; deeper
	// headings are part of the section.
	const level = lines[start].match(/^(#{1,6})/)[1].length;
	const bullets = [];
	for (const line of lines.slice(start + 1)) {
		const heading = line.match(/^(#{1,6})\s/);
		if (heading && heading[1].length <= level) break;
		if (/^\s*[-*+]\s/.test(line)) bullets.push(line);
	}
	return bullets;
};

const terms = (markdown) => keyTermBullets(markdown).map((line) => line.match(/\*\*([^*]+)\*\*/)[1]);

describe('appendKeyTermsSection', () => {
	test('appends a Key Terms section when the page has none', () => {
		const md = [
			'# Using Colors',
			'',
			'## Scales',
			'',
			'- **Sequential**: low to high, no middle.',
			'- **Diverging**: has a meaningful midpoint.',
		].join('\n');

		const out = appendKeyTermsSection(md);
		assert.match(out, /## Key Terms/);
		assert.deepStrictEqual(terms(out), ['Diverging', 'Sequential']);
		// The original content is untouched, and the section lands at the end.
		assert.ok(out.startsWith('# Using Colors'));
		assert.ok(out.indexOf('## Key Terms') > out.indexOf('## Scales'));
	});

	test('sorts terms alphabetically, ignoring case', () => {
		const md = [
			'- **zebra**: last.',
			'- **Apple**: first.',
			'- **mango**: middle.',
		].join('\n');

		assert.deepStrictEqual(terms(appendKeyTermsSection(md)), ['Apple', 'mango', 'zebra']);
	});

	test('returns the markdown unchanged when there are no marked terms', () => {
		const md = '# Heading\n\nSome prose and a - plain bullet.\n';
		assert.strictEqual(appendKeyTermsSection(md), md);
	});

	test('reads terms from the source markdown when one is supplied', () => {
		// PageView renders the reading copy (practice questions stripped) but
		// reads terms from the full page, so the list matches the flashcard deck.
		const source = '- **Hue**: the name of a color.\n\n## Practice Questions\n\n1. Q?\n   - a\n   - b\n';
		const reading = '- **Hue**: the name of a color.\n';

		assert.deepStrictEqual(terms(appendKeyTermsSection(reading, source)), ['Hue']);
	});

	describe('when the page already has a Key Terms section', () => {
		const authored = [
			'# Data',
			'',
			'## Body',
			'',
			'- **Primary key**: uniquely identifies a row in its own table.',
			'',
			'## Key terms',
			'',
			'- **Primary key**: uniquely identifies a row in its own table.',
			'- **Foreign key**: identifies a row in another table.',
			'',
			'## After',
			'',
			'Closing prose.',
		].join('\n');

		test('rebuilds it in place rather than adding a second one', () => {
			const out = appendKeyTermsSection(authored);
			assert.strictEqual(out.match(/^#{1,6}\s+key\s+terms\s*$/gim).length, 1);
			// The author's own capitalisation of the heading is preserved.
			assert.match(out, /## Key terms/);
		});

		test('does not duplicate a term that is also defined in the body', () => {
			const out = appendKeyTermsSection(authored);
			assert.deepStrictEqual(terms(out), ['Foreign key', 'Primary key']);
		});

		test('leaves the content that follows the section alone', () => {
			const out = appendKeyTermsSection(authored);
			assert.match(out, /## After\n\nClosing prose\./);
			assert.ok(out.indexOf('## After') > out.indexOf('## Key terms'));
		});

		test('keeps prose and unparsable bullets that live in the section', () => {
			const md = [
				'## Key terms',
				'',
				'Learn these before the exam.',
				'',
				'- **Folder** (or **directory**): a container that holds files.',
				'- **Terminal**: where you type commands.',
			].join('\n');

			const out = appendKeyTermsSection(md);
			assert.match(out, /Learn these before the exam\./);
			assert.match(out, /- \*\*Folder\*\* \(or \*\*directory\*\*\): a container that holds files\./);
			// Only the bullet the parser can read is regenerated.
			assert.deepStrictEqual(terms(out), ['Folder', 'Terminal']);
		});

		test('a deeper heading inside the section does not end it', () => {
			const md = [
				'## Key terms',
				'',
				'### Scales',
				'',
				'- **Sequential**: low to high.',
				'',
				'## Next',
			].join('\n');

			const out = appendKeyTermsSection(md);
			assert.strictEqual(out.match(/^#{1,6}\s+key\s+terms\s*$/gim).length, 1);
			assert.match(out, /### Scales/);
			assert.deepStrictEqual(terms(out), ['Sequential']);
		});

		test('is idempotent', () => {
			const once = appendKeyTermsSection(authored);
			assert.strictEqual(appendKeyTermsSection(once), once);
		});
	});
});
