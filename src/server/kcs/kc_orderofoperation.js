// @flow
const { KC_NAMES } = require('./../kcs/kc.js');
import type { AdaptiveKC } from './kc';


/*
	Parens

	Concepts:
		Order of operation
*/
const tutorial_pages = [
	{	type: 'IfPageTextSchema',
		description: `Before talking about parentheses, or <code>(</code> and <code>)</code>, we need to 
				address order of operations.
				<br/><br/>
				When completing a math equation, we have to apply the symbols in a certain
				order.  If we don't do this, we can get the wrong result.
				<br/><br/>
				For example, consider <code>=1 - 1 + 1</code>.  How will the computer calculate
				this if we do the <kbd>+</kbd> first?
				<ul>
					<li>=1 - 1 <kbd>+</kbd> 1</li>
					<li>=1 - <kbd>2</kbd></li>
					<li>=1 <kbd>-</kbd> 2</li>
					<li>=<kbd>-1</kbd></li>
				</ul>
				We will get a different result if we do the <kbd>-</kbd> first.
				<ul>
					<li>=1 <kbd>-</kbd> 1 + 1</li>
					<li>=<kbd>0</kbd> + 1</li>
					<li>=0 <kbd>+</kbd> 1</li>
					<li>=<kbd>1</kbd></li>
				</ul>
				<br/><br/>
				As a result, people have decided that we should <b>work from left to right</b>.
				`
	},
	{	type: 'IfPageTextSchema',
		description: `Going from left-to-right works well in most cases, but there is 
				another wrinkle.  Some symbols are calculated first.
				<br/><br/>
				For example, <code>*</code> and <code>/</code> are done before
				<code>+</code> and <code>-</code>.
				<br/><br/>
				For example, consider <code>=1 - 1 * 2</code>.  Normally we would go from
				left to right, meaning that <code>-</code> would happen first.
				However, <code>*</code> has a higher priority.
				<br/><br/>
				As a result, the computer will evaluate the expression in this order:
				<ul>
					<li>=1 - 1 <kbd>*</kbd> 2</li>
					<li>=1 - <kbd>2</kbd></li>
					<li>=1 <kbd>-</kbd> 2</li>
					<li>=<kbd>-1</kbd></li>
				</ul>`
	},
	{	type: 'IfPageTextSchema',
		description: `Exponents have an even higher priority than the other symbols.
				<br/><br/>
				For example, consider <code>=1 - 1 * 2 ^ 2</code>. It will be solved in this order.
				<ul>
					<li>=1 - 1 * 2 <kbd>^</kbd> 2</li>
					<li>=1 - 1 * <kbd>4</kbd></li>
					<li>=1 - 1 <kbd>*</kbd> 4</li>
					<li>=1 - <kbd>4</kbd></li>
					<li>=<kbd>-3</kbd></li>
				</ul>`
	},
	{	type: 'IfPageFormulaSchema',
		description: `Parentheses have the highest priority, "beating" all other operators.
				Because they set what happens first, they end up being extremely useful.
				<br/><br/>
				For example, ABC Farms wants to calculate their total tax rate.  However, 
				the spreadsheet has profit split into two columns. We need to add them together
				first, and then multiply the result by the tax rate.`,
		instruction: `Type in <code>=(A1+B1)*C1</code>.  This makes the addition happen before
				the result is multiplied by the tax rate.`,
		column_formats: [ '$', '$', '%'],
		column_titles: ['California Profit', 'Texas Profit', 'Tax Rate' ],
		tests: [
					{ 'a': 82, 'b': 245, 'c': 0.1 }, 
					{ 'a': 80, 'b': 238, 'c': 0.05 }, 
					{ 'a': 72, 'b': 201, 'c': 0.15 }, 
				],
		solution_f: '=(a1+b1)*c1', 
		client_f_format: '$',
		code: 'tutorial'
	},
	{	type: 'IfPageTextSchema',
		description: `We can summarize the rules as PEMDAS.
				<ul>
					<li><b>P</b>arenthesis</li>
					<li><b>E</b>xponents</li>
					<li><b>M</b>ultiplication and <b>D</b>ivision</li>
					<li><b>A</b>ddition and <b>S</b>ubtraction</li>
				</ul>
				Note that <code>*</code> and <code>/</code> have the same precedence level,
				just like <code>+</code> and <code>-</code>.  When you go through an expression,
				work from left to right, solving parentheses, then exponents, then multiplication 
				and division, and finally addition and subtraction.`
	},
	{	type: 'IfPageTextSchema',
		description: `If you're not clear on these rules, take a couple of minutes and visit 
				the Khan Academy website on this example.
				<br/><br/>
				<a href="https://www.khanacademy.org/math/pre-algebra/pre-algebra-arith-prop/pre-algebra-order-of-operations/v/introduction-to-order-of-operations"
					target="_blank">Khan Academy Tutorial on Order of Operations</a>`
	},
	{	type: 'IfPageParsonsSchema',
		description: `Use PEMDAS to arrange the following expression in order.
				Remember to go from left to right.
				<br/><br/>
				Place them in order, with the first operator to be evaluated on top, 
				and the final one on the bottom.`,
		instruction: 'Solve <code>=1 + (2 - 3) - 1</code>',
		code: 'tutorial',
		solution_items: [ 
				'=1 + (2 <kbd>-</kbd> 3) - 1', 
				'=1 <kbd>+</kbd> (2 - 3) - 1', 
				'=1 + (2 - 3) <kbd>-</kbd> 1', 
			]
	},
	{	type: 'IfPageParsonsSchema',
		description: `Use PEMDAS to arrange the following expression in order.
				Remember to go from left to right.
				<br/><br/>
				Place them in order, with the first operator to be evaluated on top, 
				and the final one on the bottom.`,
		instruction: 'Solve <code>=(2 - 3) * 4 ^ 2</code>',
		code: 'tutorial',
		solution_items: [ 
				'=(2 <kbd>-</kbd> 3) * 4 ^ 2', 
				'=(2 - 3) * 4 <kbd>^</kbd> 2', 
				'=(2 - 3) <kbd>*</kbd> 4 ^ 2'
			]
	},
	{	type: 'IfPageParsonsSchema',
		description: `Use PEMDAS to arrange the following expression in order.
				Remember to go from left to right.
				<br/><br/>
				Place them in order, with the first operator to be evaluated on top, 
				and the final one on the bottom.`,
		instruction: 'Solve <code>=2 ^ 3 * 4 ^ 2 / 4</code>',
		code: 'tutorial',
		solution_items: [ 
				'=2 <kbd>^</kbd> 3 * 4 ^ 2 / 4', 
				'=2 ^ 3 * 4 <kbd>^</kbd> 2 / 4', 
				'=2 ^ 3 <kbd>*</kbd> 4 ^ 2 / 4', 
				'=2 ^ 3 * 4 ^ 2 <kbd>/</kbd> 4', 
			]
	},
	{	type: 'IfPageParsonsSchema',
		description: `Use PEMDAS to arrange the following expression in order.
				Remember to go from left to right.
				<br/><br/>
				Place them in order, with the first operator to be evaluated on top, 
				and the final one on the bottom.`,
		instruction: 'Solve <code>=1 + (2 - 3) * 4 ^ 2 / 5 </code>',
		code: 'tutorial',
		solution_items: [ 
				'=1 + (2 <kbd>-</kbd> 3) * 4 ^ 2 / 5', 
				'=1 + (2 - 3) * 4 <kbd>^</kbd> 2 / 5', 
				'=1 + (2 - 3) <kbd>*</kbd> 4 ^ 2 / 5', 
				'=1 + (2 - 3) * 4 ^ 2 <kbd>/</kbd> 5', 
				'=1 <kbd>+</kbd> (2 - 3 ) * 4 ^ 2 / 5']
	},
	{	type: 'IfPageParsonsSchema',
		description: `Keep using PEMDAS to arrange the following expression in order.
				Remember to go from left to right.
				<br/><br/>
				Place them in order, with the first operator to be evaluated on top, 
				and the final one on the bottom.`,
		instruction: 'Solve <code>=8 + (10 - 2) ^ 2 * 2 + 3</code>',
		code: 'tutorial',
		solution_items: [ 
				'=8 + (10 <kbd>-</kbd> 2) ^ 2 * 2 + 3', 
				'=8 + (10 - 2) <kbd>^</kbd> 2 * 2 + 3', 
				'=8 + (10 - 2) ^ 2 <kbd>*</kbd> 2 + 3', 
				'=8 <kbd>+</kbd> (10 - 2) ^ 2 * 2 + 3', 
				'=8 + (10 - 2) ^ 2 * 2 <kbd>+</kbd> 3']
	},
	{	type: 'IfPageFormulaSchema',
		description: `Why don't you try some problems?
					<br/><br/>
					What is a tenth of the total profit for each region?`,
		instruction: 'Add together the two profit figures, and then use division to figure out a tenth of that amount.',
		column_formats: [ '', '$', '$' ],
		column_titles: [ 'Farm', 'January Profit', 'February Profit' ],
		tests: [
					{ 'a': 'North', 'b': 8020, 'c': 4501 }, 
					{ 'a': 'South', 'b': 9381, 'c': 4781 }, 
					{ 'a': 'East', 'b': 8392, 'c': 4598 }, 
					{ 'a': 'West', 'b': 10421, 'c': 4009 }
				],
		solution_f: '=(b1+c1)/10', 
		client_f_format: '$',
		code: 'tutorial'
	}
];





const _base = {
	type: 'IfPageParsonsSchema',
	description: `Use PEMDAS to arrange the following expression in order.
				Remember to go from left to right.
				<br/><br/>
				Place them in order, with the first operator to be evaluated on top, 
				and the final one on the bottom.`,
	code: 'test',
	kcs: [ KC_NAMES.ORDEROFOPERATION ],
};

const test_pages = [
	{	..._base,
		instruction: 'Solve <code>=1 + (2 + 3) - 1</code>',
		solution_items: [ 
				'=1 + (2 <kbd>+</kbd> 3) - 1', 
				'=1 <kbd>+</kbd> (2 + 3) - 1', 
				'=1 + (2 + 3) <kbd>+</kbd> 1', 
		]
	},
	{	..._base,
		instruction: 'Solve <code>=1 * (2 + 3) / 1</code>',
		solution_items: [ 
				'=1 * (2 <kbd>+</kbd> 3) / 1', 
				'=1 <kbd>*</kbd> (2 + 3) / 1', 
				'=1 * (2 + 3) <kbd>/</kbd> 1', 
		]
	},
	{	..._base,
		instruction: 'Solve <code>=(1 - (2 + 3)) / 1</code>',
		solution_items: [ 
				'=(1 - (2 <kbd>+</kbd> 3)) / 1', 
				'=(1 <kbd>-</kbd> (2 + 3)) / 1', 
				'=(1 - (2 + 3)) <kbd>/</kbd> 1', 
		]
	},
	{	..._base,
		instruction: 'Solve <code>=1 * 2 + 3 / 1</code>',
		solution_items: [ 
				'=1 <kbd>*</kbd> 2 + 3 / 1', 
				'=1 * 2 + 3 <kbd>/</kbd> 1', 
				'=1 * 2 <kbd>+</kbd> 3 / 1', 
		]
	},
	{	..._base,
		instruction: 'Solve <code>=1 - 2 + 3 ^ 1</code>',
		solution_items: [ 
				'=1 - 2 + 3 <kbd>^</kbd> 1', 
				'=1 <kbd>-</kbd> 2 + 3 ^ 1', 
				'=1 - 2 <kbd>+</kbd> 3 ^ 1', 
		]
	},
	{	..._base,
		instruction: 'Solve <code>=1 - 2 + 3 ^ (4 + 5)</code>',
		solution_items: [ 
				'=1 - 2 + 3 ^ (4 <kbd>+</kbd> 5)', 
				'=1 - 2 + 3 <kbd>^</kbd> (4 + 5)', 
				'=1 <kbd>-</kbd> 2 + 3 ^ (4 + 5)', 
				'=1 - 2 <kbd>+</kbd> 3 ^ (4 + 5)', 
		]
	},
	{	..._base,
		instruction: 'Solve <code>=1 ^ 2 + 3 / 1 / 1</code>',
		solution_items: [ 
				'=1 <kbd>^</kbd> 2 + 3 / 1 / 1', 
				'=1 ^ 2 + 3 <kbd>/</kbd> 1 / 1', 
				'=1 ^ 2 + 3 / 1 <kbd>/</kbd> 1', 
				'=1 ^ 2 <kbd>+</kbd> 3 / 1 / 1', 
		]
	},


];



module.exports = { 
	kc_orderofoperation: ({
		kc: KC_NAMES.ORDEROFOPERATION,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
	}: AdaptiveKC)
};
