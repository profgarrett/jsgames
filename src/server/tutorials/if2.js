// @flow
const { LinearGen, UntilGen } = require('./../Gens');
const { finish_questions } = require('./../pages/finish_questions');

const { IfPageFormulaSchema } = require( './../../shared/IfPageSchemas');

import type { GenType } from './../Gens';
import type { LevelSchemaFactoryType } from './../IfLevelSchemaFactory';


const if2_text_comparison_tutorial = ({
	gen_type: LinearGen,
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
			instruction: 'Write a formula to see if the Dad’s rating is further along in the alphabet than the Mom’s rating.',
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
			instruction: 'Write a formula to see if the Dad’s rating is greater (later in the alphabet) than or equal to the Mom’s rating.',
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
}: GenType);


const sandwiches = {
	column_titles: ['Meat', 'Bread', 'Cheese Rating', 'Deliciousness Rating'],
	tests: [
				{ 'a': 'Bacon', 'b': 'Rye', c: 'A', d: 'A' }, 
				{ 'a': 'None', 'b': 'Rye', c: 'B', d: 'A' }, 
				{ 'a': 'Ham', 'b': 'Regular', c: 'A', d: 'B' }, 
				{ 'a': 'None', 'b': 'Regular', c: 'C', d: 'C' }, 
				{ 'a': 'Ham', 'b': 'Regular', c: 'D', d: 'D' }, 
				{ 'a': 'Ham', 'b': 'Rye', c: 'B', d: 'A' }, 
			],
};



const pigs = {
	column_titles: ['Pig Breed', 'Weight Rating', 'Taste Rating' ],
	tests: [
				{ 'a': 'Spotted', 'b': 'A', c: 'D' }, 
				{ 'a': 'Spotted', 'b': 'E', c: 'A' }, 
				{ 'a': 'Yorkshire', 'b': 'D', c: 'A' }, 
				{ 'a': 'Spotted', 'b': 'A', c: 'E' }, 
				{ 'a': 'Spotted', 'b': 'C', c: 'B' }, 
				{ 'a': 'Poland China', 'b': 'B', c: 'A' }, 
				{ 'a': 'Spotted', 'b': 'C', c: 'D' }, 
				{ 'a': 'Poland China', 'b': 'C', c: 'B' }, 
				{ 'a': 'Yorkshire', 'b': 'A', c: 'C' }, 
			],
};




const if2_text_comparison_test = ({
	gen_type: LinearGen,
	pages: [
		{	type: 'IfPageTextSchema',
			description: `It's time to take on some problems on text comparisons.
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
					
					code: 'test',
					toolbox: [
						{ has: 'references', args: ['a1', 'b1', 'c1', 'd1'] },
						{ has: 'values', args: ['string?'] },
						{ has: 'symbols', args: ['comparison?'] }
					],
					versions: [
						{
							...pigs,
							description: 'Which pigs have a breed of "Spotted"?',
							solution_f: '=a1="Spotted"',
						},
						{
							...pigs,
							description: 'Which pigs have a breed of "Yorkshire"?',
							solution_f: '=a1="Yorkshire"',
						},
						{
							...pigs,
							description: 'Which pigs have a breed of "Poland China"?',
							solution_f: '=a1="Poland China"',
						},
						{
							...pigs,
							description: 'Which pigs have a <b>weight</b> rating of A or B?',
							solution_f: '=b1<"C"', 
						},
						{
							...pigs,
							description: 'Which pigs have a <b>weight</b> rating of B?',
							solution_f: '=b1="B"', 
						},
						{
							...pigs,
							description: 'Which pigs have a <b>weight</b> rating of D or E?',
							solution_f: '=b1>"C"', 
						},
						{
							...pigs,
							description: 'Which pigs have a <b>weight</b> rating of A?',
							solution_f: '=b1="a"', 
						},
						{
							...pigs,
							description: 'Which pigs have a <b>taste</b> rating of A or B?',
							solution_f: '=c1<="B"', 
						},
						{
							...pigs,
							description: 'Which pigs have a B <b>taste</b> rating?',
							solution_f: '=c1="B"', 
						},
						{
							...pigs,
							description: 'Which pigs have a taste rating of B, C, E, or E?',
							solution_f: '=c1>="B"', 
						},
						{
							...pigs,
							description: 'Which pigs have a taste rating of B or greater (such as C, D, ...)?',
							solution_f: '=c1>="B"', 
						},						{
							...pigs,
							description: 'Which pigs have a taste rating of A?',
							solution_f: '=c1="a"', 
						},
						{
							...pigs,
							description: 'Which pigs have an equal weight and taste rating?',
							solution_f: '=b1=c1', 
						},
						{
							...pigs,
							description: 'Which pigs have a weight rating further in the alphabet than their taste rating?',
							solution_f: '=b1>c1', 
						},
						{
							...pigs,
							description: 'Which pigs have a weight rating before (in the alphabet) than their taste rating?',
							solution_f: '=b1<c1', 
						},
						{
							...pigs,
							description: 'Which pigs have a weight rating later (in the alphabet) than <i>or equal to</i> their taste rating?',
							solution_f: '=b1>=c1', 
						},
						{
							...pigs,
							description: 'Which pigs have a weight rating less (in the alphabet) <i>or equal to</i> than their taste rating?',
							solution_f: '=b1<=c1', 
						},



					// Sandwiches

					// equal
						{
							...sandwiches,
							description: 'Which sandwiches have a meat of "Bacon"?',
							solution_f: '=a1="Bacon"',
						},
						{
							...sandwiches,
							description: 'Which sandwiches have a meat of "Ham"?',
							solution_f: '=a1="Ham"',
						},
						{
							...sandwiches,
							description: 'Which sandwiches have a meat of "None"?',
							solution_f: '=a1="None"',
						},
						{
							...sandwiches,
							description: 'Which sandwiches have Rye <b>bread</b>?',
							solution_f: '=b1="Rye"', 
						},
						{
							...sandwiches,
							description: 'Which sandwiches have regular <b>bread</b>?',
							solution_f: '=b1="regular"', 
						},

					// compare value to ref lt / gt / lt-gt-eq
						{
							...sandwiches,
							description: 'Which sandwiches have a <b>delicious</b> rating of A or B?',
							solution_f: '=d1<="B"', 
						},
						{
							...sandwiches,
							description: 'Which sandwiches have a B, C, D, or E <b>delicious</b> rating?',
							solution_f: '=d1>="B"', 
						},
						{
							...sandwiches,
							description: 'Which sandwiches have a delicious rating of A or B?',
							solution_f: '=d1<="B"', 
						},
						{
							...sandwiches,
							description: 'Which sandwiches have a cheese rating of B, C, D, or E?',
							solution_f: '=c1>="B"', 
						},						{
							...sandwiches,
							description: 'Which sandwiches have a cheese below D (i.e., A, B, or C)?',
							solution_f: '=c1<"a"', 
						},

					// compare ref to ref
						{
							...sandwiches,
							description: 'Which sandwiches have an equal cheese and delicious rating?',
							solution_f: '=c1=d1', 
						},
						{
							...sandwiches,
							description: 'Which sandwiches have a cheese rating further along in the alphabet than their delicious rating?',
							solution_f: '=c1>d1', 
						},
						{
							...sandwiches,
							description: 'Which sandwiches have a cheese rating earlier in the alphabet than their delicious rating?',
							solution_f: '=c1<d1', 
						},
						{
							...sandwiches,
							description: 'Which sandwiches have a cheese rating later in the alphabet than <i>or equal to</i> their delicious rating?',
							solution_f: '=c1>=d1', 
						},
						{
							...sandwiches,
							description: 'Which sandwiches have a cheese rating earlier in the alphabet <i>or equal to</i> than their delicious rating?',
							solution_f: '=c1<=d1', 
						},


					]
				}
			]
		}: GenType)
	]
}: GenType);



const if2 = ({
	code: 'if2',
	title: 'IF2: Logical text comparisons',
	description: 'Compare words',
	harsons_randomly_on_username: true,
	version: 1.1,

	gen: ({
		gen_type: LinearGen,
		pages: [
			if2_text_comparison_tutorial,
			if2_text_comparison_test,
			...finish_questions
		]
	}: GenType)

}: LevelSchemaFactoryType);


module.exports = { if2 };
