// @flow
const { KC_NAMES } = require('./../kcs/kc.js');
import type { AdaptiveKC } from './kc';

const farm1_data = {
	column_titles: ['Alpacas', 'Baboon', 'Camels' ],
	column_formats: [ ',', ',', '$' ],
	client_f_format: ',',
	tests: [
			{ 'a': 54, 'b': 83, 'c': 10 }, 
			{ 'a': 57, 'b': 94, 'c': 1 }, 
			{ 'a': 14, 'b': 99, 'c': 8 }, 
			{ 'a': 68, 'b': 91, 'c': 0 }, 
		]
};



const _base = {
    code: 'tutorial',
    type: 'IfPageFormulaSchema',
    column_formats: farm1_data.column_formats,
    column_titles: farm1_data.column_titles,
    tests: farm1_data.tests,
    client_f_format: farm1_data.client_f_format,
    kcs: [ KC_NAMES.ORDEROFOPERATION_AND_FRACTIONS ]
}

/*
	Parens

	Concepts:
		Order of operation
*/
const tutorial_pages = [
	{	..._base,
		code: 'tutorial',
		description: `When working with fractions and order of operations, you may find it easier to split
            the steps with parenthesis.
            <br/><br/>
            For example, if you were going to add two numbers together and then
            find two thirds, you would write <code>=(a1+b1) * 1/3</code>
            `,
		instruction: `Type in <code>=(A1+B1) * 1/{n}</code>.`,
		solution_f: '=(a1+b1) * 1/{n}', 
        template_values: {
            'n': '[2-4]',
        },
	},
	{	..._base,
		code: 'tutorial',
		description: `If it makes it easier, you can also wrap a fraction in parentheses.
            This won't have an affect on the order of operations, but it can be easier to read.
            `,
		instruction: `Type in <code>=(A1+B1) * ({n}/5)</code>.`,
		solution_f: '=(a1+b1) * ({n}/5)', 
        template_values: {
            'n': '[2-4]',
        },
	},
	{	..._base,
		code: 'tutorial',
		description: `Remember how to increase or decrease numbers. For example, if you want to reduce
            by 2/3rds, then you could write the formula one of two ways:
            <ul>
                <li><kbd>=A1 * (1 - 2/3)</kbd></li>
                <li><kbd>=A2 - A2*(2/3)</kbd></li>
            </ul>
            `,
		instruction: `Type in <code>=(A1+B1) * ({n}/5)</code>.`,
		solution_f: '=(a1+b1) * ({n}/5)', 
        template_values: {
            'n': '[2-4]',
        },
	},
];



/*
	Testing 
*/

const _test_base = {
    ..._base,
	instruction: 'Type in the correct formula',
	code: 'test',
	template_values: {
		'cell1': 'popCell()',
		'cell2': 'popCell()',
		'n1': '[2-5]',
		'n2': '[7-10]',
	},
};

const test_pages = [
	{
	// Simple problems
		..._test_base,
		solution_f: '=(a1+b1+c1) * 2/3', 
		description: 'If a third of our animals run away, how many will we still have?',
	}, {
		..._test_base,
		solution_f: '=(a1+b1+c1) * 3/4', 
		description: 'If a fourth of our animals run away, how many will we have remaining?',
	}, {
		..._test_base,
		solution_f: '=(a1+b1+c1) * 7/8', 
		description: 'If an eighth of our animals run away, how many will we have remaining?',
	}, {
		..._test_base,
		solution_f: '=(a1+b1+c1) * 9/10', 
		description: 'If a tenth of our animals run away, how many will we have still have?',
	}, {
		..._test_base,
		solution_f: '=(a1+b1+c1) * 1/2', 
		description: 'If half of our animals run away, how many are gone?',
	}, {
		..._test_base,
		solution_f: '=(a1+b1+c1) * 1/3', 
		description: 'If a third of our animals run away, how many will we have lost?',
	}, {
		..._test_base,
		solution_f: '=(a1+b1+c1) * 1/4', 
		description: 'If a fourth of our animals run away, how many will we have lost?',
	}, {
		..._test_base,
		solution_f: '=(a1+b1+c1) * 1/8', 
		description: 'If an eighth of our animals run away, how many will have escaped?',
	}, {
		..._test_base,
		solution_f: '=(a1+b1+c1) * 1/10', 
		description: 'If a tenth of our animals run away, how many will have escaped?',
	}


];



module.exports = { 
	kc_orderofoperation_and_fractions: ({
		kc: KC_NAMES.ORDEROFOPERATION_AND_FRACTIONS,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
	}: AdaptiveKC)
};
