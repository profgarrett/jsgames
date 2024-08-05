const { DataFactory } = require('./../../shared/DataFactory');
//const { LinearGen, UntilGen } = require('./../Gens');
const { finish_questions } = require('./../pages/finish_questions');

const { kc_if_or_logic, 
		kc_if_or } = require('./../kcs/kc_if_or');

const { IfPageFormulaSchema } = require( './../../shared/IfPageSchemas');

const { makeInertiaGenFromKC } = require('./../kcs/kc');

import type { GenType } from '../Gens';
import type { LevelSchemaFactoryType } from '../IfLevelSchemaFactory';



const introduction_gen = ({
	gen_type: 'LinearGen',
	pages: [
		{
			type: 'IfPageTextSchema',
			description: `
				This tutorial introduces you to the <code>OR</code> function.
				<ul>
					<li>Use <code>OR</code> inside of logical tests</li>
					<li>Use <code>OR</code> inside of an <code>IF</code> function.</li>
				</ul>
				`
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





const if5 = ({
	code: 'if5',
	title: 'IF5: OR',
	description: 'Use OR',
	harsons_randomly_on_username: false,
	predict_randomly_on_username: false,
	
	version: 2.1,

	
	gen: ({
		gen_type: 'LinearGen',
		pages: [
			introduction_gen,
			makeInertiaGenFromKC(kc_if_or_logic),
			
			ReviewNextConcept,
			makeInertiaGenFromKC(kc_if_or),

			donePage,

			...finish_questions
		]
	})
	
});


export { if5 };




/*
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
						{ has: 'functions', args: [ 'andor2', 'IF', 'not']},
						{ has: 'references', args: [ 'b1', 'c1', 'd1']},
						{ has: 'symbols', args: [ 'comparison?'] },
						{ has: 'values', args: ['Y', 'N', 'number?'] }
					],
					versions: [

						{
							description: 'Say "Y" if we have at least 5 bald eagle sales <b>and</b> at least 50 cat sales.  Say "N" otherwise',
							solution_f: '=IF(AND(b1>=5, c1>=50), "Y", "N")',
						},
						{
							description: 'Say "Y" if we have at over 5 Bald Eagles <b>or</b> over 50 cats sold.  Say "N" otherwise',
							solution_f: '=IF(OR(b1>5, c1>50), "Y", "N")',
						},
						{
							description: 'Do we have either less than 10 bald eagle or 50 cat sales? If so, say "Y", or otherwise say "N"',
							solution_f: '=IF(OR(c1<50, b1<10), "Y", "N")',
						},
						{
							description: 'Do we have both 50 bald eagles and cats <i>each</i>? If so, return "Y", or otherwise "N"',
							solution_f: '=IF(AND(c1>50, b1>50), "Y", "N")',
						},
						{
							description: 'Do <i>either</i> of bald eagles or cats have less than 50 sales? If so, return "Y", or otherwise "N"',
							solution_f: '=IF(OR(c1<50, b1<50), "Y", "N")',
						},
						{
							description: 'Do we have at least 20 of <i>each</i> animal? If so, return "Y" (or "N" otherwise)',
							solution_f: '=IF(AND(b1>=20, c1>=20), "Y", "N")',
						},
						{
							description: 'Does <i>any one</i> of the animals have sales of 10 or under? If so, return "Y" (or "N" otherwise)',
							solution_f: '=IF(OR(b1<10, c1<10), "Y", "N")',
						},
						{
							description: 'Did we sell under 10 bald eagles, but still earn over 500 profit?  Say "Y" or "N"',
							solution_f: '=IF(AND(b1<10, d1>500), "Y", "N")',
						},					
						{
							description: 'Do we have more bald eagle sales than cat sales?  Say "Y" if so, or "N" otherwise.',
							solution_f: '=IF(b1>c1, "Y", "N")',
						},
						{
							description: 'Do we <b>not</b> have equal cat and bald eagle sales?  Say "Y" or "N"',
							solution_f: '=IF(NOT(b1=c1), "Y", "N")',
						},
						{
							description: 'Are bald eagle sales between 5 and 10 (inclusive)? Say "Y" or "N"',
							solution_f: '=IF(AND(B1>=5, B1<=10), "Y", "N")',
						},
						{
							description: 'Are bald eagle sales between 5 and 10 (exclusive)? Say "Y" or "N"',
							solution_f: '=IF(AND(B1>5, B1<10), "Y", "N")',
						},
						{
							description: 'Are cat sales between 50 and 100 (inclusive)? Say "Y" or "N"',
							solution_f: '=IF(AND(c1>=50, c1<=100), "Y", "N")',
						},
						{
							description: 'Are cat sales between 50 and 100 (exclusive)? Say "Y" or "N"',
							solution_f: '=IF(AND(c1>50, c1<100), "Y", "N")',
						},				
						{
							description: 'Are profits between 1,000 and 3,000 (inclusive)? Say "Y" or "N"',
							solution_f: '=IF(AND(d1>=1000, d1<=3000), "Y", "N")',
						},
						{
							description: 'Are profits between 1,000 and 3,000 (exclusive)? Say "Y" or "N"',
							solution_f: '=IF(AND(d1>1000, d1<3000), "Y", "N")',
						},				
						{
							description: 'Are profits outside of the range 1,000 and 3,000 (do not include 1000 and 3000)? Say "Y" or "N"',
							solution_f: '=IF(OR(d1<1000, d1>3000), "Y", "N")',
						},
						{
							description: 'Are profits outside of the range 1,000 and 3,000 (include 1000 and 3000)? Say "Y" or "N"',
							solution_f: '=IF(OR(d1<=1000, d1>=3000), "Y", "N")',
						}
					]
				}
			]
		}: GenType)
	]
}: GenType);

*/