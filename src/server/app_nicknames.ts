/**
	Student nicknames.

	A roster exported from Blackboard gives a bare campus username ('bj000') and
	a human name; the site only ever knows students by the email address they
	log in with. This module stores the mapping so that reports can show "Bob
	Jones" instead of "bj000@mix.wvu.edu".

		GET    /api/admin/nicknames        every uploaded nickname
		POST   /api/admin/nicknames        upload a parsed roster (replaces matches)
		DELETE /api/admin/nicknames/:id    remove one row

	Every route sits behind user_require_logged_in + user_require_admin, so the
	whole router is reachable only by ADMIN_USERNAME from secret.js. The client
	gate in AdminNicknamesContainer.tsx is a convenience; this is the boundary.

	Design notes worth knowing before changing anything here:

	- The roster's Username column is stored as given, NOT as an email. The
	  address is derived at match time as username@STUDENT_EMAIL_DOMAIN, so
	  changing the campus domain in secret.js immediately changes what matches
	  without rewriting a single row. A roster value that already contains '@'
	  is taken to be a complete address and used unchanged.
	- nicknames.username carries a UNIQUE index (sql28), so re-uploading a
	  roster updates the existing rows instead of piling up duplicates. The
	  upsert is one bulk INSERT ... ON DUPLICATE KEY UPDATE rather than a loop:
	  run_mysql_query opens a fresh connection per call, and a 200-student
	  roster would otherwise be 200 connections.
	- users.nickname is only ever written when it is null or blank. A name set
	  by hand always wins over a later roster upload, and a student who changed
	  their own display name does not get it silently reverted.
	- Class, availability, last access, and the gradebook columns in the export
	  are deliberately dropped. Only first name, last name, username, and
	  student id are stored.
	- Parsing the file happens in the browser (src/app/admin/nicknameParser.ts),
	  which posts clean JSON rows here. This router never sees the raw upload,
	  so the UTF-16 / tab-delimited quirks of the Blackboard export stay in one
	  place and are unit tested without a multipart body parser.
	- All validation lives in exported pure functions so it can be unit tested
	  without a database. See test/app_nicknames.test.cjs.
*/
import express from 'express';
const router = express.Router();

import { from_utc_to_myql, run_mysql_query, to_utc } from './mysql';
import {
	nocache, log_error,
	user_require_logged_in, user_require_admin } from './network';

import { STUDENT_EMAIL_DOMAIN } from './secret';

import type { Request, Response, NextFunction } from 'express';


// Upper bound on a single upload. Comfortably above any real section roster,
// low enough that a malformed file cannot turn into an unbounded INSERT.
const MAX_ROSTER_ROWS = 5000;

// Column widths from sql28. Enforced here so an over-long value is a 400 with
// a readable message rather than a truncation (or an error) from MySQL.
const MAX_NAME_LENGTH = 100;
const MAX_USERNAME_LENGTH = 255;
const MAX_STUDENT_ID_LENGTH = 45;


interface INicknameRow {
	username: string;
	first_name: string;
	last_name: string;
	student_id: string | null;
}

interface IValidationResult {
	error: string | null;
	value: any;
}


////////////////////////////////////////////////////////////////////////
//  Validation and derivation (pure, exported for testing)
////////////////////////////////////////////////////////////////////////


// Coerce to a trimmed string. Numbers are allowed through (a student id read
// out of a spreadsheet cell often arrives as one); objects are not.
function as_trimmed_string( v: any ): string {
	if( typeof v === 'string' ) return v.trim();
	if( typeof v === 'number' && isFinite(v) ) return String(v);
	return '';
}


/**
	The email address a roster username logs in with.

	'bj000' + 'mix.wvu.edu' => 'bj000@mix.wvu.edu'
	'bob@example.com'       => 'bob@example.com'   (already an address)

	Kept as a function rather than a stored column so that changing
	STUDENT_EMAIL_DOMAIN in secret.js takes effect everywhere at once.
*/
function nickname_to_email( username: string, domain: string = STUDENT_EMAIL_DOMAIN ): string {
	const u = as_trimmed_string(username).toLowerCase();
	if( u === '' ) return '';
	if( u.indexOf('@') !== -1 ) return u;
	return u + '@' + as_trimmed_string(domain).toLowerCase();
}


// The value written into users.nickname. 'Bob' + 'Jones' => 'Bob Jones'.
function display_name( first_name: string, last_name: string ): string {
	return (as_trimmed_string(first_name) + ' ' + as_trimmed_string(last_name)).trim();
}


/**
	Validate + normalize one roster row.

	Returns { error: null, value: {...} } on success, or { error: 'message',
	value: null } on the first problem found. The username is lowercased (the
	UNIQUE index is case-sensitive in MySQL's default collation only for some
	setups, and login usernames are always lowercased, so normalizing here
	keeps 'BJ000' and 'bj000' from becoming two students).
*/
function validate_nickname_row( row: any ): IValidationResult {
	const fail = (error: string): IValidationResult => ({ error, value: null });

	if( typeof row !== 'object' || row === null ) return fail('Missing row');

	const username = as_trimmed_string(row.username).toLowerCase();
	if( username === '' ) return fail('Username is required');
	if( username.length > MAX_USERNAME_LENGTH )
		return fail('Username must be ' + MAX_USERNAME_LENGTH + ' characters or fewer');
	// Either a bare campus username or a full address. Anything with a space,
	// a comma, or a second @ is a parsing mistake, not a username.
	if( !/^[a-z0-9._%+-]+(@[a-z0-9.-]+\.[a-z]{2,})?$/.test(username) )
		return fail('"' + username + '" does not look like a username or email address');

	const first_name = as_trimmed_string(row.first_name);
	if( first_name === '' ) return fail('First name is required');
	if( first_name.length > MAX_NAME_LENGTH )
		return fail('First name must be ' + MAX_NAME_LENGTH + ' characters or fewer');

	const last_name = as_trimmed_string(row.last_name);
	if( last_name === '' ) return fail('Last name is required');
	if( last_name.length > MAX_NAME_LENGTH )
		return fail('Last name must be ' + MAX_NAME_LENGTH + ' characters or fewer');

	// Student id is optional: the export leaves it blank for some accounts.
	const student_id = as_trimmed_string(row.student_id);
	if( student_id.length > MAX_STUDENT_ID_LENGTH )
		return fail('Student ID must be ' + MAX_STUDENT_ID_LENGTH + ' characters or fewer');

	return { error: null, value: {
		username,
		first_name,
		last_name,
		student_id: student_id === '' ? null : student_id,
	} };
}


/**
	Validate a whole uploaded roster.

	Bad rows do not sink the upload -- a Blackboard export routinely carries a
	test account or a blank trailing line, and refusing the entire file over one
	of them is useless to the person holding the roster. Every rejection is
	reported back with its row number so it can be fixed or ignored knowingly.

	Duplicates *within one file* keep the last occurrence, matching what the
	database does across uploads.

	@returns { error } if the payload itself is unusable, otherwise
	         { rows, skipped } where skipped is [{ row: 1-based, error }].
*/
function normalize_roster_rows( rows: any ): {
	error: string | null,
	rows: INicknameRow[],
	skipped: Array<{ row: number, error: string }>,
} {
	const fail = (error: string) => ({ error, rows: [], skipped: [] });

	if( !Array.isArray(rows) ) return fail('Missing rows');
	if( rows.length === 0 ) return fail('The file did not contain any student rows');
	if( rows.length > MAX_ROSTER_ROWS )
		return fail('Too many rows (' + rows.length + '). The limit is ' + MAX_ROSTER_ROWS + '.');

	// Map rather than array so a repeated username replaces the earlier row
	// while the surviving rows keep their file order.
	const by_username = new Map<string, INicknameRow>();
	const skipped: Array<{ row: number, error: string }> = [];

	rows.forEach( (row, i) => {
		const { error, value } = validate_nickname_row(row);

		// +1 for 1-based counting; the header line is not part of this array.
		if( error !== null ) return skipped.push({ row: i + 1, error });

		by_username.delete(value.username);
		by_username.set(value.username, value);
	});

	if( by_username.size === 0 )
		return { error: 'No usable rows were found in the file', rows: [], skipped };

	return { error: null, rows: Array.from(by_username.values()), skipped };
}


/**
	Shape a nicknames row for the client, adding the derived email.

	The email is not stored (see the header note), so every read has to compute
	it. Doing that here keeps the two callers -- the list route and the upload
	response -- from disagreeing about the rule.
*/
function shape_nickname_row( row: any ): any {
	return {
		idnickname: row.idnickname,
		username: row.username,
		email: nickname_to_email(row.username),
		first_name: row.first_name,
		last_name: row.last_name,
		nickname: display_name(row.first_name, row.last_name),
		student_id: row.student_id,
		updated: row.updated,
		// Populated by the LEFT JOIN in the list query: whether a user account
		// with this email exists yet, and what nickname it currently carries.
		iduser: typeof row.iduser === 'undefined' ? null : row.iduser,
		user_nickname: typeof row.user_nickname === 'undefined' ? null : row.user_nickname,
	};
}


////////////////////////////////////////////////////////////////////////
//  Nickname <-> user matching
////////////////////////////////////////////////////////////////////////

/*
	The join between users and nicknames, written once.

	MySQL does the domain-appending rather than node so that matching stays a
	single statement -- one UPDATE for the whole roster on upload, one for a
	single account at login. Pulling every user into node to compare strings
	would be the same logic, slower, and duplicated.

	Takes one bind parameter: the default email domain.
*/
const USERS_NICKNAMES_JOIN = `
	INNER JOIN nicknames
		ON LOWER(users.username) = LOWER(
			IF( LOCATE('@', nicknames.username) > 0,
				nicknames.username,
				CONCAT(nicknames.username, '@', ?) ))`;

// Only ever fill a blank nickname. See the header note.
const NICKNAME_IS_BLANK = `(users.nickname IS NULL OR users.nickname = '')`;


/**
	Fill users.nickname for every account that matches an uploaded roster row
	and does not have a nickname yet.

	Runs at the end of an upload, so a student who already has an account picks
	up their name immediately rather than at their next login.

	@returns the number of user rows updated.
*/
async function backfill_nicknames(): Promise<number> {
	const sql = `UPDATE users
		${USERS_NICKNAMES_JOIN}
		SET users.nickname = TRIM(CONCAT(nicknames.first_name, ' ', nicknames.last_name))
		WHERE ${NICKNAME_IS_BLANK}`;

	const result = await run_mysql_query(sql, [STUDENT_EMAIL_DOMAIN]);

	return result && typeof result.affectedRows === 'number' ? result.affectedRows : 0;
}


/**
	Fill one user's nickname from the roster, if it is still blank.

	Called from both login paths in app_users.ts. Deliberately swallows its own
	errors: a student must never be locked out because the nickname table is
	missing or a query is wrong. A failure is logged and login continues.

	@arg username  the account's login email, exactly as stored.
	@returns true if a nickname was written.
*/
async function apply_nickname_on_login( username: string ): Promise<boolean> {
	const clean = as_trimmed_string(username).toLowerCase();
	if( clean === '' ) return false;

	try {
		const sql = `UPDATE users
			${USERS_NICKNAMES_JOIN}
			SET users.nickname = TRIM(CONCAT(nicknames.first_name, ' ', nicknames.last_name))
			WHERE LOWER(users.username) = ? AND ${NICKNAME_IS_BLANK}`;

		const result = await run_mysql_query(sql, [STUDENT_EMAIL_DOMAIN, clean]);

		return !!(result && result.affectedRows > 0);

	} catch (e) {
		log_error(e);
		return false;
	}
}


////////////////////////////////////////////////////////////////////////
//  Routes
////////////////////////////////////////////////////////////////////////


// Every nickname, with the matching account (if the student has one yet).
router.get('/',
	nocache, user_require_logged_in, user_require_admin,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		// LEFT OUTER JOIN so a roster entry for a student who has not signed up
		// still appears -- that gap is exactly what the admin wants to see.
		const sql = `SELECT nicknames.idnickname, nicknames.username,
					nicknames.first_name, nicknames.last_name,
					nicknames.student_id, nicknames.updated,
					users.iduser, users.nickname AS user_nickname
				FROM nicknames
				LEFT OUTER JOIN users
					ON LOWER(users.username) = LOWER(
						IF( LOCATE('@', nicknames.username) > 0,
							nicknames.username,
							CONCAT(nicknames.username, '@', ?) ))
				ORDER BY nicknames.last_name ASC, nicknames.first_name ASC`;

		const rows = await run_mysql_query(sql, [STUDENT_EMAIL_DOMAIN]);

		res.json({
			domain: STUDENT_EMAIL_DOMAIN,
			nicknames: rows.map(shape_nickname_row),
		});

	} catch (e) {
		log_error(e);
		next(e);
	}
});


/*
	Upload a parsed roster.

	Body: { rows: [{ username, first_name, last_name, student_id }] }

	The client has already turned the Blackboard export into these four fields
	(src/app/admin/nicknameParser.ts). Existing usernames are replaced; new ones
	are inserted; nothing is ever deleted, so uploading one section's roster
	does not wipe another's.
*/
router.post('/',
	nocache, user_require_logged_in, user_require_admin,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		if( typeof req.body !== 'object' || req.body === null )
			return res.status(400).json({ error: 'Missing request body' });

		const { error, rows, skipped } = normalize_roster_rows(req.body.rows);
		if( error !== null ) return res.status(400).json({ error, skipped });

		const updated = from_utc_to_myql(to_utc(new Date()));

		/*
			One bulk upsert. mysql2 expands a nested array against the single `?`
			after VALUES, so this is one round trip for the whole roster.

			VALUES(col) in the UPDATE clause is deprecated in MySQL 8.0.20+ but
			still works, and unlike the `AS new` alias form it also runs on 5.7 --
			the same compatibility line sql27 draws.
		*/
		const values = rows.map( r => [r.username, r.first_name, r.last_name, r.student_id, updated] );

		const sql = `INSERT INTO nicknames
				(username, first_name, last_name, student_id, updated)
			VALUES ?
			ON DUPLICATE KEY UPDATE
				first_name = VALUES(first_name),
				last_name = VALUES(last_name),
				student_id = VALUES(student_id),
				updated = VALUES(updated)`;

		// The return value is deliberately dropped -- see the note below on why
		// affectedRows cannot be reported as a row count.
		await run_mysql_query(sql, [values]);

		/*
			Report rows.length, not result.affectedRows. On an upsert MySQL counts
			1 for an insert, 2 for a duplicate it actually changed, and 0 for a
			duplicate whose values were already identical, so affectedRows cannot
			be turned back into "how many students are now stored". The row count
			we sent is unambiguous, and the table on screen shows the result.
		*/
		const stored = rows.length;

		// Give existing accounts their name now rather than at next login.
		const backfilled = await backfill_nicknames();

		res.json({
			stored,
			backfilled,
			skipped,
			domain: STUDENT_EMAIL_DOMAIN,
		});

	} catch (e) {
		log_error(e);
		next(e);
	}
});


/*
	Remove one nickname.

	Deliberately does NOT clear users.nickname. The name is already the
	student's own, and blanking it would make every report they appear in
	revert to a campus username with no warning. Delete here means "stop
	tracking this roster row".
*/
router.delete('/:idnickname',
	nocache, user_require_logged_in, user_require_admin,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const idnickname = Number(req.params.idnickname);
		if( !Number.isInteger(idnickname) || idnickname <= 0 )
			return res.status(400).json({ error: 'A valid nickname id is required' });

		const result = await run_mysql_query(
			'DELETE FROM nicknames WHERE idnickname = ?', [idnickname]);

		const removed = result && typeof result.affectedRows === 'number' ? result.affectedRows : 0;

		// Report a no-op honestly rather than a misleading success, which is
		// what a stale button click looks like.
		if( removed === 0 )
			return res.status(404).json({ error: 'That nickname no longer exists' });

		res.json({ removed });

	} catch (e) {
		log_error(e);
		next(e);
	}
});


const app_nicknames = router;

// Helpers exported for unit testing and for the login hook in app_users.ts.
export {
	app_nicknames,
	apply_nickname_on_login,
	backfill_nicknames,
	validate_nickname_row,
	normalize_roster_rows,
	nickname_to_email,
	display_name,
	shape_nickname_row,
	MAX_ROSTER_ROWS,
	MAX_NAME_LENGTH,
	MAX_USERNAME_LENGTH,
	MAX_STUDENT_ID_LENGTH,
};
