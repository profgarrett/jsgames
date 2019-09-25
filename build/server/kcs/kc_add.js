//      
const { KC_NAMES } = require('./../kcs/kc.js');

const farm1_data = {
	column_titles: ['Alpacas', 'Baboons', 'Camels', 'Ducks' ],
	tests: [
			{ 'a': 10, 'b': 34, 'c': 54, 'd': 400 }, 
			{ 'a': 8, 'b': 39, 'c': 49, 'd': 128 }, 
			{ 'a': 6, 'b': 38, 'c': 58, 'd': 189 }, 
			{ 'a': 13, 'b': 13, 'c': 60, 'd': 167 }, 
		]
};


// Addition
const add_tutorial_pages = [
	{	type: 'IfPageFormulaSchema',
		description: `We use the <code>+</code> symbol to add values.
				<br/><br/>
				Be sure to use references, such as <code>A1</code> or <code>B1</code>, 
				instead of typing in numbers that exist in our table.
				<br/><br/>
				Formulas with references can be copied down, and Excel will automatically
				update the references to apply to the new row.
				This saves a lot of time.`,
		helpblock: 'Hint: Your answer should look like <span style="white-space: nowrap;">=__+__</span>',
		column_titles: farm1_data.column_titles,
		tests: farm1_data.tests,
		instruction: 'How many {cell1_title} and {cell2_title} were sold?',
		solution_f: '={cell1_ref}+{cell2_ref}',
		template_values: {
			'cell1': 'popCell()',
			'cell2': 'popCell()'
		},
		feedback: [
			{ 'has': 'no_values' },
			{ 'has': 'symbols', args: ['+']},
			{ 'has': 'references', args: ['{cell1_ref}', '{cell2_ref}']}
		],
		kcs: [ KC_NAMES.ADD ],
		code: 'tutorial'
	},
	{	type: 'IfPageFormulaSchema',
		description: `While we generally want to use references, some times we want to use a 
			number that doesn't already live in our table.  In those cases, it is ok
			to manually type a number into our formula.
			`,
		column_titles: farm1_data.column_titles,
		tests: farm1_data.tests,
		versions: [
			{ instruction: 'If we bought {n} new {cell_title}, how many would we have in total?' }, 
			{ instruction: 'If the {cell_title} had {n} new babies, how many would we have all together?' },
		],
		solution_f: '={n} + {cell_ref}',
		template_values: {
			'n': '[2-5]',
			'cell': 'popCell()'
		},
		feedback: [
			{ 'has': 'values', args: ['{n}']},
			{ 'has': 'symbols', args: ['+']},
			{ 'has': 'references', args: ['{cell_ref}']}
		],
		kcs: [ KC_NAMES.ADD ],
		code: 'tutorial'
	},
	{	type: 'IfPageTextSchema',
		description: `There are a lot of words that mean you should add numbers.  Here are some common ones:
			<ul>
				<li>Add</li>
				<li>Both</li>
				<li>Combined</li>
				<li>Plus</li>
				<li>Sum</li>
				<li>Together</li>
				<li>Total</li>
			</ul>`,
		code: 'tutorial'
	},
];




const _base_add_test_question = {
	type: 'IfPageFormulaSchema',
	column_titles: farm1_data.column_titles,
	tests: farm1_data.tests,
	instruction: `Type in the correct formula. Use the symbols taught in this lesson, such as  <code>+</code>,  
		or <code>-</code>.  Do not use functions like <code>SUM</code>.`,
	code: 'test',
	kcs: [ KC_NAMES.ADD ],
};

const add_test_pages = [
	// Add refs
	{
		..._base_add_test_question,
		solution_f: '=a1+b1+c1+d1', 
		description: 'How many animals do we have {sum}?',
		template_values: {
			'sum': 'randOf(all together,in total)'
		},
		feedback: [
			{ 'has': 'no_values' },
			{ 'has': 'symbols', args: ['+']},
			{ 'has': 'references', args: ['a1', 'b1', 'c1', 'd1']}
		]
	},{
		..._base_add_test_question,
		solution_f: '={cell1_ref}+{cell2_ref}', 
		description: 'What is the {add} of {cell1_title} and {cell2_title}?',
		template_values: {
			'add': 'randOf(total,sum,combined number)',
			'cell1': 'popCell()',
			'cell2': 'popCell()',
		},
		feedback: [
			{ 'has': 'no_values' },
			{ 'has': 'symbols', args: ['+']},
			{ 'has': 'references', args: ['{cell1_ref}', '{cell2_ref}' ]}
		]
	},

	// Add numbers and cells
	{
		..._base_add_test_question,
		solution_f: '=a1+b1+c1+d1+{n}', 
		description: 'If we bought {n} new animals, how many animals would we have in total?',
		template_values: {
			'n': '[3-23]',
		},
		feedback: [
			{ 'has': 'values', args: ['{n}'] },
			{ 'has': 'symbols', args: ['+']},
			{ 'has': 'references', args: ['a1', 'b1', 'c1', 'd1']}
		]
	},{
		..._base_add_test_question,
		solution_f: '={cell1_ref}+{cell2_ref}+{n}', 
		description: 'How many {cell1_title} and {cell2_title} would we have if we bought {n} more?',
		template_values: {
			'n': '[3-9]',
			'cell1': 'popCell()',
			'cell2': 'popCell()',
		},
		feedback: [
			{ 'has': 'symbols', args: ['+']},
			{ 'has': 'values', args: ['{n}'] },
			{ 'has': 'references', args: ['{cell1_ref}', '{cell2_ref}' ]}
		]
	},{
		..._base_add_test_question,
		solution_f: '={cell1_ref} + {n}', 
		description: 'How many {cell1_title} would we have if we bought {n} more?',
		template_values: {
			'n': '[3-9]',
			'cell1': 'popCell()',
		},
		feedback: [
			{ 'has': 'values', args: ['{n}'] },
			{ 'has': 'symbols', args: ['+']},
			{ 'has': 'references', args: ['{cell1_ref}' ]}
		]
	},

];



module.exports = { 
	kc_add: {
		kc: KC_NAMES.ADD,
		tutorial_pages: add_tutorial_pages,
		test_pages: add_test_pages
	}
};
