import { KC_NAMES } from './../kcs/kc';


// Common Data
const farm3_data = {
	column_titles: ['Alpacas', 'Baboons', 'Camels', 'Total Animals' ],
	column_formats: [ ',', ',', ',', ''],
	tests: [
			{ 'a': 70, 'b': 11, 'c': 19, 'd': 100 }, 
			{ 'a': 30, 'b': 4, 'c': 10, 'd': 44 }, 
			{ 'a': 1, 'b': 4, 'c': 3, 'd': 4 }, 
			{ 'a': 60, 'b': 4, 'c': 8, 'd': 64 }, 
		]
};


// Addition
const tutorial_pages = [
	{	type: 'IfPageFormulaSchema',
		description: `Division is very useful for creating a ratio.
				<br/><br/>
				If we want to know the proportion of Alpacas in our farm, then we will divide a1 by the total
				number of animals.  This gives us a decimal number.`,
		column_titles: farm3_data.column_titles,
		column_formats: farm3_data.column_formats,
		tests: farm3_data.tests,
		solution_f: '={cell1_ref}/d1',
		instruction: 'Show {cell1_title} as ratio of the total number of animals.',
		client_f_format: '',
		template_values: {
			'cell1': 'popCell(a1,b1,c1)',
		},
		feedback: [
			{ 'has': 'no_values' },
			{ 'has': 'no_symbols', args: ['%'] },
			{ 'has': 'symbols', args: ['/'] },
			{ 'has': 'references', args: ['{cell1_ref}', 'd1'] },
		],
		code: 'tutorial',
		kcs: [KC_NAMES.DIVIDE, KC_NAMES.DIVIDE_RATIO],
	},
	{	type: 'IfPageFormulaSchema',
		description: `Note that division gives us a decimal number, which Excel can be told to
				show as a percent (%). This example shows the number with a % format.`,
		column_titles: farm3_data.column_titles,
		column_formats: farm3_data.column_formats,
		tests: farm3_data.tests,
		solution_f: '={cell1_ref}/d1',
		instruction: 'Show {cell1_title} as ratio of the total number of animals.',
		template_values: {
			'cell1': 'popCell(a1,b1,c1)',
		},
		feedback: [
			{ 'has': 'no_values' },
			{ 'has': 'no_symbols', args: ['%'] },
			{ 'has': 'symbols', args: ['/'] },
			{ 'has': 'references', args: ['{cell1_ref}', 'd1'] },
		],
		client_f_format: '%',
		code: 'tutorial',
		kcs: [KC_NAMES.DIVIDE, KC_NAMES.DIVIDE_RATIO],
	},
];






const _divide_ratio_test_pages_base = {
	type: 'IfPageFormulaSchema',
	column_titles: farm3_data.column_titles,
	column_formats: farm3_data.column_formats,
	tests: farm3_data.tests,
	instruction: 'Type in the correct formula using <b>division</b>',
	client_f_format: '0',
	code: 'test',
	kcs: [KC_NAMES.DIVIDE, KC_NAMES.DIVIDE_RATIO]
};


const test_pages = [
	{	..._divide_ratio_test_pages_base,
		solution_f: '={cell1_ref}/d1',
		template_values: {
			'cell1': 'popCell(a1,b1,c1)',
		},
		feedback: [
			{ 'has': 'no_values' },
			{ 'has': 'symbols', args: ['/'] },
			{ 'has': 'references', args: ['{cell1_ref}', 'd1'] },
		],
		description: 'What percent of our animals are {cell1_title}?',
		client_f_format: '%',
	},{
		..._divide_ratio_test_pages_base,
		solution_f: '={cell1_ref}/{cell2_ref}',
		template_values: {
			'cell1': 'popCell(a1,b1,c1)',
			'cell2': 'popCell(a1,b1,c1)',
		},
		feedback: [
			{ 'has': 'no_values' },
			{ 'has': 'symbols', args: ['/'] },
			{ 'has': 'references', args: ['{cell1_ref}', '{cell2_ref}'] },
		],
		description: 'How many {cell1_title} do we have for each {cell2_title}?',
	}

];





const kc_divide_ratio = {
	kc: KC_NAMES.DIVIDE_RATIO,
	tutorial_pages: tutorial_pages,
	test_pages: test_pages
};
export { kc_divide_ratio }
