// @flow
const { DataFactory } = require('./../DataFactory');
const { LinearGen, UntilGen } = require('./../Gens');
const { finish_questions } = require('./../pages/finish_questions');

const { IfPageFormulaSchema } = require( './../../shared/IfPageSchemas');

const randB = DataFactory.randB;

import type { GenType } from './../Gens';
import type { LevelSchemaFactoryType } from './../IfLevelSchemaFactory';



const if6_if_with_math_tutorial = ({
	gen_type: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `A common approach with <code>IF</code> is to embed simple math expressions inside of the test or results. 
					<br/><br/>
					While you can always split formulas into multiple columns, embedding simple math expressions can keep related logic together.`
		},
		{	type: 'IfPageFormulaSchema',
			description: `The first place to embed simple math expressions is in the logical test.
					<br/><br/>
					For example, if we are trying to find find apartments that have at least 1 pet, 
					we would write <code>=IF(B1+C1+D1>0, "Pets", "None")</code>.`,
			instruction: 'Write the formula above below.',
			column_titles: ['Apartment', 'Birds', 'Cats', 'Dogs' ],
			tests: [
						{ 'a': 'A', b: 0, c: 0, d: 0 }, 
						{ 'a': 'B', b: 2, c: 0, d: 1 }, 
						{ 'a': 'C', b: 1, c: 1, d: 1 }, 
						{ 'a': 'D', b: 0, c: 0, d: 0 }, 
						{ 'a': 'E', b: 0, c: 2, d: 0 }, 
						{ 'a': 'F', b: 2, c: 2, d: 2 }, 
					],
			solution_f: '=IF(B1+C1+D1>0, "Pets", "None")',
			feedback: [
				{ 'has': 'references', args: ['b1', 'C1', 'D1'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: 'Why don\'t you try this now?',
			instruction: 'Write a function that says "Ok" for apartments with more than 2 cats & dogs (combined), or "NA" otherwise.',
			column_titles: ['Apartment', 'Birds', 'Cats', 'Dogs' ],
			tests: [
						{ 'a': 'A', b: 0, c: 0, d: 0 }, 
						{ 'a': 'B', b: 2, c: 0, d: 1 }, 
						{ 'a': 'C', b: 1, c: 1, d: 1 }, 
						{ 'a': 'D', b: 0, c: 0, d: 0 }, 
						{ 'a': 'E', b: 0, c: 2, d: 0 }, 
						{ 'a': 'F', b: 2, c: 2, d: 2 }, 
					],
			solution_f: '=if(c1+d1>2, "Ok", "NA")',
			feedback: [
				{ 'has': 'references', args: ['d1', 'c1'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `We can also do math in the return values.
					<br/><br/>
					For example, let's say we were trying to calculate the pet fee for a set of apartments.
					We want to charge owners with over 1 dog an extra $10 multiplied by the number of dogs.
					We would write <code>=IF(D1>1, D1*20, 0)</code>.`,
			instruction: 'Write the a formula that charges owners with over 2 cats 10*the number of cats (and 0 otherwise)',
			column_titles: ['Apartment', 'Birds', 'Cats', 'Dogs' ],
			tests: [
						{ 'a': 'A', b: 0, c: 0, d: 0 }, 
						{ 'a': 'B', b: 2, c: 0, d: 3 }, 
						{ 'a': 'C', b: 1, c: 3, d: 1 }, 
						{ 'a': 'D', b: 0, c: 0, d: 0 }, 
						{ 'a': 'E', b: 0, c: 5, d: 0 }, 
						{ 'a': 'F', b: 2, c: 1, d: 2 }, 
					],
			solution_f: '=IF(C1>1, C1*10, 0)',
			feedback: [
				{ 'has': 'references', args: ['C1'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `These techniques can also be combined together in a single <code>IF</code> function.
					<br/><br/>
					For example, we may want charge owners with over 4 cats and dogs, the number of cats & dogs, or zero otherwise.
					This function would do that: <code>=IF(C1+D1>4, C1+D1, 0)</code>.`,
			instruction: 'Write the a formula that charges owners with over 4 animals the number of animals (and 0 otherwise)',
			column_titles: ['Apartment', 'Birds', 'Cats', 'Dogs' ],
			tests: [
						{ 'a': 'A', b: 0, c: 0, d: 0 }, 
						{ 'a': 'B', b: 2, c: 0, d: 3 }, 
						{ 'a': 'C', b: 1, c: 3, d: 1 }, 
						{ 'a': 'D', b: 0, c: 0, d: 0 }, 
						{ 'a': 'E', b: 0, c: 5, d: 0 }, 
						{ 'a': 'F', b: 2, c: 1, d: 2 }, 
					],
			solution_f: '=IF(d1+B1+C1>4, d1+B1+C1, 0)',
			feedback: [
				{ 'has': 'references', args: ['d1', 'B1', 'C1'] }
			],
			code: 'tutorial'
		}
	]
}: GenType);



const if6_if_with_math_test = ({
	gen_type: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `It's time to take on some problems.
					You must complete six problems before moving on.
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
					versions: [
						{
							description: 'Say "Yes" if we have over 55 animal sales. Say "No" otherwise',
							solution_f: '=IF(b1+c1>55, "Yes", "No")',
						},
						{
							description: 'Say "Yes" if we have under 100 animal sales in total. Say "No" otherwise',
							solution_f: '=IF(b1+c1<100, "Yes", "No")',
						},
						{
							description: 'Are profits over 500?  If so, give the sum of the animals.  If not, say "Need to improve"',
							solution_f: '=IF(d1>500, B1+C1, "Need to improve")',
						},					
						{
							description: 'Are the combined animal sales over 50?  If so, give the profit.  If not, say "Need to improve"',
							solution_f: '=IF(B1+C1>50, d1, "Need to improve")',
						},										
						{
							description: 'If we are in the North region, calculate a quarter (1/4) of profit. Otherwise, it should give 1/8 (an eighth).',
							solution_f: '=IF(a1="North", d1/4, d1/8)',
						},
						{
							description: 'If we are in the South region, return half of of our profit. Otherwise, return 0',
							solution_f: '=IF(a1="South", d1/2, 0)',
						},
						{
							description: 'If we are in the East region, give the number of animals. Otherwise, give the number of cats divided by 2.',
							solution_f: '=IF(a1="East", b1+c1, c1/2)',
						},
						{
							description: 'If our profit is over 1000, return half of profit. Otherwise, return profit doubled',
							solution_f: '=IF(d1>1000, d1/2, d1*2)',
						}						
					]
				}
			]
		}: GenType)
	]
}: GenType);




const if6 = ({
	code: 'if6',
	title: 'IF6: IF and Math',
	description: 'Embed math inside of IF',
	harsons_randomly_on_username: false,
	version: 1,

	gen: ({
		gen_type: LinearGen,
		pages: [
			if6_if_with_math_tutorial,
			if6_if_with_math_test,
			...finish_questions
		]
	}: GenType)
}: LevelSchemaFactoryType);




module.exports = { if6 };