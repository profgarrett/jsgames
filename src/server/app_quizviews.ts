/**
	Server-side routes for quiz answer tracking.

	One row per answer submitted in quiz mode (see src/app/pages/PageQuiz.tsx).
	Every submission inserts a new row, so retaking a quiz produces a fresh set
	of rows rather than overwriting the previous attempt.

	The client fires these calls without waiting on the response, so the route
	does as little work as possible and never returns anything the UI needs.
	Timestamps and the user identity come from the server (session + users
	table), never from the request body.
*/
import express from 'express';

const router = express.Router();

import { user_require_logged_in, user_require_admin, nocache, log_error } from './network';
import { run_mysql_query, to_utc, from_utc_to_myql } from './mysql';

import type { Request, Response, NextFunction } from 'express';


// Longest values the columns can hold.
const MAX_TEXT_LENGTH = 1000;	// question, answer -- VARCHAR(1000)
const MAX_PAGE_LENGTH = 255;	// page -- VARCHAR(255)

/*
	Normalize a client-supplied text value (question or answer) into a safe,
	storable string, or return null if it is missing or unusable.
	Exported for unit testing.
*/
const sanitize_text = (value: unknown, max_length: number = MAX_TEXT_LENGTH): string | null => {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	if (trimmed.length === 0) return null;
	return trimmed.slice(0, max_length);
};

/*
	Page is optional context, so an unusable value degrades to null rather than
	failing the request. Exported for unit testing.
*/
const sanitize_page = (value: unknown): string | null => sanitize_text(value, MAX_PAGE_LENGTH);

/*
	Coerce the client's correct/incorrect flag into the TINYINT the column
	stores. Accepts a real boolean only; anything else is treated as incorrect
	so a malformed request cannot inflate a score. Exported for unit testing.
*/
const sanitize_correct = (value: unknown): 0 | 1 => (value === true ? 1 : 0);

// Current time in the MySQL DATETIME (UTC) format used across the app.
const now_mysql = (): string => from_utc_to_myql(to_utc(new Date()));

/*
	Resolve the numeric user id for a username. Returns null when the user
	cannot be found, which is logged rather than treated as an error -- the
	username column is the authoritative identifier either way.
*/
const lookup_iduser = async (username: string): Promise<number | null> => {
	const rows = await run_mysql_query('SELECT iduser FROM users WHERE username = ? LIMIT 1', [username]);
	if (!Array.isArray(rows) || rows.length === 0) return null;
	return rows[0].iduser ?? null;
};


////////////////////////////////////////////////////////////////////////
//  Routes
////////////////////////////////////////////////////////////////////////


// Record a single submitted quiz answer.
router.post('/',
	nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const body = req.body || {};

		const question = sanitize_text(body.question);
		const answer = sanitize_text(body.answer);
		if (question === null || answer === null) return res.status(400).json({ error: 'invalid question or answer' });

		const page = sanitize_page(body.page);
		const correct = sanitize_correct(body.correct);

		const username = (req as any).session.username;
		const iduser = await lookup_iduser(username);

		const sql = `INSERT INTO quizviews (username, iduser, page, question, answer, correct, answer_datetime)
			VALUES (?, ?, ?, ?, ?, ?, ?)`;
		const result = await run_mysql_query(sql, [username, iduser, page, question, answer, correct, now_mysql()]);

		res.json({ idquizview: result.insertId });
	} catch (e) {
		log_error(e);
		next(e);
	}
});


// Shape returned by the grouped SQL query below.
interface IQuizViewRow {
	question: string;
	answer: string;
	correct: number;
	n: number;
}

export interface IQuizAnswerSummary {
	answer: string;
	// Times this answer was selected.
	count: number;
	// True if this is the question's right answer.
	correct: boolean;
}

export interface IQuizQuestionSummary {
	question: string;
	// Total answers submitted for this question (all attempts, all students).
	total: number;
	correct: number;
	// Whole-number percent correct, 0 when nothing has been answered.
	percent_correct: number;
	answers: IQuizAnswerSummary[];
}

/*
	Roll grouped (question, answer, correct) counts up into one entry per
	question. Questions are ordered by percent correct ascending, so the
	most-missed questions come first; answers within a question are ordered by
	how often they were selected, most popular first.

	Note that `correct` is stored per row rather than per question, so an answer
	that was somehow logged both ways is split into two entries. That is
	intentional -- it makes the inconsistency visible rather than hiding it.

	Pure function, exported for unit testing.
*/
const summarize_quizviews = (rows: IQuizViewRow[]): IQuizQuestionSummary[] => {
	const by_question = new Map<string, IQuizQuestionSummary>();

	for (const row of rows) {
		const n = Number(row.n) || 0;
		const is_correct = Number(row.correct) === 1;

		let summary = by_question.get(row.question);
		if (typeof summary === 'undefined') {
			summary = { question: row.question, total: 0, correct: 0, percent_correct: 0, answers: [] };
			by_question.set(row.question, summary);
		}

		summary.total += n;
		if (is_correct) summary.correct += n;
		summary.answers.push({ answer: row.answer, count: n, correct: is_correct });
	}

	const summaries = Array.from(by_question.values());

	for (const summary of summaries) {
		summary.percent_correct = summary.total === 0
			? 0
			: Math.round((summary.correct / summary.total) * 100);
		// Most-selected answer first; ties fall back to alphabetical for stability.
		summary.answers.sort((a, b) => (b.count - a.count) || a.answer.localeCompare(b.answer));
	}

	// Hardest questions first; ties fall back to alphabetical for stability.
	summaries.sort((a, b) => (a.percent_correct - b.percent_correct) || a.question.localeCompare(b.question));

	return summaries;
};


// Aggregated results for one page, for the admin's in-page results panel.
// Admin only: this exposes how every student answered.
router.get('/results',
	nocache, user_require_admin,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const page = sanitize_page(req.query.page);
		if (page === null) return res.status(400).json({ error: 'invalid page' });

		// Group in SQL so only one row per (question, answer) crosses the wire.
		const sql = `SELECT question, answer, correct, COUNT(*) AS n
			FROM quizviews
			WHERE page = ?
			GROUP BY question, answer, correct`;
		const rows = await run_mysql_query(sql, [page]);

		res.json({ page, questions: summarize_quizviews(Array.isArray(rows) ? rows : []) });
	} catch (e) {
		log_error(e);
		next(e);
	}
});


const app_quizviews = router;

// Helpers exported for unit testing.
export { app_quizviews, sanitize_text, sanitize_page, sanitize_correct, summarize_quizviews, MAX_TEXT_LENGTH, MAX_PAGE_LENGTH };
