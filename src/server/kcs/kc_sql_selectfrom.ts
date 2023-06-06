import { KC_NAMES } from './kc';

const t1_animals = {
	t1_name: 'animals',
	t1_titles: ['Name', 'Cost', 'Inventory', 'Sold', 'Breed Rating' ],
    t1_formats: ['text', '$', '0', '0', 'text' ],
	t1_rows: [
			[ 'Sheep',  34, 54, 400, "A" ], 
			[ 'Goats', 39, 49,  128, "B" ], 
			[ 'Pigs',  38, 58,  189, "A" ], 
			[ 'Dogs', 13, 60, 167, "C" ],
		]
};



const t2_pigs = {
	t2_name: 'pigs',
	t2_titles: ['Name', 'Gender', 'Price', 'Pig Weight', 'Pig Height' ],
    t2_formats: ['text', 'text', '$', '0', '0' ],
	t2_rows: [
		[ 'Sarah',  'Female', 1531, 432, 23 ], 
		[ 'Jane',  'Male', 842, 132, 18 ], 
		[ 'Sue',  'Female', 281, 332, 34 ], 
		[ 'Bob',  'Male', 240, 202, 54 ], 
		[ 'Jerry',  'Female', 81, 32, 8 ], 
		[ 'Ryan',  'Female', 154, 32, 12 ], 
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

		...t1_animals,
		solution_sql: 'SELECT * FROM animals',

	}, {	..._baseT,
			description: `We may not want all columns. You can replace <code>*</code> with the
				the name of each column (separated by commas).
				<br/><br/>
				For example, <code>SELECT field1, field2, field3 FROM table2</code>
				`,
			instruction: `Write a query that shows the <code>name</code>, <code>{col1}</code>, and <code>{col2}</code> fields.`,
	
			...t1_animals,
	
			solution_sql: 'SELECT name, {col1}, {col2} FROM animals',

            template_values: {
                'col1': 'popColumn(cost,inventory,sold)',
                'col2': 'popColumn(cost,inventory,sold)',
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

		...t1_animals,

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
		instruction: `Write a query that shows all fields to see the system reformat your response. Then just get the {col1} field to continue this tutorial.`,

		...t1_animals,

		solution_sql: 'SELECT {col1} FROM animals ',

		template_values: {
			'col1': 'randOf(cost,inventory,sold)',
		},

	}, {	..._baseT,
		description: `Some tables have column names containing spaces, such as <code>Animal Name</code>.
			In those cases, you will need to wrap 
			the column name in quotes, such as  <code>SELECT "Breed Rating", inventory FROM animals</code>
			<br/><br/>
			Be sure to put any commas outside of the quote, for example use <code>"breed rating", inventory</code>
			instead of <code>"breed rating," inventory</code>.
			`,
		instruction: `Write a query that shows the <code>breed rating</code> and <code>{col1}</code> fields.`,

		...t1_animals,

		solution_sql: 'SELECT "breed rating", {col1} FROM animals',
		template_values: {
			'col1': 'randOf(name,cost,inventory)'
		}

	}, {	..._baseT,
		description: `Good job! Let's try another table. Look below to see our second table called <b>pigs</b>.
			`,
		instruction: `Write a query that shows all prices from the pigs table.`,

		...t1_animals,
		...t2_pigs,

		solution_sql: 'SELECT price FROM pigs',

	}
];


const _baseX = {
	type: 'IfPageSqlSchema',
	...t1_animals,
	...t2_pigs,

	instruction: `Type in the correct sql query.`,
	code: 'test',
	kcs: [ KC_NAMES.KC_SQL_SELECTFROM ],
};



const test_pages = [ 

	{ 	..._baseX,
		description: `Retrieve all fields from the {tablename} table.`,
		solution_sql: 'SELECT * FROM {tablename}',
		template_values: {
			'tablename': 'randOf(animals,pigs)'
		}
	}, { 	..._baseX,
		description: `Retrieve Name, {col1}, and {col2} from the pigs table.`,
		solution_sql: 'SELECT name, {col1}, {col2} FROM pigs',
		template_values: {
			'col1': 'popColumn(name,gender,price)',
			'col2': 'popColumn(name,gender,price)',
		}
	}, { 	..._baseX,
		description: `Retrieve Name and {col1} from the pigs table.`,
		solution_sql: 'SELECT name, "{col1}" FROM pigs',
		template_values: {
			'col1': 'popColumn(pig weight,pig height)'
		}
	}, { 	..._baseX,
		description: `Retrieve {col1}, {col2}, and {col3} from the pigs table.`,
		solution_sql: 'SELECT "{col1}", "{col2}", "{col3}" FROM pigs',
		template_values: {
			'col1': 'popColumn(name,gender,price,pig weight,pig height)',
			'col2': 'popColumn(name,gender,price,pig weight,pig height)',
			'col3': 'popColumn(name,gender,price,pig weight,pig height)',
		}
	}, { 	..._baseX,
		description: `Retrieve Name and {col1} from the pigs table.`,
		solution_sql: 'SELECT name, "{col1}" FROM pigs',
		template_values: {
			'col1': 'popColumn(pig weight,pig height)'
		}

	},
];


const kc_sql_selectfrom = {
		kc: KC_NAMES.KC_SQL_SELECTFROM,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
	};

export { kc_sql_selectfrom }