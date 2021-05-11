// @flow
const { LinearGen, UntilGen } = require('./../Gens');

const { kc_pv, kc_pv_adjust, kc_pv_annuity, kc_pv_annuity_adjust } = require('./../kcs/kc_pv'); 
const { kc_fv, kc_fv_annuity } = require('./../kcs/kc_fv');

const { finish_questions } = require('./../pages/finish_questions');

const { IfPageFormulaSchema } = require( './../../shared/IfPageSchemas');
import type { GenType } from './../Gens';
import type { LevelSchemaFactoryType } from './../IfLevelSchemaFactory';

const { makeInertiaGenFromKC } = require('./../kcs/kc.js');




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



const financial1 = ({
	code: 'financial1',
	title: 'Financial Functions 1',
	description: 'Introduction to financial functions',
	harsons_randomly_on_username: false,
	predict_randomly_on_username: false,
	version: 1,

	gen: ({
		gen_type: LinearGen,
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
	}: GenType)
}: LevelSchemaFactoryType);



const financial2 = ({
	code: 'financial2',
	title: 'Financial Functions 2',
	description: 'More financial practice',
	harsons_randomly_on_username: false,
	predict_randomly_on_username: false,
	version: 1,

	gen: ({
		gen_type: LinearGen,
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
	}: GenType)
}: LevelSchemaFactoryType);



module.exports = { financial1, financial2 };

