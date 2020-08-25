// @flow
const { fill_template } = require('./template');
const { IfPageFormulaSchema, IfPageHarsonsSchema, IfPagePredictFormulaSchema } = require('./../shared/IfPageSchemas');
const { parseFeedback } = require('./parseFeedback');

// Feedback types are used by the server to create custom feedback for page submissions.
// They are referred to frequently inside of tutorials for validation and more useful
// input to the user.
// 
// They are sensitive to template values, so it's legal to do suff like {v} and expect
// to have the {v} value filled in from template_values.


// Safely transforms any passed numbers into a strong.
function s(a: any): string {
	if(typeof a === 'number') return ''+a;
	return a;
}


// Ensure that the given page uses all of the given references.
// Returns either null or the missing references.
const references = (page: IfPageFormulaSchema | IfPageHarsonsSchema, values: Array<string>): ?string => {
	let missing = [], value = null;
	
	
	if(page.client_f === null) return null;

	// References are case insensitive.
	const lf = fill_template(page.client_f.toLowerCase(), page.template_values);
	
	for(let i=0; i<values.length; i++) {
		value = fill_template(values[i].toLowerCase(), page.template_values);
		if(s(lf).indexOf(s(value)) === -1) {
			missing.push(value);
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
// This is *not* case sensitive.
// @TODO Add case sensitivity again.
const values = (page: IfPageFormulaSchema | IfPageHarsonsSchema, values: Array<number | string>): ?string => {
	let missing = [], value = null;

	if(page.client_f === null) return null;

	const client_f = fill_template(page.client_f, page.template_values);

	for(let i=0; i<values.length; i++) {
		value = fill_template((s(values[i])).toLowerCase(), page.template_values);
		// To Lower case! 
		if((s(client_f)).toLowerCase().indexOf((s(value).toLowerCase())) === -1) {
			missing.push(value);
		}
	}

	if (missing.length === 0) {
		return null;
	} else if (missing.length === 1) {
		return 'You are missing the ' + missing[0] + ' value.';
	} else {
		return 'You are missing these values: ' + missing.join(', ');
	}
};


// Ensure that the given page has no numbers in it.  It should only use references and symbols.
const no_values = (page: IfPageFormulaSchema | IfPageHarsonsSchema): ?string => {
	if(page.client_f === null || page.client_f === '' || page.client_f.length < 2 ) return null;

	const feedback = parseFeedback(page.client_f);
	
	const values = feedback.filter( f => f.has === 'values');
	if(values.length < 1) return null;

	if(values[0].args.length === 1) return 'You should not have "' + values[0].args[0] + '" in your formula. Use references instead.';
	if(values[0].args.length > 1) return 'You should not have the following values: "' + values[0].args.join('", "') + '". Use references instead.';

	return null;
};


// Ensure that the given page has given symbols.
const symbols = (page: IfPageFormulaSchema | IfPageHarsonsSchema, symbols: Array<string>): ?string => {
	let missing = [], symbol = '';

	if(page.client_f === null || page.client_f === '' || page.client_f.length < 2 ) return null;

	const client_f = fill_template(page.client_f.toLowerCase(), page.template_values);


	for(let i=0; i<symbols.length; i++) {
		symbol = fill_template(symbols[i].toLowerCase(), page.template_values);
		if( s(client_f).indexOf(s(symbol)) === -1) {
			missing.push(symbol);
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

// Ensure that the given page has none of the matching symbols.
const no_symbols = (page: IfPageFormulaSchema | IfPageHarsonsSchema, symbols: Array<string>): ?string => {
	let missing = [], symbol = '';

	if(page.client_f === null) return null;

	const client_f = fill_template(page.client_f.toLowerCase(), page.template_values);

	for(let i=0; i<symbols.length; i++) {
		symbol = fill_template(symbols[i].toLowerCase(), page.template_values);
		if(s(client_f).indexOf(s(symbol)) !== -1) {
			missing.push(symbol);
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
const functions = (page: IfPageFormulaSchema | IfPageHarsonsSchema, functions: Array<string>): ?string => {
	let missing = [], func = '';
 
	if(page.client_f === null) return null;

	// Functions are case insensitive.
	const lf = fill_template(page.client_f.toLowerCase(), page.template_values);

	for(let i=0; i<functions.length; i++) {
		func = fill_template(functions[i].toLowerCase(), page.template_values);
		if(s(lf).indexOf(s(func).toLowerCase()) === -1) {
			missing.push(func);
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
const get_feedback = (that: IfPageFormulaSchema | IfPageHarsonsSchema | IfPagePredictFormulaSchema): ?Array<string> => {
	let response = '';
	let responses = [];

	if(that.feedback === null) return null;

	// Do not give feedback on un-submitted items.
	if(!that.client_has_answered) return [];

	// Always check to make sure that there is a = sign.
	response = has['symbols'](that, ['=']);
	if(response) responses.push(response);

	// Always check to make sure that there are no ' single quotes.
	response = has['no_symbols'](that, ['\'']);
	if(response) responses.push(response);


	// If no custom rules are defined, return any from '='.
	if(that.feedback.length === 0) return responses;


	// Loop through feedbacks, returning any that return a non-null response.
	for(let i = 0; i < that.feedback.length; i++) {
		// Make sure that it is a valid has type.
		if(typeof has[that.feedback[i].has] === 'undefined')
			throw new Error('Invalid feedback type of '+that.feedback[i].has);

		// Run has code and save result (if not null, meaning ok).
		response = has[that.feedback[i].has](that, that.feedback[i].args);
		if(response) responses.push(response);
	}

	return responses;
};



module.exports = {
	get_feedback
};