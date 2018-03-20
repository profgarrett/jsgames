const { Schema } = require('./Schema');
const { Score } = require('./Score');

var FormulaParser = require('hot-formula-parser').Parser;


// Convenience function for initializing schema.
let isDef = function(v) {
	return typeof v !== 'undefined';
};


/*
	A page holds a single exercise.

	Pages used tests to validate the results of the client_f against solution_f.


	The solution fields are not sent to the client unless they have the _visible tag set.
*/
class IfPageSchema extends Schema {

	get schema() {
		return {
			description: { type: 'String', initialize: (s) => isDef(s) ? s : null },
			helpblock: { type: 'String', initialize: (s) => isDef(s) ? s : null },

			// Used by this.parse to test client_f against solution_f.
			tests: { type: 'Array', initialize: (s) => isDef(s) ? s : [] },

			client_f: { type: 'Javascript', initialize: (s) => isDef(s) ? s : null },
			client_test_results: { type: 'Array', initialize: (s) => isDef(s) ? s : [] },

			solution_f: { type: 'Javascript', initialize: (s) => isDef(s) ? s : null },
			solution_test_results: { type: 'Array', initialize: (s) => isDef(s) ? s : [] },

			// Should we show students the results of the solutions, or the solutions themselves?
			solution_f_visible: { type: 'Boolean', initialize: (s) => isDef(s) ? s : false },
			solution_test_results_visible: { type: 'Boolean', initialize: (s) => isDef(s) ? s : false },

			// Set by this.parse()
			correct: { type: 'Boolean', initialize: (b) => isDef(b) ? b : null },


			// Do the results need to be correct to save the results?
			correct_required: { type: 'Boolean', initialize: (b) => isDef(b) ? b : false }
		};
	}

	// If items have a function called updateUserFields, then run it on it one with the correct json.
	// Assumes unmodified array order.
	updateUserFields(json) {
		if(json.type !== this.type ) 
			throw new Error('Invalid type '+json.type+' provided  to ' + this.type + '.updateUserFields');
		
		this.client_f = json.client_f;
		//this.client_test_results = json.client_test_results;
		
		return this;
	}

	/*
		Parse out client_f to see if it has the correct results.
		Note that this will not set this.correct if the current object doesn't have
			the solutions provided.
		Code can be run on both client and server, with and without correct results.
		Cell references in the raw data must be lowercase.
		Documentation: https://www.npmjs.com/package/hot-formula-parser
	*/
	parse() {

		// Update test results.
		let parser = new FormulaParser();
		let columns = Object.keys(this.tests[0]);
		let current_test = {};
		let alpha = 'abcdefghijklmnopqrstuvwxyz'; 

		let i_to_alpha = i => alpha.substr(i, 1);

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


		parser.on('callRangeValue', function(startCellCoord, endCellCoord, done) {
			let fragment = [];

			// Only allow
			if(startCellCoord.row.index !== 0 || endCellCoord.row.index !== 0) {
				throw new Error('#REF');
			}

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


		// Parse after setting variables
		// Note that this will not parse anything that doesn't start with an =
		// However, the parser doesn't want the =, so remove it before passing.
		let parse = (f, vars) => {
			let res = { result: null, error: null };

			if(f!== null && f.substr(0,1) === '=') {
				// Set the parse.current_test variable.  This reference is used
				// for the parser to find the current value.
				current_test = vars;

				try {
					res =  parser.parse(f.substr(1));
				} catch(e) {
					//console.log(e);
					res.error = '#REF!';
				}
			}
			return res;
		};

		// If needed, update solutions. This happens upon creation of a new page.
		// Make sure that we actually have a solution before generating anything.
		if(this.solution_test_results.length !== this.tests.length && this.solution_f !== null && this.solution_f.length > 0) {
			this.solution_test_results = this.tests.map( t => parse(this.solution_f, t ) );
		}

		// Parse each test with the client code.
		this.client_test_results = this.tests.map( t => parse(this.client_f, t));

		// Check to see if we can provide a solution.
		// Solutions are not always available, in which case is set to null.
		if(this.solution_test_results.length === this.tests.length && this.client_f !== null) {
			this.correct = true; // assume true until otherwise.

			// Check individual answers
			for(let i=0; i<this.client_test_results.length && this.correct; i++) {
				//console.log({ 'c': this.client_test_results[i].result, 's': this.solution_test_results[i].result });
				this.correct = this.client_test_results[i].result == this.solution_test_results[i].result;
			}

			// Check to make sure that there are no errors. If any errors, fail.
			if(this.correct) {
				//console.log('check for errors');
				this.correct = 0 === this.client_test_results.filter( t => t.error !== null ).length;
			}
		} else {
			// unknown solution and/or no client formula given.
			this.correct = null; 
		}

		return this;
	}

}


/*
	A level is the owner object which can be created and used.
	It contains multiple pages.
*/
class IfLevelSchema extends Schema {

	get schema() {
		// clean-up functions

		// Ensure that all returned functions are arrays.
		const a = unknown => typeof unknown === 'string' ? JSON.parse(unknown) : unknown;
		
		// Convert 0/1 to true/false.
		const b = unknown => unknown === 0 ? false : (unknown === 1 ? true : unknown);

		return {
			_id: { type: 'String', initialize: (s) => isDef(s) ? s : null },
			username: { type: 'String', initialize: (s) => isDef(s) ? s : null },

			code: { type: 'String', initialize: (s) => isDef(s) ? s : null },
			title: { type: 'String', initialize: (s) => isDef(s) ? s : null },
			description: { type: 'String', initialize: (s) => isDef(s) ? s : null },

			completed: { type: 'Boolean', initialize: (s) => isDef(s) ? b(s) : false },

			pages: { type: 'Array', initialize: (aJ) => isDef(aJ) ? a(aJ).map(j => new IfPageSchema(j) ) : [] },
			history: { type: 'Array', initialize: (aJ) => isDef(aJ) ? a(aJ).map(j => new IfPageSchema(j) ) : [] },

			score: { type: 'Score', initialize: (s) => new Score(s) },
			
			updated: { type: 'Date', initialize: (dt) => isDef(dt) ? new Date(dt) : Date() },
			created: { type: 'Date', initialize: (dt) => isDef(dt) ? new Date(dt) : Date() }
		};
	}

	updateUserFields(json) {
		if(json.type !== this.type ) 
			throw new Error('Invalid type '+json.type+' provided  to ' + this.type + '.updateUserFields');

		this.pages.map( (p, index) => p.updateUserFields(json.pages[index]) );

		return this;
	}

	parse() {
		this.pages.map( p => p.parse());
		return this;
	}

}


const IfLevels = [
	{ code: 'tutorial', label: 'Website Introduction', description: 'Learn about this website.' },
	{ code: 'math', label: 'Math operations', description: 'Create formulas with math symbols.' },
	{ code: 'sum', label: 'Sum function', description: 'Learn how to use the SUM function.' },
	{ code: 'text', label: 'Text functions', description: 'Learn a number of useful text functions' },
	{ code: 'if1', label: 'IF Conditions', description: 'Learn how to create IF conditions' },
	{ code: 'if2', label: 'IF Function', description: 'Learn how to use the IF function' }
];


module.exports = {
	IfLevels,
	IfLevelSchema,
	IfPageSchema
};

