import React from 'react';
import PropTypes from 'prop-types';
import { Table, HelpBlock, FormControl } from 'react-bootstrap';
import { HtmlSpan, OkGlyphicon, SuccessGlyphicon, FailureGlyphicon } from './../components/Misc';


// This is a standard table for showing excel stuff.
export default class ExcelTable extends React.Component {
	/*
	constructor(props) {
		super(props);

		// Save a reference to page.  When props update, reset to this.
		// Used to know if we need to refocus on the input box.
		this.state = { 
			page: null
		};
	}
	*/


	// Build out the input box.
	_render_field(page) {
		const helpblockStyle = {
			color: 'white',
			marginBottom: 5,
			paddingLeft: 5
		};
		let helpblock = page.helpblock ? <HelpBlock style={helpblockStyle}><HtmlSpan html={ page.helpblock } /></HelpBlock> : '';
		/*
			<FormGroup controlId='formIfLevelPlay' validationState={this.getValidationState()}>
				<ControlLabel></ControlLabel>
				<FormControl.Feedback />
			</FormGroup>
		*/		
		return (
			<div>
				<FormControl 
					id='ExcelTableRenderFieldInput'
					ref={(input) => { this.client_fInput = input; }}
					type='text'
					autoComplete='off'
					value={page.client_f==null ? '' : page.client_f }
					placeholder='Enter a formula'
					onChange={ (e) => this.props.handleChange({ client_f: e.target.value}) }
				/>
				{ helpblock }		
			</div>
			);
	}


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

	// Build out the table 
	render() {
		const page = this.props.page;
		const columns = Object.keys(page.tests[0]);

		const tdStyle = {
			textAlign: 'center',
			verticalAlign: 'middle'
		};
		const headerStyle = {
			...tdStyle,
			textSize: 1.2,
			backgroundColor: 'lightgray',
		};
		const tdFirstColumnStyle = {
			...headerStyle,
			fontWeight: 'bold',
			paddingLeft: '15px',
			paddingRight: '15px'
		};


		// Helper functions to clean up the display of true/false (which aren't shown in display)
		// Add a little bit of color to help show the difference.
		const clean_tf = tf => {
			if (tf === true ) {
				return <span style={{color: '#3c763d'}}>True</span>;
			} else if( tf === false ) {
				return <span style={{color: '#c7254e'}}>False</span>;
			}
			return tf; // string result.
		};

		// Helper function to turn dates into strings.
		const clean_if_date = dt => {
			if(dt instanceof Date) {
				return dt.toLocaleDateString('en-US', { });
			} else {
				return dt;
			}
		};

		const clean = input => clean_tf(clean_if_date(input));

		// Helper function to increment the a1, b2, ... references to a2, b2.
		const increment_row = 
				(formula, row_i) => 
					columns.reduce( (accum, c) => 
						accum.replace( new RegExp(c+'1', 'ig' ), c.toUpperCase()+row_i),
						formula);

		// Build table.
		let rows = [];
		let fieldFormula = null;
		let fieldResult = null;
		let fieldSolution = null;

		for (let i=0; i<page.tests.length; i++) {
			// Set local varbiables and parse.

			//console.log()

			// Render the input field or formula.
			if(i===0) {
				if(this.props.editable) {
					fieldFormula = <td className='bg-primary' >{ this._render_field(page) }</td>;
				} else {
					// Readonly first field.
					fieldFormula = <td className='bg-info' >{ page.client_f }</td>;
				}

			} else {
				fieldFormula = <td className='bg-info'>{ page.client_f ? increment_row(page.client_f, i+1) : '' }</td>;
			}
			
			// Render results of formula
			if( page.client_f === null || page.client_f === '' ) {
				// No client solution. Empty cell.
				fieldResult = <td></td>;

			} else if (page.client_test_results[i].error!==null) {
				// Error in result
				fieldResult = <td style={tdStyle} className='bg-danger'>{page.client_test_results[i].error}</td>;

			} else if (page.solution_test_results.length === 0 ) {
				// Good value result, but we don't know the result
				fieldResult = <td style={tdStyle}>{ clean(page.client_test_results[i].result) }</td>;

			} else if (page.solution_test_results.length !== null) {
				// Good value results, and we know if it should be true or false.

				if(	page.client_test_results[i].result === page.solution_test_results[i].result) {
					// Render the field with a checkbox showing success.
					fieldResult = <td style={tdStyle}>{ clean(page.client_test_results[i].result) }<OkGlyphicon /></td>;
				} else {
					// Render normally
					fieldResult = <td style={tdStyle}>{ clean(page.client_test_results[i].result) }</td>;
				}
			}

			// Solution column
			if(page.solution_test_results !== null && page.solution_test_results.length > 0) {
				fieldSolution = <td className='bg-info' style={tdStyle}>{ clean(page.solution_test_results[i].result) }</td>;
				if(page.correct === false) {
					fieldSolution = <td className='bg-info' style={tdStyle}>{ clean(page.solution_test_results[i].result) }</td>;
				}
			}

			// Combined into a single row.
			rows.push(
				<tr key={'test'+i}> 
					<td style={tdFirstColumnStyle}>{ i+1 }</td>
					{ columns.map( c => (<td style={tdStyle} key={'test'+i+'column'+c}>{page.tests[i][c]}</td>) ) } 
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


		return (
			<Table bordered condensed hover>
				<thead style={headerStyle}>
					<tr>
						<th style={headerStyle} width={25}></th>
						{ columns.map( c => <th style={headerStyle} /*width={col_width}*/ key={c}>{c.toUpperCase()}</th> )}
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
ExcelTable.propTypes = {
	page: PropTypes.object.isRequired,
	editable: PropTypes.bool.isRequired,
	handleChange: PropTypes.func
};

