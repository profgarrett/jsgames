//const { LinearGen } = require('./../Gens');
const { makeTutorialGenFromKC, makeAdaptiveReviewGenFromKC,
	makeReviewIntroduction,
	makeReviewNextConcept,
	makeReviewCompleted,
	makeTutorialNextConcept } = require('./../kcs/kc');

const { finish_questions } = require('./../pages/finish_questions');

const { kc_exponent } = require('./../kcs/kc_exponent');
const { kc_orderofoperation } = require('./../kcs/kc_orderofoperation');
//const { kc_orderofoperation_and_arithmetic } = require('./../kcs/kc_orderofoperation_and_arithmetic');
const { kc_orderofoperation_and_fractions } = require('./../kcs/kc_orderofoperation_and_fractions');

// Definitions.
const REVIEW_MINIMUM_CORRECT = 3;
const REVIEW_LIMIT = 4;

import type { GenType } from '../Gens';
import type { LevelSchemaFactoryType } from '../IfLevelSchemaFactory';


//////////////////////////////////////////////////////////////
// Assemble final components.
//////////////////////////////////////////////////////////////

const math3: LevelSchemaFactoryType = {
	code: 'math3',
	title: 'Math 3',
	description: 'Learn exponents, parentheses, and order of operations',
	version: 1.1,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			{	type: 'IfPageTextSchema',
				description: `There are several more advanced arithmetic symbols (operators) in Excel.
						<br/><br/>
						This section will cover exponents, parentheses, and order of operations.`
			},
			makeTutorialGenFromKC(kc_exponent),
			makeTutorialNextConcept(),
			makeTutorialGenFromKC(kc_orderofoperation),
			//makeTutorialNextConcept(),
			//makeTutorialGenFromKC(kc_orderofoperation_and_arithmetic),
			makeTutorialNextConcept(),
			makeTutorialGenFromKC(kc_orderofoperation_and_fractions),
			...finish_questions
		]
	})
};

const math3review: LevelSchemaFactoryType = {
	code: 'math3review',
	title: 'Math 3 Review',
	description: 'Review',
	version: 1.1,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			makeReviewIntroduction({ label: 'Math 3'}),
			makeAdaptiveReviewGenFromKC(kc_exponent, REVIEW_MINIMUM_CORRECT, REVIEW_LIMIT),
			makeReviewNextConcept(),
			makeAdaptiveReviewGenFromKC(kc_orderofoperation, REVIEW_MINIMUM_CORRECT, REVIEW_LIMIT),
			//makeReviewNextConcept(),
			//makeAdaptiveReviewGenFromKC(kc_orderofoperation_and_arithmetic, REVIEW_MINIMUM_CORRECT, REVIEW_LIMIT),
			makeReviewCompleted(),
			makeAdaptiveReviewGenFromKC(kc_orderofoperation_and_fractions, REVIEW_MINIMUM_CORRECT, REVIEW_LIMIT),
			makeReviewCompleted(),
			...finish_questions
		]
	})
};
export { math3, math3review };
