const { test, describe } = require('node:test');
const assert = require('node:assert');

const { getParentPageSlugs } = require('../src/app/pages/PageViewContainer.tsx');
const { getPageAssetPath } = require('../src/app/pages/PageView.tsx');

describe('getParentPageSlugs', () => {
	test('returns ancestor slugs for nested pages', () => {
		assert.deepStrictEqual(getParentPageSlugs('course_dv/dv00-files/intro'), [
			'course_dv/index',
			'course_dv/dv00-files/index'
		]);
	});

	test('returns no parent slugs for root-level pages', () => {
		assert.deepStrictEqual(getParentPageSlugs('welcome'), []);
	});

	test('handles index pages by using their parent directory chain', () => {
		assert.deepStrictEqual(getParentPageSlugs('course_dv/dv00-files/index'), [
			'course_dv/index'
		]);
	});
});

describe('getPageAssetPath', () => {
	test('resolves images from the current page directory under static/pages', () => {
		assert.strictEqual(getPageAssetPath('course_dv/dv01-eda/index', 'datasaurus.jpg'), '/static/pages/course_dv/dv01-eda/datasaurus.jpg');
		assert.strictEqual(getPageAssetPath('welcome', 'hero.png'), '/static/pages/hero.png');
	});

	test('supports relative traversal for nested images', () => {
		assert.strictEqual(getPageAssetPath('course_dv/dv01-eda/index', '../shared.jpg'), '/static/pages/course_dv/shared.jpg');
	});
});
