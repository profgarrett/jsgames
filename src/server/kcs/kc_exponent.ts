import { KC_NAMES } from './../kcs/kc';


const _base = {
	type: 'IfPageFormulaSchema',
	column_titles: [ 'Region A Sales', 'Region B Sales', 'Region C Sales' ],
	tests: [ 
		{ a: 1, b: 4.2, c: 8},
		{ a: 3, b: 12.2, c: 9},
		{ a: 9, b: 13, c: 8},
	],
	column_formats: [ '$', '$', '$' ],
	client_f_format: '$',
	feedback: [
		{ 'has': 'no_symbols', args: ['%'] },
		{ 'has': 'symbols', args: ['*'] },
	],
	template_values: {
		'cell1': 'popCell(a1,b1,c1)',
		'n1': '[1-9]'
	},
	kcs: [ KC_NAMES.EXPONENT ],
}

/*
	Exponents introduction.

	Concepts:
		Compound growth
*/
const tutorial_pages = [	
	{	..._base,
		code: 'tutorial',
		description: `An exponent multiplies a number by itself several times.
				This is sometimes described "raising a number to the power of 2" (or 3, 4, 5, ...).
				<br/><br/>
				We write exponents as <code>2^3</code>.  We use <code>^</code> (caret)
				because keyboards make it difficult to write 2<sup>3</sup>. 
				You can find the <code>^</code> symbol by pressing <kbd>shift</kbd> and <kbd>6</kbd>.`,
		instruction: `To multiply 2 by itself 6 times 
				write <code>=2^6</code>. This has the same results as <code>=2*2*2*2*2*2</code>,
				but is easier to write.`,
		solution_f: '=2^6', 
		feedback: [
			{ has: 'values', args: [2, 6] },
			{ has: 'symbols', args: ['^'] },
		],
	}, {
		..._base,
		code: 'tutorial',
		description: `Exponents are often used in science for convenience in writing large numbers.
				<br/><br/>
				For example, you may write 1,000,000 (one million) as 10<sup>6</sup>.
				That translates into 10*10*10*10*10*10, or 1,000,000.`,
		instruction: 'Create {n1} million by multiplying {n1} by <code>10^6</code>',
		solution_f: '={n1}*10^6', 
		client_f_format: '$',
		feedback: [
			{ has: 'values', args: ['{n1}', 10, 6] },
			{ has: 'symbols', args: ['^'] },
		],
	},{
		..._base,
		description: `You can multiply <code>10^6</code> by a reference to convert a number stored as
				millions into regular dollars.`,
		instruction: 'Convert {cell1_title} into millions by multiplying them by <code>10^6</code>',

		solution_f: '={cell1_ref}*10^6', 
		client_f_format: '$',
		feedback: [
			{ has: 'values', args: [10, 6] },
			{ has: 'symbols', args: ['^'] },
			{ has: 'references', args: ['{cell1_ref}'] }
		],
		code: 'tutorial'
	},{	type: 'IfPageTextSchema',
		description: `There are some common phrases that show you should use exponents.  
				These include:
			<ul>
				<li>Raised Y to the power of X</li>
				<li>Y to the power of X</li>
				<li>Multiply Y by itself X times</li>
			</ul>`,
		code: 'tutorial'
	},{	type: 'IfPageTextSchema',
		description: `As you convert different values from words to an exponential form, just remember
			to count the number of zeros!
			<ul>
				<li>Billion: 1,000,000,000 (9 zeros) is 10^9</li>
				<li>Million: 1,000,000 (6 zeros) is 10^6</li>
				<li>Thousand: 1,000 (3 zeros) is 10^3</li>
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



const _test_base = {
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
	{	..._test_base,
		solution_f: '={cell1_ref}*10^3', 
		description: '{cell1_title} are shown in thousands; convert them into a regular number by multiplying by 10 raised to the correct number (using <code>^</code> )',
	},
	{	..._test_base,
		solution_f: '={cell1_ref}*10^6', 
		description: '{cell1_title} are shown in millions; convert them into regular number by multiplying by 10 raised to the correct number (using <code>^</code> )',
	},
	{	..._test_base,
		solution_f: '={cell1_ref}*10^9', 
		description: '{cell1_title} are shown in billions; convert them into regular number by multiplying by 10 raised to the correct number (using <code>^</code> )',
	},
	{	..._test_base,
		solution_f: '={n1}^{n2}', 
		description: 'Multiply {n1} by itself {n2} times',
	},
	{	..._test_base,
		solution_f: '={n1}^{n2}', 
		description: 'Show {n1} raised to the power of {n2}',
	},
];




	
const kc_exponent = {
		kc: KC_NAMES.EXPONENT,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
//	}: AdaptiveKC)
};


export { 
	kc_exponent }
