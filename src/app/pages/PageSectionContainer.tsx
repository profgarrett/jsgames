import React, { ReactElement, useEffect, useState } from 'react';
import { Container, Breadcrumb, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { Message, Loading } from '../components/Misc';
import ForceLogin from '../components/ForceLogin';
import { get_localstorage_section, PageListSectionPicker, resolve_selected_section, get_page_for_section } from './PageSectionPicker';
import iPage from './iPage';
import iSection from  './iSection';
import PageView from './PageView';

// Load the homepage for the current user
export default function PageSectionContainer(): ReactElement {
	const [message, setMessage] = useState('Loading pages');
	const [messageStyle, setMessageStyle] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [sections, setSections] = useState<iSection[]>([]);
	const [pages, setPages] = useState<iPage[]>([]);
	const [page, setPage] = useState<iPage | null>(null);

	const load_page_for_section = async (section: iSection | null, pageList: iPage[]): Promise<void> => {
		const matchingPage = get_page_for_section(section, pageList);
		if (matchingPage === null) {
			setPage(null);
			return;
		}

		try {
			const response = await fetch('/api/pages/' + encodeURIComponent(matchingPage.slug), {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) throw new Error('Page not found');

			const pageData = await response.json() as iPage;
			setPage(pageData);
			setMessage('');
			setIsLoading(false);
		} catch (error: any) {
			setPage(null);
			setMessage('Error: ' + error.message);
			setMessageStyle('Error');
			setIsLoading(false);
		}
	};

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
		.then(async ([pagesData, sectionsData]: [iPage[], iSection[]]) => {
			setSections(sectionsData);
			setPages(pagesData);

			// Get matching pages based on section codes. 
			const sectionCodes = sectionsData.map(s => s.code);
			const filteredPages = pagesData.filter(p => sectionCodes.includes(p.slug));
			
			// If no pages match (i.e., we don't have a section with a matching page), redirect to the default page list.
			if (filteredPages.length === 0 || sectionsData.length === 0) {
				window.location.href = '/pages/list';
				return;
			}
			
			// If we have only 1 section, then automatically select it and load the corresponding page without requiring the user to select it.
			if (sectionsData.length === 1) {
				const singleSection = sectionsData[0];
				await load_page_for_section(singleSection, pagesData);
				return;
			}

			// If we have multiple sections, try to resolve the preferred section from local storage.
			const stickySection = get_localstorage_section();
			const selectedSection = resolve_selected_section(sectionsData, pagesData, stickySection);
			await load_page_for_section(selectedSection, pagesData);

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
				<Breadcrumb.Item title='home' href='/'>Home</Breadcrumb.Item>
				<Breadcrumb.Item title='Pages' active>Pages</Breadcrumb.Item>
			</Breadcrumb>
			);

	// Only show picker if we have more than 1 section. If we have only 1 section, we automatically load the page for that section.
	const handleSelectSection = (section: iSection): void => {
		void load_page_for_section(section, pages);
	}
	const sectionsPicker = sections.length > 1
			? <>
				<PageListSectionPicker sections={sections} pages={pages} onSelectSection={handleSelectSection} />
			</>
			: null;

	const pageview = page ? <PageView page={page} /> : null;

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
				{ pageview }
			</Col>
		</Row>
		</Container>
	);
}
