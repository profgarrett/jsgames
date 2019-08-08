/*       */
import React from 'react';
import PropTypes from 'prop-types';
import { Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';


                                  

                  
                   
                                                     
  

                  
                    
                  
                 
  


export default class LoginCurrentUser extends React.Component                       { 
	
	constructor(props     ) {
		super(props);
		this.state = { 
			validated: false,
			username: '',
			password: ''
		};
		(this     ).submitForm = this.submitForm.bind(this);
		(this     ).onChange = this.onChange.bind(this);
	}


	onChange(e                                   ) {
		const { name, value } = e.target;
		this.setState({ [name]: value });
	}


	submitForm(e                                   ) {
		e.preventDefault();
		const form = e.currentTarget;

		if(!form.checkValidity()) {
			this.setState({ validated: true });
			return;
		}

		this.props.submit( this.state.username, this.state.password );
	}


	render()       {
		const validated = this.state.validated;

		return (
			<div>
				<Form 
					noValidate
					validated={validated}
					onSubmit={this.submitForm}
				>
				<Form.Group>
				<Form.Label >Email address</Form.Label>
					<Form.Control 
						name='username'
						onChange={this.onChange}
						value={this.state.username }
						type='text'
						placeholder='Type in your user name'
						required
					/>
				</Form.Group>
				<Form.Group>
				<Form.Label>Password</Form.Label>
					<Form.Control 
						type='password'
						name='password'
						required
						value={this.state.password }
						onChange={this.onChange}
						placeholder='Type in your password'
					/>
				</Form.Group>
				<Form.Group>
					<Button type='submit' variant='primary' disabled={this.props.disabled}>Login</Button>
					<span style={{ marginLeft: 10}}><Link to='/password'>reset your password</Link></span>
				</Form.Group>
				</Form>
			</div>
		);
	}
}
LoginCurrentUser.contextTypes = {
	router: PropTypes.object.isRequired
};
