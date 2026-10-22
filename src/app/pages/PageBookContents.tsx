import React, { ReactElement, useState } from 'react';
import { Link } from 'react-router-dom';

import { IBookHub, sameSlug } from './PageBookHub';

interface IPageBookContentsProps {
	hub: IBookHub;
	currentSlug: string;
	// Index into hub.sections of the module holding the current page, or -1
	// when the page is not listed (e.g. the hub page itself).
	currentSectionIndex: number;
}

/*
	Left-hand panel of the book layout: every chapter in the course, grouped
	by module (the hub's "## " headings), read from the course hub page (see
	PageBookHub.ts). The "### Week ..." headings are deliberately not shown.

	Only the current chapter's module starts expanded; the others can be
	opened with their heading buttons. On a phone the whole panel folds
	behind a "Contents" button (see book_theme.css). PageView.tsx keys this
	component on the page slug, so both reset when the reader moves on.
*/
export default function PageBookContents({ hub, currentSlug, currentSectionIndex }: IPageBookContentsProps): ReactElement {
	const [open, setOpen] = useState(false);
	const [expanded, setExpanded] = useState<Record<number, boolean>>({});

	const defaultIndex = currentSectionIndex >= 0 ? currentSectionIndex : 0;
	const isExpanded = (index: number): boolean => expanded[index] ?? index === defaultIndex;

	return (
		<nav className={`book-contents${open ? ' is-open' : ''}`} aria-label='Book contents'>
			<button
				type='button'
				className='book-panel-toggle'
				aria-expanded={open}
				onClick={() => setOpen((current) => !current)}
			>
				Contents
			</button>

			<div className='book-contents-body'>
				<Link to={`/pages/${hub.rootSlug}`} className='book-contents-label'>Course Homepage</Link>

				{hub.sections.map((section, index) => {
					const sectionOpen = isExpanded(index);
					const listId = `book-contents-section-${index}`;

					return (
						<div key={index} className='book-contents-section'>
							<button
								type='button'
								className='book-contents-module'
								aria-expanded={sectionOpen}
								aria-controls={listId}
								onClick={() => setExpanded((prev) => ({ ...prev, [index]: !sectionOpen }))}
							>
								{section.kicker ? <span className='book-contents-kicker'>{section.kicker}</span> : null}
								<span className='book-contents-name'>{section.name || 'Chapters'}</span>
							</button>

							{sectionOpen ? (
								<ul id={listId} className='book-contents-list'>
									{section.chapters.map((chapter) => {
										const isCurrent = sameSlug(chapter.slug, currentSlug);

										return (
											<li key={chapter.slug}>
												<Link
													to={`/pages/${chapter.slug}`}
													className={`book-contents-link${isCurrent ? ' is-current' : ''}`}
													aria-current={isCurrent ? 'page' : undefined}
												>
													<span className='book-contents-code'>{chapter.code ?? ''}</span>
													<span className='book-contents-text'>{chapter.title}</span>
												</Link>
											</li>
										);
									})}
								</ul>
							) : null}
						</div>
					);
				})}
			</div>
		</nav>
	);
}
