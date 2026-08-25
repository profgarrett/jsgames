/*
	Instructor-facing live quiz session.

	Built on top of the page's "## Practice Questions" deck (PageQuiz.tsx) and,
	optionally, its key terms (PageFlashcards.tsx) -- a selected term is turned
	into a "what's the definition of X" multiple-choice question, distractors
	drawn from other terms' definitions on the same page (see
	buildTermQuestions). If there's no session already in progress for this
	page, the instructor first picks which questions/terms to include (see the
	selection screen below -- prompts and terms only, no answers/definitions,
	so it's safe to show while students may be nearby); confirming that builds
	the combined deck and creates the session. Students work through it at
	their own pace once started (see LiveQuizPlay.tsx) -- there's no single
	"current question" for the instructor to drive, so from there this screen
	just tracks who has joined and lets the instructor start/end the session.
	Ending shows the shared results + leaderboard, once every student's
	answers have been rolled up.

	The server is the source of truth for session state; this component mostly
	polls GET /api/quizsessions/:idsession/state and posts actions. See
	src/server/app_quizsessions.ts for the API this talks to.
*/
import React, { ReactElement, useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import { IQuizQuestion, buildQuiz, shuffle } from './PageQuiz';
import { IFlashcard } from './PageFlashcards';
import LiveQuizResultsView, { ILiveQuizResults } from './LiveQuizResultsView';

const POLL_INTERVAL_MS = 2000;
// Total answer options on a term question: the correct definition plus this many distractors.
const TERM_QUESTION_DISTRACTOR_COUNT = 4;

interface IParticipantProgress {
	// The account. Only used as a react key -- never shown, since it is an
	// email address and this screen is projected in front of the class.
	username: string;
	// The student's nickname from the uploaded roster, falling back to their
	// username when they do not have one. Computed server-side by
	// display_name_for() in app_quizsessions.ts.
	display_name: string;
	completed: number;
}

interface ISessionState {
	idsession: number;
	code: string;
	page: string;
	status: 'waiting' | 'active' | 'ended';
	participant_count: number;
	// Deprecated on the server too: participants[].display_name is what this
	// screen renders. Still typed so the shape matches what /state sends.
	usernames: string[];
	participants: IParticipantProgress[];
}

interface ILiveQuizInstructorProps {
	quizQuestions: IQuizQuestion[];
	flashcards: IFlashcard[];
	page: string;
}

/*
	Other terms' definitions to use as wrong answers for `term`, drawn from the
	full set of key terms on the page (not just the ones selected for this
	session, so a question still gets distractors even if few other terms were
	picked). Excludes `term` itself and de-duplicates identical definition
	text, so a question never ends up with two options that read the same.
	Exported for unit testing.
*/
export const pick_distractors = (term: IFlashcard, allTerms: IFlashcard[], count: number): string[] => {
	const seen = new Set<string>([term.definition]);
	const candidates: string[] = [];

	for (const candidate of allTerms) {
		if (candidate.term === term.term || seen.has(candidate.definition)) continue;
		seen.add(candidate.definition);
		candidates.push(candidate.definition);
	}

	return shuffle(candidates).slice(0, count);
};

/*
	Turn each selected key term into one multiple-choice question: "What is
	the definition of X?", with its real definition plus up to
	TERM_QUESTION_DISTRACTOR_COUNT other definitions as wrong answers (fewer if
	the page doesn't have that many other terms). A term with no available
	distractors at all can't form a valid multiple-choice question and is
	skipped. Exported for unit testing.
*/
export const buildTermQuestions = (selectedTerms: IFlashcard[], allTerms: IFlashcard[]): IQuizQuestion[] =>
	selectedTerms
		.map((term) => ({
			prompt: `What is the definition of "${term.term}"?`,
			answers: [term.definition, ...pick_distractors(term, allTerms, TERM_QUESTION_DISTRACTOR_COUNT)],
		}))
		.filter((question) => question.answers.length >= 2);

// Toggles `index` in a Set-of-indices selection state. Shared by the
// questions and terms lists on the selection screen.
const toggleIndex = (index: number, current: Set<number>): Set<number> => {
	const next = new Set(current);
	if (next.has(index)) next.delete(index); else next.add(index);
	return next;
};

interface IRandomPickControlProps {
	// Size of the list this control picks from.
	total: number;
	onPick: (count: number) => void;
}

/*
	A number input plus a "Select random" button, for picking N items at
	random out of a list (used by both the practice-questions and key-terms
	sections). Owns its own count so the two sections don't share one value.
*/
function RandomPickControl({ total, onPick }: IRandomPickControlProps): ReactElement {
	const [count, setCount] = useState(() => Math.max(1, Math.min(5, total)));

	const clamp = (value: number): number => {
		if (!Number.isFinite(value)) return 1;
		return Math.max(1, Math.min(total, Math.round(value)));
	};

	return (
		<span className='live-quiz-random-pick'>
			<Form.Control
				type='number'
				size='sm'
				min={1}
				max={total}
				value={count}
				onChange={(e) => setCount(clamp(Number(e.target.value)))}
			/>
			<Button variant='outline-secondary' size='sm' onClick={() => onPick(count)}>
				Select random
			</Button>
		</span>
	);
}

function LiveQuizInstructor({ quizQuestions, flashcards, page }: ILiveQuizInstructorProps): ReactElement {
	const [session, setSession] = useState<ISessionState | null>(null);
	const [resumeChecked, setResumeChecked] = useState(false);
	// Practice questions default to fully selected (matches the prior, selection-free
	// behavior). Key terms are a new, opt-in addition, so none start selected.
	const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(() => new Set(quizQuestions.map((_, i) => i)));
	const [selectedTerms, setSelectedTerms] = useState<Set<number>>(() => new Set());
	const [creating, setCreating] = useState(false);
	const [results, setResults] = useState<ILiveQuizResults | null>(null);
	const [error, setError] = useState('');

	// Resume an in-progress session for this page, if there is one. Otherwise
	// the instructor lands on the question-selection screen below.
	useEffect(() => {
		let cancelled = false;

		(async () => {
			try {
				const activeRes = await fetch(`/api/quizsessions/mine/active?page=${encodeURIComponent(page)}`, { credentials: 'include' });
				const activeJson = await activeRes.json();
				if (cancelled) return;
				if (activeJson.session) setSession(activeJson.session);
			} catch {
				if (!cancelled) setError('Could not check for an active session.');
			} finally {
				if (!cancelled) setResumeChecked(true);
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

	const toggleQuestion = (index: number): void => setSelectedQuestions((current) => toggleIndex(index, current));
	const toggleTerm = (index: number): void => setSelectedTerms((current) => toggleIndex(index, current));

	// Replaces the current selection with `count` randomly-chosen items, not adds to it.
	const selectRandomQuestions = (count: number): void =>
		setSelectedQuestions(new Set(shuffle(quizQuestions.map((_, i) => i)).slice(0, count)));
	const selectRandomTerms = (count: number): void =>
		setSelectedTerms(new Set(shuffle(flashcards.map((_, i) => i)).slice(0, count)));

	const totalSelected = selectedQuestions.size + selectedTerms.size;

	const createSession = async (): Promise<void> => {
		if (totalSelected === 0 || creating) return;
		setCreating(true);
		setError('');

		try {
			const chosenQuestions = quizQuestions.filter((_, i) => selectedQuestions.has(i));
			const chosenTerms = flashcards.filter((_, i) => selectedTerms.has(i));
			const deck = buildQuiz([...chosenQuestions, ...buildTermQuestions(chosenTerms, flashcards)]);
			const createRes = await fetch('/api/quizsessions', {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ page, questions: deck }),
			});
			const createJson = await createRes.json();
			if (!createRes.ok) { setError(createJson.error || 'Could not start the live session.'); return; }

			const stateRes = await fetch(`/api/quizsessions/${createJson.idsession}/state`, { credentials: 'include' });
			setSession(await stateRes.json());
		} catch {
			setError('Could not start the live session.');
		} finally {
			setCreating(false);
		}
	};

	if (!resumeChecked) {
		return <div className='live-quiz'><p className='live-quiz-message'>{ error !== '' ? error : 'Checking for an active session…' }</p></div>;
	}

	// No session running yet -- have the instructor pick which questions (and,
	// optionally, key terms) to include.
	if (!session) {
		return (
			<div className='live-quiz'>
				<div className='live-quiz-select'>
					<h3>Select questions</h3>
					<p className='live-quiz-instructions'>
						Choose which questions students will see. Answers aren&rsquo;t shown here.
					</p>

					{ quizQuestions.length > 0 ? (
						<div className='live-quiz-select-section'>
							<h4 className='live-quiz-select-section-title'>Practice questions</h4>
							<p className='live-quiz-select-count'>{ selectedQuestions.size } of { quizQuestions.length } selected</p>

							<div className='live-quiz-select-actions'>
								<Button variant='link' size='sm' onClick={() => setSelectedQuestions(new Set(quizQuestions.map((_, i) => i)))}>
									Select all
								</Button>
								<Button variant='link' size='sm' onClick={() => setSelectedQuestions(new Set())}>
									Select none
								</Button>
								<RandomPickControl total={quizQuestions.length} onPick={selectRandomQuestions} />
							</div>

							<ul className='live-quiz-select-list'>
								{ quizQuestions.map((question, i) => (
									<li key={i}>
										<Form.Check
											type='checkbox'
											id={`live-quiz-select-question-${i}`}
											label={question.prompt}
											checked={selectedQuestions.has(i)}
											onChange={() => toggleQuestion(i)}
										/>
									</li>
								)) }
							</ul>
						</div>
					) : null }

					{ flashcards.length > 0 ? (
						<div className='live-quiz-select-section'>
							<h4 className='live-quiz-select-section-title'>Key terms</h4>
							<p className='live-quiz-instructions'>
								Each selected term becomes one question, with its definition and { TERM_QUESTION_DISTRACTOR_COUNT } other
								definitions as answer choices.
							</p>
							<p className='live-quiz-select-count'>{ selectedTerms.size } of { flashcards.length } selected</p>

							<div className='live-quiz-select-actions'>
								<Button variant='link' size='sm' onClick={() => setSelectedTerms(new Set(flashcards.map((_, i) => i)))}>
									Select all
								</Button>
								<Button variant='link' size='sm' onClick={() => setSelectedTerms(new Set())}>
									Select none
								</Button>
								<RandomPickControl total={flashcards.length} onPick={selectRandomTerms} />
							</div>

							<ul className='live-quiz-select-list'>
								{ flashcards.map((card, i) => (
									<li key={i}>
										<Form.Check
											type='checkbox'
											id={`live-quiz-select-term-${i}`}
											label={card.term}
											checked={selectedTerms.has(i)}
											onChange={() => toggleTerm(i)}
										/>
									</li>
								)) }
							</ul>
						</div>
					) : null }

					<Button variant='primary' size='lg' onClick={createSession} disabled={totalSelected === 0 || creating}>
						{ creating ? 'Starting…' : 'Create session' }
					</Button>

					{ error !== '' ? <p className='live-quiz-error'>{ error }</p> : null }
				</div>
			</div>
		);
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
						{ session.participants.length > 0 ? (
							<ul className='live-quiz-joined-names'>
								{ session.participants.map((participant) => (
									<li key={participant.username}>{ participant.display_name }</li>
								)) }
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
										<span className='live-quiz-progress-name'>{ participant.display_name }</span>
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
