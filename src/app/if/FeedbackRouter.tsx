import React, { useState, useEffect} from 'react';
import {  useNavigate } from 'react-router-dom';

import { Container, Row, Col } from 'react-bootstrap';

import { Message, Loading } from '../components/Misc';

import { IfLevelSchema } from '../../shared/IfLevelSchema';
import { getUserFromBrowser } from '../components/Authentication';


//import 'url-search-params-polyfill';


export default function FeedbackRouter() {

	// Get user information
	const navigate = useNavigate();
	const [message, setMessage] = useState('Loading data from server')
	const [isLoading, setIsLoading] = useState(true);

	// Get URL
	const search = new URLSearchParams(window.location.search);
	const url = window.location.href.split('/');
	const code = url[url.length-1];

	// See if we are logged in
	const user = getUserFromBrowser();
	
	// Load
	useEffect( () => {
		// Redirect to logged in
		if(user.username == '') {
			navigate('/login?url=ifgame-feedback-create-' + code)
		}
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

			let newLevel = new IfLevelSchema(json);
			navigate('/ifgame/level/'+newLevel._id+'/play');

		}).catch( error => {
			console.log(error);
			setIsLoading(false);
			setMessage( error);
		});

	}, [code]);
	
	// Create new level
	return (
		<Container fluid>
			<Row>
			<Col xs={12}>
				<Loading loading={isLoading } />
				<Message message={ message } style='info' />
			</Col>
		</Row>
		</Container>
	);		

}

