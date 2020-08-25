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
// OR 
///////////////////////////////////////////////////////////////////////////////////////////////////



const product_data = {
    column_titles: ['Region', 'Boston sales', 'Columbus sales', 'Dallas sales' ],
    tests: [
                { 'a': 'West', b: 10, c: 10, d: 0 }, 
                { 'a': 'North', b: 5, c: 10, d: 10 }, 
                { 'a': 'South', b: 3, c: 6, d: 10 }, 
                { 'a': 'East', b: 0, c: 0, d: 0 }, 
            ],
    column_formats: ['text', '0', '0', '0' ],
};


const product2_data = {
    column_titles: ['Region', 'Baltimore sales', 'Chicago sales', 'Denver sales' ],
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



const kc_if_or_logic = ({
	kc: KC_NAMES.KC_IF_OR_LOGIC,
	until_correct: 6,
	until_total: 10,
	tutorial_pages: [

        {	type: 'IfPageTextSchema',
			description: `You should have already completed the tutorial for <code>AND</code>, and be
                    comfortable using it both as a
                    logical test (by itself), as well as in the <code>IF</code> function.
                    <br/><br/>
                    This section introducts a very similar function:  <code>OR</code>. By the end, you
                    should be confident about using it by itself, as well as inside of <code>IF</code>.`
					
		},{	...tutorial,

			description: `
                <code>OR</code> is a function, just like <code>LEN</code> or <code>SUM</code>.  It takes in 
                one or more arguments (parameters), and checks to see if any single one is <code>TRUE</code>. 
                If one more more values passed are <code>TRUE</code>, then the function returns <code>TRUE</code>. 
                Otherwise, it returns <code>FALSE</code>.
                <br/><br/>
                So, if we write <code>=OR(B1=5, C1=5)</code>, Excel will check to see if at least one of the 
                values in <code>B1</code> and <code>C1</code> are equal to 5.
                <br/><br/>
                Eventually, we will want to use this in <code>IF</code> 
                But, for now, focus only on the logical test, returning either <code>TRUE</code> or <code>FALSE</code>.
                `,
			instruction: 'Write a formula that will say <code>TRUE</code> if sales in Boson or Columbus are equal to {n1}.',

			solution_f: '=OR(B1={n1}, D1={n1})',
            ...product_data,

            template_values: {
                'n1': 'randOf(0,10)',
            },
            feedback: [
                { 'has': 'values', args: ['{n1}'] },
                { 'has': 'symbols', args: ['=']},
                { 'has': 'functions', args: ['OR'] },
                { 'has': 'references', args: ['B1', 'D1'] },
            ],

        },{	...tutorial,

			description: `Unlike most functions, and similar to <code>AND</code>, the <code>OR</code> function
                    can take in any number of arguments. 
					For example, all of the following are valid formulas.  Just be sure to separate
					each logical test with a comma.
					<ul>
						<li><code>=OR(A1="West")</code></li>
						<li><code>=OR(A1="West", B1=2)</code></li>
						<li><code>=OR(A1="West", B1=2, C1=3)</code></li>
					</ul>
                    You should also recognize that each test is completely separate. Each must have
                    its own comparison (such as <code>=</code>).`,
			instruction: 'Use <code>OR</code> to test if either {cell1_title} or {cell2_title} are over {n}.',

            client_f_format: 'boolean',
			solution_f: '=OR({cell1_ref}>{n}, {cell2_ref}>{n})',
            ...product_data,

            template_values: {
                'n': '[4-7]',
                'cell1': 'popCell(b1,c1,d1)',
                'cell2': 'popCell(b1,c1,d1)',
            },
            feedback: [
                { 'has': 'values', args: ['{n}'] },
                { 'has': 'symbols', args: ['>']},
                { 'has': 'functions', args: ['OR'] },
                { 'has': 'references', args: ['{cell1_ref}', '{cell2_ref}'] },
            ],


        },{ ...tutorial,

			description: `Let's try using <code>OR</code> with three different logical tests!
                    <br/><br/>
                    This will be the same as before, but just make sure to add another comma after the
                    previous logical test.
                    <br/><br/>
                    As an example, <code>=OR(B1=5, C1=5, D1=5)</code> would test to see if one or more of
                    the regions have sales of exactly $5.`,
			instruction: 'Are sales in any of the regions <i>under</i> {n}?',

            client_f_format: 'boolean',
			solution_f: '=OR(b1<{n}, c1<{n}, d1<{n})',
            ...product_data,

            template_values: {
                'n': '[4-7]',
            },
            feedback: [
                { 'has': 'values', args: ['{n}'] },
                { 'has': 'symbols', args: ['<']},
                { 'has': 'functions', args: ['OR'] },
                { 'has': 'references', args: ['b1', 'c1', 'd1'] },
            ],


        },{ ...tutorial,

			description: `<code>AND</code> can do an unlimited number of comparisons, but each part must be
					a complete logical test.
					<br/><br/>
					So, if wanted to see if <code>A1</code> is <b>outside</b> of the range from 10 to 20, we would need to
					write <code>=OR(a1&lt10, a1&gt20)</code>.`,
            instruction: 'Are {cell1_title} less than 3 or greater than {n2}?',

            client_f_format: 'boolean',
			solution_f: '=OR({cell1_ref}<3, {cell1_ref}>{n2})',
            ...product_data,

            template_values: {
                'n2': '[8-9]',
                'cell1': 'popCell(B1,C1)',
            },
            feedback: [
                { 'has': 'values', args: ['3', '{n2}'] },
                { 'has': 'functions', args: ['OR'] },
                { 'has': 'references', args: ['{cell1_ref}'] },
            ],


        },{ ...tutorial,

			description: `Let's try another problem like the previous one.`,
            instruction: 'Are {cell1_title} outside of the range from {n1} to {n2}? (excluding each number)',

            client_f_format: 'boolean',
			solution_f: '=OR({cell1_ref}<{n1}, {cell1_ref}>{n2})',
            ...product_data,

            template_values: {
                'n1': '[4-6]',
                'n2': '[8-9]',
                'cell1': 'popCell(B1)',
            },
            feedback: [
                { 'has': 'values', args: ['{n1}', '{n2}'] },
                { 'has': 'functions', args: ['OR'] },
                { 'has': 'references', args: ['{cell1_ref}'] },
            ],


		},{	...tutorial,

			description: `As a reminder, we will use the same two special terms as before:
					<ul>
						<li><b>Inclusive</b> means to include the top & bottom numbers. (i.e., 1,2,3,4) </li>
						<li><b>Exclusive</b> means to exclude the top & bottom numbers. (i.e., 2, 3)</li>
					</ul>
					So, if you were asked to test if A1 was outside the range of 1 and 4 <i>inclusive</i>, write<br/>
						<code>=OR(A1>=1, A1<=4)</code>
					</br><br/>
					If you were asked to see if A1 was between 1 and 4 <i>exclusive</i>, <br/> use
						<code>=OR(A1>1, A1<4)</code>
					<br/><br/>
					If you have any trouble remembering this, remember that <i>inclu</i>sive means to <i>inclu</i>de
						the numbers in the problem, and <i>exclu</i>sive means to <i>exclu</i>de them.`,
                
                instruction: 'Are {cell1_title} outside of the range between 3 and 6 (inclusive)?',

                client_f_format: 'boolean',
                solution_f: '=OR({cell1_ref}<=3, {cell1_ref}>=6)',
                ...product2_data,

                template_values: {
                    'cell1': 'popCell(B1,C1,D1)',
                },
                feedback: [
                    { 'has': 'symbols', args: ['<=', '>=']},
                    { 'has': 'functions', args: ['OR'] },
                    { 'has': 'references', args: ['{cell1_ref}'] },
                ],

        },{	type: 'IfPageTextSchema',
			description: `In English, we can talk about logical tests that require us to use <code>OR</code> 
                    in very different ways. Here are some examples that all mean the same thing.
					<br/><br/>
					<ul>
						<li>Either A & B</li>
						<li>One of A, B, & C</li>
						<li>Any of A, B, & C
					</ul>`

		},


	],
	test_pages: [
        
        {	...test,
            ...animals_data,
            
			description: `Do we have have over {n} {cell1_title} or over {n} {cell2_title}?`,

			solution_f: '=OR({cell1_ref}>{n}, {cell2_ref}>{n})',
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'cell2': 'popCell(b1,c1,d1)',
                'n': 'randOf(4,5,6)',
            },

        },{ ...test,
            ...animals_data,
            
			description: `Are either {cell1_title} and {cell2_title} less than {n}?`,

			solution_f: '=OR({cell1_ref}<{n}, {cell2_ref}<{n})',
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'cell2': 'popCell(b1,c1,d1)',
                'n': 'randOf(4,5,6)',
            },

        },{	...test,
            ...animals_data,
            
			description: `Are one of {cell1_title} and {cell2_title} equal to or over {n}?`,

			solution_f: '=OR({cell1_ref}>={n}, {cell2_ref}>={n})',
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'cell2': 'popCell(b1,c1,d1)',
                'n': 'randOf(4,5,6)',
            },

        },{ ...test,
            ...animals_data,
            
			description: `Do we have less than or equal to {n} {cell1_title} or {cell2_title}?`,

			solution_f: '=OR({cell1_ref}<={n}, {cell2_ref}<={n})',
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'cell2': 'popCell(b1,c1,d1)',
                'n': 'randOf(4,5,6)',
            },


        },{ ...test,
            ...animals2_data,
            
			description: `Are {cell1_title} outside of {n1} and {n2} (inclusive)?`,

			solution_f: '=OR({cell1_ref}<={n1}, {cell1_ref}>={n2})',
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'n1': '[1-2]',
                'n2': '[3-4]',
            },


        },{ ...test,
            ...animals2_data,
            
			description: `Do {cell1_title} fall outside of the range from {n1} to {n2} (exclusive)?`,

			solution_f: '=OR({cell1_ref}<{n1}, {cell1_ref}>{n2})',
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'n1': '[1-2]',
                'n2': '[3-4]',
            },


        },{ ...test,
            ...animals2_data,
            
			description: `Are {cell1_title} over {n1} or {cell2_title} under {n2}?`,

			solution_f: '=OR({cell1_ref}>{n1}, {cell2_ref}<={n2})',
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'cell2': 'popCell(b1,c1,d1)',
                'n1': '[1-2]',
                'n2': '[3-4]',
            },


        },{ ...test,
            ...animals2_data,
            
			description: `Are {cell1_title} equal to or over {n1}, or {cell2_title} under or equal to {n2}?`,

			solution_f: '=OR({cell1_ref}>={n1}, {cell2_ref}<={n2})',
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'cell2': 'popCell(b1,c1,d1)',
                'n1': '[1-2]',
                'n2': '[3-4]',
            },

        }

	]
}: InertiaKC);


add_if_undefined( { kcs: [ KC_NAMES.KC_IF_OR_LOGIC ] }, kc_if_or_logic.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.KC_IF_OR_LOGIC ] }, kc_if_or_logic.test_pages );





///////////////////////////////////////////////////////////////////////////////////////////////////
// OR and IF
///////////////////////////////////////////////////////////////////////////////////////////////////


const kc_if_or = ({
	kc: KC_NAMES.KC_IF_OR,
	until_correct: 6,
	until_total: 10,
	tutorial_pages: [

        {	type: 'IfPageTextSchema',
			description: `It's now time to start using <code>OR</code> inside of an <code>IF</code> function.
					<br/><br/>
                    This can be a bit tricky. Be careful to match the parenthesis!`


		},{	...tutorial,

			description: `Let's start by embedding the <code>OR</code> inside of an <code>IF</code>. 
                    If we write <code>=IF(OR(A1&gt5, B1&gt5), 'a', 'b')</code>, 
                    Excel will check to see if the
					values in <code>A1</code> or <code>B1</code> are over 5.  
					If so, then it will return 'a' (and otherwise 'b').`,
			instruction: `Write a formula that will say "Bad" if {cell1_title} or {cell2_title} 
                    are under {n}, or "Ok" otherwise.`,
			
            ...animals_data,

			solution_f: '=IF(OR({cell1_ref}<{n}, {cell1_ref}<{n}), "Bad", "Ok")', 
            template_values: {
                'cell1': 'popCell(a1,b1,c1,d1)',
                'cell2': 'popCell(a1,b1,c1,d1)',
                'n': 'randOf(2,3)',
            },
			feedback: [
				{ 'has': 'values', args: [ '{n}' ] },
				{ 'has': 'references', args: ['{cell1_ref}', '{cell2_ref}'] },
				{ 'has': 'functions', args: ['OR', 'IF'] }
			],
			

		},{	...tutorial,

			description: `Let's try another <code>OR</code> function inside of an <code>IF</code>.
					<br/><br/>
					Test to see if {cell1_title} are equal to or greater than {n}, 
                    <i>or</i> {cell2_title} are equal to or greater than {n}.
                    If either of these are true, say <code>{iftrue}</code>, otherwise say <code>{iffalse}</code>.`,

			instruction: 'Write the formula described above.',
			
            ...animals_data,

			solution_f: '=IF(OR({cell1_ref}>={n}, {cell2_ref}>={n}), "{iftrue}", "{iffalse}")', 
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
				{ 'has': 'functions', args: ['OR', 'if'] }
			],


		},{	...tutorial,

			description: `As another test, try creating a <code>OR</code> that uses three logical tests.
					<br/><br/>
					Look to see if at least one of {cell1_title}, {cell2_title}, and {cell3_title} are equal to or greater than {n}.
                    Say <code>{iftrue}</code> if one of these conditions are <code>TRUE</code>, or <code>{iffalse}</code> otherwise.`,

			instruction: 'Write the formula described above.',
			
            ...animals_data,

			solution_f: '=IF(OR({cell1_ref}>={n}, {cell2_ref}>={n}, {cell3_ref}>={n}), "{iftrue}", "{iffalse}")', 
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
				{ 'has': 'functions', args: ['OR', 'IF'] }
			],


        }

	],
	test_pages: [
        {	...test,
            ...animals_data,
            
			description: `Do we have have over {n} {cell1_title} or over {n} {cell2_title}? 
                <br/><br/>
                Return <code>{iftrue}</code> if this is correct, or <code>{iffalse}</code> if not.`,

			solution_f: '=IF(OR({cell1_ref}>={n}, {cell2_ref}>={n}), "{iftrue}", "{iffalse}")', 
            template_values: {
                'cell1': 'popCell(a1,b1,c1,d1)',
                'cell2': 'popCell(a1,b1,c1,d1)',
                'n': 'randOf(2,3)',
                'iftrue': 'randOf(Yes,Good,Correct)',
                'iffalse': 'randOf(No,Bad,Incorrect)',
            },

        },{ ...test,
            ...animals_data,
            
			description: `Do we have have under {n} {cell1_title} or under {n} {cell2_title}? 
                <br/><br/>
                Return <code>{iftrue}</code> if this is correct, or <code>{iffalse}</code> if not.`,

			solution_f: '=IF(OR({cell1_ref}<{n}, {cell2_ref}<{n}), "{iftrue}", "{iffalse}")', 
            template_values: {
                'cell1': 'popCell(a1,b1,c1,d1)',
                'cell2': 'popCell(a1,b1,c1,d1)',
                'n': 'randOf(2,3)',
                'iftrue': 'randOf(Yes,Good,Correct)',
                'iffalse': 'randOf(No,Bad,Incorrect)',
            },

        },{ ...test,
            ...animals_data,
            
			description: `Do we have have exactly 0 {cell1_title} or 0 {cell2_title}? 
                <br/><br/>
                Return <code>{iftrue}</code> if this is correct, or <code>{iffalse}</code> if not.`,

			solution_f: '=IF(OR({cell1_ref}=0, {cell2_ref}=0), "{iftrue}", "{iffalse}")', 
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'cell2': 'popCell(b1,c1,d1)',
                'iftrue': 'randOf(Yes,Good,Correct)',
                'iffalse': 'randOf(No,Bad,Incorrect)',
            },

        },{ ...test,
            ...animals2_data,
            
			description: `Do {cell1_title} fall outside of the range {n1} and {n2} (inclusive)?
                <br/><br/>
                Return <code>{iftrue}</code> if this is correct, or <code>{iffalse}</code> if not.`,

			solution_f: '=IF(OR({cell1_ref}<={n1}, {cell1_ref}>={n2}), "{iftrue}", "{iffalse}")',
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'n1': '[1-2]',
                'n2': '[3-4]',
                'iftrue': 'randOf(Yes,Correct,Right)',
                'iffalse': 'randOf(Incorrect,No,Wrong)',
            },


        },{ ...test,
            ...animals2_data,
            
			description: `Do {cell1_title} fall outside of the range from 2 to 3 (exclusive)?
                <br/><br/>
                Return <code>{iftrue}</code> if this is correct, or <code>{iffalse}</code> if not.`,

			solution_f: '=IF(OR({cell1_ref}<2, {cell1_ref}>3), "{iftrue}", "{iffalse}")',
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'iffalse': 'randOf(Between,Inside,Yes)',
                'iftrue': 'randOf(Outside,No)',
            },


        },{ ...test,
            ...animals2_data,
            
			description: `Are {cell1_title} over {n1} or {cell2_title} under {n2}?
                <br/><br/>
                Return <code>{iftrue}</code> if this is correct, or <code>{iffalse}</code> if not.`,

			solution_f: '=IF(OR({cell1_ref}>{n1}, {cell2_ref}<={n2}), "{iftrue}", "{iffalse}")', 
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'cell2': 'popCell(b1,c1,d1)',
                'n1': '[2-3]',
                'n2': '[2-3]',
                'iftrue': 'randOf(Yes,Good,Correct)',
                'iffalse': 'randOf(No,Bad,Incorrect)',            },


        },{ ...test,
            ...animals2_data,
            
			description: `Are either {cell1_title} equal to or less than {n1}, or {cell2_title} greater or equal to {n2}?
                <br/><br/>
                Return <code>{iftrue}</code> if this is correct, or <code>{iffalse}</code> if not.`,

			solution_f: '=IF(OR({cell1_ref}<={n1}, {cell2_ref}>={n2}), "{iftrue}", "{iffalse}")',
            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'cell2': 'popCell(b1,c1,d1)',
                'n1': '1',
                'n2': '[3-4]',
                'iftrue': 'randOf(Yes,Good,Correct)',
                'iffalse': 'randOf(No,Bad,Incorrect)',            },

        }

	]
}: InertiaKC);


add_if_undefined( { kcs: [ KC_NAMES.KC_IF_OR ] }, kc_if_or.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.KC_IF_OR ] }, kc_if_or.test_pages );




module.exports = { 
	kc_if_or_logic,
    kc_if_or,
};
