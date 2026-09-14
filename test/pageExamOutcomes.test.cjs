// Tests for the exam-review {{lesson-name}} helpers in
// src/app/pages/PageExamOutcomes.ts.
//
// Exam review pages (title starting with "Exam") write {{dv00-files}} in
// their markdown; the reading view turns each of those into a 3rd-level
// heading, the referenced lesson's Outcomes bullets, and a link to that
// lesson -- see static/pages/course_dv/dv00-files/index.md for a real
// Outcomes block and the uploaded exam1 example this feature was built for.

const { test, describe } = require('node:test');
const assert = require('node:assert');

const {
	isExamReviewPage,
	extractExamOutcomeRefs,
	resolveExamOutcomeSlug,
	extractOutcomesBullets,
	buildExamOutcomeMarkdown,
	substituteExamOutcomeRefs,
} = require('../src/app/pages/PageExamOutcomes.ts');

describe('isExamReviewPage', () => {
	test('matches a plain "Exam" title', () => {
		assert.strictEqual(isExamReviewPage('Exam 1 Review'), true);
	});

	test('is case-insensitive', () => {
		assert.strictEqual(isExamReviewPage('exam 2 review'), true);
	});

	test('does not match a title that merely contains the word "Exam"', () => {
		assert.strictEqual(isExamReviewPage('Take-Home Exam'), false);
	});

	test('does not match "Example", which merely starts with the same letters', () => {
		assert.strictEqual(isExamReviewPage('Example Page'), false);
	});

	test('handles an empty/undefined title', () => {
		assert.strictEqual(isExamReviewPage(''), false);
	});
});

describe('extractExamOutcomeRefs', () => {
	test('finds every {{ref}} in order', () => {
		const md = '# Exam 1 Review\n\n{{dv00-files}}\n\n{{dv01-eda}}\n\n{{dv20-data}}\n';
		assert.deepStrictEqual(extractExamOutcomeRefs(md), ['dv00-files', 'dv01-eda', 'dv20-data']);
	});

	test('dedupes repeated refs, keeping first-seen order', () => {
		const md = '{{dv00-files}}\n\nSome text.\n\n{{dv01-eda}}\n\n{{dv00-files}}\n';
		assert.deepStrictEqual(extractExamOutcomeRefs(md), ['dv00-files', 'dv01-eda']);
	});

	test('trims whitespace inside the braces', () => {
		assert.deepStrictEqual(extractExamOutcomeRefs('{{ dv00-files }}'), ['dv00-files']);
	});

	test('returns [] when there are no refs', () => {
		assert.deepStrictEqual(extractExamOutcomeRefs('# Exam 1 Review\n\nNo refs here.'), []);
	});
});

describe('resolveExamOutcomeSlug', () => {
	test('resolves a bare ref against the exam page\'s own course', () => {
		assert.strictEqual(
			resolveExamOutcomeSlug('course_dv/exams/exam1', 'dv00-files'),
			'course_dv/dv00-files/index',
		);
	});

	test('resolves for an exam page one level deeper too', () => {
		assert.strictEqual(
			resolveExamOutcomeSlug('course_ais/exams/exam1', 'excel01-input-formats'),
			'course_ais/excel01-input-formats/index',
		);
	});

	test('treats a ref containing a slash as an explicit slug', () => {
		assert.strictEqual(
			resolveExamOutcomeSlug('course_dv/exams/exam1', 'course_ais/excel01-input-formats'),
			'course_ais/excel01-input-formats/index',
		);
	});

	test('does not double up an explicit trailing /index', () => {
		assert.strictEqual(
			resolveExamOutcomeSlug('course_dv/exams/exam1', 'course_dv/dv00-files/index'),
			'course_dv/dv00-files/index',
		);
	});
});

describe('extractOutcomesBullets', () => {
	test('reads bullets out of a real Outcomes block', () => {
		const md = [
			'# Working with files',
			'',
			'Some intro text.',
			'',
			'**Outcomes**:',
			'',
			'- Organize your files into folders',
			'- Avoid problems with OneDrive',
			'- Move files between folders',
			'',
			'## Organizing your files',
			'',
			'More text.',
		].join('\n');

		assert.deepStrictEqual(extractOutcomesBullets(md), [
			'Organize your files into folders',
			'Avoid problems with OneDrive',
			'Move files between folders',
		]);
	});

	test('accepts "Outcomes:" without bold markers', () => {
		const md = 'Outcomes:\n\n- One\n- Two\n';
		assert.deepStrictEqual(extractOutcomesBullets(md), ['One', 'Two']);
	});

	test('accepts the colon inside the bold markers', () => {
		const md = '**Outcomes:**\n\n- One\n';
		assert.deepStrictEqual(extractOutcomesBullets(md), ['One']);
	});

	test('returns [] when there is no Outcomes block', () => {
		assert.deepStrictEqual(extractOutcomesBullets('# A page\n\nJust some prose.'), []);
	});

	test('skips intro prose between the marker and the list (dv20-data\'s convention)', () => {
		const md = [
			'# Understanding Your Data',
			'',
			'**Outcomes**',
			'',
			'After completing this module, you should be able to:',
			'',
			'* Identify a field\'s storage type',
			'* Define primary, foreign, and composite keys',
		].join('\n');

		assert.deepStrictEqual(extractOutcomesBullets(md), [
			"Identify a field's storage type",
			'Define primary, foreign, and composite keys',
		]);
	});

	test('gives up if a heading is reached before any bullet', () => {
		const md = '**Outcomes**:\n\nSome prose with no list at all.\n\n## Next section\n\n- Not an outcome\n';
		assert.deepStrictEqual(extractOutcomesBullets(md), []);
	});

	test('stops at the first blank line after the list', () => {
		const md = '**Outcomes**:\n\n- One\n- Two\n\nUnrelated paragraph mentioning bullets:\n- Not part of the list\n';
		assert.deepStrictEqual(extractOutcomesBullets(md), ['One', 'Two']);
	});
});

describe('buildExamOutcomeMarkdown', () => {
	test('renders a loading placeholder when no result is available yet', () => {
		const out = buildExamOutcomeMarkdown('dv00-files', undefined);
		assert.match(out, /^### dv00-files/);
		assert.match(out, /Loading/);
	});

	test('renders an error note when the referenced page could not be found', () => {
		const out = buildExamOutcomeMarkdown('dv00-files', { slug: 'course_dv/dv00-files/index', title: null, outcomes: [], notFound: true });
		assert.match(out, /^### dv00-files/);
		assert.match(out, /Could not load/);
	});

	test('renders the heading, bullets, and a link when the page resolved', () => {
		const out = buildExamOutcomeMarkdown('dv00-files', {
			slug: 'course_dv/dv00-files/index',
			title: 'Working with files',
			outcomes: ['Organize your files into folders', 'Avoid problems with OneDrive'],
			notFound: false,
		});

		assert.match(out, /^### dv00-files/);
		assert.match(out, /- Organize your files into folders/);
		assert.match(out, /- Avoid problems with OneDrive/);
		assert.match(out, /\[Working with files.*\]\(\/pages\/course_dv\/dv00-files\/index\)/);
	});

	test('still links to the page when it has no Outcomes block of its own', () => {
		const out = buildExamOutcomeMarkdown('dv00-files', {
			slug: 'course_dv/dv00-files/index',
			title: 'Working with files',
			outcomes: [],
			notFound: false,
		});

		assert.doesNotMatch(out, /^- /m);
		assert.match(out, /\/pages\/course_dv\/dv00-files\/index/);
	});
});

describe('substituteExamOutcomeRefs', () => {
	test('replaces every {{ref}} using the results map', () => {
		const md = '# Exam 1 Review\n\n{{dv00-files}}\n\n{{dv01-eda}}\n';
		const results = new Map([
			['dv00-files', { slug: 'course_dv/dv00-files/index', title: 'Working with files', outcomes: ['A'], notFound: false }],
		]);

		const out = substituteExamOutcomeRefs(md, results);

		assert.match(out, /### dv00-files/);
		assert.match(out, /- A/);
		assert.match(out, /### dv01-eda/);
		assert.match(out, /Loading/); // dv01-eda has no entry yet
		assert.doesNotMatch(out, /\{\{/);
	});
});
