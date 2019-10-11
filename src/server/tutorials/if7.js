// @flow
const { DataFactory } = require('./../DataFactory');
const { LinearGen, UntilGen } = require('./../Gens');
const { finish_questions } = require('./../pages/finish_questions');

const { IfPageFormulaSchema } = require( './../../shared/IfPageSchemas');

const randB = DataFactory.randB;

import type { GenType } from './../Gens';
import type { LevelSchemaFactoryType } from './../IfLevelSchemaFactory';


const if7_boolean_tutorial = ({
	gen_type: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `As we use these functions, you can sometimes run into trouble with 
					the difference	between <code>TRUE</code> and <code>"TRUE"</code> (true wrapped in quotes).  
					<br/><br/>
					<code>TRUE</code>is a special type called a <b>boolean</b>.  A boolean can only be <code>TRUE</code> or <code>FALSE</code>.
					This is different from <code>"TRUE"</code>, which has quotes around it turning it into 
					a word (also called text, or a string).
					<br/><br/>
					The quotes matter, because <code>TRUE</code> doesn't always equal <code>"TRUE"</code>.
					Even though they look the same, they are actually two different values.
					<br/><br/>
					All of our tests (like <code>=</code> or <code><=</code>) return a boolean, and not <code>"TRUE"</code>.`
		},
		{	type: 'IfPageFormulaSchema',
			description: `You sometimes see booleans in tables.
					<br/><br/>
					For example, the table below has a list of pigs.  
					The <b>Had Kids</b> and <b>Meat Pig</b> columns have boolean values 
					(<code>TRUE</code> or <code>FALSE</code>).  
					<br/><br/>
					If you want to find pigs with kids,
					write <code>=B1=TRUE</code>.  Do not write <code>=B1="TRUE"</code>!`,
			instruction: 'Write a formula that returns TRUE for pigs <b>with</b> kids.',
			column_titles: ['Pig Name', 'Had Kids', 'Meat Pig' ],
			tests: [
						{ 'a': 'Anna', b: false, c: true }, 
						{ 'a': 'Bernice', b: false, c: false }, 
						{ 'a': 'Charlie', b: true, c: false }, 
						{ 'a': 'Dennis', b: true, c: true }
					],
			solution_f: '=b1=true',
			feedback: [
				{ 'has': 'references', args: ['b1'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `You can also test if a field is <code>FALSE</code>.
						For example, writing <code>=B1=FALSE</code> would test to see if a pig has <i>no</i> kids.
						<br/><br/>
						Do not write write "FALSE" with quotes!`,
			instruction: 'Return TRUE for pigs without kids.',
			column_titles: ['Pig Name', 'Had Kids', 'Meat Pig' ],
			tests: [
						{ 'a': 'Anna', b: false, c: true }, 
						{ 'a': 'Bernice', b: false, c: false }, 
						{ 'a': 'Charlie', b: true, c: false }, 
						{ 'a': 'Dennis', b: true, c: true }
					],
			solution_f: '=b1=false',
			feedback: [
				{ 'has': 'references', args: ['b1'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `When you have a boolean column, you can see if it is <code>TRUE</code>
					by writing <code>=A1=TRUE</code>.  But, it's simpler to just write <code>=A1</code>.
					<br/><br/>
					So, writing <code>=IF(B1, 1, 0)</code> has the same result as
					<code>=IF(B1=TRUE, 1, 0)</code>`,
			instruction: 'Write an IF statement that shows 1 for meat pigs, or 0 otherwise.',
			helpblock: 'Use C1 as the condition instead of C1=TRUE',
			column_titles: ['Pig Name', 'Had Kids', 'Meat Pig' ],
			tests: [
						{ 'a': 'Anna', b: false, c: true }, 
						{ 'a': 'Bernice', b: false, c: false }, 
						{ 'a': 'Charlie', b: true, c: false }, 
						{ 'a': 'Dennis', b: true, c: true }
					],
			solution_f: '=if(c1, 1, 0)',
			feedback: [
				{ 'has': 'functions', args: ['if'] },
				{ 'has': 'references', args: ['c1'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `You can do the same simple comparisons with <code>FALSE</code> values.
					Instead of writing <code>=A1=FALSE</code>, you can write <code>=NOT(A1)</code>.
					`,
			instruction: 'Write an IF statement using NOT that shows 1 for pigs <b>without</b> kids, or 0 otherwise.',
			helpblock: 'Use NOT(B1) as the condition instead of NOT(B1=FALSE)',
			column_titles: ['Pig Name', 'Had Kids', 'Meat Pig' ],
			tests: [
						{ 'a': 'Anna', b: false, c: true }, 
						{ 'a': 'Bernice', b: false, c: false }, 
						{ 'a': 'Charlie', b: true, c: false }, 
						{ 'a': 'Dennis', b: true, c: true }
					],
			solution_f: '=if(NOT(b1), 1, 0)',
			feedback: [
				{ 'has': 'functions', args: ['not', 'if'] },
				{ 'has': 'references', args: ['b1'] }
			],
			code: 'tutorial'
		}
	]
}: GenType);



const if7_boolean_test = ({
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
					column_titles: ['Apartment Letter', 'Has Bird', 'Has Cats', 'Has Dogs' ],
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
							description: 'Say "Birds" for apartments with a bird, Otherwise, say "None"',
							solution_f: '=if(b1, "Birds", "None")',
						},
						{
							description: 'Say "Dogs" for apartments with a dog, Otherwise, say "None"',
							solution_f: '=if(d1, "Dogs", "None")',
						},
						{
							description: 'Say "Cats" for apartments with a cat, Otherwise, say "None"',
							solution_f: '=if(c1, "Cats", "None")',
						},
						{
							description: 'Return the apartment letter for apartments with no dogs, or "Hair" otherwise.',
							solution_f: '=if(not(d1), a1, "Hair")',
						},
						{
							description: 'If an appartment has no cats, then return "Yes".  Otherwise, return "No"',
							solution_f: '=if(not(c1), "Yes", "No")',
						},
						{
							description: 'If an appartment has no birds, then return "Yes".  Otherwise, return "No"',
							solution_f: '=if(not(b1), "Yes", "No")',
						}
					]
				}
			]
		}: GenType)
	]
}: GenType);





const if7 = ({
	code: 'if7',
	title: 'IF7: Booleans',
	description: 'Figure out TRUE and FALSE',
	harsons_randomly_on_username: false,
	version: 1,

	gen: ({
		gen_type: LinearGen,
		pages: [
			if7_boolean_tutorial,
			if7_boolean_test,
			...finish_questions
		]
	}: GenType)
}: LevelSchemaFactoryType);




module.exports = {  if7 };
