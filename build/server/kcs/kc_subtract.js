//      
const { KC_NAMES } = require('./../kcs/kc.js');

const farm1_data = {
	column_titles: ['Alpacas', 'Baboons', 'Camels', 'Ducks' ],
	tests: [
			{ 'a': 1, 'b': 34, 'c': 39, 'd': 151 }, 
			{ 'a': 3, 'b': 13, 'c': 45, 'd': 189 }, 
			{ 'a': 20, 'b': 38, 'c': 89, 'd': 199 }, 
			{ 'a': 23, 'b': 29, 'c': 99, 'd': 130 }, 
		]
};


const _base_subtract_test_question = {
	type: 'IfPageFormulaSchema',
	column_titles: farm1_data.column_titles,
	tests: farm1_data.tests,
	instruction: `Type in the correct formula. Use the symbols taught in this lesson, such as  <code>+</code> and 
		<code>-</code>.  Do not use functions like <code>SUM</code>.`,
	code: 'test',
	kcs: [ KC_NAMES.SUBTRACT ],
};


const subtract_tutorial_pages = [
	{	type: 'IfPageFormulaSchema',
		description: `We often see problems asking "how many <b>more</b> A do we have than B" or 
				"what is the <b>difference</b> between A and B".
				This means that you should use subtraction.
				<br/><br/>
				It is ok if the result is a negative number.  For example, if you are asked how many more
				pigs we have than dogs, and there are 10 pigs and 20 dogs, the result would be -10.`,
		column_titles: farm1_data.column_titles,
		tests: farm1_data.tests,
		instruction: 'How many more {cell1_title} do we have than {cell2_title}?',
		solution_f: '={cell1_ref}-{cell2_ref}', 
		feedback: [
			{ 'has': 'no_values' },
			{ 'has': 'symbols', args: ['-'] },
			{ 'has': 'references', args: ['{cell1_ref}', '{cell2_ref}'] }
		],
		template_values: {
			'cell1': 'popCell()',
			'cell2': 'popCell()',
		},
		kcs: [ KC_NAMES.SUBTRACT ],
		code: 'tutorial'
	},
	{	type: 'IfPageFormulaSchema',
		description: 'As well as subtracting cells, we can also include numbers.',
		column_titles: farm1_data.column_titles,
		tests: farm1_data.tests,
		instruction: 'If {n} {cell1_title} were {sold}, how many would {remaining}?',
		solution_f: '={cell1_ref}-{n}', 
		feedback: [
			{ 'has': 'values', args: ['{n}'] },
			{ 'has': 'symbols', args: ['-'] },
			{ 'has': 'references', args: ['{cell1_ref}'] }
		],
		template_values: {
			'n': '[2-8]',
			'sold': 'randOf(sold,lost)',
			'remaining': 'randOf(we have remaining,be left)',
			'cell1': 'popCell()',
			'cell2': 'popCell()',
		},
		kcs: [ KC_NAMES.SUBTRACT ],
		code: 'tutorial'
	},
	{	type: 'IfPageTextSchema',
		description: `There are a lot of words that mean you should use subtraction.  Below is a short list of the most common words.
			<ul>
				<li>Change</li>
				<li>Decrease</li>
				<li>Difference</li>
				<li>Less</li>
				<li>Minus</li>
				<li>Take away</li>
				<li>Reduce</li>
			</ul>`,
		code: 'tutorial'
	},
];



const subtract_test_pages = [

	// Subtract numbers from cells
	{	..._base_subtract_test_question,
		solution_f: '={cell1_ref}-{n}', 
		description: 'How many {cell1_title} would we have if we {sold} {n}?',
		feedback: [
			{ 'has': 'values', args: ['{n}'] },
			{ 'has': 'symbols', args: ['-'] },
			{ 'has': 'references', args: ['{cell1_ref}'] }
		],
		template_values: {
			'n': '[2-8]',
			'sold': 'randOf(sold,gave away,reduced them by)',
			'cell1': 'popCell()',
		},
	},

	// More than?
	{	..._base_subtract_test_question,
		solution_f: '={cell1_ref}-{cell2_ref}', 
		description: 'How many more {cell1_title} do we have than {cell2_title}?',
		feedback: [
			{ 'has': 'symbols', args: ['-'] },
			{ 'has': 'references', args: ['{cell1_ref}', '{cell2_ref}'] }
		],
		template_values: {
			'cell1': 'popCell()',
			'cell2': 'popCell()',
		},
	},
	
]; 



module.exports = {
	kc_subtract: {
		kc: KC_NAMES.SUBTRACT,
		tutorial_pages: subtract_tutorial_pages,
		test_pages: subtract_test_pages
	}
};
