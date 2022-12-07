import React from 'react';
import { Form, Alert, Button } from 'react-bootstrap';

interface PropsType {
	submit: (string) => void,
	username: string,
	disabled: boolean
}

interface StateType {
	message: string,
	messageStyle: string,
	isLoading: boolean,
	username: string,
	validated: boolean
}


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
	}


	submitForm = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.currentTarget;

		if(!form.checkValidity()) {
			this.setState({ validated: true });
			return;
		}

		this.props.submit(this.state.username );
	}

	onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const { name, value } = e.target;
		// @ts-ignore
		this.setState({ [name]: value });
	}


	render() {
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
					<br/>
					<Form.Group>
							<Button type='submit' variant='primary' disabled={this.props.disabled }>Submit</Button>
					</Form.Group>
				</Form>

				<div>{ message }</div>
			</div>
		);
	}
}
