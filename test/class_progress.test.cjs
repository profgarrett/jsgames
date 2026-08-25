const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert');

// The section picker helpers read window.localStorage. There is no DOM under
// node --test, so stand up the smallest thing that satisfies them before the
// module is required. Same approach as home.test.cjs.
const storage = {};
global.window = {
	localStorage: {
		getItem: (k) => (typeof storage[k] === 'undefined' ? null : storage[k]),
		setItem: (k, v) => { storage[k] = v; },
	},
};

const {
	faculty_sections,
	resolve_initial_section,
} = require('../src/app/if/ClassProgressContainer.tsx');

const {
	build_nickname_lookup,
} = require('../src/app/if/ClassProgressGrades.tsx');

const section = (idsection, role, year, term) => ({
	idsection,
	code: 'c' + idsection,
	title: 'Section ' + idsection,
	year,
	term,
	levels: '',
	opens: '',
	closes: '',
	role,
});


describe('class progress section list', () => {
	test('keeps only sections the user teaches', () => {
		const sections = faculty_sections([
			section(1, 'student', 2026, 'fall'),
			section(2, 'faculty', 2026, 'fall'),
		]);
		assert.deepStrictEqual(sections.map(s => s.idsection), [2]);
	});

	test('ignores the case of the role', () => {
		const sections = faculty_sections([section(1, 'Faculty', 2026, 'fall')]);
		assert.strictEqual(sections.length, 1);
	});

	test('sorts newest term first', () => {
		const sections = faculty_sections([
			section(1, 'faculty', 2025, 'fall'),
			section(2, 'faculty', 2026, 'spring'),
			section(3, 'faculty', 2026, 'fall'),
		]);
		assert.deepStrictEqual(sections.map(s => s.idsection), [3, 2, 1]);
	});

	test('returns nothing when the user teaches nothing', () => {
		assert.deepStrictEqual(faculty_sections([section(1, 'student', 2026, 'fall')]), []);
	});
});


describe('class progress initial section', () => {
	const sections = [
		section(3, 'faculty', 2026, 'fall'),
		section(2, 'faculty', 2026, 'spring'),
	];

	beforeEach(() => {
		delete storage['ExcelFunMyProgressSection'];
	});

	test('is null when there are no sections', () => {
		assert.strictEqual(resolve_initial_section([], 3), null);
	});

	test('honors an id from the legacy URL', () => {
		assert.strictEqual(resolve_initial_section(sections, 2)?.idsection, 2);
	});

	test('falls back to the stored section when the URL has no id', () => {
		storage['ExcelFunMyProgressSection'] = JSON.stringify({ idsection: 2 });
		assert.strictEqual(resolve_initial_section(sections, null)?.idsection, 2);
	});

	test('prefers the URL id over the stored section', () => {
		storage['ExcelFunMyProgressSection'] = JSON.stringify({ idsection: 2 });
		assert.strictEqual(resolve_initial_section(sections, 3)?.idsection, 3);
	});

	test('ignores a URL id for a section the user does not teach', () => {
		assert.strictEqual(resolve_initial_section(sections, 99)?.idsection, 3);
	});

	test('ignores an unparsable URL id', () => {
		assert.strictEqual(resolve_initial_section(sections, Number.NaN)?.idsection, 3);
	});

	test('ignores a stored section the user no longer teaches', () => {
		storage['ExcelFunMyProgressSection'] = JSON.stringify({ idsection: 99 });
		assert.strictEqual(resolve_initial_section(sections, null)?.idsection, 3);
	});

	test('defaults to the newest section', () => {
		assert.strictEqual(resolve_initial_section(sections, null)?.idsection, 3);
	});
});


describe('build_nickname_lookup', () => {
	test('keys nicknames by username', () => {
		const lookup = build_nickname_lookup([
			{ username: 'bj000@mix.wvu.edu', nickname: 'Bob Jones' },
			{ username: 'sm01@mix.wvu.edu', nickname: 'Sarah Smith' },
		]);

		assert.strictEqual(lookup.get('bj000@mix.wvu.edu'), 'Bob Jones');
		assert.strictEqual(lookup.get('sm01@mix.wvu.edu'), 'Sarah Smith');
	});

	test('normalizes case and padding the way the grade rows are keyed', () => {
		// _convert_levels_into_highest_grades keys on
		// username.toLowerCase().trim(); a mismatch here silently drops the name.
		const lookup = build_nickname_lookup([
			{ username: '  BJ000@Mix.WVU.edu ', nickname: 'Bob Jones' },
		]);

		assert.strictEqual(lookup.get('bj000@mix.wvu.edu'), 'Bob Jones');
	});

	test('trims the nickname itself', () => {
		const lookup = build_nickname_lookup([
			{ username: 'bj000@mix.wvu.edu', nickname: '  Bob Jones  ' },
		]);

		assert.strictEqual(lookup.get('bj000@mix.wvu.edu'), 'Bob Jones');
	});

	test('omits a student with a blank nickname rather than storing an empty string', () => {
		const lookup = build_nickname_lookup([
			{ username: 'a@x.edu', nickname: '' },
			{ username: 'b@x.edu', nickname: '   ' },
			{ username: 'c@x.edu', nickname: 'Real Name' },
		]);

		assert.strictEqual(lookup.size, 1);
		assert.strictEqual(lookup.has('a@x.edu'), false);
		assert.strictEqual(lookup.get('c@x.edu'), 'Real Name');
	});

	test('survives a malformed row instead of throwing', () => {
		// The column is a nicety; a bad payload must not take the grade table down.
		const lookup = build_nickname_lookup([
			{ username: null, nickname: 'X' },
			{ username: 'a@x.edu', nickname: null },
			{ username: '', nickname: 'Y' },
			{ username: 'ok@x.edu', nickname: 'Fine' },
		]);

		assert.strictEqual(lookup.size, 1);
		assert.strictEqual(lookup.get('ok@x.edu'), 'Fine');
	});

	test('an empty list is an empty lookup', () => {
		assert.strictEqual(build_nickname_lookup([]).size, 0);
	});
});
