// @flow
//import { LinearGen } from './../Gens';
import { makeTutorialGenFromKC, makeAdaptiveReviewGenFromKC, makeReviewIntroduction, makeReviewNextConcept, makeReviewCompleted, makeTutorialNextConcept } from './../kcs/kc';

import { finish_questions } from './../pages/finish_questions';

import { kc_summary } from './../kcs/kc_summary';
import { kc_summary_limit } from './../kcs/kc_summary_limit';
import { kc_rounding } from './../kcs/kc_rounding';

import type { GenType } from './../Gens';
//import type { LevelSchemaFactoryType } from './../IfLevelSchemaFactory';

// Definitions.
const REVIEW_MINIMUM_CORRECT = 3;
const REVIEW_LIMIT = 4;


const functions1 = ({
	code: 'functions1',
	title: 'Functions 1',
	description: 'Learn about basic formulas',
	version: 1.1,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			{	type: 'IfPageTextSchema',
				description: `This tutorial introduces several summary functions, like <code>min</code>, <code>max</code>,
					 and <code>average</code>.
					<br/><br/>
					You'll learn how to use these functions to convert numbers into ratios,
					as well as set a floor or ceiling on a value.
					<br/><br/>
					This tutorial also covers the <code>round</code> function.
					`
			}, 
			
			makeTutorialGenFromKC(kc_summary),
			makeTutorialNextConcept(),
			makeTutorialGenFromKC(kc_summary_limit),
			makeTutorialNextConcept(),
			makeTutorialGenFromKC(kc_rounding),
			...finish_questions
		]
	})//: GenType)

}) //: LevelSchemaFactoryType);


const functions1review = ({
	code: 'functions1review',
	title: 'Functions 1 Review',
	description: 'Review functions',
	version: 1.1,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			makeReviewIntroduction({ label: 'Functions 1'}),
			makeAdaptiveReviewGenFromKC(kc_summary, REVIEW_MINIMUM_CORRECT, REVIEW_LIMIT),
			makeReviewNextConcept(),
			makeAdaptiveReviewGenFromKC(kc_summary_limit, REVIEW_MINIMUM_CORRECT, REVIEW_LIMIT),
			makeReviewNextConcept(),
			makeAdaptiveReviewGenFromKC(kc_rounding, REVIEW_MINIMUM_CORRECT, REVIEW_LIMIT),
			makeReviewCompleted(),

			...finish_questions
		]
	}) //: GenType)

}) //: LevelSchemaFactoryType);



export { functions1, functions1review };

