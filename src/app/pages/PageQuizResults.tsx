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
import { Table } from 'react-bootstrap';

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

interface IPageQuizResultsProps {
	// Page slug whose results should be shown.
	page: string;
}

/*
	Percent of this question's answers that picked a given option. Used for the
	inline bar; returns 0 rather than NaN when a question has no answers.
	Exported for unit testing.
*/
export const answer_share = (count: number, total: number): number =>
	(total <= 0 ? 0 : Math.round((count / total) * 100));

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

			<Table className='quiz-results-table' bordered>
				<thead>
					<tr>
						<th>Question</th>
						<th className='quiz-results-numeric'>% correct</th>
						<th className='quiz-results-numeric'>Answers</th>
					</tr>
				</thead>
				<tbody>
					{ questions.map((question) => (
						<React.Fragment key={question.question}>
							<tr className='quiz-results-question-row'>
								<td>{ question.question }</td>
								<td className='quiz-results-numeric'>
									<b>{ question.percent_correct }%</b>
								</td>
								<td className='quiz-results-numeric'>{ question.total }</td>
							</tr>
							<tr className='quiz-results-answers-row'>
								<td colSpan={3}>
									<ul className='quiz-results-answers'>
										{ question.answers.map((answer) => (
											<li
												key={`${answer.answer}-${answer.correct ? 'c' : 'i'}`}
												className={answer.correct ? 'quiz-results-answer is-correct' : 'quiz-results-answer'}
											>
												<span className='quiz-results-answer-text'>
													{ answer.correct ? '✓ ' : '' }{ answer.answer }
												</span>
												<span className='quiz-results-answer-bar'>
													<span
														className='quiz-results-answer-fill'
														style={{ width: `${answer_share(answer.count, question.total)}%` }}
													/>
												</span>
												<span className='quiz-results-answer-count'>
													{ answer.count } ({ answer_share(answer.count, question.total) }%)
												</span>
											</li>
										)) }
									</ul>
								</td>
							</tr>
						</React.Fragment>
					)) }
				</tbody>
			</Table>
		</div>
	);
}

export default PageQuizResults;
