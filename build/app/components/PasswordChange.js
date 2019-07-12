/*       */
import React from 'react';
import PropTypes from 'prop-types';
import { Form, Alert, Button, Col, Row } from 'react-bootstrap';

import 'url-search-params-polyfill';

                                  

                  
                       
                   
                         
  

                  
                                                                    
                  
                   
  


export default class PasswordChange extends React.Component                       { 
	
	constructor(props     ) {
		super(props);
		this.state = { 
			message: '',
			password: '',
			validated: false
		};
		(this     ).submitForm = this.submitForm.bind(this);
		(this     ).onChange = this.onChange.bind(this);
	}


	submitForm(e                                   ) {
		e.preventDefault();
		const form = e.currentTarget;

		if(!form.checkValidity()) {
			this.setState({ validated: true });
			return;
		}

		this.props.submit( this.state.password );
	}

	onChange(e                                   ) {
		const { name, value } = e.target;
		this.setState({ [name]: value });
	}


	render()       {
		const validated = this.state.validated;
		const message = this.state.message === '' 
			? null
			: <Alert variant='info'>{ this.state.message }</Alert>;

		return (
			<div>
				<h5>Set a new password</h5>
				<p>Your password must be at least eight characters long.</p>

				<Form 
					noValidate
					validated={validated}
					onSubmit={this.submitForm}
					>
					<Form.Group as={Row} >
						<Form.Label column sm='2'>New password</Form.Label>
						<Col sm={10}>
							<Form.Control 
								name='password'
								onChange={this.onChange}
								value={this.state.password }
								type='text'
								placeholder='Type in a new password'
								required
							/>
							{ message }
						</Col>
					</Form.Group>
					<Form.Group as={Row}>
						<Col sm={2}></Col>
						<Col sm={10}>
							<Button type='submit' variant='primary' disabled={this.props.disabled}>Set new password</Button>
						</Col>
					</Form.Group>
				</Form>

				<div>{ message }</div>
			</div>
		);
	}
}
PasswordChange.contextTypes = {
	router: PropTypes.object.isRequired
};
