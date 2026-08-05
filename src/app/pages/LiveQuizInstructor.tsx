/*
	Instructor-facing live quiz session.

	Kahoot-style flow, built on top of the same "## Practice Questions" deck as
	the async quiz (PageQuiz.tsx): create (or resume) a session for this page,
	show the join code in a waiting room, step through questions while students
	answer on their own devices, then show the shared results + leaderboard
	once the instructor ends it.

	The server is the source of truth for session state; this component mostly
	polls GET /api/quizsessions/:idsession/state and posts actions. See
	src/server/app_quizsessions.ts for the API this talks to.
*/
import React, { ReactElement, useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

import { IQuizQuestion, buildQuiz } from './PageQuiz';
import LiveQuizResultsView, { ILiveQuizResults } from './LiveQuizResultsView';

const POLL_INTERVAL_MS = 2000;

interface ISessionState {
	idsession: number;
	code: string;
	page: string;
	status: 'waiting' | 'active' | 'ended';
	current_question_index: number;
	total_questions: number;
	question: { prompt: string; options: string[] } | null;
	participant_count: number;
	answered_count: number;
}

interface ILiveQuizInstructorProps {
	quizQuestions: IQuizQuestion[];
	page: string;
}

function LiveQuizInstructor({ quizQuestions, page }: ILiveQuizInstructorProps): ReactElement {
	const [session, setSession] = useState<ISessionState | null>(null);
	const [results, setResults] = useState<ILiveQuizResults | null>(null);
	const [error, setError] = useState('');

	// Resume an in-progress session for this page, or start a fresh one.
	useEffect(() => {
		let cancelled = false;

		(async () => {
			try {
				const activeRes = await fetch(`/api/quizsessions/mine/active?page=${encodeURIComponent(page)}`, { credentials: 'include' });
				const activeJson = await activeRes.json();
				if (cancelled) return;

				if (activeJson.session) {
					setSession(activeJson.session);
					return;
				}

				const deck = buildQuiz(quizQuestions);
				const createRes = await fetch('/api/quizsessions', {
					method: 'POST',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ page, questions: deck }),
				});
				const createJson = await createRes.json();
				if (cancelled) return;
				if (!createRes.ok) { setError(createJson.error || 'Could not start the live session.'); return; }

				const stateRes = await fetch(`/api/quizsessions/${createJson.idsession}/state`, { credentials: 'include' });
				const stateJson = await stateRes.json();
				if (cancelled) return;
				setSession(stateJson);
			} catch {
				if (!cancelled) setError('Could not start the live session.');
			}
		})();

		return () => { cancelled = true; };
	}, [page]);

	// Poll for participant/answer counts (and to notice the session ending
	// from elsewhere) while the session is in progress.
	useEffect(() => {
		if (!session || session.status === 'ended') return;

		const interval = setInterval(async () => {
			try {
				const res = await fetch(`/api/quizsessions/${session.idsession}/state`, { credentials: 'include' });
				if (!res.ok) return;
				setSession(await res.json());
			} catch {
				// Transient network hiccup -- try again on the next tick.
			}
		}, POLL_INTERVAL_MS);

		return () => clearInterval(interval);
	}, [session?.idsession, session?.status]);

	// Load results once, right after the session ends.
	useEffect(() => {
		if (!session || session.status !== 'ended' || results !== null) return;
		let cancelled = false;

		fetch(`/api/quizsessions/${session.idsession}/results`, { credentials: 'include' })
			.then((res) => res.json())
			.then((json) => { if (!cancelled) setResults(json); })
			.catch(() => { if (!cancelled) setError('Could not load results.'); });

		return () => { cancelled = true; };
	}, [session?.status, session?.idsession, results]);

	const callAction = async (action: 'next' | 'end'): Promise<void> => {
		if (!session) return;
		try {
			const res = await fetch(`/api/quizsessions/${session.idsession}/${action}`, {
				method: 'POST',
				credentials: 'include',
			});
			const json = await res.json();
			if (!res.ok) { setError(json.error || 'That action failed.'); return; }
			setError('');
			setSession(json);
		} catch {
			setError('Network error -- please try again.');
		}
	};

	if (error !== '' && !session) {
		return <div className='live-quiz'><p className='live-quiz-message'>{ error }</p></div>;
	}

	if (!session) {
		return <div className='live-quiz'><p className='live-quiz-message'>Starting live session&hellip;</p></div>;
	}

	if (session.status === 'waiting') {
		return (
			<div className='live-quiz'>
				<div className='live-quiz-waiting'>
					<p className='live-quiz-instructions'>Students join at <b>/live</b> with this code:</p>
					<div className='live-quiz-code'>{ session.code }</div>
					<p className='live-quiz-participant-count'>
						{ session.participant_count } student{ session.participant_count === 1 ? '' : 's' } joined
					</p>
					<Button variant='primary' size='lg' onClick={() => callAction('next')}>
						Start session
					</Button>
					{ error !== '' ? <p className='live-quiz-error'>{ error }</p> : null }
				</div>
			</div>
		);
	}

	if (session.status === 'active' && session.question) {
		const isLast = session.current_question_index + 1 >= session.total_questions;

		return (
			<div className='live-quiz'>
				<div className='live-quiz-progress'>
					Question { session.current_question_index + 1 } of { session.total_questions }
					<span className='live-quiz-tally'>{ session.answered_count } / { session.participant_count } answered</span>
				</div>

				<div className='quiz-card'>
					<p className='quiz-prompt'>{ session.question.prompt }</p>
					<ul className='quiz-options'>
						{ session.question.options.map((option, i) => (
							<li key={option}>
								<div className='quiz-option live-quiz-option-display'>
									<span className='quiz-option-marker'>{ i + 1 }</span>
									<span className='quiz-option-text'>{ option }</span>
								</div>
							</li>
						)) }
					</ul>
				</div>

				<ButtonGroup className='quiz-controls'>
					{ !isLast ? (
						<Button variant='outline-primary' onClick={() => callAction('next')}>
							Next question →
						</Button>
					) : null }
					<Button variant='outline-danger' onClick={() => callAction('end')}>
						End session
					</Button>
				</ButtonGroup>
				{ error !== '' ? <p className='live-quiz-error'>{ error }</p> : null }
			</div>
		);
	}

	// Ended.
	return <LiveQuizResultsView results={results} />;
}

export default LiveQuizInstructor;
