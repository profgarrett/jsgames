// @flow
const { KC_NAMES, add_if_undefined } = require('./../kcs/kc.js');

import type { InertiaKC } from './kc';


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
// AND 
///////////////////////////////////////////////////////////////////////////////////////////////////



const product_data = {
    column_titles: ['Region', 'NY Sales', 'CA Sales', 'NV Sales' ],
    tests: [
                { 'a': 'West', b: 10, c: 10, d: 0 }, 
                { 'a': 'North', b: 5, c: 10, d: 10 }, 
                { 'a': 'South', b: 3, c: 6, d: 10 }, 
                { 'a': 'East', b: 0, c: 0, d: 0 }, 
            ],
    column_formats: ['text', '0', '0', '0' ],
};


const product2_data = {
    column_titles: ['Region', 'NY Sales', 'CA Sales', 'NV Sales' ],
    tests: [
                { 'a': 'West', b: 1, c: 9, d: 1 }, 
                { 'a': 'North', b: 3, c: 6, d: 6 }, 
                { 'a': 'South', b: 6, c: 3, d: 9 }, 
                { 'a': 'East', b: 9, c: 1, d: 3 }, 
            ],
    column_formats: ['text', '0', '0', '0' ],
};


const animals_data = {
    column_titles: ['Angelfish', 'Bald Eagles', 'Cats', 'Ducks' ],
    tests: [
                { 'a': 0, b: 10, c: 10, d: 0 }, 
                { 'a': 4, b: 5, c: 10, d: 10 }, 
                { 'a': 0, b: 3, c: 6, d: 5 }, 
                { 'a': 1, b: 0, c: 0, d: 0 }, 
            ],
    column_formats: ['0', '0', '0', '0' ],
};

const animals2_data = {
    column_titles: ['Angelfish', 'Bald Eagles', 'Cats', 'Ducks' ],
    tests: [
                { 'a': 1, b: 2, c: 2, d: 4 }, 
                { 'a': 2, b: 3, c: 3, d: 3 }, 
                { 'a': 3, b: 4, c: 1, d: 1 }, 
                { 'a': 4, b: 1, c: 4, d: 2 }, 
            ],
    column_formats: ['0', '0', '0', '0' ],
};



const kc_if_and_logic = ({
	kc: KC_NAMES.KC_IF_AND_LOGIC,
	until_correct: 6,
	until_total: 10,
	tutorial_pages: [

        {	type: 'IfPageTextSchema',
			description: `The previous tutorials taught you how to make a single comparison between two values
					using <code>=</code>, <code>&gt</code>, <code>&lt</code>, <code>&gt=</code>, 
					and <code>&lt=</code>
					<br/><br/>
					This tutorial will show you how to have multiple logical comparisons.
					This requires us to use the functions <code>AND</code> and <code>NOT</code>.`
					
		},{	...tutorial,

			description: `For now, we will start by focusing just on the logical test, returning either
                <code>TRUE</code> or <code>FALSE</code>.
                <br/><br/>
                <code>AND</code> is a function, just like <code>LEN</code> or <code>SUM</code>.  It takes in 
                one or more arguments (parameters), and checks to see if they are all <code>TRUE</code>.
                If any value passed is <code>FALSE</code>, then the function returns <code>FALSE</code>. Otherwise, 
                it returns <code>TRUE</code>.

                <br/><br/>
                So, if we write <code>=AND(B1=5, C1=5)</code>, Excel will check to see if the
                values in <code>B1</code> and <code>C1</code> are <b>both</b> equal to 5.`,
			instruction: 'Write a formula that will say TRUE if sales in NY and CA are equal to {n1}.',

			solution_f: '=AND(B1={n1}, C1={n1})',
            ...product_data,

            template_values: {
                'n1': 'randOf(0,10)',
            },
            feedback: [
                { 'has': 'values', args: ['{n1}'] },
                { 'has': 'symbols', args: ['=']},
                { 'has': 'functions', args: ['AND'] },
                { 'has': 'references', args: ['B1', 'C1'] },
            ],

        },{	...tutorial,

			description: `Unlike most functions, <code>AND</code> can take in any number of arguments. 
					For example, all of the following are valid formulas.  Just be sure to separate
					each logical test with a comma.
					<ul>
						<li><code>=AND(A1="West")</code></li>
						<li><code>=AND(A1="West", B1=2)</code></li>
						<li><code>=AND(A1="West", B1=2, C1=3)</code></li>
					</ul>
                    You should also recognize that each test is completely separate. Each must have
                    its own comparison (i.e., <code>=</code> or <code>></code>).`,
			instruction: 'Use <code>AND</code> to test if {cell1_title} and {cell2_title} are both over {n}.',

            client_f_format: 'boolean',
			solution_f: '=AND({cell1_ref}>{n}, {cell2_ref}>{n})',
            ...product_data,

            template_values: {
                'n': '[2-5]',
                'cell1': 'popCell(b1,c1,d1)',
                'cell2': 'popCell(b1,c1,d1)',
            },
            feedback: [
                { 'has': 'values', args: ['{n}'] },
                { 'has': 'symbols', args: ['>']},
                { 'has': 'functions', args: ['AND'] },
                { 'has': 'references', args: ['{cell1_ref}', '{cell2_ref}'] },
            ],


        },{ ...tutorial,

			description: `Let's try using <code>AND</code> with three different logical tests!
                    <br/><br/>
                    This will be very similar to earlier formulas, but you will need to to add 
                    another comma and logical test.
                    <br/><br/>
                    As an example, <code>=AND(B1=5, C1=5, D1=5)</code> would test to see if each region 
                    has sales of exactly $5.`,
			instruction: 'Are sales in all regions under {n}?',

            client_f_format: 'boolean',
			solution_f: '=AND(b1<{n}, c1<{n}, d1<{n})',
            ...product_data,

            template_values: {
                'n': '[4-7]',
            },
            feedback: [
                { 'has': 'values', args: ['{n}'] },
                { 'has': 'symbols', args: ['<']},
                { 'has': 'functions', args: ['AND'] },
                { 'has': 'references', args: ['b1', 'c1', 'd1'] },
            ],


        },{ ...tutorial,

			description: `<code>AND</code> can do an unlimited number of comparisons, but each part must be
					a complete logical test.
					<br/><br/>
					So, if wanted to see if <code>A1</code> is <b>between</b> 10 and 20, we would need to
					write <code>=AND(a1&gt10, a1&lt20)</code>.  
					<br/><br/>
					In most math problems, you can write
					10&lta1&lt20.  However, that doesn't work in Excel.  You must split the comparison 
					into two separate tests: <code>a1&gt10</code>, and <code>a1&lt20</code>.`,
            instruction: 'Are {cell1_title} greater than 3 and less than {n2}?',

            client_f_format: 'boolean',
			solution_f: '=AND({cell1_ref}>3, {cell1_ref}<{n2})',
            ...product_data,

            template_values: {
                'n2': '[8-9]',
                'cell1': 'popCell(B1,C1,D1)',
            },
            feedback: [
                { 'has': 'values', args: ['3', '{n2}'] },
                { 'has': 'symbols', args: ['<', '>']},
                { 'has': 'functions', args: ['AND'] },
                { 'has': 'references', args: ['{cell1_ref}'] },
            ],


        },{ ...tutorial,

			description: `Let's try another problem like the previous one.`,
            instruction: 'Are {cell1_title} between {n1} and {n2}?',

            client_f_format: 'boolean',
			solution_f: '=AND({cell1_ref}>{n1}, {cell1_ref}<{n2})',
            ...product_data,

            template_values: {
                'n1': '[2-4]',
                'n2': '[8-9]',
                'cell1': 'popCell(B1,C1)',
            },
            feedback: [
                { 'has': 'values', args: ['{n1}', '{n2}'] },
                { 'has': 'functions', args: ['AND'] },
                { 'has': 'references', args: ['{cell1_ref}'] },
            ],


		},{	...tutorial,

			description: `Another issue is the ambiguous nature of the word <i>between</i>.  
					If we say to "pick a number <i>between</i> 1 and 4", most people would generally include both the 1 and 4.  
						However, if say "<i>what numbers</i> are between 1 and 4", we would usually respond 2 and 3.
					</br><br/>
					To be clearer, we use two special terms:
					<ul>
						<li><b>Inclusive</b> means to include the top & bottom numbers. (i.e., 1,2,3,4) </li>
						<li><b>Exclusive</b> means to exclude the top & bottom numbers. (i.e., 2, 3)</li>
					</ul>
					So, if you were asked to test if A1 was between 1 and 4 <i>inclusive</i>, write<br/>
						<code>=AND(1<=A1, A1<=4)</code>
					</br><br/>
					If you were asked to see if A1 was between 1 and 4 <i>exclusive</i>, <br/> use
						<code>=AND(1<A1, A1<4)</code>
					<br/><br/>
					If you have any trouble remembering this, remember that <i>inclu</i>sive means to <i>inclu</i>de
						the numbers in the problem, and <i>exclu</i>sive means to <i>exclu</i>de them.`,
                
                instruction: 'Are {cell1_title} between 3 and 6 (inclusive)?',

                client_f_format: 'boolean',
                solution_f: '=AND({cell1_ref}>=3, {cell1_ref}<=6)',
                ...product2_data,

                template_values: {
                    'cell1': 'popCell(B1,C1)',
                },
                feedback: [
                    { 'has': 'functions', args: ['AND'] },
                    { 'has': 'references', args: ['{cell1_ref}'] },
                ],

        },{	type: 'IfPageTextSchema',
			description: `In English, we can talk about logical tests that require us to use <code>AND</code> 
                    in very different ways. Here are some examples that all mean the same thing.
					<br/><br/>
					<ul>
						<li>Both A & B</li>
						<li>All of A, B, & C</li>
						<li>Each of A, B, & C
						<li>Every one of A, B, & C
					</ul>`

		},


	],
	test_pages: [
        
        {	...test,
            ...animals_data,
            
			description: `Do we have have over {n} {cell1_title} and over {n} {cell2_title}?`,

			solution_f: '=AND({cell1_ref}>{n}, {cell2_ref}>{n})',
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'cell2': 'popCell(b1,c1,d1)',
                'n': 'randOf(4,5,6)',
            },

        },{ ...test,
            ...animals_data,
            
			description: `Are {cell1_title} and {cell2_title} both less than {n}?`,

			solution_f: '=AND({cell1_ref}<{n}, {cell2_ref}<{n})',
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'cell2': 'popCell(b1,c1,d1)',
                'n': 'randOf(4,5,6)',
            },

        },{	...test,
            ...animals_data,
            
			description: `Are both {cell1_title} and {cell2_title} equal to or over {n}?`,

			solution_f: '=AND({cell1_ref}>={n}, {cell2_ref}>={n})',
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'cell2': 'popCell(b1,c1,d1)',
                'n': 'randOf(4,5,6)',
            },

        },{ ...test,
            ...animals_data,
            
			description: `Do we have less than or equal to {n} {cell1_title} and {cell2_title}?`,

			solution_f: '=AND({cell1_ref}<={n}, {cell2_ref}<={n})',
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'cell2': 'popCell(b1,c1,d1)',
                'n': 'randOf(4,5,6)',
            },


        },{ ...test,
            ...animals2_data,
            
			description: `Do {cell1_title} number between {n1} and {n2} (inclusive)?`,

			solution_f: '=AND({cell1_ref}>={n1}, {cell1_ref}<=3)',
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'n1': '[1-2]',
            },


        },{ ...test,
            ...animals2_data,
            
			description: `Do {cell1_title} number between {n1} and 4 (exclusive)?`,

			solution_f: '=AND({cell1_ref}>{n1}, {cell1_ref}<4)',
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'n1': '[1-2]',
            },


        },{ ...test,
            ...animals2_data,
            
			description: `Are {cell1_title} over {n1} and {cell2_title} under {n2}?`,

			solution_f: '=AND({cell1_ref}>{n1}, {cell2_ref}<={n2})',
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'cell2': 'popCell(b1,c1,d1)',
                'n1': '[1-2]',
                'n2': '[3-4]',
            },


        },{ ...test,
            ...animals2_data,
            
			description: `Are {cell1_title} equal to or over {n1}, and {cell2_title} under or equal to {n2}?`,

			solution_f: '=AND({cell1_ref}>={n1}, {cell2_ref}<={n2})',
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'cell2': 'popCell(b1,c1,d1)',
                'n1': '[1-2]',
                'n2': '[3-4]',
            },

        }

	]
}: InertiaKC);


add_if_undefined( { kcs: [ KC_NAMES.KC_IF_AND_LOGIC ] }, kc_if_and_logic.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.KC_IF_AND_LOGIC ] }, kc_if_and_logic.test_pages );




///////////////////////////////////////////////////////////////////////////////////////////////////
// AND with NOT
///////////////////////////////////////////////////////////////////////////////////////////////////





const animals3_data = {
    column_titles: ['Angelfish', 'Bald Eagles', 'Cats', 'Ducks' ],
    tests: [
                { 'a': 2, b: 3, c: 3, d: 3 }, 
                { 'a': 1, b: 2, c: 2, d: 4 }, 
                { 'a': 4, b: 1, c: 4, d: 2 }, 
                { 'a': 3, b: 4, c: 1, d: 1 }, 
            ],
    column_formats: ['0', '0', '0', '0' ],
};


const kc_if_and_not_logic = ({
	kc: KC_NAMES.KC_IF_AND_NOT_LOGIC,
	until_correct: 3,
	until_total: 6,
	tutorial_pages: [

		{	...tutorial,

			description: `Now that you understand how to use <code>AND</code>, we can also look at 
                    combining it with the <code>NOT</code> function. 
                    <br/><br/>
                    The <code>NOT</code> function is very simple, it just reverses a <code>TRUE</code>
                    into a <code>FALSE</code>, and a <code>FALSE</code> into a <code>TRUE</code>.

                    Let's start with a simple <code>NOT</code> function. Let's make sure that
                    {cell1_title} are not equal to {n1}. 
                    `,
            
            instruction: 'Write <code>=NOT({cell1_ref}={n1})',

			solution_f: '=NOT({cell1_ref}={n1})',
            ...animals3_data,

            template_values: {
                'cell1': 'popCell(a1,b1,c1,d1)',
                'n1': '[2-3]',
            },
            feedback: [
                { 'has': 'values', args: ['{n1}'] },
                { 'has': 'symbols', args: ['=']},
                { 'has': 'functions', args: ['NOT'] },
                { 'has': 'references', args: ['{cell1_ref}'] },
            ],


        },{	...tutorial,

			description: `Let's combine <code>AND</code> and <code>NOT</code>
                    <br/><br/>
                    
                    Use <code>AND</code> to test 
                    when {cell1_title} is <b>not</b> equal to {n1}, 
                    as well as when {cell2_title} is <b>not</b> equal to {n1}. 
                    `,
            
            instruction: 'Your function should look something like <code>=AND( NOT(...), NOT(...) )</code>',

			solution_f: '=AND(NOT({cell1_ref}={n1}), NOT({cell2_ref}={n1}) )',
            ...animals3_data,

            template_values: {
                'cell1': 'popCell(a1,b1,c1,d1)',
                'cell2': 'popCell(a1,b1,c1,d1)',
                'n1': '[2-3]',
            },
            feedback: [
                { 'has': 'values', args: ['{n1}'] },
                { 'has': 'symbols', args: ['=']},
                { 'has': 'functions', args: ['NOT'] },
                { 'has': 'references', args: ['{cell1_ref}', '{cell1_ref}'] },
            ],


        },{	...tutorial,

			description: `Since the <code>AND</code> function can use multiple logical tests, 
                    there may be times when you'll use <code>NOT</code> for only a single 
                    logical test.
                    <br/><br/>
                    Write a function making sure that {cell1_title} are not equal to {n1}, and that {cell2_title}
                    are over 2.
                    `,
            
            instruction: 'Your function should look something like <code>=AND( NOT(...),  ... )</code>',

			solution_f: '=AND(NOT({cell1_ref}={n1}), {cell2_ref}>2 )',
            ...animals3_data,

            template_values: {
                'cell1': 'popCell(a1,b1,c1,d1)',
                'cell2': 'popCell(a1,b1,c1,d1)',
                'n1': '[2-3]',
            },
            feedback: [
                { 'has': 'values', args: ['{n1}'] },
                { 'has': 'symbols', args: ['=' ]},
                { 'has': 'functions', args: ['NOT', 'AND'] },
                { 'has': 'references', args: ['{cell1_ref}', '{cell1_ref}'] },
            ],

        }

	],
	test_pages: [
        
        {	...test,
            ...animals3_data,
            
			description: `Do we have have over {n} {cell1_title} and not exactly {n} {cell2_title}?`,

			solution_f: '=AND({cell1_ref}>{n}, NOT({cell2_ref}={n}))',
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'cell2': 'popCell(b1,c1,d1)',
                'n': 'randOf(2,3)',
            },

        },{	...test,
            ...animals3_data,
            
			description: `Do we have have under {n} {cell1_title} and not exactly {n} {cell2_title}?`,

			solution_f: '=AND({cell1_ref}<{n}, NOT({cell2_ref}={n}))',
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'cell2': 'popCell(b1,c1,d1)',
                'n': 'randOf(2,3)',
            },

        },{ ...test,
            ...animals_data,
            
			description: `Are {cell1_title} and {cell2_title} both not equal to {n}?`,

			solution_f: '=AND(NOT({cell1_ref}={n}), NOT({cell2_ref}={n}))',
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'cell2': 'popCell(b1,c1,d1)',
                'n': 'randOf(0)',
            },

        }

	]
}: InertiaKC);


add_if_undefined( { kcs: [ KC_NAMES.KC_IF_AND_NOT_LOGIC ] }, kc_if_and_not_logic.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.KC_IF_AND_NOT_LOGIC ] }, kc_if_and_not_logic.test_pages );






///////////////////////////////////////////////////////////////////////////////////////////////////
// AND and IF
///////////////////////////////////////////////////////////////////////////////////////////////////


const kc_if_and = ({
	kc: KC_NAMES.KC_IF_AND,
	until_correct: 6,
	until_total: 10,
	tutorial_pages: [

        {	type: 'IfPageTextSchema',
			description: `It's now time to start using <code>AND</code> inside of an <code>IF</code> function.
					<br/><br/>
                    This can be a bit tricky. Be careful to match the parenthesis!`

					
		},{	type: 'IfPageTextSchema',
			description: `One of the first things to understand is how to nest functions.
					It's tempting to read a formula like a book, starting at the left and moving to the right.
					However, the computer works differently.  
					<br/><br/>
					Think about how to solve the math problem <code>1 + 2 * 3</code>.  If we read it
					left to right, then we would calculate <code>1 + 2</code> and then <code>3 * 3</code>. 
					But, this would end up with the wrong result!
					<br/><br/>
					When we do a math problem, we follow order of operations.  That says that we should
					multiply before we add.  So, we would multiply <code>2 * 3</code>, and then add 
					the result to <code>1</code>.
					<br/><br/>
					Excel has a similar approach.  Simply stated, it tries to do the inner operations first.
					So, if we were to write <code>=YEAR(NOW())</code>, it first runs <code>NOW()</code>. 
					Once this result is found, it then gives that output as input to the <code>YEAR()</code> function.
					<br/><br/>
					When creating Excel <code>IF</code> functions, we will regularly do this nesting operation.`

		},{	...tutorial,

			description: `Let's start with a fairly simple nesting function with the <code>NOT</code> function.  
                    Let's find all of the regions where {cell1_title} are not equal to 0.
					<br/><br/>
					When you enter <code>=IF(NOT({cell1_ref}=0), "Not equal to zero", "{zero}")</code>, Excel first
					looks at the condition, <code>NOT({cell1_ref}=0)</code>.  After it finds the result of that function,
					it passes the result into the <code>IF</code> function.`,
			
            instruction: 'Enter the formula from above.',
			
            ...product_data,
			
			solution_f: '=IF(NOT({cell1_ref}=0), "Not equal to zero", "{zero}")', 
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'zero': 'randOf(Zero,Ooops,Bad)',
            },
            feedback: [
				{ 'has': 'references', args: ['{cell1_ref}'] },
				{ 'has': 'functions', args: ['not', 'if']},
				{ 'has': 'values', args: ['{zero}']},
			],


		},{	...tutorial,

			description: `Let's try another example.
					<br/><br/>
                    Write a function that returns "{ok}" when the number of {cell1_title}
                    is not equal to 0, and "No" otherwise.`,
			instruction: `Use the IF and NOT functions solve the problem above.`,

            ...animals_data,

			solution_f: '=IF(NOT({cell1_ref}=0), "{ok}", "No")', 
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'ok': 'randOf(Good,Yes,Ok)',
            },
			feedback: [
				{ 'has': 'values', args: ['{ok}', 0 ] },
				{ 'has': 'references', args: ['{cell1_ref}'] },
				{ 'has': 'functions', args: ['if', 'NOT']}
			],


		},{	...tutorial,

			description: `Now that we've practiced embedding a function inside of an <code>IF</code> a few times,
                    try using an <code>AND</code>.
					<br/><br/>
					As an example, if we write <code>=IF(AND(A1&gt5, B1&lt5), 'a', 'b')</code>, 
                    Excel will check to see if the
					values in <code>A1</code> and <code>B1</code> are over 5.  
					If so, then it will return 'a' (and otherwise 'b').`,
			instruction: 'Write a formula that will say "Bad" if {cell1_title} and {cell2_title} are under {n}, or "Ok" otherwise.',
			
            ...animals_data,

			solution_f: '=IF(and({cell1_ref}<{n}, {cell1_ref}<{n}), "Bad", "Ok")', 
            template_values: {
                'cell1': 'popCell(a1,b1,c1,d1)',
                'cell2': 'popCell(a1,b1,c1,d1)',
                'n': 'randOf(2,3)',
            },
			feedback: [
				{ 'has': 'values', args: [ '{n}' ] },
				{ 'has': 'references', args: ['{cell1_ref}', '{cell2_ref}'] },
				{ 'has': 'functions', args: ['and', 'if'] }
			],
			

		},{	...tutorial,

			description: `Let's try another <code>AND</code> function inside of an <code>IF</code>.
					<br/><br/>
					Look to see if {cell1_title} are <i>less</i> than or equal to {n}, 
                    and {cell2_title} are <i>greater</i> than or equal to {n}.
                    If these are both true, return <code>{iftrue}</code>, otherwise <code>{iffalse}</code>.`,

			instruction: 'Write the formula described above.',
			
            ...animals_data,

			solution_f: '=IF(AND({cell1_ref}<={n}, {cell2_ref}>={n}), "{iftrue}", "{iffalse}")', 
            template_values: {
                'cell1': 'popCell(a1,b1,c1,d1)',
                'cell2': 'popCell(a1,b1,c1,d1)',
                'n': 'randOf(2,3)',
                'iftrue': 'randOf(Yes,Good,Correct)',
                'iffalse': 'randOf(No,Bad,Incorrect)',
            },
			feedback: [
				{ 'has': 'values', args: [ '{n}', '{iftrue}', '{iffalse}' ] },
				{ 'has': 'references', args: ['{cell1_ref}', '{cell2_ref}'] },
				{ 'has': 'functions', args: ['and', 'if'] }
			],


		},{	...tutorial,

			description: `As one more test, try creating a <code>AND</code> that uses three logical tests.
					<br/><br/>
					Look to see if {cell1_title}, {cell2_title}, and {cell3_title} are all equal to or greater than {n}.
                    Say <code>{iftrue}</code> if all conditions are <code>TRUE</code>, or <code>{iffalse}</code> otherwise.`,

			instruction: 'Write the formula described above.',
			
            ...animals_data,

			solution_f: '=IF(AND({cell1_ref}>={n}, {cell2_ref}>={n}, {cell3_ref}>={n}), "{iftrue}", "{iffalse}")', 
            template_values: {
                'cell1': 'popCell(a1,b1,c1,d1)',
                'cell2': 'popCell(a1,b1,c1,d1)',
                'cell3': 'popCell(a1,b1,c1,d1)',
                'n': 'randOf(2,3)',
                'iftrue': 'randOf(Yes,Good,Correct)',
                'iffalse': 'randOf(No,Bad,Incorrect)',
            },
			feedback: [
				{ 'has': 'values', args: [ '{n}', '{iftrue}', '{iffalse}' ] },
				{ 'has': 'references', args: ['{cell1_ref}', '{cell2_ref}', '{cell3_ref}'] },
				{ 'has': 'functions', args: ['and', 'if'] }
			],

        }

	],
	test_pages: [
        {	...test,
            ...animals_data,
            
			description: `Do we have have over {n} {cell1_title} and over {n} {cell2_title}? 
                <br/><br/>
                Return <code>{iftrue}</code> if this is correct, or <code>{iffalse}</code> if not.`,

			solution_f: '=IF(AND({cell1_ref}>={n}, {cell2_ref}>={n}), "{iftrue}", "{iffalse}")', 
            template_values: {
                'cell1': 'popCell(a1,b1,c1,d1)',
                'cell2': 'popCell(a1,b1,c1,d1)',
                'n': 'randOf(2,3)',
                'iftrue': 'randOf(Yes,Good,Correct)',
                'iffalse': 'randOf(No,Bad,Incorrect)',
            },

        },{ ...test,
            ...animals_data,
            
			description: `Do we have have under {n} {cell1_title} and under {n} {cell2_title}? 
                <br/><br/>
                Return <code>{iftrue}</code> if this is correct, or <code>{iffalse}</code> if not.`,

			solution_f: '=IF(AND({cell1_ref}<{n}, {cell2_ref}<{n}), "{iftrue}", "{iffalse}")', 
            template_values: {
                'cell1': 'popCell(a1,b1,c1,d1)',
                'cell2': 'popCell(a1,b1,c1,d1)',
                'n': 'randOf(2,3)',
                'iftrue': 'randOf(Yes,Good,Correct)',
                'iffalse': 'randOf(No,Bad,Incorrect)',
            },

        },{ ...test,
            ...animals_data,
            
			description: `Do we have have exactly 0 {cell1_title} and 0 {cell2_title}? 
                <br/><br/>
                Return <code>{iftrue}</code> if this is correct, or <code>{iffalse}</code> if not.`,

			solution_f: '=IF(AND({cell1_ref}=0, {cell2_ref}=0), "{iftrue}", "{iffalse}")', 
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'cell2': 'popCell(b1,c1,d1)',
                'iftrue': 'randOf(Yes,Good,Correct)',
                'iffalse': 'randOf(No,Bad,Incorrect)',
            },

        },{ ...test,
            ...animals2_data,
            
			description: `Do {cell1_title} number between {n1} and {n2} (inclusive)?
                <br/><br/>
                Return <code>{iftrue}</code> if this is correct, or <code>{iffalse}</code> if not.`,

			solution_f: '=IF(AND({cell1_ref}>={n1}, {cell1_ref}<={n2}), "{iftrue}", "{iffalse}")',
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'n1': '[1-2]',
                'n2': '[3-4]',
                'iftrue': 'randOf(Between,Inside,Yes)',
                'iffalse': 'randOf(Outside,No)',
            },


        },{ ...test,
            ...animals2_data,
            
			description: `Do {cell1_title} number between 1 and {n2} (exclusive)?
                <br/><br/>
                Return <code>{iftrue}</code> if this is correct, or <code>{iffalse}</code> if not.`,

			solution_f: '=IF(AND({cell1_ref}>1, {cell1_ref}<{n2}), "{iftrue}", "{iffalse}")',
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'n2': '[3-4]',
                'iftrue': 'randOf(Between,Inside,Yes)',
                'iffalse': 'randOf(Outside,No)',
            },


        },{ ...test,
            ...animals2_data,
            
			description: `Are {cell1_title} over {n1} and {cell2_title} under {n2}?
                <br/><br/>
                Return <code>{iftrue}</code> if this is correct, or <code>{iffalse}</code> if not.`,

			solution_f: '=IF(AND({cell1_ref}>{n1}, {cell2_ref}<={n2}), "{iftrue}", "{iffalse}")', 
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'cell2': 'popCell(b1,c1,d1)',
                'n1': '[1-2]',
                'n2': '[3-4]',
                'iftrue': 'randOf(Yes,Good,Correct)',
                'iffalse': 'randOf(No,Bad,Incorrect)',            },


        },{ ...test,
            ...animals2_data,
            
			description: `Are {cell1_title} under or less than {n1} and {cell2_title} over or greater than {n2}?
                <br/><br/>
                Return <code>{iftrue}</code> if this is correct, or <code>{iffalse}</code> if not.`,

			solution_f: '=IF(AND({cell1_ref}<={n1}, {cell2_ref}>={n2}), "{iftrue}", "{iffalse}")',
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'cell2': 'popCell(b1,c1,d1)',
                'n1': '[2-3]',
                'n2': '[2-3]',
                'iftrue': 'randOf(Yes,Good,Correct)',
                'iffalse': 'randOf(No,Bad,Incorrect)',            },

        }

	]
}: InertiaKC);


add_if_undefined( { kcs: [ KC_NAMES.KC_IF_AND ] }, kc_if_and.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.KC_IF_AND ] }, kc_if_and.test_pages );




module.exports = { 
	kc_if_and_logic,
    kc_if_and_not_logic,
    kc_if_and,
};



/*

NOT




		},
		{	type: 'IfPageFormulaSchema',
			description: `Our final function is <code>OR</code>.  This checks to see
					if <i>any</i> of the values passed are <code>TRUE</code>.  As long as one is <code>TRUE</code>,
					the function will return <code>TRUE</code>. If none are correct, it will return <code>FALSE</code>.
					<br/><br/>
					So, if we write <code>=OR(A1>50, B1>50)</code>, it will check to see if the
					either <code>A1</code> <i>or</i> <code>B1</code> are over 50.`,
			instruction: 'Write a formula that will say TRUE if sales in either region is over 50.',
			column_formats: [ '$', '$' ],
			column_titles: ['Sales NY', 'Sales TX' ],
			tests: [
						{ 'a': randB(80, 100), 'b': randB(10, 100) }, 
						{ 'a': 20, 'b': 80 }, 
						{ 'a': randB(10, 100), 'b': randB(10, 100) }, 
						{ 'a': randB(10, 100), 'b': randB(10, 100) }, 
						{ 'a': 61, 'b': 11 }, 
						{ 'a': randB(80, 100), 'b': randB(80, 100) }, 
					],
			solution_f: '=OR(a1>50, b1>50)', 
			feedback: [
				{ 'has': 'values', args: [ 50 ] },
				{ 'has': 'references', args: ['a1', 'b1'] },
				{ 'has': 'functions', args: ['OR'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `OR can take in any number of arguments. 
					For example, all of the following are valid formulas.  Just be sure to separate
					each logical test with a comma.
					<ul>
						<li><code>=OR(A1=1)</code></li>
						<li><code>=OR(A1=1, B1=2)</code></li>
						<li><code>=OR(A1=1, B1=2, c1=3)</code></li>
					</ul>`,
			instruction: 'Are sales in <i>any single</i> region over 100?',
			column_formats: [ '$', '$', '$' ],
			column_titles: ['Sales NY', 'Sales TX', 'Sales CA' ],
			tests: [
						{ 'a': randB(800, 1000), 'b': randB(10, 100), 'c': randB(3, 40) }, 
						{ 'a': 20, 'b': 10, 'c': 23 }, 
						{ 'a': randB(10, 100), 'b': randB(80, 100), 'c': randB(3, 40) }, 
						{ 'a': randB(10, 100), 'b': randB(110, 1010), 'c': randB(3, 40) }, 
						{ 'a': 61, 'b': 61, 'c': randB(3, 40) }, 
						{ 'a': randB(80, 100), 'b': randB(180, 1100), 'c': randB(113, 1140) }
					],
			solution_f: '=OR(a1>100, b1>100, c1>100)', 
			feedback: [
				{ 'has': 'values', args: [100] },
				{ 'has': 'references', args: ['a1', 'b1', 'c1'] }
			],
			toolbox: [
				{ 'has': 'values', args: [100] },
				{ 'has': 'references', args: ['a1', 'b1', 'c1'] },
				{ 'has': 'functions', args: ['OR3'] },
				{ 'has': 'symbols', args: [ '>'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `Just like <code>AND</code>, <code>OR</code> can do any unlimited number
					 of comparisons, but each part must be completedly separate.
					 <br/><br/>
					 So, if you wants to see if <code>A1</code> is less than 10 or greater than 20,
					 you would write <code>=OR(A1<10, A1>20)</code>.`,
			instruction: 'Are sales in the NY region <b>outside</b> of the range from 50 to 100?',
			column_formats: [ '$' ],
			column_titles: ['Sales NY' ],
			tests: [
						{ 'a': randB(10, 100) }, 
						{ 'a': randB(10, 200) }, 
						{ 'a': randB(10, 100) }, 
						{ 'a': randB(110, 200) }, 
						{ 'a': randB(10, 100) }, 
						{ 'a': randB(10, 100) }, 
						{ 'a': randB(110, 1100) }, 
					],
			solution_f: '=OR(a1<50, a1>100)', 
			feedback: [
				{ 'has': 'values', args: [50, 100] },
				{ 'has': 'references', args: ['a1' ] },
				{ 'has': 'functions', args: ['or'] }
			],
			code: 'tutorial'
		},
        },{	type: 'IfPageTextSchema',
			description: `In English, we can aks for  write <code>AND</code> and <code>OR</code> several different ways.  
					Here are some examples that all mean the same thing.

					<br/><br/>

					<code>AND</code>
					<ul>
						<li>Both A & B</li>
						<li>All of A, B, & C</li>
						<li>Each of A, B, & C
						<li>Every one of A, B, & C
					</ul>

					<code>OR</code>
					<ul>
						<li>Either of A, B, & C</li>
						<li>Any one of A, B, & C</li>
						<li>One or more of A, B, & C</li>
						<li>At least one of A, B, & C</li>
					</ul>`
		},


        },{ ...tutorial,

			description: `We can also use this same approach to see if a number is
                outside of a certain range. Just reverse the direction of the 
                tests, seeing if a number is over the bigger number, or less than 
                the smaller number.`,
            instruction: 'Are sales in {cell1_title} outside of the range {n1} and {n2}?',

            client_f_format: 'boolean',
			solution_f: '=AND({cell1_ref}>{n1}, {cell1_ref}<{n2})',
            ...product_data,

            template_values: {
                'n1': '[4-6]',
                'n2': '[8-9]',
                'cell1': 'popCell(B1,C1,D1)',
            },
            feedback: [
                { 'has': 'values', args: ['{n1}', '{n2}'] },
                { 'has': 'symbols', args: ['<', '>']},
                { 'has': 'functions', args: ['AND'] },
                { 'has': 'references', args: ['{cell1_ref}'] },
            ],
        */