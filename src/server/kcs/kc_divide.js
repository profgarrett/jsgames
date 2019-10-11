// @flow
const { KC_NAMES } = require('./../kcs/kc.js');
import type { AdaptiveKC } from './kc';

//const randPercent = DataFactory.randPercent;
//const randB = DataFactory.randB;

// Common Data

const farm3_data = {
	column_titles: ['Alpacas', 'Baboons', 'Camels', 'Total Animals' ],
	column_formats: [ ',', ',', ',', ''],
	tests: [
			{ 'a': 70, 'b': 11, 'c': 19, 'd': 100 }, 
			{ 'a': 30, 'b': 4, 'c': 10, 'd': 44 }, 
			{ 'a': 0, 'b': 4, 'c': 0, 'd': 4 }, 
			{ 'a': 60, 'b': 4, 'c': 0, 'd': 64 }, 
		]
};



// Addition
const tutorial_pages = [
	{	type: 'IfPageFormulaSchema',
		description: `Division is our last basic math operator.
				<br/><br/>
				Excel uses <kbd>/</kbd> (slash), which is on the <kbd>?</kbd> key.
				<br/><br/>
				This different from the backslash <kbd>\\</kbd>, which is
				usually on the right side of the keyboard above <kbd>enter</kbd>.`,
		instruction: `Each year, we want to sell half of the Alpacas. How many will we 
				have left over?	Use division to figure out the answer.`,
		helpblock: 'Hint: Your answer should look something like =__/__',
		solution_f: '=a1/2', 
		column_titles: farm3_data.column_titles,
		column_formats: farm3_data.column_formats,
		tests: farm3_data.tests,
		feedback: [
			{ 'has': 'values', args: [2] },
			{ 'has': 'references', args: ['a1'] },
			{ 'has': 'symbols', args: ['/']}
		],
		code: 'tutorial'
	},
	{	type: 'IfPageTextSchema',
		description: `There are a lot of words that show you should use division.  
				Below are some of the common ones:
			<ul>
				<li>Half (or other fractions, like a third, fourth, etc...)</li>
				<li>Divided by</li>
				<li>In parts</li>
				<li>Percent (meaning divide by 100)</li>
				<li>Split into</li>
				<li>Parts</li>
				<li>Ratio</li>
			</ul>`,
		code: 'tutorial'
	}	
];





const _divide_test_pages_base = {
	type: 'IfPageFormulaSchema',
	column_titles: farm3_data.column_titles,
	column_formats: farm3_data.column_formats,
	tests: farm3_data.tests,

	instruction: 'Type in the correct formula using <b>division</b>',
	client_f_format: '',
	template_values: {
		'n': '[2-10]',
		'cell1': 'popCell()',
	},
	code: 'test',
	kcs: [KC_NAMES.DIVIDE]
};

const test_pages = [
	{	..._divide_test_pages_base,
		solution_f: '={cell1_ref}/2', 
		description: 'What is half of the {cell1_title}?',
	},{
		..._divide_test_pages_base,
		solution_f: '={cell1_ref}/4', 
		description: 'What is a quarter of the {cell1_title}?',
	},{
		..._divide_test_pages_base,
		solution_f: '={cell1_ref}/10', 
		description: 'What is a tenth of the {cell1_title}?',
	},{
		..._divide_test_pages_base,
		solution_f: '={cell1_ref}/{n}', 
		description: 'How many {cell1_title} would be have if we split them into {n} groups?',
	}

];





module.exports = { 
	kc_divide: ({
		kc: KC_NAMES.DIVIDE,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
	}: AdaptiveKC)
};
