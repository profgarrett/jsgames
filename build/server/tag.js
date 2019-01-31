//      
/**
	This "tag" module is used to automatically tag elements for correctness.

*/
                                                                      

const { /*parseFormula,*/ parseFeedback } = require('./parseFeedback');


/**
	A list of functions usable by the user.
	Needed to detect whenever the user writes the name of a function without the 
	proper (), i.e., or ( instead of =or()
*/
const FUNCTION_LIST = [
	'if', 'or', 'and', 'not',
	'left', 'right', 'len', 'upper', 'lower',
	'upper', 'lower',
	'now', 'weekdays', 'month', 'day', 'year', 	'networkdays',
	'floor', 'round', 'roundup', 'roundown', 'ceiling',
	'sum', 'count', 'average', 'min', 'max'
];

// Filter 
const filter_history = 	
		(h) => h.filter( 
			// filter non f and unused events.
			h => typeof h.client_f !== 'undefined' &&
				h.client_f !== null &&
				h.code !== 'created' &&
				h.code !== 'server_page_completed'
		).filter( 
			// remove null values 
			h => h !== null

		).filter( 
			// filter out any harsons with a ;, as those are returned whenver something is being
			// built (drag and drop operation), or something is put on the background.
			h => (h.client_f.search(';') === -1)
		);


// tag progressively built items  A, A+, A+1, ...
// Also addes a tags: [] property to each history object in the array.
const tag_intermediate_history = (h) => h.map( 
		(h, i, h_array) => {
			// always return last item.
			if(i==h_array.length-1)
					return { tags: [], ...h }; 

			// must be different than next.
			if (h.client_f === h_array[i+1].client_f) 
					return { tags: [{tag:'INTERMEDIATE'}], ...h };

			// must be different than next + 1 or more characters, i.e. ignore intermediate typing
			// Only valid if the adding is at the end.
			if(h.client_f === h_array[i+1].client_f.substr(0, h.client_f.length)) 
					return { tags: [{tag:'INTERMEDIATE'}], ...h };

			// See if we have a pattern of progressively-built inner options.
			// i.e., =(), =(a), =(a1)
			if(is_sub_sequence(h.client_f, h_array[i+1].client_f))
					return { tags: [{tag:'INTERMEDIATE'}], ...h };

			// See if we have intermediate deletions.
			// i.e., =(a1), =(a), =()
			if(i>0 && is_sub_sequence(h.client_f, h_array[i-1].client_f))
					return { tags: [{tag:'INTERMEDIATE'}], ...h };

			// see if we are deleting, i.e., the current entry could entirely fit inside 
			// of the previous entry. Only valid if the deletion is at the end.
			if(i>1 && h_array[i-1].client_f.indexOf(h.client_f) !== -1) 
					return { tags: [{tag:'INTERMEDIATE'}], ...h };

			return { tags: [], ...h }; // default to returning.
		}
	);


// Tests to see if s1 is a sub-sequence of s2.
function is_sub_sequence(s1        , s2        )          {
	let j = 0;
	let i = 0;

	// Walk through both strings.
	while( j<s1.length && i<s2.length) {
		if(s1.substr(j,1) === s2.substr(i,1))
			j++;
		i++;
	}

	// If we are at the end of checking s1, then TRUE else FALSE.
	return j===s1.length;
}

/*
// TESTS.

tag_intermediate_history([ 
	{ client_f: '=LEFT("L", 1)' }, 
	{ client_f: '=LEFT("Le", 1)' }, 
	{ client_f: '=LEFT("Lef", 1)' }, 
	{ client_f: '=LEFT("Left", 1)' }, 
	{ client_f: '=LEFT("Left", 2)' }, 
	]
).map( h=> console.log( [h.tags, h.client_f]));

tag_intermediate_history([ 
	{ client_f: '=LEFT("Left", ' }, 
	{ client_f: '=LEFT("Left", 1' }, 
	{ client_f: '=LEFT("Left", 1)' }, 
	{ client_f: '=LEFT("Lef", 1)' }, 
	{ client_f: '=LEFT("Le", 1)' }, 
	{ client_f: '=LEFT("", 1)' }, 
	{ client_f: '=LEFT("R", 1)' }, 
	{ client_f: '=LEFT("Ri", 1)' }, 
	{ client_f: '=LEFT("Rig", 1)' }, 
	{ client_f: '=LEFT("Righ", 1)' }, 
	{ client_f: '=LEFT("Right", 1)' }, 
	{ client_f: '=LEFT("Right", 2)' }, 
	]
).map( h=> console.log( [h.tags, h.client_f]));
*/


// Return if the tag array has a matching tag.
// T/F
function has_tag(tags               , match        )          {
	return 0 < tags.filter( t => t.tag === match ).length;
}

// Looks to see if s is in the array.
// Can be passed strings or numbers.
// Case-insensitive.
function is_in( value     , aValues            )          {
	for(let i = 0; i<aValues.length; i++) {
		if(typeof value === 'string' ) {
			// Case-insenitive check.
			if(typeof aValues[i] === typeof value && 
					aValues[i].toLowerCase() === value.toLowerCase()) 
					return true;
		} else if (typeof value === 'number' ) {
			if(aValues[i] === value) return true;
		} else {
			throw new Error('Invalid type passed to is_in '+typeof value )
		}
	}
	return false;
}

function not_in( value     , aValues            )          {
	return !is_in(value, aValues);
}


const ENTRY_TESTS = [
	{
		tag: 'ABS_REF',
		if: (solution_f        , client_f        ) => {

			// If there should be a $ in the solution, ignore.
			if(solution_f.search(/\$/) !== -1 ) return false;

			return (client_f.search(/\$/) !== -1);
		},
		tests: [
			{ triggered: false, solution_f: '$', client_f: '' },
			{ triggered: false, solution_f: '', client_f: '=a1' },
			{ triggered: true, solution_f: '', client_f: '=$a1' }
		]
	},{
		tag: 'NO_STARTING_EQUAL',
		if: (solution_f        , client_f        ) => {
			return !(client_f.substr(0,1) === '=');
		},
		tests: [
			{ triggered: false, solution_f: '', client_f: '='},
			{ triggered: true, solution_f: '', client_f: 'a' },
		]
	},{
		tag: 'NON_ROW_1_REFERENCE',
		if: (solution_f        , client_f        ) => {
			const parsed = parseFeedback(client_f);
			const references = parsed.filter( has => has.has === 'references' );

			for(let i=0; i<references.length; i++) {
				for(let j=0; j<references[i].args.length; j++) {
					if( references[i].args[j].substr(1,1) !== '1') return true;
				}
			}
			return false;
		},
		tests: [
			{ triggered: false, solution_f: '', client_f: '=A1' },
			{ triggered: true, solution_f: '', client_f: '=B2' },
		]
	},{
		tag: 'NON_EXISTANT_COLUMN_REFERENCE',
		if: (solution_f        , client_f        , page                 ) => {
			const parsed  = parseFeedback(client_f);
			const references = parsed.filter( has => has.has === 'references' );

			for(let i=0; i<references.length; i++) {
				for(let j=0; j<references[i].args.length; j++) {
					let ref = references[i].args[j].substr(0,1);

					if(typeof page.tests[0][ref.toLowerCase()] === 'undefined' &&
						typeof page.tests[0][ref.toUpperCase()] === 'undefined' ) return true;
				}
			}
			return false;
		},
		tests: [
			{ triggered: false, solution_f: '', client_f: '=a1', page: { tests: [ {'a': 1, 'b': 2} ] } },
			{ triggered: false, solution_f: '', client_f: '=b1', page: { tests: [ {'a': 1, 'b': 2} ] } },
			{ triggered: true, solution_f: '', client_f: '=c1',  page: { tests: [ {'a': 1, 'b': 2} ] } },
			{ triggered: false, solution_f: '', client_f: '=A1', page: { tests: [ {'a': 1, 'b': 2} ] } },
			{ triggered: false, solution_f: '', client_f: '=B1', page: { tests: [ {'a': 1, 'b': 2} ] } },
			{ triggered: true, solution_f: '', client_f: '=C1',  page: { tests: [ {'a': 1, 'b': 2} ] } }
		]
	},{
		tag: 'USES_REFERENCE_NOT_IN_SOLUTION',
		if: (solution_f        , client_f        , page                 ) => {
			const parsed  = parseFeedback(client_f);
			const references = parsed.filter( has => has.has === 'references' );
			
			for(let i=0; i<references.length; i++) {
				for(let j=0; j<references[i].args.length; j++) {
					let ref = references[i].args[j].substr(0,1);
					if(typeof page.tests[0][ref.toLowerCase()] === 'undefined' &&
						typeof page.tests[0][ref.toUpperCase()] === 'undefined' ) return true;
				}
			}
			return false;
		},
		tests: [
			{ triggered: false, solution_f: '', client_f: '=a1', page: { tests: [ {'a': 1, 'b': 2} ] } },
			{ triggered: false, solution_f: '', client_f: '=b1', page: { tests: [ {'a': 1, 'b': 2} ] } },
			{ triggered: true, solution_f: '', client_f: '=c1',  page: { tests: [ {'a': 1, 'b': 2} ] } },
			{ triggered: false, solution_f: '', client_f: '=A1', page: { tests: [ {'a': 1, 'b': 2} ] } },
			{ triggered: false, solution_f: '', client_f: '=B1', page: { tests: [ {'a': 1, 'b': 2} ] } },
			{ triggered: true, solution_f: '', client_f: '=C1',  page: { tests: [ {'a': 1, 'b': 2} ] } },
		]
	},{
		tag: 'A1_TYPO',
		if: (solution_f        , client_f         ) => {
			
			if(client_f.toLowerCase().search('a!') !== -1 ) return true;
			return false;
		},
		tests: [
			{ triggered: true, solution_f: '', client_f: '=A!' },
			{ triggered: true, solution_f: '', client_f: '=a!' }
		]	
	},{
		tag: 'USES_FUNCTION_NOT_IN_SOLUTION',
		if: (solution_f        , client_f         ) => {
			const solution_parsed = parseFeedback(solution_f);
			const solution_functions = solution_parsed.filter( has => has.has === 'functions' );
			const parsed  = parseFeedback(client_f);
			const functions = parsed.filter( has => has.has === 'functions' );

			// If no values in client string, then we are ok!
			if(functions.length !== 1 ) return false;

			// If we have no values in solution, then we are *not* ok.
			if(solution_functions.length !== 1 ) return true;

			// Test each client value by seeing if it is in the solution.
			for(let i=0; i<functions[0].args.length; i++) {
				if( not_in(functions[0].args[i], solution_functions[0].args)) return true;
			}

			// No unfound values located!
			return false;
		},
		tests: [
			{ triggered: true, solution_f: '=max(1)', client_f: '=sum(1)' },
			{ triggered: true, solution_f: '=max(1)+min(1)', client_f: '=Sum(1)' },
			{ triggered: false, solution_f: '=max(1)+min(1)', client_f: '=MAX(1)' },
			{ triggered: false, solution_f: '=MAX(1)', client_f: '=max(1)' },
		]
	},{
		tag: 'CORRECT',
		if: (solution_f        , client_f        , page                  ) => {
			if(page.correct && client_f == page.client_f) return true;
			return false;
		},
		tests: [
			{ triggered: true, solution_f: '', client_f: '=1', page: { correct: true, client_f: '=1' } },
		]
	},{
		tag: 'USES_BOOLEAN_IN_QUOTES',
		if: (solution_f        , client_f         ) => {
			
			if(client_f.toLowerCase().search('"true"') !== -1 ) return true;

			if(client_f.toLowerCase().search('"false"') !== -1 ) return true;

			return false;
		},
		tests: [
			{ triggered: false, solution_f: '', client_f: '=TRUE' },
			{ triggered: true, solution_f: '', client_f: '="TRUE"' },
			{ triggered: true, solution_f: '', client_f: '="FALSE"' },
			{ triggered: true, solution_f: '', client_f: '="False"' },
			{ triggered: true, solution_f: '', client_f: '="True"' }
		]		
	},{
		tag: 'INVALID_TOKEN',
		if: (solution_f        , client_f         ) => {
			const parsed  = parseFeedback(client_f);
			const values = parsed.filter( has => has.has === 'invalid_tokens' );
			
			// If no values in client string, then we are ok!
			return (values.length > 0 );
		},
		tests: [
			{ triggered: true, solution_f: '=1', client_f: '=|' },
			{ triggered: true, solution_f: '="1ab"', client_f: '=#' },
			{ triggered: false, solution_f: '="a"', client_f: '=1' },
			{ triggered: false, solution_f: '="a"', client_f: '=A1' },
			{ triggered: false, solution_f: '="a"', client_f: '=1/1' }
		]		
	},{
		tag: 'FORMULA_WITHOUT_PAREN',
		if: (solution_f        , client_f         ) => {
			const parsed  = parseFeedback(client_f);
			const invalid = parsed.filter( has => has.has === 'invalid_tokens' );
			
			// If no values, then we are ok!
			if (invalid.length === 0 ) return false;

			// Look to find a list of functions in the invalid list.
			for(let i=0; i<invalid[0].args.length; i++ ){ 
				if(is_in(invalid[0].args[i].toLowerCase(), FUNCTION_LIST)) return true;
			}
			return false;
		},
		tests: [
			{ triggered: true, solution_f: '', client_f: '=sum' },
			{ triggered: true, solution_f: '', client_f: '=sum ' },
			{ triggered: true, solution_f: '', client_f: '=sum (' },
			{ triggered: false, solution_f: '', client_f: '=sum(' },
			{ triggered: false, solution_f: '', client_f: '=sum()' },
		]
	},{	
		tag: 'USES_NUMBER_IN_QUOTES',
		if: (solution_f        , client_f         ) => {
			const parsed  = parseFeedback(client_f);
			const values = parsed.filter( has => has.has === 'values' );
			
			// If no values in client string, then we are ok!
			if(values.length !== 1 ) return false;

			for(let i=0; i<values[0].args.length; i++) {
				if(typeof values[0].args[i] === 'string') {
					if( parseInt(values[0].args[i])+'' === values[0].args[i] ) return true;
				}
			}
			return false;
		},
		tests: [
			{ triggered: false, solution_f: '=1', client_f: '=1' },
			{ triggered: false, solution_f: '="a"', client_f: '="a"' },
			{ triggered: false, solution_f: '="1ab"', client_f: '="1ab"' },
			{ triggered: true, solution_f: '="1"', client_f: '="1"' }
		]		
	},{
		tag: 'USES_VALUE_NOT_IN_SOLUTION',
		if: (solution_f        , client_f        , page                  ) => {
			const solution_parsed = parseFeedback(solution_f);
			const solution_values = solution_parsed.filter( has => has.has === 'values' );
			const parsed  = parseFeedback(client_f);
			const values = parsed.filter( has => has.has === 'values' );

			// Remove any default values (0 and abc) is this is harsens.
			if(page.type === 'IfPageHarsonsSchema') {
				values[0].args = values[0].args.filter( v => v !== 'abc' && v !== 0);
			}

			// If no values in client string, then we are ok!
			if(values.length !== 1 ) return false;

			// If we have no values in solution, then we are *not* ok.
			if(solution_values.length !== 1 ) return true;

			// Test each client value by seeing if it is in the solution.
			for(let i=0; i<values[0].args.length; i++) {
				if( not_in(values[0].args[0], solution_values[0].args)) return true;
			}

			// No unfound values located!
			return false;
		},
		tests: [
			// number
			{ triggered: true, solution_f: '=a1', client_f: '=4', page: { type: '' } },
			{ triggered: true, solution_f: '=123', client_f: '=4', page: { type: '' } },
			{ triggered: true, solution_f: '=123', client_f: '=12', page: { type: '' } },
			{ triggered: false, solution_f: '=123', client_f: '=123', page: { type: '' }  },
			{ triggered: true, solution_f: '=4+4+12', client_f: '=2', page: { type: '' }  },
			{ triggered: false, solution_f: '=4+4+12', client_f: '=12', page: { type: '' }  },
			// test
			{ triggered: true, solution_f: '=A1', client_f: '=4', page: { type: '' }  },
			{ triggered: true, solution_f: '="a"', client_f: '=4', page: { type: '' }  },
			{ triggered: false, solution_f: '="a"', client_f: '="a"', page: { type: '' }  },
			{ triggered: false, solution_f: '="a"', client_f: '="A"', page: { type: '' }  },
			{ triggered: false, solution_f: '="A"', client_f: '="a"', page: { type: '' }  },
			{ triggered: true, solution_f: '="a"', client_f: '="ab"', page: { type: '' }  },
			{ triggered: true, solution_f: '="ab"', client_f: '="a"' , page: { type: '' } },
			{ triggered: false, solution_f: '="b"&"c"', client_f: '="c"', page: { type: '' }  },
			{ triggered: true, solution_f: '="CDE"', client_f: '="CD"', page: { type: '' }  },
			{ triggered: false, solution_f: '="CDE', client_f: '=CdE', page: { type: '' }  },
			// Harsons.
			{ triggered: false, solution_f: '=', client_f: '=0', page: { type: 'IfPageHarsonsSchema' }  },
			{ triggered: false, solution_f: '=', client_f: '="abc"', page: { type: 'IfPageHarsonsSchema' }  },

		]
	}
];

/*
console.log( parseFeedback('=sum(a1,b1,10_'));
//console.log( parseFeedback('=OR(False, FALSE,  true)'));
//console.log( parseFeedback('=OR("False", "FALSE",  "true")'));
//console.log( parseFeedback('=OR("Falsy", "Truthy",  "1")'));


// Run tests.

ENTRY_TESTS.map( test => {
	console.log('Testing '+test.tag);
	test.tests.map( t => {
		let triggered = test.if(t.solution_f, t.client_f, t.page);
		if( triggered !== t.triggered ) {
			console.log(['Failed tag test', t]);
		}
	});
});
*/



function return_tagged_level(level           )            {

	level.pages = level.pages.map( page => {
			// If no solution, then continue.
			if(typeof page.solution_f === 'undefined' || typeof page.client_f === 'undefined') return page;

			// Clean-up history.
			let filtered_history = filter_history(page.history);
			filtered_history = tag_intermediate_history(filtered_history);
			page.history = filtered_history;

			let parsed = {};

			// Run checks.
			page.history.map( h => {
				// Make sure we have data.
				if( typeof h.client_f === 'undefined' ) return;

				// Only tag non-intermediate data.
				if( h.tags.filter( tag => tag.tag === 'INTERMEDIATE').length === 1 ) return;


				// See if we can parse it out.
				try {
					parsed = parseFeedback(h.client_f);
				} catch (e) {
					h.tags.push( { tag: 'PARSE_ERROR'});
					return;
				}

				ENTRY_TESTS.map( test => { 
					if(test.if( page.solution_f, h.client_f, page, parsed )) {
						h.tags.push( { tag: test.tag });
					}
				});

				//if(!has_tag(h.tags, 'intermediate')) 
				//	console.log([ h.client_f, h.tags, parsed.map( p => p.has + ': ' + p.args.join(', ')) ]);

				//if(has_tag(h.tags, 'USES_REFERENCE_NOT_IN_SOLUTION'))
				//	console.log([ h, page.solution_f, h.client_f, page.tests[0] ]);
			});


			return page;
		});

	return level;
}


module.exports = {
	has_tag,
	return_tagged_level	
};