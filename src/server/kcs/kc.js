//@flow
const { LinearGen, AdaptiveGen, ShuffleGenUntilLimit } = require('./../Gens');
import type { AdaptiveGenType, GenType } from './../Gens';
import type { LevelSchemaFactoryType } from './../IfLevelSchemaFactory';

export type AdaptiveKC = {
	kc: string,
	tutorial_pages: Array<any>,
	test_pages: Array<any>
}

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
const makeTutorialGenFromKC = (kc: AdaptiveKC, review_questions: ?number): GenType => {
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
	pages.push(({
			gen_type: ShuffleGenUntilLimit,
			until_total: review_questions || REVIEW_QUESTIONS_COUNT,
			pages: [
				...kc.test_pages,
			]
		}: GenType));

	return ({
		gen_type: LinearGen,
		pages: pages
	}: GenType);
};


/*
	Create an adaptive Gen using a standing KC object.
*/
const makeAdaptiveReviewGenFromKC = (kc: AdaptiveKC, min_correct: number, limit: number): AdaptiveGenType => {
	if(typeof kc.tutorial_pages === 'undefined' || typeof kc.test_pages == 'undefined')
		throw new Error('Invalid KC object passed to makeAdaptiveReviewGenFromKC');

	let adapt = ({
		gen_type: AdaptiveGen,

		questions_for_passing: min_correct,

		test_gen: ({
			gen_type: ShuffleGenUntilLimit,
			until_total: limit,

			pages: [
				...kc.test_pages,
			]
		}: GenType),

		tutorial_gen: ({
			gen_type: LinearGen,

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
		}: GenType),

	}: AdaptiveGenType);

	return adapt;
};



const makeReviewIntroduction = (args: Object) => {

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