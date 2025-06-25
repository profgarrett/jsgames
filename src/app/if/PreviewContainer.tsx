import React, { useState, useEffect} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Button, Row, Col, Card, Alert, Navbar } from 'react-bootstrap';

import { Message, Loading } from '../components/Misc';
import { getUserFromBrowser } from '../components/Authentication';

import CacheBuster from '../components/CacheBuster';
import PreviewList from './PreviewList';
import PreviewLevel from './PreviewLevel';


interface StateType {
	message: string;
	messageStyle: string;
//	levels: IfLevelSchema[];
}
import { IfLevelSchema } from '../../shared/IfLevelSchema';


export default function PreviewContainer() {
	const [previewLevelCode, setPreviewLevelCode] = useState('');
	const [level, setLevel] = useState<null|IfLevelSchema>(null);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState('')
	const [messageStyle, setMessageStyle] = useState('');
	const navigate = useNavigate();
	const user = getUserFromBrowser();

	let user_control;

	if(user.username == '') {
		// Anon
		user_control = <Link to='/login?url=ifgame'><Button variant='primary' size='lg'>Login or create an account to start working on tutorials</Button></Link>;

	} else {
		// Logged in. Go ahead and redirect to the logged in user page.
		document.location.href = '/ifgame';
		//user_control = <Link to='/ifgame'><Button variant='primary' size='lg'>View my progress and work on tutorials</Button></Link>;
	}

	useEffect( () => {
		if(previewLevelCode == '') return;
		setLevel(null);
		
		fetch('/api/levels/previewlevel/'+previewLevelCode, {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => response.json() )
			.then( json => new IfLevelSchema(json) )
			.then( ifLevel => {
				setLevel(ifLevel);
				setLoading(false);
			})
			.catch( error => {
				setLevel(null);
				setMessage('Error: ' + error);
				setLoading(false);
			});

		}, [previewLevelCode]);

	const loadPreviewLevel = (level: string) => {
		setLoading(true);
		setPreviewLevelCode(level);
	}
	const clearPreviewLevel = () => {
		setPreviewLevelCode('');
	}

	const preview = previewLevelCode == '' ? null : <PreviewLevel level={level} close={clearPreviewLevel} />;

	return (

		<Container fluid>
			<Navbar bg='dark' variant='dark'>
				<Container fluid>
					<Navbar.Brand href='/'>Excel.fun</Navbar.Brand>
				</Container>
			</Navbar>

			<Row><Col>
				<div className='card' style={{ backgroundColor: '#f5f5f5' }}>
					<div className='card-body'>
						<div className='card-text'>
				
							<h3>A free Excel & SQL tutorial system</h3>
							This website teaches you how to write SQL queries and Excel formulas.
							<br/><br/>
							It is a research project developed by <a href='http://profgarrett.com'>Nathan Garrett</a>.
							Some  publications about it are <a href='https://scholar.google.com/citations?user=UJXCwEcAAAAJ&hl=en&oi=ao'>posted online</a>.
							The site is free for both individuals and faculty. 
							<br/><br/>
							For any questions or comments, please contact me at <a href='mailto:profgarrett@gmail.com'>profgarrett@gmail.com</a>. 
							I'm happy to setup a class structure for faculty to simplify the grading process.
							</div>
					</div>
				</div>
			</Col>
			</Row>

			<Row>
				<Col>
					<CacheBuster/>
					<div style={{ paddingTop: 10}} />
					<Message message={message} style={messageStyle} />
					{ user_control }
					<PreviewList onPreviewLevel={loadPreviewLevel} />
					{ preview }
				</Col>
			</Row>
		</Container>
	);

}
