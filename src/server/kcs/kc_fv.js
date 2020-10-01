// @flow
const { KC_NAMES, add_if_undefined } = require('./../kcs/kc.js');

import type { InertiaKC } from './kc';


const tutorial = {
	type: 'IfPageFormulaSchema',
	code: 'tutorial',
    client_f_format: '$.',
    helpblock: 'FV(<i>rate</i>, <i>nper</i>, <i>pmt</i>, <i>pv</i>)',
}

const test = {
    ...tutorial,
	code: 'test',
	instruction: 'Type in the correct formula',
};


///////////////////////////////////////////////////////////////////////////////////////////////////
// Basic use of FV 
///////////////////////////////////////////////////////////////////////////////////////////////////

const savings_data = {
    column_titles: ['Option', 'Deposit', 'Interest Rate', 'Years' ],
    tests: [
                { 'a': 'Mid Interest', b: 1000, c: 0.05, d: 2 }, 
                { 'a': 'High Interest', b: 500, c: 0.10, d: 10 }, 
                { 'a': 'Low Interest', b: 1000, c: 0.01, d: 10 }, 
            ],
    column_formats: ['text', '$', '%', '0' ],
};

const investment_data = {
    column_titles: ['Option', 'Investement', 'Interest Rate', 'Years' ],
    tests: [
                { 'a': 'A', b: 1000, c: 0.01, d: 10 }, 
                { 'a': 'B', b: 500, c: 0.15, d: 10 }, 
                { 'a': 'C', b: 750, c: 0.05, d: 10 }, 
            ],
    column_formats: ['text', '$', '%', '0' ],
};

const fv_quiz_data = {
    column_titles: ['Interest', 'Periods', 'Deposit' ],
    tests: [
                { 'a': 0.01, b: 3, c: 1000 }, 
                { 'a': 0.05, b: 15, c: 500 }, 
                { 'a': 0.1, b: 10, c: 1000 }, 
                { 'a': 0.1, b: 1, c: 100 }, 
            ],
    column_formats: ['%', '0', '$' ],
};




const kc_fv = ({
	kc: KC_NAMES.KC_FV,
	until_correct: 6,
	until_total: 10,
	tutorial_pages: [

		{	...tutorial,

			description: `
                <code>FV</code> is similar to <code>PV</code>, but works in reverse. It shows the <i>future</i> value of
                a <i>current</i> amount.
                <br/><br>
                <code>FV</code> has similar arguments as <code>PV</code>:
                <ul>
                    <li><i>rate</i>: interest rate</li>
                    <li><i>nper</i>: the number of payments</li>
                    <li><i>pmt</i>: payments being made each period</li>
                    <li><i>pv</i>: present value</li>
                    <li><i>type</i>: if a payment is at the start or end of the period (defaults to end)</li>
                </ul>
                We will continue to ignore <i>type</i> and <i>pmt</i> for now.
                <br/><br>
                Let's start by calculating the future value of several investments. 
                Which of the different options will be worth the most?
                <br/><br/>
                Note that you get a <b>negative</b> number. Excel is showing how much a 
                future outflow would match an equivalent inflow today.
                `,
			instruction: 'Write <code>=FV(<i>interest</i>, <i>years</i>, 0, <i>present value</i>)</code>',

			solution_f: '=FV(C1, D1, 0, B1)',
            ...savings_data,

            feedback: [
                { 'has': 'symbols', args: ['=']},
                { 'has': 'functions', args: ['FV'] },
                { 'has': 'references', args: ['C1', 'D1', 'B1'] },
            ],


		},{	...tutorial,

			description: `
                Great! Now, how would setting all of the investment options to use {years} years,
                 instead of <code>D1</code>, change your formula?                
                `,
			instruction: 'Write <code>=FV(<i>interest</i>, <i>years</i>, 0, <i>present value</i>)</code>',

			solution_f: '=FV(C1, {years}, 0, B1)',
            ...savings_data,

            template_values: {
                'years': '[4-7]',
            },

            feedback: [
                { 'has': 'symbols', args: ['=']},
                { 'has': 'values', args: ['{years}']},
                { 'has': 'functions', args: ['FV'] },
                { 'has': 'references', args: ['C1', 'B1'] },
            ],


		},{	...tutorial,

			description: `
                What if the interest rate goes up? Calculate each option, assuming that 
                the you will get an additional {int}% interest in addition to the value in Column C.
                `,
			instruction: 'Write <code>=FV(<i>interest</i>, <i>years</i>, 0, <i>present value</i>)</code>',

			solution_f: '=FV(C1+0.0{int}, D1, 0, B1)',
            ...savings_data,

            template_values: {
                'int': '[2-9]',
            },

            feedback: [
                { 'has': 'symbols', args: ['=']},
                { 'has': 'values', args: ['{int}']},
                { 'has': 'functions', args: ['FV'] },
                { 'has': 'references', args: ['C1', 'D1', 'B1'] },
            ],


		},{	...tutorial,

			description: `
                One more! What if each of the deposits values were overstated? Decrease each by
                {n}0%.
                `,
			instruction: 'Write <code>=FV(<i>interest</i>, <i>years</i>, 0, <i>present value</i>)</code>',

			solution_f: '=FV(C1, D1, 0, B1*(1-0.{n}))',
            ...savings_data,

            template_values: {
                'n': '[2-5]',
            },

            feedback: [
                { 'has': 'symbols', args: ['=']},
                { 'has': 'functions', args: ['FV'] },
                { 'has': 'references', args: ['C1', 'D1', 'B1'] },
            ],


		},{	...tutorial,

			description: `When you're working with <code>FV</code>, make sure that the <b>time</b> is consistent!
                <br/><br/>
                 For example, your 12% interest could be per <b>years</b>, but you want to 
                calculate monthly compounding interest. you would need to convert the yearly interest
                into monthly interest (divide by 12).
                <br/><br/>
                Assume that the interest rates shown are yearly, but the periods are monthly. Calculate the 
                future value.
                `,
			instruction: 'Write <code>=FV(<i>interest</i>, <i>years</i>, 0, <i>present value</i>)</code>',

			solution_f: '=FV(C1/12, D1, 0, B1)',
            ...savings_data,

            feedback: [
                { 'has': 'symbols', args: ['=']},
                { 'has': 'values', args: ['12']},
                { 'has': 'functions', args: ['FV'] },
                { 'has': 'references', args: ['C1', 'D1', 'B1'] },
            ],
		},


	],
	test_pages: [
        
        {	...test,
            ...fv_quiz_data,
            
			description: `What is the future value for each row?`,
			solution_f: '=FV(A1, B1, 0, C1)',

        },{ ...test,
            ...fv_quiz_data,
            
			description: `Assuming that periods is shown in months, and interest rates for a year, 
                what is the future value for each row?`,
			solution_f: '=FV(A1/12, B1, 0, C1)',


        },{ ...test,
            ...fv_quiz_data,
            
			description: `Assuming that periods is shown in years, and interest rates for a month, 
                what is the future value for each row?`,
			solution_f: '=FV(A1*12, B1, 0, C1)',


        },{ ...test,
            ...fv_quiz_data,
            
			description: `The depoits have been overstated! Reduce them by {n}0%, and then calculate the future value.`,
			solution_f: '=FV(A1, B1, 0, C1*(1-.{n}))',
            template_values: {
                'n': '[2-8]',
            },

        },{ ...test,
            ...fv_quiz_data,
            
			description: `The deposits have been understated! Increase them by {n}0%, and then calculate the future value.`,
			solution_f: '=FV(A1, B1, 0, C1*(1+.{n}))',
            template_values: {
                'n': '[2-8]',
            },

        },{ ...test,
            ...fv_quiz_data,
            
			description: `The deposits have been understated! Increase them by \${n}00, and then calculate the future value.`,
			solution_f: '=FV(A1, B1, 0, C1+{n}00)',
            template_values: {
                'n': '[2-6]',
            },

        },{ ...test,
            ...fv_quiz_data,
            
			description: `As part of a special promotion, all of the interest rates are being increased by {n}% (add). 
                Calculate the future value.`,
			solution_f: '=FV(A1+0.0{n}, B1, 0, C1)',
            template_values: {
                'n': '[2-6]',
            },

        },{ ...test,
            ...fv_quiz_data,
            
			description: `Unfortunately, all of the years have been overstated. Reduce each by {n} years, and then 
                calculate the future value.`,
			solution_f: '=FV(A1, B1-{n}, 0, C1)',
            template_values: {
                'n': '[2-6]',
            },


        },{ ...test,
            ...fv_quiz_data,
            
			description: `All of the years were typed in wrong. Change each to {n} years, and then calculate the future value.`,
			solution_f: '=FV(A1, {n}, 0, C1)',
            template_values: {
                'n': '[10-20]',
            },


        },{ ...test,
            ...fv_quiz_data,
            
			description: `All of the interest rates were typed in wrong. Change each to {n}%, and then calculate the future value.`,
			solution_f: '=FV(0.0{n}, B1, 0, C1)',
            template_values: {
                'n': '[2-7]',
            },

        }

	]
}: InertiaKC);


add_if_undefined( { kcs: [ KC_NAMES.KC_FV ] }, kc_fv.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.KC_FV ] }, kc_fv.test_pages );





///////////////////////////////////////////////////////////////////////////////////////////////////
// FV with Annuity
///////////////////////////////////////////////////////////////////////////////////////////////////



const kc_fv_annuity = ({
	kc: KC_NAMES.KC_FV_ANNUITY,
	until_correct: 6,
	until_total: 10,
	tutorial_pages: [

	],
	test_pages: [
        
	]
}: InertiaKC);


add_if_undefined( { kcs: [ KC_NAMES.KC_FV_ANNUITY ] }, kc_fv_annuity.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.KC_FV_ANNUITY ] }, kc_fv_annuity.test_pages );




module.exports = { 
	kc_fv,
    kc_fv_annuity,
};
