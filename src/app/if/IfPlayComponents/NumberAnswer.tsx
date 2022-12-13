import React from 'react';
import { FormControl } from 'react-bootstrap';

import { IfPageNumberAnswerSchema } from '../../../shared/IfPageSchemas';

import type { IStringIndexJsonObject } from '../../components/Misc';


interface PropsType {
	page: IfPageNumberAnswerSchema;
	editable: boolean;
	readonly: boolean;
	onChange: (json: IStringIndexJsonObject) => void;
	onSubmit: () => void;
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

	// Build out the table 
	// Doesn't need to actually return anything, as the description will be shown 
	// by the containing object.
	render = (): React.ReactElement => {
		const value = this.props.page.client === null ? '' : this.props.page.client;
		
		if(!this.props.editable) {
			return (
				<div>{ value }</div>
			);
		}

		return (
			<div>
				<FormControl 
					id={ID}
					type='text'
					autoComplete='off'
					value={ value }
					readOnly={ this.props.readonly }
					placeholder='Type a number'
					onChange={ (e) => this.props.onChange({ client: e.target.value}) }
				/>
			</div>
			);

	}
}
