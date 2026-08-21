import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { Alert, Breadcrumb, Button, ButtonGroup, Card, Col, Container, Form, Row } from 'react-bootstrap';

import { getUserFromBrowser } from '../components/Authentication';
import ForceLogin from '../components/ForceLogin';
import { Loading, Message } from '../components/Misc';

import AdminTrafficTable from './AdminTrafficTable';
import { sort_sections_for_reports } from './AdminSectionReports';
import { iAdminSection } from './iAdmin';
import {
	iTrafficFilter, iTrafficRow, iTrafficSort, iTrafficView,
	page_to_row, user_to_row } from './iTraffic';


const JSON_HEADERS = {
	'Accept': 'application/json',
	'Content-Type': 'application/json',
};

// Matches DEFAULT_DAYS in app_traffic.ts. Duplicated rather than shared because
// the server must still default correctly for a request that omits the dates.
const DEFAULT_DAYS = 30;


// YYYY-MM-DD for a date offset from today, in the reader's own timezone --
// these are what the date inputs show, so they should match the reader's
// calendar rather than UTC.
export function date_input_value( days_ago: number, now: Date = new Date() ): string {
	const d = new Date(now.getTime() - days_ago * 24 * 60 * 60 * 1000);
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return d.getFullYear() + '-' + month + '-' + day;
}


/**
	Build the query string for either traffic endpoint.

	`scope` narrows to one row of the opposite view, which is what a drill-down
	is. Exported for testing: the filter is the whole feature, and a dropped or
	mis-encoded parameter silently returns the wrong population rather than an
	error.
*/
export function traffic_query(
		filter: { start: string, end: string, idsection: string, students_only: boolean },
		scope?: { page?: string, username?: string } ): string {

	const args: string[] = [];

	if( filter.start !== '' ) args.push('start=' + encodeURIComponent(filter.start));
	if( filter.end !== '' ) args.push('end=' + encodeURIComponent(filter.end));
	if( filter.idsection !== '' ) args.push('idsection=' + encodeURIComponent(filter.idsection));
	if( filter.students_only ) args.push('students_only=1');

	if( scope && scope.page ) args.push('page=' + encodeURIComponent(scope.page));
	if( scope && scope.username ) args.push('username=' + encodeURIComponent(scope.username));

	return args.join('&');
}


/**
	Which endpoint serves a view, and which serves its drill-down.

	Kept as data rather than a pair of branches so the two directions cannot
	drift: the drill-down is always the other view, scoped by this view's key.
*/
export function view_endpoint( view: iTrafficView ): string {
	return view === 'pages' ? '/api/admin/traffic/pages' : '/api/admin/traffic/users';
}

export function detail_endpoint( view: iTrafficView ): string {
	return view === 'pages' ? '/api/admin/traffic/users' : '/api/admin/traffic/pages';
}

// The scope parameter a drill-down needs: a page row narrows by page, a user
// row narrows by username.
export function detail_scope( view: iTrafficView, key: string ): { page?: string, username?: string } {
	return view === 'pages' ? { page: key } : { username: key };
}


/**
	Normalize either endpoint's payload into table rows.

	Both shapes are accepted regardless of which was asked for, because the
	drill-down asks the other endpoint and gets the other shape back.
*/
export function rows_from_json( json: any ): iTrafficRow[] {
	if( json && Array.isArray(json.pages) ) return json.pages.map(page_to_row);
	if( json && Array.isArray(json.users) ) return json.users.map(user_to_row);
	return [];
}


// Pull a readable message out of a failed response. Mirrors AdminContainer.
async function error_from_response( response: Response ): Promise<string> {
	try {
		const json = await response.json();
		if( json && typeof json.error === 'string' ) return json.error;
	} catch {
		// No JSON body -- fall through to the status text.
	}

	if( response.status === 401 || response.status === 403 )
		return 'Not authorized. You must be logged in as the site administrator.';

	return 'Request failed (' + response.status + ')';
}


/**
	Traffic report: how much each page was visited, and for how long.

	Two views over one query. By page answers "which material got used"; by user
	answers "what has this person been doing". Each one's drill-down is the
	other view scoped to the row that was clicked, so the numbers underneath
	always sum back to the row above them.

	Reads the pageviews table through /api/admin/traffic. The isAdmin check here
	is a convenience so non-admins see an explanation instead of an empty table;
	user_require_admin on the routes is the real boundary.

	Numbers to read carefully:

	- A "visit" is a sitting, not a hit. A reload or a short detour resumes the
	  existing row instead of adding one (see app_pageviews.ts).
	- Active time excludes idle gaps and is reported by the browser, then
	  clamped server-side to the wall-clock time the page was open. It is a good
	  relative measure and a soft absolute one.
	- Only logged-in users are tracked at all, so this is coursework traffic,
	  not public traffic.
*/
export default function AdminTrafficContainer(): ReactElement {
	const [sections, setSections] = useState<iAdminSection[]>([]);
	const [rows, setRows] = useState<iTrafficRow[]>([]);
	const [applied, setApplied] = useState<iTrafficFilter | null>(null);
	const [appliedView, setAppliedView] = useState<iTrafficView>('pages');

	const [view, setView] = useState<iTrafficView>('pages');
	const [start, setStart] = useState(date_input_value(DEFAULT_DAYS));
	const [end, setEnd] = useState(date_input_value(0));
	const [idsection, setIdsection] = useState('');
	const [studentsOnly, setStudentsOnly] = useState(false);

	const [sort, setSort] = useState<iTrafficSort>('active_seconds');
	const [expanded, setExpanded] = useState<string | null>(null);
	const [detail, setDetail] = useState<iTrafficRow[]>([]);
	const [detailLoading, setDetailLoading] = useState(false);

	const [isLoading, setIsLoading] = useState(true);
	const [message, setMessage] = useState('');
	const [messageStyle, setMessageStyle] = useState('');

	// See AdminContainer: the cache is populated before first render, but read
	// it again on mount so a same-page login is picked up.
	const [isAdmin, setIsAdmin] = useState(getUserFromBrowser().isAdmin);

	useEffect(() => {
		setIsAdmin(getUserFromBrowser().isAdmin);
	}, []);

	const show_error = (text: string): void => {
		setMessage(text);
		setMessageStyle('Error');
	};

	/*
		Load the top-level rows for a view.

		The view is an argument rather than read from state so the toggle can
		load the other view immediately instead of waiting a render for the state
		to settle. Collapsing the open row is deliberate: its breakdown belongs
		to the old filter and would otherwise sit there looking current.
	*/
	const load = useCallback( async (next_view: iTrafficView): Promise<void> => {
		setIsLoading(true);
		setExpanded(null);
		setDetail([]);

		try {
			const query = traffic_query({ start, end, idsection, students_only: studentsOnly });
			const response = await fetch(view_endpoint(next_view) + '?' + query,
				{ method: 'get', credentials: 'include', headers: JSON_HEADERS });

			if( !response.ok ) throw new Error(await error_from_response(response));

			const json = await response.json();
			setRows(rows_from_json(json));
			setApplied(json.filter);
			setAppliedView(next_view);
			setMessage('');
			setMessageStyle('');

		} catch (error: any) {
			setRows([]);
			setApplied(null);
			show_error(error.message);
		} finally {
			setIsLoading(false);
		}
	}, [start, end, idsection, studentsOnly]);


	// Sections for the dropdown. Loaded once; the admin section list does not
	// change while this page is open.
	useEffect(() => {
		if( !isAdmin ) {
			setIsLoading(false);
			return;
		}

		const load_sections = async (): Promise<void> => {
			try {
				const response = await fetch('/api/admin/sections',
					{ method: 'get', credentials: 'include', headers: JSON_HEADERS });
				if( !response.ok ) throw new Error(await error_from_response(response));
				setSections(await response.json());
			} catch (error: any) {
				show_error(error.message);
			}
		};

		void load_sections();
		void load(view);
		// load and view are intentionally not dependencies: the filter is applied
		// on submit, and the toggle loads its view directly.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAdmin]);


	/*
		Load one row's breakdown, or close it if it is already open.

		Fetched on demand rather than with the totals: the breakdown is a row per
		user per page, which for a course with fifty students and forty pages is
		two thousand rows nobody asked for.
	*/
	const handleExpand = async (key: string): Promise<void> => {
		if( expanded === key ) {
			setExpanded(null);
			setDetail([]);
			return;
		}

		setExpanded(key);
		setDetail([]);
		setDetailLoading(true);

		try {
			const query = traffic_query(
				{ start, end, idsection, students_only: studentsOnly },
				detail_scope(appliedView, key));

			const response = await fetch(detail_endpoint(appliedView) + '?' + query,
				{ method: 'get', credentials: 'include', headers: JSON_HEADERS });

			if( !response.ok ) throw new Error(await error_from_response(response));

			setDetail(rows_from_json(await response.json()));

		} catch (error: any) {
			setDetail([]);
			show_error(error.message);
		} finally {
			setDetailLoading(false);
		}
	};


	// Switching views keeps the filter and re-sorts by engaged time, since the
	// column the old sort named may not mean the same thing here.
	const handleView = (next_view: iTrafficView): void => {
		if( next_view === view ) return;
		setView(next_view);
		setSort('active_seconds');
		void load(next_view);
	};


	const handleSubmit = (e: React.FormEvent): void => {
		e.preventDefault();
		void load(view);
	};


	const crumbs = (
		<Breadcrumb>
			<Breadcrumb.Item title='home' href='/'>Home</Breadcrumb.Item>
			<Breadcrumb.Item title='Admin' href='/admin'>Admin</Breadcrumb.Item>
			<Breadcrumb.Item title='Traffic' active>Traffic</Breadcrumb.Item>
		</Breadcrumb>
	);

	if( !isAdmin ) {
		return (
			<Container fluid>
				<Row><Col>
					<ForceLogin />
					{ crumbs }
					<h3>Traffic</h3>
					<Alert variant='warning'>
						This page is only available to the site administrator.
					</Alert>
				</Col></Row>
			</Container>
		);
	}

	const section_options = sort_sections_for_reports(sections).map( section => (
		<option key={ section.idsection } value={ String(section.idsection) }>
			{ section.code } &mdash; { section.title } ({ section.term } { section.year })
		</option>
	));

	return (
		<Container fluid>
			<Row><Col>
				<ForceLogin />
				{ crumbs }
				<h3>Traffic</h3>

				<Card className='mb-4'>
					<Card.Body>
						<Form onSubmit={ handleSubmit }>
							<Row>
								<Col md={4}>
									<Form.Group className='mb-2' controlId='traffic_section'>
										<Form.Label>Section</Form.Label>
										<Form.Select value={ idsection } disabled={ isLoading }
												onChange={ e => setIdsection(e.target.value) }>
											<option value=''>All users</option>
											{ section_options }
										</Form.Select>
									</Form.Group>
								</Col>
								<Col md={3}>
									<Form.Group className='mb-2' controlId='traffic_start'>
										<Form.Label>From</Form.Label>
										<Form.Control type='date' value={ start } disabled={ isLoading }
											onChange={ e => setStart(e.target.value) } />
									</Form.Group>
								</Col>
								<Col md={3}>
									<Form.Group className='mb-2' controlId='traffic_end'>
										<Form.Label>To</Form.Label>
										<Form.Control type='date' value={ end } disabled={ isLoading }
											onChange={ e => setEnd(e.target.value) } />
									</Form.Group>
								</Col>
								<Col md={2}>
									<Form.Group className='mb-2' style={{ marginTop: 32 }}>
										<Button type='submit' variant='primary' disabled={ isLoading }>
											Show traffic
										</Button>
									</Form.Group>
								</Col>
							</Row>
							<Row>
								<Col md={6}>
									<Form.Check type='checkbox' id='traffic_students_only'
										label='Students only (exclude faculty and admins)'
										checked={ studentsOnly } disabled={ isLoading }
										onChange={ e => setStudentsOnly(e.target.checked) } />
								</Col>
								<Col md={6} className='text-md-end'>
									<ButtonGroup size='sm' aria-label='Group traffic by'>
										<Button variant={ view === 'pages' ? 'secondary' : 'outline-secondary' }
											disabled={ isLoading } onClick={ () => handleView('pages') }>
											By page
										</Button>
										<Button variant={ view === 'users' ? 'secondary' : 'outline-secondary' }
											disabled={ isLoading } onClick={ () => handleView('users') }>
											By user
										</Button>
									</ButtonGroup>
								</Col>
							</Row>
						</Form>
					</Card.Body>
				</Card>

				<Message message={ message } style={ messageStyle } />
				<Loading loading={ isLoading } />

				{ applied !== null &&
					<p className='text-muted' style={{ fontSize: '85%' }}>
						{ applied.start } to { applied.end }
						{ applied.idsection === null ? ', all users' : '' }
						{ applied.students_only ? ', students only' : '' }.
						Only logged-in users are tracked. A visit is one sitting, not one hit;
						active time excludes idle gaps, open time does not.
						Click a { appliedView === 'pages' ? 'page to see who read it' : 'user to see what they read' }.
					</p>
				}

				{ !isLoading &&
					<AdminTrafficTable
						view={ appliedView }
						rows={ rows }
						sort={ sort }
						onSort={ setSort }
						expanded={ expanded }
						detail={ detail }
						detailLoading={ detailLoading }
						onExpand={ (key: string) => { void handleExpand(key); } }
					/>
				}
			</Col></Row>
		</Container>
	);
}
