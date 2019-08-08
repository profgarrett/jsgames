/*       */
import React from 'react';
import PropTypes from 'prop-types';
import { Form, Alert, Button } from 'react-bootstrap';

                                  

                  
                          
                  
                  
  

                  
                 
                      
                    
                  
                   
  


export default class PasswordRequest extends React.Component                       { 
	
	constructor(props     ) {
		super(props);
		this.state = { 
			message: '',
			messageStyle: '',
			isLoading: false,
			username: this.props.username,
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

		this.props.submit(this.state.username );
	}

	onChange(e                                   ) {
		const { name, value } = e.target;
		this.setState({ [name]: value });
	}


	render()       {
		const validated = this.state.validated;
		const message = this.state.message === '' 
			? null
			: <Alert variant={this.state.messageStyle}>{ this.state.message }</Alert>;

		return (
			<div>
				<h5>Reset Password</h5>
				<p>This form will send you an email with a reset link.</p>

				<Form 
					noValidate
					validated={validated}
					onSubmit={this.submitForm}
					>
					<Form.Group  >
						<Form.Label >Email Address</Form.Label>
						<Form.Control 
							name='username'
							onChange={this.onChange}
							value={this.state.username }
							type='text'
							placeholder='Type in your email'
							required
						/>
					</Form.Group>
					<Form.Group>
							<Button type='submit' variant='primary' disabled={this.props.disabled }>Submit</Button>
					</Form.Group>
				</Form>

				<div>{ message }</div>
			</div>
		);
	}
}
PasswordRequest.contextTypes = {
	router: PropTypes.object.isRequired
};
