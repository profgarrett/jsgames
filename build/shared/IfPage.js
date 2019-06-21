//      
const { Schema, isDef, isObject, isArray, revive_dates_recursively } = require('./Schema');
const { get_feedback } = require('./feedback');
const { fill_template } = require('./template');
var FormulaParser = require('hot-formula-parser').Parser;
//import type { PageType } from './../app/if/IfTypes';



// Are we on the server or on the client?
function is_server()          {
	return ! (typeof window !== 'undefined' && window.document );
}


// Convert dt to date if it is text.
function convert_to_date_if_string( s     )       {
		if(typeof s === 'string') return new Date(s);
		return s;
}

// Polyfill for testing if a number is an integer.
// Currenlty in modern browsers, but below is for IE.
// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger#Polyfill
function isInteger(nVal        )          {
    return typeof nVal === 'number' && isFinite(nVal) && nVal > -9007199254740992 && nVal < 9007199254740992 && Math.floor(nVal) === nVal;
}


// Are the arrays similar or different?
const arrayDifferent = (a1            , a2            )          => {
	// If any nulls, then return true (as a null is an unitialized user submitted answer)
	if(a1 === null || a2 === null ) return true;

	if(a1.length !== a2.length) return true;

	for(let i=0; i<a1.length; i++) {
		if(a1[i] !== a2[i]) return true;
	}

	return false;
};


// Force boolean, not truthy or falsy.
// Allow null values.
const bool = function(unknown     )           {
	if(unknown === null) return null;
	return unknown ? true : false;
};


/**
	noObjects checks to make sure that the passed array doesn't contain any objects other than strings or numbers.
*/
const noObjectsInArray = (i_array            )             => {
	if(!(i_array instanceof Array)) throw new Error('noObjects can only be passed arrays.');
	i_array.map( v => {
		if(!(typeof v === 'string' || typeof v === 'number')) throw new Error('Invalid object passed to IfPageParsonsSchema._def_items');
	});
	return i_array;
};



// Return fields in common for all Pages.
function common_schema()         {

	return {
		// Short-cut code used to help initialize code in server ifgame create page code.
		code: { type: 'String', initialize: (s) => isDef(s) ? s : null },

		// Description gives high-level conceptual overview. Useful for reviews.
		description: { type: 'String', initialize: (s) => isDef(s) ? s : null },
		// Instructions are specific to the given task.  
		instruction: { type: 'String', initialize: (s) => isDef(s) ? s : null },
		// Helpblock is given with more specific guidelines. Optional for completion.
		helpblock: { type: 'String', initialize: (s) => isDef(s) ? s : null },
		
		// An array of objects with changes.
		history: { type: 'Array', initialize: (a) => isDef(a) && isArray(a) ? revive_dates_recursively(a) : [] },  /*defHistory*/

		// Is this correct?  True/False/Null.
		correct: { type: 'Boolean', initialize: (b) => isDef(b) ? bool(b) : null },

		// Do the results need to be correct to save the results?
		correct_required: { type: 'Boolean', initialize: (b) => isDef(b) ? bool(b) : false },

		// Feedback generated by the feedback rules. 
		// Feedback will be { has: 'values': args: [1,2,3]}
		feedback: { type: 'Array', initialize: (a) => isDef(a) && isArray(a) ? a : null },

		// Feedback is the generated result, and is sent to the client.
		// Form of [ '', '' ].
		// Null if not set, array otherwise.
		client_feedback: { type: 'Array', initialize: (a) => isDef(a) && isArray(a) ? a : null },

		// Template_values contains values that will be used to replace the {a} marks in 
		// any of the user-visible strings, as well as the solution.
		template_values: { type: 'Object', initialize: (o) => isDef(o) && isObject(o) ? o : {} },

		// After a page is completed, set TRUE so that no more updates are allowed.
		// This is done by code in server/ifGame, as the client doesn't know what the conditions are.
		completed: { type: 'Boolean', initialize: (b) => isDef(b) ? bool(b) : false },

		// Should we show feedback on this item after it is chosen?
		// Useful to differentiate between survey questions and those we want the user to know the right answer.
		show_feedback_on: { type: 'Boolean', initialize: (b) => isDef(b) ? bool(b) : true },

		// Problem Tags.
		// Used to help with analysis of question success and failure.
		// Either an empty array or an array with string tags.
		tags: { type: 'Array', initialize: (a) => isDef(a) && isArray(a) ? a : [] },

		// KCs.
		// A list of strings that are used to track the type of problem.
		kcs: { type: 'Array', initialize: (a) => isDef(a) && isArray(a) ? a : [] },
	};
}

/**
	Common base class for shared behavior.
*/
class IfPageBaseSchema extends Schema {

	get type()         {
		return 'IfPageBaseSchema';
	}


	/*
		When was this created?
		Find the oldest history item.
	*/
	get_first_update_date()        {
		const history = this.history.filter( h => h.code === 'client_update');
		return history.length > 0 
			? convert_to_date_if_string(history[0].dt)
			: null;
	}

	get_last_update_date()        {
		const history = this.history.filter( h => h.code === 'client_update');
		return history.length > 0 
			? convert_to_date_if_string(history[history.length-1].dt)
			: null;
	}

	get_max_period_in_ms()         {
		return 5*60*1000; // 5 minutes.
	}

	// Find out if this was abandoned.  I.E., how long did the user pause 
	// after starting before continuing.  This generally means that they were stuck.
	get_break_times_in_minutes()                {
		const max_period = this.get_max_period_in_ms();
		const first = this.get_first_update_date();
		const last = this.get_last_update_date();

		// Filter history to only have client_udpates.
		let history0 = this.history.filter( h => h.code === 'client_update' );

		// Early data didn't code client_update properly, doing it on the server.
		// Add filter to pull out anything any history item with a time earlier
		// than a previous entry.
		let history = history0.reduce( (accum, h) => {
			if(accum.length === 0) {
				// First.
				accum.push(h);
				return accum;
			} else if( accum[accum.length-1].dt < h.dt) {
				// Good!  Add + return.
				accum.push(h);
				return accum;
			} else {
				// dt occurs prior to earlier event. Don't add.
				return accum;
			}
		}, []);

		if(first === null || last === null || history.length < 1) return [];

		let abandoned = [];
		let last_ms_time = convert_to_date_if_string( history[0].dt ).getTime();
		let current_ms_time = 0;

		for(let i = 0; i < history.length; i++) {
			current_ms_time = convert_to_date_if_string( history[i].dt ).getTime();

			// Add on time
			// Note that stupid freaking clocks sometimes go backwards for an unknown
			// reason.  Not sure why....
			if( current_ms_time - last_ms_time > max_period &&
				current_ms_time - last_ms_time > 0 ) {   
				// Convert to minutes and push.
				abandoned.push( Math.round((current_ms_time - last_ms_time)/(1000*60) ) );
			}
			last_ms_time = current_ms_time;
		}

		return abandoned;
	}

	// Return the time from the first edit to the last edit.
	// Ignores periods with an update longer than 5 minutes.
	get_time_in_seconds()         {
		const max_period = this.get_max_period_in_ms();
		const first = this.get_first_update_date();
		const last = this.get_last_update_date();

		// Filter history to only have client_udpates.
		let history0 = this.history.filter( h => h.code === 'client_update' );

		// Early data didn't code client_update properly, doing it on the server.
		// Add filter to pull out anything any history item with a time earlier
		// than a previous entry.
		let history = history0.reduce( (accum, h) => {
			if(accum.length === 0) {
				// First.
				accum.push(h);
				return accum;
			} else if( accum[accum.length-1].dt < h.dt) {
				// Good!  Add + return.
				accum.push(h);
				return accum;
			} else {
				// dt occurs prior to earlier event. Don't add.
				return accum;
			}
		}, []);

		if(first === null || last === null) return 0;

		let ms = 0;
		let last_ms_time = 0;
		let current_ms_time = 0;

		for(let i = 0; i < history.length; i++) {
			current_ms_time = convert_to_date_if_string( history[i].dt ).getTime();

			// Add on time
			// Note that stupid freaking clocks sometimes go backwards for an unknown
			// reason.  Not sure why....
			if( current_ms_time - last_ms_time <= max_period &&
				current_ms_time - last_ms_time > 0 ) {   
				ms += current_ms_time - last_ms_time;
			}
			last_ms_time = current_ms_time;
		}

		if(ms < 0) {
			debugger;
		}

		return Math.round( ms / 1000 );
	}


	// Change the casing of the instructions, description, and help.
	// Loops through, changing the case of anything in a <code> block.
	// Will not change case of anything within "quotes".
	// E.g., 
	//	from:	"Blah <code>=IF(A1="Bob", 1, FALSE)</code> blah
	//	to:		"Blah <code>=if(a1="Bob", 1, false)</code> blah
	// Passing optional_field limits to a single field.  
	standardize_formula_case( optional_field         ) {
		if(typeof optional_field !== 'undefined') {
			// Swap out the given field.
			let s = this[optional_field];
			if(s === null || s === '') return;

			const block_reg = /<code>(.*?)<\/code>/g;
			let matches = s.match(block_reg);

			if(matches && matches !== null) {
				matches.map( dirty => {
					// Split formula into sections along " (double quotes)
					// Lowercase only if not inside.
					let splits = dirty.split('"');
					for(let i=0; i<splits.length; i++) {
						if( i%2 === 0) splits[i] = splits[i].toLowerCase();
					}
					let clean = splits.join('"');

					// Done!  Replace original.
					s = s.replace(dirty, clean);
				});
			}
			this[optional_field] = s;
			
		} else {
			this.standardize_formula_case('description');
			this.standardize_formula_case('instruction');
			this.standardize_formula_case('helpblock');
			if(typeof this.solution_f !== 'undefined') 
					this.standardize_formula_case('solution_f');
		}
	}
}


/*
	This pages displays information to the user.
*/
class IfPageTextSchema extends IfPageBaseSchema {

	constructor(json        ) {
		super(json); // set passed fields.
		this.updateCorrect();
	}

	get type()         {
		return 'IfPageTextSchema';
	}

	get schema()         {
		let inherit = common_schema();

		return {
			...inherit,
			client_read: { type: 'Boolean', initialize: (s) => isDef(s) ? bool(s) : false }
		};
	}

	// Has the user provided input?
	client_has_answered()          {
		return this.client_read;
	}

	// Automatically fill in the answer.
	// Used for testing out on the server. 
	debug_answer() {
		this.client_read = true;
		this.updateCorrect();
	}


	/*
		Update any fields for which user has permissions.
		
		Safe to re-run, with the exception that upon changing client_items, will
		reset this.correct (since we don't know its status).  Will re-run updateCorrect() in 
		case this is on the server and we're updating the object.

		Run upon initial obj creation.
	*/
	updateUserFields(json        ) {
		if(typeof json === 'undefined') throw new Error('IfGames.updateUserFields(json) is null');
		if(json.type !== this.type ) throw new Error('Invalid type '+json.type+' in ' + this.type + '.updateUserFields');

		// don't allow updates to finished items. Note that completed isn't set internally by this obj,
		// but instead is set by the server code with knowledge of each tutorial's rules.
		if(this.completed) return; 

		if(this.client_read !== json.client_read ){
			this.client_read = json.client_read;
			this.history = json.history;
		}

		this.updateCorrect();
	}

	/* 
		Update correct *if* a solution is provided.
		
		Don't updateFeedback, as this type never has feedback rules applied.
	*/
	updateCorrect() {
		if(this.completed) return; // do not update completed items.

		if(!this.client_read) return; // no client submission.

		this.client_feedback = [];
		this.correct = true;
	}

	// Return a nicely formatted view of the client's input. 
	toString()         {
		return '';
	}
}




/*
	Get a single-line piece of information from the user.
*/
class IfPageNumberAnswerSchema extends IfPageBaseSchema {

	constructor(json        ) {
		super(json); // set passed fields.
		this.updateCorrect();
	}

	get type()         {
		return 'IfPageNumberAnswerSchema';
	}

	get schema()         {
		let inherit = common_schema();

		return {
			...inherit,
			client: { type: 'number', initialize: (i) => isDef(i) && i !== null ? parseFloat(i) : null },
			solution: { type: 'number', initialize: (i) => isDef(i) ? parseFloat(i) : null }
		};
	}

	// Has the user provided input?
	client_has_answered()          {
		return this.client !== null;
	}


	// Automatically fill in the answer.
	// Used for testing out on the server. 
	debug_answer() {
		this.client = this.solution;
		this.updateCorrect();
	}


	/*
		Update any fields for which user has permissions.
		
		Safe to re-run, with the exception that upon changing client_items, will
		reset this.correct (since we don't know its status).  Will re-run updateCorrect() in 
		case this is on the server and we're updating the object.

		Run upon initial obj creation.
	*/
	updateUserFields(json        ) {
		if(typeof json === 'undefined') throw new Error('IfGames.updateUserFields(json) is null');
		if(json.type !== this.type ) throw new Error('Invalid type '+json.type+' in ' + this.type + '.updateUserFields');

		// don't allow updates to finished items. Note that completed isn't set internally by this obj,
		// but instead is set by the server code with knowledge of each tutorial's rules.
		if(this.completed) return; 

		if(this.client !== json.client ){
			this.client = json.client;
			this.history = json.history;
		}

		this.updateCorrect();
	}

	/* 
		Update correct *if* a solution is provided.
		
		Don't updateFeedback, as this type never has feedback rules applied.
	*/
	updateCorrect() {
		if(this.completed) return; // do not update completed items.

		if(!this.client === null) return; // no client submission.

		this.client_feedback = [];
		this.correct = Math.round(this.client*100)/100 === Math.round(this.solution*100)/100;
	}

	// Return a nicely formatted view of the client's input. 
	toString()         {
		return this.client;
	}
}



/*
	Get a single-line piece of information from the user.
*/
class IfPageShortTextAnswerSchema extends IfPageBaseSchema {

	constructor(json        ) {
		super(json); // set passed fields.
		this.updateCorrect();
	}

	get type()         {
		return 'IfPageShortTextAnswerSchema';
	}

	get schema()         {
		let inherit = common_schema();

		return {
			...inherit,
			client: { type: 'string', initialize: (s) => isDef(s) ? s : '' }
		};
	}

	// Has the user provided input?
	client_has_answered()          {
		return this.client.length > 0;
	}


	// Automatically fill in the answer.
	// Used for testing out on the server. 
	debug_answer() {
		this.client = 'ShortText';
		this.updateCorrect();
	}


	/*
		Update any fields for which user has permissions.
		
		Safe to re-run, with the exception that upon changing client_items, will
		reset this.correct (since we don't know its status).  Will re-run updateCorrect() in 
		case this is on the server and we're updating the object.

		Run upon initial obj creation.
	*/
	updateUserFields(json        ) {
		if(typeof json === 'undefined') throw new Error('IfGames.updateUserFields(json) is null');
		if(json.type !== this.type ) throw new Error('Invalid type '+json.type+' in ' + this.type + '.updateUserFields');

		// don't allow updates to finished items. Note that completed isn't set internally by this obj,
		// but instead is set by the server code with knowledge of each tutorial's rules.
		if(this.completed) return; 

		if(this.client !== json.client ){
			this.client = json.client;
			this.history = json.history;
		}

		this.updateCorrect();
	}

	/* 
		Update correct *if* a solution is provided.
		
		Don't updateFeedback, as this type never has feedback rules applied.
	*/
	updateCorrect() {
		if(this.completed) return; // do not update completed items.

		if(!this.client === '') return; // no client submission.

		this.client_feedback = [];
		this.correct = true;
	}

	// Return a nicely formatted view of the client's input. 
	toString()         {
		return this.client;
	}
}



/*
	Get a single-line piece of information from the user.
*/
class IfPageLongTextAnswerSchema extends IfPageShortTextAnswerSchema {

	get type()         {
		return 'IfPageLongTextAnswerSchema';
	}

	// Automatically fill in the answer.
	// Used for testing out on the server. 
	debug_answer() {
		this.client = 'LongText';
		this.updateCorrect();
	}
}




/*
	A page holds a single choice question.

	It can have either a correct choice or a range of choices.
	If a range of choices, then solution should be a wildcard ? or *.
*/
class IfPageChoiceSchema extends IfPageBaseSchema {

	constructor(json        ) {
		super(json); // set passed fields.
		this.updateCorrect();
	}

	get type()         {
		return 'IfPageChoiceSchema';
	}

	get schema()         {
		let inherit = common_schema();

		return {
			...inherit,
			client: { type: 'String', initialize: (s) => isDef(s) ? s : null },
			client_items: { type: 'Array', initialize: (a) => isDef(a) && isArray(a) ? noObjectsInArray(a) : [] },
			// Default solution to ?, which means that any answer is acceptable.
			solution: { type: 'String', initialize: (s) => isDef(s) ? s : '?' },

		};
	}

	// Has the user provided input?
	client_has_answered()          {
		return this.client !== null;
	}


	// Automatically fill in the answer.
	// Used for testing out on the server.  Not usable on client side, as 
	// solution will not be present.
	debug_answer() {
		if(typeof this.solution === 'undefined') {
			throw new Error('You can not debug answer without solution being present');
		}
		this.client = this.client_items[0];
		this.updateCorrect();
	}		

	/*
		Update any fields for which user has permissions.
		
		Safe to re-run, with the exception that upon changing client_items, will
		reset this.correct (since we don't know its status).  Will re-run updateCorrect() in 
		case this is on the server and we're updating the object.

		Run upon initial obj creation.
	*/
	updateUserFields(json        ) {
		if(typeof json === 'undefined') throw new Error('IfGames.updateUserFields(json) is null');
		if(json.type !== this.type ) throw new Error('Invalid type '+json.type+' in ' + this.type + '.updateUserFields');

		// don't allow updates to finished items. Note that completed isn't set internally by this obj,
		// but instead is set by the server code with knowledge of each tutorial's rules.
		if(this.completed) return;

		if(this.client !== json.client ){
			this.client = json.client;
			this.correct = null; // we no longer know if the solution is correct.
			this.history = json.history;
		}

		this.updateCorrect();
	}

	/* 
		Update correct *if* a solution is provided.
	*/
	updateCorrect() {
		if(this.completed) return; // do not update completed items.

		// Update feedback.
		//this.client_feedback = get_feedback(this);

		if(this.client === null) return; // no client submission.

		// Don't set if there is no available solution
		// Can be either from being on the client w/o (which won't get solutions)
		//		or being on the client or server with no correct answer.
		if(this.solution === null) return;

		// We have a solution and a client submission. set.
		if(this.solution === '?' || this.solution === '*') {
			this.correct = true;			
		} else {
			this.correct = (this.client.trim().toLowerCase() === this.solution.trim().toLowerCase());
		}
	}

	// Return a nicely formatted view of the client's input. 
	toString()         {
		return this.client === null ? '' : this.client;
	}

}




/*
	A page holds a single exercise.

	Pages used tests to validate the results of the client_f against solution_f.

	The solution fields are not sent to the client unless they have the _visible tag set.
*/
class IfPageParsonsSchema extends IfPageBaseSchema {

	constructor(json        ) {
		super(json); // set passed fields.
		this.updateCorrect();
	}

	get type()         {
		return 'IfPageParsonsSchema';
	}

	get schema()         {
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
	client_has_answered()          {
		return this.client_items !== null && this.client_items.length > 0;
	}

	// Automatically fill in the answer.
	// Used for testing out on the server.  Not usable on client side, as 
	// solution_f will not be present.
	debug_answer() {
		if(typeof this.solution_items === 'undefined' || this.solution_items.length < 1) {
			throw new Error('You can not debug answer without solution_items being present')
		}
		this.client_items = this.solution_items;
		this.updateCorrect();
	}		



	/*
		Update any fields for which user has permissions.
		
		Safe to re-run, with the exception that upon changing client_items, will
		reset this.correct (since we don't know its status).  Will re-run updateCorrect() in 
		case this is on the server and we're updating the object.

		Run upon initial obj creation.
	*/
	updateUserFields(json        ) {
		if(typeof json === 'undefined') throw new Error('IfGames.updateUserFields(json) is null');
		if(json.type !== this.type ) throw new Error('Invalid type '+json.type+' in ' + this.type + '.updateUserFields');

		// don't allow updates to finished items. Note that completed isn't set internally by this obj,
		// but instead is set by the server code with knowledge of each tutorial's rules.
		if(this.completed) return;

		// over-write server-set true/false if new values are being set.
		if(arrayDifferent(this.client_items,json.client_items)) this.correct = null; 

		this.client_items = json.client_items;
		this.history = json.history;
		if(!(json.history instanceof Array)) throw new Error('Invalid history type '+typeof history);
		
		// Update level parsing as needed.
		this.updateCorrect();
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
		if(this.solution_items.length < 1) return;

		// Start testing with the assumption of correctness.
		this.correct = true;

		// Check individual answers
		for(let i=0; i<this.solution_items.length && this.correct; i++) {
			this.correct = (this.client_items[i] == this.solution_items[i]);
		}

		this.client_feedback = [];
	}

	// Return a nicely formatted view of the client's input. 
	toString()         {
		let items = this.client_items === null ? [] : this.client_items.slice().reverse();
		return items.reduce( (accum, item) => item+(accum.length>0 ? ', ': '')+accum, '');
	}

}



/*
	A page holds a single exercise.

	Pages used tests to validate the results of the client_f against solution_f.

	The solution fields are not sent to the client unless they have the _visible tag set.
*/
class IfPageFormulaSchema extends IfPageBaseSchema {

	constructor(json        ) {
		super(json); // set passed fields.

		this.updateSolutionTestResults();
		this.updateClientTestResults();
		this.updateCorrect();
	}

	get type()         {
		return 'IfPageFormulaSchema';
	}

	get schema()         {
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
			solution_test_results: { type: 'Array', initialize: (a) => isDef(a) && isArray(a) ? a : [] },

			// Should we show students the results of the solutions, or the solutions themselves?
			solution_f_visible: { type: 'Boolean', initialize: (s) => isDef(s) ? bool(s) : false },
			solution_test_results_visible: { type: 'Boolean', initialize: (s) => isDef(s) ? s : false },


		};
	}

	// Has the user provided input?
	client_has_answered()          {
		return this.client_f !== null && this.client_f.length > 0;
	}


	// Automatically fill in the answer.
	// Used for testing out on the server.  Not usable on client side, as 
	// solution_f will not be present.
	debug_answer() {
		if(typeof this.solution_f === 'undefined') {
			throw new Error('You can not debug answer without solution_f being present');
		}
		this.client_f = fill_template(this.solution_f, this.template_values);
		this.updateCorrect();
	}		


	// Update any fields for which user has permissions.
	// Save to re-run.  Can also run upon initial obj creation.
	updateUserFields(json        ) {
		if(typeof json === 'undefined') throw new Error('IfGames.updateUserFields(json) is null');
		if(json.type !== this.type ) throw new Error('Invalid type '+json.type+' in ' + this.type + '.updateUserFields');

		// don't allow updates to finished items. Note that completed isn't set internally by this obj,
		// but instead is set by the server code with knowledge of each tutorial's rules.
		
		if(this.completed && this.client_f !== json.client_f) throw new Error('Invalid attempt to update completed client_f');
		if(this.completed) return;

		const old_client_f = this.client_f;
		this.client_f = json.client_f;
		this.history = Array.from(json.history);

		const code = is_server() ? 'server_update' : 'client_update';

		// If the old and new solutions don't match, the null out the correct variable and the client feedback.
		// We do this as it no longer pertains to the solution.
		if(old_client_f !== json.client_f) {
			this.correct = null;
			this.client_feedback = null;

			// Update history.
			this.history.push({
					dt: new Date(),
					code: code,
					client_f: json.client_f, 
					correct: this.correct
			});

			// Update level parsing as needed.
			this.updateSolutionTestResults();
			this.updateClientTestResults();
			this.updateCorrect();
		}


	}


	// Parse each test with the client code.
	updateClientTestResults() {
		if(this.client_f === null || this.client_f.length < 1) return;
		const client_f = this.client_f; //fill_template(this.client_f, this.template_values);

		this.client_test_results = this.tests.map( t => this.__parse(client_f, t, this.client_f_format));
	}


	/**
		If needed, update solutions. This happens upon creation of a new page.
		Make sure that we actually have a solution before generating anything.
	*/
	updateSolutionTestResults() {
		const solution_f = fill_template(this.solution_f, this.template_values);
		if(this.solution_f === null || this.solution_f.length < 1) return;

		this.solution_test_results = this.tests.map( t => this.__parse(solution_f, t, this.client_f_format) );
	}


	// Refresh the this.correct variable. Relies upon client test results being run.
	// If solution tests aren't run (or available), sets correct to null.
	updateCorrect() {
		// Checks to see if we are set to complete.  If so, do not update.
		// Happens when the server provides us a json with .completed set.
		if(this.completed) return;

		// Create custom feedback.
		// See if we are on the client, in which case feedback is not provided.
		if(typeof this.feedback !== 'undefined' &&
				this.feedback !== null) {

			this.client_feedback = get_feedback(this);
		} 

		// Check to see if we have any input from the user.
		if(this.client_f === null || this.client_f.length < 1) {
			this.correct = null;
			return;
		}

		// If we don't have a solution, then (i.e., on the client) then just keep the old
		// correct variable.  Don't over-write it, as we may be on the client and
		// are reading out the result of the server's code.
		if(typeof this.solution_f === 'undefined' || this. solution_f === null) {
			return;
		}


		// Start testing with the assumption of correctness.
		this.correct = true;

		// Since we are actually testing, make solution results visible after something
		//  has been submitted and no more changes are possible.
		this.solution_test_results_visible = true;

		// Feedback may be null if we're on the client, not server.
		// But, if it's not null, and longer than zero, then this is not correct.
		if(typeof this.client_feedback !== 'undefined' && this.client_feedback !== null ) {
			this.correct = (this.client_feedback.length === 0);
			if(!this.correct) return;
		}

		// Check individual answers
		for(let i=0; i<this.client_test_results.length && this.correct; i++) {

			if(typeof this.client_test_results[i].result === 'string') {
				// String.
				this.correct = (
					this.client_test_results[i].result == 
					this.solution_test_results[i].result
					);
			} else {
				// Number.
				// Rounds to 2 decimal points to avoid problems with floating point numbers.
				this.correct = (
					Math.round(this.client_test_results[i].result * 100) == 
					Math.round(this.solution_test_results[i].result * 100)
					);
			}
		}
		if(!this.correct) return;

		// Check to make sure that there are no errors. If any errors, fail.
		this.correct = (0 === this.client_test_results.filter( t => t.error !== null ).length);

		if(!this.correct) return;


	}

	/*
		Utility function to fix issues with parser function
	*/
	__clean_parse_formula( dirty_formula         )         {
		let d = /\d/;
		let formula = dirty_formula.trim(); 

		// Issue 1: Parser doesn't work with .1, so change to 0.1
		
		// Go through the formula, testing to see if we have a non-digit . digit pattern.
		// JS doesn't have look behinds, so we can't use a regex like a normal human.
		// E.g., (?!\D\).(?=\d) pattern
		for(let i=0; i < formula.length; i++) {
			if(	formula.substr(i,1) === '.' && 
				d.test(formula.substr(i+1,1)) &&  
				formula.substr(i+1,1).length > 0 &&
				!d.test(formula.substr(i-1, 1))
				) {
				// Found an example!  Clean by inserting a leading zero.
				formula = formula.slice(0, i) + '0' + formula.substr(i);

			}
		}

		// Issue 2: Excel isn't case sensitive, but string comparisons with parser are.
		// Lowercase everything.
		formula = formula.toLowerCase();


		// Issue 3: Change true=>TRUE, and false=>FALSE.
		// Note that this has to happen after toLowerCase.
		formula = formula.replace( /true/ig, 'TRUE').replace( /false/ig, 'FALSE');


		// Issue 4: Excel doesn't like single-quotes ' but parser is ok with it.
		// Change formula to one that generates an error.
		if(formula.match(/'/) !== null) {
			formula = '=1/';
		}


		return formula;
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
	__parse(formula        , current_test            , s_format        )         {

		// Update test results.
		//let columns = Object.keys(this.tests[0]);
		let parser = new FormulaParser();
		let res = { result: null, error: null };

		// Get int position of a letter.
		let i_to_alpha = (i        )         => 'abcdefghijklmnopqrstuvwxyz'.substr(i, 1);


		// Add a hook for getting variables.
		// Requires that all passed coordinates are on the first row.
		parser.on('callCellValue', function(cellCoord, done) {
			let coor = cellCoord.label.toLowerCase();
			if(coor.substr(1) !== '1') {
				throw new Error('#REF '+ coor);
			}
			if(typeof current_test[coor.substr(0,1)] === 'undefined') {
				throw new Error('#REF' + coor);
			}
			let res = current_test[coor.substr(0,1)];
			done(typeof res ==='string' ? res.toLowerCase() : res );
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
		let clean_formula = this.__clean_parse_formula(formula);

		// Require formulas must start with `=`.  
		if(clean_formula !== null && clean_formula.substr(0,1) === '=') {
			try {
				res =  parser.parse(clean_formula.substr(1));  // Parser doesn't want a starting `=`
			} catch(e) {
				console.log(res);
				res.error = '#ERROR!';

			}
		}


		// See if the result is a date.  If so, go ahead and transform it according to the
		// given format code. Otherwise, we get the default toString behavior, which gives us
		// a string like '2018-10-04T16:12:12.345Z'.
		if( s_format === 'shortdate' 
				&& typeof res.result !== 'undefined'
				&& res.result !== null
				&& typeof res.result === 'object' 
				&& typeof res.result.toLocaleDateString !== 'undefined') {
			res.result = res.result.toLocaleDateString('en-US');
		}


		// Go through results and round any floating point numbers
		// to 2 decimal points.
		if(typeof res.result === 'number' && !isInteger(res.result)) {
			res.result = Math.round(res.result*100)/100;
		}

		return res;
	}



	// Return a nicely formatted view of the client's input. 
	// Don't return nulls but instead an empty string.
	toString()         {
		return this.client_f === null ? '': this.client_f;
	}
}




/*
	This page holds a single exercise for formula using a horizontal parsons (harsons).
	It's the same as the FormulaSchema, with the addition of a toolbox.
*/
class IfPageHarsonsSchema extends IfPageFormulaSchema {


	get type()         {
		return 'IfPageHarsonsSchema';
	}

	get schema()         {
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
			solution_test_results: { type: 'Array', initialize: (a) => isDef(a) && isArray(a) ? a : [] },

			// Should we show students the results of the solutions, or the solutions themselves?
			solution_f_visible: { type: 'Boolean', initialize: (s) => isDef(s) ? bool(s) : false },
			solution_test_results_visible: { type: 'Boolean', initialize: (s) => isDef(s) ? s : false },

			// What blockly blocks should be included?
			// This should be an array of strings.
			toolbox: { type: 'Array', initialize: (a) => isDef(a) && isArray(a) ? a : [] }
		};
	}
}





module.exports = {
	IfPageTextSchema,
	IfPageChoiceSchema,
	IfPageFormulaSchema,
	IfPageParsonsSchema,
	IfPageHarsonsSchema,
	IfPageNumberAnswerSchema,
	IfPageShortTextAnswerSchema,
	IfPageLongTextAnswerSchema
};
