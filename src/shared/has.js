// @flow
import type { FormulaPageType } from './../app/if/IfTypes';


// Ensure that the given page uses all of the given references.
// Returns either null or the missing references.
export const has_references = (page: FormulaPageType, references: Array<string>): ?string => {
	let missing = [];

	for(let i=0; i<references.length; i++) {
		if(page.client_f.indexOf(references[i]) === -1) {
			missing.push(references[i]);
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


// Ensure that the given page has the given numbers in it.
export const has_values = (page: FormulaPageType, values: Array<number | string>): ?string => {
	let missing = [];

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
export const has_no_values = (page: FormulaPageType): ?string => {

	return null;
};


// Ensure that the given page has no numbers in it.  It should only use references.
export const has_symbols = (page: FormulaPageType, symbols: Array<string>): ?string => {
	let missing = [];

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
