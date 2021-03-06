/* @flow */
import React from 'react';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import { Alert, Row, Col, Navbar } from 'react-bootstrap';
import LoginCreateUser from './LoginCreateUser';
import LoginCurrentUser from './LoginCurrentUser';
import { Loading } from './../components/Misc';
import { Link } from 'react-router-dom';
import { CacheBuster } from './CacheBuster';

import 'url-search-params-polyfill';

import type { Node } from 'react';

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

type PropsType = {
	history: any,
};
type StateType = {
	message: string,
	messageStyle: string,
	url: ?string,
	isLoading: boolean
};

export default class LoginContainer extends React.Component<PropsType, StateType> { 
	constructor(props: PropsType) {
		super(props);

		const search = new URLSearchParams(window.location.search);
		// Find any params in the URL.		
		this.state = { 
			message: '',
			messageStyle: '',
			isLoading: false,
			url: search.has('url') ? search.get('url') : '/',
		};



		(this: any).login = this.login.bind(this);
		(this: any).create_user = this.create_user.bind(this);


		// if we have username and password, go ahead and submit.
		if(search.has('username') && search.has('password')) {
			const username = search.get('username') || '';
			const password = search.get('password') || '';

			this.state.isLoading=true;
			this.state.message = 'Please wait while we log you in';

			this.login( username, password );
			return;
		}

		// if we are an AMT user, then go ahead and create.
		if(search.has('amt')) {

			this.state.isLoading=true;
			this.state.message = 'Please wait while we log you in';

			this.create_user('', 'amt');
			return;
		}

		// Update to avoid showing URL params (as long as we're not locally developing).
		const clean_uri = location.protocol + '//' + location.host + location.pathname;
		if(location.host !== 'localhost:8080') {
			window.history.replaceState({}, document.title, clean_uri);
		}

	}


	login(username: string, password: string) {
		const token = '';
		const url = this.state.url;

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
				var that = this;
				if(json._error) throw new Error(json._error); 

				this.setState({ message: 'Success logging in!', messageStyle: 'success', isLoading: false});
				setTimeout( () => {
					this.props.history.push(url);
				}, location.host === 'localhost:8080' ? 1000 : 0);  // add a short delay if on dev.

			})
			.catch( error => {
				let e = { 
					messageStyle: 'danger', 
					message: error.message,
					isLoading: false
				};

				if( e.message === 'Error: 401') {
					// Invalid password.
					e.message = 'Invalid username or password';
					e.messageStyle = 'warning';
				} else {
					// Other error. Show.
				}
				this.setState({...e});

				// Error Codes: 403 = invalid token.

		});
	}


	create_user(username: string, section_code: string) {
		let url = this.state.url;

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
				const that = this;
				if(json.error) throw new Error(json.error); 

				this.setState({ 
					message: 'Success creating your account!  If you provided an email, you will receive a link to verify your account.', 
					messageStyle: 'success', 
				});
				setTimeout( () => {
					this.props.history.push(url);
				}, location.host === 'localhost:8080' ? 1000 : 0);  // short delay if we're developing.
				
			})
			.catch( error => {
				this.setState({ 
					messageStyle: 'danger', 
					message: error.message,
					isLoading: false
				});
			});
	}

	render(): Node {
		let message = null;
		const noop = () => {};

		if( this.state.message === 'ExistingUser' ) {
			message = <Alert variant={this.state.messageStyle} >This user already exists. Do you want 
				to <Link to='/password'>reset your password</Link>?</Alert>;
		} else if(this.state.message === 'BadUsername' ) {
			message = <Alert variant={this.state.messageStyle} >Sorry, but your email is not valid. Please check it and try again.</Alert>;
		} else if(this.state.message === 'InvalidCode' ) {
			message = <Alert variant={this.state.messageStyle} >Sorry, but the course join code you used is not valid.</Alert>;
		} else if(this.state.message !== '' ) {
			message = <Alert variant={this.state.messageStyle} >{this.state.message}</Alert>;
		}

		// wrap functions to show that we're loading.
		const login = (u, p) => {
			this.setState( { isLoading: true, message: 'Please wait while we log you in.', messageStyle: 'info' });			this.setState( { isLoading: true });
			this.login(u, p);
		};
		const create_user = (u, s) => {
			this.setState( { isLoading: true, message: 'Please wait while we create your user account...', messageStyle: 'info' });
			this.create_user(u, s);
		};

		return (
<Container fluid>
	<Row>
		<Col>
			<CacheBuster/>
			<div style={{ paddingTop: 10}} />

			<Loading loading={this.state.isLoading } />

			<Navbar bg='dark' variant='dark'>
				<Navbar.Brand href='/'>Function Trainer</Navbar.Brand>
			</Navbar>
			{ message }
			<div className='card bg-light'>
				<div className='card-body'>
					<div className='card-text'>
						<p>Welcome to the Function Trainer! This free website teaches you how to write 
						formulas and functions in Microsoft Excel.</p>
						<p>It is a research project developed by <a href='http://profgarrett.com'>Nathan Garrett</a>.
						The <a href='https://github.com/profgarrett/jsgames'>code</a> is free for public use, and 
						future publications <a href='https://scholar.google.com/citations?user=UJXCwEcAAAAJ&hl=en&oi=ao'>will be posted online</a>.
						</p>
						<p>For any questions or comments, please contact me at <a href='mailto:profgarrett@gmail.com'>profgarrett@gmail.com</a>.
						</p>
							<Row>
								<Col sm={7}>
									<div className='card'>
									<div className='card-body'>
										<div className='card-title h5'>Current User Login</div>
										<div className='card-text'>
											<LoginCurrentUser submit={login} disabled={this.state.isLoading} />

										</div>
									</div>
									</div>
								</Col>
								<Col sm={5}>
									<div className='card bg-dark text-white'>
									<div className='card-body'>
										<div className='card-title h6'>Create a new account</div>
										<div className='card-text'>
											<LoginCreateUser submit={create_user} history={this.props.history} disabled={this.state.isLoading} />
										</div>
									</div>
									</div>
								</Col>
							</Row>
					</div>
				</div>
			</div>

		</Col>
	</Row>
</Container>
		);
	}

}
