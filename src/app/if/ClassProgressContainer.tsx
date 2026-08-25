import React, { ReactElement, useEffect, useState } from 'react';

import { Container, Row, Col, Tabs, Tab, Breadcrumb, Navbar, DropdownButton, Dropdown, ButtonToolbar } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

import { ClassProgressChart } from './ClassProgressChart';
import  ClassProgressGrades, { iStudentNickname } from './ClassProgressGrades';
import { Message, Loading } from '../components/Misc';

import ForceLogin from '../components/ForceLogin';
import { IfLevelPagelessSchema } from '../../shared/IfLevelSchema';

import iSection from '../pages/iSection';
import { get_localstorage_section, set_localstorage_section } from '../pages/PageSectionPicker';
import { sort_sections_for_reports } from '../admin/AdminSectionReports';

/*
	Class progress for one section.

	The section is chosen in a dropdown rather than being baked into the URL,
	and picking one loads its data right away -- there is no refresh button.
	The old /ifgame/progress/:_idsection URLs still work; the id is read as the
	initially selected section.
*/


/**
	Sections this user can actually see progress for.

	GET /api/reports/progress only returns rows for sections where the caller is
	recorded as faculty (see is_faculty + the join in app_reports.ts), so a
	student-role section in the dropdown would always draw an empty chart.
	Newest term first, matching the admin section reports.
*/
export function faculty_sections(sections: iSection[]): iSection[] {
	const teaching = sections.filter( s => String(s.role).toLowerCase() === 'faculty' );
	return sort_sections_for_reports(teaching);
}


/**
	Which section to show first.

	Prefers an id from the URL (old bookmarks and the per-section links in the
	admin reports table), then whatever the user last picked here or on the
	pages screen, then the newest section. Null when there is nothing to show.
*/
export function resolve_initial_section(sections: iSection[], url_idsection: number | null): iSection | null {
	if(sections.length === 0) return null;

	if(url_idsection !== null && !Number.isNaN(url_idsection)) {
		const from_url = sections.find( s => s.idsection === url_idsection );
		if(typeof from_url !== 'undefined') return from_url;
	}

	const sticky = get_localstorage_section();
	if(sticky !== null) {
		const from_sticky = sections.find( s => s.idsection === sticky.idsection );
		if(typeof from_sticky !== 'undefined') return from_sticky;
	}

	return sections[0];
}


export default function ClassProgressContainer(): ReactElement {

	const [message, setMessage] = useState('Loading data from server');
	const [messageStyle, setMessageStyle] = useState('');
	const [isLoadingSections, setIsLoadingSections] = useState(true);
	const [isLoadingLevels, setIsLoadingLevels] = useState(false);
	const [sections, setSections] = useState<iSection[]>([]);
	const [section, setSection] = useState<iSection | null>(null);
	const [pageless_levels, setLevels] = useState<IfLevelPagelessSchema[]>([]);
	const [nicknames, setNicknames] = useState<iStudentNickname[]>([]);

	// Optional. Present only on the legacy /ifgame/progress/:_idsection route.
	const { _idsection } = useParams();
	const url_idsection = typeof _idsection === 'undefined' ? null : Number.parseInt(_idsection, 10);

	// The sections this user teaches, and the one to start on.
	useEffect(() => {
		fetch('/api/sections', {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => response.json() )
			.then( json => {
				const teaching = faculty_sections( Array.isArray(json) ? json : [] );
				setSections(teaching);
				setSection( resolve_initial_section(teaching, url_idsection) );
				setMessage('');
				setMessageStyle('');
				setIsLoadingSections(false);
			})
			.catch( error => {
				setSections([]);
				setMessage('Error: ' + error);
				setMessageStyle('Error');
				setIsLoadingSections(false);
			});
		}, [] );

	// Auto-refresh: whenever the selected section changes, reload its progress.
	useEffect(() => {
		if(section === null) return;

		// Guards against a slow response for a section the user has since
		// changed away from overwriting the newer one.
		let is_current = true;
		const idsection = section.idsection;

		setIsLoadingLevels(true);
		setMessage('Loading progress data');
		setMessageStyle('');

		fetch('/api/reports/progress?idsection='+encodeURIComponent(idsection), {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => response.json() )
			.then( json => {
				if(!is_current) return;
				setLevels( json.map( (j: unknown) => new IfLevelPagelessSchema(j) ) );
				setMessage('');
				setMessageStyle('');
				setIsLoadingLevels(false);
			})
			.catch( error => {
				if(!is_current) return;
				setLevels( [] );
				setMessage('Error: ' + error);
				setMessageStyle('Error');
				setIsLoadingLevels(false);
			});

		/*
			Nicknames are fetched separately and deliberately never rejected into
			the shared error path: this is a display nicety, and an instructor
			looking at grades five minutes before class should not lose the whole
			table because the nickname query failed. A failure just leaves the
			Nickname column blank.
		*/
		fetch('/api/reports/nicknames?idsection='+encodeURIComponent(idsection), {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => response.ok ? response.json() : [] )
			.then( json => {
				if(!is_current) return;
				setNicknames( Array.isArray(json) ? json : [] );
			})
			.catch( () => {
				if(!is_current) return;
				setNicknames( [] );
			});

		return () => { is_current = false; };
		}, [section] );

	const onSelectSection = (eventKey: string | null): void => {
		if(eventKey === null) return;

		const selected = sections.find( s => String(s.idsection) === eventKey );
		if(typeof selected === 'undefined') return;

		// Shared with the pages screen, so the same class stays selected.
		set_localstorage_section(selected);
		setSection(selected);
	};

	const crumbs = (
		<Breadcrumb>
			<Breadcrumb.Item title='home' href='/'>Home</Breadcrumb.Item>
			<Breadcrumb.Item title='Class' active>Class Progress</Breadcrumb.Item>
		</Breadcrumb>
		);

	const is_loading = isLoadingSections || isLoadingLevels;

	const picker = isLoadingSections
		? null
		: <ButtonToolbar aria-label='Section picker'>
				<DropdownButton
					id='button_filter_sections'
					disabled={ isLoadingLevels || sections.length === 0 }
					onSelect={ onSelectSection }
					variant='primary'
					title={ section === null ? 'Select a section' : section.title }
					key='select_section'>
						{ sections.map( s =>
							<Dropdown.Item
								key={'select_section_'+s.idsection}
								eventKey={String(s.idsection)}
								active={ section !== null && s.idsection === section.idsection }
								>{ s.title } ({ s.term } { s.year })
							</Dropdown.Item>
						)}
				</DropdownButton>
			</ButtonToolbar>;

	const no_sections = !isLoadingSections && sections.length === 0
			? <p>You are not listed as the instructor for any section, so there is no class progress to show.</p>
			: null;

	const empty = section !== null && pageless_levels.length === 0 && !is_loading
			? <p>No students in this section have yet started completing lessons. Once they get started, you&apos;ll see a chart here with their progress</p>
			: null;

	// Fixes old bug, where some people's levels didn't have a props value.
	const data = pageless_levels.filter( l => l.props !== null );

	return (
		<Container fluid>
		<Row>
			<Col>
				<ForceLogin/>
				{ crumbs }
				<Message message={message} style={messageStyle} />
				<Loading loading={ is_loading } />
				{ picker }
				{ no_sections }
				{ empty }
				<br/>
				<Tabs defaultActiveKey='chart'>
					<Tab eventKey='chart' title='Chart of class progress'>
						<ClassProgressChart data={data}  />
					</Tab>
					<Tab eventKey='grades' title='Grade table'>
						<ClassProgressGrades data={data} nicknames={nicknames} />
					</Tab>
				</Tabs>
			</Col>
		</Row>
		</Container>
	);
}
