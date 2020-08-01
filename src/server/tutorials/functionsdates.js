// @flow
const { LinearGen } = require('./../Gens');
const { 
	makeTutorialGenFromKC, makeAdaptiveReviewGenFromKC,
	makeReviewIntroduction,
	makeReviewNextConcept,
	makeReviewCompleted,
	makeTutorialNextConcept } = require('./../kcs/kc.js');

const { finish_questions } = require('./../pages/finish_questions');

const { kc_dates } = require('./../kcs/kc_dates.js');

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
		gen_type: LinearGen,
		pages: [
			{	type: 'IfPageTextSchema',
				description: `This tutorial introduces functions for dates.
					`
			}, 
			makeTutorialGenFromKC(kc_dates),
			...finish_questions
		]
	}: GenType)

}: LevelSchemaFactoryType);

module.exports = { functionsdates };