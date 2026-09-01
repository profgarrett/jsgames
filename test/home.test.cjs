const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert');

const {
	DEFAULT_TUTORIAL_LEVEL_LIST,
	EXCEL_TUTORIAL_LEVEL_LIST,
	SQL_TUTORIAL_LEVEL_LIST,
} = require('../src/shared/IfLevelSchema.ts');

const { get_levels } = require('../src/app/if/levelProgress.tsx');
const { sort_sections_for_reports } = require('../src/app/admin/AdminSectionReports.tsx');
const { faculty_sections } = require('../src/app/if/ClassProgressContainer.tsx');

// get_sticky_section_id reads window.localStorage. There is no DOM under
// node --test, so stand up the smallest thing that satisfies it before the
// module is required.
const storage = {};
global.window = {
	localStorage: {
		getItem: (k) => (typeof storage[k] === 'undefined' ? null : storage[k]),
		setItem: (k, v) => { storage[k] = v; },
	},
};

const { get_sticky_section_id } = require('../src/app/pages/PageSectionPicker.tsx');

const {
	format_section_label,
	format_enrolled_sections,
} = require('../src/app/home/EnrolledSectionsBanner.tsx');


describe('Excel / SQL level list split', () => {
	test('the two lists partition the default list', () => {
		assert.deepStrictEqual(
			[...EXCEL_TUTORIAL_LEVEL_LIST, ...SQL_TUTORIAL_LEVEL_LIST].sort(),
			[...DEFAULT_TUTORIAL_LEVEL_LIST].sort()
		);
	});

	test('SQL list holds every sql_ code and nothing else', () => {
		assert.ok(SQL_TUTORIAL_LEVEL_LIST.length > 0);
		assert.ok(SQL_TUTORIAL_LEVEL_LIST.every(c => c.startsWith('sql_')));
		assert.ok(EXCEL_TUTORIAL_LEVEL_LIST.every(c => !c.startsWith('sql_')));
	});

	test('both lists keep the order of the default list', () => {
		const excel_positions = EXCEL_TUTORIAL_LEVEL_LIST.map(c => DEFAULT_TUTORIAL_LEVEL_LIST.indexOf(c));
		assert.deepStrictEqual(excel_positions, [...excel_positions].sort((a, b) => a - b));
	});
});


describe('get_levels', () => {
	test('reads the highest grade for a code and leaves unattempted levels null', () => {
		const levels = get_levels(['math1', 'math2'], { username: 'bob', math1: 92 }, []);

		assert.strictEqual(levels.length, 2);
		assert.strictEqual(levels[0].code, 'math1');
		assert.strictEqual(levels[0].tutorial_highest_grade, 92);
		assert.strictEqual(levels[1].tutorial_highest_grade, null);
	});

	test('the username entry is never mistaken for a grade', () => {
		// grades carries a string username alongside numeric scores; a code
		// that collided with it must still read as "not attempted".
		const levels = get_levels(['math1'], { username: 'math1' }, []);
		assert.strictEqual(levels[0].tutorial_highest_grade, null);
	});

	test('attaches in-progress attempts to the matching code', () => {
		const uncompleted = [{ code: 'math2', _id: 7 }];
		const levels = get_levels(['math1', 'math2'], {}, uncompleted);

		assert.deepStrictEqual(levels[0].tutorial_incompleted_levels, []);
		assert.strictEqual(levels[1].tutorial_incompleted_levels.length, 1);
		assert.strictEqual(levels[1].tutorial_incompleted_levels[0]._id, 7);
	});

	test('throws on a code that is not a real level', () => {
		assert.throws(() => get_levels(['not_a_level'], {}, []), /Unable to locate level/);
	});

	test('every code on the home page resolves', () => {
		// Guards the home page against a typo in either shared list.
		assert.doesNotThrow(() => get_levels(EXCEL_TUTORIAL_LEVEL_LIST, {}, []));
		assert.doesNotThrow(() => get_levels(SQL_TUTORIAL_LEVEL_LIST, {}, []));
	});
});


describe('get_sticky_section_id', () => {
	beforeEach(() => {
		delete storage['ExcelFunMyProgressSection'];
	});

	const sections = [
		{ idsection: 1, code: 'a', title: 'A' },
		{ idsection: 2, code: 'b', title: 'B' },
	];

	test('returns null when the user has no sections', () => {
		assert.strictEqual(get_sticky_section_id([]), null);
	});

	test('falls back to the first section when nothing is stored', () => {
		assert.strictEqual(get_sticky_section_id(sections), 1);
	});

	test('prefers the stored section', () => {
		storage['ExcelFunMyProgressSection'] = JSON.stringify({ idsection: 2 });
		assert.strictEqual(get_sticky_section_id(sections), 2);
	});

	test('ignores a stored section the user no longer belongs to', () => {
		storage['ExcelFunMyProgressSection'] = JSON.stringify({ idsection: 99 });
		assert.strictEqual(get_sticky_section_id(sections), 1);
	});
});


describe('sort_sections_for_reports', () => {
	test('sorts newest year first, then latest term, then code', () => {
		const sections = [
			{ idsection: 1, code: 'b', title: '', year: 2025, term: 'fall' },
			{ idsection: 2, code: 'a', title: '', year: 2026, term: 'spring' },
			{ idsection: 3, code: 'c', title: '', year: 2026, term: 'fall' },
			{ idsection: 4, code: 'a', title: '', year: 2026, term: 'fall' },
		];

		// 2026 fall (a, then c), then 2026 spring, then 2025.
		assert.deepStrictEqual(
			sort_sections_for_reports(sections).map(s => s.idsection),
			[4, 3, 2, 1]
		);
	});

	test('does not mutate the input', () => {
		const sections = [
			{ idsection: 1, code: 'b', title: '', year: 2025, term: 'fall' },
			{ idsection: 2, code: 'a', title: '', year: 2026, term: 'fall' },
		];
		const before = sections.map(s => s.idsection);

		sort_sections_for_reports(sections);
		assert.deepStrictEqual(sections.map(s => s.idsection), before);
	});

	test('sorts unknown terms after known ones within a year', () => {
		const sections = [
			{ idsection: 1, code: 'a', title: '', year: 2026, term: 'intersession' },
			{ idsection: 2, code: 'b', title: '', year: 2026, term: 'spring' },
		];

		assert.deepStrictEqual(
			sort_sections_for_reports(sections).map(s => s.idsection),
			[2, 1]
		);
	});
});


describe('faculty_sections', () => {
	const sections = [
		{ idsection: 1, code: 'a', title: 'A', year: 2025, term: 'fall', role: 'student' },
		{ idsection: 2, code: 'b', title: 'B', year: 2026, term: 'spring', role: 'faculty' },
		{ idsection: 3, code: 'c', title: 'C', year: 2026, term: 'fall', role: 'Faculty' },
	];

	test('keeps only sections where the caller is faculty', () => {
		assert.deepStrictEqual(
			faculty_sections(sections).map(s => s.idsection),
			[3, 2]
		);
	});

	test('role check is case-insensitive', () => {
		assert.ok(faculty_sections(sections).some(s => s.idsection === 3));
	});

	test('returns nothing for a student-only or empty section list', () => {
		assert.deepStrictEqual(faculty_sections([sections[0]]), []);
		assert.deepStrictEqual(faculty_sections([]), []);
	});

	test('sorts newest term first, matching sort_sections_for_reports', () => {
		assert.deepStrictEqual(
			faculty_sections(sections).map(s => s.idsection),
			sort_sections_for_reports(sections.filter(s => String(s.role).toLowerCase() === 'faculty')).map(s => s.idsection)
		);
	});
});

describe('home page enrolled-sections banner', () => {
	test('labels a section with its term and year', () => {
		const label = format_section_label(
			{ idsection: 1, code: 'acct350', title: 'Business Analytics', year: 2026, term: 'fall' });
		assert.strictEqual(label, 'Business Analytics (fall 2026)');
	});

	test('falls back to the join code when a section has no title', () => {
		const label = format_section_label(
			{ idsection: 1, code: 'acct350', title: '', year: 2026, term: 'fall' });
		assert.strictEqual(label, 'acct350 (fall 2026)');
	});

	test('drops the parenthetical when there is no term or year', () => {
		const label = format_section_label(
			{ idsection: 1, code: 'acct350', title: 'Business Analytics', year: 0, term: '' });
		assert.strictEqual(label, 'Business Analytics');
	});

	test('lists the newest section first', () => {
		const labels = format_enrolled_sections([
			{ idsection: 1, code: 'b', title: 'Older', year: 2025, term: 'fall' },
			{ idsection: 2, code: 'a', title: 'Newer', year: 2026, term: 'spring' },
		]);
		assert.deepStrictEqual(labels, ['Newer (spring 2026)', 'Older (fall 2025)']);
	});

	test('returns nothing for a user with no sections', () => {
		assert.deepStrictEqual(format_enrolled_sections([]), []);
	});
});
