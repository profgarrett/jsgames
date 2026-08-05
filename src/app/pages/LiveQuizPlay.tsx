/*
	Student-facing live quiz session, once joined (see LiveQuizJoin.tsx).

	Polls session state, renders the current question in step with the
	instructor's screen, submits the picked answer, and shows the shared
	results screen once the instructor ends the session. Visual style reuses
	the .quiz-option classes from PageQuiz.tsx so it feels like the same quiz.
*/
import React, { ReactElement, useEffect, useState } from 'react';

import LiveQuizResultsView, { ILiveQuizResults } from './LiveQuizResultsView';
import './pageview_toc_style.css';

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

interface IAnswerFeedback {
	question_index: number;
	selected: string;
	correct: boolean;
	correct_answer: string;
}

interface ILiveQuizPlayProps {
	idsession: number;
}

function LiveQuizPlay({ idsession }: ILiveQuizPlayProps): ReactElement {
	const [session, setSession] = useState<ISessionState | null>(null);
	const [feedback, setFeedback] = useState<IAnswerFeedback | null>(null);
	const [results, setResults] = useState<ILiveQuizResults | null>(null);
	const [error, setError] = useState('');

	// Poll session state.
	useEffect(() => {
		let cancelled = false;

		const poll = async (): Promise<void> => {
			try {
				const res = await fetch(`/api/quizsessions/${idsession}/state`, { credentials: 'include' });
				if (!res.ok) { if (!cancelled) setError('Could not load this session.'); return; }
				const json = await res.json();
				if (cancelled) return;
				setSession(json);
				// A new question is on screen -- clear any prior selection/feedback.
				setFeedback((current) => (current && current.question_index === json.current_question_index ? current : null));
			} catch {
				if (!cancelled) setError('Could not reach the server.');
			}
		};

		poll();
		const interval = setInterval(poll, POLL_INTERVAL_MS);
		return () => { cancelled = true; clearInterval(interval); };
	}, [idsession]);

	// Load results once, right after the session ends.
	useEffect(() => {
		if (!session || session.status !== 'ended' || results !== null) return;
		let cancelled = false;

		fetch(`/api/quizsessions/${idsession}/results`, { credentials: 'include' })
			.then((res) => res.json())
			.then((json) => { if (!cancelled) setResults(json); })
			.catch(() => { if (!cancelled) setError('Could not load results.'); });

		return () => { cancelled = true; };
	}, [session?.status, idsession, results]);

	const choose = async (option: string): Promise<void> => {
		if (!session || session.status !== 'active' || feedback !== null) return;

		const question_index = session.current_question_index;
		try {
			const res = await fetch(`/api/quizsessions/${idsession}/answer`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ question_index, answer: option }),
			});
			const json = await res.json();
			if (!res.ok) { setError(json.error || 'Could not submit your answer.'); return; }
			setError('');
			setFeedback({ question_index, selected: option, correct: json.correct, correct_answer: json.correct_answer });
		} catch {
			setError('Network error -- please try again.');
		}
	};

	if (error !== '' && !session) {
		return <div className='live-quiz'><p className='live-quiz-message'>{ error }</p></div>;
	}

	if (!session) {
		return <div className='live-quiz'><p className='live-quiz-message'>Loading&hellip;</p></div>;
	}

	if (session.status === 'waiting') {
		return (
			<div className='live-quiz'>
				<p className='live-quiz-message'>You&rsquo;re in! Waiting for the instructor to start&hellip;</p>
			</div>
		);
	}

	if (session.status === 'active' && session.question) {
		const answered = feedback !== null && feedback.question_index === session.current_question_index;

		const optionClass = (option: string): string => {
			if (!answered) return 'quiz-option';
			if (option === feedback!.correct_answer) return 'quiz-option is-correct';
			if (option === feedback!.selected) return 'quiz-option is-wrong';
			return 'quiz-option is-muted';
		};

		return (
			<div className='live-quiz'>
				<div className='live-quiz-progress'>
					Question { session.current_question_index + 1 } of { session.total_questions }
				</div>

				<div className='quiz-card'>
					<p className='quiz-prompt'>{ session.question.prompt }</p>
					<ul className='quiz-options'>
						{ session.question.options.map((option, i) => (
							<li key={option}>
								<button
									type='button'
									className={optionClass(option)}
									onClick={() => choose(option)}
									disabled={answered}
								>
									<span className='quiz-option-marker'>{ i + 1 }</span>
									<span className='quiz-option-text'>{ option }</span>
								</button>
							</li>
						)) }
					</ul>

					{ answered ? (
						<div className={`quiz-feedback${feedback!.correct ? ' is-correct' : ' is-wrong'}`} role='status'>
							{ feedback!.correct ? 'Correct.' : `Not quite. The correct answer is: ${feedback!.correct_answer}` }
						</div>
					) : (
						<div className='quiz-hint'>Select an answer.</div>
					) }
				</div>

				<p className='live-quiz-message'>Waiting for the instructor to continue&hellip;</p>
				{ error !== '' ? <p className='live-quiz-error'>{ error }</p> : null }
			</div>
		);
	}

	// Ended.
	return <LiveQuizResultsView results={results} />;
}

export default LiveQuizPlay;
