//const { LinearGen, UntilGen } = require('./../Gens');
const { finish_questions } = require('./../pages/finish_questions');

const { kc_if_return_number, kc_if_return_text } = require('./../kcs/kc_if_return');

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
				This tutorial introduces you to the <code>IF</code> function.
				<ul>
					<li>How does the formula work?</li>
					<li>Returning numbers</li>
					<li>Returning text</li>
				</ul>
				After finishing this section, you'll have a solid grounding in simple 
				<code>IF</code> functions!`
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



const if2 = ({
	code: 'if2',
	title: 'IF2: Returns',
	description: 'Returning numbers and text',
	harsons_randomly_on_username: false,
	predict_randomly_on_username: true,
	version: 2,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			introduction_gen,
			
			makeInertiaGenFromKC(kc_if_return_number),
			ReviewNextConcept, 
			
			makeInertiaGenFromKC(kc_if_return_text),
			donePage, 

			...finish_questions
		]
	})
});


export { if2 };


/*



=====
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




        ======
        {   ...pig_test,
            description: `Which pigs have their <code>{cell1_title}</code> {over} {n}?
                    <br/><br/>
                    You must use the <code>&gt</code> symbol.`,

			solution_f: '={cell1_ref}>{n}', 
            template_values: {
                'cell1': 'popCell(b1,c1)',
                'n': '[2-3]',
                'over': 'randOf(greater than,over,more than)'
            },
            feedback: [
                { 'has': 'values', args: ['{n}'] },
                { 'has': 'symbols', args: ['>']},
                { 'has': 'references', args: ['{cell1_ref}'] }
            ],

        },{ ...pig_test,
            description: `Which pigs have their <code>{cell1_title}</code> {under} {n}?
                    <br/><br/>
                    You must use the <code>&lt</code> symbol.`,

			solution_f: '={cell1_ref}<{n}', 
            template_values: {
                'cell1': 'popCell(b1,c1)',
                'n': '[2-3]',
                'under': 'randOf(less than,under)'
            },
            feedback: [
                { 'has': 'values', args: ['{n}'] },
                { 'has': 'symbols', args: ['<']},
                { 'has': 'references', args: ['{cell1_ref}'] }
            ],

        },{ ...pig_test,
            description: `Which pigs have their <code>{cell1_title}</code> {gte} {n}?
                    <br/><br/>
                    You must use the <code>&gt=</code> symbol.`,

			solution_f: '={cell1_ref}>={n}', 
            template_values: {
                'cell1': 'popCell(b1,c1)',
                'n': '[2-3]',
                'gte': 'randOf(greater than or equal to,equal to or over,at least)'
            },
            feedback: [
                { 'has': 'values', args: ['{n}'] },
                { 'has': 'symbols', args: ['>=']},
                { 'has': 'references', args: ['{cell1_ref}'] }
            ],

        },{ ...pig_test,
            description: `Which pigs have their <code>{cell1_title}</code> {lte} {n}?
                    <br/><br/>
                    You must use the <code>&lt;=</code> symbol.`,

			solution_f: '={cell1_ref}<={n}', 
            template_values: {
                'cell1': 'popCell(b1,c1)',
                'n': '[2-3]',
                'lte': 'randOf(less than or equal to,at or under,at most)'
            },
            feedback: [
                { 'has': 'values', args: ['{n}'] },
                { 'has': 'symbols', args: ['<=']},
                { 'has': 'references', args: ['{cell1_ref}'] }
            ],

        },{ ...pig_test,
            description: 'Which pigs have their <code>{cell1_title}</code> {eq} {n}?',

			solution_f: '={cell1_ref}={n}', 
            template_values: {
                'cell1': 'popCell(b1,c1)',
                'n': '[1-4]',
                'eq': 'randOf(equal to,the same as)'
            },
            feedback: [
                { 'has': 'values', args: ['{n}'] },
                { 'has': 'symbols', args: ['=']},
                { 'has': 'references', args: ['{cell1_ref}'] }
            ],




			*/