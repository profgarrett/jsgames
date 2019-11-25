// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Form, Row, Col, Button } from 'react-bootstrap';

import type { Node } from 'react';


type PropsType = {
	disabled: boolean,
	submit: (username: string, section_code: string) => void
};

type StateType = {
	validated: boolean,
	username: string,
	section_code: string
};


export default class LoginCreateUser extends React.Component<PropsType, StateType> { 
	
	constructor(props: any) {
		super(props);
		this.state = { 
			validated: false,
			username: '',
			section_code: '',
		};

		(this: any).submitForm = this.submitForm.bind(this);
		(this: any).onChange = this.onChange.bind(this);
	}


	submitForm(e: SyntheticEvent<HTMLButtonElement>) {
		e.preventDefault();
		const form = e.currentTarget;

		if(!form.checkValidity()) {
			this.setState({ validated: true });
			return;
		}

		this.props.submit( this.state.username, this.state.section_code );
	}	


	onChange(e: SyntheticEvent<HTMLButtonElement>) {
		// $FlowFixMe
		const { name, value } = e.target;
		this.setState({ [name]: value });
	}


	render(): Node {
		

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