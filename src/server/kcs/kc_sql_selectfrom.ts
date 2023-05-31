import { KC_NAMES } from './kc';

const t1_farm1_data = {
	t1_name: 'animals',
	t1_titles: ['Name', 'Cost', 'Inventory', 'Sold', 'Breed Rating' ],
    t1_formats: ['string', '$', '0', '0', 'string' ],
	t1_rows: [
			[ 'Sheep',  34, 54, 400, "A" ], 
			[ 'Goats', 39, 49,  128, "B" ], 
			[ 'Pigs',  38, 58,  189, "A" ], 
			[ 'Dogs', 13, 60, 167, "C" ],
		]
};



const t1_farm2_data = {
	t1_name: 'pigs',
	t1_titles: ['Name', 'Gender', 'Weight' ],
    t1_formats: ['string', 'string', '0' ],
	t1_rows: [
		[ 'Sarah',  'Female', 432 ], 
		[ 'Jane',  'Male', 132 ], 
		[ 'Sue',  'Female', 332 ], 
		[ 'Bob',  'Male', 202 ], 
		[ 'Jerry',  'Female', 32 ], 
		[ 'Ryan',  'Female', 32 ], 
	]
};



const _baseT = {
	type: 'IfPageSqlSchema',
	kcs: [ KC_NAMES.KC_SQL_SELECTFROM ],
	code: 'tutorial',
}
const tutorial_pages = [
	{	..._baseT,
		description: `Let's start with a query showing all of our animals. 
			<br/><br/>	
			<code>SELECT * FROM animals</code>
			<br/><br/>
			Breaking it down,
			<ul> 
				<li><code>SELECT</code> asks the database to show us information (instead of updating, deleting, or inserting)</li>
				<li><code>*</code> says we want all available columns</li>
				<li><code>FROM animals</code> identifies our <i>source</i> table</li>
			</ul>
			Take a look at the <code>animals</code> table by clicking on <i>Table: animals</i> below.
			You can also expand the <i>Solution</i>.
			`,
		instruction: `Type <code>SELECT * FROM animals</code> in the Query Window below. Then click 
			 <kbd>Refresh query results</kbd> in Query Results.`,

		...t1_farm1_data,
		solution_sql: 'SELECT * FROM animals',

	}, {	..._baseT,
			description: `We may not want all columns. You can replace <code>*</code> with the
				the name of each column (separated by commas).
				<br/><br/>
				For example, <code>SELECT name, sold FROM animals</code>
				`,
			instruction: `Write a query that shows the <code>name</code> and <code>{col1}</code> fields.`,
	
			...t1_farm1_data,
	
			solution_sql: 'SELECT name, {col1} FROM animals',

            template_values: {
                'col1': 'randOf(cost,inventory,sold)',
            },


	}, {	..._baseT,
		description: `You may have noticed that the examples CAPITALIZE special words.
			SQL works with either UPPER, MixED, or lower case. But, we generally want to UPPERCASE
			special SQL words (such as <code>SELECT</code> or <code>FROM</code>).
			<br/><br/>
			Tables and columns can be in UPPER, Mixed, or lower case. But, usually it's easier
			to leave them all in lower case.
			`,
		instruction: `Write a query that shows the <code>name</code> and <code>{col1}</code> fields. Experiment by writing in UPPER, lower, and Mixed case.`,

		...t1_farm1_data,

		solution_sql: 'SELECT name, {col1} FROM animals',

		template_values: {
			'col1': 'randOf(cost,inventory,sold)',
		},

	}, {	..._baseT,
		description: `Nice work! As you write more SQL, you'll notice that queries can get very long.
			<br/><br/>
			Queries are a lot easier to read if you press <kbd>Enter</kbd> at the end of each line, and use
				<kbd>Tab</kbd> to add an indent.
			<br/><br/>
			To help you follow this style, the tutorial will automatically format your code prior to submitting
			it. Try submitting a wrong answer to a query, and seeing how it will fix your style.
			`,
		instruction: `Write a query that shows the name field for all animals. Submit an incorrect answer to see how your code is automatically formatted.`,

		...t1_farm1_data,

		solution_sql: 'SELECT name FROM animals ',


	}, {	..._baseT,
		description: `While most tables use a single word for a column or table, some have columns with  multiple words. 
			In those cases, you will need to wrap 
			the words in quotes, such as  <code>SELECT {col1}, inventory FROM animals</code>
			<br/><br/>
			Be sure to put any commas outside of the quote, for example use <code>"breed rating", inventory</code>
			instead of <code>"breed rating," inventory</code>.
			`,
		instruction: `Write a query that shows the <code>{col1}</code> and <code>name</code> fields.`,

		...t1_farm1_data,

		solution_sql: 'SELECT "breed rating", name FROM animals',
		template_values: {
			'col1': 'randOf("breed rating")'
		}

	}, {	..._baseT,
		description: `We can also set the sort order of the resulting table. For example, 
			the query <code>SELECT * FROM animals ORDER BY name</code> will place them in 
			order by name.
			<br/><br/>
			You can also choose if you want ascending (a-z) or descending (z-a). Just add 
			either <code>desc</code> or <code>asc</code> after each field. For example,
			<ul>
				<li><code>SELECT * FROM animals ORDER BY name ASC</code></li>
				<li><code>SELECT * FROM animals ORDER BY name DESC</code> </li>
			</ul>
			`,
		instruction: `Write a query that shows all fields, sorted by breed rating in descending order.`,

		...t1_farm1_data,

		solution_sql: 'SELECT * FROM animals ORDER BY "breed rating" DESC',


	}, {	..._baseT,
		description: `We sometimes will want to sort by multiple fields. You can 
			list each field, separated by a comma.
			<br/><br/>
			For example, <code>SELECT * FROM animals ORDER BY name, weight</code> will place them in 
			order first by name, and then by weight inside of each name.
			`,
		instruction: `Write a query that shows all animals, sorted by Breed Rating and Name.`,

		...t1_farm1_data,

		solution_sql: 'SELECT * FROM animals ORDER BY "Breed Rating", name',


	}
];





const _baseX = {
	type: 'IfPageSqlSchema',
	...t1_farm1_data,
	
	instruction: `Type in the correct sql query.`,
	code: 'test',
	kcs: [ KC_NAMES.KC_SQL_SELECTFROM ],
};

const test_pages = [ 
	{ 	..._baseX,
		description: `Retrieve all fields from the animals table.`,
		solution_sql: 'SELECT * FROM animals',
	}, { 	..._baseX,
		description: `Retrieve all fields from the animals table, sorted by Name ascending.`,
		solution_sql: 'SELECT * FROM animals ORDER BY name',
	}, { 	..._baseX,
		description: `Retrieve all fields from the animals table, sorted by Name descending.`,
		solution_sql: 'SELECT * FROM animals ORDER BY name DESC',
	}, { 	..._baseX,
		description: `Retrieve all fields from the animals table, sorted by Breed Rating ascending.`,
		solution_sql: 'SELECT * FROM animals ORDER BY "Breed Rating"',
	}, { 	..._baseX,
		description: `Retrieve all fields from the animals table, sorted by Breed Rating descending.`,
		solution_sql: 'SELECT * FROM animals ORDER BY "Breed Rating" desc',
	},{ 	..._baseX,
		description: `Retrieve Name and Breed Rating from the animals table.`,
		solution_sql: 'SELECT name, "breed rating" FROM animals',
	},{ 	..._baseX,
		description: `Retrieve Name and Inventory from the animals table.`,
		solution_sql: 'SELECT name, inventory FROM animals',
	},{ 	..._baseX,
		description: `Retrieve Name and Cost from the animals table.`,
		solution_sql: 'SELECT name, cost FROM animals',
	},{ 	..._baseX,
		description: `Retrieve Sold, Inventory, and Name from the animals table.`,
		solution_sql: 'SELECT sold, inventory, name FROM animals',
	},{ 	..._baseX,
		description: `Retrieve Name, Breed Rating, and Inventory from the animals table.`,
		solution_sql: 'SELECT name, "Breed Rating", Inventory FROM animals',
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