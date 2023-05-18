//const { LinearGen, ShuffleGen /*, UntilGen*/ } = require('./../Gens');
const { sns } = require('./../pages/sns');
const { numeracy_pretest, numeracy_posttest } = require('./../pages/numeracy');

import type { GenType } from '../Gens';


/*
	
*/			
const surveymath1 = ({
	code: 'surveymath1',
	title: 'Math Survey  1',
	description: 'Answer some basic math problems.',
	version: 1.1,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			{	type: 'IfPageTextSchema',
				description: `
					The first section asks several questions about your math skills.
					`,
				instruction: 'Click "Continue" to begin.',
			},
			{	gen: 'ShuffleGen',
				pages: sns
			},

			{	type: 'IfPageTextSchema',
				description: `
					The second section asks you to complete several basic math problems.
					<br/><br/>
					You may use the built-in calculator in Windows or Excel
					`,
				instruction: 'Click "Continue" to begin.',
			},
			{	gen: 'ShuffleGen',
				pages: numeracy_pretest
			},
			{	type: 'IfPageTextSchema',
				description: 'You finished!',
				instruction: 'Click "Continue" to finish this assesssment.',
			}
		]
	})

});




/*
	
*/			
const surveymath2 = ({
	code: 'surveymath2',
	title: 'Math Survey  2',
	description: 'Answer some basic math problems.',
	version: 1.1,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			{	type: 'IfPageTextSchema',
				description: `
					The first section asks several questions about your math skills.
					`,
				instruction: 'Click "Continue" to begin.',
			},
			{	gen: 'ShuffleGen',
				pages: sns
			},

			{	type: 'IfPageTextSchema',
				description: `
					The second section asks you to complete several basic math problems.
					<br/><br/>
					You may use the built-in calculator in Windows or Excel
					`,
				instruction: 'Click "Continue" to begin.',
			},
			{	gen: 'ShuffleGen',
				pages: numeracy_posttest
			},
			{	type: 'IfPageTextSchema',
				description: 'You finished!',
				instruction: 'Click "Continue" to finish this assesssment.',
			}
		]
	})
});



export { surveymath1, surveymath2 };
