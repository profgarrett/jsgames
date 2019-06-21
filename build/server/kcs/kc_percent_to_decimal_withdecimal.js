//      
const { KC_NAMES } = require('./../kcs/kc.js');

const farm4_data = {
	column_titles: ['Alpacas', 'Baboons', 'Camels',  'Ducks' ],
	column_formats: [ ',', '', ',', ',', ','],
	tests: [
			{ 'a': 1000, 'b': 230, 'c': 100, 'd': 1243 }, 
			{ 'a': 100, 'b': 200, 'c': 1000, 'd': 312 }, 
			{ 'a': 1000, 'b': 2000, 'c': 200, 'd': 321 }, 
			{ 'a': 2000, 'b': 100, 'c': 1000, 'd': 1210 }, 
		]
};



// Addition
const tutorial_pages = [
	{	type: 'IfPageFormulaSchema',
		description: `Percentages can also have decimals. For example, 2.5% would be 
				converted into a decimal by dividing it by 100,
				and dropping the % symbol. So, it would turn into 0.025.
				`,
		column_titles: farm4_data.column_titles,
		column_formats: farm4_data.column_formats,
		tests: farm4_data.tests,
		versions: [
			{	instruction: 'If we increase our {cell1_title} by 2.4%, how many <i>more</i> would we have?',
				solution_f: '={cell1_ref}*0.024',
			},
			{	instruction: 'How many <i>more</i> {cell1_title} would we have if we increase them by 30.5%?',
				solution_f: '={cell1_ref}*0.305', 
			},
		],
		template_values: {
			'cell1': 'popCell()'
		},
		feedback: [
			{ 'has': 'no_symbols', args: ['%'] },
			{ 'has': 'symbols', args: ['*'] },
		],
		kcs: [ KC_NAMES.PERCENT_TO_DECIMAL_WITHDECIMAL, KC_NAMES.MULTIPLY ],
		code: 'tutorial'
	}
];



//
// Convert a percentage to a number, when 2.2% (a decimal is present)
// 

const _percentile_test_pages_withdecimal_base = {
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
		'n1': '[2-45]',
		'n2': '[1-9]',
	},	
	kcs: [ KC_NAMES.PERCENT_TO_DECIMAL_WITHDECIMAL, KC_NAMES.MULTIPLY ],
};



const test_pages = [
	{	..._percentile_test_pages_withdecimal_base,
		solution_f: '={cell1_ref}* ( {n1}/100 + {n2}/1000 ) ', 
		description: 'What is {n1}.{n2}% of our {cell1_title}? Use <b>multiplication</b>.',
	}
];





module.exports = { 
	kc_percent_to_decimal_withdecimal: {
		kc: KC_NAMES.PERCENT_TO_DECIMAL_WITHDECIMAL,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
	}
};
