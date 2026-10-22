import React, { ReactElement, useEffect, useMemo, useRef, useState, TableHTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { Link } from 'react-router-dom';

import iPage from './iPage';
import { prepareMarkdownForSlug } from './PagePrepareMarkdown';
import { extractFlashcards, appendKeyTermsSection } from './PageFlashcards';
import { extractQuizQuestions, removeQuizSection } from './PageQuiz';
import { getModuleScope } from './PageModuleLinks';
import {
	isExamReviewPage,
	extractExamOutcomeRefs,
	resolveExamOutcomeSlug,
	extractOutcomesBullets,
	removeOutcomesBlock,
	substituteExamOutcomeRefs,
	IExamOutcomeResult,
} from './PageExamOutcomes';
import { getChapterCode, findChapterContext, extractTitle } from './PageBookHub';
import useBookHub from './useBookHub';
import PageBookContents from './PageBookContents';
import { requestPage } from './PageViewContainer';
import PageQuizResults from './PageQuizResults';
import PagePractice from './PagePractice';
import { CustomPre, CustomCode } from './PageCodeBlock';
import LiveQuizInstructor from './LiveQuizInstructor';
import LiveQuizHistory from './LiveQuizHistory';
import { getUserFromBrowser } from './../components/Authentication';
import './pageview_toc_style.css'; // Import the CSS file for TOC styling
import './book_theme.css'; // Book layout and typography; loaded after, so it wins ties
import { AnchorHTMLAttributes, ImgHTMLAttributes } from 'react';

interface IPageViewProps {
	page: iPage | null;
}

interface ITOCEntry {
	id: string;
	level: number;
	text: string;
}

const normalizeHeadingText = (text: string): string => text.trim().replace(/\s+/g, ' ').toLowerCase();

const getTextContent = (node: React.ReactNode): string => {
	if (typeof node === 'string' || typeof node === 'number') return String(node);
	if (Array.isArray(node)) return node.map(getTextContent).join('');
	if (React.isValidElement(node)) return getTextContent((node.props as { children?: React.ReactNode }).children);
	return '';
};

const slugifyHeading = (text: string, usedIds: Map<string, number>): string => {
	const baseSlug = text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');

	const count = usedIds.get(baseSlug) ?? 0;
	usedIds.set(baseSlug, count + 1);
	return count === 0 ? baseSlug : `${baseSlug}-${count}`;
};

export const extractTableOfContents = (markdown: string): ITOCEntry[] => {
	const headings: ITOCEntry[] = [];
	const usedIds = new Map<string, number>();

	for (const line of markdown.split(/\r?\n/)) {
		const match = line.match(/^(#{2,6})\s+(.+?)\s*$/);
		if (!match) continue;

		const level = match[1].length;
		const text = match[2].trim().replace(/\s+/g, ' ');
		headings.push({
			id: slugifyHeading(text, usedIds),
			level,
			text,
		});
	}

	return headings;
};

export {
	getPageAssetPath,
	convert_asset_links_by_adding_folder_path,
} from './PagePrepareMarkdown';


/*
	Fullscreen overlay for a single image.

	Rendered into document.body with a portal rather than in place, so that the
	overlay escapes `.markdown-page` (which is width-capped and would clip it)
	and any stacking context created by ancestors.
*/
const ImageLightbox: React.FC<{ src: string; alt?: string; onClose: () => void }> = ({ src, alt, onClose }) => {
	// Actual-size mode matters for the wide tables and charts used in the
	// readings, which are unreadable when scaled to fit a laptop screen.
	const [actualSize, setActualSize] = useState(false);

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent): void => {
			if (e.key === 'Escape') onClose();
		};
		document.addEventListener('keydown', onKeyDown);

		// Stop the page behind the overlay from scrolling with the wheel.
		const priorOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			document.removeEventListener('keydown', onKeyDown);
			document.body.style.overflow = priorOverflow;
		};
	}, [onClose]);

	return createPortal(
		<div
			className='image-lightbox'
			role='dialog'
			aria-modal='true'
			aria-label={alt ? `Full screen: ${alt}` : 'Full screen image'}
			onClick={onClose}
		>
			<button type='button' className='image-lightbox-close' onClick={onClose} aria-label='Close full screen'>
				&times;
			</button>

			<div className={`image-lightbox-stage${actualSize ? ' is-actual-size' : ''}`}>
				<img
					className='image-lightbox-img'
					src={src}
					alt={alt}
					// Clicking the image zooms rather than closes; the backdrop closes.
					onClick={(e) => {
						e.stopPropagation();
						setActualSize((current) => !current);
					}}
				/>
			</div>

			<div className='image-lightbox-caption'>
				{alt ? <span className='image-lightbox-caption-text'>{alt}</span> : null}
				<span className='image-lightbox-hint'>
					{ actualSize ? 'Click image to fit screen' : 'Click image to zoom' } &middot; Esc or click outside to close
				</span>
			</div>
		</div>,
		document.body,
	);
};

/*
	Markdown component for images.

	Looks at markdown, and parses out an ID field.
	Input: ![caption {#id}](image.png)
	Output: <img src='image.png', alt='caption', id='id'

	The image is wrapped in a button so that it advertises itself as clickable
	(cursor, outline and a magnifier badge on hover) and opens full screen when
	activated, by mouse or by keyboard.
*/
// react-markdown v9+ passes a `node` prop (the hast AST node) to every custom
// component. It must be stripped before spreading onto a DOM element, or React
// renders it as the attribute node="[object Object]".
const CustomImage: React.FC<ImgHTMLAttributes<HTMLImageElement> & { node?: unknown }> = ({ alt, src = '', node: _node, ...props }) => {
	const [expanded, setExpanded] = useState(false);
	const altStr = typeof alt === 'string' ? alt : undefined;
	const idMatch = altStr?.match(/\{#([^}]+)\}/);
	const customId = idMatch ? idMatch[1] : undefined;
	const cleanAlt = altStr?.replace(/\{#[^}]+\}/, '').trim();
	const isVideo = /\.(mp4|webm|ogv)(?:[?#].*)?$/i.test(src);

	// Allow authors to use the same Markdown asset syntax for images and videos:
	// ![Dot illusion](colors-illusion-dots.mp4)
	//
	// An <img> cannot display a video, so render video assets directly. Do not
	// spread image props here: React's image attributes are not all valid video
	// attributes.
	if (isVideo) {
		return (
			<span
				className='markdown-figure'
				role='group'
				aria-label={cleanAlt ? `Video: ${cleanAlt}` : 'Video'}
			>
				<video
					src={src}
					id={customId}
					className={props.className}
					controls
					playsInline
					preload='metadata'
					aria-label={cleanAlt}
				>
					{cleanAlt || 'Your browser does not support embedded video.'}
				</video>

				{ cleanAlt ? <span className='markdown-figure-caption'>{cleanAlt}</span> : null }
			</span>
		);
	}

	// The caption is the alt text. It is rendered as a sibling of the button
	// rather than inside it so that students can still select and copy it;
	// the shared figure card is what ties the two together visually.
	return (
		<>
			<span className='markdown-figure' role='group' aria-label={cleanAlt ? `Figure: ${cleanAlt}` : 'Figure'}>
				<button
					type='button'
					className='markdown-image-trigger'
					onClick={() => setExpanded(true)}
					aria-label={cleanAlt ? `View full screen: ${cleanAlt}` : 'View image full screen'}
					title='Click to view full screen'
				>
					<img
						src={src}
						alt={cleanAlt}
						id={customId}
						{...props}
					/>
					<span className='markdown-image-badge' aria-hidden='true'>&#9906;</span>
				</button>

				{ cleanAlt ? <span className='markdown-figure-caption'>{cleanAlt}</span> : null }
			</span>

			{ expanded ? <ImageLightbox src={src} alt={cleanAlt} onClose={() => setExpanded(false)} /> : null }
		</>
	);
};

/*
	Markdown component for a link.

	Static assets (notebook templates, datafiles, Word exercises) and external
	sites open in a new tab, so that a student who downloads a template does not
	lose their place in the reading. Page-to-page links navigate in place.

	`target` and `rel` are set here rather than in the markdown on purpose:
	rehype-sanitize strips attributes it does not recognise, so an author cannot
	add them by hand.
*/
const CustomLink: React.FC<AnchorHTMLAttributes<HTMLAnchorElement> & { node?: unknown }> = ({
	href = '',
	children,
	node: _node,
	...props
}) => {
	const opensInNewTab = href.startsWith('/static/pages/') || /^https?:\/\//i.test(href);

	return (
		<a
			href={href}
			{...(opensInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
			{...props}
		>
			{children}
		</a>
	);
};

/*
	Markdown component for a table.

	Adds a className='table'. No zebra striping: the book theme rules tables
	with lines above and below the header and at the foot instead (see
	book_theme.css).
*/
const CustomTable: React.FC<TableHTMLAttributes<HTMLTableElement> & { node?: unknown }> = ({
	children,
	className,
	node: _node,
	...props
}) => {
	const tableClassName = ['table table-hover flexible-width-table', className]
		.filter(Boolean)
		.join(' ');

	return (
			<table className={tableClassName} {...props}>
				{children}
			</table>
	);
};

/*
	A single line of markdown -- a chapter title or one Learning Outcomes
	bullet -- rendered without the wrapping <p>, so `code`, **bold** and links
	still work inside an <h1> or <li>.
*/
const InlineMarkdown: React.FC<{ children: string }> = ({ children }) => (
	<ReactMarkdown
		remarkPlugins={[remarkGfm]}
		rehypePlugins={[rehypeSanitize]}
		components={{
			p: ({ children: inner }) => <>{inner}</>,
			a: CustomLink,
			code: CustomCode,
		}}
	>
		{children}
	</ReactMarkdown>
);

// The #heading-id in the address bar, or '' (also for a malformed one).
const readHashId = (): string => {
	try {
		return decodeURIComponent(window.location.hash.slice(1));
	} catch {
		return '';
	}
};

// The generated Key Terms section closes every reading; it is not numbered.
const KEY_TERMS_ID_RE = /^key-terms(-\d+)?$/;

function PageView({ page }: IPageViewProps): ReactElement {
	// Hooks must run unconditionally on every render, so compute against safe
	// defaults when page is null and defer the empty-render until after the hooks.
	const markdown_content = useMemo(() => {
		if (!page) return '';
		return prepareMarkdownForSlug(page.markdown, page.slug);
	}, [page?.markdown, page?.slug]);
	// Exam review pages (title starts with "Exam") support {{lesson-name}}
	// references, which pull in the Outcomes bullets and a link from that
	// lesson's own page -- see PageExamOutcomes.ts. isExam and examRefs are
	// synchronous; examResults fills in as each referenced page is fetched
	// below.
	const isExam = useMemo(() => isExamReviewPage(page?.title ?? ''), [page?.title]);
	const examRefs = useMemo(() => (isExam ? extractExamOutcomeRefs(markdown_content) : []), [isExam, markdown_content]);
	const [examResults, setExamResults] = useState<Map<string, IExamOutcomeResult>>(new Map());

	useEffect(() => {
		if (!isExam || !page || examRefs.length === 0) return;

		const refsToFetch = examRefs.filter((ref) => !examResults.has(ref));
		if (refsToFetch.length === 0) return;

		let ignore = false;

		void (async (): Promise<void> => {
			const fetched = await Promise.all(refsToFetch.map(async (ref): Promise<[string, IExamOutcomeResult]> => {
				const slug = resolveExamOutcomeSlug(page.slug, ref);
				try {
					const referencedPage = await requestPage(slug);
					return [ref, { slug, title: referencedPage.title, outcomes: extractOutcomesBullets(referencedPage.markdown), notFound: false }];
				} catch {
					return [ref, { slug, title: null, outcomes: [], notFound: true }];
				}
			}));

			if (ignore) return;
			setExamResults((prev) => {
				const next = new Map(prev);
				for (const [ref, result] of fetched) next.set(ref, result);
				return next;
			});
		})();

		return () => {
			ignore = true;
		};
		// examResults is checked above (refsToFetch) but intentionally left out
		// of the dependency list -- it is only ever added to here, and
		// including it would re-run this effect on every fetch it triggers.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isExam, examRefs, page?.slug]);

	// Book layout: the page's own "**Outcomes**:" list moves into a Learning
	// Outcomes box under the chapter title, and its first H1 becomes that
	// title, so both are taken out of the body here. Exam-review
	// substitution and everything after it then work on what is left.
	const outcomes = useMemo(() => extractOutcomesBullets(markdown_content), [markdown_content]);
	const titleSplit = useMemo(
		() => extractTitle(outcomes.length > 0 ? removeOutcomesBlock(markdown_content) : markdown_content),
		[markdown_content, outcomes.length],
	);
	const chapterTitle = titleSplit.title ?? page?.title ?? '';

	const markdown_with_exam_outcomes = useMemo(
		() => (isExam ? substituteExamOutcomeRefs(titleSplit.body, examResults) : titleSplit.body),
		[isExam, titleSplit.body, examResults],
	);
	// The Practice Questions section is hidden from the reading view (it lists
	// the correct answer first), but is still parsed from the full markdown to
	// build the quiz.
	const reading_content = useMemo(
		() => (extractQuizQuestions(markdown_with_exam_outcomes).length > 0 ? removeQuizSection(markdown_with_exam_outcomes) : markdown_with_exam_outcomes),
		[markdown_with_exam_outcomes],
	);
	// Every reading ends with a Key Terms section: the same terms the flashcard
	// deck is built from, alphabetised. Generated here rather than authored into
	// the markdown so the list can never drift from the deck. Terms are read from
	// the full markdown, so the count matches the Flashcards button. Applied
	// before the TOC is extracted, so the section gets a Contents entry.
	const reading_with_key_terms = useMemo(
		() => appendKeyTermsSection(reading_content, markdown_content),
		[reading_content, markdown_content],
	);
	const tocEntries = useMemo(() => extractTableOfContents(reading_with_key_terms), [reading_with_key_terms]);
	const headingIdMap = useMemo(() => new Map(tocEntries.map((entry) => [normalizeHeadingText(entry.text), entry.id])), [tocEntries]);
	const flashcards = useMemo(() => extractFlashcards(markdown_content), [markdown_content]);
	const quizQuestions = useMemo(() => extractQuizQuestions(markdown_content), [markdown_content]);
	const hasOwnPracticeContent = flashcards.length > 0 || quizQuestions.length > 0;
	// A course hub page (course_dv/index, viewed directly) is where
	// PagePractice.tsx offers module selection -- see IModuleScope.isHub --
	// even though the hub itself is normally just a syllabus with no
	// flashcards or quiz questions of its own. The button needs to appear
	// there too, or that flow would be unreachable.
	const moduleScope = useMemo(() => getModuleScope(page?.slug ?? ''), [page?.slug]);
	const showPracticeButton = hasOwnPracticeContent || moduleScope.isHub;
	// Label for the toolbar's practice button, based on what this page alone
	// offers -- PagePractice.tsx may end up pulling in more once the student
	// picks additional modules, but this first impression is scoped to just
	// the page they are reading.
	const practiceButtonLabel = !hasOwnPracticeContent
		? 'Practice'
		: quizQuestions.length > 0 && flashcards.length > 0
			? `Practice (${quizQuestions.length} questions, ${flashcards.length} terms)`
			: quizQuestions.length > 0
				? `Start quiz (${quizQuestions.length})`
				: `Flashcards (${flashcards.length})`;
	// 'read' | 'practice' | 'results' | 'live' | 'history' -- the modes are mutually exclusive.
	// 'practice' covers both flashcards and quizzing -- see PagePractice.tsx,
	// which owns choosing which modules to pull from and then flashcards vs.
	// quiz within them.
	const [mode, setMode] = useState<'read' | 'practice' | 'results' | 'live' | 'history'>('read');
	// The results panel is for the admin (profgarrett) only. The API enforces
	// this as well; hiding the button just keeps it out of everyone else's way.
	const isAdmin = getUserFromBrowser().isAdmin;
	const renderedFirstH1 = useRef(false);

	useEffect(() => {
		renderedFirstH1.current = false;
		setMode('read');
		setExamResults(new Map());
	}, [markdown_content]);

	const toggleMode = (next: 'practice' | 'results' | 'live' | 'history'): void =>
		setMode((current) => (current === next ? 'read' : next));

	/*
		Book layout (see book_theme.css). The course hub page supplies the
		left-hand contents, the module name above the title and the
		previous/next links; the lesson folder name ("dv40-colors") supplies
		the chapter number used for "Chapter dv40", sections 40.1, 40.2, ...
		and figures 40.1, 40.2, ... Pages without a hub or a numbered folder
		simply go without.
	*/
	const hub = useBookHub(page?.slug ?? '');
	const hasContents = hub !== null && hub.sections.length > 0;
	const chapter = useMemo(() => getChapterCode(page?.slug ?? ''), [page?.slug]);
	const chapterContext = useMemo(() => findChapterContext(hub, page?.slug ?? ''), [hub, page?.slug]);
	const sectionNumbers = useMemo(() => {
		const numbers = new Map<string, string>();
		if (!chapter) return numbers;

		let count = 0;
		for (const entry of tocEntries) {
			if (entry.level !== 2 || KEY_TERMS_ID_RE.test(entry.id)) continue;
			count += 1;
			numbers.set(entry.id, `${chapter.number}.${count}`);
		}
		return numbers;
	}, [chapter, tocEntries]);

	// On narrow screens the "In this chapter" list folds behind a button.
	const [tocOpen, setTocOpen] = useState(false);

	/*
		Track the section being read as the page scrolls: the last heading
		that has scrolled up past the top of the window.

		- It is highlighted in the right-hand "In this chapter" list.
		- It is written into the address bar as #heading-id, so a bookmark,
		  a shared link or a reload returns to the same place. replaceState
		  (not pushState) keeps scrolling out of the Back button's history,
		  and bypasses the router, so PageviewTracker does not log it. Above
		  the first heading the #... is removed again.
		- On arrival, a #heading-id already in the address is jumped to: the
		  browser cannot do that itself, because the page's markdown arrives
		  after it has finished loading. The heading is held in place while
		  images and fonts above it load, but only until the reader scrolls
		  (or 10 seconds pass), so nothing later pulls the reader back.
	*/
	const [activeId, setActiveId] = useState<string | null>(null);
	// The #heading-id the reader arrived with, per page. Kept in a ref rather
	// than effect-local state because React's StrictMode (development builds)
	// tears effects down and runs them again on mount.
	const arrival = useRef<{ slug: string; id: string; until: number; done: boolean } | null>(null);
	useEffect(() => {
		if (mode !== 'read' || tocEntries.length === 0) {
			setActiveId(null);
			return;
		}

		const cleanups: Array<() => void> = [];

		if (page && arrival.current?.slug !== page.slug) {
			arrival.current = { slug: page.slug, id: readHashId(), until: Date.now() + 10000, done: false };
		}
		const pending = arrival.current;
		const target = pending && !pending.done && pending.id && Date.now() < pending.until
			? document.getElementById(pending.id)
			: null;

		if (pending && target) {
			// Images, web fonts and late content above the heading -- in the
			// reading column or the header -- keep changing size after the
			// first jump and push the heading down. Re-align whenever they do,
			// until the reader starts scrolling for themselves (or 10s pass).
			// Looked up afresh each time: a re-render (e.g. the course hub
			// arriving) replaces the heading elements, and scrolling to the
			// old, detached one does nothing.
			const align = (): void => document.getElementById(pending.id)?.scrollIntoView();
			const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(align) : null;
			const finish = (): void => {
				pending.done = true;
				observer?.disconnect();
			};
			const timer = window.setTimeout(finish, Math.max(0, pending.until - Date.now()));
			const readerEvents = ['wheel', 'touchstart', 'keydown', 'mousedown'];

			align();
			document.querySelectorAll('.book-header, .book-main').forEach((element) => observer?.observe(element));
			for (const type of readerEvents) window.addEventListener(type, finish, { once: true, passive: true });

			cleanups.push(() => {
				observer?.disconnect();
				window.clearTimeout(timer);
				for (const type of readerEvents) window.removeEventListener(type, finish);
			});
		}

		let frame = 0;
		const update = (): void => {
			frame = 0;
			let passed: string | null = null;
			for (const entry of tocEntries) {
				const element = document.getElementById(entry.id);
				if (!element) continue;
				if (element.getBoundingClientRect().top > 120) break;
				passed = entry.id;
			}
			setActiveId(passed ?? tocEntries[0].id);

			const hash = passed ? `#${passed}` : '';
			if (window.location.hash !== hash) {
				try {
					// Keep the router's own history.state, or Back/Forward breaks.
					window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}${hash}`);
				} catch {
					// Some browsers rate-limit replaceState; the highlight still works.
				}
			}
		};
		const onScroll = (): void => {
			if (!frame) frame = window.requestAnimationFrame(update);
		};

		update();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
			if (frame) window.cancelAnimationFrame(frame);
			for (const cleanup of cleanups) cleanup();
		};
		// `page` is read only for its slug, to recognise a newly opened page;
		// tocEntries already changes whenever the page does.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mode, tocEntries, page?.slug]);

	// The paper background and the light header apply to reading pages only;
	// the games, admin and login pages keep the stock Bootstrap look.
	useEffect(() => {
		document.body.classList.add('book-theme-body');
		return () => document.body.classList.remove('book-theme-body');
	}, []);

	if (page === null) return <></>;

	const renderHeading = (level: 1 | 2 | 3 | 4 | 5 | 6) => ({ children }: { children?: React.ReactNode }) => {
		const text = getTextContent(children);
		const id = headingIdMap.get(normalizeHeadingText(text));
		const number = level === 2 && id ? sectionNumbers.get(id) : undefined;

		return React.createElement(
			`h${level}`,
			{ id },
			number ? <><span className='section-number'>{number}</span>{children}</> : children,
		);
	};

	const components = {
		/*
		h1: ({ children }: { children?: React.ReactNode }) => {
			if (!renderedFirstH1.current) {
				renderedFirstH1.current = true;
				return (
					<div id='course-logo-container' onClick={() => window.location.assign('/course_dv')}>
						<img src='/course_dv/logo.png' alt='Data Visualization' width={250} id='course-logo' />
					</div>
				);
			}

			const text = getTextContent(children);
			const id = headingIdMap.get(normalizeHeadingText(text));
			return <h1 id={id}>{children}</h1>;
		},
		*/
		h1: renderHeading(1),
		h2: renderHeading(2),
		h3: renderHeading(3),
		h4: renderHeading(4),
		h5: renderHeading(5),
		h6: renderHeading(6),
		a: CustomLink,
		img: CustomImage,
		table: CustomTable,
		pre: CustomPre,
		code: CustomCode,
	};

	// Practice and admin tools sit under the chapter title. In the practice,
	// results, live and history modes there is no title, so they move to the
	// top of the column, where "Back to reading" is easy to find.
	const practiceButtons = showPracticeButton ? (
		<div className='book-actions'>
			<button
				type='button'
				className={`book-button${mode === 'practice' ? ' is-active' : ''}`}
				onClick={() => toggleMode('practice')}
				aria-pressed={mode === 'practice'}
			>
				{ mode === 'practice'
					? 'Back to reading'
					: practiceButtonLabel }
			</button>

			{isAdmin && quizQuestions.length > 0 ? (
				<button
					type='button'
					className={`book-button book-button-admin${mode === 'results' ? ' is-active' : ''}`}
					onClick={() => toggleMode('results')}
					aria-pressed={mode === 'results'}
				>
					{ mode === 'results' ? 'Back to reading' : 'Quiz results' }
				</button>
			) : null}

			{isAdmin && quizQuestions.length + flashcards.length  > 0 ? (
				<button
					type='button'
					className={`book-button book-button-admin${mode === 'live' ? ' is-active' : ''}`}
					onClick={() => toggleMode('live')}
					aria-pressed={mode === 'live'}
				>
					{ mode === 'live' ? 'Back to reading' : 'Start live session' }
				</button>
			) : null}

			{/*
				Not gated on quizQuestions.length the way the live-session button
				is: a session that already ran has its own frozen deck, so its
				results stay reviewable even if this page's questions have since
				been edited away. (The toolbar as a whole still only appears when
				the page has flashcards or questions.)
			*/}
			{isAdmin ? (
				<button
					type='button'
					className={`book-button book-button-admin${mode === 'history' ? ' is-active' : ''}`}
					onClick={() => toggleMode('history')}
					aria-pressed={mode === 'history'}
				>
					{ mode === 'history' ? 'Back to reading' : 'Review past sessions' }
				</button>
			) : null}
		</div>
	) : null;

	const moduleLabel = chapterContext
		? [chapterContext.section.kicker, chapterContext.section.name].filter(Boolean).join(' · ')
		: '';
	const tocLabel = chapter ? 'In this chapter' : 'On this page';
	// Read by the figure-caption counter in book_theme.css ("Figure 40.1").
	const chapterStyle = chapter
		? ({ '--chapter-number': `"${chapter.number}"` } as React.CSSProperties)
		: undefined;

	return (
		<div className={`book-layout${hasContents ? '' : ' no-contents'}`}>
			{hasContents && hub ? (
				<PageBookContents
					key={page.slug}
					hub={hub}
					currentSlug={page.slug}
					currentSectionIndex={chapterContext?.sectionIndex ?? -1}
				/>
			) : null}

			<main className={`book-main markdown-page${chapter ? ' is-chapter' : ''}`} style={chapterStyle}>
				{mode !== 'read' ? practiceButtons : null}
				{mode === 'live' ? (
					<LiveQuizInstructor quizQuestions={quizQuestions} flashcards={flashcards} page={page.slug} />
				) : mode === 'history' ? (
					<LiveQuizHistory page={page.slug} />
				) : mode === 'results' ? (
					<PageQuizResults page={page.slug} />
				) : mode === 'practice' ? (
					<PagePractice page={page} onExit={() => setMode('read')} />
				) : (
				<>
					<header className='chapter-opener'>
						{ /* moduleLabel ? <div className='chapter-module'>{moduleLabel}</div> : null */ }
						{chapter ? <div className='chapter-label'>Chapter {chapter.code}</div> : null}
						{chapterTitle ? <h1 className='chapter-title'><InlineMarkdown>{chapterTitle}</InlineMarkdown></h1> : null}
						{practiceButtons}

						{outcomes.length > 0 ? (
							<section className='chapter-outcomes' aria-labelledby='chapter-outcomes-label'>
								<div id='chapter-outcomes-label' className='chapter-outcomes-label'>Learning outcomes</div>
								<ol>
									{outcomes.map((outcome, index) => (
										<li key={index}><InlineMarkdown>{outcome}</InlineMarkdown></li>
									))}
								</ol>
							</section>
						) : null}
					</header>

					<div className='book-body'>
						<ReactMarkdown
							remarkPlugins={[remarkGfm]}
							rehypePlugins={[rehypeSanitize]}
							components={components}
						>
							{ reading_with_key_terms }
						</ReactMarkdown>
					</div>

					{chapterContext && (chapterContext.previous || chapterContext.next) ? (
						<nav className='chapter-nav' aria-label='Chapter navigation'>
							{chapterContext.previous ? (
								<Link to={`/pages/${chapterContext.previous.slug}`} className='chapter-nav-link chapter-nav-previous'>
									<span className='chapter-nav-label'>&larr; Previous{chapterContext.previous.code ? ` · ${chapterContext.previous.code}` : ''}</span>
									<span className='chapter-nav-title'>{chapterContext.previous.title}</span>
								</Link>
							) : null}
							{chapterContext.next ? (
								<Link to={`/pages/${chapterContext.next.slug}`} className='chapter-nav-link chapter-nav-next'>
									<span className='chapter-nav-label'>Next{chapterContext.next.code ? ` · ${chapterContext.next.code}` : ''} &rarr;</span>
									<span className='chapter-nav-title'>{chapterContext.next.title}</span>
								</Link>
							) : null}
						</nav>
					) : null}
				</>
				)}
			</main>

			<aside className={`book-rail${tocOpen ? ' is-open' : ''}`}>
				{mode === 'read' && tocEntries.length > 0 ? (
					<nav className='book-toc' aria-label={tocLabel}>
						<button
							type='button'
							className='book-panel-toggle'
							aria-expanded={tocOpen}
							onClick={() => setTocOpen((current) => !current)}
						>
							{tocLabel}
						</button>
						<div className='book-toc-title'>{tocLabel}</div>
						<ul className={`book-toc-list${chapter ? ' is-numbered' : ''}`}>
							{tocEntries.map((entry) => {
								const number = sectionNumbers.get(entry.id);
								const isActive = activeId === entry.id;
								return (
									<li key={entry.id} className={`book-toc-item book-toc-level-${entry.level}`}>
										<a
											href={`#${entry.id}`}
											className={isActive ? 'is-active' : undefined}
											aria-current={isActive ? 'location' : undefined}
										>
											{chapter && entry.level === 2 ? <span className='book-toc-number'>{number ?? ''}</span> : null}
											<span className='book-toc-text'>{entry.text}</span>
										</a>
									</li>
								);
							})}
						</ul>
					</nav>
				) : null}
			</aside>
		</div>
	);
}

export default PageView;
