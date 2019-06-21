//      
const { KC_NAMES } = require('./../kcs/kc.js');

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



// Addition
const tutorial_pages = [
	{	type: 'IfPageFormulaSchema',
		description: `The same rule applies for percentages over 100%.
				<br/><br/>
				For example, 425% would be converted into a decimal by dividing it by 100,
				and dropping the % symbol. So, it would turn into 4.25.
				`,
		column_titles: farm4_data.column_titles,
		column_formats: farm4_data.column_formats,
		tests: farm4_data.tests,
		versions: [
			{	instruction: 'If we increase our {cell1_title} by 240%, how many <i>more</i> would we have?',
				solution_f: '={cell1_ref}*2.4',
			},
			{	instruction: 'How many <i>more</i> {cell1_title} would we have if we increase them by 305%?',
				solution_f: '={cell1_ref}*3.05', 
			},
		],
		template_values: {
			'cell1': 'popCell()'
		},
		feedback: [
			{ 'has': 'no_symbols', args: ['%'] },
			{ 'has': 'symbols', args: ['*'] },
		],
		kcs: [ KC_NAMES.PERCENT_TO_DECIMAL_OVER1, KC_NAMES.MULTIPLY ],
		code: 'tutorial'
	}
];


//
// Convert a percentage to a number, when over 100%
// 

const _percentile_test_pages_over1_base = {
	type: 'IfPageFormulaSchema',
	column_titles: farm4_data.column_titles,
	column_formats: farm4_data.column_formats,
	tests: farm4_data.tests,

	instruction: 'Type in the correct formula. You must use <b>multiplication</b> to solve this problem.',
	client_f_format: '',
	code: 'test',
	feedback: [
		{ 'has': 'no_symbols', args: ['%'] },
		{ 'has': 'symbols', args: ['*'] },
	],
	template_values: {
		'cell1': 'popCell(a1,b1,c1)',
		'n': '[105-235]'
	},	
	kcs: [ KC_NAMES.PERCENT_TO_DECIMAL_OVER1, KC_NAMES.MULTIPLY ],
};


const test_pages = [
	{	..._percentile_test_pages_over1_base,
		solution_f: '={cell1_ref}*{n}/100', 
		description: 'What is {n}% of our {cell1_title}? Use <b>multiplication</b>.',
	}
];



module.exports = { 
	kc_percent_to_decimal_over1: {
		kc: KC_NAMES.PERCENT_TO_DECIMAL_OVER1,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
	}
};
