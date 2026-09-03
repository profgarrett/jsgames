// Tests for the multi-module practice helpers in src/app/pages/PageModuleLinks.ts
//
// These back the "which modules should this practice session pull from?"
// screen: given the page a student is reading, find the course-level hub
// page above it (e.g. course_ais/index) and every lesson it links to that
// lives under the same path (e.g. course_ais/excel01-input-formats/index).

const { test, describe } = require('node:test');
const assert = require('node:assert');

const {
	getModuleScope,
	resolvePageLinkSlug,
	extractModuleLinks,
	buildModuleLinkList,
} = require('../src/app/pages/PageModuleLinks.ts');

describe('getModuleScope', () => {
	test('uses the top-level course index as the root for a lesson page, but is not itself a hub', () => {
		const scope = getModuleScope('course_ais/excel01-input-formats/index');
		assert.strictEqual(scope.rootSlug, 'course_ais/index');
		assert.strictEqual(scope.pathPrefix, 'course_ais');
		assert.strictEqual(scope.isHub, false);
	});

	test('uses the topmost ancestor for a page nested three levels deep, but is not itself a hub', () => {
		const scope = getModuleScope('course_dv/sql01-introduction/whydb/index');
		assert.strictEqual(scope.rootSlug, 'course_dv/index');
		assert.strictEqual(scope.pathPrefix, 'course_dv');
		assert.strictEqual(scope.isHub, false);
	});

	test('a lesson\'s immediate parent hub page is also not itself a hub of a hub', () => {
		const scope = getModuleScope('course_dv/sql01-introduction/index');
		assert.strictEqual(scope.rootSlug, 'course_dv/index');
		assert.strictEqual(scope.isHub, false);
	});

	test('a course hub page viewed directly is its own root and is a hub', () => {
		const scope = getModuleScope('course_ais/index');
		assert.strictEqual(scope.rootSlug, 'course_ais/index');
		assert.strictEqual(scope.pathPrefix, 'course_ais');
		assert.strictEqual(scope.isHub, true);
	});

	test('finds no scope, and is not a hub, for a standalone top-level page', () => {
		const scope = getModuleScope('welcome');
		assert.strictEqual(scope.rootSlug, 'welcome');
		assert.strictEqual(scope.pathPrefix, '');
		assert.strictEqual(scope.isHub, false);
	});
});

describe('resolvePageLinkSlug', () => {
	test('resolves a relative link against the directory of the source page', () => {
		assert.strictEqual(
			resolvePageLinkSlug('course_ais/index', 'excel01-input-formats/index'),
			'course_ais/excel01-input-formats/index',
		);
	});

	test('resolves an absolute /pages/ link', () => {
		assert.strictEqual(
			resolvePageLinkSlug('course_dv/index', '/pages/course_ais/okta/index'),
			'course_ais/okta/index',
		);
	});

	test('returns null for an external link', () => {
		assert.strictEqual(resolvePageLinkSlug('course_dv/index', 'https://example.com/x'), null);
	});

	test('returns null for an in-page anchor', () => {
		assert.strictEqual(resolvePageLinkSlug('course_dv/index', '#section'), null);
	});

	test('returns null for a link to a datafile or other asset', () => {
		assert.strictEqual(resolvePageLinkSlug('course_ais/excel01-input-formats/index', 'file01-input-formats.xlsx'), null);
		assert.strictEqual(resolvePageLinkSlug('course_model/ml01-modeling-gems/index', 'template.ipynb'), null);
	});

	test('returns null for some other absolute route', () => {
		assert.strictEqual(resolvePageLinkSlug('course_dv/index', '/static/pages/course_dv/shared.jpg'), null);
	});

	test('strips a trailing .md extension', () => {
		assert.strictEqual(
			resolvePageLinkSlug('course_ais/index', 'excel01-input-formats/index.md'),
			'course_ais/excel01-input-formats/index',
		);
	});
});

describe('extractModuleLinks', () => {
	const COURSE_AIS_INDEX = [
		'# Accounting Information Systems Textbook',
		'',
		'## Module 1: Excel Core Skills',
		'',
		'- [file00](file00-setup/index): Set up your computer',
		'- [Okta](okta/index): Set up Okta for fingerprint reader',
		'- [excel01](excel01-input-formats/index): Inputting data and basic formatting',
		'- [excel03](excel03-functions/index): Functions',
		'- [excel04](excel04-tables/index): Tables, XLookup, and PivotTables',
		'',
		'See the [syllabus](https://example.com/syllabus) for more.',
		'',
		'![diagram](diagram.png)',
	].join('\n');

	test('finds every linked module under the root\'s path, with its link text, in order', () => {
		const links = extractModuleLinks(COURSE_AIS_INDEX, 'course_ais/index', 'course_ais');
		assert.deepStrictEqual(links, [
			{ slug: 'course_ais/file00-setup/index', title: 'file00' },
			{ slug: 'course_ais/okta/index', title: 'Okta' },
			{ slug: 'course_ais/excel01-input-formats/index', title: 'excel01' },
			{ slug: 'course_ais/excel03-functions/index', title: 'excel03' },
			{ slug: 'course_ais/excel04-tables/index', title: 'excel04' },
		]);
	});

	test('ignores external links, images, and out-of-scope absolute links', () => {
		const md = [
			'- [Okta](/pages/course_ais/okta/index) elsewhere',
			'- [External](https://example.com)',
			'![Diagram](diagram.png)',
		].join('\n');
		const links = extractModuleLinks(md, 'course_dv/index', 'course_dv');
		assert.deepStrictEqual(links, []);
	});

	test('deduplicates repeated links to the same module, keeping the first link\'s text', () => {
		const md = [
			'- [excel01](excel01-input-formats/index): Intro',
			'- Also see [excel01 again](excel01-input-formats/index)',
		].join('\n');
		const links = extractModuleLinks(md, 'course_ais/index', 'course_ais');
		assert.deepStrictEqual(links, [{ slug: 'course_ais/excel01-input-formats/index', title: 'excel01' }]);
	});

	test('falls back to the slug when the link text is empty', () => {
		const md = '- [](excel01-input-formats/index)';
		const links = extractModuleLinks(md, 'course_ais/index', 'course_ais');
		assert.deepStrictEqual(links, [{ slug: 'course_ais/excel01-input-formats/index', title: 'course_ais/excel01-input-formats/index' }]);
	});

	test('returns an empty array when there is no path prefix to scope to', () => {
		assert.deepStrictEqual(extractModuleLinks(COURSE_AIS_INDEX, 'welcome', ''), []);
	});

	test('returns an empty array for empty markdown', () => {
		assert.deepStrictEqual(extractModuleLinks('', 'course_ais/index', 'course_ais'), []);
	});
});

describe('buildModuleLinkList', () => {
	test('puts the current page first, followed by the linked modules', () => {
		const list = buildModuleLinkList(
			{ slug: 'course_ais/excel01-input-formats/index', title: 'Inputting data and basic formatting' },
			[
				{ slug: 'course_ais/file00-setup/index', title: 'file00' },
				{ slug: 'course_ais/excel01-input-formats/index', title: 'excel01' },
				{ slug: 'course_ais/excel03-functions/index', title: 'excel03' },
			],
		);
		assert.deepStrictEqual(list, [
			{ slug: 'course_ais/excel01-input-formats/index', title: 'Inputting data and basic formatting' },
			{ slug: 'course_ais/file00-setup/index', title: 'file00' },
			{ slug: 'course_ais/excel03-functions/index', title: 'excel03' },
		]);
	});

	test('drops a duplicate link to the current page, keeping the current page\'s own title', () => {
		const list = buildModuleLinkList(
			{ slug: 'course_ais/index', title: 'AIS Textbook' },
			[{ slug: 'course_ais/index', title: 'home' }],
		);
		assert.deepStrictEqual(list, [{ slug: 'course_ais/index', title: 'AIS Textbook' }]);
	});

	test('returns just the current page when there are no other links', () => {
		const list = buildModuleLinkList({ slug: 'welcome', title: 'Welcome' }, []);
		assert.deepStrictEqual(list, [{ slug: 'welcome', title: 'Welcome' }]);
	});
});
