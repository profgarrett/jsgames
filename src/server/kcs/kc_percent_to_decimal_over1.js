// @flow
const { KC_NAMES } = require('./../kcs/kc.js');
import type { AdaptiveKC } from './kc';

const farm4_data = {
	column_titles: ['Alpacas', 'Baboons', 'Camels',  'Ducks' ],
	column_formats: [ ',', '', ',', ',', ','],
	tests: [
			{ 'a': 100, 'b': 23, 'c': 1, 'd': 124 }, 
			{ 'a': 1, 'b': 20, 'c': 10, 'd': 31 }, 
			{ 'a': 10, 'b': 20, 'c': 2, 'd': 32 }, 
			{ 'a': 20, 'b': 1, 'c': 100, 'd': 121 }, 
		]
};


const _base = {
	type: 'IfPageFormulaSchema',
	column_titles: farm4_data.column_titles,
	column_formats: farm4_data.column_formats,
	tests: farm4_data.tests,
	client_f_format: '',
	feedback: [
		{ 'has': 'no_symbols', args: ['%'] },
		{ 'has': 'symbols', args: ['*'] },
	],
	template_values: {
		'cell1': 'popCell(a1,b1,c1)',
		'n1': '[1-4]',
		'n2': '[1-4]',
		'n3': '[10-90]',
	},	
	kcs: [ KC_NAMES.PERCENT_TO_DECIMAL_OVER1, KC_NAMES.MULTIPLY ],

}


// Addition
const tutorial_pages = [
	{	..._base,
		description: `The same rule applies for percentages over 100%.
				<br/><br/>
				For example, 425% would be converted into a decimal by dividing it by 100,
				and dropping the % symbol. So, it would turn into 4.25.
				<br/><br/>
				Or, as a shorthand, just remember to move the decimal point over twice to the left.
				`,
		instruction: 'What is {n1}{n3}% of our {cell1_title}?',
		solution_f: '={cell1_ref}*{n1}.{n3}',
		code: 'tutorial'
	}
];


//
// Convert a percentage to a number, when over 100%
// 

const _percentile_test_pages_over1_base = {
	..._base,
	instruction: 'Type in the correct formula. You must use <b>multiplication</b> to solve this problem.',
	code: 'test',
};


const test_pages = [
	{	..._percentile_test_pages_over1_base,
		solution_f: '={cell1_ref}*{n1}.{n3}', 
		description: 'What is {n1}{n3}% of our {cell1_title}? Use <b>multiplication</b>.',
	}
];



module.exports = { 
	kc_percent_to_decimal_over1: ({
		kc: KC_NAMES.PERCENT_TO_DECIMAL_OVER1,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
	}: AdaptiveKC)
};
