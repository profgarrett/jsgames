// @flow
const { LinearGen, ShuffleGen } = require('./../Gens');
const { sns } = require('./../pages/sns');
const { wu_consent, use_consent } = require('./../pages/consent');
const { numeracy_pretest, numeracy_posttest } = require('./../pages/numeracy');

import type { GenType } from './../Gens';
import type { LevelSchemaFactoryType } from './../IfLevelSchemaFactory';


const surveywaiver_non_woodbury_student: LevelSchemaFactoryType = {
	code: 'surveywaiver_non_woodbury_student', 
	title: 'Student Account Setup', 
	description: 'Learn about this website and answer several questions',
	show_score_after_completing: false,
	version: 1.0,

	gen: ({
		gen_type: LinearGen,
		pages: [
			use_consent,
			{	type: 'IfPageTextSchema',
				description: `Before starting to complete the online exercises, the system to needs to ask you a few questions.  
					The results will be used to tune the system to best meet your existing skill level.`
			},
			({	gen_type: ShuffleGen,
				pages: sns
			}: GenType),
			{	type: 'IfPageTextSchema',
				description: 'You finished!',
				instruction: 'Click "Next page" to finish this assesssment.',
			}
		]
	}: GenType)
};


const surveywaiver_non_woodbury_user: LevelSchemaFactoryType = {
	code: 'surveywaiver_non_woodbury_user', 
	title: 'Anonymous User Account Setup ', 
	description: 'Learn about this website and answer several questions',
	show_score_after_completing: false,
	version: 1.0,

	gen: ({
		gen_type: LinearGen,
		pages: [
			use_consent,
			{	type: 'IfPageTextSchema',
				description: 'Thanks! You can start working on the first tutorial now.',
				instruction: 'Click "Next page" to close this agreement',
			}

		]
	}: GenType)
};



const surveywaiver_woodbury_student: LevelSchemaFactoryType = {
	code: 'surveywaiver_woodbury_student', 
	title: 'Woodbury Student Account Setup', 
	description: 'Get your website accoutn setup.',
	show_score_after_completing: false,
	version: 1.0,

	gen: ({
		gen_type: LinearGen,
		pages: [
			wu_consent,
			/*
			{	gen: ShuffleGen,
				pages: sns
			},
			{	gen: ShuffleGen,
				pages: numeracy_pretest
			},
			*/
			{	type: 'IfPageTextSchema',
				description: 'Thanks! You can start working on the first tutorial now.',
				instruction: 'Click "Next page" to finish this assesssment! You can start working on the first tutorial now.',
			}

		]
	}: GenType)
};



module.exports = { surveywaiver_non_woodbury_student, surveywaiver_non_woodbury_user, surveywaiver_woodbury_student };
