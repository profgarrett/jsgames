import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';


interface PropsType {
	disabled: boolean,
	submit: (username: string, password: string) => void
}

interface StateType {
	validated: boolean,
	username: string,
	password: string
}


export default class LoginCurrentUser extends React.Component<PropsType, StateType> { 
	
	constructor(props: any) {
		super(props);
		this.state = { 
			validated: false,
			username: '',
			password: ''
		};
		//(this: any).submitForm = this.submitForm.bind(this);
		//(this: any).onChange = this.onChange.bind(this);
	}


	onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const { name, value } = e.target;
		// @ts-ignore
		this.setState({ [name]: value });
	}

	submitForm = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.currentTarget;

		if(!form.checkValidity()) {
			this.setState({ validated: true });
			return;
		}

		this.props.submit( this.state.username, this.state.password );
	}


	render() {
		const validated = this.state.validated;

		return (
			<div>
				<Form 
					noValidate
					validated={validated}
					onSubmit={this.submitForm}
				>
				<Form.Group className='mb-3'>
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
				<Form.Group className='mb-3'>
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
					<Button type='submit' variant='primary' disabled={this.props.disabled}>Login</Button>
					<span style={{ marginLeft: 10}}><Link to='/password'>reset your password</Link></span>
			</Form>
			</div>
		);
	}
}