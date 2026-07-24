// Tests for src/server/app_pages.ts
//
// Exercises the pure helpers behind the Pages module: slug validation (which
// is also the path-traversal guard), title extraction, listing, and reading.

const { test, describe } = require('node:test');
const assert = require('node:assert');

const {
	is_valid_slug,
	extract_title,
	list_pages,
	read_page,
} = require('../src/server/app_pages.ts');

describe('is_valid_slug', () => {
	test('accepts lowercase, digits, and hyphens', () => {
		assert.strictEqual(is_valid_slug('getting-started'), true);
		assert.strictEqual(is_valid_slug('welcome'), true);
		assert.strictEqual(is_valid_slug('page-2'), true);
	});

	test('rejects path traversal and unsafe characters', () => {
		assert.strictEqual(is_valid_slug('../secret'), false);
		assert.strictEqual(is_valid_slug('..'), false);
		assert.strictEqual(is_valid_slug('a/b'), false);
		assert.strictEqual(is_valid_slug('/etc/passwd'), false);
		assert.strictEqual(is_valid_slug('Welcome'), false); // uppercase
		assert.strictEqual(is_valid_slug('foo.md'), false);   // dot
		assert.strictEqual(is_valid_slug(''), false);
	});
});

describe('extract_title', () => {
	test('uses the first H1', () => {
		assert.strictEqual(extract_title('# Hello World\n\ntext', 'x'), 'Hello World');
	});

	test('falls back to the slug when no H1 is present', () => {
		assert.strictEqual(extract_title('no heading here', 'my-slug'), 'my-slug');
	});

	test('ignores H2 and deeper', () => {
		assert.strictEqual(extract_title('## Subheading\n# Real Title', 'x'), 'Real Title');
	});
});

describe('list_pages', () => {
	test('includes the sample pages, sorted by title', () => {
		const pages = list_pages();
		const slugs = pages.map((p) => p.slug);
		assert.ok(slugs.includes('welcome'), 'expected welcome page');
		assert.ok(slugs.includes('getting-started'), 'expected getting-started page');

		const titles = pages.map((p) => p.title);
		const sorted = [...titles].sort((a, b) => a.localeCompare(b));
		assert.deepStrictEqual(titles, sorted);
	});
});

describe('read_page', () => {
	test('returns markdown and title for a known slug', () => {
		const page = read_page('welcome');
		assert.notStrictEqual(page, null);
		assert.strictEqual(page.slug, 'welcome');
		assert.strictEqual(page.title, 'Welcome');
		assert.ok(page.markdown.length > 0);
	});

	test('returns null for an unknown slug', () => {
		assert.strictEqual(read_page('does-not-exist'), null);
	});

	test('returns null for a traversal attempt instead of file contents', () => {
		assert.strictEqual(read_page('../server/app'), null);
		assert.strictEqual(read_page('../../package'), null);
	});
});
