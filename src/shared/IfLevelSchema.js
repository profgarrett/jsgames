// @flow
const { Schema, isDef  } = require('./Schema');
const { get_page_schema_as_class, IfPageBaseSchema,
		IfPageTextSchema, IfPageChoiceSchema, 
		IfPageFormulaSchema, IfPageSliderSchema,
		IfPageParsonsSchema, IfPageHarsonsSchema,
		IfPageNumberAnswerSchema, IfPageShortTextAnswerSchema } = require('./IfPageSchemas');

/** 
	This const is used to provide a list of available tutorials.
	Used on both client and server.

	Code value must match the filename in server/tutorial/...js
*/
const IfLevels = [
	{ code: 'tutorial', title: 'Website Introduction', description: 'Learn how to create formulas.' },

	{ code: 'math1', title: 'Math 1', description: 'Use addition, subtraction, multiplication, and division' },
	{ code: 'math1review', title: 'Math 1 Review', description: 'Review arithmetic operations' },
	{ code: 'math2', title: 'Math 2', description: 'Learn new ways to use multiplication and division.' },
	{ code: 'math2review', title: 'Math 2 Review', description: 'Review division and multiplication' },
	{ code: 'math3', title: 'Math 3', description: 'Learn exponents, parentheses, and order of operations' },
	{ code: 'math3review', title: 'Math 3 Review', description: 'Review exponents, parentheses, and order of operations' },
	{ code: 'math4', title: 'Math 4', description: 'Learn growth and rounding functions' },
	{ code: 'math4review', title: 'Math 4 Review', description: 'Review growth and rounding functions' },

	{ code: 'functions1', title: 'Functions 1', description: 'Learn how to use range and rounding functions.' },
	{ code: 'functions1review', title: 'Functions 1 Review', description: 'Review basic functions.' },
	{ code: 'functions2', title: 'Functions 2', description: 'Learn date and text functions.' },
	{ code: 'functions2review', title: 'Functions 2 Review', description: 'Review more functions.' },

	{ code: 'if1', title: 'IF1: Logical number comparisons', description: 'Compare numbers' },
	{ code: 'if2', title: 'IF2: Logical text comparisons', description: 'Compare words' },
	{ code: 'if3', title: 'IF3: the IF function', description: 'Create simple formulas with IF' },
	{ code: 'if4', title: 'IF4: Logical functions', description: 'Learn about AND, OR, & NOT' },
	{ code: 'if5', title: 'IF5: Logical functions and IF', description: 'Use AND, OR, & NOT inside of IF' },
	{ code: 'if6', title: 'IF6: IF and Math', description: 'Embed math inside of an IF' },
	{ code: 'if7', title: 'IF7: Booleans 1', description: 'Figure out TRUE and FALSE' },
	{ code: 'if8', title: 'IF8: Booleans 2', description: 'Use booleans with the AND & OR functions' },

	{ code: 'surveymath1', title: 'Survey of Math Concepts 1', description: 'Review your math concepts' },
	{ code: 'surveymath2', title: 'Survey of Math Concepts 2', description: 'Review your math concepts' },

	{ code: 'surveywaiver_non_woodbury_student', title: 'Student Account Setup', description: 'Learn about this website and answer several questions' },
	{ code: 'surveywaiver_non_woodbury_user', title: 'Anonymous User Account Setup', description: 'Learn about this website and answer several questions' },
	{ code: 'surveywaiver_woodbury_student', title: 'Woodbury Student Account Setup', description: 'Learn about this website and answer several questions' },
	
	{ code: 'surveycharts_amt', title: 'Chart Survey (AMT)', description: 'Test your ability to interpret common charts' },
	{ code: 'surveycharts_wu', title: 'Chart Survey', description: 'Assess your ability to interpret common charts' },

];



// Convert dt to date if it is text.
function convert_to_date_if_string( s: any): Date {
		if(typeof s === 'string') return new Date(s);
		return s;
}

// Ensure that any given strings (from JSON.stringify) are parsed into their actual objects.
const a = (unknown: any): any => typeof unknown === 'string' ? JSON.parse(unknown) : unknown;

// Convert 0/1 to true/false.
const b = (unknown: any): boolean => unknown === 0 ? false : (unknown === 1 ? true : unknown);

// Convert from UTC int into a date.
const from_int_dt = (unknown: any): any => {
	if(typeof unknown === 'string') {
		throw new Error('Invalid type ' + typeof unknown + ' "'+unknown+'" used in IfLevelSchema');
	}
	return new Date(unknown);
};

class IfLevelSuccess extends Schema {
	tutorial_pages: number
	test_pages: number
	test_pages_correct: number

	get type(): string {
		return 'IfLevelSuccess';
	}

	get schema(): Object {
		return {
			// The seed value is used to initialize random behavior for pages.
			// Declaring it in the level allows for predictable behavior as pages are generated.
			tutorial_pages: { type: 'number', initialize: (i) => isDef(i) ? i : null },
			test_pages: { type: 'number', initialize: (i) => isDef(i) ? i : null },
			test_pages_correct: { type: 'number', initialize: (i) => isDef(i) ? i : null },
		}
	};
}


class IfLevelBaseSchema extends Schema {
	_id: string
	code: string
	username: string

	seed: number
	harsons_randomly_on_username: boolean
	standardize_formula_case: boolean
	show_score_after_completing: boolean
	
	title: string
	description: string
	updated: Date
	created: Date

	completed: boolean

	history: Array<Object>
	allow_skipping_tutorial: boolean

	show_progress: boolean

	get type(): string {
		return 'IfLevelBaseSchema';
	}


	// Keep most functionality here, as we will over-ride schema in inheriting class.
	_level_schema_no_pages(): Object {
		// clean-up functions

		return {
			_id: { type: 'String', initialize: (s) => isDef(s) ? s : null },
			username: { type: 'String', initialize: (s) => isDef(s) ? s : null },

			// The seed value is used to initialize random behavior for pages.
			// Declaring it in the level allows for predictable behavior as pages are generated.
			seed: { type: 'number', initialize: (dbl) => isDef(dbl) ? dbl : Math.round(100000*Math.random()) },

			// Should half of users get Harsons instead of formula pages?
			harsons_randomly_on_username: { type: 'Boolean', initialize: (i) => isDef(i) ? b(i) : false },

			// should we go through the instructions and standardize formula sentence case?
			standardize_formula_case: { type: 'Boolean', initialize: (i) => isDef(i) ? b(i) : false },

			code: { type: 'String', initialize: (s) => isDef(s) ? s : null },
			title: { type: 'String', initialize: (s) => isDef(s) ? s : null },
			description: { type: 'String', initialize: (s) => isDef(s) ? s : null },

			completed: { type: 'Boolean', initialize: (s) => isDef(s) ? b(s) : false },
			
			allow_skipping_tutorial: { type: 'Boolean', initialize: (i) => isDef(i) ? b(i) : false },

			show_score_after_completing: { type: 'Boolean', initialize: (i) => isDef(i) ? b(i) : true },

			history: { type: 'Array', initialize: (aH) => isDef(aH) ? a(aH) : [] },

			updated: { type: 'Date', initialize: (dt) => isDef(dt) ? from_int_dt(dt) : Date() }, 
			created: { type: 'Date', initialize: (dt) => isDef(dt) ? from_int_dt(dt) : Date() },

			// Version tracks the underlying version of the tutorial.  Used to create new versions of 
			// tutorials and track when analyzing results.
			version: { type: 'number', initialize: (dbl) => isDef(dbl) ? dbl : 0 },

			// Should we show a progress meter while they work on the assignment?  Default to yes.
			show_progress: { type: 'Boolean', initialize: (s) => isDef(s) ? b(s) : true },

			// Success
			/*
			success: { 
				type: 'String', 
				initialize: (o_as_string) => isDef(o_as_string) 
					? new IfLevelSuccess(JSON.parse(o_as_string)) 
					: null 
			}
			*/
		};
	}
}



/*
	A level is the owner object which can be created and used.
	It contains multiple pages.
*/
class IfLevelSchema extends IfLevelBaseSchema {
	pages: Array<IfPageBaseSchema>

	get type(): string {
		return 'IfLevelSchema';
	}

	get schema(): Object {
		return this._level_schema();
	}

	// Actual called object. Includes pages.
	_level_schema(): Object {
		const schema = this._level_schema_no_pages();
		schema.pages = { type: 'Array', initialize: (aJ) => isDef(aJ) ? a(aJ).map(j => {
						return get_page_schema_as_class(j);
					}) : [] };
		
		return schema;
	}


	/*
		Build score from any page implementing 'score' (or items[1..].score)
		Anything other than TRUE or FALSE will be stored as null.  Null means either
		that it doesn't get scored, of if in the last place, that it's in progress.
	
		Return the results as an array of whatever is passed.
	*/
	get_score_as_array(y: any = 1, n: any = 0, unscored_but_completed: any, last_in_progress: any): Array<any> {
		// Make sure that true/false/null are the only allowed options.
		let pages = this.pages;

		// Run some checks to validate correctness.
		pages.map( (p: IfPageBaseSchema) => {
			if(p.correct !== true && p.correct !== false && p.correct !== null) 
				throw new Error('score.refresh.if.p.correct.isnottrueorfalseornull');
			});

		if(pages.length > 0) {
			// Make sure that the last page is correctly null or not. If not, then truncate.
			if(this.completed) {
				// Last page check
				if(pages[pages.length-1].correct === null)
					throw new Error('IfGame.Shared.Level.get_score_as_array found completed last null');
			} else {
				// Last page is not completed, pop off.
				if(pages[pages.length-1].correct !== null) {
					pages = pages.slice().pop();
				}
				//throw new Error('IfGame.Shared.Level.get_score_as_array found uncompleted last not null');
			}

		}

		this.pages.map( (p: IfPageBaseSchema) => {
			if(p.correct !== true && p.correct !== false && p.correct !== null) 
				throw new Error('score.refresh.if.p.correct.isnottrueorfalseornull');
			});


		// Map
		let results = this.pages.map( (p: IfPageBaseSchema): Array<any> => {

			if(p.correct === null) return unscored_but_completed; 
			if(p.correct_required && p.correct) return y;
			if(p.correct_required && !p.correct) return n;
			
			return unscored_but_completed; //condition: if(p.correct_required) 
		});

		// If the last item is null, change to last_in_progress
		if(results.length > 0 && results[results.length-1].correct === null ) {
			results.pop();
			results.push(last_in_progress);
		}

		return results;
	}

	get_test_score_correct(): number {
		return this.pages.filter( p => p.code === 'test' && p.completed && p.correct ).length;
	}
	get_test_score_incorrect(): number {
		return this.pages.filter( p => p.code === 'test' && p.completed && !p.correct ).length;
	}
	get_test_score_attempted(): number {
		return this.pages.filter( p => p.code === 'test' && p.completed ).length;
	}
	get_tutorial_pages_completed(): number {
		return this.pages.filter( p => p.code === 'tutorial' && p.completed === true ).length;
	}
	get_tutorial_pages_uncompleted(): number {
		return this.pages.filter( p => p.code === 'tutorial' && p.completed !== true ).length;
	}

	get_test_score_as_percent(): number | null {
		const attempted = this.get_test_score_attempted();
		if( !this.completed ) 
			throw new Error('You can not run get_test_score_as_percent before a level has been completed');

		// If there are no actual test pages, but the tutorial has been completed, then return 100%
		if( attempted < 1 ) return 100;

		// Return the rounded result.
		return Math.round(100 * this.get_test_score_correct() / attempted); 
	}



	/*
		When was this created?
		Find the oldest page.
	*/
	get_first_update_date(): ?Date {
		return this.history.length > 0 
			? convert_to_date_if_string(this.history[0].dt)
			: null;
	}

	get_last_update_date(): ?Date {
		return this.history.length > 0 
			? convert_to_date_if_string(this.history[this.history.length-1].dt)
			: null;
	}

	// Return the time from the first edit to the last edit.
	get_time_in_minutes(): number {
		const first = this.get_first_update_date();
		const last = this.get_last_update_date();

		if(first === null || last === null) return 0;
		if(typeof first === 'undefined' || typeof last === 'undefined') return 0;

		return Math.round( (last.getTime() - first.getTime()) / 60000 );
	}

	updateUserFields(json: Object) {
		if(json.type !== this.type )
			throw new Error('Invalid type '+json.type+' provided to ' + this.type + '.updateUserFields');
		if(!(this.history instanceof Array)) 
			throw new Error('Invalid history type in updateUserFields');
		
		// Update any pages with matching json.
		// Some pages may not have matching json, as server updates level by adding new pages.
		this.pages.map( (p: IfPageBaseSchema, index: number) => {
			if(typeof json.pages[index] !== 'undefined') {
				p.updateUserFields(json.pages[index]);
			}
		});
		
		this.history = [...this.history, { dt: new Date(), code: 'shared_updateUserFields'}];
		this.updated = new Date();

	}

}


/**
	This is a reduced class, which doesn't include any pages data.
	Reduces the impact on the server when we are just fetching a few key field.
*/
class IfLevelSchema_NoPages extends IfLevelBaseSchema {
	get type(): string {
		return 'IfLevelSchema_NoPages'
	}

	_level_schema(): Object {
		return this._level_schema_no_pages();
	}
}


module.exports = {
	IfLevels,
	IfLevelSchema,
	IfLevelSchema_NoPages,
};	