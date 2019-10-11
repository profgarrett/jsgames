// @flow
const { DataFactory } = require('./../DataFactory');
const { LinearGen, UntilGen } = require('./../Gens');
const { finish_questions } = require('./../pages/finish_questions');

const { IfPageFormulaSchema } = require( './../../shared/IfPageSchemas');

const randB = DataFactory.randB;

import type { GenType } from './../Gens';
import type { LevelSchemaFactoryType } from './../IfLevelSchemaFactory';


const if5_if_with_functions_tutorial = ({
	gen_type: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `The previous tutorials taught you how to compare values, create simple
					IF formulas, and use the <code>AND</code>, <code>OR</code> & <code>NOT</code> functions.
					<br/><br/>
					This tutorial asks you to put all of these concepts together.
					`
		},
		{	type: 'IfPageTextSchema',
			description: `One of the first things to clearly understand is how to nest functions.
					It's tempting to read a formula like a book, starting at the left and moving to the right.
					However, the computer works differently.  
					<br/><br/>
					Think about how to solve the math problem <code>1 + 2 * 3</code>.  If we read it
					left to right, then we would calculate <code>1 + 2</code> and then <code>3 * 3</code>. 
					But, this would end up with the wrong result!
					<br/><br/>
					When we do a math problem, we follow order of operations.  That says that we should
					multiply before we add.  So, we would multiply <code>2 * 3</code>, and then add 
					the result to <code>1</code>.
					<br/><br/>
					Excel has a similar approach.  Simply stated, it tries to do the inner operations first.
					So, if we were to write <code>=YEAR(NOW())</code>, it first runs <code>NOW()</code>. 
					Once this result is found, it then gives that output as input to the <code>YEAR()</code> function.
					<br/><br/>
					When creating Excel <code>IF</code> functions, we will regularly do this nesting operation.`
		},
		{	type: 'IfPageFormulaSchema',
			description: `Let's start with a fairly simple nesting function with the <code>NOT</code> function.  
					<br/><br/>
					When you enter <code>=IF(NOT(C1=0), "No kids", "Kids")</code>, Excel first
					looks at the condition, <code>NOT(C1=0)</code>.  After it finds the result of that function,
					it passes the result into the <code>IF</code> function.`,
			instruction: 'Enter the formula from above.',
			column_titles: ['Animal Breed', 'Cost', 'Kids'],
			tests: [
						{ 'a': 'Arabian', 'b': randB(100, 1000), 'c': 0 }, 
						{ 'a': 'Mixed', 'b': randB(10, 100), 'c': 1 }, 
						{ 'a': 'Persian', 'b': randB(10, 100), 'c': 2 }, 
						{ 'a': 'Mustang', 'b': randB(10, 100), 'c': 2 }, 
						{ 'a': 'Quarter', 'b': randB(10, 100), 'c': 0 }
					],
			solution_f: '=if(not(c1=0), "no kids", "kids")', 
			feedback: [
				{ 'has': 'references', args: ['c1'] },
				{ 'has': 'functions', args: ['not']}
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `Let's try another example.
					<br/><br/>
					Consider <code>=IF(NOT(A1="Horses"), "Sell", "Hide")</code>.  
					This checks to see if A1 has the value of "Horses", and then flips the result.
					The flipped result is then used to decide between "Sell" and "Hide".`,
			instruction: `Use the IF and NOT functions to return "Water" for anything that's
				not a Cow.  Cows should return "Farm"`,
			column_titles: ['Animal Type', 'Count', 'Ranking'],
			tests: [
						{ 'a': 'Ducks', 'b': randB(10, 100), 'c': 'B' }, 
						{ 'a': 'Chickens', 'b': randB(10, 100), 'c': 'A' }, 
						{ 'a': 'Fish', 'b': randB(10, 100), 'c': 'C' }, 
						{ 'a': 'Cow', 'b': randB(10, 100), 'c': 'A' }
					],
			solution_f: '=IF(NOT(a1="Cow"), "Water", "Farm")', 
			feedback: [
				{ 'has': 'values', args: ['Cow', 'Water', 'Farm'] },
				{ 'has': 'references', args: ['a1'] },
				{ 'has': 'functions', args: ['if', 'NOt']}
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `The <code>AND</code> function is extremely useful when combined with <code>IF</code>.
					As a reminder, this only returns <code>TRUE</code> if all of the values passed to it are <code>TRUE</code>.
					<br/><br/>
					So, if we write <code>=IF(AND(A1&gt50, B1&lt50), 'a', 'b')</code>, it will check to see if the
					values in <code>A1</code> and <code>B1</code> are over 50.  
					If so, then it will return 'a' (and otherwise 'b').`,
			instruction: 'Write a formula that will say "Bad" if sales in both regions are under 50, or "Ok" otherwise.',
			column_formats: [ '$', '$' ],
			column_titles: ['Sales NY', 'Sales TX' ],
			tests: [
						{ 'a': 0, 'b': 12 }, 
						{ 'a': 80, 'b': 80 }, 
						{ 'a': randB(10, 100), 'b': randB(80, 100) }, 
						{ 'a': randB(10, 100), 'b': randB(80, 100) }, 
						{ 'a': 61, 'b': 61 }, 
						{ 'a': randB(80, 100), 'b': 0 }, 
					],
			solution_f: '=IF(and(a1<50, b1<50), "bad", "ok")', 
			feedback: [
				{ 'has': 'values', args: [ 50 ] },
				{ 'has': 'references', args: ['a1', 'b1'] },
				{ 'has': 'functions', args: ['and', 'if'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `We can pass in an unlimited number of values to <code>AND</code>, as long as they are 
					each separated by a comma.`,
			instruction: 'Are sales in all regions over 10? If so, say "y", or otherwise "n"',
			column_formats: [ '$', '$', '$' ],
			column_titles: ['Sales NY', 'Sales TX', 'Sales CA' ],
			tests: [
						{ 'a': 0, 'b': randB(10, 100), 'c': randB(3, 40) }, 
						{ 'a': 20, 'b': 10, 'c': 23 }, 
						{ 'a': randB(10, 100), 'b': randB(80, 100), 'c': randB(3, 40) }, 
						{ 'a': randB(10, 100), 'b': randB(80, 100), 'c': randB(3, 40) }, 
						{ 'a': 61, 'b': 61, 'c': 58 }, 
						{ 'a': 0, 'b': 4, 'c': 1 }
					],
			solution_f: '=IF(and(a1>10, b1>10, c1>10), "Y", "N")', 
			feedback: [
				{ 'has': 'values', args: [10, 'y', 'n'] },
				{ 'has': 'references', args: ['a1', 'b1', 'c1'] },
				{ 'has': 'functions', args: ['if'] }
			],
			toolbox: [
				{ 'has': 'values', args: [10, 'y', 'n'] },
				{ 'has': 'references', args: ['a1', 'b1', 'c1'] },
				{ 'has': 'functions', args: ['and3', 'if'] },
				{ 'has': 'symbols', args: ['>'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `We can also use the <code>OR</code> function with <code>IF</code>.
					As a reminder, if <i>any</i> of the values passed to <code>OR</code> are <code>TRUE</code>, 
					then the entire function returns <code>TRUE</code>.
					<br/><br/>
					So, if we write <code>=IF(OR(A1&gt50, B1&gt50), "A", "B")</code>, it will check to see if
					either A1 or B1 are over 50.  As long as one of those is <code>TRUE</code>, the function then
					 will return <code>A</code>.  Otherwise, it will return <code>B</code>.`,
			instruction: 'Write a formula that will say "Good" if either region\'s sales are over 50 (or "Bad" otherwise)',
			column_formats: [ '$', '$' ],
			column_titles: ['Sales NY', 'Sales TX' ],
			tests: [
						{ 'a': randB(80, 100), 'b': randB(10, 100) }, 
						{ 'a': 80, 'b': 80 }, 
						{ 'a': randB(10, 100), 'b': randB(80, 40) }, 
						{ 'a': randB(10, 100), 'b': randB(8, 10) }, 
						{ 'a': 61, 'b': 61 }, 
						{ 'a': randB(80, 100), 'b': randB(80, 100) }, 
					],
			solution_f: '=IF(OR(a1>50, b1>50), "Good", "Bad")', 
			feedback: [
				{ 'has': 'values', args: [ 50 ] },
				{ 'has': 'references', args: ['a1', 'b1'] },
				{ 'has': 'functions', args: ['OR', 'IF'] }
			],
			code: 'tutorial'
		}
	]
}: GenType);



const if5_if_with_functions_test = ({
	gen_type: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `It's time to take on some problems.
					You must complete six problems before moving on.
					<br/><br/>
					Note that <i>some</i> of the problems will ask you to use <code>AND</code>, 
					<code>OR</code>, and <code>NOT</code>. You do not need to use these functions
					on every problem.
					<br/><br/>
					You do not have to use every column.`
		},
		({
			gen_type: UntilGen,
			until_total: 6,
			pages: [
				{	type: 'IfPageFormulaSchema',
					column_titles: ['Region', 'Bald Eagle Sales', 'Cats Sales', 'Profit' ],
					column_formats: [ '', ',', ',', '$' ],
					instruction: 'Input the correct formula',
					tests: [
								{ 'a': 'North', 'b': randB(0, 10), 'c': randB(50,70), 'd': 90000 }, 
								{ 'a': 'South', 'b': 5, 'c': 0, 'd': 1000 }, 
								{ 'a': 'East' , 'b': 21, 'c': 100, 'd': randB(1000,2000) }, 
								{ 'a': 'West', 'b': 0, 'c': randB(180, 200), 'd': 3000 },
								{ 'a': 'Other', 'b': 10, 'c': 10, 'd': 500}
							],
					code: 'test',
					toolbox: [
						{ has: 'references', args: [ 'b1', 'c1', 'd1']},
						{ has: 'symbols', args: [ 'comparison?'] },
						{ has: 'values', args: ['Y', 'N', 'number?'] }
					],
					versions: [

						{
							description: 'Say "Y" if we have at least 5 bald eagle sales <b>and</b> at least 50 cat sales.  Say "N" otherwise',
							solution_f: '=IF(AND(b1>5, c1>50), "Y", "N")',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor2', 'if'] } ]
						},
						{
							description: 'Say "Y" if we have at over 5 Bald Eagles <b>or</b> over 50 cats sold.  Say "N" otherwise',
							solution_f: '=IF(OR(b1>5, c1>50), "Y", "N")',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor2', 'if'] } ]
						},
						{
							description: 'Do we have either less than 10 bald eagle or 50 cat sales? If so, say "Y", or otherwise say "N"',
							solution_f: '=IF(OR(c1<50, b1<10), "Y", "N")',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor2', 'if'] } ]
						},
						{
							description: 'Do we have both 50 bald eagles and cats <i>each</i>? If so, return "Y", or otherwise "N"',
							solution_f: '=IF(AND(c1>50, b1>50), "Y", "N")',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor2', 'if'] } ]
						},
						{
							description: 'Do <i>either</i> of bald eagles or cats have less than 50 sales? If so, return "Y", or otherwise "N"',
							solution_f: '=IF(OR(c1<50, b1<50), "Y", "N")',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor2', 'if'] } ]
						},
						{
							description: 'Do all animals <i>each</i> number at least 20? If so, return "Y" (or "N" otherwise)',
							solution_f: '=IF(AND(b1>=20, c1>=20), "Y", "N")',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor2', 'if'] } ]
						},
						{
							description: 'Does <i>any one</i> of the animals have sales of 10 or under? If so, return "Y" (or "N" otherwise)',
							solution_f: '=IF(OR(b1<10, c1<10), "Y", "N")',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor2', 'if'] } ]
						},
						{
							description: 'Did we sell under 10 bald eagles, but still earn over 500 profit?  Say "Y" or "N"',
							solution_f: '=IF(AND(b1<10, d1>500), "Y", "N")',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor2', 'if'] } ]
						},					
						{
							description: 'Do we have more bald eagle sales than cat sales?  Say "Y" if so, or "N" otherwise.',
							solution_f: '=IF(b1>c1, "Y", "N")',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor2', 'if'] } ]
						},
						{
							description: 'Do we <b>not</b> have equal cat and bald eagle sales?  Say "Y" or "N"',
							solution_f: '=IF(NOT(b1=c1), "Y", "N")',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['not', 'if'] } ]
						},
						{
							description: 'Are bald eagle sales between 5 and 10 (inclusive)? Say "Y" or "N"',
							solution_f: '=IF(AND(B1>=5, B1<=10), "Y", "N")',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor2', 'if'] } ]
						},
						{
							description: 'Are bald eagle sales between 5 and 10 (exclusive)? Say "Y" or "N"',
							solution_f: '=IF(AND(B1>5, B1<10), "Y", "N")',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor2', 'if'] } ]
						},
						{
							description: 'Are cat sales between 50 and 100 (inclusive)? Say "Y" or "N"',
							solution_f: '=IF(AND(c1>=50, c1<=100), "Y", "N")',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor2', 'if'] } ]
						},
						{
							description: 'Are cat sales between 50 and 100 (exclusive)? Say "Y" or "N"',
							solution_f: '=IF(AND(c1>50, c1<100), "Y", "N")',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor2', 'if'] } ]
						},				
						{
							description: 'Are profits between 1,000 and 3,000 (inclusive)? Say "Y" or "N"',
							solution_f: '=IF(AND(d1>=1000, d1<=3000), "Y", "N")',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor2', 'if'] } ]
						},
						{
							description: 'Are profits between 1,000 and 3,000 (exclusive)? Say "Y" or "N"',
							solution_f: '=IF(AND(d1>1000, d1<3000), "Y", "N")',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor2', 'if'] } ]
						},				
						{
							description: 'Are profits outside of the range 1,000 and 3,000 (do not include 1000 and 3000)? Say "Y" or "N"',
							solution_f: '=IF(OR(d1<1000, d1>3000), "Y", "N")',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor2', 'if'] } ]
						},
						{
							description: 'Are profits outside of the range 1,000 and 3,000 (include 1000 and 3000)? Say "Y" or "N"',
							solution_f: '=IF(OR(d1<=1000, d1>=3000), "Y", "N")',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor2', 'if'] } ]
						}
					]
				}
			]
		}: GenType)
	]
}: GenType);


const if5 = ({
	code: 'if5',
	title: 'IF5: Logical functions and IF',
	description: 'Use AND, OR, & NOT inside of IF',
	harsons_randomly_on_username: true,
	version: 1,

	gen: ({
		gen_type: LinearGen,
		pages: [
			if5_if_with_functions_tutorial,
			if5_if_with_functions_test,
			...finish_questions
		]
	}: GenType)

}: LevelSchemaFactoryType);



module.exports = { if5 };