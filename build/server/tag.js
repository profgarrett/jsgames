//      
/**
	This "tag" module is used to automatically tag elements for correctness.

*/
                                                                      

const { parseFeedback } = require('./parseFeedback');


const TEST_TAG_ERRORS = {

};


const TAG_ERRORS = {
	WRONG_VALUE: {},
	INVALID_REFERENCE: {
		tag: 'Invalid Reference',
		title: 'A reference points to a cell that does not exist.'
	},
	INTERMEDIATE_STATE: {
		tag: 'Intermediate state',
		title: 'Intermediate state',
		if: () => true
	}
};


// Filter 
const filter_history = 	(h) => h.filter( // filter non f and unused events.
							h => typeof h.client_f !== 'undefined' &&
								h.client_f !== null &&
								h.code !== 'created' &&
								h.code !== 'server_page_completed'
						).filter( // remove null values 
							h => h !== null

						).filter( // filter out any harsons with a ;, as those are returned whenver something is being
							// built (drag and drop operation), or something is put on the background.
							h => (h.client_f.search(';') === -1)
						);


// tag dups and progressively built items  A, A+, A+1, ...
const tag_intermediate_history = (h) => h.map( 
		(h, i, h_array) => {
			// always return last item.
			if(i==h_array.length-1)
					return { tags: [], ...h }; 

			// must be different than next.
			if (h.client_f === h_array[i+1].client_f) 
					return { tags: [{tag:'intermediate'}], ...h };

			// must be different than next + 1 or more characters, i.e. ignore intermediate typing
			if(h.client_f === h_array[i+1].client_f.substr(0, h.client_f.length)) 
					return { tags: [{tag:'intermediate'}], ...h };

			// see if we are deleting, i.e., the current entry could entirely fit inside 
			// of the previous entry.
			if(i>1 && h_array[i-1].client_f.indexOf(h.client_f) !== -1) 
					return { tags: [{tag:'intermediate'}], ...h };

			return { tags: [], ...h }; // default to returning.
		}
	);


// Return if the tag array has a matching tag.
// T/F
function has_tag(tags               , match        )          {
	return 0 < tags.filter( t => t.tag === match ).length;
}


function tag_page_on_abs_ref(page                 ) {

	// If there should be a $, ignore.
	if(page.solution_f.search(/\$/) !== -1 ) return;

	page.history.map( h => {
		if(h.client_f.search(/\$/) !== -1) {
			h.tags.push( {tag: 'ABS_REF'} );
		}
		if(!has_tag(h.tags, 'intermediate')) 
			console.log([ h.client_f, h.tags ]);
	});
}




function return_tagged_level(level           )            {

	level.pages = level.pages.map( page => {
			// If no solution, then continue.
			if(typeof page.solution_f === 'undefined') return page;

			// Clean-up history.
			let filtered_history = filter_history(page.history);
			filtered_history = tag_intermediate_history(filtered_history);
			page.history = filtered_history;

			// Run checks.
			tag_page_on_abs_ref(page);

			return page;
		});

	return level;
}


module.exports = {
	TAG_ERRORS,
	has_tag,
	return_tagged_level	
};