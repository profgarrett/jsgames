//     
const { parseFeedback } = require('./parseFeedback');

const DEBUG = true;


/**
	A list of functions and their associated KCs.
*/
const FUNCTION_KCS = [
	{ kc: 'IF', matches:['if'] }, 
	{ kc: 'IF_CONDITION', matches: ['or', 'and', 'not'] },
	{ kc: 'TEXT_CUT', matches: ['left', 'right'] },
	{ kc: 'TEXT_SIMPLE', matches: ['len', 'upper', 'lower'] },
	{ kc: 'DATE_SIMPLE', matches: ['now'] },
	{ kc: 'DATE_FORMAT', matches: [ 'weekdays', 'month', 'day', 'year'] },
	{ kc: 'DATE_RANGE', matches: [ 'networkdays' ] },
	{ kc: 'ROUND', matches: [ 'floor', 'round', 'roundup', 'roundown', 'ceiling'] },
	{ kc: 'RANGE', matches: [ 'sum', 'count', 'average', 'min', 'max' ] }
];



const get_function_kcs = ( solution_f         )             => {
	const kcs = [];
	const parsed_f = parseFeedback(solution_f);
	const parsed_functions = parsed_f.filter( has => has.has === 'functions' );
	const fs = parsed_functions.length === 0 ? [] : parsed_functions[0].args;

	for(let i=0; i<fs.length; i++ ){ 
		for(let j=0; j<FUNCTION_KCS.length; j++ ) {
			if( 0 < FUNCTION_KCS[j].matches.filter( s => s === fs[i].toLowerCase()).length ) {
				kcs.push( { tag: 'FUNCTION_' + FUNCTION_KCS[j].kc } );
			}
		}
	}

	return kcs;
};


if(DEBUG) {
	const f_tests = [
		{ kc: 'FUNCTION_RANGE', solution_f: '=sum(1)' },
		{ kc: 'FUNCTION_RANGE', solution_f: '=sum(1)+min(1)' },
	];

	f_tests.map( test => {
		const result = get_function_kcs( test.solution_f )[0].tag === test.kc;
		if(!result) console.log([ 'FAILED TEST', test.kc, get_function_kcs( test.solution_f )[0] ]);
	});
}


const RULES = [
	{
		tag: 'MATH_BASIC',
		if: ( solution_f        , parsed_f ) => {
			const symbols = parsed_f.filter( has => has.has === 'symbols' );

			if(symbols.length === 0) return false;

			for(let i=0; i<symbols[0].args.length; i++ ){ 
				if(symbols[0].args[i] === '+' || 
					symbols[0].args[i] === '-' || 
					symbols[0].args[i] === '/' || 
					symbols[0].args[i] === '*' ) return true;
			}

			return false;
		},
		tests: [
			{ triggered: false, solution_f: '=1^2' },
			{ triggered: false, solution_f: '=2' },
			{ triggered: true, solution_f: '=1+2' },
			{ triggered: true, solution_f: '=1*2' },
			{ triggered: true, solution_f: '=1-2' },
			{ triggered: true, solution_f: '=1/2' },
		]
	},
	{
		tag: 'REFERENCE_1x',
		if: ( solution_f        , parsed_f ) => {
			const refs = parsed_f.filter( has => has.has === 'references' );

			if(refs.length === 0) return false;
			return (refs[0].args.length === 1);
		},
		tests: [
			{ triggered: false, solution_f: '=1' },
			{ triggered: false, solution_f: '=b1+a2' },
			{ triggered: true, solution_f: '=a1*2' },
			{ triggered: true, solution_f: '=1-c1' },
			{ triggered: true, solution_f: '=b1/2' },
		]
	},
	{
		tag: 'REFERENCE_2x_plus',
		if: ( solution_f        , parsed_f ) => {
			const refs = parsed_f.filter( has => has.has === 'references' );

			if(refs.length === 0) return false;
			return (refs[0].args.length > 1);
		},
		tests: [
			{ triggered: false, solution_f: '=1' },
			{ triggered: false, solution_f: '=b1' },
			{ triggered: true, solution_f: '=a1*a2' },
			{ triggered: true, solution_f: '=b1-c1' },
			{ triggered: true, solution_f: '=b1/a2-b1' },
		]
	},
	{
		tag: 'FUNCTION_1x',
		if: ( solution_f        , parsed_f ) => {
			const refs = parsed_f.filter( has => has.has === 'functions' );

			if(refs.length === 0) return false;
			return (refs[0].args.length === 1);
		},
		tests: [
			{ triggered: false, solution_f: '=1' },
			{ triggered: false, solution_f: '=b1+a2' },
			{ triggered: true, solution_f: '=sum(a1,2)' },
			{ triggered: true, solution_f: '=max(1-c1)' },
		]
	},
	{
		tag: 'FUNCTION_2x_plus',
		if: ( solution_f        , parsed_f ) => {
			const refs = parsed_f.filter( has => has.has === 'functions' );

			if(refs.length === 0) return false;
			return (refs[0].args.length > 1);
		},
		tests: [
			{ triggered: false, solution_f: '=1' },
			{ triggered: false, solution_f: '=sum(b1)' },
			{ triggered: true, solution_f: '=sum(a1)*max(a2)' },
		]
	},
];

// Test out complexity rules.
if(DEBUG) {
	console.log('TESTING COMPLEXITY');

	RULES.map( rule => {
		rule.tests.map( t => {
			let triggered = rule.if(t.solution_f, parseFeedback(t.solution_f) );
			if( triggered !== t.triggered ) {
				console.log('Failed rule '+rule.tag);
				console.log(t);
				console.log(parseFeedback(t.solution_f));
			}
		});
	});
}


// Return a complexity analysis of the ideal solution.
function get_kcs( solution_f         )                {
	const kcs = get_function_kcs(solution_f);
	const parsed_f = parseFeedback( solution_f );
	
	//console.log([ solution_f, kcs]);

	RULES.map( rule => {
		if( rule.if(solution_f, parsed_f ) ) {
			kcs.push( { tag: rule.tag } );
		}
	});

	

	/*
	parsed_f.map( has => { 
		// Add count.
		if( has.args.length > 0)
			complexity.push( { tag: has.args.length + ' ' + has.has });

		// Add individual tags
		has.args.map( arg => { complexity.push( { tag: has.has + ' ' + arg }); });
	});
	*/

	return kcs;
}

module.exports = { get_kcs };

