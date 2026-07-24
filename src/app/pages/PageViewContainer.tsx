import React, { ReactElement, useEffect, useState } from 'react';
import { Container, Breadcrumb, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

import { Message, Loading } from '../components/Misc';
import ForceLogin from '../components/ForceLogin';
import iPage from './iPage';
import PageView from './PageView';


// Renders a single markdown page. Fetches /api/pages/:slug and converts the
// markdown to sanitized HTML in the browser.
export default function PageViewContainer(): ReactElement {
	const [message, setMessage] = useState('Loading page');
	const [messageStyle, setMessageStyle] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [page, setPage] = useState<iPage | null>(null);

	const params = useParams();
	const slug = params.slug ? params.slug : '';

	useEffect(() => {
		setIsLoading(true);
		setMessage('Loading page');

		fetch('/api/pages/' + encodeURIComponent(slug), {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => {
				if(!response.ok) throw new Error('Page not found');
				return response.json();
			})
			.then( (json: iPage) => {
				setPage(json);
				setMessage('');
				setMessageStyle('');
				setIsLoading(false);
			})
			.catch( error => {
				setPage(null);
				setMessage('Error: ' + error.message);
				setMessageStyle('Error');
				setIsLoading(false);
			});
	}, [slug]);

	const crumbs = (
			<Breadcrumb>
				<Breadcrumb.Item title='home' href='/ifgame/'>If Games</Breadcrumb.Item>
				<Breadcrumb.Item title='Pages' href='/pages'>Pages</Breadcrumb.Item>
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
