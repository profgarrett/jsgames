/* @flow */
import React from 'react';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import { Alert, Row, Col, Navbar } from 'react-bootstrap';
import { ProfileChange } from './ProfileChange';
import { Loading } from './../components/Misc';
import { Link } from 'react-router-dom';
import ForceLogin from './../components/ForceLogin';

import 'url-search-params-polyfill';
        
import { getUserFromBrowser } from './Authentication';

import type { Node } from 'react';

/*
    This module controls profile options.  
*/

type PropsType = {
	
};
type StateType = {
	message: string,
	messageStyle: string,
	url: ?string,
	isLoading: boolean
};

export class ProfileContainer extends React.Component<PropsType, StateType> { 
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

		(this: any).update_profile = this.update_profile.bind(this);
	}


	update_profile(password: string ) {
		const url = this.state.url;
        const user = getUserFromBrowser();
        const username = user.username;
        
        if(username === '') throw new Error('You can not update profile if your username is not set');

		// Fire AJAX.
		fetch('/api/users/profileupdate/', {
				method: 'POST',
				credentials: 'include',
				mode: 'same-origin',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username, password })
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
				if(json.error) throw new Error(json.error); 

				this.setState({ message: 'Success updating your information!', messageStyle: 'success', isLoading: false});
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
					e.message = 'Invalid password';
					e.messageStyle = 'warning';
				} else {
					// Other error. Show.
				}
				this.setState({...e});

				// Error Codes: 403 = invalid token.

		});
	}


	render(): Node {
		let message = this.state.message === '' 
            ? null
            : <Alert variant={this.state.messageStyle}>{this.state.message}</Alert>;
		

		return (
            <Container fluid>
                <ForceLogin />
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
                                    <ProfileChange submit={this.update_profile} disabled={this.state.isLoading} />
                                </div>
                            </div>
                        </div>

                    </Col>
                </Row>
            </Container>
		);
	}

}


ProfileContainer.contextTypes = {
	router: PropTypes.object.isRequired
};
