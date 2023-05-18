/*
	queryFactory is used to generate SQL results
	Takes in a page and a query, and returns the results 
*/

//import initSqlJs from "sql.js";
import initSqlJs from 'sql.js';



function quote_string(s_or_i: any): string {
	if(typeof s_or_i === 'string' ) return '"' + s_or_i + '"';
	return s_or_i;
}

	// Get the SQL text to create tables t1-tn
function return_create_tables(json: any): string {
		let lines: string[] = [];

		// T1
		lines.push('CREATE TABLE ' + json.t1_name + ' (' );

		// Add each column, basing type on if it is text or not.
		let lines_sub: string[] = [];
		for(let i = 0; i < json.t1_column_titles.length; i++) {
			lines_sub.push( json.t1_column_titles[i] + ' ' + 
					(json.t1_column_formats[i] === 'text' ? 'char' : 'real')
			);
		}
		lines.push( lines_sub.join(', ') + '); ');

		return lines.join(' ');
	}

	// Insert items into each row.
function return_insert_intos(json: any): string {
		let lines: string[] = [];

		// T1
		for (let i = 0; i < json.t1_rows.length; i++) {
			lines.push('INSERT INTO ' + json.t1_name + ' ' );
			lines.push(' ('+ json.t1_column_titles.join(', ') + ') ');
			lines.push(' VALUES (');

			// Add quoted values
			lines.push(
				json.t1_rows[i].map( quote_string ).join(', ')
			);

			lines.push(');');
		}

		return lines.join(' ');
	}




async function getInitSqlJs() {
	if(typeof window === 'undefined') {
		// On the server.
		return await initSqlJs();
	} else {
		// If Window is defined, then we are in a browser.
		throw new Error('aa');
	}
}


/*
	Returns columns and rows for the solution

	Can only be run on the server side.
*/
async function queryFactory_updateSolutionResults(json: any): Promise<{ rows: any[], columns: string[] }> {
	const columns = [];
	const rows = [];
	
	if(typeof window !== 'undefined') throw new Error('You can not run queryFactory_updateSolutionResults on the client');

	// If Window is defined, then we are in a browser.
	// Otherwise, on the server.

	const SQL = await getInitSqlJs();
	const db = new SQL.Database();

	// Create sql database
	db.exec(return_create_tables(json));
	db.exec(return_insert_intos(json));
	
	// Run query
	const res = db.exec(json.solution_sql);
	
	if(res.length !== 1) throw new Error('queryFactory solution found length not equal to 1');

	return {
		columns: res[0].columns, 
		rows: res[0].values,
	};
}


/*
	Returns columns and rows for the client

	Can be run on the server side or client side.
*/
async function queryFactory_updateClientResults(json: any): Promise<{ rows: any[], columns: string[] }> {
	const SQL = await getInitSqlJs()
	const columns = [];
	const rows = [];
	const db = new SQL.Database();

	// Create sql database
	db.exec(return_create_tables(json));
	db.exec(return_insert_intos(json));
	
	// Run query
	const res = db.exec(json.solution_sql);
	
	if(res.length !== 1) throw new Error('queryFactory client found length not equal to 1');

	return {
		columns: res[0].columns, 
		rows: res[0].values,
	};
}

export { queryFactory_updateSolutionResults, queryFactory_updateClientResults };