/*
	Instructor-facing list of past live sessions for a page, behind the
	"Review past sessions" button on PageView.tsx.

	Live sessions used to be write-only: once a session ended, the results were
	on screen until the instructor navigated away and then gone. This screen is
	the way back to them. It lists the instructor's own ended sessions for the
	page they are on (GET /api/quizsessions/mine/history), newest first; picking
	one loads GET /api/quizsessions/:idsession/results and hands it to the same
	LiveQuizResultsView the class saw when the session ended, so a reviewed
	session and a just-ended one look identical.

	Nothing here is live -- an ended session's results never change, so this
	fetches once per selection and does not poll.
*/
import React, { ReactElement, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';

import LiveQuizResultsView, { ILiveQuizResults } from './LiveQuizResultsView';

interface IPastSession {
	idsession: number;
	code: string;
	page: string;
	// ISO-8601 UTC strings from the server, or null for a session that somehow
	// never recorded the timestamp.
	created_datetime: string | null;
	ended_datetime: string | null;
	participant_count: number;
	question_count: number;
}

interface ILiveQuizHistoryProps {
	page: string;
}

/*
	A session's date for the list. Kept local rather than shared with the admin
	traffic table's identical helper, so a reading page doesn't pull the admin
	bundle in just to print a date. Empty string for a missing or unparseable
	value -- the row still renders, just without a date.
*/
const format_datetime = (value: string | null): string => {
	if (!value) return '';
	const d = new Date(value);
	if (isNaN(d.getTime())) return '';
	return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const plural = (count: number, noun: string): string => `${count} ${noun}${count === 1 ? '' : 's'}`;

function LiveQuizHistory({ page }: ILiveQuizHistoryProps): ReactElement {
	const [sessions, setSessions] = useState<IPastSession[] | null>(null);
	// Which session is open, if any. Null means the list is showing.
	const [selected, setSelected] = useState<IPastSession | null>(null);
	const [results, setResults] = useState<ILiveQuizResults | null>(null);
	const [error, setError] = useState('');

	// Load the list of past sessions for this page.
	useEffect(() => {
		let cancelled = false;

		(async () => {
			try {
				const res = await fetch(`/api/quizsessions/mine/history?page=${encodeURIComponent(page)}`, { credentials: 'include' });
				const json = await res.json();
				if (cancelled) return;
				if (!res.ok) { setError(json.error || 'Could not load past sessions.'); setSessions([]); return; }
				setSessions(Array.isArray(json.sessions) ? json.sessions : []);
			} catch {
				if (!cancelled) { setError('Could not load past sessions.'); setSessions([]); }
			}
		})();

		return () => { cancelled = true; };
	}, [page]);

	// Load the selected session's results. Re-runs on each selection; the
	// results of an ended session are fixed, so there is nothing to refresh.
	useEffect(() => {
		if (selected === null) return;
		let cancelled = false;
		setResults(null);

		(async () => {
			try {
				const res = await fetch(`/api/quizsessions/${selected.idsession}/results`, { credentials: 'include' });
				const json = await res.json();
				if (cancelled) return;
				if (!res.ok) { setError(json.error || 'Could not load those results.'); return; }
				setError('');
				setResults(json);
			} catch {
				if (!cancelled) setError('Could not load those results.');
			}
		})();

		return () => { cancelled = true; };
	}, [selected?.idsession]);

	if (selected !== null) {
		return (
			<div className='live-quiz'>
				<div className='live-quiz-history-header'>
					<Button variant='outline-secondary' size='sm' onClick={() => { setSelected(null); setResults(null); setError(''); }}>
						&larr; All past sessions
					</Button>
					<span className='live-quiz-history-when'>{ format_datetime(selected.created_datetime) }</span>
				</div>
				{ error !== '' ? <p className='live-quiz-error'>{ error }</p> : <LiveQuizResultsView results={results} /> }
			</div>
		);
	}

	if (sessions === null) {
		return <div className='live-quiz'><p className='live-quiz-message'>Loading past sessions&hellip;</p></div>;
	}

	return (
		<div className='live-quiz'>
			<h3>Past sessions</h3>

			{ sessions.length === 0 ? (
				<p className='live-quiz-message'>No finished live sessions for this page yet.</p>
			) : (
				<ul className='live-quiz-history-list'>
					{ sessions.map((session) => (
						<li key={session.idsession}>
							<button type='button' className='live-quiz-history-item' onClick={() => setSelected(session)}>
								<span className='live-quiz-history-when'>{ format_datetime(session.created_datetime) }</span>
								<span className='live-quiz-history-meta'>
									{ plural(session.participant_count, 'student') } &middot; { plural(session.question_count, 'question') }
								</span>
							</button>
						</li>
					)) }
				</ul>
			) }

			{ error !== '' ? <p className='live-quiz-error'>{ error }</p> : null }
		</div>
	);
}

export default LiveQuizHistory;
