import { KC_NAMES, add_if_undefined } from './../kcs/kc';

import type { AdaptiveKC } from './kc';

// Common Data
const farm4_data = {
	column_titles: ['Alpacas', 'Baboons', 'Camels',  'Ducks' ],
	column_formats: [ ',', ',', ',', ',', ','],
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
		'n': '[14-91]',
		'n_small': '[2-9]',
	},	
	kcs: [ KC_NAMES.PERCENT_TO_DECIMAL_OVER1, KC_NAMES.MULTIPLY ],
}


// Addition
const tutorial_pages = [
	{	..._base,
		code: 'tutorial',
		description: `We often use talk about percentages, such as 10%. However, Excel does better
				when we use 0.1, which is the decimal form of a percentage.
				<br/><br/>
				You can convert a decimal to a percentage by dividing it by 100 and dropping the % symbol. 
				Or, just move the decimal point to the left two times!
				<br/><br/>
				So, if you want to find 20% of a number, use <code>=a1*0.2</code>.
				`,
		instruction: 'What would {n}% of our {cell1_title} be?',
		solution_f: '={cell1_ref}*0.{n}',
		kcs: [ KC_NAMES.PERCENT_TO_DECIMAL, KC_NAMES.MULTIPLY ],
	},{	..._base,
		code: 'tutorial',
		description: `If the percentage is less than 10%, you will need to add a leading zero. 
				So, 8% would turn into 0.08. 
				`,
		instruction: 'What would {n_small}% of our {cell1_title} be?',
		solution_f: '={cell1_ref}*0.0{n_small}',
		kcs: [ KC_NAMES.PERCENT_TO_DECIMAL, KC_NAMES.MULTIPLY ],
	}


];



//
// Change from a regular percentage to a decimal number.
// 

const _percentile_test_pages_base = {
	..._base,

	instruction: 'Type in the correct formula. You must use <b>multiplication</b> to solve this problem.',
	code: 'test',
};


const test_pages = [
	{	..._percentile_test_pages_base,
		solution_f: '={cell1_ref}*0.{n}', 
		description: 'What is {n}% of our {cell1_title}? Use <b>multiplication</b>.',
	},{	..._percentile_test_pages_base,
		solution_f: '={cell1_ref}*0.0{n_small}', 
		description: 'What is {n_small}% of our {cell1_title}? Use <b>multiplication</b>.',
	}
];





const kc_percent_to_decimal = {
		kc: KC_NAMES.PERCENT_TO_DECIMAL,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
	} //: AdaptiveKC)



export { kc_percent_to_decimal }