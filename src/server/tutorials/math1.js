// @flow
const { IfPageFormulaSchema } = require( './../../shared/IfPageSchemas');
const { LinearGen, UntilGen } = require('./../Gens');

const { finish_questions } = require('./../pages/finish_questions');

const { makeTutorialGenFromKC, makeAdaptiveReviewGenFromKC } = require('./../kcs/kc.js');
const { kc_add } = require('./../kcs/kc_add.js');
const { kc_subtract } = require('./../kcs/kc_subtract.js');
const { kc_add_and_subtract } = require('./../kcs/kc_add_and_subtract.js');
const { kc_multiply } = require('./../kcs/kc_multiply');
const { kc_divide } = require('./../kcs/kc_divide');

import type { GenType } from './../Gens';
import type { LevelSchemaFactoryType } from './../IfLevelSchemaFactory';



/*
	Introduces basic math symbols, add & subtract
	
	tutorials: 
		Combining
		More than, less than
*/


const REVIEW_MINIMUM_CORRECT = 3;
const REVIEW_LIMIT = 4;


// Pictures
const image_page = {
	type: 'IfPageTextSchema',
	description: `
			This tutorial introduces the four basic math symbols (or operators).
			The examples in these tutorials are based on ABC Farms, which raises alpacas, baboons, camels, and ducks.
			<br/><br/>

			<h5>Alpacas</h5>
			<img src="/static/farmpictures/alpaca.jpg"  width=250 alt="Alpaca">
			<p style="font-size: 80%; color: gray">Source: Notnoisy <a href="https://commons.wikimedia.org/wiki/File:Corazon_Full.jpg">CC 3.0</a></p>
			<br/><br/>

			<h5>Baboons</h5>
			<img src="/static/farmpictures/baboon.jpg" width=250 alt="Baboon">
			<p style="font-size: 80%; color: gray">Source: Moody <a href="https://commons.wikimedia.org/wiki/File:Baviaan1.JPG">Public Domain</a></p>
			<br/><br/>

			<h5>Camels</h5>
			<img src="/static/farmpictures/camel.jpg" width=250 alt="Camel">
			<p style="font-size: 80%; color: gray">Source: Bouette <a href="https://commons.wikimedia.org/wiki/File:Chameau_de_bactriane.JPG">CC 3.0</a></p>
			<br/><br/>

			<h5>Ducks</h5>
			<img src="/static/farmpictures/duck.jpg" width=250  alt="Duck">
			<p style="font-size: 80%; color: gray">Source: J.M.Garg <a href="https://commons.wikimedia.org/wiki/File:Northern_Pintails_(Male_%26_Female)_I_IMG_0911.jpg">CC 3.0</a></p>
			`
};


const tutorial_next_concept = {
	type: 'IfPageTextSchema',
	description: `
		Now that you've completed the practice problems, we will move onto the next section.
		`
};

const review_introduction = {
	type: 'IfPageTextSchema',
	description: `
			It's time to review the Math1 tutorial.
			<br/><br/>
			You will be given a series of test questions. If you do not pass enough of them,
			the system will have you go back and review the concepts from the original tutorial.`
};


const review_next_concept = {
	type: 'IfPageTextSchema',
	description: `
		Excellent! You have completed this section.
		<br/><br/>
		The system will now start you on the next concept.
		`
};


const review_completed = {
	type: 'IfPageTextSchema',
	description: `
		Excellent work! You have completed all of the concepts in this review.
		`
};


//////////////////////////////////////////////////////////////
// Assemble final components.
//////////////////////////////////////////////////////////////


const math1: LevelSchemaFactoryType = {
	code: 'math1',
	title: 'Math 1',
	description: 'Use addition and subtraction',
	version: 1.1,

	gen: ({
		gen_type: LinearGen,
		pages: [
			image_page,
			makeTutorialGenFromKC(kc_add),
			tutorial_next_concept,
			makeTutorialGenFromKC(kc_subtract),
			tutorial_next_concept,
			makeTutorialGenFromKC(kc_add_and_subtract),
			tutorial_next_concept,
			makeTutorialGenFromKC(kc_multiply),
			tutorial_next_concept,
			makeTutorialGenFromKC(kc_divide),
			...finish_questions
		]
	}: GenType)
};


//
// Review
//
const math1review: LevelSchemaFactoryType = {
	code: 'math1review',
	title: 'Math 1 Review',
	description: 'Review',
	version: 1.1,

	gen: ({
		gen_type: LinearGen,
		pages: [
			review_introduction,
			makeAdaptiveReviewGenFromKC(kc_add, REVIEW_MINIMUM_CORRECT, REVIEW_LIMIT),
			review_next_concept,
			makeAdaptiveReviewGenFromKC(kc_subtract, REVIEW_MINIMUM_CORRECT, REVIEW_LIMIT),
			review_next_concept,
			makeAdaptiveReviewGenFromKC(kc_multiply, REVIEW_MINIMUM_CORRECT, REVIEW_LIMIT),
			review_next_concept,
			makeAdaptiveReviewGenFromKC(kc_divide, REVIEW_MINIMUM_CORRECT, REVIEW_LIMIT),

			review_completed,
			...finish_questions
		]
	}: GenType)
};

module.exports = { math1, math1review };
