import React, { ReactElement } from 'react';
import { Table, FormControl, Button, Tabs, Tab, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { HtmlSpan, BlueSpan } from './../../components/Misc';
import { IfPageFormulaSchema, IfPagePredictFormulaSchema } from './../../../shared/IfPageSchemas';

import ExcelFormulaTable from './ExcelFormulaTable';
import ExcelPredictTable from './ExcelPredictTable';


import CSS from 'csstype';

import seedrandom from 'seedrandom';

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
		return Number.isNaN(number) 
			? input
			: number.toLocaleString('en-US', { style:'percent'} );

	} else if(format === 'boolean') {
		// Percent.
		return input;

	} else {
		throw Error('Invalid format type '+format+' in ExcelTable');
	}
};

const clean = (input, format_type) => format_tf(transform_if_date(format(input, format_type)));

const tdBooleanStyle: CSS.Properties = {
	textAlign: 'center',
	paddingLeft: '10',
	verticalAlign: 'middle',
};
const tdStringStyle: CSS.Properties = {
	textAlign: 'left',
	paddingLeft: '10',
	verticalAlign: 'middle',
};
const tdNumberStyle: CSS.Properties = {
	textAlign: 'right',
	paddingRight: '10',
	verticalAlign: 'middle',
};
const headerStyle: CSS.Properties = {
	textAlign: 'center',
	verticalAlign: 'middle',
// REMOVE?	textSize: '1.2',
	backgroundColor: 'lightgray',
};
const tdFirstColumnStyle: CSS.Properties = {
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

interface StateType {
	seed: number;
};

/*
type Answer = {
	content: string,
	row: number,
	correct?: boolean,
}
*/




const addCSSProperty = ( css: CSS.Properties, property: string, value: string): CSS.Properties => {
	let newCss = { ...css};
	newCss[property] = value;
	return newCss;
}

// This is a standard table for showing excel stuff.
export default class ExcelTable extends React.Component<PropsType> {


	render = (): ReactElement => {
		const page = this.props.page;
		const excelTable = <ExcelFormulaTable 
				page={this.props.page} 
				editable={this.props.editable} 
				readonly={this.props.readonly} 
				handleChange={this.props.handleChange}/>;

		// If we are a PredictFormula, then look to see if the predictions are correct.
		if(page.type === 'IfPagePredictFormulaSchema' && this.props.editable ) {
			const p = page.toIfPagePredictFormulaSchema();
			const correct = p.predictions_correct();
			// Test correctness.
				
			return ( 
				<Tabs style={{ marginTop: 30}} activeKey={ correct ? 'formula' : 'predict' } id='tab1'>
					<Tab eventKey='predict' disabled={correct} title='Step 1: Drag each answer into the right row'>
						<ExcelPredictTable page={p}
							editable={this.props.editable} 
							readonly={this.props.readonly} 
							handleChange={this.props.handleChange}/>
					</Tab>
					<Tab eventKey='formula' disabled={!correct} title='Step 2: Write the formula'>
						{ excelTable }
					</Tab>
				</Tabs>
				);

		} else {
			return excelTable;
		}

	}
}