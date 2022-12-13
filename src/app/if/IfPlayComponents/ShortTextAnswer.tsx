import React from 'react';
import { FormControl } from 'react-bootstrap';

import { IfPageShortTextAnswerSchema, IfPageNumberAnswerSchema } from '../../../shared/IfPageSchemas';
import type { IStringIndexJsonObject } from '../../components/Misc';

interface PropsType  {
	page: IfPageShortTextAnswerSchema | IfPageNumberAnswerSchema;
	editable: boolean;
	readonly: boolean;
	show_solution?: boolean;
	onChange: (json: IStringIndexJsonObject) => void;
	onSubmit: Function;
}

const ID = 'ShortTextAnswerFieldInput';

/**
	A page shows an input for a number answer.
*/
export default class ShortTextAnswer extends React.Component<PropsType> {

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


		/*
	handleSubmit(event: any): any {
		if(event.key === 'Enter' ) {
			this.props.handleSubmit(document.getElementById(ID).text);
		}
		event.preventDefault(); // cancel any keypress.
	}
		*/
	

	// Build out the table 
	// Doesn't need to actually return anything, as the description will be shown 
	// by the containing object.
	render = (): React.ReactElement => {
		const value = this.props.page.client === null ? '' : this.props.page.client;

		if(!this.props.editable) {
			if(typeof this.props.show_solution != 'undefined' && this.props.show_solution === true && typeof this.props.page.solution != 'undefined') {
				return (<div>{ value } (correct value is {this.props.page.solution})</div>);				 
			} else {
				return (<div>{ value }</div>);
			}
		}

		return (
			<div>
				<FormControl 
					id={ID}
					type='text'
					autoComplete='off'
					value={ value }
					readOnly={ this.props.readonly }
					placeholder='Type your answer here'
					onChange={ (e) => this.props.onChange({ client: e.target.value}) }
				/>
			</div>
			);

	}
}
