import React, { ReactElement, useMemo, useState } from 'react';
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
	markdown. One card is shown at a time; click the card (or press Space/Enter)
	to flip between the term and its definition. Prev/Next step through the deck.
*/
function PageFlashcards({ markdown }: IFlashcardDeckProps): ReactElement {
	const cards = useMemo(() => extractFlashcards(markdown), [markdown]);
	const [index, setIndex] = useState(0);
	const [flipped, setFlipped] = useState(false);

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

	const goTo = (next: number): void => {
		const wrapped = (next + cards.length) % cards.length;
		setIndex(wrapped);
		setFlipped(false);
	};

	const flip = (): void => setFlipped((f) => !f);

	const handleKey = (event: React.KeyboardEvent): void => {
		if (event.key === ' ' || event.key === 'Enter') {
			event.preventDefault();
			flip();
		} else if (event.key === 'ArrowRight') {
			goTo(safeIndex + 1);
		} else if (event.key === 'ArrowLeft') {
			goTo(safeIndex - 1);
		}
	};

	return (
		<div className='flashcards'>
			<div className='flashcards-progress'>
				Card { safeIndex + 1 } of { cards.length }
			</div>

			<div
				className={`flashcard${flipped ? ' is-flipped' : ''}`}
				role='button'
				tabIndex={0}
				onClick={flip}
				onKeyDown={handleKey}
				aria-label='Flashcard. Activate to flip.'
			>
				<div className='flashcard-inner'>
					<div className='flashcard-face flashcard-front'>
						<span className='flashcard-label'>Term</span>
						<span className='flashcard-text'>{ card.term }</span>
						<span className='flashcard-hint'>Click to reveal definition</span>
					</div>
					<div className='flashcard-face flashcard-back'>
						<span className='flashcard-label'>Definition</span>
						<span className='flashcard-text'>{ card.definition }</span>
						<span className='flashcard-hint'>{ card.term }</span>
					</div>
				</div>
			</div>

			<ButtonGroup className='flashcards-controls'>
				<Button variant='outline-secondary' onClick={() => goTo(safeIndex - 1)}>
					&larr; Prev
				</Button>
				<Button variant='outline-primary' onClick={flip}>
					Flip
				</Button>
				<Button variant='outline-secondary' onClick={() => goTo(safeIndex + 1)}>
					Next &rarr;
				</Button>
			</ButtonGroup>
		</div>
	);
}

export default PageFlashcards;
