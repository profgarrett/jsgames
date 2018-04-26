// @flow
import type { FormulaPageType, PageType } from './../app/if/IfTypes';


// Feedback types are used by the server to create custom feedback for page submissions.
// They are referred to frequently inside of tutorials for validation and more useful
// input to the user.




// Ensure that the given page uses all of the given references.
// Returns either null or the missing references.
const references = (page: FormulaPageType, values: Array<string>): ?string => {
	let missing = [];

	if(page.client_f === null) return null;

	// References are case insensitive.
	const lf = page.client_f.toLowerCase();

	for(let i=0; i<values.length; i++) {
		if(lf.indexOf(values[i].toLowerCase()) === -1) {
			missing.push(values[i]);
		}
	}

	if (missing.length === 0) {
		return null;
	} else if (missing.length === 1) {
		return 'You are missing the ' + missing[0] + ' reference.';
	} else {
		return 'You are missing these references: ' + missing.join(', ');
	}
};


// Ensure that the given page has the given values in it.
// Case sensitive.
const values = (page: FormulaPageType, values: Array<number | string>): ?string => {
	let missing = [];

	if(page.client_f === null) return null;

	for(let i=0; i<values.length; i++) {
		if(page.client_f.indexOf(''+values[i]) === -1) {
			missing.push(values[i]);
		}
	}

	if (missing.length === 0) {
		return null;
	} else if (missing.length === 1) {
		return 'You are missing the ' + missing[0] + ' number.';
	} else {
		return 'You are missing these numbers: ' + missing.join(', ');
	}
};


// Ensure that the given page has no numbers in it.  It should only use references.
const no_values = (page: FormulaPageType): ?string => {

	return null;
};


// Ensure that the given page has given symbols.
const symbols = (page: FormulaPageType, symbols: Array<string>): ?string => {
	let missing = [];

	if(page.client_f === null) return null;

	for(let i=0; i<symbols.length; i++) {
		if(page.client_f.indexOf(symbols[i]) === -1) {
			missing.push(symbols[i]);
		}
	}

	if (missing.length === 0) {
		return null;
	} else if (missing.length === 1) {
		return 'You are missing the ' + missing[0] + ' symbol.';
	} else {
		return 'You are missing these symbols: ' + missing.join(', ');
	}
};

// Ensure that the given page has no numbers in it.  It should only use references.
const no_symbols = (page: FormulaPageType, symbols: Array<string>): ?string => {
	let missing = [];

	if(page.client_f === null) return null;

	for(let i=0; i<symbols.length; i++) {
		if(page.client_f.indexOf(symbols[i]) !== -1) {
			missing.push(symbols[i]);
		}
	}

	if (missing.length === 0) {
		return null;
	} else if (missing.length === 1) {
		return 'You should not use the ' + missing[0] + ' symbol.';
	} else {
		return 'You should not use these symbols: ' + missing.join(', ');
	}
};



// Ensure that the given page has the given functions in it.
const functions = (page: FormulaPageType, functions: Array<string>): ?string => {
	let missing = [];

	if(page.client_f === null) return null;

	// Functions are case insensitive.
	const lf = page.client_f.toLowerCase();

	for(let i=0; i<functions.length; i++) {
		if(lf.indexOf(functions[i].toLowerCase()) === -1) {
			missing.push(functions[i]);
		}
	}

	if (missing.length === 0) {
		return null;
	} else if (missing.length === 1) {
		return 'You are missing the ' + missing[0] + ' function.';
	} else {
		return 'You are missing these functions: ' + missing.join(', ');
	}
};


// List of functions for has.
const has = {
	'references': references,
	'values': values,
	'no_values': no_values,
	'symbols': symbols,
	'functions': functions,
	'no_symbols': no_symbols
};


// Return feedback for a completed answer.
// Only used in the server-side, where we have the solution_rules populated.
const get_feedback = (that: PageType): ?Array<string> => {
	let response = '';
	let responses = [];

	// If we're on the client, we don't have access to feedback.  Return null for
	//	unknown/unset/unitialized.
	if(that.solution_feedback === null) return null;

	// Do not give feedback on un-submitted items.
	if(!that.client_has_answered) return [];

	// Loop through feedbacks, returning any that return a non-null response.
	for(let i = 0; i < that.solution_feedback.length; i++) {
		// Make sure that it is a valid has type.
		if(typeof has[that.solution_feedback[i].has] === 'undefined')
			throw new Error('Invalid solution_feedback type of '+that.solution_feedback[i].has);

		// Run has code and save result (if not null, meaning ok).
		response = has[that.solution_feedback[i].has](that, that.solution_feedback[i].args);
		if(response !== null) responses.push(response);
	}

	return responses;
};


module.exports = {
	get_feedback
};
