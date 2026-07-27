import React, { ReactElement, useEffect, useState } from 'react';
import { Container, Breadcrumb, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

import { Message, Loading } from '../components/Misc';
import ForceLogin from '../components/ForceLogin';
import iPage from './iPage';
import PageView from './PageView';

const requestPage = async (slug: string): Promise<iPage> => {
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
export default function PageViewContainer(): ReactElement {
	const [message, setMessage] = useState('Loading page');
	const [messageStyle, setMessageStyle] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [page, setPage] = useState<iPage | null>(null);
	const [parentPages, setParentPages] = useState<Array<{ slug: string; title: string }>>([]);

	const params = useParams();
	const slug = params['*'] ? params['*'] : '';

	useEffect(() => {
		let ignore = false;

		const loadPage = async (): Promise<void> => {
			setIsLoading(true);
			setMessage('Loading page');
			setParentPages([]);

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
				if (ignore) return;

				const parentPageSlugs = getParentPageSlugs(currentPage.slug);
				const parentPageRequests = parentPageSlugs.map(async (parentSlug) => {
					try {
						return await requestPage(parentSlug);
					} catch {
						return { slug: parentSlug, title: parentSlug.replace(/\/index$/, '') } as iPage;
					}
				});

				const parents = await Promise.all(parentPageRequests);
				if (!ignore) {
					setPage(currentPage);
					setParentPages(parents);
					setMessage('');
					setMessageStyle('');
					setIsLoading(false);
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

	const crumbs = (
			<Breadcrumb>
				<Breadcrumb.Item title='home' href='/ifgame/'>If Games</Breadcrumb.Item>
				<Breadcrumb.Item title='Pages' href='/pages'>Pages</Breadcrumb.Item>
				{ parentPages.map((parentPage) => (
					<Breadcrumb.Item key={parentPage.slug} title={parentPage.title} href={'/pages/' + parentPage.slug}>
						{ parentPage.title }
					</Breadcrumb.Item>
				)) }
				<Breadcrumb.Item title='Page' active>{ page ? page.title : '' }</Breadcrumb.Item>
			</Breadcrumb>
			);

	return (
		<Container fluid>
		<Row>
			<Col>
				<ForceLogin/>
				{ crumbs }
				<Message message={message} style={messageStyle} />
				<Loading loading={isLoading} />
				<PageView page={page} />
			</Col>
		</Row>
		</Container>
	);
}
