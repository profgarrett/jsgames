// @flow
const { KC_NAMES } = require('./../kcs/kc.js');
import type { AdaptiveKC } from './kc';

// Common Data
const farm2_data = {
	column_titles: ['Alpacas', 'Birthrate', 'Children', 'Death rate' ],
	column_formats: [ ',', '%', ',', '%'],
	tests: [
			{ 'a': 10, 'b': 0.3, 'c': 1, 'd': 0.1 }, 
			{ 'a': 13, 'b': 0.4, 'c': 10, 'd': 0 }, 
			{ 'a': 10, 'b': 0.23, 'c': 2, 'd': 0.05 }, 
			{ 'a': 20, 'b': 0.30, 'c': 100, 'd': 0.2 }, 
	]
};
const farm4_data = {
	column_titles: ['Alpacas', 'Baboons', 'Camels',  'Total' ],
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
		description: `Multiplication is a very useful operator (or symbol). 
				<br/><br/>
				Excel uses <code>*</code> (asterisk), which is created when you press 
				<kbd>shift</kbd> and <kbd>8</kbd>.`,
		instruction: `Each year, the farm's Alpacas have babies. Use the 
				Birthrate column to find out how many babies they will have this year.
				Use multiplication to figure out the answer.`,
		helpblock: 'Hint: Your answer should look something like =__*__',
		solution_f: '=a1*b1', 
		column_titles: farm2_data.column_titles,
		column_formats: farm2_data.column_formats,
		tests: farm2_data.tests,
		feedback: [
			{ 'has': 'no_values' },
			{ 'has': 'references', args: ['a1', 'b1'] },
			{ 'has': 'symbols', args: ['*']}
		],
		kcs: [ KC_NAMES.MULTIPLY ],
		code: 'tutorial'
	},
	{	type: 'IfPageFormulaSchema',
		description: `As well as multiplying two cells, we can also include numbers in our formulas.
				`,
		column_titles: farm2_data.column_titles,
		column_formats: farm2_data.column_formats,
		tests: farm2_data.tests,
		versions: [
			{	instruction: 'If we double our Alpacas (multiply by 2), how many would we have?',
				solution_f: '=a1*2',
			},
			{	instruction: 'How many triple our Alpacas (multiply by 3), how many would we have?',
				solution_f: '=a1*3', 
			},
		],
		feedback: [
			{ 'has': 'no_symbols', args: ['%'] },
			{ 'has': 'symbols', args: ['*'] },
		],
		kcs: [ KC_NAMES.MULTIPLY ],
		code: 'tutorial'
	},

	{	type: 'IfPageTextSchema',
		description: `There are a lot of words that show you should use multiplication.  
				Below are some of the most common ones:
			<ul>
				<li>Double or Twice</li>
				<li>Triple</li>
				<li>Of</li>
				<li>Product</li>
				<li>Times</li>
			</ul>`,
		code: 'tutorial'
	}	
];




const _base = {
	type: 'IfPageFormulaSchema',
	column_titles: farm4_data.column_titles,
	column_formats: farm4_data.column_formats,
	tests: farm4_data.tests,

	instruction: 'Type in the correct formula',
	client_f_format: '',
	template_values: {
		'n': '[2-5]',
		'cell1': 'popCell(a1,b1,c1)',
	},
	feedback: [
		{ 'has': 'symbols', args: ['*'] },
		{ 'has': 'references', args: ['{cell1_ref}'] },
	],
	code: 'test',
	kcs: [ KC_NAMES.MULTIPLY ],
};

const test_pages = [
	{
		..._base,
		solution_f: '={cell1_ref}*{n}', 
		description: 'How many {cell1_title} would we have if we multiplied them by {n}?',
	},{
		..._base,
		solution_f: '={cell1_ref}*2', 
		description: 'How many {cell1_title} would we have if we doubled them?',
	},{	
		..._base,
		solution_f: '={cell1_ref}*3', 
		description: 'How many {cell1_title} would we have if we tripled them?',
	},{
		..._base,
		solution_f: '={cell1_ref}*4', 
		description: 'How many {cell1_title} would we have if we quadrupled them?',
	}	

];



module.exports = { 
	kc_multiply: ({
		kc: KC_NAMES.MULTIPLY,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
	}: AdaptiveKC)
};
