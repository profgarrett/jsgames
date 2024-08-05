import { KC_NAMES } from './kc';



const t1_animals = {
	t1_name: 'animals',
	t1_titles: ['Name', 'Gender', 'Price', 'Weight', 'Overweight', 'Breeding Potential' ],
    t1_formats: ['text', 'text', '$', '0', '0', 'text' ],
	t1_rows: [
		[ 'Mary Sue', 'female', 320, 100, 1, 'No'],
		[ 'Mary', 'female', 230, 340, 0, 'Yes'],
		[ 'Bob', 'male', 1230, 240, 0, 'No'],
		[ 'Barty', 'male', 60, 82, 1, 'No'],
	]
};
const t2_sheep = {
	t1_name: 'sheep',
	t1_titles: ['Name', 'Price', 'Age', 'Sold', 'Breed Rating' ],
    t1_formats: ['text', '$', '0', '0', 'text' ],
	t1_rows: [
			[ 'Dad',  300, 3, 1, "A" ], 
			[ 'Mother', 200, 3, 3,"B" ], 
			[ 'Aunt 1',  250, 5, 0, "A" ], 
			[ 'Aunt 2',  275, 4, 0, "C" ], 
			[ 'Baby', 100, 1, 0, "C" ],
			[ 'Descendent',  50, 2, 0, "D" ], 
			[ 'MiXeD CaSe', 100, 1, 0, "C" ],
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
		[ 'Bosh',  'Male', 29, 202, 54 ], 
		[ 'June',  'Female', 81, 32, 8 ], 
		[ 'Jane',  'Female', 154, 32, 12 ], 
	]
};


const _baseT_numbers = {
	type: 'IfPageSqlSchema',
	kcs: [ KC_NAMES.KC_SQL_WHERE_NUMBERS ],
	code: 'tutorial',
}
const tutorial_pages_numbers = [
	{	type: 'IfPageTextSchema',
		description: `
			<iframe width="560" height="315" 
				src="https://www.youtube.com/embed/yXFEBYirWXg?si=eIJiZgnc6RepEAML" 
				title="YouTube video player" 
				frameborder="0" 
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
				allowfullscreen></iframe>
				
			<br/>
			Learning outcome:<br/>
			<ul>
				<li>Use <code>WHERE</code> to filter rows by comparing a field against a number</li>
			<ul>`,
		code: 'tutorial'

	}, {	..._baseT_numbers,
		description: `We can filter out some rows returned by a query. 
			<br/><br/>
			The query <code>SELECT * FROM animals WHERE overweight = 1</code> will only show rows
			with heavy animals.
			`,
		...t1_animals,
		instruction: `Write the query above to show all overweight animals.`,
 		solution_sql: 'SELECT * FROM animals WHERE overweight = 1',
		feedback: [
			{ 'has': 'sql', args: ['*', 'overweight', 'animals', '1'] },
			{ 'has': 'no_sql', args: ['table'] },
		],

	}, {	..._baseT_numbers,
		description: `These logical tests are similar to <code>IF</code> in Excel.
			<br/><br/>
			Here are the six basic comparisons:
			<ul>
				<li><code>Price &lt; 1</code>: is price is less than one?</li>
				<li><code>Price &lt;= 1</code>: is price is less than or equal to one?</li>
				<li><code>Price &gt; 1</code>: is price is greater than one?</li>
				<li><code>Price &gt;= 1</code>: is price is greater than or equal to one?</li>
				<li><code>Price = 1</code>: is price is equal to one?</li>
				<li><code>Price &lt;&gt; 1</code>: is price not equal to one?</li>
			</ul>
			<br/><br/>
			Note that we use &lt;&gt; to say that a field is not equal to another value.
			`,
		instruction: `Write a query that shows all sheep with an age over or equal to {v}.`,
		...t2_sheep,
		solution_sql: 'SELECT * FROM sheep WHERE age >= {v}',
		template_values: {
			'v': 'randOf(2,3)',
		},
		feedback: [
			{ 'has': 'sql', args: ['*', 'sheep', 'age', '{v}', '>='] },
			{ 'has': 'no_sql', args: ['table'] },
		],
		

	}, {	..._baseT_numbers,
		description: `Do not use special symbols! As an example, we would not include
			<code>$</code> (a dollar sign) in a query.
			<br/><br/>
			As a reminder, use &lt;&gt; to say that a field is not equal to another value.
			`,
		...t1_animals,
		instruction: 'Write a query that shows all animals with a price not equal to ${v}.',
		solution_sql: 'SELECT * FROM animals WHERE price <> {v}',
		template_values: {
			'v': 'randOf(100,240)',
		},
		feedback: [
			{ 'has': 'sql', args: ['*', 'animals', 'price', '{v}'] },
			{ 'has': 'no_sql', args: ['table', '$'] },
		],	

	}, {	..._baseT_numbers,
		description: `While most columns are made of either numbers or text, some may have a 
			boolean (true or false) value stored as a number. In these cases, you will want
			to treat 0 as false and 1 as true.
			`,
		instruction: `Write a query that shows all sheep that have been sold.`,
		...t2_sheep,
		solution_sql: 'SELECT * FROM sheep WHERE sold = 1',
		feedback: [
			{ 'has': 'sql', args: ['*', 'sheep', 'sold', '1'] },
			{ 'has': 'no_sql', args: ['table', '$'] },
		],	
	}
];





const _baseX_numbers = {
	type: 'IfPageSqlSchema',
	...t1_animals,

	instruction: `Type in the correct sql query.`,
	code: 'test',
	kcs: [ KC_NAMES.KC_SQL_WHERE_NUMBERS ],

};

const test_pages_numbers = [ 
// all
	{ 	..._baseX_numbers,
		description: `Retrieve all animals who are overweight.`,
		solution_sql: 'SELECT * FROM animals WHERE overweight = 1',

	}, { 	..._baseX_numbers,
		description: `Retrieve animals whose price is over {compare}`,
		solution_sql: 'SELECT * FROM animals WHERE price > {compare}',
		template_values: {
			'compare': 'randOf(320,230,60)',
		},
	}, { 	..._baseX_numbers,
		description: `Retrieve animals whose price is over or equal to {compare}`,
		solution_sql: 'SELECT * FROM animals WHERE price >= {compare}',
		template_values: {
			'compare': 'randOf(320,230,60)',
		},
	}, { 	..._baseX_numbers,
		description: `Retrieve animals with a weight under {compare}`,
		solution_sql: 'SELECT * FROM animals WHERE weight < {compare}',
		template_values: {
			'compare': 'randOf(230,100)',
		},
	}, { 	..._baseX_numbers,
		description: `Retrieve animals whose weight is under or equal to {compare}`,
		solution_sql: 'SELECT * FROM animals WHERE weight <= {compare}',
		template_values: {
			'compare': 'randOf(230,100)',
		},

	},

];


///////////////////////////
//// Text




const _baseT_text = {
	type: 'IfPageSqlSchema',
	kcs: [ KC_NAMES.KC_SQL_WHERE_TEXT ],
	code: 'tutorial',
}

const tutorial_pages_text = [
	{	type: 'IfPageTextSchema',
		description: `
			We are now going to use <code>WHERE</code> for text comparisons.
			<br/><br/>
			Learning outcomes:<br/>
			<ul>
				<li>Use <code>WHERE</code> to filter rows by comparing a field against a text value</li>
				<li>Use <code>WHERE</code> and <code>LIKE</code> to compare a field with a wildcard</li>
			<ul>`,
		code: 'tutorial'


	}, {	..._baseT_numbers,
		description: `We generally use the below comparisons:
			<ul>
				<li><code>name = 'Bob'</code> asks if a name equal to 'Bob'</li>
				<li><code>name &lt;&gt; 'Bob'</code> asks if a name is not equal to 'Bob'</li>
			</ul>
			Note that we use the <code>'single quote'</code> to wrap values. 
			<b>Do not</b> use the <code>"double quote"</code>. Double quotes are for field names with a space.
			<br/><br/>
			Note that SQL is case sensitive! Match the capitalization.
			`,
		instruction: `Write a query that shows all sheep with a name of {v}.`,
		...t2_sheep,
		solution_sql: "SELECT * FROM sheep WHERE name = '{v}'",
		template_values: {
			'v': 'randOf(Dad,Mother,Baby)',
		},
		feedback: [
			{ 'has': 'sql', args: ['*', 'sheep', 'name', "'{v}'", '='] },
			{ 'has': 'no_sql', args: ['table', '"'] },
		],
		
	}, {	..._baseT_numbers,
		description: `Now find all sheep that do <b>not</b> match the given text using &lt;&gt;
			<br/><br/>
			Remember to use the <code>'single quote'</code> to wrap values, and 
			that SQL is case sensitive.
			`,
		instruction: `Write a query that shows all sheep without a name of {v}.`,
		...t2_sheep,
		solution_sql: "SELECT * FROM sheep WHERE name <> '{v}'",
		template_values: {
			'v': 'randOf(Dad,Mother,Baby)',
		},
		feedback: [
			{ 'has': 'sql', args: ['*', 'sheep', 'name', "'{v}'", '<>'] },
			{ 'has': 'no_sql', args: ['table', '"', '='] },
		],
		

	}, {	..._baseT_text,
		description: `You may want to use pattern  matching. For example, you can 
			find all pigs with names starting with "Za" by using the query
			<code>SELECT * FROM pigs WHERE name LIKE 'Za%'</code>.
			<br/><br/>
			You must use <code>LIKE</code> keyword instead of <code>=</code>
			<br/><br/>
			The <code>%</code> symbol then acts as a wildcard, matching any number of 
			characters.
			`,
		instruction: `Write a query that shows all <b>sheep</b> with a name starting with {v}.`,
		...t2_sheep,
		solution_sql: "SELECT * FROM sheep WHERE name LIKE '{v}%'",
		template_values: {
			'v': 'randOf(D,Aunt)',
		},
		feedback: [
			{ 'has': 'sql', args: ['*', 'sheep', 'name', "'{v}%'", 'LIKE'] },
			{ 'has': 'no_sql', args: ['table', '"', '=', '<>'] },
		],


	}, {	..._baseT_text,
		description: `We can do other pattern matches. For example, the below finds all 
			dogs with a name ending in Junior.
			<br/><br/>
			<code>SELECT * FROM dogs WHERE name LIKE '%Junior'</code>
			`,
		instruction: `Write a query that shows all <b>animals</b> with a name ending with {v}.`,
		...t1_animals,
		solution_sql: "SELECT * FROM animals WHERE name LIKE '%{v}'",
		template_values: {
			'v': 'randOf(y,e)',
		},
		feedback: [
			{ 'has': 'sql', args: ['*', 'animals', 'name', "'%{v}'", 'LIKE'] },
			{ 'has': 'no_sql', args: ['table', '"', '=', '<>'] },
		],
	}
];




const _baseX_text = {
	type: 'IfPageSqlSchema',
	...t1_animals,

	instruction: `Type in the correct sql query.`,
	code: 'test',
	kcs: [ KC_NAMES.KC_SQL_WHERE_TEXT ],
};

const test_pages_text = [ 
	// all
		{ 	..._baseX_text,
			description: `Retrieve all animals with a gender of {v1}.`,
			solution_sql: "SELECT * FROM animals WHERE gender = '{v1}'",
			template_values: {
				'v1': 'randOf(male,female)',
			},
		}, { 	..._baseX_text,
			description: `Retrieve animals with a name of {compare}`,
			solution_sql: "SELECT * FROM animals WHERE name = '{compare}'",
			template_values: {
				'compare': 'randOf(Mary,Bob,Barty)',
			},	
		}, { 	..._baseX_text,
			description: `Retrieve animals except those having a name of {compare}`,
			solution_sql: "SELECT * FROM animals WHERE name <> '{compare}'",
			template_values: {
				'compare': 'randOf(Mary,Bob,Barty)',
			},	
		}, { 	..._baseX_text,
			description: `Retrieve animals with a name starting with {compare}`,
			solution_sql: "SELECT * FROM animals WHERE name LIKE '{compare}%'",
			template_values: {
				'compare': 'randOf(Mary,B)',
			},
		}, { 	..._baseX_text,
			description: `Retrieve animals with a name ending with {compare}`,
			solution_sql: 'SELECT * FROM animals WHERE name LIKE "%{compare}"',
			template_values: {
				'compare': 'randOf(y,b,e)',
			},
		},
	
	];
	



///////////////////////////
//// Quoted fields


const _baseT_quotes = {
	type: 'IfPageSqlSchema',
	kcs: [ KC_NAMES.KC_SQL_WHERE_QUOTES ],
	code: 'tutorial',
	...t3_dogs,
}

const tutorial_pages_quotes = [
	{	type: 'IfPageTextSchema',
		description: `
			Finally, we sometimes need to use quoted field names while also using <code>WHERE</code> for text comparisons.
			<br/><br/>
			Learning outcome:<br/>
			<ul>
				<li>Quote field names when using <code>WHERE</code> for text comparisons</li>
			<ul>`,
		code: 'tutorial'

	}, {	..._baseT_quotes,
		description: `If your column has a space in its title, wrap the name with
			<code>"double quotes"</code>.
			<br/><br/>
			You must also wrap all text values in <code>'single quotes'</code>.
			<br/><br/>
			An example, the query
			<code>SELECT * FROM dogs WHERE "Dog Name" = 'Sue'</code> shows all dogs with a name of Sue.
			<br/><br/>
			Note that anything in quotes (i.e., "Sue") <b>must match the capitalization exactly!</b>
			<code>Sue</code> is different than <code>sue</code>.
			`,
		instruction: `Write a query that shows all dogs with a name of {v}.`,

		solution_sql: `SELECT * FROM dogs WHERE "Dog Name" = '{v}'`,
		template_values: {
			'v': 'randOf(Pete,Sam,Sam2,Sarah,June,Jane)',
		},
		feedback: [
			{ 'has': 'sql', args: ['*', 'dogs', '"Dog Name"', "'{v}'", '='] },
			{ 'has': 'no_sql', args: ['table'] },
		],	


	}, {	..._baseT_quotes,
		description: `Use the <code>&lt;&gt;</code> comparison to find all rows not matching the condition.
			`,
		instruction: `Write a query that shows all dogs except those with a name of {v}.`,

		solution_sql: `SELECT * FROM dogs WHERE "Dog Name" <> '{v}'`,
		template_values: {
			'v': 'randOf(Pete,Sam,Sam2,Sarah,June,Jane)',
		},
		feedback: [
			{ 'has': 'sql', args: ['*', 'dogs', '"Dog Name"', "'{v}'", '<>'] },
			{ 'has': 'no_sql', args: ['table'] },
		],	


	}, {	..._baseT_quotes,
		description: `Try a problem using a wildcard. Remember to use <code>LIKE</code>
			when using the <code>%</code> to match patterns.
			`,
		instruction: `Write a query that shows all dogs with a name starting with {v}.`,

		solution_sql: `SELECT * FROM dogs WHERE "Dog Name" LIKE '{v}%'`,
		template_values: {
			'v': 'randOf(S,J)',
		},
		feedback: [
			{ 'has': 'sql', args: ['*', 'dogs', '"Dog Name"', "'{v}%'", 'LIKE'] },
			{ 'has': 'no_sql', args: ['table'] },
		],	


	}, {	..._baseT_quotes,
		description: `Use a wildcard to match the end of a word.
			`,
		instruction: `Write a query that shows all dogs with a name ending with {v}.`,

		solution_sql: `SELECT * FROM dogs WHERE "Dog Name" LIKE '%{v}'`,
		template_values: {
			'v': 'randOf(e,h,m)',
		},
		feedback: [
			{ 'has': 'sql', args: ['*', 'dogs', '"Dog Name"', "'%{v}'", 'LIKE'] },
			{ 'has': 'no_sql', args: ['table'] },
		],	
	}
];




const _baseX_quotes = {
	type: 'IfPageSqlSchema',
	...t3_dogs,

	instruction: `Type in the correct sql query.`,
	code: 'test',
	kcs: [ KC_NAMES.KC_SQL_WHERE_QUOTES ],
};

const test_pages_quotes = [ 
	{ 	..._baseX_quotes,
		description: `Retrieve all dogs with a name of {v}.`,
		solution_sql: `SELECT * FROM dogs WHERE "Dog Name" = '{v}'`,
		template_values: {
			'v': 'randOf(Pete,Sam,Sam2,Sarah,June,Jane)',
		},
	}, { 	..._baseX_quotes,
		description: `Retrieve all dogs except those with a name of {v}.`,
		solution_sql: `SELECT * FROM dogs WHERE "Dog Name" <> '{v}'`,
		template_values: {
			'v': 'randOf(Pete,Sam,Sam2,Sarah,June,Jane)',
		},
	}, { 	..._baseX_quotes,
		description: `Retrieve all dogs with a {v} gender.`,
		solution_sql: `SELECT * FROM dogs WHERE "Dog Gender" = '{v}'`,
		template_values: {
			'v': 'randOf(Male,Female)',
		},			
	}, { 	..._baseX_quotes,
		description: `Retrieve all dogs having a name that starts with {v}.`,
		solution_sql: `SELECT * FROM dogs WHERE "Dog Name" LIKE '{v}%'`,
		template_values: {
			'v': 'randOf(P,S,J)',
		},	
	}, { 	..._baseX_quotes,
		description: `Retrieve all dogs having a name that end with {v}.`,
		solution_sql: `SELECT * FROM dogs WHERE "Dog Name" LIKE '%{v}'`,
		template_values: {
			'v': 'randOf(e,h)',
		},	
	}
];
	



const kc_sql_where_numbers = {
		kc: KC_NAMES.KC_SQL_WHERE_NUMBERS,
		tutorial_pages: tutorial_pages_numbers,
		test_pages: test_pages_numbers,
	};
const kc_sql_where_text = {
		kc: KC_NAMES.KC_SQL_WHERE_TEXT,
		tutorial_pages: tutorial_pages_text,
		test_pages: test_pages_text,
	};
const kc_sql_where_quotes = {
		kc: KC_NAMES.KC_SQL_WHERE_QUOTES,
		tutorial_pages: tutorial_pages_quotes,
		test_pages: test_pages_quotes
	};

export { kc_sql_where_numbers, kc_sql_where_text, kc_sql_where_quotes }