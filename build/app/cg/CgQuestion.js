import React from 'react';
import PropTypes from 'prop-types';

import { FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';
import { ListGroup, ListGroupItem } from 'react-bootstrap';


export default class CgQuestion extends React.Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
	}

	focus() {
		this.textInput.focus();
	}

	// Basic questions validate so that nulls are allowed, along with integers.  But, nothing else.
	handleChange(e) {
		let i = e.target.value === null ? null : parseInt(e.target.value, 10);
		this.props.onChange(this.props.item, i);
	}

	/*
	getValidationState(){
		if(this.props.item.user_answer == null) {
			return 'warning';
		} else if(this.props.item.user_answer.length > 2 ) {
			return 'error';
		} else if(this.props.item.user_answer.length == 1) {
			return 'success';
		}
		return null;
	}
	*/

	render() {
		let item = this.props.item;
		let style = item.correct ? 'success' : 'danger';
		//controlId={id}

		// readonly version
		if(this.props.readOnly) {
			if(item.user_answer ) {
				
				return (
					<ListGroup> 
						{this.props.item.text }: 
						<ListGroupItem bsStyle={style}>{ this.props.item.user_answer }</ListGroupItem>
					</ListGroup>
				);
			}

		}

		// Editable version
		//validationState={this.getValidationState()}
		return (
			<FormGroup >
				<ControlLabel>
					{ this.props.item.text }
				</ControlLabel>
				<FormControl 
					type='text' 
					onChange={ this.handleChange }
					value={ this.props.item.user_answer || '' }
					/>
				<FormControl.Feedback />
				<HelpBlock>Input a number</HelpBlock>
			</FormGroup>
		);
	}
}
CgQuestion.propTypes = {
	item: PropTypes.object.isRequired,
//	focus: PropTypes.bool.isRequired,
	readOnly: PropTypes.bool.isRequired,
	onChange: PropTypes.func
};

/*

					ref={ input => this.textInput = input }
				
				{ this.props.question.user_answer_correct() === null 
					? <div>Not answered</div> 
					: '' } 
				{ this.props.question.user_answer_correct() === false 
					? <div>Sorry, but { this.props.question.user_answer } is incorrect</div> 
					: '' } 
				{ this.props.question.user_answer_correct() === true 
					? <div>Correct!</div> 
					: '' }

*/