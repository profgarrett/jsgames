import React, { ReactElement, useEffect, useState } from 'react';

import { Container, Breadcrumb, Row, Col, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';


import { LevelScore } from './LevelScore';
import { LevelScoreChart } from './LevelScoreChart';
import { Message, Loading } from '../components/Misc';

import { IfLevelSchema } from '../../shared/IfLevelSchema';

import ForceLogin from '../components/ForceLogin';

// Load a sample screen to test surveycharts results
const DEBUG = false; 

export default function LevelScoreContainer() {

	const [message, setMessage] = useState('Loading data from server')
	const [messageStyle, setMessageStyle] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [level, setLevel] = useState<IfLevelSchema|null>(null);

	const params = useParams();
	const _id = params._id ? params._id : null;
	
	const url = DEBUG 
		? '/api/levels/debuglevel/surveycharts_wu/'
		: '/api/levels/level/'+_id;


	useEffect( () => {

		fetch(url, {
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
			setLevel( ifLevel);
			setMessage('');
			setIsLoading(false);
		})
		.catch( error => {
			setLevel( null );
			setMessage('Error: ' + error.message);
			setIsLoading(false);
		});
	
	}, [_id] );


	const crumbs = level ?
		<Breadcrumb>
			<Breadcrumb.Item href={'/ifgame/'}>Home</Breadcrumb.Item>
			<Breadcrumb.Item active>{ level.title }</Breadcrumb.Item>
		</Breadcrumb>
		: <></>;

	const back = level ?
		<Button variant='primary' 
				style={{ marginBottom: 20, marginTop: 20 }} 
				href={ '/ifgame/' }>
				Back to home page
		</Button>
		: <></>;

	let score: ReactElement;
		
	// If we are looking at a chart, then show the specially-designed 
	// chart screen. Otherwise, go to the normal score.
	if(typeof level === 'undefined' || level == null) {
		score = <></>;
	} else if( level.code === 'surveycharts_amt' || level.code === 'surveycharts_wu') {
		score = <LevelScoreChart level={level} />;
	} else {
		score = <LevelScore level={level} />;
	}

	return (
		<Container fluid>
			<Row>
				<Col>
					<ForceLogin/>
					{ crumbs }
					<h3>{ level ? level.title : '' }</h3>

					<Message message={message} style={messageStyle} />
					<Loading loading={isLoading } />
					<div style={{ textAlign: 'center' }}>{ back }</div>
					{ score }
					<div style={{ textAlign: 'center' }}>{ back }</div>
					<br/>
				</Col>
			</Row>
		</Container>
	);
}