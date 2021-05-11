// @flow
import React from 'react';
import { Form, Button } from 'react-bootstrap';

import type { Node } from 'react';

type PropsType = {
	data: Object,
	code: string
};

type StateType = {
	error: boolean,
	message: string,
	submitting: boolean,
	expanded: boolean
};

export default class Login extends React.Component<PropsType, StateType> { 
	constructor(props: PropsType) {
		super(props);

		this.state = {
			error: false,
			message: '',
			submitting: false,
			expanded: false
		};

		(this: any).onMessageChange = this.onMessageChange.bind(this);
		(this: any).onSubmit = this.onSubmit.bind(this);
	}

	// Log into the server.
	onSubmit(e: ?SyntheticEvent<HTMLButtonElement>) {
		if(e) e.preventDefault();

		// Send
		this.setState({ 
			submitting: true,
		});

		// Fire AJAX.
		fetch('/api/users/feedback/', {
				method: 'POST',
				credentials: 'include',
				mode: 'same-origin',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ 
						message: this.state.message, 
						data: this.props.data,
						code: this.props.code,
					}
				)
			})
			.then( response => {
				if(response.status === 500) {
					this.setState({ submitting: false, error: true });
				} else {
					this.setState({ submitting: false, message: '', expanded: false });
				}
			})
			.catch( error => {
				this.setState({ submitting: false, error: true });
				console.log(error);
			});
	}
//					onChange={ (e) => this.props.handleChange({ client_f: e.target.value}) }

	onMessageChange(s: string) {
		this.setState({ message: s });
	}

	render(): Node {
		const commonStyle = {
			position: 'fixed',
			backgroundColor: '#f5f5f5',
			border: 'solid 1px #ddd',
			top: 0,
			padding: 15
		};

		const expandedStyle = {
			...commonStyle,
			right: 0,
		};

		const contractedStyle = {
			...commonStyle,
			/*
			'WebkitTransform': 'rotate(-90deg)',
			'MozTransform': 'rotate(-90deg)',
			'msTransform': 'rotate(-90deg)',
			'OTransform': 'rotate(-90deg)',
			transform: 'rotate(-90deg)',
			*/
			margin: 0,
			right: 0,
			cursor: 'pointer'
		};

		const label = !this.state.error 
			? 'Have a problem or input?'
			: 'Error submitting, please email your feedback to profgarrett@gmail.com';

		const button = (!this.state.error)
			? 	<Button 
					type='submit' 
					variant='primary'
					style={{ marginLeft: 10 }}
					disabled={this.state.submitting}
					>
					Submit</Button>
			: 	null;

		const close = <Button
			variant='secondary'
			onClick={ () => this.setState({ expanded: false, message: ''})}
			>Close</Button>

		if(this.state.expanded) {
			return (<div style={expandedStyle}>
						<div style={{ fontSize: 24, marginBottom: 10 }}>{ label }</div>
						<Form name='feedbackform' onSubmit={this.onSubmit} >
							<Form.Group style={{ marginBottom: 0}}>
								<Form.Control 
									id='feedback'
									onChange={ e => this.onMessageChange( e.target.value ) }
									value={this.state.message }
									as="textarea"
									style={{ height: 100 }}
									placeholder='Type in your feedback'
								/>
								<div style={{ textAlign: 'right', marginTop: 10 }}>
									{ close }
									{ button }
								</div>
							</Form.Group>
						</Form>
					</div>
				);
		} else {
			return (<div 
						style={contractedStyle} 
						onClick={ (): void => this.setState({'expanded': true}) } 
						>
						Feedback
					</div>
				);
		}
	}
}