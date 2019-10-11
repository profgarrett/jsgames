// @flow
const { DataFactory } = require('./../DataFactory');
const { LinearGen, /*ShuffleGen,*/ UntilGen } = require('./../Gens');
//const { cognitive_load_pages } = require('./cognitive_load_pages');
const { finish_questions } = require('./finish_questions');
import type { FormulaPageType } from './../../app/if/IfTypes';


const text_tutor = {
	gen: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `This tutorial introduces several useful text functions.
				<br/><br/>
				You should be comfortable with formulas and references before 
				starting this tutorial.`
		}, {
			type: 'IfPageFormulaSchema',
			description: `Text in Excel can be stored in two ways:
				<ul>
					<li>In a cell, which can be referred to as <code>=A1</code></li>
					<li>In a formula, which must look like <code>="here is some text"</code></li>
				</ul>
				<br/><br/>
				Text in a formula must always be wrapped in "double-quotes", and not 
				'single quotes'.`,
			instruction: 'Type in <code>="Word!"</code>.',
			tests: [ { 'a': 'test'}],
			solution_f: '="Word!"',
			feedback: [  
				{ 'has': 'symbols', args: [ '"' ] },
				{ 'has': 'no_symbols', args: ['\''] }
			],
			code: 'tutorial'
		}, {
			type: 'IfPageFormulaSchema',
			description: `Excel provides a range of text functions.  One of the simplest is 
				<code>LEN()</code>.  It will return the length of whatever text is passed in.`,
			instruction: 'Find the length of "test".',
			helpblock: 'Type in <code>=LEN("test")</code>',
			tests: [ { 'a': 'test'}],
			feedback: [ 
				{ 'has': 'functions', args: ['LEN' ] },
				{ 'has': 'symbols', args: [ '"' ] },
				{ 'has': 'no_symbols', args: ['\''] }
			],
			solution_f: '=len("test")',
			code: 'tutorial'
		}, {
			type: 'IfPageFormulaSchema',
			description: 'You can also pass in a cell reference to <code>LEN()</code>.',
			instruction: 'How long is the text in cell A1?',
			helpblock: 'Type in <code>=LEN(A1)</code>',
			column_titles: [ 'First name', 'Last name'],
			tests: DataFactory.randPeople(4),
			solution_f: '=len(a1)',
			code: 'tutorial'
		}, {
			type: 'IfPageFormulaSchema',
			description: `<code>LEFT</code> is also useful.
				Putting in <code>=LEFT("test", 2)</code> will return two letters
				from the left side of "test".`,
			instruction: 'Use <code>LEFT()</code> to return the first <b>3</b> letters from A1.',
			column_titles: [ 'First name', 'Last name'],
			tests: DataFactory.randPeople(4),
			solution_f: '=left(a1, 3)',
			code: 'tutorial'
		}, {
			type: 'IfPageFormulaSchema',
			description: '<code>RIGHT</code> is very similar to <code>LEFT</code>.',
			instruction: 'Use <code>RIGHT()</code> to return the last letter from A1.',
			tests: DataFactory.randPeople(4),
			column_titles: [ 'First name', 'Last name'],
			solution_f: '=right(a1, 1)',
			code: 'tutorial'
		}, {
			type: 'IfPageFormulaSchema',
			description: '<code>UPPER</code> will turn text from lower-case into upper-case.',
			instruction: 'Return <code>A1</code> in uppercase',
			tests: DataFactory.randPeople(4),
			column_titles: [ 'First name', 'Last name'],
			solution_f: '=upper(a1)',
			code: 'tutorial'
		}, {
			type: 'IfPageFormulaSchema',
			description: '<code>LOWER</code> will turn texts into lower-case ',
			instruction: 'Return <code>A1</code> in lowercase',
			column_titles: [ 'First name', 'Last name'],
			tests: DataFactory.randPeople(4),
			solution_f: '=lower(a1)',
			code: 'tutorial'
		}, {
			type: 'IfPageFormulaSchema',
			description: `Text can also be joined together with <code>&</code>, which 
				you will find by pressing <kbd>shift</kbd> and <kbd>7</kbd>.`,
			instruction: `Type <code>=A1 & B1</code> to join together the 
					contents of those two cells.`,
			column_titles: [ 'First name', 'Last name'],
			tests: DataFactory.randPeople(4),
			solution_f: '=a1 & b1',
			code: 'tutorial'
		}, {
			type: 'IfPageFormulaSchema',
			description: `You can also join together text in quotes.  For example,
					you can type <code>="The " & "Great"</code> to show "The Great`,
			instruction: 'Return "The " and B1 and " Professor".',
			helpblock: 'Be sure to includ spaces! I.E, "The " instead of "The".',
			tests: DataFactory.randPeople(4),
			column_titles: [ 'First name', 'Last name'],
			feedback: [ 
				{ 'has': 'values', args: [ '"The "' ] }
			],
			solution_f: '="The " & B1 & " Professor"',
			code: 'tutorial'
		}, {
			type: 'IfPageFormulaSchema',
			description: 'Now try combining all of these different elements on your own.',
			instruction: 'Combine the first letter of A1 and all of B1.',
			helpblock: 'Type in <code>=left(a1,1) & b1</code>',
			column_titles: [ 'First name', 'Last name'],
			tests: DataFactory.randPeople(4),
			solution_f: '=left(a1,1) & b1',
			code: 'tutorial'
		}, {
			type: 'IfPageFormulaSchema',
			description: 'Now try returning them with a space! ',
			instruction: 'Combine the first letter of A1, a space, and all of B1.',
			tests: DataFactory.randPeople(4),
			solution_f: '=left(a1,1) & " " & b1',
			column_titles: [ 'First name', 'Last name'],
			feedback: [ 
				{ 'has': 'symbols', args: [ '"' ] },
				{ 'has': 'no_symbols', args: ['\''] }
			],
			code: 'tutorial'
		}, {
			type: 'IfPageFormulaSchema',
			description: 'This is useful for re-arranging a name.',
			instruction: 'Return each person\'s last name, a comma, a space, and their first name',
			tests: DataFactory.randPeople(4),
			solution_f: '=b1 & ", " & a1',
			column_titles: [ 'First name', 'Last name'],
			feedback: [ 
				{ 'has': 'symbols', args: [ '&' ] },
				{ 'has': 'values', args: [ ',', ' ' ] },
				{ 'has': 'symbols', args: [ '"' ] },
				{ 'has': 'no_symbols', args: ['\''] }
			],
			code: 'tutorial'
		}, {
			type: 'IfPageFormulaSchema',
			description: `You can also put functions inside of each other.  For example,
				<code>=UPPER(LEFT(a1,1))</code> will first get the left-most character 
				from A1, and then turn it into uppercase.`,
			instruction: 'Get the 2 right-most letters of A1 in lowercase.',
			tests: DataFactory.randPeople(4),
			column_titles: [ 'First name', 'Last name'],
			feedback: [ { 'has': 'functions', args: [ 'right', 'lower' ] }],
			solution_f: '=lower(right(a1,2))',
			code: 'tutorial'
		}, {
			type: 'IfPageFormulaSchema',
			description: 'You can also join together the results of text functions.',
			instruction: `Get the first letter of A1, and use <code>&</code> to 
					join it with the first letter of B1`,
			tests: DataFactory.randPeople(4),
			column_titles: [ 'First name', 'Last name'],
			solution_f: '=left(a1,1) & left(b1, 1)',
			feedback: [ 
				{ 'has': 'functions', args: [ 'left' ] },
				{ 'has': 'symbols', args: [ '&' ] }
			],
			code: 'tutorial'
		}
	]
};



const text_test = {
	gen: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `Great!  Now it's time to take a quiz.
					You must complete six problems before moving on.
					<br/><br/>
					The questions will require you to carefully read the problem, and use
					the correct functions.  <b>You do not have to use every column.</b>
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
					tests: DataFactory.randPeople(4),
					instruction: 'Type in the correct formula',
					column_titles: [ 'First name', 'Last name'],
					code: 'test',
					versions: [
						{
							description: 'Return the first three letters of A1',
							solution_f: '=left(a1, 3)'
						}, {
							description: 'Return the person\'s initials (the first letter of their first and their last name)',
							solution_f: '=left(a1, 1)&left(b1,1)'
						}, {
							description: 'Return the first name in all capital letters.',
							solution_f: '=upper(a1)'
						}, {
							description: 'Return the last name, a comma and space, and the first name',
							solution_f: '=b1&", "&a1'
						}, {
							description: 'Return the person\'s last name in lowercase',
							solution_f: '=lower(b1)',
							feedback: [ { 'has': 'functions', args: ['lower'] }]
						}, {
							description: 'Return their last name, and the first letter of their first name',
							solution_f: '=b1&left(a1,1)',
							feedback: [ { 'has': 'functions', args: ['left'] }]
						}, {
							description: 'Return the first letter of their first name, followed by !',
							solution_f: '=left(a1,1)&"!"',
							feedback: [ { 'has': 'functions', args: ['left'] }]
						}, {
							description: `Write a formula that returns "Hello Professor X", where X
								is their last name.`,
							solution_f: '="Hello Professor " & b1',
							feedback: [ { 'has': 'values', args: ['Hello Professor'] }]
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

const text = {
	code: 'text',
	title: 'Introduction to text functions',
	description: 'This tutorial introduces you to different text formulas.',

	gen: {
		gen: LinearGen,
		pages: [
			text_tutor,
			text_test,
			...finish_questions,
			gen_closing
		]
	}
};




module.exports.text = text;
