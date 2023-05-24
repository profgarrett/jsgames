import React, { ReactElement } from 'react';
import { Table, FormControl, Card, Accordion, Button, Tabs, Tab, Row, Col, Nav, Alert } from 'react-bootstrap';

import { IfPageSqlSchema } from '../../../shared/IfPageSchemas';

import type { IStringIndexJsonObject } from '../../components/Misc';
import Editor from '@monaco-editor/react';

const USE_MONACO_NICE_EDITOR = true;

const ID = 'SqlAnswerFieldInput';
interface PropsType  {
	page: IfPageSqlSchema;
	editable: boolean;
	readonly: boolean;
	show_solution?: boolean;
	onChange: (json: IStringIndexJsonObject) => void;
	onSubmit: Function;
}

/**
	A page shows an input for a number answer.
*/
export default class SqlQuery extends React.Component<PropsType> {

	_render_tables = (): React.ReactElement => {
		const p = this.props.page;

		let t1 = this.__render_table('t1', p.t1_name, p.t1_titles, p.t1_formats, p.t1_rows );
		let solution = this.__render_table('sol', 'Solution', p.solution_results_titles, p.solution_results_formats, p.solution_results_rows );


		let items: any[] = [];

		items.push(<Accordion.Item eventKey='t1'>
			<Accordion.Header>{ 'Table: '+p.t1_name }</Accordion.Header>
			<Accordion.Body>{ t1 }</Accordion.Body> 
			</Accordion.Item>)
		
		if(p.solution_results_visible) {
			items.push(<Accordion.Item eventKey='solution'>
				<Accordion.Header>{ 'Solution' }</Accordion.Header>
				<Accordion.Body>{ solution }</Accordion.Body> 
			</Accordion.Item>)
		}

		// Add defaultActiveKey="t1" to show on load
		return <Accordion  >{ items }</Accordion>;
	}

	__render_table = (id:string, name: string, column_titles: string[], column_formats: string[], rows: any[]): React.ReactElement => {
		let th = column_titles.map( (s,i) => <th key={'sqlquery_'+id+'th'+i}>{ s }</th>);
		let ftr = (s, sub_id) => s.map( (ss,i) => <td key={'sqlquery'+sub_id+'td'+i}>{ss}</td> );
		let trs = rows.map( (r, i) => <tr key={'sqlquery'+id+'row'+i}>{ ftr(r, id+'sqlqueryrow'+i) }</tr> );

		return (<div id={'sqlquery_table_'+id} style={{ overflow: 'auto', height: '200px' }}>
			<Table striped bordered hover>
				<thead><tr>{ th }</tr></thead>
				<tbody>{ trs }</tbody>
			</Table>
		</div>);
	}

	_render_client_feedback = (): null|ReactElement => {
		const p = this.props.page;

		if(p.client_feedback !== null && p.client_feedback.length > 0) {
			return <Alert variant='warning'>{ this.props.page.client_feedback.join('. ') }</Alert>;
		} else if(p.correct === true) {
			return <Alert variant='success'>Correct answer!</Alert>;
		} else if(p.correct === false) {
			return <Alert variant='dark'>Answer does not match solution</Alert>;
		} else if(p.correct === null) {
			return null;
		} else {
			throw new Error('Invalid state for render_client_results on SqlQuery');
		}

	}
	_render_client_result = (): ReactElement => {
		const p = this.props.page;
		const formats = p.get_client_formats_based_on_title();
		const titles = p.client_results_titles === null ? [] : p.client_results_titles;
		const rows = p.client_results_rows === null ? [] : p.client_results_rows;

		// Normal results
		return <div>
			{this.__render_table('client', 'Query Result', titles, formats, rows) }
			</div>;
	} 


	// Build out the table 
	render = (): React.ReactElement => {
		const value = this.props.page.client_sql === null ? '' : this.props.page.client_sql;

		if(this.props.page.solution_results_rows.length === 0) {
			console.log(this.props.page);
			throw new Error('Solution results can not be empty for SqlQuery');
		}

		if(!this.props.editable) {
			if(typeof this.props.show_solution != 'undefined' && this.props.show_solution === true && typeof this.props.page.solution_sql != 'undefined') {
				return (<div>{ value } (correct value is {this.props.page.solution_sql})</div>);				 
			} else {
				return (<div>{ value }</div>);
			}
		}

		const tables = this._render_tables();

		const editor = USE_MONACO_NICE_EDITOR ?
			<Editor 
					height="160px" 
					defaultLanguage="sql" 
					options={ 
						{ 
							scrollbar: { 
								vertical: 'visible', 
								verticalHasArrows: true,
								 },
							minimap: { enabled: false},
							lineNumbers: 'off' ,
							cursorBlinking: 'phase',
							folding: false,
							glyphMargin: false,
							lineDecorationsWidth: 0,
							lineNumbersMinChars: 0,
						}
					}
					defaultValue={ value } 
					onChange={ (value, event) => this.props.onChange({ client_sql: value })}
					onMount={ (editor, monaco) => editor.focus() }
					/>
			: 
			<FormControl 
					id={ID}
					type='text'
					autoComplete='off'
					value={ value }
					readOnly={ this.props.readonly }
					placeholder='Type your answer here'
					onChange={ (e) => this.props.onChange({ client_sql: e.target.value}) }
				/>;

		const results = this._render_client_result();
		const button = <Button variant='outline-primary' onClick={ (e) => this.props.onSubmit() }>Refresh query results</Button>;
		const feedback = this._render_client_feedback();

		return (
			<div>
				<div style={{ marginTop: '20px', marginBottom: '20px'}}>
					{ tables }
				</div> 
				<Row>
					<Col sm="6">
						<Card>
							<Card.Header>Query Window</Card.Header>
							<Card.Body>
								<Card.Text style={ {height: '240px' }} >
									{ editor }
									{ feedback }
								</Card.Text>
							</Card.Body>
						</Card>
					</Col>
					<Col sm="6">
						<Card>
							<Card.Header>Query Results</Card.Header>
							<Card.Body>
								<Card.Text style={{ height: '240px' }}>
									{ button }
									{ results }
								</Card.Text>
							</Card.Body>
						</Card>
					</Col>
				</Row>
			</div>
			);

	}
}
