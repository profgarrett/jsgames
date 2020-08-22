// @flow
const { KC_NAMES, add_if_undefined } = require('./../kcs/kc.js');

import type { InertiaKC } from './kc';


const pets_data = {
    column_titles: ['Apartment', 'Birds', 'Cats', 'Dogs' ],
    tests: [
                { 'a': 'A', b: 0, c: 0, d: 0 }, 
                { 'a': 'B', b: 2, c: 0, d: 1 }, 
                { 'a': 'C', b: 1, c: 1, d: 1 }, 
                { 'a': 'D', b: 0, c: 0, d: 0 }, 
            ],
    column_formats: ['text', '0', '0', '0' ],
};


const tutorial = {
	type: 'IfPageFormulaSchema',
	code: 'tutorial',

}
const test = {
	type: 'IfPageFormulaSchema',
	code: 'test',
	instruction: 'Type in the correct formula',
    client_f_format: '',
};


///////////////////////////////////////////////////////////////////////////////////////////////////
// Math in Logic 
///////////////////////////////////////////////////////////////////////////////////////////////////

const kc_if_math_logic = ({
	kc: KC_NAMES.KC_IF_MATH_LOGIC,
	until_correct: 6,
	until_total: 10,
	tutorial_pages: [

		{	type: 'IfPageTextSchema',
			description: `A common approach with <code>IF</code> is to embed simple math expressions 
                    inside of the test or results. 
					<br/><br/>
					While you can always split formulas into multiple columns, 
                    embedding simple math expressions can keep related logic together.`

		},{ ...tutorial,

			description: `The first place to embed simple math expressions is in the logical test.
					<br/><br/>
					For example, if we are trying to find find apartments that have at least 1 pet, 
					we would write <code>=IF(B1+C1+D1>{n}, "{Happy}", "{Sad}")</code>.`,
			instruction: 'Write the formula above below.',
			
            ...pets_data,
            client_f_format: 'text',

			solution_f: '=IF(B1+C1+D1>{n}, "{Happy}", "{Sad}")',
            template_values: {
                'n': 'randOf(1,2,3)',
                'Happy': 'randOf(Happy,Excellent)',
                'Sad': 'randOf(Poor,Bad)',
            },
			feedback: [
				{ 'has': 'references', args: ['b1', 'C1', 'D1'] },
				{ 'has': 'values', args: ['{n}', '{Happy}', '{Sad}'] },
			],

		},{	...tutorial,
			description: 'Why don\'t you try this now?',
			instruction: `Write a function that says <code>Ok</code> for apartments with more than
                 or equal to {n} {cell1_title} & {cell2_title} (combined), or <code>NA</code> otherwise.`,

			solution_f: '=if({cell1_ref}+{cell2_ref}>={n}, "Ok", "NA")',

            ...pets_data,
            client_f_format: 'text',

            template_values: {
                'n': 'randOf(1,2)',
                'cell1': 'popCell(B1,C1,D1)',
                'cell2': 'popCell(B1,C1,D1)',
            },
			feedback: [
				{ 'has': 'references', args: ['{cell1_ref}', '{cell2_ref}'] },
				{ 'has': 'values', args: ['{n}'] },
			],
		}

	],
	test_pages: [
        
        {	...test,
            ...pets_data,
            
			description: `Apartments with {less} {n} {cell1_title} and {cell2_title},
                should be charged \${outYes}, and all others \${outNo}.`,

            client_f_format: '$',
			solution_f: '=if({cell1_ref}+{cell2_ref}<{n}, {outYes}, {outNo})',
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'cell2': 'popCell(b1,c1,d1)',
                'n': 'randOf(1,2)',
                'less': 'randOf(under,less than,fewer than)',
                'outYes': 'randOf(100,90,80)',
                'outNo': 'randOf(50,40,30)',
            },

        },{	...test,
            ...pets_data,
            
			description: `Apartments with {more} {n} {cell1_title} and {cell2_title}
                should be charged \${outYes}, and all others \${outNo}.`,

            client_f_format: '$',
			solution_f: '=if({cell1_ref}+{cell2_ref}>{n}, {outYes}, {outNo})',
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'cell2': 'popCell(b1,c1,d1)',
                'n': 'randOf(1,2)',
                'more': 'randOf(over,more than)',
                'outYes': 'randOf(100,90,80)',
                'outNo': 'randOf(50,40,30)',
            },
            
        },{	...test,
            ...pets_data,
            
			description: `Apartments with exactly {n} {cell1_title} and {cell2_title} 
                should be charged \${outYes}, and all others \${outNo}.`,

            client_f_format: '$',
			solution_f: '=if({cell1_ref}+{cell2_ref}={n}, {outYes}, {outNo})',
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'cell2': 'popCell(b1,c1,d1)',
                'n': 'randOf(1,2)',
                'same': 'randOf(exactly)',
                'outYes': 'randOf(100,90,80)',
                'outNo': 'randOf(50,40,30)',
            },
            
        },{	...test,
            ...pets_data,
            
			description: `Apartments with {over} {n} pets
                should be charged \${outYes}, and all others \${outNo}.`,

            client_f_format: '$',
			solution_f: '=if(B1+C1+D1>{n}, {outYes}, {outNo})',
            template_values: {
                'n': 'randOf(1,2)',
                'over': 'randOf(over,more than)',
                'outYes': 'randOf(20,30,40)',
                'outNo': 'randOf(5,10,15)',
            },

        },{	...test,
            ...pets_data,
            
			description: `Apartments with {gte} {n} pets
                should be charged \${outYes}, and all others \${outNo}.`,

            client_f_format: '$',
			solution_f: '=if(B1+C1+D1<={n}, {outYes}, {outNo})',
            template_values: {
                'n': 'randOf(1,2)',
                'gte': 'randOf(at or over,equal to or greater than)',
                'outNo': 'randOf(20,30,40)',
                'outYes': 'randOf(5,10,15)',
            },

        }
	]
}: InertiaKC);


add_if_undefined( { kcs: [ KC_NAMES.KC_IF_MATH_LOGIC ] }, kc_if_math_logic.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.KC_IF_MATH_LOGIC ] }, kc_if_math_logic.test_pages );







const sales_data = {
	column_titles: [ 'Type', 'State', 'Revenue', 'Expenses' ],
	tests: [
			{ 'a': 'High Tech', 'b': 'CA', 'c': 1000, 'd': 500 }, 
			{ 'a': 'Low Tech', 'b': 'CA', 'c': 2000, 'd': 2000 }, 
			{ 'a': 'High Tech',  'b': 'TX', 'c': 3000, 'd': 3500 }, 
			{ 'a': 'Low Tech',  'b': 'TX', 'c': 4000, 'd': 3000 }, 
		],
    column_formats: ['text', 'text', '$', '$'],
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Textual Return
///////////////////////////////////////////////////////////////////////////////////////////////////

const kc_if_math_return = ({
	kc: KC_NAMES.KC_IF_MATH_RETURN,
	until_correct: 6,
	until_total: 14,
	tutorial_pages: [

		{	...tutorial,
			description: `We can also do calculations in the return values.
					<br/><br/>
					For example, let's say we were trying to calculate the commission for a number of sales.
                    Normaly we would pay $10 for a sale, but if the total revenue is over \${rev},
                    we will pay {extra}0% of the revenue instead.
                    <br/>
					You would write <code>=IF(C1>{rev}, 10, c1*0.{extra})</code>.`,
			instruction: 'Write the above formula.',
			
            ...sales_data,
            solution_f: '=IF(C1>{rev}, 10, c1*0.{extra})',
            client_f_format: '$',

            template_values: {
                'rev': 'randOf(1500,2500)',
                'extra': 'randOf(1,2)',
            },
			feedback: [
				{ 'has': 'references', args: ['c1'] },
				{ 'has': 'values', args: ['{profit}', '{extra}', '10'] },
			],

		},{	...tutorial,
			description: `Let's try another similar problem. What if we want to pay a {high}0% commission 
                    (0.{high} of the revenue) for <code>High Tech</code> sales, 
                    or {low}0% (0.{low}) for <code>Low Tech</code>?
                    `,
			instruction: 'Write the IF formula.',
			
             ...sales_data,
            solution_f: '=IF(A1>"High Tech", 0.{high}*c1, 0.{low}*c1)',
            client_f_format: '$',

            template_values: {
                'high': 'randOf(5)',
                'low': 'randOf(2,1)',
            },
			feedback: [
				{ 'has': 'references', args: ['a1'] },
				{ 'has': 'values', args: ['{high}', '{low}' ] },
			],

        },{	...tutorial,
			description: `This technique can be helpful for fixing numbers. Let's say that High Tech
                    revenue is overstated. Decrease them by {n}0%, while leaving Low Tech numbers the same.
                    <br/><br/>
                    Hint: one of your values should just be <code>C1</code>, while the other should be <code>C1</code>
                    multiplied by a number.
                    `,
			instruction: 'Write the IF formula.',
			
             ...sales_data,
            solution_f: '=IF(A1>"High Tech", c1*(1-0.{n}), c1)',
            client_f_format: '$',

            template_values: {
                'n': 'randOf(1,2,3,4)',
            },
			feedback: [
				{ 'has': 'references', args: ['a1', 'c1'] },
				{ 'has': 'values', args: ['{n}' ] },
				{ 'has': 'functions', args: ['if' ] },
			],

        },{	...tutorial,
			description: `We can also do multiple calculations in an <code>IF</code> function. First, calculate 
                    the profit (revenue - expenses). If that is positive (greater than 0), then return the 
                    words <code>Happy</code>.
                    Otherwise, return <code>Sad</code>.
                    `,
			instruction: 'Write the IF formula.',
			
             ...sales_data,
            solution_f: '=IF(c1-d1>0, "Happy", "Sad")',
            client_f_format: '',

            template_values: {
                'n': 'randOf(1,2,3,4)',
            },
			feedback: [
				{ 'has': 'references', args: ['c1', 'd1'] },
				{ 'has': 'functions', args: ['if' ] },
				{ 'has': 'values', args: ['Happy', 'Sad' ] },
			],


        },{	...tutorial,
			description: `When you are working with <code>IF</code> functions, you need to be careful when
                using larger numbers. For example, let's assume that you want to test for rows with 
                <code>Revenue</code> over $1,000.
                <br/><br/>
                You may be tempted to write the logical test as <code>=IF(c1>$1,000, "Yes", "No")</code>.
                However, the comma in the middle of <code>$1,000</code> will confuse Excel into thinking that
                you are going to compare <code>C1</code> with $1.  The comma tells Excel to interpret the
                rest of the number as the "return if true" part of the <code>IF</code> function.
                <br/><br/>
                To fix this, enter numbers <b>without</b> any commas or special symbols. The only symbol
                you can use is the decimal point (i.e., <code>1000.10</code>).
                    `,
			instruction: 'Write an IF formula that returns ${n},000 if expenses are over $2,000 (and zero otherwise).',
			
             ...sales_data,
            solution_f: '=IF(d1>2000, {n}000, 0)',
            client_f_format: '$',

            template_values: {
                'n': 'randOf(1,3,4)',
            },
			feedback: [
				{ 'has': 'references', args: ['d1'] },
				{ 'has': 'values', args: ['{n}000', '2000', '0'] },
				{ 'has': 'functions', args: ['if' ] },
			],


		},


	],
	test_pages: [
        {    ...test,
            ...sales_data,

            description: `The CA revenue numbers were entered incorrectly. Create an IF that 
                increases CA revenue by {increase}0%, but returns TX unchanged.`,

			solution_f: '=IF(B1="CA", d1*(1+.{increase}), d1)', 
            template_values: {
                'increase': 'randOf(1,2,3,4)',
            },

        },{ ...test,
            ...sales_data,

            description: `The TX profit numbers were entered incorrectly. Create an IF that 
                decreases TX profit by {decrease}0%, but returns CA unchanged.`,

			solution_f: '=IF(B1="TX", d1*(1-0.{decrease}), d1)', 
            template_values: {
                'decrease': 'randOf(1,2,3,4)',
            },

        },{ ...test,
            ...sales_data,

            description: `The High Tech expenses should be reduced by {n}0%, and the Low Tech expenses 
                increased by {n}0%.`,

			solution_f: '=IF(A1="High Tech", d1*(1-0.{n}), d1*(1+0.{n}))', 
            template_values: {
                'n': 'randOf(1,2,5)',
            },     

        },{ ...test,
            ...sales_data,

            description: `Calculate the profit or loss for each row. Rows with a profit earn a commission
                of {n}0% of revenue. Rows with a loss earn 0.`,

			solution_f: '=IF(c1-d1>0, 0.{n}*c1, 0 )', 
            template_values: {
                'n': 'randOf(1,2,3)',
            },     

        },{ ...test,
            ...sales_data,

            description: `Calculate the profit or loss for each row. Rows with a profit over $500 
                earn a commission of {n}0% of revenue. Rows with a loss earn 0.`,

			solution_f: '=IF(c1-d1>500, 0.{n}*c1, 0 )', 
            template_values: {
                'n': 'randOf(1,2,3)',
            },     

        },{ ...test,
            ...sales_data,

            description: `Some of the expenses were input incorrectly. Reduce all of the ones over $1,000 
                by \${n}00. Ones under (or equal to) a thousand should be increased by 100`,

			solution_f: '=IF(d1>1000, d1-{n}00, d1+100 )', 
            template_values: {
                'n': 'randOf(3,4,5)',
            },     

        },{ ...test,
            ...sales_data,

            description: `Some of the revenues were input incorrectly. Reduce all of the ones over $1,000 
                by \${n}00. Ones under (or equal to) a thousand should be increased by 500`,

			solution_f: '=IF(c1>1000, c1-{n}00, c1+500 )', 
            template_values: {
                'n': 'randOf(5,10)',
            },     

        },{ ...test,
            ...sales_data,

            description: `Calculate the profit or loss for each <code>{tech}</code> row. Return a zero for
                the other rows.`,

			solution_f: '=IF(a1="{tech}", c1-d1, 0 )', 
            template_values: {
                'tech': 'randOf(High Tech,Low Tech)',
            }

        },
	]
}: InertiaKC);


add_if_undefined( { kcs: [ KC_NAMES.KC_IF_MATH_RETURN ] }, kc_if_math_return.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.KC_IF_MATH_RETURN ] }, kc_if_math_return.test_pages );




module.exports = { 
	kc_if_math_logic,
	kc_if_math_return,
};