import React, { ReactElement } from 'react';
import { Table, FormControl, Card, Accordion, Button, Tabs, Tab, Row, Col, Nav, Alert } from 'react-bootstrap';

import { IfPageSqlSchema } from '../../../shared/IfPageSchemas';

import type { IStringIndexJsonObject } from '../../components/Misc';
import Editor from '@monaco-editor/react';
import { formatDialect, sqlite } from 'sql-formatter';
import { debug } from 'webpack';




const USE_MONACO_NICE_EDITOR = true;

const ID = 'SqlAnswerFieldInput';
interface PropsType  {
	page: IfPageSqlSchema;
	editable: boolean;
	readonly: boolean;
	show_solution?: boolean;
	onChange: (json: IStringIndexJsonObject) => void;
	onSubmit: () => void;
	onValidate: () => void;
}

interface StateType {
	client_sql: string;
}
/**
	A page shows an input for a number answer.
*/
export default class SqlQuery extends React.Component<PropsType, StateType> {

	constructor(props: PropsType) {
		super(props);

		// Save local state of the SQL code.
		// Useful in making sure that we don't run duplicate updates, which happens
		// as Monaco is refreshed with the code formatter.
		this.state = {
			client_sql: this.props.page.client_sql,
		};
	}

	_render_tables = (): React.ReactElement => {
		const p = this.props.page;

		let solution = this.__render_table('sol', 'Solution', p.solution_results_titles, p.solution_results_formats, p.solution_results_rows );


		let items: any[] = [];

		let t;
		
		if(p.t1_name !== null && p.t1_name.length > 0) {
			t = this.__render_table('t1', p.t1_name, p.t1_titles, p.t1_formats, p.t1_rows );
			items.push(<Accordion.Item eventKey='t1' key='sqlqueryt1'>
				<Accordion.Header>{ 'Table: '+p.t1_name }</Accordion.Header>
				<Accordion.Body>{ t }</Accordion.Body> 
				</Accordion.Item>)
		}

		if(p.t2_name !== null && p.t2_name.length > 0) {
			t = this.__render_table('t2', p.t2_name, p.t2_titles, p.t2_formats, p.t2_rows );
			items.push(<Accordion.Item eventKey='t2' key='sqlqueryt2'>
			<Accordion.Header>{ 'Table: '+p.t2_name }</Accordion.Header>
			<Accordion.Body>{ t }</Accordion.Body> 
			</Accordion.Item>)
		}

		if(p.t3_name !== null && p.t3_name.length > 0) {
			t = this.__render_table('t3', p.t3_name, p.t3_titles, p.t3_formats, p.t3_rows );
			items.push(<Accordion.Item eventKey='t3' key='sqlqueryt3'>
			<Accordion.Header>{ 'Table: '+p.t3_name }</Accordion.Header>
			<Accordion.Body>{ t }</Accordion.Body> 
			</Accordion.Item>)
		}

		if(p.solution_results_visible) {
			items.push(<Accordion.Item eventKey='solution' key='sqlquerysolution'>
				<Accordion.Header>{ 'Solution' }</Accordion.Header>
				<Accordion.Body>{ solution }</Accordion.Body> 
			</Accordion.Item>)
		}

		// Add defaultActiveKey="t1" to show on load
		return <Accordion  >{ items }</Accordion>;
	}

	__render_table = (id:string, name: string, column_titles: string[], column_formats: string[], rows: any[]): React.ReactElement => {
		const p = this.props.page;
		let fixed_column_formats: string[] = column_formats.length > 0 
			? column_formats.map( s_or_i => '' + s_or_i )  
			: p.get_column_formats_based_on_title(column_titles);

		if(fixed_column_formats.length !== column_titles.length) {
			throw new Error('renderTable not found matching length in SqlQuery');
		}

		// Column headers
		let th = column_titles.map( (s,i) => <th style={{ textAlign: 'center' }} key={'sqlquery_'+id+'th'+i}>{ s }</th>);

		// Define function to take in data and return tds
		let ftr = (row_data: string[], id: string): ReactElement[] => 
				row_data.map( 
					(data_in_td: string, i: number): ReactElement => 
						this.__render_table_td(fixed_column_formats, id, data_in_td, i) );

		// Translate each data row into a tr
		let trs = rows.map( (row_data: string[], i: number) => 
				<tr key={'sqlquery'+id+'row'+i}>{ ftr(row_data, id+'sqlqueryrow'+i) }</tr> );

		return (<div id={'sqlquery_table_'+id} style={{ overflow: 'auto', height: '200px' }}>
			<Table striped bordered hover>
				<thead><tr>{ th }</tr></thead>
				<tbody>{ trs }</tbody>
			</Table>
		</div>);
	}

	// Return a formatted value.
	__render_table_td = (column_formats: string[], key: string, value: string | number, index: number): ReactElement => {
		let format = column_formats[index];
		let formatted_value = <span>{ value }</span>;
		let leftAlign = false;

		if(value === null) {
			// If null, override all styles.
			return <td style={{ textAlign: 'center'}} key={'sqlquery'+key+'td'+index}><i>null</i></td>;

		} else if(format === 'text') {
			leftAlign = true;
		} else if(format === '0') {
			if(typeof value === 'number') {
				// Add rounding
				formatted_value = <span>{ value.toFixed(2) }</span>;
			} else {
				formatted_value = <span>{ value }</span>;
			}
		} else if(format === 'pk') {
			formatted_value = <b>{value}</b>;
		} else if(format === 'fk') {
			formatted_value = <i>{value}</i>;
		} else if(format === '$') {
			formatted_value = <span>{'$' + value}</span>;
		} else {
			throw new Error("Unable to display SqlQuery.render_table_td format "+format);
		}

		if(leftAlign) {
			// Text
			return <td style={{ textAlign: 'left'}} key={'sqlquery'+key+'td'+index}>{ formatted_value }</td>;
		} else {
			// Some kind of number
			return <td style={{ textAlign: 'right' }} key={'sqlquery'+key+'td'+index}>{ formatted_value }</td>;
		}
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
		const formats = p.client_results_titles === null 
				? []
				: p.get_column_formats_based_on_title(p.client_results_titles);
		const titles = p.client_results_titles === null ? [] : p.client_results_titles;
		const rows = p.client_results_rows === null ? [] : p.client_results_rows;

		// Normal results
		return <div>
			{this.__render_table('client', 'Query Result', titles, formats, rows) }
			</div>;
	} 

	// Return a properly formatted SQL string.
	_format(s?: string): string {
		let formatted: string = '';

		if(typeof s === 'undefined') return '';

		try {
			formatted = formatDialect(s, {
				dialect: sqlite,
				tabWidth: 2,
				keywordCase: 'upper'
			});
		} catch (e: any) {
			// If any error parsing, then revert to the starting string.
			return s;
		}

		// Override, making sure that ON starts on a newline with two spaces.
		// to the prior line's input.
		const formatted_with_on_newline = formatted.replaceAll(/ON /g, '\n  ON ');

		return formatted_with_on_newline;
	}


	componentWillUnmount(): void {
		// @ts-ignore
		this.unregisterCompletionItemProvider && this.unregisterCompletionItemProvider.dispose();
	}
	
	editorDidMount = (page: IfPageSqlSchema, editor: any, monaco: any, focus: boolean) => {
		if(focus) editor.focus()

		// Build a list of items
		const item_names = [ ...page.get_all_table_names(), ...page.get_all_column_names() ];
		const get_lookups = (range) => item_names.map( (name) => {
			return {
				label: name,
				kind: monaco.languages.CompletionItemKind.Function,
				documentation: 'A table or field in the problem',
				insertText: name,
				range: range,
			} 
		});


		// register a completion item provider 
		// code idea / structure from https://github.com/microsoft/monaco-editor/issues/2518
		const unreg = monaco.languages.registerCompletionItemProvider('sql', {
				triggerCharacters : [],
				provideCompletionItems: function(model, position) {
					// find out if we are completing a property in the 'dependencies' object.
					//var textUntilPosition = model.getValueInRange({startLineNumber: 1, startColumn: 1, endLineNumber: position.lineNumber, endColumn: position.column});
					//var match = textUntilPosition.match(/"dependencies"\s*:\s*\{\s*("[^"]*"\s*:\s*"[^"]*"\s*,\s*)*([^"]*)?$/);
					//if (!match) {
					//	return []
					//}
					var word = model.getWordUntilPosition(position);
					var range = {
						startLineNumber: position.lineNumber,
						endLineNumber: position.lineNumber,
						startColumn: word.startColumn,
						endColumn: word.endColumn
					};
					
					return {
						suggestions: get_lookups(range)
					};
					
				}
			});

		// Save references to tear down editor and provider.
		// @ts-ignore
		this.unregisterCompletionItemProvider = unreg;
		// @ts-ignore
		this.editor = editor;
	}

	onKeyDown(keyName, e, handle): void {
		console.log("test:onKeyDown", keyName, e, handle)
		if(keyName === 'alt g') {
			this._onSubmit(true)
		}
	}

	/**
	 * Submit tracks to make sure that duplicate submissions don't happen
	 * Generally dups are a result of this function formatting the client_sql string,
	 * and updating the Monaco editor.
	 */ 
	_onChange(client_sql?: string) {
		// Don't  in here if the formatted value of the update string
		// matches the currently-set string.
		if(typeof client_sql === 'undefined') return;

		if(this.state.client_sql === client_sql) return;

		this.props.onChange({ client_sql: client_sql });
	}

	/**
	 * Update the format of client_sql and submit to the server.
	 * Note: there is a weird bug in this code. The onChange event
	 * triggered with the formatted code won't be present when
	 * sending it to the server.
	 * 
	 * However, this is available for updating the editor.
	 * Somehow, props.onChange happens between the onSubmit and setValue.
	 * Doens't break anything, but does mean that we'll be saving unformatted code
	 * as a last step.
	 */
	_onSubmit(validate_only: boolean = false) {
		const formatted = this._format(this.props.page.client_sql);
		
		// Update the state. This will keep onChange from 
		// triggering a second time while we update the screen.
		this.setState( (state, props) => { return { client_sql: formatted }; }, 
			() => {
				// update the editor window with the formatted value.
				// @ts-ignore
				this.editor.setValue(formatted);

				// Now that we've updated the state, trigger the update
				// and screen refresh
				this.props.onChange({ client_sql: formatted });
				
				if(validate_only) {
					this.props.onValidate();
				} else {
					this.props.onSubmit();
				}
			});

	}
	
	// Build out the table 
	render = (): React.ReactElement => {
		const page = this.props.page;
		const value = this.props.page.client_sql === null ? '' : this.props.page.client_sql;

		if(this.props.page.solution_results_rows.length === 0) {
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
		const focus = false; // this.props.editable && !this.props.readonly;

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
							renderLineHighlight: "none",
						}
					}
					defaultValue={ value } 
					onChange={ (value, event) => this._onChange(value) }
					onMount={ (editor, monaco) => this.editorDidMount(page, editor, monaco, focus) }					
					/>
			: 
			<FormControl 
					id={ID}
					type='text'
					autoComplete='off'
					value={ value }
					readOnly={ this.props.readonly }
					placeholder='Type your answer here'
					onChange={ (e) => this.props.onChange({ client_sql: this._format(e.target.value) }) }
				/>;


		const results = this._render_client_result();
		const button = <Button variant='outline-primary' onClick={ (e) => this._onSubmit(true) }>Refresh query results</Button>;
		const feedback = this._render_client_feedback();

		return (
			<div>
				<div style={{ marginTop: '20px', marginBottom: '20px'}}>
					{ tables }
				</div> 
				<Row>
					<Col sm="6">
						<Card style={ {height: '340px' }}>
							<Card.Header>Query Window</Card.Header>
							<Card.Body  >
									{ editor }
									{ feedback }
							</Card.Body>
						</Card>
					</Col>
					<Col sm="6">
						<Card style={{ height: '340px' }}>
							<Card.Header>Query Results</Card.Header>
							<Card.Body >
									{ button }
									{ results }
							</Card.Body>
						</Card>
					</Col>
				</Row>
				<i>Use <kbd>ctrl+m</kbd> (windows) or <kbd>ctrl+shift+m</kbd> (mac) to exit query window</i>
			</div>
			);

	}
}
