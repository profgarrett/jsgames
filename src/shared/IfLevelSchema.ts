import { Schema, isDef } from './Schema';
import { get_page_schema_as_class, IfPageBaseSchema } from './IfPageSchemas';

/*
IfPageTextSchema, IfPageChoiceSchema, 
		IfPageFormulaSchema, IfPageSliderSchema,
		IfPageParsonsSchema, IfPageHarsonsSchema,
IfPageNumberAnswerSchema, IfPageShortTextAnswerSchema 
*/


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
	{ code: 'functions2', title: 'Functions 2', description: 'Learn how to use date and text functions.' },
	{ code: 'functions2review', title: 'Functions 2 Review', description: 'Review date and text functions.' },

	// Revised focused function tutorials.
	{ code: 'functionsdates', title: 'Functions - Dates', description: 'Learn about date functions.' },
	{ code: 'functionstext1', title: 'Functions - Text 1', description: 'Learn about basic text functions.' },
	{ code: 'functionstext2', title: 'Functions - Text 2', description: 'Use advanced text functions.' },

	{ code: 'financial1', title: 'Functions - Financial 1', description: 'Introduction to financial functions.' },
	{ code: 'financial2', title: 'Functions - Financial 2', description: 'More financial functions.' },

	{ code: 'if1', title: 'IF1: Logical comparisons', description: 'Compare numbers and text' },
	{ code: 'if2', title: 'IF2: Returns', description: 'Return numbers and text' },
	{ code: 'if3', title: 'IF3: Math', description: 'Embed math into the IF function' },
	{ code: 'if4', title: 'IF4: AND', description: 'Use the AND function' },
	{ code: 'if5', title: 'IF5: OR', description: 'Use the OR function' },
	{ code: 'if6', title: 'IF6: AND Booleans', description: 'Use booleans inside of AND' },
	{ code: 'if7', title: 'IF7: OR Booleans', description: 'Use booleans inside of OR' },
	{ code: 'if8', title: 'IF8: TBD', description: 'TBD' },

	{ code: 'surveymath1', title: 'Survey of Math Concepts 1', description: 'Review your math concepts' },
	{ code: 'surveymath2', title: 'Survey of Math Concepts 2', description: 'Review your math concepts' },

	{ code: 'surveywaiver_non_woodbury_student', title: 'Student Account Setup', description: 'Learn about this website and answer several questions' },
	{ code: 'surveywaiver_non_woodbury_user', title: 'Anonymous User Account Setup', description: 'Learn about this website and answer several questions' },
	{ code: 'surveywaiver_woodbury_student', title: 'Woodbury Student Account Setup', description: 'Learn about this website and answer several questions' },
	{ code: 'surveywaiver_wvu_user', title: 'WVU Account Setup', description: 'Learn about this website' },
		
	{ code: 'surveycharts_amt', title: 'Chart Survey (AMT)', description: 'Test your ability to interpret common charts' },
	{ code: 'surveycharts_wu', title: 'Chart Survey', description: 'Assess your ability to interpret common charts' },

	{ code: 'sql_selectfrom', title: 'SQL - SELECT and FROM', description: 'Introduction to SQL and getting data from a table' },
	{ code: 'sql_orderby', title: 'SQL - ORDER BY', description: 'Sort data from a query' },
	{ code: 'sql_where', title: 'SQL - WHERE', description: 'Filter rows from a query' },
	{ code: 'sql_where_and_or', title: 'SQL - AND / OR', description: 'More complex logical tests' },
	{ code: 'sql_join_inner', title: 'SQL - INNER JOIN', description: 'Join two tables with INNER JOIN' },
	{ code: 'sql_join_leftouter', title: 'SQL - LEFT OUTER JOIN', description: 'Join two tables with partial matches '},
	{ code: 'sql_join_self', title: 'SQL - Self join', description: 'Practice joining a table to itself'},
	{ code: 'sql_join_keys', title: 'SQL - Key Practice', description: 'Practice joining tables on different keys' },
	{ code: 'sql_groupby', title: 'SQL - GROUP BY', description: 'Calculate summaries of rows'},
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





// Number to increment after updating props. Will cause a refresh of all pages when
// the next api sql update is hit.
const LEVEL_DERIVED_PROPS_VERSION = 1;


/*
	This class is used as a way of storing a strongly-typed pre-computed
	object of expensive properties.

	It should be created by the IfLevelSchema.refresh_derived_props method
*/
class IfLevelDerivedProps extends Schema {
	pages_length!: number;
	test_score_as_percent?: number;
	minutes!: number;
	classification?: string;

	// Apply json to this obj, signally no parent classes to do the setting for us.
	constructor( json?: any) {
		super(true);
		if(json !== true) this.initialize(json, this.schema);
	}

	get type(): string {
		return 'IfLevelDerivedProps';
	}

	get schema(): any {
		return {
			pages_length: { type: 'number', initialize: (i: any) => isDef(i) ? i : null },
			test_score_as_percent: { type: 'number', initialize: (i: any) => isDef(i) ? i : null },
			minutes: { type: 'number', initialize: (i: any) => isDef(i) ? i : null },
			classification: { type: 'string', initialize: (s: any) => isDef(s) ? s : null },
		};
	}
}

class IfLevelPagelessSchema extends Schema {
	_id!: string;
	code!: string;
	username!: string;

	seed!: number;
	harsons_randomly_on_username!: boolean;
	predict_randomly_on_username!: boolean;
	standardize_formula_case!: boolean;
	show_score_after_completing!: boolean;

	title!: string;
	description!: string;
	updated!: Date;
	created!: Date;

	completed!: boolean;

	history!: Array<Object>;
	allow_skipping_tutorial!: boolean;

	show_progress!: boolean;
	
	props!: IfLevelDerivedProps;
	props_version!: number;
	version!: number;

	// Apply json to this obj, signally no parent classes to do the setting for us.
	constructor( json?: any) {
		super(true);
		if(json !== true) this.initialize(json, this.schema);
	}

	get type(): string {
		return 'IfLevelPagelessSchema';
	}

	// Keep most functionality here, as we will over-ride schema in inheriting class.
	static _level_schema_no_pages(): any {
		// clean-up functions

		return {
			_id: { type: 'String', initialize: (s: string) => isDef(s) ? s : null },
			username: { type: 'String', initialize: (s: string) => isDef(s) ? s : null },

			// The seed value is used to initialize random behavior for pages.
			// Declaring it in the level allows for predictable behavior as pages are generated.
			seed: { type: 'number', initialize: (dbl: number) => isDef(dbl) ? dbl : Math.round(100000*Math.random()) },
			
			// Should half of users get Harsons instead of formula pages?
			harsons_randomly_on_username: { type: 'Boolean', initialize: (i: any) => isDef(i) ? b(i) : false },

			// Should half of users get Predict instead of formula pages?
			predict_randomly_on_username: { type: 'Boolean', initialize: (i: any) => isDef(i) ? b(i) : false },

			// should we go through the instructions and standardize formula sentence case?
			standardize_formula_case: { type: 'Boolean', initialize: (i: any) => isDef(i) ? b(i) : false },

			code: { type: 'String', initialize: (s: string) => isDef(s) ? s : null },
			title: { type: 'String', initialize: (s: string) => isDef(s) ? s : null },
			description: { type: 'String', initialize: (s: string) => isDef(s) ? s : null },

			completed: { type: 'Boolean', initialize: (s: string) => isDef(s) ? b(s) : false },
			
			allow_skipping_tutorial: { type: 'Boolean', initialize: (i: number) => isDef(i) ? b(i) : false },

			show_score_after_completing: { type: 'Boolean', initialize: (i: number) => isDef(i) ? b(i) : true },

			history: { type: 'Array', initialize: (aH :any) => isDef(aH) ? a(aH) : [] },

			updated: { type: 'Date', initialize: (dt: any) => isDef(dt) ? from_int_dt(dt) : Date() }, 
			created: { type: 'Date', initialize: (dt: any) => isDef(dt) ? from_int_dt(dt) : Date() },

			// Version tracks the underlying version of the tutorial.  Used to create new versions of 
			// tutorials and track when analyzing results.
			// version: { type: 'number', initialize: (dbl) => isDef(dbl) ? dbl : 0 },

			// Should we show a progress meter while they work on the assignment?  Default to yes.
			show_progress: { type: 'Boolean', initialize: (s: string) => isDef(s) ? b(s) : true },

			// Props are used to store derrived (expensive) properties.
			props: { type: 'Object', initialize: (o: any) => isDef(o) && o !== null ? new IfLevelDerivedProps( o ) : null },
			props_version: { type: 'number', initialize: (i: number) => isDef(i) ? i : null },
			
			// What version of the level is this version?
			version : { type: 'number', initialize: (dbl: number) => isDef(dbl) ? dbl : null },
		};
	}

	get schema(): any {
		return IfLevelPagelessSchema._level_schema_no_pages();
	}
}



/*
	A level is the owner object which can be created and used.
	It contains multiple pages.
*/
class IfLevelSchema extends IfLevelPagelessSchema {
	page!: typeof IfPageBaseSchema[];

	// Apply json to this obj, signally no parent classes to do the setting for us.
	constructor( json?: any) {
		super(true);
		if(json !== true) this.initialize(json, this.schema);
	}


	get type(): string {
		return 'IfLevelSchema';
	}

	get schema(): any {
		return this._level_schema();
	}

	// Actual called object. Includes pages.
	_level_schema(): any {
		const schema = IfLevelPagelessSchema._level_schema_no_pages();

		// Add the pages to the pageless item.
		// @ts-ignore
		schema.pages = { type: 'Array', initialize: (aJ) => isDef(aJ) ? a(aJ).map(j => {
						return get_page_schema_as_class(j);
					}) : [] };

		return schema;
	}


	// Build out the derived properties from this object.
	// Saves the new props in this classes' derived_props object.
	// Should be hit before saving to the database.
	refresh_derived_props(): any {
		let props = new IfLevelDerivedProps({
			type: 'IfLevelDerivedProps',
			pages_length: this.pages.length,
			test_score_as_percent: this.completed ? this.get_test_score_as_percent() : null,
			minutes: this.get_time_in_minutes(),
			classification: this.get_completion_status(),
		});

		this.props = props;
		
		// Update props version after updating this code.
		// Hitting the db api for a SQL update will automatically go through and update
		// all outdated props.
		this.props_version = LEVEL_DERIVED_PROPS_VERSION; 
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
		return this.pages.filter( (p: any) => p.code === 'test' && p.completed && p.correct ).length;
	}
	get_test_score_incorrect(): number {
		return this.pages.filter( (p: any) => p.code === 'test' && p.completed && !p.correct ).length;
	}
	get_test_score_attempted(): number {
		return this.pages.filter( (p: any) => p.code === 'test' && p.completed ).length;
	}
	get_tutorial_pages_completed(): number {
		return this.pages.filter( (p: any) => p.code === 'tutorial' && p.completed === true ).length;
	}
	get_tutorial_pages_uncompleted(): number {
		return this.pages.filter( (p: any) => p.code === 'tutorial' && p.completed !== true ).length;
	}

	get_test_score_as_percent(): number {
		const attempted = this.get_test_score_attempted();
		if( !this.completed ) 
			throw new Error('You can not run get_test_score_as_percent before a level has been completed');

		// If there are no actual test pages, but the tutorial has been completed, then return 100%
		if( attempted < 1 ) return 100;

		// Return the rounded result.
		return Math.round(100 * this.get_test_score_correct() / attempted); 
	}

	get_completion_status(): string {
		const level = this;
		const score_nullable = level.completed ? level.get_test_score_as_percent() : null;
		let classification = '';

		if(     !level.completed ) {
			classification = 'Uncompleted';

		} else if( 
				level.completed && score_nullable !== null 
				&& score_nullable >= PASSING_GRADE) {
			classification = 'Completed';

		} else if( 
				level.completed && score_nullable !== null 
				&& score_nullable < PASSING_GRADE ) {
			classification = 'Needs repeating';
		} else {
			throw new Error('Invalid type! classify in IfLevelSchema');
		} 
		return classification;
	}

	/*
		When was this created?
		Find the oldest page.
	*/
	get_first_update_date(): Date|null {
		// @ts-ignore
		return this.history.length > 0 
			// @ts-ignore
			? convert_to_date_if_string(this.history[0].dt)
			: null;
	}

	get_last_update_date(): Date|null {
		// @ts-ignore
		return this.history.length > 0 
			// @ts-ignore
			? convert_to_date_if_string(this.history[this.history.length-1].dt)
			: null;
	}

	// Return the time from the first edit to the last edit.
	get_time_in_minutes(): number {

		// @ts-ignore
		const time_in_seconds = this.pages.reduce( (accum, p) => p.get_time_in_seconds()+accum, 0);
		const time_in_minutes = Math.round(time_in_seconds/60);
		return time_in_minutes;
		
		/* Older code uses history items from level, not pages. Has some issues
			with gaps.

		const first = this.get_first_update_date();
		const last = this.get_last_update_date();

		if(first === null || last === null) return 0;
		if(typeof first === 'undefined' || typeof last === 'undefined') return 0;

		return Math.round( (last.getTime() - first.getTime()) / 60000 );
		*/
	}

	updateUserFields(json: any) {
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


/*
	List of tutorials that should be shown as a row for the table
	Only used if it's not defined by the section.
*/
const DEFAULT_TUTORIAL_LEVEL_LIST = [
	'math1', 'math2', 'math3','math4',
	'functions1', 'functionsdates','functionstext1', 'functionstext2',
	'if1', 'if2', 'if3', 'if4', 'if5', 'if6', 'if7',
	'financial1', 'financial2', 
	'sql_selectfrom', 'sql_orderby', 'sql_where','sql_where_and_or', 'sql_join_inner', 'sql_join_leftouter',
	'sql_join_keys', 'sql_join_self',
	'sql_groupby',
	];


// Common setting to establish passing grades.
const GREEN_GRADE = 85;
const PASSING_GRADE = 75;



export {
	IfLevels,
	IfLevelSchema,
	IfLevelPagelessSchema,
	DEFAULT_TUTORIAL_LEVEL_LIST,
	GREEN_GRADE,
	PASSING_GRADE,
	LEVEL_DERIVED_PROPS_VERSION,
};	