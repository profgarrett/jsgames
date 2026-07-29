import React, { ReactElement, useEffect, useState } from 'react';
import { Container, Breadcrumb, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { Message, Loading } from '../components/Misc';
import ForceLogin from '../components/ForceLogin';
import {
	get_localstorage_section,
	get_page_for_section,
	resolve_selected_section,
	PageListSectionPicker,
} from './PageSectionPicker';
import iPage from './iPage';
import iSection from  './iSection';
import PageView from './PageView';

// Load the homepage for the current user
export default function PageListContainer(): ReactElement {
	const [message, setMessage] = useState('Loading pages');
	const [messageStyle, setMessageStyle] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [sections, setSections] = useState<iSection[]>([]);
	const [pages, setPages] = useState<iPage[]>([]);
	const [page, setPage] = useState<iPage | null>(null);
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
		.then(([pagesData, sectionsData]: [iPage[], iSection[]]) => {
			setSections(sectionsData);
			setPages(pagesData);

			// Get matching pages based on section codes. 
			const sectionCodes = sectionsData.map(s => s.code);
			const filteredPages = pagesData.filter(p => sectionCodes.includes(p.slug));
			
			// If no pages match (i.e., we don't have a section with a matching page), redirect to the default page list.
			if (filteredPages.length === 0 || sectionsData.length === 0) {
				window.location.href = '/pages/list';
			}
			
			// Prefer the section stored in localstorage; fall back to the first
			// section that actually has a matching page. This mirrors the
			// resolution the picker does, so the two stay in sync.
			const sticky_section = get_localstorage_section();
			const resolved = resolve_selected_section(sectionsData, pagesData, sticky_section);

			setSelectedSection(resolved);
			setPage(get_page_for_section(resolved, pagesData));
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

	const sectionsPicker = sections.length > 0
			? <>
				<PageListSectionPicker sections={sections} pages={pages} onSelectSection={(s: iSection) => {
					setSelectedSection(s);
					setPage(get_page_for_section(s, pages));
				}} />
			</>
			: null;

	const empty = !isLoading && pages.length === 0
			? <p>No pages are available yet.</p>
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
				{ sectionsPicker }
				{ selectedSection ? <PageView page={page} /> : null }
				{ empty }
			</Col>
		</Row>
		</Container>
	);
}
