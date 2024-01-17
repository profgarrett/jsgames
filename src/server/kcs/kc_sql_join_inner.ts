import { KC_NAMES } from './kc';

const t1_parents = {
	t1_name: 'parents',
	t1_titles: ['Parent_PK', 'Name', 'FK_to_Breed_PK', 'Price' ],
    t1_formats: ['pk', 'text', 'fk', '$' ],
	t1_rows: [
			[10, 'Bones', 1, 200],
			[11, 'Snoopy', 1, 250],
			[12, 'Dog Senior', 2, 500],
			[13, 'Daisy', 2, 550],
			[14, 'Billy', 3, 125],
			[15, 'Spot', 3, 325],
		]
};

const t2_breeds = {
	t2_name: 'breeds',
	t2_titles: ['Breed_PK', 'Name', 'Location' ],
    t2_formats: ['text', 'text', 'text' ],
	t2_rows: [
		[1, 'Beagle', 'Los Angeles'],
		[2, 'Cattle Dog', 'West Virginia'],
		[3, 'Mutt', 'New York'],
	]
};

const t3_puppies = {
	t3_name: 'puppies',
	t3_titles: ['FK_to_Parent', 'Puppy_PK', 'Name', 'Age_in_months', 'FK_to_Breed_PK' ],
    t3_formats: ['fk', 'pk', 'text','0', 'fk' ],
	t3_rows: [
		[11, 1, 'Little Snoopy', 8, 1],
		[11, 2, 'Little Snoopet', 8, 1],
		[12, 3, 'Dog Junior', 4, 2],
		[12, 4, 'Dog the third', 4, 2],
		[12, 5, 'Dog the last', 4, 2],
	]
}


const _baseT = {
	type: 'IfPageSqlSchema',
	kcs: [ KC_NAMES.KC_SQL_JOIN_INNER ],
	code: 'tutorial',
	...t1_parents,
	...t3_puppies,
}
const tutorial_pages = [
	{	type: 'IfPageTextSchema',
		description: `
			<iframe width="560" height="315" 
			src="https://www.youtube.com/embed/vSg39mmAYj0?si=eqD7pcJ3EO29kyKU" 
			title="YouTube video player" frameborder="0" 
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`,
		code: 'tutorial'

	}, {	..._baseT,
		description: `<code>Join</code> is the most important feature in sql.
			<br/><br/>
			We generally have information stored in different tables. 
			We connect these tables by finding a column in <i>each</i> table with matching values. These special values
			are called keys.
			<br/><br/>
			First, let's start by finding the Snoopy's primary key (PK). Notice that we are using <code>_</code> instead of 
			spaces, meaning you don't need to put quotes around the column names.
			`,
		instruction: `Write a query that shows the PK and name of the parent dog named Snoopy.`,
 		solution_sql: 'SELECT parent_pk, name FROM parents WHERE name = "Snoopy"',

	}, {	..._baseT,
		description: `We will use that primary key value to find her puppies.
			<br/><br/>
			The <code>puppies</code> table has a field called <code>Parent_FK</code>. This is a foreign key (FK), that 
			links to the primary key in <code>parents</code>.
			<br/><br/>
			Each foreign key <b>must</b> link to another table's primary key. So, we can find each puppy's parent
			by following their <code>Parent_FK</code> value.
			`,
			instruction: `Write a query that shows all puppies with Snoopy\'s PK of 11.`,
			solution_sql: 'SELECT * FROM puppies WHERE FK_to_Parent = 11',
   
	}, {	..._baseT,
		description: `Now we will combine both steps with the <code>INNER JOIN</code> command.
			<br/><br/>
			Here's an example of the <code>INNER JOIN</code> command:<br/>
			<code>SELECT * FROM table1 <b>INNER JOIN table2 ON table1.primary_key = table2.foreign_key_to_table1</b></code>
			<br/><br/>
			This code above will let us link together two tables by finding where table1's pk matches the foreign key in table2.
			`,
		instruction: `Write a query that links puppies and parents. Return puppies.* and parents.* in the SELECT clause. You will want to include the on clause <code>ON parents.parent_pk = puppies.FK_to_Parent</code>`,
		solution_sql: 'SELECT * FROM puppies INNER JOIN parents ON puppies.FK_to_Parent = parents.parent_pk',
		
	}, {	..._baseT,
		description: `Great! Now let's filter these results. Join the two tables again, but now add a <code>WHERE</code>
			clause that makes sure that we only get Snoopy's puppies by making sure that parent_pk is 11.
			`,
		instruction: `Write a query that links puppies and parents, showing only parents with a primary key of 11`,
		solution_sql: 'SELECT * FROM puppies INNER JOIN parents ON puppies.FK_to_Parent = parents.parent_pk WHERE parent_pk = 11',

	}, {	..._baseT,
		description: `What if we want to filter on a parent's name, instead of primary key? 
			<br/><br/>
			We have the <code>Name</code> field in both <code>parents</code> and <code>puppies</code>. We can distinguish which
			we want by putting <code>TableName.FieldName</code>. So, referring to the parent's price column with <code>parents.price</code>.
			`,
		instruction: `Write a query that links puppies and parents, showing only puppies with a parent name of Snoopy`,
		solution_sql: 'SELECT * FROM puppies INNER JOIN parents ON puppies.FK_to_Parent = parents.parent_pk WHERE parents.name = "Snoopy"',

	}, {	..._baseT,
		description: `We can use the same <code>TableName.ColumnName</code> trick to select certain fields.
			
			`,
		instruction: `Write a query that links puppies and parents, showing the parent name and puppy name `,
		solution_sql: 'SELECT parents.name, puppies.name FROM puppies INNER JOIN parents ON puppies.FK_to_Parent = parents.parent_pk ',

	}, {	..._baseT,
		description: `When we have columns with the same names, it can be tricky to see which is which. We can use <code>AS</code> to rename a column.
			<br/><br/>
			For example, <code>SELECT name as Parent_Name FROM parents</code> will give us a single field called <code>Parent_Name</code>.
			`,
		instruction: `Write a query that links puppies and parents, showing the parent name as parent_name and puppy name as puppy_name `,
		solution_sql: 'SELECT parents.name as parent_name, puppies.name as puppy_name FROM puppies INNER JOIN parents ON puppies.FK_to_Parent = parents.parent_pk ',

	}
];





const _baseX = {
	type: 'IfPageSqlSchema',
	...t1_parents,
	...t2_breeds,
	...t3_puppies,

	instruction: `Type in the correct sql query.`,
	code: 'test',
	kcs: [ KC_NAMES.KC_SQL_WHERE ],

};

const test_pages = [ 
// all
	{ 	..._baseX,
		description: `Join puppies and breeds. Then show the puppy name as Puppy_Name, and the breed name as Breed_Name.`,
		solution_sql: `SELECT puppies.name as puppy_name, breeds.name as breed_name 
						FROM puppies INNER JOIN breeds 
						ON puppies.FK_to_Breed_PK = breeds.breed_pk`,

	},{ ..._baseX,
		description: `Join parents and breeds. Then show the parent name as Parent_Name, and the breed name as Breed_Name.`,
		solution_sql: `SELECT parents.name as parent_name, breeds.name as breed_name 
						FROM parents INNER JOIN breeds 
						ON parents.FK_to_Breed_PK = breeds.breed_pk`,

	},{ ..._baseX,
		description: `Join parents and breeds. Show all fields, but only dogs with the {val1} breed.`,
		solution_sql: `SELECT *
						FROM parents INNER JOIN breeds 
						ON parents.FK_to_Breed_PK = breeds.breed_pk
						WHERE breeds.name = "{val1}"`,
		template_values: {
			'val1': 'randOf(Mutt,Cattle Dog,Beagle)',
		}

	},{ ..._baseX,
		description: `Join puppies and breeds. Show all fields, but only pupplies with the {val1} breed.`,
		solution_sql: `SELECT *
						FROM puppies INNER JOIN breeds 
						ON puppies.FK_to_Breed_PK = breeds.breed_pk
						WHERE breeds.name = "{val1}"`,
		template_values: {
			'val1': 'randOf(Cattle Dog,Beagle)',
		}

	},{ ..._baseX,
		description: `Join puppies and breeds. Show all fields, but only pupplies with an age of {val1}.`,
		solution_sql: `SELECT *
						FROM puppies INNER JOIN breeds 
						ON puppies.FK_to_Breed_PK = breeds.breed_pk
						WHERE puppies.age_in_months = "{val1}"`,
		template_values: {
			'val1': 'randOf(4,8)',
		}
	}

];



const kc_sql_join_inner = {
		kc: KC_NAMES.KC_SQL_JOIN_INNER,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
	};

export { kc_sql_join_inner }