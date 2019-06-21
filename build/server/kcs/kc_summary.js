//      
const { KC_NAMES } = require('./../kcs/kc.js');
const { DataFactory } = require('./../DataFactory');



// Addition
const tutorial_pages = [
	{
		type: 'IfPageFormulaSchema',
		description: `<code>SUM()</code> is the most common function.  
			It will add up any values that you pass to it.  For example, 
			<code>=SUM(1,2,3)</code> will return 6.
			The SUM function can take an unlimited number of arguments or values.
			<br/><br/>
			When putting a number into <code>SUM</code>, do not include any commas. 
			For example, when finding the total of 1,000 and 1, you would write
			<code>=SUM(1000, 1)</code>.  If you write <code>=SUM(1,000, 1)</code>, Excel
			will think that you want to add up 1, 0, and 1.
			`,
		instruction: 'Use <code>SUM()</code> to add up 1, as well as 2000, and finally 1000.',
		tests: [{ a: 'NA' }],
		solution_f: '=sum(1,2000,1000)',
		feedback: [ 
				{ 'has': 'functions', args: ['sum'] },
				{ 'has': 'symbols', args: [','] },
				{ 'has': 'no_symbols', args: ['+'] },
				{ 'has': 'values', args: [1, 2000, 1000] }
			],
		code: 'tutorial'
	}, {
		type: 'IfPageFormulaSchema',
		description: `You can also use references. 
			<br/><br/>
			Remember to put a <code>,</code> (comma) between each argument.  If you use <code>+</code> symbols, 
			Excel does the addition, and then passes the result to the <code>SUM</code> function.
			This makes using <code>sum</code> rather silly!`,
		instruction: 'Use <code>SUM()</code> to find the total number of animals in each row',
		tests: DataFactory.randNumbers(4, 3),
		column_titles: [ 'Cows', 'Pigs', 'Ducks'],
		solution_f: '=sum(a1,b1,c1)',
		feedback: [ 
				{ 'has': 'functions', args: ['sum'] },
				{ 'has': 'symbols', args: [','] },
				{ 'has': 'no_symbols', args: ['+'] },
			],
		code: 'tutorial'
	}, {
		type: 'IfPageFormulaSchema',
		description: 'You can also combine references and numbers.',
		instruction: 'Find the sum of A1, B1, and 100.',
		tests: DataFactory.randNumbers(4, 3),
		solution_f: '=sum(A1,B1,100)',
		feedback: [ 
				{ 'has': 'functions', args: ['sum'] },
				{ 'has': 'symbols', args: [','] },
				{ 'has': 'no_symbols', args: ['+'] },
			],
		code: 'tutorial'
	}, {
		type: 'IfPageFormulaSchema',
		description: `You may be asking why use <code>SUM</code> instead of <code>+</code>?
			The major reason is that it handles <b>range references</b>.  
			<br/><br/>
			If we want to grab all cells in a row, we could write
			<code>=a1+b1+c1+d1+e1+f1</code>. But, that's a long formula, and it will
			get worse as we add more cells.
			<br/><br/>
			Instead, just write <code>=sum(a1:f1)</code> Excel uses the <code>a1:f1</code>
			<i>range</i> reference to include all cells from <code>a1</code> to <code>f1</code>.`,
		instruction: 'Use <code>sum()</code> and the range <code>a1:f1</code>.',
		tests: DataFactory.randNumbers(5, 6),
		solution_f: '=sum(a1:f1)',
		feedback: [ 
				{ 'has': 'functions', args: ['sum'] },
				{ 'has': 'symbols', args: [':'] },
				{ 'has': 'no_symbols', args: [','] },
			],
		code: 'tutorial'
	}, {
		type: 'IfPageFormulaSchema',
		description: `Several other functions are similarly flexible in what they accept.
			<br/><br/>
			For example, <code>COUNT</code> shows how many cells contain a number (but not text!).`,
		instruction: `Use <code>COUNT()</code> and the range <code>A1:B1</code>. Do you see how 
			Excel shows the result of 1? That is because there is only a single number in each row.`,
		tests: DataFactory.randNumbersAndColors(4),
		solution_f: '=count(a1:b1)',
		feedback: [ { 'has': 'functions', args: ['count'] }],
		code: 'tutorial'
	}, {
		type: 'IfPageFormulaSchema',
		description: `<code>AVERAGE</code> returns the <b>mean</b> average of the given cells.
			<br/><br/>
			You could do this manually by adding up all of the numbers and dividing them by the count.
			For example, <code>=SUM(a1:c1)/COUNT(a1:c1)</code>.
			But, it's a lot easier to just write <code>=AVERAGE(a1:c1)</code>!`,
		instruction: 'Use <code>AVERAGE()</code> and the range <code>A1:D1</code>.',
		tests: DataFactory.randNumbers(4, 4),
		solution_f: '=average(a1:D1)',
		feedback: [ { 'has': 'functions', args: ['average'] }],
		code: 'tutorial'
	}, {
		type: 'IfPageFormulaSchema',
		description: '<code>MIN</code> returns the smallest of the given cells. ',
		instruction: 'Use <code>MIN()</code> and the range <code>A1:D1</code>.',
		tests: DataFactory.randNumbers(4, 4),
		solution_f: '=min(a1:d1)',
		feedback: [ { 'has': 'functions', args: ['min'] }],
		code: 'tutorial'
	}, {
		type: 'IfPageFormulaSchema',
		description: '<code>MAX</code> returns the largest of the given cells.',
		instruction: 'Use <code>MAX()</code> and the range <code>A1:C1</code>.',
		tests: DataFactory.randNumbers(4, 4),
		solution_f: '=max(a1:c1)',
		feedback: [ { 'has': 'functions', args: ['max'] }],
		code: 'tutorial'
	}, {
		type: 'IfPageFormulaSchema',
		description: `When you use functions like <code>MAX</code> or <code>MIN</code>, 
			<b>never type commas in a number</b>.  As an example, if you want to find the larger of
			10,000 and 500, you may be tempted to write <code>=MAX(10,000, 500)</code>. 
			<br/><br/>
			Unfortunately, Excel interprets 10,000 as two numbers, meaning that Excel will think you 
			are giving it 10, 0, and 500.
			`,
		instruction: 'Find the largest of 23,000 and sales from each region.',
		column_formats: [ 'text', '$', '$', '$', '$' ],
		client_f_format: '$',
		column_titles: [ 'Year', 'North', 'South', 'West' ],
		tests: [
			{ 'a': 1996, 'b': 10000, 'c': 100, 'd': 100 }, 
			{ 'a': 1997, 'b': 90000, 'c': 1, 'd': 54 }, 
			{ 'a': 1998, 'b': 1000, 'c': 34000, 'd': 10 }, 
			{ 'a': 1999, 'b': 4000, 'c': 434, 'd': 234 }, 
		],
		solution_f: '=max(23000, b1:d1)',
		feedback: [ 
				{ 'has': 'functions', args: ['max'] },
				{ 'has': 'values', args: [23000] },
				{ 'has': 'references', args: ['b1', 'd1'] },
			],
		code: 'tutorial'
	}, {

// Ratios

		type: 'IfPageFormulaSchema',
		description: `You can use a combination of these functions to create
			useful ratios.  <br/><br/>
			For example, say that you want to show East's 
			sales as a portion (ratio) of the overall company's sales.  You would
			write <code>=e1/sum(a1:e1)</code>`,
		client_f_format: '',
		column_formats: [ 'text', '$', '$', '$', '$' ],
		column_titles: [ 'Year', 'North', 'South', 'West', 'East' ],
		tests: [
			{ 'a': 1996, 'b': 100, 'c': 100, 'd': 100, 'e': 23 }, 
			{ 'a': 1997, 'b': 2, 'c': 1, 'd': 54, 'e': 2 }, 
			{ 'a': 1998, 'b': 100, 'c': 23, 'd': 10, 'e': 78 }, 
			{ 'a': 1999, 'b': 4, 'c': 434, 'd': 234, 'e': 96 }, 
		],
		versions: [
			{	solution_f: '=b1/sum(b1:e1)',
				instruction: 'Show North\'s sales as a ratio of the total for the year.'
			},{	solution_f: '=c1/sum(b1:e1)',
				instruction: 'Show South\'s sales as a ratio of the total for the year.'
			},{	solution_f: '=d1/sum(b1:e1)',
				instruction: 'Show West\'s sales as a ratio of the total for the year.'
			}
		],
		feedback: [ { 'has': 'functions', args: ['sum'] }],
		code: 'tutorial'
	}, {
		type: 'IfPageFormulaSchema',
		description: `<code>Max</code> is also useful for ratios.  To show East's sales as a
			ratio of the largest sales, write <code>=e1/max(a1:e1)</code>`,
		client_f_format: '',
		column_formats: [ 'text', '$', '$', '$', '$' ],
		column_titles: [ 'Year', 'North', 'South', 'West', 'East' ],
		tests: [
			{ 'a': 1996, 'b': 100, 'c': 100, 'd': 100, 'e': 23 }, 
			{ 'a': 1997, 'b': 2, 'c': 1, 'd': 54, 'e': 2 }, 
			{ 'a': 1998, 'b': 100, 'c': 23, 'd': 10, 'e': 78 }, 
			{ 'a': 1999, 'b': 4, 'c': 434, 'd': 234, 'e': 96 }, 
		],
		versions: [
			{	solution_f: '=b1/max(b1:e1)',
				instruction: 'Show North\'s sales as a ratio of the largest sales in the year.'
			},{	solution_f: '=c1/max(b1:e1)',
				instruction: 'Show South\'s sales as a ratio of the largest sales in the year.'
			},{	solution_f: '=d1/max(b1:e1)',
				instruction: 'Show West\'s sales as a ratio of the largest sales in the year.'
			}
		],
		feedback: [ { 'has': 'functions', args: ['max'] }],
		code: 'tutorial'
	}, 	
];




const _base = {
	type: 'IfPageFormulaSchema',
	column_titles: ['NY Sales', 'CA Sales', 'NV Sales', 'OR Sales', 'AZ Sales' ],
	tests: [
		{ a: 10, b: 91, c: 2, d:81, e: 3 },
		{ a: 1, b: 24, c: 42, d:18, e: 40 },
		{ a: 100, b: 23, c: 102, d:23, e: 13 },
		{ a: 100, b: 13, c: 23, d:1, e: 41 },
		{ a: 54, b: 23, c: 2, d:10, e: 42 },
	],
	instruction: 'Type in the correct formula',
	code: 'test',
	kcs: [ KC_NAMES.SUMMARY ],
};




const test_pages = [

// Easy

	{
		..._base,
		description: 'Use <code>SUM</code> to add up sales from NY, CA, and NV.',
		solution_f: '=sum(a1,b1,c1)',
		feedback: [ { 'has': 'functions', args: ['sum'] }]
	}, {
		..._base,
		description: 'Add up the entire row using the correct function.',
		solution_f: '=sum(a1,b1,c1,d1,e1)',
		feedback: [ { 'has': 'functions', args: ['sum'] }]
	}, {
		..._base,
		description: 'What is the largest sales number in the row?',
		solution_f: '=MAX(a1:e1)',
		feedback: [ { 'has': 'functions', args: ['max'] }]
	}, {
		..._base,
		description: 'What is the lowest sales for each row?',
		solution_f: '=MIN(a1:e1)',
		feedback: [ { 'has': 'functions', args: ['min'] }]
	}, {
		..._base,
		description: 'What are the average sales for each row?',
		solution_f: '=average(a1:e1)',
		feedback: [ { 'has': 'functions', args: ['average'] }]
	}, {
		..._base,
		description: 'What is the best sales result from each row?',
		solution_f: '=MAX(a1:e1)',
		feedback: [ { 'has': 'functions', args: ['max'] }]
	}, {
		..._base,
		description: 'What is the lowest sales for each row?',
		solution_f: '=MIN(a1:e1)',
		feedback: [ { 'has': 'functions', args: ['min'] }]
	}, {
		..._base,
		description: `Using <code>sum</code>, add up <code>A1</code>, 10, 
			and the range from <code>C1</code> to <code>D1</code>`,
		solution_f: '=a1+sum(c1:d1)+10',
		feedback: [ { 'has': 'functions', args: ['sum'] }]


// Ratio

	}, {
		..._base,
		description: 'Show NY\'s sales as a ratio of the entire row',
		solution_f: '=a1/sum(a1:e1)',
		feedback: [ { 'has': 'functions', args: ['sum'] }]
	}, {
		..._base,
		description: 'Show CA\'s sales as a ratio of the entire row',
		solution_f: '=b1/sum(a1:e1)',
		feedback: [ { 'has': 'functions', args: ['sum'] }]
	}, {
		..._base,
		description: 'Show AZ\'s sales as a ratio of the entire row',
		solution_f: '=e1/sum(a1:e1)',
		feedback: [ { 'has': 'functions', args: ['sum'] }]
	}, {
		..._base,
		description: 'Show NY\'s sales as a ratio of the largest number in the row',
		solution_f: '=a1/max(a1:e1)',
		feedback: [ { 'has': 'functions', args: ['max'] }]
	}, {
		..._base,
		description: 'Show CA\'s sales as a ratio of the largest number in the row',
		solution_f: '=b1/max(a1:e1)',
		feedback: [ { 'has': 'functions', args: ['max'] }]
	}, {
		..._base,
		description: 'Show AZ\'s sales as a ratio of the largest number in the row',
		solution_f: '=e1/max(a1:e1)',
		feedback: [ { 'has': 'functions', args: ['max'] }]
	}, {
		..._base,
		description: 'Show NY\'s sales as a ratio of the smallest number in the row',
		solution_f: '=a1/min(a1:e1)',
		feedback: [ { 'has': 'functions', args: ['min'] }]
	}, {
		..._base,
		description: 'Show CA\'s sales as a ratio of the smallest number in the row',
		solution_f: '=b1/min(a1:e1)',
		feedback: [ { 'has': 'functions', args: ['min'] }]
	}, {
		..._base,
		description: 'Show AZ\'s sales as a ratio of the smallest number in the row',
		solution_f: '=e1/min(a1:e1)',
		feedback: [ { 'has': 'functions', args: ['min'] }]
	}, {
		..._base,
		description: 'Show NY\'s sales as a ratio of the average of the row',
		solution_f: '=a1/average(a1:e1)',
		feedback: [ { 'has': 'functions', args: ['average'] }]
	}, {
		..._base,
		description: 'Show CA\'s sales as a ratio of the average of the row',
		solution_f: '=b1/average(a1:e1)',
		feedback: [ { 'has': 'functions', args: ['average'] }]
	}, {
		..._base,
		description: 'Show AZ\'s sales as a ratio of the average of the row',
		solution_f: '=e1/average(a1:e1)',
		feedback: [ { 'has': 'functions', args: ['average'] }]
	}

];



module.exports = { 
	kc_summary: {
		kc: KC_NAMES.SUMMARY,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
	}
};
