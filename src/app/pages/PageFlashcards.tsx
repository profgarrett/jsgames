import React, { ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

export interface IFlashcard {
	term: string;
	definition: string;
}

/*
	Extract term/definition flashcards from a markdown string.

	Terms are "marked" using the bold-bullet convention already used throughout
	the course content, e.g.

		- **Primary Key**: A unique identifier for each record in a table.

	The leading list marker may be `-`, `*`, or `+`, and the separator between
	the bold term and its definition may be `:` or `-`. Inline bold markers
	inside the definition are stripped so cards read cleanly.
*/
export const extractFlashcards = (markdown: string): IFlashcard[] => {
	if (!markdown) return [];

	const cards: IFlashcard[] = [];
	const seen = new Set<string>();

	// Match:  - **Term**: definition
	//         [indent][marker] [**Term**] [: or -] [definition]
	const lineRegex = /^\s*[-*+]\s+\*\*([^*]+?)\*\*\s*[:\-–—]\s+(.+?)\s*$/;

	for (const rawLine of markdown.split(/\r?\n/)) {
		const match = rawLine.match(lineRegex);
		if (!match) continue;

		const term = match[1].trim();
		// Strip any leftover markdown emphasis / inline code from the definition.
		const definition = match[2]
			.replace(/\*\*([^*]+)\*\*/g, '$1')
			.replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, '$1')
			.replace(/`([^`]+)`/g, '$1')
			.trim();

		if (!term || !definition) continue;

		const key = term.toLowerCase();
		if (seen.has(key)) continue; // skip duplicate terms
		seen.add(key);

		cards.push({ term, definition });
	}

	return cards;
};

interface IFlashcardDeckProps {
	markdown: string;
}

/*
	Renders an interactive flashcard deck built from the marked terms in a page's
	markdown. One card is shown at a time.

	The card starts with only the prompt visible. Clicking the card, pressing
	Space/Enter, or clicking Next reveals the answer directly below the prompt.
	Once the answer is showing, Next moves on to the following card.

	The middle button swaps which side is the prompt: terms first (the default,
	term -> definition) or definitions first (definition -> term).

	Prev/Next (and the arrow keys) page between *cards* only -- the revealed
	answer is part of the current card, not a separate page -- so the deck is
	always `cards.length` steps long.

	The Next button takes keyboard focus as soon as the deck mounts, so the whole
	deck can be worked through with the space bar alone.
*/
function PageFlashcards({ markdown }: IFlashcardDeckProps): ReactElement {
	const cards = useMemo(() => extractFlashcards(markdown), [markdown]);
	const [index, setIndex] = useState(0);
	const [revealed, setRevealed] = useState(false);
	// false: term is the prompt (term -> definition). true: the reverse.
	const [definitionFirst, setDefinitionFirst] = useState(false);
	const nextRef = useRef<HTMLButtonElement>(null);

	// The deck is mounted only while flashcard mode is on, so focusing on mount
	// puts the keyboard on Next as soon as the deck becomes active: space then
	// reveals the definition and steps through the terms without any clicking.
	// preventScroll keeps the page from jumping to the button on activation.
	useEffect(() => {
		nextRef.current?.focus({ preventScroll: true });
	}, []);

	if (cards.length === 0) {
		return (
			<div className='flashcards'>
				<p className='flashcards-empty'>
					No terms found on this page. Mark terms with the
					<code> - **Term**: Definition </code>
					bullet format to generate flashcards.
				</p>
			</div>
		);
	}

	// Clamp index in case the deck shrank.
	const safeIndex = Math.min(index, cards.length - 1);
	const card = cards[safeIndex];

	const promptLabel = definitionFirst ? 'Definition' : 'Term';
	const answerLabel = definitionFirst ? 'Term' : 'Definition';
	const promptText = definitionFirst ? card.definition : card.term;
	const answerText = definitionFirst ? card.term : card.definition;

	// Paging always lands on a card with its answer hidden again.
	const goTo = (next: number): void => {
		const wrapped = (next + cards.length) % cards.length;
		setIndex(wrapped);
		setRevealed(false);
	};

	// Swapping sides re-hides the answer, so the new prompt is a fresh question.
	const swapSides = (): void => {
		setDefinitionFirst((d) => !d);
		setRevealed(false);
	};

	// Space / Enter / the card itself / Next all do the same thing: show the
	// answer, or advance to the next card if it is already showing.
	const revealOrAdvance = (): void => {
		if (revealed) goTo(safeIndex + 1);
		else setRevealed(true);
	};

	// Space/Enter on the card itself. A real <button> already fires onClick for
	// these keys, so this only covers the card div, which is not a button.
	const handleCardKey = (event: React.KeyboardEvent): void => {
		if (event.key === ' ' || event.key === 'Enter') {
			event.preventDefault();
			revealOrAdvance();
		}
	};

	// Arrow keys are handled on the wrapper so they work wherever focus sits in
	// the deck -- including the Next button, which is focused on mount.
	const handleDeckKey = (event: React.KeyboardEvent): void => {
		if (event.key === 'ArrowRight') {
			event.preventDefault();
			goTo(safeIndex + 1);
		} else if (event.key === 'ArrowLeft') {
			event.preventDefault();
			goTo(safeIndex - 1);
		}
	};

	return (
		// eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
		<div className='flashcards' onKeyDown={handleDeckKey}>
			<div className='flashcards-progress'>
				Card { safeIndex + 1 } of { cards.length }
			</div>

			<div
				className={`flashcard${revealed ? ' is-revealed' : ''}`}
				role='button'
				tabIndex={0}
				onClick={revealOrAdvance}
				onKeyDown={handleCardKey}
				aria-label={revealed
					? `Flashcard showing ${promptLabel.toLowerCase()} and ${answerLabel.toLowerCase()}. Activate for the next card.`
					: `Flashcard. Activate to reveal the ${answerLabel.toLowerCase()}.`}
			>
				<div className='flashcard-prompt'>
					<span className='flashcard-label'>{ promptLabel }</span>
					<span className='flashcard-text'>{ promptText }</span>
				</div>

				{ revealed ? (
					<div className='flashcard-answer'>
						<span className='flashcard-label'>{ answerLabel }</span>
						<span className='flashcard-text'>{ answerText }</span>
					</div>
				) : (
					<span className='flashcard-hint'>
						Click, or press space, to reveal the { answerLabel.toLowerCase() }
					</span>
				) }
			</div>

			<ButtonGroup className='flashcards-controls'>
				<Button variant='outline-secondary' onClick={() => goTo(safeIndex - 1)}>
					&larr; Prev
				</Button>
				<Button
					variant='outline-primary'
					onClick={swapSides}
					aria-pressed={definitionFirst}
					title='Swap which side of the card is shown first'
				>
					{ definitionFirst ? 'Definitions first' : 'Terms first' }
				</Button>
				<Button ref={nextRef} variant='outline-secondary' onClick={revealOrAdvance}>
					Next &rarr;
				</Button>
			</ButtonGroup>
		</div>
	);
}

export default PageFlashcards;
