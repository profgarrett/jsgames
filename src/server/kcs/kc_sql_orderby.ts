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
	kcs: [ KC_NAMES.KC_SQL_ORDERBY ],
	code: 'tutorial',
	...t1_animals,
	...t2_pigs,
}
const tutorial_pages = [
	{	type: 'IfPageTextSchema',
		description: `
		<iframe width="560" height="315" 
			src="https://www.youtube.com/embed/F5DCaowwwlA?si=Z8wAHAIq_hX3Ouw7" 
			title="YouTube video player" 
			frameborder="0" 
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
			allowfullscreen></iframe>`,
		code: 'tutorial'

	}, {	..._baseT,
		description: `We can sort the rows returned by a query. 
			<br/><br/>
			The query <code>SELECT * FROM animals ORDER BY name</code> will order rows
			in alphabetical order by name.
			`,
		instruction: `Write a query that shows all fields in the animals table, sorted by {col1}.`,
 		solution_sql: 'SELECT * FROM animals ORDER BY {col1}',
		template_values: {
			'col1': 'popColumn(name,cost,inventory,sold)',
		}

	}, {	..._baseT,
		description: `Any columns with a space will need to have
			"quotes" around it. 
			<br/><br/>
			For example, a table with a column named <code>Pig Name</code> would be
			<code>SELECT * FROM testtable ORDER BY "Pig Name"</code>
			`,
		instruction: `Write a query that shows all fields in pigs, sorted by {col1}.`,
		solution_sql: 'SELECT * FROM pigs ORDER BY "{col1}"',
		template_values: {
			'col1': 'popColumn(pig weight,pig height)',
		}

	}, {	..._baseT,
		description: `You can choose if you want ascending (a-z) or descending (z-a). Add 
			either <code>DESC</code> or <code>ASC</code> after each field. For example,
			<ul>
				<li><code>SELECT * FROM animals ORDER BY name ASC</code></li>
				<li><code>SELECT * FROM animals ORDER BY name DESC</code> </li>
			</ul>
			By default, all sorts will be in ascending order.
			`,
		instruction: `Write a query that shows all animals, sorted by {col1} in descending order.`,

		solution_sql: 'SELECT * FROM animals ORDER BY {col1} DESC',
		template_values: {
			'col1': 'popColumn(name,cost,inventory,sold)',
		}

	}, {	..._baseT,
		description: `We sometimes want to sort by multiple fields. List each field separated by commas.
			<br/><br/>
			For example, <code>SELECT * FROM animals ORDER BY name, weight</code> will place them in 
			order first by name, and then by weight inside of each name.
			`,
		instruction: `Write a query that shows all animals, sorted by {col1} and {col2}.`,

		solution_sql: 'SELECT * FROM animals ORDER BY {col1}, {col2}',
		template_values: {
			'col1': 'popColumn(name,cost,inventory,sold)',
			'col2': 'popColumn(name,cost,inventory,sold)',
		}


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
// all
	{ 	..._baseX,
		description: `Retrieve all fields from the animals table, sorted by {col1} ascending.`,
		solution_sql: 'SELECT * FROM animals ORDER BY {col1}',
		template_values: {
			'col1': 'popColumn(cost,inventory,sold)',
		},
	}, { 	..._baseX,
		description: `Retrieve all fields from the animals table, sorted by {col1} descending.`,
		solution_sql: 'SELECT * FROM animals ORDER BY {col1} DESC',
		template_values: {
			'col1': 'popColumn(cost,inventory,sold)',
		},
	}, { 	..._baseX,
		description: `Retrieve all fields from the animals table, sorted by {col1} and {col2}.`,
		solution_sql: 'SELECT * FROM animals ORDER BY {col1}, {col2}',
		template_values: {
			'col1': 'popColumn(cost,inventory,sold)',
			'col2': 'popColumn(cost,inventory,sold)',
		},

// Some, sort by column with space
	}, { 	..._baseX,
		description: `Retrieve all fields from the animals table, sorted by {col1} ascending.`,
		solution_sql: 'SELECT * FROM animals ORDER BY "{col1}"',
		template_values: {
			'col1': 'popColumn(pig weight,pig height)',
		}
	}, { 	..._baseX,
		description: `Retrieve all fields from the animals table, sorted by {col1} descending.`,
		solution_sql: 'SELECT * FROM animals ORDER BY "{col1}" DESC',
		template_values: {
			'col1': 'popColumn(pig weight,pig height)',
		}
	}, { 	..._baseX,
		description: `Retrieve all fields from the animals table, sorted by {col1} and {col2}.`,
		solution_sql: 'SELECT * FROM animals ORDER BY "{col1}", "{col2}"',
		template_values: {
			'col1': 'popColumn(pig weight,pig height)',
			'col2': 'popColumn(pig weight,pig height)',
		}
	},

];



const kc_sql_orderby = {
		kc: KC_NAMES.KC_SQL_ORDERBY,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
	};

export { kc_sql_orderby }