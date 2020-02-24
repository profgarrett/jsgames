// @flow
const { DataFactory } = require('./../DataFactory');
const { LinearGen, UntilGen } = require('./../Gens');
const { finish_questions } = require('./../pages/finish_questions');

const { IfPageFormulaSchema } = require( './../../shared/IfPageSchemas');

import type { GenType } from './../Gens';
import type { LevelSchemaFactoryType } from './../IfLevelSchemaFactory';



const if3_if_tutorial = ({
	gen_type: LinearGen,
	pages: [
		{	type: 'IfPageFormulaSchema',
			description: `Now that you know how to compare words and numbers, it's time  
					build some simple formulas with the <code>IF</code> function.
					<br/><br/>
					As you saw earlier, the <code>IF</code> function has three parts. Here is an example: 
						<code>=IF(A1="south", "good", "bad")</code>
					<ul>
						<li><code>A1="south"</code> is the comparison (or test)</li>
						<li><code>"good"</code> is returned if the test is <code>TRUE</code>.</li>
						<li><code>"bad"</code> is returned if the test is <code>FALSE</code>.</li>
					<ul>
					<br/><br/>
					Your test should return either 
					<code>TRUE</code> or <code>FALSE</code>, and not <code>"True"</code> or 
					<code>"False"</code>.  Wrapping TRUE with <code>"</code> symbol 
					will lead to some strange results.`,
			instruction: 'Write the formula from above. ',
			column_titles: ['Region' ],
			tests: [
						{ 'a': 'South' },
						{ 'a': 'North' },
						{ 'a': 'East' },
						{ 'a': 'West' }
					],
			solution_f: '=if(a1="south", "good", "bad")',
			helpblock: '=IF(A1="south", "good", "bad")',
			feedback: [
				{ 'has': 'references', args: ['a1'] },
				{ 'has': 'functions', args: ['if'] },
				{ 'has': 'symbols', args: ['=']}
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `Let's do a another example that compares numbers.
					<br/><br/>
					The formula <code>=IF(B1=10, "good", "bad")</code> tests if to see if <code>B1</code>
					has the value of 10.
					If the result is <code>TRUE</code>, it returns <code>"good"</code>
					(or if not, it returns <code>"bad"</code>).`,
			instruction: 'Write the formula given above in the table below.',
			column_titles: ['Region', 'Sales' ],
			tests: [
						{ 'a': 'South', 'b': 10 },
						{ 'a': 'North', 'b': 5 },
						{ 'a': 'East', 'b': 23 },
						{ 'a': 'West', 'b': 10 }
					],
			solution_f: '=if(b1=10, "good", "bad")', 
			feedback: [
				{ 'has': 'references', args: ['b1'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `Beyond testing for <code>=</code>, we can also try other options as well.
					<br/><br/>
					The formula <code>=IF(B1>=10, 10, 20)</code> looks at <code>B1</code>
					to see if it is 10 or over.  If so, <code>IF</code> returns <code>10</code>, 
					or if not, it returns <code>20</code>`,
			instruction: 'Write the formula given above in the table below.',
			column_titles: ['Region', 'Sales' ],
			tests: [
						{ 'a': 'South', 'b': 10 },
						{ 'a': 'North', 'b': 5 },
						{ 'a': 'East', 'b': 23 },
						{ 'a': 'West', 'b': 10 }
					],
			solution_f: '=if(b1>=10, 10, 20)', 
			feedback: [
				{ 'has': 'references', args: ['b1'] },
				{ 'has': 'symbols', args: ['>=']}
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `Try some on your own!
					<br/><br/>
					You can use all of the same comparisons from the previous section, such as 
					<code>=</code>, <code>&gt</code>, <code>&lt</code>, 
					<code>&gt=</code>, and <code>&lt=</code>`,
			instruction: 'If a region has less than 15 sales say "good", or "bad" otherwise.',
			column_titles: ['Region', 'Sales' ],
			tests: [
						{ 'a': 'South', 'b': 10 },
						{ 'a': 'North', 'b': 15 },
						{ 'a': 'East', 'b': 23 },
						{ 'a': 'West', 'b': 10 }
					],
			solution_f: '=if(b1<15, "good", "bad")', 
			feedback: [
				{ 'has': 'references', args: ['b1'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `Good job!  
					<br/><br/>
					Try another problem.`,
			instruction: 'The North region should say "high" and all others should say "low".',
			column_titles: ['Region', 'Sales', 'Rating' ],
			tests: [
						{ 'a': 'South', 'b': 10, c: 'A' },
						{ 'a': 'North', 'b': 15, c: 'B' },
						{ 'a': 'East', 'b': 23, c: 'A'},
						{ 'a': 'West', 'b': 10, c: 'C'},
					],
			solution_f: '=if(a1="North", "high", "low")', 
			feedback: [
				{ 'has': 'references', args: ['a1'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: 'Keep going!',
			instruction: 'Return "good" for regions with a rating of B or A (and "bad" otherwise).',
			column_titles: ['Region', 'Sales', 'Rating' ],
			tests: [
						{ 'a': 'South', 'b': 10, c: 'A' },
						{ 'a': 'North', 'b': 15, c: 'B' },
						{ 'a': 'East', 'b': 23, c: 'A'},
						{ 'a': 'West', 'b': 10, c: 'C'},
					],
			solution_f: '=if(c1<"C", "good", "bad")', 
			feedback: [
				{ 'has': 'references', args: ['c1'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: 'This problem requires you to return numbers instead of text.',
			instruction: 'Regions with a rating of "A" should return 200; others should have 100.',
			column_titles: ['Region', 'Sales', 'Rating' ],
			tests: [
						{ 'a': 'South', 'b': 10, c: 'A' },
						{ 'a': 'North', 'b': 15, c: 'B' },
						{ 'a': 'East', 'b': 23, c: 'A'},
						{ 'a': 'West', 'b': 10, c: 'C'},
					],
			solution_f: '=if(c1="A", 200, 100)', 
			feedback: [
				{ 'has': 'references', args: ['c1'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `The values returned by <code>IF</code>can be different types.  
				For example,
				you can return "A" for "North" regions, or 123 for all others.`,
			instruction: 'Have the "North" region return "A", and all others 123',
			column_titles: ['Region', 'Sales', 'Rating' ],
			tests: [
						{ 'a': 'South', 'b': 10, c: 'A' },
						{ 'a': 'North', 'b': 15, c: 'B' },
						{ 'a': 'East', 'b': 23, c: 'A'},
						{ 'a': 'West', 'b': 10, c: 'C'},
					],
			solution_f: '=if(a1="North", "A", 123)', 
			feedback: [
				{ 'has': 'references', args: ['a1'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: 'We can also use references in part of our return values.',
			instruction: '"A" Regions should return their sales; others should return 0.',
			column_titles: ['Region', 'Sales', 'Rating' ],
			tests: [
						{ 'a': 'South', 'b': 10, c: 'A' },
						{ 'a': 'North', 'b': 15, c: 'B' },
						{ 'a': 'East', 'b': 23, c: 'A'},
						{ 'a': 'West', 'b': 10, c: 'C'},
					],
			solution_f: '=if(c1="A", b1, 0)', 
			feedback: [
				{ 'has': 'values', args: [0] },
				{ 'has': 'references', args: ['c1', 'b1'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `Return values can be the result of a calculation. 
				<br/><br/>
				For example, <code>=IF(A1="South",B1*2, B1)</code> will return the sales
				column multiplied by 2 for the South region, while all other regions will just
				have their sales returned.`,
			instruction: 'Have "North" region return sales multiplied by 3, and all others sales multiplied by 2',
			column_titles: ['Region', 'Sales', 'Rating' ],
			tests: [
						{ 'a': 'South', 'b': 10, c: 'A' },
						{ 'a': 'North', 'b': 15, c: 'B' },
						{ 'a': 'East', 'b': 23, c: 'A'},
						{ 'a': 'West', 'b': 10, c: 'C'},
					],
			solution_f: '=if(a1="North", b1*3, b1*2)', 
			feedback: [
				{ 'has': 'references', args: ['a1', 'b1'] },
				{ 'has': 'values', args: ['north']},
				{ 'has': 'symbols', args: ['*']}
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `You can even return the result of a function. 
				Any formula that be in a cell could be used as part of an <code>IF</code> function.
				These can even include embedding other functions.
				<br/><br/>
				For example, <code>=IF(C1="C", Round(c1,0), "Ok")</code> uses the <code>Round()</code> function to
				round down C1 to the nearest integer.  Otherwise
				it returns "Ok".`,
			instruction: 'Have the North region return "expired", while all others should use <code>Round()</code> to round down the sales.',
			column_titles: ['Region', 'Sales', 'Rating' ],
			column_formats: [ '', '.',''],
			client_f_format: 'date',
			tests: [
						{ 'a': 'South', 'b': 10.30, c: 'A' },
						{ 'a': 'North', 'b': 15.44, c: 'B' },
						{ 'a': 'East', 'b': 23.1, c: 'A'},
						{ 'a': 'West', 'b': 10.9, c: 'C'},
					],
			solution_f: '=if(a1="North", "expired", Round(b1,0))', 
			feedback: [
				{ 'has': 'references', args: ['a1'] },
				{ 'has': 'functions', args: ['if', 'round'] },
				{ 'has': 'values', args: ['north', 'expired'] }
			],
			code: 'tutorial'
		}
	]
}: GenType);


const if3_if_test = ({
	gen_type: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `It's time to take on some problems using the IF function.
					You will be given six problems to solve.
					<br/><br/>
					The questions will require you to carefully read the problem, and use
					the correct comparisons. You do not have to use every column.`
		},
		({
			gen_type: UntilGen,
			until_total: 6,
			pages: [
				{	type: 'IfPageFormulaSchema',
					instruction: 'Input the correct formula',
					column_titles: ['Pig Breed', 'Weight', 'Rating' ],
					tests: [
								{ 'a': 'Spotted', 'b': 100, c: 'B' }, 
								{ 'a': 'Spotted', 'b': 200, c: 'A' }, 
								{ 'a': 'Yorkshire', 'b': 340, c: 'A' }, 
								{ 'a': 'Spotted', 'b': 30, c: 'A' }, 
								{ 'a': 'Spotted', 'b': 230, c: 'B' }, 
								{ 'a': 'Poland China', 'b': 100, c: 'A' }, 
								{ 'a': 'Spotted', 'b': 32, c: 'C' }, 
								{ 'a': 'Poland China', 'b': 0, c: 'B' }, 
								{ 'a': 'Yorkshire', 'b': 234, c: 'C' }, 
							],
					code: 'test',
					toolbox: [
						{ has: 'functions', args: ['if'] },
						{ has: 'symbols', args: ['comparison?', 'arithmetic?'] },
						{ has: 'references', args: ['a1', 'b1', 'c1'] },
						{ has: 'values', args: ['string?', 'number?'] },
					],
					versions: [
						{
							description: 'Spotted pigs should return their weight; other pigs should return 0.',
							solution_f: '=if(a1="Spotted", b1,0)',
						},
						{
							description: 'Return "Good" for Yorkshire pigs, or "sell" for other pigs',
							solution_f: '=if(a1="Yorkshire", "Good", "Sell")',
						},
						{
							description: '"A" pigs should return their rating; other pigs should return "X".',
							solution_f: '=if(c1="A", c1, "X")',
						},
						{
							description: 'Return "A" for Spotted pigs, or "X" for other pigs',
							solution_f: '=if(a1="Spotted", "A", "X")',
						},
						{
							description: 'Yorkshire pigs should return "Half", or "Quarter" for other pigs',
							solution_f: '=if(a1="Yorkshire", "half", "Quarter")',
						},
						{
							description: 'Return "Discount" for "C" pigs, or "Normal" for other pigs',
							solution_f: '=if(c1="C", "Discount", "Normal")',
						},
						{
							description: 'Return "Young" for pigs with a weight under 100, or "Sell" for other pigs',
							solution_f: '=if(b1<100, "Young", "Sell")',
						},
						{
							description: 'Pigs with a weight of 200 or over should return "Heavy"; other pigs should return "No sale"',
							solution_f: '=if(b1>=200, "Heavy", "No sale")',
						},
						{
							description: 'Return 100 for "C" pigs, or 150 for other pigs',
							solution_f: '=if(c1="C", 100, 150)',
						},
						{
							description: '"B" rating pigs should return the pig breed, or "N/A" for any others',
							solution_f: '=if(c1="B", a1, "N/A")', 
						},

					]
				}
			]
		}: GenType)
	]
}: GenType);



const if3 = ({
	code: 'if3',
	title: 'IF3: the IF function',
	description: 'Create simple formulas with IF',
	harsons_randomly_on_username: false,
	version: 1.0,

	
	gen: ({
		gen_type: LinearGen,
		pages: [
			if3_if_tutorial,
			if3_if_test,
			...finish_questions
		]
	}: GenType)
	
}: LevelSchemaFactoryType);


module.exports = { if3 };
