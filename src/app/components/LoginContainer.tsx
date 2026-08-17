import React, { useState } from 'react';
import { Container, Row, Col, Card, Alert, Navbar } from 'react-bootstrap';
import LoginCurrentUser from './LoginCurrentUser';
import LoginGoogle from './LoginGoogle';
import { loadUserFromServer } from './Authentication';
import { postJson } from './Api';
import ServiceHealthBanner from './ServiceHealth';
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

	
	/*
		Copy for the failure a student is most likely to hit and least likely to
		understand. It goes out of its way to say "not your password", because the
		default assumption at a login box is that you typed something wrong.
	*/
	const DB_DOWN_MESSAGE =
		'The site\'s database is temporarily unavailable, so we can\'t log you in right now. '
		+ 'This is a problem on our end — your username and password are fine. '
		+ 'Please try again in a few minutes. If it is still down after 15 minutes, email '
		+ 'profgarrett@gmail.com and mention error code DB_UNAVAILABLE.';

	// A failure that is the user's fault reads as a warning; one that is ours reads as
	// an error. UNAUTHORIZED is the only one in the first group.
	const style_for = (error: any): string =>
		(error && error.api_code === 'UNAUTHORIZED') ? 'warning' : 'danger';

	// Shared success path for both sign-in routes.
	const on_logged_in = () => {
		setMessage( 'Success logging in!');
		setMessageStyle( 'success' );
		setIsLoading(false);

		setTimeout( () => {
			// Refresh the cached identity (httpOnly cookie) before navigating.
			loadUserFromServer().finally( () => navigate('/'+url) );
		}, location.host === 'localhost:8080' ? 1000 : 0);  // add a short delay if on dev.
	};


	const login = async (username: string, password: string) => {
		const token = '';
		setMessage('Please wait while we log you in.');
		setMessageStyle( 'info' );

		try {
			// postJson turns a 503, a 401, an HTML error page or a dead server into an
			// Error whose .message is already presentable. See Api.ts.
			await postJson('/api/users/login/', { username, password, token }, {
				action: 'log you in',
				db_message: DB_DOWN_MESSAGE,
				unauthorized_message: 'Invalid username or password.',
			});

			on_logged_in();

		} catch(error: any) {
			// Tokens like 'ExistingUser' arrive here as the message and are rendered as
			// their own alerts further down.
			setMessage( error.message );
			setMessageStyle( style_for(error) );
			setIsLoading(false);
		}
	}


	const google_login = async (credential: string, section_code: string) => {
		setMessage('Please wait while we log you in.');
		setMessageStyle( 'info' );
		setIsLoading(true);

		try {
			await postJson('/api/users/google_login/', { credential, section_code }, {
				action: 'log you in',
				db_message: DB_DOWN_MESSAGE,
				unauthorized_message: 'Google sign-in was not accepted. Please try again.',
			});

			on_logged_in();

		} catch(error: any) {
			setMessage( error.message );
			setMessageStyle( style_for(error) );
			setIsLoading(false);
		}
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

	{/* Warns before anything is typed, and clears itself when the database returns. */}
	<ServiceHealthBanner action='sign in' />

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
