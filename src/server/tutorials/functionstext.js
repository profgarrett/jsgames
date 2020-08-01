// @flow
const { LinearGen } = require('./../Gens');
const { 
	makeTutorialGenFromKC, 
	makeInertiaGenFromKC,
	makeReviewIntroduction,
	makeReviewNextConcept,
	makeReviewCompleted,
	makeTutorialNextConcept } = require('./../kcs/kc.js');

const { finish_questions } = require('./../pages/finish_questions');

const { 
	// Basic
	kc_text_format,
	kc_text_quotes,
	kc_text_concat,
	kc_text_substitute,
	// Advanced
	kc_text_leftright,
	kc_text_mid,
	kc_text_search,
	kc_text_combine, 
	} = require('./../kcs/kc_text.js');

import type { GenType } from './../Gens';
import type { InertiaKC } from './../kcs/kc';
import type { LevelSchemaFactoryType } from './../IfLevelSchemaFactory';

const ReviewNextConcept = {
	type: 'IfPageTextSchema',
	description: `
		Excellent! You have completed this section of the tutorial.
		<br/><br/>
		The system will now start you on the next concept.`
};



const functionstext1 = ({
	code: 'functionstext1',
	title: 'Functions - Text 1',
	description: 'Introduction to text functions',
	version: 1.0,

	gen: ({
		gen_type: LinearGen,
		pages: [
			{	type: 'IfPageTextSchema',
				description: `This tutorial introduces functions that help you work with text.
					<br/><br/>
					You'll learn:
					<ul>
						<li>How to include text in formulas</li>
						<li>Convert text between upper and lower case</li>
						<li>Joining (or concatenating) text</li>
						<li>The <code>SUBSTITUTE</code> formula</li>
					</ul>
				`
			},
			{	type: 'IfPageTextSchema',
				description: `The first section begins by showing how to use text inside of a function.
					<br/><br/>
				`
			},
			makeInertiaGenFromKC(kc_text_quotes),
			ReviewNextConcept, 
			makeInertiaGenFromKC(kc_text_format),
			ReviewNextConcept,
			makeInertiaGenFromKC(kc_text_concat),
			ReviewNextConcept,
			makeInertiaGenFromKC(kc_text_substitute),
		
			...finish_questions
		]
	}: GenType)

}: LevelSchemaFactoryType);



const functionstext2 = ({
	code: 'functionstext2',
	title: 'Functions - Text 2',
	description: 'Text functions that use string position',
	version: 1.0,

	gen: ({
		gen_type: LinearGen,
		pages: [
			{	type: 'IfPageTextSchema',
				description: `This tutorial introduces functions that help you work with text on a character (or letter) basis.
					<br/><br/>
					You'll learn how to:
					<ul>
						<li>Use <code>LEFT</code>, <code>RIGHT</code>, and <code>MID</code> to return letters</li>
						<li>Use <code>SEARCH</code> to locate the position of a particular string of text</li>
						<li>Combine multiple functions together</li>
					</ul>
				`
			},
			{	type: 'IfPageTextSchema',
				description: `The first section begins by showing how to access individual characters inside of a text value.
					<br/><br/>
				`
			},

			makeInertiaGenFromKC(kc_text_leftright),
			ReviewNextConcept, 
			makeInertiaGenFromKC(kc_text_mid),
			ReviewNextConcept, 
			makeInertiaGenFromKC(kc_text_search),
			//makeInertiaGenFromKC(kc_text_combine),

			...finish_questions
		]
	}: GenType)

}: LevelSchemaFactoryType);



module.exports = { functionstext1, functionstext2 };

