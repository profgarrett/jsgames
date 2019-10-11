// @flow
const { KC_NAMES } = require('./../kcs/kc.js');
import type { AdaptiveKC } from './kc';

const farm1_data = {
	column_titles: ['Alpacas', 'Baboon', 'Camels' ],
	column_formats: [ ',', ',', '$','%' ],
	client_f_format: ',',
	tests: [
			{ 'a': 54, 'b': 83, 'c': 10 }, 
			{ 'a': 57, 'b': 94, 'c': 1 }, 
			{ 'a': 14, 'b': 99, 'c': 8 }, 
			{ 'a': 68, 'b': 91, 'c': 0 }, 
		]
};



/*
	Parens

	Concepts:
		Order of operation
*/
const tutorial_pages = [
	{	type: 'IfPageTextSchema',
		description: `When working on a problem, you may have to use order of operations
				to get the right numbers.
				<br/><br/>
				For example, a question may ask what proportion of your animals are Alpacas.
				But, if it may not give you the total number of Alpacas and Baboons. 
				<br/><br/>
				You would use <code>=A1/(A1+B1)</code> to divide the number of Alpacas in <code>A1</code>
				by the total number of Alpacas and Baboons. 
				`
	},
	{	type: 'IfPageFormulaSchema',
		description: 'What proportion of the animals are Baboons?',
		instruction: `Type in <code>=B1/(A1+B1+C1)</code>.  This tells the computer to add up 
			the total number of animals before using division to create the ratio.`,
		column_formats: farm1_data.column_formats,
		column_titles: farm1_data.column_titles,
		tests: farm1_data.tests,
		client_f_format: farm1_data.client_f_format,
		solution_f: '=b1/(a1+b1+c1)', 
		code: 'tutorial'
	},
	{	type: 'IfPageFormulaSchema',
		description: `You may have another problem that asks you to increase or decrease a number.
			But, you may need to use parenthesis to create a total first.`,
		instruction: `How many animals would you have if a third run away? 
			<br/><br/>
			Add up the total number of animals first, and then multiply it by 2/3 to find how many are left.
			`,
		column_formats: farm1_data.column_formats,
		column_titles: farm1_data.column_titles,
		tests: farm1_data.tests,
		client_f_format: farm1_data.client_f_format,
		solution_f: '=(a1+b1+c1)*2/3', 
		code: 'tutorial'
	},
];





/*
	Testing goals:

	Parens with just add/sub
	Parens including mult/div

	Words converted into numbers
*/

const _base = {
	type: 'IfPageFormulaSchema',
	column_titles: farm1_data.column_titles,
	column_formats: farm1_data.column_formats,
	tests: farm1_data.tests,
	client_f_format: farm1_data.client_f_format,
	instruction: 'Type in the correct formula',
	code: 'test',
	template_values: {
		'cell1': 'popCell()',
		'n': '[2-10]',
	},
	kcs: [KC_NAMES.ORDEROFOPERATION_AND_ARITHMETIC]
};

const test_pages = [
	// Ratio

	{
		..._base,
		solution_f: '={cell1_ref}/(a1+b1+c1)', 
		description: 'What ratio (or decimal/percent) of our animals are {cell1_title}?',
		kcs: [ KC_NAMES.ORDEROFOPERATION_AND_ARITHMETIC, KC_NAMES.DIVIDE_RATIO ],
	}, {
	
	// Simple problems
		..._base,
		solution_f: '=2*(a1+b1+c1)/3', 
		description: 'If a third of our animals run away, how many will we still have?',
	}, {
		..._base,
		solution_f: '=3*(a1+b1+c1)/4', 
		description: 'If a fourth of our animals run away, how many will we have remaining?',
	}, {
		..._base,
		solution_f: '=7*(a1+b1+c1)/8', 
		description: 'If an eighth of our animals run away, how many will we have remaining?',
	}, {
		..._base,
		solution_f: '=9*(a1+b1+c1)/10', 
		description: 'If a tenth of our animals run away, how many will we have still have?',
	}, {
		..._base,
		solution_f: '=(a1+b1+c1)/2', 
		description: 'If half of our animals run away, how many are gone?',
	}, {
		..._base,
		solution_f: '=(a1+b1+c1)/3', 
		description: 'If a third of our animals run away, how many will we have lost?',
	}, {
		..._base,
		solution_f: '=(a1+b1+c1)/4', 
		description: 'If a fourth of our animals run away, how many will we have lost?',
	}, {
		..._base,
		solution_f: '=(a1+b1+c1)/8', 
		description: 'If an eighth of our animals run away, how many will have escaped?',
	}, {
		..._base,
		solution_f: '=(a1+b1+c1)/10', 
		description: 'If a tenth of our animals run away, how many will have escaped?',
	}


];



module.exports = { 
	kc_orderofoperation_and_arithmetic: ({
		kc: KC_NAMES.ORDEROFOPERATION_AND_ARITHMETIC,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
	}: AdaptiveKC)
};
