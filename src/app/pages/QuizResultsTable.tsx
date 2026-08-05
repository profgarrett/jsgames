/*
	Shared presentational table for quiz-answer breakdowns: one row per question
	(hardest first), each with an expandable list of how often every answer was
	picked. Used by both the async per-page results panel (PageQuizResults.tsx)
	and the live-session results screen (LiveQuizInstructor.tsx / LiveQuizPlay.tsx).
*/
import React, { ReactElement } from 'react';
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

/*
	Percent of this question's answers that picked a given option. Used for the
	inline bar; returns 0 rather than NaN when a question has no answers.
	Exported for unit testing.
*/
export const answer_share = (count: number, total: number): number =>
	(total <= 0 ? 0 : Math.round((count / total) * 100));

interface IQuizResultsTableProps {
	questions: IQuizQuestionSummary[];
}

function QuizResultsTable({ questions }: IQuizResultsTableProps): ReactElement {
	return (
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
	);
}

export default QuizResultsTable;
