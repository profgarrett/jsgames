//      
const { KC_NAMES } = require('./../kcs/kc.js');

// Common Data
const farm2_data = {
	column_titles: ['Alpacas', 'Birthrate', 'Children', 'Death rate' ],
	column_formats: [ ',', '%', ',', '%'],
	tests: [
			{ 'a': 10, 'b': 0.3, 'c': 1, 'd': 0.1 }, 
			{ 'a': 13, 'b': 0.4, 'c': 10, 'd': 0 }, 
			{ 'a': 10, 'b': 0.23, 'c': 2, 'd': 0.05 }, 
			{ 'a': 20, 'b': 0.30, 'c': 100, 'd': 0.2 }, 
		]
};
const farm4_data = {
	column_titles: ['Alpacas', 'Baboons', 'Camels',  'Total Animals' ],
	column_formats: [ ',', '', ',', ',', ','],
	tests: [
			{ 'a': 100, 'b': 23, 'c': 1, 'd': 124 }, 
			{ 'a': 1, 'b': 20, 'c': 10, 'd': 31 }, 
			{ 'a': 10, 'b': 20, 'c': 2, 'd': 32 }, 
			{ 'a': 20, 'b': 1, 'c': 100, 'd': 121 }, 
		]
};



// Addition
const tutorial_pages = [
	{	type: 'IfPageFormulaSchema',
			description: `If you multiply by a decimal number (0.5), then 
					the result is the <b>increase</b>.
					<br/><br/>
					For example, say that you increase the size of your Alpaca herd by 25%.  You would find the number of <b>new</b>
						 animals by typing <code>=a1*0.25</code>. This does not tell you the total number of animals!
					<br/><br/>
					Remember, never type a % symbol in a formula! Always convert it to a decimal number.`,
			
			column_titles: farm2_data.column_titles,
			column_formats: farm2_data.column_formats,
			tests: farm2_data.tests,
			versions: [
				{	solution_f: '=a1*0.25',
					instruction: 'If 25% (0.25) of the Alpacas have babies, how many <i>new</i> animals will we have?'
				},
				{	solution_f: '=a1*0.45',
					instruction: 'If 45% (0.45) of the Alpacas have babies, how many <i>new</i> animals will we have?'
				},
				{	solution_f: '=a1*0.05',
					instruction: 'If 5% (0.05) of the Alpacas have babies, how many <i>new</i> animals will we have?'
				},
				{	solution_f: '=a1*0.10',
					instruction: 'If 10% (0.1) of the Alpacas have babies, how many <i>new</i> animals will we have?'
				},
			],
			feedback: [
				{ 'has': 'no_symbols', args: ['%'] },
				{ 'has': 'symbols', args: ['*'] },
			],
			kcs: [ KC_NAMES.PERCENT_TO_DECIMAL, KC_NAMES.MULTIPLY, KC_NAMES.MULTIPLY_INCREASE ],
			code: 'tutorial'
		},
		{	type: 'IfPageFormulaSchema',
			description: `Now, imagine that you want to show the <i>new total</i>, rather than the <i>increase</i>. 
					There are two ways you can make this happen.
					<br/><br/>
					Let's show the total number of animals after 10% of them have babies. Two formulas can do this:
					<ul>
						<li><code>=a1*1.1</code>:  This gives us the original number of animals (100%) 
							<i>and</i> the increase (10%).  Adding 100% to 10% gives us 110%, which we write as 1.1.
						<li><code>=a1*0.1+a1</code>: This approach adds the increase (10%) to the original number (a1).</li>
					</ul>
					<br/><br/>
					Either of these approaches will show you the new total number of Alpacas.`,
			
			column_titles: farm2_data.column_titles,
			column_formats: farm2_data.column_formats,
			tests: farm2_data.tests,
			versions: [
				{	solution_f: '=a1*1.25',
					instruction: 'If 25% (0.25) of the Alpacas have babies, how many <i>total</i> animals will we have?'
				},
				{	solution_f: '=a1*1.45',
					instruction: 'If 45% (0.45) of the Alpacas have babies, how many <i>total</i> animals will we have?'
				},
				{	solution_f: '=a1*1.05',
					instruction: 'If 5% (0.05) of the Alpacas have babies, how many <i>total</i> animals will we have?'
				},
				{	solution_f: '=a1*1.10',
					instruction: 'If 10% (0.1) of the Alpacas have babies, how many <i>total</i> animals will we have?'
				},
			],
			feedback: [
				{ 'has': 'no_symbols', args: ['%'] },
				{ 'has': 'symbols', args: ['*'] },
			],
			code: 'tutorial'
		},
];


/*
const practice_pages = [
	{	type: 'IfPageFormulaSchema',
		description: 'Practice with the following problem. You must use <b>multiplication</b> to solve the problem.',
		column_titles: farm2_data.column_titles,
		column_formats: farm2_data.column_formats,
		tests: farm2_data.tests,
		versions: [
			{	solution_f: '=a1*1.25',
				instruction: 'If 25% of the Alpacas have babies, how many <i>total</i> animals will we have?'
			},
			{	solution_f: '=a1*1.45',
				instruction: 'If 45% of the Alpacas have babies, how many <i>total</i> animals will we have?'
			},
			{	solution_f: '=a1*1.05',
				instruction: 'If 5% of the Alpacas have babies, how many <i>total</i> animals will we have?'
			},
			{	solution_f: '=a1*1.10',
				instruction: 'If 10% of the Alpacas have babies, how many <i>total</i> animals will we have?'
			},
		],
		feedback: [
			{ 'has': 'no_symbols', args: ['%'] },
			{ 'has': 'symbols', args: ['*'] },
		],
		code: 'tutorial'
	},	
	{	type: 'IfPageFormulaSchema',
		description: 'Practice with the following problem. You must use <b>multiplication</b> to solve the problem.',
		column_titles: farm2_data.column_titles,
		column_formats: farm2_data.column_formats,
		tests: farm2_data.tests,
		versions: [
			{	solution_f: '=a1*0.21',
				instruction: 'If 21% of the Alpacas have babies, how many <i>new</i> animals will we have?'
			},
			{	solution_f: '=a1*0.41',
				instruction: 'If 41% of the Alpacas have babies, how many <i>new</i> animals will we have?'
			},
			{	solution_f: '=a1*0.06',
				instruction: 'If 6% of the Alpacas have babies, how many <i>new</i> animals will we have?'
			},
			{	solution_f: '=a1*0.11',
				instruction: 'If 11% of the Alpacas have babies, how many <i>new</i> animals will we have?'
			},
		],
		feedback: [
			{ 'has': 'no_symbols', args: ['%'] },
			{ 'has': 'symbols', args: ['*'] },
		],
		code: 'tutorial'
	},	
	{	type: 'IfPageFormulaSchema',
		description: 'Practice with the following problem. You must use <b>multiplication</b> to solve the problem.',
		column_titles: farm2_data.column_titles,
		column_formats: farm2_data.column_formats,
		tests: farm2_data.tests,
		versions: [
			{	solution_f: '=a1*0.25',
				instruction: 'If 25% of the Alpacas are sold, how many <i>fewer</i> animals will we have?'
			},
			{	solution_f: '=a1*0.20',
				instruction: 'If 20% of the Alpacas are sold, how many <i>fewer</i> animals will we have?'
			},
			{	solution_f: '=a1*0.05',
				instruction: 'If 5% of the Alpacas run away, how many <i>fewer</i> animals will we have?'
			},
			{	solution_f: '=a1*0.31',
				instruction: 'If 31% of the Alpacas run away, how many <i>fewer</i> animals will we have?'
			},
		],
		feedback: [
			{ 'has': 'no_symbols', args: ['%'] },
			{ 'has': 'symbols', args: ['*'] },
		],
		code: 'tutorial'
	},
	{	type: 'IfPageFormulaSchema',
		description: 'Practice with the following problem.',
		column_titles: farm2_data.column_titles,
		column_formats: farm2_data.column_formats,
		tests: farm2_data.tests,
		versions: [
			{	solution_f: '=a1*0.75',
				instruction: 'If 25% of the Alpacas are sold, how many <i>total</i> animals will we have?'
			},
			{	solution_f: '=a1*0.80',
				instruction: 'If 20% of the Alpacas are sold, how many <i>total</i> animals will we have?'
			},
			{	solution_f: '=a1*0.95',
				instruction: 'If 5% of the Alpacas run away, how many <i>total</i> animals will we have?'
			},
			{	solution_f: '=a1*0.9',
				instruction: 'If 10% of the Alpacas run away, how many <i>total</i> animals will we have?'
			},
		],
		feedback: [
			{ 'has': 'no_symbols', args: ['%'] },
			{ 'has': 'symbols', args: ['*'] },
		],
		code: 'tutorial'
	},	
];
*/

const _multiply_increase_test_pages_base = {
	type: 'IfPageFormulaSchema',
	column_titles: farm4_data.column_titles,
	column_formats: farm4_data.column_formats,
	tests: farm4_data.tests,

	instruction: 'Type in the correct formula using <b>multiplication</b>',
	client_f_format: '',
	code: 'test',
	template_values: {
		'cell1': 'popCell()',
		'n': '[10-50]',
		'buy': 'randOf(buy,acquire,get)'
	},
	kcs: ['multiply', 'percentile_to_decimal', 'multiply_increase']
};


const test_pages = [
	{
		..._multiply_increase_test_pages_base,
		solution_f: '={cell1_ref}*(1+{n}/100)', 
		description: 'Show the <b>total</b> of {cell1_title} if we {buy} another {n}%. Use <b>multiplication</b>.',

	},{
		// Dup to increase liklihood
		..._multiply_increase_test_pages_base,
		solution_f: '={cell1_ref}*(1+{n}/100)', 
		description: 'Show the <b>total</b> of {cell1_title} if we {buy} another {n}%. Use <b>multiplication</b>.',

	},{
		..._multiply_increase_test_pages_base,
		solution_f: '={cell1_ref}*{n}/100', 
		description: 'Show the <b>increase</b> of {cell1_title} if we {buy} another {n}%. Use <b>multiplication</b>.',
	}
];




module.exports = { 
	kc_multiply_increase: {
		kc: KC_NAMES.MULTIPLY_INCREASE,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
	}
};
