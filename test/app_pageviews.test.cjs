// Tests for src/server/app_pageviews.ts
//
// Exercises the pure sanitize_page helper that guards the pageview create
// route. The DB-touching routes are integration-tested separately; here we
// verify the input normalization that runs before any query.

const { test, describe } = require('node:test');
const assert = require('node:assert');

const {
	sanitize_page,
	MAX_PAGE_LENGTH,
} = require('../src/server/app_pageviews.ts');

describe('sanitize_page', () => {
	test('accepts and trims a normal path', () => {
		assert.strictEqual(sanitize_page('/pages/intro'), '/pages/intro');
		assert.strictEqual(sanitize_page('  /ifgame  '), '/ifgame');
	});

	test('rejects missing or empty values', () => {
		assert.strictEqual(sanitize_page(undefined), null);
		assert.strictEqual(sanitize_page(null), null);
		assert.strictEqual(sanitize_page(''), null);
		assert.strictEqual(sanitize_page('   '), null);
	});

	test('rejects non-string values', () => {
		assert.strictEqual(sanitize_page(42), null);
		assert.strictEqual(sanitize_page({}), null);
		assert.strictEqual(sanitize_page(['/x']), null);
	});

	test('caps length at the column width', () => {
		const long = '/' + 'a'.repeat(MAX_PAGE_LENGTH + 50);
		const result = sanitize_page(long);
		assert.strictEqual(result.length, MAX_PAGE_LENGTH);
	});
});
