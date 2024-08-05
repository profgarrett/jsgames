import { KC_NAMES } from './kc';

const t1_parents = {
	t1_name: 'parents',
	t1_titles: ['Parent_PK', 'Parent_Name', 'FK_to_Breed_PK', 'Price' ],
    t1_formats: ['pk', 'text', 'fk', '$' ],
	t1_rows: [
			[10, 'Bones', 5, 200],
			[11, 'Snoopy', 1, 250],
			[12, 'Dog Senior', 2, 500],
			[13, 'Daisy', 2, 550],
			[14, 'Billy', 3, 125],
			[15, 'Spot', 3, 325],
		]
};

const t2_breeds = {
	t2_name: 'breeds',
	t2_titles: ['Breed_PK', 'Breed_Name', 'Location' ],
    t2_formats: ['text', 'text', 'text' ],
	t2_rows: [
		[1, 'Beagle', 'Los Angeles'],
		[2, 'Cattle Dog', 'West Virginia'],
		[3, 'Mutt', 'New York'],
		[4, 'Unknown', 'New York'],
	]
};

const t3_puppies = {
	t3_name: 'puppies',
	t3_titles: ['FK_to_Parent', 'Puppy_PK', 'Puppy_Name', 'Age_in_months', 'FK_to_Breed_PK' ],
    t3_formats: ['fk', 'pk', 'text','0', 'fk' ],
	t3_rows: [
		[11, 1, 'Little Snoopy', 8, 1],
		[12, 3, 'Dog Junior', 4, 2],
		[12, 4, 'Dog the third', 4, 2],
		[0, 6, 'Kitty', 2, 0],
	]
}


const _baseT = {
	type: 'IfPageSqlSchema',
	kcs: [ KC_NAMES.KC_SQL_JOIN_LEFTOUTER ],
	code: 'tutorial',
	...t1_parents,
	...t3_puppies,
}


const tutorial_pages = [
	{	type: 'IfPageTextSchema',
		description: `
			<iframe width="560" height="315" 
				src="https://www.youtube.com/embed/hdEzH_hwLJQ?si=cwUaOzBfZZqJfM8M" 
				title="YouTube video player" frameborder="0" 
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`,
		code: 'tutorial'

	}, {	type: 'IfPageTextSchema',
			description: `So far, we have focused on <code>INNER JOIN</code>. This is usually the easiest approach, as 
			it only returns items that match in both tables. However, we also need to learn about <code>LEFT OUTER JOIN</code>.
			<br/><br/>
			A left join is used when we want to return all items from a table, even if they don't match a row in another table.
			<br/><br/>
			A good example
			is looking at our puppies and parents. So far, an inner join has returned all puppies and their matching parents. But, what if we
			want all parents, even those without a puppy?`,


	}, {	..._baseT,
		description: `Let's start by finding all puppies and parents that match each other. In the diagram below, this 
			would be the center (with a black font).	
			<br/><br/>
			<img src='/static/sql_join_leftouter_puppiesandparents.png' />
			<br/><br/>
			Take a look at the table structure before starting, as we we've made a few tweaks to the field names.
			`,
		instruction: `Write a query that uses <code>INNER JOIN</code> to show all puppies and parents. Include the name of the parent and puppy.`,
 		solution_sql: 'SELECT parent_name, puppy_name FROM parents INNER JOIN puppies ON parents.parent_pk = puppies.FK_to_parent',

	}, {	..._baseT,
		description: `Now, we want to get a list of all parents, even those without a puppy. This will include the center and left side
			of the diagram below.
			<br/><br/>
			<img src='/static/sql_join_leftouter_puppiesandparents.png' />
			<br/><br/>
			There are two changes in syntax from an inner join
			<ul>
				<li>Replace <code>INNER JOIN</code> with <code>LEFT OUTER JOIN</code>.</li>
				<li>Order matters! Make sure that the table that you want all results from is on the left. So, in our case, 
					since we want all parents (even those without puppies),  you'll want to write <code>... FROM parents LEFT OUTER JOIN puppies ON ...</code>
			</ul>
			Notice that some rows will have a blank puppy name.
			`,
			instruction: `Show parent name, and puppy name for all parents (even those without puppies).`,
			solution_sql: 'SELECT parent_name, puppy_name FROM parents LEFT OUTER JOIN puppies ON parents.parent_pk = puppies.FK_to_parent',
   
	}, {	..._baseT,
		description: `In our prior query, you may have noticed that some rows had blank values in the puppy name field. 
			This is because we got all parents, even those without a matching puppy.
			<br/><br/>
			This blank field is a special result called <code>NULL</code>. A null value isn't a string or number. We also 
			can't type <code>...WHERE puppy_name = NULL</code>. Instead, we must write <code>... WHERE puppy_name IS NULL</code> or 
			<code>... WHERE puppy_name IS NOT NULL</code>.
			<br/><br/>
			It's useful to be able to test for null values. For example, what we if want a list of all parents without a puppy?
			Look for any values where the puppy_name is null.
			`,
		instruction: `Show the parent_name field for all parents without a matching puppy. Use <code>WHERE puppy_name IS NULL</code>.`,
		solution_sql: 'SELECT parent_name FROM parents LEFT OUTER JOIN puppies ON parents.parent_pk = puppies.FK_to_parent WHERE puppy_name IS NULL',
		
	}, {	..._baseT,
		description: `Great! Let's try another null test, using is <b>not</b> null.
			`,
		instruction: `Show all parent_names where they have a puppy. Use a <code>LEFT OUTER JOIN</code>, and test to only get values where <code>puppy_name IS NOT NULL</code>.`,
		solution_sql: 'SELECT parent_name FROM parents LEFT OUTER JOIN puppies ON parents.parent_pk = puppies.FK_to_parent WHERE puppy_name IS NOT NULL',

	}, {	type: 'IfPageTextSchema',
		description: `So far, we've used the <b>left</b> join to find all parents. What if we want all puppies?
			How do we get the right side of the diagram below?
			<br/><br/>
			<img src='/static/sql_join_leftouter_puppiesandparents.png' />
			<br/><br/>
			Unfortunately, this tutorial uses a database engine that doens't have a right join. But, there is a simple
			solution. Just swap the order of the tables in your sql query! 
			<ul>
				<li>Get all parents with <code>... FROM parents LEFT OUTER JOIN puppies ON parents.parent_pk = puppies.fk_to_parent</code></li> 
				<li>Get all puppies with <code>... FROM puppies LEFT OUTER JOIN parents ON parents.parent_pk = puppies.fk_to_parent</code></li> 
			</ul>
			You don't need to change the order of the items in the <code>ON</code> clause.`,
	} 
];





const _baseX = {
	type: 'IfPageSqlSchema',
	...t1_parents,
	...t2_breeds,
	...t3_puppies,

	instruction: `Type in the correct sql query.`,
	code: 'test',
	kcs: [ KC_NAMES.KC_SQL_JOIN_LEFTOUTER ],

};

const test_pages = [ 
// all
	{ 	..._baseX,
		description: `Show all puppies, and any breeds that match, using a left join. Show puppy_name and breed_name.`,
		solution_sql: `SELECT puppy_name, breed_name 
						FROM puppies LEFT OUTER JOIN breeds 
						ON puppies.FK_to_Breed_PK = breeds.breed_pk`,

	},{ ..._baseX,
		description: `Show all puppies without a matching breed_name. Use a left join. Show puppy_name and breed_name.`,
		solution_sql: `SELECT puppy_name, breed_name 
						FROM puppies LEFT OUTER JOIN breeds 
						ON puppies.FK_to_Breed_PK = breeds.breed_pk
						WHERE breed_name IS NULL`,

	},{ ..._baseX,
		description: `Show all breeds, and any puppies that match, using a left join. Show breed_name and puppy_name.`,
		solution_sql: `SELECT breed_name, puppy_name 
						FROM breeds LEFT OUTER JOIN puppies 
						ON puppies.FK_to_Breed_PK = breeds.breed_pk`,

	},{ ..._baseX,
		description: `Show all breeds without a matching puppy_name. Use a left join. Show breed_name.`,
		solution_sql: `SELECT breed_name 
						FROM breeds LEFT OUTER JOIN puppies 
						ON puppies.FK_to_Breed_PK = breeds.breed_pk
						WHERE puppy_name IS NULL`,

	},{ ..._baseX,
		description: `Show all parents, and any breeds that match, using a left join. Show parent_name and breed_name.`,
		solution_sql: `SELECT parent_name, breed_name 
						FROM parents LEFT OUTER JOIN breeds 
						ON parents.FK_to_Breed_PK = breeds.breed_pk`,


	},{ ..._baseX,
		description: `Show all parents without a matching  breed_name. Use a left join. Show parent_name and breed_name.`,
		solution_sql: `SELECT parent_name, breed_name 
						FROM parents LEFT OUTER JOIN breeds 
						ON parents.FK_to_Breed_PK = breeds.breed_pk
						WHERE breed_name IS NULL`,
					

	},{ ..._baseX,
		description: `Show all breeds, and any parents that match, using a left join. Show breed_name and parent_name.`,
		solution_sql: `SELECT breed_name, parent_name 
						FROM breeds LEFT OUTER JOIN parents 
						ON parents.FK_to_Breed_PK = breeds.breed_pk`,


	},{ ..._baseX,
		description: `Show all breeds without a matching parent_name. Use a left join. Show breed_name.`,
		solution_sql: `SELECT breed_name 
						FROM breeds LEFT OUTER JOIN parents 
						ON parents.FK_to_Breed_PK = breeds.breed_pk
						WHERE parent_name IS NULL`,

	},
	
];



const kc_sql_join_leftouter = {
		kc: KC_NAMES.KC_SQL_JOIN_LEFTOUTER,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
	};

export { kc_sql_join_leftouter }