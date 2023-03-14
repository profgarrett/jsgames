const { DataFactory } = require('./../DataFactory');
//const { LinearGen, UntilGen } = require('./../Gens');
const { finish_questions } = require('./../pages/finish_questions');

const { kc_if_and_logic, 
		kc_if_and_not_logic,
		kc_if_and } = require('./../kcs/kc_if_and');

const { IfPageFormulaSchema } = require( './../../shared/IfPageSchemas');

const { makeInertiaGenFromKC } = require('./../kcs/kc');

import type { GenType } from '../Gens';
import type { LevelSchemaFactoryType } from '../IfLevelSchemaFactory';



const introduction_gen = ({
	gen_type: 'LinearGen',
	pages: [
		{
			type: 'IfPageTextSchema',
			description: `
				This tutorial introduces you to the <code>AND</code> function.
				<ul>
					<li>Use <code>AND</code> inside of logical tests</li>
					<li>Use <code>AND</code> with <code>NOT</code> inside of logical tests</li>
					<li>Use <code>AND</code> inside of a <code>IF</code></li>
				</ul>
				`
		}
	]
});


const ReviewNextConcept = {
	type: 'IfPageTextSchema',
	description: `
		Excellent! You have completed this section of the tutorial.
		<br/><br/>
		The system will now start you on the next concept.`
};

const donePage = {
	type: 'IfPageTextSchema',
	description: `
		Excellent! You have completed this entire tutorial! 
		<br/><br/>
		You can now go onto the next IF tutorial.`
};



const if4 = ({
	code: 'if4',
	title: 'IF4: AND',
	description: 'Use AND',
	harsons_randomly_on_username: false,
	predict_randomly_on_username: false,
	
	version: 2.1,

	
	gen: ({
		gen_type: 'LinearGen',
		pages: [
			introduction_gen,
			makeInertiaGenFromKC(kc_if_and_logic),
			
			ReviewNextConcept,
			makeInertiaGenFromKC(kc_if_and_not_logic),

			ReviewNextConcept,
			makeInertiaGenFromKC(kc_if_and),

			donePage,

			...finish_questions
		]
	})
	
});


export { if4 };

