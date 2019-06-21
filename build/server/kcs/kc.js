//     
const { LinearGen, AdaptiveGen, ShuffleGenUntilLimit } = require('./../Gens');


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
	
	ROUNDING: 'kc_rounding',

	GEOMETRY: 'kc_geometry'
};




/*
	Create a gen using a KC object.

	The tutorial is shwon first, and then a number of review questions
*/
const makeTutorialGenFromKC = (kc        , review_questions         ) => {
	const qs_limit = typeof review_questions === 'undefined' ? REVIEW_QUESTIONS_COUNT : review_questions;

	if(typeof kc.tutorial_pages === 'undefined' || typeof kc.test_pages == 'undefined')
		throw new Error('Invalid KC object passed to makeTutorialGenFromKC');

	// Start with tutorial.
	const pages = [	...kc.tutorial_pages ];

	// Only add the 'time to practice' if tutorial pages were added.
	if(pages.length > 0) pages.push({
			type: 'IfPageTextSchema',
			description: `Great!  Now it's time to practice some problems. 
				<br/><br/>
				You can review earlier pages by hovering your cursor 
				over the 'Progress' icons below.`
		});

	// Add 
	pages.push({
			gen: ShuffleGenUntilLimit,
			limit: qs_limit,
			pages: [
				...kc.test_pages,
			]
		});

	return {
		gen: LinearGen,
		pages: pages
	};
};

/*
const test = {
	gen: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `Great!  Now it's time to take a test.
					You must complete five problems before moving on.
					<br/><br/>
					You can review earlier pages by hovering your cursor 
					over the 'Progress' icons below.`
		},
		{
			gen: UntilGen,
			until: (until_pages: Array<FormulaPageType>): boolean => {
				return (until_pages.length >= 5);
			},
			pages: [
				{ 	type: 'IfPageFormulaSchema',
					code: 'test',
					column_titles: [''],
					solution_f: '=1',
					tests: [{a: 1}],
					description: 'Placeholder',
					instruction: 'Placeholder',
					versions: [
						...kc_dates.test_pages,
					]
				}
			]
		}
	]
};

*/

/*
	Create an adaptive Gen using a standing KC object.
*/
const makeAdaptiveReviewGenFromKC = (kc        , min_correct        , limit        ) => {
	if(typeof kc.tutorial_pages === 'undefined' || typeof kc.test_pages == 'undefined')
		throw new Error('Invalid KC object passed to makeAdaptiveReviewGenFromKC');

	let adapt = {
		gen: AdaptiveGen,

		// Test for n correct answers.
		until: (pages               )          => 
				pages.filter( (p        )          => p.correct).length >= min_correct,

		test_gen: {
			gen: ShuffleGenUntilLimit,
			limit: limit,

			pages: [
				...kc.test_pages,
			]
		},

		tutorial_gen: {
			gen: LinearGen,

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
		},

	};

	return adapt;
};



const makeReviewIntroduction = (args        ) => {

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


module.exports = { 
	KC_NAMES, 
	makeTutorialGenFromKC, makeAdaptiveReviewGenFromKC,
	makeReviewIntroduction,
	makeReviewNextConcept,
	makeReviewCompleted,
	makeTutorialNextConcept
};