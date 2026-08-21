/**
	Admin traffic report.

	Aggregates the `pageviews` table (see app_pageviews.ts, which writes it),
	optionally scoped to the members of a single section.

		GET /api/admin/traffic/pages   one row per page
		GET /api/admin/traffic/users   one row per user

	The two are deliberately symmetric: each accepts the other's key as a
	filter, so the same pair of routes serves both directions of the report.

		/pages                  every page, most-engaged first
		/pages?username=a@b.com the pages that one user spent time on
		/users                  every user, most-engaged first
		/users?page=/pages/x    the users who spent time on one page

	Both routes are behind user_require_logged_in + user_require_admin, so the
	whole surface is reachable only by ADMIN_USERNAME from secret.js. The client
	gate in AdminTrafficContainer.tsx is a convenience; this is the boundary.

	Three numbers per page, and they are not interchangeable:

	  views          rows in `pageviews`. A row is a *sitting*, not a hit: a
	                 reload or a quick detour inside the reuse window resumes
	                 the existing row rather than adding one.
	  open_seconds   summed wall-clock time the page was open (end - start).
	                 Includes idle gaps mid-visit.
	  active_seconds summed engaged time, gaps excluded. Client-reported, but
	                 clamped server-side to open wall-clock time and monotonic
	                 (see build_heartbeat_update in app_pageviews.ts).

	active_seconds is the honest answer to "how long did they actually spend
	here", which is why it is the default sort.

	Date filtering keys off start_datetime, so a visit is counted in the day it
	began even if it ran past midnight. The alternative -- counting a visit in
	every day it touched -- would make the per-page totals stop adding up.

	Validation lives in exported pure functions so it can be unit tested without
	a database. See test/app_traffic.test.cjs.
*/
import express from 'express';
const router = express.Router();

import { run_mysql_query } from './mysql';
import { nocache, log_error, user_require_logged_in, user_require_admin } from './network';

import type { Request, Response, NextFunction } from 'express';


// Most pages returned by /pages. A course has tens of pages, not hundreds; the
// cap exists so a mistyped filter can't stream the whole table to the browser.
const MAX_PAGES = 500;

// Most users returned by /users for a single page.
const MAX_USERS = 500;

// Longest window the report will look back over when no dates are given.
const DEFAULT_DAYS = 30;


////////////////////////////////////////////////////////////////////////
//  Parsing (pure, exported for testing)
////////////////////////////////////////////////////////////////////////


// A positive integer id, or null if the value isn't one.
function parse_id( v: any ): number | null {
	const n = typeof v === 'string' ? Number(v.trim()) : v;
	if( typeof n !== 'number' || !Number.isInteger(n) || n <= 0 ) return null;
	return n;
}


// A YYYY-MM-DD string that names a real date, or null. Rejects 2026-02-31.
function parse_date( v: any ): string | null {
	if( typeof v !== 'string' ) return null;
	const s = v.trim();
	if( !/^\d{4}-\d{2}-\d{2}$/.test(s) ) return null;

	const [y, m, d] = s.split('-').map(Number);
	const parsed = new Date(Date.UTC(y, m - 1, d));
	if( parsed.getUTCFullYear() !== y ) return null;
	if( parsed.getUTCMonth() !== m - 1 ) return null;
	if( parsed.getUTCDate() !== d ) return null;

	return s;
}


// The day after the given YYYY-MM-DD, used as the exclusive upper bound so the
// end date the admin typed is itself included. Handles month and year rollover
// via Date rather than string arithmetic.
function next_day( date: string ): string {
	const [y, m, d] = date.split('-').map(Number);
	const next = new Date(Date.UTC(y, m - 1, d + 1));
	return next.toISOString().slice(0, 10);
}


// Truthy query-string flag. Absent means false, since both filters here
// (students-only) narrow the result and should be opt-in.
function parse_flag( v: any ): boolean {
	if( typeof v !== 'string' ) return false;
	const s = v.trim().toLowerCase();
	return s === '1' || s === 'true' || s === 'yes';
}


// A non-empty query-string value, trimmed, or null. Used for the page and
// username scoping filters, where an empty string means "not filtering" rather
// than "match the empty string".
function parse_text( v: any ): string | null {
	if( typeof v !== 'string' ) return null;
	const s = v.trim();
	return s === '' ? null : s;
}


// YYYY-MM-DD for a date DEFAULT_DAYS ago, the start bound when none is given.
function default_start( now: Date = new Date() ): string {
	const then = new Date(now.getTime() - DEFAULT_DAYS * 24 * 60 * 60 * 1000);
	return then.toISOString().slice(0, 10);
}


/**
	Turn the query string into the WHERE fragment both routes share.

	Returned as { where, values } rather than an interpolated string so every
	user-supplied value stays a bound parameter. `where` always begins with a
	real predicate, so callers can append to it unconditionally.

	The section filter is an EXISTS subquery rather than a JOIN on purpose: a
	join would multiply the pageview rows by the number of matching enrollments,
	silently inflating every count.

	`page` and `username` are exact-match predicates that scope the report to one
	row of the opposite view -- they are what makes a drill-down in either
	direction sum back to the row it was opened from.

	@arg query  req.query
	@arg now    injectable for testing the default window
*/
function build_traffic_filter( query: any, now: Date = new Date() ):
		{ where: string, values: Array<string | number>, filter: any } {

	const q = (query || {}) as Record<string, unknown>;

	const start = parse_date(q.start) ?? default_start(now);
	// A malformed or missing end date means "up to and including today".
	const end = parse_date(q.end) ?? new Date(now.getTime()).toISOString().slice(0, 10);
	const idsection = parse_id(q.idsection);
	const students_only = parse_flag(q.students_only);
	const page = parse_text(q.page);
	const username = parse_text(q.username);

	const clauses: Array<string> = [
		'pageviews.start_datetime >= ?',
		'pageviews.start_datetime < ?',
	];
	const values: Array<string | number> = [ start + ' 00:00:00', next_day(end) + ' 00:00:00' ];

	/*
		Membership is matched through users.username because pageviews stores the
		username, not an iduser. Both columns are indexed, and the subquery runs
		once per candidate row.
	*/
	if( page !== null ) {
		clauses.push('pageviews.page = ?');
		values.push(page);
	}

	if( username !== null ) {
		clauses.push('pageviews.username = ?');
		values.push(username);
	}

	if( idsection !== null || students_only ) {
		const conditions: Array<string> = ['users.username = pageviews.username'];

		if( idsection !== null ) {
			conditions.push('users_sections.idsection = ?');
			values.push(idsection);
		}

		if( students_only ) conditions.push("users_sections.role = 'student'");

		clauses.push(`EXISTS (
			SELECT 1 FROM users
				INNER JOIN users_sections ON users_sections.iduser = users.iduser
				WHERE ${conditions.join(' AND ')} )`);
	}

	return {
		where: clauses.join(' AND '),
		values,
		// Echoed back so the client can show what was actually applied, including
		// the dates it did not supply.
		filter: { start, end, idsection, students_only, page, username },
	};
}


////////////////////////////////////////////////////////////////////////
//  Routes
////////////////////////////////////////////////////////////////////////


/*
	One row per page.

	Sorted by engaged time descending, which puts the pages students actually
	worked through at the top rather than the ones they merely opened.

	With ?username= it becomes "what did this person work on", which is the
	drill-down under a row of the by-user view.
*/
router.get('/pages',
	nocache, user_require_logged_in, user_require_admin,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const { where, values, filter } = build_traffic_filter(req.query);

		const sql = `SELECT pageviews.page AS page,
					COUNT(*) AS views,
					COUNT(DISTINCT pageviews.username) AS users,
					COALESCE(SUM(pageviews.active_seconds), 0) AS active_seconds,
					COALESCE(SUM(TIMESTAMPDIFF(SECOND, pageviews.start_datetime, pageviews.end_datetime)), 0) AS open_seconds,
					DATE_FORMAT(MAX(pageviews.end_datetime), '%Y-%m-%dT%TZ') AS last_datetime
				FROM pageviews
				WHERE ${where}
				GROUP BY pageviews.page
				ORDER BY active_seconds DESC, views DESC
				LIMIT ${MAX_PAGES}`;

		const rows = await run_mysql_query(sql, values);

		res.json({ filter, pages: rows.map(shape_page_row) });

	} catch (e) {
		log_error(e);
		next(e);
	}
});


/*
	One row per user.

	With ?page= it is the drill-down under a page row: same filter, so those
	rows always sum back to the page row they were opened from. Without it, it
	is the by-user view -- who has been working, and how much.
*/
router.get('/users',
	nocache, user_require_logged_in, user_require_admin,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const { where, values, filter } = build_traffic_filter(req.query);

		const sql = `SELECT pageviews.username AS username,
					COUNT(*) AS views,
					COUNT(DISTINCT pageviews.page) AS pages,
					COALESCE(SUM(pageviews.active_seconds), 0) AS active_seconds,
					COALESCE(SUM(TIMESTAMPDIFF(SECOND, pageviews.start_datetime, pageviews.end_datetime)), 0) AS open_seconds,
					DATE_FORMAT(MAX(pageviews.end_datetime), '%Y-%m-%dT%TZ') AS last_datetime
				FROM pageviews
				WHERE ${where}
				GROUP BY pageviews.username
				ORDER BY active_seconds DESC, username ASC
				LIMIT ${MAX_USERS}`;

		const rows = await run_mysql_query(sql, values);

		res.json({ filter, users: rows.map(shape_user_row) });

	} catch (e) {
		log_error(e);
		next(e);
	}
});


/*
	mysql2 hands COUNT/SUM back as strings once they overflow an int, and
	DECIMAL sums always come back as strings. Normalize to numbers here so the
	client never has to guess, and so a sort in the table is numeric.
*/
function shape_page_row( row: any ): any {
	return {
		page: row.page,
		views: Number(row.views),
		users: Number(row.users),
		active_seconds: Number(row.active_seconds),
		open_seconds: Number(row.open_seconds),
		last_datetime: row.last_datetime,
	};
}

/*
	`pages` is absent from the per-page drill-down (every row there is the same
	single page, so the count would be a column of 1s) and present in the
	by-user view. Number(undefined) is NaN, so it is only converted when the
	query actually selected it.
*/
function shape_user_row( row: any ): any {
	const shaped: any = {
		username: row.username,
		views: Number(row.views),
		active_seconds: Number(row.active_seconds),
		open_seconds: Number(row.open_seconds),
		last_datetime: row.last_datetime,
	};

	if( typeof row.pages !== 'undefined' ) shaped.pages = Number(row.pages);

	return shaped;
}


const app_traffic = router;

// Helpers exported for unit testing.
export {
	app_traffic,
	parse_id,
	parse_date,
	next_day,
	parse_flag,
	parse_text,
	default_start,
	build_traffic_filter,
	shape_page_row,
	shape_user_row,
	DEFAULT_DAYS,
	MAX_PAGES,
	MAX_USERS,
};
