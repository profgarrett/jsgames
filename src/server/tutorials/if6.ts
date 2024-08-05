const { DataFactory } = require('./../../shared/DataFactory');
//const { LinearGen, UntilGen } = require('./../Gens');
const { finish_questions } = require('./../pages/finish_questions');

const { kc_if_and_boolean, kc_if_and_boolean_logic } = require('./../kcs/kc_if_boolean');

const { makeInertiaGenFromKC } = require('./../kcs/kc');


const introduction_gen = ({
	gen_type: 'LinearGen',
	pages: [
		{
			type: 'IfPageTextSchema',
			description: `
				This tutorial has you practice <b>booleans</b> inside of the <code>AND</code> function.
				<ul>
					<li>Use booleans inside of <code>AND</code> </li>
					<li>Use booleans inside of <code>AND</code> embedded into an <code>IF</code></li>
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



const if6 = ({
	code: 'if6',
	title: 'IF6: AND Booleans',
	description: 'Use booleans inside of AND',
	harsons_randomly_on_username: false,
	predict_randomly_on_username: false,
	
	version: 2.1,

	
	gen: ({
		gen_type: 'LinearGen',
		pages: [
			
			introduction_gen,
			makeInertiaGenFromKC(kc_if_and_boolean_logic),
			
			ReviewNextConcept,
			makeInertiaGenFromKC(kc_if_and_boolean),

			donePage,

			...finish_questions
		]
	})
	
});


export { if6 };




/*

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


*/