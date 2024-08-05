import { KC_NAMES } from './kc';



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
		[ 'Cade',  'Male', 350, 10, 10 ], 
		[ 'Suzy',  'Female', 550, 10, 10 ], 
	]
};



const t1_cows = {
	t1_name: 'cows',
	t1_titles: ['Name', 'Price', 'Spots', 'Legs', 'Personality', 'Kids' ],
    t1_formats: ['text', '$', '0', '0', 'text', '0' ],
	t1_rows: [
			[ 'Unknown',  1000, 0, 4, "Docile", 0 ], 
			[ 'D2', 1200, 3, 4,"Docile", 3 ], 
			[ 'A3',  800, 4, 3, "Angry", 10 ], 
			[ 'A8',  850, 2, 4, "Kind", 5 ], 
			[ 'Unknown', 1050, 1, 4, "Angry", 6 ],
			[ 'Unknown',  500, 1, 3, "Docile", 9 ], 
		]
};


const t2_cows = {
	t2_name: 'cows',
	t2_titles: ['Name', 'Age', 'Color', 'Personality' ],
    t2_formats: ['text', 'text', 'text',  'text' ],
	t2_rows: [
			[ 'Unknown',  'Old', 'Black', "Docile", ], 
			[ 'D2', 'Old', 'Brown',"Docile" ], 
			[ 'A3',  'Old', 'Black', "Angry" ], 
			[ 'A4',  'Old', 'Black', "Docile" ], 
			[ 'A8',  'Young', 'Brown', "Kind" ], 
			[ 'Unknown', 'Young', 'Brown', "Angry" ],
			[ 'X9', 'Young', 'Black', "Angry" ],
			[ 'Unknown',  'Young', 'Brown', "Docile" ], 
		]
};



const _baseT_numbers = {
	type: 'IfPageSqlSchema',
	kcs: [ KC_NAMES.KC_SQL_WHERE_AND_OR_NUMBERS ],
	code: 'tutorial',
	...t1_cows,
}
const tutorial_pages_numbers = [
	{	type: 'IfPageTextSchema',
		description: `
			Sometimes we need to combine two or more logical tests.  We will use both <code>AND</code>, as well as <code>OR</code>.
			<br/><br/>
			Learning outcomes:<br/>
			<ul>
				<li>Use <code>AND</code> to filter rows by comparing two or more fields against a number</li>
				<li>Use <code>OR</code> to filter rows by comparing two or more fields against a number</li>
			<ul>`,
		code: 'tutorial'

	}, {	..._baseT_numbers,
		description: `The <code>AND</code> keyword allows us to test multiple conditions. It will only keep rows meeting both conditions.
			<br/><br/>
			For example, you can show cows that both price over \$1,000 and have had kids with this command: 
			<br/><br/>
			<code>SELECT * FROM cows WHERE price > 1000 AND kids > 0</code>
			<br/><br/>
			Do not include a comma or dollar sign in <b>$1,000</b>! We only use the numbers and (possibly) a decimal point.
			`,
		instruction: `Write a query that shows all cows with a price over \${value} and over 3 legs.`,
 		solution_sql: 'SELECT * FROM cows WHERE price > {value} AND legs > 3',
		template_values: {
			'value': 'randOf(900,925,1000)',
		},
		feedback: [
			{ 'has': 'sql', args: ['*', 'cows', '{value}', '3', '>', 'WHERE', 'AND'] },
			{ 'has': 'no_sql', args: ['table', '$', '&', 'OR', '=' ] },
		],

	}, {	..._baseT_numbers,
		description: `We can test the same field multiple times.
			<br/><br/>
			For example, you may want to have only cows that are over $600 and under $1000.
			<br/><br/>
			<code>SELECT * FROM cows WHERE price > 400 AND price < 1000</code>
			`,
		instruction: `Write a query that shows all cows with between {value1} and {value2} kids.`,
 		solution_sql: 'SELECT * FROM cows WHERE kids > {value1} AND kids < {value2}',
		template_values: {
			'value1': 'randOf(3,4,5)',
			'value2': 'randOf(8,9)',
		},
		feedback: [
			{ 'has': 'sql', args: ['*', 'cows', '{value1}', '{value2}', '>', '<', 'WHERE', 'AND'] },
			{ 'has': 'no_sql', args: ['table', '$', '&', 'OR', '=', 'price' ] },
		],


	}, {	..._baseT_numbers,
		description: `We can use <code>AND</code> multiple times.
			<br/><br/>
			For example, you may want to have only cows that are under $600, and have at most 3 kids, and have exactly 2 spots.
			<br/><br/>
			<code>SELECT * FROM cows WHERE price < 600 AND kids <= 3 AND spots = 2</code>
			<br/><br/>
			Remember to not include a comma or dollar sign in the price!
			`,
		instruction: `Write a query that shows all cows with a price under \${value1}, and over {value2} kids, and exactly 4 spots.`,
 		solution_sql: 'SELECT * FROM cows WHERE price < {value1} AND kids > {value2} AND spots = 4',
		template_values: {
			'value1': 'randOf(1050,1100)',
			'value2': 'randOf(1,2)',
		},
		feedback: [
			{ 'has': 'sql', args: ['*', 'cows', 'price', 'kids', 'spots', '{value1}', '{value2}', '4', 'WHERE', 'AND', '='] },
			{ 'has': 'no_sql', args: ['table', '$', '&', 'OR' ] },
		],

	}, {	..._baseT_numbers,
		description: `The <code>OR</code> keyword is like <code>AND</code>, but will return a row if either of the 
			logical tests is <code>TRUE</code>.
			<br/><br/>
			For example, you can show cows that either price over \$400 OR have had kids with this command: 
			<br/><br/>
			<code>SELECT * FROM cows WHERE price > 400 OR kids > 0</code>
			`,
		instruction: `Write a query that shows all cows with a price over \${value} OR over 3 legs.`,
 		solution_sql: 'SELECT * FROM cows WHERE price > {value} OR legs > 3',
		template_values: {
			'value': 'randOf(900,925,1000)',
		},
		feedback: [
			{ 'has': 'sql', args: ['*', 'cows', '{value}', '3', '>', 'WHERE', 'OR'] },
			{ 'has': 'no_sql', args: ['table', '$', '&', 'AND', '=' ] },
		],

	}, {	..._baseT_numbers,
		description: `We can use <code>OR</code> to test the same field multiple times.
			<br/><br/>
			For example, you may want to have only cows that are either under $600 or over $1000.
			<br/><br/>
			<code>SELECT * FROM cows WHERE price < 600 OR price > 1000</code>
			`,
		instruction: `Write a query that shows all cows with under {value1} or over {value2} kids.`,
 		solution_sql: 'SELECT * FROM cows WHERE kids < {value1} OR kids > {value2}',
		template_values: {
			'value1': 'randOf(3,4)',
			'value2': 'randOf(8,9)',
		},
		feedback: [
			{ 'has': 'sql', args: ['*', 'cows', 'kids', '{value1}', '{value2}', '>', '<', 'WHERE', 'OR'] },
			{ 'has': 'no_sql', args: ['table', '$', '&', '=', 'price', 'AND' ] },
		],

	}, {	..._baseT_numbers,
		description: `<code>OR</code> is helpful when we are trying to match certain values.
			<br/><br/>
			For example, you may want to have cows with a price of $850, $800, or $1,000
			<br/><br/>
			<code>SELECT * FROM cows WHERE price = 850 OR price= 800 OR price = 1000</code>
			`,
		instruction: `Write a query that shows all cows with a price of \${value1}, \${value2}, or \${value3}.`,
 		solution_sql: 'SELECT * FROM cows WHERE price = {value1} OR price = {value2} or price = {value3}',
		template_values: {
			'value1': 'randOf(500,800)',
			'value2': 'randOf(850,1000)',
			'value3': 'randOf(1050,1200)',
		},
		feedback: [
			{ 'has': 'sql', args: ['*', 'cows', 'price', '{value1}', '{value2}', '{value3}', '=', 'WHERE', 'OR'] },
			{ 'has': 'no_sql', args: ['table', '$', '&', '.', ',', 'kids', 'AND' ] },
		],

	}, {	..._baseT_numbers,
		description: `We can use <code>OR</code> multiple times, just like <code>AND</code>.
			<br/><br/>
			For example, you may want to have only cows that are over $600, or have at least 3 kids, or have 2 spots.
			<br/><br/>
			<code>SELECT * FROM cows WHERE price > 400 OR kids > 3 OR spots > 2</code>
			`,
		instruction: `Write a query that shows all cows with either over \${value1} price, or over {value2} kids, or over {value3} spots.`,
 		solution_sql: 'SELECT * FROM cows WHERE price > {value1} OR kids > {value2} OR spots > {value3}',
		template_values: {
			'value1': 'randOf(800,850,950,1050)',
			'value2': 'randOf(3,4,5)',
			'value3': 'randOf(2,3)',
		},
		feedback: [
			{ 'has': 'sql', args: ['*', 'cows', 'price', 'kids', 'spots', '{value1}', '{value2}', '{value3}', 'WHERE', 'OR'] },
			{ 'has': 'no_sql', args: ['table', '$', '&', 'AND', '=' ] },
		],
	}
];





const _baseX_numbers = {
	type: 'IfPageSqlSchema',
	...t1_cows,

	instruction: `Type in the correct sql query.`,
	code: 'test',
	kcs: [ KC_NAMES.KC_SQL_WHERE_AND_OR_NUMBERS ],

};

const test_pages_numbers = [ 
// all
	{ 	..._baseX_numbers,
		description: `Retrieve all cows who have a price over {v1} and kids over {v2}.`,
		solution_sql: 'SELECT * FROM cows WHERE price > {v1} AND kids > {v2}',
		template_values: {
			'v1': 'randOf(600,625)',
			'v2': 'randOf(5,6,7)',
		},

	}, { 	..._baseX_numbers,
		description: `Retrieve all cows who have a price over {v1} or kids over {v2}.`,
		solution_sql: 'SELECT * FROM cows WHERE price > {v1} OR kids > {v2}',
		template_values: {
			'v1': 'randOf(700,900)',
			'v2': 'randOf(5,6,7)',
		},

	}, { 	..._baseX_numbers,
		description: `Retrieve all cows who have a price over {v1} and under {v2}.`,
		solution_sql: 'SELECT * FROM cows WHERE price > {v1} AND price < {v2}',
		template_values: {
			'v1': 'randOf(700,900)',
			'v2': 'randOf(1100,1150)',
		},

	}, { 	..._baseX_numbers,
		description: `Retrieve all cows who have a price over {v2} or under {v1}.`,
		solution_sql: 'SELECT * FROM cows WHERE price > {v2} OR price < {v1}',
		template_values: {
			'v1': 'randOf(700,900)',
			'v2': 'randOf(1100,1150)',
		},
		
	}, { 	..._baseX_numbers,
		description: `Retrieve all cows who have a price over {v1} and kids under {v2} and legs over 3.`,
		solution_sql: 'SELECT * FROM cows WHERE price > {v1} AND kids < {v2} AND legs > 3',
		template_values: {
			'v1': 'randOf(700,900)',
			'v2': 'randOf(7,8,9)',
		},

	}, { 	..._baseX_numbers,
		description: `Retrieve all cows who have a price under {v1} or kids over {v2} or legs equal to 3.`,
		solution_sql: 'SELECT * FROM cows WHERE price < {v1} OR kids > {v2} OR legs = 3',
		template_values: {
			'v1': 'randOf(700,900,1000)',
			'v2': 'randOf(8,9)',
		},
	
	},

];


///////////////////////////
//// Text




const _baseT_text = {
	type: 'IfPageSqlSchema',
	kcs: [ KC_NAMES.KC_SQL_WHERE_AND_OR_TEXT ],
	code: 'tutorial',
	...t2_cows,
}

const tutorial_pages_text = [
	{	type: 'IfPageTextSchema',
		description: `
			We are now going to use <code>AND</code> & <code>OR</code> for <b>text</b> comparisons.
			<br/><br/>
			Learning outcomes:<br/>
			<ul>
				<li>Use <code>AND</code> to filter rows by comparing two or more fields against a text value</li>
				<li>Use <code>OR</code> to filter rows by comparing two or more field(s) against a text value</li>
			<ul>`,
		code: 'tutorial'


	}, {	..._baseT_text,
		description: `We generally use either <code>=</code> or <code>&lt;&gt;</code> with text comparisons.
			<br/><br/>
			This code will find cows with a personality of Docile without an Unknown name.
			<br/><br/>
			<code>SELECT * FROM cows WHERE personality = 'Docile' AND name &lt;&gt; 'Unknown'</code>
			<br/><br/>
			Note that we use the <code>'single quote'</code> to wrap values. 
			<b>Do not</b> use the <code>"double quote"</code>. Double quotes are for field names with a space.
			<br/><br/>
			Note that SQL is case sensitive! Match the capitalization.
			`,
		instruction: `Write a query that shows all cows with {v1} age and {v2} color.`,
		solution_sql: "SELECT * FROM cows WHERE age = '{v1}' AND color = '{v2}'",
		template_values: {
			'v1': 'randOf(Old,Young)',
			'v2': 'randOf(Brown,Black)',
		},
		feedback: [
			{ 'has': 'sql', args: ['*', 'cows', 'age', 'color', "'{v1}'", "'{v2}'", '=', 'WHERE'] },
			{ 'has': 'no_sql', args: ['table', '"'] },
		],
		
	}, {	..._baseT_text,
		description: `We can use <code>OR</code> to match a list of values.
			<br/><br/>
			This code will find cows with <b>Docile</b>, <b>Angry</b>, or <b>Kind</b> personalities.
			<br/><br/>
			<code>SELECT * FROM cows WHERE personality = 'Docile' OR personality = 'Angry' OR personality = 'Kind'</code>
			<br/><br/>
			Remember to use the <code>'single quote'</code> to wrap values, and 
			that SQL is case sensitive.
			`,
		instruction: `Write a query that shows all cows with a name of {v1}, {v2}, or {v3}.`,
		solution_sql: "SELECT * FROM cows WHERE name = '{v1}' OR name = '{v2}' OR name = '{v3}'",
		template_values: {
			'v1': 'randOf(D2,A3)',
			'v2': 'randOf(A4,A8)',
			'v3': 'randOf(X9,Unknown)',
		},
		feedback: [
			{ 'has': 'sql', args: ['*', 'cows', 'WHERE', 'name', "'{v1}'", "'{v2}'", "'{v3}'", '='] },
			{ 'has': 'no_sql', args: ['table', '"'] },
		],
		

	}
];




const _baseX_text = {
	type: 'IfPageSqlSchema',
	...t2_cows,

	instruction: `Type in the correct sql query.`,
	code: 'test',
	kcs: [ KC_NAMES.KC_SQL_WHERE_AND_OR_TEXT ],
};

const test_pages_text = [ 
	// all
	{ 	..._baseX_text,
		description: `Retrieve all cows with an personality of {v1} and a color not equal to {v2}.`,
		solution_sql: "SELECT * FROM cows WHERE personality = '{v1}' AND color <> '{v2}'",
		template_values: {
			'v1': 'randOf(Docile,Angry)',
			'v2': 'randOf(Black,Brown)',
		},

	},{ 	..._baseX_text,
		description: `Retrieve all cows with an age of {v1} and a color of {v2}.`,
		solution_sql: "SELECT * FROM cows WHERE age = '{v1}' AND color= '{v2}'",
		template_values: {
			'v1': 'randOf(Old,Young)',
			'v2': 'randOf(Black,Brown)',
		},

	}, { 	..._baseX_text,
		description: `Retrieve all cows with an age of {v1} or a color of {v2}.`,
		solution_sql: "SELECT * FROM cows WHERE age = '{v1}' OR color= '{v2}'",
		template_values: {
			'v1': 'randOf(Old,Young)',
			'v2': 'randOf(Black,Brown)',
		},

	}, { 	..._baseX_text,
		description: `Retrieve all cows with an name of {v1} or {v2} or {v3}.`,
		solution_sql: "SELECT * FROM cows WHERE name = '{v1}' OR name = '{v2}' OR name = '{v3}'",
		template_values: {
			'v1': 'randOf(D2,A3)',
			'v2': 'randOf(A4,A8)',
			'v3': 'randOf(X9,Unknown)',
		},

	}, { 	..._baseX_text,
		description: `Retrieve all cows with an name not equal to {v1} and {v2} and {v3}.`,
		solution_sql: "SELECT * FROM cows WHERE name <> '{v1}' AND name <> '{v2}' AND name <> '{v3}'",
		template_values: {
			'v1': 'randOf(D2,A3)',
			'v2': 'randOf(A4,A8)',
			'v3': 'randOf(X9,Unknown)',
		},
		
	},

];
	



///////////////////////////
//// Quoted fields


const _baseT_quotes = {
	type: 'IfPageSqlSchema',
	kcs: [ KC_NAMES.KC_SQL_WHERE_AND_OR_QUOTES ],
	code: 'tutorial',
	...t3_dogs,
}

const tutorial_pages_quotes = [
	{	type: 'IfPageTextSchema',
		description: `
			Finally, we sometimes need to use quoted field names while also testing for text values.
			<br/><br/>
			Learning outcome:<br/>
			<ul>
				<li>Quote field names when using <code>AND/OR</code> for text comparisons</li>
			<ul>`,
		code: 'tutorial'

	}, {	..._baseT_quotes,
		description: `As a reminder, you may need to wrap column names with <code>"double quotes"</code>.
			<br/><br/>
			Text values should be wrapped with <code>'single quotes'</code>.
			<br/><br/>
			An example, the query below will show all dogs with a name of Sue or Bob.
			<br/><br/>
			<code>SELECT * FROM dogs WHERE "Dog Name" = 'Sue' OR "Dog Name" = 'Bob'</code>
			`,
		instruction: `Write a query that shows all dogs with a name of {v1} or {v2}.`,

		solution_sql: `SELECT * FROM dogs WHERE "Dog Name" = '{v1}' OR "Dog Name" = '{v2}'`,
		template_values: {
			'v1': 'randOf(Sarah,June,Jane)',
			'v2': 'randOf(Pete,Sam,Sam2)',
		},
		feedback: [
			{ 'has': 'sql', args: ['*', 'dogs', '"Dog Name"', "'{v1}'", "'{v2}'", '='] },
			{ 'has': 'no_sql', args: ['table', 'cows', 'pigs', 'animals'] },
		],	


	}, {	..._baseT_quotes,
		description: `Do not get in the habit of using <code>'single quotes'</code> around all values.
			Only use them for text values (not numbers).
			<br/><br/>
			An example, the query below will show all female dogs with a price over $500. Note that we only
			have <code>'single quotes'</code> around the text value.
			<br/><br/>
			<code>SELECT * FROM dogs WHERE "Dog Gender" = 'Female' AND "Dog Price" > 500</code>
			`,
		instruction: `Write a query that shows all {v1} dogs with a weight under {v2}.`,

		solution_sql: `SELECT * FROM dogs WHERE "Dog Gender" = '{v1}' AND "Dog Weight" < {v2}`,
		template_values: {
			'v1': 'randOf(Female,Male)',
			'v2': 'randOf(30,45)',
		},
		feedback: [
			{ 'has': 'sql', args: ['*', 'dogs', '"Dog Gender"', '"Dog Weight"', "'{v1}'", "{v2}", '='] },
			{ 'has': 'no_sql', args: ['table', 'cows', 'pigs', 'animals', "'{v2}'"] },
		],	
	}
];




const _baseX_quotes = {
	type: 'IfPageSqlSchema',
	...t3_dogs,

	instruction: `Type in the correct sql query.`,
	code: 'test',
	kcs: [ KC_NAMES.KC_SQL_WHERE_AND_OR_QUOTES ],
};

const test_pages_quotes = [ 
	{ 	..._baseX_quotes,
		description: `Retrieve all dogs with a name of {v1} or {v2}.`,
		solution_sql: `SELECT * FROM dogs WHERE "Dog Name" = '{v1}' OR "Dog Name" = '{v2}'`,
		template_values: {
			'v1': 'randOf(Pete,Sam,Sam2)',
			'v2': 'randOf(Sarah,June,Jane)',
		},

	}, { 	..._baseX_quotes,
		description: `Retrieve all dogs except those with a name of {v1} and {v2}.`,
		solution_sql: `SELECT * FROM dogs WHERE "Dog Name" <> '{v1}' AND "Dog Name" <> '{v2}'`,
		template_values: {
			'v1': 'randOf(Pete,Sam,Sam2)',
			'v2': 'randOf(Sarah,June,Jane)',
		},
	}, { 	..._baseX_quotes,
		description: `Retrieve all dogs with a {v1} gender and a price over {v2}.`,
		solution_sql: `SELECT * FROM dogs WHERE "Dog Gender" = '{v1}' AND "Dog Price" > {v2}`,
		template_values: {
			'v1': 'randOf(Male,Female)',
			'v2': 'randOf(150, 100)',
		},			
	}, { 	..._baseX_quotes,
		description: `Retrieve all dogs having a height of {v1}, {v2}, or {v3}.`,
		solution_sql: `SELECT * FROM dogs WHERE "Dog Height" = {v1} OR "Dog Height" = {v2} OR "Dog Height" = {v3}`,
		template_values: {
			'v1': 'randOf(23, 18)',
			'v2': 'randOf(34,54)',
			'v3': 'randOf(8,12)',
		},	

	}, { 	..._baseX_quotes,
		description: `Retrieve all dogs with a {v1} gender and a height over {v2}.`,
		solution_sql: `SELECT * FROM dogs WHERE "Dog Gender" = '{v1}' AND "Dog Height" > {v2}`,
		template_values: {
			'v1': 'randOf(Male,Female)',
			'v2': 'randOf(20,15)',
		},			
	}
];
	



const kc_sql_where_and_or_numbers = {
		kc: KC_NAMES.KC_SQL_WHERE_NUMBERS,
		tutorial_pages: tutorial_pages_numbers,
		test_pages: test_pages_numbers,
	};
const kc_sql_where_and_or_text = {
		kc: KC_NAMES.KC_SQL_WHERE_TEXT,
		tutorial_pages: tutorial_pages_text,
		test_pages: test_pages_text,
	};
const kc_sql_where_and_or_quotes = {
		kc: KC_NAMES.KC_SQL_WHERE_QUOTES,
		tutorial_pages: tutorial_pages_quotes,
		test_pages: test_pages_quotes,
	};

export { kc_sql_where_and_or_numbers, kc_sql_where_and_or_text, kc_sql_where_and_or_quotes }