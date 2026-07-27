const { test, describe } = require('node:test');
const assert = require('node:assert');

const {
	resolve_selected_section,
	get_page_for_section,
} = require('../src/app/pages/PageSectionPicker.tsx');

describe('page section selection helpers', () => {
	test('defaults to the first section that has a matching page', () => {
		const sections = [
			{ idsection: 1, code: 'alpha', title: 'Alpha', role: 'student', year: 2024, term: 'A', levels: '', opens: '', closes: '' },
			{ idsection: 2, code: 'beta', title: 'Beta', role: 'student', year: 2024, term: 'A', levels: '', opens: '', closes: '' },
		];
		const pages = [
			{ slug: 'beta', title: 'Beta Page', markdown: 'beta' },
			{ slug: 'gamma', title: 'Gamma Page', markdown: 'gamma' },
		];

		const selected = resolve_selected_section(sections, pages, null);
		assert.strictEqual(selected?.code, 'beta');
	});

	test('uses the preferred section when it exists and has a matching page', () => {
		const sections = [
			{ idsection: 1, code: 'alpha', title: 'Alpha', role: 'student', year: 2024, term: 'A', levels: '', opens: '', closes: '' },
			{ idsection: 2, code: 'beta', title: 'Beta', role: 'student', year: 2024, term: 'A', levels: '', opens: '', closes: '' },
		];
		const pages = [
			{ slug: 'alpha', title: 'Alpha Page', markdown: 'alpha' },
			{ slug: 'beta', title: 'Beta Page', markdown: 'beta' },
		];
		const preferred = sections[1];

		const selected = resolve_selected_section(sections, pages, preferred);
		assert.strictEqual(selected?.code, 'beta');
	});

	test('returns the matching page for a section when one exists', () => {
		const sections = [
			{ idsection: 1, code: 'alpha', title: 'Alpha', role: 'student', year: 2024, term: 'A', levels: '', opens: '', closes: '' },
		];
		const pages = [
			{ slug: 'alpha', title: 'Alpha Page', markdown: 'alpha' },
		];

		const page = get_page_for_section(sections[0], pages);
		assert.strictEqual(page?.slug, 'alpha');
	});
});
