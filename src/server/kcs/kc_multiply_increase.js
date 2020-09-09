// @flow
const { KC_NAMES } = require('./../kcs/kc.js');
import type { AdaptiveKC } from './kc';

// Common Data

const farm4_data = {
	column_titles: ['Alpacas', 'Baboons', 'Camels',  'Dogs' ],
	column_formats: [ ',', '', ',', ',', ','],
	tests: [
			{ 'a': 100, 'b': 23, 'c': 1, 'd': 124 }, 
			{ 'a': 1, 'b': 20, 'c': 10, 'd': 31 }, 
			{ 'a': 10, 'b': 20, 'c': 2, 'd': 32 }, 
			{ 'a': 20, 'b': 1, 'c': 100, 'd': 121 }, 
		]
};


const _page_base = {
	type: 'IfPageFormulaSchema',
	column_titles: farm4_data.column_titles,
	column_formats: farm4_data.column_formats,
	tests: farm4_data.tests,

	client_f_format: '',

	template_values: {
		'cell1': 'popCell()',
		'n': '[10-50]',
		'buy': 'randOf(buy,acquire,get)'
	},
	feedback: [
		{ 'has': 'no_symbols', args: ['%'] },
		{ 'has': 'symbols', args: ['*'] },
		{ 'has': 'references', args: ['{cell1_ref}'] },
	],
	kcs: [KC_NAMES.PERCENT_TO_DECIMAL, KC_NAMES.MULTIPLY_INCREASE]
};


// Addition
const tutorial_pages = [
	{	..._page_base,
		description: 
			`If you multiply by a decimal number (0.5), then 
			the result is the <b>increase</b>.
			<br/><br/>
			For example, say that you increase the size of your Alpaca herd by 25%.  You would find the number of <b>new</b>
					animals by typing <code>=a1*0.25</code>. This does not tell you the total number of animals!
			<br/><br/>
			Remember, never type a % symbol in a formula! Always convert it to a decimal number.`,
	
		instruction: 'If {n}% (0.{n}) of the {cell1_title} have babies, how many <i>new</i> animals will we have?',
		solution_f: '={cell1_ref}*0.{n}',
		code: 'tutorial'
	},
	{	..._page_base,
		description: `Now, imagine that you want to show the <i>new total</i>, rather than the <i>increase</i>. 
				There are two ways you can make this happen.
				<br/><br/>
				Let's show the total number of animals after 10% of them have babies. Two formulas can do this:
				<ul>
					<li><code>=a1*1.1</code>:  This gives us the original number of animals (100%) 
						<i>and</i> the increase (10%).  Adding 100% to 10% gives us 110%, which we write as 1.1.
					<li><code>=a1*0.1+a1</code>: This approach adds the increase (10%) to the original number (a1).</li>
				</ul>
				<br/><br/>
				Either of these approaches will show you the new total number of Alpacas.`,
		
		instruction: 'If {n}% (0.{n}) of the {cell1_title} have babies, how many <i>total</i> animals will we have?',
		solution_f: '={cell1_ref}*1.{n}',

		code: 'tutorial',
	},
];

const _multiply_increase_test_pages_base = {
	..._page_base,
	code: 'test',
	instruction: 'Type in the correct formula using <b>multiplication</b>',
	feedback: [
		// Don't force the test answers to have the right value. It's ok if they find another way here.
		// Do force for the tutorial pages.
		//{ 'has': 'values', args: ['{n}'] }, 
		{ 'has': 'no_symbols', args: ['%'] },
		{ 'has': 'symbols', args: ['*'] },
		{ 'has': 'references', args: ['{cell1_ref}'] },
	],
};


const test_pages = [
	{
		..._multiply_increase_test_pages_base,
		solution_f: '={cell1_ref}*1.{n}', 
		description: 'Show the <b>total</b> of {cell1_title} if we {buy} another {n}%. Use <b>multiplication</b>.',

	},{
		// Dup to increase liklihood
		..._multiply_increase_test_pages_base,
		solution_f: '={cell1_ref}*1.{n}', 
		description: 'Show the <b>total</b> of {cell1_title} if we {buy} another {n}%. Use <b>multiplication</b>.',

	},{
		..._multiply_increase_test_pages_base,
		solution_f: '={cell1_ref}*0.{n}', 
		description: 'Show the <b>increase</b> of {cell1_title} if we {buy} another {n}%. Use <b>multiplication</b>.',
	},{
		..._multiply_increase_test_pages_base,
		solution_f: '={cell1_ref}*0.{n}', 
		description: 'Show the <b>change or increase</b> of {cell1_title} if we {buy} another {n}%. Use <b>multiplication</b>.',
	}
];




module.exports = { 
	kc_multiply_increase: ({
		kc: KC_NAMES.MULTIPLY_INCREASE,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
	}: AdaptiveKC)
};
