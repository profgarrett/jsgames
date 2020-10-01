// @flow
const { KC_NAMES, add_if_undefined } = require('./../kcs/kc.js');

import type { InertiaKC } from './kc';


const tutorial = {
	type: 'IfPageFormulaSchema',
	code: 'tutorial',
    client_f_format: '$.',
    helpblock: 'PV(<i>rate</i>, <i>nper</i>, <i>pmt</i>, <i>fv</i>)',
}

const test = {
    ...tutorial,
	code: 'test',
	instruction: 'Type in the correct formula',
};


///////////////////////////////////////////////////////////////////////////////////////////////////
// Basic use of PV 
///////////////////////////////////////////////////////////////////////////////////////////////////

const savings_data = {
    column_titles: ['Option', 'Deposit', 'Interest Rate', 'Years' ],
    tests: [
                { 'a': '1 Year', b: 1000, c: 0.05, d: 1 }, 
                { 'a': '2 Years', b: 1000, c: 0.05, d: 2 }, 
                { 'a': '3 Years', b: 1000, c: 0.05, d: 3 }, 
                { 'a': '4 Years', b: 1000, c: 0.05, d: 4 }, 
                { 'a': 'High Interest', b: 1000, c: 0.10, d: 10 }, 
                { 'a': 'Low Interest', b: 1000, c: 0.01, d: 10 }, 
            ],
    column_formats: ['text', '$', '%', '0' ],
};



const prize_data = {
    column_titles: ['Option', 'Prize', 'Interest Rate', 'Years' ],
    tests: [
                { 'a': 'A', b: 1000, c: 0.01, d: 10 }, 
                { 'a': 'B', b: 500, c: 0.15, d: 10 }, 
                { 'a': 'C', b: 750, c: 0.05, d: 10 }, 
            ],
    column_formats: ['text', '$', '%', '0' ],
};



const pv_quiz_data = {
    column_titles: ['Interest', 'Payments', 'Value' ],
    tests: [
                { 'a': 0.01, b: 3, c: 1000 }, 
                { 'a': 0.05, b: 15, c: 500 }, 
                { 'a': 0.1, b: 10, c: 1000 }, 
                { 'a': 0.1, b: 1, c: 100 }, 
            ],
    column_formats: ['%', '0', '$' ],
};




const kc_pv = ({
	kc: KC_NAMES.KC_PV,
	until_correct: 6,
	until_total: 10,
	tutorial_pages: [

        {	type: 'IfPageTextSchema',
			description: `You should have already completed the tutorials for calculating compound growth.
                    Those are somewhat long to write, so Excel has a short-cut function called <code>FV</code>.
                    <br/><br/>
                    This function also provides us with a few other options that we will explore later.
                    <br/><br>
                    If you are still uncomfortable with the idea of compound interest, please take a minute to 
                    watch the video below.
                    <br/><br/>
				    <a href='https://www.khanacademy.org/economics-finance-domain/core-finance/interest-tutorial/interest-basics-tutorial/v/introduction-to-interest'
					    target='_blank'>Khan Academy: Introduction to Interest</a>
				    <br/><br/>
				    If you don't understand these concepts, you will find the next sections very difficult to complete.
                    `
					
		},{	...tutorial,

			description: `
                <code>PV</code> is a function that calculates the <i>present value</i> of a future amount.
                It is one of the more complex functions that you will learn.
                <br/><br>
                <code>PV</code> has a number of different arguments:
                <ul>
                    <li><i>rate</i>: interest rate</li>
                    <li><i>nper</i>: the number of payments</li>
                    <li><i>pmt</i>: payments being made each period</li>
                    <li><i>fv</i>: future value</li>
                    <li><i>type</i>: if a payment is at the start or end of the period (defaults to end)</li>
                </ul>
                For now, we will ignore <i>type</i> and <i>pmt</i>.
                <br/><br>
                Let's start by calculating the present value of several prizes. Which of the different options would be worth the most?
                <br/><br/>
                Note that you get a <b>negative</b> number. Excel is showing how much you 
                would need to give up today (outflow), to get an equal amount in the future (inflow).
                `,
			instruction: 'Write <code>=PV(<i>interest</i>, <i>years</i>, 0, <i>future value</i>)</code>',

			solution_f: '=PV(C1, D1, 0, B1)',
            ...prize_data,

            feedback: [
                { 'has': 'symbols', args: ['=']},
                { 'has': 'functions', args: ['PV'] },
                { 'has': 'references', args: ['C1', 'D1', 'B1'] },
            ],


		},{	...tutorial,

			description: `
                Great! Now, how would having all of the prizes being paid in {years} years instead of <code>D1</code> change your formula?                
                `,
			instruction: 'Write <code>=PV(<i>interest</i>, <i>years</i>, 0, <i>future value</i>)</code>',

			solution_f: '=PV(C1, {years}, 0, B1)',
            ...prize_data,

            template_values: {
                'years': '[4-7]',
            },

            feedback: [
                { 'has': 'symbols', args: ['=']},
                { 'has': 'values', args: ['{years}']},
                { 'has': 'functions', args: ['PV'] },
                { 'has': 'references', args: ['C1', 'B1'] },
            ],


		},{	...tutorial,

			description: `
                What if the interest rate goes up? Calculate each prize, assuming that 
                the you will get an additional {int}% interest in addition to the value in Column C.
                `,
			instruction: 'Write <code>=PV(<i>interest</i>, <i>years</i>, 0, <i>future value</i>)</code>',

			solution_f: '=PV(C1+0.0{int}, D1, 0, B1)',
            ...prize_data,

            template_values: {
                'int': '[2-9]',
            },

            feedback: [
                { 'has': 'symbols', args: ['=']},
                { 'has': 'values', args: ['{int}']},
                { 'has': 'functions', args: ['PV'] },
                { 'has': 'references', args: ['C1', 'D1', 'B1'] },
            ],


		},{	...tutorial,

			description: `
                One more! What if each of the future values were overstated? Decrease each prize by
                {n}0%.
                `,
			instruction: 'Write <code>=PV(<i>interest</i>, <i>years</i>, 0, <i>future value</i>)</code>',

			solution_f: '=PV(C1, D1, 0, B1*(1-0.{n}))',
            ...prize_data,

            template_values: {
                'n': '[2-5]',
            },

            feedback: [
                { 'has': 'symbols', args: ['=']},
                { 'has': 'functions', args: ['PV'] },
                { 'has': 'references', args: ['C1', 'D1', 'B1'] },
            ],


		},{	...tutorial,

			description: `When you're working with <code>PV</code>, make sure that the <b>time</b> is consistent!
                <br/><br/>
                 For example, if your yearly interest is 12%, but you want to 
                calculate compound interest for 6 months, you would need to convert the yearly interest
                into monthly interest (divide by 12).
                <br/><br/>
                Assume that the interest rates shown are yearly, but the periods are monthly. Calculate the 
                present value.
                `,
			instruction: 'Write <code>=PV(<i>interest</i>, <i>years</i>, 0, <i>future value</i>)</code>',

			solution_f: '=PV(C1/12, D1, 0, B1)',
            ...prize_data,

            feedback: [
                { 'has': 'symbols', args: ['=']},
                { 'has': 'values', args: ['12']},
                { 'has': 'functions', args: ['PV'] },
                { 'has': 'references', args: ['C1', 'D1', 'B1'] },
            ],
		},


	],
	test_pages: [
        
        {	...test,
            ...pv_quiz_data,
            
			description: `What is the present value for each row?`,
			solution_f: '=PV(A1, B1, 0, C1)',

        },{ ...test,
            ...pv_quiz_data,
            
			description: `Assuming that periods is shown in months, and interest rates for a year, 
                what is the present value for each row?`,
			solution_f: '=PV(A1/12, B1, 0, C1)',


        },{ ...test,
            ...pv_quiz_data,
            
			description: `Assuming that periods is shown in years, and interest rates for a month, 
                what is the present value for each row?`,
			solution_f: '=PV(A1*12, B1, 0, C1)',


        },{ ...test,
            ...pv_quiz_data,
            
			description: `The prizes have been overstated! Reduce them by {n}0%, and then calculate the present value.`,
			solution_f: '=PV(A1, B1, 0, C1*(1-.{n}))',
            template_values: {
                'n': '[2-8]',
            },

        },{ ...test,
            ...pv_quiz_data,
            
			description: `The prizes have been understated! Increase them by {n}0%, and then calculate the present value.`,
			solution_f: '=PV(A1, B1, 0, C1*(1+.{n}))',
            template_values: {
                'n': '[2-8]',
            },

        },{ ...test,
            ...pv_quiz_data,
            
			description: `The prizes have been understated! Increase them by \${n}00, and then calculate the present value.`,
			solution_f: '=PV(A1, B1, 0, C1+{n}00)',
            template_values: {
                'n': '[2-6]',
            },

        },{ ...test,
            ...pv_quiz_data,
            
			description: `As part of a special promotion, all of the interest rates are being increased by {n}% (add). Calculate the present value.`,
			solution_f: '=PV(A1+0.0{n}, B1, 0, C1)',
            template_values: {
                'n': '[2-6]',
            },

        },{ ...test,
            ...pv_quiz_data,
            
			description: `Unfortunately, all of the years have been overstated. Reduce each by {n} years, and then calculate the present value.`,
			solution_f: '=PV(A1, B1-{n}, 0, C1)',
            template_values: {
                'n': '[2-6]',
            },


        },{ ...test,
            ...pv_quiz_data,
            
			description: `All of the years were typed in wrong. Change each to {n} years, and then calculate the present value.`,
			solution_f: '=PV(A1, {n}, 0, C1)',
            template_values: {
                'n': '[10-20]',
            },


        },{ ...test,
            ...pv_quiz_data,
            
			description: `All of the interest rates were typed in wrong. Change each to {n}%, and then calculate the present value.`,
			solution_f: '=PV(0.0{n}, B1, 0, C1)',
            template_values: {
                'n': '[2-7]',
            },

        }

	]
}: InertiaKC);


add_if_undefined( { kcs: [ KC_NAMES.KC_PV ] }, kc_pv.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.KC_PV ] }, kc_pv.test_pages );





///////////////////////////////////////////////////////////////////////////////////////////////////
// PV with Annuity
///////////////////////////////////////////////////////////////////////////////////////////////////


const kc_pv_annuity = ({
	kc: KC_NAMES.KC_PV_ANNUITY,
	until_correct: 6,
	until_total: 10,
	tutorial_pages: [


	],
	test_pages: [
   

	]
}: InertiaKC);


add_if_undefined( { kcs: [ KC_NAMES.KC_PV_ANNUITY ] }, kc_pv_annuity.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.KC_PV_ANNUITY ] }, kc_pv_annuity.test_pages );




module.exports = { 
	kc_pv,
    kc_pv_annuity,
};
