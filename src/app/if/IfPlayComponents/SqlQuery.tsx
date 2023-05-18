import React from 'react';
import { FormControl } from 'react-bootstrap';

import { IfPageSqlSchema } from '../../../shared/IfPageSchemas';
import type { IStringIndexJsonObject } from '../../components/Misc';
import { debug } from 'webpack';



// Required to let webpack 4 know it needs to copy the wasm file to our assets
//import sqlWasm from "!!file-loader?name=sql-wasm-[contenthash].wasm!sql.js/dist/sql-wasm.wasm";

interface PropsType  {
	page: IfPageSqlSchema;
	editable: boolean;
	readonly: boolean;
	show_solution?: boolean;
	onChange: (json: IStringIndexJsonObject) => void;
	onSubmit: Function;
}

const ID = 'SqlAnswerFieldInput';


/**
	A page shows an input for a number answer.
*/
export default class SqlQuery extends React.Component<PropsType> {

	// If there is an input field, then set its focus.
	componentDidMount = () => {
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
	

	_render_tables = (): React.ReactElement => {
		const p = this.props.page;

		let t1 = this.__render_table('t1', p.t1_name, p.t1_column_titles, p.t1_column_formats, p.t1_rows );

		return <div><h1>Tables</h1>{ t1 }</div>
	}

	__render_table = (id:string, name: string, column_titles: string[], column_formats: string[], rows: any[]): React.ReactElement => {
		let th = column_titles.map( (s,i) => <th key={'sqlquery_'+id+'th'+i}>{ s }</th>);
		let ftr = (s, sub_id) => s.map( (ss,i) => <td key={'sqlquery'+sub_id+'td'+i}>{ss}</td> );
		let trs = rows.map( (r, i) => <tr key={'sqlquery'+id+'row'+i}>{ ftr(r, id+'sqlqueryrow'+i) }</tr> );

		return (<div id={'sqlquery_table_'+id}>
			<h3>{ name }</h3>
			<table><tbody>
				<tr>{ th }</tr>
					{ trs }
			</tbody></table>
		</div>);
	}

	// Build out the table 
	// Doesn't need to actually return anything, as the description will be shown 
	// by the containing object.
	render = (): React.ReactElement => {
		const value = this.props.page.client_sql === null ? '' : this.props.page.client_sql;

		if(!this.props.editable) {
			if(typeof this.props.show_solution != 'undefined' && this.props.show_solution === true && typeof this.props.page.solution != 'undefined') {
				return (<div>{ value } (correct value is {this.props.page.solution})</div>);				 
			} else {
				return (<div>{ value }</div>);
			}
		}

		const tables = this._render_tables();

		//run_query('SELECT * FROM animals', this.props.page);

		return (
			<div>
				{ tables }
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
