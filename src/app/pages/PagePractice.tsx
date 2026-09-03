/*
	Multi-module practice flow: flashcards and quizzes built from more than
	just the page a student happens to be reading.

	PageQuiz.tsx and PageFlashcards.tsx used to only ever see the current
	page's markdown. This component sits in front of them and adds three
	screens:

	  1. Choose which modules to include. Only offered when the current page
	     IS a course-level hub itself (e.g. course_dv/index, viewed
	     directly) -- candidates are every page it links to that lives under
	     its own path (see PageModuleLinks.ts and IModuleScope.isHub). An
	     ordinary lesson page below a hub -- excel01-input-formats, dv20-data,
	     or anything nested deeper -- only ever practices itself; a course can
	     bundle several distinct tools under one hub (course_dv covers Data
	     Viz, Tableau, PowerBI, SQL and Python), so scoping a single lesson's
	     practice session to "everything the hub links to" would pull in
	     unrelated material. This list is built from the hub page's own
	     markdown alone -- just link text and slugs, no per-module fetch or
	     quiz/flashcard scan -- so it appears instantly, however many modules
	     it links to.
	  2. Fetch the markdown for whichever modules were selected (a brief
	     loading step -- this is the point where each module's content is
	     actually read).
	  3. Choose which individual terms and quiz questions to practice, pooled
	     from every selected page. This reuses the exact selection pattern
	     LiveQuizInstructor.tsx uses for its own question/term picker --
	     counts, Select all / Select none / Select random N, and a scrollable
	     checkbox list per section (see toggleIndex and RandomPickControl,
	     imported from there) -- so the two screens look and behave the same
	     way. Flashcards and the quiz are still separate practice modes here
	     (unlike the live session, which turns everything into one quiz deck),
	     so this screen ends in two buttons instead of one -- plus a third,
	     admin-only "Export to Word" button (see PageExportWord.ts) that shows
	     the same selection formatted as a term-matching table and a bolded-
	     answer multiple-choice list, ready to select and paste into Word.

	Quiz answers are still logged per source page (see IQuizQuestion.page in
	PageQuiz.tsx), so the admin's per-page results view stays accurate even
	when a student practices several modules in one sitting.
*/
import React, { ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Form, Table } from 'react-bootstrap';

import iPage from './iPage';
import { requestPage } from './PageViewContainer';
import { getUserFromBrowser } from './../components/Authentication';
import { getModuleScope, extractModuleLinks, buildModuleLinkList, IModuleLink } from './PageModuleLinks';
import { prepareMarkdownForSlug } from './PagePrepareMarkdown';
import { toggleIndex, RandomPickControl } from './LiveQuizInstructor';
import PageFlashcards, { extractFlashcards, IFlashcard } from './PageFlashcards';
import PageQuiz, { extractQuizQuestions, shuffle, IQuizQuestion } from './PageQuiz';
import { buildTermSection, buildExportQuestions } from './PageExportWord';

type Step = 'loading' | 'select-modules' | 'loading-content' | 'select-format' | 'flashcards' | 'quiz' | 'export';

// A selected module's fetched content, keyed by slug. Seeded with the
// current page (already known -- no fetch needed) and filled in with the
// rest only once the student confirms which modules to include.
type ContentBySlug = Map<string, { title: string; markdown: string }>;

interface IPagePracticeProps {
	// The page the student was reading when they started practice mode.
	page: iPage;
	// Return to the reading view.
	onExit: () => void;
}

const idForSlug = (prefix: string, slug: string): string => `${prefix}-${slug.replace(/\//g, '-')}`;

function PagePractice({ page, onExit }: IPagePracticeProps): ReactElement {
	const [step, setStep] = useState<Step>('loading');
	const [linkItems, setLinkItems] = useState<IModuleLink[]>([]);
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [content, setContent] = useState<ContentBySlug>(new Map());
	const moduleScope = useMemo(() => getModuleScope(page.slug), [page.slug]);

	// Building the module list needs nothing beyond the current page's own
	// markdown (isHub guarantees moduleScope.rootSlug === page.slug), so this
	// runs synchronously -- no fetch, no loading state. Fetching each selected
	// module's actual content is deferred to confirmModules below, once the
	// student has picked which ones to include.
	useEffect(() => {
		const currentPageContent: ContentBySlug = new Map([[page.slug, { title: page.title, markdown: page.markdown }]]);
		const asCurrentPageOnly = (): IModuleLink[] => [{ slug: page.slug, title: page.title }];

		// Multi-module selection is only offered when this page IS the course
		// hub itself (e.g. viewing course_dv/index directly). An ordinary
		// lesson page below it -- at any depth -- only ever practices itself: a
		// course can cover several distinct tools (Data Viz, Tableau, PowerBI,
		// SQL, Python for course_dv), so scoping a single lesson's practice
		// session to "everything the hub links to" pulled in unrelated material.
		const links = moduleScope.isHub ? extractModuleLinks(page.markdown, moduleScope.rootSlug, moduleScope.pathPrefix) : [];
		const items = moduleScope.isHub ? buildModuleLinkList({ slug: page.slug, title: page.title }, links) : asCurrentPageOnly();

		setLinkItems(items);
		setSelected(new Set(items.map((item) => item.slug)));
		setContent(currentPageContent);
		setStep(items.length > 1 ? 'select-modules' : 'select-format');
	}, [page.slug, page.title, page.markdown, moduleScope]);

	const toggleSlug = (slug: string): void => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(slug)) next.delete(slug); else next.add(slug);
			return next;
		});
	};

	// Fetch whichever selected modules haven't been read yet, then move on.
	// This is the one point in the flow where a module's actual content --
	// beyond its link text -- gets loaded.
	const confirmModules = async (): Promise<void> => {
		setStep('loading-content');

		const slugsToFetch = [...selected].filter((slug) => !content.has(slug));
		const fetched = await Promise.all(slugsToFetch.map(async (slug): Promise<[string, { title: string; markdown: string } | null]> => {
			try {
				const fetchedPage = await requestPage(slug);
				return [slug, { title: fetchedPage.title, markdown: fetchedPage.markdown }];
			} catch {
				return [slug, null]; // broken/renamed link -- just leave it out
			}
		}));

		setContent((prev) => {
			const next = new Map(prev);
			for (const [slug, value] of fetched) if (value) next.set(slug, value);
			return next;
		});
		setStep('select-format');
	};

	// Selected modules whose content is loaded, in the same order as the
	// checkbox list. A module dropped by a failed fetch above just won't have
	// an entry in `content` and is skipped here.
	const preparedPages = useMemo(() => {
		const orderedSlugs = linkItems.length > 0 ? linkItems.map((item) => item.slug) : [...selected];
		const result: { slug: string; markdown: string }[] = [];

		for (const slug of orderedSlugs) {
			if (!selected.has(slug)) continue;
			const entry = content.get(slug);
			if (entry) result.push({ slug, markdown: prepareMarkdownForSlug(entry.markdown, slug) });
		}

		return result;
	}, [linkItems, selected, content]);

	// extractFlashcards de-dupes terms (case-insensitively) within whatever
	// markdown it is given, so joining every selected page's markdown before
	// extracting also de-dupes terms authored on more than one page.
	const mergedFlashcardMarkdown = useMemo(
		() => preparedPages.map((p) => p.markdown).join('\n\n'),
		[preparedPages],
	);

	// The full pool of terms and questions across every selected, loaded
	// page -- what the checklists below are built from. Individual
	// terms/questions are picked from these pools, same as
	// LiveQuizInstructor.tsx picks from its own quizQuestions/flashcards pools.
	const allTerms: IFlashcard[] = useMemo(() => extractFlashcards(mergedFlashcardMarkdown), [mergedFlashcardMarkdown]);
	const allQuestions: IQuizQuestion[] = useMemo(
		() => preparedPages.flatMap((p) => extractQuizQuestions(p.markdown, p.slug)),
		[preparedPages],
	);

	const [selectedTerms, setSelectedTerms] = useState<Set<number>>(new Set());
	const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());

	// Whenever the selected modules' content changes (first load, or after
	// "Change modules"), start with everything selected -- matches the
	// practice flow's old, selection-free behavior. From there the student
	// can narrow down, same as an instructor narrows down a live session.
	useEffect(() => {
		setSelectedTerms(new Set(allTerms.map((_, i) => i)));
		setSelectedQuestions(new Set(allQuestions.map((_, i) => i)));
	}, [allTerms, allQuestions]);

	const toggleTerm = (index: number): void => setSelectedTerms((current) => toggleIndex(index, current));
	const toggleQuestion = (index: number): void => setSelectedQuestions((current) => toggleIndex(index, current));

	// Replaces the current selection with `count` randomly-chosen items, not adds to it.
	const selectRandomTerms = (count: number): void =>
		setSelectedTerms(new Set(shuffle(allTerms.map((_, i) => i)).slice(0, count)));
	const selectRandomQuestions = (count: number): void =>
		setSelectedQuestions(new Set(shuffle(allQuestions.map((_, i) => i)).slice(0, count)));

	const chosenTerms = useMemo(
		() => allTerms.filter((_, i) => selectedTerms.has(i)),
		[allTerms, selectedTerms],
	);
	const chosenQuestions = useMemo(
		() => allQuestions.filter((_, i) => selectedQuestions.has(i)),
		[allQuestions, selectedQuestions],
	);

	// "Export to Word" is an admin-only escape hatch onto a page's own
	// content: an instructor building a paper quiz can pull the currently
	// selected terms/questions into a copy-paste-ready screen (see
	// PageExportWord.ts) instead of retyping them. The API doesn't enforce
	// this the way it does the live-session/results endpoints -- there's no
	// server call here to gate, just a formatted view -- so this is purely a
	// UI convenience for admins, same spirit as the other admin-only buttons
	// on PageView.tsx's toolbar.
	const isAdmin = getUserFromBrowser().isAdmin;
	const exportContentRef = useRef<HTMLDivElement>(null);
	const [copyStatus, setCopyStatus] = useState('');

	const termSection = useMemo(() => buildTermSection(chosenTerms), [chosenTerms]);
	const exportQuestions = useMemo(() => buildExportQuestions(chosenQuestions), [chosenQuestions]);

	// Copies the rendered export content -- table, lists, bold answers and
	// all -- as real HTML, so pasting into Word reconstructs the table and
	// bold runs instead of dumping plain text. Falls back to asking the
	// admin to select and copy it themselves if the Clipboard API is
	// unavailable (older browsers, or a non-secure context).
	const copyExportToClipboard = async (): Promise<void> => {
		const container = exportContentRef.current;
		if (!container) return;

		try {
			const item = new ClipboardItem({
				'text/html': new Blob([container.innerHTML], { type: 'text/html' }),
				'text/plain': new Blob([container.innerText], { type: 'text/plain' }),
			});
			await navigator.clipboard.write([item]);
			setCopyStatus('Copied -- paste into Word with Ctrl/Cmd+V.');
		} catch {
			setCopyStatus('Could not copy automatically -- select the content below and copy it yourself.');
		}
	};

	if (step === 'loading') {
		return (
			<div className='live-quiz'>
				<p className='live-quiz-message'>Looking for other modules to include…</p>
			</div>
		);
	}

	if (step === 'select-modules') {
		return (
			<div className='live-quiz'>
				<div className='live-quiz-select'>
					<h3>Choose modules to practice</h3>
					<p className='live-quiz-instructions'>
						Every module is included by default -- uncheck any you want to leave out.
					</p>

					<div className='live-quiz-select-section'>
						<p className='live-quiz-select-count'>{ selected.size } of { linkItems.length } selected</p>

						<div className='live-quiz-select-actions'>
							<Button variant='link' size='sm' onClick={() => setSelected(new Set(linkItems.map((item) => item.slug)))}>
								Select all
							</Button>
							<Button variant='link' size='sm' onClick={() => setSelected(new Set())}>
								Select none
							</Button>
						</div>

						<ul className='live-quiz-select-list'>
							{ linkItems.map((item) => {
								const isCurrent = item.slug === page.slug;
								const label = `${item.title}${isCurrent ? ' (current page)' : ''}`;

								return (
									<li key={item.slug}>
										<Form.Check
											type='checkbox'
											id={idForSlug('practice-module', item.slug)}
											label={label}
											checked={selected.has(item.slug)}
											onChange={() => toggleSlug(item.slug)}
										/>
									</li>
								);
							}) }
						</ul>
					</div>

					<Button variant='primary' onClick={() => void confirmModules()} disabled={selected.size === 0}>
						Continue
					</Button>
					<Button variant='outline-secondary' className='ms-2' onClick={onExit}>
						Cancel
					</Button>
				</div>
			</div>
		);
	}

	if (step === 'loading-content') {
		return (
			<div className='live-quiz'>
				<p className='live-quiz-message'>Loading the selected modules…</p>
			</div>
		);
	}

	if (step === 'select-format') {
		return (
			<div className='live-quiz'>
				<div className='live-quiz-select'>
					<h3>Practice</h3>
					<p className='live-quiz-instructions'>
						{ preparedPages.length > 1
							? `Choose which terms and questions to include, pulled from ${preparedPages.length} modules.`
							: 'Choose which terms and questions to include.' }
					</p>

					{ allQuestions.length > 0 ? (
						<div className='live-quiz-select-section'>
							<h4 className='live-quiz-select-section-title'>Practice questions</h4>
							<p className='live-quiz-instructions'>
								Answers aren&rsquo;t shown here.
							</p>
							<p className='live-quiz-select-count'>{ selectedQuestions.size } of { allQuestions.length } selected</p>

							<div className='live-quiz-select-actions'>
								<Button variant='link' size='sm' onClick={() => setSelectedQuestions(new Set(allQuestions.map((_, i) => i)))}>
									Select all
								</Button>
								<Button variant='link' size='sm' onClick={() => setSelectedQuestions(new Set())}>
									Select none
								</Button>
								<RandomPickControl total={allQuestions.length} onPick={selectRandomQuestions} />
							</div>

							<ul className='live-quiz-select-list'>
								{ allQuestions.map((question, i) => (
									<li key={i}>
										<Form.Check
											type='checkbox'
											id={`practice-question-${i}`}
											label={question.prompt}
											checked={selectedQuestions.has(i)}
											onChange={() => toggleQuestion(i)}
										/>
									</li>
								)) }
							</ul>
						</div>
					) : null }

					{ allTerms.length > 0 ? (
						<div className='live-quiz-select-section'>
							<h4 className='live-quiz-select-section-title'>Key terms</h4>
							<p className='live-quiz-select-count'>{ selectedTerms.size } of { allTerms.length } selected</p>

							<div className='live-quiz-select-actions'>
								<Button variant='link' size='sm' onClick={() => setSelectedTerms(new Set(allTerms.map((_, i) => i)))}>
									Select all
								</Button>
								<Button variant='link' size='sm' onClick={() => setSelectedTerms(new Set())}>
									Select none
								</Button>
								<RandomPickControl total={allTerms.length} onPick={selectRandomTerms} />
							</div>

							<ul className='live-quiz-select-list'>
								{ allTerms.map((card, i) => (
									<li key={i}>
										<Form.Check
											type='checkbox'
											id={`practice-term-${i}`}
											label={card.term}
											checked={selectedTerms.has(i)}
											onChange={() => toggleTerm(i)}
										/>
									</li>
								)) }
							</ul>
						</div>
					) : null }

					<div className='live-quiz-select-actions'>
						<Button variant='primary' className='me-2' onClick={() => setStep('flashcards')} disabled={chosenTerms.length === 0}>
							{ `Flashcards (${chosenTerms.length})` }
						</Button>
						<Button variant='primary' className='me-2' onClick={() => setStep('quiz')} disabled={chosenQuestions.length === 0}>
							{ `Start quiz (${chosenQuestions.length})` }
						</Button>
						{ isAdmin ? (
							<Button
								variant='outline-dark'
								onClick={() => setStep('export')}
								disabled={chosenTerms.length === 0 && chosenQuestions.length === 0}
							>
								Export to Word
							</Button>
						) : null }
					</div>

					{ linkItems.length > 1 ? (
						<div>
							<Button variant='link' size='sm' onClick={() => setStep('select-modules')}>
								Change modules
							</Button>
						</div>
					) : null }

					<Button variant='outline-secondary' size='sm' onClick={onExit}>
						Back to reading
					</Button>
				</div>
			</div>
		);
	}

	if (step === 'export') {
		return (
			<div className='live-quiz'>
				<div className='live-quiz-select'>
					<h3>Export to Word</h3>
					<p className='live-quiz-instructions'>
						Select the content below and copy it (Ctrl/Cmd+C), or use the button, then paste into Word.
					</p>

					<div className='live-quiz-select-actions'>
						<Button variant='primary' onClick={() => void copyExportToClipboard()}>
							Copy for Word
						</Button>
					</div>

					{ copyStatus !== '' ? <p className='live-quiz-instructions'>{ copyStatus }</p> : null }

					<div ref={exportContentRef} className='practice-export-content'>
						{ termSection.rows.length > 0 ? (
							<>
								<h4>Key Terms</h4>
								<Table bordered size='sm' className='practice-export-table'>
									<thead>
										<tr>
											<th>#</th>
											<th>Definition</th>
											<th>Term</th>
											<th />
											<th>Term List</th>
										</tr>
									</thead>
									<tbody>
										{ termSection.rows.map((row, i) => (
											<tr key={row.number}>
												<td>{ row.number }</td>
												<td>{ row.definition }</td>
												<td>{ row.term }</td>
												<td />
												<td>
													{ termSection.termList[i] ? `${termSection.termList[i].letter}. ${termSection.termList[i].term}` : '' }
												</td>
											</tr>
										)) }
									</tbody>
								</Table>
							</>
						) : null }

						{ exportQuestions.length > 0 ? (
							<>
								<h4>Multiple Choice Questions</h4>
								<p><em>Correct answers are shown in bold.</em></p>
								<ol className='practice-export-questions'>
									{ exportQuestions.map((question, i) => (
										<li key={i}>
											{ question.prompt }
											<ul>
												{ question.choices.map((choice, j) => (
													<li key={j}>{ choice.correct ? <strong>{ choice.text }</strong> : choice.text }</li>
												)) }
											</ul>
										</li>
									)) }
								</ol>
							</>
						) : null }
					</div>

					<Button variant='outline-secondary' size='sm' onClick={() => setStep('select-format')}>
						&larr; Back
					</Button>
					<Button variant='outline-secondary' size='sm' className='ms-2' onClick={onExit}>
						Back to reading
					</Button>
				</div>
			</div>
		);
	}

	if (step === 'flashcards') {
		return (
			<div>
				<div className='pageview-toolbar'>
					<Button variant='outline-secondary' size='sm' onClick={() => setStep('select-format')}>
						&larr; Back
					</Button>
					<Button variant='outline-secondary' size='sm' className='ms-2' onClick={onExit}>
						Back to reading
					</Button>
				</div>
				<PageFlashcards cards={chosenTerms} />
			</div>
		);
	}

	// step === 'quiz'
	return (
		<div>
			<div className='pageview-toolbar'>
				<Button variant='outline-secondary' size='sm' onClick={() => setStep('select-format')}>
					&larr; Back
				</Button>
				<Button variant='outline-secondary' size='sm' className='ms-2' onClick={onExit}>
					Back to reading
				</Button>
			</div>
			<PageQuiz questions={chosenQuestions} />
		</div>
	);
}

export default PagePractice;
