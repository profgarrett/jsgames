// @flow
import React from 'react';
import { FormControl } from 'react-bootstrap';

import type { Node } from 'react';
import { IfPageShortTextAnswerSchema, IfPageNumberAnswerSchema } from './../../../shared/IfPageSchemas';

type PropsType = {
	page: IfPageShortTextAnswerSchema | IfPageNumberAnswerSchema,
	editable: boolean,
	readonly: boolean,
	handleChange: (Object) => void,
	handleSubmit: (void) => void
};

const ID = 'ShortTextAnswerFieldInput';

/**
	A page shows an input for a number answer.
*/
export default class ShortTextAnswer extends React.Component<PropsType> {
	constructor(props: any) {
		super(props);
		(this: any).state = {};
		(this: any).handleSubmit = this.handleSubmit.bind(this);
	}

	componentDidMount() {
		// If there is an input field, then set its focus.
		if(this.props.editable) {
			let node = document.getElementById(ID);
			if(node) node.focus();
		}
	}
	componentDidUpdate() {
		if(this.props.editable) {
			let node = document.getElementById(ID);
			if(node) node.focus();
		}	
	}


	handleSubmit(event: any): any {
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
	render(): Node {
		const value = this.props.page.client === null ? '' : this.props.page.client;

		return (
			<div>
				<FormControl 
					id={ID}
					type='text'
					autoComplete='off'
					value={ value }
					readOnly={ this.props.readonly }
					placeholder='Type your answer here'
					onChange={ (e) => this.props.handleChange({ client: e.target.value}) }
				/>
			</div>
			);

	}
}
