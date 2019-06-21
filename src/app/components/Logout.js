import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, FormControl } from 'react-bootstrap';
import { Message, Loading, get_cookie } from './../components/Misc'



export default class Logout extends React.Component { 
	constructor(props) {
		super(props);

		this.state = { 
			message: 'Logging out',
			isLoading: true
		};

	}

	componentDidMount() {
		const history = this.context.router.history;

		// Test to see if we're actually logged in. 
		if(get_cookie('x-access-token') === null) {
			console.log('not logged in!');
			history.push('/');
			return;
		}

		// Fire AJAX to log out.
		fetch('/api/logout/', {
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
				var that = this;
				if(json._error) throw new Error(json._error); 

				// Success!  Go ahead and log out, redirecting in 1.5s to homepage.
				this.setState({ message: 'Success logging out!', messageStyle: 'success', isLoading: false})
				setTimeout( () => {
					that.context.router.history.push('/');
				}, 1500);

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


	render() {
		return (
			<Row>
				<Col>
					<br/><br/>
					<h3>Logging out</h3>
					<Message message={this.state.message} style={this.state.messageStyle} />
					<Loading loading={this.state.isLoading } />

				</Col>
			</Row>
		);
	}
}

Logout.contextTypes = {
	router: PropTypes.object.isRequired
};
