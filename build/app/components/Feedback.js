//      
import React from 'react';
import { FormControl, FormGroup, Button } from 'react-bootstrap';

                                  

                  
              
             
  

                  
                 
                     
                  
  

export default class Login extends React.Component                       { 
	constructor(props           ) {
		super(props);

		this.state = {
			message: '',
			submitting: false,
			expanded: false
		};

		(this     ).onMessageChange = this.onMessageChange.bind(this);
		(this     ).onSubmit = this.onSubmit.bind(this);
	}

	// Log into the server.
	onSubmit(e                                    ) {
		if(e) e.preventDefault();

		// Send
		this.setState({ 
			submitting: true,
		});

		// Fire AJAX.
		fetch('/api/feedback/', {
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
				this.setState({ submitting: false, message: '', expanded: false });
			})
			.catch( error => {
				console.log(error);
			});
	}
//					onChange={ (e) => this.props.handleChange({ client_f: e.target.value}) }

	onMessageChange(s        ) {
		this.setState({ message: s });
	}

	render()       {
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

		if(this.state.expanded) {
			return (<div style={expandedStyle}>
						<div style={{ fontSize: 24, marginBottom: 10 }}>
							Have a problem or input?</div>
						<form name='feedbackform' onSubmit={this.onSubmit} >
							<FormGroup style={{ marginBottom: 0}}>
								<FormControl 
									id='feedback'
									onChange={ e => this.onMessageChange( e.target.value ) }
									value={this.state.message }
									componentClass='textarea'
									style={{ height: 100 }}
									placeholder='Type in your feedback'
								/>
								<div style={{ textAlign: 'right', marginTop: 10 }}>
									<Button type='submit' 
										bsStyle='primary'
										disabled={this.state.submitting}
										>
										Submit</Button>
								</div>
							</FormGroup>

						</form>
					</div>
				);
		} else {
			return (<div 
						style={contractedStyle} 
						onClick={ ()       => this.setState({'expanded': true}) } 
						>
						Feedback
					</div>
				);
		}
	}
}