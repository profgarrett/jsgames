import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Loading } from './Misc';
import { getUserFromBrowser } from './Authentication';



export default class Logout extends React.Component { 

	componentDidMount() {
		const user = getUserFromBrowser();

		// Test to see if we're actually logged in. 
		if(user.username.length < 1) {
			console.log('not logged in!');
			window.location.href = '/';
			return;
		}

		// Fire AJAX to log out.
		fetch('/api/users/logout/', {
				method: 'POST',
				credentials: 'include',
				mode: 'same-origin',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ 'logout': 'logout' })
			})
			.then( response => response.json() )
			.then( json => {
				if(json._error) throw new Error(json._error); 
				window.location.href = '/';
			})

	}


	render() {
		return (
			<Container fluid>
			<Row>
				<Col>
					<p>Logging out</p>
					<Loading loading={true } />
				</Col>
			</Row>
			</Container>
		);
	}
}
