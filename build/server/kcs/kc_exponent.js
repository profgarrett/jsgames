//      
const { KC_NAMES } = require('./../kcs/kc.js');



/*
	Exponents introduction.

	Concepts:
		Compound growth
*/
const tutorial_pages = [	
	{	type: 'IfPageFormulaSchema',
		description: `An exponent multiplies a number by itself several times.
				This is sometimes described "raising a number to the power of 2" (or 3, 4, 5, ...).
				<br/><br/>
				We write exponents as <code>2^3</code>.  We use <code>^</code> (caret)
				because keyboards make it difficult to write 2<sup>3</sup>. 
				You can find the <code>^</code> symbol by pressing <kbd>shift</kbd> and <kbd>6</kbd>.`,
		instruction: `To multiply 2 by itself 6 times 
				write <code>=2^6</code>. This has the same results as <code>=2*2*2*2*2*2</code>,
				but is easier to write.`,
		column_formats: [ '' ],
		column_titles: [ '' ],
		tests: [ { 'a': 0, } ],
		solution_f: '=2^6', 
		client_f_format: '',
		code: 'tutorial'
	},
	{	type: 'IfPageFormulaSchema',
		description: `Exponents are often used in science for convience in writing large numbers.
				<br/><br/>
				For example, you may write 1,000,000 (one million) more conviently as 10<sup>6</sup>.`,
		instruction: 'Convert sales into millions by multiplying them by <code>10^6</code>',
		column_formats: [ '$' ],
		column_titles: [ 'Sales (in millions)' ],
		tests: [ 
			{ 'a': 1, },
			{ 'a': 3, },
			{ 'a': 9, },
		],
		solution_f: '=a1*10^6', 
		client_f_format: '$',
		feedback: [
			{ has: 'symbols', args: ['^'] },
		],
		code: 'tutorial'
	},
	{	type: 'IfPageTextSchema',
		description: `There are some common phrases that show you should use exponents.  
				These include:
			<ul>
				<li>Raised Y to the power of X</li>
				<li>Y to the power of X</li>
				<li>Multiply Y by itself X times</li>
			</ul>`,
		code: 'tutorial'
	}	
];



const farm_data = {
	column_titles: ['Sales', 'Costs', 'Profits' ],
	column_formats: [ '$', '$', '$'],
	tests: [
			{ 'a': 100, 'b': 20, c: 80 }, 
			{ 'a': 200, 'b': 80, c: 120 }, 
			{ 'a': 300, 'b': 150, c: 150 }, 
			{ 'a': 400, 'b': 350, c: 50 }, 
		]
};



const _base = {
	type: 'IfPageFormulaSchema',
	column_titles: farm_data.column_titles,
	column_formats: farm_data.column_formats,
	tests: farm_data.tests,

	instruction: 'Type in the correct formula using the exponent symbol <code>^</code>.',
	client_f_format: '',
	code: 'test',
	template_values: {
		'cell1': 'popCell()',
		'n1': '[3-6]',
		'n2': '[4-7]'
	},
	feedback: [
		{ 'has': 'symbols', args: ['^']}
	],
	kcs: [KC_NAMES.EXPONENT_GROWTH]
};

const test_pages = [
	{	..._base,
		solution_f: '={cell1_ref}*10^3', 
		description: '{cell1_title} are shown in thousands; convert them into a regular number by multiplying by 10 raised to the correct number (using <code>^</code> )',
	},
	{	..._base,
		solution_f: '={cell1_ref}*10^6', 
		description: '{cell1_title} are shown in millions; convert them into regular number by multiplying by 10 raised to the correct number (using <code>^</code> )',
	},
	{	..._base,
		solution_f: '={cell1_ref}*10^9', 
		description: '{cell1_title} are shown in billions; convert them into regular number by multiplying by 10 raised to the correct number (using <code>^</code> )',
	},
	{	..._base,
		solution_f: '={n1}^{n2}', 
		description: 'Multiply {n1} by itself {n2} times',
	},
	{	..._base,
		solution_f: '={n1}^{n2}', 
		description: 'Show {n1} raised to the power of {n2}',
	},
];





module.exports = { 
	kc_exponent: {
		kc: KC_NAMES.EXPONENT,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
	}
};