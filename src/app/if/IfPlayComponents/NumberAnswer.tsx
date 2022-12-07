import React from 'react';
import { FormControl } from 'react-bootstrap';

import { IfPageNumberAnswerSchema } from '../../../shared/IfPageSchemas';

interface PropsType {
	page: IfPageNumberAnswerSchema;
	editable: boolean;
	readonly: boolean;
	handleChange: (Object) => void;
	handleSubmit: (any) => void;
}

const ID = 'NumberAnswerFieldInput';

/**
	A page shows an input for a number answer.
*/
export default class NumberAnswer extends React.Component<PropsType> {

	componentDidMount = () => {
		// If there is an input field, then set its focus.
		if(this.props.editable) {
			let node = document.getElementById(ID);
			if(node) node.focus();
		}
	}
	componentDidUpdate = () => {
		if(this.props.editable) {
			let node = document.getElementById(ID);
			if(node) node.focus();
		}	
	}


	handleSubmit = (event: any): any => {
		/*
		if(event.key === 'Enter' ) {
			this.props.handleSubmit(document.getElementById(ID).text);
		}
		event.preventDefault(); // cancel any keypress.
		*/
	}
	

	// Build out the table 
	// Doesn't need to actually return anything, as the description will be shown 
	// by the containing object.
	render = (): React.ReactElement => {
		const value = this.props.page.client === null ? '' : this.props.page.client;
		
		return (
			<div>
				<FormControl 
					id={ID}
					type='text'
					autoComplete='off'
					value={ value }
					readOnly={ this.props.readonly }
					placeholder='Type a number'
					onChange={ (e) => this.props.handleChange({ client: e.target.value}) }
				/>
			</div>
			);

	}
}
