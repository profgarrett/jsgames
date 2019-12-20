// @flow
const { KC_NAMES } = require('./../kcs/kc.js');
import type { AdaptiveKC } from './kc';


const farm1_data = {
	column_titles: ['Alpacas', 'Baboons', 'Camels', 'Ducks' ],
	tests: [
			{ 'a': 23, 'b': 34, 'c': 39, 'd': 51 }, 
			{ 'a': 3, 'b': 10, 'c': 31, 'd': 89 }, 
			{ 'a': 21, 'b': 31, 'c': 29, 'd': 89 }, 
			{ 'a': 29, 'b': 39, 'c': 49, 'd': 100 }, 
		]
};




// Addition
const tutorial_pages = [
	{	type: 'IfPageTextSchema',
		description: `We frequently use addition and subtraction together.
			As you create your formulas, remember that the computer works from left to right.
			<br/><br/>
			So, for example, <code>=3-2+1</code> would be 2 (since we would subtract 2 
			before adding 1).`,
		code: 'tutorial'
	},
];


const T_LOST = 'randOf(were lost,were sold,ran away)';

const _base_add_and_subtract_test_question = {
	type: 'IfPageFormulaSchema',
	column_titles: farm1_data.column_titles,
	tests: farm1_data.tests,
	instruction: `Type in the correct formula. Use the symbols taught in this lesson, such as  <code>+</code> and
		<code>-</code>.  Do not use functions like <code>SUM</code>.`,
	code: 'test',
	kcs: [ KC_NAMES.ADD, KC_NAMES.SUBTRACT ]
};

const add_and_subtract_test_pages = [
	{
		..._base_add_and_subtract_test_question,
		solution_f: '={cell1_ref}+{cell2_ref}-{n}', 
		description: 'How many {cell1_title} and {cell2_title} would we have if {n} {lost}?',
		template_values: {
			'n': '[3-9]',
			'lost': T_LOST,
			'cell1': 'popCell()',
			'cell2': 'popCell()',
		},
		feedback: [
			{ 'has': 'symbols', args: ['-', '+']}
		]
	},{
		..._base_add_and_subtract_test_question,
		solution_f: '={cell1_ref}+{cell2_ref}+{cell3_ref}-{n}', 
		description: 'How many {cell1_title}, {cell2_title}, and {cell3_title} would we have if {n} {lost}?',
		template_values: {
			'n': '[3-9]',
			'lost': T_LOST,
			'cell1': 'popCell()',
			'cell2': 'popCell()',
			'cell3': 'popCell()',
		},
		feedback: [
			{ 'has': 'symbols', args: ['-', '+']}
		]
	},{
		..._base_add_and_subtract_test_question,
		solution_f: '=a1+b1+c1+d1-{n}', 
		description: 'How many animals would we have in total if we lost {n}?',
		template_values: {
			'n': '[1-12]'
		},
		feedback: [
			{ 'has': 'symbols', args: ['+', '-']}
		]

	},
];


module.exports = {
	kc_add_and_subtract: ({
		kc: KC_NAMES.ADD_AND_SUBTRACT,
		tutorial_pages: tutorial_pages,
		test_pages: add_and_subtract_test_pages
	}: AdaptiveKC)
};