// @flow
const { DataFactory } = require('./../DataFactory');
const { LinearGen, UntilGen } = require('./../Gens');

const { finish_questions } = require('./finish_questions');

import type { FormulaPageType } from './../../app/if/IfTypes';

const randB = DataFactory.randB;



const if1_number_comparison_tutorial = {
	gen: LinearGen,
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
};



const if1_number_comparison_test = {
	gen: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `Time for a quiz on number comparisons!
					You will be given six problems to solve.
					<br/><br/>
					The questions will require you to carefully read the problem, and use
					the a correct comparison. You do not have to use every column.`
		},
		{
			gen: UntilGen,
			until: (until_pages: Array<FormulaPageType>): boolean => {
				return (until_pages.length >= 6);
			},
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
		}
	]
};




const if2_text_comparison_tutorial = {
	gen: LinearGen,
	pages: [
		{	type: 'IfPageFormulaSchema',
			description: `So far we have been using numbers, but we can also compare words.
					<br/><br/>
					The <code>=</code> symbol will return <code>TRUE</code> 
					if the words on each side are the same.
					<br/><br/>
					So, <code>=A1=C1</code> will be <code>TRUE</code> if the cells match, or 
					<code>FALSE</code> if they are different.`,
			instruction: `The table below shows the rating for the parents of each pig.
						Write a formula to see if the Dad’s rating is the same as the Mom’s.`,
			column_titles: ['Mom Pig Rating', 'Dad Pig Rating' ],
			tests: [
						{ 'a': 'A', 'b': 'B' }, 
						{ 'a': 'B', 'b': 'B' }, 
						{ 'a': 'C', 'b': 'D' }, 
						{ 'a': 'A', 'b': 'A' }
					],
			solution_f: '=a1=b1', 
			feedback: [
				{ 'has': 'references', args: ['a1', 'b1'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `If we want to see whether A1 has the word <code>cat</code>,
					we have to write it like <code>=A1="cat"</code>.  Wrapping the word in quotes tells 
					Excel that <code>"cat"</code> isn't a formula or cell reference.
					<br/><br/>
					Wrapping a word in single quotes (apostrophes) will not work.  
					So, never write <code>=A1='cat'</code>.
					<br/><br/>
					Like most of Excel, <code>=</code> does not care about capitalization.
					So, <code>=A1="A"</code> and <code>=A1="a"</code> have the same result.`,
			instruction: 'Write the formula to see if the Mom\'s rating is an "A".',
			column_titles: ['Mom Pig Rating', 'Dad Pig Rating' ],
			tests: [
						{ 'a': 'A', 'b': 'B' }, 
						{ 'a': 'B', 'b': 'B' }, 
						{ 'a': 'C', 'b': 'D' }, 
						{ 'a': 'A', 'b': 'A' }
					],
			solution_f: '=a1="A"', 
			feedback: [
				{ 'has': 'references', args: ['a1'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `We can use also
					<code>&gt</code> and <code>&lt</code> to compare two values alphabetically.
					<br/><br/>
					Letters that come first in the alphabet are <b>less than</b> letters that come later on.
					So, "A" is less than "B", which is less than "C".  
					<br/><br/>
					If the first letter of each word matches, we move onto the second letter. If that matches, we keep
					going to the right. If one word runs out of letters before the other, it comes first.
					<br/><br/>
					As an example, "Aden" <code>&lt</code> "Bob", but "Aden"<code>&gt</code>"Ada".`,
			instruction: 'Write a formula to see if the Dad’s rating is greater than the Mom’s rating.',
			column_titles: ['Mom Pig Rating', 'Dad Pig Rating' ],
			tests: [
						{ 'a': 'A', 'b': 'B' }, 
						{ 'a': 'B', 'b': 'A' }, 
						{ 'a': 'C', 'b': 'D' }, 
						{ 'a': 'B', 'b': 'A' }
					],
			solution_f: '=b1>a1', 
			feedback: [
				{ 'has': 'no_values' },
				{ 'has': 'references', args: ['a1', 'b1'] },
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `We can also use <code>≤</code> and <code>≥</code> to compare words.  
					<br/><br/>
					Just like with numbers, those symbols don't appear on the keyboard.  Use 
					<code>&gt=</code> or <code>&lt=</code>. Always put the <code>=</code> sign last.`,
			instruction: 'Write a formula to see if the Dad’s rating is greater than or equal to the Mom’s rating.',
			column_titles: ['Mom Pig Rating', 'Dad Pig Rating' ],
			tests: [
						{ 'a': 'A', 'b': 'B' }, 
						{ 'a': 'B', 'b': 'A' }, 
						{ 'a': 'C', 'b': 'D' }, 
						{ 'a': 'B', 'b': 'A' }
					],
			solution_f: '=b1>=a1', 
			feedback: [
				{ 'has': 'no_values' },
				{ 'has': 'references', args: ['a1', 'b1'] },
			],
			code: 'tutorial'
		}
	]
};



const if2_text_comparison_test = {
	gen: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `It's time to take on some problems on text comparisons.
					You will be given six problems to solve.
					<br/><br/>
					The questions will require you to carefully read the problem, and use
					the correct comparisons. You do not have to use every column.`
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
					instruction: 'Input the correct formula',
					column_titles: ['Pig Breed', 'Weight Rating', 'Taste Rating' ],
					tests: [
								{ 'a': 'Spotted', 'b': 'A', c: 'B' }, 
								{ 'a': 'Spotted', 'b': 'A', c: 'A' }, 
								{ 'a': 'Yorkshire', 'b': 'B', c: 'A' }, 
								{ 'a': 'Spotted', 'b': 'A', c: 'A' }, 
								{ 'a': 'Spotted', 'b': 'C', c: 'B' }, 
								{ 'a': 'Poland China', 'b': 'B', c: 'A' }, 
								{ 'a': 'Spotted', 'b': 'C', c: 'C' }, 
								{ 'a': 'Poland China', 'b': 'C', c: 'B' }, 
								{ 'a': 'Yorkshire', 'b': 'A', c: 'C' }, 
							],
					code: 'test',
					toolbox: [
						{ has: 'references', args: ['a1', 'b1', 'c1'] },
						{ has: 'values', args: ['string?'] },
						{ has: 'symbols', args: ['comparison?'] }
					],
					versions: [
						{
							description: 'Which pigs have a breed of "Spotted"?',
							solution_f: '=a1="Spotted"',
						},
						{
							description: 'Which pigs have a breed of "Yorkshire"?',
							solution_f: '=a1="Yorkshire"',
						},
						{
							description: 'Which pigs have a breed of "Poland China"?',
							solution_f: '=a1="Poland China"',
						},
						{
							description: 'Which pigs have a <b>weight</b> rating less than C?',
							solution_f: '=b1<"C"', 
						},
						{
							description: 'Which pigs have a <b>weight</b> rating of B?',
							solution_f: '=b1="B"', 
						},
						{
							description: 'Which pigs have a <b>weight</b> rating over A?',
							solution_f: '=b1>"A"', 
						},
						{
							description: 'Which pigs have a <b>weight</b> rating of A?',
							solution_f: '=b1="a"', 
						},
						{
							description: 'Which pigs have a <b>taste</b> rating of less than or equal to B?',
							solution_f: '=c1<="B"', 
						},
						{
							description: 'Which pigs have a <b>taste</b> rating of B?',
							solution_f: '=c1="B"', 
						},
						{
							description: 'Which pigs have a taste rating of greater than or equal to B?',
							solution_f: '=c1>="B"', 
						},
						{
							description: 'Which pigs have a taste rating of A?',
							solution_f: '=c1="a"', 
						},
						{
							description: 'Which pigs have an equal weight and taste rating?',
							solution_f: '=b1=c1', 
						},
						{
							description: 'Which pigs have a weight rating greater than their taste rating?',
							solution_f: '=b1>c1', 
						},
						{
							description: 'Which pigs have a weight rating less than their taste rating?',
							solution_f: '=b1<c1', 
						},
						{
							description: 'Which pigs have a weight rating greater than <i>or equal to</i> their taste rating?',
							solution_f: '=b1>=c1', 
						},
						{
							description: 'Which pigs have a weight rating less <i>or equal to</i> than their taste rating?',
							solution_f: '=b1<=c1', 
						},
					]
				}
			]
		}
	]
};








const if3_if_tutorial = {
	gen: LinearGen,
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
				For example, <code>=IF(C1="C", FLOOR(c1), "Ok")</code> uses the <code>FLOOR()</code> function to
				round down C1 to the nearest integer.  Otherwise
				it returns "Ok".`,
			instruction: 'Have the North region return "expired", while all others should use <code>FLOOR()</code> to round down the sales.',
			column_titles: ['Region', 'Sales', 'Rating' ],
			column_formats: [ '', '.',''],
			client_f_format: 'date',
			tests: [
						{ 'a': 'South', 'b': 10.30, c: 'A' },
						{ 'a': 'North', 'b': 15.44, c: 'B' },
						{ 'a': 'East', 'b': 23.1, c: 'A'},
						{ 'a': 'West', 'b': 10.9, c: 'C'},
					],
			solution_f: '=if(a1="North", "expired", floor(b1))', 
			feedback: [
				{ 'has': 'references', args: ['a1'] },
				{ 'has': 'functions', args: ['if', 'floor'] },
				{ 'has': 'values', args: ['north', 'expired'] }
			],
			code: 'tutorial'
		}
	]
};


const if3_if_test = {
	gen: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `It's time to take on some problems using the IF function.
					You will be given six problems to solve.
					<br/><br/>
					The questions will require you to carefully read the problem, and use
					the correct comparisons. You do not have to use every column.`
		},
		{
			gen: UntilGen,
			until: (until_pages: Array<FormulaPageType>): boolean => {
				return (until_pages.length >= 6);
			},
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
		}
	]
};



const if4_functions_tutorial = {
	gen: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `The previous tutorials taught you how to compare <b>two</b> values
					using <code>=</code>, <code>&gt</code>, <code>&lt</code>, <code>&gt=</code>, 
					and <code>&lt=</code>
					<br/><br/>
					This tutorial will show you how to compare <b>three</b> or more fields. 
					This requires us to use the functions <code>AND</code>, <code>OR</code>, 
					and <code>NOT</code>.
					<br/><br/>
					For now, we will focus just on these three logical functions. We will return to using
					<code>IF</code> in the next tutorial.`
		},
		{	type: 'IfPageFormulaSchema',
			description: `Our first function is <code>NOT</code>.
					It turns <code>TRUE</code> into <code>FALSE</code>, and <code>FALSE</code> into <code>TRUE</code>.
					<br/><br/>
					This is pretty simple, but can make formulas easier to read. 
					For example, if we were trying to find out if chickens 
					were <b>not</b> the same as 
					ducks, we would enter <code>=NOT(B1=c1)</code>
					<br/><br/>
					This will first see if the number of chickens and ducks match.
					If this is <code>TRUE</code>, Excel will flip it to <code>FALSE</code> (and vice versa).`,
			instruction: 'Use NOT to see if the number of cows and ducks are different.',
			column_titles: ['Cows', 'Ducks', 'Chickens' ],
			tests: [
						{ 'a': randB(80, 100), 'b': randB(80, 100), 'c': randB(10,20) }, 
						{ 'a': 90, 'b': 90, 'c': randB(10,20) }, 
						{ 'a': randB(8, 10), 'b': randB(80, 100), 'c': randB(10,20) }, 
						{ 'a': randB(80, 100), 'b': randB(8, 10), 'c': 3 }, 
						{ 'a': 21, 'b': 21, 'c': randB(10,20) }, 
						{ 'a': randB(80, 100), 'b': randB(80, 100), 'c': randB(100,200) }, 
					],
			solution_f: '=not(a1=b1)', 
			feedback: [
				{ 'has': 'no_values' },
				{ 'has': 'references', args: ['a1', 'b1'] },
				{ 'has': 'functions', args: ['not']}
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `Our next function is <code>AND</code>.  This checks to see
					if all of the values passed to it are <code>TRUE</code>.  If any value passed is 
					<code>FALSE</code>, then the function returns <code>FALSE</code>.
					<br/><br/>
					So, if we write <code>=AND(A1=10, B1=10)</code>, Excel will check to see if the
					values in <code>A1</code> and <code>B1</code> are <b>both</b> 10.`,
			instruction: 'Write a formula that will say TRUE if sales in both regions are over 50.',
			column_formats: [ '$', '$' ],
			column_titles: ['Sales NY', 'Sales TX' ],
			tests: [
						{ 'a': randB(80, 100), 'b': randB(10, 100) }, 
						{ 'a': 80, 'b': 80 }, 
						{ 'a': randB(10, 100), 'b': randB(10, 100) }, 
						{ 'a': randB(10, 100), 'b': randB(10, 100) }, 
						{ 'a': 2, 'b': 61 }, 
						{ 'a': randB(80, 100), 'b': randB(80, 100) }, 
					],
			solution_f: '=AND(a1>50, b1>50)', 
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `AND can take in any number of arguments. 
					For example, all of the following are valid formulas.  Just be sure to separate
					each logical test with a comma.
					<ul>
						<li><code>=AND(A1=1)</code></li>
						<li><code>=AND(A1=1, B1=2)</code></li>
						<li><code>=AND(A1=1, B1=2, C1=3)</code></li>.
					</ul>`,
			instruction: 'Are sales in all regions under 100?',
			column_formats: [ '$', '$', '$' ],
			column_titles: ['Sales NY', 'Sales TX', 'Sales CA' ],
			tests: [
						{ 'a': randB(80, 100), 'b': randB(10, 100), 'c': randB(3, 40) }, 
						{ 'a': 20, 'b': 10, 'c': 23 }, 
						{ 'a': randB(10, 100), 'b': randB(80, 100), 'c': randB(200, 400) }, 
						{ 'a': randB(10, 100), 'b': randB(100, 200), 'c': randB(3, 40) }, 
						{ 'a': 61, 'b': 61, 'c': randB(3, 40) }, 
						{ 'a': randB(80, 100), 'b': randB(80, 100), 'c': randB(3, 40) }
					],
			solution_f: '=AND(a1<100, b1<100, c1<100)', 
			toolbox: [
				{ 'has': 'values', args: [100] },
				{ 'has': 'references', args: ['a1', 'b1', 'c1'] },
				{ 'has': 'symbols', args: ['<']},
				{ 'has': 'functions', args: ['and3'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `<code>AND</code> can do an unlimited number of comparisons, but each part must be
					complete logical test.
					<br/><br/>
					So, if wanted to see if <code>A1</code> is <b>between</b> 10 and 20, we would need to
					write <code>=AND(a1&gt10, a1&lt20)</code>.  
					<br/><br/>
					In most math problems, you can write
					10&lta1&lt20.  However, that doesn't work in Excel.  You must split the comparison 
					into two separate tests: <code>a1&gt10</code>, and <code>a1&lt20</code>.`,
			instruction: 'Are sales in the NY region between 50 and 100?',
			column_formats: [ '$' ],
			column_titles: ['Sales NY' ],
			tests: [
						{ 'a': randB(10, 100) }, 
						{ 'a': randB(10, 100) }, 
						{ 'a': randB(10, 100) }, 
						{ 'a': randB(10, 100) }, 
						{ 'a': randB(10, 100) }, 
						{ 'a': randB(10, 100) }, 
						{ 'a': randB(10, 100) }, 
					],
			solution_f: '=AND(a1>50, a1<100)', 
			feedback: [
				{ 'has': 'values', args: [50, 100] },
				{ 'has': 'references', args: ['a1' ] },
				{ 'has': 'functions', args: ['and'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `Our final function is <code>OR</code>.  This checks to see
					if <i>any</i> of the values passed are <code>TRUE</code>.  As long as one is <code>TRUE</code>,
					the function will return <code>TRUE</code>. If none are correct, it will return <code>FALSE</code>.
					<br/><br/>
					So, if we write <code>=OR(A1>50, B1>50)</code>, it will check to see if the
					either <code>A1</code> <i>or</i> <code>B1</code> are over 50.`,
			instruction: 'Write a formula that will say TRUE if sales in either region is over 50.',
			column_formats: [ '$', '$' ],
			column_titles: ['Sales NY', 'Sales TX' ],
			tests: [
						{ 'a': randB(80, 100), 'b': randB(10, 100) }, 
						{ 'a': 20, 'b': 80 }, 
						{ 'a': randB(10, 100), 'b': randB(10, 100) }, 
						{ 'a': randB(10, 100), 'b': randB(10, 100) }, 
						{ 'a': 61, 'b': 11 }, 
						{ 'a': randB(80, 100), 'b': randB(80, 100) }, 
					],
			solution_f: '=OR(a1>50, b1>50)', 
			feedback: [
				{ 'has': 'values', args: [ 50 ] },
				{ 'has': 'references', args: ['a1', 'b1'] },
				{ 'has': 'functions', args: ['OR'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `OR can take in any number of arguments. 
					For example, all of the following are valid formulas.  Just be sure to separate
					each logical test with a comma.
					<ul>
						<li><code>=OR(A1=1)</code></li>
						<li><code>=OR(A1=1, B1=2)</code></li>
						<li><code>=OR(A1=1, B1=2, c1=3)</code></li>
					</ul>`,
			instruction: 'Are sales in <i>any single</i> region over 100?',
			column_formats: [ '$', '$', '$' ],
			column_titles: ['Sales NY', 'Sales TX', 'Sales CA' ],
			tests: [
						{ 'a': randB(800, 1000), 'b': randB(10, 100), 'c': randB(3, 40) }, 
						{ 'a': 20, 'b': 10, 'c': 23 }, 
						{ 'a': randB(10, 100), 'b': randB(80, 100), 'c': randB(3, 40) }, 
						{ 'a': randB(10, 100), 'b': randB(110, 1010), 'c': randB(3, 40) }, 
						{ 'a': 61, 'b': 61, 'c': randB(3, 40) }, 
						{ 'a': randB(80, 100), 'b': randB(180, 1100), 'c': randB(113, 1140) }
					],
			solution_f: '=OR(a1>100, b1>100, c1>100)', 
			feedback: [
				{ 'has': 'values', args: [100] },
				{ 'has': 'references', args: ['a1', 'b1', 'c1'] }
			],
			toolbox: [
				{ 'has': 'values', args: [100] },
				{ 'has': 'references', args: ['a1', 'b1', 'c1'] },
				{ 'has': 'functions', args: ['OR3'] },
				{ 'has': 'symbols', args: [ '>'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `Just like <code>AND</code>, <code>OR</code> can do any unlimited number
					 of comparisons, but each part must be completedly separate.
					 <br/><br/>
					 So, if you wants to see if <code>A1</code> is less than 10 or greater than 20,
					 you would write <code>=OR(A1<10, A1>20)</code>.`,
			instruction: 'Are sales in the NY region <b>outside</b> of the range from 50 to 100?',
			column_formats: [ '$' ],
			column_titles: ['Sales NY' ],
			tests: [
						{ 'a': randB(10, 100) }, 
						{ 'a': randB(10, 200) }, 
						{ 'a': randB(10, 100) }, 
						{ 'a': randB(110, 200) }, 
						{ 'a': randB(10, 100) }, 
						{ 'a': randB(10, 100) }, 
						{ 'a': randB(110, 1100) }, 
					],
			solution_f: '=OR(a1<50, a1>100)', 
			feedback: [
				{ 'has': 'values', args: [50, 100] },
				{ 'has': 'references', args: ['a1' ] },
				{ 'has': 'functions', args: ['or'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageTextSchema',
			description: `We can write <code>AND</code> and <code>OR</code> several different ways.  
					Here are some examples that all mean the same thing.

					<br/><br/>

					<code>AND</code>
					<ul>
						<li>Both A & B</li>
						<li>All of A, B, & C</li>
						<li>Each of A, B, & C
						<li>Every one of A, B, & C
					</ul>

					<code>OR</code>
					<ul>
						<li>Either of A, B, & C</li>
						<li>Any one of A, B, & C</li>
						<li>One or more of A, B, & C</li>
						<li>At least one of A, B, & C</li>
					</ul>`
		},
		{	type: 'IfPageTextSchema',
			description: `Another issue is the ambiguous nature of the word <i>between</i>.  
						If we say to "pick a number between 1 and 4", most people would generally include both the 1 and 4.  
						However, if say "what numbers are between 1 and 4",	we usually say "2 and 3".
					</br><br/>
					To be clearer, we use two special terms:
					<ul>
						<li><b>Inclusive</b> means to include the top & bottom numbers. (i.e., 1,2,3,4) </li>
						<li><b>Exclusive</b> means to exclude the top & bottom numbers. (i.e., 2, 3)</li>
					</ul>
					So, if you were asked to test if A1 was between 1 and 4 <i>inclusive</i>, write<br/>
						<code>=AND(A1>=1, A1<=4)</code>
					</br><br/>
					If you were asked to see if A1 was between 1 and 4 <i>exclusive</i>, <br/> use
						<code>=AND(A1>1, A1<4)</code>
					<br/><br/>
					If you have any trouble remembering this, remember that <i>inclu</i>sive means to <i>inclu</i>de
						the numbers in the problem, and <i>exclu</i>sive means to <i>exclu</i>de them.`
		}
	]
};




const if4_functions_test = {
	gen: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `It's time to take on some problems.
					You must complete six problems before moving on.
					<br/><br/>
					The questions will require you to carefully read the problem, and use
					the correct formula. You do not have to use every column.`
		},
		{
			gen: UntilGen,
			until: (until_pages: Array<FormulaPageType>): boolean => {
				return (until_pages.length >= 6);
			},
			pages: [
				{	type: 'IfPageFormulaSchema',
					column_titles: ['Angelfish Sales', 'Bald Eagle Sales', 'Cat Sales' ],
					instruction: 'Enter the correct formula',
					tests: [
								{ 'a': 3, 'b': 3, 'c': 3 }, 
								{ 'a': 5, 'b': 50, 'c': 80 }, 
								{ 'a': randB(0, 10), 'b': 0, 'c': randB(100,200) }, 
								{ 'a': randB(0, 10), 'b': 0, 'c': 300 }, 
								{ 'a': 0, 'b': 10, 'c': 0 }, 
								{ 'a': 60, 'b': randB(60, 100), 'c': randB(100,200) }, 
							],
					code: 'test',
					toolbox: [
						{ has: 'references', args: [ 'a1', 'b1', 'c1']},
						{ has: 'symbols', args: [ 'comparison?'] },
						{ has: 'values', args: ['number?'] }
					],
					versions: [
						{
							description: 'Do <i>both</i> angelfish and bald eagles each have 50 sales or more?',
							solution_f: '=AND(a1>=50, b1>=50)',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor2'] } ]
						},
						{
							description: 'Do <i>either</i> angelfish or bald eagles have less than 50 sales?',
							solution_f: '=OR(a1<50, b1<50)',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor2'] } ]
						},
						{
							description: 'Do bald eagles and cats <i>each</i> have over 50 sales?',
							solution_f: '=AND(c1>50, b1>50)',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor2'] } ]
						},
						{
							description: 'Do <i>either one</i> of bald eagles or cats have less than 50 sales?',
							solution_f: '=OR(c1<50, b1<50)',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor2'] } ]
						},
						{
							description: 'Do <i>all</i> of the animals have more than 50 sales?',
							solution_f: '=AND(a1>50, b1>50, c1>50)',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor3'] } ]
						},
						{
							description: 'Does <i>any one</i> of the animals have less than 50 sales?',
							solution_f: '=OR(a1<50, b1<50, c1<50)',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor3'] } ]
						},
						{
							description: 'Do <i>any one</i> of the animals have 20 or more sales?',
							solution_f: '=OR(a1>=20, b1>=20, c1>=20)',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor3'] } ]
						},					
						{
							description: 'Do cats <i>not</i> have the same sales as bald eagles?',
							solution_f: '=NOT(B1=C1)',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['not'] } ]
						},
						{
							description: 'Do cats <i>not</i> have more sales than bald eagles?',
							solution_f: '=NOT(C1>B1)',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['not'] } ]
						},
						{
							description: 'Do cats <i>not</i> have fewer sales than bald eagles?',
							solution_f: '=NOT(C1<B1)',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['not'] } ]
						},
						{
							description: 'Do cats <i>not</i> have exactly 200 sales?',
							solution_f: '=NOT(C1=200)',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['not'] } ]
						},
						{
							description: 'Are cat sales over 50 and under 250? (exclusive)',
							solution_f: '=AND(C1>50, C1<250)',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor2'] } ]
						},
						{
							description: 'Are angelfish sales under 2 or over 8? (exclusive)',
							solution_f: '=OR(a1>8, a1<2)',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor2'] } ]
						},
						{
							description: 'Are angelfish sales between 2 and 10? (inclusive)',
							solution_f: '=AND(a1>=2, a1<=10)',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor2'] } ]
						},
						{
							description: 'Are cat sales greater than 40 and less than 150? (inclusive)',
							solution_f: '=AND(C1>=40, C1<=150)',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor2'] } ]
						},
						{
							description: 'Are cat sales outside of the range 50-80? (exclusive)',
							solution_f: '=OR(C1<50, C1>80)',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor2'] } ]
						},
						{
							description: 'Are bald eagles sales outside of the range 5-10? (exclusive)',
							solution_f: '=OR(B1<5, B1>10)',
							toolbox: tb => [ ...tb, { has: 'functions', args: ['andor2'] } ]
						}
					]
				}
			]
		}
	]
};





const if5_if_with_functions_tutorial = {
	gen: LinearGen,
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
				{ 'has': 'functions', args: ['if', 'not']}
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
			solution_f: '=IF(AND(a1<50, b1<50), "bad", "ok")', 
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
			solution_f: '=IF(AND(a1>10, b1>10, c1>10), "Y", "N")', 
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
};



const if5_if_with_functions_test = {
	gen: LinearGen,
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
		{
			gen: UntilGen,
			until: (until_pages: Array<FormulaPageType>): boolean => {
				return (until_pages.length >= 6);
			},
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
		}
	]
};





const if6_if_with_math_tutorial = {
	gen: LinearGen,
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
};

const if6_if_with_math_test = {
	gen: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `It's time to take on some problems.
					You must complete six problems before moving on.
					<br/><br/>
					You do not have to use every column.`
		},
		{
			gen: UntilGen,
			until: (until_pages: Array<FormulaPageType>): boolean => {
				return (until_pages.length >= 6);
			},
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
		}
	]
};




const if7_boolean_tutorial = {
	gen: LinearGen,
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
};



const if7_boolean_test = {
	gen: LinearGen,
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
		{
			gen: UntilGen,
			until: (until_pages: Array<FormulaPageType>): boolean => {
				return (until_pages.length >= 6);
			},
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
		}
	]
};







const if8_boolean_if_tutorial = {
	gen: LinearGen,
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
};



const if8_boolean_if_test = {
	gen: LinearGen,
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
		{
			gen: UntilGen,
			until: (until_pages: Array<FormulaPageType>): boolean => {
				return (until_pages.length >= 6);
			},
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
		}
	]
};




const if1 = {
	code: 'if1',
	title: 'IF1: Logical number comparisons',
	description: 'Compare numbers',
	harsons_randomly_on_username: true,

	gen: {
		gen: LinearGen,
		pages: [
			if1_number_comparison_tutorial,
			if1_number_comparison_test,
			...finish_questions
		]
	}
};

const if2 = {
	code: 'if2',
	title: 'IF2: Logical text comparisons',
	description: 'Compare words',
	harsons_randomly_on_username: true,

	gen: {
		gen: LinearGen,
		pages: [
			if2_text_comparison_tutorial,
			if2_text_comparison_test,
			...finish_questions
		]
	}
};


const if3 = {
	code: 'if3',
	title: 'IF3: the IF function',
	description: 'Create simple formulas with IF',
	harsons_randomly_on_username: true,

	gen: {
		gen: LinearGen,
		pages: [
			if3_if_tutorial,
			if3_if_test,
			...finish_questions
		]
	}
};


const if4 = {
	code: 'if4',
	title: 'IF4: Logical functions',
	description: 'Learn about AND, OR, & NOT',
	harsons_randomly_on_username: true,

	gen: {
		gen: LinearGen,
		pages: [
			if4_functions_tutorial,
			if4_functions_test,
			...finish_questions
		]
	}
};

const if5 = {
	code: 'if5',
	title: 'IF5: Logical functions and IF',
	description: 'Use AND, OR, & NOT inside of IF',
	harsons_randomly_on_username: true,

	gen: {
		gen: LinearGen,
		pages: [
			if5_if_with_functions_tutorial,
			if5_if_with_functions_test,
			...finish_questions
		]
	}
};



const if6 = {
	code: 'if6',
	title: 'IF6: IF and Math',
	description: 'Embed math inside of IF',
	harsons_randomly_on_username: false,

	gen: {
		gen: LinearGen,
		pages: [
			if6_if_with_math_tutorial,
			if6_if_with_math_test,
			...finish_questions
		]
	}
};

const if7 = {
	code: 'if7',
	title: 'IF7: Booleans',
	description: 'Figure out TRUE and FALSE',
	harsons_randomly_on_username: false,

	gen: {
		gen: LinearGen,
		pages: [
			if7_boolean_tutorial,
			if7_boolean_test,
			...finish_questions
		]
	}
};


const if8 = {
	code: 'if8',
	title: 'IF8: Booleans with AND/OR',
	description: 'Use booleans with the AND & OR functions',
	harsons_randomly_on_username: false,

	gen: {
		gen: LinearGen,
		pages: [
			if8_boolean_if_tutorial,
			if8_boolean_if_test,
			...finish_questions
		]
	}
};

module.exports = { if1, if2, if3, if4, if5, if6, if7, if8 };
