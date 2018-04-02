const { IfLevelSchema } = require('./../shared/IfGame');

const { DataFactory } = require('./DataFactory');

const { test } = require('./tutorials/test');
const { tutorial } = require('./tutorials/tutorial');
const { math } = require('./tutorials/math');
const { text } = require('./tutorials/text');
const { sum } = require('./tutorials/sum');
const { if1 } = require('./tutorials/if1');
const { if2 } = require('./tutorials/if2');

// Use model term instead of schema to clarify server v. client, and to add room 
// for later adding server-side functionality.
const IfLevelModel = IfLevelSchema;

module.exports = {
	IfLevelModel: IfLevelModel
};

// Are the arrays similar or different?
const arrayDifferent = (a1, a2) => {
	if(a1.length !== a2.length) return true;

	for(let i=0; i<a1.length; i++) {
		if(a1[i] !== a2[i]) return true;
	}

	return false;
};



const baseifgame = {
	/*
		Setup json obj according to _type.
			tutorial: Students must successfully complete before continuing. 
			test: Students may submit incorrect.
	*/
	_initialize_from_code: function(json) {
		
		if(json.type === 'IfPageParsonsSchema') {

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

		} else if(json.type === 'IfPageFormulaSchema') {
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
		return json;
	},


	// Make a new level.
	create: function() {
		let level = new IfLevelModel({
			title: this.title,
			code: this.code,
			description: this.description,
			completed: false,
			pages: [ this._initialize_from_code(this.pages[0]) ],
			history: [ { created: new Date(), title: 'created' } ]
		});

		// Force completed to null showing that the user hasn't yet attempted to answer.
		level.pages[0].completed = null;

		return level;
	},

	/*
		Updates a valid and self-consistent object by creating additional pages.
		Also handles all updates to .completed on both page and level.
		
		@todo Currently relies upon having same exact length between template and levels. Allow dynamic length.
	*/
	addPageOrMarkAsComplete: function(level) {
		let last_page = level.pages[level.pages.length-1];
		if(last_page.completed) throw new Error('IfGame.addPageOrMarkAsComplete.lastpage_already_completed');


		// Test to see if the last page needs to be correct to continue.
		// Note that the last page may not have been answered by the user yet.
		if( last_page.correct_required && !last_page.correct ) {
			// Don't add a new level until it is correct.
			level.history = [...level.history, { created: new Date(), title: 'addPageOrMarkAsComplete_notCorrectTutorialPage'}];
			return level;
		}

		// Are we done with tutorial?
		if(level.pages.length >= this.pages.length) {
			// Yes. Set level and pages to completed so no further updates are allowed.
			last_page.completed = true;
			level.completed = true;
			level.history = [...level.history, { created: new Date(), title: 'addPageOrMarkAsComplete_setCompleteTrue'}];
		} else {
			// No. Add a new page.

			// Update last page so no more updates are allowed.
			last_page.completed = true;

			// Create new page and add to level.
			let new_page_json = this._initialize_from_code(this.pages[level.pages.length]);
			let new_page = level.get_new_page(new_page_json);
			level.pages.push(new_page);

			level.history = [...level.history, { created: new Date(), title: 'addPageOrMarkAsComplete_addPage'}];
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
		math: { ...baseifgame, ...math}, 
		if1: { ...baseifgame, ...if1},
		if2: { ...baseifgame, ...if2},
		sum: { ...baseifgame, ...sum},
		text: { ...baseifgame, ...text}
	},

	// Create and return a new level of the given code.
	create: function(code) {
		if(typeof this.levels[code] === 'undefined') throw new Error('Invalid type '+code+' passed to IfLevelModelFactory.create');

		return this.levels[code].create();
	},

	// Check the submission.
	addPageOrMarkAsComplete: function(level) {
		if(typeof this.levels[level.code] === 'undefined') throw new Error('Invalid type '+level.code+' passed to IfLevelModelFactory.processSubmission');

		return this.levels[level.code].addPageOrMarkAsComplete(level);
	},

};
module.exports.IfLevelModelFactory = IfLevelModelFactory;

