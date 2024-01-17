import { KC_NAMES } from './kc';

const t1_sheep = {
	t1_name: 'sheep',
	t1_titles: ['Sheep Name', 'Price', 'Age', 'Sold', 'Breed Rating' ],
    t1_formats: ['text', '$', '0', '0', 'text' ],
	t1_rows: [
			[ 'Dad',  300, 3, 1, "A" ], 
			[ 'Mother', 200, 3, 1,"B" ], 
			[ 'Aunt 1',  250, 5, 0, "A" ], 
			[ 'Aunt 2',  275, 4, 0, "C" ], 
			[ 'Baby', 100, 1, 0, "C" ],
			[ 'Descendent',  50, 1, 0, "D" ], 
			[ 'MiXeD CaSe', 100, 1, 0, "C" ],
		]
};


const t1_animals = {
	t1_name: 'animals',
	t1_titles: ['Animal Name', 'Gender', 'Price', 'Weight', 'Overweight', 'Breeding Potential' ],
    t1_formats: ['text', 'text', '$', '0', '0', 'text' ],
	t1_rows: [
		[ 'Mary Sue', 'female', 320, 100, 1, 'No'],
		[ 'Mary', 'female', 230, 340, 0, 'Yes'],
		[ 'Bob', 'male', 1230, 240, 0, 'No'],
		[ 'Barty', 'male', 60, 82, 1, 'No'],
	]
};


const _baseT = {
	type: 'IfPageSqlSchema',
	kcs: [ KC_NAMES.KC_SQL_WHERE ],
	code: 'tutorial',
	...t1_sheep,
}
const tutorial_pages = [
	{	type: 'IfPageTextSchema',
		description: `
			<iframe width="560" height="315" 
				src="https://www.youtube.com/embed/yXFEBYirWXg?si=eIJiZgnc6RepEAML" 
				title="YouTube video player" 
				frameborder="0" 
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
				allowfullscreen></iframe>`,
		code: 'tutorial'

	}, {	..._baseT,
		description: `We can filter out some rows returned by a query. 
			<br/><br/>
			The query <code>SELECT * FROM sheep WHERE price > 260 </code> will only show rows
			with a price over $260. Note that we do not include the dollar sign in the query!
			`,
		instruction: `Write a query that shows all sheep with a price over \${value}.`,
 		solution_sql: 'SELECT * FROM sheep WHERE price > {value} ',
		template_values: {
			'value': 'randOf(125,225,275)',
		}

	}, {	..._baseT,
		description: `These logical tests are similar to <code>IF</code> in Excel.
			<br/><br/>
			Here are the six basic comparisons:
			<ul>
				<li><code>Price &lt; 1</code>: is price is less than one?</li>
				<li><code>Price &lt;= 1</code>: is price is less than or equal to one?</li>
				<li><code>Price &gt; 1</code>: is price is greater than one?</li>
				<li><code>Price &gt;= 1</code>: is price is greater than or equal to one?</li>
				<li><code>Price = 1</code>: is price is equal to one?</li>
				<li><code>Price != 1</code>: is price not equal to one?</li>
			</ul>
			<br/><br/>
			Note that we use != to say that a field is not equal to another value.
			`,
		instruction: `Write a query that shows all sheep with a {col1} over or equal to \${v}.`,
		solution_sql: 'SELECT * FROM sheep WHERE {col1} >= {v}',
		template_values: {
			'col1': 'popColumn(price)',
			'v': 'randOf(250,200,300)',
		}

	}, {	..._baseT,
		description: `If your column has a space in its title, be sure to wrap the name with
			quotes. 
			<br/><br/>
			You must also wrap all text values in quotes. Do not wrap numbers in quotes.
			<br/><br/>
			An example, the query
			<code>SELECT * FROM pigs WHERE "Pig Name" = "Sue"</code>
			shows all pigs with a name of Sue.
			<br/><br/>
			Note that anything in quotes (i.e., "Sue") <b>must match the capitalization exactly!</b>
			<code>Sue</code> is different than <code>sue</code>.
			`,
		instruction: `Write a query that shows all sheep with a name of {v}.`,

		solution_sql: 'SELECT * FROM sheep WHERE "Sheep Name" = "{v}"',
		template_values: {
			'v': 'randOf(Dad,Mother,Aunt 1,Baby)',
		}

	}, {	..._baseT,
		description: `Notice that SQL uses case sensitive string comparisons! 
			<br/><br/>
			So, each of these would be a totally different test:
			<ul>
				<li><code>"Sheep name" = "Dad"</code></li>
				<li><code>"Sheep name" = "dad"</code></li>
				<li><code>"Sheep name" = "DAD"</code></li>
			</ul>
			`,
		instruction: `Write a query that shows the sheep with a name of MiXeD CaSe.`,

		solution_sql: 'SELECT * FROM sheep WHERE "Sheep Name" = "MiXeD CaSe"',
		
	}, {	..._baseT,
		description: `While most columns are made of either numbers or text, some may have a 
			boolean (true or false) value stored as a number. In these cases, you will want
			to treat 0 as false and 1 as true.
			`,
		instruction: `Write a query that shows all sheep that have been sold.`,

		solution_sql: 'SELECT * FROM sheep WHERE sold = 1',


	}, {	..._baseT,
		description: `Finally, you may also do text matching. For example, you can 
			find all pigs with names starting with "Zz" by using the query
			<code>SELECT * FROM pigs WHERE name LIKE 'Zz%'</code>.
			<br/><br/>
			Notice that you must use the <code>LIKE</code> keyword instead of <code>=</code>
			The <code>%</code> symbol then acts as a wildcard, matching any number of 
			characters.
			`,
		instruction: `Write a query that shows all sheep with a name starting with {v}.`,

		solution_sql: 'SELECT * FROM sheep WHERE "Sheep Name" LIKE "{v}%"',
		template_values: {
			'v': 'randOf(D,Aunt)',
		}
	}
];





const _baseX = {
	type: 'IfPageSqlSchema',
	...t1_animals,

	instruction: `Type in the correct sql query.`,
	code: 'test',
	kcs: [ KC_NAMES.KC_SQL_WHERE ],

};

const test_pages = [ 
// all
	{ 	..._baseX,
		description: `Retrieve all animals with a gender of {v1}.`,
		solution_sql: 'SELECT * FROM animals WHERE gender = "{v1}"',
		template_values: {
			'v1': 'randOf(male,female)',
		},
	}, { 	..._baseX,
		description: `Retrieve all animals who are overweight.`,
		solution_sql: 'SELECT * FROM animals WHERE overweight = 1',
	}, { 	..._baseX,
		description: `Retrieve animals whose price is over {compare}`,
		solution_sql: 'SELECT * FROM animals WHERE price > {compare}',
		template_values: {
			'compare': 'randOf(320,230,60)',
		},
	}, { 	..._baseX,
		description: `Retrieve animals whose price is over or equal to {compare}`,
		solution_sql: 'SELECT * FROM animals WHERE price >= {compare}',
		template_values: {
			'compare': 'randOf(320,230,60)',
		},
	}, { 	..._baseX,
		description: `Retrieve animals with a weight under {compare}`,
		solution_sql: 'SELECT * FROM animals WHERE weight < {compare}',
		template_values: {
			'compare': 'randOf(230,100)',
		},
	}, { 	..._baseX,
		description: `Retrieve animals whose weight is under or equal to {compare}`,
		solution_sql: 'SELECT * FROM animals WHERE weight <= {compare}',
		template_values: {
			'compare': 'randOf(230,100)',
		},

	}, { 	..._baseX,
		description: `Retrieve animals with a name starting with {compare}`,
		solution_sql: 'SELECT * FROM animals WHERE "Animal Name" LIKE "{compare}%"',
		template_values: {
			'compare': 'randOf(Mary,B)',
		},
	},

];



const kc_sql_where = {
		kc: KC_NAMES.KC_SQL_WHERE,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
	};

export { kc_sql_where }