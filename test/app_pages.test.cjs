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
		assert.strictEqual(is_valid_slug('/etc/passwd'), false);
		assert.strictEqual(is_valid_slug('Welcome'), false); // uppercase
		assert.strictEqual(is_valid_slug('foo.md'), false);   // dot
		assert.strictEqual(is_valid_slug(''), false);
	});

	test('accepts nested slugs inside pages folders', () => {
		assert.strictEqual(is_valid_slug('course_dv/dv00-files/index'), true);
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
	test('lists markdown pages, sorted by title', () => {
		const pages = list_pages();
		assert.ok(pages.length > 0, 'expected at least one page');

		// Every entry is a usable slug (no .md suffix, no leading slash).
		for (const p of pages) {
			assert.ok(is_valid_slug(p.slug), `invalid slug: ${p.slug}`);
			assert.ok(!p.slug.endsWith('.md'), `slug kept extension: ${p.slug}`);
			assert.ok(typeof p.title === 'string' && p.title.length > 0);
		}

		const titles = pages.map((p) => p.title);
		const sorted = [...titles].sort((a, b) => a.localeCompare(b));
		assert.deepStrictEqual(titles, sorted);
	});

	test('includes nested pages from subfolders', () => {
		const pages = list_pages();
		assert.ok(
			pages.some((p) => p.slug.includes('/')),
			'expected at least one nested page slug'
		);
	});
});

describe('read_page', () => {
	test('returns markdown and title for a listed slug', () => {
		// Drive off list_pages() rather than a hardcoded page so content
		// changes in static/pages do not break this test.
		const [first] = list_pages();
		assert.ok(first, 'expected at least one page to read');

		const page = read_page(first.slug);
		assert.notStrictEqual(page, null);
		assert.strictEqual(page.slug, first.slug);
		assert.strictEqual(page.title, first.title);
		assert.ok(page.markdown.length > 0);
	});

	test('returns null for an unknown slug', () => {
		assert.strictEqual(read_page('does-not-exist'), null);
	});

	test('returns markdown for a nested page slug', () => {
		const nested = list_pages().find((p) => p.slug.includes('/'));
		assert.ok(nested, 'expected at least one nested page');

		const page = read_page(nested.slug);
		assert.notStrictEqual(page, null);
		assert.strictEqual(page.slug, nested.slug);
		assert.ok(page.markdown.length > 0);
	});

	test('ignores a trailing .md extension when reading page paths', () => {
		const nested = list_pages().find((p) => p.slug.includes('/'));
		assert.ok(nested, 'expected at least one nested page');

		const page = read_page(nested.slug + '.md');
		assert.notStrictEqual(page, null);
		assert.strictEqual(page.slug, nested.slug);
		assert.ok(page.markdown.length > 0);
	});

	test('returns null for a traversal attempt instead of file contents', () => {
		assert.strictEqual(read_page('../server/app'), null);
		assert.strictEqual(read_page('../../package'), null);
	});
});
