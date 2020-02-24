// @flow
const { KC_NAMES } = require('./../kcs/kc.js');
import type { AdaptiveKC } from './kc';

const tutorial = [
	{	type: 'IfPageTextSchema',
		description: `Excel always applies formating when showing a number. As a result, 
				the number <i>displayed</i> may not be the <i>actual</i> number in a cell.
				<br/><br/>
				For example, the result of <code>=1368/1000</code> is 1.368, but it could be 
				shown in any of the following formats:
				<ul>
					<li>Dollar, $1</li>
					<li>Dollars and pennies, $1.37</li>
					<li>Percentage, 136.8%</li>
				</ul>
				Even though it can be shown in these different ways, the <b>underlying
				number is still 1.368</b>.
				`
	},
	/*
	INCORRECT: online acts differently than Excel function.
	{	type: 'IfPageFormulaSchema',
		description: `The <code>FLOOR</code> function takes a number and discards any
			decimals after the <code>.</code> (period or decimal point).`,
		instruction: `Use <code>=FLOOR(c1)</code> to drop off the pennies from 
			the profit.`,
		column_formats: [ '$.', '$.', '$.'],
		column_titles: ['Revenue', 'Cost', 'Profit' ],
		tests: [
					{ 'a': 10, 'b': 3.12, 'c': (10-3.23) },
					{ 'a': 10, 'b': 4.87, 'c': (10-4.87) },
					{ 'a': 10, 'b': 8.91, 'c': (10-8.91) },
				],
		solution_f: '=floor(c1)', 
		client_f_format: '$.',
		code: 'tutorial'
	},
	*/
	{	type: 'IfPageFormulaSchema',
		description: `The <code>ROUND</code> function allows you to choose <i>where</i> to round.
			It looks like this: <code>=ROUND(1.23, 0)</code>
			<ul>
				<li><code>1.23</code> is the number which will be rounded.</li>
				<li><code>0</code> is the <i>position</i> of the rounding.</li>
			</ul>
			The <code>0</code> will round the <code>1.23</code> to
			 the decimal point.`,
		instruction: `Use <code>=ROUND(c1, 0)</code> to round the profit to 
			the nearest dollar.`,
		column_formats: [ '$.', '$.', '$.'],
		column_titles: ['Revenue', 'Cost', 'Profit' ],
		tests: [
					{ 'a': 10, 'b': 3.12, 'c': (10-3.23) },
					{ 'a': 10, 'b': 4.87, 'c': (10-4.87) },
					{ 'a': 10, 'b': 8.91, 'c': (10-8.91) },
				],
		solution_f: '=round(c1,0)', 
		client_f_format: '$.',
		code: 'tutorial'
	},
	{	type: 'IfPageFormulaSchema',
		description: `If we give the <code>ROUND</code> function a different second parameter, 
			it will round to a different position.  
			<ul>
				<li><code>=ROUND(1.234, 0)</code> rounds to 1.000</li>  
				<li><code>=ROUND(1.234, 1)</code> rounds to 1.200</li>  
				<li><code>=ROUND(1.234, 2)</code> rounds to 1.230</li>  
				<li><code>=ROUND(1.234, 3)</code> rounds to 1.234</li>  
			</ul>
			Excel takes the number you pass, and rounds to that many digits <i>right</i> of the 
			decimal point. `,
		instruction: `Use <code>=ROUND(c1, 1)</code> to round the profit to 
			the nearest tenth of a dollar.`,
		column_formats: [ '$.', '$.', '$.'],
		column_titles: ['Revenue', 'Cost', 'Profit' ],
		tests: [
					{ 'a': 10, 'b': 3.12, 'c': (10-3.23) },
					{ 'a': 10, 'b': 4.87, 'c': (10-4.87) },
					{ 'a': 10, 'b': 8.91, 'c': (10-8.91) },
				],
		solution_f: '=round(c1, 1)', 
		client_f_format: '$.',
		code: 'tutorial'
	},
	{	type: 'IfPageFormulaSchema',
		description: `<code>ROUND</code> has one more trick!  If we give a <i>negative</i>
			parameter, it rounds to the <i>left</i> of the decimal point!
			<br/><br/>
			<ul>
				<li><code>=ROUND(123.4, 0)</code> rounds to 123.0</li>  
				<li><code>=ROUND(123.4, -1)</code> rounds to 120.0</li>  
				<li><code>=ROUND(123.4, -2)</code> rounds to 100.0</li>  
			</ul>
			`,
		instruction: `Use <code>=ROUND(c1, -1)</code> to round the profit to 
			the nearest tens (not ten<b>th</b>s).`,
		column_formats: [ '$.', '$.', '$.'],
		column_titles: ['Revenue', 'Cost', 'Profit' ],
		tests: [
					{ 'a': 100, 'b': 3.12, 'c': (100-3.23) },
					{ 'a': 100, 'b': 4.87, 'c': (100-4.87) },
					{ 'a': 100, 'b': 18.91, 'c': (100-18.91) },
				],
		solution_f: '=round(c1, -1)',
		toolbox: [
			{ has: 'functions', args: [ 'round' ] },
			{ has: 'references', args: [ 'c1' ] },
			{ has: 'values', args: [ 'number?'] }
		],
		client_f_format: '$.',
		code: 'tutorial'
	},
	{	type: 'IfPageTextSchema',
		description: `As a reminder, place values to the right of the decimal have a <i>th</i>
			added.  
			<br/><br/>
			One place value to the left of the decimal would be tens, and 
			one place value to the right of the decimal would be ten<b>th</b>s.  
			<br/><br/>
			The same rule applies to hundreds (and hundredths), thousands (and thousandths), and
			so on.`
	},
	/*
	{	type: 'IfPageFormulaSchema',
		description: `Try some more <code>ROUND</code> practice.
			`,
		instruction: `Use <code>ROUND</code> to round the profit to 
			the nearest <i>tenth</i> of a dollar.`,
		column_formats: [ '$.', '$.', '$.'],
		column_titles: ['Revenue', 'Cost', 'Profit' ],
		tests: [
					{ 'a': 100, 'b': 3.12, 'c': (100-3.23) },
					{ 'a': 100, 'b': 4.87, 'c': (100-4.87) },
					{ 'a': 100, 'b': 18.91, 'c': (100-18.91) },
				],
		solution_f: '=round(c1, 1)', 
		toolbox: [
			{ has: 'functions', args: [ 'round' ] },
			{ has: 'references', args: [ 'c1' ] },
			{ has: 'values', args: [ 'number?'] }
		],
		client_f_format: '$.',
		code: 'tutorial'
	},
	{	type: 'IfPageFormulaSchema',
		description: 'Keep going!',
		instruction: `Use <code>ROUND</code> to round the profit to 
			the nearest <i>100s</i> (hundreds) of a dollar.`,
		column_formats: [ '$.', '$.', '$.'],
		column_titles: ['Revenue', 'Cost', 'Profit' ],
		tests: [
					{ 'a': 1000, 'b': 13.12, 'c': (1000-13.23) },
					{ 'a': 1000, 'b': 314.87, 'c': (1000-314.87) },
					{ 'a': 1000, 'b': 118.91, 'c': (1000-118.91) },
				],
		solution_f: '=round(c1, -2)', 
		client_f_format: '$.',
		toolbox: [
			{ has: 'functions', args: [ 'round' ] },
			{ has: 'references', args: [ 'c1' ] },
			{ has: 'values', args: [ 'number?'] }
		],
		code: 'tutorial'
	},
	*/
	{	type: 'IfPageFormulaSchema',
		description: `We can do math inside of the <code>ROUND</code> function. 
			For example, if we use 
			<code>=ROUND(123/100, 0)</code>, it will first calculate 123/100 (which is 1.23),
			and then round the result to the nearest decimal.`,
		instruction: `Subtract cost from revenue, and then round to the result to 
			the nearest dollar.`,
		column_formats: [ '$.', '$.'],
		column_titles: ['Revenue', 'Cost' ],
		tests: [
					{ 'a': 100, 'b': 3.12 },
					{ 'a': 100, 'b': 4.87 },
					{ 'a': 100, 'b': 18.91 }
				],
		solution_f: '=round(a1-b1, 0)',
		toolbox: [
			{ has: 'functions', args: [ 'round' ] },
			{ has: 'references', args: [ 'a1', 'b1' ] },
			{ has: 'symbols', args: [ '-'] },
			{ has: 'values', args: [ 'number?'] }
		],
		client_f_format: '$.',
		code: 'tutorial'
	},
	{	type: 'IfPageFormulaSchema',
		description: 'Now try another example with <code>ROUND</code>.',
		instruction: `Calculate profit, and then <code>ROUND</code> it to
			the hundreds of dollars.`,
		column_formats: [ '$.', '$.'],
		column_titles: ['Revenue', 'Cost' ],
		tests: [
					{ 'a': 1000, 'b': 103.12 },
					{ 'a': 1000, 'b': 304.87 },
					{ 'a': 1000, 'b': 818.91 }
				],
		solution_f: '=round(a1-b1, -2)', 
		toolbox: [
			{ has: 'functions', args: [ 'round' ] },
			{ has: 'references', args: [ 'a1', 'b1' ] },
			{ has: 'symbols', args: [ '-'] },
			{ has: 'values', args: [ 'number?'] }
		],
		client_f_format: '$.',
		code: 'tutorial'
	},
	/*
	{	type: 'IfPageFormulaSchema',
		description: 'Keep going!',
		instruction: `Calculate profit, and then <code>ROUND</code> it to
			the nearest hundreds of dollars.`,
		column_formats: [ '$.', '$.'],
		column_titles: ['Revenue', 'Cost' ],
		tests: [
					{ 'a': 1000, 'b': 103.12 },
					{ 'a': 1000, 'b': 304.87 },
					{ 'a': 1000, 'b': 818.91 }
				],
		solution_f: '=round(a1-b1, -2)', 
		toolbox: [
			{ has: 'functions', args: [ 'round' ] },
			{ has: 'references', args: [ 'a1', 'b1' ] },
			{ has: 'symbols', args: [ '-'] },
			{ has: 'values', args: [ 'number?'] }
		],
		client_f_format: '$.',
		code: 'tutorial'
	},
	
	{	type: 'IfPageFormulaSchema',
		description: 'You can do the same type of math with <code>FLOOR</code>!',
		instruction: 'Use <code>FLOOR</code> to return profit in dollars (with no rounding)',
		column_formats: [ '$.', '$.'],
		column_titles: ['Revenue', 'Cost' ],
		tests: [
					{ 'a': 100, 'b': 3.12 },
					{ 'a': 100, 'b': 4.87 },
					{ 'a': 100, 'b': 18.91 }
				],
		solution_f: '=floor(a1-b1)', 
		toolbox: [
			{ has: 'functions', args: [ 'floor' ] },
			{ has: 'references', args: [ 'a1', 'b1' ] },
			{ has: 'symbols', args: [ '-'] },
		],
		client_f_format: '$.',
		code: 'tutorial'
	}
	*/
];




const _base = {
	kcs: [ KC_NAMES.ROUNDING ],
	type: 'IfPageFormulaSchema',
	instruction: 'Type in the correct formula',
	column_formats: [ '$.', '$.' ],
	column_titles: ['Revenue', 'Cost' ],
	tests: [
				{ 'a': 2003.3, 'b': 213.12  },
				{ 'a': 920.99, 'b': 14.87 },
				{ 'a': 321.45, 'b': 118.91 },
			],
	client_f_format: '$.',
	toolbox: [
		{ has: 'functions', args: [ 'round' ] },
		{ has: 'references', args: [ 'a1', 'b1' ] },
		{ has: 'symbols', args: [ '-'] },
		{ has: 'values', args: ['number?'] }
	],	
	template_values: {
		'cell1': 'popCell()',
	},
	code: 'test',
};




const test = [
		{	..._base,
			description: 'Return the profit in dollars. Round to the nearest dollar.',
			solution_f: '=round(a1-b1,0)'
		},
		{	..._base,
			description: 'Return the profit in dollars rounded to the nearest tenth of a dollar.',
			solution_f: '=round(a1-b1,1)'
		},
		{	..._base,
			description: 'Return the profit in dollars rounded to the nearest hundred dollars.',
			solution_f: '=round(a1-b1,-2)'
		},
		{	..._base,
			description: 'Return the profit in dollars rounded to the nearest tens of dollars.',
			solution_f: '=round(a1-b1,-1)'
		},
		{	..._base,
			description: 'Return the {cell1_title} in dollars. Round to the nearest dollar.',
			solution_f: '=round({cell1_ref},0)'
		},
		{	..._base,
			description: 'Return the {cell1_title} in dollars rounded to the nearest tenth of a dollar.',
			solution_f: '=round({cell1_ref},1)'
		},
		{	..._base,
			description: 'Return the {cell1_title} in dollars rounded to the nearest hundred dollars.',
			solution_f: '=round({cell1_ref},-2)'
		},
		{	..._base,
			description: 'Return the {cell1_title} in dollars rounded to the nearest tens of dollars.',
			solution_f: '=round({cell1_ref},-1)'
		},

	];




module.exports = { 
	kc_rounding: ({
		kc: KC_NAMES.ROUNDING,
		tutorial_pages: tutorial,
		test_pages: test
	}: AdaptiveKC)
};
