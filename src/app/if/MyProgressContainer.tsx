import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import { Row, Col, Navbar, Breadcrumb } from 'react-bootstrap';

import { Message, Loading } from '../components/Misc';
import { getUserFromBrowser } from '../components/Authentication';

import { IfLevelSchema } from '../../shared/IfLevelSchema';

import MyProgress from './MyProgress';

import ForceLogin from '../components/ForceLogin';
import CacheBuster from '../components/CacheBuster';


interface iGrade {
	[key: string]: any;
}

interface StateType {
	message: string;
	messageStyle: string;
	isLoadingGrades: boolean; 
	isLoadingSections: boolean;
	isLoadingUncompletedLevels: boolean;
	levels: IfLevelSchema[];
	grades: iGrade[];
	sections: Array<any>;	
}


export default function MyProgressContainer() {

	const [message, setMessage] = useState('')
	const [messageStyle, setMessageStyle] = useState('');
	const [isLoadingGrades, setIsLoadingGrades] = useState(true);
	const [isLoadingUncompletedLevels, setIsLoadingUncompletedLevels] = useState(true);
	const [isLoadingSections, setIsLoadingSections] = useState(true);
	const [levels, setLevels] = useState([])
	const [grades, setGrades] = useState([])
	const [sections, setSections] = useState([])
	const [user] = useState( getUserFromBrowser() );
	const navigate = useNavigate();

	// Don't even try to load until we are logged int. Redirect to login page
	// This goes a little bit faster than if we wait until we hit the forcelogin control.
	if(user.username === null || user.username === '') {
		window.location.href = '/login/';
	}

	// Fetch sections.
	useEffect(() => {
		fetch('/api/sections/sections', {
				credentials: 'include'
			})
			.then( response => response.json() )
			.then( json => {
				setSections(json);
				setIsLoadingSections(false);
			})
			.catch( error => {
				setMessage('Error: ' + error);
				setMessageStyle('danger');
				setIsLoadingSections(false);
			});
	}, []);

	// Fetch levels
	useEffect(() => {
		fetch('/api/levels/levels/byCompleted/false', {
				credentials: 'include'
			})
			.then( response => response.json() )
			.then( json => {
				const ifLevels = json.map( j => new IfLevelSchema(j) );
				setLevels(ifLevels);
				setIsLoadingUncompletedLevels(false);
			})
			.catch( error => {
				console.log(error);
				setMessage('Error: ' + error);
				setMessageStyle('danger');
				setIsLoadingUncompletedLevels(false);
			});
		}, [] );

	// Fetch grades
	useEffect(() => {
		fetch('/api/reports/grades?username=' + user.username, {
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
				console.log(error);
				setGrades([]);
				setMessage('Error: ' + error);
				setMessageStyle('danger');
				setIsLoadingGrades(false);
			});
		}, [] );

 
	const insertGame = (code: string): void => {
		setIsLoadingSections(true);
	
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
				console.log(error);
				setMessage(error)
				setIsLoadingSections(false);
			});
	}

	const is_loading = isLoadingUncompletedLevels || isLoadingGrades || isLoadingSections;

	// Should we have a link to view 
	const link_to_class_progress = null;



	const myProgress = is_loading ? 
			<div/> 
			:
			<MyProgress 
				sections={sections }
				grades={grades} 
				uncompleted_levels={levels} 
				onClickNewCode={ (code)=> insertGame(code)}
				onClickContinueLevel={ (ifLevel: IfLevelSchema )=> navigate('/ifgame/level/'+ifLevel._id+'/play') } 
			/>;

	const crumbs = (<Breadcrumb>
			<Breadcrumb.Item href={'/'}>Home</Breadcrumb.Item>
			<Breadcrumb.Item href={'/ifgame/'}>My Progress</Breadcrumb.Item>
		</Breadcrumb>);

	return (
			<Container fluid>
				<Navbar bg='dark' variant='dark'>
					<Container fluid>
						<Navbar.Brand href='/'>Excel.fun</Navbar.Brand>
					</Container>
				</Navbar>
				{ crumbs }
				<Row>
					<Col>
						<ForceLogin />
						<CacheBuster/>
						<div style={{ paddingTop: 10}} />
						<Message message={message} style={messageStyle} />
						<Loading loading={is_loading} />
						{ link_to_class_progress }
						{ myProgress }
					</Col>
				</Row>
			</Container>
	);

}
