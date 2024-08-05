//const { LinearGen, AdaptiveGen, UntilGen, ShuffleGenUntilLimit } = require('./../Gens');
import type { AdaptiveGenType, GenType } from '../Gens';

export type AdaptiveKC = {
	kc: string,
	tutorial_pages: Array<any>,
	test_pages: Array<any>
}
export type InertiaKC = {
	kc: string,
	tutorial_pages: Array<any>,
	test_pages: Array<any>,
	until_correct?: number,
	until_total?: number,
}


const INERTIA_QUESTIONS_CORRECT_GOAL_COUNT = 5; // how many questions do the inertia qs need to pass?
const INERTIA_MAX_QUESTIONS_UNTIL_REVIEW_COUNT = 10; // if we hit this many questions, then exit.
const REVIEW_QUESTIONS_COUNT = 4; // how many questions do tutorials common use as practice?

/*
	Acts as a controlled list of vocab for KCS

	Imported by individual tutorials to make sure that we accidentally introduce invalid options.
*/
const KC_NAMES = {
	// Math1
	ADD: 'kc_add',
	SUBTRACT: 'kc_subtract',
	ADD_AND_SUBTRACT: 'kc_add_and_subtract',

	// Math2
	MULTIPLY: 'kc_multiply',
	MULTIPLY_INCREASE: 'kc_multiply_increase',
	MULTIPLY_DECREASE: 'kc_multiply_decrease',

	DIVIDE: 'kc_divide',
	DIVIDE_RATIO: 'kc_divide_ratio',
	DIVIDE_TO_PERCENT: 'kc_divide_to_percent', // @TODO Tutorial.

	PERCENT_TO_DECIMAL: 'kc_percent_to_decimal',
	PERCENT_TO_DECIMAL_OVER1: 'kc_percent_to_decimal_over1',
	PERCENT_TO_DECIMAL_WITHDECIMAL: 'kc_percent_to_decimal_withdecimal',

	// Math3
	EXPONENT: 'kc_exponent',
	ORDEROFOPERATION: 'kc_orderofoperation',
	ORDEROFOPERATION_AND_ARITHMETIC: 'kc_orderofoperation_and_arithmetic',
	ORDEROFOPERATION_AND_FRACTIONS: 'kc_orderofoperation_and_fractions',

	// Math4
	EXPONENT_GROWTH: 'kc_exponent_growth',
	ORDEROFOPERATION_AND_GROWTH: 'kc_orderofoperation_and_growth',
	INTEREST_SIMPLE: 'kc_interest_simple',
	INTEREST_COMPLEX: 'kc_interest_complex',

	// Summary
	SUMMARY: 'kc_summary',
	SUMMARY_LIMIT: 'kc_summary_limit',

	DATES: 'kc_dates',
	TEXT: 'kc_text',
	TEXT_SEARCH: 'kc_text_search',
	TEXT_QUOTES: 'kc_text_quotes',
	TEXT_FORMAT: 'kc_text_format',
	TEXT_LEFTRIGHT: 'kc_text_leftright',
	TEXT_MID: 'kc_text_mid',
	TEXT_CONCAT: 'kc_text_concat',
	TEXT_SUBSTITUTE: 'kc_text_substitute',
	TEXT_COMBINE: 'kc_text_combine',
	
	ROUNDING: 'kc_rounding',

	GEOMETRY: 'kc_geometry',

	// If
	KC_IF_COMPARISON_TEXT: 'kc_if_comparison_text',
	KC_IF_COMPARISON_NUMBER: 'kc_if_comparison_number',
	KC_IF_COMPARISON_BOOLEAN: 'kc_if_comparison_boolean',

	KC_IF_RETURN_TEXT: 'kc_if_return_text',
	KC_IF_RETURN_NUMBER: 'kc_if_return_number',

	KC_IF_MATH_LOGIC: 'kc_if_math_logic',
	KC_IF_MATH_RETURN: 'kc_if_math_return',
	
	KC_IF_AND: 'kc_if_and',
	KC_IF_AND_LOGIC: 'kc_if_and_logic',
	KC_IF_AND_BOOLEAN_LOGIC: 'kc_if_and_boolean_logic',
	KC_IF_AND_BOOLEAN: 'kc_if_and_boolean',
	KC_IF_AND_NOT: 'kc_if_and_not',
	KC_IF_AND_NOT_LOGIC: 'kc_if_and_not_logic',

	KC_IF_OR: 'kc_if_or',
	KC_IF_OR_LOGIC: 'kc_if_or_logic',
	KC_IF_OR_BOOLEAN_LOGIC: 'kc_if_or_boolean_logic',
	KC_IF_OR_BOOLEAN: 'kc_if_or_boolean',

	KC_IF_AMBIGUOUS_LOGIC: 'kc_if_ambiguous_logic',
	KC_IF_AMBIGUOUS: 'kc_if_ambiguous',

	// Financial functions
	KC_PV: 'kc_pv',
	KC_PV_ADJUST: 'kc_pv_adjust',
	KC_PV_ANNUITY: 'kc_pv_annuity',
	KC_PV_ANNUITY_ADJUST: 'kc_pv_annuity_adjust',
	KC_FV: 'kc_fv',
	KC_FV_ADJUST: 'kc_fv_adjust',
	KC_FV_ANNUITY: 'kc_fv',
	KC_FV_ANNUITY_ADJUST: 'kc_fv_adjust',

	// SQL
	KC_SQL_SELECTFROM: 'kc_sql_selectfrom',
	KC_SQL_SELECTFROM_QUOTES: 'kc_sql_selectfrom_quotes',
	KC_SQL_ORDERBY: 'kc_sql_orderby',
	KC_SQL_ORDERBY_QUOTES: 'kc_sql_orderby_quotes',

	KC_SQL_WHERE_NUMBERS: 'kc_sql_where_numbers',
	KC_SQL_WHERE_TEXT: 'kc_sql_where_text',
	KC_SQL_WHERE_QUOTES: 'kc_sql_where_quotes',

	KC_SQL_WHERE_AND_OR_NUMBERS: 'kc_sql_where_and_or_numbers',
	KC_SQL_WHERE_AND_OR_TEXT: 'kc_sql_where_and_or_text',
	KC_SQL_WHERE_AND_OR_QUOTES: 'kc_sql_where_and_or_quotes',

	KC_SQL_JOIN_INNER_PREP: 'kc_sql_join_inner_prep',
	KC_SQL_JOIN_INNER_INTRO: 'kc_sql_join_inner_intro',
	KC_SQL_JOIN_INNER_PRACTICE: 'kc_sql_join_inner_practice',

	KC_SQL_JOIN_LEFTOUTER: 'kc_sql_join_leftouter',
	KC_SQL_JOIN_KEYS: 'kc_sql_join_keys',
	KC_SQL_JOIN_SELF: 'kc_sql_join_self',
	KC_SQL_GROUPBY: 'kc_sql_groupby',
};




/*
	Create a gen using a KC object.

	The tutorial is shwon first, and then a number of review questions
*/
const makeTutorialGenFromKC = (kc: AdaptiveKC, review_questions: number = REVIEW_QUESTIONS_COUNT): GenType => {
	if(typeof kc.tutorial_pages === 'undefined' || typeof kc.test_pages == 'undefined')
		throw new Error('Invalid KC object passed to makeTutorialGenFromKC');

	// Start with tutorial.
	const pages = [	...kc.tutorial_pages ];

	// Only add the 'time to practice' if tutorial pages were added.
	if(pages.length > 0) pages.push({
			type: 'IfPageTextSchema',
			description: `Great!  Now it's time to practice some problems.`
		});

	
	// Add 
	pages.push(({
			gen_type: 'ShuffleGenUntilLimit',
			until_total: review_questions,
			pages: [
				...kc.test_pages,
			]
		}));

	return ({
		gen_type: 'LinearGen',
		pages: pages
	});
};


/*
	Create an adaptive Gen using a standing KC object.
*/
const makeAdaptiveReviewGenFromKC = (kc: AdaptiveKC, min_correct: number, limit: number): AdaptiveGenType => {
	if(typeof kc.tutorial_pages === 'undefined' || typeof kc.test_pages == 'undefined')
		throw new Error('Invalid KC object passed to makeAdaptiveReviewGenFromKC');

	let adapt = ({
		gen_type: 'AdaptiveGen',

		questions_for_passing: min_correct,

		test_gen: ({
			gen_type: 'ShuffleGenUntilLimit',
			until_total: limit,

			pages: [
				...kc.test_pages,
			]
		}),

		tutorial_gen: ({
			gen_type: 'LinearGen',

			pages: [
				{
					type: 'IfPageTextSchema',
					description: `You seem to be having trouble with this concept. You must successfully
						complete ` + min_correct + ' of ' + limit + ` questions.
						<br/><br/>
						The sytem will bring back up the tutorial for this concept. Afterwards, you 
						can try again to successfully complete the review questions.`
				},
				...kc.tutorial_pages,
			]
		}),

	});

	return adapt;
};



/*
	Create an Interia Gen using a standing KC object.
	Starts showng the tutorial.
	Then, after tutorial, shows the correct number of test questions.

	Eventually, todo, should re-show tutorial if test is failed.
		So, best case, Tutorial => Test
		Worst case, Tutorial => Test => Tutorial => ...
*/
const makeInertiaGenFromKC = (kc: InertiaKC): GenType => {
	if(typeof kc.tutorial_pages !== 'object' || typeof kc.test_pages !== 'object' )
		throw new Error('Invalid KC object passed to makeInertiaGenFromKC');

	const tutorial_pages = kc.tutorial_pages;

	// Convert to IfPagePredictSchema?
	/*
	if(true) {	
		tutorial_pages
			.filter( p => p.type === 'IfPageFormulaSchema' )
			.forEach( p => p.type = 'IfPagePredictFormulaSchema' )
	}
	*/

	// Setup initial params.
	const pages = [	...tutorial_pages ];
	const until_correct = typeof kc.until_correct !== 'number' ? INERTIA_QUESTIONS_CORRECT_GOAL_COUNT : kc.until_correct;
	const until_total = typeof kc.until_total !== 'number' ? INERTIA_MAX_QUESTIONS_UNTIL_REVIEW_COUNT : kc.until_total;
	

	// Only add the 'time to practice' if tutorial pages were added.
	if(kc.test_pages.length > 0) {
		if(pages.length > 0) pages.push({
				type: 'IfPageTextSchema',
				description: `Great!  Now it's time to practice some problems. 
					<br/><br/>
					You will need to successfully complete a total of ${until_correct} 
					questions before continuing.`
			});

		// Add test questions.
		pages.push(({
				gen_type: 'ShuffleGenUntilLimit',
				until_total: until_total,
				until_correct: until_correct,
				pages: [
					...kc.test_pages,
				]
			}));

		
	}


	return ({
		gen_type: 'LinearGen',
		pages: pages
	});
};



const makeReviewIntroduction = (args: any) => {

	if(typeof args.label === 'undefined' ) throw new Error('makeReviewIntroduction requires label');

	return {
		type: 'IfPageTextSchema',
		description: `
			It's time to review the ${args.label} tutorial.
			<br/><br/>
			You will be given a series of test questions. If you do not pass enough of them,
			the system will have you go back and review the concepts from the original tutorial.`
	};
};


const makeReviewNextConcept = () => {
	return {
		type: 'IfPageTextSchema',
		description: `
			Excellent! You have completed this section of the review.
			<br/><br/>
			The system will now start you on the next concept.`
	};
};

const makeReviewCompleted = () => {
	return {
		type: 'IfPageTextSchema',
		description: `
			Excellent work! You have completed all of the concepts in this review.`
	};
};

const makeTutorialNextConcept = () => {
	return {
		type: 'IfPageTextSchema',
		description: `
		Now that you've completed the practice problems, we will move onto the next section.
		`
	};
};



/**
	Handy formula used to adding KC properties to a list of pages.
	
	Use as 
		add_if_undefined(kc_text_quotes.tutorial_pages, { kcs: [ KC_NAMES.TEXT_QUOTES ] } );
	
	Add properties *from* json to *object* if they're undefined.
 	Can handle being passed an array, in which case it recurses.
*/
const add_if_undefined = (json: any, o: any) => {
	if(Array.isArray(o) ) {
		// recurse
		o.forEach( o => add_if_undefined(json, o));
	} else {
		// Add property.
		for(const property in json) {
			if( typeof o[property] === 'undefined') {
				o[property] = json[property];
			}
		}
	}
}

export { 
	KC_NAMES, 
	makeTutorialGenFromKC, makeAdaptiveReviewGenFromKC, makeInertiaGenFromKC,
	makeReviewIntroduction,
	makeReviewNextConcept,
	makeReviewCompleted,
	makeTutorialNextConcept,
	add_if_undefined,
};