/*
	queryFactory is used to generate SQL results
	Takes in a page and a query, and returns the results 
*/

//import { SqlJsStatic } from "sql.js";

//import initSqlJs from "sql.js";
//import initSqlJs from 'sql.js';


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
		for(let i = 0; i < json.t1_titles.length; i++) {
			lines_sub.push( json.t1_titles[i] + ' ' + 
					(json.t1_formats[i] === 'text' ? 'char' : 'real')
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
			lines.push(' ('+ json.t1_titles.join(', ') + ') ');
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

	const res = db.exec(json.solution_sql);
	if(res.length !== 1) throw new Error('queryFactory solution found length not equal to 1');

	return {
		titles: res[0].columns, 
		rows: res[0].values,
		error: null,
	};

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
		
	} catch (e: any) {
		let message = '';
		if(typeof e === 'string') {
			message = 'Error ' + e;
		} else if( e instanceof Error) {
			message = 'Error ' + e.message;
		} else {
			throw new Error('Invalid option for proto_queryfacotry_getclientresults')
		}
		//console.log(message);
		return { titles: [], rows: [], error: message };
	}

	// Bubble up this error.
	if(res.length !== 1) throw new Error('queryFactory client found length not equal to 1');

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