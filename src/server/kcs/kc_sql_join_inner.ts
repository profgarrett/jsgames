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
};




////////////////////
// Prep

const _baseT_prep = {
	type: 'IfPageSqlSchema',
	kcs: [ KC_NAMES.KC_SQL_JOIN_INNER_PREP ],
	code: 'tutorial',
	...t2_breeds,
};

const tutorial_pages_prep = [
	{	type: 'IfPageTextSchema',
		description: `
			<iframe width="560" height="315" 
			src="https://www.youtube.com/embed/vSg39mmAYj0?si=eqD7pcJ3EO29kyKU" 
			title="YouTube video player" frameborder="0" 
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`,
		code: 'tutorial',
	
	}, {	type: 'IfPageTextSchema',
		description: `Before we start working with <code>INNER JOIN</code>, we should 
			review some concepts. 
			<br/><br/>
			Learning Outcomes:
			<ul>
				<li>Select specific fields</li>
				<li>Alias a field with <code>AS</code></li>
				<li>Identify the source of a field with <code>tablename.fieldname</code></li>
			</ul>`,
		code: 'tutorial'

	}, {	..._baseT_prep,
		description: `We will often choose individual fields to show in the results (instead of using <code>*</code> to select all fields).
			<br/><br/>
			You can select specific fields by listing each separated by a comma. As an example,
			<br/>
			<code>SELECT breed_pk, name, location FROM breeds</code>
			`,
		instruction: `Write a query that shows the {v1} and {v2} fields.`,
 		solution_sql: 'SELECT {v1}, {v2} FROM breeds',
		template_values: {
			'v1': 'popColumn(breed_pk,name,location)',
			'v2': 'popColumn(breed_pk,name,location)',
		},
		feedback: [
			{ 'has': 'sql', args: ['{v1}',  '{v2}', ',', 'breeds'] },
			{ 'has': 'no_sql', args: ['*'] },
		]

	}, {	..._baseT_prep,
		description: `We will start by identifying the table for each field. This requires adding the tablename and a period,  
			i.e. <code>tablename.fieldname</code>. 
			<br/><br/>
			This is not necessary when we use a single table, but now that we are using joins, will become very helpful.
			<br/><br/>
			Old: <code>SELECT breed_pk, name FROM breeds</code><br/>
			New: <code>SELECT breeds.breed_pk, breeds.name FROM breeds</code>
			`,
		instruction: `Write a query that shows the {v1} and {v2} fields. Add the breeds prefix to all fields.`,
 		solution_sql: 'SELECT breeds.{v1}, breeds.{v2} FROM breeds',
		template_values: {
			'v1': 'popColumn(breed_pk,name,location)',
			'v2': 'popColumn(breed_pk,name,location)',
		},
		feedback: [
			{ 'has': 'sql', args: ['breeds.{v1}',  'breeds.{v2}', ',', 'breeds'] },
			{ 'has': 'no_sql', args: ['*'] },
		]

	}, {	..._baseT_prep,
		description: `We can use <code>tablename.*</code> to select all fields from a specific table.
			<br/><br/>
			<code>SELECT breeds.* FROM breeds</code>
			`,
		instruction: `Write a query that shows all breed fields. Add the breeds prefix to all fields.`,
 		solution_sql: 'SELECT breeds.* FROM breeds',
		feedback: [
			{ 'has': 'sql', args: ['breeds.*', 'breeds'] },
		]

	}, {	..._baseT_prep,
		description: `We will often rename a field. This is important when we combine multiple tables.
			<br/><br/>
			Use <code>AS</code> to rename a field, i.e. 
			<code>SELECT breeds.name as breed_name FROM breeds</code>
			`,
		instruction: `Write a query that shows the breed_pk field as <b>{v1}</b> and name as <b>{v2}</b>. Add the breeds prefix to all fields.`,
 		solution_sql: 'SELECT breeds.breed_pk as {v1}, breeds.name as {v2} FROM breeds',
		template_values: {
			'v1': 'randOf(breed_id,pk,identity,key_field)',
			'v2': 'randOf(dog_name,breed_name,proper_name)',
		},
		feedback: [
			{ 'has': 'sql', args: ['{v1}', '{v2}', 'breeds.breed_pk', 'breeds.name', ',', 'breeds' ] },
			{ 'has': 'no_sql', args: ['*'] },
		]
	}
]



const _baseX_prep = {
	type: 'IfPageSqlSchema',
	...t2_breeds,
	...t3_puppies,
	instruction: `Type in the correct sql query.`,
	code: 'test',
	kcs: [ KC_NAMES.KC_SQL_JOIN_INNER_PREP ],
};

const test_pages_prep = [ 
	{ 	..._baseX_prep,
		description: `Select the name and {v1} fields from the <b>puppies</b> table. Rename the name field to {v2}. Add the puppies prefix.`,
		solution_sql: `SELECT puppies.name as {v2}, puppies.{v1} FROM puppies`,
		template_values: {
			'v1': 'randOf(puppy_pk,age_in_months,fk_to_breed_pk)',
			'v2': 'randOf(puppy_name,puppies_name,name_of_puppy)'
		},
		feedback: [
			{ 'has': 'sql', args: ['puppies.{v1}', 'puppies.name', '{v2}'] },
		]

	},{ ..._baseX_prep,
		description: `Select the {v1}, {v2}, and {v3} fields from the <b>puppies</b> table. Add the puppies prefix.`,
		solution_sql: `SELECT puppies.{v1}, puppies.{v2}, puppies.{v3} FROM puppies`,
		template_values: {
			'v1': 'popColumn(name,puppy_pk,age_in_months,fk_to_breed_pk)',
			'v2': 'popColumn(name,puppy_pk,age_in_months,fk_to_breed_pk)',
			'v3': 'popColumn(name,puppy_pk,age_in_months,fk_to_breed_pk)',
		},
		feedback: [
			{ 'has': 'sql', args: ['puppies.{v1}', 'puppies.{v2}', 'puppies.{v3}'] },
		]

	},{ 	..._baseX_prep,
		description: `Select the name and {v1} fields from the <b>breeds</b> table. Rename the name field to {v2}. Add the breeds prefix.`,
		solution_sql: `SELECT breeds.name as {v2}, breeds.{v1} FROM breeds`,
		template_values: {
			'v1': 'randOf(breed_pk,location)',
			'v2': 'randOf(breed_name,name_of_breed,breed_title)'
		},
		feedback: [
			{ 'has': 'sql', args: ['breeds.{v1}', '{v2}'] },
		]

	},{ 	..._baseX_prep,
		description: `Select the {v1} field from the <b>breeds</b> table. Rename it to {v2}. Add the breeds prefix.`,
		solution_sql: `SELECT breeds.{v1} as {v2} FROM breeds`,
		template_values: {
			'v1': 'randOf(breed_pk,name,location)',
			'v2': 'randOf(query_results,final_data,query_output)'
		},
		feedback: [
			{ 'has': 'sql', args: ['breeds.{v1}', '{v2}'] },
		]

	},{ ..._baseX_prep,
		description: `Select the {v1} and {v2} fields from the <b>breeds</b> table. Add the breeds prefix.`,
		solution_sql: `SELECT breeds.{v1}, breeds.{v2} FROM breeds`,
		template_values: {
			'v1': 'popColumn(name,breed_pk,location)',
			'v2': 'popColumn(name,breed_pk,location)',
		},
		feedback: [
			{ 'has': 'sql', args: ['breeds.{v1}', 'breeds.{v2}'] },
		]

	}
];


/////////////////
// Introduction to inner join


const _baseT_intro = {
	type: 'IfPageSqlSchema',
	kcs: [ KC_NAMES.KC_SQL_JOIN_INNER_INTRO ],
	code: 'tutorial',
}
const tutorial_pages_intro = [
	{	type: 'IfPageTextSchema',
		description: `We will have information stored in different tables. 
			We connect them by finding columns with keys.
			<br/><br/>
			Learning Outcomes:
			<ul>
				<li>Identify primary key in a table</li>
				<li>Identify foreign keys in a table</li>
			</ul>`,
		code: 'tutorial',

	}, {	..._baseT_intro,
		description: `
			First, let's start by finding Snoopy's primary key (PK). 
			<br/><br/>
			Hint: use <code>'single quotes'</code> for our test in <code>WHERE</code>
			<br/><br/>
			<b>Do not use <code>INNER JOIN</code> yet! We will use it after finding our keys.
			`,
		...t1_parents,
		instruction: `Write a query that shows the PK and name of the parent dog named Snoopy. Add the parents prefix.`,
 		solution_sql: "SELECT parents.parent_pk, parents.name FROM parents WHERE name = 'Snoopy'",
		feedback: [
			{ 'has': 'sql', args: ['parents.parent_pk', 'parents.name', 'parents', 'WHERE', 'name', '=', "'Snoopy'"] },
			{ 'has': 'no_sql', args: ['INNER JOIN', 'ON', 'puppies']},
		]

	}, {	..._baseT_intro,
		description: `We will use Snoopy's primary key value to find his puppies.
			<br/><br/>
			The <code>puppies</code> table has a field called <code>Parent_FK</code>. This is a foreign key (FK)  
			linking to the primary key in <code>parents</code>.
			<br/><br/>
			Each foreign key <b>must</b> link to another table's primary key. So, we can find each puppy's parent
			by following their <code>Parent_FK</code> value.
			<br/><br/>
			<b>Do not use <code>INNER JOIN</code> yet!
			`,
		...t3_puppies,
		instruction: `Write a query that shows all <b>puppies</b> with Snoopy\'s PK of 11. Add the puppies prefix to the * and the field in the where.`,
		solution_sql: 'SELECT puppies.* FROM puppies WHERE puppies.FK_to_Parent = 11',
		feedback: [
			{ 'has': 'sql', args: ['puppies.*', 'puppies', 'WHERE', 'puppies.FK_to_Parent', '=', "11", ] },
			{ 'has': 'no_sql', args: ['INNER JOIN', 'ON', 'parents']},
		],

	}, {	..._baseT_intro,
		description: `Great! Now let's also rename the puppy name field.`,
		instruction: `Show the name of each <b>puppy</b> with Snoopy\'s PK of 11. Rename name to {v1}. Add the puppies prefix.`,
		solution_sql: 'SELECT puppies.name as {v1} FROM puppies WHERE puppies.FK_to_Parent = 11',
		...t3_puppies,
			feedback: [
			{ 'has': 'sql', args: [ 'puppies.name', 'WHERE', 'puppies.FK_to_Parent ', '=', "11", "{v1}"] },
			{ 'has': 'no_sql', args: ['INNER JOIN', 'ON', 'parents']},
		],	
		template_values: {
			'v1': 'randOf(puppy_name,dog_name,name_of_puppy)',
		},		
	}
];





const _baseX_intro = {
	type: 'IfPageSqlSchema',
	...t1_parents,
	...t2_breeds,
	...t3_puppies,
	instruction: `Type in the correct sql query.`,
	code: 'test',
	kcs: [ KC_NAMES.KC_SQL_JOIN_INNER_INTRO ],
};

const test_pages_intro = [ 
	{ 	..._baseX_intro,
		description: `Select the primary key field from the <b>puppies</b> table. Rename it to {v2}. Add the puppies prefix to all fields.`,
		solution_sql: `SELECT puppies.puppy_pk as {v2} FROM puppies`,
		template_values: {
			'v2': 'randOf(puppy_primary_key,primary_key,key_for_puppies)'
		},
		feedback: [
			{ 'has': 'sql', args: ['puppies.puppy_pk', '{v2}'] },
		]

	},{ ..._baseX_intro,
		description: `Select the primary key field from the <b>breeds</b> table. Rename it to {v2}. Add the breeds prefix to all fields.`,
		solution_sql: `SELECT breeds.breed_pk as {v2} FROM breeds`,
		template_values: {
			'v2': 'randOf(breed_primary_key,primary_key,key_for_breed)'
		},
		feedback: [
			{ 'has': 'sql', args: ['breeds.breed_pk', '{v2}'] },
		]

	},{ ..._baseX_intro,
		description: `Select the primary key field from the <b>parents</b> table. Rename it to {v2}. Add the parents prefix to all fields.`,
		solution_sql: `SELECT parents.parent_pk as {v2} FROM parents`,
		template_values: {
			'v2': 'randOf(parent_primary_key,primary_key,key_for_parent)'
		},
		feedback: [
			{ 'has': 'sql', args: ['parents.parent_pk ', '{v2}'] },
		]
	
	},{ 	..._baseX_intro,
		description: `Select the fk_to_parent key field from the <b>puppies</b> table. Rename it to {v2}. Add the puppies prefix to all fields.`,
		solution_sql: `SELECT puppies.fk_to_parent as {v2} FROM puppies`,
		template_values: {
			'v2': 'randOf(key_to_parents,foreign_key_to_parents)'
		},
		feedback: [
			{ 'has': 'sql', args: ['puppies.fk_to_parent', '{v2}'] },
		]

	},{ 	..._baseX_intro,
		description: `Select the fk_to_breed_pk key field from the <b>puppies</b> table. Rename it to {v2}. Add the puppies prefix to all fields.`,
		solution_sql: `SELECT puppies.fk_to_breed_pk as {v2} FROM puppies`,
		template_values: {
			'v2': 'randOf(key_to_breed,foreign_key_to_breed,linking_field_to_breed)'
		},
		feedback: [
			{ 'has': 'sql', args: ['puppies.fk_to_breed_pk ', '{v2}'] },
		]

	},{ ..._baseX_intro,
		description: `Select the fk_to_breed_pk key field from the <b>parents</b> table. Rename it to {v2}. Add the parents prefix to all fields.`,
		solution_sql: `SELECT parents.FK_to_Breed_PK as {v2} FROM parents`,
		template_values: {
			'v2': 'randOf(link_breed_primary_key,foreign_key_link,key_to_breed)'
		},
		feedback: [
			{ 'has': 'sql', args: ['parents.FK_to_Breed_PK', '{v2}'] },
		]

	}
];


/////////////////////////////
// Practice INNER JOIN 


const _baseT_practice = {
	type: 'IfPageSqlSchema',
	kcs: [ KC_NAMES.KC_SQL_JOIN_INNER_PRACTICE ],
	code: 'tutorial',
	...t1_parents,
	...t2_breeds,
	...t3_puppies,
};

const tutorial_pages_practice = [
	{	type: 'IfPageTextSchema',
		description: `Congrats! We are now ready to use <code>INNER JOIN</code>.
			<br/><br/>
			Learning Outcomes:
			<ul>
				<li>Use <code>INNER JOIN</code> to join tables</li>
			</ul>`,
		code: 'tutorial',

	}, {	..._baseT_practice,
		description: `Here's an example of the <code>INNER JOIN</code> command:<br/>
			<code>SELECT parents.*, puppies.* <br/>
				FROM parents <br/>
				INNER JOIN puppies <br/>
				ON puppies.FK_to_Parent = parents.parent_pk</b></code>
			<br/><br/>
			<code>INNER JOIN</code> adds another table to our query.
			<code>ON</code> tells the computer how to link the tables together. We will
			link a <b>primary key</b> to a <b>foreign key</b>.
			`,
		instruction: `Write the above query`,
		solution_sql: `SELECT parents.*, puppies.* FROM puppies 
			INNER JOIN parents ON puppies.FK_to_Parent = parents.parent_pk`,
		feedback: [
			{ 'has': 'sql', args: ['puppies.*', 'parents.*', 'puppies', 
				'INNER JOIN', 'parents', 'ON', 'puppies.FK_to_Parent', '=', 'parents.parent_pk'] },
		],

	}, {	..._baseT_practice,
		description: `Too many fields are being returned, so let's just select 
			the <b>parent and puppy names</b>.  Can you modify the below?
			<br/><br/>
			<code>SELECT parents.*, puppies.* FROM parents <br/>
				INNER JOIN puppies <br/>
				ON puppies.FK_to_Parent = parents.parent_pk</b></code>
			`,
		instruction: `Write the above query, but put puppies.name and parents.names in the SELECT clause.`,
		solution_sql: `SELECT puppies.name, parents.name FROM puppies 
			INNER JOIN parents ON puppies.FK_to_Parent = parents.parent_pk`,
		feedback: [
			{ 'has': 'sql', args: ['puppies.name', 'parents.name', 'puppies', 
				'INNER JOIN', 'parents', 'ON', 'puppies.FK_to_Parent', '=', 'parents.parent_pk'] },
		],

	}, {	..._baseT_practice,
		description: `Having the same field names is confusing. Modify your prior query to show 
			unique names for each field.
			<br/><br/>
			Hint: <code>SELECT table.old_field AS new_field ...</code>
			`,
		instruction: `Show puppies.name as {v1} and parents.name as {v2}.`,
		solution_sql: `SELECT puppies.name as {v1}, parents.name as {v2} FROM puppies 
			INNER JOIN parents ON puppies.FK_to_Parent = parents.parent_pk`,
		template_values: {
			'v1': 'randOf(puppy_name,name_of_puppy)',
			'v2': 'randOf(parent_name,name_of_parent)',
		},
		feedback: [
			{ 'has': 'sql', args: ['puppies.name', 'parents.name', 'puppies', 
				'INNER JOIN', 'parents', 'ON', 'puppies.FK_to_Parent', '=', 'parents.parent_pk',
				'{v1}', '{v2}'] },
		],

	}, {	..._baseT_practice,
		description: `Let's try switching from puppies, and instead use the breed table.
			<br/><br/>
			Rewrite the code below to join 
			parents and breeds. You will need to change both <code>ON</code> and <code>INNER JOIN</code>
			<br/><br/>
			<code>SELECT parents.*, puppies.* <br/>
				FROM parents <br/>
				INNER JOIN puppies <br/>
				ON puppies.FK_to_Parent = parents.parent_pk</b></code>
			`,
		instruction: `Show all fields from parents, and all fields from breeds`,
		solution_sql: `SELECT parents.*, breeds.* FROM parents 
			INNER JOIN breeds ON parents.fk_to_breed_pk = breeds.breed_pk`,
		feedback: [
			{ 'has': 'sql', args: ['breeds.*', 'parents.*', 'breeds', 
				'INNER JOIN', 'parents', 'ON', 'parents.fk_to_breed_pk', '=', 'breeds.breed_pk'] },
		],

	}, {	..._baseT_practice,
		description: `Too many fields are being returned, so let's just 
			show the parents name, breeds name, and breeds location.
			<br/><br/>
			Be sure to add the table prefix to all fields (i.e. <code>parents.fieldname</code>).
			`,
		instruction: `Show parent name as {v1}, breed name as {v2}, and breed location.`,
		solution_sql: `SELECT parents.name as {v1}, breeds.name as {v2}, breeds.location FROM parents 
			INNER JOIN breeds ON parents.fk_to_breed_pk = breeds.breed_pk`,
		feedback: [
			{ 'has': 'sql', args: ['breeds.name', 'parents.name', 'breeds', '{v1}', '{v2}',
				'INNER JOIN', 'parents', 'ON', 'parents.fk_to_breed_pk', '=', 'breeds.breed_pk'] },
		],
		template_values: {
			'v1': 'randOf(parent_name,name_of_parent)',
			'v2': 'randOf(breed_name,name_of_breed)',
		},
	}
];


const _baseX_practice = {
	type: 'IfPageSqlSchema',
	...t1_parents,
	...t2_breeds,
	...t3_puppies,

	instruction: `Type in the correct sql query.`,
	code: 'test',
	kcs: [ KC_NAMES.KC_SQL_JOIN_INNER_PRACTICE ],

};

const test_pages_practice = [ 
// all
	{ 	..._baseX_practice,
		description: `Join <b>puppies</b> and breeds. Then show the puppy name as {v1}, and the breed name as {v2}.`,
		solution_sql: `SELECT puppies.name as {v1}, breeds.name as {v2}
						FROM puppies INNER JOIN breeds 
						ON puppies.FK_to_Breed_PK = breeds.breed_pk`,
		template_values: {
			'v1': 'randOf(puppy_name,pupper,pup_name)',
			'v2': 'randOf(breed_title,pup_breed,breed_name)',
		},

	},{ ..._baseX_practice,
		description: `Join <b>parents</b> and breeds. Then show the parent name as {v1}, and the breed name as {v2}.`,
		solution_sql: `SELECT parents.name as {v1}, breeds.name as {v2}
						FROM parents INNER JOIN breeds 
						ON parents.FK_to_Breed_PK = breeds.breed_pk`,

		template_values: {
			'v1': 'randOf(parent_name,parent,mom_or_dad_name)',
			'v2': 'randOf(breed_title,pup_breed,breed_name)',
		},

	},{ ..._baseX_practice,
		description: `Join <b>parents</b> and <b>puppies</b>. Then show all parent fields and all puppy names as {v2}.`,
		solution_sql: `SELECT parents.*, puppies.name as {v2}
						FROM parents INNER JOIN puppies
						ON parents.parent_pk = puppies.fk_to_parent`,

		template_values: {
			'v2': 'randOf(puppy_name,pupper,pup_name)',
		},
	},	{ 	..._baseX_practice,
		description: `Join <b>puppies</b> and breeds. Then show the puppy name as {v1}, and all breed fields.`,
		solution_sql: `SELECT puppies.name as {v1}, breeds.*
						FROM puppies INNER JOIN breeds 
						ON puppies.FK_to_Breed_PK = breeds.breed_pk`,
		template_values: {
			'v1': 'randOf(puppy_name,pupper,pup_name)',
		},

	},{ ..._baseX_practice,
		description: `Join <b>parents</b> and breeds. Then show the parent name as {v1}, and all fields from breed.`,
		solution_sql: `SELECT parents.name as {v1}, breeds.*
						FROM parents INNER JOIN breeds 
						ON parents.FK_to_Breed_PK = breeds.breed_pk`,

		template_values: {
			'v1': 'randOf(parent_name,parent,mom_or_dad_name)',
		},
	}

];


const kc_sql_join_inner_prep = {
	kc: KC_NAMES.KC_SQL_JOIN_INNER_PREP,
	tutorial_pages: tutorial_pages_prep,
	test_pages: test_pages_prep,
};


const kc_sql_join_inner_intro = {
	kc: KC_NAMES.KC_SQL_JOIN_INNER_INTRO,
	tutorial_pages: tutorial_pages_intro,
	test_pages: test_pages_intro,
};

const kc_sql_join_inner_practice = {
		kc: KC_NAMES.KC_SQL_JOIN_INNER_PRACTICE,
		tutorial_pages: tutorial_pages_practice,
		test_pages: test_pages_practice,
	};

	

export { kc_sql_join_inner_intro, kc_sql_join_inner_prep, kc_sql_join_inner_practice }