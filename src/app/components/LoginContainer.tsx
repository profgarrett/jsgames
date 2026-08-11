import React, { useState } from 'react';
import { Container, Row, Col, Card, Alert, Navbar } from 'react-bootstrap';
import LoginCurrentUser from './LoginCurrentUser';
import LoginGoogle from './LoginGoogle';
import { loadUserFromServer } from './Authentication';
import { Loading } from './Misc';
import { Link, useNavigate } from 'react-router-dom';

// TODO: Fix Cache buster .s
//import { CacheBuster } from './CacheBuster';

//import 'url-search-params-polyfill';

/*

This module controls login.  

It handles a variety of needed tasks, ranging from 

1) Login
2) New user registration.

Passing URL parameters can influence the behavior, telling the system to redirect to a particular page.

Process:
* Input information
	Email (auto-fill as username)
	First/Last
	Username 

	If email/username already in use, redirect to recover email

* Join class section (optional)
* Email confirmation
* Auto login with new account.

For Amazon Mechanical Turk, use
	.../login/amt=1

For feedback,
	.../?url=path-to-item (hypens will be replaced with / characters.)

This will automatically setup the account and join to the AMT group.
*/

export default function LoginContainer() { 
	const search = new URLSearchParams(window.location.search);
	const isAMT = search.has('amt'); 

	// Replace all - with / characters in url
	const url_with_hypthens = search.has('url') ? (search.get('url') || '/') : '/';
	const url = url_with_hypthens.replaceAll('-', '/');
	
	const [message, setMessage] = useState( isAMT ? 'Please wait while we log you in' : '')
	const [messageStyle, setMessageStyle] = useState('');
	const [isLoading, setIsLoading] = useState(isAMT);
	const navigate = useNavigate();


	// Update to avoid showing URL params (as long as we're not locally developing).
	//const clean_uri = location.protocol + '//' + location.host + location.pathname;
	//if(location.host !== 'localhost:8080') {
	//	window.history.replaceState({}, document.title, clean_uri);
	//}

	
	const login = (username: string, password: string) => {
		const token = '';
		setMessage('Please wait while we log you in.');
		setMessageStyle( 'info' );

		// Fire AJAX.
		fetch('/api/users/login/', {
				method: 'POST',
				credentials: 'include',
				mode: 'same-origin',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username, password, token })
			})
			.then( response => {
				if(response.status === 403 || response.status === 401) {
					throw Error('Invalid username or password');
				}
				return response;
			})
			.then( response => response.json() )
			.then( json => {
				if(json._error) throw new Error(json._error); 

				setMessage( 'Success logging in!');
				setMessageStyle( 'success' );
				setIsLoading(false);

				setTimeout( () => {
					// Refresh the cached identity (httpOnly cookie) before navigating.
					loadUserFromServer().finally( () => navigate('/'+url) );
				}, location.host === 'localhost:8080' ? 1000 : 0);  // add a short delay if on dev.

			})
			.catch( error => {
				setMessage( error.message == 'Error: 401' ? 'Invalid username or password' : error.message );
				setMessageStyle( error.message == 'Error: 401' ? 'warning' : 'danger' );
				setIsLoading(false);
		});
	}


	const google_login = (credential: string, section_code: string) => {
		setMessage('Please wait while we log you in.');
		setMessageStyle( 'info' );
		setIsLoading(true);

		fetch('/api/users/google_login/', {
				method: 'POST',
				credentials: 'include',
				mode: 'same-origin',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ credential, section_code })
			})
			.then( response => {
				if(response.status === 403 || response.status === 401) {
					throw Error('Google sign-in was not accepted. Please try again.');
				}
				return response.json();
			})
			.then( json => {
				if(json.error) throw new Error(json.error);

				setMessage( 'Success logging in!');
				setMessageStyle( 'success' );
				setIsLoading(false);

				setTimeout( () => {
					// Refresh the cached identity (httpOnly cookie) before navigating.
					loadUserFromServer().finally( () => navigate('/'+url) );
				}, location.host === 'localhost:8080' ? 1000 : 0);
			})
			.catch( error => {
				setMessage( error.message );
				setMessageStyle( 'danger' );
				setIsLoading(false);
		});
	}


	let messageAlert;

	if( message === 'ExistingUser' ) {
		messageAlert = <Alert variant={messageStyle} >This user already exists. Do you want 
			to <Link to='/password'>reset your password</Link>?</Alert>;
	} else if(message === 'BadUsername' ) {
		messageAlert = <Alert variant={messageStyle} >Sorry, but your email is not valid. Please check it and try again.</Alert>;
	} else if(message === 'InvalidCode' ) {
		messageAlert = <Alert variant={messageStyle} >Sorry, but the course join code you used is not valid.</Alert>;
	} else if(message !== '' ) {
		messageAlert = <Alert variant={messageStyle} >{message}</Alert>;
	}


return (
<Container fluid>
	<Loading loading={isLoading } />
	{ messageAlert }

	<Row><Col className='col-md-9' style={{ paddingRight: 0 }}>
	<Card style={{ backgroundColor: '#f5f5f5', marginTop: 10 }}>
		<Card.Body>
			<Card.Title>Sign in with Google</Card.Title>
				<div>
					Please use your <i>@mix.wvu.edu</i> email address.  
					If you are a new student, please enter your course code.
					<br/>
					<LoginGoogle submit={google_login} disabled={isLoading} />
				</div>
		</Card.Body>
	</Card>
	</Col>

	<Col className='col-md-3'>
		<Card style={{ marginTop: 10 }}>
			<Card.Body>
				<Card.Title>Administrator Login</Card.Title>
				<div>
					<LoginCurrentUser submit={login} disabled={isLoading} />
				</div>
			</Card.Body>
		</Card>
	</Col></Row>


</Container>
);
}
