/*
	Pure helpers behind PagePractice.tsx's admin-only "Export to Blackboard"
	button.

	Sibling to PageExportWord.ts: same selected terms and questions, but
	instead of a copy/paste screen this builds the tab-delimited text file
	Blackboard's question upload accepts (Test > Upload questions), which the
	button downloads straight to the instructor's computer. Format reference:
	https://help.anthology.com/blackboard/instructor/en/assessments/questions/reuse-questions/upload-or-import-questions.html

	  - One question per line, fields separated by TAB, no header row, no
	    blank lines.
	  - Multiple choice:
	        MC <TAB> question <TAB> answer <TAB> correct|incorrect <TAB> answer <TAB> correct|incorrect ...
	  - Matching (one-to-one pairs; Blackboard shuffles the right-hand side):
	        MAT <TAB> question <TAB> answer <TAB> matching text <TAB> answer <TAB> matching text ...

	Layout mirrors the Word export: the selected terms become one matching
	question (definition on the left, term on the right -- the same pairing
	as the Word table's Definition/Term columns), followed by one MC question
	per selected quiz question with its answers shuffled.

	Blackboard imports every question at 0 points; the instructor sets point
	values after uploading.

	Everything here is a pure function so it can be unit tested directly; the
	actual browser download lives in PagePractice.tsx.
*/
import { IFlashcard } from './PageFlashcards';
import { IQuizQuestion } from './PageQuiz';
import { buildExportQuestions, IExportQuestion } from './PageExportWord';

// Blackboard caps answers per question at 100, and recommends no more than
// 250 questions per uploaded file.
export const MAX_MATCHING_PAIRS = 100;
export const RECOMMENDED_MAX_QUESTIONS = 250;

export const MATCHING_PROMPT = 'Match each definition with its term.';

/*
	A TAB inside a field would start a new field, and a line break would start
	a new question, so collapse every run of whitespace to a single space.
*/
export const cleanField = (text: string): string => text.replace(/\s+/g, ' ').trim();

const toRow = (fields: string[]): string => fields.map(cleanField).join('\t');

export const buildMultipleChoiceRow = (question: IExportQuestion): string =>
	toRow([
		'MC',
		question.prompt,
		...question.choices.flatMap((choice) => [choice.text, choice.correct ? 'correct' : 'incorrect']),
	]);

/*
	One MAT row per (up to) 100 terms. Almost always a single row; the split
	only exists so a very large selection doesn't exceed Blackboard's
	per-question answer limit.
*/
export const buildMatchingRows = (terms: IFlashcard[]): string[] => {
	const rows: string[] = [];
	const parts = Math.ceil(terms.length / MAX_MATCHING_PAIRS);

	for (let part = 0; part < parts; part++) {
		const chunk = terms.slice(part * MAX_MATCHING_PAIRS, (part + 1) * MAX_MATCHING_PAIRS);
		const prompt = parts > 1 ? `${MATCHING_PROMPT} (Part ${part + 1} of ${parts})` : MATCHING_PROMPT;
		rows.push(toRow(['MAT', prompt, ...chunk.flatMap((card) => [card.definition, card.term])]));
	}

	return rows;
};

/*
	The full upload file: matching question(s) first, then multiple choice,
	one per line. No trailing newline, since Blackboard rejects blank lines.
*/
export const buildBlackboardFile = (terms: IFlashcard[], questions: IQuizQuestion[]): string =>
	[
		...buildMatchingRows(terms),
		...buildExportQuestions(questions).map(buildMultipleChoiceRow),
	].join('\n');

// e.g. "course_dv/dv01-eda/index" -> "course_dv-dv01-eda-blackboard.txt"
export const blackboardFileName = (slug: string): string => {
	const base = slug
		.replace(/(^|\/)index$/, '')
		.replace(/[^A-Za-z0-9_-]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return `${base || 'quiz'}-blackboard.txt`;
};
