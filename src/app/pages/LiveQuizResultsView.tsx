/*
	Shared "session ended" screen: participant count, top-5 leaderboard, and the
	full per-question breakdown (via QuizResultsTable). Used by both the
	instructor's screen (LiveQuizInstructor.tsx) and each student's screen
	(LiveQuizPlay.tsx) once a live session ends -- both parties see the same
	results.
*/
import React, { ReactElement } from 'react';

import QuizResultsTable, { IQuizQuestionSummary } from './QuizResultsTable';

export interface ILiveQuizResults {
	questions: IQuizQuestionSummary[];
	/*
		`username` is the account, kept only as a stable react key -- it is an
		email address, and this board goes on the projector. `display_name` is
		what to show: the student's roster nickname, or their username when they
		do not have one. Both are decided server-side by display_name_for() in
		app_quizsessions.ts.
	*/
	leaderboard: { username: string; display_name: string; correct: number }[];
	participant_count: number;
}

interface ILiveQuizResultsViewProps {
	results: ILiveQuizResults | null;
}

function LiveQuizResultsView({ results }: ILiveQuizResultsViewProps): ReactElement {
	return (
		<div className='live-quiz'>
			<h3 className='quiz-results-heading'>Live session results</h3>
			{ results === null ? (
				<p className='live-quiz-message'>Loading results&hellip;</p>
			) : (
				<>
					<p className='quiz-results-subhead'>
						{ results.participant_count } student{ results.participant_count === 1 ? '' : 's' } participated.
					</p>

					{ results.leaderboard.length > 0 ? (
						<div className='live-quiz-leaderboard'>
							<h4>Top 5</h4>
							<ol>
								{ results.leaderboard.map((entry) => (
									<li key={entry.username}>
										{ entry.display_name } &mdash; { entry.correct } correct
									</li>
								)) }
							</ol>
						</div>
					) : null }

					<QuizResultsTable questions={results.questions} />
				</>
			) }
		</div>
	);
}

export default LiveQuizResultsView;
