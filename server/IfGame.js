const { IfLevelSchema,
		IfPageSchema } = require('./../shared/IfGame');

//const { DataFactory } = require('./DataFactory');

const { test } = require('./tutorials/test');
const { tutorial } = require('./tutorials/tutorial');
const { math } = require('./tutorials/math');
const { text } = require('./tutorials/text');
const { sum } = require('./tutorials/sum');
const { if1 } = require('./tutorials/if1');
const { if2 } = require('./tutorials/if2');

//  Converts the client-side js class for schema into a server-side model
// The model includes additional code for evaluating success/failure.
function buildModel(schemaClass) {
	return schemaClass;
}

// Create exportable models.
module.exports = {
	IfLevelModel: buildModel(IfLevelSchema),
	IfPageModel: buildModel(IfPageSchema)
};


/*
	Pages can be one of the following:
		Tutorial: Students must successfully complete before continuing. 
		Knowledge Transfer: Students may submit incorrect.

	Run repeatedly after every level update on every page.
*/			
const setPageAsTutorial = page => {
	page.correct_required = true;
	page.solution_test_results_visible = true;
	page.solution_f_visible = (page.correct !== null);
};
const setPageAsTest = page => {
	page.correct_required = false;
	page.solution_test_results_visible = (page.correct !== null);
	page.solution_f_visible = false;
};


const baseifgame = {

	// Make a new level.
	create: function() {
		let level = new (module.exports.IfLevelModel)({
			title: this.title,
			code: this.code,
			description: this.description,
			completed: false 
		});
		this.update(level);

		return level;
	},

	// Add a new level or mark an item as completed.  Safe to run multiple times.
	update: function(level) {
		console.assert(level.title === this.title, 'server.ifgame.test.update.leveltitlecheck');
		console.assert(!level.completed, 'server.ifgame.test.update.completenotfalse');

		let page;

		// Update all pages parsing, then update score and run the_after_update functions.
		level.pages.map( p => p.parse() );
		level.score.refresh(level);
		level.pages.map( (p,i) => this.pages[i]._after_update.map( f => f(p) ) );

		// Check to see if we should add a new page.
		if(level.pages.length >= this.pages.length) {
			level.completed = true;
		} else {
			// Create the new page based on the template in this file.
			let obj = this._remove_after_update(this.pages[level.pages.length]);
			page = new module.exports.IfPageModel(obj);
			level.pages.push(page);

			// Note that parse must happen prior to _after_update functions, since those may depend
			//		upon the client_f value and .correct being set.
			page.parse();

			// Run _after_update functions on the newly-created page.
			this.pages[level.pages.length-1]._after_update.map( f => f(page) );

		}

	},

	_remove_after_update: function(obj) {
		let obj2 = Object.assign({}, obj);
		delete obj2._after_update;
		return obj2;
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

	create: function(code) {
		console.assert(this.levels[code], 'Invalid type '+code+' passed to IfLevelModelFactory.create');
		return this.levels[code].create();
	},

	// Function used to update test levels.
	update: function(level) {

		//let levels = this.levels.filter( l => l.title === level.title );

		if(!this.levels[level.code]) {
			console.assert(false, 'Unknown level '+level.code+' passed to IfLevelModelFactory.update');
		} else {
			return this.levels[level.code].update(level);
		}
	}
};
module.exports.IfLevelModelFactory = IfLevelModelFactory;
