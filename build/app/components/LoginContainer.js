/*       */
import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Container, Card, Row, Col, Navbar, Button } from 'react-bootstrap';
//import {  } from './../components/Authentication';
import LoginCreateUser from './LoginCreateUser';
import LoginCurrentUser from './LoginCurrentUser';
import { Loading } from './../components/Misc';
import { Link } from 'react-router-dom';

import 'url-search-params-polyfill';

                                  

import 'url-search-params-polyfill';

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

*/

                  
 
  
                  
                 
                      
              
                   
  

export default class LoginContainer extends React.Component                       { 
	constructor(props           ) {
		super(props);

		const search = new URLSearchParams(window.location.search);
		// Find any params in the URL.		
		this.state = { 
			message: '',
			messageStyle: '',
			isLoading: false,
			url: search.has('url') ? search.get('url') : '/',
		};



		(this     ).login = this.login.bind(this);
		(this     ).create_user = this.create_user.bind(this);

		// if we have username and password, go ahead and submit.
		if(search.has('username') && search.has('password')) {
			this.login(search.get('username'), search.get('password'));
		}

		// Update to avoid showing URL params (as long as we're not locally developing).
		const clean_uri = location.protocol + '//' + location.host + location.pathname;
		if(location.host !== 'localhost:8080') {
			window.history.replaceState({}, document.title, clean_uri);
		}

	}



	login(username        , password        ) {
		const token = '';
		const url = this.state.url;

		this.setState( { isLoading: true });

		// Fire AJAX.
		fetch('/api/login/', {
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
					that.context.router.history.push(url);
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


	create_user(username        , section_code        ) {
		const url = this.state.url;

		this.setState( { isLoading: true, message: 'Please wait while we create your user account...', messageStyle: 'info' });

		// Fire AJAX.
		fetch('/api/create_user/', {
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
					that.context.router.history.push(url);
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

	render()       {
		let message = null;

		if( this.state.message === 'ExistingUser' ) {
			message = <Alert variant={this.state.messageStyle}>This user already exists. Do you want 
				to <Link to='/password'>reset your password</Link>?</Alert>;
		} else if(this.state.message === 'BadUsername' ) {
			message = <Alert variant={this.state.messageStyle}>Sorry, but your email is not valid. Please check it and try again.</Alert>;
		} else if(this.state.message === 'InvalidCode' ) {
			message = <Alert variant={this.state.messageStyle}>Sorry, but the course join code you used is not valid.</Alert>;
		} else if(this.state.message !== '' ) {
			message = <Alert variant={this.state.messageStyle}>{this.state.message}</Alert>;
		}


		return (
<Container fluid='true'>
	<Row>
		<Col>
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
											<LoginCurrentUser submit={this.login} disabled={this.state.isLoading} />

										</div>
									</div>
									</div>
								</Col>
								<Col sm={5}>
									<div className='card bg-dark text-white'>
									<div className='card-body'>
										<div className='card-title h6'>Create a new account</div>
										<div className='card-text'>
											<LoginCreateUser submit={this.create_user} disabled={this.state.isLoading} />
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
LoginContainer.contextTypes = {
	router: PropTypes.object.isRequired
};
