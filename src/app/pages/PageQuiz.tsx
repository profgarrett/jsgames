import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

import { getUserFromBrowser } from './../components/Authentication';

export interface IQuizQuestion {
	prompt: string;
	// Answers in the order they were authored. The first entry is the correct one.
	answers: string[];
}

export interface IQuizOption {
	text: string;
	isCorrect: boolean;
}

export interface IShuffledQuestion {
	prompt: string;
	options: IQuizOption[];
}

/*
	Strip inline markdown (bold, italic, inline code, links) so answers read
	cleanly when rendered as plain text.
*/
const stripInlineMarkdown = (text: string): string =>
	text
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, '$1')
		.replace(/`([^`]+)`/g, '$1')
		.trim();

/*
	Extract multiple-choice questions from the "## Practice Questions" section of
	a page's markdown.

	The authoring convention (see static/pages/course_dv/dv01-eda/index.md) is an
	ordered list of questions, each followed by an indented bullet list of
	answers, where THE FIRST ANSWER IS THE CORRECT ONE:

		## Practice Questions

		1. Who first introduced Exploratory Data Analysis?
		   - John Tukey
		   - Frank Anscombe
		   - Edward Tufte

	Ordered list markers may be `1.` or `1)` (markdown renumbers automatically,
	so the source usually repeats `1.`). Answer bullets may use `-`, `*`, or `+`.
	Questions with fewer than two answers are skipped.
*/
export const extractQuizQuestions = (markdown: string): IQuizQuestion[] => {
	if (!markdown) return [];

	const lines = markdown.split(/\r?\n/);
	const questions: IQuizQuestion[] = [];

	let inSection = false;
	let current: IQuizQuestion | null = null;

	const finish = (): void => {
		if (current && current.answers.length >= 2) questions.push(current);
		current = null;
	};

	for (const line of lines) {
		const heading = line.match(/^(#{1,6})\s+(.+?)\s*$/);

		if (heading) {
			const level = heading[1].length;
			const text = heading[2].trim().toLowerCase();

			if (!inSection) {
				// Start collecting once we hit the Practice Questions heading.
				if (text === 'practice questions') inSection = true;
				continue;
			}

			// Inside the section: a same-or-higher level heading ends it.
			// Deeper headings (e.g. ### within the section) are ignored.
			if (level <= 2) {
				finish();
				inSection = false;
			}
			continue;
		}

		if (!inSection) continue;

		const questionMatch = line.match(/^\s{0,3}\d+[.)]\s+(.+?)\s*$/);
		if (questionMatch) {
			finish();
			const prompt = stripInlineMarkdown(questionMatch[1]);
			current = prompt ? { prompt, answers: [] } : null;
			continue;
		}

		const answerMatch = line.match(/^[ \t]+[-*+]\s+(.+?)\s*$/);
		if (answerMatch && current) {
			const answer = stripInlineMarkdown(answerMatch[1]);
			if (answer) current.answers.push(answer);
			continue;
		}
	}

	finish();

	return questions;
};

/*
	Remove the "## Practice Questions" section from a markdown string so the
	reading view does not display the questions -- and, more importantly, their
	answers -- outside of quiz mode. Uses the same section boundary as
	extractQuizQuestions: everything from the heading up to (but not including)
	the next level-1 or level-2 heading.
*/
export const removeQuizSection = (markdown: string): string => {
	if (!markdown) return markdown;

	const lines = markdown.split(/\r?\n/);
	const kept: string[] = [];
	let inSection = false;

	for (const line of lines) {
		const heading = line.match(/^(#{1,6})\s+(.+?)\s*$/);

		if (heading) {
			const level = heading[1].length;
			const text = heading[2].trim().toLowerCase();

			if (!inSection && level === 2 && text === 'practice questions') {
				inSection = true;
				continue;
			}
			if (inSection && level <= 2) inSection = false;
		}

		if (!inSection) kept.push(line);
	}

	// Collapse the run of blank lines left behind where the section was.
	return kept.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\s+$/, '\n');
};

/* Fisher-Yates shuffle. Returns a new array; the input is not modified. */
export const shuffle = <T,>(items: T[]): T[] => {
	const copy = items.slice();
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
};

/* Randomize the question order, and the answer order within each question. */
export const buildQuiz = (questions: IQuizQuestion[]): IShuffledQuestion[] =>
	shuffle(questions).map((question) => ({
		prompt: question.prompt,
		options: shuffle(
			question.answers.map((text, index) => ({ text, isCorrect: index === 0 })),
		),
	}));

/*
	Report a submitted answer to the server for logging (one row per submission,
	so a retake creates new rows).

	Deliberately fire-and-forget: the promise is never awaited and every failure
	is swallowed, so logging can never delay or break the student's quiz. Skipped
	entirely for logged-out visitors, since the API requires a session.
	Exported for unit testing.
*/
export const logQuizAnswer = (entry: {
	page: string;
	question: string;
	answer: string;
	correct: boolean;
}): void => {
	try {
		if (getUserFromBrowser().username === '') return;

		fetch('/api/quizviews', {
			method: 'POST',
			credentials: 'include',
			keepalive: true,
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(entry),
		}).catch(() => {});
	} catch {
		// Never let tracking surface an error into the UI.
	}
};

interface IPageQuizProps {
	markdown: string;
	// Page slug, recorded with each logged answer.
	page?: string;
}

/*
	Renders an interactive multiple-choice quiz built from the "## Practice
	Questions" section of a page's markdown. Questions are presented one at a
	time in random order with randomly ordered answers. The student picks an
	answer, is told immediately whether it was right or wrong, then advances to
	the next question. A score summary is shown at the end.
*/
function PageQuiz({ markdown, page = '' }: IPageQuizProps): ReactElement {
	const questions = useMemo(() => extractQuizQuestions(markdown), [markdown]);

	const [deck, setDeck] = useState<IShuffledQuestion[]>(() => buildQuiz(questions));
	const [index, setIndex] = useState(0);
	const [selected, setSelected] = useState<number | null>(null);
	const [correctCount, setCorrectCount] = useState(0);
	const [finished, setFinished] = useState(false);

	const restart = (source: IQuizQuestion[]): void => {
		setDeck(buildQuiz(source));
		setIndex(0);
		setSelected(null);
		setCorrectCount(0);
		setFinished(false);
	};

	// Reshuffle whenever the page (and therefore the question set) changes.
	useEffect(() => { restart(questions); }, [questions]);

	if (questions.length === 0) {
		return (
			<div className='quiz'>
				<p className='quiz-empty'>
					No practice questions found on this page. Add a
					<code> ## Practice Questions </code>
					section with a numbered question followed by indented answer
					bullets, listing the correct answer first.
				</p>
			</div>
		);
	}

	if (deck.length === 0) return <div className='quiz' />;

	if (finished) {
		const percent = Math.round((correctCount / deck.length) * 100);
		return (
			<div className='quiz'>
				<div className='quiz-results'>
					<h3 className='quiz-results-title'>Quiz complete</h3>
					<p className='quiz-results-score'>
						{ correctCount } of { deck.length } correct ({ percent }%)
					</p>
					<Button variant='outline-primary' onClick={() => restart(questions)}>
						Start over
					</Button>
				</div>
			</div>
		);
	}

	const safeIndex = Math.min(index, deck.length - 1);
	const question = deck[safeIndex];
	const answered = selected !== null;
	const gotItRight = answered && question.options[selected].isCorrect;
	const isLast = safeIndex === deck.length - 1;

	const choose = (optionIndex: number): void => {
		if (answered) return;

		const option = question.options[optionIndex];
		setSelected(optionIndex);
		if (option.isCorrect) setCorrectCount((count) => count + 1);

		// Non-blocking: the UI updates above regardless of what happens here.
		logQuizAnswer({
			page,
			question: question.prompt,
			answer: option.text,
			correct: option.isCorrect,
		});
	};

	const next = (): void => {
		if (isLast) {
			setFinished(true);
			return;
		}
		setIndex(safeIndex + 1);
		setSelected(null);
	};

	const optionClass = (optionIndex: number): string => {
		const option = question.options[optionIndex];
		if (!answered) return 'quiz-option';
		if (option.isCorrect) return 'quiz-option is-correct';
		if (optionIndex === selected) return 'quiz-option is-wrong';
		return 'quiz-option is-muted';
	};

	const handleKey = (event: React.KeyboardEvent): void => {
		if (answered && (event.key === 'Enter' || event.key === ' ')) {
			event.preventDefault();
			next();
			return;
		}

		// Number keys pick an answer.
		const digit = Number(event.key);
		if (!answered && Number.isInteger(digit) && digit >= 1 && digit <= question.options.length) {
			event.preventDefault();
			choose(digit - 1);
		}
	};

	return (
		<div className='quiz' onKeyDown={handleKey}>
			<div className='quiz-progress'>
				Question { safeIndex + 1 } of { deck.length }
				<span className='quiz-score'>Score: { correctCount } / { safeIndex + (answered ? 1 : 0) }</span>
			</div>

			<div className='quiz-card'>
				<p className='quiz-prompt'>{ question.prompt }</p>

				<ul className='quiz-options'>
					{ question.options.map((option, optionIndex) => (
						<li key={option.text}>
							<button
								type='button'
								className={optionClass(optionIndex)}
								onClick={() => choose(optionIndex)}
								disabled={answered}
							>
								<span className='quiz-option-marker'>{ optionIndex + 1 }</span>
								<span className='quiz-option-text'>{ option.text }</span>
							</button>
						</li>
					)) }
				</ul>

				{ answered ? (
					<div className={`quiz-feedback${gotItRight ? ' is-correct' : ' is-wrong'}`} role='status'>
						{ gotItRight
							? 'Correct.'
							: `Not quite. The correct answer is: ${question.options.find((o) => o.isCorrect)?.text ?? ''}` }
					</div>
				) : (
					<div className='quiz-hint'>Select an answer.</div>
				) }
			</div>

			<ButtonGroup className='quiz-controls'>
				<Button variant='outline-secondary' onClick={() => restart(questions)}>
					Restart
				</Button>
				<Button variant='outline-primary' onClick={next} disabled={!answered}>
					{ isLast ? 'See results' : 'Next →' }
				</Button>
			</ButtonGroup>
		</div>
	);
}

export default PageQuiz;
