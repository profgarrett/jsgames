// Tests for the nickname upload feature.
//
// Two halves:
//   - src/app/admin/nicknameParser.ts, which turns the Blackboard export into
//     upload rows in the browser. This is where the UTF-16 / tab-delimited /
//     saved-as-CSV variations get pinned down.
//   - src/server/app_nicknames.ts, whose pure validators decide what actually
//     reaches the database.
//
// The DB-touching routes are not covered, matching the rest of the suite (no
// test database is stood up).

const { test, describe } = require('node:test');
const assert = require('node:assert');

const {
	decode_roster_bytes,
	split_delimited_line,
	detect_delimiter,
	normalize_header,
	map_header_columns,
	parse_roster,
} = require('../src/app/admin/nicknameParser.ts');

const {
	validate_nickname_row,
	normalize_roster_rows,
	nickname_to_email,
	display_name,
	shape_nickname_row,
	MAX_ROSTER_ROWS,
} = require('../src/server/app_nicknames.ts');


// The real export's header, verbatim from a Blackboard download.
const BLACKBOARD_HEADER = [
	'Last Name', 'First Name', 'Username', 'Student ID', 'Last Access',
	'Availability', 'Child Course ID',
	'DataCamp - Introduction to Tableau (part 1) [Total Pts: 5 Score] |3843202',
].join('\t');

const BLACKBOARD_BODY = [
	'Jones\tBob\tbj000\t800000000\t8/24/26 15:47\tYes\tstar83604.202608\t',
	'Smith\tSarah\tsm01\t800000001\t8/24/26 15:47\tYes\tstar83604.202608\t',
].join('\r\n');

const BLACKBOARD_FILE = BLACKBOARD_HEADER + '\r\n' + BLACKBOARD_BODY + '\r\n';


// Encode a string the way Blackboard writes the file: UTF-16LE with a BOM.
function utf16le_with_bom(s) {
	const body = Buffer.from(s, 'utf16le');
	const buffer = Buffer.concat([Buffer.from([0xFF, 0xFE]), body]);
	return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

function utf8_with_bom(s) {
	const buffer = Buffer.concat([Buffer.from([0xEF, 0xBB, 0xBF]), Buffer.from(s, 'utf8')]);
	return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

function utf8_plain(s) {
	const buffer = Buffer.from(s, 'utf8');
	return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}


describe('decode_roster_bytes', () => {
	test('decodes the UTF-16LE file Blackboard actually produces', () => {
		const { text, encoding } = decode_roster_bytes(utf16le_with_bom(BLACKBOARD_FILE));
		assert.strictEqual(encoding, 'UTF-16LE');
		assert.strictEqual(text, BLACKBOARD_FILE);
	});

	test('strips a UTF-8 BOM so the first header still matches', () => {
		const { text, encoding } = decode_roster_bytes(utf8_with_bom('Last Name\tFirst Name'));
		assert.strictEqual(encoding, 'UTF-8');
		assert.strictEqual(text, 'Last Name\tFirst Name');
		// The point of stripping: U+FEFF would otherwise ride along on 'Last Name'.
		assert.strictEqual(text.charCodeAt(0), 'L'.charCodeAt(0));
	});

	test('assumes UTF-8 when there is no BOM', () => {
		const { text, encoding } = decode_roster_bytes(utf8_plain('Jones\tBob'));
		assert.strictEqual(encoding, 'UTF-8');
		assert.strictEqual(text, 'Jones\tBob');
	});

	test('keeps non-ASCII names intact', () => {
		const { text } = decode_roster_bytes(utf16le_with_bom('Muñoz\tJosé'));
		assert.strictEqual(text, 'Muñoz\tJosé');
	});
});


describe('split_delimited_line', () => {
	test('splits plain tab-separated fields', () => {
		assert.deepStrictEqual(
			split_delimited_line('Jones\tBob\tbj000', '\t'),
			['Jones', 'Bob', 'bj000']);
	});

	test('keeps a quoted comma inside one field', () => {
		assert.deepStrictEqual(
			split_delimited_line('"Jones, Jr.",Bob,bj000', ','),
			['Jones, Jr.', 'Bob', 'bj000']);
	});

	test('unescapes a doubled quote', () => {
		assert.deepStrictEqual(
			split_delimited_line('"He said ""hi""",Bob', ','),
			['He said "hi"', 'Bob']);
	});

	test('trims surrounding whitespace', () => {
		assert.deepStrictEqual(
			split_delimited_line(' Jones \t Bob ', '\t'),
			['Jones', 'Bob']);
	});

	test('preserves empty trailing fields', () => {
		assert.deepStrictEqual(
			split_delimited_line('Jones\tBob\t\t', '\t'),
			['Jones', 'Bob', '', '']);
	});
});


describe('detect_delimiter', () => {
	test('picks tab for the Blackboard export', () => {
		assert.strictEqual(detect_delimiter(BLACKBOARD_HEADER), 'tab');
	});

	test('picks comma for a file saved out of Excel', () => {
		assert.strictEqual(
			detect_delimiter('Last Name,First Name,Username,Student ID'), 'comma');
	});

	test('ties go to tab, since a header with a comma in its name is rarer', () => {
		assert.strictEqual(detect_delimiter('a\tb,c'), 'tab');
	});
});


describe('normalize_header', () => {
	test('reduces spacing and case', () => {
		assert.strictEqual(normalize_header('Last Name'), 'lastname');
		assert.strictEqual(normalize_header('  STUDENT_ID '), 'studentid');
		assert.strictEqual(normalize_header('First-Name'), 'firstname');
	});
});


describe('map_header_columns', () => {
	test('finds the four columns in the real export', () => {
		const { error, columns } = map_header_columns(BLACKBOARD_HEADER.split('\t'));
		assert.strictEqual(error, null);
		assert.deepStrictEqual(columns,
			{ last_name: 0, first_name: 1, username: 2, student_id: 3 });
	});

	test('accepts reordered columns', () => {
		const { error, columns } = map_header_columns(
			['Student ID', 'Username', 'First Name', 'Last Name']);
		assert.strictEqual(error, null);
		assert.deepStrictEqual(columns,
			{ last_name: 3, first_name: 2, username: 1, student_id: 0 });
	});

	test('student id is optional', () => {
		const { error, columns } = map_header_columns(['Last Name', 'First Name', 'Username']);
		assert.strictEqual(error, null);
		assert.strictEqual(columns.student_id, -1);
	});

	test('names the missing columns rather than failing silently', () => {
		const { error } = map_header_columns(['Last Name', 'Availability']);
		assert.ok(error !== null);
		assert.match(error, /first name/);
		assert.match(error, /username/);
	});
});


describe('parse_roster', () => {
	test('parses the real Blackboard export end to end', () => {
		const { text } = decode_roster_bytes(utf16le_with_bom(BLACKBOARD_FILE));
		const result = parse_roster(text);

		assert.strictEqual(result.error, null);
		assert.strictEqual(result.delimiter, 'tab');
		assert.deepStrictEqual(result.rows, [
			{ username: 'bj000', first_name: 'Bob', last_name: 'Jones', student_id: '800000000' },
			{ username: 'sm01', first_name: 'Sarah', last_name: 'Smith', student_id: '800000001' },
		]);
	});

	test('ignores class, availability and gradebook columns', () => {
		const result = parse_roster(BLACKBOARD_FILE);
		const keys = Object.keys(result.rows[0]).sort();
		assert.deepStrictEqual(keys, ['first_name', 'last_name', 'student_id', 'username']);
	});

	test('lowercases usernames so a re-export cannot create a second student', () => {
		const result = parse_roster('Last Name\tFirst Name\tUsername\nJones\tBob\tBJ000');
		assert.strictEqual(result.rows[0].username, 'bj000');
	});

	test('handles an Excel-saved CSV with quoted fields', () => {
		const csv = 'Last Name,First Name,Username,Student ID\n'
			+ '"Jones, Jr.",Bob,bj000,800000000\n';
		const result = parse_roster(csv);

		assert.strictEqual(result.error, null);
		assert.strictEqual(result.delimiter, 'comma');
		assert.strictEqual(result.rows[0].last_name, 'Jones, Jr.');
	});

	test('a trailing newline is not reported as a skipped row', () => {
		const result = parse_roster(BLACKBOARD_FILE);
		assert.deepStrictEqual(result.skipped, []);
	});

	test('reports a row with no username by its line number in the file', () => {
		const text = 'Last Name\tFirst Name\tUsername\n'
			+ 'Jones\tBob\tbj000\n'
			+ 'Total\t\t\n';
		const result = parse_roster(text);

		assert.strictEqual(result.rows.length, 1);
		assert.deepStrictEqual(result.skipped, [{ line: 3, reason: 'No username' }]);
	});

	test('rejects a file with no student rows', () => {
		const result = parse_roster('Last Name\tFirst Name\tUsername\n');
		assert.ok(result.error !== null);
		assert.strictEqual(result.rows.length, 0);
	});

	test('rejects an empty file', () => {
		assert.ok(parse_roster('').error !== null);
		assert.ok(parse_roster('\n\n').error !== null);
	});

	test('tolerates a short row missing its optional student id', () => {
		const result = parse_roster('Last Name\tFirst Name\tUsername\tStudent ID\nJones\tBob\tbj000');
		assert.strictEqual(result.error, null);
		assert.strictEqual(result.rows[0].student_id, '');
	});
});


describe('nickname_to_email', () => {
	test('appends the configured domain to a bare campus username', () => {
		assert.strictEqual(nickname_to_email('bj000', 'mix.wvu.edu'), 'bj000@mix.wvu.edu');
	});

	test('leaves a value that is already an address alone', () => {
		assert.strictEqual(
			nickname_to_email('bob@example.com', 'mix.wvu.edu'), 'bob@example.com');
	});

	test('lowercases both halves', () => {
		assert.strictEqual(nickname_to_email(' BJ000 ', 'MIX.WVU.EDU'), 'bj000@mix.wvu.edu');
	});

	test('an empty username has no address', () => {
		assert.strictEqual(nickname_to_email('', 'mix.wvu.edu'), '');
	});
});


describe('display_name', () => {
	test('joins first and last', () => {
		assert.strictEqual(display_name('Bob', 'Jones'), 'Bob Jones');
	});

	test('does not leave a stray space when half is missing', () => {
		assert.strictEqual(display_name('Bob', ''), 'Bob');
		assert.strictEqual(display_name('', 'Jones'), 'Jones');
	});
});


describe('validate_nickname_row', () => {
	function good_row(overrides) {
		return Object.assign({
			username: 'bj000',
			first_name: 'Bob',
			last_name: 'Jones',
			student_id: '800000000',
		}, overrides || {});
	}

	test('accepts a row off the real roster', () => {
		const { error, value } = validate_nickname_row(good_row());
		assert.strictEqual(error, null);
		assert.deepStrictEqual(value, {
			username: 'bj000', first_name: 'Bob', last_name: 'Jones', student_id: '800000000',
		});
	});

	test('lowercases and trims the username', () => {
		const { value } = validate_nickname_row(good_row({ username: '  BJ000 ' }));
		assert.strictEqual(value.username, 'bj000');
	});

	test('accepts a username that is already a full address', () => {
		const { error, value } = validate_nickname_row(good_row({ username: 'bob@example.com' }));
		assert.strictEqual(error, null);
		assert.strictEqual(value.username, 'bob@example.com');
	});

	test('a numeric student id from a spreadsheet cell survives', () => {
		const { value } = validate_nickname_row(good_row({ student_id: 800000000 }));
		assert.strictEqual(value.student_id, '800000000');
	});

	test('a blank student id becomes null, not an empty string', () => {
		const { value } = validate_nickname_row(good_row({ student_id: '  ' }));
		assert.strictEqual(value.student_id, null);
	});

	test('requires a username and both name halves', () => {
		assert.match(validate_nickname_row(good_row({ username: '' })).error, /Username/);
		assert.match(validate_nickname_row(good_row({ first_name: '' })).error, /First name/);
		assert.match(validate_nickname_row(good_row({ last_name: '' })).error, /Last name/);
	});

	test('rejects a username that is really a parsing mistake', () => {
		// A whole line landing in one field, which is what a wrong delimiter looks like.
		assert.ok(validate_nickname_row(good_row({ username: 'jones bob bj000' })).error !== null);
		assert.ok(validate_nickname_row(good_row({ username: 'a@b@c' })).error !== null);
	});

	test('rejects over-long values rather than letting MySQL truncate them', () => {
		assert.ok(validate_nickname_row(good_row({ first_name: 'x'.repeat(101) })).error !== null);
		assert.ok(validate_nickname_row(good_row({ last_name: 'x'.repeat(101) })).error !== null);
		assert.ok(validate_nickname_row(good_row({ student_id: 'x'.repeat(46) })).error !== null);
	});

	test('rejects a non-object', () => {
		assert.ok(validate_nickname_row(null).error !== null);
		assert.ok(validate_nickname_row('Jones,Bob').error !== null);
	});
});


describe('normalize_roster_rows', () => {
	const bob = { username: 'bj000', first_name: 'Bob', last_name: 'Jones', student_id: '1' };
	const sarah = { username: 'sm01', first_name: 'Sarah', last_name: 'Smith', student_id: '2' };

	test('passes a clean roster straight through', () => {
		const { error, rows, skipped } = normalize_roster_rows([bob, sarah]);
		assert.strictEqual(error, null);
		assert.strictEqual(rows.length, 2);
		assert.deepStrictEqual(skipped, []);
	});

	test('one bad row does not sink the upload', () => {
		const { error, rows, skipped } = normalize_roster_rows(
			[bob, { username: '', first_name: 'X', last_name: 'Y' }, sarah]);

		assert.strictEqual(error, null);
		assert.strictEqual(rows.length, 2);
		assert.strictEqual(skipped.length, 1);
		assert.strictEqual(skipped[0].row, 2); // 1-based, so it can be found in the file
	});

	test('a repeat within one file keeps the last occurrence', () => {
		const { rows } = normalize_roster_rows([
			bob,
			sarah,
			{ username: 'BJ000', first_name: 'Robert', last_name: 'Jones', student_id: '1' },
		]);

		assert.strictEqual(rows.length, 2);
		const jones = rows.find(r => r.username === 'bj000');
		assert.strictEqual(jones.first_name, 'Robert');
	});

	test('rejects a payload that is not a list of rows', () => {
		assert.ok(normalize_roster_rows(undefined).error !== null);
		assert.ok(normalize_roster_rows('bj000').error !== null);
		assert.ok(normalize_roster_rows([]).error !== null);
	});

	test('rejects a file where nothing at all was usable', () => {
		const { error, rows } = normalize_roster_rows([{ username: '', first_name: '', last_name: '' }]);
		assert.ok(error !== null);
		assert.strictEqual(rows.length, 0);
	});

	test('refuses an implausibly large upload', () => {
		const many = new Array(MAX_ROSTER_ROWS + 1).fill(bob);
		assert.match(normalize_roster_rows(many).error, /Too many rows/);
	});
});


describe('shape_nickname_row', () => {
	test('adds the derived email and display name', () => {
		const shaped = shape_nickname_row({
			idnickname: 7, username: 'bj000', first_name: 'Bob', last_name: 'Jones',
			student_id: '800000000', updated: '2026-08-25 12:00:00',
			iduser: 3, user_nickname: 'Bob Jones',
		});

		assert.strictEqual(shaped.nickname, 'Bob Jones');
		assert.match(shaped.email, /^bj000@/);
		assert.strictEqual(shaped.iduser, 3);
	});

	test('a student with no account yet reports null rather than undefined', () => {
		const shaped = shape_nickname_row({
			idnickname: 7, username: 'bj000', first_name: 'Bob', last_name: 'Jones',
			student_id: null, updated: '2026-08-25 12:00:00',
		});

		assert.strictEqual(shaped.iduser, null);
		assert.strictEqual(shaped.user_nickname, null);
	});
});
