import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import { Row, Col, Navbar, Alert } from 'react-bootstrap';
import { Loading } from './Misc';

import PasswordChange from './PasswordChange';
import PasswordRequest from './PasswordRequest';
import { useNavigate } from 'react-router-dom';

//import 'url-search-params-polyfill';

const no_null = (s_or_null: string|null, ret = ''): string => {
	if(s_or_null === null || typeof s_or_null === 'undefined') {
		return ret; // (typeof ret === 'undefined' || ret === null) ? '' : ret;
	}
	return s_or_null;
}



export default function PasswordContainer() {
	const search = new URLSearchParams(window.location.search);
	const navigate = useNavigate();
	
	const [url] = useState( no_null( search.get('url'), '/') )
	const [username] = useState( no_null( search.get('username')) )
	const [passwordreset] = useState( no_null( search.get('passwordreset')) )
	const [message, setMessage] = useState( '')
	const [messageStyle, setMessageStyle] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	// Hide params in URL if not developing
	const clean_uri = location.protocol + '//' + location.host + location.pathname;
	if(location.host !== 'localhost:8080') {
		window.history.replaceState({}, document.title, clean_uri);
	}

	const submit_request = (username: string) => {
		const url = '/ifgame';

		setIsLoading(true);
		setMessage('Sending email with your information');
		setMessageStyle( 'info' );

		// Fire AJAX.
		fetch('/api/users/passwordresetrequest/', {
				method: 'POST',
				credentials: 'include',
				mode: 'same-origin',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username })
			})
			.then( (x) => {
				setIsLoading(false);
				setMessage('An email has been sent to you with a reset link. It usually takes around 5 minutes to arrive, so please be patient.');
				setMessageStyle( 'success' );
			});

	}

	const submit_change = (password: string) => {
		setIsLoading(true);
		setMessage('Saving change');
		setMessageStyle( 'info' );

		const params = { 
				passwordreset: passwordreset, 
				password: password
			};

		// Fire AJAX to reset password and login with the new password.
		fetch('/api/users/passwordreset/', {
				method: 'POST',
				credentials: 'include',
				mode: 'same-origin',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(params)
			})
			.then( response => {
				return response.json();
			})
			.then( json => {
				if(json.error) throw new Error(json.error); 

				setIsLoading(false);
				setMessage('Password changed successfully!');
				setMessageStyle( 'success' );

				setTimeout( () => {
					navigate(url);
				}, 1000);

			})
			.catch( error => {
				console.log(error);
				setIsLoading(false);
				setMessage(error.message);
				setMessageStyle( 'danger' );
			});

	}

	
	let messageAlert = message === '' ? 
					null : 
					<Alert variant={messageStyle}>{message}</Alert>;
	
	let control = ( passwordreset === '') 
		? <PasswordRequest username={ username } submit={ submit_request} disabled={ isLoading } />
		: <PasswordChange passwordreset={ passwordreset } submit={ submit_change } disabled={isLoading} />;

	return (
		<Container fluid>
			<Row>
				<Col>
					<div style={{ paddingTop: 10}} />

					<Loading loading={isLoading } />

					<Navbar bg='dark' variant='dark'>
						<Container fluid>
							<Navbar.Brand href='/'>Function Trainer</Navbar.Brand>
						</Container>
					</Navbar>

					{ messageAlert}
					<div className='card' style={{ backgroundColor: '#f5f5f5' }}>
						<div className='card-body'>
							<div className='card-text'>
								{ control }
							</div>
						</div>
					</div>

				</Col>
			</Row>
		</Container>
	);
}