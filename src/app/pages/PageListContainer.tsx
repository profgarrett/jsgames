import React, { ReactElement, useEffect, useState } from 'react';
import { Container, Breadcrumb, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { Message, Loading } from '../components/Misc';
import ForceLogin from '../components/ForceLogin';

interface IPageSummary {
	slug: string;
	title: string;
}

interface iSection {
	idsection: number;
	code: string;
	year: number;
	term: string;
	title: string;
	levels: string;
	opens: string;
	closes: string;
	role: string;
}

// Index of available markdown pages. Fetches /api/pages, /api/sections and filters based on course join codes.
export default function PageListContainer(): ReactElement {
	const [message, setMessage] = useState('Loading pages');
	const [messageStyle, setMessageStyle] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [pages, setPages] = useState<IPageSummary[]>([]);
	const [sections, setSections] = useState<iSection[]>([]);
	const [selectedSection, setSelectedSection] = useState<iSection | null>(null);

	useEffect(() => {
		Promise.all([
			fetch('/api/pages', {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			}).then(response => response.json()),
			fetch('/api/sections', {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			}).then(response => response.json())
		])
		.then(([pagesData, sectionsData]: [IPageSummary[], iSection[]]) => {
			setSections(sectionsData);
			
			// Find if any page slug matches a section's course code
			const sectionCodes = sectionsData.map(s => s.code);
			
			// No specific page selected, show all filtered pages
			setPages(pagesData);
			setMessage('');
			setMessageStyle('');
			setIsLoading(false);
		})
		.catch(error => {
			setPages([]);
			setSections([]);
			setMessage('Error: ' + error.message);
			setMessageStyle('Error');
			setIsLoading(false);
		});
	}, []);

	const crumbs = (
			<Breadcrumb>
				<Breadcrumb.Item title='home' href='/ifgame/'>If Games</Breadcrumb.Item>
				<Breadcrumb.Item title='Pages' active>Pages</Breadcrumb.Item>
			</Breadcrumb>
			);

	const empty = !isLoading && pages.length === 0
			? <p>No pages are available yet.</p>
			: null;

	const list = pages.length > 0
			? <>
				<h4>List of pages</h4>
				<ul>
					{ pages.map( p => (
						<li key={p.slug}>
							<Link to={'/pages/' + p.slug}>{ p.title }</Link>
						</li>
					)) }
				</ul>
			</>
			: null;

	return (
		<Container fluid>
		<Row>
			<Col>
				<ForceLogin/>
				{ crumbs }
				<h3>Pages</h3>
				<Message message={message} style={messageStyle} />
				<Loading loading={isLoading} />
				{ empty }
				{ list }
			</Col>
		</Row>
		</Container>
	);
}
