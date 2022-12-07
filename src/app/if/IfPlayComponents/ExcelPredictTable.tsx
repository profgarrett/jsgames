import React, { ReactElement } from 'react';
import { Table, FormControl, Button, Tabs, Tab, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { HtmlSpan, BlueSpan } from './../../components/Misc';
import { IfPageFormulaSchema, IfPagePredictFormulaSchema } from './../../../shared/IfPageSchemas';
import { DragDropContext, Draggable  } from 'react-beautiful-dnd';
import { StrictModeDroppable  } from './StrictModeDroppable';

import CSS from 'csstype';

import seedrandom from 'seedrandom';

import { headerStyle, tdStyle, tdFirstColumnStyle, 
	clean, 
	addDangerColor, addInfoColor, addCorrectColor, addCSSProperty} from './ExcelTableFormatting';


interface PredictPropsType {
	page: IfPagePredictFormulaSchema;
	editable: boolean;
	readonly: boolean;
	handleChange: (any) => void;
};
interface StateType {
	seed: number;
};



/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Drag and drop features
//
// Code built from examples on https://codesandbox.io/s/ql08j35j3q?file=/index.js:357-1661
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Randomize a given array by returning a modified version of that given 
// in an answer at https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
// May be identical to original list.
const randomizeListInPlace = (a: Array<any>, seed: number): void => {
	const r = seedrandom(seed);
	
	for (let i = a.length - 1; i > 0; i--) {
		let j = Math.floor(r() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
};

const grid = 8;

const getItemStyle = (snapshot, draggableStyle, answer_index = 0) => {
	const isDragging = snapshot.isDragging;

	const new_style = {
		userSelect: 'none',
		//padding: grid * 2,
		margin: `0 ${grid}px 0 0`,
		background: isDragging ? '#cce5ff' : '',
		borderColor: isDragging ? '#b8daff' : '',
		borderStyle: 'solid',
		...draggableStyle
	};
	if(answer_index === -1) {
		new_style.background = 'white';
		new_style.borderStyle = 'dashed';
	}
	if(snapshot.isDropAnimating) {
		return {
			...new_style,
			transitionDuraction: '0.001s',
		};
	}
	return new_style;
};

const getListStyle = (isDraggingOver: boolean, position?: string): any => {
	// Not sure if needed
	//position;

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

////////////////////////////////////////////////
// Library functions





export default class ExcelPredictTable extends React.Component<PredictPropsType, StateType> {
	constructor(props: any) {
		super(props);
//		(this: any).onDragEnd = this.onDragEnd.bind(this);
//		(this: any).onAnswerDoubleclick = this.onAnswerDoubleclick.bind(this);
//		(this: any)._get_unused_potential_answers = this._get_unused_answers.bind(this);
		this.state = { seed: Math.random() };
	}

	// Convert an answer (number) into the string value for display
	_answer_to_string = (page: IfPagePredictFormulaSchema, answer_index: number): string => {
		if(answer_index === -1) return 'Drag answer here';
		// Turn from TRUE/FALSE into a string value. Shows nicely.
		if(page.solution_test_results[answer_index].result === true) return 'True';
		if(page.solution_test_results[answer_index].result === false) return 'False';
		// Return the actual value in the result.
		return page.solution_test_results[answer_index].result;
	}

	// What are the possible test answers?
	_get_answers_as_string= (page: IfPagePredictFormulaSchema): Array<string> => {
		const answers = page.solution_test_results.map( 
			(o, index: number): string => this._answer_to_string(page, index) );
		return answers;
	}

	// What test answers haven't been used?
	// Optionally, use sorted_potential_answer_indexes to send in the preferred sort order for returned items.
	_get_unused_answers = (page: IfPagePredictFormulaSchema, sorted_potential_answer_indexes?: Array<number>): Array<number> => {
		const answers =  this._get_answers_as_string(page);
		const used = this._get_used(page);
		let sorted_answers: string[] = [];

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
				return used.indexOf( answer_index ) === -1;
			});

		return unused;
	}

	// Build an array suitable for collecting 'used' answers.
	// Will properly setup and return, but no state/side effects.
	_get_used = (page: IfPagePredictFormulaSchema): Array<number> => {
		let used = Array.isArray(page.predicted_answers_used)
				&& page.predicted_answers_used.length === this.props.page.solution_test_results.length
				? page.predicted_answers_used
				: [];
		
		// If zero-length for used, initialize with an empty string for each row.
		if(used.length === 0) {
			page.solution_test_results.forEach( () => used.push(-1)); // -1 is a flag for non-set.
		}

		return used;
	}

	// Answer was double-clicked. Move into next free position.
	onAnswerDoubleclick = (answer_index: number) => {
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
    onDragEnd = (result: any) => {
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
			used[destRow] = answer_index;
		}

		// Both update predicted answers, as well as reset the timer.
		this.props.handleChange( { 'predicted_answers_used': used });
    }


	render_top_draggables = (page: IfPagePredictFormulaSchema ): ReactElement => {
		//const actual_answers = page.predicted_answers_used;
		//const html_answers = potential_answers.map( (s, i) => <li key={'ExcelTable_htmlanswers'+i}>{ clean(s, page.client_f_format) }</li>) 
		
		// We don't want the unused answers to be in the same order as the rows.
		// Get sort order using the full original array.
		const original_potential_answers = this._get_answers_as_string(page);
		const resorted_potential_answer_indexes: number[] = [];
		original_potential_answers.map( (answer, i) => resorted_potential_answer_indexes.push(i));
		randomizeListInPlace(resorted_potential_answer_indexes, this.state.seed);

		// Get the answers we haven't used yet.
		const unused_answer_indexes = this._get_unused_answers(page);

		// Put the unused_answer_indexes into the same order as the resorted_potential_answer_indexes,
		const unused_answers = resorted_potential_answer_indexes.filter( i => unused_answer_indexes.indexOf(i) !== -1);

		const renderTooltip = (props) => {
			return <Tooltip id='doubleclicktooltip' {...props}>
				Double-click to place in the first open cell.
			</Tooltip>;
		};
		///* DraggablePredictExcelTable_Row key */ 
		return (
			<StrictModeDroppable droppableId='PredictExcelTable_Source'>
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                            style={ getListStyle(snapshot.isDraggingOver, 'top') } >
                            { unused_answers.map((answer_index: number, index) => (
                                <Draggable
                                    key={'DraggablePredictExcelTable_Row'+answer_index }
                                    draggableId={''+answer_index}
                                    index={index}>
                                    {(provided, snapshot) => (
										<div>
                                        <OverlayTrigger
											placement='top'
											delay={{ show: 400, hide: 50}}
											overlay={renderTooltip}
											><div>
												<Button variant='info' as='div'
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
				</StrictModeDroppable>);
	}

	render_field_draggable = (i: number, page: IfPagePredictFormulaSchema ): ReactElement => {
		const answer_index = this._get_used(page)[i];
		const answer_text = answer_index !== null ? this._answer_to_string(page, answer_index) : null;
		const answer_correct = this._get_answers_as_string(page)[i] === answer_text;

		const used: number[] = [];

		if(answer_index !== null) {
			used.push( answer_index);
		}

		const showCorrectAnswers = window.location.toString().substr(0, 
			'http://localhost:8080'.length ) === 'http://localhost:8080';


		return (
                <StrictModeDroppable droppableId={'DroppablePredictExcelTable_Row' + i}>
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}>
                            { used.map(( answer_index: number, index) => (
                                <Draggable
                                    key={ 'DraggablePredictExcelTable_Row'+answer_index}
                                    draggableId={ ''+answer_index }
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
                </StrictModeDroppable>
			);
	}

	// Build out the table 
	render = (): ReactElement => {
		const page = this.props.page.toIfPagePredictFormulaSchema();
		
		// Set columns to [null] for cases where we don't have any tests.
		// Need to have something for the for loop, but null won't be displayed.
		if(page.tests.length === 0) throw new Error('Invalid length of tests for '+page.code);

		const tests = page.tests;
		const columns =  Object.keys(page.tests[0]);

		// Helper function to increment the a1, b2, ... references to a2, b2.
		/*
		const increment_row = 
				(formula, row_i) => 
					columns.reduce( (accum, c) => 
						accum.replace( new RegExp(c+'1', 'ig' ), c+row_i),
						formula);
		*/

		// Build table.
		let rows: ReactElement[] = [];
		//let fieldFormula = null;
		//let fieldSolution = null;
		//let style = null;
		let test: any;

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
							<th style={ addCSSProperty(headerStyle,'width', '25px') }></th>
							{ thHeaders }
							<th style={ addCSSProperty(headerStyle,'width', '40%') }>Answer</th>
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