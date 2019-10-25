// @flow
const { DataFactory } = require('./../DataFactory');
const { LinearGen, UntilGen } = require('./../Gens');
const { finish_questions } = require('./../pages/finish_questions');

const { IfPageFormulaSchema } = require( './../../shared/IfPageSchemas');

const randB = DataFactory.randB;

import type { GenType } from './../Gens';
import type { LevelSchemaFactoryType } from './../IfLevelSchemaFactory';


const if4_functions_tutorial = ({
	gen_type: LinearGen,
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
}: GenType);




const if4_functions_test = ({
	gen_type: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `It's time to take on some problems.
					You must complete six problems before moving on.
					<br/><br/>
					The questions will require you to carefully read the problem, and use
					the correct formula. You do not have to use every column.`
		},
		({
			gen_type: UntilGen,
			until_total: 6,
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
		}: GenType)
	]
}: GenType);




const if4 = ({
	code: 'if4',
	title: 'IF4: Logical functions',
	description: 'Learn about AND, OR, & NOT',
	harsons_randomly_on_username: false,
	version: 1,

	gen: ({
		gen_type: LinearGen,
		pages: [
			if4_functions_tutorial,
			if4_functions_test,
			...finish_questions
		]
	}: GenType)

}: LevelSchemaFactoryType);


module.exports = { if4 };
