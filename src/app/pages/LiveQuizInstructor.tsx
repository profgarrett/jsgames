/*
	Instructor-facing live quiz session.

	Built on top of the same "## Practice Questions" deck as the async quiz
	(PageQuiz.tsx): create (or resume) a session for this page, show the join
	code, then start it. Students work through the deck at their own pace once
	started (see LiveQuizPlay.tsx) -- there's no single "current question" for
	the instructor to drive, so this screen just tracks who has joined and lets
	the instructor start/end the session. Ending shows the shared results +
	leaderboard, once every student's answers have been rolled up.

	The server is the source of truth for session state; this component mostly
	polls GET /api/quizsessions/:idsession/state and posts actions. See
	src/server/app_quizsessions.ts for the API this talks to.
*/
import React, { ReactElement, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';

import { IQuizQuestion, buildQuiz } from './PageQuiz';
import LiveQuizResultsView, { ILiveQuizResults } from './LiveQuizResultsView';

const POLL_INTERVAL_MS = 2000;

interface IParticipantProgress {
	username: string;
	completed: number;
}

interface ISessionState {
	idsession: number;
	code: string;
	page: string;
	status: 'waiting' | 'active' | 'ended';
	participant_count: number;
	usernames: string[];
	participants: IParticipantProgress[];
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

	// Poll for the joined-student count (and to notice the session ending
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

	const callAction = async (action: 'start' | 'end'): Promise<void> => {
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

	if (session.status === 'ended') return <LiveQuizResultsView results={results} />;

	const joinedLabel = `${session.participant_count} student${session.participant_count === 1 ? '' : 's'} joined`;

	return (
		<div className='live-quiz'>
			<div className='live-quiz-waiting'>
				<p className='live-quiz-instructions'>Students join at <b>/live</b> with this code:</p>
				<div className='live-quiz-code'>{ session.code }</div>
				<p className='live-quiz-participant-count'>{ joinedLabel }</p>

				{ session.status === 'waiting' ? (
					<>
						{ session.usernames.length > 0 ? (
							<ul className='live-quiz-joined-names'>
								{ session.usernames.map((username) => <li key={username}>{ username }</li>) }
							</ul>
						) : null }
						<Button variant='primary' size='lg' onClick={() => callAction('start')}>
							Start session
						</Button>
					</>
				) : (
					<>
						<p className='live-quiz-message'>Students are answering at their own pace.</p>
						{ session.participants.length > 0 ? (
							<ul className='live-quiz-progress-list'>
								{ session.participants.map((participant) => (
									<li key={participant.username}>
										<span className='live-quiz-progress-name'>{ participant.username }</span>
										<span className='live-quiz-progress-count'>
											{ participant.completed } completed
										</span>
									</li>
								)) }
							</ul>
						) : null }
					</>
				) }

				<div className='mt-3'>
					<Button variant='outline-danger' onClick={() => callAction('end')}>
						End session
					</Button>
				</div>

				{ error !== '' ? <p className='live-quiz-error'>{ error }</p> : null }
			</div>
		</div>
	);
}

export default LiveQuizInstructor;
