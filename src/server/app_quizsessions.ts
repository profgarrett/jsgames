/**
	Server-side routes for live (synchronous) quiz sessions.

	An instructor starts a session while viewing a page; the client sends the
	already-shuffled question deck (built with buildQuiz() in PageQuiz.tsx) once,
	and the server freezes it as the session's source of truth so every
	participant sees the same question/option order. Students join with a short
	code, then poll /:idsession/state while the instructor steps through
	questions with /next and finishes with /end. Results (including which
	option was correct) are only ever returned for the *current* question after
	a student has answered it, or for the whole session once it has ended --
	never revealed in advance.
*/
import express from 'express';

const router = express.Router();

import { user_require_logged_in, user_require_admin, nocache, log_error } from './network';
import { run_mysql_query, to_utc, from_utc_to_myql } from './mysql';

import type { Request, Response, NextFunction } from 'express';


// Longest values the columns can hold.
const MAX_TEXT_LENGTH = 1000;	// prompt, option text, answer -- VARCHAR(1000)
const MAX_PAGE_LENGTH = 255;	// page -- VARCHAR(255)
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 10;
const MAX_QUESTIONS = 200;

const CODE_LENGTH = 6;
// Unambiguous on a projected screen: no 0/O or 1/I.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_GENERATION_ATTEMPTS = 10;


////////////////////////////////////////////////////////////////////////
//  Shapes
////////////////////////////////////////////////////////////////////////

export interface IStoredQuizOption {
	text: string;
	isCorrect: boolean;
}

export interface IStoredQuizQuestion {
	prompt: string;
	options: IStoredQuizOption[];
}

interface ISessionRow {
	idsession: number;
	code: string;
	username: string;
	page: string;
	status: 'waiting' | 'active' | 'ended';
	questions_json: string;
	current_question_index: number;
}


////////////////////////////////////////////////////////////////////////
//  Pure helpers (exported for unit testing)
////////////////////////////////////////////////////////////////////////

const sanitize_text = (value: unknown, max_length: number = MAX_TEXT_LENGTH): string | null => {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	if (trimmed.length === 0) return null;
	return trimmed.slice(0, max_length);
};

const sanitize_page = (value: unknown): string | null => sanitize_text(value, MAX_PAGE_LENGTH);

/*
	Validate and normalize the question deck the instructor's client built with
	buildQuiz(). Rejects anything malformed rather than trying to repair it --
	this is admin-only input, so failing loudly is preferable to silently
	dropping a question. Returns null if the whole payload is unusable.
*/
const sanitize_questions = (value: unknown): IStoredQuizQuestion[] | null => {
	if (!Array.isArray(value) || value.length === 0 || value.length > MAX_QUESTIONS) return null;

	const questions: IStoredQuizQuestion[] = [];

	for (const raw of value) {
		if (raw === null || typeof raw !== 'object') return null;

		const prompt = sanitize_text((raw as any).prompt);
		if (prompt === null) return null;

		const rawOptions = (raw as any).options;
		if (!Array.isArray(rawOptions) || rawOptions.length < MIN_OPTIONS || rawOptions.length > MAX_OPTIONS) return null;

		const options: IStoredQuizOption[] = [];
		let correctCount = 0;

		for (const rawOption of rawOptions) {
			if (rawOption === null || typeof rawOption !== 'object') return null;
			const text = sanitize_text((rawOption as any).text);
			if (text === null) return null;
			const isCorrect = (rawOption as any).isCorrect === true;
			if (isCorrect) correctCount += 1;
			options.push({ text, isCorrect });
		}

		if (correctCount !== 1) return null;

		questions.push({ prompt, options });
	}

	return questions;
};

/* Random join code from an unambiguous alphabet. Exported for unit testing. */
const generate_code = (): string => {
	let code = '';
	for (let i = 0; i < CODE_LENGTH; i++) {
		code += CODE_ALPHABET.charAt(Math.floor(Math.random() * CODE_ALPHABET.length));
	}
	return code;
};

// The option flagged correct for a stored question. Exported for unit testing.
const correct_option_text = (question: IStoredQuizQuestion): string =>
	question.options.find((option) => option.isCorrect)?.text ?? '';

interface ISessionAnswerRow {
	question_index: number;
	answer: string;
	correct: number;
	username: string;
}

export interface IQuizAnswerSummary {
	answer: string;
	count: number;
	correct: boolean;
}

export interface IQuizQuestionSummary {
	question: string;
	total: number;
	correct: number;
	percent_correct: number;
	answers: IQuizAnswerSummary[];
}

export interface ILeaderboardEntry {
	username: string;
	correct: number;
}

/*
	Build the per-question results for an ended session. Unlike the async-quiz
	summary (which infers everything from logged rows), a live session has the
	authoritative question deck, so every option shows up even if nobody picked
	it. Questions stay in the order they were asked. Exported for unit testing.
*/
const summarize_session_results = (
	questions: IStoredQuizQuestion[],
	answerRows: ISessionAnswerRow[],
): IQuizQuestionSummary[] => {
	const rowsByQuestion = new Map<number, ISessionAnswerRow[]>();
	for (const row of answerRows) {
		const list = rowsByQuestion.get(row.question_index) ?? [];
		list.push(row);
		rowsByQuestion.set(row.question_index, list);
	}

	return questions.map((question, index) => {
		const rows = rowsByQuestion.get(index) ?? [];
		const total = rows.length;
		const correct = rows.filter((row) => Number(row.correct) === 1).length;

		const counts = new Map<string, number>();
		for (const row of rows) counts.set(row.answer, (counts.get(row.answer) ?? 0) + 1);

		const answers: IQuizAnswerSummary[] = question.options.map((option) => ({
			answer: option.text,
			count: counts.get(option.text) ?? 0,
			correct: option.isCorrect,
		}));
		answers.sort((a, b) => (b.count - a.count) || a.answer.localeCompare(b.answer));

		return {
			question: question.prompt,
			total,
			correct,
			percent_correct: total === 0 ? 0 : Math.round((correct / total) * 100),
			answers,
		};
	});
};

/*
	Top 5 participants by number of correct answers, ties broken alphabetically
	by username for a stable, deterministic order. Exported for unit testing.
*/
const build_leaderboard = (answerRows: ISessionAnswerRow[]): ILeaderboardEntry[] => {
	const correctByUsername = new Map<string, number>();

	for (const row of answerRows) {
		if (Number(row.correct) !== 1) continue;
		correctByUsername.set(row.username, (correctByUsername.get(row.username) ?? 0) + 1);
	}

	return Array.from(correctByUsername.entries())
		.map(([username, correct]) => ({ username, correct }))
		.sort((a, b) => (b.correct - a.correct) || a.username.localeCompare(b.username))
		.slice(0, 5);
};


////////////////////////////////////////////////////////////////////////
//  DB helpers
////////////////////////////////////////////////////////////////////////

const now_mysql = (): string => from_utc_to_myql(to_utc(new Date()));

const lookup_iduser = async (username: string): Promise<number | null> => {
	const rows = await run_mysql_query('SELECT iduser FROM users WHERE username = ? LIMIT 1', [username]);
	if (!Array.isArray(rows) || rows.length === 0) return null;
	return rows[0].iduser ?? null;
};

const get_session = async (idsession: number): Promise<ISessionRow | null> => {
	const rows = await run_mysql_query('SELECT * FROM quizsessions WHERE idsession = ? LIMIT 1', [idsession]);
	if (!Array.isArray(rows) || rows.length === 0) return null;
	return rows[0] as ISessionRow;
};

const is_participant = async (idsession: number, username: string): Promise<boolean> => {
	const rows = await run_mysql_query(
		'SELECT idparticipant FROM quizsession_participants WHERE idsession = ? AND username = ? LIMIT 1',
		[idsession, username],
	);
	return Array.isArray(rows) && rows.length > 0;
};

// Generate a code not currently in use by any non-ended session. Throws if it can't find one.
const generate_unique_code = async (): Promise<string> => {
	for (let attempt = 0; attempt < CODE_GENERATION_ATTEMPTS; attempt++) {
		const code = generate_code();
		const rows = await run_mysql_query(
			"SELECT idsession FROM quizsessions WHERE code = ? AND status != 'ended' LIMIT 1",
			[code],
		);
		if (!Array.isArray(rows) || rows.length === 0) return code;
	}
	throw new Error('Could not generate a unique session code');
};

// Build the polling payload shared by /state, /next, and /end.
const build_state_payload = async (session: ISessionRow): Promise<any> => {
	const questions: IStoredQuizQuestion[] = JSON.parse(session.questions_json);

	const participantRows = await run_mysql_query(
		'SELECT COUNT(*) AS n FROM quizsession_participants WHERE idsession = ?',
		[session.idsession],
	);
	const participant_count = Number(participantRows[0]?.n) || 0;

	let answered_count = 0;
	let question: { prompt: string; options: string[] } | null = null;

	if (session.status === 'active') {
		const answeredRows = await run_mysql_query(
			'SELECT COUNT(*) AS n FROM quizsession_answers WHERE idsession = ? AND question_index = ?',
			[session.idsession, session.current_question_index],
		);
		answered_count = Number(answeredRows[0]?.n) || 0;

		const current = questions[session.current_question_index];
		if (current) question = { prompt: current.prompt, options: current.options.map((o) => o.text) };
	}

	return {
		idsession: session.idsession,
		code: session.code,
		page: session.page,
		status: session.status,
		current_question_index: session.current_question_index,
		total_questions: questions.length,
		question,
		participant_count,
		answered_count,
	};
};


////////////////////////////////////////////////////////////////////////
//  Routes
////////////////////////////////////////////////////////////////////////


// Create a new session for a page. The client sends the already-shuffled deck.
router.post('/',
	nocache, user_require_admin,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const body = req.body || {};

		const page = sanitize_page(body.page);
		if (page === null) return res.status(400).json({ error: 'invalid page' });

		const questions = sanitize_questions(body.questions);
		if (questions === null) return res.status(400).json({ error: 'invalid questions' });

		const username = (req as any).session.username;
		const iduser = await lookup_iduser(username);
		const code = await generate_unique_code();

		const sql = `INSERT INTO quizsessions
			(code, username, iduser, page, status, questions_json, current_question_index, created_datetime)
			VALUES (?, ?, ?, ?, 'waiting', ?, -1, ?)`;
		const result = await run_mysql_query(sql, [code, username, iduser, page, JSON.stringify(questions), now_mysql()]);

		res.json({ idsession: result.insertId, code });
	} catch (e) {
		log_error(e);
		next(e);
	}
});


// Resume the instructor's own in-progress session for a page, if any (so a
// browser refresh doesn't orphan a running session).
router.get('/mine/active',
	nocache, user_require_admin,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const page = sanitize_page(req.query.page);
		if (page === null) return res.status(400).json({ error: 'invalid page' });

		const username = (req as any).session.username;
		const rows = await run_mysql_query(
			`SELECT * FROM quizsessions WHERE username = ? AND page = ? AND status != 'ended'
				ORDER BY created_datetime DESC LIMIT 1`,
			[username, page],
		);

		if (!Array.isArray(rows) || rows.length === 0) return res.json({ session: null });

		res.json({ session: await build_state_payload(rows[0] as ISessionRow) });
	} catch (e) {
		log_error(e);
		next(e);
	}
});


// Join a session by its code.
router.post('/:code/join',
	nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const code = sanitize_text(req.params.code, 8);
		if (code === null) return res.status(400).json({ error: 'invalid code' });

		const rows = await run_mysql_query(
			"SELECT * FROM quizsessions WHERE code = ? AND status != 'ended' ORDER BY created_datetime DESC LIMIT 1",
			[code],
		);
		if (!Array.isArray(rows) || rows.length === 0) return res.status(404).json({ error: 'session not found' });

		const session = rows[0] as ISessionRow;
		const username = (req as any).session.username;
		const iduser = await lookup_iduser(username);

		await run_mysql_query(
			`INSERT INTO quizsession_participants (idsession, username, iduser, joined_datetime)
				VALUES (?, ?, ?, ?)
				ON DUPLICATE KEY UPDATE joined_datetime = VALUES(joined_datetime)`,
			[session.idsession, username, iduser, now_mysql()],
		);

		res.json({ idsession: session.idsession, page: session.page, status: session.status });
	} catch (e) {
		log_error(e);
		next(e);
	}
});


// Poll the current state of a session. Never reveals which option is correct.
router.get('/:idsession/state',
	nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const idsession = Number(req.params.idsession);
		if (!Number.isInteger(idsession)) return res.status(400).json({ error: 'invalid session' });

		const session = await get_session(idsession);
		if (session === null) return res.status(404).json({ error: 'session not found' });

		const username = (req as any).session.username;
		const isOwner = username === session.username;
		if (!isOwner && !(await is_participant(idsession, username))) return res.sendStatus(403);

		res.json(await build_state_payload(session));
	} catch (e) {
		log_error(e);
		next(e);
	}
});


// Submit an answer to the current question.
router.post('/:idsession/answer',
	nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const idsession = Number(req.params.idsession);
		if (!Number.isInteger(idsession)) return res.status(400).json({ error: 'invalid session' });

		const body = req.body || {};
		const question_index = Number(body.question_index);
		const answer = sanitize_text(body.answer);
		if (answer === null) return res.status(400).json({ error: 'invalid answer' });

		const session = await get_session(idsession);
		if (session === null) return res.status(404).json({ error: 'session not found' });

		if (session.status !== 'active' || question_index !== session.current_question_index) {
			return res.status(400).json({ error: 'question is no longer active' });
		}

		const username = (req as any).session.username;
		const participantRows = await run_mysql_query(
			'SELECT idparticipant FROM quizsession_participants WHERE idsession = ? AND username = ? LIMIT 1',
			[idsession, username],
		);
		if (!Array.isArray(participantRows) || participantRows.length === 0) {
			return res.status(403).json({ error: 'join the session before answering' });
		}
		const idparticipant = participantRows[0].idparticipant;

		const questions: IStoredQuizQuestion[] = JSON.parse(session.questions_json);
		const question = questions[question_index];
		const correctAnswer = correct_option_text(question);
		const correct = answer === correctAnswer ? 1 : 0;

		try {
			await run_mysql_query(
				`INSERT INTO quizsession_answers (idsession, idparticipant, question_index, answer, correct, answer_datetime)
					VALUES (?, ?, ?, ?, ?, ?)`,
				[idsession, idparticipant, question_index, answer, correct, now_mysql()],
			);
			return res.json({ correct: correct === 1, correct_answer: correctAnswer });
		} catch (e: any) {
			// Already answered this question -- return the locked-in answer instead of erroring.
			if (e && e.code === 'ER_DUP_ENTRY') {
				const existing = await run_mysql_query(
					'SELECT answer, correct FROM quizsession_answers WHERE idparticipant = ? AND question_index = ? LIMIT 1',
					[idparticipant, question_index],
				);
				if (Array.isArray(existing) && existing.length > 0) {
					return res.json({ correct: Number(existing[0].correct) === 1, correct_answer: correctAnswer });
				}
			}
			throw e;
		}
	} catch (e) {
		log_error(e);
		next(e);
	}
});


// Move to the next question (or out of the waiting room for the first one).
router.post('/:idsession/next',
	nocache, user_require_admin,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const idsession = Number(req.params.idsession);
		if (!Number.isInteger(idsession)) return res.status(400).json({ error: 'invalid session' });

		const session = await get_session(idsession);
		if (session === null) return res.status(404).json({ error: 'session not found' });
		if (session.username !== (req as any).session.username) return res.sendStatus(403);
		if (session.status === 'ended') return res.status(400).json({ error: 'session has ended' });

		const questions: IStoredQuizQuestion[] = JSON.parse(session.questions_json);
		const nextIndex = session.status === 'waiting' ? 0 : session.current_question_index + 1;

		if (nextIndex >= questions.length) {
			return res.status(400).json({ error: 'no more questions; end the session' });
		}

		const wasWaiting = session.status === 'waiting';
		const sql = wasWaiting
			? `UPDATE quizsessions SET status = 'active', current_question_index = ?, started_datetime = ? WHERE idsession = ?`
			: `UPDATE quizsessions SET current_question_index = ? WHERE idsession = ?`;
		const values = wasWaiting ? [nextIndex, now_mysql(), idsession] : [nextIndex, idsession];
		await run_mysql_query(sql, values);

		const updated = await get_session(idsession);
		res.json(await build_state_payload(updated as ISessionRow));
	} catch (e) {
		log_error(e);
		next(e);
	}
});


// End a session.
router.post('/:idsession/end',
	nocache, user_require_admin,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const idsession = Number(req.params.idsession);
		if (!Number.isInteger(idsession)) return res.status(400).json({ error: 'invalid session' });

		const session = await get_session(idsession);
		if (session === null) return res.status(404).json({ error: 'session not found' });
		if (session.username !== (req as any).session.username) return res.sendStatus(403);

		await run_mysql_query(
			`UPDATE quizsessions SET status = 'ended', ended_datetime = ? WHERE idsession = ?`,
			[now_mysql(), idsession],
		);

		const updated = await get_session(idsession);
		res.json(await build_state_payload(updated as ISessionRow));
	} catch (e) {
		log_error(e);
		next(e);
	}
});


// Final results: per-question breakdown plus the top-5 leaderboard.
router.get('/:idsession/results',
	nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const idsession = Number(req.params.idsession);
		if (!Number.isInteger(idsession)) return res.status(400).json({ error: 'invalid session' });

		const session = await get_session(idsession);
		if (session === null) return res.status(404).json({ error: 'session not found' });

		const username = (req as any).session.username;
		const isOwner = username === session.username;
		if (!isOwner && !(await is_participant(idsession, username))) return res.sendStatus(403);

		if (session.status !== 'ended') return res.status(400).json({ error: 'session has not ended yet' });

		const questions: IStoredQuizQuestion[] = JSON.parse(session.questions_json);

		const answerRows: ISessionAnswerRow[] = await run_mysql_query(
			`SELECT quizsession_answers.question_index, quizsession_answers.answer, quizsession_answers.correct,
					quizsession_participants.username
				FROM quizsession_answers
				INNER JOIN quizsession_participants
					ON quizsession_participants.idparticipant = quizsession_answers.idparticipant
				WHERE quizsession_answers.idsession = ?`,
			[idsession],
		);

		const participantRows = await run_mysql_query(
			'SELECT COUNT(*) AS n FROM quizsession_participants WHERE idsession = ?',
			[idsession],
		);

		res.json({
			page: session.page,
			questions: summarize_session_results(questions, answerRows),
			leaderboard: build_leaderboard(answerRows),
			participant_count: Number(participantRows[0]?.n) || 0,
		});
	} catch (e) {
		log_error(e);
		next(e);
	}
});


const app_quizsessions = router;

// Helpers exported for unit testing.
export {
	app_quizsessions,
	sanitize_text, sanitize_page, sanitize_questions,
	generate_code, correct_option_text,
	summarize_session_results, build_leaderboard,
	MAX_TEXT_LENGTH, MAX_PAGE_LENGTH,
};
