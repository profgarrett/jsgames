/*
	Pure helpers behind PagePractice.tsx's admin-only "Export to Word" screen.

	The goal of that screen is a browser copy/paste: the admin selects the
	rendered content (or clicks Copy) and pastes it straight into Word. Real
	<table>, <ol>/<ul>, and <strong> elements survive that paste as an actual
	Word table, numbered list, and bold run respectively -- no docx-generation
	library needed -- so this module only has to shape the *data* those
	elements are built from. See the uploaded reference quiz
	("ACCT 425 Quiz dv01 dv20 Solution.docx") for the layout being matched:
	a term-matching table up top, multiple-choice questions below it with the
	correct answer in bold.

	Everything here is a pure function so it can be unit tested directly, per
	this project's convention of not rendering React component internals in
	tests.
*/
import { IFlashcard } from './PageFlashcards';
import { IQuizQuestion, shuffle } from './PageQuiz';

/*
	Spreadsheet-style column letters: 0 -> A, 25 -> Z, 26 -> AA, 27 -> AB, ...
	Used to label each term in the reference "Term List" column, the same way
	the sample quiz labels its own term list (A. Discrete value, B. Wide
	data, ...).
*/
export const indexToLetter = (index: number): string => {
	let n = index + 1; // work in 1-based terms so the base-26 math has no zero digit
	let letters = '';

	while (n > 0) {
		const remainder = (n - 1) % 26;
		letters = String.fromCharCode(65 + remainder) + letters;
		n = Math.floor((n - 1) / 26);
	}

	return letters;
};

export interface ITermListEntry {
	letter: string;
	term: string;
}

export interface ITermMatchRow {
	number: number;
	definition: string;
	// The correct answer for this row, already lettered (e.g. "F. Distribution") --
	// matches the sample document's Term column, which spells out the letter
	// inline rather than relying on the reader to cross-reference by row.
	term: string;
}

export interface ITermSection {
	// One row per selected term, in the order the terms were selected --
	// mirrors the Definition/# columns of the sample table.
	rows: ITermMatchRow[];
	// The same terms, alphabetized and lettered A, B, C... -- mirrors the
	// sample's "Term List" reference column. Deliberately in a different
	// order than `rows` (alphabetical vs. selection order) so the two
	// columns don't just repeat each other, same as the sample.
	termList: ITermListEntry[];
}

/*
	Build the "Key Terms" matching table from a selected set of flashcards.
	Letters are assigned alphabetically by term text (case-insensitive), then
	looked up for each row so the Definition rows and the Term List column
	reference the same lettering even though they're ordered differently.
*/
export const buildTermSection = (terms: IFlashcard[]): ITermSection => {
	const alphabetized = terms
		.slice()
		.sort((a, b) => a.term.localeCompare(b.term, undefined, { sensitivity: 'base' }));

	const letterByTerm = new Map<string, string>();
	alphabetized.forEach((card, i) => letterByTerm.set(card.term.toLowerCase(), indexToLetter(i)));

	const termList: ITermListEntry[] = alphabetized.map((card) => ({
		letter: letterByTerm.get(card.term.toLowerCase()) ?? '',
		term: card.term,
	}));

	const rows: ITermMatchRow[] = terms.map((card, i) => ({
		number: i + 1,
		definition: card.definition,
		term: `${letterByTerm.get(card.term.toLowerCase()) ?? ''}. ${card.term}`,
	}));

	return { rows, termList };
};

export interface IExportChoice {
	text: string;
	correct: boolean;
}

export interface IExportQuestion {
	prompt: string;
	choices: IExportChoice[];
}

/*
	Turn selected quiz questions into a shuffled, exportable shape: answer
	order is randomized per question (so the correct answer isn't always
	listed first, the way it's stored -- see IQuizQuestion.answers) with the
	correct one flagged so the caller can render it in bold, matching the
	sample document's bolded correct answers.
*/
export const buildExportQuestions = (questions: IQuizQuestion[]): IExportQuestion[] =>
	questions.map((question) => ({
		prompt: question.prompt,
		choices: shuffle(question.answers.map((text, i) => ({ text, correct: i === 0 }))),
	}));
