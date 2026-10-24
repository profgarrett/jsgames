/**
	Admin module.

	A small super-admin-only surface for managing users and sections:

		GET    /api/admin/users         every user + the sections they belong to
		POST   /api/admin/users         create a user (optionally in a section)
		GET    /api/admin/sections      every section
		POST   /api/admin/sections      create a section
		POST   /api/admin/enrollments   join a user to a section
		POST   /api/admin/enrollments/bulk   join a pasted list of usernames to a section
		DELETE /api/admin/enrollments   remove a user from a section

	Every route is behind user_require_logged_in + user_require_admin, so the
	whole router is reachable only by ADMIN_USERNAME from secret.js. The client
	gate in AdminContainer.tsx is a convenience; this is the real boundary.

	Design notes worth knowing before changing anything here:

	- One enrollment per (user, section). sql27 added a unique index on
	  users_sections(iduser, idsection); a repeat join is a 409, never an
	  update of the existing row.
	- There is deliberately no role-change route. Moving someone from student
	  to faculty means DELETE then POST.
	- Removing a section's last faculty member is allowed. It makes the section
	  invisible to the faculty UI (see is_faculty in mysql.ts), but it stays
	  reachable from /admin.
	- Bulk enrollment only ever joins accounts that already exist. A student who
	  has never logged in has no users row, and is reported back rather than
	  created; their account appears on first Google login.
	- All validation lives in exported pure functions so it can be unit tested
	  without a database. See test/app_admin.test.cjs.
*/
import express from 'express';
const router = express.Router();

import { run_mysql_query } from './mysql';
import {
	nocache, log_error, hash_password,
	user_require_logged_in, user_require_admin } from './network';
import { nickname_to_email } from './app_nicknames';
import { STUDENT_EMAIL_DOMAIN } from './secret';

import type { Request, Response, NextFunction } from 'express';


// Roles a user may hold in a section. Mirrors VALID_ROLES in scripts/createuser.cjs.
const VALID_ROLES = ['student', 'faculty', 'admin'];

// The sentinel stored in sections.levels meaning "use DEFAULT_TUTORIAL_LEVEL_LIST".
// See MyProgress.get_list(), which is the only reader of that column.
const DEFAULT_LEVELS = '?';

// Minimum password length for admin-created accounts.
const MIN_PASSWORD_LENGTH = 8;

// Upper bound on one bulk-enrollment paste. Comfortably above any real class
// list, low enough that a stray paste cannot become an unbounded IN (...).
const MAX_BULK_USERNAMES = 2000;

// Role given to everyone joined by the bulk route.
const BULK_ROLE = 'student';


interface IValidationResult {
	error: string | null;
	value: any;
}


////////////////////////////////////////////////////////////////////////
//  Validation (pure, exported for testing)
////////////////////////////////////////////////////////////////////////


// Coerce to a trimmed string. Numbers are allowed through; objects are not.
function as_trimmed_string( v: any ): string {
	if( typeof v === 'string' ) return v.trim();
	if( typeof v === 'number' && isFinite(v) ) return String(v);
	return '';
}


// A positive integer id, or null if the value isn't one.
function as_id( v: any ): number | null {
	const n = typeof v === 'string' ? Number(v.trim()) : v;
	if( typeof n !== 'number' || !Number.isInteger(n) || n <= 0 ) return null;
	return n;
}


// YYYY-MM-DD, and a date that actually exists (rejects 2026-02-31).
function is_valid_date( s: string ): boolean {
	if( !/^\d{4}-\d{2}-\d{2}$/.test(s) ) return false;
	const [y, m, d] = s.split('-').map(Number);
	if( m < 1 || m > 12 || d < 1 || d > 31 ) return false;
	const parsed = new Date(Date.UTC(y, m - 1, d));
	return parsed.getUTCFullYear() === y
		&& parsed.getUTCMonth() === m - 1
		&& parsed.getUTCDate() === d;
}


/**
	Validate + normalize the body of POST /api/admin/sections.

	Returns { error: null, value: {...} } on success, or { error: 'message',
	value: null } on the first problem found.
*/
function validate_section_input( body: any ): IValidationResult {
	const fail = (error: string): IValidationResult => ({ error, value: null });

	if( typeof body !== 'object' || body === null ) return fail('Missing request body');

	const code = as_trimmed_string(body.code).toLowerCase();
	if( code === '' ) return fail('Code is required');
	if( code.length > 45 ) return fail('Code must be 45 characters or fewer');
	if( !/^[a-z0-9_-]+$/.test(code) ) return fail('Code may only contain letters, numbers, hyphens, and underscores');

	const title = as_trimmed_string(body.title);
	if( title === '' ) return fail('Title is required');
	if( title.length > 115 ) return fail('Title must be 115 characters or fewer');

	const year = as_id(body.year);
	if( year === null || year < 2000 || year > 2100 ) return fail('Year must be between 2000 and 2100');

	const term = as_trimmed_string(body.term);
	if( term === '' ) return fail('Term is required');
	if( term.length > 45 ) return fail('Term must be 45 characters or fewer');

	const opens = as_trimmed_string(body.opens);
	if( !is_valid_date(opens) ) return fail('Opens must be a valid date (YYYY-MM-DD)');

	const closes = as_trimmed_string(body.closes);
	if( !is_valid_date(closes) ) return fail('Closes must be a valid date (YYYY-MM-DD)');
	if( closes < opens ) return fail('Closes must not be before opens');

	// levels is optional. Blank of any kind becomes the '?' sentinel, which
	// MyProgress expands into the default tutorial list.
	let levels = as_trimmed_string(body.levels);
	if( levels === '' ) levels = DEFAULT_LEVELS;
	if( levels.length > 4096 ) return fail('Levels list is too long');
	if( !/^[a-z0-9_,?-]+$/.test(levels) ) return fail('Levels may only contain lowercase level codes, commas, and ?');

	return { error: null, value: { code, title, year, term, opens, closes, levels } };
}


/**
	Validate the body of POST/DELETE /api/admin/enrollments.

	@arg require_role  false for DELETE, which has no role to check.
*/
function validate_enrollment_input( body: any, require_role: boolean = true ): IValidationResult {
	const fail = (error: string): IValidationResult => ({ error, value: null });

	if( typeof body !== 'object' || body === null ) return fail('Missing request body');

	const iduser = as_id(body.iduser);
	if( iduser === null ) return fail('A valid user is required');

	const idsection = as_id(body.idsection);
	if( idsection === null ) return fail('A valid section is required');

	if( !require_role ) return { error: null, value: { iduser, idsection } };

	const role = as_trimmed_string(body.role).toLowerCase();
	if( !VALID_ROLES.includes(role) ) return fail('Role must be one of: ' + VALID_ROLES.join(', '));

	return { error: null, value: { iduser, idsection, role } };
}


/**
	Validate + normalize the body of POST /api/admin/enrollments/bulk.

	`usernames` is the pasted text already split into lines by the client.
	Each line is trimmed and lowercased (login usernames always are); blank
	lines and exact repeats are dropped so the result lists each once.
*/
function validate_bulk_enrollment_input( body: any ): IValidationResult {
	const fail = (error: string): IValidationResult => ({ error, value: null });

	if( typeof body !== 'object' || body === null ) return fail('Missing request body');

	const idsection = as_id(body.idsection);
	if( idsection === null ) return fail('A valid section is required');

	if( !Array.isArray(body.usernames) ) return fail('A list of usernames is required');

	const seen = new Set<string>();
	const usernames: string[] = [];

	for( const raw of body.usernames ) {
		const u = as_trimmed_string(raw).toLowerCase();
		if( u === '' || seen.has(u) ) continue;
		if( u.length > 255 ) return fail('Username is too long: ' + u.slice(0, 40) + '...');
		seen.add(u);
		usernames.push(u);
	}

	if( usernames.length === 0 ) return fail('Paste at least one username');
	if( usernames.length > MAX_BULK_USERNAMES )
		return fail('At most ' + MAX_BULK_USERNAMES + ' usernames at a time');

	return { error: null, value: { idsection, usernames } };
}


/**
	The account usernames one pasted line could refer to.

	Students log in with their campus email, but a class list often carries
	only the bare username. 'bj000' therefore also tries 'bj000@<domain>', by
	the same rule nicknames use (nickname_to_email). The exact value is listed
	first so it wins if both somehow exist.
*/
function bulk_candidates( line: string, domain: string = STUDENT_EMAIL_DOMAIN ): string[] {
	const email = nickname_to_email(line, domain);
	return email === '' || email === line ? [line] : [line, email];
}


/**
	Decide what happens to each pasted line.

	@arg lines     normalized usernames from validate_bulk_enrollment_input
	@arg users     { iduser, username } rows matching any bulk_candidates value
	@arg enrolled  iduser values already in the target section, in any role
	@arg domain    STUDENT_EMAIL_DOMAIN

	Each line gets exactly one status:
		'added'       matched an account not yet in the section
		'already'     matched an account already in the section (role untouched)
		'no_account'  matched nothing. The student has not logged in yet, so
		              there is nothing to join; they are left alone.
		'duplicate'   matched the same account as an earlier line
		              ('bj000' and 'bj000@mix.wvu.edu')
*/
function plan_bulk_enrollment(
		lines: string[],
		users: Array<any>,
		enrolled: Array<number>,
		domain: string = STUDENT_EMAIL_DOMAIN ): Array<any> {

	const by_username = new Map<string, any>();
	users.forEach( u => by_username.set(String(u.username).toLowerCase(), u) );

	const enrolled_set = new Set(enrolled);
	const claimed = new Set<number>();

	return lines.map( line => {
		const match = bulk_candidates(line, domain)
			.map( c => by_username.get(c) )
			.find( u => typeof u !== 'undefined' );

		if( !match ) return { line, iduser: null, username: null, status: 'no_account' };

		const found = { line, iduser: match.iduser, username: match.username };

		if( claimed.has(match.iduser) ) return { ...found, status: 'duplicate' };
		claimed.add(match.iduser);

		if( enrolled_set.has(match.iduser) ) return { ...found, status: 'already' };
		return { ...found, status: 'added' };
	});
}


/**
	Validate + normalize the body of POST /api/admin/users.

	idsection/role are optional. When idsection is present the caller enrolls
	the new user immediately; when absent the account is created with no
	section and can be joined later.

	Note this deliberately differs from scripts/createuser.cjs, which updates
	the password of an existing username. Here a duplicate username is an
	error -- a create form should not double as a silent password reset.
*/
function validate_user_input( body: any ): IValidationResult {
	const fail = (error: string): IValidationResult => ({ error, value: null });

	if( typeof body !== 'object' || body === null ) return fail('Missing request body');

	// Same normalization as normalizeUsername() in scripts/createadmin.cjs.
	const username = as_trimmed_string(body.username).toLowerCase();
	if( username === '' ) return fail('Username is required');
	if( username.length > 255 ) return fail('Username must be 255 characters or fewer');

	// Passwords are not trimmed -- leading/trailing spaces are legitimate.
	const password = typeof body.password === 'string' ? body.password : '';
	if( password === '' ) return fail('Password is required');
	if( password.length < MIN_PASSWORD_LENGTH )
		return fail('Password must be at least ' + MIN_PASSWORD_LENGTH + ' characters');

	// Optional section membership.
	const has_section = typeof body.idsection !== 'undefined'
		&& body.idsection !== null
		&& body.idsection !== '';

	if( !has_section ) return { error: null, value: { username, password, idsection: null, role: null } };

	const idsection = as_id(body.idsection);
	if( idsection === null ) return fail('A valid section is required');

	const role = as_trimmed_string(body.role).toLowerCase() || 'student';
	if( !VALID_ROLES.includes(role) ) return fail('Role must be one of: ' + VALID_ROLES.join(', '));

	return { error: null, value: { username, password, idsection, role } };
}


/**
	Fold the flat rows of the users+enrollments join into one object per user.

	The LEFT OUTER JOIN gives a user with no sections a single row with null
	section columns; those become an empty sections array rather than an
	array holding a null.
*/
function shape_users_rows( rows: Array<any> ): Array<any> {
	const by_id = new Map();

	rows.forEach( row => {
		if( !by_id.has(row.iduser) ) {
			by_id.set(row.iduser, {
				iduser: row.iduser,
				username: row.username,
				sections: [],
			});
		}

		if( row.idsection === null || typeof row.idsection === 'undefined' ) return;

		by_id.get(row.iduser).sections.push({
			idsection: row.idsection,
			code: row.code,
			title: row.title,
			year: row.year,
			term: row.term,
			role: row.role,
		});
	});

	return Array.from(by_id.values());
}


/**
	Which sections may this user still be joined to?

	One enrollment per (user, section), so anything they already belong to is
	filtered out. Used by the client to keep impossible options out of the
	join dropdown; the 409 in the POST route is the actual guard.
*/
function sections_available_to_user( sections: Array<any>, user: any ): Array<any> {
	if( !user ) return sections;
	const taken = new Set( (user.sections || []).map( (s: any) => s.idsection ) );
	return sections.filter( s => !taken.has(s.idsection) );
}


////////////////////////////////////////////////////////////////////////
//  Users
////////////////////////////////////////////////////////////////////////


// Every user, with the sections they belong to.
router.get('/users',
	nocache, user_require_logged_in, user_require_admin,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		// Explicit column list: hashed_password, google_sub, and ip must never
		// leave the server.
		const sql = `SELECT users.iduser, users.username,
					sections.idsection, sections.code, sections.title,
					sections.year, sections.term, users_sections.role
				FROM users
				LEFT OUTER JOIN users_sections ON users.iduser = users_sections.iduser
				LEFT OUTER JOIN sections ON users_sections.idsection = sections.idsection
				ORDER BY users.username ASC, sections.code ASC`;

		const rows = await run_mysql_query(sql);
		res.json( shape_users_rows(rows) );

	} catch (e) {
		log_error(e);
		next(e);
	}
});


// Create a user, optionally enrolling them in a section at the same time.
router.post('/users',
	nocache, user_require_logged_in, user_require_admin,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const { error, value } = validate_user_input(req.body);
		if( error !== null ) return res.status(400).json({ error });

		const existing = await run_mysql_query(
			'SELECT iduser FROM users WHERE username = ? LIMIT 1', [value.username]);
		if( existing.length > 0 )
			return res.status(409).json({ error: 'That username already exists' });

		// If a section was given, make sure it is real before creating the user,
		// so a typo doesn't leave a half-configured account behind.
		if( value.idsection !== null ) {
			const section = await run_mysql_query(
				'SELECT idsection FROM sections WHERE idsection = ? LIMIT 1', [value.idsection]);
			if( section.length === 0 )
				return res.status(404).json({ error: 'That section does not exist' });
		}

		// ip is left blank: elsewhere it records the user's own signup address,
		// and storing the admin's would be misleading. google_sub stays null so
		// the account can still be linked on a future Google login.
		const insert = await run_mysql_query(
			`INSERT INTO users (username, hashed_password, ip, auth_provider)
				VALUES (?, ?, '', 'password')`,
			[value.username, hash_password(value.password)]);

		const iduser = insert.insertId;

		if( value.idsection !== null ) {
			await run_mysql_query(
				'INSERT INTO users_sections (iduser, idsection, role) VALUES (?, ?, ?)',
				[iduser, value.idsection, value.role]);
		}

		// Never echo the password or its hash.
		res.json({ iduser: iduser, username: value.username });

	} catch (e: any) {
		if( e && e.code === 'ER_DUP_ENTRY' )
			return res.status(409).json({ error: 'That username already exists' });
		log_error(e);
		next(e);
	}
});


////////////////////////////////////////////////////////////////////////
//  Sections
////////////////////////////////////////////////////////////////////////


// Every section. Unlike GET /api/sections, this is not scoped to the caller.
router.get('/sections',
	nocache, user_require_logged_in, user_require_admin,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const sql = `SELECT idsection, code, title, year, term, opens, closes, levels
				FROM sections
				ORDER BY year DESC, term ASC, code ASC`;

		const sections = await run_mysql_query(sql);
		res.json(sections);

	} catch (e) {
		log_error(e);
		next(e);
	}
});


// Create a section.
router.post('/sections',
	nocache, user_require_logged_in, user_require_admin,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const { error, value } = validate_section_input(req.body);
		if( error !== null ) return res.status(400).json({ error });

		const insert = await run_mysql_query(
			`INSERT INTO sections (code, title, year, term, opens, closes, levels)
				VALUES (?, ?, ?, ?, ?, ?, ?)`,
			[value.code, value.title, value.year, value.term, value.opens, value.closes, value.levels]);

		res.json({ idsection: insert.insertId, ...value });

	} catch (e: any) {
		// sections.code carries a unique index; let the DB be the arbiter
		// rather than racing a check-then-insert.
		if( e && e.code === 'ER_DUP_ENTRY' )
			return res.status(409).json({ error: 'A section with that code already exists' });
		log_error(e);
		next(e);
	}
});


////////////////////////////////////////////////////////////////////////
//  Enrollments
////////////////////////////////////////////////////////////////////////


// Join a user to a section. Never updates an existing membership.
router.post('/enrollments',
	nocache, user_require_logged_in, user_require_admin,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const { error, value } = validate_enrollment_input(req.body, true);
		if( error !== null ) return res.status(400).json({ error });

		const user = await run_mysql_query(
			'SELECT iduser FROM users WHERE iduser = ? LIMIT 1', [value.iduser]);
		if( user.length === 0 ) return res.status(404).json({ error: 'That user does not exist' });

		const section = await run_mysql_query(
			'SELECT idsection FROM sections WHERE idsection = ? LIMIT 1', [value.idsection]);
		if( section.length === 0 ) return res.status(404).json({ error: 'That section does not exist' });

		const insert = await run_mysql_query(
			'INSERT INTO users_sections (iduser, idsection, role) VALUES (?, ?, ?)',
			[value.iduser, value.idsection, value.role]);

		res.json({ idusers_sections: insert.insertId, ...value });

	} catch (e: any) {
		// The unique index from sql27. A repeat join is an error, not an
		// upsert: to change a role, remove the membership and add it back.
		if( e && e.code === 'ER_DUP_ENTRY' )
			return res.status(409).json({
				error: 'That user is already enrolled in that section. To change their role, remove them first.' });
		log_error(e);
		next(e);
	}
});


/*
	Join a pasted list of usernames to one section, as students.

	Only existing accounts are touched. Anyone already in the section (in any
	role) is left as they are, and a line that matches no account -- a student
	who has not logged in yet -- is reported and skipped. Running the same list
	again later picks up the students who have logged in since.

	Three queries regardless of list size (users, current memberships, one bulk
	insert): run_mysql_query opens a fresh connection per call, so a per-line
	loop would be one connection per student.
*/
router.post('/enrollments/bulk',
	nocache, user_require_logged_in, user_require_admin,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const { error, value } = validate_bulk_enrollment_input(req.body);
		if( error !== null ) return res.status(400).json({ error });

		const section = await run_mysql_query(
			'SELECT idsection, code FROM sections WHERE idsection = ? LIMIT 1', [value.idsection]);
		if( section.length === 0 ) return res.status(404).json({ error: 'That section does not exist' });

		const candidates = Array.from(new Set(
			value.usernames.flatMap( (u: string) => bulk_candidates(u) ) ));

		const users = await run_mysql_query(
			'SELECT iduser, username FROM users WHERE username IN (?)', [candidates]);

		const ids = users.map( (u: any) => u.iduser );
		const enrolled = ids.length === 0 ? [] : (await run_mysql_query(
			'SELECT iduser FROM users_sections WHERE idsection = ? AND iduser IN (?)',
			[value.idsection, ids])).map( (r: any) => r.iduser );

		const results = plan_bulk_enrollment(value.usernames, users, enrolled);
		const to_add = results.filter( r => r.status === 'added' );

		if( to_add.length > 0 ) {
			// IGNORE: if someone joins between the SELECT above and this insert,
			// the sql27 unique index makes that row a no-op instead of failing
			// the whole batch. The user and section were both just confirmed to
			// exist, so a foreign-key miss is not being hidden.
			await run_mysql_query(
				'INSERT IGNORE INTO users_sections (iduser, idsection, role) VALUES ?',
				[to_add.map( r => [r.iduser, value.idsection, BULK_ROLE] )]);
		}

		const count = (status: string): number => results.filter( r => r.status === status ).length;

		res.json({
			idsection: value.idsection,
			code: section[0].code,
			role: BULK_ROLE,
			added: count('added'),
			already: count('already'),
			no_account: count('no_account'),
			duplicate: count('duplicate'),
			results,
		});

	} catch (e) {
		log_error(e);
		next(e);
	}
});


// Remove a user from a section.
//
// No last-faculty guard: the admin may strip a section's only faculty member.
// That hides the section from the faculty UI (is_faculty in mysql.ts), but it
// remains manageable here. The student's levels, quiz results, and pageviews
// all key off iduser and are untouched.
router.delete('/enrollments',
	nocache, user_require_logged_in, user_require_admin,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const { error, value } = validate_enrollment_input(req.body, false);
		if( error !== null ) return res.status(400).json({ error });

		const result = await run_mysql_query(
			'DELETE FROM users_sections WHERE iduser = ? AND idsection = ?',
			[value.iduser, value.idsection]);

		const removed = result && typeof result.affectedRows === 'number' ? result.affectedRows : 0;

		// Report a no-op honestly instead of a misleading success, which is
		// what a stale button click looks like.
		if( removed === 0 )
			return res.status(404).json({ error: 'That user is not enrolled in that section' });

		res.json({ removed });

	} catch (e) {
		log_error(e);
		next(e);
	}
});


const app_admin = router;

// Helpers exported for unit testing.
export {
	app_admin,
	validate_section_input,
	validate_enrollment_input,
	validate_user_input,
	validate_bulk_enrollment_input,
	bulk_candidates,
	plan_bulk_enrollment,
	shape_users_rows,
	sections_available_to_user,
	is_valid_date,
	VALID_ROLES,
	DEFAULT_LEVELS,
	MIN_PASSWORD_LENGTH,
	MAX_BULK_USERNAMES,
};
