// @flow
const { KC_NAMES, add_if_undefined } = require('./../kcs/kc.js');

import type { InertiaKC } from './kc';


const region_data = {
	column_titles: [ 'Region', 'Managers', 'Sales Staff', 'Employees' ],
	tests: [
			{ 'a': 'North', 'b': 1, 'c': 4, 'd': 5 }, 
			{ 'a': 'South', 'b': 2, 'c': 8, 'd': 10 }, 
			{ 'a': 'East',  'b': 1, 'c': 1, 'd': 2 }, 
			{ 'a': 'West',  'b': 5, 'c': 10, 'd': 15 }, 
		],
    column_formats: ['text', '0', '0', '0'],
};

const tutorial = {
	type: 'IfPageFormulaSchema',
	code: 'tutorial',
    client_f_format: '0',
};
const test = {
	type: 'IfPageFormulaSchema',
	code: 'test',
	instruction: 'Type in the correct formula',
    client_f_format: '0',
};

const region_test = {
    ...test,
    ...region_data,
};


///////////////////////////////////////////////////////////////////////////////////////////////////
// Number Return
///////////////////////////////////////////////////////////////////////////////////////////////////

const kc_if_return_number = ({
	kc: KC_NAMES.KC_IF_RETURN_NUMBER,
	until_correct: 8,
	until_total: 14,
	tutorial_pages: [

		{	...tutorial,

			description: `Now that you have practiced creating logical tests in the previous
                    tutorial, it's time to build the full <code>IF</code> function.
					<br/><br/>
					As you saw earlier, the <code>IF</code> function has three parts. Here is an example: 
						<code>=IF({cell1_ref}=1, 100, 99)</code>
					<ul>
						<li><code>{cell1_ref}=1</code> is the comparison (or test)</li>
						<li><code>100</code> is returned if the test is <code>TRUE</code>.</li>
						<li><code>99</code> is returned if the test is <code>FALSE</code>.</li>
					</ul>
					Your test should return either 
					<code>TRUE</code> or <code>FALSE</code>, and not <code>"True"</code> or 
					<code>"False"</code>.  Wrapping TRUE with <code>"</code> symbol 
					will lead to some strange results.`,
			instruction: 'Write the formula from above.',
			
            ...region_data,

			solution_f: '=if({cell1_ref}=1, 100, 99)',
            template_values: {
                'cell1': 'popCell(b1,c1)',
            },
            feedback: [
                { 'has': 'values', args: ['1', '100', '99'] },
                { 'has': 'functions', args: ['if'] },
                { 'has': 'symbols', args: ['=']},
                { 'has': 'references', args: ['{cell1_ref}'] }
            ],

		},{	...tutorial,
            
			description: `You can do all kind of logical tests. Imagine that you are supposed to
                write a formula that tells us how many donuts to buy. You should purchase a two dozen (24)
                for offices with under {n} employees, and three dozen (36) for all others.`,
			instruction: 'Write the formula described above.',
			helpblock: 'Write =IF( <i>logical test</i>, <i>donuts if true</i>, <i>donuts if false</i> )',
			
            ...region_data,

			solution_f: '=if(d1<{n}, 24, 36)',
            template_values: {
                'n': 'randOf(3,5,10)',
            },
            feedback: [
                { 'has': 'values', args: ['{n}', '24', '36'] },
                { 'has': 'functions', args: ['if'] },
                { 'has': 'references', args: ['d1'] }
            ],

        },{	...tutorial,
            
			description: `Try another donut-related problem. Return a two dozen (24)
                for regions with over {n} {cell1_title}, and one dozen (12) for all others.`,
			instruction: 'Write the formula described above.',
			helpblock: 'Write =IF( <i>logical test</i>, <i>donuts if true</i>, <i>donuts if false</i> )',
			
            ...region_data,

			solution_f: '=if({cell1_ref}>{n}, 24, 12)',
            template_values: {
                'cell1': 'popCell(c1,d1)',
                'n': 'randOf(3,5,10)',
            },
            feedback: [
                { 'has': 'values', args: ['{n}', '24', '12'] },
                { 'has': 'functions', args: ['if'] },
                { 'has': 'references', args: ['{cell1_ref}'] }
            ],

        },{	...tutorial,
            
			description: `One more! Return 0
                for offices with <b>at most</b> {n} {cell1_title}, and one dozen (12) for all others.`,
			instruction: 'Write the formula described above.',
			helpblock: 'Write =IF( <i>logical test</i>, <i>donuts if true</i>, <i>donuts if false</i> )',
			
            ...region_data,

			solution_f: '=if({cell1_ref}<={n}, 0, 12)',
            template_values: {
                'cell1': 'popCell(c1,d1)',
                'n': 'randOf(3,5,10)',
            },
            feedback: [
                { 'has': 'values', args: ['{n}', '0', '12'] },
                { 'has': 'functions', args: ['if'] },
                { 'has': 'references', args: ['{cell1_ref}'] }
            ],

        },{	...tutorial,
            
			description: `We can also write logical tests for textual data.`,
			instruction: 'The {n} region should get 12 donuts, and all others 24.',
			
            ...region_data,

			solution_f: '=if(a1="{n}", 12, 24)',
            template_values: {
                'n': 'randOf(North,South,East,West)',
            },
            feedback: [
                { 'has': 'values', args: ['{n}', '12', '24'] },
                { 'has': 'functions', args: ['if'] },
                { 'has': 'references', args: ['a1'] }
            ],
        }
	],


	test_pages: [
        
        {	...region_test,
            
			description: `Offices with {less} {n} {cell1_title} should get 18 donuts, and all others 24.`,

			solution_f: '=if({cell1_ref}<{n}, 18, 24)',
            template_values: {
                'cell1': 'popCell(c1,d1)',
                'n': 'randOf(2,5,8)',
                'less': 'randOf(under,less than,fewer than)',
            },

        },{	...region_test,
            
			description: `Offices with {over} {n} {cell1_title} should get 36 donuts, and all others 12.`,

			solution_f: '=if({cell1_ref}>{n}, 36, 12)',
            template_values: {
                'cell1': 'popCell(c1,d1)',
                'n': 'randOf(2,5,7)',
                'over': 'randOf(greater than,over,more than)',
            },

        },{ ...region_test,
            
			description: `Offices with {lte} 8 {cell1_title} should get 6 donuts, and all others 12.`,

			solution_f: '=if({cell1_ref}<=8, 6, 12)',
            template_values: {
                'cell1': 'popCell(c1,d1)',
                'lte': 'randOf(under or equal to,less than or equal to,equal to or fewer than)',
            },

        },{	...region_test,
            
			description: `Offices with {gte} 8 {cell1_title} should get 10 donuts, and all others 20.`,

			solution_f: '=if({cell1_ref}>=8, 10, 20)',
            template_values: {
                'cell1': 'popCell(c1,d1)',
                'gte': 'randOf(greater than or equal to,equal to or over,more than or equal to)',
            },

        },{	...region_test,
            
			description: `Offices with {e} 10 {cell1_title} should get 8 donuts, and all others 12.`,

			solution_f: '=if({cell1_ref}=10, 8, 12)',
            template_values: {
                'cell1': 'popCell(c1,d1)',
                'e': 'randOf(exactly,a total of)',
            },            

        },{	...region_test,
            
			description: 'The {region} region should get {d1} donuts, and all others {d2}.',
			
            ...region_data,

			solution_f: '=if(a1="{region}", {d1}, {d2})',
            template_values: {
                'region': 'randOf(North,South,East,West)',
                'd1': 'randOf(6,8,10)',
                'd2': 'randOf(12,26,38)',
            },
            
        },
	]
}: InertiaKC);


add_if_undefined( { kcs: [ KC_NAMES.KC_IF_RETURN_NUMBER ] }, kc_if_return_number.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.KC_IF_RETURN_NUMBER ] }, kc_if_return_number.test_pages );






const duck_data = {
    column_titles: ['Duck Name', 'Color Rating', 'Weight Rating' ],
    tests: [
        { 'a': 'Sarah', 'b': 'C', 'c': 'A' }, 
        { 'a': 'David', 'b': 'B', 'c': 'B' }, 
        { 'a': 'Jeff', 'b': 'D', 'c': 'C' }, 
        { 'a': 'Maximilian', 'b': 'A', 'c': 'D' }
    ],
    column_formats: [ 'text', 'text', 'text', 'text' ],
};
const duck_test = {
    ...test,
    ...duck_data,
};




///////////////////////////////////////////////////////////////////////////////////////////////////
// Textual Return
///////////////////////////////////////////////////////////////////////////////////////////////////

const kc_if_return_text = ({
	kc: KC_NAMES.KC_IF_COMPARISON_TEXT,
	until_correct: 8,
	until_total: 14,
	tutorial_pages: [

		{	...tutorial,

			description: `You can also return words (not just numbers) with the <code>IF</code> function.
					<br/><br/>
                    Quoting text, like <code>"hey"</code>, can be tricky. Be sure to put a double-quote on each
                    side. 
                    <br/><br/>
                    As an example, try writing the formula <code>=IF(b1>{n}, "More Managers", "Few Managers")</code>.
                    <br/><br/>
                    While it's not required, placing a space after each comma makes an <code>IF</code> 
                    easier to read.  Compare 
                    <code>=IF(a1=1,1,2)</code> to <code>=IF(a1=1, 1, 2)</code>. The second version is much easier to read.
                    `,
                
			instruction: `Write the manager formula.`,
			
            ...region_data,
            
			solution_f: '=if(b1>{n},"More Managers", "Few Managers")', 
            
            template_values: {
                'n': 'randOf(1,2,3,4)',
            },
			feedback: [
				{ 'has': 'references', args: ['b1'] },
				{ 'has': 'symbols', args: ['>'] },
				{ 'has': 'functions', args: ['if'] },
			],

		},{	...tutorial,

			description: `We can also create logical comparisons for text. Again, just be careful 
                    to add quotes around each word in the formula.
					<br/><br/>
                    As an example, try writing <code>=IF({cell1_ref}="{rating}", "Equal", "Not Equal")</code>
                    to see if <code>{cell1_title}</code> has the exact rating of {rating}.
                    <br/><br/>
                    Quotes are only needed around words; don't get in the habit of adding them to numbers.
                    `,
			instruction: `Write the above formula.`,
			
            ...duck_data,

			solution_f: '=if({cell1_ref}="{rating}","Equal","Not Equal")', 
            template_values: {
                'cell1': 'popCell(b1,c1)',
                'rating': 'randOf(A,C,D)',
            },
            feedback: [
                { 'has': 'values', args: ['{rating}'] },
                { 'has': 'symbols', args: ['=']},
                { 'has': 'references', args: ['{cell1_ref}'] }
            ],

		},{	...tutorial,

			description: `Let's try another practice problem. Write a formula that says <code>Yes</code> for ducks
                    with a <code>{cell1_title}</code> equal to <code>{rating}</code>. Otherwise, say <code>No</code>.
                    `,
			instruction: `Write the correct function.`,
			
            ...duck_data,

			solution_f: '=if({cell1_ref}="{rating}","Yes","No")', 
            template_values: {
                'cell1': 'popCell(b1,c1)',
                'rating': 'randOf(A,C,D)',
            },
            feedback: [
                { 'has': 'values', args: ['{rating}'] },
                { 'has': 'symbols', args: ['=']},
                { 'has': 'references', args: ['{cell1_ref}'] }
            ],

		},{	...tutorial,

			description: `If you remember, a previous lesson showed how to use either
					<code>&gt</code> or <code>&lt</code> to compare two values <b>alphabetically</b>.
					<br/><br/>

					Remember that letters that come first in the alphabet are <b>less than</b> letters that come later on.
					So, A is less than B, which is less than C.  
					`,
			instruction: `Say <code>Excellent</code> if the <code>{cell1_title}</code> is further along in the 
                    alphabet than <code>{rating}</code>. Otherwise, say <code>Ok</code>`,

            ...duck_data,

			solution_f: '=if({cell1_ref}>"{rating}", "Excellent", "Ok")', 
			
            template_values: {
                'cell1': 'popCell(b1,c1)',
                'rating': 'randOf(B,C)',
            },
            feedback: [
                { 'has': 'values', args: ['{rating}'] },
                { 'has': 'symbols', args: ['>']},
                { 'has': 'references', args: ['{cell1_ref}'] }
            ],

		},{ ...tutorial,

			description: `How about using <code>≤</code> and <code>≥</code> to compare words?
					<br/><br/>
					Those symbols don't appear on the keyboard, so instead use 
					<code>&gt=</code> or <code>&lt=</code>. Always put the <code>=</code> sign last.`,

			instruction: `If <code>{cell1_title}</code> is greater than or equal to
                    (at or later in the alphabet) than <code>{rating}</code>, then return <code>Later</code>. 
                    Otherwise return <code>No</code>`,

            ...duck_data,

			solution_f: '=IF({cell1_ref}>="{rating}", "Later", "No")', 
			
            template_values: {
                'cell1': 'popCell(b1,c1)',
                'rating': 'randOf(B,C)',
            },
            feedback: [
                { 'has': 'values', args: ['{rating}'] },
                { 'has': 'symbols', args: ['>']},
                { 'has': 'references', args: ['{cell1_ref}'] }
            ],

		}

	],
	test_pages: [
        {   ...duck_test,
            description: `Say <code>High</code> for ducks with a <code>{cell1_title}</code> 
                    {over} {text}, and <code>Low</code> otherwise.
                    <br/><br/>
                    You must use the <code>&gt</code> symbol.`,

			solution_f: '=if({cell1_ref}>"{text}", "High", "Low")', 
            template_values: {
                'cell1': 'popCell(b1,c1)',
                'text': 'randOf(B,C)',
                'over': 'randOf(greater than,later in the alphabet than)'
            },
            feedback: [
                { 'has': 'values', args: ['{text}'] },
                { 'has': 'symbols', args: ['>']},
                { 'has': 'references', args: ['{cell1_ref}'] }
            ],

        },{ ...duck_test,
            description: `Which ducks have their <code>{cell1_title}</code> {under} {text}? 
                    Say either <code>Yes</code> or <code>No</code>.
                    <br/><br/>
                    You must use the <code>&lt</code> symbol.`,

			solution_f: '=if({cell1_ref}<"{text}", "Yes", "No")', 
            template_values: {
                'cell1': 'popCell(b1,c1)',
                'text': 'randOf(B,C)',
                'under': 'randOf(less than,earlier in the alphabet than)'
            },
            feedback: [
                { 'has': 'values', args: ['{text}'] },
                { 'has': 'symbols', args: ['<']},
                { 'has': 'references', args: ['{cell1_ref}'] }
            ],

        },{ ...duck_test,
            description: `Which ducks have their <code>{cell1_title}</code> {gte} {text}?
                    If they do, then return <code>Y</code> otherwise return <code>X</code>
                    <br/><br/>
                    You must use the <code>&gt=</code> symbol.`,

			solution_f: '=if({cell1_ref}>="{text}", "Y", "X")', 
            template_values: {
                'cell1': 'popCell(b1,c1)',
                'text': 'randOf(B,C)',
                'gte': 'randOf(greater than or equal to,at or later in the alphabet than)'
            },
            feedback: [
                { 'has': 'values', args: ['{text}'] },
                { 'has': 'symbols', args: ['>=']},
                { 'has': 'references', args: ['{cell1_ref}'] }
            ],

        },{ ...duck_test,
            description: `Which ducks have their <code>{cell1_title}</code> {lte} {text}?
                    Say <code>less than</code> or <code>other</code>.
                    <br/><br/>
                    You must use the <code>&lt;=</code> symbol.`,

			solution_f: '=IF({cell1_ref}<="{text}", "less than", "other")', 
            template_values: {
                'cell1': 'popCell(b1,c1)',
                'text': 'randOf(B,C)',
                'lte': 'randOf(less than or equal to,at or earlier in the alphabet than)'
            },
            feedback: [
                { 'has': 'values', args: ['{text}'] },
                { 'has': 'symbols', args: ['<=']},
                { 'has': 'references', args: ['{cell1_ref}'] }
            ],

        },{ ...duck_test,
            description: `Which ducks have their <code>{cell1_title}</code> {eq} {text}?
                If they match, say <code>Matched</code>. Otherwise, say <code>No</code>.`,

			solution_f: '=IF({cell1_ref}="{text}", "Matched", "No")', 
            template_values: {
                'cell1': 'popCell(b1,c1)',
                'text': 'randOf(B,C)',
                'eq': 'randOf(equal to,the same as,exactly at)'
            },            
        },
	]
}: InertiaKC);


add_if_undefined( { kcs: [ KC_NAMES.KC_IF_RETURN_TEXT ] }, kc_if_return_text.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.KC_IF_RETURN_TEXT ] }, kc_if_return_text.test_pages );




module.exports = { 
	kc_if_return_number,
	kc_if_return_text,
};


/*
		{	type: 'IfPageFormulaSchema',
			description: 'We can also use references in part of our return values.',
			instruction: '"A" Regions should return their sales; others should return 0.',
			column_titles: ['Region', 'Sales', 'Rating' ],
			tests: [
						{ 'a': 'South', 'b': 10, c: 'A' },
						{ 'a': 'North', 'b': 15, c: 'B' },
						{ 'a': 'East', 'b': 23, c: 'A'},
						{ 'a': 'West', 'b': 10, c: 'C'},
					],
			solution_f: '=if(c1="A", b1, 0)', 
			feedback: [
				{ 'has': 'values', args: [0] },
				{ 'has': 'references', args: ['c1', 'b1'] }
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `Return values can be the result of a calculation. 
				<br/><br/>
				For example, <code>=IF(A1="South",B1*2, B1)</code> will return the sales
				column multiplied by 2 for the South region, while all other regions will just
				have their sales returned.`,
			instruction: 'Have "North" region return sales multiplied by 3, and all others sales multiplied by 2',
			column_titles: ['Region', 'Sales', 'Rating' ],
			tests: [
						{ 'a': 'South', 'b': 10, c: 'A' },
						{ 'a': 'North', 'b': 15, c: 'B' },
						{ 'a': 'East', 'b': 23, c: 'A'},
						{ 'a': 'West', 'b': 10, c: 'C'},
					],
			solution_f: '=if(a1="North", b1*3, b1*2)', 
			feedback: [
				{ 'has': 'references', args: ['a1', 'b1'] },
				{ 'has': 'values', args: ['north']},
				{ 'has': 'symbols', args: ['*']}
			],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `You can even return the result of a function. 
				Any formula that be in a cell could be used as part of an <code>IF</code> function.
				These can even include embedding other functions.
				<br/><br/>
				For example, <code>=IF(C1="C", Round(c1,0), "Ok")</code> uses the <code>Round()</code> function to
				round down C1 to the nearest integer.  Otherwise
				it returns "Ok".`,
			instruction: 'Have the North region return "expired", while all others should use <code>Round()</code> to round down the sales.',
			column_titles: ['Region', 'Sales', 'Rating' ],
			column_formats: [ '', '.',''],
			client_f_format: 'date',
			tests: [
						{ 'a': 'South', 'b': 10.30, c: 'A' },
						{ 'a': 'North', 'b': 15.44, c: 'B' },
						{ 'a': 'East', 'b': 23.1, c: 'A'},
						{ 'a': 'West', 'b': 10.9, c: 'C'},
					],
			solution_f: '=if(a1="North", "expired", Round(b1,0))', 
			feedback: [
				{ 'has': 'references', args: ['a1'] },
				{ 'has': 'functions', args: ['if', 'round'] },
				{ 'has': 'values', args: ['north', 'expired'] }
			],
			code: 'tutorial'
		}



*/