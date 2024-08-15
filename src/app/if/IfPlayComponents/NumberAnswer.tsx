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

/*
interface StateType {
	number: number|null;
}
*/
const ID = 'NumberAnswerFieldInput';

/**
	A page shows an input for a number answer.
*/
export default class NumberAnswer extends React.Component<PropsType> {

	/*
	constructor(props) {
		super(props);
		this.state = { number: props.page.client === null ? '' : props.page.client };
	}
*/

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

	// Validate input
	clean = ( s: string ) => {
		const result = parseInt(s.replace(/\D/g, ''), 10);
		console.log(s);
		console.log(result);
		if(Number.isNaN(result) || result == null) {
			this.props.onChange({ client: '' });
		} else {
			this.props.onChange({ client: result });
		}
	}

	// Build out the table 
	// Doesn't need to actually return anything, as the description will be shown 
	// by the containing object.
	render = (): React.ReactElement => {
		const s = this.props.page.client ? this.props.page.client + '' : '';

		if(!this.props.editable) {
			return (
				<div>{ s }</div>
			);
		}

		return (
			<div>
				<FormControl 
					id={ID}
					type='input'
					autoComplete='off'
					value={ s }
					readOnly={ this.props.readonly }
					placeholder='Type a number in the box'
					onChange={ (e) => this.clean( e.target.value) }
				/>
			</div>
			);

	}
}
