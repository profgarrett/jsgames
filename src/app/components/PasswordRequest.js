/* @flow */
import React from 'react';
import PropTypes from 'prop-types';
import { Form, Alert, Button } from 'react-bootstrap';

import type { Node } from 'react';

type PropsType = {
	submit: (string) => void,
	username: string,
	disabled: boolean
};

type StateType = {
	message: string,
	messageStyle: string,
	isLoading: boolean,
	username: string,
	validated: boolean
};


export default class PasswordRequest extends React.Component<PropsType, StateType> { 
	
	constructor(props: any) {
		super(props);
		this.state = { 
			message: '',
			messageStyle: '',
			isLoading: false,
			username: this.props.username,
			validated: false
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

		this.props.submit(this.state.username );
	}

	onChange(e: SyntheticEvent<HTMLButtonElement>) {
		// $FlowFixMe
		const { name, value } = e.target;
		this.setState({ [name]: value });
	}


	render(): Node {
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
