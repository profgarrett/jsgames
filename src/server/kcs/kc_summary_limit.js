// @flow
const { KC_NAMES } = require('./../kcs/kc.js');
import type { AdaptiveKC } from './kc';


// Addition
const tutorial_pages = [
	{
		type: 'IfPageFormulaSchema',
		description: `A useful way to use <code>Max</code> is to prevent a number from getting too small.
			<br/><br/>
			For example, say that we want to make sure that a number never gets smaller than 100. Using 
			<code>=MAX(100, a1)</code> means that <code>A1</code> value will never be below <code>100</code>.`,
		client_f_format: '$',
		column_formats: [ 'text', '$' ],
		column_titles: [ 'Year', 'Sales Commission' ],
		tests: [
			{ 'a': 1996, 'b': 1000 }, 
			{ 'a': 1997, 'b': 400 }, 
			{ 'a': 1998, 'b': 100 }, 
			{ 'a': 1999, 'b': 82 }, 
		],
		versions: [
			{	solution_f: '=max(500, b1)',
				instruction: 'Show sales commission for each year, making sure that they make at least $500.'
			},{	solution_f: '=max(250, b1)',
				instruction: 'Show sales commission for each year, making sure that they make at least $250.'
			},{	solution_f: '=max(150, b1)',
				instruction: 'Show sales commission for each year, making sure that they make at least $150.'
			}
		],
		feedback: [ { 'has': 'functions', args: ['max'] }],
		code: 'tutorial'
	}, {

		type: 'IfPageFormulaSchema',
		description: `This could be useful for calculating sales commission.  For example, say that sales people 
			should get 10% of sales as their reward for making the sale.  You would normally write <code>=B1*0.1</code>. 
			<br/><br/>
			But, if you want 
			to make sure that they get at least $1,000, you will instead write <code>=MAX(1000, B1*0.1)`,
		client_f_format: '$',
		column_formats: [ 'text', '$' ],
		column_titles: [ 'Year', 'Company Sales' ],
		tests: [
			{ 'a': 1996, 'b': 10000 }, 
			{ 'a': 1997, 'b': 4000 }, 
			{ 'a': 1998, 'b': 100 }, 
			{ 'a': 1999, 'b': 82 }, 
		],
		versions: [
			{	solution_f: '=max(500, b1*0.2)',
				instruction: 'Calculate a 20% sales commission for each year, making sure that they earn at least $500.'
			},{	solution_f: '=max(250, b1*0.15)',
				instruction: 'Calculate a 15% sales commission for each year, making sure that they earn at least $250.'
			},{	solution_f: '=max(150, b1*0.1)',
				instruction: 'Calculate a 10% sales commission for each year, making sure that they earn at least $150.'
			}
		],
		feedback: [ { 'has': 'functions', args: ['max'] }],
		code: 'tutorial'

	}, {

		type: 'IfPageFormulaSchema',
		description: `This trick also works with <code>MIN</code>, which can be used to make sure that a number
			never goes over a certain number.
			<br/><br/>
			For example, say that we want to make sure that a number never gets bigger than 100. Using 
			<code>=MIN(100, a1)</code> means that <code>A1</code> number will never be above <code>100</code>.`,
		client_f_format: '$',
		column_formats: [ 'text', '$' ],
		column_titles: [ 'Year', 'Sales Commission' ],
		tests: [
			{ 'a': 1996, 'b': 1000 }, 
			{ 'a': 1997, 'b': 400 }, 
			{ 'a': 1998, 'b': 100 }, 
			{ 'a': 1999, 'b': 82 }, 
		],
		versions: [
			{	solution_f: '=min(500, b1)',
				instruction: 'Show sales commission for each year, making sure that they make at most $500.'
			},{	solution_f: '=min(250, b1)',
				instruction: 'Show sales commission for each year, making sure that they make at most $250.'
			},{	solution_f: '=min(150, b1)',
				instruction: 'Show sales commission for each year, making sure that they make at most $150.'
			}
		],
		feedback: [ { 'has': 'functions', args: ['min'] }],
		code: 'tutorial'
	
	}	
];





const _base_sales2 = {
	type: 'IfPageFormulaSchema',
	instruction: 'Type in the correct formula',
	client_f_format: '$',
	column_formats: [ 'text', '$' ],
	code: 'test',
	kcs: [ KC_NAMES.SUMMARY_LIMIT ],
	
	column_titles: [ 'Year', 'Sales Commission' ],
	tests: [
			{ 'a': 1996, 'b': 90 }, 
			{ 'a': 1997, 'b': 40 }, 
			{ 'a': 1998, 'b': 10 }, 
			{ 'a': 1999, 'b': 82 }, 
	],
};


const _base_sales = {
	type: 'IfPageFormulaSchema',
	instruction: 'Type in the correct formula',
	client_f_format: '$',
	column_formats: [ 'text', '$' ],
	code: 'test',
	kcs: [ KC_NAMES.SUMMARY_LIMIT ],

	column_titles: [ 'Year', 'Company Sales' ],
	tests: [
		{ 'a': 1996, 'b': 10000 }, 
		{ 'a': 1997, 'b': 4000 }, 
		{ 'a': 1998, 'b': 100 }, 
		{ 'a': 1999, 'b': 82 }, 
	]
};


const test_pages = [
	{
		..._base_sales2,
		solution_f: '=min(15, b1)',
		description: 'Make sure that each sales commission is under $15.',
	}, {
		..._base_sales2,
		solution_f: '=min(50, b1)',
		description: 'Make sure that each sales commission is under $50.',
	}, {
		..._base_sales2,
		solution_f: '=min(20, b1)',
		description: 'Make sure that each sales commission is under $20.',
	}, {
		..._base_sales2,
		solution_f: '=max(15, b1)',
		description: 'Make sure that each sales commission is at least $15.',
	}, {
		..._base_sales2,
		solution_f: '=max(50, b1)',
		description: 'Make sure that each sales commission is at least $50.',
	}, {
		..._base_sales2,
		solution_f: '=max(20, b1)',
		description: 'Make sure that each sales commission is at least $20.',
	}, {
		..._base_sales,
		solution_f: '=min(500, b1*0.1)',
		description: 'Calculate a 10% sales commission for each year, making sure that they earn under $500.',
	}, {
		..._base_sales,
		solution_f: '=min(250, b1*0.05)',
		description: 'Calculate a 5% sales commission for each year, making sure that they earn under $250.',
	}, {
		..._base_sales,
		solution_f: '=min(150, b1*0.01)',
		description: 'Calculate a 1% sales commission for each year, making sure that they earn under $150.',
	}, {
		..._base_sales,
		solution_f: '=max(500, b1*0.1)',
		description: 'Calculate a 10% sales commission for each year, making sure that they earn at least $500.',
	}, {
		..._base_sales,
		solution_f: '=max(250, b1*0.05)',
		description: 'Calculate a 5% sales commission for each year, making sure that they earn at least $250.',
	}, {
		..._base_sales,
		solution_f: '=max(150, b1*0.01)',
		description: 'Calculate a 1% sales commission for each year, making sure that they earn at least $150.',
	}
];



module.exports = { 
	kc_summary_limit: ({
		kc: KC_NAMES.SUMMARY_LIMIT,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
	}: AdaptiveKC)
};
