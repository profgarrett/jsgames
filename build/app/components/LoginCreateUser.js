/*       */
import React from 'react';
import PropTypes from 'prop-types';
import { Form, Row, Col, Button } from 'react-bootstrap';

                                  


                  
                   
                                                         
  

                  
                    
                  
                     
  


export default class LoginCreateUser extends React.Component                       { 
	
	constructor(props     ) {
		super(props);
		this.state = { 
			validated: false,
			username: '',
			section_code: '',
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

		this.props.submit( this.state.username, this.state.section_code );
	}	


	onChange(e                                   ) {
		const { name, value } = e.target;
		this.setState({ [name]: value });
	}


	render()       {
		

		return (
			<div>
				<Form 
					noValidate
					validated={this.state.validated}
					onSubmit={this.submitForm}
					>
						<Form.Group>
						<Form.Label>Email</Form.Label>
						<Form.Control 
							name='username'
							onChange={this.onChange}
							value={this.state.username }
							type='text'
							placeholder='Input your email'
						/>
					</Form.Group>
					<Form.Group>
						<Form.Label>Course code</Form.Label>
						<Form.Control 
							name='section_code'
							value={this.state.section_code }
							onChange={this.onChange}
							placeholder='Optional, use to join a class'
						/>
					</Form.Group>
					<Form.Group>
						<Button size='sm' type='submit' variant='secondary' disabled={this.props.disabled}>Create</Button
							> or <Button 
							size='sm' type='submit' variant='light' disabled={this.props.disabled}
							>Login as anonymous user</Button>
					</Form.Group>
				</Form>
			</div>

		);
	}
}
LoginCreateUser.contextTypes = {
	router: PropTypes.object.isRequired
};