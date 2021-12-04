// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Table, FormControl, Button, Tabs, Tab, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { HtmlSpan, SmallOkGlyphicon, BlueSpan } from './../../components/Misc';
import { IfPageFormulaSchema, IfPagePredictFormulaSchema } from './../../../shared/IfPageSchemas';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import type { Node } from 'react';
const seedrandom = require('seedrandom');

// Randomize a given array by returning a modified version of that given 
// in an answer at https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
// May be identical to original list.
const randomizeListInPlace = (a: Array<any>, seed: number): void => {
	const r = seedrandom(seed);
	
	for (let i = a.length - 1; i > 0; i--) {
		let j = Math.floor(r() * (i + 1));
		// $FlowFixMe
		[a[i], a[j]] = [a[j], a[i]];
	}

}


// Helper functions to clean up the display of true/false, which 
//  aren't shown by react if just given to the render function.
// Add. a little bit of color to help show the difference.
const format_tf = tf => {
	if (tf === true ) {
		return <span style={{color: '#3c763d'}}>TRUE</span>;
	} else if( tf === false ) {
		return <span style={{color: 'black'}}>FALSE</span>;
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
	let number = 0; // temp space for testing isNan

	if(input === null) return null;
	if(input === '') return '';

	// Undefined format.  Guess!
	if(typeof format === 'undefined' || format === null || format === '' || format === null ) {
		if(typeof input === 'number') 
			return input.toLocaleString('en-US');
		else
			return input;
	}

	// Test to see if this is a string version of a date (i.e., json)
	// If so, change back to date.
	if (typeof input === 'string' && input.length === 24 ) {
		let regex_result_input = input.match( /^\d{4}-\d{2}-\d{2}T\d\d:\d\d/ );
		if(regex_result_input !== null && regex_result_input.length > 0) {
			input = new Date(input);
		}
	}

	if(input instanceof Date) {
		if( format === 'shortdate') {
			return (input.getMonth()+1)+'/'+input.getDate()+'/'+input.getFullYear();
		} else {
			return input;
		}
	}


	if(format === 'text' || format === 'string' || format === 'c' || format === ' ' ) {
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
		// Format without any decimal numbers, but include commas as needed.
		number = Number.parseInt(input);
		return Number.isNaN(number) ? input : number.toLocaleString();

	} else if( format === ',' || format === '.' || format === '0') {
		// Decimal
		//$FlowFixMe
		number =  Number.parseFloat(input);
		return Number.isNaN(number) ? input :  number.toLocaleString('en-US', {style:'decimal'});

	} else if( format === '$.') {
		// Currency with decimals.
		number = (Math.round(Number.parseFloat(input)*100)/100);
		return Number.isNaN(number) 
			? input 
			: number.toLocaleString('en-US', {style:'currency', currency: 'usd'});

	} else if( format === '$') {
		// Return a clean currency with no decimals.
		number = Math.round(Number.parseFloat(input));
		return Number.isNaN(number) 
			? input
			: number.toLocaleString('en-US', {style:'currency', minimumFractionDigits: 0, currency: 'usd'});

	} else if(format === '%') {
		// Percent.
		number = Number.parseFloat(input);
		//$FlowFixMe
		return Number.isNaN(number) 
			? input
			: number.toLocaleString('en-US', { style:'percent'} );

	} else if(format === 'boolean') {
		// Percent.
		//$FlowFixMe
		return input;

	} else {
		throw Error('Invalid format type '+format+' in ExcelTable');
	}
};


const clean = (input, format_type) => format_tf(transform_if_date(format(input, format_type)));

const tdBooleanStyle = {
	textAlign: 'center',
	paddingLeft: 10,
	verticalAlign: 'middle',
};
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

/*
	Return the proper TD for the given format code.
*/
const tdStyle = (format: string ): any => {

	// Number
	if(format === '$' || format === '$.' || format === ',' || format === '0' || format === '.') {
		return tdNumberStyle;
	}

	// String
	if(format === '' || format === 'text' || format === 'c' ) {
		return tdStringStyle;
	}

	// Date
	if(format === 'date' || format === 'shortdate') {
		return tdStringStyle;
	}

	// Boolean
	if(format === 'boolean' ) {
		return tdBooleanStyle;
	}
	
	return tdNumberStyle;
};



const addInfoColor = e => {
	return { backgroundColor: '#d9edf7', ...e};
};
const addCorrectColor = e => {
	return { backgroundColor: '#d4edda', ...e};
};

const addDangerColor = e => {
	return { backgroundColor: '#f2dede', ...e};
};



type PropsType = {
	page: IfPageFormulaSchema | IfPagePredictFormulaSchema,
	editable: boolean,
	readonly: boolean,
	handleChange: (any) => void
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Drag and drop features
//
// Code built from examples on https://codesandbox.io/s/ql08j35j3q?file=/index.js:357-1661
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


const grid = 8;

const getItemStyle = (snapshot, draggableStyle, answer_index) => {
	const isDragging = snapshot.isDragging;

	const new_style = {
		userSelect: 'none',
		//padding: grid * 2,
		margin: `0 ${grid}px 0 0`,
		background: isDragging ? '#cce5ff' : '',
		borderColor: isDragging ? '#b8daff' : '',
		borderStyle: 'solid',
		...draggableStyle
	}
	if(answer_index === -1) {
		new_style.background = 'white';
		new_style.borderStyle = 'dashed';
	}
	if(snapshot.isDropAnimating) {
		return {
			...new_style,
			transitionDuraction: `0.001s`,
		}
	}
	return new_style;
};

const getListStyle = (isDraggingOver: boolean, position?: string): Object => {
	const style = {
		background: isDraggingOver ? 'lightblue' : '',
		padding: grid,
		display: 'flex',
		overflow: 'auto',
		height: '55px',
		borderColor: 'white #dee2e6',
		borderWidth: 1,
		borderStyle: 'solid',
	};

	return style;
};

type StateType = {
	seed: number
};

type Answer = {
	content: string,
	row: number,
	correct?: boolean,
}

type PredictPropsType = {
	page: IfPagePredictFormulaSchema,
	editable: boolean,
	readonly: boolean,
	handleChange: (any) => void
};


class PredictExcelTable extends React.Component<PredictPropsType, StateType> {
	constructor(props: any) {
		super(props);
		(this: any).onDragEnd = this.onDragEnd.bind(this);
		(this: any).onAnswerDoubleclick = this.onAnswerDoubleclick.bind(this);
		(this: any)._get_unused_potential_answers = this._get_unused_answers.bind(this);
		this.state = { seed: Math.random() };
	}

	// Convert an answer (number) into the string value for display
	_answer_to_string(page: IfPagePredictFormulaSchema, answer_index: number): string {
		if(answer_index === -1) return 'Drag answer here';
		if(page.solution_test_results[answer_index].result === true) return "True";
		if(page.solution_test_results[answer_index].result === false) return "False";
		return page.solution_test_results[answer_index].result;
	}

	// What are the possible test answers?
	_get_answers_as_string(page: IfPagePredictFormulaSchema): Array<string> {
		const answers = page.solution_test_results.map( 
			(o, index: number): string => this._answer_to_string(page, index) );
		return answers;
	}

	// What test answers haven't been used?
	// OPtionally, use sorted_potential_answer_indexes to send in the preferred sort order for returned items.
	_get_unused_answers(page: IfPagePredictFormulaSchema, sorted_potential_answer_indexes?: Array<number>): Array<number> {
		const answers =  this._get_answers_as_string(page);
		const used = this._get_used(page);
		let sorted_answers = [];

		// Resort answers by sorted_potential_answer_indexes
		if(Array.isArray(sorted_potential_answer_indexes)) {
			sorted_answers = answers;
		} else {
			sorted_answers = answers;
		}

		// Remove items that we have already used. These will show up in another list.
		const unused = sorted_answers
			.map( (answer_text: string, answer_index: number) => answer_index )
			.filter( ( answer_index: number )=> { 
				return used.indexOf( answer_index ) === -1
			 });

		return unused;
	}

	// Build an array suitable for collecting 'used' answers.
	// Will properly setup and return, but no state/side effects.
	_get_used(page: IfPagePredictFormulaSchema): Array<number> {
		let used = Array.isArray(page.predicted_answers_used)
				&& page.predicted_answers_used.length === this.props.page.solution_test_results.length
				? page.predicted_answers_used
				: [];
		
		// If zero-length for used, initialize with an empty string for each row.
		if(used.length === 0) {
			page.solution_test_results.forEach( n => used.push(-1)); // -1 is a flag for non-set.
		}

		return used;
	}

	// Answer was double-clicked. Move into next free position.
	onAnswerDoubleclick(answer_index: number) {
		// Build the current values for predicted answers.
		let used = this._get_used(this.props.page);
		
		// See if this is already used. If so, don't mess with it.
		// This way, if someone double-clicks accidentally on an item already in a list,
		// nothing happens.
		if(used.indexOf(answer_index) !== -1 ) return;

		// Put into first open slot.
		for(let i=0; i<used.length; i++) {
			if(used[i] === -1) {
				used = used.slice();
				used[i] = answer_index;
				this.props.handleChange({ 'predicted_answers_used': used });
				return;
			}
		}
	

	}

	// Code to run after finishing a move.
    onDragEnd(result) {
        const { source, destination, draggableId } = result;
	
        if (!destination) return; // dropped outside of a list. Do nothing

		// Don't support re-ordering inside of a list.
        if (source.droppableId === destination.droppableId) return;

		// Get the destination row.
		const destRow = Number.parseInt(destination.droppableId.substr( 'DroppablePredictExcelTable_Row'.length ));

		// Build the current values for predicted answers.
		// If not initailized propertly, then build fixed array of strings.
		let used = this._get_used(this.props.page);
		
		// Build list of source items.
		// This list gets shorter as items are pulled.
		//const potential_answers = this.props.page.solution_test_results
		//
		//const unused_answers = this.get_unused_potential_answers(this.props.page);
		const answer_index = Number.parseInt(draggableId);

		// Are we pulling from another row?
		if(source.droppableId !== 'PredictExcelTable_Source') {
			// Pulled from an existing list. Need to remove from that position
			const fromRow = Number.parseInt(source.droppableId.substr( 'DroppablePredictExcelTable_Row'.length ));
			if(used[fromRow] !== answer_index) 
					throw new Error('Not matching answer index in PredictExcelTable');
			used[destRow] = used[fromRow];
			used[fromRow] = -1;
		} else {
			// Pulled from master list.
			used[destRow] = answer_index
		}

		// Both update predicted answers, as well as reset the timer.
		this.props.handleChange( { 'predicted_answers_used': used });
    };


	render_top_draggables(page: IfPagePredictFormulaSchema ): Node {
		//const actual_answers = page.predicted_answers_used;
		//const html_answers = potential_answers.map( (s, i) => <li key={'ExcelTable_htmlanswers'+i}>{ clean(s, page.client_f_format) }</li>) 
		
		// We don't want the unused answers to be in the same order as the rows.
		// Get sort order using the full original array.
		const original_potential_answers = this._get_answers_as_string(page);
		const resorted_potential_answer_indexes = [];
		original_potential_answers.map( (answer, i) => resorted_potential_answer_indexes.push(i));
		randomizeListInPlace(resorted_potential_answer_indexes, this.state.seed)

		// Get the answers we haven't used yet.
		const unused_answer_indexes = this._get_unused_answers(page);

		// Put the unused_answer_indexes into the same order as the resorted_potential_answer_indexes,
		const unused_answers = resorted_potential_answer_indexes.filter( i => unused_answer_indexes.indexOf(i) !== -1);

		const renderTooltip = (props) => {
			return <Tooltip id='doubleclicktooltip' {...props}>
				Double-click to place in the first open cell.
			</Tooltip>;
		}		
		return (
			<Droppable droppableId="PredictExcelTable_Source">
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                            style={ getListStyle(snapshot.isDraggingOver, 'top') } >
                            { unused_answers.map((answer_index: number, index) => (
                                <Draggable
                                    key={'DraggablePredictExcelTable_Row'+answer_index}
                                    draggableId={''+answer_index}
                                    index={index}>
                                    {(provided, snapshot) => (
										<div>
                                        <OverlayTrigger
											placement="top"
											delay={{ show: 400, hide: 50}}
											overlay={renderTooltip}
											><div>
												<Button variant='info' as="div"
												ref={provided.innerRef}
												onDoubleClick={() => this.onAnswerDoubleclick(answer_index)}
												{...provided.draggableProps}
												{...provided.dragHandleProps}
												style={getItemStyle(
													snapshot,
													provided.draggableProps.style,
												)}>
												{ this._answer_to_string(page, answer_index) }
											</Button>
										</div></OverlayTrigger>
										</div>
										
                                    )}
                                </Draggable>
                            ))}
							{ provided.placeholder }                            
                        </div>
                    )}
				</Droppable>);
	}

	render_field_draggable(i: number, page: IfPagePredictFormulaSchema ): Node {
		const answer_index = this._get_used(page)[i];
		const answer_text = answer_index !== null ? this._answer_to_string(page, answer_index) : null;
		const answer_correct = this._get_answers_as_string(page)[i] === answer_text;

		const used = [];

		if(answer_index !== null) {
			used.push( answer_index);
		}

		const showCorrectAnswers = window.location.toString().substr(0, 
			'ttp://localhost:8080'.length ) === 'http://localhost:8080';


		return (
                <Droppable droppableId={'DroppablePredictExcelTable_Row' + i}>
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}>
                            { used.map(( answer_index: number, index) => (
                                <Draggable
                                    key={ 'DraggablePredictExcelTable_Row'+answer_index}
                                    draggableId={ ""+answer_index }
                                    index={index}>
                                    {(provided, snapshot) => (
                                        <Button 
											variant={ showCorrectAnswers && answer_correct 
													? 'success'
													: 'info' }
											as='div'
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={getItemStyle(
                                                snapshot,
                                                provided.draggableProps.style,
												answer_index,
                                            )}>
                                            { this._answer_to_string(page, answer_index) }
                                        </Button>
                                    )}
                                </Draggable>
                            ))}
                            { provided.placeholder }
                        </div>
                    )}
                </Droppable>
			);
	}

	// Build out the table 
	render() {
		const page = this.props.page.toIfPagePredictFormulaSchema();
		
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
		let rows = [];
		let fieldFormula = null;
		let fieldSolution = null;
		let style = null;
		let test = null;

		// Create each of the rows in the table.
		for (let i=0; i<tests.length ; i++) {

			// Add columns used for test.
			if(columns.length > 0 ) {
				test = columns.map( (c,c_index) => (
						<td style={ tdStyle(page.column_formats[c_index]) }
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
					<td style={{padding: 0}}>{ this.render_field_draggable(i, page )}</td>
				</tr>
			);
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

		const html_answers = this.render_top_draggables(page);

		return (
			<DragDropContext onDragEnd={this.onDragEnd}>
				{ html_answers }
				<Table bordered hover>
					<thead style={headerStyle}>
						<tr>
							<th style={headerStyle} width={25}></th>
							{ thHeaders }
							<th style={headerStyle} width='40%'>Answer</th>
						</tr>
					</thead>
					<tbody>
						{ rows }
					</tbody>
				</Table>
			</DragDropContext>
			);
	}


}


class FormulaExcelTable extends React.Component<PropsType> {
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
			style = tdStyle( page.client_f_format);

			//if( page.client_f === '=') debugger;

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
				// Only show matches on localhost. Don't show to server.
				if(		page.client_test_results[i].result === page.solution_test_results[i].result ||
						Math.round(page.client_test_results[i].result * 100) === 
						Math.round(page.solution_test_results[i].result * 100 )
				 	) {
					// Render the field with a checkbox showing success.
					fieldResult = <td style={addCorrectColor(style)}>{ clean(page.client_test_results[i].result, page.client_f_format) }</td>;
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
						<td style={ tdStyle( page.column_formats[c_index] ) } 
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



// This is a standard table for showing excel stuff.
export default class ExcelTable extends React.Component<PropsType> {


	render(): Node {
		const page = this.props.page;
		const excelTable = <FormulaExcelTable 
				page={this.props.page} 
				editable={this.props.editable} 
				readonly={this.props.readonly} 
				handleChange={this.props.handleChange}/>

		// If we are a PredictFormula, then look to see if the predictions are correct.
		if(page.type === 'IfPagePredictFormulaSchema' && this.props.editable ) {
			const p = page.toIfPagePredictFormulaSchema();
			const correct = p.predictions_correct()
			// Test correctness.
				
			return ( 
				<Tabs style={{ marginTop: 30}} activeKey={ correct ? 'formula' : 'predict' } id='tab1'>
					<Tab eventKey='predict' disabled={correct} title='Step 1: Drag each answer into the right row'>
						<PredictExcelTable page={p}
							editable={this.props.editable} 
							readonly={this.props.readonly} 
							handleChange={this.props.handleChange}/>
					</Tab>
					<Tab eventKey='formula' disabled={!correct} title="Step 2: Write the formula">
						{ excelTable }
					</Tab>
				</Tabs>
				);

		} else {
			return excelTable;
		}

	}
}