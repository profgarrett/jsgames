import React, { ReactElement, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Message, Loading } from '../components/Misc';
import ForceLogin from '../components/ForceLogin';
import iPage from './iPage';
import PageView from './PageView';

export const requestPage = async (slug: string): Promise<iPage> => {
	const encodedSlug = slug.split('/').map(encodeURIComponent).join('/');
	const response = await fetch('/api/pages/' + encodedSlug, {
		method: 'get',
		credentials: 'include',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) throw new Error('Page not found');
	return response.json();
};

export const getParentPageSlugs = (slug: string): string[] => {
	const parts = slug.split('/').filter(Boolean);
	if (parts.length <= 1) return [];

	const directoryParts = parts.slice(0, -1);
	const includeDirectoryPage = parts[parts.length - 1] !== 'index';
	const maxPrefixLength = includeDirectoryPage ? directoryParts.length : directoryParts.length - 1;

	const parentSlugs: string[] = [];
	for (let i = 1; i <= maxPrefixLength; i++) {
		const prefix = directoryParts.slice(0, i).join('/');
		if (prefix) parentSlugs.push(`${prefix}/index`);
	}

	return parentSlugs;
};

// Renders a single markdown page. Fetches /api/pages/:slug and converts the
// markdown to sanitized HTML in the browser.
//
// The page is laid out as a book (see PageView.tsx and book_theme.css): the
// course's chapters on the left and this chapter's sections on the right,
// which replaces the breadcrumb trail this container used to render.
// getParentPageSlugs above is still used to find the course hub page (see
// getModuleScope in PageModuleLinks.ts).
export default function PageViewContainer(): ReactElement {
	// Errors only: while a page loads, the spinner alone shows it (no banner).
	const [message, setMessage] = useState('');
	const [messageStyle, setMessageStyle] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [page, setPage] = useState<iPage | null>(null);

	const params = useParams();
	const slug = params['*'] ? params['*'] : '';

	useEffect(() => {
		let ignore = false;

		const loadPage = async (): Promise<void> => {
			setIsLoading(true);
			setMessage('');

			if (!slug) {
				if (!ignore) {
					setPage(null);
					setMessage('');
					setMessageStyle('');
					setIsLoading(false);
				}
				return;
			}

			try {
				const currentPage = await requestPage(slug);
				if (!ignore) {
					setPage(currentPage);
					setMessage('');
					setMessageStyle('');
					setIsLoading(false);

					// Chapter links in the contents panel navigate without a full
					// reload, so start each new chapter at the top -- unless the
					// address points at a section (#heading) within it.
					if (!window.location.hash) window.scrollTo(0, 0);
				}
			} catch (error) {
				if (!ignore) {
					setPage(null);
					setMessage('Error: ' + (error as Error).message);
					setMessageStyle('Error');
					setIsLoading(false);
				}
			}
		};

		void loadPage();
		return () => {
			ignore = true;
		};
	}, [slug]);

	return (
		<div className='book-page'>
			<ForceLogin/>
			<Message message={message} style={messageStyle} />
			<Loading loading={isLoading} />
			<PageView page={page} />
		</div>
	);
}
