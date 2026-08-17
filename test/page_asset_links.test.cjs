/*
	Links to local files (notebook templates, datafiles, Word exercises) have to be
	rewritten into /static/pages/... URLs before they reach the browser.

	Left relative, the browser resolves them against the page route
	(/pages/course_model/...) instead, and app_pages.ts rejects any slug
	containing a '.', so every asset link on the site 404s.
*/
const { test, describe } = require('node:test');
const assert = require('node:assert');

const { convert_asset_links_by_adding_folder_path } = require('../src/app/pages/PageView.tsx');

const convert = convert_asset_links_by_adding_folder_path;
const SLUG = 'course_model/ml01-modeling-gems/index';

describe('convert_asset_links_by_adding_folder_path', () => {

	test('rewrites a notebook template to its static path', () => {
		assert.strictEqual(
			convert('[Template](template.ipynb)', SLUG),
			'[Template](/static/pages/course_model/ml01-modeling-gems/template.ipynb)'
		);
	});

	test('rewrites datafiles and office documents', () => {
		assert.strictEqual(
			convert('[data](statelife.csv) and [states](StateDemographics2.xlsx)', SLUG),
			'[data](/static/pages/course_model/ml01-modeling-gems/statelife.csv)'
			+ ' and [states](/static/pages/course_model/ml01-modeling-gems/StateDemographics2.xlsx)'
		);

		assert.strictEqual(
			convert('[Predict outcomes](predict_outcomes_inclass.docx)', SLUG),
			'[Predict outcomes](/static/pages/course_model/ml01-modeling-gems/predict_outcomes_inclass.docx)'
		);
	});

	test('rewrites back-to-back links without swallowing the second', () => {
		assert.strictEqual(
			convert('[a](x.csv)[b](y.csv)', SLUG),
			'[a](/static/pages/course_model/ml01-modeling-gems/x.csv)'
			+ '[b](/static/pages/course_model/ml01-modeling-gems/y.csv)'
		);
	});

	test('resolves paths relative to the page directory, including traversal', () => {
		assert.strictEqual(
			convert('[shared](../shared.csv)', SLUG),
			'[shared](/static/pages/course_model/shared.csv)'
		);
	});

	// Markdown links are page routes. normalize_slug() on the server strips the
	// '.md', so they already resolve; rewriting them would break navigation.
	test('leaves markdown page links relative', () => {
		const md = '[py00](py00-setup/index.md)';
		assert.strictEqual(convert(md, 'course_model/index'), md);
	});

	test('leaves absolute, external and anchor links alone', () => {
		for (const md of [
			'[Quizlet](https://quizlet.com/1123323618/ml01-flash-cards/)',
			'[insecure](http://example.com/a.csv)',
			'[rooted](/static/pages/course_model/already.csv)',
			'[mail](mailto:profgarrett@gmail.com)',
			'[anchor](#key-terms)',
		]) {
			assert.strictEqual(convert(md, SLUG), md);
		}
	});

	// index.md links a bare directory and a slug with no extension. Neither is an
	// asset, and rewriting them would turn a broken link into a differently
	// broken one.
	test('leaves extensionless targets alone', () => {
		for (const md of [
			'[ml02](ml02-data-and-distributions/)',
			'[How to think](how-to-think-like-a-data-scientist)',
		]) {
			assert.strictEqual(convert(md, 'course_model/index'), md);
		}
	});

	// Images are rewritten by convert_images_by_adding_folder_path, which runs
	// first. This function must not touch them a second time.
	test('leaves images alone', () => {
		const md = '![Curve Fitting](curve_fitting.jpg)';
		assert.strictEqual(convert(md, SLUG), md);
	});

	test('leaves an already-rewritten image alone', () => {
		const md = '![png](/static/pages/course_model/ml05-ols/index_files/index_5_0.png)';
		assert.strictEqual(convert(md, SLUG), md);
	});

	// A link to an image, as opposed to an embed of one.
	test('rewrites a plain link to an image file', () => {
		assert.strictEqual(
			convert('[the chart](curve_fitting.jpg)', SLUG),
			'[the chart](/static/pages/course_model/ml01-modeling-gems/curve_fitting.jpg)'
		);
	});

	test('matches extensions case-insensitively', () => {
		assert.strictEqual(
			convert('[data](Students.CSV)', SLUG),
			'[data](/static/pages/course_model/ml01-modeling-gems/Students.CSV)'
		);
	});

	test('handles a page that is not an index file', () => {
		assert.strictEqual(
			convert('[Template](template.ipynb)', 'course_model/exams/exam2'),
			'[Template](/static/pages/course_model/exams/template.ipynb)'
		);
	});

	test('leaves ordinary prose containing brackets untouched', () => {
		const md = 'Access the last item with `list[-1]`, and see [the docs](https://python.org).';
		assert.strictEqual(convert(md, SLUG), md);
	});
});
