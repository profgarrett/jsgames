import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import { Row, Col, Navbar, Alert } from 'react-bootstrap';
import { Loading } from './Misc';
import { postJson } from './Api';
import ServiceHealthBanner from './ServiceHealth';

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

	const submit_request = async (username: string) => {
		setIsLoading(true);
		setMessage('Sending email with your information');
		setMessageStyle( 'info' );

		/*
			Note the await. This used to report success from a bare .then() with no
			status check at all, so a 500 (or a database that was down) still told the
			student "an email has been sent" and left them waiting for mail that was
			never going to arrive.
		*/
		try {
			await postJson('/api/users/passwordresetrequest/', { username }, {
				action: 'send your reset email',
			});

			setIsLoading(false);
			setMessage('An email has been sent to you with a reset link. It usually takes around 5 minutes to arrive, so please be patient.');
			setMessageStyle( 'success' );

		} catch(error: any) {
			setIsLoading(false);
			setMessage( error.message );
			setMessageStyle( 'danger' );
		}
	}

	const submit_change = async (password: string) => {
		setIsLoading(true);
		setMessage('Saving change');
		setMessageStyle( 'info' );

		const params = {
				passwordreset: passwordreset,
				password: password
			};

		try {
			await postJson('/api/users/passwordreset/', params, {
				action: 'change your password',
			});

			setIsLoading(false);
			setMessage('Password changed successfully!');
			setMessageStyle( 'success' );

			setTimeout( () => {
				navigate(url);
			}, 1000);

		} catch(error: any) {
			setIsLoading(false);
			setMessage( error.message );
			setMessageStyle( 'danger' );
		}
	}

	
	const messageAlert = message === '' ? 
					null : 
					<Alert variant={messageStyle}>{message}</Alert>;
	
	const control = ( passwordreset === '') 
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

					<ServiceHealthBanner action='reset your password' />

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