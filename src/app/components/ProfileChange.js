/* @flow */
import React from 'react';
import PropTypes from 'prop-types';
import { Form, Alert, Button, Col, Row } from 'react-bootstrap';

import 'url-search-params-polyfill';

import type { Node } from 'react';

type PropsType = {
	disabled: boolean,
	submit: (string) => void
};

type StateType = {
	message: string, // use for messages about picking a good password.
	showPassword: boolean,
	password: string,
	validated: boolean
};


export class ProfileChange extends React.Component<PropsType, StateType> { 
	
	constructor(props: any) {
		super(props);
		this.state = { 
			message: '',
			password: '',
			showPassword: true,
			validated: false
		};
		(this: any).submitForm = this.submitForm.bind(this);
		(this: any).onChange = this.onChange.bind(this);
		(this: any).onChecked = this.onChecked.bind(this);
	}


	submitForm(e: SyntheticEvent<HTMLButtonElement>) {
		e.preventDefault();
		const form = e.currentTarget;

		if(!form.checkValidity()) {
			this.setState({ validated: true });
			return;
		}

		this.props.submit( this.state.password );
	}

	onChange(e: SyntheticEvent<HTMLButtonElement>) {
		// $FlowFixMe
		const { name, value } = e.target;
		this.setState({ [name]: value });
	}

	onChecked(e: any) {
		this.setState({ showPassword: e.target.checked})
	}


	render(): Node {
		const validated = this.state.validated;
		const message = this.state.message === '' 
			? null
			: <Alert variant='info'>{ this.state.message }</Alert>;

		const input = !this.state.showPassword
			? <Form.Control 
					name='password'
					style={{ width: '300px' }}
					onChange={this.onChange}
					value={this.state.password }
					type='password'
					placeholder='Type in a new password'
					required
				/>
			: <Form.Control 
					name='password'
					style={{ width: '300px' }}
					onChange={this.onChange}
					value={this.state.password }
					type='text'
					placeholder='Type in a new password'
					required
				/>
			

		return (
			<div>
				<h5>Set your password</h5>
				<p>It must be at least eight characters long.</p>

				<Form 
					noValidate
					validated={validated}
					onSubmit={this.submitForm}
					>
					<Form.Group>
						{input }
						<Form.Group controlId="formShowPassword">
							<Form.Check type="checkbox" label="Show password" onChange={this.onChecked} name='showPassword' checked={this.state.showPassword} />
						</Form.Group>
					</Form.Group>
					{ message }
					<Form.Group>
						<Button type='submit' variant='primary' disabled={this.props.disabled}>Update</Button>
					</Form.Group>
				</Form>

				<div>{ message }</div>
			</div>
		);
	}
}
