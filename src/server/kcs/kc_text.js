// @flow
const { KC_NAMES } = require('./../kcs/kc.js');
const { DataFactory } = require('./../DataFactory');

import type { AdaptiveKC } from './kc';


// Addition
const tutorial_pages = [
	{	type: 'IfPageTextSchema',
		description: `This tutorial introduces several useful text functions.
			<br/><br/>
			You should be comfortable with formulas and references before 
			starting this tutorial.`
	}, {
		type: 'IfPageFormulaSchema',
		description: `Text in Excel can be stored in two ways:
			<ul>
				<li>In a cell, which can be referred to as <code>=A1</code></li>
				<li>In a formula, which must look like <code>="here is some text"</code></li>
			</ul>
			<br/><br/>
			Text in a formula must always be wrapped in "double-quotes", and not 
			'single quotes'.`,
		instruction: 'Type in <code>="word!"</code>.',
		tests: [ { 'a': ''}],
		solution_f: '="word!"',
		feedback: [  
			{ 'has': 'symbols', args: [ '"' ] },
			{ 'has': 'no_symbols', args: ['\''] }
		],
		code: 'tutorial'
	}, {
		type: 'IfPageFormulaSchema',
		description: `Excel provides a range of text functions.  One of the simplest is 
			<code>LEN()</code>.  It will return the length of whatever text is passed in.`,
		instruction: 'Find the length of "test".',
		helpblock: 'Type in <b>=LEN("test")</b>',
		tests: [ { 'a': ''}],
		feedback: [ 
			{ 'has': 'functions', args: ['LEN' ] },
			{ 'has': 'symbols', args: [ '"' ] },
			{ 'has': 'no_symbols', args: ['\''] }
		],
		solution_f: '=len("test")',
		code: 'tutorial'
	}, {
		type: 'IfPageFormulaSchema',
		description: 'You can also pass in a cell reference to <code>LEN()</code>.',
		instruction: 'How long is the text in cell A1?',
		column_titles: [ 'First name', 'Last name'],
		tests: DataFactory.randPeople(4),
		solution_f: '=len(a1)',
		code: 'tutorial'
	}, {
		type: 'IfPageFormulaSchema',
		description: `The <code>LEFT</code> function is also useful.
			Putting in <code>=LEFT("test", 2)</code> will return two letters
			from the left side of "test".`,
		instruction: 'Use <code>LEFT()</code> to return the first <b>3</b> letters from A1.',
		column_titles: [ 'First name', 'Last name'],
		tests: DataFactory.randPeople(4),
		solution_f: '=left(a1, 3)',
		code: 'tutorial'
	}, {
		type: 'IfPageFormulaSchema',
		description: `The <code>RIGHT</code> function is very similar to <code>LEFT</code>.
			It just starts on the right instead of the left.`,
		instruction: 'Use <code>RIGHT()</code> to return the last letter from A1.',
		tests: DataFactory.randPeople(4),
		column_titles: [ 'First name', 'Last name'],
		solution_f: '=right(a1, 1)',
		code: 'tutorial'
	}, {
		type: 'IfPageFormulaSchema',
		description: 'The <code>UPPER</code> function will turn text from lower-case into upper-case.',
		instruction: 'Return <code>A1</code> in uppercase',
		tests: DataFactory.randPeople(4),
		column_titles: [ 'First name', 'Last name'],
		solution_f: '=upper(a1)',
		code: 'tutorial'
	}, {
		type: 'IfPageFormulaSchema',
		description: 'The <code>LOWER</code> function will turn text into lower-case ',
		instruction: 'Return <code>A1</code> in lowercase',
		column_titles: [ 'First name', 'Last name'],
		tests: DataFactory.randPeople(4),
		solution_f: '=lower(a1)',
		code: 'tutorial'
	}, {

// substitute

		type: 'IfPageFormulaSchema',
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
		solution_f: '=Substitute(a1, "John", "Jon")',
		code: 'tutorial'

	}, {

		type: 'IfPageFormulaSchema',
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
		solution_f: '=Substitute(a1, " ", "-")',
		code: 'tutorial'

	}, {

		type: 'IfPageFormulaSchema',
		description: `The <code>Substitute</code> function can also take out certain sequences of text.
			<br/><br/>
			For example, lets say that you want to update some product codes from <code>Z</code> to 
			<code>A</code>.
			<br/><br/>
				You will look in <code>A1</code>, find <code>"Z-"</code>, and replace them with <code>"A-"</code>.`,
		instruction: 'Replace Z- with AA.',
		tests: [
				{ a: 'Z-1234'},
				{ a: 'Z-123234'},
				{ a: 'Z-12334'},
				{ a: 'Z-14234'},
			],
		column_titles: [ 'Product Code' ],
		solution_f: '=Substitute(a1, "Z-", "A-")',
		code: 'tutorial'

	}, {



// Concat

		type: 'IfPageFormulaSchema',
		description: `Text can also be joined together with <code>&</code>, which 
			you will find by pressing <kbd>shift</kbd> and <kbd>7</kbd>.`,
		instruction: `Type <code>=A1 & B1</code> to join together the 
				contents of those two cells.`,
		column_titles: [ 'First name', 'Last name'],
		tests: DataFactory.randPeople(4),
		solution_f: '=a1 & b1',
		code: 'tutorial'
	}, {
		type: 'IfPageFormulaSchema',
		description: `You can also join together text in quotes.  For example,
				you can type <code>="The " & "Great"</code> to show "The Great`,
		instruction: 'Return "The " and B1 and " Professor".',
		helpblock: 'Be sure to include a space after <b>The</b> and before <b>Professor</b>',
		tests: DataFactory.randPeople(4),
		column_titles: [ 'First name', 'Last name'],
		feedback: [],
		solution_f: '="The " & B1 & " Professor"',
		code: 'tutorial'
	}, {
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
	}, {
		type: 'IfPageFormulaSchema',
		description: 'This is useful for re-arranging a name.',
		instruction: 'Return each person\'s last name, a comma, a space, and their first name',
		tests: DataFactory.randPeople(4),
		solution_f: '=b1 & ", " & a1',
		column_titles: [ 'First name', 'Last name'],
		feedback: [ 
			{ 'has': 'symbols', args: [ '&' ] },
			{ 'has': 'values', args: [ ',', ' ' ] },
			{ 'has': 'symbols', args: [ '"' ] },
			{ 'has': 'no_symbols', args: ['\''] }
		],
		code: 'tutorial'
	}, {


// multiple functions.

		type: 'IfPageFormulaSchema',
		description: `You can also put functions inside of each other.  For example,
			<code>=UPPER(LEFT(a1,1))</code> will first get the left-most character 
			from A1, and then turn it into uppercase.`,
		instruction: 'Get the right-most letter of A1 in uppercase.',
		tests: DataFactory.randPeople(4),
		column_titles: [ 'First name', 'Last name'],
		feedback: [ { 'has': 'functions', args: [ 'right', 'upper' ] }],
		solution_f: '=upper(right(a1,1))',
		code: 'tutorial'
	}, {
		type: 'IfPageFormulaSchema',
		description: `Try another! Use <code>LOWER</code> and <code>LEFT</code> 
			to get the first initial (letter) of their last name, and make it
			lowercase.`,
		instruction: 'Get the 1 left-most letter of their last name in lowercase.',
		tests: DataFactory.randPeople(4),
		column_titles: [ 'First name', 'Last name'],
		feedback: [ { 'has': 'functions', args: [ 'left', 'lower' ] }],
		solution_f: '=lower(left(b1,1))',
		code: 'tutorial'
	}, {
		type: 'IfPageFormulaSchema',
		description: 'You can also join together the results of text functions.',
		instruction: `Get the first letter of A1, and use <code>&</code> to 
				join it with the first letter of B1`,
		tests: DataFactory.randPeople(4),
		column_titles: [ 'First name', 'Last name'],
		solution_f: '=left(a1,1) & left(b1, 1)',
		feedback: [ 
			{ 'has': 'functions', args: [ 'left' ] },
			{ 'has': 'symbols', args: [ '&' ] }
		],
		code: 'tutorial'
	}, {
		type: 'IfPageFormulaSchema',
		description: 'You join together text, and then format them as lower or upper case.',
		instruction: `Get the first letter of <code>A1</code>, the first letter of <code>B1</code>, and 
			make them both upper case.  
			<br/><br/>
			Hint: Get the uppercase first letter of the first name, and then join it with the
			uppercase first letter of the last name.`,
		tests: DataFactory.randPeople(4),
		column_titles: [ 'First name', 'Last name'],
		solution_f: '=upper(left(a1,1) & left(b1, 1))',
		feedback: [ 
			{ 'has': 'functions', args: [ 'left', 'upper' ] },
			{ 'has': 'symbols', args: [ '&' ] }
		],
		code: 'tutorial'
	}	
];




const base = {
	type: 'IfPageFormulaSchema',
	tests: DataFactory.randPeople(4),
	instruction: 'Type in the correct formula',
	column_titles: [ 'First name', 'Last name'],
	code: 'test',
	kcs: [ KC_NAMES.TEXT ],
};



const test_pages = [
	{
		...base,
		tests: [
			{ a: 'Sarah', b: 'McConnell' },
			{ a: 'S Jr.', b: 'Douglas' },
			{ a: 'Sam Sn.', b: 'McGranger' },
			{ a: 'Jay Jr.', b: 'Garrett' },
		],
		description: 'Use <code>SUBSTITUTE</code> to remove Jr. from their first name. Be sure to include the space by typing " Jr."!',
		solution_f: '=SUBSTITUTE(a1," Jr.", "")'
	}, {
		...base,
		tests: [
			{ a: 'Sarah', b: 'McConnell' },
			{ a: 'S Jr.', b: 'Douglas' },
			{ a: 'Sam Sn.', b: 'McGranger' },
			{ a: 'Jay Jr.', b: 'Garrett' },
		],
		description: 'Use <code>SUBSTITUTE</code> to replace all spaces from the first name with <code>_</code>.',
		solution_f: '=SUBSTITUTE(a1," ", "_")'
	}, {
		...base,
		tests: [
			{ a: 'Sarah', b: 'McConnell' },
			{ a: 'S Jr.', b: 'Douglas' },
			{ a: 'Sam Sn.', b: 'McGranger' },
			{ a: 'Jay Jr.', b: 'Garrett' },
		],
		description: 'Use <code>SUBSTITUTE</code> to change Jr. to Junior.',
		solution_f: '=SUBSTITUTE(a1,"Jr.", "Junior")'
	}, {
		...base,
		tests: [
			{ a: 'Sarah', b: 'McConnell' },
			{ a: 'S Jr.', b: 'Douglas' },
			{ a: 'Sam Sn.', b: 'McGranger' },
			{ a: 'Jay Jr.', b: 'Garrett' },
		],
		description: 'Use <code>SUBSTITUTE</code> to change Mc to Mac in all last names.',
		solution_f: '=SUBSTITUTE(b1,"Mc", "Mac")'

// Caps

	}, {
		...base,
		description: 'Return the person\'s first name in uppercase',
		solution_f: '=upper(a1)',
	}, {
		...base,
		description: 'Return the person\'s last name in lowercase',
		solution_f: '=lower(b1)',
	}, {
		...base,
		description: 'Return the first letter of their last name in all capital letters.',
		solution_f: '=upper(left(b1,1))'
	}, {
		...base,
		description: 'Return the first letter of their first name in all capital letters.',
		solution_f: '=upper(left(a1,1))'
	}, {
		...base,
		description: 'Return the first 3 letters of their last name in all lowercase letters.',
		solution_f: '=lower(left(b1,3))'
	}, {
		...base,
		description: 'Return the first 3 letters of their first name in all lowercase letters.',
		solution_f: '=lower(left(a1,3))'
	}, {

// Concat
		...base,
		description: 'Return the last name, a comma and space, and the first name',
		solution_f: '=b1&", "&a1'
	}, {
		...base,
		description: 'Return their last name, and the first letter of their first name',
		solution_f: '=b1&left(a1,1)',
	}, {
		...base,
		description: 'Return the first letter of their first name, followed by !',
		solution_f: '=left(a1,1)&"!"',
	}, {
		...base,
		description: `Write a formula that returns "hello professor X", where X
			is their last name. Be sure to add a space before their name!`,
		solution_f: '="hello professor " & b1',
	}, {
		...base,
		description: `Write a formula that returns "X rocks!", where X
			is their first name. Be sure to add a space after their name!`,
		solution_f: '=a1&" rocks!"',
	}, {
		...base,
		description: `Write a formula that returns "hello X!", where X
			is their last name.`,
		solution_f: '="hello " & b1 & "!"',
	}
];



module.exports = { 
	kc_text: ({
		kc: KC_NAMES.TEXT,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
	}: AdaptiveKC)
};
