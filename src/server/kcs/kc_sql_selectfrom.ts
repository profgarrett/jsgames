import { KC_NAMES } from './kc';

const t1_farm1_data = {
	t1_name: 'animals',
	t1_titles: ['Name', 'Cost', 'Inventory', 'Sold' ],
    t1_formats: ['text', '$', '0', '0' ],
	t1_rows: [
			[ 'Sheep',  34, 54, 400 ], 
			[ 'Goats', 39, 49,  128 ], 
			[ 'Pigs',  38, 58,  189 ], 
			[ 'Dogs', 13, 60, 167 ],
			[ 'Sheep',  34, 54, 400 ], 
			[ 'Goats', 39, 49,  128 ], 
			[ 'Pigs',  38, 58,  189 ], 
			[ 'Dogs', 13, 60, 167 ],
			[ 'Sheep',  34, 54, 400 ], 
			[ 'Goats', 39, 49,  128 ], 
			[ 'Pigs',  38, 58,  189 ], 
			[ 'Dogs', 13, 60, 167 ],
			[ 'Sheep',  34, 54, 400 ], 
			[ 'Goats', 39, 49,  128 ], 
			[ 'Pigs',  38, 58,  189 ], 
			[ 'Dogs', 13, 60, 167 ],
			[ 'Sheep',  34, 54, 400 ], 
			[ 'Goats', 39, 49,  128 ], 
			[ 'Pigs',  38, 58,  189 ], 
			[ 'Dogs', 13, 60, 167 ],
			[ 'Sheep',  34, 54, 400 ], 
			[ 'Goats', 39, 49,  128 ], 
			[ 'Pigs',  38, 58,  189 ], 
			[ 'Dogs', 13, 60, 167 ],
			[ 'Sheep',  34, 54, 400 ], 
			[ 'Goats', 39, 49,  128 ], 
			[ 'Pigs',  38, 58,  189 ], 
			[ 'Dogs', 13, 60, 167 ],
		]
};



const _baseT = {
	type: 'IfPageSqlSchema',
	kcs: [ KC_NAMES.KC_SQL_SELECTFROM ],
	code: 'tutorial',
}
const tutorial_pages = [
	{	..._baseT,
		description: `Let's start with the most basic SQL query. <kbd>SELECT * FROM animals</kbd> will show all rows and columns in our animal table. 
			<br/>	
			Breaking down the query,
			<ul> 
				<li><kbd>SELECT</kbd> asks the database to show us information (instead of updating, deleting, or inserting)</li>
				<li><kbd>*</kbd> says we want all columns in the table</li>
				<li><kbd>FROM</kbd> selects a table </li>
				<li><kbd>animals</kbd> is the name of our table</li>
			</ul>
			`,
		instruction: 'Write <kbd>SELECT * FROM animals</kbd> in the box below',

		...t1_farm1_data,

		solution_sql: 'SELECT * FROM animals',
		solution_results_formats: ['text', '$', '0', '0'],

		template_values: {
	
		},
		feedback: [
	
		],
		
	},{	..._baseT,
		description: `Use ORDER BY
			`,
		instruction: 'Get all fields, ordering by sold',

		...t1_farm1_data,

		solution_sql: 'SELECT * FROM animals ORDER BY sold',
		solution_results_formats: ['text', '$', '0', '0'],

		template_values: {
		},
		feedback: [
		],
		kcs: [ KC_NAMES.KC_SQL_SELECTFROM ],
		code: 'tutorial'
	},


];





const _baseX = {
	type: 'IfPageSqlSchema',
	...t1_farm1_data,
	
	instruction: `Type in the correct sql query.`,
	code: 'test',
	kcs: [ KC_NAMES.KC_SQL_SELECTFROM ],
};

const test_pages = [ 
	{
		..._baseX,
		description: `TEST PAGE - Retrieve all rows from the animals table.`,
		solution_sql: 'SELECT * FROM animals',
		solution_results_formats: ['text', '$', '0', '0'],
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