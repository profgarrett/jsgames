import { DataFactory } from './../DataFactory';
//import { LinearGen, UntilGen } from './../Gens';
import { finish_questions } from './../pages/finish_questions';

import { kc_if_math_logic, kc_if_math_return } from './../kcs/kc_if_math';

import { IfPageFormulaSchema } from './../../shared/IfPageSchemas';

import { makeInertiaGenFromKC } from './../kcs/kc';

import type { GenType } from '../Gens';
import type { LevelSchemaFactoryType } from '../IfLevelSchemaFactory';




const introduction_gen = ({
	gen_type: 'LinearGen',
	pages: [
		{
			type: 'IfPageTextSchema',
			description: `
				This tutorial gives you practice using arithmetic in the <code>IF</code> function.
				<ul>
					<li>Using arithmetic in logic</li>
					<li>Using arithmetic in a return value</li>
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



const if3 = ({
	code: 'if3',
	title: 'IF3: Math',
	description: 'Embed math into the IF function',
	harsons_randomly_on_username: false,
	predict_randomly_on_username: false,
	
	version: 2.1,

	
	gen: ({
		gen_type: 'LinearGen',
		pages: [
			introduction_gen,
			makeInertiaGenFromKC(kc_if_math_logic),
			
			ReviewNextConcept,
			makeInertiaGenFromKC(kc_if_math_return),
			donePage,

			...finish_questions
		]
	})
	
});


export { if3 };
