import React from 'react';
import { Form, Alert, Button } from 'react-bootstrap';

//import 'url-search-params-polyfill';

interface PropsType {
	disabled: boolean;
	submit: (string) => void;
}

interface StateType {
	message: string; // use for messages about picking a good password.
	showPassword: boolean;
	password: string;
	validated: boolean;
}


export class ProfileChange extends React.Component<PropsType, StateType> { 
	
	constructor(props: any) {
		super(props);
		this.state = { 
			message: '',
			password: '',
			showPassword: true,
			validated: false
		};
//		(this: any).submitForm = this.submitForm.bind(this);
//		(this: any).onChange = this.onChange.bind(this);
//		(this: any).onChecked = this.onChecked.bind(this);
	}


	submitForm = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.currentTarget;

		if(!form.checkValidity()) {
			this.setState({ validated: true });
			return;
		}

		this.props.submit( this.state.password );
	}

	onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const { name, value } = e.target;
		// @ts-ignore
		this.setState({ [name]: value });
	}

	onChecked(e: any) {
		this.setState({ showPassword: e.target.checked})
	}


	render() {
		const validated = this.state.validated;
		const message = this.state.message === '' 
			? null
			: <Alert variant='info'>{ this.state.message }</Alert>;

		const input = !this.state.showPassword
			? <Form.Control 
					type='password'
					name='password'
					style={{ width: '300px' }}
					onChange={this.onChange}
					value={this.state.password }
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
					<Form.Group className='mb-3'>
						{input }
						<Form.Check type="checkbox" aria-label="Show password" label="Show password" onChange={this.onChecked} name='showPassword' checked={this.state.showPassword} />
					</Form.Group>
					{ message }
					<Form.Group className='mb-3'>
						<Button type='submit' variant='primary' disabled={this.props.disabled}>Update</Button>
					</Form.Group>
				</Form>

				<div>{ message }</div>
			</div>
		);
	}
}
