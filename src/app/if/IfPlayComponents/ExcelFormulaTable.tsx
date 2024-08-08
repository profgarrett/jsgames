import React, { ReactElement } from 'react';
import { Table, FormControl, Button, Tabs, Tab, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { HtmlSpan, BlueSpan } from './../../components/Misc';
import { IfPageFormulaSchema, IfPagePredictFormulaSchema } from './../../../shared/IfPageSchemas';
import { headerStyle, tdStyle, tdFirstColumnStyle, 
		clean, 
		addDangerColor, addInfoColor, addCorrectColor, addCSSProperty} from './ExcelTableFormatting';

import type { IStringIndexJsonObject } from '../../components/Misc';
import CSS from 'csstype';


type PropsType = {
	page: IfPageFormulaSchema | IfPagePredictFormulaSchema,
	editable: boolean, // 
	readonly: boolean,
	onChange: (json: IStringIndexJsonObject) => void;
	onEnter: () => void;
	onValidate: () => void;
};



export default class FormulaExcelTable extends React.Component<PropsType> {

	// If there is an input field, then set its focus.
	componentDidMount() {
		if(this.props.editable) {
			let node = document.getElementById('ExcelTableRenderFieldInput');
			if(node) node.focus();
		}
	}
	componentDidUpdate() {
		this.componentDidMount();
	}

	/**
	 * Handler function for keypresses on ExcelTableRenderFieldInput
	 * 
	 * If repeating, cancel
	 * Otherwise, submit.
	 */
	 handleKeyDown = (event: any ) => {

		// Make sure that we don't do anything if we're loading.
		if(!this.props.editable || this.props.readonly) return;

		// See if this is a repeating key event, which is automatically fired if the user keeps hitting the key.
		// If so, exit out.
		if(event.repeat) {
			event.preventDefault();
			return;
		}
		// Handle keypresses for advancing tutorial window.
		// Normally, enter will submit the form.  However, if a validate option is 
		// present, and the answer is wrong, we should instead validate.
		if(event.key === 'Enter'
				&& this.props.page.code === 'tutorial' 
				&& !this.props.page.correct_required 
				&& !this.props.page.correct  
				&& 
					(this.props.page.type === 'IfPageFormulaSchema'
					|| this.props.page.type === 'IfPagePredictFormulaSchema')) {
			event.preventDefault(); // cancel any keypress.
			this.props.onValidate();
		}

		if(event.key == 'Enter') {
			this.props.onEnter();
		}

	}

	// Build out the input box.
	_render_field = (page: IfPageFormulaSchema): ReactElement => {
		const helpblockStyle = {
			color: 'white',
			marginBottom: 5,
			paddingLeft: 5
		};
		let helpblock = page.helpblock ? <div style={helpblockStyle}><HtmlSpan html={ page.helpblock } /></div> : '';
	
		return (
			<div>
				<FormControl 
					id='ExcelTableRenderFieldInput'
					type='text'
					autoComplete='off'
					value={ page.client_f==null ? '' : page.client_f }
					disabled={ this.props.readonly || !this.props.editable }
					onKeyDown={ (e) => this.handleKeyDown(e) }
					placeholder='Enter a formula'
					onChange={ (e) => this.props.onChange({ client_f: e.target.value}) }
				/>
				{ helpblock }		
			</div>
			);
	}


	// Build out the table 
	render = (): ReactElement => {
		const page = this.props.page;
		// Set columns to [null] for cases where we don't have any tests.
		// Need to have something for the for loop, but null won't be displayed.
		if(page.tests.length === 0) throw new Error('Invalid length of tests for '+page.code);

		const tests = page.tests;
		const columns =  Object.keys(page.tests[0]);

		// Helper function to increment the a1, b2, ... references to a2, b2.
		const increment_row = 
				(formula, row_i) => 
					columns.reduce( (accum, c) => 
						accum.replace( new RegExp(c+'1', 'ig' ), c+row_i),
						formula);


		// Build table.
		let rows: ReactElement[] = [];
		let fieldFormula: ReactElement = <></>;
		let fieldResult: ReactElement = <></>;
		let fieldSolution: ReactElement = <></>;
		let style: CSS.Properties;
		let test: any;

		// Create each of the rows in the table.
		for (let i=0; i<tests.length ; i++) {

			// set fieldFormula, based on if this is readonly or the first row.
			if(i===0) {
				if(this.props.editable) {
					fieldFormula = <td className='bg-primary' >{ this._render_field(page) }</td>;
				} else {
					// Readonly first field.
					fieldFormula = <td className='outline-info' >{ this._render_field(page) }</td>;
				}

			} else {
				fieldFormula = <td style={{ backgroundColor: '#d9edf7' }}>{ page.client_f ? increment_row(page.client_f, i+1) : '' }</td>;
			}
			
			// Figure out if the cell is a string or a number.
			style = tdStyle( page.client_f_format);

			//if( page.client_f === '=') debugger;

			// set fieldResult showing the output of the formula.
			if( page.client_f === null || page.client_f === '' ) {
				// No client solution. Empty cell.
				fieldResult = <td></td>;

			} else if (page.client_test_results[i].error!==null || page.client_f.substr(0,1) !== '=') {
				// Error in result
				fieldResult = <td aria-label='Error' aria-live='polite' style={addDangerColor(style)}>{page.client_test_results[i].error}</td>;

			} else if (page.solution_test_results.length === 0 ) {
				// Good value result, but we don't know the result
				fieldResult = <td style={addInfoColor(style)}>{ clean(page.client_test_results[i].result, page.client_f_format) }</td>;

			} else if (page.solution_test_results.length !== null) {
				// Good value results, and we know if it should be true or false.
				
				// See if it matches. Works for either text or numbers.
				// Check precision to .00 only - as we have floating point errors.
				// Only show matches on localhost. Don't show to server.
				if(		page.client_test_results[i].result === page.solution_test_results[i].result ||
						Math.round(page.client_test_results[i].result * 100) === 
						Math.round(page.solution_test_results[i].result * 100 )
				) {
					// Render the field 
					fieldResult = <td style={addCorrectColor(style)} aria-label='Formula Correct' aria-live='polite'>{ clean(page.client_test_results[i].result, page.client_f_format) }</td>;
				} else {
					// Render normally
					fieldResult = <td style={(style)} aria-label='Formula Incorrect' aria-live='polite'>{ clean(page.client_test_results[i].result, page.client_f_format) }</td>;
				}
			}


			// set fieldSolution to the results for the formula.
			if(page.solution_test_results !== null && page.solution_test_results.length > 0) {
				fieldSolution = <td style={style}>{ clean(page.solution_test_results[i].result, page.client_f_format) }</td>;
				if(page.correct === false) {
					fieldSolution = <td style={style}>{ clean(page.solution_test_results[i].result, page.client_f_format) }</td>;
				}
			}

			// Add columns used for test.
			if(columns.length > 0 ) {
				test = columns.map( (c,c_index) => (
						<td style={ tdStyle( page.column_formats[c_index] ) } 
							key={'test'+i+'column'+c}>
							{clean(tests[i][c], page.column_formats[c_index])}
						</td>) );
			} else {
				test = null;
			}

			// Combine into a single row.
			// Note: use th for first cell for accessibility for each row
			rows.push(
				<tr key={'test'+i}> 
					<th style={tdFirstColumnStyle}>{ i+1 }</th>
					{ test }
					{ fieldFormula }
					{ fieldResult }
					{ fieldSolution }
				</tr>
			);
		}


		// If we have solutions, include a page header.
		let thSolutionResult: ReactElement = <></>;
		if( page.solution_test_results !== null && page.solution_test_results.length > 0) {
			thSolutionResult = <th style={headerStyle}>Correct Result</th>;
		}

		// Setup headers.  Use column_titles if available.  Otherwise, use letters.
		let thHeaders;
		if(tests.length > 0 ){
			if( page.column_titles.length > 0 ){
				thHeaders = columns.map( (c,i) => 
					<th style={headerStyle} key={c}>
						{c.toUpperCase()}
						<br/>
						<BlueSpan html={page.column_titles[i]} />
					</th> );
			} else {
				thHeaders = columns.map( c => 
					<th style={headerStyle} key={c}>
						{c.toUpperCase()}
					</th> );
			}
		}

		return (
			<Table bordered hover>
				<thead style={headerStyle}>
					<tr>
						<th style={ addCSSProperty(headerStyle, 'width', '1px') }></th>
						{ thHeaders }
						<th style={ addCSSProperty(headerStyle, 'width', '30%') }>Formula</th>
						<th style={ addCSSProperty(headerStyle, 'width', '30%') }>Result</th>
						{ thSolutionResult }
					</tr>
				</thead>
				<tbody>
					{ rows }
				</tbody>
			</Table>
			);
	}
}