import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import { Alert, Row, Col, Navbar } from 'react-bootstrap';
import { ProfileChange } from './ProfileChange';
import { Loading } from './Misc';
import { useNavigate } from 'react-router-dom';
import ForceLogin from './ForceLogin';

//import 'url-search-params-polyfill';

import { getUserFromBrowser } from './Authentication';


/*
    This module controls profile options.  
*/

export default function ProfileContainer() {
	const search = new URLSearchParams(window.location.search);

	const [message, setMessage] = useState('')
	const [messageStyle, setMessageStyle] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const user = getUserFromBrowser();
	const username = user.username;
	const url_with_hypthens = search.has('url') ? (search.get('url') || '/') : '/';
	const url = url_with_hypthens.replaceAll('-', '/');

	const update_profile = (password: string ) => {
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
				if(json._error) throw new Error(json._error); 
				if(json.error) throw new Error(json.error); 

				setMessage('Success updating your information!')
				setMessageStyle('success')
				setIsLoading(false);

				setTimeout( () => {
					navigate('/'+url);
				}, location.host === 'localhost:8080' ? 1000 : 0);  // add a short delay if on dev.

			})
			.catch( error => {
				setMessage( error.message == 'Error: 401' ? 'Invalid password' : error.message );
				setMessageStyle( error.message == 'Error: 401' ? 'warning' : 'danger' );
				setIsLoading(false);
		});
	}


	let messageAlert = message === '' 
		? null
		: <Alert variant={messageStyle}>{message}</Alert>;
		

	return (
            <Container fluid>
				<Navbar bg='dark' variant='dark'>
					<Container fluid>
						<Navbar.Brand href='/'>Excel.fun</Navbar.Brand>
					</Container>
				</Navbar>
                <ForceLogin />
                <Row>
                    <Col>
                        <div style={{ paddingTop: 10}} />

                        <Loading loading={isLoading } />

                        { messageAlert }
                        <div className='card bg-light'>
                            <div className='card-body'>
                                <div className='card-text'>
                                    <ProfileChange submit={update_profile} disabled={isLoading} />
                                </div>
                            </div>
                        </div>

                    </Col>
                </Row>
            </Container>
		);
	

}
