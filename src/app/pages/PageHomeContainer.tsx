import React, { ReactElement, useEffect, useState } from 'react';
import { Container, Breadcrumb, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { Message, Loading } from '../components/Misc';
import ForceLogin from '../components/ForceLogin';
import { get_localstorage_section, PageListSectionPicker} from './PageSectionPicker';
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
			
			// Get the default selected section from localstorage if present, otherwise use the first section in the list.
			let sticky_section =  get_localstorage_section();
			if(sticky_section == null) { sticky_section = sectionsData[0] }

			// Find matching class.
			let sticky_class = pagesData.filter( p => p.slug === (sticky_section ? sticky_section.code : '') );

			setPage(sticky_class[0] || null);
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
				<PageListSectionPicker sections={sections} onSelectSection={(s: string) => {
					const selected = sections.find(sec => sec.code === s) || null;
					setSelectedSection(selected);
				}} />
				{ selectedSection ? <p>Selected Section: {selectedSection.title} ({selectedSection.code})</p> : null }	
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
				{ selectedSection ? Page(}
				{ empty }
			</Col>
		</Row>
		</Container>
	);
}
