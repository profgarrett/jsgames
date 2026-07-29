/**
	Server-side routes for pageview tracking.

	One row per page *session* by a logged-in user. The client posts an initial
	"load" event when a page opens, then sends a "heartbeat" every 30 seconds
	that advances end_datetime.

	Three measures of a visit:
	  (end_datetime    - start_datetime)  how long the page was open
	  (active_datetime - start_datetime)  when engagement last happened
	  active_seconds                      how long it was actually being used

	They differ because a tab left open in the background keeps sending
	heartbeats. Each heartbeat carries an `active` flag (see PageviewTracker:
	tab visible + window focused + recent interaction); only active heartbeats
	advance active_datetime, so it is a high-water mark that still includes any
	idle gaps mid-visit.

	active_seconds is the true sum of the engaged intervals, with the gaps
	excluded. Only the client can see focus, visibility, and interaction, so the
	client does the summing — which means the figure is not trustworthy on its
	own. Two defences apply here: it is clamped to the wall-clock time the
	server itself measured the page as open (so a forged total can never exceed
	a plausible one), and it only ever moves upward.

	A load event does not always create a row: if the same username already has
	a row for the same page whose end_datetime is within REUSE_WINDOW_MINUTES,
	that row is resumed (its end_datetime is advanced and its id returned)
	instead of a new one being inserted. This keeps a page reload, a back/forward
	navigation, or a quick detour from splintering one visit into many rows.

	All timestamps are generated server-side so the client cannot forge them,
	and the username/IP come from the session/request, never the request body.
	The client only reports *which* page it is on and *whether* it is active.
*/
import express from 'express';

const router = express.Router();

import { user_require_logged_in, nocache, log_error } from './network';
import { run_mysql_query, to_utc, from_utc_to_myql } from './mysql';

import type { Request, Response, NextFunction } from 'express';


// Longest page value the column (VARCHAR(255)) can hold.
const MAX_PAGE_LENGTH = 255;

// A load event for a username+page whose last activity is newer than this
// resumes the existing row instead of creating a new one.
const REUSE_WINDOW_MINUTES = 5;

// Normalize a client-supplied page/path into a safe, storable string, or
// return null if it is missing or unusable. Exported for unit testing.
const sanitize_page = (page: unknown): string | null => {
	if (typeof page !== 'string') return null;
	const trimmed = page.trim();
	if (trimmed.length === 0) return null;
	return trimmed.slice(0, MAX_PAGE_LENGTH);
};

// Current time in the MySQL DATETIME (UTC) format used across the app.
const now_mysql = (): string => from_utc_to_myql(to_utc(new Date()));

// The oldest end_datetime a row may have and still be resumed by a new load
// event. Exported for unit testing.
const reuse_cutoff_mysql = (now: Date = new Date()): string =>
	from_utc_to_myql(to_utc(new Date(now.getTime() - REUSE_WINDOW_MINUTES * 60 * 1000)));

// Read the heartbeat's `active` flag off the query string. It travels in the
// URL rather than the body so navigator.sendBeacon (which posts no body on
// unload) can carry it too.
//
// Absent means active: a cached older client sends no flag, and treating those
// heartbeats as active reproduces the pre-active_datetime behaviour where the
// two columns always matched. Exported for unit testing.
const parse_active = (value: unknown): boolean => {
	if (typeof value !== 'string') return true;
	const v = value.trim().toLowerCase();
	if (v === '0' || v === 'false' || v === 'no') return false;
	return true;
};

// Slack allowed when clamping a reported total against the server's own
// measure of how long the page was open. Covers the lag between the client
// closing an interval and the request landing, plus modest clock skew.
const ACTIVE_SECONDS_SLACK = 60;

// Read the heartbeat's summed active time off the query string. Returns null
// when absent or unusable, in which case the column is left alone rather than
// zeroed — an older cached client reports no total, and that is not evidence
// the student did nothing. Exported for unit testing.
const parse_active_seconds = (value: unknown): number | null => {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	if (trimmed.length === 0) return null;
	// Reject anything that isn't a plain non-negative integer: Number() alone
	// would happily accept '1e9', ' 12 ', '0x10', and 'Infinity'.
	if (!/^\d+$/.test(trimmed)) return null;
	const n = Number(trimmed);
	if (!Number.isSafeInteger(n)) return null;
	// Fits the INT column; the SQL clamp narrows it much further in practice.
	return Math.min(n, 2147483647);
};


/*
	Build the heartbeat UPDATE.

	The statement varies with what the client reported, so it is assembled here
	rather than inline: the clause list and the value list have to stay in step,
	and a pure function can be tested for exactly that (see the tests asserting
	placeholder count equals value count).

	Exported for unit testing.
*/
const build_heartbeat_update = (
	now: string,
	active: boolean,
	seconds: number | null,
	id: number,
	username: string,
	stale_cutoff: string,
): { sql: string, values: Array<string | number> } => {
	const sets: Array<string> = ['end_datetime = ?'];
	const values: Array<string | number> = [now];

	if (active) {
		sets.push('active_datetime = ?');
		values.push(now);
	}

	if (seconds !== null) {
		/*
			Two guards on a client-supplied number:

			LEAST(...)    caps it at how long the server has seen the page open,
			              so no total can exceed wall-clock time no matter what
			              the client claims.
			GREATEST(...) keeps the column monotonic, so a late or duplicated
			              heartbeat carrying a stale total can't walk it
			              backwards. This is why the client reports a running
			              total rather than a delta.

			A negative bound (clock skew putting `now` before start_datetime)
			is harmless: GREATEST still floors the result at the stored value.
		*/
		sets.push('active_seconds = GREATEST(active_seconds, LEAST(?, TIMESTAMPDIFF(SECOND, start_datetime, ?) + ?))');
		values.push(seconds, now, ACTIVE_SECONDS_SLACK);
	}

	/*
		The username predicate prevents one user from updating another's row.

		The end_datetime predicate refuses to extend a row that has gone quiet
		for longer than the reuse window. Without it, a laptop closed at 11:45pm
		and reopened at 2am resumes the same row — no reload happens, so no load
		event is sent — and the visit is recorded as two and a quarter hours of
		reading. Heartbeats stop while the machine is asleep, so the gap is
		visible here even though nothing announces it.
	*/
	const sql = `UPDATE pageviews SET ${sets.join(', ')}
		WHERE idpageview = ? AND username = ? AND end_datetime >= ?`;
	values.push(id, username, stale_cutoff);

	return { sql, values };
};


////////////////////////////////////////////////////////////////////////
//  Routes
////////////////////////////////////////////////////////////////////////


// Page-load event. Resumes the user's most recent row for this page when that
// row was active within the last REUSE_WINDOW_MINUTES; otherwise creates a new
// row with start_datetime = end_datetime = now. Either way the row id is
// returned so the client can send heartbeats against it.
router.post('/',
	nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const page = sanitize_page((req.body || {}).page);
		if (page === null) return res.status(400).json({ error: 'invalid page' });

		const username = (req as any).session.username;
		const ip = req.ip ?? null;
		const now = now_mysql();
		const cutoff = reuse_cutoff_mysql();

		// 1. Look for a recent row for this user + page to resume.
		const select_sql = `SELECT idpageview, active_seconds FROM pageviews
			WHERE username = ? AND page = ? AND end_datetime >= ?
			ORDER BY end_datetime DESC, idpageview DESC
			LIMIT 1`;
		const existing = await run_mysql_query(select_sql, [username, page, cutoff]);

		if (Array.isArray(existing) && existing.length > 0) {
			const idpageview = existing[0].idpageview;
			const active_seconds = Number(existing[0].active_seconds) || 0;

			// Advance the existing visit rather than starting a new one.
			// start_datetime is left alone so duration spans the whole visit.
			// A load is by definition active, so active_datetime moves too.
			const update_sql = `UPDATE pageviews SET end_datetime = ?, active_datetime = ?
				WHERE idpageview = ? AND username = ?`;
			const updated = await run_mysql_query(update_sql, [now, now, idpageview, username]);

			if (updated.affectedRows > 0) {
				// active_seconds goes back so the client continues this row's
				// tally instead of restarting from zero and reporting a total
				// lower than what is already stored.
				return res.json({ idpageview, resumed: true, active_seconds });
			}
			// Row vanished between the select and the update; fall through to insert.
		}

		// 2. No recent row, so record a new visit.
		const insert_sql = `INSERT INTO pageviews (username, page, ip, start_datetime, end_datetime, active_datetime)
			VALUES (?, ?, ?, ?, ?, ?)`;
		const result = await run_mysql_query(insert_sql, [username, page, ip, now, now, now]);

		res.json({ idpageview: result.insertId, resumed: false, active_seconds: 0 });
	} catch (e) {
		log_error(e);
		next(e);
	}
});


/*
	Heartbeat. Advances end_datetime to now for a row the session user owns;
	also advances active_datetime when the client reports the page as active
	(?active=0 marks a hidden, unfocused, or idle page), and takes the running
	engagement total from ?active_seconds.

	Responses:
	  200  recorded
	  404  no such row, or it belongs to another user
	  409  the row went quiet for longer than the reuse window, so this sitting
	       is over. The client answers a 409 by posting a fresh load event.
*/
router.post(/^\/(\d+)\/heartbeat$/,
	nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const id = Number((req.params as any)[0]);
		if (!Number.isInteger(id) || id <= 0) return res.sendStatus(400);

		const username = (req as any).session.username;
		const now = now_mysql();
		const cutoff = reuse_cutoff_mysql();
		const query: Record<string, unknown> = req.query || {};
		const active = parse_active(query.active);
		const seconds = parse_active_seconds(query.active_seconds);

		const { sql, values } = build_heartbeat_update(now, active, seconds, id, username, cutoff);
		const result = await run_mysql_query(sql, values);

		if (result.affectedRows > 0) return res.sendStatus(200);

		/*
			Nothing was updated, and there are three reasons why. Only now, on
			the rare path, is it worth a second query to tell them apart —
			answering the wrong one would either lose the session (404 on a live
			row) or silently keep extending a dead one.

			The third reason is subtle: mysql2 reports affectedRows as rows
			*changed*, so two heartbeats landing inside the same second update a
			row to the value it already holds and report 0. That row is alive and
			must not be told otherwise, or the client would start a duplicate.
		*/
		// MySQL does the comparison, against the same cutoff string the UPDATE
		// used. Reading end_datetime back into JS would mean parsing a UTC
		// DATETIME that the driver hands over as a local-timezone Date, and the
		// two would have to be reconciled to compare them.
		const check = await run_mysql_query(
			`SELECT (end_datetime >= ?) AS fresh FROM pageviews
				WHERE idpageview = ? AND username = ?`,
			[cutoff, id, username]
		);

		if (!Array.isArray(check) || check.length === 0) return res.sendStatus(404);

		if (!check[0].fresh) {
			return res.status(409).json({ error: 'stale pageview', restart: true });
		}

		// Alive, just unchanged.
		res.sendStatus(200);
	} catch (e) {
		log_error(e);
		next(e);
	}
});


const app_pageviews = router;

// Helpers exported for unit testing.
export {
	app_pageviews,
	sanitize_page,
	MAX_PAGE_LENGTH,
	reuse_cutoff_mysql,
	REUSE_WINDOW_MINUTES,
	parse_active,
	parse_active_seconds,
	ACTIVE_SECONDS_SLACK,
	build_heartbeat_update,
};
