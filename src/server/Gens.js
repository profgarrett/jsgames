// @flow
const { DataFactory } = require('./DataFactory');
const { IfPageBaseSchema } = require('./../shared/IfPageSchemas');
// $FlowFixMe
const assert = require('assert').strict;
const util = require('util')

export type GenType = {|
	gen_type: string,
	pages: Array<IfPageBaseSchema | GenType | Object>,

	// Optional Parameters
	until_correct?: number,
	until_total?: number,
|};


export type AdaptiveGenType = {|
	gen_type: Function,

	questions_for_passing: number,

	tutorial_gen: GenType,
	test_gen: GenType
|};



// TEST variable is used to run all test for the gen functions.
// Useful to make sure that they still work properly.
const TEST = false;



/**
	Generator are used to create pages.

	They are smart functions that will create new pages in a deterministic fashion.
	This means that given the same input, they will also provide the same output.
	Any random behavior requires a seed value given by the level.
	
	Gens can be safely nested inside of each other.

	Input:
		seed: number used for any random behavior.
		page: an array of IfPageSchemas representing the already created pages.
		gen: A generator object containing an array of page templates.
	
	Side effects
		None!  You can run a gen object safely as many times as you want without any side-effects.
		This is really critical due to the copying nature (see below)
	
	Return
		Null when the gen has finished running.
		A new page template of json
			Note that the json is not initialized, but
			is just the raw data for use in the action Level function that sets up pages.
	
	One major issue is copying. Since the gens are instantiated 1x, and used multiple times, you've
		got to be super careful to avoid modifying them. Each Gen function makes a copy of the template
		pages before modifying.
	
	There is 1 external entry point, gen_copy. This makes a safe (shallow) copy of all pages passed in.
	This is important, as those pages are consumed by each of the gen functions. Each gen function 
	will remove 0, 1, or more elements from the pages array passed in.
		0, if it's the first time this gen has been run (or all of the pages have been consumed)
		1 or more, gen will remove matching pages until all are consumed. It then returns new JSON. 
			If this gen hits the exit condition, it will return null, signalling that it's time for the 
			next gen to work on any remaining pages.

*/



// Return pages in a simple linear order.
const LinearGen = (seed: number, pages: Array<IfPageBaseSchema>, gen: GenType): any => {
	const gen_pages = gen.pages.slice(); // build a unique generator page set to work with, as we don't want to modify the original.
	let next_gen_page = null;
	let result = null;
	let total = 0;
	let correct = 0;
	let last_page = null;

	//if(typeof gen.until_correct !=='undefined' || typeof gen.until_total !== 'undefined')
	//		throw new Error('Using until_correct or until_total require UntilGen');

	//console.log({ at: 'ENTERING LINEARGEN', 'g': gen_pages, 'pages': pages });
	//console.log(pages);

	// Start removing matching elements.
	while(result === null) {
		//console.log('LinearGen.while');
		//console.log(gen_pages);
		if(gen_pages.length < 1) return null;

		// If we've processed the max number of items, then return.
		if(typeof gen.until_total === 'number' && total >= gen.until_total) {
			//console.log([ 'until', total, pages, gen]);
			//console.log(util.inspect( pages, false, null, true));
			return null;
		}

		// If we've processed the max number of correct items, then return.
		if(typeof gen.until_correct === 'number' && correct >= gen.until_correct) {
			//console.log([ 'until correct', correct, pages, gen]);
			//console.log(util.inspect( pages, false, null, true));
			return null;
		}

		// Temp reference to a popped page.
		last_page = null;


		next_gen_page = gen_pages[0];

		if(typeof next_gen_page.gen_type !== 'undefined') {
			// The top item for gen_pages is a generator.
			// Throw the results into the generator for it to consume as needed.

			//console.log('RECURSING');
			//console.log(pages)

			// $FlowFixMe
			result = runGen_nocopy(seed, pages, next_gen_page);

			// Remove the first generator-page.
			gen_pages.shift();

		} else {
			// Page isn't a generator,

			if( pages.length > 0) {
				// We have previous data. Pull off one previous item from pages and the gen templates.
				last_page = pages.shift();
				gen_pages.shift();

			} else {
				// We are out of user data.  Pull the latest gen template and return it.
				result = gen_pages.shift();
			}
		}

		// Increment counters to track the number of pages processed, and the last correct page.
		total++;
		if(last_page !== null && last_page.correct === true) {
			correct++;
			//console.log( last_page )
		}
		//console.log( '\nCorrect: ' + correct + ', Total: ' + total );
		//console.log( last_page );

	}
	return result;
};




// Randomly order the template pages, creating a new gen.
// Then treat as a linear gen.
const ShuffleGen = (seed: number, pages: Array<IfPageBaseSchema>, gen: GenType): any => {

	// Create a new gen that is randomized by the given seed.
	let randomized_gen = {
		...gen,
		pages: DataFactory.randomizeList(gen.pages.slice(), seed)
	};

	// Treat this as a Linear Gen.
	return LinearGen(seed, pages, randomized_gen);
};


/**
	Randomly shuffle a list until we reach limit.
	We don't know if it's hit unit_correct or until_total. Either one will jump us out of the gen.

	If len < limit, then it will re-use items.

	Until_total is always required
*/
const ShuffleGenUntilLimit = (seed: number, pages: Array<IfPageBaseSchema>, gen: GenType): any => {

	// Create a new gen that is randomized by the given seed.
	if(typeof gen.until_total === 'undefined' || gen.until_total === null) 
		throw new Error('Must give a limit value to ShuffleGenUntilLimit');

	const until_total = typeof gen.until_total === 'number' ? gen.until_total : 999999;
	const until_correct = typeof gen.until_correct === 'number' ? gen.until_correct : 999999;

	if(!(typeof gen.until_correct === 'number' || gen.until_correct === null))
			throw new Error('Invalid gen.until_correct, should be number or null');

	if(!(typeof gen.until_total === 'number' || gen.until_correct === null))
			throw new Error('Invalid gen.until_total, should be number or null');


	// Create a new linear gen with the randomized list of items limited to @until_total.
	let randomized_gen = ({
		gen_type: 'LinearGen',
		pages: DataFactory.randomizeList(gen.pages.slice(), seed).slice(0, until_total),
		until_correct: gen.until_correct,
		until_total: gen.until_total,
	}: GenType);
	
	//let correct = 0;

	// See if we need additional pages. If so, keep adding to the new gen until it matches the right length.
	// Will stop adding pages if we hit either until_total or until_correct
	while(randomized_gen.pages.length < until_total /*&& correct < until_correct */) {
		randomized_gen.pages.push( gen.pages[ DataFactory.randB(0, gen.pages.length-1 ) ] );
		//if( randomized_gen.pages[randomized_gen.pages.length-1].correct === true ) correct++;
	}
	//console.log( randomized_gen.pages );
	//console.log(pages);

	// Return this as a Linear Gen.
	return LinearGen(seed, pages, randomized_gen);
};




// Continue for as long as until is false.
// Should have only a single page in the gen.pages array.  Will continue creating pages from
// that page until the UNTIL conditions are met.
const UntilGen = (seed: number, pages: Array<IfPageBaseSchema>, gen: GenType): any => {
	let until_results = [];
	let last_page = null;
	let correct = 0;
	let incorrect = 0;
	let escape_on_loop = 100; // variable to prevent infinite loop in case of some error

	// Run checks on the UntilGen initialization data.
	if(gen.pages.length !== 1) 
			throw new Error('UntilGen can only have a single page');
	if(typeof gen.pages[0].gen !== 'undefined')
			throw new Error('UntilGet cannot be given a function gen');
	if(gen.pages[0].code === 'tutorial')
			throw new Error('UntilGet cannot be given a gen with Tutorial type.  Must be test ' +
				'so that the gen can add new pages');
	if(typeof gen.until_correct === 'undefined' && typeof gen.until_total === 'undefined')
			throw new Error('UntilGen needs an until_correct or until_total');


	//console.log('UNTILGEN START');
	//console.log(pages);
	//console.log(gen);

	// Remove elements as long as they lead to a false result.
	while(escape_on_loop>0) {
		//console.log(escape_on_loop);
		if( pages.length > 0) {
			// We have previous data.
			last_page = pages.shift();
			until_results.push(last_page);
			
			if(typeof last_page.correct === 'undefined' || last_page.correct === null) 
					throw new Error('UntilGen requires .correct to be set');
			
			if(last_page.correct) {
				correct++;
			} else {
				incorrect++;
			}

			// See if we've reach a true result for the until conditions
			// Show that we're done by returning null
			//console.log({ gen, correct, incorrect })
			if( typeof gen.until_correct !== 'undefined' && correct >= gen.until_correct) return null;
			if( typeof gen.until_total !== 'undefined' && incorrect+correct >= gen.until_total) return null;

			// Nope! Keep on going through the list of results 
		} else {
			// We are out of user data.  Return the gen data to create a new page.
			return gen.pages[0];
		}

		escape_on_loop--; 
	}
	throw new Error('UntilGet escape on loop exceeded count. Fail');
};



/**
	An adaptive gen administers a test.  
	Once the test is done, 
		until runs to see if the user needs to complete a tutorial_gen.
			If FALSE, then administers tutorial.  
			If TRUE, then exits.

	Note that the test_gen must be of a fixed length.  It cannot expand, like an UNTIL gen.
	If the test_gen list is shorter than the total numbers of test items requested, it will
	just go back into it again after another random sort.
*/
const AdaptiveGen = (seed: number, pages: Array<IfPageBaseSchema>, gen: AdaptiveGenType): any => {
	let result = null;
	let pre_test_gen_pages = []; // pages.slice() will be run in the while looop to populate this.
	let consumed_pages = [];
	let escape_on_loop = 1000; 
	let correct = 0;
	let incorrect = 0;

	// Checks
	if(gen.gen_type !== 'AdaptiveGen')
		throw new Error('Wrong argument to adaptive gen');
	if(typeof gen.tutorial_gen === 'undefined' ||
		typeof gen.test_gen === 'undefined') 
		throw new Error('AdaptiveGen requires gen functions');
	if(gen.tutorial_gen.gen_type === 'UntilGen' || gen.test_gen.gen_type === 'UntilGen') 
		throw new Error('AdaptiveGen should not have untilgen');


	// No user results.  Administer test.
	//if(pages.length < 1)
	//	return runGen_copy(seed, pages, gen.test_gen);


	// Start processing pages.
	while(escape_on_loop>0) {
		//console.log('\nLoop: '+ escape_on_loop);
		//console.log('PAGES');
		//console.log(pages);

		// Reset the temp array of pages. Used to find out which have been removed.
		// Run each time we loop, as we need it reset prior to running test_gen.
		pre_test_gen_pages = pages.slice();

		// Run the test gen, which may return either
		//	json or null (showing that all test_pages were consumed)
		result = runGen_nocopy(seed, pages, gen.test_gen);

		//console.log('RESULT')
		//console.log(pages);
		//	console.log(result);

		// See if test gen returned a new json page to give to the user. Done!
		if(result !== null) return result;

		// Test_gen returned null, meaning that it consumed enough pages.
		// Since test_gen consumed a bunch of pages, build a new array holding the consumed test pages.
		// Shift off all consumed pages until it's the same length.
		consumed_pages = [];
		//console.log([ 'CONLOOP:', pre_test_gen_pages.length, pages.length]);
		while( pre_test_gen_pages.length > pages.length  ) {
			//console.log([ 'CONLOOP:', pre_test_gen_pages.length, pages.length]);
			consumed_pages.push(pre_test_gen_pages.shift());
		}

		//console.log('\nCONSUMED');
		//console.log(consumed_pages);		
		// Measure success of consumed pages. 
		correct = consumed_pages.filter( p => p.correct ).length;
		incorrect = consumed_pages.length - correct;
		
		//console.log([correct, incorrect, gen.questions_for_passing]);

		// See if we are done.  If so, return null.
		if( correct>=gen.questions_for_passing ) return null;

		// Test failed!  Process the tutorial gen.
		result = runGen_nocopy(seed, pages, gen.tutorial_gen);

		// See if tutorial gen returned a new json page to give to user. 
		if(result !== null) return result;

		// See if we're out of pages

		// We have now done both the test and the tutorial, but neither have 
		// given us a result.  Loop and start the process over again, re-giving
		// test and tutorial as many times as it takes for me.UNTIL to be true.

		// Escape value
		escape_on_loop--;
	}
	//console.log( consumed_pages );
	throw new Error('AdaptiveGen should not exit loop');
};


/**
	runGen will actually run the appropriate generator on the currently-passed template page.
	
	It translates the string name of a gen into the actual code.
*/
const runGen_copy = (seed: number, param_pages: Array<IfPageBaseSchema>, gen: GenType | AdaptiveGenType): Object => {
	// Make a quick copy fo the original array. We do *not* want to modify the original array
	// 	 Individual gens will shift elements off the start of the array as they consume
	//	 the previous page entries.
	const pages = param_pages.slice();

	let new_json = runGen_nocopy(seed, pages, gen);

	// Parse and stringify returned template, as sometimes references will get passed along and 
	// modified later on. Don't want those changes to influence the templates.
	//console.log('RETURNING runGEN');
	//console.log( new_json );
	return JSON.parse(JSON.stringify(new_json));
}

// Nocopy is used internally to run gens.
// If a gen needs to consume a page, it shouldn't be making a copy.
const runGen_nocopy = (seed: number, pages: Array<IfPageBaseSchema>, gen: GenType | AdaptiveGenType): Object => {
	const translate = {
		'UntilGen': UntilGen,
		'ShuffleGen': ShuffleGen,
		'LinearGen': LinearGen,
		'AdaptiveGen': AdaptiveGen,
		'ShuffleGenUntilLimit': ShuffleGenUntilLimit,
	};

	if(typeof translate[gen.gen_type] === 'undefined') throw new Error('Invalid gen type ' + gen.gen_type + ' send to Gens.g');

	let new_json = translate[gen.gen_type](seed, pages, gen);
	return new_json;
}


////////////////////////////////////////////////////////////////////////
// Linear

if(TEST) (() => {

	const testPage = {
		correct: true
		//type: 'IfPageFormulaSchema',
		/*
		description: 'ShuffleA',
		instruction: 'test',
		tests: [ { a: 1 } ],
		solution_f: '=a1',
		code: 'test'
		*/
	};
	
	const test_linear_gen: GenType = {
		gen_type: 'LinearGen',
		pages: [
			{ ...testPage, description: 'LinearA' },
			{ ...testPage, description: 'LinearB' },
			{ ...testPage, description: 'LinearC' },
		],
	}

	const test_linear_gen_child: GenType = {
		gen_type: 'LinearGen',
		pages: [
			{ ...testPage, description: 'LinearChild' },
		],
	}

	let results = [];

	console.log('\nTesting LinearGen');

	// Test normal add
	results.push(runGen_copy(1, [], test_linear_gen));
	assert.ok( results.length === 1, 'Gen.LinearA: One result' );
	assert.ok( results[0].description === 'LinearA', 'Gen.LinearA: One result wrong' );
	
	results.push(runGen_copy(1, results, test_linear_gen));
	assert.ok( results.length === 2, 'Gen.LinearB: One result' );
	assert.ok( results[1].description === 'LinearB', 'Gen.LinearB: One result wrong' );

	results.push(runGen_copy(1, results, test_linear_gen));
	assert.ok( results.length === 3, 'Gen.LinearC: One result' );
	assert.ok( results[2].description === 'LinearC', 'Gen.LinearC: One result wrong' );


	results.push(runGen_copy(1, results, test_linear_gen));
	assert.ok( results.pop() === null, 'Gen.LinearD: Null returned1' );

	// Test to see if it'll end 
	results.push(results[0]); // add one more element

	results.push(runGen_copy(1, results, test_linear_gen)); // try to add.
	assert.ok( results.pop() === null, 'Gen.LinearD: Failed to return null2' );


	// Test to make sure that making changes to the gen doesn't influence the pages.
	// $FlowFixMe
	test_linear_gen.pages[0].description = 'LinearAChanged';
	assert.ok( results[0].description === 'LinearA', 'Gen.LinearChanging: Changing gen should not impact Page' );


	// Test to make sure child units process ok

	// Add child gen 
	test_linear_gen.pages.push(test_linear_gen_child);

	// Remove 4th element
	results.pop();

	results.push(runGen_copy(1, results, test_linear_gen)); // try to add.
	assert.ok( results[3].description === 'LinearChild', 'Gen.LinearChild: Did not add child' );
	

	// Test the until features.
	results = [];

	test_linear_gen.until_total = 2;

	results.push(runGen_copy(1, results, test_linear_gen)); // try to add first item.
	results.push(runGen_copy(1, results, test_linear_gen)); // try to add first item.
	assert.ok( results[1].description === 'LinearB', 'Gen.LinearChild: UntilTotal good test' );

	results.push(runGen_copy(1, results, test_linear_gen)); // try to add first item.
	assert.ok( results.pop() === null, 'Gen.LinearChild: UntilTotal Bad test' );

	// Test the until_correct feature.
	results = [];
	test_linear_gen.until_correct = 1;
	test_linear_gen.until_total = 5;

	results.push(runGen_copy(1, results, test_linear_gen)); // try to add first item.
	results[0].correct = false;
	results.push(runGen_copy(1, results, test_linear_gen)); // try to add first item.
	results[1].correct = true;
	assert.ok( results[1].description === 'LinearB', 'Gen.LinearChild: UntilCorrect good test' );

	results.push(runGen_copy(1, results, test_linear_gen)); // try to add first item.
	assert.ok( results.pop() === null, 'Gen.LinearChild: UntilCorrect Bad test' );

	// Test a structure where two linear gens are in order.
	let test_linear_gen1 = ({
		gen_type: 'LinearGen',
		pages: [
			{ ...testPage, description: 'Linear1' }
		],
	}: GenType );

	let test_linear_gen2 = ({
		gen_type: 'LinearGen',
		until_total: 2,
		pages: [
			{ ...testPage, description: 'Linear2' },
			{ ...testPage, description: 'Linear3' },
			{ ...testPage, description: 'Linear4' },
		],
	}: GenType);

	let test_linear_genparent = ({
		gen_type: 'LinearGen',
		pages: [
			test_linear_gen1, test_linear_gen2
		]
	}: GenType );

	results = []

	results.push(runGen_copy(1, results, test_linear_genparent))
	results.push(runGen_copy(1, results, test_linear_genparent))
	results.push(runGen_copy(1, results, test_linear_genparent))
	assert.ok( results[2] !== null, 'Gen.Linear: Sequence 1');

	results.push(runGen_copy(1, results, test_linear_genparent))
	assert.ok( results[3] === null, 'Gen.Linear: Sequence 2');


	// Test until correct
	test_linear_gen2 = ({
		gen_type: 'LinearGen',
		until_total: 3,
		until_correct: 2,
		pages: [
			{ ...testPage, description: 'Linear2' },
			{ ...testPage, description: 'Linear3' },
			{ ...testPage, description: 'Linear4' },
			{ ...testPage, description: 'Linear5' },
		],
	}: GenType);
	test_linear_genparent.pages[1] = test_linear_gen2;

	results = []

	results.push(runGen_copy(1, results, test_linear_genparent))
	results[0].correct = true;
	
	results.push(runGen_copy(1, results, test_linear_genparent))
	results[1].correct = true;
	assert.ok( results[1].description === 'Linear2', 'Gen.Linear: Dual Seq 1');
	
	results.push(runGen_copy(1, results, test_linear_genparent))
	results[2].correct = true;
	assert.ok( results[2].description === 'Linear3', 'Gen.Linear: Dual Seq 2');
	
	results.push(runGen_copy(1, results, test_linear_genparent))
	assert.ok( results[3] === null, 'Gen.Linear: Dual Seq 3');

	console.log(results);


})();





////////////////////////////////////////////////////////////////////////
// Until

if(TEST) (() => {

	const testPage = { correct: true };
	const incorrectTestPage = { correct: false };
		
	const test_until_gen: GenType = {
		gen_type: 'UntilGen',
		pages: [
			{ ...testPage, description: 'UntilA' },
		],

		until_correct: 2,
		until_total: 4,
	}

	let results = [];

	console.log('\nTesting UntilGen');

	// Test no response for already fulfilled item. 
	// $FlowFixMe
	results.push(runGen_copy(1, [testPage, testPage], test_until_gen));
	assert.ok( results.pop() === null, 'Gen.UntilNoAdd: Do not add if already satisfied condition A' );

	results = [];
	// $FlowFixMe
	results.push(runGen_copy(1, [testPage, incorrectTestPage, incorrectTestPage, incorrectTestPage], test_until_gen));
	assert.ok( results.pop() === null, 'Gen.UntilNoAdd: Do not add if already satisfied condition B' );


	// Test until_correct 
	results = [];
	results.push(runGen_copy(1, results, test_until_gen));
	assert.ok( results.length === 1, 'Gen.UntilA: One result' );

	// $FlowFixMe
	test_until_gen.pages[0].description = 'UntilB';
	results.push(runGen_copy(1, results, test_until_gen));
	assert.ok( results.length === 2, 'Gen.UntilB: One result' );

	// $FlowFixMe
	test_until_gen.pages[0].description = 'UntilC';
	results.push(runGen_copy(1, results, test_until_gen));
	assert.ok( results.pop() === null, 'Gen.UntilC: Null result should be returned' );


	// Test until_correct was false.
	results = [ testPage, incorrectTestPage];
	// $FlowFixMe
	results.push(runGen_copy(1, results, test_until_gen));
	assert.ok( results.length === 3, 'Gen.UntilD: test until correct was false1' );

	results = [ incorrectTestPage, incorrectTestPage, testPage, incorrectTestPage];
	// $FlowFixMe
	results.push(runGen_copy(1, results, test_until_gen));
	assert.ok( results.pop() === null, 'Gen.UntilE: Test until_total was not null' );

})();




////////////////////////////////////////////////////////////////////////
// Shuffle

if(TEST) (() => {

	const testPage = { correct: true };
	
	const test_linear_gen: GenType = {
		gen_type: 'ShuffleGen',
		pages: [
			{ ...testPage, description: 'ShuffleA' },
			{ ...testPage, description: 'ShuffleB' },
			{ ...testPage, description: 'ShuffleC' },
			{ ...testPage, description: 'ShuffleD' },
		],
	}

	
	console.log('\nTesting ShuffleGen');

	// Test normal add
	let escape = 1000;
	let result = runGen_copy(1, [], test_linear_gen);;

	// Try 1000 times to get a result that doesn't have A in position 1.
	while( escape > 0) {
		escape--;

		if(result.description !== 'ShuffleA') {
			result = runGen_copy(1, [], test_linear_gen);
		}
	}
	assert.ok( result.description !== 'ShuffleA', 'Gen.ShufleA: wrong' );
	
})();




////////////////////////////////////////////////////////////////////////
// ShuffleUntilLimit

if(TEST) (() => {

	const testPage = { correct: true };
	
	const test_gen: GenType = {
		gen_type: 'ShuffleGenUntilLimit',
		until_total: 3,
		pages: [
			{ ...testPage, description: 'ShuffleA', correct: false },
			{ ...testPage, description: 'ShuffleB', correct: false  },
			{ ...testPage, description: 'ShuffleC', correct: false  },
			{ ...testPage, description: 'ShuffleD', correct: false  },
		],
	}

	
	console.log('\nTesting ShuffleUntilLimitGen');

	// Test normal add
	let escape = 1000;
	let results = [];
	let result = runGen_copy(1, results, test_gen);;
	
	// Test the randomization.
	// Try 1000 times to get a result that doesn't have A in position 1.
	// If it doesn't happen, then we can be pretty confident that randomization isn't happening.
	while( escape > 0) {
		escape--;

		if(result.description !== 'ShuffleA') {
			result = runGen_copy(1, [], test_gen);
		}
	}
	assert.ok( result.description !== 'ShuffleA', 'Gen.ShufleA: wrong' );


	// Keep adding until we get a null, meaning that it is declining to add any more items.
	results.push(result);

	while( results[results.length-1] !== null) {
		results.push(runGen_copy(1, results, test_gen));

		assert.ok( results.length <= test_gen.until_total + 1, 'Gen.ShufleB: Added too many items1' );
	}
	assert.ok( results.pop() === null, 'Gen.ShufleB: Added too many items2' );
	assert.ok( results.length === test_gen.until_total , 'Gen.ShufleB: Added too many items3' );
	

	// Now make sure that it can handle duplicating items as needed.
	test_gen.until_total = 6;

	while( results[results.length-1] !== null) {
		results.push(runGen_copy(1, results, test_gen));

		assert.ok( results.length <= test_gen.until_total +1 , 'Gen.ShufleC: Added too few items3' );
	}
	assert.ok( results.pop() === null, 'Gen.ShufleC: Added too few items4' );
	assert.ok( results.length === test_gen.until_total , 'Gen.ShufleC: Added too few items5' );


	// Test to make sure that until_total works properly.
	test_gen.until_total = 4;
	// Note: make sure to have fewer pages than the until_total to make sure that it can add multiple versions
	// of the same page.
	test_gen.pages = [
		{ description: 'ShuffleUntilLimitA', correct: false  },
		{ description: 'ShuffleUntilLimitB', correct: false  },
		
	];

	results = [];
	results.push(runGen_copy(1, results, test_gen));
	results.push(runGen_copy(1, results, test_gen));
	results.push(runGen_copy(1, results, test_gen));
	results.push(runGen_copy(1, results, test_gen));
	
	// Successfully added 4 incorrect items.
	assert.ok( results[3] !== null, 'Gen.ShuffleUntilLimit: Add until end failed1' );
	
	// Add one more, Should return null.
	results.push(runGen_copy(1, results, test_gen));
	assert.ok( results[4] === null, 'Gen.ShuffleUntilLimit: Add until end failed2' );

	// Test the 'until correct' feature.
	test_gen.until_correct = 3;

	// Reset, and try to add correct
	results = [];
	test_gen.pages = [ 	
		{ description: 'ShuffleUntilLimitUntilTest' } 
	];
	results.push(runGen_copy(1, results, test_gen));
	results[0].correct = true;
	results.push(runGen_copy(1, results, test_gen));
	results[1].correct = false;
	results.push(runGen_copy(1, results, test_gen));
	results[2].correct = false;

	// Successfully added 2 incorrect and 1 correct items.
	assert.ok( results[2] !== null, 'Gen.ShuffleUntilLimit: Add until correct failed1' );

	results.push(runGen_copy(1, results, test_gen));
	results[3].correct = true;

	results.push(runGen_copy(1, results, test_gen));
	assert.ok( results.pop() === null, 'Gen.ShuffleUntilLimit: Add until correct failed2' );
})();




////////////////////////////////////////////////////////////////////////
// AdaptiveGen

if(TEST) (() => {

	const testPageTrue = { correct: true },
		testPageFalse ={ correct: false };
	
	const test_gen: AdaptiveGenType = {
		gen_type: 'AdaptiveGen',
		questions_for_passing: 2,
		
		test_gen: ({
			gen_type: 'ShuffleGenUntilLimit',
			until_total: 2,
			pages: [
				{ description: 'TestGen', correct: false }, 
			]
		}: GenType),

		tutorial_gen: ({
			gen_type: 'LinearGen',
			pages: [{ description: 'TutorialGen'} ]
		}: GenType)
	}

	
	console.log('\nTesting AdaptiveGen');

	// Test failure case.
	let results = [];
	results.push( runGen_copy(1, results, test_gen) );  // test1
	results.push( runGen_copy(1, results, test_gen) );  // test 2
	results.push( runGen_copy(1, results, test_gen) ); // tutorial
	results.push( runGen_copy(1, results, test_gen) ); // correct
	results[3].correct = true;

	results.push( runGen_copy(1, results, test_gen) ); // correct
	results[4].correct = true;

	results.push( runGen_copy(1, results, test_gen) ); // null

	assert.ok( results[0].description == 'TestGen', 'Gen.AdaptiveA1' );
	assert.ok( results[1].description == 'TestGen', 'Gen.AdaptiveA2' );
	assert.ok( results[2].description === 'TutorialGen', 'Gen.AdaptiveA3' );
	assert.ok( results[3].description === 'TestGen', 'Gen.AdaptiveA4' );
	assert.ok( results[4].description === 'TestGen', 'Gen.AdaptiveA5' );
	assert.ok( results[5] === null, 'Gen.AdaptiveA6' );



})();




module.exports = {
	runGen: runGen_copy,
	UntilGen: 'UntilGen',
	ShuffleGen: 'ShuffleGen',
	LinearGen: 'LinearGen',
	AdaptiveGen: 'AdaptiveGen',
	ShuffleGenUntilLimit: 'ShuffleGenUntilLimit',
};

