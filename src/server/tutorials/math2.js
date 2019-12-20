// @flow
const { LinearGen } = require('./../Gens');
const { finish_questions } = require('./../pages/finish_questions');
const { makeTutorialGenFromKC, makeAdaptiveReviewGenFromKC,
	makeReviewIntroduction,
	makeReviewNextConcept,
	makeReviewCompleted,
	makeTutorialNextConcept } = require('./../kcs/kc.js');

const { kc_multiply_increase } = require('./../kcs/kc_multiply_increase');
const { kc_multiply_decrease } = require('./../kcs/kc_multiply_decrease');
const { kc_percent_to_decimal } = require('./../kcs/kc_percent_to_decimal');
const { kc_percent_to_decimal_over1 } = require('./../kcs/kc_percent_to_decimal_over1');
const { kc_percent_to_decimal_withdecimal } = require('./../kcs/kc_percent_to_decimal_withdecimal');

const { kc_divide_ratio } = require('./../kcs/kc_divide_ratio');

import type { GenType } from './../Gens';
import type { LevelSchemaFactoryType } from './../IfLevelSchemaFactory';


// Definitions.
const REVIEW_MINIMUM_CORRECT = 3;
const REVIEW_LIMIT = 4;


//////////////////////////////////////////////////////////////
// Assemble final components.
//////////////////////////////////////////////////////////////


const math2: LevelSchemaFactoryType = {
	code: 'math2',
	title: 'Math 2',
	description: 'Use division and multiplication',
	version: 1.1,

	gen: ({
		gen_type: LinearGen,
		pages: [
			{	type: 'IfPageTextSchema',
				description: `This tutorial shows more uses for multiplication and division.
						`
			},
			
			makeTutorialGenFromKC(kc_percent_to_decimal),
			makeTutorialNextConcept(),
			
			makeTutorialGenFromKC(kc_percent_to_decimal_over1),
			makeTutorialNextConcept(),
			
			
			makeTutorialGenFromKC(kc_percent_to_decimal_withdecimal),
			makeTutorialNextConcept(),
			
			makeTutorialGenFromKC(kc_multiply_increase),
			makeTutorialNextConcept(),
			
			makeTutorialGenFromKC(kc_multiply_decrease),
			makeTutorialNextConcept(),
			
			makeTutorialGenFromKC(kc_divide_ratio),
			
			...finish_questions
		]
	}: GenType)
};


//
// Review
// 


const adaptIncrease = makeAdaptiveReviewGenFromKC(kc_multiply_increase, REVIEW_MINIMUM_CORRECT, REVIEW_LIMIT);
const adaptDecrease = makeAdaptiveReviewGenFromKC(kc_multiply_decrease, REVIEW_MINIMUM_CORRECT, REVIEW_LIMIT);
const adaptPercentToDecimal = makeAdaptiveReviewGenFromKC(kc_percent_to_decimal, REVIEW_MINIMUM_CORRECT, REVIEW_LIMIT);
const adaptPercentToDecimalOver1 = makeAdaptiveReviewGenFromKC(kc_percent_to_decimal_over1, REVIEW_MINIMUM_CORRECT, REVIEW_LIMIT);
const adaptPercentToDecimalWithDecimal = makeAdaptiveReviewGenFromKC(kc_percent_to_decimal_withdecimal, REVIEW_MINIMUM_CORRECT, REVIEW_LIMIT);
const adaptDivideRatio = makeAdaptiveReviewGenFromKC(kc_divide_ratio, REVIEW_MINIMUM_CORRECT, REVIEW_LIMIT);

const math2review: LevelSchemaFactoryType = {
	code: 'math2review',
	title: 'Math 2 Review',
	description: 'Review',
	version: 1.1,

	gen: ({
		gen_type: LinearGen,
		pages: [
			makeReviewIntroduction({ label: 'Math 2'}),
			adaptPercentToDecimal,
			makeReviewNextConcept(),
			adaptPercentToDecimalOver1,
			makeReviewNextConcept(),
			adaptPercentToDecimalWithDecimal,
			makeReviewNextConcept(),
			adaptIncrease,
			makeReviewNextConcept(),
			adaptDecrease,
			makeReviewNextConcept(),
			adaptDivideRatio,
			makeReviewCompleted(),
			...finish_questions
		]
	}: GenType)
};

module.exports = { math2, math2review };
