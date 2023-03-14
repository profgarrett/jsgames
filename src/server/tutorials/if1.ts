//import { LinearGen, UntilGen } from './../Gens';
import { kc_if_comparison_number, kc_if_comparison_text, kc_if_comparison_boolean } from './../kcs/kc_if_comparison';
import { finish_questions } from './../pages/finish_questions';

import { IfPageFormulaSchema } from './../../shared/IfPageSchemas';
import type { GenType } from './../Gens';
import type { LevelSchemaFactoryType } from './../IfLevelSchemaFactory';

import { makeInertiaGenFromKC } from './../kcs/kc';



const introduction_gen = ({
	gen_type: 'LinearGen',
	pages: [
		{
			type: 'IfPageTextSchema',
			description: `
				This tutorial introduces you to logical comparisons. By the end, you'll be able to
				<ul>
					<li>Compare numbers, text, and boolean values</li>
					<li>Use <i>equal</i> to compare two values</li>
					<li>Use <i>less than</i> and <i>greater than</i></li>
					<li>Use <i>greater than or equal to</i>  and <i>less than or equal to</i></li>
				</ul>
				After finishing this section, you'll have a solid grounding in creating the 
				first part of a <code>IF</code> function!`

		},{
			type: 'IfPageFormulaSchema',
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
					Like most functions in Excel, we separate each part with a comma.
					`,
			instruction: 'Why don’t you try inputting the formula?',
			column_titles: ['Pig Name', 'Pig Age' ],
			tests: [
						{ 'a': 'Anna', 'b': 2 }, 
						{ 'a': 'Bernice', 'b': 1 }, 
						{ 'a': 'Charlie', 'b': 5 }, 
						{ 'a': 'Dennis', 'b': 3 }
					],
			solution_f: '=IF(B1>2, 1, 0)',
			code: 'tutorial'
		}
	]
});




const ReviewNextConcept = {
	type: 'IfPageTextSchema',
	description: `
		Excellent! You have completed this section of the tutorial.
		<br/><br/>
		The system will now start you on the next concept.`
};

const donePage = {
	type: 'IfPageTextSchema',
	description: `
		Excellent! You have completed this entire tutorial! 
		<br/><br/>
		You can now go onto the next IF tutorial.`
};



const if1 = ({
	code: 'if1',
	title: 'IF1: Logical comparisons',
	description: 'Compare numbers, text, and boolean values',
	harsons_randomly_on_username: false,
	predict_randomly_on_username: false,
	version: 2.1,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			introduction_gen,

			makeInertiaGenFromKC(kc_if_comparison_number),
			ReviewNextConcept, 
			
			makeInertiaGenFromKC(kc_if_comparison_text),
			ReviewNextConcept, 

			makeInertiaGenFromKC(kc_if_comparison_boolean),
			donePage, 

			...finish_questions
		]
	})
});


export { if1 };


/*
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
		*/ 


/*


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
		*/		