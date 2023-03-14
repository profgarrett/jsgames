import { KC_NAMES, add_if_undefined } from './../kcs/kc';

//import type { InertiaKC } from './kc';


const tutorial = {
	type: 'IfPageFormulaSchema',
	code: 'tutorial',
    client_f_format: 'boolean',

}
const test = {
    ...tutorial,
	code: 'test',
	instruction: 'Type in the correct formula',
};



///////////////////////////////////////////////////////////////////////////////////////////////////
// AND Logic with Booleans
///////////////////////////////////////////////////////////////////////////////////////////////////




const pig5_data = {
    column_titles: ['Weight Rating', 'Length', 'Male', 'Sold' ],
    tests: [
                { 'a': 'A', b: 2, c: true, d: true }, 
                { 'a': 'B', b: 4, c: false, d: true }, 
                { 'a': 'B', b: 6, c: true, d: true }, 
                { 'a': 'D', b: 7, c: false, d: false }, 
            ],
    column_formats: ['text', '0', 'boolean', 'boolean' ],
};



const pig6_data = {
    column_titles: ['Rating', 'Weight', 'Sold', 'Award Winner' ],
    tests: [
                { 'a': 'A', b: 143, c: true, d: true }, 
                { 'a': 'B', b: 234, c: false, d: true }, 
                { 'a': 'D', b: 89, c: true, d: false }, 
                { 'a': 'A', b: 18, c: true, d: false }, 
            ],
    column_formats: ['text', '0', 'boolean', 'boolean' ],
};



const kc_if_and_boolean_logic = ({
	kc: KC_NAMES.KC_IF_AND_BOOLEAN_LOGIC,
	until_correct: 6,
	until_total: 10,
	tutorial_pages: [

        {	type: 'IfPageTextSchema',
			description: `The previous tutorials taught you how to use <code>AND</code>. 
					<br/><br/>
					Now we will do some more practice, particularly with boolean values.`,
					
		},{	...tutorial,

			description: `For testing booleans, you can write either
                <code>B1=TRUE</code> or <code>B1=FALSE</code>.
                <br/><br/>
                To save time, instead of writing <code>B1=TRUE</code> just put 
                <code>B1</code>.  Since <code>B1</code> is already <code>TRUE</code>, there's no reason
                to test it by writing out the <code>=TRUE</code> portion.  
                <br/><br/>
                To test for male pigs and pigs with a weight rating of "{letter}", write
                <code>=AND(C1, A1="{letter}")</code>. Or, if you want, you can also write it as
                <code>=AND(C1=TRUE, A1="{letter}")</code>, and get the same result.`,
			instruction: 'Write the formula above.',

			solution_f: '=AND(A1="{letter}", C1)',
            client_f_format: 'boolean',

            ...pig5_data,

            template_values: {
                'letter': 'randOf(A,B)',
            },
            feedback: [
                { 'has': 'values', args: ['{letter}' ] },
                { 'has': 'symbols', args: ['=']},
                { 'has': 'functions', args: ['AND'] },
                { 'has': 'references', args: ['A1', 'C1'] },
            ],


		},{	...tutorial,

			description: `Now try creating your own test. 
                <br/><br/>
                Which pigs are female <i>and</i> are under <code>{n}</code> in length?`,
			instruction: 'Create the formula to solve the problem above.  Hint: test for <code>=FALSE</code>!',

			solution_f: '=AND(B1<{n}, C1=FALSE)',
            ...pig5_data,

            template_values: {
                'n': '[5-7]',
            },
            feedback: [
                { 'has': 'values', args: ['{n}' ] },
                { 'has': 'symbols', args: ['=']},
                { 'has': 'functions', args: ['AND'] },
                { 'has': 'references', args: ['B1', 'C1'] },
            ],


		},{	...tutorial,

			description: `Remember that you can do more than 2 conditions.
                <br/><br/>
                Which pigs are male and have a length under <code>{n}</code> and have been sold?`,
			instruction: 'Create the formula to solve the problem above.',

			solution_f: '=AND(c1, b1<{n}, d1)',
            ...pig5_data,

            template_values: {
                'n': '[3-5]',
            },
            feedback: [
                { 'has': 'functions', args: ['AND'] },
                { 'has': 'references', args: ['B1', 'C1', 'D1'] },
            ],


		},{	...tutorial,

			description: `Let's try a textual comparison.
                <br/><br/>
                As a reminder, to find text that is further along in the alphabet than <code>A</code>, 
                write <code>=A1>"A"</code>`,
			instruction: 'Which pigs are female and have a rating further in the alphabet than <code>C</code>?',

			solution_f: '=AND(A1>"C", C1=FALSE)',
            ...pig5_data,

            feedback: [
                { 'has': 'values', args: ['C'] },
                { 'has': 'symbols', args: ['=']},
                { 'has': 'functions', args: ['AND'] },
                { 'has': 'references', args: ['A1', 'C1'] },
            ],


		},{	...tutorial,

			description: `As a reminder, <code>AND</code> is useful for testing to see if a number (or letter)
                is inside of a certain range.
                <br/><br/>
                You will need to write one test to ensure it is over the minimum, 
                and another test to make sure it is under the maximum. 
                <br/><br/>
                Since <code>AND</code> allows you to use three tests, you can test for a boolean,
                as well as making sure that a number is inside of a certain range.
                `,
			instruction: 'Which <b>sold</b> pigs are over <code>{n}</code> and under <code>6</code> in length?',

			solution_f: '=AND(D1, {n}<B1, B1<6)',
            ...pig5_data,

            template_values: {
                'n': '[2-3]',
            },

            feedback: [
                { 'has': 'values', args: ['{n}', '6'] },
                { 'has': 'functions', args: ['AND'] },
                { 'has': 'references', args: ['B1', 'D1'] },
            ], 

		},{	...tutorial,

			description: `Remember the difference between <i>inclusive</i> and <i>exclusive</i>. 
                Inclusive asks you to inclue the end-points, and exclusive asks you to exclude them.
                `,
			instruction: 'Which <b>sold</b> pigs are between <code>{n}</code> and <code>6</code> in length (inclusive)?',

			solution_f: '=AND(D1, {n}<=b1, B1<=6)',
            ...pig5_data,

            template_values: {
                'n': '[2-5]',
            },

            feedback: [
                { 'has': 'values', args: ['{n}', '6'] },
                { 'has': 'functions', args: ['AND'] },
                { 'has': 'references', args: ['B1', 'D1'] },
            ],


		},


	],
	test_pages: [


       {	...test,
            ...pig6_data,
            
			description: `Which pigs were not an award winner and had a weight under <code>{n}</code>?`,

			solution_f: '=AND(D1=FALSE, B1<{n})',
            template_values: {
                'n': '[40-80]',
            },


       },{	...test,
            ...pig6_data,
            
			description: `Which pigs were not an award winner and had a weight equal to <code>{n}</code>?`,

			solution_f: '=AND(D1=FALSE, B1={n})',
            template_values: {
                'n': 'randOf(89,18)',
            },


        },{	...test,
            ...pig6_data,
            
			description: `Which pigs were <i>sold</i> and had a weight over <code>{n}</code>?`,

			solution_f: '=AND(C1, B1>{n})',
            template_values: {
                'n': '[50-120]',
            },

        },{	...test,
            ...pig6_data,
            
			description: `Which pigs were <i>sold</i> and had a rating later in the alphabet than <code>{l}</code>?`,

			solution_f: '=AND(C1, A1>"{l}")',
            template_values: {
                'l': 'randOf(A,B,C)',
            },


        },{	...test,
            ...pig6_data,
            
			description: `Which pigs were <i>sold</i> and had a rating of <code>{l}</code>?`,

			solution_f: '=AND(C1, A1="{l}")',
            template_values: {
                'l': 'randOf(A,B)',
            },

       },{	...test,
            ...pig6_data,
            
			description: `Which pigs were <i>sold</i> and had a weight equal to <code>{n}</code>?`,

			solution_f: '=AND(C1, B1={n})',
            template_values: {
                'n': 'randOf(143,89,18)',
            },

        },{	...test,
            ...pig6_data,
            
			description: `Which pigs were <i>sold</i> and were an award winner?`,

			solution_f: '=AND(C1, D1)',

        },{	...test,
            ...pig6_data,
            
			description: `Which pigs were <i>sold</i> and were not an award winner?`,

			solution_f: '=AND(C1, D1=FALSE)',

       },{	...test,
            ...pig6_data,
            
			description: `Which pigs were <i>sold</i> and had a rating later in the alphabet than <code>{l}</code>?`,

			solution_f: '=AND(C1, A1>"{l}")',
            template_values: {
                'l': 'randOf(A,B,C)',
            },

       },{	...test,
            ...pig6_data,
            
			description: `Which pigs were <i>sold</i> and had a rating of <code>{l}</code>?`,

			solution_f: '=AND(C1, A1="{l}")',
            template_values: {
                'l': 'randOf(A,D)',
            },

       },{	...test,
            ...pig6_data,
            
			description: `Which pigs have a weight between <code>{n}</code> and <code>200</code> (inclusive)?`,

			solution_f: '=AND({n}<=B1, B1<=200)',
            template_values: {
                'n': 'randOf(89,18)',
            },

       },{	...test,
            ...pig6_data,
            
			description: `Which pigs have a weight between <code>{n1}</code> and <code>{n2}</code> (exclusive)?`,

			solution_f: '=AND({n1}<B1, B1<{n1})',
            template_values: {
                'n1': '[50-100]',
                'n2': 'randOf(143, 234)',
            },

       }
	]
}) //: InertiaKC);


add_if_undefined( { kcs: [ KC_NAMES.KC_IF_AND_BOOLEAN_LOGIC ] }, kc_if_and_boolean_logic.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.KC_IF_AND_BOOLEAN_LOGIC ] }, kc_if_and_boolean_logic.test_pages );




///////////////////////////////////////////////////////////////////////////////////////////////////
// AND with booleans
///////////////////////////////////////////////////////////////////////////////////////////////////




const pig8_data = {
    column_titles: ['Rating', 'Children', 'Sold', 'Overweight' ],
    tests: [
                { 'a': 'C', b: 2, c: true, d: true }, 
                { 'a': 'A', b: 5, c: false, d: true }, 
                { 'a': 'A', b: 10, c: true, d: true }, 
                { 'a': 'E', b: 8, c: false, d: false }, 
            ],
    column_formats: ['text', '0', 'boolean', 'boolean' ],
};



const pig9_data = {
    column_titles: ['Rating', 'Price', 'Gold Award', 'Sold' ],
    tests: [
                { 'a': 'A', b: 1430, c: true, d: true }, 
                { 'a': 'B', b: 2304, c: false, d: true }, 
                { 'a': 'D', b: 809, c: true, d: false }, 
                { 'a': 'A', b: 818, c: true, d: false }, 
            ],
    column_formats: ['text', '$', 'boolean', 'boolean' ],
};



const kc_if_and_boolean = ({
	kc: KC_NAMES.KC_IF_AND_BOOLEAN,
	until_correct: 6,
	until_total: 10,
	tutorial_pages: [


        {	type: 'IfPageTextSchema',
			description: `It's time to work on putting <code>AND</code> inside of 
                     <code>IF</code>. 
                    <br/><br/>
                    Again, remember to match the parenthesis! You will need to make sure 
                    that you close the <code>AND</code> function <i>before</i> the comma.
                    <br/><br/>
                    As a reminder, your function should look something like: <br/>
                    <code>=IF(
                        AND(<i>logical_test1</i>, <i>logical_test2</i>, ...), 
                        <i>return_if_true</i>, <i>return_if_false</i>)</code>
                    <br/><br/>
                    You can use one, two, or more logical tests inside of <code>AND</code>.
                    `,
					
		},{	...tutorial,

			description: `Why don't you write a function that tests for pigs with over <code>{n}</code> children
                who also are overweight?
                <br/><br/>
                Have the function return <code>{iftrue}</code> is this is correct, or <code>{iffalse}</code> if not.
                <br/><br/>
                Your formula should look like <code>=IF(AND(<i>logical_test1</i>, <i>logical_test2</i>), 
                <i>true_output</i>, <i>false_output</i>)</code>.`,
			instruction: 'Write the formula described above.',

			solution_f: '=IF(AND(B1>"{n}", D1),"{iftrue}", "{iffalse}")',
            client_f_format: 'text',

            ...pig8_data,

            template_values: {
                'n': '[2-7]',
                'iftrue': 'randOf(Yes,Correct,Yup)',
                'iffalse': 'randOf(No,Incorrect,Nope)',
            },
            feedback: [
                { 'has': 'values', args: ['{n}','{iffalse}', '{iftrue}' ] },
                { 'has': 'symbols', args: ['>']},
                { 'has': 'functions', args: ['AND','IF'] },
                { 'has': 'references', args: ['B1', 'D1'] },
            ],


		},{	...tutorial,

			description: `Try another problem! Calculate the price for each pig. Those who have 
                a rating of <code>{l}</code>, and who have <b>not</b> sold
                should have a price of <code>{iftrue}</code>,
                 and all others <code>{iffalse}</code>.
                `,
			instruction: 'Write the formula described above.',

			solution_f: '=IF(AND(A1="{l}", C1=FALSE),{iftrue}, {iffalse})',
            client_f_format: '$',

            ...pig8_data,

            template_values: {
                'l': 'randOf(A,E)',
                'iftrue': '[10-20]',
                'iffalse': '[30-40]',
            },
            feedback: [
                { 'has': 'values', args: ['{l}','{iffalse}', '{iftrue}' ] },
                { 'has': 'symbols', args: ['=']},
                { 'has': 'functions', args: ['AND','IF'] },
                { 'has': 'references', args: ['A1', 'C1'] },
            ],


		},{	...tutorial,

			description: `Good! Try a problem with three logical tests. 
                Find all pigs with under <code>{n}</code> children, who are overweight, and have been sold.
                <br/><br/>
                Have the function return <code>{iftrue}</code> dollars is this is correct, or <code>{iffalse}</code> if not.
                `,
			instruction: 'Write the formula described above.',

			solution_f: '=IF(AND(B1<{n}, C1, D1),{iftrue}, {iffalse})',
            client_f_format: '$',

            ...pig8_data,

            template_values: {
                'n': '[6-9]',
                'iftrue': '[100-200]',
                'iffalse': '[300-400]',
            },
            feedback: [
                { 'has': 'values', args: ['{n}', '{iffalse}', '{iftrue}' ] },
                { 'has': 'symbols', args: ['<']},
                { 'has': 'functions', args: ['AND','IF'] },
                { 'has': 'references', args: ['B1', 'C1', 'D1'] },
            ],

		},{	...tutorial,

			description: `Let's use <code>AND</code> to test if a number is inside
                of a certain range. 
                Find all pigs with between <code>2</code> and <code>8</code> children 
                (inclusive), who are also overweight.
                <br/><br/>
                Hint: This will require three separate tests! You need one for the lower boundary,
                one for the upper boundary, and one for the overweight status.
                <br/><br/>
                Have the function return <code>{iftrue}</code> dollars is this is correct, or <code>{iffalse}</code> if not.
                `,
			instruction: 'Write the formula described above.',

			solution_f: '=IF(AND(2<=B1, B1<=8, D1), {iftrue}, {iffalse})',
            client_f_format: '$',

            ...pig8_data,

            template_values: {
                'iftrue': '[100-200]',
                'iffalse': '[300-400]',
            },
            feedback: [
                { 'has': 'values', args: ['2', '8', '{iffalse}', '{iftrue}' ] },
                { 'has': 'functions', args: ['AND','IF'] },
                { 'has': 'references', args: ['B1', 'D1'] },
            ],

		},

	],
	test_pages: [

        {	...test,
            ...pig9_data,
            
			description: `Which pigs were unsold and had a price over <code>{n}</code>?
                <br/><br/>
                Have the function return <code>{iftrue}</code> is this is correct, 
                or <code>{iffalse}</code> if not.
                `,

			solution_f: '=IF(AND(D1=FALSE, B1>{n}),{iftrue}, {iffalse})',
            client_f_format: '$',

            template_values: {
                'n': '[810-817]',
                'iftrue': '[10-20]',
                'iffalse': '[30-40]',
            },

       },{	...test,
            ...pig9_data,
            
			description: `Which pigs were gold winners and had a price under <code>{n}</code>?
                <br/><br/>
                Have the function return <code>{iftrue}</code> is this is correct, or <code>{iffalse}</code> if not.
                `,

			solution_f: '=IF(AND(C1, B1<{n}),{iftrue}, {iffalse})',
            client_f_format: '$',

            template_values: {
                'n': '[900-1200]',
                'iftrue': '[10-20]',
                'iffalse': '[30-40]',
            },

        },{	...test,
            ...pig9_data,
            
			description: `Which pigs were gold winners but were not sold?
                <br/><br/>
                Have the function return <code>{iftrue}</code> is this is correct, or <code>{iffalse}</code> if not.
                `,

			solution_f: '=IF(AND(C1, D1=FALSE),"{iftrue}", "{iffalse}")',
            client_f_format: 'text',

            template_values: {
                'iftrue': 'randOf(Success,Excellent,Profit)',
                'iffalse': 'randOf(Bad,Unsuccessful,Unprofitable)',
            },

       },{	...test,
            ...pig9_data,
            
			description: `Which pigs were gold award winners with price between <code>{n}</code> 
                and <code>{n2}</code>?
                <br/><br/>
                Have the function return <code>{iftrue}</code> is this is correct, 
                or <code>{iffalse}</code> if not.`,

			solution_f: '=IF(AND(C1, {n}<B1, B1<{n2}),"{iftrue}", "{iffalse}")',
            client_f_format: 'text',

            template_values: {
                'n': '[810-815]',
                'n2': '[1200-1400]',
                'iftrue': 'randOf(Inside,Met)',
                'iffalse': 'randOf(Outside,Not met)',
            },

       },{	...test,
            ...pig9_data,
            
			description: `Which pigs were not sold, and had a price between <code>{n}</code> 
                and <code>{n2}</code>?
                <br/><br/>
                Have the function return <code>{iftrue}</code> is this is correct, or 
                <code>{iffalse}</code> if not.`,

			solution_f: '=IF(AND(D1=FALSE, {n}<B1, B1<{n2}),"{iftrue}", "{iffalse}")',
            client_f_format: 'text',

            template_values: {
                'n': '[810-815]',
                'n2': '[1000-1100]',
                'iftrue': 'randOf(Inside,Met)',
                'iffalse': 'randOf(Outside,Not met)',
            },

        },{	...test,
            ...pig9_data,
            
			description: `Which pigs were unsold with a rating of <code>{l}</code>?
                <br/><br/>
                Have the function return <code>{iftrue}</code> is this is correct, 
                or <code>{iffalse}</code> if not.`,

			solution_f: '=IF(AND(D1=FALSE, A1="{l}"),"{iftrue}", "{iffalse}")',
            client_f_format: 'text',

            template_values: {
                'l': 'randOf(A,B)',
                'iftrue': 'randOf(Poor market fit,Bad market fit)',
                'iffalse': 'randOf(Good market fit,Ok market fit)',
            },

       },{	...test,
            ...pig9_data,
            
			description: `Which pigs were award winners with a rating later in the alphabet 
                than <code>{l}</code>?
                <br/><br/>
                Have the function return <code>{iftrue}</code> is this is correct, 
                or <code>{iffalse}</code> if not.`,

			solution_f: '=IF(AND(C1, A1>"{l}"),"{iftrue}", "{iffalse}")',
            client_f_format: 'text',

            template_values: {
                'l': 'randOf(A,B,C)',
                'iftrue': 'randOf(West,South,East)',
                'iffalse': 'randOf(North,Unknown)',
            },

       }

	]
}) //: InertiaKC);


add_if_undefined( { kcs: [ KC_NAMES.KC_IF_AND_BOOLEAN ] }, kc_if_and_boolean.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.KC_IF_AND_BOOLEAN ] }, kc_if_and_boolean.test_pages );








///////////////////////////////////////////////////////////////////////////////////////////////////
// OR and boolean
///////////////////////////////////////////////////////////////////////////////////////////////////



const pig1_data = {
    column_titles: ['Weight Rating', 'Length', 'Male', 'Age (months)' ],
    tests: [
                { 'a': 'A', b: 2, c: true, d: 13 }, 
                { 'a': 'B', b: 3, c: false, d: 20 }, 
                { 'a': 'B', b: 5, c: true, d: 14 }, 
                { 'a': 'D', b: 4, c: false, d: 12 }, 
            ],
    column_formats: ['text', '0', 'boolean', '0' ],
};



const pig2_data = {
    column_titles: ['Weight Rating', 'Length', 'Male', 'Age (months)' ],
    tests: [
                { 'a': 'A', b: 3, c: true, d: 13 }, 
                { 'a': 'B', b: 9, c: false, d: 20 }, 
                { 'a': 'D', b: 4, c: false, d: 12 }, 
                { 'a': 'C', b: 7, c: true, d: 14 }, 
            ],
    column_formats: ['text', '0', 'boolean', '0' ],
};


const kc_if_or_boolean_logic = ({
	kc: KC_NAMES.KC_IF_OR_BOOLEAN,
	until_correct: 4,
	until_total: 10,
	tutorial_pages: [

        {	type: 'IfPageTextSchema',
			description: `You have already learned to use the <code>OR</code> function. 
					<br/><br/>
					This section helps you practice it using booleans and textual comparisons.`,
					
		},{	...tutorial,

			description: `As a reminder,  you can write either
                <code>B1=TRUE</code> or <code>B1=FALSE</code>.
                <br/><br/>
                Or, better yet, write <code>B1</code> instead of <code>B1=TRUE</code> to save time!
                <br/><br/>
                To test for male pigs or pigs that have a weight rating of "{letter}", write
                <code>=OR(A1="{letter}", C1)</code>. Or, if you want, you can also write it as
                <code>=OR(A1="{letter}", C1)</code>, and get the same result.`,
			instruction: 'Write the formula above.',

			solution_f: '=OR(A1="{letter}", C1)',
            client_f_format: 'boolean',

            ...pig1_data,

            template_values: {
                'letter': 'randOf(A,B)',
            },
            feedback: [
                { 'has': 'values', args: ['{letter}' ] },
                { 'has': 'symbols', args: ['=']},
                { 'has': 'functions', args: ['OR'] },
                { 'has': 'references', args: ['A1', 'C1'] },
            ],


		},{	...tutorial,

			description: `Now try creating your own test. 
                <br/><br/>
                Which pigs are male <i>or</i> are under <code>{n}</code> months in age?`,
			instruction: 'Create the formula to solve the problem above.',

			solution_f: '=OR(D1<{n}, C1)',
            client_f_format: 'boolean',

            ...pig1_data,

            template_values: {
                'n': '[15-18]',
            },
            feedback: [
                { 'has': 'values', args: ['{n}' ] },
                { 'has': 'symbols', args: ['=']},
                { 'has': 'functions', args: ['OR'] },
                { 'has': 'references', args: ['D1', 'C1'] },
            ],


		},{	...tutorial,

			description: `Remember that you can do more than 2 conditions.
                <br/><br/>
                Which pigs are exactly <code>12</code> <i>or</i> <code>13</code> 
                <i>or</i> <code>20</code> months in age?`,
			instruction: 'Create the formula to solve the problem above.',

			solution_f: '=OR(D1=12, D1=13, D1=20)',
            client_f_format: 'boolean',

            ...pig1_data,

            feedback: [
                { 'has': 'symbols', args: ['=']},
                { 'has': 'functions', args: ['OR'] },
                { 'has': 'references', args: ['D1'] },
            ],



		},{	...tutorial,

			description: `Let's try a textual comparison.
                <br/><br/>
                As a reminder, to find text that is further along in the alphabet than <code>A</code>, 
                write <code>=A1>"A"</code>`,
			instruction: 'Which pigs are either female or have a rating further in the alphabet than <code>A</code>?',

			solution_f: '=OR(A1>"A", C1=FALSE)',
            client_f_format: 'boolean',

            ...pig1_data,

            feedback: [
                { 'has': 'values', args: ['A' ] },
                { 'has': 'symbols', args: ['=']},
                { 'has': 'functions', args: ['OR'] },
                { 'has': 'references', args: ['A1', 'C1'] },
            ],

		},


	],
	test_pages: [

        {	...test,
            ...pig2_data,
            
			description: `Which pigs were male or had a length over <code>{n}</code>?`,

			solution_f: '=OR(C1, B1>{n})',
            template_values: {
                'n': 'randOf(4,5,6)',
            },

       },{	...test,
            ...pig2_data,
            
			description: `Which pigs were female or had a length under <code>{n}</code>?`,

			solution_f: '=OR(C1=FALSE, B1<{n})',
            client_f_format: 'boolean',

            template_values: {
                'n': 'randOf(4,5,6)',
            },

        },{	...test,
            ...pig2_data,
            
			description: `Which pigs were male or had a age over <code>{n}</code>?`,

			solution_f: '=OR(C1=TRUE, D1>{n})',
            client_f_format: 'boolean',

            template_values: {
                'n': '[15-19]',
            },

       },{	...test,
            ...pig2_data,
            
			description: `Which pigs were female or had a age equal to <code>{n}</code>?`,

			solution_f: '=OR(C1=FALSE, D1={n})',
            client_f_format: 'boolean',

            template_values: {
                'n': 'randOf(13,14)',
            },


        },{	...test,
            ...pig2_data,
            
			description: `Which pigs were male or had a weight rating of <code>{l}</code>?`,

			solution_f: '=OR(C1, A1="{l}")',
            client_f_format: 'boolean',

            template_values: {
                'l': 'randOf(D,B)',
            },

       },{	...test,
            ...pig2_data,
            
			description: `Which pigs were female or had a weight rating later in the alphabet than <code>{l}</code>?`,

			solution_f: '=OR(C1=FALSE, A1>"{l}")',
            client_f_format: 'boolean',

            template_values: {
                'l': 'randOf(A,B)',
            },


       },{	...test,
            ...pig2_data,
            
			description: `Which pigs had an age of <code>13</code>, <code>12</code>, or <code>20</code>?`,

			solution_f: '=OR(d1=12, d1=13, d1=20)',
            client_f_format: 'boolean',

       },{	...test,
            ...pig2_data,
            
			description: `Which pigs were female or had a weight rating of <code>{l}</code> or <code>C</code>?`,

			solution_f: '=OR(C1=FALSE, A1="{l}", A1="C")',
            client_f_format: 'boolean',

            template_values: {
                'l': 'randOf(A,D)',
            },

       }

	]
}) //: InertiaKC);


add_if_undefined( { kcs: [ KC_NAMES.KC_IF_OR_BOOLEAN_LOGIC ] }, kc_if_or_boolean_logic.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.KC_IF_OR_BOOLEAN_LOGIC ] }, kc_if_or_boolean_logic.test_pages );





///////////////////////////////////////////////////////////////////////////////////////////////////
// OR and IF
///////////////////////////////////////////////////////////////////////////////////////////////////



const pig3_data = {
    column_titles: ['Feed Type', 'Height (inches)', 'Had Children', 'Price' ],
    tests: [
                { 'a': 'A', b: 24, c: true, d: 130 }, 
                { 'a': 'B', b: 30, c: false, d: 200 }, 
                { 'a': 'C', b: 31, c: true, d: 187 }, 
                { 'a': 'E', b: 38, c: false, d: 48 }, 
            ],
    column_formats: ['text', '0', 'boolean', '$' ],
};



const pig4_data = {
    column_titles: ['Rating', 'Price', 'Sold', 'Age (years)' ],
    tests: [
                { 'a': 'A', b: 38, c: true, d: 1 }, 
                { 'a': 'B', b: 100, c: true, d: 2 }, 
                { 'a': 'D', b: 50, c: false, d: 2 }, 
                { 'a': 'C', b: 87, c: true, d: 3 }, 
            ],
    column_formats: ['text', '$', 'boolean', '0' ],
};




const kc_if_or_boolean = ({
	kc: KC_NAMES.KC_IF_OR_BOOLEAN,
	until_correct: 6,
	until_total: 10,
	tutorial_pages: [

        {	type: 'IfPageTextSchema',
			description: `It's time to work on putting <code>OR</code> inside of 
                    the <code>IF</code> function. 
                    <br/><br/>
                    Again, remember to match the parenthesis! You will need to make sure 
                    that you close the <code>OR</code> function <i>before</i> the comma.
                    <br/><br/>
                    As a reminder, your function should look something like <code>=IF(
                        OR(<i>logical_test1</i>, <i>logical_test2</i>, ...), 
                        <i>return_if_true</i>, <i>return_if_false</i>)</code>.
                    <br/><br/>
                    You can use one, two, or more logical tests inside of an <code>OR</code> function.
                    `,
					
		},{	...tutorial,

			description: `Why don't you write a function that tests for pigs with children
                or those with a feed type of <code>{letter}</code>?
                <br/><br/>
                Have the function return <code>{iftrue}</code> dollars is this is correct, 
                or <code>{iffalse}</code> if not.
                <br/><br/>
                Your formula should look like <code>=IF(OR(<i>logical_test1</i>, <i>logical_test2</i>), 
                <i>true_output</i>, <i>false_output</i>)</code>.`,
			instruction: 'Write the formula described above.',

			solution_f: '=IF(OR(A1="{letter}", C1),{iftrue}, {iffalse})',
            client_f_format: '$',

            ...pig3_data,

            template_values: {
                'letter': 'randOf(B,E)',
                'iftrue': '[10-20]',
                'iffalse': '[30-40]',
            },
            feedback: [
                { 'has': 'values', args: ['{letter}','{iffalse}', '{iftrue}' ] },
                { 'has': 'symbols', args: ['=']},
                { 'has': 'functions', args: ['OR','IF'] },
                { 'has': 'references', args: ['A1', 'C1'] },
            ],


		},{	...tutorial,

			description: `Try another problem! Find all pigs without children, or those with a height under <code>{n}</code>?
                <br/><br/>
                Have the function return <code>{iftrue}</code> is this is correct, 
                or <code>{iffalse}</code> if not.
                `,
			instruction: 'Write the formula described above.',

			solution_f: '=IF(OR(B1<{n}, C1=FALSE),"{iftrue}", "{iffalse}")',
            client_f_format: 'text',

            ...pig3_data,

            template_values: {
                'n': '[32-37]',
                'iftrue': 'randOf(Yes,Correct,Yup)',
                'iffalse': 'randOf(No,Incorrect,Nope)',
            },
            feedback: [
                { 'has': 'values', args: ['{n}','{iffalse}', '{iftrue}' ] },
                { 'has': 'symbols', args: ['=']},
                { 'has': 'functions', args: ['OR','IF'] },
                { 'has': 'references', args: ['B1', 'C1'] },
            ],


		},{	...tutorial,

			description: `Good! Try a problem with three logical tests. 
                Find all pigs with a height under <code>{n}</code>, or a price of <code>48</code>, 
                or a feed type of <code>{l}</code>.
                <br/><br/>
                Have the function return <code>{iftrue}</code> is this is correct, 
                or <code>{iffalse}</code> if not.
                `,
			instruction: 'Write the formula described above.',

			solution_f: '=IF(OR(B1<{n}, A1="{l}", D1=48),{iftrue}, {iffalse})',
            client_f_format: '$',

            ...pig3_data,

            template_values: {
                'l': 'randOf(B,C)',
                'n': '[25-29]',
                'iftrue': '[10-20]',
                'iffalse': '[30-40]',
            },
            feedback: [
                { 'has': 'values', args: ['{n}','{l}', '{iffalse}', '{iftrue}' ] },
                { 'has': 'symbols', args: ['=']},
                { 'has': 'functions', args: ['OR','IF'] },
                { 'has': 'references', args: ['A1', 'B1', 'D1'] },
            ],

		},

	],
	test_pages: [

        {	...test,
            ...pig4_data,
            
			description: `Which pigs were unsold or had a age over <code>{n}</code>?
                <br/><br/>
                Have the function return <code>{iftrue}</code> is this is correct, 
                or <code>{iffalse}</code> if not.
                `,

			solution_f: '=IF(OR(C1=FALSE, D1>{n}),{iftrue}, {iffalse})',
            client_f_format: '$',

            template_values: {
                'n': 'randOf(1,2)',
                'iftrue': '[10-20]',
                'iffalse': '[30-40]',
            },

       },{	...test,
            ...pig4_data,
            
			description: `Which pigs were unsold or had a price under <code>{n}</code>?
                <br/><br/>
                Have the function return <code>{iftrue}</code> is this is correct, 
                or <code>{iffalse}</code> if not.
                `,

			solution_f: '=IF(OR(C1=FALSE, B1<{n}),{iftrue}, {iffalse})',
            client_f_format: '$',

            template_values: {
                'n': '[40-50]',
                'iftrue': '[10-20]',
                'iffalse': '[30-40]',
            },

        },{	...test,
            ...pig4_data,
            
			description: `Which pigs were unsold or had a age of <code>1</code>?
                <br/><br/>
                Have the function return <code>{iftrue}</code> is this is correct, or <code>{iffalse}</code> if not.
                `,

			solution_f: '=IF(OR(C1=FALSE, D1=1),"{iftrue}", "{iffalse}")',
            client_f_format: 'text',

            template_values: {
                'iftrue': 'randOf(West,South,East)',
                'iffalse': 'randOf(None,North,Other)',
            },

       },{	...test,
            ...pig4_data,
            
			description: `Which pigs were sold or had a age equal to <code>{n}</code>?
                <br/><br/>
                Have the function return <code>{iftrue}</code> is this is correct, or <code>{iffalse}</code> if not.
                `,

			solution_f: '=IF(OR(C1, D1=4),"{iftrue}", "{iffalse}")',
            client_f_format: 'text',

            template_values: {
                'n': 'randOf(38,100,87)',
                'iftrue': 'randOf(Yes,Correct)',
                'iffalse': 'randOf(No,Incorrect,Nope)',
            },

        },{	...test,
            ...pig4_data,
            
			description: `Which pigs were unsold or had a rating of <code>{l}</code>?
                <br/><br/>
                Have the function return <code>{iftrue}</code> is this is correct, or <code>{iffalse}</code> if not.
                `,

			solution_f: '=IF(OR(C1=FALSE, A1="{l}"),"{iftrue}", "{iffalse}")',
            client_f_format: 'text',

            template_values: {
                'l': 'randOf(A,B)',
                'iftrue': 'randOf(Left,Up,Forward)',
                'iffalse': 'randOf(Right,Down,Back)',
            },

       },{	...test,
            ...pig4_data,
            
			description: `Which pigs were unsold or had a rating later in the alphabet than <code>{l}</code>?
                <br/><br/>
                Have the function return <code>{iftrue}</code> is this is correct, or <code>{iffalse}</code> if not.
                `,

			solution_f: '=IF(OR(C1=FALSE, A1>"{l}"),"{iftrue}", "{iffalse}")',
            client_f_format: 'text',

            template_values: {
                'l': 'randOf(A,B)',
                'iftrue': 'randOf(West,South,East)',
                'iffalse': 'randOf(North,Unknown)',
            },

       }


	]
}) //: InertiaKC);


add_if_undefined( { kcs: [ KC_NAMES.KC_IF_OR_BOOLEAN ] }, kc_if_or_boolean.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.KC_IF_OR_BOOLEAN ] }, kc_if_or_boolean.test_pages );






export { 
	kc_if_or_boolean_logic,
	kc_if_or_boolean,
	kc_if_and_boolean_logic,
	kc_if_and_boolean,
};
