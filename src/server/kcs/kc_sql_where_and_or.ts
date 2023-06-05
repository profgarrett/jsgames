import { KC_NAMES } from './kc';

const t1_cows = {
	t1_name: 'cows',
	t1_titles: ['Cow Name', 'Price', 'Spots', 'Legs', 'Personality' ],
    t1_formats: ['text', '$', '0', '0', 'text' ],
	t1_rows: [
			[ 'D1',  1000, 0, 4, "Docile" ], 
			[ 'D2', 1200, 3, 4,"Docile" ], 
			[ 'A3',  800, 4, 3, "Angry" ], 
			[ 'A8',  850, 2, 4, "Kind" ], 
			[ 'A10', 1000, 1, 4, "Angry" ],
			[ 'C8',  500, 1, 3, "Docile" ], 
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
		[ 'Sue', 'female', 120, 150, 1, 'Yes'],
		[ 'Barty', 'male', 830, 100, 0, 'Yes'],
		[ 'Bobby', 'female', 1000, 240, 0, 'No'],
		[ 'Mary Boy', 'male', 900, 358, 1, 'Yes'],
		[ 'Big Boy', 'male', 500, 358, 1, 'Yes'],
		[ 'Bat Boy', 'male', 550, 458, 0, 'No'],
	]
};


const _baseT = {
	type: 'IfPageSqlSchema',
	kcs: [ KC_NAMES.KC_SQL_WHERE_AND_OR ],
	code: 'tutorial',
	...t1_cows,
}
const tutorial_pages = [
	{	..._baseT,
		description: `Sometimes we need to combine two or more logical tests.  
			<code>AND</code> will only return rows meeting both conditions.
			<br/><br/>
			For example, you can show animals that both cost over $400 and have had kids with this command: 
			<code>SELECT * FROM animals WHERE cost > 400 AND kids > 0</code>.
			`,
		instruction: `Write a query that shows all cows with a price over \${value} and a personality of {value2}.`,
 		solution_sql: 'SELECT * FROM cows WHERE price > {value} AND personality = "{value2}"',
		template_values: {
			'value': 'randOf(900,925)',
			'value2': 'randOf(Docile,Angry)'
		}

	}, {	..._baseT,
		description: `We can also use <code>OR</code> to return rows meeting any one of the logical tests.
			<br/><br/>
			For example, <code>SELECT * FROM animals WHERE cost > 400 OR kids > 0</code> will give us 
			any creatures that either cost over $400, or that have had kids.
			`,
			instruction: `Write a query that shows all cows with <b>either</b> a price over \${value} or a personality of {value2}.`,
			solution_sql: 'SELECT * FROM cows WHERE price > {value} OR personality = "{value2}"',
		   template_values: {
			   'value': 'randOf(900,925)',
			   'value2': 'randOf(Docile,Angry)'
		   }
   
	}, {	..._baseT,
		description: `You can use multiple AND/OR commands together. Use parenthesis to show 
			the order in which the database should evaluate them.
			<br/><br/>
			An example, the query
			<code>SELECT * FROM pigs WHERE name = "Sue" OR name = "Bob" OR name = "Tim"</code>
			will show Sue, Bob, and Tim. 
			`,
		instruction: `Write a query that shows all cows with the names D1, D2, A3, and {v}.`,
		solution_sql: 'SELECT * FROM cows WHERE "Cow Name" IN ("D1", "D2", "A3", "{v}")',
		template_values: {
			'v': 'randOf(A10,C8,A8)',
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
		description: `Retrieve all animals with a gender of {v1} and a weight over {v2}.`,
		solution_sql: 'SELECT * FROM animals WHERE gender = "{v1}" AND weight > {v2}',
		template_values: {
			'v1': 'randOf(male,female)',
			'v2': 'randOf(200,250)',
		},
	}, { 	..._baseX,
		description: `Retrieve all animals who are overweight and {v1}.`,
		solution_sql: 'SELECT * FROM animals WHERE overweight = 1 AND gender = "{v1}"',
		template_values: {
			'v1': 'randOf(male,female)',
		},
	}, { 	..._baseX,
		description: `Retrieve all animals who are not overweight and have breeding potential.`,
		solution_sql: 'SELECT * FROM animals WHERE overweight = 0 AND "breeding potential" = "Yes"',
	}, { 	..._baseX,
		description: `Retrieve animals whose price is over {v1} and under {v2}`,
		solution_sql: 'SELECT * FROM animals WHERE price > {v1} AND price < {v2}',
		template_values: {
			'v1': 'randOf(320,230,100)',
			'v2': 'randOf(700,900)',
		},
	}, { 	..._baseX,
		description: `Retrieve animals whose price is over or equal to {v1} and who are {v2}`,
		solution_sql: 'SELECT * FROM animals WHERE price >= {v1} AND gender = "{v2}"',
		template_values: {
			'v1': 'randOf(320,230,60)',
			'v2': 'randOf(male,female)',
		},
	}, { 	..._baseX,
		description: `Retrieve animals whose price is over or equal to {v1} or who are {v2}`,
		solution_sql: 'SELECT * FROM animals WHERE price >= {v1} OR gender = "{v2}"',
		template_values: {
			'v1': 'randOf(320,230,60)',
			'v2': 'randOf(male,female)',
		},
	}, { 	..._baseX,
		description: `Retrieve animals with a weight under {v1} and who are {v2}`,
		solution_sql: 'SELECT * FROM animals WHERE weight < {v1} AND gender = "{v2}"',
		template_values: {
			'v1': 'randOf(230,250)',
			'v2': 'randOf(male,female)',
		},
	}, { 	..._baseX,
		description: `Retrieve animals with a weight under {v1} or who are {v2}`,
		solution_sql: 'SELECT * FROM animals WHERE weight < {v1} AND gender = "{v2}"',
		template_values: {
			'v1': 'randOf(300,200)',
			'v2': 'randOf(male,female)',
		},
	}, { 	..._baseX,
		description: `Retrieve animals with a name starting with {v1} who are {v2}`,
		solution_sql: 'SELECT * FROM animals WHERE "Animal Name" LIKE "{v1}%" AND gender = "{v2}"',
		template_values: {
			'v1': 'randOf(Mary,Bo)',
			'v2': 'randOf(male,female)',
		},
	},

];



const kc_sql_where_and_or = {
		kc: KC_NAMES.KC_SQL_WHERE_AND_OR,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
	};

export { kc_sql_where_and_or }