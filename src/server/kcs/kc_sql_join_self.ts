import { KC_NAMES } from './kc';

const t1_people = {
	t1_name: 'people',
	t1_titles: ['ID', 'Name', 'Job', 'Boss_ID', 'Recruiter_ID' ],
    t1_formats: ['pk', 'text', 'text', 'fk', 'fk' ],
	t1_rows: [
			[1, 'Sarah', 'CEO', null, null],
			[2, 'Robert', 'VP, Finance', 1, 3],
			[3, 'Joe', 'VP, HR', 1, 3],
			[4, 'Jane', 'Accountant', 2, 9],
			[5, 'Joseph', 'Accountant', 2, 3], 
			[6, 'Ann', 'Recruiting', 3, null],
			[7, 'Tara', 'Internal Audit', null, 9],
		]
};


const _baseT = {
	type: 'IfPageSqlSchema',
	kcs: [ KC_NAMES.KC_SQL_JOIN_SELF ],
	code: 'tutorial',
	...t1_people,
}
const tutorial_pages = [
	{	type: 'IfPageTextSchema',
			description: `Self-joins can be challenging, but are often found in real-world scenarios.
				<br/><br/>
				A self-join is when each table stores a reference to itself. So, each row has a foreign key, which refers to
				another row in the same table.
				<br/><br/>
				Writing a query with a self-join requires properly creating the join, as well as renaming tables.
				<br/><br/>
				We will be working with the below table in this tutorial, which has two self-joins.
				<br/><br/>
				<img src='/static/sql_join_self.png' />
				`,

	//},{	type: 'IfPageTextSchema',
			
			
	}, {..._baseT,
		description: `First, let's practice renaming a field. Remember, you can rename
			a field by using the <code>AS</code> keyword.
			<br/><br/>
			As an example, the below query will return a field called <code>new_name</code>:
			<br/><br/>
			<code>SELECT old_name as new_name FROM table_name </code>
			<br/><br/>`,
		instruction: `Show all employee names, with the only column titled Staff_Name. Exclude Sarah by 
			adding <code>WHERE staff_name != "Sarah"</code>. Note that we use the <b>new</b> name.`,
 		solution_sql: `SELECT name AS Staff_Name FROM people WHERE staff_name != "Sarah"`,

	}, {..._baseT,
		description: `Second, we can now try renaming an entire table by adding <code>AS</code> in our
			<code>FROM</code> section. As the example below shows, this will changes the name in our 
			<code>SELECT</code> section.
			<br/><br/>
			<code>SELECT new_table_name.field FROM old_table_name AS new_table_name</code> 
			`,
		instruction: `Rename the people table as staff, and then return all fields by using <code>staff.*</code>`,
		solution_sql: `SELECT staff.* FROM people AS staff`
   
	},{ type: 'IfPageTextSchema',
		description: `Now that we have both renaming techniques, we can look at how to create a self join.
			<br/><br/>
			The key is that we will rename our tables. Take a minute to look at the code below. This joins 
			source_table to itself, renaming both versions of the table. Once we have two versions of the same table 
			(each with its own name), we treat each table differently.
			<br/><br/>
			<code>SELECT newtable1.name, newtable2.name <br/>
				FROM oldtable AS newtable1 <br/>
				LEFT OUTER JOIN oldtable as newtable2 <br/>
				ON newtable1.foreign_key_to_itself = newtable2.primary_key</code> 
			<br/><br/>
			We will use a left outer join to include all rows in newtable1, and only rows in newtable2 that match.
			`,

	}, {	..._baseT,
		description: `Let's try the technique now. We want a list of people and their bosses.
			<br/><br/>
			Use the code below as a template. Replace <code>newtable1</code> with staff, 
			and <code>newtable2</code> with boss, and <code>oldtable</code> with people.
			<br/><br/>
			<code>SELECT newtable1.name, newtable2.name <br/>
				FROM oldtable AS newtable1 <br/>
				LEFT OUTER JOIN oldtable AS newtable2 <br/>
				ON newtable1.foreign_key_to_itself = newtable2.primary_key</code>`,
		instruction: `Show staff names and boss names. Rename the tables, with one called staff and one called bosses`,
		solution_sql: `SELECT staff.name, bosses.name 
			FROM people AS staff
			LEFT OUTER JOIN people AS bosses 
			ON staff.boss_id = bosses.id`
		
	}, {	..._baseT,
		description: `Nice! Now, do the same thing, but also rename the name field. Make the staff name 
			<code>staff_name</code> and the boss name as <code>boss_name</code>. Renaming tables and fields 
			helps us remember where each table originated.`,
		instruction: `Show staff_name and boss_name. Rename the tables, with one called staff and one called bosses`,
		solution_sql: `SELECT staff.name as staff_name, bosses.name as boss_name 
			FROM people AS staff
			LEFT OUTER JOIN people AS bosses 
			ON staff.boss_id = bosses.id`

	}, {	..._baseT,
		description: `Great work! Let's now try playing with the join type. Use a left join and 
			test for not null to see if we can limit the list to only people with a boss.
			<br/><br/>
			We could also do the same thing by using an inner join.
			`,
		instruction: `Show all staff_name and boss_name, but filter out anyone without a boss.`,
		solution_sql: `SELECT staff.name as staff_name, bosses.name as boss_name 
			FROM people AS staff
			LEFT OUTER JOIN people AS bosses 
			ON staff.boss_id = bosses.id
			WHERE boss_name IS NOT NULL`

	}, {	..._baseT,
		description: `Let's also try the reverse. Use a left join and 
			test for <code>IS NULL</code> to see if we can limit the list to only people <b>without</b> a boss.
			`,
		instruction: `Show all staff_name and boss_name, but filter out anyone with a boss.`,
		solution_sql: `SELECT staff.name as staff_name, bosses.name as boss_name 
			FROM people AS staff
			LEFT OUTER JOIN people AS bosses 
			ON staff.boss_id = bosses.id
			WHERE boss_name IS NULL`

	} 
];





const _baseX = {
	type: 'IfPageSqlSchema',


	instruction: `Type in the correct sql query.`,
	code: 'test',
	kcs: [ KC_NAMES.KC_SQL_JOIN_SELF ],
	...t1_people,
};

const test_pages = [ 
// all
	{ 	..._baseX,
		description: `Show the name of each person as staff_person, and the name of their recruiter as recruiter_name. 
			Include all staff, even if they don't have a recruiter.`,
		solution_sql: `SELECT staff.name as staff_name, recruiter.name as recruiter_name
				FROM people as staff 
				LEFT OUTER JOIN people as recruiter ON staff.recruiter_id = recruiter.id`,

	},{ ..._baseX,
		description: `Show the name of each person as staff_person, and the name of their recruiter as recruiter_name. 
			Include all staff <b>without a matching recruiter</b>.`,
		solution_sql: `SELECT staff.name as staff_name, recruiter.name as recruiter_name
				FROM people as staff 
				LEFT OUTER JOIN people as recruiter ON staff.recruiter_id = recruiter.id
				WHERE recruiter.id IS NULL`,

	},{ ..._baseX,
		description: `Show the name of each person as staff_person, and the name of their recruiter as recruiter_name. 
			Include only staff <b>with a matching recruiter</b>.`,
		solution_sql: `SELECT staff.name as staff_name, recruiter.name as recruiter_name
				FROM people as staff 
				INNER JOIN people as recruiter ON staff.recruiter_id = recruiter.id`,

	},{	..._baseX,
		description: `Show the name of each person as staff_person, and the name of their boss as boss_name. 
			Include all staff, <b>even if</b> they don't have a boss.`,
		solution_sql: `SELECT staff.name as staff_name, boss.name as boss_name
				FROM people as staff 
				LEFT OUTER JOIN people as boss ON staff.boss_id = boss.id`,

	},{ ..._baseX,
		description: `Show the name of each person as staff_person, and the name of their boss as boss_name. 
			Include all staff <b>with</b> a boss.`,
		solution_sql: `SELECT staff.name as staff_name, boss.name as boss_name
				FROM people as staff 
				INNER JOIN people as boss ON staff.boss_id = boss.id`,

	},{ ..._baseX,
		description: `Show the name of each person as staff_person, and the name of their boss as boss_name. 
			Include all staff <b>without</b> a matching boss.`,
		solution_sql: `SELECT staff.name as staff_name, boss.name as boss_name
				FROM people as staff 
				LEFT OUTER JOIN people as boss ON staff.boss_id = boss.id
				WHERE boss_name IS NULL`,

	}
];




const kc_sql_join_self = {
		kc: KC_NAMES.KC_SQL_JOIN_SELF,
		tutorial_pages: tutorial_pages,
		test_pages: test_pages
	};

export { kc_sql_join_self }