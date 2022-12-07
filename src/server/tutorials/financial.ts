//import { LinearGen, UntilGen } from './../Gens';

import { kc_pv, kc_pv_adjust, kc_pv_annuity, kc_pv_annuity_adjust } from './../kcs/kc_pv'; 
import { kc_fv, kc_fv_annuity } from './../kcs/kc_fv';

import { finish_questions } from './../pages/finish_questions';

import { IfPageFormulaSchema } from './../../shared/IfPageSchemas';
import { LevelSchemaFactoryType } from '../IfLevelSchemaFactory';
import type { GenType } from './../Gens';

import { makeInertiaGenFromKC } from './../kcs/kc';




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



const financial1: LevelSchemaFactoryType = {
	code: 'financial1',
	title: 'Financial Functions 1',
	description: 'Introduction to financial functions',
	harsons_randomly_on_username: false,
	predict_randomly_on_username: false,
	version: 1,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
            {
                type: 'IfPageTextSchema',
                description: `
                    This tutorial introduces you to financial functions. You will be able to:
                    <ul>
                        <li>Calculate a present value</li>
                        <li>Calculate a future value</li>
                    </ul>`
            },

			makeInertiaGenFromKC(kc_pv),
			ReviewNextConcept, 
			
			makeInertiaGenFromKC(kc_pv_adjust),
			ReviewNextConcept, 

			makeInertiaGenFromKC(kc_fv),
			ReviewNextConcept, 

			//makeInertiaGenFromKC(kc_fv_adjust),
			//ReviewNextConcept, 

			...finish_questions
		]
	})
};



const financial2 = ({
	code: 'financial2',
	title: 'Financial Functions 2',
	description: 'More financial practice',
	harsons_randomly_on_username: false,
	predict_randomly_on_username: false,
	version: 1,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
            {
			type: 'IfPageTextSchema',
			description: `
				This tutorial gives you more practice with financial functions, and introduces you to annuities.
				<ul>
					<li>Practice future and present values</li>
					<li>Calculate annuitity value</li>
				</ul>`
            },

			makeInertiaGenFromKC(kc_pv_annuity),
			ReviewNextConcept, 
			
			makeInertiaGenFromKC(kc_pv_annuity_adjust),
			ReviewNextConcept, 


			makeInertiaGenFromKC(kc_fv_annuity),
			ReviewNextConcept, 


			//makeInertiaGenFromKC(kc_fv_annuity_adjust),
			//ReviewNextConcept, 




			...finish_questions
		]
	})
});



export { financial1, financial2 };

