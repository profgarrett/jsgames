/*
	Student-facing live quiz session, once joined (see LiveQuizJoin.tsx).

	Students move through the question deck at their own pace -- there's no
	instructor-driven "current question" to sync against. This screen keeps a
	lightweight background poll of the overall session status (so it notices
	the instructor starting or ending the session), and separately fetches the
	student's own next question / running correct-incorrect tally on demand:
	right after joining an active session, and again each time they advance
	past a question. Visual style reuses the .quiz-option classes from
	PageQuiz.tsx so it feels like the same quiz.
*/
import React, { ReactElement, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';

import LiveQuizResultsView, { ILiveQuizResults } from './LiveQuizResultsView';
import './pageview_toc_style.css';

const POLL_INTERVAL_MS = 2000;

type ISessionStatus = 'waiting' | 'active' | 'ended';

interface IQuestionPayload {
	finished: boolean;
	total_questions: number;
	correct_count: number;
	incorrect_count: number;
	// Canonical deck index -- identifies the question for POST /answer, but not
	// meaningful as a display position since each student sees questions in
	// their own shuffled order.
	question_index?: number;
	// This student's position (0-based) in their own shuffled order -- what to
	// show as "Question N of total_questions".
	sequence_index?: number;
	prompt?: string;
	options?: string[];
}

interface IAnswerFeedback {
	selected: string;
	correct: boolean;
	correct_answer: string;
}

interface ILiveQuizPlayProps {
	idsession: number;
}

function LiveQuizPlay({ idsession }: ILiveQuizPlayProps): ReactElement {
	const [status, setStatus] = useState<ISessionStatus | null>(null);
	const [question, setQuestion] = useState<IQuestionPayload | null>(null);
	const [feedback, setFeedback] = useState<IAnswerFeedback | null>(null);
	const [results, setResults] = useState<ILiveQuizResults | null>(null);
	const [error, setError] = useState('');

	// Background poll: just the overall session status, so we notice the
	// instructor starting or ending the session.
	useEffect(() => {
		let cancelled = false;

		const poll = async (): Promise<void> => {
			try {
				const res = await fetch(`/api/quizsessions/${idsession}/state`, { credentials: 'include' });
				if (!res.ok) { if (!cancelled) setError('Could not load this session.'); return; }
				const json = await res.json();
				if (!cancelled) setStatus(json.status);
			} catch {
				if (!cancelled) setError('Could not reach the server.');
			}
		};

		poll();
		const interval = setInterval(poll, POLL_INTERVAL_MS);
		return () => { cancelled = true; clearInterval(interval); };
	}, [idsession]);

	const loadQuestion = async (): Promise<void> => {
		try {
			const res = await fetch(`/api/quizsessions/${idsession}/question`, { credentials: 'include' });
			const json = await res.json();
			if (!res.ok) { setError(json.error || 'Could not load your question.'); return; }
			setError('');
			setFeedback(null);
			setQuestion(json);
		} catch {
			setError('Network error -- please try again.');
		}
	};

	// The moment the session goes active, fetch this student's first question.
	useEffect(() => {
		if (status === 'active' && question === null) loadQuestion();
	}, [status]);

	// Load results once, right after the session ends.
	useEffect(() => {
		if (status !== 'ended' || results !== null) return;
		let cancelled = false;

		fetch(`/api/quizsessions/${idsession}/results`, { credentials: 'include' })
			.then((res) => res.json())
			.then((json) => { if (!cancelled) setResults(json); })
			.catch(() => { if (!cancelled) setError('Could not load results.'); });

		return () => { cancelled = true; };
	}, [status, idsession, results]);

	const choose = async (option: string): Promise<void> => {
		if (!question || question.finished || feedback !== null) return;

		try {
			const res = await fetch(`/api/quizsessions/${idsession}/answer`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ question_index: question.question_index, answer: option }),
			});
			const json = await res.json();
			if (!res.ok) { setError(json.error || 'Could not submit your answer.'); return; }
			setError('');
			setFeedback({ selected: option, correct: json.correct, correct_answer: json.correct_answer });
			// Reflect the new tally immediately -- no need to wait on the next poll.
			setQuestion((current) => (current
				? { ...current, correct_count: json.correct_count, incorrect_count: json.incorrect_count }
				: current));
		} catch {
			setError('Network error -- please try again.');
		}
	};

	if (error !== '' && status === null) {
		return <div className='live-quiz'><p className='live-quiz-message'>{ error }</p></div>;
	}

	if (status === null) {
		return <div className='live-quiz'><p className='live-quiz-message'>Loading&hellip;</p></div>;
	}

	if (status === 'waiting') {
		return (
			<div className='live-quiz'>
				<p className='live-quiz-message'>You&rsquo;re in! Waiting for the instructor to start&hellip;</p>
			</div>
		);
	}

	if (status === 'ended') return <LiveQuizResultsView results={results} />;

	// Active.
	if (question === null) {
		return <div className='live-quiz'><p className='live-quiz-message'>Loading your question&hellip;</p></div>;
	}

	const scoreTracker = (
		<div className='live-quiz-my-score'>
			<span className='live-quiz-my-score-correct'>✓ { question.correct_count } correct</span>
			<span className='live-quiz-my-score-incorrect'>✗ { question.incorrect_count } incorrect</span>
		</div>
	);

	if (question.finished) {
		return (
			<div className='live-quiz'>
				{ scoreTracker }
				<p className='live-quiz-message'>
					You&rsquo;ve answered all { question.total_questions } questions. Waiting for the instructor to end the session&hellip;
				</p>
			</div>
		);
	}

	const answered = feedback !== null;
	const options = question.options ?? [];

	const optionClass = (option: string): string => {
		if (!answered) return 'quiz-option';
		if (option === feedback!.correct_answer) return 'quiz-option is-correct';
		if (option === feedback!.selected) return 'quiz-option is-wrong';
		return 'quiz-option is-muted';
	};

	return (
		<div className='live-quiz'>
			{ scoreTracker }

			<div className='live-quiz-progress'>
				Question { (question.sequence_index ?? 0) + 1 } of { question.total_questions }
			</div>

			<div className='quiz-card'>
				<p className='quiz-prompt'>{ question.prompt }</p>
				<ul className='quiz-options'>
					{ options.map((option, i) => (
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

			{ answered ? (
				<Button variant='outline-primary' onClick={loadQuestion}>
					Next question →
				</Button>
			) : null }

			{ error !== '' ? <p className='live-quiz-error'>{ error }</p> : null }
		</div>
	);
}

export default LiveQuizPlay;
