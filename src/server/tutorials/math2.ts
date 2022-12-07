//import { LinearGen } from './../Gens';
import { finish_questions } from './../pages/finish_questions';
import { makeTutorialGenFromKC, makeAdaptiveReviewGenFromKC, makeReviewIntroduction, makeReviewNextConcept, makeReviewCompleted, makeTutorialNextConcept } from './../kcs/kc';

import { kc_multiply_increase } from './../kcs/kc_multiply_increase';
import { kc_multiply_decrease } from './../kcs/kc_multiply_decrease';
import { kc_percent_to_decimal } from './../kcs/kc_percent_to_decimal';
import { kc_percent_to_decimal_over1 } from './../kcs/kc_percent_to_decimal_over1';
import { kc_percent_to_decimal_withdecimal } from './../kcs/kc_percent_to_decimal_withdecimal';

import { kc_divide_ratio } from './../kcs/kc_divide_ratio';

import type { GenType } from '../Gens';
import type { LevelSchemaFactoryType } from '../IfLevelSchemaFactory';


// Definitions.
const REVIEW_MINIMUM_CORRECT = 3;
const REVIEW_LIMIT = 5;


//////////////////////////////////////////////////////////////
// Assemble final components.
//////////////////////////////////////////////////////////////


const math2: LevelSchemaFactoryType = {
	code: 'math2',
	title: 'Math 2',
	description: 'Use division and multiplication',
	version: 1.1,

	gen: ({
		gen_type: 'LinearGen',
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
	})
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
		gen_type: 'LinearGen',
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
	})
};

export { math2, math2review };
