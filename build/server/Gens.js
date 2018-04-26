//      
const { DataFactory } = require('./DataFactory');
                                                                              


/**
	Generator are used to create pages.

	They are smart functions that will create new pages in a deterministic fashion.
	This means that given the same input, they will also provide the same output.

	Any random behavior requires a seed value given by the level.

	Gens are deterministic functions that are used to build out a level.
	When run on an empty set, create the initial page.
	When run on a partial set, re-run the initial page creation, and all subsequent creations, 
		popping off completed pages.
	When run on a finished set, returns null.

	Runs recursively. Will pop() off pages as they match previous history.

	Returns the json for the next page.  
		Note that the json is not initialized, but
		is just the raw data for use in the action Level function that sets up pages.

	The first gen used in a level must be passed a new unique array in reverse order.
*/

// Return pages in a simple linear order.
const LinearGen = (seed        , pages                 , gen         )      => {
	// Convenience function that puts pages into good order for pop().
	let gen_pages = gen.pages.slice().reverse();
	let last_gen_page = null;
	let result = null;

	// Start removing matching elements.
	while(result === null) {
		
		if(gen_pages.length < 1) return null;

		last_gen_page = gen_pages[gen_pages.length-1];
		if(typeof last_gen_page.gen == 'function') {
			// The top item for gen_pages is a generator.
			// Throw the results into the generator for it to consume as needed.
			result = last_gen_page.gen(seed, pages, last_gen_page);

			// Remove the top gen, but not any of the pages.  The gen should pop pages as needed.
			gen_pages.pop();

		} else {
			// Page isn't a generator,

			if( pages.length > 0) {
				// We have previous data. Pull off the previous items.
				pages.pop();
				gen_pages.pop();

			} else {
				// We are out of user data.  Pull the latest and return it.
				result = gen_pages.pop();
			}
		}

	}
	return result;
};



// Pick one of the potential random sections 
const ShuffleGen = (seed        , pages                 , gen         )      => {
	// Create a new gen that is randomized by the given seed.
	let randomized_gen = {
		...gen,
		pages: DataFactory.randomizeList(gen.pages.slice(), seed)
	};

	// Treat this as a Linear Gen.
	return LinearGen(seed, pages, randomized_gen);
};




// Continue for as long as until is false.
// Should have only a single gen passed.  Will continue creating pages from
// that page until the UNTIL function returns true.
const UntilGen = (seed        , pages                 , gen         )      => {
	let until_results = [];
	let last_page = null;

	// Run checks on the UntilGen initialization data.
	if(gen.pages.length !== 1) 
		throw new Error('UntilGen can only have a single page');
	if(typeof gen.pages[0].gen !== 'undefined')
		throw new Error('UntilGet cannot be given a function gen');
	if(gen.pages[0].code === 'tutorial')
		throw new Error('UntilGet cannot be given a gen with Tutorial type.  Must be test ' +
				'so that the gen can add new pages');
	if(typeof gen.until !== 'function')
		throw new Error('UntilGen must have an until function');


	// Remove elements as long as they lead to a false result.
	while(last_page === null ) {

		if( pages.length > 0) {
			// We have previous data.
			last_page = pages.pop();
			until_results.push(last_page);

			// See if we've reach a true result for the until function.
			if(gen.until && gen.until( until_results, gen ) ) {
				// Good!  The latest page (when added to other pages) successfully
				// satisfied the until condition.  Show that we're done by returning null.
				return null;
			} else {
				// Bad! Keep on going through the list of results 
				last_page = null;
			}
		} else {
			// We are out of user data.  Return the gen data to create a new page.
			return gen.pages[0];
		}

	}
	throw new Error('UntilGen should have returned in loop');
};



/**
	An adaptive gen administers a test.  
	Once the test is done, 
		until runs to see if the user needs to complete a tutorial_gen.
			If FALSE, then administers tutorial.  
			If TRUE, then exits.

	Note that the test_gen must be of a fixed length.  It cannot expand, like an UNTIL gen.
*/
const AdaptiveGen = (seed        , pages                 , me                 )      => {
	let result = null;
	let original_pages = pages.slice();
	let consumed_pages = [];

	if(typeof me.tutorial_gen.gen === 'undefined' ||
		typeof me.test_gen.gen === 'undefined') 
		throw new Error('AdaptiveGen requires gen functions');

	if(me.tutorial_gen.gen === UntilGen || me.test_gen.gen === UntilGen) 
		throw new Error('AdaptiveGen should not have untilgen');


	// No user results.  Administer test.
	if(pages.length < 1)
		return me.test_gen.gen(seed, pages, me.test_gen);

	// Start processing pages.
	// Note that no elements will be removed from me, as it uses a gen only.
	while(result === null) {
		// Reset the temp array of pages. Used to find out which have been removed.
		// Run each time we loop, as we need it reset prior to running test_gen.
		original_pages = pages.slice();

		// Run the test gen, which consumes pages and may return either
		//	json or null (showing that all gen_pages were consumed)
		result = me.test_gen.gen(seed, pages, me.test_gen);

		// See if test gen returned a new json page to give to the user. Done!
		if(result !== null) 
			return result;

		// Test_gen returned null, meaning that it consumed enough pages.
		// Build a sequence of pages that the gen consumed. We use
		// this array to pass into UNTIL, which needs their results to test.
		consumed_pages = original_pages.slice(pages.length);

		// See if we are done.  If so, return null.
		if(me.until(consumed_pages))
			return null;

		// Not done.  Process the tutorial gen.
		result = me.tutorial_gen.gen(seed, pages, me.tutorial_gen);

		// See if tutorial gen returned a new json page to give to user. Done!
		if(result !== null)
			return result;

		// We have now done both the test and the tutorial, but neither have 
		// given us a result.  Loop and start the process over again, re-giving
		// test and tutorial as many times as it takes for me.UNTIL to be true.
	}
	throw new Error('AdaptiveGen should not exit loop');
};


module.exports = {
	UntilGen: UntilGen,
	ShuffleGen: ShuffleGen,
	LinearGen: LinearGen,
	AdaptiveGen: AdaptiveGen
};

