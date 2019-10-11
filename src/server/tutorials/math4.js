// @flow
const { LinearGen } = require('./../Gens');
const { 
	makeTutorialGenFromKC, makeAdaptiveReviewGenFromKC,
	makeReviewIntroduction,
	makeReviewNextConcept,
	makeReviewCompleted,
	makeTutorialNextConcept } = require('./../kcs/kc.js');

const { finish_questions } = require('./../pages/finish_questions');

const { kc_exponent_growth } = require('./../kcs/kc_exponent_growth.js');
const { kc_orderofoperation_and_growth } = require('./../kcs/kc_orderofoperation_and_growth.js');

import type { GenType } from './../Gens';
import type { LevelSchemaFactoryType } from './../IfLevelSchemaFactory';

// Definitions.
const REVIEW_MINIMUM_CORRECT = 3;
const REVIEW_LIMIT = 4;


//////////////////////////////////////////////////////////////
// Assemble final components.
//////////////////////////////////////////////////////////////

const math4: LevelSchemaFactoryType = {
	code: 'math4',
	title: 'Math 4',
	description: 'Learn rounding and growth functions',
	version: 1.1,

	gen: ({
		gen_type: LinearGen,
		pages: [
			{	type: 'IfPageTextSchema',
				description: `This section shows how to model regular and compound growth.
						It will prove useful for a number of business problems, such as calculating
						interest on a loan or yield from a bond.
						`
			},
			makeTutorialGenFromKC(kc_exponent_growth),
			makeTutorialNextConcept(),
			makeTutorialGenFromKC(kc_orderofoperation_and_growth),
			makeTutorialNextConcept(),
			...finish_questions
		]
	}: GenType)
};

const math4review: LevelSchemaFactoryType = {
	code: 'math4review',
	title: 'Math 4 Review',
	description: 'Review',
	version: 1.1,

	gen: ({
		gen_type: LinearGen,
		pages: [
			makeReviewIntroduction({ label: 'Math 4'}),
			makeAdaptiveReviewGenFromKC(kc_exponent_growth, REVIEW_MINIMUM_CORRECT, REVIEW_LIMIT),
			makeReviewNextConcept(),
			makeAdaptiveReviewGenFromKC(kc_orderofoperation_and_growth, REVIEW_MINIMUM_CORRECT, REVIEW_LIMIT),
			makeReviewCompleted(),
			...finish_questions
		]
	}: GenType)
};
module.exports = { math4, math4review };

