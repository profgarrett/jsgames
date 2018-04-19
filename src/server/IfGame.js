// @flow
const { IfLevelSchema, IfPageTextSchema, IfPageParsonsSchema, IfPageChoiceSchema, IfPageFormulaSchema  } = require('./../shared/IfGame');
const { DataFactory } = require('./DataFactory');

const { test } = require('./tutorials/test');
const { test_gens } = require('./tutorials/test_gens');
const { tutorial } = require('./tutorials/tutorial');
const { math1, math2, math3 } = require('./tutorials/math');
const { text } = require('./tutorials/text');
const { sum } = require('./tutorials/sum');
const { if1 } = require('./tutorials/if1');
const { if2 } = require('./tutorials/if2');
const { dates } = require('./tutorials/dates');

import type { LevelType } from './../app/if/IfTypes';

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



const baseifgame = {
	/* 
		Setup page json prior to using it to create a new properly typed class object.
	*/
	_initialize_json: function(original_json: Object): Object {
		let json = {...original_json};

		// Initialize different versions of the page based on the levels seed object.
		// Relies upon versions being set to an array of objects or functions.
		if(json.versions instanceof Array) {
			// Pick a version.
			let version: Object = DataFactory.randOf(json.versions, this.seed);

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


		// Type-specific setup
		if( json.type === 'IfPageTextSchema' ) {
			// Mark that correct is required for all.
			// Ensures that we get a completed, not correct, when showing result.
			json.correct_required = true;

			// Default instruction text.
			if(typeof json.instruction === 'undefined') 
				json.instruction = 'Click the <code>Continue</code> button.';

		} else if(json.type === 'IfPageParsonsSchema') {

			// Randomize the list until it's not the same order as the solution.
			do {
				json.potential_items = DataFactory.randomizeList(json.solution_items);
			} while (!arrayDifferent( json.potential_items, json.solution_items ));

			// Set flags as needed based off of the code.
			if(json.code === 'tutorial') {
				json.correct_required = true;
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


		} else if(json.type === 'IfPageFormulaSchema') {
			// Setup the major important fields based off of type.
			if(json.code === 'tutorial') {
				json.correct_required = true;
				json.solution_test_results_visible = true;
				json.solution_f_visible = true;
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


		return json;
	},


	// Make a new level.
	create: function(): LevelType {
		let level = new IfLevelModel({
			type: 'IfLevelSchema',
			title: this.title,
			code: this.code,
			description: this.description,
			completed: false,
			pages: [],
			history: [ { created: new Date(), title: 'created' } ]
		});

		// Force completed to null showing that the user hasn't yet attempted to answer.
		//level.pages[0].completed = null;

		return level;
	},


	addPageOrMarkAsComplete: function(level: LevelType): LevelType {
		if(level.completed)
			throw new Error('IfGame.addPageOrMarkAsComplete.LevelAlreadyCompleted');

		// Test to see if we've finished completing the requirements for the last page.
		if(level.pages.length > 0) {
			const last_page = level.pages[level.pages.length-1];

			// The last page should never be completed.  Only this code marks a page as
			// completed.  If completed, then a new page is added at the tail end.
			// If no more, then the entire level should be marked as completed.
			if(last_page.completed) 
				throw new Error('IfGame.addPageOrMarkAsComplete.lastpage_already_completed');


			// Test to see if the last page needs to be correct to continue.
			// Note that the last page may not have been answered by the user yet.
			if( last_page.correct_required && !last_page.correct ) {
				// Don't add a new level until it is correct.
				level.history = [...level.history, { created: new Date(), title: 'addPageOrMarkAsComplete_notCorrectTutorialPage'}];
				return level;
			}

		}

		// Create a new array of pages that can be modified.
		// Put in reverse order to simplify pop() operation.  Modified by gen function.
		const pages = level.pages.slice().reverse();

		// Run the code that recursively returns new page json.
		const new_page_json = this.gen.gen(level.seed, pages, this.gen);

		// Mark the previous page as completed.
		if(level.pages.length > 0) 
			level.pages[level.pages.length-1].completed = true;

		// Check result of gen function.
		if(new_page_json !== null) {
			// Since a non-null result was given, we should add a new page.

			// setup new page 
			const initialized_json = this._initialize_json(new_page_json);
			const new_page = level.get_new_page(initialized_json);
			level.pages.push(new_page);

			level.history = [...level.history, { created: new Date(), title: 'addPageOrMarkAsComplete_addPage'}];

		} else {
			// Since a null result was given, we are at the end of the tutorial.
			level.completed = true;
			level.history = [...level.history, { created: new Date(), title: 'addPageOrMarkAsComplete_setLevelCompleteTrue'}];
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
		math3: { ...baseifgame, ...math3},
		if1: { ...baseifgame, ...if1},
		if2: { ...baseifgame, ...if2},
		sum: { ...baseifgame, ...sum},
		text: { ...baseifgame, ...text},
		test_gens: { ...baseifgame, ...test_gens }
	},

	// Create and return a new level of the given code.
	create: function(code: string): LevelType {
		if(typeof this.levels[code] === 'undefined') throw new Error('Invalid type '+code+' passed to IfLevelModelFactory.create');

		let level = this.levels[code].create();
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

