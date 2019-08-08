// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Table, FormControl } from 'react-bootstrap';
import { HtmlSpan, SmallOkGlyphicon, BlueSpan } from './../components/Misc';
import { IfPageFormulaSchema } from './../../shared/IfPage';


// Helper functions to clean up the display of true/false, which 
//  aren't shown by react if just given to the render function.
// Add. a little bit of color to help show the difference.
const format_tf = tf => {
	if (tf === true ) {
		return <span style={{color: '#3c763d'}}>True</span>;
	} else if( tf === false ) {
		return <span style={{color: 'black'}}>False</span>;
	}
	return tf; // string result.
};

// Helper function to turn dates into strings.
// Needed because REACT freaks out if given an obj to render.  Normally dates will be formatted by format,
//	but can't rely on this from user input.
const transform_if_date = dt => {

	if(dt instanceof Date) {
		return dt.toLocaleDateString('en-US', { });
	} else {
		return dt;
	}
};

// Use the given format style to properly display the input.
// Very flexible with input format, guessing how to respond. 
const format = (p_input, format) => {
	let input = p_input;
	if(input === null) return null;

	// Undefined format.  Guess!
	if(typeof format === 'undefined' || format === null || format === '') {
		if(typeof input === 'number') 
			return input.toLocaleString('en-US');
		else
			return input;
	}

	// Test to see if this is a string version of a date (i.e., json)
	// If so, change back to date.
	if (typeof input === 'string' && input.length === 24 && input.match( /^\d{4}-\d{2}-\d{2}T\d\d:\d\d/ ).length > 0) {
		input = new Date(input);
	}

	if(input instanceof Date) {
		if( format === 'shortdate') {
			return (input.getMonth()+1)+'/'+input.getDate()+'/'+input.getFullYear();
		} else {
			return input;
		}
	}

	if(format === 'text' || format === 'c' || format === ' ' ) {
		// Text
		return input;

	} else if( format === 'shortdate' || format === 'date' ) {
		// A column can be formatted as a shortdate, but not yet have a date (such as a partial formula)
		// If a Date instance, return formatted. Otherwise, just give the item.
		if(input instanceof Date) {
			return input.toLocaleDateString(); //'en-US', {style:'decimal'});
		} else {
			return input;
		}

	} else if( format === '0' ) {
		// Format without any decimal numbers.
		return Math.round(input);

	} else if( format === ',' || format === '.' ) {
		// Decimal
		return input.toLocaleString('en-US', {style:'decimal'});

	} else if( format === '$.') {
		// Currency with decimals.
		return (Math.round(input*100)/100).toLocaleString('en-US', 
			{style:'currency', currency: 'usd'});

	} else if( format === '$') {
		// Return a clean currency with no decimals.
		return Math.round(input).toLocaleString('en-US', 
			{style:'currency', minimumFractionDigits: 0, currency: 'usd'});

	} else if(format === '%') {
		// Percent.
		return input.toLocaleString('en-US', {style:'percent'});

	} else {
		throw Error('Invalid format type '+format+' in ExcelTable');
	}
};

const is_text_format = (format) => {
	return (format === 'text');
};

const clean = (input, format_type) => format_tf(transform_if_date(format(input, format_type)));




type PropsType = {
	page: IfPageFormulaSchema,
	editable: boolean,
	readonly: boolean,
	handleChange: (any) => void
};

// This is a standard table for showing excel stuff.
export default class ExcelTable extends React.Component<PropsType> {


	componentDidMount() {
		// If there is an input field, then set its focus.
		if(this.props.editable) {
			let node = document.getElementById('ExcelTableRenderFieldInput');
			if(node) node.focus();
			//this.client_fInput.focus();
		}
	}
	componentDidUpdate() {
		if(this.props.editable) {
			let node = document.getElementById('ExcelTableRenderFieldInput');
			if(node) node.focus();
			//this.client_fInput.focus();
		}	
	}


	// Build out the input box.
	_render_field(page: IfPageFormulaSchema) {
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
					/*ref={(input) => { this.client_fInput = input; }}*/
					type='text'
					autoComplete='off'
					value={ page.client_f==null ? '' : page.client_f }
					disabled={ this.props.readonly }
					placeholder='Enter a formula'
					onChange={ (e) => this.props.handleChange({ client_f: e.target.value}) }
				/>
				{ helpblock }		
			</div>
			);
	}


	// Build out the table 
	render() {
		const page = this.props.page;
		// Set columns to [null] for cases where we don't have any tests.
		// Need to have something for the for loop, but null won't be displayed.
		if(page.tests.length === 0) throw new Error('Invalid length of tests for '+page.code);

		const tests = page.tests;
		const columns =  Object.keys(page.tests[0]);

		const tdStringStyle = {
			textAlign: 'left',
			paddingLeft: 10,
			verticalAlign: 'middle',
		};
		const tdNumberStyle = {
			textAlign: 'right',
			paddingRight: 10,
			verticalAlign: 'middle',
		};
		const headerStyle = {
			textAlign: 'center',
			verticalAlign: 'middle',
			textSize: 1.2,
			backgroundColor: 'lightgray',
		};
		const tdFirstColumnStyle = {
			...headerStyle,
			fontWeight: 'bold',
			paddingLeft: '15px',
			paddingRight: '15px'
		};

		const addInfoColor = e => {
			return { backgroundColor: '#d9edf7', ...e};
		};
		const addDangerColor = e => {
			return { backgroundColor: '#f2dede', ...e};
		};

		

		// Helper function to increment the a1, b2, ... references to a2, b2.
		const increment_row = 
				(formula, row_i) => 
					columns.reduce( (accum, c) => 
						accum.replace( new RegExp(c+'1', 'ig' ), c+row_i),
						formula);

		// Build table.
		let rows = [];
		let fieldFormula = null;
		let fieldResult = null;
		let fieldSolution = null;
		let style = null;
		let test = null;

		// Create each of the rows in the table.
		for (let i=0; i<tests.length ; i++) {

			// set fieldFormula, based on if this is readonly or the first row.
			if(i===0) {
				if(this.props.editable) {
					fieldFormula = <td className='bg-primary' >{ this._render_field(page) }</td>;
				} else {
					// Readonly first field.
					fieldFormula = <td className='outline-info' >{ page.client_f }</td>;
				}

			} else {
				fieldFormula = <td style={{ backgroundColor: '#d9edf7' }}>{ page.client_f ? increment_row(page.client_f, i+1) : '' }</td>;
			}
			
			// Figure out if the cell is a string or a number.
			style = is_text_format(page.client_f_format) ? tdStringStyle : tdNumberStyle;

			// set fieldResult showing the output of the formula.
			if( page.client_f === null || page.client_f === '' ) {
				// No client solution. Empty cell.
				fieldResult = <td></td>;

			} else if (page.client_test_results[i].error!==null || page.client_f.substr(0,1) !== '=') {
				// Error in result
				fieldResult = <td style={addDangerColor(style)}>{page.client_test_results[i].error}</td>;

			} else if (page.solution_test_results.length === 0 ) {
				// Good value result, but we don't know the result
				fieldResult = <td style={addInfoColor(style)}>{ clean(page.client_test_results[i].result, page.client_f_format) }</td>;

			} else if (page.solution_test_results.length !== null) {
				// Good value results, and we know if it should be true or false.
				
				// See if it matches. Works for either text or numbers.
				// Check precision to .00 only - as we have floating point errors.
				if(	page.client_test_results[i].result === page.solution_test_results[i].result ||
						Math.round(page.client_test_results[i].result * 100) === 
						Math.round(page.solution_test_results[i].result * 100 )) {
					// Render the field with a checkbox showing success.
					fieldResult = <td style={style}>{ clean(page.client_test_results[i].result, page.client_f_format) }<SmallOkGlyphicon /></td>;
				} else {
					// Render normally
					fieldResult = <td style={(style)}>{ clean(page.client_test_results[i].result, page.client_f_format) }</td>;
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
						<td style={ is_text_format(page.column_formats[c_index]) ? tdStringStyle : tdNumberStyle } 
							key={'test'+i+'column'+c}>
							{clean(tests[i][c], page.column_formats[c_index])}
						</td>) );
			} else {
				test = null;
			}

			// Combine into a single row.
			rows.push(
				<tr key={'test'+i}> 
					<td style={tdFirstColumnStyle}>{ i+1 }</td>
					{ test }
					{ fieldFormula }
					{ fieldResult }
					{ fieldSolution }
				</tr>
			);
		}


		// If we have solutions, include a page header.
		let thSolutionResult = null;
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
						<th style={headerStyle} width={25}></th>
						{ thHeaders }
						<th style={headerStyle} width='30%'>Formula</th>
						<th style={headerStyle} width='30%'>Result</th>
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
