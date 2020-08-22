// @flow
const { DataFactory } = require('./../DataFactory');
const { LinearGen, UntilGen } = require('./../Gens');
const { finish_questions } = require('./../pages/finish_questions');

const { IfPageFormulaSchema } = require( './../../shared/IfPageSchemas');

const randB = DataFactory.randB;

import type { GenType } from './../Gens';
import type { LevelSchemaFactoryType } from './../IfLevelSchemaFactory';

/*

	Dealing with ORs and NOTs inside
	Having a comma in a number
	Return $ or with commas
	Text as number
	
*/

const if8_boolean_if_tutorial = ({
	gen_type: LinearGen,
	pages: [
		{	type: 'IfPageFormulaSchema',
			description: `Booleans can also be combined with our other functions, 
					such as <code>AND</code> and <code>OR</code>.
					<br/><br/>
					So, you could write <code>=AND(b1, c1, d1)</code> to find 
					all young meat pigs with kids.
					`,
			instruction: 'Use <code>AND</code> to test for pigs that have kids and are young.',
			helpblock: 'You don\'t need to use an <code>if</code> statement',
			column_titles: ['Pig Name', 'Had Kids', 'Meat Pig', 'Young Pig' ],
			tests: [
						{ 'a': 'Anna', b: false, c: false, d: false }, 
						{ 'a': 'Bernice', b: false, c: false, d: true }, 
						{ 'a': 'Charlie', b: true, c: false, d: false }, 
						{ 'a': 'Dennis', b: true, c: true, d: true }
					],
			solution_f: '=AND(b1, d1)',
			feedback: [
				{ 'has': 'functions', args: ['AND'] },
				{ 'has': 'references', args: ['d1', 'b1'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: 'Try to use an <code>OR</code> function now!',
			instruction: 'Use <code>OR</code> to show <code>TRUE</code> for meat pigs <b>or</b> those with kids.',
			helpblock: 'You don\'t need to use an <code>if</code> statement',
			column_titles: ['Pig Name', 'Had Kids', 'Meat Pig' ],
			tests: [
						{ 'a': 'Anna', b: false, c: true }, 
						{ 'a': 'Bernice', b: false, c: false }, 
						{ 'a': 'Charlie', b: true, c: false }, 
						{ 'a': 'Dennis', b: true, c: true }
					],
			solution_f: '=OR(b1, c1)',
			feedback: [
				{ 'has': 'functions', args: ['OR'] },
				{ 'has': 'references', args: ['c1', 'b1'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `We can create more complex boolean comparisons by using <code>NOT</code> inside of a 
					<code>AND</code>.
					<br/><br/>
					For example, the function <code>=AND(A1, NOT(B1))</code> will test to see if <code>A1</code>
					is <code>TRUE</code> and <code>B1</code> is <code>FALSE</code>.`,
			instruction: 'Use <code>OR</code> and <code>NOT</code> to test for meat pigs <i>or</i> for those <b>without</b> kids.',
			helpblock: 'You don\'t need to use an <code>if</code> statement',
			column_titles: ['Pig Name', 'Had Kids', 'Meat Pig' ],
			tests: [
						{ 'a': 'Anna', b: false, c: true }, 
						{ 'a': 'Bernice', b: false, c: false }, 
						{ 'a': 'Charlie', b: true, c: false }, 
						{ 'a': 'Dennis', b: true, c: true }
					],
			solution_f: '=OR(NOT(B1), c1)',
			feedback: [
				{ 'has': 'functions', args: ['OR', 'NOT'] },
				{ 'has': 'references', args: ['c1', 'b1'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: 'Try using the <code>NOT</code> function inside of an <code>IF</code> function.',
			instruction: 'Say "good" for pigs without kids, or "bad" otherwise.',
			column_titles: ['Pig Name', 'Had Kids', 'Meat Pig' ],
			tests: [
						{ 'a': 'Anna', b: false, c: true }, 
						{ 'a': 'Bernice', b: false, c: false }, 
						{ 'a': 'Charlie', b: true, c: false }, 
						{ 'a': 'Dennis', b: true, c: true }
					],
			solution_f: '=if(not(b1), "good", "bad")',
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: 'Try another example.',
			instruction: 'Say "good" for meat pigs with kids, or "bad" otherwise.',
			column_titles: ['Pig Name', 'Had Kids', 'Meat Pig' ],
			tests: [
						{ 'a': 'Anna', b: false, c: true }, 
						{ 'a': 'Bernice', b: false, c: false }, 
						{ 'a': 'Charlie', b: true, c: false }, 
						{ 'a': 'Dennis', b: true, c: true }
					],
			solution_f: '=if(and(b1, c1), "good", "bad")',
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: 'Keep going!',
			instruction: 'Return 1 if the pig has kids <b>or</b> they are a meat pig.  Return 0 otherwise.',
			column_titles: ['Pig Name', 'Had Kids', 'Meat Pig' ],
			tests: [
						{ 'a': 'Anna', b: false, c: true }, 
						{ 'a': 'Bernice', b: false, c: false }, 
						{ 'a': 'Charlie', b: true, c: false }, 
						{ 'a': 'Dennis', b: true, c: true }
					],
			solution_f: '=if(OR(b1, c1), 1, 0)',
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: 'Keep going!',
			instruction: 'Return the name of the pig if they have a kid, or "NA" otherwise.',
			column_titles: ['Pig Name', 'Had Kids', 'Meat Pig' ],
			tests: [
						{ 'a': 'Anna', b: false, c: true }, 
						{ 'a': 'Bernice', b: false, c: false }, 
						{ 'a': 'Charlie', b: true, c: false }, 
						{ 'a': 'Dennis', b: true, c: true }
					],
			solution_f: '=if(b1, a1, "NA")',
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: 'Keep going!',
			instruction: 'Return 1 if the pig has <i>no</i> kids <b>or</b> they are <i>not</i> a meat pig.  Return 0 otherwise.',
			column_titles: ['Pig Name', 'Had Kids', 'Meat Pig' ],
			tests: [
						{ 'a': 'Anna', b: false, c: true }, 
						{ 'a': 'Bernice', b: false, c: false }, 
						{ 'a': 'Charlie', b: true, c: false }, 
						{ 'a': 'Dennis', b: true, c: true }
					],
			solution_f: '=if(OR(not(b1), not(c1)), 1, 0)',
			code: 'tutorial'
		}

	]
}: GenType);



const if8_boolean_if_test = ({
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
					column_titles: ['Apartment', 'Has Bird', 'Has Cats', 'Has Dogs' ],
					instruction: 'Input the correct formula',
					tests: [
								{ 'a': 'A', 'b': false, 'c': false, 'd': false }, 
								{ 'a': 'B', 'b': true, 'c': true, 'd': true }, 
								{ 'a': 'C', 'b': false, 'c': false, 'd': true }, 
								{ 'a': 'D', 'b': false, 'c': true, 'd': true }, 
								{ 'a': 'E', 'b': true, 'c': true, 'd': false }, 
								{ 'a': 'F', 'b': true, 'c': false, 'd': false }, 
							],
					code: 'test',
					versions: [
						{
							description: 'Say "Pets" for apartments with birds, <i>or</i> cats, <i>or</i> dogs.  Otherwise, say "None"',
							solution_f: '=IF(OR(b1, c1, d1), "Pets", "None")',
						},
						{
							description: 'Say "Wow" for apartments that have birds, <i>and</i> cats, <i>and</i> dogs.  Otherwise, say "Ok"',
							solution_f: '=IF(AND(b1, c1, d1), "Wow", "Ok")',
						},
						{
							description: 'Say "4 legs" if we have both cats and dogs. Say "No" otherwise',
							solution_f: '=IF(and(c1, d1), "4 legs", "No")',
						},
						{
							description: 'Say "Birds ok" if we have no cats and no dogs. Say "Other" otherwise',
							solution_f: '=IF(and(c1=false, d1=false), "Birds Ok", "Other")',
						},
						{
							description: 'If we have both birds and cats, say "Scary".  Otherwise say "Ok"',
							solution_f: '=IF(and(b1, c1), "Scary", "Ok")',
						},
						{
							description: 'If we have no dogs and no cats, say "Quiet".  Otherwise say "Loud"',
							solution_f: '=IF(and(d1=false, c1=false), "Quiet", "Loud")',
						},
						{
							description: 'If we have no cats and no dogs, say "bird friendly".  Otherwise say "Other"',
							solution_f: '=IF(and(c1=false, d1=false), "bird friendly", "Other")',
						},
						{
							description: 'If we have both dogs and cats, say "Pets".  Otherwise say "Other"',
							solution_f: '=IF(and(d1, c1), "Pets", "Other")',
						}
					]
				}
			]
		}: GenType)
	]
}: GenType);




const if8 = ({
	code: 'if8',
	title: 'IF8: Booleans with AND/OR',
	description: 'Use booleans with the AND & OR functions',

	harsons_randomly_on_username: false,
	predict_randomly_on_username: true,
	
	version: 1,

	gen: ({
		gen_type: LinearGen,
		pages: [
//			if8_boolean_if_tutorial,
//			if8_boolean_if_test,
			...finish_questions
		]
	}: GenType)
    
}: LevelSchemaFactoryType);


module.exports = {  if8 };
