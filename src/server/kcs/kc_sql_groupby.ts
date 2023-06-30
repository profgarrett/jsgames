import { KC_NAMES } from './kc';

const t1_sales = {
	t1_name: 'sales',
	t1_titles: ['SaleID', 'Price', 'Units', 'Month', 'Product' ],
    t1_formats: ['pk', '$', '0', 'text', 'text' ],
	t1_rows: [
			[1, 2, 11, 'January', 'car'],
			[3, 2, 12, 'January', 'boat'],
			[5, 3, 12, 'January', 'boat'],
			[7, 4, 13, 'February', 'boat'],
			[9, 5, 20, 'February', 'car'],
			[10, 5, 20, 'April', 'boat'],
		]
};

const _baseT = {
	type: 'IfPageSqlSchema',
	kcs: [ KC_NAMES.KC_SQL_GROUPBY ],
	code: 'tutorial',
	...t1_sales,
}
const tutorial_pages = [
	{	type: 'IfPageTextSchema',
			description: `We often want to create a summary of different groups instead of seeing every row.
			This could be finding the number of sales in a month, an average price, or 
			the lowest unit count.
			<br/><br/>
			This requires two steps:
			<ul>
				<li>Calculating something</li> 
				<li>Grouping on a field</li>
			</ul>
			`,
			
	}, {..._baseT,
		description: `Let's start with a calculation. The most basic is <code>COUNT</code>.
			<br/><br/>
			The query below will find the count of rows in the sales table
			<br/>
			<code>SELECT count(*) as RowCount FROM table1</code>
			`,
		instruction: `Write a query that uses the same approach to find the number of rows in the sales table.`,
 		solution_sql: `SELECT count(*) as RowCount from sales`

	}, {..._baseT,
		description: `Count is easy, as we are just looking for the number of rows. But, we also may want to find the average,
			largest, smallest, or sum of a specific field.
			<br/><br/>
			Here are some examples:
			<ul>
				<li><code>SELECT AVG(salary) as AverageValue FROM people</code></li>
				<li><code>SELECT MIN(salary) as MinimumValue FROM people</code></li>
				<li><code>SELECT MAX(salary) as MaximumValue FROM people</code></li>
				<li><code>SELECT SUM(salary) as SumValue FROM people</code></li>
			</ul>
			`,
		instruction: `Write a query that finds the AverageValue of {val1} in the sales table.`,
 		solution_sql: `SELECT AVG({val1}) as AverageValue from sales`,
		template_values: {
			'val1': 'randOf(price,units)'
		}

	}, {..._baseT,
		description: `Now use <code>SUM</code> to find a total for the entire table.
			`,
		instruction: `Write a query that finds the SumValue of {val1} in the sales table.`,
 		solution_sql: `SELECT SUM({val1}) as SumValue from sales`,
		template_values: {
			'val1': 'randOf(price,units)'
		}
//6364891275
	}, {..._baseT,
		description: `Using AVG or MIN is helpful, but it shows the result for the entire table. What if we
			want to show the smallest salary for different groups? 
			<br/><br/>
			This is where <code>GROUP BY</code> is useful. The below query will show the average salary 
			for each job title.<br/>
			<code>SELECT title, AVG(salary) as AverageSalary FROM people GROUP BY title</code>
			`,
		instruction: `Write a query that uses the same approach to find the average {val1} in the sales table, grouped by {val2} (have {val2} as the first field, and the average as the second field).`,
 		solution_sql: `SELECT {val2}, AVG({val1}) AS AverageValue from sales GROUP BY {val2}`,
		template_values: {
			'val1': 'randOf(price,units)',
			'val2': 'randOf(month)',
		}

	}, {..._baseT,
		description: `Great! Now try again, this time using <code>MIN</code> and <code>MAX</code>
			to create <b>MinimumValue</b> and <b>MaximumValue</b> fields.`,
		instruction: `Find the {val2}, minimum {val1}, and maximum {val1} in the sales table, grouped by {val2}.`,
 		solution_sql: `SELECT {val2}, MIN({val1}) AS MinimumValue, MAX({val1}) AS MaximumValue FROM sales GROUP BY {val2}`,
		template_values: {
			'val1': 'randOf(price,units)',
			'val2': 'randOf(product)',
		}

	}, {..._baseT,
		description: `The ordering of each element is important! <code>GROUP BY</code> must be
			between <code>WHERE ...</code> and <code>ORDER BY ...</code>. 
			<br/><br/>
			As an example, <br/>
			<code>SELECT ... <br/>
			FROM ... <br/>
			INNER JOIN or LEFT OUTER JOIN .... <br/>
			WHERE ... <br/>
			GROUP BY ...<br/>
			ORDER BY ... <br/>
			`,
		instruction: `What is the count of sales per month? Return the month, product, and SalesCount fields. Filter to only include {val1}s, and order the results by month.`,
 		solution_sql: `SELECT month, product, count(*) as SalesCount FROM sales WHERE product = "{val1}" GROUP BY month ORDER BY month`,
		template_values: {
			'val1': 'randOf(car,boat)',
		}

	}, {..._baseT,
		description: `What if we want to only show months with a certain number of orders? We can't use <code>WHERE</code>,
			as that happens before the records are grouped. Instead, we need to use <code>HAVING</code>. This is a 
			filter (just like where), but it is applied <b>after</b> the grouping happens.
			<br/><br/>
			So, the below query will show the number of sale staff for each location having at least 10 people:
			<br/>
			<code>SELECT location, COUNT(*) as CountOfPeople<br/>
			FROM people<br/>
			WHERE department = "Sales" <br/>
			GROUP BY location <br/>
			HAVING CountOfPeople > 10 <br/>
			ORDER BY location<br/>
			`,
		instruction: `Show the number of orders each month, but only months that have at least 2 sales. Order the results by month.`,
 		solution_sql: `SELECT month, count(*) as SalesCount FROM sales GROUP BY month HAVING SalesCount > 1 ORDER BY month`,
	} 
];




const t1_cats = {
	t1_name: 'cats',
	t1_titles: ['CatID', 'Name', 'Breed', 'Gender', 'Age', 'Weight' ],
    t1_formats: ['pk', 'text', 'text', 'text', '0', '0' ],
	t1_rows: [
			[1, 'Troi', 'Persian', 'f', 2, 12 ],
			[2, 'Ricker', 'Maine Coon', 'm', 4, 14 ],
			[3, 'Levon', 'Persian', 'm', 12, 7 ],
			[4, 'Woof', 'Maine Coon', 'm', 5, 18],
			[5, 'W', 'Persian', 'm', 8, 8 ],
			[6, 'John', 'Maine Coon', 'm', 4, 12 ],
			[7, 'Smusher', 'Unknown', 'f', 8, 8 ],
			[8, 'Blarg', 'Maine Coon', 'Unknown', 1, 4 ], 
		]
};



const _baseX = {
	type: 'IfPageSqlSchema',


	instruction: `Type in the correct sql query.`,
	code: 'test',
	kcs: [ KC_NAMES.KC_SQL_GROUPBY ],
	...t1_cats,
};

const test_pages = [ 
// all
	{ 	..._baseX,
		description: `What is the minimum, maximum, sum, and average {val1}? Group by {val2}.`,
		solution_sql: `SELECT 
				{val2},
				MIN({val1}) as MinValue, MAX({val1}) as MaxValue, 
				SUM({val1}) as SumValue, AVG({val1}) as AvgValue
				FROM cats
				GROUP BY {val2}`,
		template_values: {
			'val1': 'randOf(age,weight)',
			'val2': 'randOf(breed,gender)',
		}

	},{ ..._baseX,
		description: `What is the count of cats by {val}? Group and sort by {val}, showing only those <i>having</i> more than 1 in each category.`,
		solution_sql: `SELECT 
				{val}, COUNT(*) as CountResult
				FROM cats
				GROUP BY {val}
				HAVING CountResult > 1
				ORDER BY {val}`,
		template_values: {
			'val': 'randOf(breed,gender)',
		}

	},{	..._baseX,
		description: `What is the average {val1}? Group by {val2}, but only include cats where their ID is over {n}.`,
		solution_sql: `SELECT 
				{val2},
				AVG({val1}) as AvgValue
				FROM cats
				WHERE CatID > {n}
				GROUP BY {val2}`,
		template_values: {
			'val1': 'randOf(age,weight)',
			'val2': 'randOf(breed,gender)',
			'n': 'randOf(2,3,4)'
		}

	},{	..._baseX,
		description: `What is the lowest {val1} in each {val2}? Order the results by the lowest {val1}.`,
		solution_sql: `SELECT 
				{val2},
				MIN({val1}) as MinValue
				FROM cats
				GROUP BY {val2}
				ORDER BY MinValue`,
		template_values: {
			'val1': 'randOf(age,weight)',
			'val2': 'randOf(breed,gender)',
		}

	},{	..._baseX,
		description: `What is the highest {val1} in each {val2}?  Do not include cats with a name of 'Blarg'. Order the results by the highest {val1} (desc).`,
		solution_sql: `SELECT 
				{val2},
				MAX({val1}) as MaxValue
				FROM cats
				WHERE name != 'Blarg'
				GROUP BY {val2}
				ORDER BY MaxValue DESC`,
		template_values: {
			'val1': 'randOf(age,weight)',
			'val2': 'randOf(breed,gender)',
		}

	}
];




const kc_sql_groupby = {
		kc: KC_NAMES.KC_SQL_GROUPBY,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
	};

export { kc_sql_groupby }