import CSS from 'csstype';
import React, { ReactElement } from 'react';  // NDG 9/4/2025 need import here, export not working otherwise.

// This file contains functions used by both ExcelPredict and ExcelFormula.
// It primarily provides formatting functions to ensure consistency.



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
	if(typeof format === 'undefined' || format === null || format === '' ) {
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

export const clean = (input, format_type) => format_tf(transform_if_date(format(input, format_type)));

export const tdBooleanStyle: CSS.Properties = {
	textAlign: 'center',
	paddingLeft: '10',
	verticalAlign: 'middle',
};
export const tdStringStyle: CSS.Properties = {
	textAlign: 'left',
	paddingLeft: '10',
	verticalAlign: 'middle',
};
export const tdNumberStyle: CSS.Properties = {
	textAlign: 'right',
	paddingRight: '10',
	verticalAlign: 'middle',
};
export const headerStyle: CSS.Properties = {
	textAlign: 'center',
	verticalAlign: 'middle',
// REMOVE?	textSize: '1.2',
	backgroundColor: 'lightgray',
};
export const tdFirstColumnStyle: CSS.Properties = {
	...headerStyle,
	fontWeight: 'bold',
	paddingLeft: '15px',
	paddingRight: '15px'
};

/*
	Return the proper TD for the given format code.
*/
export const tdStyle = (format: string ): any => {

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



export const addInfoColor = e => {
	return { backgroundColor: '#d9edf7', ...e};
};
export const addCorrectColor = e => {
	return { backgroundColor: '#d4edda', ...e};
};

export const addDangerColor = e => {
	return { backgroundColor: '#f2dede', ...e};
};


export const addCSSProperty = ( css: CSS.Properties, property: string, value: string): CSS.Properties => {
	let newCss = { ...css};
	newCss[property] = value;
	return newCss;
}