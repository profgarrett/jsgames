// @flow
const { IfLevelSchema, IfPageTextSchema, IfPageParsonsSchema, IfPageChoiceSchema, IfPageFormulaSchema  } = require('./../shared/IfGame');
const { DataFactory } = require('./DataFactory');

const { test } = require('./tutorials/test');
const { test_gens } = require('./tutorials/test_gens');
const { tutorial } = require('./tutorials/tutorial');
const { math1, math2 } = require('./tutorials/math');
const { text } = require('./tutorials/text');
const { summary } = require('./tutorials/summary');
const { if1, if2, if3, if4, if5, if6, if7 } = require('./tutorials/if');
const { dates } = require('./tutorials/dates');

import type { LevelType, PageType } from './../app/if/IfTypes';

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
			randomly_sorted_versions = DataFactory.randomizeList(json.versions, seed);
			// Find ith item for this run.
			version_i = page_count % json.versions.length;
			version = randomly_sorted_versions[version_i];

			// Initialize contained objects.
			for(let item in version) {
				if(version.hasOwnProperty(item)) {
					if(typeof version[item] === 'function') {
						// If function, run
						json[item] = version[item](this, json);
					} else {
						// If not, then just assign.  

						// See if starting with ..., which means to append.
						if(typeof version[item] === 'string' && 
								version[item].substr(0,3) === '...') {
							json[item] = json[item] + version[item].substr(3);
						} else {
							json[item] = version[item];
						}
					}
				}
			}

			// Remove key, as it's not a valid item in the class.
			delete json.versions;
		}

		// Even though solution_feedback is not required by schemas, on server it should always be initialized
		// This helps the updateCorrect() functions know that we are on the server.  If this is 
		// null, then they assume we're on the client and can not calculate correct or not.
		// Really, should just require solution_feedback on all json templates, but it's easier to
		// not have to hard code.
		if(typeof json.solution_feedback === 'undefined' || json.solution_feedback === null) {
			json.solution_feedback = [];
		}


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


		} else if(json.type === 'IfPageFormulaSchema') {
			// Setup the major important fields based off of type.
			if(json.code === 'tutorial') {
				// Allow over-riding correct_required if set by the json object.
				json.correct_required = typeof json.correct_required == 'undefined' ? true : json.correct_required;

				json.solution_test_results_visible = true;
				json.solution_f_visible = false;

			} else if(json.code === 'test') {
				json.correct_required = false;
				json.solution_test_results_visible = false;
				json.solution_f_visible = false;
			} else {
				throw new Error('Invalid formula code '+json.code+' in baseifgame');
			}


		} else {
			throw new Error('Invalid page type '+json.type+' in baseifgame');
		}

		// Require description and instructions.
		if( typeof json.description === 'undefined' || json.description === null ||
			typeof json.instruction === 'undefined' || json.instruction === null) 
			throw new Error('IfGameServerInitializeJson.NullDescriptionOrInstructions');

		// Remove extra tabs characters and double spaces.
		json.description = clean_text(json.description);
		json.instruction = clean_text(json.instruction);

		// Initialize history
		json.history = [ { dt: new Date(), code: 'created' } ];



		return json;
	},


	// Make a new level.
	create: function(): LevelType {
		let level = new IfLevelModel({
			type: 'IfLevelSchema',
			title: this.title,
			code: this.code,
			allow_skipping_tutorial: true,
			description: this.description,
			completed: false,
			pages: [],
			history: [ { dt: new Date(), code: 'server_level_created' } ]
		});

		return level;
	},


	addPageOrMarkAsComplete: function(level: LevelType): LevelType {
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

			// setup new page 
			const initialized_json = this._initialize_json(level.seed, level.pages.length, new_page_json);
			const new_page = level.get_new_page(initialized_json);
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
		dates: { ...baseifgame, ...dates},
		math1: { ...baseifgame, ...math1},
		math2: { ...baseifgame, ...math2},
		if1: { ...baseifgame, ...if1},
		if2: { ...baseifgame, ...if2},
		if3: { ...baseifgame, ...if3},
		if4: { ...baseifgame, ...if4},
		if5: { ...baseifgame, ...if5},
		if6: { ...baseifgame, ...if6},
		if7: { ...baseifgame, ...if7},
		summary: { ...baseifgame, ...summary},
		text: { ...baseifgame, ...text},
		test_gens: { ...baseifgame, ...test_gens }
	},

	// Create and return a new level of the given code.
	create: function(code: string, username: string): LevelType {
		if(typeof this.levels[code] === 'undefined') throw new Error('Invalid type '+code+' passed to IfLevelModelFactory.create');

		const level = this.levels[code].create();

		level.username = username;
		// Turn on ability to skip for IF levels & for half of all users
		if(level.code.substr(0,2) == 'if' && (level.seed > 0.5  || level.username === 'garrettn')) {
			level.allow_skipping_tutorial = true;
		} else {
			level.allow_skipping_tutorial = false;
		}

		return this.levels[code].addPageOrMarkAsComplete(level);
	},

	// Check the submission.
	addPageOrMarkAsComplete: function(level: LevelType): LevelType {
		if(typeof this.levels[level.code] === 'undefined') throw new Error('Invalid type '+level.code+' passed to IfLevelModelFactory.processSubmission');

		return this.levels[level.code].addPageOrMarkAsComplete(level);
	},

};
module.exports = {
	IfLevelModel: IfLevelModel,
	IfLevelModelFactory: IfLevelModelFactory
};

