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


const t3_dogs = {
	t3_name: 'dogs',
	t3_titles: ['Dog Name', 'Dog Gender', 'Dog Price', 'Dog Weight', 'Dog Height' ],
    t3_formats: ['text', 'text', '$', '0', '0' ],
	t3_rows: [
		[ 'Pete',  'Female', 1531, 432, 23 ], 
		[ 'Sam',  'Male', 842, 132, 18 ], 
		[ 'Sam2',  'Female', 281, 332, 34 ], 
		[ 'Sarah',  'Male', 240, 202, 54 ], 
		[ 'June',  'Female', 81, 32, 8 ], 
		[ 'Jane',  'Female', 154, 32, 12 ], 
	]
};




const _baseT = {
	type: 'IfPageSqlSchema',
	kcs: [ KC_NAMES.KC_SQL_SELECTFROM ],
	code: 'tutorial',
}


const tutorial_pages = [
	{	type: 'IfPageTextSchema',
		description: `
			<iframe width="560" height="315" 
				src="https://www.youtube.com/embed/rWRCEBWBClE?si=mMdx634f5rl3pio6" 
				title="YouTube video player" 
				frameborder="0" 
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
				allowfullscreen></iframe>

			<br/>
			Learning outcomes:<br/>
			<ul>
				<li>Use <code>SELECT *</code> to return all fields</li>
				<li>Use <code>SELECT field1, field2</code> to return specific fields</li>
				<li>Use <code>FROM tablename</code> to choose a table</li>
			<ul>

		`,
		code: 'tutorial'

	}, {	 ..._baseT,
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
			Take a look at the <code>animals</code> table by clicking on the expandable panel below.
			You can also expand the <i>Solution</i> panel.
			`,
		instruction: `Type <code>SELECT * FROM animals</code> in the <i>Query Window</i> below. Then click 
			 <kbd>Refresh query results</kbd> in Query Results.`,

		...t1_animals,
		solution_sql: 'SELECT * FROM animals',
		feedback: [
			{ 'has': 'sql', args: ['*', 'animals'] },
			{ 'has': 'no_sql', args: ['table'] },
		],

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
			feedback: [
				{ 'has': 'sql', args: ['{col1}', '{col2}', 'animals'] },
				{ 'has': 'no_sql', args: ['*'] },
			],
	

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
			feedback: [
				{ 'has': 'sql', args: ['{col1}', 'Name', 'animals'] },
				{ 'has': 'no_sql', args: ['*'] },
			]

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
			feedback: [
				{ 'has': 'sql', args: ['{col1}', 'animals'] },
				{ 'has': 'no_sql', args: ['*'] },
			]

	}, {	..._baseT,
			description: `Good job!   Let's try another table before moving onto the quiz.
				`,
			instruction: `Write a query that shows all prices from the pigs table.`,

			...t1_animals,
			...t2_pigs,

			solution_sql: 'SELECT price FROM pigs',
			feedback: [
				{ 'has': 'sql', args: ['price', 'pigs'] },
				{ 'has': 'no_sql', args: ['*', 'animals'] },
			]

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
		description: `Retrieve {col1} and {col2} from the pigs table.`,
		solution_sql: 'SELECT {col1}, {col2} FROM pigs',
		template_values: {
			'col1': 'popColumn(name,gender,price)',
			'col2': 'popColumn(name,gender,price)',
		}
	}, { 	..._baseX,
		description: `Retrieve {col1} from the pigs table.`,
		solution_sql: 'SELECT {col1} FROM pigs',
		template_values: {
			'col1': 'popColumn(name,gender,price)',
		}
	}, { 	..._baseX,
		description: `Retrieve {col1} and {col2} from the animals table.`,
		solution_sql: 'SELECT {col1}, {col2} FROM animals',
		template_values: {
			'col1': 'popColumn(name,cost,inventory,sold)',
			'col2': 'popColumn(name,cost,inventory,sold)',
		}
	}, { 	..._baseX,
		description: `Retrieve {col1} and {col2} and {col3} from the animals table.`,
		solution_sql: 'SELECT {col1}, {col2}, {col3} FROM animals',
		template_values: {
			'col1': 'popColumn(name,cost,inventory,sold)',
			'col2': 'popColumn(name,cost,inventory,sold)',
			'col3': 'popColumn(name,cost,inventory,sold)',
		}
	},
];


//////////////////
/// Quotes
/////////////////

const _baseT_quotes = {
	type: 'IfPageSqlSchema',
	kcs: [ KC_NAMES.KC_SQL_SELECTFROM_QUOTES ],
	code: 'tutorial',
}

const tutorial_pages_quotes = [
	{	type: 'IfPageTextSchema',
		description: `
			So far, all of our examples have had a single word for table and field names.
			<br/><br/>
			But, you will now need to wrap some names in quotes. Here is an example:
			<br/><br/>
			<code>SELECT "Field Name" FROM animals</code>
			<br/><br/>
			Note that we use <code>"double quote"</code>, and not the <code>'single quote'</code>.  The <code>"double quote"</code> is 
			used for <b>field</b> and <b>table names</b>. The <code>'single quote'</code> is for <b>values</b>.
			<br/><br/>
			Learning outcomes:<br/>
			<ul>
				<li>Use <code>SELECT "field name"</code> to return a specific field with a space</li>
			<ul>

		`,
		code: 'tutorial'

	}, {	..._baseT_quotes,
		description: `Let's try an example. Write a query to retrieve the <code>"breed rating"</code>
			from animals. Be sure to wrap the field name with quotes!
			`,
		instruction: `Write a query that shows <code>"breed rating"</code>.`,

		...t1_animals,

		solution_sql: 'SELECT "{col1}" FROM animals',
		template_values: {
			'col1': 'popColumn(breed rating)',
		},
		feedback: [
			{ 'has': 'sql', args: ['"{col1}"',  'animals'] },
			{ 'has': 'no_sql', args: ['*'] },
		]

	}, {	..._baseT_quotes,
		description: `Let's try another  example.
			<br/><br/>
			We are using a new table! Look at the panel below to find the new table name.
			`,
		instruction: `Write a query that shows the <code>{col1}</code> field.`,

		...t3_dogs,

		solution_sql: 'SELECT "{col1}" FROM dogs',
		template_values: {
			'col1': 'popColumn(dog name,dog gender,dog price)',
		},
		feedback: [
			{ 'has': 'sql', args: ['"{col1}"', 'dogs'] },
			{ 'has': 'no_sql', args: ['*', "animals"] },
		]


	}, {	..._baseT,
		description: `Let's try a final query requiring quotes for field names.
			`,
		instruction: `Write a query that shows the <code>{col1}</code> and <code>{col2}</code> fields.`,

		...t3_dogs,

		solution_sql: 'SELECT "{col1}", "{col2}" FROM dogs',
		template_values: {
			'col1': 'popColumn(dog weight,dog gender,dog height)',
			'col2': 'popColumn(dog weight,dog gender,dog height)',
		},
		feedback: [
			{ 'has': 'sql', args: ['"{col1}"', '"{col2}"', 'dogs'] },
			{ 'has': 'no_sql', args: ['*', "animals"] },
		]

	}
];

/*
	t3_name: 'dogs',
	t3_titles: ['Dog Name', 'Dog Gender', 'Dog Price', 'Dog Weight', 'Dog Height' ],
*/

const _baseX_quotes = {
	type: 'IfPageSqlSchema',
	...t2_pigs,
	...t3_dogs,

	instruction: `Type in the correct sql query.`,
	code: 'test',
	kcs: [ KC_NAMES.KC_SQL_SELECTFROM_QUOTES ],
};


//t3_titles: ['Dog Name', 'Dog Gender', 'Dog Price', 'Dog Weight', 'Dog Height' ],

const test_pages_quotes = [ 
	{ 	..._baseX_quotes,
		description: `Retrieve Dog Name and {col1} from the dogs table.`,
		solution_sql: 'SELECT "dog name", "{col1}" FROM dogs',
		template_values: {
			'col1': 'popColumn(dog gender,dog price,dog weight,dog height)'
		}
	}, { 	..._baseX_quotes,
		description: `Retrieve {col1} and {col2} from the dogs table.`,
		solution_sql: 'SELECT "{col1}", "{col2}" FROM dogs',
		template_values: {
			'col1': 'popColumn(dog gender,dog price,dog weight,dog height)',
			'col2': 'popColumn(dog gender,dog price,dog weight,dog height)',
		}
	}, { 	..._baseX_quotes,
		description: `Retrieve {col1}, {col2}, and {col3} from the dogs table.`,
		solution_sql: 'SELECT "{col1}", "{col2}", "{col3}" FROM dogs',
		template_values: {
			'col1': 'popColumn(dog gender,dog price,dog weight,dog height)',
			'col2': 'popColumn(dog gender,dog price,dog weight,dog height)',
			'col3': 'popColumn(dog gender,dog price,dog weight,dog height)'
		}
	}, { 	..._baseX_quotes,
		description: `Retrieve Name, Price and {col1} from the pigs table.`,
		solution_sql: 'SELECT name, price, "{col1}" FROM pigs',
		template_values: {
			'col1': 'popColumn(pig weight,pig height)'
		}
	}, { 	..._baseX_quotes,
		description: `Retrieve Name and {col1} from the pigs table.`,
		solution_sql: 'SELECT name, "{col1}" FROM pigs',
		template_values: {
			'col1': 'popColumn(pig weight,pig height)'
		}
	}, { 	..._baseX_quotes,
		description: `Retrieve Name, Price and {col1} from the pigs table.`,
		solution_sql: 'SELECT name, price, "{col1}" FROM pigs',
		template_values: {
			'col1': 'popColumn(pig weight,pig height)'
		}
	}, { 	..._baseX_quotes,
		description: `Retrieve {col1}, {col2}, and {col3} from the pigs table.`,
		solution_sql: 'SELECT "{col1}", "{col2}", "{col3}" FROM pigs',
		template_values: {
			'col1': 'popColumn(name,gender,price,pig weight,pig height)',
			'col2': 'popColumn(name,gender,price,pig weight,pig height)',
			'col3': 'popColumn(name,gender,price,pig weight,pig height)',
		}
	},
];



const kc_sql_selectfrom = {
	kc: KC_NAMES.KC_SQL_SELECTFROM,
	tutorial_pages: tutorial_pages,
	test_pages: test_pages,
};

const kc_sql_selectfrom_quotes = {
	kc: KC_NAMES.KC_SQL_SELECTFROM_QUOTES,
	tutorial_pages: tutorial_pages_quotes,
	test_pages: test_pages_quotes,
};

export { kc_sql_selectfrom, kc_sql_selectfrom_quotes }