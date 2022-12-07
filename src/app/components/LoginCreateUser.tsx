import React from 'react';
import { Form, Button } from 'react-bootstrap';


interface PropsType {
	disabled: boolean,
	submit: (username: string, section_code: string) => void
}

interface StateType {
	validated: boolean,
	username: string,
	section_code: string
}


export default class LoginCreateUser extends React.Component<PropsType, StateType> { 
	
	constructor(props: any) {
		super(props);
		this.state = { 
			validated: false,
			username: '',
			section_code: '',
		};

		//(this: any).submitForm = this.submitForm.bind(this);
		//(this: any).onChange = this.onChange.bind(this);
	}


	submitForm = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.currentTarget;

		if(!form.checkValidity()) {
			this.setState({ validated: true });
			return;
		}

		this.props.submit( this.state.username, this.state.section_code );
	}	


	onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const { name, value } = e.currentTarget;
		// @ts-ignore
		this.setState({ [name]: value });
	}


	render() {
		

		return (
				<Form 
					noValidate
					validated={this.state.validated}
					onSubmit={this.submitForm}
					>
					<Form.Group className='mb-3'>
						<Form.Label>Email</Form.Label>
						<Form.Control 
							name='username'
							onChange={this.onChange}
							value={this.state.username }
							type='text'
							placeholder='Input your email'
						/>
					</Form.Group>
					<Form.Group className='mb-3'>
						<Form.Label>Course code</Form.Label>
						<Form.Control 
							name='section_code'
							value={this.state.section_code }
							onChange={this.onChange}
							placeholder='Optional, use to join a class'
						/>
					</Form.Group>
					<Button size='sm' type='submit' variant='secondary' disabled={this.props.disabled}>Create</Button> &nbsp; or  &nbsp;<Button 
						size='sm' type='submit' variant='light' disabled={this.props.disabled}
						>Login as anonymous user</Button>
				</Form>

		);
	}
}
