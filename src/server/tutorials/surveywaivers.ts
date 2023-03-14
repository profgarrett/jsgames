//import { LinearGen, ShuffleGen } from './../Gens';
import { sns } from './../pages/sns';
import { wu_consent, use_consent, wvu_consent } from './../pages/consent';
import { numeracy_pretest, numeracy_posttest } from './../pages/numeracy';
import { tutorial } from './tutorial';

import type { GenType } from '../Gens';
import type { LevelSchemaFactoryType } from '../IfLevelSchemaFactory';


const surveywaiver_non_woodbury_student: LevelSchemaFactoryType = {
	code: 'surveywaiver_non_woodbury_student', 
	title: 'Student Account Setup', 
	description: 'Learn about this website and answer several questions',
	show_score_after_completing: false,
	show_progress: false,
	version: 1.0,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			use_consent,
			{	type: 'IfPageTextSchema',
				description: `Before starting to complete the online exercises, the system to needs to ask you a few questions.  
					The results will help tune the system for your skill level.`
			},
			({	gen_type: 'ShuffleGen',
				pages: sns
			}),
			{	type: 'IfPageTextSchema',
				description: 'Good job! You finished with the initial intake assessment.',
				instruction: 'Click <code>Next page</code> to continue.',
			},
			tutorial.gen,
		]
	})
};


const surveywaiver_non_woodbury_user: LevelSchemaFactoryType = {
	code: 'surveywaiver_non_woodbury_user', 
	title: 'Anonymous User Account Setup ', 
	description: 'Learn about this website and answer several questions',
	show_score_after_completing: false,
	show_progress: false,
	version: 1.0,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			use_consent,
			/*
			{	type: 'IfPageTextSchema',
				description: 'Thanks! You will now complete a short tut.',
				instruction: 'Click <code>Next page</code> to continue.',
			},
			*/
			tutorial.gen,

		]
	})
};



const surveywaiver_woodbury_student: LevelSchemaFactoryType = {
	code: 'surveywaiver_woodbury_student', 
	title: 'Woodbury Student Account Setup', 
	description: 'Get your website account setup.',
	show_score_after_completing: false,
	show_progress: false,
	version: 1.2,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			wu_consent,
			{	type: 'IfPageTextSchema',
				description: `Before starting to complete the online exercises, the system to needs to ask you a few questions.  
					The results will help tune the system for your skill level.`
			},
			({	gen_type: 'ShuffleGen',
				pages: sns
			}),
			({	gen_type: 'ShuffleGen',
				pages: numeracy_pretest
			}),
			{	type: 'IfPageTextSchema',
				description: 'Thanks! You can start working on the first tutorial now.',
				instruction: 'Click <code>Next page</code> to finish this assesssment! You can start working on the first tutorial now.',
			},
			tutorial.gen,

		]
	})
};


const surveywaiver_wvu_user: LevelSchemaFactoryType = {
	code: 'surveywaiver_wvu_user', 
	title: 'WVU User Account Setup ', 
	description: 'Learn about this website',
	show_score_after_completing: false,
	show_progress: false,
	version: 1.0,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			wvu_consent,
			tutorial.gen,

		]
	})
};



export { surveywaiver_non_woodbury_student, surveywaiver_non_woodbury_user, surveywaiver_woodbury_student, surveywaiver_wvu_user };
