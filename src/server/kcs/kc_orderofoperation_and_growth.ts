import { KC_NAMES, add_if_undefined } from './../kcs/kc';

import type { AdaptiveKC } from './kc';

const farm1_data = {
	column_titles: ['Alpacas', 'Baboon', 'Growth Rate (yearly)' ],
	column_formats: [ ',', ',', '%' ],
	client_f_format: ',',
	tests: [
			{ 'a': 54, 'b': 89, 'c': 0.2 }, 
			{ 'a': 32, 'b': 4,'c': 0.05 }, 
			{ 'a': 1, 'b': 85, 'c': 0.04 }, 
			{ 'a': 103, 'b': 81, 'c': 0.1 }
		]
};



/*
	Parens

	Concepts:
		Order of operation
*/
const tutorial_pages = [
	{	type: 'IfPageTextSchema',
		description: `
				You may need to use parentheses when calculating growth.
				<br/><br/>
				Remember that simple growth just multiplies the starting number by (1+growth rate * number of years).
				So, if you have 10 animals, a 4% growth rate, and 3 years, you would calculate
				<code>10*(1+0.04*3)</code>.
				<br/><br/>
				Compound growth replaces a multiplication with an exponent and moves the final parenthesis, creating the formula
				starting number * (1+growth rate) ^ years. 
				Solving the same problem as above would require <code>10*(1+0.04)^3</code> (remember that <code>^</code> means to use a power or exponent).
				<br/><br/>
				There are also other ways to calculate interest on a non-yearly basis, such as quarterly or continuously. 
				However, we will not use those methods in this course.
				`
	},
	{	type: 'IfPageFormulaSchema',
		description: `Use <b>regular</b> growth to calculate the number of animals in <b>four years</b>.
			<br/><br/>
			Remember that the formula for regular growth is <code>Starting Value * (1 + rate * Years)</code>`,
		instruction: 'Write the formula. Remember to add together the two types of animals first, placing them in parenthesis.',
		column_formats: farm1_data.column_formats,
		column_titles: farm1_data.column_titles,
		tests: farm1_data.tests,
		client_f_format: farm1_data.client_f_format,
		solution_f: '=(a1+b1) * (1+c1*4)', 
		code: 'tutorial'
	},
	{	type: 'IfPageFormulaSchema',
		description: `Use <b>compound</b> growth to calculate the number of animals in <b>four years</b>.
			<br/><br/>
			Remember that the formula for compound growth is <code>Starting Value * (1 + rate)^Years</code>`,
		instruction: 'Write the formula. Remember to add together the two types of animals first, placing them in parenthesis.',
		column_formats: farm1_data.column_formats,
		column_titles: farm1_data.column_titles,
		tests: farm1_data.tests,
		client_f_format: farm1_data.client_f_format,
		solution_f: '=(a1+b1)*(1+c1)^4', 
		code: 'tutorial'
	},
];





/*
	Testing goals:

	Parens with just add/sub
	Parens including mult/div

	Words converted into numbers
*/

const _base = {
	type: 'IfPageFormulaSchema',
	column_titles: farm1_data.column_titles,
	column_formats: farm1_data.column_formats,
	tests: farm1_data.tests,
	client_f_format: farm1_data.client_f_format,
	instruction: `
		Type in the correct formula. The ending amount will be:
		<ul>
			<li>Compound growth: <code>=Starting Amount * (1 + Rate) ^ Years</code></li>
			<li>Regular growth: <code>=Starting Amount * (1 + Rate * Years)</code></li>
		</ul>
		`,
	template_values: {
		'cell1': 'popCell()',
		'years': '[2-10]',
		'n': '[20-50]'
	},
	code: 'test',
};

const test_pages = [
	
	// Growth rate
	{
		..._base,
		solution_f: '=(a1+b1)*(1+c1)', 
		description: 'How many animals will we have in 1 year? Use the growth rate column.',
		kcs: [ KC_NAMES.ORDEROFOPERATION_AND_GROWTH, KC_NAMES.MULTIPLY_INCREASE ],
	}, {
		..._base,
		solution_f: '=(a1+b1)*(1+{n}/100)', 
		description: 'How many animals will we have in 1 year if we have a {n}% increase (ignore the growth rate column)?',
		kcs: [ KC_NAMES.ORDEROFOPERATION_AND_GROWTH, KC_NAMES.MULTIPLY_INCREASE ],

	// Compound and regular growth rate
	}, {
		..._base,
		solution_f: '=(a1+b1)*(1+c1*{years})', 
		description: 'How many animals will we have in {years} years? Use <i>regular</i> growth',
		kcs: [ KC_NAMES.ORDEROFOPERATION_AND_GROWTH, KC_NAMES.MULTIPLY_INCREASE ],
	}, {
		..._base,
		solution_f: '=(a1+b1)*(1+c1)^{years}', 
		description: 'How many animals will we have in {years} years? Use <i>compound</i> growth',
		kcs: [ KC_NAMES.ORDEROFOPERATION_AND_GROWTH, KC_NAMES.MULTIPLY_INCREASE ],
	
	}

];

/*
	Add a decrease?

	}, {
		..._base,
		solution_f: '=(a1+b1)*(1-{n}/100)', 
		description: 'How many animals will we have in 1 year if we have a {n}% <i>decrease</i> (ignore the growth rate column)?',
		kcs: [ KC_NAMES.ORDEROFOPERATION_AND_GROWTH, KC_NAMES.MULTIPLY_INCREASE ],

*/
 
const kc_orderofoperation_and_growth = {
		kc: KC_NAMES.ORDEROFOPERATION_AND_GROWTH,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
	}; //: AdaptiveKC)

export { kc_orderofoperation_and_growth }