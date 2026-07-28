import React, { ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { Button } from 'react-bootstrap';

import iPage from './iPage';
import PageFlashcards, { extractFlashcards } from './PageFlashcards';
import PageQuiz, { extractQuizQuestions, removeQuizSection } from './PageQuiz';
import PageQuizResults from './PageQuizResults';
import { getUserFromBrowser } from './../components/Authentication';
import './pageview_toc_style.css'; // Import the CSS file for TOC styling
import { ImgHTMLAttributes } from 'react';

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

export const getPageAssetPath = (slug: string, imagePath: string): string => {
	if (!imagePath) return imagePath;
	if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
		return imagePath;
	}
	if (imagePath.startsWith('/')) {
		return imagePath;
	}

	const normalizedSlug = slug.replace(/\.md$/, '');
	const slugParts = normalizedSlug.split('/').filter(Boolean);
	const pageDirectoryParts = normalizedSlug.endsWith('/index')
		? slugParts.slice(0, -1)
		: slugParts.slice(0, -1);
	const assetBase = pageDirectoryParts.length > 0 ? `/static/pages/${pageDirectoryParts.join('/')}` : '/static/pages';

	try {
		return new URL(imagePath, `http://example.com${assetBase}/`).pathname;
	} catch {
		return `${assetBase}/${imagePath}`;
	}
};

/*
	Search markdown for any inline images.
	Example: ![Table example with highlight](table_25_years_oftv.webp)

	Convert into an absolute path for local images, so that they can be loaded correctly in the browser.
	Output: ![Table example with highlight](/static/pages/table_25_years_oftv.webp)
*/
const convert_images_by_adding_folder_path = (markdown: string, slug: string): string => {
	return markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, altText, imagePath) => {
		if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
			return match;
		}
		const resolvedPath = getPageAssetPath(slug, imagePath);
		return `![${altText}](${resolvedPath})`;
	});
};





const CustomImage: React.FC<ImgHTMLAttributes<HTMLImageElement>> = ({ alt, src = '', ...props }) => {
	// Extract custom ID from alt text if it matches {#id}
	const altStr = typeof alt === 'string' ? alt : undefined;
	const idMatch = altStr?.match(/\{#([^}]+)\}/);
	const customId = idMatch ? idMatch[1] : undefined;
	const cleanAlt = altStr?.replace(/\{#[^}]+\}/, '').trim();

	return (
		<img
			src={src}
			alt={cleanAlt}
			id={customId}
			{...props}
		/>
	);
};


function PageView({ page }: IPageViewProps): ReactElement {
	// Hooks must run unconditionally on every render, so compute against safe
	// defaults when page is null and defer the empty-render until after the hooks.
	const markdown_content = useMemo(() => (page ? convert_images_by_adding_folder_path(page.markdown, page.slug) : ''), [page?.markdown, page?.slug]);
	// The Practice Questions section is hidden from the reading view (it lists
	// the correct answer first), but is still parsed from the full markdown to
	// build the quiz.
	const reading_content = useMemo(
		() => (extractQuizQuestions(markdown_content).length > 0 ? removeQuizSection(markdown_content) : markdown_content),
		[markdown_content],
	);
	const tocEntries = useMemo(() => extractTableOfContents(reading_content), [reading_content]);
	const headingIdMap = useMemo(() => new Map(tocEntries.map((entry) => [normalizeHeadingText(entry.text), entry.id])), [tocEntries]);
	const flashcards = useMemo(() => extractFlashcards(markdown_content), [markdown_content]);
	const quizQuestions = useMemo(() => extractQuizQuestions(markdown_content), [markdown_content]);
	// 'read' | 'flashcards' | 'quiz' | 'results' -- the modes are mutually exclusive.
	const [mode, setMode] = useState<'read' | 'flashcards' | 'quiz' | 'results'>('read');
	// The results panel is for the admin (profgarrett) only. The API enforces
	// this as well; hiding the button just keeps it out of everyone else's way.
	const isAdmin = getUserFromBrowser().isAdmin;
	const renderedFirstH1 = useRef(false);

	useEffect(() => {
		renderedFirstH1.current = false;
		setMode('read');
	}, [markdown_content]);

	const toggleMode = (next: 'flashcards' | 'quiz' | 'results'): void =>
		setMode((current) => (current === next ? 'read' : next));

	if (page === null) return <></>;

	const renderHeading = (level: 2 | 3 | 4 | 5 | 6) => ({ children }: { children?: React.ReactNode }) => {
		const text = getTextContent(children);
		const id = headingIdMap.get(normalizeHeadingText(text));
		//const headingProps = id ? { id } : {};

		return React.createElement(`h${level}`, { id }, children);
	};

	const components = {
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
		h2: renderHeading(2),
		h3: renderHeading(3),
		h4: renderHeading(4),
		h5: renderHeading(5),
		h6: renderHeading(6),
		img: CustomImage,
	};

	return (
		<div className='markdown-page'>
			{flashcards.length > 0 || quizQuestions.length > 0 ? (
				<div className='pageview-toolbar'>
					{quizQuestions.length > 0 ? (
						<Button
							variant={mode === 'quiz' ? 'primary' : 'outline-primary'}
							size='sm'
							className='me-2'
							onClick={() => toggleMode('quiz')}
							aria-pressed={mode === 'quiz'}
						>
							{ mode === 'quiz'
								? 'Back to reading'
								: `Start quiz (${quizQuestions.length})` }
						</Button>
					) : null}

					{flashcards.length > 0 ? (
						<Button
							variant={mode === 'flashcards' ? 'secondary' : 'outline-secondary'}
							size='sm'
							onClick={() => toggleMode('flashcards')}
							aria-pressed={mode === 'flashcards'}
						>
							{ mode === 'flashcards'
								? 'Back to reading'
								: `Flashcards (${flashcards.length})` }
						</Button>
					) : null}

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
				</div>
			) : null}

			{mode === 'results' ? (
				<PageQuizResults page={page.slug} />
			) : mode === 'quiz' ? (
				<PageQuiz markdown={markdown_content} page={page.slug} />
			) : mode === 'flashcards' ? (
				<PageFlashcards markdown={markdown_content} />
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
				{ reading_content }
			</ReactMarkdown>
			</>
			)}
		</div>
	);
}

export default PageView;