// @flow
const { DataFactory } = require('./../DataFactory');
const { LinearGen, UntilGen } = require('./../Gens');
const { finish_questions } = require('./../pages/finish_questions');

const { kc_if_or_boolean, kc_if_or_boolean_logic,
		kc_if_and_boolean, kc_if_and_boolean_logic 
		} = require('./../kcs/kc_if_boolean');

const { IfPageFormulaSchema } = require( './../../shared/IfPageSchemas');

const { makeInertiaGenFromKC } = require('./../kcs/kc.js');

import type { GenType } from './../Gens';
import type { LevelSchemaFactoryType } from './../IfLevelSchemaFactory';



const introduction_gen = ({
	gen_type: LinearGen,
	pages: [
		{
			type: 'IfPageTextSchema',
			description: `
				This tutorial has you practice booleans inside of the <code>OR</code> function.
				<ul>
					<li>Use booleans inside of <code>OR</code> </li>
					<li>Use booleans inside of <code>OR</code> embedded into an <code>IF</code></li>
				</ul>
				`
		}
	]
}: GenType);


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



const if7 = ({
	code: 'if7',
	title: 'IF7: OR Booleans',
	description: 'Use booleans inside of OR',
	harsons_randomly_on_username: false,
	predict_randomly_on_username: true,
	
	version: 2.0,

	
	gen: ({
		gen_type: LinearGen,
		pages: [
			
			introduction_gen,
			makeInertiaGenFromKC(kc_if_or_boolean_logic),
			
			ReviewNextConcept,
			makeInertiaGenFromKC(kc_if_or_boolean),

			donePage,

			...finish_questions
		]
	}: GenType)
	
}: LevelSchemaFactoryType);


module.exports = { if7 };


