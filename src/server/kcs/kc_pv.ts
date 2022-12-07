import { KC_NAMES, add_if_undefined } from './../kcs/kc';


//import type { InertiaKC } from './kc';


const tutorial = {
	type: 'IfPageFormulaSchema',
	code: 'tutorial',
    client_f_format: '$.',
    helpblock: 'PV(<i>rate</i>, <i>nper</i>, <i>pmt</i>, <i>fv</i>)',
};

const test = {
    ...tutorial,
	code: 'test',
	instruction: 'Type in the correct formula',
};


///////////////////////////////////////////////////////////////////////////////////////////////////
// Basic use of PV 
///////////////////////////////////////////////////////////////////////////////////////////////////

/*
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
*/



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
	until_correct: 4,
	until_total: 8,
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
                It is one of the more complex functions.
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
                Great! Now, how would having all of the interest rates being {rate}% instead of <code>C1</code> change your formula?                
                `,
			instruction: 'Write <code>=PV(<i>interest</i>, <i>years</i>, 0, <i>future value</i>)</code>',

			solution_f: '=PV(0.0{rate}, D1, 0, B1)',
            ...prize_data,

            template_values: {
                'rate': '[4-7]',
            },

            feedback: [
                { 'has': 'symbols', args: ['=']},
                { 'has': 'values', args: ['{rate}']},
                { 'has': 'functions', args: ['PV'] },
                { 'has': 'references', args: ['D1', 'B1'] },
            ],



		},{	...tutorial,

			description: `
                Now, try changing all of the future values to {value},000.
                <br/><br/>
                Remember that you should never put commas inside of numbers when
                writing formulas. For example, Excel will think that <code>=SUM( 10, 12,345 )</code>
                means it should add <code>10</code>, <code>12</code>, 
                and <code>345</code>. Instead, write  <code>=SUM( 10, 12345 )</code>.
                `,
			instruction: 'Write <code>=PV(<i>interest</i>, <i>years</i>, 0, <i>future value</i>)</code>',

			solution_f: '=PV(C1, D1, 0, {value}000)',
            ...prize_data,

            template_values: {
                'value': '[4-7]',
            },

            feedback: [
                { 'has': 'symbols', args: ['=']},
                { 'has': 'values', args: ['{value}']},
                { 'has': 'functions', args: ['PV'] },
                { 'has': 'references', args: ['C1', 'D1'] },
            ],
        }

	],
	test_pages: [
        
        {	...test,
            ...pv_quiz_data,
            
			description: `What is the present value for each row?
                <br/><br>
                Hint: <code>=PV(<i>interest</i>, <i>years</i>, 0, <i>future value</i>)</code>`,
			solution_f: '=PV(A1, B1, 0, C1)',

        },{ ...test,
            ...pv_quiz_data,
            
			description: `All of the years were typed in wrong. 
                Change each to {n} years, and then calculate the present value.
                <br/><br>
                Hint: <code>=PV(<i>interest</i>, <i>years</i>, 0, <i>future value</i>)</code>`,
			solution_f: '=PV(A1, {n}, 0, C1)',
            template_values: {
                'n': '[10-20]',
            },

        },{ ...test,
            ...pv_quiz_data,
            
			description: `All of the interest rates were typed in wrong. 
                    Change each to {n}%, and then calculate the present value.
                    <br/><br>
                    Hint: <code>=PV(<i>interest</i>, <i>years</i>, 0, <i>future value</i>)</code>`,
			solution_f: '=PV(0.0{n}, B1, 0, C1)',
            template_values: {
                'n': '[2-7]',
            },

        },{ ...test,
            ...pv_quiz_data,
            
			description: `All of the values  were typed in wrong. 
                    Change each to {n},000, and then calculate the present value.
                    <br/><br>
                    Hint: <code>=PV(<i>interest</i>, <i>years</i>, 0, <i>future value</i>)</code>`,
			solution_f: '=PV(A1, B1, 0, {n}000)',
            template_values: {
                'n': '[2-7]',
            },

        }

	]
}) //: InertiaKC);


add_if_undefined( { kcs: [ KC_NAMES.KC_PV ] }, kc_pv.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.KC_PV ] }, kc_pv.test_pages );






const kc_pv_adjust = ({
	kc: KC_NAMES.KC_PV_ADJUST,
	until_correct: 6,
	until_total: 12,
	tutorial_pages: [

        {	type: 'IfPageTextSchema',
			description: `Now that you've gotten the basis of the <code>PV</code> function, let's try some more
                    complex uses. Before you just took the values as given in the table. Now, it'd be good to 
                    try adjusting them inside of your formula. 
                    `

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

			description: `When you're working with <code>PV</code>, make sure that the 
                <b>time</b> units and <b>interest rates</b> are consistent!
                <br/><br/>
                As an example, what if your yearly interest is 12%, but you want to 
                calculate 6 months (not years). You would need to convert the <i>yearly</i> interest
                into <i>monthly</i> interest by dividing interest by 12.
                <br/><br/>
                Assume that the interest rates shown are yearly, but the periods are monthly. Calculate the 
                present value. Hint: adjust C1!
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

		},{	...tutorial,

			description: `You may also need to convert interest from a monthly value to a yearly value.
                <br/><br/>
                Assume that the interest rates shown are monthly, but the periods are years. Calculate the 
                present value. Hint: multiply C1 by 12!
                `,
			instruction: 'Write <code>=PV(<i>interest</i>, <i>years</i>, 0, <i>future value</i>)</code>',

			solution_f: '=PV(C1*12, D1, 0, B1)',
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
            
			description: `Assuming that periods are shown in months, and interest rates for a year, 
                what is the present value for each row? Hint: adjust the interest rate.`,
			solution_f: '=PV(A1/12, B1, 0, C1)',


        },{ ...test,
            ...pv_quiz_data,
            
			description: `Assuming that periods are shown in years, and interest rates for a month, 
                what is the present value for each row? Hint: adjust the interest rate.`,
			solution_f: '=PV(A1*12, B1, 0, C1)',


        },{ ...test,
            ...pv_quiz_data,
            
			description: 'The prizes have been overstated! Reduce them by {n}0%, and then calculate the present value.',
			solution_f: '=PV(A1, B1, 0, C1*(1-.{n}))',
            template_values: {
                'n': '[2-8]',
            },

        },{ ...test,
            ...pv_quiz_data,
            
			description: 'The prizes have been understated! Increase them by {n}0%, and then calculate the present value.',
			solution_f: '=PV(A1, B1, 0, C1*(1+.{n}))',
            template_values: {
                'n': '[2-8]',
            },

        },{ ...test,
            ...pv_quiz_data,
            
			description: 'The prizes have been understated! Increase them by \${n}00, and then calculate the present value.',
            solution_f: '=PV(A1, B1, 0, C1+{n}00)',
            template_values: {
                'n': '[2-6]',
            },

        },{ ...test,
            ...pv_quiz_data,
            
			description: 'As part of a special promotion, all of the interest rates are being increased by {n}% (add). Calculate the present value.',
			solution_f: '=PV(A1+0.0{n}, B1, 0, C1)',
            template_values: {
                'n': '[2-6]',
            },

        },{ ...test,
            ...pv_quiz_data,
            
			description: 'Unfortunately, all of the years have been overstated. Reduce each by {n} years, and then calculate the present value.',
			solution_f: '=PV(A1, B1-{n}, 0, C1)',
            template_values: {
                'n': '[2-6]',
            },

        }

	]
}) //: InertiaKC);


add_if_undefined( { kcs: [ KC_NAMES.KC_PV_ADJUST ] }, kc_pv_adjust.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.KC_PV_ADJUST ] }, kc_pv_adjust.test_pages );





///////////////////////////////////////////////////////////////////////////////////////////////////
// PV with Annuity
///////////////////////////////////////////////////////////////////////////////////////////////////

/*
const annuity_savings_data = {
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
*/


const annuity_prize_data = {
    column_titles: ['Option', 'Yearly Prize', 'Interest Rate', 'Years' ],
    tests: [
                { 'a': 'A', b: 100, c: 0.01, d: 1 }, 
                { 'a': 'A', b: 100, c: 0.01, d: 3 }, 
                { 'a': 'A', b: 100, c: 0.01, d: 5 }, 
                { 'a': 'B', b: 500, c: 0.15, d: 10 }, 
                { 'a': 'C', b: 1000, c: 0.05, d: 10 }, 
            ],
    column_formats: ['text', '$', '%', '0' ],
};


/*
const annuity_quiz_data = {
    column_titles: ['Interest', 'Payments', 'Value' ],
    tests: [
                { 'a': 0.01, b: 3, c: 1000 }, 
                { 'a': 0.05, b: 15, c: 500 }, 
                { 'a': 0.1, b: 10, c: 1000 }, 
                { 'a': 0.1, b: 1, c: 100 }, 
            ],
    column_formats: ['%', '0', '$' ],
};
*/

const kc_pv_annuity = ({
	kc: KC_NAMES.KC_PV_ANNUITY,
	until_correct: 4,
	until_total: 8,
	tutorial_pages: [


        {	type: 'IfPageTextSchema',
			description: `Now that you've practiced using the <code>PV</code> function to calculate a single
                    value, we will move onto <i>annuities</i>.
                    <br/><br/>
                    An <i>annuity</i> is just a fancy way of saying yearly payments. For example, you may want
                    to calculate how much paying $6,000 a year for 5 years will cost in today's money.
                    <br/><br>
                    You may be tempted to just multiply the numbers of years (<code>5</code>) by the payment (<code>6000</code>).
                    However, this ignores the time value of money!
                    <br/><br/>
                    Instead, you need to reduce the value of each payment by the discount rate for each year. The next section walks
                    you through this process.
                    `
					
		},{	...tutorial,

			description: `
                Let's start by using <code>PV</code> to calculate the <i>present value</i> of a series of $1000 payments.
                <br/><br>
                If you recall, <code>PV</code> has a number of different arguments:
                <ul>
                    <li><i>rate</i>: interest rate</li>
                    <li><i>nper</i>: the number of payments</li>
                    <li><i>pmt</i>: payments being made each period</li>
                    <li><i>fv</i>: future value</li>
                    <li><i>type</i>: if a payment is at the start or end of the period (defaults to end)</li>
                </ul>
                Before, we ignored the <code>pmt</code> value. Now, we want to start using it.
                <br/><br>
                Let's start by calculating the present value of yearly payments. Let's ignore the  interest rate 
                 and instead just put in a test value.
                <br/><br/>
                Note that you get a <b>negative</b> number. Excel is showing how much you 
                would need to give up today (outflow), to get an equal amount in the future (inflow).
                `,
			instruction: 'Write <code>=PV(0.1, d1, b1, 0)</code>',

			solution_f: '=PV(0.1, D1, b1, 0)',
            ...annuity_prize_data,

            feedback: [
                { 'has': 'symbols', args: ['=']},
                { 'has': 'functions', args: ['PV'] },
                { 'has': 'references', args: ['d1', 'b1'] },
            ],


		},{	...tutorial,

			description: `
                Great! Now, how would having all of the prizes being paid in {years} years 
                instead of <code>D1</code> change your formula?                
                `,
			instruction: 'Write <code>=PV(<i>interest</i>, <i>years</i>, <i>annual payment</i>, 0)</code>',

			solution_f: '=PV(C1, {years}, B1, 0)',
            ...annuity_prize_data,

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
                What would the formula be if all of the prizes were \${n}0,000?
                `,
			instruction: 'Write <code>=PV(<i>interest</i>, <i>years</i>, <i>annual payment</i>, 0)</code>',

			solution_f: '=PV(C1, D1, {n}0000, 0)',
            ...annuity_prize_data,

            template_values: {
                'n': '[4-7]',
            },

            feedback: [
                { 'has': 'symbols', args: ['=']},
                { 'has': 'values', args: ['{n}']},
                { 'has': 'functions', args: ['PV'] },
                { 'has': 'references', args: ['C1', 'D1'] },
            ],


		},{	...tutorial,

			description: `
                How would you create a formula if the rate was {n}%?
                `,
			instruction: 'Write <code>=PV(<i>interest</i>, <i>years</i>, <i>annual payment</i>, 0)</code>',

			solution_f: '=PV(0.0{n}, D1, B1, 0)',
            ...annuity_prize_data,

            template_values: {
                'n': '[2-9]',
            },

            feedback: [
                { 'has': 'symbols', args: ['=']},
                { 'has': 'values', args: ['{n}']},
                { 'has': 'functions', args: ['PV'] },
                { 'has': 'references', args: ['D1', 'B1'] },
            ],

        }

	],
	test_pages: [
        
        {	...test,
            ...pv_quiz_data,
            
			description: 'What is the present value for each row?',
			solution_f: '=PV(A1, B1, C1, 0)',


        },{ ...test,
            ...pv_quiz_data,
            
			description: 'The years were not typed correctly. Change each to {n} years, and then calculate the present value.',
			solution_f: '=PV(A1, {n}, C1, 0)',
            template_values: {
                'n': '[10-20]',
            },


        },{ ...test,
            ...pv_quiz_data,
            
			description: 'All of the interest rates were typed in wrong. Change each to {n}%, and then calculate the present value.',
			solution_f: '=PV(0.0{n}, B1, C1, 0)',
            template_values: {
                'n': '[2-7]',
            },



        },{ ...test,
            ...pv_quiz_data,
            
			description: 'Change each amount to ${n},000, and then calculate the present value.',
			solution_f: '=PV(A1, B1, {n}000, 0)',
            template_values: {
                'n': '[2-7]',
            },

        }

	]
})// : InertiaKC);


add_if_undefined( { kcs: [ KC_NAMES.KC_PV_ANNUITY ] }, kc_pv_annuity.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.KC_PV_ANNUITY ] }, kc_pv_annuity.test_pages );





const kc_pv_annuity_adjust = ({
	kc: KC_NAMES.KC_PV_ANNUITY_ADJUST,
	until_correct: 6,
	until_total: 12,
	tutorial_pages: [

        {	type: 'IfPageTextSchema',
			description: `Now that you've gotten the basis of the <code>PV</code> function with annuities, let's try some more
                    complex formulas. Before you just took the values as given in the table. Now, 
                    try adjusting them inside of your formula. 
                    `

		},{	...tutorial,

			description: `
                What if the interest rate goes up? Calculate each prize, assuming that 
                the you will get an additional {int}% interest in addition to the value in Column C.
                `,
			instruction: 'Write <code>=PV(<i>interest</i>, <i>years</i>, <i>annual payment</i>, 0)</code>',

			solution_f: '=PV(C1+0.0{int}, D1, B1, 0)',
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
                What if each of the future payments were overstated? Decrease each prize by
                {n}0%. 
                <br/><br>
                Remember that you can reduce a value by multiplying it by (1-x%). For example, reduce
                a value by 10% by mutiplying it by (1-0.1).
                `,
			instruction: 'Write <code>=PV(<i>interest</i>, <i>years</i>, 0, <i>annual payment</i>)</code>',

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

			description: `Let's make sure that the <b>time</b> is consistent!
                <br/><br/>
                 For example, if your yearly interest is 12%, but you want to 
                calculate compound interest for 6 months, you would need to convert the yearly interest
                into monthly interest (divide by 12).
                <br/><br/>
                Assume that the interest rates shown are yearly, but the periods are monthly. Calculate the 
                present value.
                `,
			instruction: 'Write <code>=PV(<i>interest</i>, <i>years</i>, 0, <i>annual payment</i>)</code>',

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
            
			description: `Assuming that time are shown in months, and interest rates for a month, 
                what is the present value for each row? Hint: adjust the interest rate`,
			solution_f: '=PV(A1*12, B1, C1, 0)',

        },{ ...test,
            ...pv_quiz_data,
            
			description: `Assuming that periods is shown in months, and interest rates for a year, 
                what is the present value for each row? Hint: adjust the interest rate`,
			solution_f: '=PV(A1/12, B1, C1, 0)',

        },{ ...test,
            ...pv_quiz_data,
            
			description: 'The prizes have been overstated! Reduce them by {n}0%, and then calculate the present value.',
			solution_f: '=PV(A1, B1, C1*(1-.{n}), 0)',
            template_values: {
                'n': '[2-8]',
            },

        },{ ...test,
            ...pv_quiz_data,
            
			description: 'The prizes have been understated! Increase them by {n}0%, and then calculate the present value.',
			solution_f: '=PV(A1, B1, C1*(1+.{n}), 0)',
            template_values: {
                'n': '[2-8]',
            },

        },{ ...test,
            ...pv_quiz_data,
            
			description: 'The prizes have been understated! Increase them by \${n}00, and then calculate the present value.',
			solution_f: '=PV(A1, B1, C1+{n}00, 0)',
            template_values: {
                'n': '[2-6]',
            },

        },{ ...test,
            ...pv_quiz_data,
            
			description: 'As part of a special promotion, all of the interest rates are being increased by {n}% (add). Calculate the present value.',
			solution_f: '=PV(A1+0.0{n}, B1, C1, 0)',
            template_values: {
                'n': '[2-6]',
            },

        },{ ...test,
            ...pv_quiz_data,
            
			description: 'Unfortunately, all of the years have been overstated. Reduce each by {n} years, and then calculate the present value.',
			solution_f: '=PV(A1, B1-{n}, C1, 0)',
            template_values: {
                'n': '[2-6]',
            },
        }

	]
})//: InertiaKC);


add_if_undefined( { kcs: [ KC_NAMES.KC_PV_ANNUITY_ADJUST ] }, kc_pv_annuity_adjust.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.KC_PV_ANNUITY_ADJUST ] }, kc_pv_annuity_adjust.test_pages );




export { 
	kc_pv,
	kc_pv_adjust,
    kc_pv_annuity,
    kc_pv_annuity_adjust,
};
