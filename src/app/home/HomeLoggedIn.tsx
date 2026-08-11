import React, { ReactElement, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';

import { Message, Loading } from '../components/Misc';
import ForceLogin from '../components/ForceLogin';
import CacheBuster from '../components/CacheBuster';
import { getUserFromBrowser } from '../components/Authentication';
import { get_sticky_section_id } from '../pages/PageSectionPicker';
import iSection from '../pages/iSection';

import {
	IfLevelSchema,
	EXCEL_TUTORIAL_LEVEL_LIST,
	SQL_TUTORIAL_LEVEL_LIST,
} from '../../shared/IfLevelSchema';
import { get_levels, iGrade, LevelProgressTable, NextLesson } from '../if/levelProgress';

/*
	The logged-in view of '/', which replaced /ifgame.

	Deliberately identical for every user: no section picker, and section.levels
	is not consulted. Everyone sees the same Excel and SQL tutorial lists. The
	only thing that varies is the admin block.
*/
export default function HomeLoggedIn(): ReactElement {
	const [message, setMessage] = useState('');
	const [messageStyle, setMessageStyle] = useState('');
	const [isLoadingGrades, setIsLoadingGrades] = useState(true);
	const [isLoadingUncompletedLevels, setIsLoadingUncompletedLevels] = useState(true);
	const [grades, setGrades] = useState<iGrade[]>([]);
	const [levels, setLevels] = useState<IfLevelSchema[]>([]);
	const [adminSectionId, setAdminSectionId] = useState<number|null>(null);
	const [user] = useState( getUserFromBrowser() );
	const navigate = useNavigate();

	// Uncompleted levels, used to offer "continue where you left off".
	useEffect(() => {
		fetch('/api/levels/levels/byCompleted/false', { credentials: 'include' })
			.then( response => response.json() )
			.then( json => {
				setLevels(json.map( (j: unknown) => new IfLevelSchema(j) ));
				setIsLoadingUncompletedLevels(false);
			})
			.catch( error => {
				setMessage('Error: ' + error);
				setMessageStyle('danger');
				setIsLoadingUncompletedLevels(false);
			});
		}, [] );

	// Highest grade per level code.
	useEffect(() => {
		fetch('/api/reports/grades?username=' + encodeURIComponent(user.username), {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => response.json() )
			.then( json => {
				setGrades(json);
				setIsLoadingGrades(false);
			})
			.catch( error => {
				setGrades([]);
				setMessage('Error: ' + error);
				setMessageStyle('danger');
				setIsLoadingGrades(false);
			});
		}, [] );

	// Sections are needed only to resolve the admin progress link, so don't ask
	// for them at all otherwise. Nothing on this page renders per-section.
	useEffect(() => {
		if(!user.isAdmin) return;

		fetch('/api/sections', { credentials: 'include' })
			.then( response => response.json() )
			.then( (json: iSection[]) => setAdminSectionId( get_sticky_section_id(json) ) )
			.catch( () => setAdminSectionId(null) );
		}, [user.isAdmin] );


	// Start a fresh attempt at a tutorial and jump straight into it.
	const insertGame = (code: string): void => {
		fetch('/api/levels/new_level_by_code/'+code, {
				method: 'post',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => response.json() )
			.then( json => {
				const newLevel = new IfLevelSchema(json);
				navigate('/ifgame/level/'+newLevel._id+'/play');
			}).catch( error => {
				setMessage('Error: ' + error);
				setMessageStyle('danger');
			});
	};

	const is_loading = isLoadingGrades || isLoadingUncompletedLevels;

	// /api/reports/grades returns at most one row for a single username.
	const grade = grades.length > 0 ? grades[0] : {};

	const excel_levels = get_levels(EXCEL_TUTORIAL_LEVEL_LIST, grade, levels);
	const sql_levels = get_levels(SQL_TUTORIAL_LEVEL_LIST, grade, levels);

	const body = is_loading ? null : <>
			<div className='card' style={{ backgroundColor: '#f5f5f5', marginBottom: 40 }}>
				<div className='card-body'>
					<div className='card-text'>
						<div className='h5'>Excel.fun</div>
						<NextLesson
							levels={ [...excel_levels, ...sql_levels] }
							onClickNewCode={ insertGame } />
					</div>
				</div>
			</div>

			<LevelProgressTable title='Excel tutorials' levels={ excel_levels } />
			<LevelProgressTable title='SQL tutorials' levels={ sql_levels } />
		</>;

	// Course material lives under /pages. These are the same for everyone;
	// note course_python has no content yet.
	const course_links = (
		<div style={{ marginBottom: 30 }}>
			<div className='h5'>Course pages</div>
			<Link to='/pages/course_dv'>
				<Button variant='outline-primary' style={{ marginRight: 10 }}>Data Visualization</Button>
			</Link>
			<Link to='/pages/course_python'>
				<Button variant='outline-primary'>Python</Button>
			</Link>
		</div>);

	// Admin-only. The progress link needs a section id; hide it if we can't
	// resolve one. Everything section-scoped otherwise lives on /admin.
	const admin_links = !user.isAdmin ? null : (
		<div style={{ marginBottom: 30 }}>
			<div className='h5'>Admin</div>
			<Link to='/admin'>
				<Button variant='outline-info' style={{ marginRight: 10 }}>Admin</Button>
			</Link>
			{ adminSectionId === null
				? null
				: <Link to={'/ifgame/progress/'+adminSectionId}>
					<Button variant='outline-info'>Class progress</Button>
				</Link> }
		</div>);

	return (
		<Container fluid>
			<Row>
				<Col>
					<ForceLogin />
					<CacheBuster/>
					<div style={{ paddingTop: 10}} />
					<Message message={message} style={messageStyle} />
					<Loading loading={is_loading} />
					{ body }
					{ course_links }
					{ admin_links }
				</Col>
			</Row>
		</Container>
	);
}
