// Tests for the book-style reading layout helpers in src/app/pages/PageBookHub.ts
// and removeOutcomesBlock in src/app/pages/PageExamOutcomes.ts.
//
// A course hub page (course_dv/index, course_ais/index, ...) is read as the
// book's table of contents: "## Module" headings become sections, "### Week"
// headings become groups, and bulleted lesson links become chapters.

const { test, describe } = require('node:test');
const assert = require('node:assert');

const {
	getChapterCode,
	parseBookHub,
	findChapterContext,
	extractTitle,
	sameSlug,
} = require('../src/app/pages/PageBookHub.ts');
const { removeOutcomesBlock, extractOutcomesBullets } = require('../src/app/pages/PageExamOutcomes.ts');

const DV_HUB = `# Business Analytics Textbook

**Nathan Garrett, PhD CPA**

<!----
# Data Viz Study Notes
- [hidden](dv99-hidden/index)
---->

This course introduces students to data analysis.

## Module 1: Data Visualization

### Week 1 - August 17, 2026

- [Okta](/pages/course_ais/okta/index) Sign in with a laptop fingerprint reader
- [dv00. File management](dv00-files/index)
- [dv01. EDA process](dv01-eda/index)

Optional Reading:

- [High Income skills](https://ofdollarsanddata.com/high-income-skills/)

### Week 3 - August 31, 2026

- *DataCamp: Introduction to Tableau, Part 1*
- [dv40. Colors](dv40-colors/index)
- [dv45. Presentation](dv45-presentations/index)

## Module 2: Tableau

See [dv40](dv40-colors/index) again before starting.

- [tb01. Interface](tb01-interface/index)

## Further Resources

- [ColorBrewer](https://colorbrewer2.org/)
`;

const AIS_HUB = `# Accounting Information Systems Textbook

## Module 1: Excel Core Skills

### Week 2 - August 24, 2026

- [excel01](excel01-input-formats/index): Inputting data and basic formatting
<!-- - [excel08](excel08-charts2/index): Charts Part 2 -->

## Module 2: AIS Overview & SDLC

- [AIS Chapter 8](ais08-fraud/index): Fraud and Errors
`;

describe('getChapterCode', () => {
	test('reads the code and number from the lesson folder', () => {
		assert.deepStrictEqual(getChapterCode('course_dv/dv40-colors/index'), { code: 'dv40', number: '40' });
	});

	test('drops leading zeros from the number', () => {
		assert.deepStrictEqual(getChapterCode('course_ais/ais08-fraud/index'), { code: 'ais08', number: '8' });
		assert.deepStrictEqual(getChapterCode('course_ais/excel01-input-formats'), { code: 'excel01', number: '1' });
	});

	test('a page nested inside a lesson uses that lesson\'s code', () => {
		assert.deepStrictEqual(getChapterCode('course_dv/sql01-introduction/whydb/index'), { code: 'sql01', number: '1' });
	});

	test('hub, exam and unnumbered pages have no chapter code', () => {
		assert.strictEqual(getChapterCode('course_dv/index'), null);
		assert.strictEqual(getChapterCode('course_dv/exams/exam2'), null);
		assert.strictEqual(getChapterCode('course_ais/okta/index'), null);
		assert.strictEqual(getChapterCode('about'), null);
		assert.strictEqual(getChapterCode(''), null);
	});
});

describe('parseBookHub', () => {
	const hub = parseBookHub(DV_HUB, 'course_dv/index', 'course_dv');

	test('uses the hub H1 as the book title', () => {
		assert.strictEqual(hub.title, 'Business Analytics Textbook');
	});

	test('splits module headings into kicker and name, dropping modules with no lessons', () => {
		assert.deepStrictEqual(
			hub.sections.map((s) => [s.kicker, s.name]),
			[['Module 1', 'Data Visualization'], ['Module 2', 'Tableau']],
		);
	});

	test('lists only bulleted links to pages in this course, in order, without repeats', () => {
		assert.deepStrictEqual(
			hub.sections[0].chapters.map((c) => c.slug),
			['course_dv/dv00-files/index', 'course_dv/dv01-eda/index', 'course_dv/dv40-colors/index', 'course_dv/dv45-presentations/index'],
		);
		// The paragraph link to dv40 under Module 2 is ignored; only the bullet counts.
		assert.deepStrictEqual(hub.sections[1].chapters.map((c) => c.slug), ['course_dv/tb01-interface/index']);
	});

	test('ignores links inside HTML comments', () => {
		const all = hub.sections.flatMap((s) => s.chapters.map((c) => c.slug));
		assert.ok(!all.includes('course_dv/dv99-hidden/index'));
	});

	test('strips the leading code from link text and records the week group', () => {
		const colors = hub.sections[0].chapters[2];
		assert.strictEqual(colors.code, 'dv40');
		assert.strictEqual(colors.title, 'Colors');
		assert.strictEqual(colors.group, 'Week 3');
	});

	test('drops dates from week headings in their common forms', () => {
		const md = [
			'## Module 1: Dates',
			'### Week 1 - August 17, 2026', '- [a](a1-x/index)',
			'### Week 2 (Aug. 24)', '- [b](b2-x/index)',
			'### Week 3: 8/31/2026', '- [c](c3-x/index)',
			'### Week 4, September 7', '- [d](d4-x/index)',
			'### Review week', '- [e](e5-x/index)',
			'### August 17, 2026', '- [f](f6-x/index)',
		].join('\n');
		const groups = parseBookHub(md, 'course_x/index', 'course_x').sections[0].chapters.map((c) => c.group);
		assert.deepStrictEqual(groups, ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Review week', 'August 17, 2026']);
	});

	test('prefers the description after the link when there is one', () => {
		const ais = parseBookHub(AIS_HUB, 'course_ais/index', 'course_ais');
		assert.deepStrictEqual(
			ais.sections.map((s) => s.chapters.map((c) => [c.code, c.title])),
			[[['excel01', 'Inputting data and basic formatting']], [['ais08', 'Fraud and Errors']]],
		);
		assert.strictEqual(ais.sections[1].name, 'AIS Overview & SDLC');
	});

	test('returns an empty book for empty input or no course folder', () => {
		assert.deepStrictEqual(parseBookHub('', 'course_dv/index', 'course_dv').sections, []);
		assert.deepStrictEqual(parseBookHub(DV_HUB, 'about', '').sections, []);
	});
});

describe('findChapterContext', () => {
	const hub = parseBookHub(DV_HUB, 'course_dv/index', 'course_dv');

	test('finds the module and neighbouring chapters', () => {
		const context = findChapterContext(hub, 'course_dv/dv40-colors/index');
		assert.strictEqual(context.sectionIndex, 0);
		assert.strictEqual(context.previous.slug, 'course_dv/dv01-eda/index');
		assert.strictEqual(context.next.slug, 'course_dv/dv45-presentations/index');
	});

	test('matches slugs written without /index, and runs across module boundaries', () => {
		const context = findChapterContext(hub, 'course_dv/dv45-presentations');
		assert.strictEqual(context.next.slug, 'course_dv/tb01-interface/index');
	});

	test('first and last chapters have no previous / next', () => {
		assert.strictEqual(findChapterContext(hub, 'course_dv/dv00-files/index').previous, null);
		assert.strictEqual(findChapterContext(hub, 'course_dv/tb01-interface/index').next, null);
	});

	test('returns null for pages not in the hub, or no hub', () => {
		assert.strictEqual(findChapterContext(hub, 'course_dv/index'), null);
		assert.strictEqual(findChapterContext(null, 'course_dv/dv40-colors/index'), null);
	});
});

describe('sameSlug', () => {
	test('ignores a trailing /index', () => {
		assert.ok(sameSlug('course_dv/dv40-colors/index', 'course_dv/dv40-colors'));
		assert.ok(!sameSlug('course_dv/dv40-colors', 'course_dv/dv45-presentations'));
	});
});

describe('extractTitle', () => {
	test('splits off the first H1', () => {
		const { title, body } = extractTitle('<script src="/x.js"></script>\n\n# Using Colors\n\nIntro text.\n\n## Section');
		assert.strictEqual(title, 'Using Colors');
		assert.strictEqual(body, '<script src="/x.js"></script>\n\n\nIntro text.\n\n## Section');
	});

	test('skips # comments in fenced code and headings in HTML comments', () => {
		const md = '<!--\n# Old title\n-->\n```python\n# a comment\n```\n# Real Title\nText';
		assert.strictEqual(extractTitle(md).title, 'Real Title');
	});

	test('returns the markdown unchanged when there is no H1', () => {
		assert.deepStrictEqual(extractTitle('## Only a section\nText'), { title: null, body: '## Only a section\nText' });
	});
});

describe('removeOutcomesBlock', () => {
	test('removes the marker and its list, keeping what follows', () => {
		const md = '# Title\n\n**Outcomes**:\n\n- One\n- Two\n\n**Links**\n- [Slides](x)\n';
		assert.strictEqual(removeOutcomesBlock(md), '# Title\n\n\n**Links**\n- [Slides](x)\n');
	});

	test('removes intro prose between the marker and the list', () => {
		const md = '**Outcomes**\n\nAfter completing this module, you should be able to:\n\n- One\n\n## Next';
		assert.strictEqual(removeOutcomesBlock(md), '\n## Next');
		assert.deepStrictEqual(extractOutcomesBullets(md), ['One']);
	});

	test('leaves markdown alone when there is no list under the marker', () => {
		const md = '**Outcomes**:\n\n## Section\n- not an outcome';
		assert.strictEqual(removeOutcomesBlock(md), md);
		assert.strictEqual(removeOutcomesBlock('no outcomes here'), 'no outcomes here');
	});
});
