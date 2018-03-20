import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, FormControl, FormGroup, ControlLabel, Button } from 'react-bootstrap';
import { Message, Loading, get_cookie } from './../components/Misc'
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';


import 'url-search-params-polyfill';


export default class Login extends React.Component { 
	constructor(props) {
		super(props);

		const search = new URLSearchParams(window.location.search);
		const url = search.has('url') ? search.get('url') : '/';

		this.state = { 
			message: '',
			messageStyle: '',
			username: search.has('username') ? search.get('username') : '',
			password: search.has('password') ? search.get('password') : '',
			token: search.has('token') ? search.get('token') : '',
			url: url,
			isLoading: false
		};
		this.onSubmit = this.onSubmit.bind(this);
		this.onUsernameChange = this.onUsernameChange.bind(this);
		this.onPasswordChange = this.onPasswordChange.bind(this);
	}


	componentDidMount() {
		const username = get_cookie('x-access-token-username');
		const clean_uri = location.protocol + '//' + location.host + location.pathname;

		// Test to see if we're already logged in, and if it's as the current user.
		// Don't bother submitted, just move to the next page.
		if(username !== null && username === this.state.username) {
			// Already logged in as this user.
			this.context.router.history.push(this.state.url);
			return;
		}

		// If a token was passed, go ahead and submit results.
		if(this.state.token !== '') {
			this.setState( {
				isLoading: true,
				message: 'Logging you in'
			});
			this._trigger(this.state.username, this.state.password, this.state.token);
		}

		// Update to avoid showing URL params (as long as we're not locally developing).
		if(location.host !== 'localhost:8080') {
			window.history.replaceState({}, document.title, clean_uri);
		}
	}
	
	// Log into the server.
	onSubmit(e) {
		e.preventDefault();
		// Show loading status.
		this.setState({ 
			message: 'Checking username and password',
			messageStyle: 'info',
			isLoading: true
		});

		this._trigger(this.state.username, this.state.password, '');
	}

	_trigger(username, password, token) {

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
			.then( response => response.json() )
			.then( json => {
				var that = this;
				if(json._error) throw new Error(json._error); 

				this.setState({ message: 'Success logging in!', messageStyle: 'success', isLoading: false});
				console.log(json);
				setTimeout( () => {
					that.context.router.history.push(this.state.url);
				}, location.host === 'localhost:8080' ? 1000 : 0);


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

		return false;
	}



	onUsernameChange(e) {
		this.setState({ username: e.target.value });
	}
	onPasswordChange(e) {
		this.setState({ password: e.target.value });
	}

	render() {
		let formStyle = {
			visible: !this.isLoading
		};

		return (
			<Row>
				<Col>
					<h3>Log in</h3>
					<Message message={this.state.message} style={this.state.messageStyle} />
					<Loading loading={this.state.isLoading } />
					<form name='loginform' onSubmit={this.onSubmit} style={formStyle}>
						<FormGroup>
							<ControlLabel>Username</ControlLabel>
							<FormControl 
								id='LoginUsername'
								ref={(input) => { this.client_fInput = input; }}
								onChange={this.onUsernameChange}
								value={this.state.username }
								type='text'
								placeholder='Type in your user name'
							/>
						</FormGroup>
						<FormGroup>
							<ControlLabel>Username</ControlLabel>
							<FormControl 
								id='LoginPassword'
								type='password'
								value={this.state.password }
								onChange={this.onPasswordChange}
								placeholder='Type in your password'
							/>
							<br/>
							<Button type='submit' bsStyle='primary'>Login</Button>
						</FormGroup>
					</form>
				</Col>
			</Row>
		);
	}
}
Login.contextTypes = {
	router: PropTypes.object.isRequired
};
