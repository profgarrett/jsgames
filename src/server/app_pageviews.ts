/**
	Server-side routes for pageview tracking.

	One row per page visit by a logged-in user. The client posts an initial
	"load" event when a page opens, then sends a "heartbeat" every 30 seconds
	that advances end_datetime. Duration is derived at query time as
	(end_datetime - start_datetime).

	All timestamps are generated server-side so the client cannot forge them,
	and the username/IP come from the session/request, never the request body.
*/
import express from 'express';

const router = express.Router();

import { user_require_logged_in, nocache, log_error } from './network';
import { run_mysql_query, to_utc, from_utc_to_myql } from './mysql';

import type { Request, Response, NextFunction } from 'express';


// Longest page value the column (VARCHAR(255)) can hold.
const MAX_PAGE_LENGTH = 255;

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


////////////////////////////////////////////////////////////////////////
//  Routes
////////////////////////////////////////////////////////////////////////


// Initial page-load event. Creates a row with start_datetime = end_datetime = now
// and returns its id so the client can send heartbeats against it.
router.post('/',
	nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const page = sanitize_page((req.body || {}).page);
		if (page === null) return res.status(400).json({ error: 'invalid page' });

		const username = (req as any).session.username;
		const ip = req.ip ?? null;
		const now = now_mysql();

		const sql = `INSERT INTO pageviews (username, page, ip, start_datetime, end_datetime)
			VALUES (?, ?, ?, ?, ?)`;
		const result = await run_mysql_query(sql, [username, page, ip, now, now]);

		res.json({ idpageview: result.insertId });
	} catch (e) {
		log_error(e);
		next(e);
	}
});


// Heartbeat. Advances end_datetime to now for a row the session user owns.
// The username predicate prevents one user from updating another's row.
router.post(/^\/(\d+)\/heartbeat$/,
	nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const id = Number((req.params as any)[0]);
		if (!Number.isInteger(id) || id <= 0) return res.sendStatus(400);

		const username = (req as any).session.username;
		const now = now_mysql();

		const sql = `UPDATE pageviews SET end_datetime = ?
			WHERE idpageview = ? AND username = ?`;
		const result = await run_mysql_query(sql, [now, id, username]);

		if (result.affectedRows === 0) return res.sendStatus(404);
		res.sendStatus(200);
	} catch (e) {
		log_error(e);
		next(e);
	}
});


const app_pageviews = router;

// Helpers exported for unit testing.
export { app_pageviews, sanitize_page, MAX_PAGE_LENGTH };
