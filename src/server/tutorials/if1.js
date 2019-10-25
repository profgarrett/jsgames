// @flow
const { LinearGen, UntilGen } = require('./../Gens');

const { finish_questions } = require('./../pages/finish_questions');

const { IfPageFormulaSchema } = require( './../../shared/IfPageSchemas');
import type { GenType } from './../Gens';
import type { LevelSchemaFactoryType } from './../IfLevelSchemaFactory';


const if1_number_comparison_tutorial = ({
	gen_type: LinearGen,
	pages: [
		{	type: 'IfPageFormulaSchema',
			description: `The IF function is the easiest way to program in Excel.  It can save you hours of work.
					<br/><br/>
					Here’s a simple example.  We have a table with pig names and ages.  
					We want to figure out how many we can sell at the next fair.  
					But, we only want to sell pigs that are over 2 years old.  
					<br/><br/>
					Here is our IF statement: <code>=IF(B1>2, 1, 0)</code>
					<br/><br/>
					It has three parts:
					<ul>
						<li><b>B1>2</b> is the logical test.  It'll see if the pig's age is greater than 2. </li>
						<li><b>1</b> is returned if the test is true.</li>
						<li><b>0</b> is returned if the test is false.</li>
					</ul>
					Like most functions in Excel, we separate each part with a comma.`,
			instruction: 'Why don’t you try inputing the formula?',
			column_titles: ['Pig Name', 'Pig Age' ],
			tests: [
						{ 'a': 'Anna', 'b': 2 }, 
						{ 'a': 'Bernice', 'b': 1 }, 
						{ 'a': 'Charlie', 'b': 5 }, 
						{ 'a': 'Dennis', 'b': 3 }
					],
			solution_f: '=IF(B1>2, 1, 0)',
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `We will start by focusing on the first part of an IF statement, 
					the <b>logical comparison</b> (or <b>test</b>).
					<br/><br/>
					The major comparisons are:
					<ul>
						<li><code>A1=B1</code> (equal)</li>
						<li><code>A1&gtB1</code> (greater than)</li>
						<li><code>A1&ltB1</code> (lesser than)</li>
					<br/><br/>
					We will practice these logical comparisons by putting them directly into Excel.
					<br/><br/>
					To see which pigs are 3 years old, we could enter <code>=B1=3</code>.  
					The first <code>=</code> tells Excel that we’re entering a formula. 
					The second <code>=</code> does the actual comparison.`,
			instruction: 'Why don’t you create a formula to see if the pig\'s age is exactly 5?',
			column_titles: ['Pig Name', 'Pig Age' ],
			tests: [
						{ 'a': 'Anna', 'b': 5 }, 
						{ 'a': 'Bernice', 'b': 1 }, 
						{ 'a': 'Charlie', 'b': 5 }, 
						{ 'a': 'Dennis', 'b': 3 }
					],
			solution_f: '=b1=5', 
			feedback: [
				{ 'has': 'values', args: [5] },
				{ 'has': 'symbols', args: ['='] },
				{ 'has': 'references', args: ['b1'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `If you remember from your math courses, we also have the ≤ and ≥ symbols.  
					These mean <i>less than or equal to</i>, and <i>greater than or equal to</i>. 
					<br/><br/>
					Because those symbols don't appear on the keyboard, we use:
					<ul>
						<li><code>A1&lt=B1</code> (less than or equal to)</li>
						<li><code>A1&gt=B1</code> (greater than or equal to)</li>
					</ul>
					Remember to always put the = sign after the < or > symbol!`,
			instruction: 'Why don’t you try testing to see if the pig\'s age is 3 or greater?',
			column_titles: ['Pig Name', 'Pig Age' ],
			tests: [
						{ 'a': 'Anna', 'b': 2 }, 
						{ 'a': 'Bernice', 'b': 1 }, 
						{ 'a': 'Charlie', 'b': 5 }, 
						{ 'a': 'Dennis', 'b': 3 }
					],
			solution_f: '=b1>=3', 
			feedback: [
				{ 'has': 'values', args: [3] },
				{ 'has': 'references', args: ['b1'] },
				{ 'has': 'symbols', args: ['>=']}
			],
			code: 'tutorial'
		},
		{	type: 'IfPageTextSchema',
			description: `Sometimes this terminology can be confusing.
					Here are some different ways we can write comparisons.
					<br/><br/>
					<b><code>A1 &gt 10</code></b>
					<ul>
						<li>Greater than 10</li>
						<li>Over 10</li>
						<li>More than 10</li>
					</ul>

					<b><code>A1 &lt 10</code></b>
					<ul>
						<li>Less than 10</li>
						<li>Under 10</li>
						<li>Fewer than 10</li>
					</ul>

					<b><code>A1 &ge; 10</code></b>
					<ul>
						<li>Greater than or equal to 10</li>
						<li>At least 10</li>
						<li>10 or over</li>
					</ul>

					<b><code>A1 &le; 10</code></b>
					<ul>
						<li>Lesser than or equal to 10</li>
						<li>At most 10</li>
						<li>10 or under</li>
					</ul>

					<b><code>A1 = 10</code></b>
					<ul>
						<li>Equal to 10</li>
						<li>The same as 10</li>
						<li>Exactly 10</li>
					</ul>
					<br/><br/>
					If you forget these terms later on, feel free to hover your
					cursor over the small black progress boxes below. Once you complete
					each section, you can go back and review its instructions.`
		}
	]
}: GenType);



const if1_number_comparison_test = ({
	gen_type: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `Time for a quiz on number comparisons!
					You will be given six problems to solve.
					<br/><br/>
					The questions will require you to carefully read the problem, and use
					the a correct comparison. You do not have to use every column.`
		},
		({
			gen_type: UntilGen,
			until_total: 6,
			pages: [
				{	type: 'IfPageFormulaSchema',
					instruction: 'Enter the correct formula',
					column_titles: ['Pig Name', 'Pig Age', 'Pig Weight' ],
					tests: [
								{ 'a': 'Anna', 'b': 2, c: 90 }, 
								{ 'a': 'Bernice', 'b': 1, c: 100 }, 
								{ 'a': 'Charlie', 'b': 5, c: 40 }, 
								{ 'a': 'Dennis', 'b': 3, c: 130 },
								{ 'a': 'Edward', 'b': 2, c: 190 },
								{ 'a': 'Ferdinand', 'b': 1, c: 155 },
								{ 'a': 'Gerald', 'b': 5, c: 150 }
							],
					code: 'test',
					toolbox: [
						{ has: 'references', args: ['a1', 'b1', 'c1'] },
						{ has: 'values', args: ['number?'] },
						{ has: 'symbols', args: ['comparison?'] }
					],
					versions: [
						{
							description: 'Which pigs are more than 2 years old?',
							solution_f: '=b1>2',
						},
						{
							description: 'Which pigs are less than 4 years old?',
							solution_f: '=b1<4',
						},
						{
							description: 'Which pigs are exactly 2 year old?',
							solution_f: '=b1=2', 
						},
						{
							description: 'Which pigs are 3 years and under?',
							solution_f: '=b1<=3', 
						},
						{
							description: 'Which pigs are exactly 190 pounds?',
							solution_f: '=c1=190', 
						},
						{
							description: 'Which pigs are over 150 pounds?',
							solution_f: '=c1>150', 
						},
						{
							description: 'Which pigs weigh under 100 pounds?',
							solution_f: '=c1<100', 
						},
						{
							description: 'Which pigs weigh 100 or over?',
							solution_f: '=c1>=100', 
						},
						{
							description: 'Which pigs weigh 90 or less pounds?',
							solution_f: '=c1<=90', 
						},
						{
							description: 'Which pigs are exactly 2 years old?',
							solution_f: '=b1=2', 
						},
						{
							description: 'Which pigs are over 3 years?',
							solution_f: '=b1>3', 
						},
						{
							description: 'Which pigs weigh 100 or more pounds?',
							solution_f: '=c1>=100', 
						},
						{
							description: 'Which pigs weigh 100 or less pounds?',
							solution_f: '=c1<=100', 
						},
						{
							description: 'Which pigs are over 3 years old?',
							solution_f: '=b1>3',
						},
						{
							description: 'Which pigs are under 4 years old?',
							solution_f: '=b1<4',
						},
						{
							description: 'Which pigs are 2 year or over?',
							solution_f: '=b1>=2', 
						},
						{
							description: 'Which pigs are 4 years and under?',
							solution_f: '=b1<=4', 
						},
						{
							description: 'Which pigs weigh exactly 100 pounds?',
							solution_f: '=c1=100', 
						},
						{
							description: 'Which pigs weigh over 130 pounds?',
							solution_f: '=c1>130', 
						},
						{
							description: 'Which pigs weigh under 150 pounds?',
							solution_f: '=c1<150', 
						},
						{
							description: 'Which pigs weigh 100 or more pounds?',
							solution_f: '=c1>=100', 
						},
						{
							description: 'Which pigs weigh 100 or less pounds?',
							solution_f: '=c1<=100', 
						},
						{
							description: 'Which pigs are exactly 3 years old?',
							solution_f: '=b1=3', 
						},
						{
							description: 'Which pigs are under 3 years old?',
							solution_f: '=b1<3', 
						},
						{
							description: 'Which pigs weigh under 100 pounds?',
							solution_f: '=c1<100', 
						},
						{
							description: 'Which pigs weigh 100 or less pounds?',
							solution_f: '=c1<=100', 
						},
					]
				}
			]
		}: GenType)
	]
}: GenType);







const if1 = ({
	code: 'if1',
	title: 'IF1: Logical number comparisons',
	description: 'Compare numbers',
	harsons_randomly_on_username: false,
	version: 1.1,

	gen: ({
		gen_type: LinearGen,
		pages: [
			if1_number_comparison_tutorial,
			if1_number_comparison_test,
			...finish_questions
		]
	}: GenType)
}: LevelSchemaFactoryType);


module.exports = { if1 };
