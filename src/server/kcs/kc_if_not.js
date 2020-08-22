// @flow
const { KC_NAMES, add_if_undefined } = require('./../kcs/kc.js');

import type { InertiaKC } from './kc';



const farm1_data = {
	column_titles: ['Alpacas', 'Baboons', 'Camels', 'Ducks' ],
	tests: [
			{ 'a': 10, 'b': 34, 'c': 54, 'd': 400 }, 
			{ 'a': 8, 'b': 39, 'c': 49, 'd': 128 }, 
			{ 'a': 6, 'b': 38, 'c': 58, 'd': 189 }, 
			{ 'a': 13, 'b': 13, 'c': 60, 'd': 167 }, 
		],
    column_formats: ['text', '0', '0', '0'],
};

const pig_data = {
    column_titles: ['Pig Name', 'Age', 'Category' ],
	tests: [
            { 'a': 'Anna', 'b': 1, 'c': 2 }, 
            { 'a': 'Bernice', 'b': 3, 'c': 3 }, 
            { 'a': 'Charlie', 'b': 2, 'c': 4 }, 
            { 'a': 'Dennis', 'b': 4, 'c': 1 },
        ],
    column_formats: ['text', '0', '0'],
}


const tutorial = {
	type: 'IfPageFormulaSchema', // IfPagePredictFormulaSchema' OR 'IfPageFormulaSchema',
	code: 'tutorial',
    client_f_format: 'boolean',
}
const test = {
	type: 'IfPageFormulaSchema',
	code: 'test',
	instruction: 'Type in the correct formula',
    client_f_format: 'boolean',
};

const pig_test = {
    ...test,
    ...pig_data,
};


///////////////////////////////////////////////////////////////////////////////////////////////////
// Numeric Comparisons
///////////////////////////////////////////////////////////////////////////////////////////////////

const kc_if_comparison_number = ({
	kc: KC_NAMES.KC_IF_COMPARISON_NUMBER,
	until_correct: 8,
	until_total: 15,
	tutorial_pages: [
        {	...tutorial,

			description: `We will start by focusing on the first part of an IF statement, 
					the <b>logical comparison</b> (or <b>test</b>).
					<br/><br/>
					The major comparisons are:
					<ul>
						<li><code>A1=B1</code> (equal)</li>
						<li><code>A1&gtB1</code> (greater than)</li>
						<li><code>A1&ltB1</code> (lesser than)</li>
                    </ul>
					We will practice these logical comparisons by putting them directly into Excel.
					<br/><br/>
					To see which pigs are 3 years old, we could enter <code>=B1=3</code>.  
					The first <code>=</code> tells Excel that we’re entering a formula. 
					The second <code>=</code> does the actual comparison.`,
			instruction: 'Why don’t you create a formula to see if the pig\'s <code>{cell1_title}</code> is exactly {n}?',

            ...pig_data,

			solution_f: '={cell1_ref}={n}', 
            template_values: {
                'cell1': 'popCell(b1,c1)',
                'n': '[2-4]',
            },
            feedback: [
                { 'has': 'values', args: ['{n}'] },
                { 'has': 'symbols', args: ['=']},
                { 'has': 'references', args: ['{cell1_ref}'] }
            ],

		},{	...tutorial,
			description: `Great! Try to use the <code>&gt</code> (greater than) or
                    <code>&lt</code> (lesser than) symbols.`,
			instruction: 'Which pig\'s <code>{cell1_title}</code> is less than {n}?',

            ...pig_data,

			solution_f: '={cell1_ref}<{n}', 
            template_values: {
                'cell1': 'popCell(b1,c1)',
                'n': '[2-4]',
            },
            feedback: [
                { 'has': 'values', args: ['{n}'] },
                { 'has': 'symbols', args: ['<']},
                { 'has': 'references', args: ['{cell1_ref}'] }
            ],

		},{	...tutorial,
			description: `If you remember from your math courses, we also have the ≤ and ≥ symbols.  
					These mean <i>less than or equal to</i>, and <i>greater than or equal to</i>. 
					<br/><br/>
					Because those symbols don't appear on the keyboard, we use:
					<ul>
						<li><code>A1&lt=B1</code> (less than or equal to)</li>
						<li><code>A1&gt=B1</code> (greater than or equal to)</li>
					</ul>
					Remember to always put the <code>=</code> sign after the <code>&gt;</code> or <code>&lt;</code> symbol!`,
			instruction: 'Why don’t you try testing to see if the pig\'s <code>{cell1_title}</code> is {n} or greater?',
            
            ...pig_data,

			solution_f: '={cell1_ref}>={n}', 
            template_values: {
                'cell1': 'popCell(b1,c1)',
                'n': '[2-4]',
            },
            feedback: [
                { 'has': 'values', args: ['{n}'] },
                { 'has': 'symbols', args: ['>=']},
                { 'has': 'references', args: ['{cell1_ref}'] }
            ],

		},
		{	type: 'IfPageTextSchema',
			description: `Sometimes this terminology can be confusing.
					Here are some different ways we can write comparisons.
					<br/><br/>
					<b><code>A1 &gt 10</code></b>
					<ul>
						<li>Greater than 10</li>
						<li>Over 10</li>
						<li>More than 10</li>
					</ul>

					<b><code>A1 &lt 10</code></b>
					<ul>
						<li>Less than 10</li>
						<li>Under 10</li>
						<li>Fewer than 10</li>
					</ul>

					<b><code>A1 &ge; 10</code></b>
					<ul>
						<li>Greater than or equal to 10</li>
						<li>At least 10</li>
						<li>10 or over</li>
					</ul>

					<b><code>A1 &le; 10</code></b>
					<ul>
						<li>Lesser than or equal to 10</li>
						<li>At most 10</li>
						<li>10 or under</li>
					</ul>

					<b><code>A1 = 10</code></b>
					<ul>
						<li>Equal to 10</li>
						<li>The same as 10</li>
						<li>Exactly 10</li>
					</ul>
					<br/><br/>
					If you forget these terms later on, feel free to hover your
					cursor over the small black progress boxes below. Once you complete
					each section, you can go back and review its instructions.`
		}
	],
	test_pages: [
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
            
        },
	]
}: InertiaKC);


add_if_undefined( { kcs: [ KC_NAMES.KC_IF_COMPARISON_NUMBER ] }, kc_if_comparison_number.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.KC_IF_COMPARISON_NUMBER ] }, kc_if_comparison_number.test_pages );






const duck_data = {
    column_titles: ['Duck Name', 'Color Rating', 'Weight Rating' ],
    tests: [
        { 'a': 'Sarah', 'b': 'C', 'c': 'A' }, 
        { 'a': 'David', 'b': 'B', 'c': 'B' }, 
        { 'a': 'Jeff', 'b': 'D', 'c': 'C' }, 
        { 'a': 'Maximilian', 'b': 'A', 'c': 'D' }
    ],
    column_formats: [ 'text', 'text', 'text', 'text' ],
}
const duck_test = {
    ...test,
    ...duck_data,
};






///////////////////////////////////////////////////////////////////////////////////////////////////
// Textual Comparisons
///////////////////////////////////////////////////////////////////////////////////////////////////

const kc_if_comparison_text = ({
	kc: KC_NAMES.KC_IF_COMPARISON_TEXT,
	until_correct: 8,
	until_total: 15,
	tutorial_pages: [

		{	...tutorial,

			description: `Excel can create logical comparisons for words!
					<br/><br/>
					The <code>=</code> symbol will return <code>TRUE</code> 
					if the text on each side are the same.
					<br/><br/>
					So, for <code>=A1=C1</code>, if the values in <code>A1</code> match those 
                    in <code>C1</code>, it will return <code>TRUE</code>.
                    If the cells have different values, the formula will return <code>FALSE</code>`,
                
			instruction: `The table below shows duck ratings. 
						Write a formula to see if the color and weight ratings match.`,
			
            ...duck_data,
            
			solution_f: '=b1=c1', 
			feedback: [
				{ 'has': 'references', args: ['c1', 'b1'] },
				{ 'has': 'symbols', args: ['='] },
			],
			code: 'tutorial'

		},{	...tutorial,

			description: `If we want to see whether <code>A1</code> has the word <code>cat</code>,
					we have to write it like <code>=A1="cat"</code>.  
                    Wrapping the word in quotes tells 
					Excel that <code>"cat"</code> isn't a formula or cell reference.
					<br/><br/>
					Wrapping a word in single quotes (apostrophes) will not work.  
					So, never write <code>=A1='cat'</code>.
					<br/><br/>
                    Also, while the full version of Excel doesn't care if something is upper
                    or lower case, this tutorial system does! So, this website 
                    will show that <code>="A"="a"</code> results in <code>FALSE</code>.
                    `,
			instruction: 'Is the <code>{cell1_title}</code> equal to <code>{rating}</code>?',
			
            ...duck_data,

			solution_f: '={cell1_ref}="{rating}"', 
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

			description: `We can use also
					<code>&gt</code> and <code>&lt</code> to compare two values <b>alphabetically</b>.
					<br/><br/>
					Letters that come first in the alphabet are <b>less than</b> letters that come later on.
					So, "A" is less than "B", which is less than "C".  
					<br/><br/>
					If the first letter of each word matches, we move onto the second letter. If that matches, we keep
					going to the right. If one word runs out of letters before the other, it comes first.
					<br/><br/>
					As an example, "Aden" <code>&lt</code> "Bob", but "Aden" <code>&gt</code> "Ada".`,
			instruction: `Write a formula to see if <code>{cell1_title}</code> is further along in the 
                    alphabet than <code>{rating}</code>.`,

            ...duck_data,

			solution_f: '={cell1_ref}>"{rating}"', 
			
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

			description: `We can also use <code>≤</code> and <code>≥</code> to compare words.  
					<br/><br/>
					Just like with numbers, those symbols don't appear on the keyboard.  Use 
					<code>&gt=</code> or <code>&lt=</code>. Always put the <code>=</code> sign last.`,

			instruction: `Write a formula to see if <code>{cell1_title}</code> is greater than or equal to
                    (at or later in the alphabet) than <code>{rating}</code>.`,

            ...duck_data,

			solution_f: '={cell1_ref}>="{rating}"', 
			
            template_values: {
                'cell1': 'popCell(b1,c1)',
                'rating': 'randOf(B,C)',
            },
            feedback: [
                { 'has': 'values', args: ['{rating}'] },
                { 'has': 'symbols', args: ['>']},
                { 'has': 'references', args: ['{cell1_ref}'] }
            ],

		},{	
            type: 'IfPageTextSchema',
			description: `Sometimes comparing text can be confusing.
					Just remember the order of the alphabet...
                    <br/><br/>
                    <code>A, B, C, D, E, F, G, ...</code>
                    <br/><br/>
                    Letters on the left are "smaller" and letters on the right are "bigger" 
                    <br/></br>
                    Also <i>uppercase and lowercase matters!</i> For this tutorial, <b>only
                    use upper case letters</b>. As long as you use upper-case 
                    letters in your formulas, you'll be ok! If you use lower-case, some of the
                    formulas won't work correctly.
                    `
		}

	],
	test_pages: [
        {   ...duck_test,
            description: `Which ducks have a <code>{cell1_title}</code> {over} {text}?
                    <br/><br/>
                    You must use the <code>&gt</code> symbol.`,

			solution_f: '={cell1_ref}>"{text}"', 
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
                    <br/><br/>
                    You must use the <code>&lt</code> symbol.`,

			solution_f: '={cell1_ref}<"{text}"', 
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
                    <br/><br/>
                    You must use the <code>&gt=</code> symbol.`,

			solution_f: '={cell1_ref}>="{text}"', 
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
                    <br/><br/>
                    You must use the <code>&lt;=</code> symbol.`,

			solution_f: '={cell1_ref}<="{text}"', 
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
            description: 'Which ducks have their <code>{cell1_title}</code> {eq} {text}?',

			solution_f: '={cell1_ref}="{text}"', 
            template_values: {
                'cell1': 'popCell(b1,c1)',
                'text': 'randOf(B,C)',
                'eq': 'randOf(equal to,the same as,exactly at)'
            },
            feedback: [
                { 'has': 'values', args: ['{text}'] },
                { 'has': 'symbols', args: ['=']},
                { 'has': 'references', args: ['{cell1_ref}'] }
            ],
            
        },
	]
}: InertiaKC);


add_if_undefined( { kcs: [ KC_NAMES.KC_IF_COMPARISON_TEXT ] }, kc_if_comparison_text.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.KC_IF_COMPARISON_TEXT ] }, kc_if_comparison_text.test_pages );





///////////////////////////////////////////////////////////////////////////////////////////////////
// Textual Comparisons
///////////////////////////////////////////////////////////////////////////////////////////////////


const cat_data = {
    column_titles: ['Cat Name', 'Parent', 'Stray', 'Adopted' ],
    tests: [
        { 'a': 'Alex', 'b': false, 'c': true, 'd': false }, 
        { 'a': 'Bob', 'b': false, 'c': false, 'd': true }, 
        { 'a': 'Chester', 'b': true, 'c': false, 'd': true }, 
        { 'a': 'Dorthy', 'b': true, 'c': true, 'd': false },
    ],
    column_formats: ['text', 'boolean', 'boolean', 'boolean'],
};
const cat_test = {
    ...test,
    ...cat_data,
}



const kc_if_comparison_boolean = ({
	kc: KC_NAMES.KC_IF_COMPARISON_BOOLEAN,
	until_correct: 4,
	until_total: 8,
	tutorial_pages: [

        {	type: 'IfPageTextSchema',
			description: `
                In addition to comparing numbers and text, we also can compare <i>boolean</i> values.
                A boolean is very simple; it can only be <code>TRUE</code> or <code>FALSE</code>.
                <br/><br/>
                It's important to understand that a boolean is <b>not</b> simply text (or a string). 
                Instead, it is either an <i>on</i> or <i>off</i> value.
                <br/><br/>
                If you have a boolean value in a table, you have to test for it without using quotes.
                In other words, there is a
				difference	between <code>TRUE</code> and <code>"TRUE"</code> (true wrapped in quotes).  
                <br/><br/>
				The quotes matter, because <code>TRUE</code> doesn't always equal <code>"TRUE"</code>.
                Even though they look the same, they are actually two different values.`

		},{	type: 'IfPageTextSchema',
			description: `
                Booleans may seem odd, but all of our logical tests are actually creating a boolean 
                as their result (the result is sometimes called a return value, or output). 
                This becomes very important later on
                when we start using the <code>AND</code>, <code>NOT</code>, and <code>OR</code> functions.
                <br/><br/>
                Just remember that a boolean only has two possible values: <code>TRUE</code> or <code>FALSE</code>.
                `
		},{	...tutorial,

			description: `You sometimes see booleans in tables.
					<br/><br/>
					For example, the table below has a list of cats.  

					The <code>Parent</code>, <code>Stray</code>, and <code>Adopted</code> columns have boolean values 
					(<code>TRUE</code> or <code>FALSE</code>).  
					<br/><br/>
					If you want to find cats with kids,
					write <code>=B1=TRUE</code>.  Do not write <code>=B1="TRUE"</code>!`,

			instruction: 'Write a formula that finds cats where <code>{cell1_title}</code> is <code>TRUE</code>',

			solution_f: '={cell1_ref}=TRUE', 
			
            ...cat_data,

            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
            },
            feedback: [
                { 'has': 'values', args: ['TRUE'] },
                { 'has': 'symbols', args: ['=']},
                { 'has': 'references', args: ['{cell1_ref}'] }
            ],


		},{	...tutorial,

			description: `We can also test a cell for <code>FALSE</code>`,

			instruction: `Which cats have <code>{cell1_title}</code> equal to <code>FALSE</code>?
                Note that this means that you want get the output <code>TRUE</code> when the 
                <code>{cell1_title}</code> value is <code>FALSE</code>.
                `,

			solution_f: '={cell1_ref}=FALSE', 
			
            ...cat_data,

            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
            },
            feedback: [
                { 'has': 'values', args: ['FALSE'] },
                { 'has': 'symbols', args: ['=']},
                { 'has': 'references', args: ['{cell1_ref}'] }
            ],

		},{	
            type: 'IfPageTextSchema',
			description: `The biggest thing to remember is to <b>not</b> put quotes around
                    a boolean value. Just write <code>TRUE</code> or <code>FALSE</code>, not 
                    <code>"TRUE"</code> or <code>"FALSE"</code>.
                    `
		}

	],
	test_pages: [
        {   ...cat_test,
            description: `Which cats have their <code>{cell1_title}</code> cell {eq} {b}?`,

			solution_f: '={cell1_ref}={b}', 

            template_values: {
                'cell1': 'popCell(b1,c1,d1)',
                'b': 'randOf(TRUE,FALSE)',
                'eq': 'randOf(equal to,the same as)'
            },
            feedback: [
                { 'has': 'values', args: ['{b}'] },
                { 'has': 'symbols', args: ['=']},
                { 'has': 'references', args: ['{cell1_ref}'] }
            ],

        },
	]
}: InertiaKC);


add_if_undefined( { kcs: [ KC_NAMES.KC_IF_COMPARISON_BOOLEAN ] }, kc_if_comparison_boolean.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.KC_IF_COMPARISON_BOOLEAN ] }, kc_if_comparison_boolean.test_pages );






module.exports = { 
	kc_if_comparison_number,
	kc_if_comparison_text,
    kc_if_comparison_boolean,
};
