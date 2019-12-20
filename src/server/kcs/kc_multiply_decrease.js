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
	column_titles: ['Alpacas', 'Baboons', 'Camels',  'Total Animals' ],
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
		description: `We use a similar approach to calculate a decrease.
				<br/><br/>
				Let's show the number of animals after 10% of them run away. Two formulas can do this:
				<ul>
					<li><code>=a1*(1-0.9)</code>: This approach multiplies the original number of Alpacas by 90%, or 
						the original 100% - the 10% leaving.</li>
					<li><code>=a1-a1*0.1</code>: This approach subtracts the change (10%) from the original number (a1).</li>
				</ul>
				<br/><br/>
				Either of these approaches will show you the new total number of Alpacas.`,
		
		column_titles: farm4_data.column_titles,
		column_formats: farm4_data.column_formats,
		tests: farm4_data.tests,
		solution_f: '={cell1_ref}*(1-0.{n})',
		instruction: 'If {n}% of the {cell1_title} {sold}, how many <i>total</i> animals will we have?',
		template_values: {
			'cell1': 'popCell()',
			'n': '[10-50]',
			'sold': 'randOf(are sold,run away)'
		},
		feedback: [
			{ 'has': 'no_symbols', args: ['%'] },
			{ 'has': 'symbols', args: ['*'] },
		],
		code: 'tutorial',
		kcs: [KC_NAMES.PERCENT_TO_DECIMAL, KC_NAMES.MULTIPLY_DECREASE],

	},
];




const _multiply_decrease_test_pages_base = {
	type: 'IfPageFormulaSchema',
	column_titles: farm4_data.column_titles,
	column_formats: farm4_data.column_formats,
	tests: farm4_data.tests,

	instruction: 'Type in the correct formula using <b>multiplication</b>',
	client_f_format: '',
	code: 'test',
	template_values: {
		'cell1': 'popCell()',
		'n': '[10-89]',
		'sell': 'randOf(sell,lose)',
		'buy': 'randOf(buy,acquire,get)'
	},
};

const test_pages = [
	{
		..._multiply_decrease_test_pages_base,
		solution_f: '={cell1_ref}*(1-0.{n})', 
		description: 'Show the <b>total</b> of {cell1_title} if we {sell} {n}%. Use <b>multiplication</b>.',
		kcs: [KC_NAMES.PERCENT_TO_DECIMAL, KC_NAMES.MULTIPLY_DECREASE]
	},{
		..._multiply_decrease_test_pages_base,
		solution_f: '={cell1_ref}*0.{n}', 
		description: 'Show the <b>decrease</b> of {cell1_title} if we {sell} {n}%. Use <b>multiplication</b>.',
		kcs: [KC_NAMES.PERCENT_TO_DECIMAL, KC_NAMES.MULTIPLY_DECREASE]
	}
];




module.exports = { 
	kc_multiply_decrease: ({
		kc: KC_NAMES.MULTIPLY_DECREASE,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
	}: AdaptiveKC)
};
