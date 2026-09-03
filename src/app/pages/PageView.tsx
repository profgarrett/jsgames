import React, { ReactElement, useEffect, useMemo, useRef, useState, TableHTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { Button } from 'react-bootstrap';

import iPage from './iPage';
import { prepareMarkdownForSlug } from './PagePrepareMarkdown';
import { extractFlashcards, appendKeyTermsSection } from './PageFlashcards';
import { extractQuizQuestions, removeQuizSection } from './PageQuiz';
import { getModuleScope } from './PageModuleLinks';
import PageQuizResults from './PageQuizResults';
import PagePractice from './PagePractice';
import { CustomPre, CustomCode } from './PageCodeBlock';
import LiveQuizInstructor from './LiveQuizInstructor';
import LiveQuizHistory from './LiveQuizHistory';
import { getUserFromBrowser } from './../components/Authentication';
import './pageview_toc_style.css'; // Import the CSS file for TOC styling
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

	Adds a className='table'
*/
const CustomTable: React.FC<TableHTMLAttributes<HTMLTableElement> & { node?: unknown }> = ({
	children,
	className,
	node: _node,
	...props
}) => {
	const tableClassName = ['table table-striped table-hover flexible-width-table', className]
		.filter(Boolean)
		.join(' ');

	return (
			<table className={tableClassName} {...props}>
				{children}
			</table>
	);
};

function PageView({ page }: IPageViewProps): ReactElement {
	// Hooks must run unconditionally on every render, so compute against safe
	// defaults when page is null and defer the empty-render until after the hooks.
	const markdown_content = useMemo(() => {
		if (!page) return '';
		return prepareMarkdownForSlug(page.markdown, page.slug);
	}, [page?.markdown, page?.slug]);
	// The Practice Questions section is hidden from the reading view (it lists
	// the correct answer first), but is still parsed from the full markdown to
	// build the quiz.
	const reading_content = useMemo(
		() => (extractQuizQuestions(markdown_content).length > 0 ? removeQuizSection(markdown_content) : markdown_content),
		[markdown_content],
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
	}, [markdown_content]);

	const toggleMode = (next: 'practice' | 'results' | 'live' | 'history'): void =>
		setMode((current) => (current === next ? 'read' : next));

	if (page === null) return <></>;

	const renderHeading = (level: 1 | 2 | 3 | 4 | 5 | 6) => ({ children }: { children?: React.ReactNode }) => {
		const text = getTextContent(children);
		const id = headingIdMap.get(normalizeHeadingText(text));
		//const headingProps = id ? { id } : {};

		return React.createElement(`h${level}`, { id }, children);
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

	return (
		<div className='markdown-page'>
			{showPracticeButton ? (

				<div className='pageview-toolbar'>

					<Button
						variant={mode === 'practice' ? 'primary' : 'outline-primary'}
						size='sm'
						className='me-2'
						onClick={() => toggleMode('practice')}
						aria-pressed={mode === 'practice'}
					>
						{ mode === 'practice'
							? 'Back to reading'
							: practiceButtonLabel }
					</Button>


					{isAdmin && quizQuestions.length > 0 ? (
						<Button
							variant={mode === 'results' ? 'dark' : 'outline-dark'}
							size='sm'
							className='ms-2'
							onClick={() => toggleMode('results')}
							aria-pressed={mode === 'results'}
						>
							{ mode === 'results' ? 'Back to reading' : 'Quiz results' }
						</Button>
					) : null}

					{isAdmin && quizQuestions.length + flashcards.length  > 0 ? (
						<Button
							variant={mode === 'live' ? 'dark' : 'outline-dark'}
							size='sm'
							className='ms-2'
							onClick={() => toggleMode('live')}
							aria-pressed={mode === 'live'}
						>
							{ mode === 'live' ? 'Back to reading' : 'Start live session' }
						</Button>
					) : null}

					{/*
						Not gated on quizQuestions.length the way the live-session button
						is: a session that already ran has its own frozen deck, so its
						results stay reviewable even if this page's questions have since
						been edited away. (The toolbar as a whole still only appears when
						the page has flashcards or questions.)
					*/}
					{isAdmin ? (
						<Button
							variant={mode === 'history' ? 'dark' : 'outline-dark'}
							size='sm'
							className='ms-2'
							onClick={() => toggleMode('history')}
							aria-pressed={mode === 'history'}
						>
							{ mode === 'history' ? 'Back to reading' : 'Review past sessions' }
						</Button>
					) : null}
				</div>
			) : null}

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
			{tocEntries.length > 0 ? (
				<div id='toc' className='toc'>
					<div className='toc-block'>
						<div className='toc-title'>Contents</div>
						<ul className='toc-list'>
							{tocEntries.map((entry) => (
								<li key={entry.id} className={`toc-item toc-level-${entry.level}`}>
									<a href={`#${entry.id}`}>{entry.text}</a>
								</li>
							))}
						</ul>
					</div>
				</div>
			) : null}
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[rehypeSanitize]}
				components={components}
			>
				{ reading_with_key_terms }
			</ReactMarkdown>
			</>
			)}
		</div>
	);
}

export default PageView;
