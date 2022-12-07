//import { LinearGen } from './../Gens';
import { makeTutorialGenFromKC, makeAdaptiveReviewGenFromKC, makeReviewIntroduction, makeReviewNextConcept, makeReviewCompleted, makeTutorialNextConcept } from './../kcs/kc';

import { finish_questions } from './../pages/finish_questions';

import { kc_dates } from './../kcs/kc_dates';

import type { GenType } from './../Gens';
import type { LevelSchemaFactoryType } from './../IfLevelSchemaFactory';


// Definitions.
const REVIEW_MINIMUM_CORRECT = 3;
const REVIEW_LIMIT = 4;


const functionsdates = ({
	code: 'functionsdates',
	title: 'Functions - Dates',
	description: 'Learn about more functions that help with dates.',
	version: 1.1,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			{	type: 'IfPageTextSchema',
				description: `This tutorial introduces functions for dates.
					`
			}, 
			makeTutorialGenFromKC(kc_dates),
			...finish_questions
		]
	}) //: GenType)

}) // : LevelSchemaFactoryType);

export { functionsdates };