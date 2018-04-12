const { Schema } = require('./Schema');

var FormulaParser = require('hot-formula-parser').Parser;


/** 
	This const is used to provide a list of available tutorials.
	Used on both client and server.

	Code value must match the filename in server/tutorial/...js
*/
const IfLevels = [
	{ code: 'tutorial', label: 'Website Introduction', description: 'Learn about this website by completing this tutorial.' },
	{ code: 'dates', label: 'Date Functions', description: 'Learn about date functions.' },
	{ code: 'math', label: 'Math operations', description: 'Create formulas with math symbols.' },
/*	{ code: 'sum', label: 'Sum function', description: 'Learn how to use the SUM function.' },
	{ code: 'text', label: 'Text functions', description: 'Learn a number of useful text functions' },
	{ code: 'if1', label: 'IF Conditions', description: 'Learn how to create IF conditions' },
	{ code: 'if2', label: 'IF Function', description: 'Learn how to use the IF function' }
*/
];


// Are the arrays similar or different?
const arrayDifferent = (a1, a2) => {
	// If any nulls, then return true (as a null is an unitialized user submitted answer)
	if(a1 === null || a2 === null ) return true;

	if(a1.length !== a2.length) return true;

	for(let i=0; i<a1.length; i++) {
		if(a1[i] !== a2[i]) return true;
	}

	return false;
};

// Convenience function for initializing schema.
let isDef = function(v) {
	return typeof v !== 'undefined';
};
let isArray = function(u) {
	return (u instanceof Array);
};

// Force boolean, not truthy or falsy.
// Allow null values.
const bool = function(unknown) {
	if(unknown === null) return null;
	return unknown ? true : false;
};


/**
	noObjects checks to make sure that the passed array doesn't contain any objects other than strings or numbers.
*/
const noObjectsInArray = (i_array) => {
	if(!(i_array instanceof Array)) throw new Error('noObjects can only be passed arrays.');
	i_array.map( v => {
		if(!(typeof v === 'string' || typeof v === 'number')) throw new Error('Invalid object passed to IfPageParsonsSchema._def_items');
	});
	return i_array;
};



// Go through the given obj or array, recursively matching items that look like a date
// back to the date() object. Works when dates are in '1981-12-20T04:00:14.000Z format, 
// not Unix seconds mode.  Needed, as some objects are dynamic, such as tests containing dates.
function revive_dates_recursively(obj) {
	var datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

	if(obj instanceof Array ) {
		return obj.map( o => revive_dates_recursively(o) );
	}

	if(typeof obj === 'object' ) {
		for(let name in obj) {
			if(obj.hasOwnProperty(name)) {
				obj[name] = revive_dates_recursively(obj[name]);
			}
		}
		return obj;
	}

	if(typeof obj === 'string') {
		if(datePattern.test(obj)) {
			return new Date(obj);
		}
	}
	return obj;
}


// Return fields in common for all Pages.
function common_schema() {

	return {
		code: { type: 'String', initialize: (s) => isDef(s) ? s : null },
		description: { type: 'String', initialize: (s) => isDef(s) ? s : null },
		helpblock: { type: 'String', initialize: (s) => isDef(s) ? s : null },

		history: { type: 'Array', initialize: (a) => isDef(a) && isArray(a) ? revive_dates_recursively(a) : [] },  /*defHistory*/

		correct: { type: 'Boolean', initialize: (b) => isDef(b) ? bool(b) : null },

		// Do the results need to be correct to save the results?
		correct_required: { type: 'Boolean', initialize: (b) => isDef(b) ? bool(b) : false },

		// After a page is completed, set TRUE so that no more updates are allowed.
		// This is done by code in server/ifGame, as the client doesn't know what the conditions are.
		completed: { type: 'Boolean', initialize: (b) => isDef(b) ? bool(b) : false }
	};
}




/*
	This pages displays information to the user.
*/
class IfPageTextSchema extends Schema {

	constructor(json) {
		super(json); // set passed fields.
		this.updateCorrect();
	}

	get schema() {
		let inherit = common_schema();

		return {
			...inherit,
			client_read: { type: 'Boolean', initialize: (s) => isDef(s) ? bool(s) : false }
		};
	}

	// Has the user provided input?
	client_has_answered() {
		return this.client_read;
	}

	/*
		Update any fields for which user has permissions.
		
		Safe to re-run, with the exception that upon changing client_items, will
		reset this.correct (since we don't know its status).  Will re-run updateCorrect() in 
		case this is on the server and we're updating the object.

		Run upon initial obj creation.
	*/
	updateUserFields(json) {
		if(typeof json === 'undefined') throw new Error('IfGames.updateUserFields(json) is null');
		if(json.type !== this.type ) throw new Error('Invalid type '+json.type+' in ' + this.type + '.updateUserFields');

		// don't allow updates to finished items. Note that completed isn't set internally by this obj,
		// but instead is set by the server code with knowledge of each tutorial's rules.
		if(this.completed) return this;

		if(this.client_read !== json.client_read ){
			this.client_read = json.client_read;
			this.history = json.history;
		}

		return this.updateCorrect();
	}

	/* 
		Update correct *if* a solution is provided.
	*/
	updateCorrect() {
		if(this.completed) return; // do not update completed items.

		if(!this.client_read) return; // no client submission.

		this.correct = true;
	}
}





/*
	A page holds a single choice question.

	It can have an correct choice, or allow any input.
*/
class IfPageChoiceSchema extends Schema {

	constructor(json) {
		super(json); // set passed fields.
		this.updateCorrect();
	}

	get schema() {
		let inherit = common_schema();

		return {
			...inherit,
			client: { type: 'String', initialize: (s) => isDef(s) ? s : null },
			client_items: { type: 'Array', initialize: (a) => isDef(a) && isArray(a) ? noObjectsInArray(a) : [] },
			solution: { type: 'String', initialize: (s) => isDef(s) ? s : null },

		};
	}

	// Has the user provided input?
	client_has_answered() {
		return this.client !== null;
	}

	/*
		Update any fields for which user has permissions.
		
		Safe to re-run, with the exception that upon changing client_items, will
		reset this.correct (since we don't know its status).  Will re-run updateCorrect() in 
		case this is on the server and we're updating the object.

		Run upon initial obj creation.
	*/
	updateUserFields(json) {
		if(typeof json === 'undefined') throw new Error('IfGames.updateUserFields(json) is null');
		if(json.type !== this.type ) throw new Error('Invalid type '+json.type+' in ' + this.type + '.updateUserFields');

		// don't allow updates to finished items. Note that completed isn't set internally by this obj,
		// but instead is set by the server code with knowledge of each tutorial's rules.
		if(this.completed) return this;

		if(this.client !== json.client ){
			this.client = json.client;
			this.correct = null; // we no longer know if the solution is correct.
			this.history = json.history;
		}

		return this.updateCorrect();
	}

	/* 
		Update correct *if* a solution is provided.
	*/
	updateCorrect() {
		if(this.completed) return; // do not update completed items.

		if(this.client === null) return; // no client submission.

		// Don't set if there is no available solution
		// Can be either from being on the client w/o (which won't get solutions)
		//		or being on the client or server with no correct answer.
		if(this.solution === null) return;

		// We have a solution and a client submission. set.
		this.correct = (this.client.trim().toLowerCase() === this.solution.trim().toLowerCase());
	}
}




/*
	A page holds a single exercise.

	Pages used tests to validate the results of the client_f against solution_f.

	The solution fields are not sent to the client unless they have the _visible tag set.
*/
class IfPageParsonsSchema extends Schema {

	constructor(json) {
		super(json); // set passed fields.
		this.updateCorrect();
	}

	get schema() {
		let inherit = common_schema();

		return {
			...inherit,
			helpblock: { type: 'String', initialize: (s) => isDef(s) ? s : null },

			potential_items: { type: 'Array', initialize: (a) => isDef(a) && isArray(a) ? noObjectsInArray(a) : [] },
			solution_items: { type: 'Array', initialize: (a) => isDef(a) && isArray(a) ? noObjectsInArray(a) : [] },
			client_items: { type: 'Array', initialize: (a) => isDef(a) && isArray(a) ? noObjectsInArray(a) : null }, 
			// client_items is set to null to show user hasn't submitted anything yet.

		};
	}


	// Has the user provided input?
	client_has_answered() {
		return this.client_items !== null && this.client_items.length > 1;
	}

	/*
		Update any fields for which user has permissions.
		
		Safe to re-run, with the exception that upon changing client_items, will
		reset this.correct (since we don't know its status).  Will re-run updateCorrect() in 
		case this is on the server and we're updating the object.

		Run upon initial obj creation.
	*/
	updateUserFields(json) {
		if(typeof json === 'undefined') throw new Error('IfGames.updateUserFields(json) is null');
		if(json.type !== this.type ) throw new Error('Invalid type '+json.type+' in ' + this.type + '.updateUserFields');

		// don't allow updates to finished items. Note that completed isn't set internally by this obj,
		// but instead is set by the server code with knowledge of each tutorial's rules.
		if(this.completed) return this;

		// over-write server-set true/false if new values are being set.
		if(arrayDifferent(this.client_items,json.client_items)) this.correct = null; 

		this.client_items = json.client_items;
		this.history = json.history;
		if(!(json.history instanceof Array)) throw new Error('Invalid history type '+typeof history);
		
		// Update level parsing as needed.
		return this.updateCorrect(true);
	}

	/*
		If solutions is available, refresh the this.correct variable.
		If solution tests aren't run (or available), then don't modify this.correct.
	*/
	updateCorrect() {
		// See if the user has submitted anything yet.  If not, then set to null.
		if(this.client_items === null) {
			this.correct = null;
			return;
		}

		// Check to see if we can provide a solution.
		// Solutions are not always available (ie, if we're on the client)
		if(this.solution_items.length < 1) return this;

		// Start testing with the assumption of correctness.
		this.correct = true;

		// Check individual answers
		for(let i=0; i<this.solution_items.length && this.correct; i++) {
			//console.log({ 'c': this.client_test_results[i].result, 's': this.solution_test_results[i].result });
			this.correct = (this.client_items[i] == this.solution_items[i]);
		}
		return this;
	}



}



/*
	A page holds a single exercise.

	Pages used tests to validate the results of the client_f against solution_f.

	The solution fields are not sent to the client unless they have the _visible tag set.
*/
class IfPageFormulaSchema extends Schema {

	constructor(json) {
		super(json); // set passed fields.
		this.updateSolutionTestResults();
		this.updateClientTestResults();
		this.updateCorrect();
	}


	get schema() {
		let inherit = common_schema();

		return {
			...inherit,

			// Used by this.parse to test client_f against solution_f.
			tests: { type: 'Array', initialize: (a) => isDef(a) && isArray(a) ? revive_dates_recursively(a) : [] },
			column_titles: { type: 'Array', initialize: (a) => isDef(a) && isArray(a) ? noObjectsInArray(a) : [] },
			column_formats: { type: 'Array', initialize: (a) => isDef(a) && isArray(a) ? noObjectsInArray(a) : [] },
			
			client_f: { type: 'Javascript', initialize: (s) => isDef(s) ? s : null },
			client_f_format: { type: 'String', initialize: (s) => isDef(s) ? s : '' },
			client_test_results: { type: 'Array', initialize: (a) => isDef(a) && isArray(a) ? a : [] },

			solution_f: { type: 'Javascript', initialize: (s) => isDef(s) ? s : null },
			solution_f_match: { type: 'Function', initialize: (f) => isDef(f) ? f : null },
			solution_test_results: { type: 'Array', initialize: (a) => isDef(a) && isArray(a) ? a : [] },

			// Should we show students the results of the solutions, or the solutions themselves?
			solution_f_visible: { type: 'Boolean', initialize: (s) => isDef(s) ? bool(s) : false },
			solution_test_results_visible: { type: 'Boolean', initialize: (s) => isDef(s) ? s : false },

		};
	}


	// Has the user provided input?
	client_has_answered() {
		return this.client_f !== null && this.client_f.length > 1;
	}


	// Update any fields for which user has permissions.
	// Save to re-run.  Can also run upon initial obj creation.
	updateUserFields(json) {
		if(typeof json === 'undefined') throw new Error('IfGames.updateUserFields(json) is null');
		if(json.type !== this.type ) throw new Error('Invalid type '+json.type+' in ' + this.type + '.updateUserFields');

		// don't allow updates to finished items. Note that completed isn't set internally by this obj,
		// but instead is set by the server code with knowledge of each tutorial's rules.
		
		if(this.completed && this.client_f !== json.client_f) throw new Error('Invalid attempt to update completed client_f');
		if(this.completed) return this;

		this.client_f = json.client_f;
		this.history = json.history;
		if(!(json.history instanceof Array)) throw new Error('Invalid history type '+typeof history);
		
		// Update level parsing as needed.
		this.updateSolutionTestResults();
		this.updateClientTestResults();
		this.updateCorrect();

		return this;
	}


	// Parse each test with the client code.
	updateClientTestResults() {
		if(this.client_f === null || this.client_f.length < 1) return this;

		this.client_test_results = this.tests.map( t => this.__parse(this.client_f, t));
	}


	/**
		If needed, update solutions. This happens upon creation of a new page.
		Make sure that we actually have a solution before generating anything.
	*/
	updateSolutionTestResults() {
		if(this.solution_f === null || this.solution_f.length < 1) return this;

		this.solution_test_results = this.tests.map( t => this.__parse(this.solution_f, t ) );
	}


	// Refresh the this.correct variable. Relies upon client test results being run.
	// If solution tests aren't run (or available), sets correct to null.
	updateCorrect() {
		// Check to see if we can provide a solution.
		// Solutions are not always available, in which case is correct set to null.
		if(this.solution_test_results.length !== this.tests.length || this.client_f === null || this.client_f.length < 1) {
			this.correct = null;
			return;
		}

		// Start testing with the assumption of correctness.
		this.correct = true;

		// Check individual answers
		for(let i=0; i<this.client_test_results.length && this.correct; i++) {
			//console.log({ 'c': this.client_test_results[i].result, 's': this.solution_test_results[i].result });
			this.correct = (this.client_test_results[i].result == this.solution_test_results[i].result);
		}
		if(!this.correct) return;

		// Check to make sure that there are no errors. If any errors, fail.
		if(this.correct) {
			this.correct = (0 === this.client_test_results.filter( t => t.error !== null ).length);
		}
		if(!this.correct) return;

		// Check to see if we are given a solution_match function.
		if(typeof this.solution_f_match === 'function') {
			this.correct = this.solution_f_match(this.client_f);
		}
	}



	/*
		Parse out given string.
		Returns results.

		No side effects.
		
		Code can be run on both client and server, with and without correct results.
		Cell references in the raw data must be lowercase.
		Documentation: https://www.npmjs.com/package/hot-formula-parser

		@arg formula
	*/
	__parse(formula, current_test) {

		// Update test results.
		//let columns = Object.keys(this.tests[0]);
		let parser = new FormulaParser();
		let res = { result: null, error: null };

		// Get int position of a letter.
		let i_to_alpha = i => 'abcdefghijklmnopqrstuvwxyz'.substr(i, 1);


		// Add a hook for getting variables.
		// Requires that all passed coordinates are on the first row.
		parser.on('callCellValue', function(cellCoord, done) {
			let coor = cellCoord.label.toLowerCase();
			if(coor.substr(1) !== '1') {
				throw new Error('#REF');
			}
			if(typeof current_test[coor.substr(0,1)] === 'undefined') {
				throw new Error('#REF');
			}
			let res = current_test[coor.substr(0,1)];
			done(res);
		});


		// Add hook for getting ranges.
		parser.on('callRangeValue', function(startCellCoord, endCellCoord, done) {
			let fragment = [];

			// Only allow
			if(startCellCoord.row.index !== 0 || endCellCoord.row.index !== 0) {
				throw new Error('#REF');
			}

			// Disabled code useful for vertical ranges.
			//for (var row = startCellCoord.row.index; row <= endCellCoord.row.index; row++) {
			//	var rowData = data[row];
			//	var colFragment = [];

			for (var col = startCellCoord.column.index; col <= endCellCoord.column.index; col++) {
				if( typeof current_test[ i_to_alpha(col) ] !== 'undefined') {
					fragment.push( current_test[ i_to_alpha(col) ] );
				} else {
					throw new Error('#REF');
				}
			}
			//	fragment.push(colFragment);
			//}

			if (fragment) {
				done(fragment);
			}
		});

		// Clean-up stuff that causes an error.
		// true doesn't work, but TRUE does.
		let clean_formula = formula.toUpperCase().trim();

		// Require formulas must start with `=`.  
		if(clean_formula !== null && clean_formula.substr(0,1) === '=') {
			try {
				res =  parser.parse(clean_formula.substr(1));  // Parser doesn't want a starting `=`
			} catch(e) {
				console.log(e);
				res.error = '#ERROR!';
			}
		}
		return res;
	}

}


/*
	A level is the owner object which can be created and used.
	It contains multiple pages.
*/
class IfLevelSchema extends Schema {


	get schema() {
		// clean-up functions

		// Ensure that any given strings (from JSON.stringify) are parsed into their actual objects.
		const a = unknown => typeof unknown === 'string' ? JSON.parse(unknown) : unknown;
		
		// Convert 0/1 to true/false.
		const b = unknown => unknown === 0 ? false : (unknown === 1 ? true : unknown);

		// Convert from UTC int into a date.
		const from_int_dt = unknown => {
			if(typeof unknown === 'string') {
				throw new Error('Invalid type ' + typeof unknown + ' "'+unknown+'" used in IfLevelSchema');
			}
			return new Date(unknown);
		};

		return {
			_id: { type: 'String', initialize: (s) => isDef(s) ? s : null },
			username: { type: 'String', initialize: (s) => isDef(s) ? s : null },

			// The seed value is used to initialize random behavior for pages.
			// Delcaring it in the level allows for predictable behavior as pages are generated.
			seed: { type: 'number', initialize: (dbl) => isDef(dbl) ? dbl : Math.random() },

			code: { type: 'String', initialize: (s) => isDef(s) ? s : null },
			title: { type: 'String', initialize: (s) => isDef(s) ? s : null },
			description: { type: 'String', initialize: (s) => isDef(s) ? s : null },

			completed: { type: 'Boolean', initialize: (s) => isDef(s) ? b(s) : false },

			pages: { type: 'Array', initialize: (aJ) => isDef(aJ) ? a(aJ).map(j => {
						return this.get_new_page(j);
					}) : [] },
			history: { type: 'Array', initialize: (aH) => isDef(aH) ? a(aH) : [] },

			updated: { type: 'Date', initialize: (dt) => isDef(dt) ? from_int_dt(dt) : Date() }, 
			created: { type: 'Date', initialize: (dt) => isDef(dt) ? from_int_dt(dt) : Date() }
		};
	}


	/*
		Build score from any page implementing 'score' (or items[1..].score)
		Anything other than TRUE or FALSE will be stored as null.  Null means either
		that it doesn't get scored, of if in the last place, that it's in progress.
	
		Return the results as an array of whatever is passed.
	*/
	get_score_as_array(y=1, n=0, unscored, last_in_progress) {
		// Make sure that true/false/null are the only allowed options.
		this.pages.map( p => {
			if(p.correct !== true && p.correct !== false && p.correct !== null) 
				throw new Error('score.refresh.if.p.correct.isnottrueorfalseornull');
			});

		let results = this.pages.map( p => { 
			if(p.correct === true) return y;
			if(p.correct === false) return n;
			if(p.correct === null) return unscored;
		});

		// If the last item is null, change to last_in_progress
		if(results.length > 0 && results[results.length-1].correct === null ) {
			results.pop();
			results.push(last_in_progress);
		}

		return results;
	}

	get_score_correct() {
		return this.get_score_as_array(1,0,0,0).reduce( (accum, i) => accum + i, 0);
	}
	get_score_attempted() {
		return this.get_score_as_array(1,1,0,0).reduce( (accum, i) => accum + i, 0);
	}
	get_score_incorrect() {
		return this.get_score_as_array(1,0,0,0).reduce( (accum, i) => accum + i, 0);
	}
	get_score_streak() {
		throw new Error('not implemented');
		/*
		let i=this['results'].length;
		let accum = 0;

		for(i=this['results'].length-1; i>=0; i--) {
			if(this['results'][i]) {
				accum++;
			} else {
				return accum;
			}
		}
		return accum;
		*/
	}

	/**
		Returns an initialized object based on the correct class type.
		Must be passed valid JSON object with type variable
	*/
	get_new_page(json) {
		//return new json.type(json);
		
		if(json.type === IfPageParsonsSchema || json.type === 'IfPageParsonsSchema') {
			return new IfPageParsonsSchema(json);
		} else if (json.type === IfPageFormulaSchema || json.type === 'IfPageFormulaSchema') {
			return new IfPageFormulaSchema(json);
		} else if (json.type === IfPageChoiceSchema || json.type === 'IfPageChoiceSchema') {
			return new IfPageChoiceSchema(json);
		} else if (json.type === IfPageTextSchema || json.type === 'IfPageTextSchema') {
			return new IfPageTextSchema(json);
		} else {
			throw new Error('Invalid get_new_page(type) param of ' + json.type);
		}
		

	}

	updateUserFields(json) {
		if(json.type !== this.type )
			throw new Error('Invalid type '+json.type+' provided to ' + this.type + '.updateUserFields');
		if(!(this.history instanceof Array)) 
			throw new Error('Invalid history type in updateUserFields');
		
		// Update any pages with matching json.
		// Some pages may not have matching json, as server updates level by adding new pages.
		this.pages.map( (p, index) => {
			if(typeof json.pages[index] !== 'undefined') {
				p.updateUserFields(json.pages[index]);
			}
		});
		
		this.history = [...this.history, { created: new Date(), title: 'updateUserFields'}];
		this.updated = new Date();

		return this;
	}

}


module.exports = {
	IfLevels,
	IfLevelSchema,
	IfPageTextSchema,
	IfPageChoiceSchema,
	IfPageFormulaSchema,
	IfPageParsonsSchema
};

