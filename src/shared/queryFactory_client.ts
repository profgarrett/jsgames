/*
	queryFactory is used to generate SQL results
	Takes in a page and a query, and returns the results 
*/

//import { SqlJsStatic } from "sql.js";

//import initSqlJs from "sql.js";
//import initSqlJs from 'sql.js';
import { fill_template } from "./template";

function quote_string(s_or_i: string | number | null): string {
	if(s_or_i == null) return 'NULL';
	if(typeof s_or_i === 'string' ) return '"' + s_or_i + '"';
	return ''+s_or_i;
}


// Apply a default sort to an array of rows, going in order by field position.
// update in place
function apply_default_sort_if_no_order_by_clause(rows: any[]): void {
	// Take in two arrays, each representing a separate row
	// Figure out which should go first by examining in field order, first to last. 
	const sortBy = (a: any[], b: any[]) => {
		if(a.length !== b.length) throw new Error('queryFactory:apply_default_sort_if_no_order_by_clause, rows should have identical length');

		// For each field, start with field 0, and go up. If we find a difference, then return sort order.
		for(let i=0; i < a.length; i++) {
			if(a[i] < b[i]) return -1;
			if(a[i] > b[i]) return 1;
		}

		// Gone through and all fields are identical. Return 0, as it doesn't actually matter which order
		// they are sorted (since they are identical)
		return 0;
	};

	// Update passed rows variable. 
	rows.sort(sortBy);
}

/**
 * Return a single table as a string.
 * 
 * @param name 
 * @param titles 
 * @param formats 
 */
function _return_create_table(name: string, titles: string[], formats: string[]): string {
	const lines: string[] = [];

	// Sanity check.
	if(titles.length !== formats.length) {
		console.log(titles, formats);
		throw new Error('queryFactory_clients: return create table has different titles v. formats');
	}

	lines.push('CREATE TABLE "' + name + '" (' );

	// Add each column, fixing type.	
	for(let i = 0; i < titles.length; i++) {
		if(formats[i] === 'text') {
			lines.push( '"'+titles[i] + '" TEXT' + (i<titles.length-1 ? ', ' : '') )
		} else if(formats[i] === '0' || formats[i] === 'pk' || formats[i] === 'fk' ) {
			lines.push( '"'+titles[i] + '" INT' + (i<titles.length-1 ? ', ' : '') )
		} else if(formats[i] === '$') {
			lines.push( '"'+titles[i] + '" REAL' + (i<titles.length-1 ? ', ' : '') )
		} else {
			throw new Error('queryFactory_clients: invalid type of '+formats[i] + ' for ' + name);
		}
	}

	// Make sure that we don't accept bad data for each table, which is SQLite default
	lines.push(  ') STRICT; ');

	return lines.join(" ");
}

// Get the SQL text to create tables t1-tn
function return_create_tables(json: any): string {
		let lines: string[] = [];

		lines.push(_return_create_table(json.t1_name, json.t1_titles, json.t1_formats));

		if(typeof json.t2_name !== 'undefined' && json.t2_name !== null && json.t2_name.length > 0) {
			lines.push(_return_create_table(json.t2_name, json.t2_titles, json.t2_formats));
		}
		if(typeof json.t3_name !== 'undefined' && json.t3_name !== null && json.t3_name.length > 0) {
			lines.push(_return_create_table(json.t3_name, json.t3_titles, json.t3_formats));
		}

		// Done!
		return lines.join(' ');
	}

	// Insert items into each row.
function return_insert_intos(json: any): string {
		let lines: string[] = [];

		// T1
		for (let i = 0; i < json.t1_rows.length; i++) {
			lines.push('INSERT INTO "' + json.t1_name + '" ' );
			lines.push(' ("'+ json.t1_titles.join('", "') + '") ');
			lines.push(' VALUES (');

			// Add quoted values
			lines.push(
				json.t1_rows[i].map( quote_string ).join(', ')
			);

			lines.push(');');
		}

		// T2
		if(typeof json.t2_rows !== 'undefined') {
			for (let i = 0; i < json.t2_rows.length; i++) {
				lines.push('INSERT INTO "' + json.t2_name + '" ' );
				lines.push(' ("'+ json.t2_titles.join('", "') + '") ');
				lines.push(' VALUES (');

				// Add quoted values
				lines.push(
					json.t2_rows[i].map( quote_string ).join(', ')
				);

				lines.push(');');
			}
		}


		// T3
		if(typeof json.t3_rows !== 'undefined') {
			for (let i = 0; i < json.t3_rows.length; i++) {
				lines.push('INSERT INTO "' + json.t3_name + '" ' );
				lines.push(' ("'+ json.t3_titles.join('", "') + '") ');
				lines.push(' VALUES (');

				// Add quoted values
				lines.push(
					json.t3_rows[i].map( quote_string ).join(', ')
				);

				lines.push(');');
			}
		}

		return lines.join(' ');
	}




async function getInitSqlJs() {
	if(typeof window === 'undefined') {
		// On the server.
		throw new Error('You can not call getInitSql from the server. Load queryFactory instead of queryFactory_client');
	} else {
		const initSqlJs = window.initSqlJs;
		// If Window is defined, then we are in a browser.
		// Need to give the location of any files on the server.
		return await initSqlJs({ 
			locateFile: file => `/static/${file}`
		});
	}
}


/*
	Returns columns and rows for the solution

	Can only be run on the server side.
	No error handling, as we want to have this fail ASAP if an error is in a template.
*/
async function proto_queryFactory_getSolutionResults(json: any, SQL: any): Promise<{ rows: any[], titles: string[], error: string | null }> {
	// If Window is defined, then we are in a browser.
	// Otherwise, on the server.
	if(typeof window !== 'undefined') throw new Error('You can not run queryFactory_updateSolutionResults on the client');

	const db = new SQL.Database();

	db.exec(return_create_tables(json));
	db.exec(return_insert_intos(json));

	const sql = ''+fill_template(json.solution_sql, json.template_values);

	// We only typically get issues during development. Include the SQL to make debuggin easier.
	try {
		const res = db.exec(sql);

		// Look to see if we should re-order the results.
		// Can be an issue if the server v. client happens to choose a different sort order.
		if(sql.toLowerCase().indexOf('order by') === -1) {
			apply_default_sort_if_no_order_by_clause(res[0].values);
		}
		
		if(res.length !== 1) throw new Error('queryFactory solution found length not equal to 1, '+ sql);

		return {
			titles: res[0].columns, 
			rows: res[0].values,
			error: null,
		};

	} catch (e) {
		throw new Error('proto_queryFactory_getSolutionResults error "'+e +'", for SQL ' + sql);
	}
	

}



/*
	Returns columns and rows for the client

	Can be run on the server side or client side.
*/
async function proto_queryFactory_getClientResults(json: any, SQL: any): Promise<{ rows: any[], titles: string[], error: string | null }> {
	const db = new SQL.Database();
	let res;

	// Don't run query if there isn't a client SQL statement.
	if(	typeof json.client_sql === 'undefined' ||
		json.client_sql === null ||
		json.client_sql.length < 2) 
			return { titles: [], rows: [], error: null };

	// Run query
	try {
		// Create sql database
		db.exec(return_create_tables(json));
		db.exec(return_insert_intos(json));
		
		// Run query
		res = db.exec(json.client_sql);

		// Look to see if we should re-order the results.
		// Can be an issue if the server v. client happens to choose a different sort order.
		if(json.client_sql.toLowerCase().indexOf('order by') === -1) {
			apply_default_sort_if_no_order_by_clause(res[0].values);
		}

	} catch (e: any) {
		let message = '';
		if(typeof e === 'string') {
			message = 'Error ' + e;
		} else if( e instanceof Error) {
			message = 'Error ' + e.message;
		} else {
			throw new Error('Invalid option for proto_queryfacotry_getclientresults')
		}
		return { titles: [], rows: [], error: message };
	}

	// Results can zero at this point, for example WHERE false 
	if(res.length !== 1) {
		return { titles: [], rows: [], error: 'No records returned'};	
	}

	return {
		titles: res[0].columns, 
		rows: res[0].values,
		error: null,
	};

}

async function queryFactory_getClientResults(json: any): Promise<{ rows: any[], titles: string[], error: string | null }> {
	const SQL = await getInitSqlJs()
	return proto_queryFactory_getClientResults(json, SQL);
}


export { 
		queryFactory_getClientResults,
		proto_queryFactory_getSolutionResults, proto_queryFactory_getClientResults 
	};