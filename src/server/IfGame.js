// @flow
const { IfLevelSchema, } = require('./../shared/IfGame');
const { DataFactory } = require('./DataFactory');
const { compile_template_values } = require('./../shared/template.js');

const { test } = require('./tutorials/test');
const { test_gens } = require('./tutorials/test_gens');
const { tutorial } = require('./tutorials/tutorial');

const { math1, math1review } = require('./tutorials/math1');
const { math2, math2review } = require('./tutorials/math2');
const { math3, math3review } = require('./tutorials/math3');
const { math4, math4review } = require('./tutorials/math4');

const { functions1, functions1review } = require('./tutorials/functions1');
const { functions2, functions2review } = require('./tutorials/functions2');

const { if1, if2, if3, if4, if5, if6, if7, if8 } = require('./tutorials/if');

const { surveymath1, surveymath2 } = require('./tutorials/surveymath');
const { surveywaiver_non_woodbury_student, surveywaiver_non_woodbury_user, surveywaiver_woodbury_student } = require('./tutorials/surveywaivers');

const { parseFeedback } = require('./parseFeedback');


// Use model term instead of schema to clarify server v. client, and to add room 
// for later adding server-side functionality.
const IfLevelModel = IfLevelSchema;


// Are the arrays similar or different?
const arrayDifferent = (a1: Array<any>, a2: Array<any>): boolean => {
	if(a1.length !== a2.length) return true;

	for(let i=0; i<a1.length; i++) {
		if(a1[i] !== a2[i]) return true;
	}

	return false;
};

const clean_text = ( dirty: string ): string => {

	// Remove tabs & newlines.
	let clean = dirty.replace(/\t/g, ' ').replace( /\n/g, ' ');
	let d = '';

	do {
		d = clean;
		clean = clean.replace( / {2}/g, ' ');
	} while( d !== clean);

	return clean;
};



// Turn a string into a y/n value.
const random_boolean_from_string = (s) => {
	const s_as_number = s.split('').reduce( (i, s) => s.charCodeAt(0) + i, 1 );
	return (s_as_number % 2) === 1;
};




const baseifgame = {
	/* 
		Setup page json prior to using it to create a new properly typed class object.

		Seed parameter is used to generate stable random sequences.
	*/
	_initialize_json: function(seed: number, page_count: number, original_json: Object): Object {
		let json = {...original_json};
		let version_i: number = 0;
		let version: Object = {};
		let randomly_sorted_versions: Array<Object> = [];

		// Initialize different versions of the page based on the levels seed object.
		// Relies upon versions being set to an array of objects or functions.
		if(json.versions instanceof Array) {
			// Pick a version.

			if(json.versions.length < 1) 
				throw new Error('baseifgame._initialize_json.json.versions.length=0');

			// We want a randomly-generated sequence of versions. That way,
			//  the user doesn't get the same item multiple times w/o first
			//  going through all of the other items.
			// 
			randomly_sorted_versions = DataFactory.randomizeList(json.versions.slice(), seed);
			// Find ith item for this run.
			version_i = page_count % json.versions.length;
			version = randomly_sorted_versions[version_i];

			// Initialize contained objects.
			for(let key in version) {
				if(version.hasOwnProperty(key)) {
					if(typeof version[key] === 'function') {
						// If function, run
						json[key] = version[key](json[key]);
					} else {
						// If not, then just assign.  
						json[key] = version[key];
					}
				}
			}

			// Remove key, as it's not a valid item in the class.
			delete json.versions;
		}

		// Make sure feedback is always initialized
		if(typeof json.feedback === 'undefined' || json.feedback === null) {
			json.feedback = [];
		}


		// Setup template values (if any!);
		// This converts strings like [1-3] into numbers 1, 2, or 3.
		// It also works with references. See templates for more information.
		json.template_values = compile_template_values( json );


		// Type-specific setup
		if( json.type === 'IfPageTextSchema' ) {
			// Mark that correct is required for all.
			// Ensures that we get a completed when showing result.
			json.correct_required = true;

			// Default to *not* show feedback on this item unless set.
			json.show_feedback_on = typeof json.show_feedback_on === 'undefined' ? false : json.show_feedback_on;

			// Default instruction text.
			if(typeof json.instruction === 'undefined') 
				json.instruction = 'Click <code>Next Page</code>.';

			// Add a default code.
			json.code = 'tutorial';


		} else if(json.type === 'IfPageParsonsSchema') {

			// Randomize the list until it's not the same order as the solution.
			do {
				json.potential_items = DataFactory.randomizeList(json.solution_items);
			} while (!arrayDifferent( json.potential_items, json.solution_items ));

			// Set flags as needed based off of the code.
			if(json.code === 'tutorial') {
				json.correct_required = json.correct_required == false ? false : true;
			} else if(json.code === 'test') {
				json.correct_required = false;
			} else {
				throw new Error('Invalid formula code '+json.code+' in baseifgame');
			}


		} else if(json.type === 'IfPageChoiceSchema') {
			// Mark that correct is required for all. This is needed to help keep track of 
			// submission.  If any solution is ok, then solution should be ? or *.
			json.correct_required = true;

			// Default instruction text.
			if(typeof json.instruction === 'undefined') 
				json.instruction = 'Select an item';

			// Add a default code of tutorial
			json.code = typeof json.code === 'undefined' ? 'tutorial' : json.code;


		} else if(json.type === 'IfPageNumberAnswerSchema') {
			// Allow the user to submit a number.

			if(json.code === 'tutorial') {
				json.correct_required = true;
			} else if (json.code === 'test') {
				json.correct_required = false;
			}

			json.solution_test_results_visible = true;
			json.solution_f_visible = false;

			// Default instruction text.
			if(typeof json.instruction === 'undefined') 
				json.instruction = 'Type in a number';



		} else if(json.type === 'IfPageFormulaSchema' || json.type === 'IfPageHarsonsSchema') {
			// Setup the major important fields based off of type.
			if(json.code === 'tutorial') {
				// Allow over-riding correct_required if set by the json object.
				json.correct_required = typeof json.correct_required == 'undefined' ? true : json.correct_required;

				json.solution_test_results_visible = true;
				json.solution_f_visible = false;

			} else if(json.code === 'test') {
				json.correct_required = false;
				json.solution_test_results_visible = true;
				json.solution_f_visible = false;

			} else {
				throw new Error('Invalid formula code '+json.code+' in baseifgame');
			}

			// Look to see if no feedback/toolbox has been defined.  If so, then automatically
			// parse out the elements and create the toolbox.
			if( json.type === 'IfPageHarsonsSchema' 
					&& typeof json.toolbox === 'undefined') {
				const feedback = parseFeedback( json.solution_f );
				json.feedback = feedback;
				json.toolbox = feedback;
			}

		} else {
			console.log(json);
			throw new Error('Invalid page type '+json.type+' in baseifgame');
		}

		// Require description and instructions.
		if( typeof json.description === 'undefined' || json.description === null ||
			typeof json.instruction === 'undefined' || json.instruction === null) {
			console.log( json );
			throw new Error('IfGameServerInitializeJson.NullDescriptionOrInstructions');
		}

		// Remove extra tabs characters and double spaces.
		json.description = clean_text(json.description);
		json.instruction = clean_text(json.instruction);

		// Initialize history
		json.history = [ { dt: new Date(), code: 'server_initialized' } ];



		return json;
	},


	// Make a new level.
	create: function(json: any): IfLevelSchema {
		const params = {
			type: 'IfLevelSchema',
			title: this.title,
			code: this.code,
			standardize_formula_case: this.standardize_formula_case,
			harsons_randomly_on_username: this.harsons_randomly_on_username,
			description: this.description,
			allow_skipping_tutorial: this.allow_skipping_tutorial,
			show_score_after_completing: this.show_score_after_completing,
			completed: false,
			pages: [],
			history: [ { dt: new Date(), code: 'server_level_created' } ]
		};

		const level = new IfLevelModel( { ...params, ...json } );

		return level;
	},


	addPageOrMarkAsComplete: function(level: IfLevelSchema): IfLevelSchema {
		if(level.completed)
			throw new Error('IfGame.addPageOrMarkAsComplete.LevelAlreadyCompleted');

		const last_page = level.pages.length > 0 ? level.pages[level.pages.length-1] : null;

		// Update the last page as needed.
		if(last_page !== null) {

			// The last page should never be marked as completed.  Only this code marks a page as
			// completed.  If completed, then a new page is added at the tail end.
			// If no more, then the entire level should be marked as completed.
			if(last_page.completed) 
				throw new Error('IfGame.addPageOrMarkAsComplete.lastpage_already_completed');


			// Test to see if the last page needs to be correct to continue.
			// Note that the last page may not have been answered by the user yet.
			if( last_page.correct_required && !last_page.correct ) {
				// Don't add a new level until it is correct.
				last_page.history.push({ dt: new Date(), code: 'server_page_incorrect'});
				return level;
			}

			// Mark the previous page as completed.
			last_page.completed = true;
			last_page.history.push({ dt: new Date(), code: 'server_page_completed' });
		}

		// Create a new array of pages that can be modified.
		// Put in reverse order to simplify pop() operation.  Modified by gen function.
		// Then use this to create the new json for the new page.
		const reversed_pages = level.pages.slice().reverse();
		const new_page_json = this.gen.gen(level.seed, reversed_pages, this.gen);


		// Check result of gen function.
		if(new_page_json !== null) {
			// Since a non-null result was given, we should add a new page.
			// If the level is requesting a seed value for tutorials based on username, 
			// then go ahead and change type for half of all users.
			if(level.harsons_randomly_on_username 
					&& new_page_json.type === 'IfPageFormulaSchema' 
					&& random_boolean_from_string(level.username) ) {
				new_page_json.type = 'IfPageHarsonsSchema';
			}

			// If we're the admin (garrettn), the switch.
			if(level.harsons_randomly_on_username 
					&& new_page_json.type === 'IfPageFormulaSchema' 
					&& level.username === 'garrettn') {
				new_page_json.type = 'IfPageHarsonsSchema';
			}

			// Harsons uses toolboxes, but ifPageFormulaSchemas do not.  Since some types automatically change
			// back and forth from Formula pages to Harsons, we need to delete the toolbox if it's not
			// going to be transformed.
			if(new_page_json.type === 'IfPageFormulaSchema' && typeof new_page_json.toolbox !== 'undefined') {
				delete new_page_json.toolbox;
				// Delete any versions of the toolbox as well.
				if(typeof new_page_json.versions !== 'undefined') {
					new_page_json.versions.forEach( v => delete v.toolbox );
				}
			}

			// setup new page 
			const initialized_json = this._initialize_json(level.seed, level.pages.length, new_page_json);
			const new_page = level.get_new_page(initialized_json);

			// Add an initial history item for the created date using server time (not client time)
			new_page.history.push({
				code: 'server_create',
				dt: new Date()
			});

			// Clean-up case if required.
			if(level.standardize_formula_case) new_page.standardize_formula_case();

			level.pages.push(new_page);

			level.history = [...level.history, { dt: new Date(), page_i_added: level.pages.length-1, code: 'server_page_added'}];

		} else {
			// Since a null result was given, we are at the end of the tutorial.
			level.completed = true;
			level.history = [...level.history, { dt: new Date(), page_i_finished: level.pages.length-1, code: 'server_level_completed'}];
		}

		return level;
	}

};


const IfLevelModelFactory = {
	// Note: upon update of levels.tutorial, levels.math, etc..., 
	//		need to update shared\ifgame\levels to match.
	levels: {
		test: { ...baseifgame, ...test },
		tutorial: { ...baseifgame, ...tutorial },
		math1: { ...baseifgame, ...math1},
		math1review: { ...baseifgame, ...math1review},
		math2: { ...baseifgame, ...math2},
		math2review: { ...baseifgame, ...math2review},
		math3: { ...baseifgame, ...math3},
		math3review: { ...baseifgame, ...math3review},
		math4: { ...baseifgame, ...math4},
		math4review: { ...baseifgame, ...math4review},
		functions1: { ...baseifgame, ...functions1},
		functions1review: { ...baseifgame, ...functions1review},
		functions2: { ...baseifgame, ...functions2},
		functions2review: { ...baseifgame, ...functions2review},
		if1: { ...baseifgame, ...if1},
		if2: { ...baseifgame, ...if2},
		if3: { ...baseifgame, ...if3},
		if4: { ...baseifgame, ...if4},
		if5: { ...baseifgame, ...if5},
		if6: { ...baseifgame, ...if6},
		if7: { ...baseifgame, ...if7},
		if8: { ...baseifgame, ...if8},
		surveymath1: { ...baseifgame, ...surveymath1 },
		surveymath2: { ...baseifgame, ...surveymath2 },
		test_gens: { ...baseifgame, ...test_gens },
		surveywaiver_non_woodbury_student: { ...baseifgame, ...surveywaiver_non_woodbury_student }, 
		surveywaiver_non_woodbury_user: { ...baseifgame, ...surveywaiver_non_woodbury_user },
		surveywaiver_woodbury_student: { ...baseifgame, ...surveywaiver_woodbury_student }
	},

	// Create and return a new level of the given code.
	create: function(code: string, username: string): IfLevelSchema {
		if(typeof this.levels[code] === 'undefined') throw new Error('Invalid type '+code+' passed to IfLevelModelFactory.create');

		const allow_skipping_tutorial = (username === 'garrettn');

		// If we are the admin, or 1/2th of users, then standardize the display 
		// of formula cases.
		const standardize_formula_case = random_boolean_from_string(username)  || (username === 'garrettn');

		const level = this.levels[code].create({ 
				username, 
				allow_skipping_tutorial,
				standardize_formula_case 
			});

		return this.levels[code].addPageOrMarkAsComplete(level);
	},

	// Check the submission.
	addPageOrMarkAsComplete: function(level: IfLevelSchema): IfLevelSchema {
		if(typeof this.levels[level.code] === 'undefined') throw new Error('Invalid type '+level.code+' passed to IfLevelModelFactory.processSubmission');

		return this.levels[level.code].addPageOrMarkAsComplete(level);
	},

};
module.exports = {
	IfLevelModel: IfLevelModel,
	IfLevelModelFactory: IfLevelModelFactory
};

