/*
	Admin-only quiz results panel.

	Shows how students have answered the quiz on the current page, aggregated
	across every logged attempt (see the quizviews table). Questions are listed
	most-missed first, and each question breaks down how often each answer was
	chosen.

	Rendered from PageView only for the admin user; the API is admin-gated as
	well, so this is a convenience rather than the security boundary.
*/
import React, { ReactElement, useEffect, useState } from 'react';

import QuizResultsTable, { IQuizQuestionSummary } from './QuizResultsTable';

export type { IQuizAnswerSummary, IQuizQuestionSummary } from './QuizResultsTable';
export { answer_share } from './QuizResultsTable';

interface IPageQuizResultsProps {
	// Page slug whose results should be shown.
	page: string;
}

function PageQuizResults({ page }: IPageQuizResultsProps): ReactElement {
	const [questions, setQuestions] = useState<IQuizQuestionSummary[] | null>(null);
	const [error, setError] = useState<string>('');

	useEffect(() => {
		let cancelled = false;
		setQuestions(null);
		setError('');

		fetch(`/api/quizviews/results?page=${encodeURIComponent(page)}`, { credentials: 'include' })
			.then((res) => {
				if (!res.ok) throw new Error(`Server returned ${res.status}`);
				return res.json();
			})
			.then((json) => {
				if (cancelled) return;
				setQuestions(Array.isArray(json.questions) ? json.questions : []);
			})
			.catch((e) => {
				if (cancelled) return;
				setError(e.message || 'Could not load quiz results.');
			});

		return () => { cancelled = true; };
	}, [page]);

	if (error !== '') {
		return (
			<div className='quiz-results-panel'>
				<p className='quiz-results-message'>Could not load quiz results: { error }</p>
			</div>
		);
	}

	if (questions === null) {
		return (
			<div className='quiz-results-panel'>
				<p className='quiz-results-message'>Loading quiz results&hellip;</p>
			</div>
		);
	}

	if (questions.length === 0) {
		return (
			<div className='quiz-results-panel'>
				<p className='quiz-results-message'>No quiz answers have been recorded for this page yet.</p>
			</div>
		);
	}

	const answered = questions.reduce((sum, question) => sum + question.total, 0);

	return (
		<div className='quiz-results-panel'>
			<h3 className='quiz-results-heading'>Quiz results</h3>
			<p className='quiz-results-subhead'>
				{ answered } answers across { questions.length } questions, hardest first.
			</p>

			<QuizResultsTable questions={questions} />
		</div>
	);
}

export default PageQuizResults;
