import { KC_NAMES, add_if_undefined } from './../kcs/kc';

import { DataFactory } from './../DataFactory';
//import type { InertiaKC } from './kc';


const tutorial = {
	type: 'IfPagePredictFormulaSchema', //'IfPageFormulaSchema',
	code: 'tutorial',
};
const test = {
	type: 'IfPageFormulaSchema',
	code: 'test',
	instruction: 'Type in the correct formula',
};


// Standard bases for  questions.
const name_base = {
	tests: DataFactory.randPeople(4),
	column_titles: [ 'First name', 'Last name'],
	column_formats: ['text', 'text'],
};

const address_base = {
	tests: DataFactory.randAddress(5),
	column_titles: ['Street', 'City', 'State'],
	column_formats: ['text', 'text', 'text'],
};

const variable_length_codes_base = {
	tests: [
		{ 'a': 'afd-24.8888' },
		{ 'a': 'awd-4.83108' },
		{ 'a': 'xxw-1894.888' },
		{ 'a': 'afd-24.8' },
	],
	column_titles: ['Product Code'],
	column_formats: ['text'],
};




///////////////////////////////////////////////////////////////////////////////////////////////////
// Basic Text KCs
///////////////////////////////////////////////////////////////////////////////////////////////////

const kc_text_quotes = ({
	kc: KC_NAMES.TEXT_QUOTES,
	until_correct: 4,
	until_total: 8,
	tutorial_pages: [
		{
			type: 'IfPageFormulaSchema',
			code: 'tutorial',

			description: `Text can be used by a formula in two ways:
				<ul>
					<li>A cell reference, such as <code>=A1</code></li>
					<li>Quoted text, which looks like <code>="here is some text"</code></li>
				</ul>
				<br/><br/>
				Always use the <code>"</code> (double-quote) and not 
				<code>'</code>, which is a single quote.`,
			instruction: 'Type in <code>="Word"</code>',

			tests: [ { 'a': ''}],
			column_formats: [ 'text' ],
			column_titles: [ '' ],

			solution_f: '="Word"',
			feedback: [  
				{ 'has': 'symbols', args: [ '"' ] },
				{ 'has': 'no_symbols', args: ['\''] }
			],
			
		},{
			type: 'IfPageFormulaSchema',
			code: 'tutorial',

			description: `While typing text directly into formulas is very useful, you also need to be able to
				grab data from your spreadsheet.`,
			instruction: 'Type in <code>=A1</code> to return the first name from each row', 
			
			...name_base,

			solution_f: '=a1',
		}
		/* Interpreter doesn't work with double quotes.
		@todo Fix excel formula parser to handle double quotes.
		,{
			type: 'IfPageFormulaSchema',
			description: `There are times when you want to have a <code>"</code> symbol in the result
				of a function. In those cases, you will type it twice. 
				<br/><br/>
				So, to get <code>The "one"</code> as output,
				you will need to type in <code>="The ""one"""</code>.
				<br/><br/> 
				Notice that there are <b>three</b> <code>"</code> at the end of the formula.
				The first two transform into a single <code>"</code> in the output, and the third
				marks the end of the formula.`,
			instruction: 'Type in <code>="The ""one"""</code>. ',
			tests: [ { 'a': ''}],
			solution_f: '="The ""one"""',
			feedback: [  
				{ 'has': 'symbols', args: [ '"' ] },
			],
			code: 'tutorial',
			kcs: [ KC_NAMES.TEXT_QUOTES ],
		}
		*/],
	test_pages: [
		{	type: 'IfPageFormulaSchema',
			code: 'test',
			
			...address_base,
			description: 'Return the street name ',
			instruction: 'Type in the correct formula',

			solution_f: '=a1',
		}, {
			type: 'IfPageFormulaSchema',
			code: 'test',

			...address_base,
			description: 'Write a formula to say <span>Bob</span>',
			instruction: 'Type in the correct formula',

			solution_f: '="Bob"',
		/*
		}, {
			...address_base,
			description: 'Write a formula to say <span>Hello "Bob"</span>',
			helpblock: `Remember that you have to use two quotes when you want that in the output.
				So, write <span>""</span> to get a quote in the result`,
			solution_f: `="Hello ""Bob"""`,
			kcs: [ KC_NAMES.TEXT_QUOTES ],
		}, {
			...address_base,
			description: 'Write a formula to say <span>Good "Day" to you</span>',
			helpblock: `Remember that you have to use two quotes when you want that in the output.
				So, write <span>""</span> to get a quote in the result`,
			solution_f: `="Good ""Day"" to you"`,
			kcs: [ KC_NAMES.TEXT_QUOTES ],
		}, {
			...address_base,
			description: 'Write a formula to say <span>"Bob" is my name</span>',
			helpblock: `Remember that you have to use two quotes when you want that in the output.
				So, write <span>""</span> to get a quote in the result`,
			solution_f: `="""Bob"" is my name"`,
			kcs: [ KC_NAMES.TEXT_QUOTES ],
		*/
		}, {
			type: 'IfPageFormulaSchema',
			code: 'test',

			...address_base,
			description: 'Return the city name ',
			instruction: 'Type in the correct formula',

			solution_f: '=b1',
		}, {
			type: 'IfPageFormulaSchema',
			code: 'test',

			...address_base,
			description: 'Write a formula to say <span>Hello Sarah</span>',
			instruction: 'Type in the correct formula',

			solution_f: '="Hello Sarah"',
		}, {
			type: 'IfPageFormulaSchema',
			code: 'test',

			...address_base,
			description: 'Return the state ',
			instruction: 'Type in the correct formula',

			solution_f: '=c1',
		}, {
			type: 'IfPageFormulaSchema',
			code: 'test',

			...address_base,
			description: 'Write a formula to say <span>good morning!</span>',
			instruction: 'Type in the correct formula',

			solution_f: '="good morning!"',
		}

	]
}) //: InertiaKC);


add_if_undefined( { kcs: [ KC_NAMES.TEXT_QUOTES ] }, kc_text_quotes.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.TEXT_QUOTES ] }, kc_text_quotes.test_pages );



//
// Format UPPER/LOWER
// 
// Prereq: Quotes

const kc_text_format = ({
	kc: KC_NAMES.TEXT_FORMAT,
	until_total: 6,
	until_correct: 3,
	tutorial_pages: [
		{	
			...tutorial,

			description: `The <code>UPPER</code> function will turn text from lowercase into UPPERCASE.
				<br/><br/>
				For example, <code>=UPPER(B1)</code> will return each row's last name in uppercase.`,
			instruction: 'Return the <b>last name</b> in uppercase',

			...name_base,

			solution_f: '=upper(b1)',

		}, {
			...tutorial, 

			description: `The <code>LOWER</code> function will turn text into lower-case. It also just takes a single
				argument or value.`,
			instruction: 'Write <code>=LOWER(A1)</code> to grab the first name in lowercase',
			
			...name_base,

			solution_f: '=lower(a1)',
		}, 
	],
	test_pages: [
		{	...test,
			...address_base,
			description: 'Return the street name in uppercase',
			solution_f: '=upper(a1)',
		}, {
			...test,
			...address_base,
			description: 'Return the street name in lowercase',
			solution_f: '=lower(a1)',
		},{
			...test,
			...address_base,
			description: 'Return the state name in uppercase',
			solution_f: '=upper(c1)',
		}, {
			...test,
			...address_base,
			description: 'Return the state name in lowercase',
			solution_f: '=lower(c1)',
		},{
			...test,
			...address_base,
			description: 'Return the city in uppercase',
			solution_f: '=upper(b1)',
		}, {
			...test,
			...address_base,
			description: 'Return the city  in lowercase',
			solution_f: '=lower(b1)',
		}
	]
}) //: InertiaKC);

add_if_undefined( { kcs: [ KC_NAMES.TEXT_FORMAT ] }, kc_text_format.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.TEXT_FORMAT ] }, kc_text_format.test_pages );



//
// Concat, CONCENATE & 
// 
// Prereq: Quoting.

const kc_text_concat = ({
	kc: KC_NAMES.TEXT_CONCAT,
	tutorial_pages: [
		{
			...tutorial,

			description: `Pieces of text can be joined together with <code>&</code>, which 
				you create by pressing <kbd>shift</kbd> and <kbd>7</kbd> on the keyboard.
				<br/><br/>
				This symbol is called the ampersand.`,
			instruction: `Type <code>=A1 & B1</code> to join together the 
					contents of those two cells.`,
			
			...name_base,

			solution_f: '=a1 & b1',

		}, {
			...tutorial,
			
			description: `You can also join together text in quotes.  For example,
					you can type <code>="The" & "Great"</code> to show "TheGreat`,
			instruction: 'Return "The" and B1 and "Professor".',
			
			...name_base,

			solution_f: '="The" & B1 & "Professor"',
			feedback: [],

		}, {
			...tutorial,
			
			description: `So far, you may have noticed that we are squashing text together without
					any spaces. Spaces matter in a formula only if they are <i>inside</i> the quotes.
					<br/><br/>
					So, <code>="Bob" & "Smith"</code> will result in <code>BobSmith</code>, because all of the 
					spaces are outside of the quotes. 
					<br/><br/>
					In contrast, using <code>="Bob " & "Smith"</code> will show <code>Bob Smith</code> because there is a
					space after the first name, but before the closing quote.`,
			instruction: 'Return "The " and B1 and " Professor".',
			helpblock: 'Be sure to include a space after <b>The</b> and before <b>Professor</b>',
			
			...name_base,

			solution_f: '="The " & B1 & " Professor"',
			feedback: [],
		}, {
			...tutorial,
			
			description: 'Concatenating (or joining) text can be useful in re-arranging a name.',
			instruction: 'Return each person\'s last name, a comma, a space, and their first name',
			helpblock: 'You will need to put <code>", "</code> between the last and the first name.',
			
			...name_base,

			solution_f: '=b1 & ", " & a1',
			feedback: [ 
				{ 'has': 'symbols', args: [ '&' ] },
				{ 'has': 'values', args: [ ',', ' ' ] },
				{ 'has': 'symbols', args: [ '"' ] },
				{ 'has': 'no_symbols', args: ['\''] }
			],
		}
	],
	test_pages: [
		{	
			...test,
			...name_base,
			description: 'Return the last name, a comma and space, and the first name',
			solution_f: '=b1 & ", " & a1'

		},{	
			...test,
			...name_base,
			description: 'Return the first name, a space, and the last name',
			solution_f: '=a1 & " " & b1'

		},{	
			...test,
			...name_base,
			description: 'Write a formula that writes <code>Hello X</code>, where <code>X</code> is their first name.',
			solution_f: '="Hello " & a1'

		},{	
			...test,
			...name_base,
			description: 'Write a formula that shows their last name and adds <code>, Jr.</code> to the end.',
			solution_f: '=b1 & ", Jr."'

		},{	
			...test,
			...address_base,
			description: 'Create a formula that shows <code>City, State</code>, using the city and state cells in each row.',
			solution_f: '=b1 & ", " & c1'

		},{	
			...test,
			...address_base,
			description: 'Create a formula that shows <code>State: Z</code>, where <code>Z</code> is the state for each row.',
			solution_f: '="State: " & c1'

		},{	
			...test,
			...address_base,
			description: 'Create a formula that shows the street, city, and state, with a comma and space between each.',
			solution_f: '=a1 & ", " & b1 & ", " & c1'

		},{	
			...test,
			...address_base,
			description: 'Create a formula that shows <code>City (State)</code>, using the city and state values in each row.',
			solution_f: '=b1 & " (" & c1 & ")"'
		}
	]
}) //: InertiaKC);

add_if_undefined( { kcs: [ KC_NAMES.TEXT_CONCAT ] }, kc_text_concat.tutorial_pages, );
add_if_undefined( { kcs: [ KC_NAMES.TEXT_CONCAT ] }, kc_text_concat.test_pages );



// 
// Substitute
// 
const kc_text_substitute = ({
	kc: KC_NAMES.TEXT_SUBSTITUTE,
	until_total: 5,
	until_correct: 3,
	tutorial_pages: [
		{
			...tutorial,
			
			description: `The <code>Substitute</code> function allows you to replace a sequence of a 
				letters in a cell with a new set of letters.
				<br/><br/>
				For example, assume that you typed in "John" as "Jon" multiple times. You can fix 
				this by using <code>Substitute</code>.
				<br/><br/>
				The <code>Substitute</code> function requires 3 arguments: the text being searched,
				the text you are looking to find, and the text to replace it with.`,
			instruction: `Write <code>=Substitute(a1, "John", "Jon")</code> to 
				replace all forms of John with Jon.`,
			
			tests: [
					{ a: 'John', b: 'McConnell' },
					{ a: 'S Jr.', b: 'Douglas' },
					{ a: 'Sam Sn.', b: 'McGranger' },
					{ a: 'John Jr.', b: 'Garrett' },
				],
			column_titles: [ 'First name', 'Last name'],
			column_formats: [ 'text', 'text'],

			solution_f: '=Substitute(a1, "John", "Jon")',

		}, {
			...tutorial,

			description: `We can use <code>Substitute</code> to clean up bad data.
				<br/><br/>
				For example, lets say that you want to replace all spaces in the product code with <code>-</code>.
				<br/><br/>
					You will look in <code>A1</code>, find <code>" "</code>, and replace them with <code>"-"</code>.`,
			instruction: 'Replace all spaces with hyphens.',

			tests: [
					{ a: 'ABC 1234'},
					{ a: 'DEF 123234'},
					{ a: 'ZZZ 12334'},
					{ a: 'ABZ 14234'},
				],
			column_titles: [ 'Product Code' ],
			column_formats: [ 'text' ],

			solution_f: '=Substitute(a1, " ", "-")',
		}
	],
	test_pages: [
		{
			...test,
			...name_base,
			tests: [
				{ a: 'Sarah', b: 'McConnell' },
				{ a: 'S Jr.', b: 'Douglas' },
				{ a: 'Sam Sn.', b: 'McGranger' },
				{ a: 'Jay Jr.', b: 'Garrett' },
			],

			description: 'Use <code>SUBSTITUTE</code> to replace Jr. (from their first name) with Junior.',
			solution_f: '=SUBSTITUTE(a1,"Jr.", "Junior")'

		}, {
			...test,
			...name_base,
			tests: [
				{ a: 'Sarah', b: 'McConnell' },
				{ a: 'S Jr.', b: 'Douglas' },
				{ a: 'Sam Sn.', b: 'McGranger' },
				{ a: 'Jay Jr.', b: 'Garrett' },
			],
			column_formats: ['text', 'text' ],
			column_titles: ['First Name', 'Last Name' ],
			
			description: 'Use <code>SUBSTITUTE</code> to replace Jr. (from their first name) with Senior.',
			solution_f: '=SUBSTITUTE(a1,"Jr.", "Senior")'

		}, {
			...test,
			...name_base,
			tests: [
				{ a: 'Sarah', b: 'McConnell' },
				{ a: 'S Jr.', b: 'Douglas' },
				{ a: 'Sam Sn.', b: 'McGranger' },
				{ a: 'Jay Jr.', b: 'Garrett' },
			],
			
			description: 'Use <code>SUBSTITUTE</code> to replace all spaces from the first name with <code>_</code>.',
			solution_f: '=SUBSTITUTE(a1," ", "_")'

		}, {
			...test,
			...name_base,
			tests: [
				{ a: 'Bob', b: 'McConnell, Jr.' },
				{ a: 'Sam ', b: 'McGranger, Jr.' },
				{ a: 'Jay', b: 'Smith, Jr.' },
				{ a: 'Sarah', b: 'Johnson' },
				{ a: 'Adam', b: 'Lee, Jr.' },
			],

			description: 'Use <code>SUBSTITUTE</code> to change <code>Jr.</code> in their last name to Junior.',
			solution_f: '=SUBSTITUTE(b1,"Jr.", "Junior")'

		}, {
			...test,
			...name_base,
			tests: [
				{ a: 'Sarah', b: 'McConnell' },
				{ a: 'S Jr.', b: 'Douglas' },
				{ a: 'Sam Sn.', b: 'McGranger' },
				{ a: 'Jay Jr.', b: 'Garrett' },
			],

			description: 'Use <code>SUBSTITUTE</code> to change Mc to Mac in all last names.',
			solution_f: '=SUBSTITUTE(b1,"Mc", "Mac")'

		}
]}) //: InertiaKC);

add_if_undefined( { kcs: [ KC_NAMES.TEXT_SUBSTITUTE ] }, kc_text_substitute.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.TEXT_SUBSTITUTE ] }, kc_text_substitute.test_pages );



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Advanced
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//
// Position, LEFT/RIGHT
//
const kc_text_leftright = ({
	kc: KC_NAMES.TEXT_LEFTRIGHT,
	until_correct: 5,
	until_total: 10,
	tutorial_pages: [
		{
			type: 'IfPageTextSchema',
			description: `It's helpful to understand that Excel views text as a sequence of individual characters. 
					These characters could letters, numbers, or special characters. Even a space counts!
					<br/><br/>
					So, a string of <code>Hello 1!</code> has a total of 8 characters. Character 1 is <code>H</code>,
					character 2 is <code>e</code>, and so on. 
					<br/><br/>
					This may seem odd, but is actually really useful. It lets us pull out individual letters, or 
					cut a piece of text into parts.
				`
		},{
			...tutorial,

			description: `Excel provides a range of text functions that are useful for cutting text into parts.
				The <code>LEFT</code> function is used to grab a certain number of letters (including spaces)
				from the left-side of a text value.
				<br/><br/>
				It takes two arguments. The first is the value you want to cut into parts, and the second is a number
				showing how many letters you want to return. For example, <code>=LEFT("test", 2)</code> will 
				return "te" (the first two letters from the left side of "test").`,
			instruction: 'Use <code>LEFT()</code> to return the first <b>3</b> letters from A1.',
			
			...name_base,

			solution_f: '=left(a1, 3)',
		}, {
			...tutorial,
			
			description: `The <code>RIGHT</code> function is very similar to <code>LEFT</code>.
				It starts on the right instead of the left.`,
			instruction: 'Use <code>RIGHT()</code> to return the last letter from A1.',
			
			...name_base,

			solution_f: '=right(a1, 1)',
		},
	],
	test_pages: [
		{	...test,
			...name_base,
			description: 'Return the first letter of their last name.',
			solution_f: '=left(b1,1)'

		},{	
			...test,
			...name_base,
			description: 'Return the first letter of their first name.',
			solution_f: '=left(a1,1)'

		},{	
			...test,
			...name_base,
			description: 'Return the last letter of their last name.',
			solution_f: '=right(b1,1)'

		},{	
			...test,
			...name_base,
			description: 'Return the last letter of their first name.',
			solution_f: '=right(a1,1)'

		},{	
			...test,
			...variable_length_codes_base,
			description: 'Return the first three letters of the product code.',
			solution_f: '=left(a1,3)'

		},{	
			...test,
			...variable_length_codes_base,
			description: 'Return the last three letters of the product code.',
			solution_f: '=right(a1,3)'

		},{	
			...test,
			...variable_length_codes_base,
			description: 'Return the first five letters of the product code.',
			solution_f: '=left(a1,5)'

		},{	
			...test,
			...variable_length_codes_base,
			description: 'Return the last five letters of the product code.',
			solution_f: '=right(a1,5)'

		},
	]
}) //: InertiaKC);

add_if_undefined( { kcs: [ KC_NAMES.TEXT_LEFTRIGHT ] }, kc_text_leftright.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.TEXT_LEFTRIGHT ] }, kc_text_leftright.test_pages );


//
// Position, MID
//
const kc_text_mid = ({
	kc: KC_NAMES.TEXT_MID,
	until_correct: 6,
	until_total: 15,
	tutorial_pages: [
		{
			...tutorial,

			description: `The <code>MID</code> function is very capable. It allows us to cut text
				from the middle of a string. The function requires three parameters. 
				<ul>
					<li>Text: This is the text you want to pull from</li>
					<li>Start_Num: What character do you want to start at?</li>
					<li>Num_Characters: How many characters do you want to return?</li>
				</ul>
				When combined together, you will write something like <code>=MID(A1, 3, 1)</code> to 
				use <code>A1</code> as input, go to position 3, and pull out a single character.
				`,
			instruction: 'Use <code>MID(b1, 3, 2)</code> to return two characters from the last name (starting at position 3)',
			
			...name_base,

			solution_f: '=MID(B1, 3, 2)',

		}, {
			...tutorial,

			description: `Sometimes, you will want to extract all text after a certain point.
				<br/><br/>
				As an example, assume that you want to remove the Mr. or Ms. prefix from a list of last names. 
				
				While <code>RIGHT</code> could pull a certain number of characters, each name is a different length. Since
				<code>RIGHT</code> needs to know exactly how many characters to return, it would be somewhat complicated to write. 
				<br/><br/>
				In those cases, <code>MID</code> is much easier. All you have to do is tell it to grab a really big number
				of characters.`,
			instruction: 'Use <code>MID(A1, 4, 99999)</code> to return the last name without a prefix.',
			
			tests: [
				{ 'a': 'Mr. McDonald' },
				{ 'a': 'Mr. David, Jr.' },
				{ 'a': 'Dr. Green' },
				{ 'a': 'Ms. Red' },
			],
			column_titles: [ 'Last name' ],
			column_formats: [ 'text' ],

			solution_f: '=MID(A1, 4, 99999)',

		},{
			...tutorial,
			
			description: `One of the simplest text functions is <code>LEN()</code>.  
				It will return the length of whatever text is passed into it.`,
			instruction: 'Find the length of the text in the first name name cell.',
			helpblock: 'Type in <b>=LEN(A1)</b>',

			...name_base,

			solution_f: '=len(a1)',
			feedback: [ 
				{ 'has': 'functions', args: ['LEN' ] },
			],

		},{
			...tutorial,
			
			description: `<code>LEN</code> is very useful when combined with <code>LEFT</code> and <code>RIGHT</code>.
				Since you do not always know how long a piece of text is going to be, you can combine these together.
				<br/><br/>
				What if you want to return produce codes without the last two characters? You would write
				<code>=LEFT(A1, LEN(A1)-2)</code>. The <code>LEN</code> function would find the total length of the
				code, and then subtract two from it. The resulting number is used to tell <code>LEFT</code> how many
				letters to grab.
				`,
			instruction: 'Return the product code without the last 4 characters',

			...variable_length_codes_base,

			solution_f: '=LEFT(A1, LEN(A1)-4)',
			feedback: [ 
				{ 'has': 'functions', args: ['LEN' ,'LEFT'] },
				{ 'has': 'references', args: ['A1'] },
			],
		},
	],
	test_pages: [
		{	
			...test,
			...name_base,
			description: 'How long is the first name?',
			solution_f: '=len(a1)'

		},{	
			...test,
			...name_base,
			description: 'How long is the last name?',
			solution_f: '=len(b1)'

		},{	
			...test,
			...name_base,
			description: 'Use MID to grab all but the first letter of their first name.',
			solution_f: '=MID(a1,2, 9999)'

		},{	
			...test,
			...name_base,
			description: 'Use MID to grab all but the first letter of their last name.',
			solution_f: '=MID(b1,2, 9999)'

		},{	
			...test,
			...name_base,
			description: 'Use MID to grab 3 letters of their first name, starting with position 2.',
			solution_f: '=MID(a1,2, 3)'
		},{	
			...test,
			...name_base,
			description: 'Use MID to grab 3 letters of their last name, starting with position 3.',
			solution_f: '=MID(b1, 3, 3)'

		},{	
			...test,
			...variable_length_codes_base,
			description: 'How long is the product code?',
			solution_f: '=len(a1)'

		},{	
			...test,
			...variable_length_codes_base,
			description: 'Use MID to get all of the product code starting with the hyphen.',
			solution_f: '=mid(a1, 4, 99999)'

		},{	
			...test,
			...variable_length_codes_base,
			description: 'Use MID to get two characters of the product code starting with the hyphen.',
			solution_f: '=mid(a1, 4, 2)'

		},{	
			...test,
			...variable_length_codes_base,
			description: 'Use MID to get 5 characters of the product code, starting at position 5.',
			solution_f: '=mid(a1, 5, 5)'

		},{	
			...test,
			...variable_length_codes_base,
			description: 'How long is the product code?',
			solution_f: '=len(a1)'

		},
	]
}) //: InertiaKC);

add_if_undefined( { kcs: [ KC_NAMES.TEXT_MID ] }, kc_text_mid.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.TEXT_MID ] }, kc_text_mid.test_pages );


/*
const kc_text_search_the = {
	tests: [
		{ 'a': 'Bob the Jones' },
		{ 'a': 'S. the Garretts' },
		{ 'a': 'The Garcias' },
		{ 'a': 'All The Evergreens' },
	],
	column_formats: ['text'],
	column_titles: ['Name']
};
*/

const kc_text_search_state = {
	tests: [
		{ 'a': 'Portland-OR' },
		{ 'a': 'Evergreen-Oregon' },
		{ 'a': 'Long Beach-CA' },
		{ 'a': 'Dallas-Texas' },
	],
	column_formats: ['text'],
	column_titles: ['City and State']
};

const kc_text_search_sport = {
	tests: [
		{ 'a': 'Green Team:13' },
		{ 'a': 'Red Team:1' },
		{ 'a': 'Blue Team:139' },
		{ 'a': 'Yellow Team:13' },
	],
	column_formats: ['text'],
	column_titles: ['Name']
};

const kc_text_search_productcode = {
	tests: [
		{ 'a': 'ACK-12.West' },
		{ 'a': 'ACK-138.South' },
		{ 'a': 'AC-13.North' },
		{ 'a': 'A-1.East' },
	],
	column_formats: ['text'],
	column_titles: ['Product Code']
};

const kc_text_search_comma = {
	tests: [
		{ 'a': 'Jones, Bob' },
		{ 'a': 'Smith, Sarah' },
		{ 'a': 'Le, James' },
		{ 'a': 'Heathers, J' },
	],
	column_formats: ['text'],
	column_titles: ['Name']
};



//
// Position, Search
//
const kc_text_search = ({
	kc: KC_NAMES.TEXT_SEARCH,
	until_correct: 4,
	until_total: 8,
	tutorial_pages: [
		{	
			/*
			...tutorial,
			
			description: `Text values are easy to modify when they always have the same position for 
				each character.  They are more difficult to manage when the position changes.
				Fortunately, Excel provides a function to find the <i>position</i> of text inside a string.
				<br/><br/>
				The <code>SEARCH</code> function has two parameters. The first is the text you want to find,
				and the second is the text you want to search. The function then returns the position of the
				search value inside of the original string.
				<br/><br/>
				For example, say you want to find the position of a <code>.</code> inside of "ABC-1.1".
				You will look for the period (which is your search string) inside of the cell`,
			instruction: 'Use <code>SEARCH(".", a1)</code> to find the position of the period.',
			
			...variable_length_codes_base,

			solution_f: '=search(".", a1)',
			
		}, {
			...tutorial,
			
			description: `You can search for string values that are only a single character, or ones that
				are longer.
				<br/><br/>
				For example, assume that you have the data below and want to find the position of
				<code>the</code>. `,
			instruction: 'Use <code>SEARCH("the", a1)</code> to return where "the" starts.',
			
			...kc_text_search_the,
			
			solution_f: '=search("the", a1)',
			
		},{
			...tutorial,
			
			description: `The real value of <code>SEARCH</code> comes when you combine it with 
				another functions.
				<br/><br/>
				For example, assume you have a table containing a month and year combined together.
				If you want to just get the month, you need to first find the position of the <code>-</code>.
				Then, use that position to grab the correct number of characters.`,
			instruction: 'Use <code>=LEFT(A1, SEARCH("-", a1))</code> to return the month.',
			
			tests: [
				{ a: 'January-Year 1' },
				{ a: 'Feb-Year 2' },
				{ a: 'March-Year 29' },
				{ a: 'June-Y20' },
			],
			column_titles: [ 'Date' ],
			column_formats: [ 'text' ],

			solution_f: '=LEFT(A1, SEARCH("-", a1))',
			
		},{
			...tutorial,
			
			description: `That's good, but it also brought with it the <code>-</code>. If you subtract
				one from the the result of the <code>SEARCH</code> function, then we will just have the month.
				<br/><br/>`,
			instruction: 'Use <code>=LEFT(A1, SEARCH("-", a1)-1)</code> to return the month.',

			tests: [
				{ a: 'January-Year 1' },
				{ a: 'Feb-Year 2' },
				{ a: 'March-Year 29' },
				{ a: 'June-Y20' },
			],
			column_titles: [ 'Date' ],
			column_formats: [ 'text' ],

			solution_f: '=LEFT(A1, SEARCH("-", a1)-1)',
			
		},{
			...tutorial,
			
			description: `Let's try to pull out the last name and comma from the data below.
				<br/><br/>
				Hint: First write a function to find the position of the comma. Then, use that output
				to tell a <code>LEFT</code> function how many characters to grab.
				`,
			instruction: `Your formula should look something like <code>LEFT(..., SEARCH(..., ...))</code>. 
				Return both the last name and the comma.`,
			...kc_text_search_comma,
			
			solution_f: '=left(a1, search(",", a1))',
			
		},{
			...tutorial,

			description: `Great! Now, you may have noticed that we pulled the last name <b>and</b> the comma character.
				<br/><br/>
				Adapt your previous formula to take <i>one less character</i>. In other words, search finds the position
				of comma, but we don't actually want the comma. We want one less.
				<br/></br>
				So, <code>SEARCH(",", a1)-1</code> will first find the position of the comma. It will then take away 
				one from the result. Using that as input to <code>LEFT</code> will tell the function to take all of the
				text until just before the matching comma.
				`,
			instruction: 'Return just the last name from the text below.',
			
			...kc_text_search_comma,
			
			solution_f: '=left(a1, search(",", a1)-1)',
			
		},{
			*/
			...tutorial,

			description: `How about grabbing their first name? We will still follow the same basic process as before,
				by searching for the comma, and using that position to grab text. 
				<br/><br/>
				Now, we want to use the <code>MID</code> formula. We will use the comma as our starting position.
				You could also use <code>RIGHT</code>, but since
				each person has a different length last name, it would be a bit more complicated.
				`,
			instruction: 'Type <code>=MID(a1, SEARCH(",", a1), 99999)</code> to grab the first name (and comma) from the text below.',
			
			...kc_text_search_comma,
			
			solution_f: '=MID(a1, search(",", a1), 99999)',
			
		},{
			...tutorial,
			
			description: `Now that we have the first name (along with the comma and space), 
				let's tweak the starting position to clean up the output.
				<br/><br/>
				You will want to <i>add</i> two to the starting position, which is being found by the
				<code>SEARCH</code> function. This moves the starting position 
				to the right.
				`,
			instruction: 'Modify your previous <code>=MID(a1, SEARCH(",", a1), 99999)</code> formula to just get the first name.',
			
			...kc_text_search_comma,
			
			solution_f: '=MID(a1, search(",", a1)+2, 9999)',
			
		},
	],
	test_pages: [
		{	
			...test,
			...name_base,
			...kc_text_search_comma,
			description: 'Return the last name, making sure to remove any commas.',
			solution_f: '=LEFT(a1, search(",", a1)-1)',

		},{	
			...test,
			...name_base,
			...kc_text_search_comma,
			description: 'Return the first name, making sure to remove any commas or spaces.',
			solution_f: '=MID(a1, search(",", a1)+2, 99999)',

		},{	
			...test,
			...name_base,
			...kc_text_search_state,
			description: 'Return the city name, making sure to remove any extra characters.',
			solution_f: '=LEFT(a1, search("-", a1)-1)',

		},{	
			...test,
			...name_base,
			...kc_text_search_state,
			description: 'Return the state name, making sure to remove any commas or spaces.',
			solution_f: '=MID(a1, search("-", a1)+1, 99999)',

		},{	
			...test,
			...name_base,
			...kc_text_search_productcode,
			description: 'Return the product name and number, making sure to remove any extra characters.',
			solution_f: '=LEFT(a1, search(".", a1)-1)',

		},{	
			...test,
			...name_base,
			...kc_text_search_productcode,
			description: 'Return the production region, making sure to remove any commas or spaces.',
			solution_f: '=MID(a1, search(".", a1)+1, 99999)',

		},{	
			...test,
			...name_base,
			...kc_text_search_sport,
			description: 'Return the team name, making sure to remove any extra characters.',
			solution_f: '=LEFT(a1, search(":", a1)-1)',

		},{	
			...test,
			...name_base,
			...kc_text_search_sport,
			description: 'Return the team number, making sure to remove any commas or spaces.',
			solution_f: '=MID(a1, search(":", a1)+1, 99999)',

		},	
	]
}) //: InertiaKC);

add_if_undefined( { kcs: [ KC_NAMES.TEXT_SEARCH ] }, kc_text_search.tutorial_pages );
add_if_undefined( { kcs: [ KC_NAMES.TEXT_SEARCH ] }, kc_text_search.test_pages );



//
// Combine different functions.
// 
const kc_text_combine = ({
	kc: KC_NAMES.TEXT_COMBINE,
	tutorial_pages: [
		{
			...tutorial,
			
			description: `You can also put functions inside of each other.  For example,
				<code>=UPPER(LEFT(a1,1))</code> will first get the left-most character 
				from A1, and then turn it into uppercase.`,
			instruction: 'Get the right-most letter of A1 in uppercase.',

			...name_base,

			feedback: [ { 'has': 'functions', args: [ 'right', 'upper' ] }],
			solution_f: '=upper(right(a1,1))',
		}, {
			...tutorial,
			
			description: `Try another! Use <code>LOWER</code> and <code>LEFT</code> 
				to get the first initial (letter) of their last name, and make it
				lowercase.`,
			instruction: 'Get the 1 left-most letter of their last name in lowercase.',

			...name_base,

			feedback: [ { 'has': 'functions', args: [ 'left', 'lower' ] }],
			solution_f: '=lower(left(b1,1))',
		}, {
			...tutorial,
			
			description: 'You can also join together the results of text functions.',
			instruction: `Get the first letter of A1, and use <code>&</code> to 
					join it with the first letter of B1`,

			...name_base,

			solution_f: '=left(a1,1) & left(b1, 1)',
			feedback: [ 
				{ 'has': 'functions', args: [ 'left' ] },
				{ 'has': 'symbols', args: [ '&' ] }
			],
		}, {
			...tutorial,
			
			description: 'You join together text, and then format them as lower or upper case.',
			instruction: `Get the first letter of <code>A1</code>, the first letter of <code>B1</code>, and 
				make them both upper case.  
				<br/><br/>
				Hint: Get the uppercase first letter of the first name, and then join it with the
				uppercase first letter of the last name.`,

			...name_base,

			solution_f: '=upper(left(a1,1) & left(b1, 1))',
			feedback: [ 
				{ 'has': 'functions', args: [ 'left', 'upper' ] },
				{ 'has': 'symbols', args: [ '&' ] }
			],
		}	
	],
	test_pages: [

	]
}) //: InertiaKC);




//
// More advanced combinations.
//

/*


const z_format_and_positional_test = [ {
		...name_base,
		description: 'Return the first letter of their last name in all capital letters.',
		solution_f: '=upper(left(b1,1))'
	}, {
		...name_base,
		description: 'Return the first letter of their first name in all capital letters.',
		solution_f: '=upper(left(a1,1))'
	}, {
		...name_base,
		description: 'Return the first 3 letters of their last name in all lowercase letters.',
		solution_f: '=lower(left(b1,3))'
	}, {
		...name_base,
		description: 'Return the first 3 letters of their first name in all lowercase letters.',
		solution_f: '=lower(left(a1,3))'
	}
];




const concat_and_positional_tutorial = [
	{
		type: 'IfPageFormulaSchema',
		description: 'Now try combining all of these different elements on your own.',
		instruction: 'Combine the first letter of A1 and all of B1.',
		helpblock: 'Type in <b>=left(a1,1) & b1</b>',
		column_titles: [ 'First name', 'Last name'],
		tests: DataFactory.randPeople(4),
		solution_f: '=left(a1,1) & b1',
		code: 'tutorial'
	}, {
		type: 'IfPageFormulaSchema',
		description: 'Now try returning them with a space! ',
		instruction: 'Combine the first letter of A1, a space, and all of B1.',
		tests: DataFactory.randPeople(4),
		solution_f: '=left(a1,1) & " " & b1',
		column_titles: [ 'First name', 'Last name'],
		feedback: [ 
			{ 'has': 'functions', args: [ 'left' ] },
			{ 'has': 'symbols', args: [ '"', '&' ] },
			{ 'has': 'no_symbols', args: ['\''] }
		],
		code: 'tutorial'
	}, 
];

const concat_and_positional_test = [{
		...name_base,
		description: `Write a formula that returns "hello professor X", where X
			is their last name. Be sure to add a space before their name!`,
		solution_f: '="hello professor " & b1',
	}, {
		...name_base,
		description: `Write a formula that returns "X rocks!", where X
			is their first name. Be sure to add a space after their name!`,
		solution_f: '=a1&" rocks!"',
	}, {
		...name_base,
		description: `Write a formula that returns "hello X!", where X
			is their last name.`,
		solution_f: '="hello " & b1 & "!"',
	}, {
		...name_base,
		description: 'Return their last name, and the first letter of their first name',
		solution_f: '=b1&left(a1,1)',
	}, {
		...name_base,
		description: 'Return the first letter of their first name, followed by !',
		solution_f: '=left(a1,1)&"!"',
	}
];

*/


export { 
	// Basic
	kc_text_format,
	kc_text_quotes,
	kc_text_concat,
	kc_text_substitute,

	// Advanced
	kc_text_leftright,
	kc_text_mid,
	kc_text_search,
	kc_text_combine,
 };
