import { KC_NAMES, add_if_undefined } from './../kcs/kc';

import type { AdaptiveKC } from './kc';


const farm4_data = {
	column_titles: ['Alpacas', 'Baboons', 'Camels',  'Ducks' ],
	column_formats: [ ',', ',', ',', ',', ','],
	tests: [
			{ 'a': 1000, 'b': 230, 'c': 100, 'd': 1243 }, 
			{ 'a': 100, 'b': 200, 'c': 1000, 'd': 312 }, 
			{ 'a': 1000, 'b': 2000, 'c': 200, 'd': 321 }, 
			{ 'a': 2000, 'b': 100, 'c': 1000, 'd': 1210 }, 
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
		'n1': '[1-9]',
		'n2': '[1-9]',
		'n3': '[10-90]',
	},	
	kcs: [ KC_NAMES.PERCENT_TO_DECIMAL_WITHDECIMAL, KC_NAMES.MULTIPLY ],

}

// Addition
const tutorial_pages = [
	{	..._base,
		code: 'tutorial',
		description: `Percentages can also have decimals. For example, 2.5% would be 
				converted into a decimal by dividing it by 100,
				and dropping the % symbol. So, it would turn into 0.025.
				<br/><br/>
				As a shorthand way of converting a number, just move the decimal point 2 times 
				to the left. So, 23.4% would turn into 0.234.
				`,
		instruction: 'What would {n3}.{n2}% of {cell1_title} be?',
		solution_f: '={cell1_ref}*0.{n3}{n2}',
		
	},{ ..._base,
		code: 'tutorial',
		description: `If the percentage is less than 10%, you will need to add a leading zero. So, 
			4.5% would turn into 0.045.
				`,
		instruction: 'What is {n1}.{n2}% of {cell1_title}?',
		solution_f: '={cell1_ref}*0.0{n1}{n2}', 

	},{ ..._base,
		code: 'tutorial',
		description: `If the percentage is over 100%, we still follow the same process.  So, 400% would 
				turn into 4.0
				`,
		instruction: 'What is {n1}84.{n2}% of {cell1_title}?',
		solution_f: '={cell1_ref}*{n1}.84{n2}', 
		kcs: [ KC_NAMES.PERCENT_TO_DECIMAL_WITHDECIMAL, KC_NAMES.MULTIPLY, KC_NAMES.PERCENT_TO_DECIMAL_OVER1 ]


	}
];



//
// Convert a percentage to a number, when 2.2% (a decimal is present)
// 

const _percentile_test_pages_withdecimal_base = {
	..._base,
	instruction: 'Type in the correct formula. You must use <b>multiplication</b> to solve this problem.',
	code: 'test',
};



const test_pages = [
	{	..._percentile_test_pages_withdecimal_base,
		solution_f: '={cell1_ref} * 0.0{n1}{n2}', 
		description: 'What is {n1}.{n2}% of our {cell1_title}? Use <b>multiplication</b>.',

	},{ ..._percentile_test_pages_withdecimal_base,
		solution_f: '={cell1_ref} * 0.{n3}{n2}', 
		description: 'What is {n3}.{n2}% of our {cell1_title}? Use <b>multiplication</b>.',
		
	},{ ..._percentile_test_pages_withdecimal_base,
		solution_f: '={cell1_ref} * {n1}.{n3}{n2}', 
		description: 'What is {n1}{n3}.{n2}% of our {cell1_title}? Use <b>multiplication</b>.',
		kcs: [ KC_NAMES.PERCENT_TO_DECIMAL_WITHDECIMAL, KC_NAMES.MULTIPLY, KC_NAMES.PERCENT_TO_DECIMAL_OVER1 ]

	}
];




 
const kc_percent_to_decimal_withdecimal = {
	kc: KC_NAMES.PERCENT_TO_DECIMAL_WITHDECIMAL,
	tutorial_pages: tutorial_pages,
	test_pages: test_pages
}//: AdaptiveKC)


export { kc_percent_to_decimal_withdecimal }