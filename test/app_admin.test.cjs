// Tests for src/server/app_admin.ts
//
// Exercises the pure helpers behind the admin module: section/enrollment/user
// input validation, the '?' default for sections.levels, the row-shaping that
// turns the users+enrollments join into one object per user, and the filter
// that keeps already-joined sections out of the client's dropdown.
//
// The DB-touching routes themselves are not covered here, matching the rest of
// the suite (no test database is stood up).

const { test, describe } = require('node:test');
const assert = require('node:assert');

const {
	validate_section_input,
	validate_enrollment_input,
	validate_user_input,
	shape_users_rows,
	sections_available_to_user,
	is_valid_date,
	DEFAULT_LEVELS,
	MIN_PASSWORD_LENGTH,
} = require('../src/server/app_admin.ts');


// A known-good section body, so each test can vary one field at a time.
function good_section(overrides) {
	return Object.assign({
		code: 'acct301',
		title: 'Accounting Information Systems',
		year: 2026,
		term: 'Fall',
		opens: '2026-08-17',
		closes: '2026-12-11',
	}, overrides || {});
}


describe('is_valid_date', () => {
	test('accepts real YYYY-MM-DD dates', () => {
		assert.strictEqual(is_valid_date('2026-08-17'), true);
		assert.strictEqual(is_valid_date('2026-12-31'), true);
		assert.strictEqual(is_valid_date('2024-02-29'), true); // leap year
	});

	test('rejects dates that do not exist', () => {
		assert.strictEqual(is_valid_date('2026-02-29'), false); // 2026 is not a leap year
		assert.strictEqual(is_valid_date('2026-02-31'), false);
		assert.strictEqual(is_valid_date('2026-13-01'), false);
		assert.strictEqual(is_valid_date('2026-00-10'), false);
	});

	test('rejects wrong shapes', () => {
		assert.strictEqual(is_valid_date('8/17/2026'), false);
		assert.strictEqual(is_valid_date('2026-8-17'), false);
		assert.strictEqual(is_valid_date(''), false);
	});
});


describe('validate_section_input', () => {
	test('accepts a well-formed section', () => {
		const { error, value } = validate_section_input(good_section());
		assert.strictEqual(error, null);
		assert.strictEqual(value.code, 'acct301');
		assert.strictEqual(value.year, 2026);
	});

	test('trims and lowercases the code', () => {
		const { value } = validate_section_input(good_section({ code: '  ACCT301  ' }));
		assert.strictEqual(value.code, 'acct301');
	});

	test('rejects a blank code', () => {
		assert.ok(validate_section_input(good_section({ code: '   ' })).error);
	});

	test('rejects codes with unsafe characters', () => {
		assert.ok(validate_section_input(good_section({ code: 'acct 301' })).error);
		assert.ok(validate_section_input(good_section({ code: 'acct/301' })).error);
		assert.ok(validate_section_input(good_section({ code: "acct';--" })).error);
	});

	test('rejects a code longer than the 45-char column', () => {
		assert.ok(validate_section_input(good_section({ code: 'a'.repeat(46) })).error);
		assert.strictEqual(validate_section_input(good_section({ code: 'a'.repeat(45) })).error, null);
	});

	test('rejects a title longer than the 115-char column', () => {
		assert.ok(validate_section_input(good_section({ title: 't'.repeat(116) })).error);
	});

	test('rejects a blank title', () => {
		assert.ok(validate_section_input(good_section({ title: '' })).error);
	});

	test('rejects out-of-range or non-integer years', () => {
		assert.ok(validate_section_input(good_section({ year: 1999 })).error);
		assert.ok(validate_section_input(good_section({ year: 2101 })).error);
		assert.ok(validate_section_input(good_section({ year: 'soon' })).error);
		assert.ok(validate_section_input(good_section({ year: 2026.5 })).error);
	});

	test('accepts a year sent as a string, as an HTML form would', () => {
		const { error, value } = validate_section_input(good_section({ year: '2026' }));
		assert.strictEqual(error, null);
		assert.strictEqual(value.year, 2026);
	});

	test('rejects malformed dates', () => {
		assert.ok(validate_section_input(good_section({ opens: '08/17/2026' })).error);
		assert.ok(validate_section_input(good_section({ closes: 'someday' })).error);
	});

	test('rejects closes before opens', () => {
		assert.ok(validate_section_input(good_section({
			opens: '2026-12-11', closes: '2026-08-17' })).error);
	});

	test('allows closes equal to opens', () => {
		assert.strictEqual(validate_section_input(good_section({
			opens: '2026-08-17', closes: '2026-08-17' })).error, null);
	});

	test('rejects a missing body', () => {
		assert.ok(validate_section_input(null).error);
		assert.ok(validate_section_input('not an object').error);
	});
});


describe('validate_section_input: levels defaulting', () => {
	test("missing levels becomes '?'", () => {
		const { value } = validate_section_input(good_section());
		assert.strictEqual(value.levels, DEFAULT_LEVELS);
		assert.strictEqual(value.levels, '?');
	});

	test("null, empty, and whitespace-only levels all become '?'", () => {
		assert.strictEqual(validate_section_input(good_section({ levels: null })).value.levels, '?');
		assert.strictEqual(validate_section_input(good_section({ levels: '' })).value.levels, '?');
		assert.strictEqual(validate_section_input(good_section({ levels: '   ' })).value.levels, '?');
	});

	test('an explicit list passes through untouched', () => {
		const { value } = validate_section_input(good_section({ levels: 'tutorial01,tutorial02' }));
		assert.strictEqual(value.levels, 'tutorial01,tutorial02');
	});

	test("'?' composes with extra levels", () => {
		const { value } = validate_section_input(good_section({ levels: '?,extra_level' }));
		assert.strictEqual(value.levels, '?,extra_level');
	});

	test('rejects junk characters in the levels list', () => {
		assert.ok(validate_section_input(good_section({ levels: 'tutorial01; DROP TABLE' })).error);
		assert.ok(validate_section_input(good_section({ levels: 'Tutorial01' })).error); // uppercase
	});
});


describe('validate_enrollment_input', () => {
	test('accepts a valid join', () => {
		const { error, value } = validate_enrollment_input({ iduser: 4, idsection: 9, role: 'student' });
		assert.strictEqual(error, null);
		assert.deepStrictEqual(value, { iduser: 4, idsection: 9, role: 'student' });
	});

	test('accepts ids sent as strings', () => {
		const { error, value } = validate_enrollment_input({ iduser: '4', idsection: '9', role: 'faculty' });
		assert.strictEqual(error, null);
		assert.strictEqual(value.iduser, 4);
		assert.strictEqual(value.idsection, 9);
	});

	test('lowercases the role', () => {
		assert.strictEqual(validate_enrollment_input(
			{ iduser: 1, idsection: 1, role: 'FACULTY' }).value.role, 'faculty');
	});

	test('rejects a role outside the allowed list', () => {
		assert.ok(validate_enrollment_input({ iduser: 1, idsection: 1, role: 'ta' }).error);
		assert.ok(validate_enrollment_input({ iduser: 1, idsection: 1, role: '' }).error);
	});

	test('rejects non-numeric, zero, and negative ids', () => {
		assert.ok(validate_enrollment_input({ iduser: 'abc', idsection: 1, role: 'student' }).error);
		assert.ok(validate_enrollment_input({ iduser: 0, idsection: 1, role: 'student' }).error);
		assert.ok(validate_enrollment_input({ iduser: 1, idsection: -3, role: 'student' }).error);
		assert.ok(validate_enrollment_input({ iduser: 1.5, idsection: 1, role: 'student' }).error);
	});

	test('skips the role check when require_role is false (the DELETE case)', () => {
		const { error, value } = validate_enrollment_input({ iduser: 4, idsection: 9 }, false);
		assert.strictEqual(error, null);
		assert.deepStrictEqual(value, { iduser: 4, idsection: 9 });
	});

	test('still requires ids when require_role is false', () => {
		assert.ok(validate_enrollment_input({ idsection: 9 }, false).error);
	});
});


describe('validate_user_input', () => {
	test('accepts a username and password with no section', () => {
		const { error, value } = validate_user_input({
			username: 'student@wvu.edu', password: 'correcthorse' });
		assert.strictEqual(error, null);
		assert.strictEqual(value.username, 'student@wvu.edu');
		assert.strictEqual(value.idsection, null);
		assert.strictEqual(value.role, null);
	});

	test('trims and lowercases the username, matching normalizeUsername', () => {
		const { value } = validate_user_input({
			username: '  Student@WVU.edu ', password: 'correcthorse' });
		assert.strictEqual(value.username, 'student@wvu.edu');
	});

	test('rejects a blank username', () => {
		assert.ok(validate_user_input({ username: '  ', password: 'correcthorse' }).error);
	});

	test('rejects a blank password', () => {
		assert.ok(validate_user_input({ username: 'a@b.com', password: '' }).error);
		assert.ok(validate_user_input({ username: 'a@b.com' }).error);
	});

	test('enforces the minimum password length', () => {
		const short = 'x'.repeat(MIN_PASSWORD_LENGTH - 1);
		const exact = 'x'.repeat(MIN_PASSWORD_LENGTH);
		assert.ok(validate_user_input({ username: 'a@b.com', password: short }).error);
		assert.strictEqual(validate_user_input({ username: 'a@b.com', password: exact }).error, null);
	});

	test('does not trim the password', () => {
		const { value } = validate_user_input({ username: 'a@b.com', password: '  spaces  ' });
		assert.strictEqual(value.password, '  spaces  ');
	});

	test('accepts an optional section and defaults the role to student', () => {
		const { error, value } = validate_user_input({
			username: 'a@b.com', password: 'correcthorse', idsection: 7 });
		assert.strictEqual(error, null);
		assert.strictEqual(value.idsection, 7);
		assert.strictEqual(value.role, 'student');
	});

	test('honors an explicit role alongside a section', () => {
		const { value } = validate_user_input({
			username: 'a@b.com', password: 'correcthorse', idsection: 7, role: 'faculty' });
		assert.strictEqual(value.role, 'faculty');
	});

	test('rejects a bad role when a section is given', () => {
		assert.ok(validate_user_input({
			username: 'a@b.com', password: 'correcthorse', idsection: 7, role: 'ta' }).error);
	});

	test('rejects a malformed section id', () => {
		assert.ok(validate_user_input({
			username: 'a@b.com', password: 'correcthorse', idsection: 'seven' }).error);
	});

	test('treats an empty-string section as no section, as a blank <select> sends', () => {
		const { error, value } = validate_user_input({
			username: 'a@b.com', password: 'correcthorse', idsection: '' });
		assert.strictEqual(error, null);
		assert.strictEqual(value.idsection, null);
	});
});


describe('shape_users_rows', () => {
	test('folds several rows into one user with several sections', () => {
		const shaped = shape_users_rows([
			{ iduser: 1, username: 'a@b.com', idsection: 5, code: 'acct301', title: 'AIS', year: 2026, term: 'Fall', role: 'student' },
			{ iduser: 1, username: 'a@b.com', idsection: 6, code: 'acct302', title: 'DV', year: 2026, term: 'Fall', role: 'faculty' },
		]);

		assert.strictEqual(shaped.length, 1);
		assert.strictEqual(shaped[0].sections.length, 2);
		assert.strictEqual(shaped[0].sections[0].code, 'acct301');
		assert.strictEqual(shaped[0].sections[1].role, 'faculty');
	});

	test('gives a user with no sections an empty array, not a null entry', () => {
		const shaped = shape_users_rows([
			{ iduser: 2, username: 'lonely@b.com', idsection: null, code: null, title: null, year: null, term: null, role: null },
		]);

		assert.strictEqual(shaped.length, 1);
		assert.deepStrictEqual(shaped[0].sections, []);
	});

	test('keeps multiple users separate and preserves input order', () => {
		const shaped = shape_users_rows([
			{ iduser: 1, username: 'a@b.com', idsection: 5, code: 'acct301', role: 'student' },
			{ iduser: 2, username: 'b@b.com', idsection: null, code: null, role: null },
			{ iduser: 3, username: 'c@b.com', idsection: 5, code: 'acct301', role: 'student' },
		]);

		assert.deepStrictEqual(shaped.map(u => u.username), ['a@b.com', 'b@b.com', 'c@b.com']);
		assert.strictEqual(shaped[1].sections.length, 0);
	});

	test('returns an empty array for no rows', () => {
		assert.deepStrictEqual(shape_users_rows([]), []);
	});

	test('never exposes password or identity columns even if the query changes', () => {
		const shaped = shape_users_rows([
			{ iduser: 1, username: 'a@b.com', hashed_password: 'LEAK', google_sub: 'LEAK', ip: 'LEAK',
				idsection: 5, code: 'acct301', title: 'AIS', year: 2026, term: 'Fall', role: 'student' },
		]);

		const serialized = JSON.stringify(shaped);
		assert.ok(!serialized.includes('LEAK'), 'shaped output must not carry through extra columns');
	});
});


describe('sections_available_to_user', () => {
	const sections = [
		{ idsection: 1, code: 'acct301' },
		{ idsection: 2, code: 'acct302' },
		{ idsection: 3, code: 'acct303' },
	];

	test('hides sections the user already belongs to', () => {
		const user = { iduser: 1, sections: [{ idsection: 2 }] };
		assert.deepStrictEqual(
			sections_available_to_user(sections, user).map(s => s.idsection), [1, 3]);
	});

	test('returns everything for a user with no sections', () => {
		const user = { iduser: 1, sections: [] };
		assert.strictEqual(sections_available_to_user(sections, user).length, 3);
	});

	test('returns an empty list when the user is in every section', () => {
		const user = { iduser: 1, sections: [{ idsection: 1 }, { idsection: 2 }, { idsection: 3 }] };
		assert.deepStrictEqual(sections_available_to_user(sections, user), []);
	});

	test('returns everything when no user is selected yet', () => {
		assert.strictEqual(sections_available_to_user(sections, null).length, 3);
	});
});
