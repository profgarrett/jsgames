import { KC_NAMES } from './kc';

const t1_sales = {
	t1_name: 'sales',
	t1_titles: ['Sale_PK', 'Price', 'Person', 'Month' ],
    t1_formats: ['pk', '$', 'text', 'text' ],
	t1_rows: [
			[1, 40, 'Bob', 'January'],
			[2, 50, 'Sarah', 'January'],
			[3, 30, 'Bob', 'March'],
			[4, 20, 'Joe', 'April'],
		]
};

const t2_month = {
	t2_name: 'months',
	t2_titles: ['Month', 'Hire_Bonus', 'Sale_Bonus' ],
    t2_formats: ['text', '$', '$' ],
	t2_rows: [
		['January', 100, 40],
		['February', 200, 20],
		['March', 300, 20],
		['April', 400, 40],
	]
};

const t3_people = {
	t3_name: 'people',
	t3_titles: ['Name', 'Boss', 'Hire_Month' ],
    t3_formats: ['text', 'text', 'text' ],
	t3_rows: [
		['Bob', null, null],
		['Sarah', 'Bob', 'January'],
		['Joe', 'Bob', 'March'],
		['Jane', 'Bob', 'March'],
	]
}


const _baseT = {
	type: 'IfPageSqlSchema',
	kcs: [ KC_NAMES.KC_SQL_JOIN_KEYS ],
	code: 'tutorial',
	...t1_sales,
	...t2_month,
	...t3_people,
}
const tutorial_pages = [
	{	type: 'IfPageTextSchema',
			description: `Most of our work so far has relied upon well-structured tables with simple integer keys.
			<br/><br/>
			Each primary key has been labeled as <code>Tablename_PK</code>, and each foreign key has been titled
			<code>FK_to_TableName</code>.
			<br/><br/>
			However, some keys can be trickier to figure out. This tutorial will walk you 
			through some of the common approaches.`,

	},{	type: 'IfPageTextSchema',
			description: `First, we can use keys that aren't numbers! In the example below, you can see that we have three tables.
			These tables have multiple relationships to each other. 
			<br/><br/>
			Take a minute to see how they connect.
			<br/><br/>
			<img src='/static/sql_join_keys.png' />
			<br/><br/>`
			
	}, {..._baseT,
		description: `Let's start by exploring month relationships. First, you'll see that we are using
			the name of the month as a text value (January, February, etc...).
			<br/><br/>
			<img src='/static/sql_join_keys.png' />
			`,
		instruction: `Write a query that uses <code>INNER JOIN</code> to show sale's primary key and month, and 
			the hire bonus field in the month table. Hint: you'll want to connect on the month field in each table.`,
 		solution_sql: `SELECT sale_pk, sales.month, months.hire_bonus FROM sales
			INNER JOIN months ON sales.month = months.month`

	}, {..._baseT,
		description: `Now, try the same as before, but use a left join to show all months, even those without a matching
			sale.
			<br/><br/>
			Hint: put months on the left side to include all of them.
			`,
		instruction: `Write a query that uses <code>LEFT OUTER JOIN</code> to show the sale price and 
			the month field in the months table.`,
		solution_sql: `SELECT sales.price, months.month FROM months
			LEFT OUTER JOIN sales ON sales.month = months.month`
   
	}, {	..._baseT,
		description: `Now, lets modify the prior query to show all months where the sale price is null.
			<br/><br/>
			This will give us a list of  months without any sales.
			`,
		instruction: `Write a query to show any months without a matching sale. You don't need to include
			the sales.price field in <code>SELECT</code> - just place it in the <code>WHERE</code> clause.`,
		solution_sql: `SELECT months.month FROM months
			LEFT OUTER JOIN sales ON sales.month = months.month
			WHERE sales.price is null`
		
	}, {	..._baseT,
		description: `Nice! Now let's try using the month field in the people field table.
			<br/><br/>
			Show a list of people's names and their hire bonus (which is based on their hire month).
			Use an inner join, so only people with a hire bonus will be shown.
			`,
		instruction: `Show all people's names with a matching hire bonus.`,
		solution_sql: `SELECT name, hire_bonus FROM people
			INNER JOIN months ON people.hire_month = months.month
			`
	}, {	..._baseT,
		description: `Who doesn't have a hire bonus? Use a left join and test for anyone
			having a null value in the hire_bonus field.
			`,
		instruction: `Show all people's names who do not have a hire bonus.`,
		solution_sql: `SELECT name FROM people
			LEFT OUTER JOIN months ON people.hire_month = months.month
			WHERE hire_bonus IS NULL`

	}, {type: 'IfPageTextSchema',
		
		description: `Notice that the person table also has a self-join. Each person has a foreign key to their boss.
		<br/><br/>
		<img src='/static/sql_join_keys.png' />
		`

	} 
];





const _baseX = {
	type: 'IfPageSqlSchema',


	instruction: `Type in the correct sql query.`,
	code: 'test',
	kcs: [ KC_NAMES.KC_SQL_JOIN_KEYS ],
	...t1_sales,
	...t2_month,
	...t3_people,
};

const test_pages = [ 
// all
	{ 	..._baseX,
		description: `Show the person and price for each sale, as well as any sales bonus (based on the month). Do not include sales
			for the month of {val1}. Order the results by the sales primary key.`,
		solution_sql: `SELECT sales.sale_pk, sales.person, sales.price, months.sale_bonus
				FROM sales INNER JOIN months ON sales.month = months.month
				WHERE months.month != "{val1}"
				ORDER BY sales.sale_pk`,
		template_values: {
			'val1': 'randOf(January,March,April)'
		}

	}, { 	..._baseX,
		description: `Show the person and price for each sale, as well as any sale bonus (based on the month). Do not include {val1}.
			Order the results by the sales primary key.`,
		solution_sql: `SELECT sales.sale_pk, sales.person, sales.price, months.sale_bonus
				FROM sales INNER JOIN months ON sales.month = months.month
				WHERE sales.person != "{val1}"
				ORDER BY sales.sale_pk`,
		template_values: {
			'val1': 'randOf(Bob,Sarah,Joe)'
		}

	}, {..._baseX,
		description: `Show the sale pk, sale price, person selling, and that person's boss. Only include people
			hired in the month of {val1}. Order the results by the sales primary key.`,
		solution_sql: `SELECT sales.sale_pk, sales.person, people.name, people.boss
				FROM sales INNER JOIN people ON sales.person = people.name
				WHERE people.hire_month == "{val1}"
				ORDER BY sales.sale_pk`,
		template_values: {
			'val1': 'randOf(January,March)'
		}
	
	}, { 	..._baseX,
		description: `Show the name and boss for each person, as well as their hire bonus (based on the month). Do not include
			anyone with a null hire bonus. Order the results by name.`,
		solution_sql: `SELECT people.name, people.boss, months.hire_bonus
				FROM people INNER JOIN months ON people.hire_month = months.month
				ORDER BY people.name`,

	}, { 	..._baseX,
		description: `Show the name and boss for each person, as well as their hire bonus (based on the month). Show only those
			without a null hire bonus. Order the results by name.`,
		solution_sql: `SELECT people.name, people.boss, months.hire_bonus
				FROM people LEFT OUTER JOIN months ON people.hire_month = months.month
				WHERE months.hire_bonus IS NOT NULL
				ORDER BY people.name`,
	}
];




const kc_sql_join_keys = {
		kc: KC_NAMES.KC_SQL_JOIN_KEYS,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
	};

export { kc_sql_join_keys }