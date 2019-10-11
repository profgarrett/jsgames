// @flow
const { DataFactory } = require('./../DataFactory');
const { LinearGen, /*ShuffleGen,*/ UntilGen } = require('./../Gens');
//const { cognitive_load_pages } = require('./cognitive_load_pages');
const { finish_questions } = require('./finish_questions');
import type { FormulaPageType } from './../../app/if/IfTypes';


const summary_tutor = {
	gen: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `This tutorial introduces several summary functions.
				<br/><br/>
				You should know these business terms:
				<ul>
					<li><b>Revenue</b>: Clients give money to ABC Farm when 
							they buy a horse.  Also called sales.</li>
					<li><b>Expenses</b>: ABC Farm must buy supplies to raise 
							horses.  Also called costs.</li>
					<li><b>Profit</b>: Revenue minus expenses. If this is 
						negative, then ABC has lost money.</li>
				</ul>`
		}, {
			type: 'IfPageFormulaSchema',
			description: `<code>SUM()</code> is the most common formula.  
				It will add up any values that you pass to it.  For example, 
				<code>SUM(1,2,3)</code> will return 6.`,
			instruction: 'Use <code>SUM()</code> to add up 1, 10, and 100.',
			tests: [{ a: 'NA' }],
			solution_f: '=sum(1,10,100)',
			feedback: [ 
					{ 'has': 'functions', args: ['sum'] },
					{ 'has': 'symbols', args: [','] },
					{ 'has': 'no_symbols', args: ['+'] },
					{ 'has': 'values', args: [1, 10, 100] }
				],
			code: 'tutorial'
		}, {
			type: 'IfPageFormulaSchema',
			description: 'You can also use references.',
			instruction: 'Use <code>SUM()</code> to find the total number of animals in each row',
			tests: DataFactory.randNumbers(4, 3),
			column_titles: [ 'Cows', 'Pigs', 'Ducks'],
			solution_f: '=sum(a1,b1,c1)',
			feedback: [ { 'has': 'functions', args: ['sum'] }],
			code: 'tutorial'
		}, {
			type: 'IfPageFormulaSchema',
			description: 'You can also combine references and numbers.',
			instruction: 'Find the sum of A1, B1, and 10.',
			tests: DataFactory.randNumbers(4, 3),
			solution_f: '=sum(A1,B1,10)',
			feedback: [ { 'has': 'functions', args: ['sum'] }],
			code: 'tutorial'
		}, {
			type: 'IfPageFormulaSchema',
			description: `<code>SUM</code> is also flexible enough to do ranges.
				If you try <code>=SUM(A1:C1)</code>, it will find all cells
				from <code>a1</code> to <code>c1</code>.`,
			instruction: 'Use <code>SUM()</code> and the range <code>A1:C1</code>.',
			tests: DataFactory.randNumbers(10, 3),
			solution_f: '=sum(a1:c1)',
			feedback: [ { 'has': 'functions', args: ['sum'] }],
			code: 'tutorial'
		}, {
			type: 'IfPageFormulaSchema',
			description: `Several other functions are similarly flexible in what they accept.
				<br/><br/>
				For example, <code>COUNT</code> shows how many cells contain a number (but not text!).`,
			instruction: 'Use <code>COUNT()</code> and the range <code>A1:B1</code>.',
			tests: DataFactory.randNumbersAndColors(4),
			solution_f: '=count(a1:b1)',
			feedback: [ { 'has': 'functions', args: ['count'] }],
			code: 'tutorial'
		}, {
			type: 'IfPageFormulaSchema',
			description: '<code>AVERAGE</code> returns the mean of the given cells.',
			instruction: 'Use <code>AVERAGE()</code> and the range <code>A1:C1</code>.',
			tests: DataFactory.randNumbers(4, 4),
			solution_f: '=average(a1:c1)',
			feedback: [ { 'has': 'functions', args: ['average'] }],
			code: 'tutorial'
		}, {
			type: 'IfPageFormulaSchema',
			description: '<code>MIN</code> returns the smallest of the given cells. ',
			instruction: 'Use <code>MIN()</code> and the range <code>A1:C1</code>.',
			tests: DataFactory.randNumbers(4, 4),
			solution_f: '=min(a1:c1)',
			feedback: [ { 'has': 'functions', args: ['min'] }],
			code: 'tutorial'
		}, {
			type: 'IfPageFormulaSchema',
			description: '<code>MAX</code> returns the largest of the given cells.',
			instruction: 'Use <code>MAX()</code> and the range <code>A1:C1</code>.',
			tests: DataFactory.randNumbers(4, 4),
			solution_f: '=max(a1:c1)',
			feedback: [ { 'has': 'functions', args: ['max'] }],
			code: 'tutorial'
		}
	]
};


const summary_test = {
	gen: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `Great!  Now it's time to take a quiz.
					You must complete six problems before moving on.
					<br/><br/>
					The questions will require you to carefully read the problem, and use
					the correct math symbols and functions.  <b>You do not have to use every column.</b>
					<br/><br/>
					You can review earlier pages by hovering your cursor 
					over the 'Progress' icons below.`
		},
		{
			gen: UntilGen,
			until: (until_pages: Array<FormulaPageType>): boolean => {
				// Require at least 3 successful math answers.
				//let successful = until_pages.filter( (p: FormulaPageType): boolean => p.correct );
				return (until_pages.length >= 6);
			},
			pages: [
				{	type: 'IfPageFormulaSchema',
					column_titles: ['NY Sales', 'CA Sales', 'NV Sales', 'OR Sales', 'AZ Sales' ],
					tests: DataFactory.randNumbers(10, 5),
					instruction: 'Type in the correct formula',
					code: 'test',
					versions: [
						{
							description: 'Use <code>SUM</code> to add up sales from NY, CA, and NV.',
							solution_f: '=sum(a1,b1,c1)',
							feedback: [ { 'has': 'functions', args: ['sum'] }]
						}, {
							description: 'Add up the entire row using the correct function.',
							solution_f: '=sum(a1,b1,c1,d1,e1)',
							feedback: [ { 'has': 'functions', args: ['sum'] }]
						}, {
							description: 'What is the largest sales number in the row?',
							solution_f: '=MAX(a1:e1)',
							feedback: [ { 'has': 'functions', args: ['max'] }]
						}, {
							description: 'What is the lowest sales for each row?',
							solution_f: '=MIN(a1:e1)',
							feedback: [ { 'has': 'functions', args: ['min'] }]
						}, {
							description: 'What are the average sales for each row?',
							solution_f: '=average(a1:e1)',
							feedback: [ { 'has': 'functions', args: ['average'] }]
						}, {
							description: 'What is the best sales result from each row?',
							solution_f: '=MAX(a1:e1)',
							feedback: [ { 'has': 'functions', args: ['max'] }]
						}, {
							description: 'What is the lowest sales for each row?',
							solution_f: '=MIN(a1:e1)',
							feedback: [ { 'has': 'functions', args: ['min'] }]
						}, {
							description: `Add up <code>A1</code>, 10, 
								and the range from <code>C1</code> to <code>D1</code>`,
							solution_f: '=a1+sum(c1:d1)+10',
							feedback: [ { 'has': 'functions', args: ['sum'] }]
						}
					]
				}
			]
		}
	]
};


const gen_closing = {
	gen: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: 'Great job!  You finished with the tutorial.',
			instruction: 'Click "Continue" to see a summary of your submissions',
		}
	]
};

const summary = {
	code: 'summary',
	title: 'Introduction to summary functions',
	description: 'This tutorial introduces you to the SUM, COUNT, MIN, MAX, and AVERAGE formulas.',

	gen: {
		gen: LinearGen,
		pages: [
			summary_tutor,
			summary_test,
			...finish_questions,
			gen_closing
		]
	}
};



module.exports = { summary };

