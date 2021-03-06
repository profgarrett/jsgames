/* @flow */
import React from 'react';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import { Row, Col, Navbar, Alert } from 'react-bootstrap';
import { Loading } from './../components/Misc';

import PasswordChange from './PasswordChange';
import PasswordRequest from './PasswordRequest';

import 'url-search-params-polyfill';

import type { Node } from 'react';



type PropsType = {
	history: any,
};

type StateType = {
	isLoading: boolean,
	message: string,
	messageStyle: string,
	username: string,
	passwordreset: string,
	url: string
};

const no_null = (s_or_null: ?string, ret: ?string): string => {
	if(s_or_null === null || typeof s_or_null === 'undefined') {
		return (typeof ret === 'undefined' || ret === null) ? '' : ret;
	}
	return s_or_null;
}



export default class PasswordContainer extends React.Component<PropsType, StateType> { 
	constructor(props: PropsType) {
		super(props);

		const search = new URLSearchParams(window.location.search);
		// Find any params in the URL.		
		
		this.state = { 
			isLoading: false,
			passwordreset: no_null(search.get('passwordreset')),
			username: no_null( search.get('username')),
			url: no_null( search.get('url'), '/'),
			message: '',
			messageStyle: ''
		};
		
		const clean_uri = location.protocol + '//' + location.host + location.pathname;
		if(location.host !== 'localhost:8080') {
			window.history.replaceState({}, document.title, clean_uri);
		}
	
		(this: any).submit_request = this.submit_request.bind(this);
		(this: any).submit_change = this.submit_change.bind(this);
	}


	submit_request(username: string) {
		const url = '/ifgame';

		this.setState( { isLoading: true, message: 'Sending email with your information', messageStyle: 'info' });

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
				this.setState({ 
					message: 'An email has been sent to you with a reset link. It usually takes around 5 minutes to arrive, so please be patient. ', 
					messageStyle: 'success', 
					isLoading: false
				});
			});

	}

	submit_change(password: string) {
		const that = this;
		const params = { 
				passwordreset: this.state.passwordreset, 
				password: password
			};
		const url = this.state.url;

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
				that.setState({ message: 'Password changed successfully!', isLoading: false, messageStyle: 'success' });

				setTimeout( () => {
					that.props.history.push(url);
				}, 1000);

			})
			.catch( error => {
				console.log(error);
				this.setState({ 
					messageStyle: 'danger', 
					message: error.message,
					isLoading: false
				});
			});

	}

	render(): Node {
		let message = null;
		let control = null;

		/*
		if( this.state.message === 'ExistingUser' ) {
			message = <Alert variant={this.state.messageStyle}>This user already exists. Do you want 
				to <Link to='/passwordreset'>reset your password</Link>?</Alert>;
		} else if(this.state.message !== '' ) {
		*/
			message = <Alert variant={this.state.messageStyle}>{this.state.message}</Alert>;
		//}

		if( this.state.passwordreset === '') {
			control = <PasswordRequest username={ this.state.username } submit={ this.submit_request} disabled={ this.state.isLoading } />;
		} else {
			control = <PasswordChange passwordreset={ this.state.passwordreset } submit={ this.submit_change } disabled={this.state.isLoading} />;
		}

		return (
			<Container fluid>
				<Row>
					<Col>
						<div style={{ paddingTop: 10}} />

						<Loading loading={this.state.isLoading } />

						<Navbar bg='dark' variant='dark'>
							<Navbar.Brand href='/'>Function Trainer</Navbar.Brand>
						</Navbar>

						{ message }
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

}
