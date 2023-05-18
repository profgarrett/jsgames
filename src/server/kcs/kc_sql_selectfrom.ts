import { KC_NAMES } from './kc';

const t1_farm1_data = {
	t1_name: 'animals',
	t1_column_titles: ['Name', 'Cost', 'Inventory', 'Sold' ],
    t1_column_formats: ['text', '$', '0', '0' ],
	t1_rows: [
			[ 'Sheep',  34, 54, 400 ], 
			[ 'Goats', 39, 49,  128 ], 
			[ 'Pigs',  38, 58,  189 ], 
			[ 'Dogs', 13, 60, 167 ],
		]
};



const tutorial_pages = [
	{	type: 'IfPageSqlSchema',
		description: `SQL is used to select items from a table.
			`,
		instruction: 'Write SELECT * FROM table to see all fields.',

		...t1_farm1_data,

		solution_sql: 'SELECT * FROM animals',
		template_values: {
		},
		feedback: [
		],
		kcs: [ KC_NAMES.KC_SQL_SELECTFROM ],
		code: 'tutorial'
	},
	{	type: 'IfPageSqlSchema',
		description: `Use ORDER BY
			`,
		instruction: 'Get all fields, ordering by sold',

		...t1_farm1_data,

		solution_sql: 'SELECT * FROM animals ORDER BY sold',
		template_values: {
		},
		feedback: [
		],
		kcs: [ KC_NAMES.KC_SQL_SELECTFROM ],
		code: 'tutorial'
	},


];





const _base = {
	type: 'IfPageSqlSchema',
	...t1_farm1_data,
	
	instruction: `Type in the correct sql query.`,
	code: 'test',
	kcs: [ KC_NAMES.KC_SQL_SELECTFROM ],
};

const test_pages = [ 
	{
		..._base,
		description: `TEST PAGE - Retrieve all rows from the animals table.`,
		solution_sql: 'SELECT * FROM animals',
	},

	/*
		template_values: {
			'sum': 'randOf(all together,in total)'
		},
		feedback: [
			{ 'has': 'no_values' },
			{ 'has': 'symbols', args: ['+']},
			{ 'has': 'references', args: ['a1', 'b1', 'c1', 'd1']}
		]
	},{
	*/

];



const kc_sql_selectfrom = {
		kc: KC_NAMES.KC_SQL_SELECTFROM,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
	};

export { kc_sql_selectfrom }