// @flow
// DEPRECIATED - MOVED CONTENT TO INDIVIDUAL functionXYZ.
const { LinearGen } = require('./../Gens');
const { 
	makeTutorialGenFromKC, makeAdaptiveReviewGenFromKC,
	makeReviewIntroduction,
	makeReviewNextConcept,
	makeReviewCompleted,
	makeTutorialNextConcept } = require('./../kcs/kc.js');

const { finish_questions } = require('./../pages/finish_questions');

const { kc_dates } = require('./../kcs/kc_dates.js');
//const { kc_text } = require('./../kcs/kc_text.js');

import type { GenType } from './../Gens';
import type { LevelSchemaFactoryType } from './../IfLevelSchemaFactory';


// Definitions.
const REVIEW_MINIMUM_CORRECT = 3;
const REVIEW_LIMIT = 4;


const functions2 = ({
	code: 'functions2',
	title: 'Functions 2',
	description: 'Learn about more functions',
	version: 1.1,

	gen: ({
		gen_type: LinearGen,
		pages: [
			{	type: 'IfPageTextSchema',
				description: `This tutorial introduces functions for dates and text.
					`
			}, 
			makeTutorialGenFromKC(kc_dates),
			//makeTutorialNextConcept(),
			//makeTutorialGenFromKC(kc_text),
			...finish_questions
		]
	}: GenType)

}: LevelSchemaFactoryType);


const functions2review = ({
	code: 'functions2review',
	title: 'Functions 2 Review',
	description: 'Review functions',
	version: 1.1,

	gen: ({
		gen_type: LinearGen,
		pages: [
			makeReviewIntroduction({ label: 'Functions 2'}),
			makeAdaptiveReviewGenFromKC(kc_dates, REVIEW_MINIMUM_CORRECT, REVIEW_LIMIT),
			//makeReviewNextConcept(),
			//makeAdaptiveReviewGenFromKC(kc_text, REVIEW_MINIMUM_CORRECT, REVIEW_LIMIT),
			makeReviewCompleted(),
			...finish_questions
		]
	}: GenType)
}: LevelSchemaFactoryType);
 


module.exports = { functions2, functions2review };

