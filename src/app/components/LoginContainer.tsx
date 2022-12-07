import React, { useState } from 'react';
import { Container, Row, Col, Card, Alert, Navbar } from 'react-bootstrap';
import LoginCreateUser from './LoginCreateUser';
import LoginCurrentUser from './LoginCurrentUser';
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

This will automatically setup the account and join to the AMT group.
*/

export default function LoginContainer() { 
	const search = new URLSearchParams(window.location.search);
	const isAMT = search.has('amt'); 
	let url = search.has('url') ? (search.get('url') || '/') : '/';

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
					navigate(url)
				}, location.host === 'localhost:8080' ? 1000 : 0);  // add a short delay if on dev.

			})
			.catch( error => {
				setMessage( error.message == 'Error: 401' ? 'Invalid username or password' : error.message );
				setMessageStyle( error.message == 'Error: 401' ? 'warning' : 'danger' );
				setIsLoading(false);
		});
	}


	const create_user = (username: string, section_code: string) => {
		setMessage('Please wait while we create your account.');
		setMessageStyle( 'info' );

		// See if we should prompt the user to create a password after creating (i.e., for non-anon users)
		if(username.length > 0 && username.indexOf('@') !== -1) {
			url = '/profile';
		}

		// Fire AJAX.
		fetch('/api/users/create_user/', {
				method: 'POST',
				credentials: 'include',
				mode: 'same-origin',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username, section_code })
			})
			.then( response => response.json() )
			.then( json => {
				if(json.error) throw new Error(json.error); 

				setMessage('Success creating your account!  If you provided an email, you will receive a link to verify your account.')
				setMessageStyle('success')
				
				setTimeout( () => {
					navigate(url)
				}, location.host === 'localhost:8080' ? 1000 : 0);  // short delay if we're developing.
				
			})
			.catch( error => {
				setMessage( error.message );
				setMessageStyle( 'danger' );
				setIsLoading(false);
			});
	}

	// TODO: FIX
	//if(isAMT) {
	//	create_user('', 'amt');
	//}

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
		<Navbar bg='dark' variant='dark'>
			<Container fluid>
				<Navbar.Brand href='/'>Excel.fun</Navbar.Brand>
			</Container>
		</Navbar>

	<Row><Col>
	<div className='card' style={{ backgroundColor: '#f5f5f5' }}>
		<div className='card-body'>
			<div className='card-text'>
	
				<h3>A free Excel tutorial system</h3>
				This free website teaches you how to write formulas and functions in Microsoft Excel.
				<br/><br/>
				It is a research project developed by <a href='http://profgarrett.com'>Nathan Garrett</a>.
				The <a href='https://github.com/profgarrett/jsgames'>code</a> is free for public use, and 
				future publications <a href='https://scholar.google.com/citations?user=UJXCwEcAAAAJ&hl=en&oi=ao'>will be posted online</a>.
				<br/><br/>
				For any questions or comments, please contact me at <a href='mailto:profgarrett@gmail.com'>profgarrett@gmail.com</a>.
				
				<Loading loading={isLoading } />
				{ messageAlert }

				<Row>
					<Col sm={7}>
						<Card>
						<div className='card'>
						<div className='card-body'>
							<div className='card-title h4'>Current user login</div>
							<div className='card-text'>
								<LoginCurrentUser submit={login} disabled={isLoading} />
							</div>
						</div>
						</div>
						</Card>
					</Col>
					<Col sm={5}>
						<Card>
						<div className='card bg-dark text-white'>
						<div className='card-body'>
							<div className='card-title h6'>Create a new account</div>
							<div className='card-text'>
								<LoginCreateUser submit={create_user} disabled={isLoading} />
							</div>
						</div>
						</div>
						</Card>
					</Col>
				</Row>

				</div>
		</div>
	</div>

	</Col></Row>
</Container>
);
}
