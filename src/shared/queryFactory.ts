/*
	queryFactory is used to generate SQL results
	This is a modification of queryFActory_client, which defines the basic prototypes
	That one returns a version of SQL that we can override the SQL result.
*/

import initSqlJs from 'sql.js';
import { proto_queryFactory_getClientResults, proto_queryFactory_getSolutionResults } from './queryFactory_client';



async function getInitSqlJs() {

	// If Window is defined, then we are in a browser.
	if(typeof window !== 'undefined') {
		// On the server.
		throw new Error('You can only call getInitSql from the server. Load queryFactory_client instead of queryFactory');
	} else {
		return await initSqlJs();
	}
}
/*
	Returns columns and rows for the solution

	Can only be run on the server side.
*/
async function queryFactory_getSolutionResults(json: any): Promise<{ rows: any[], titles: string[], error: string | null }> {
	const SQL = await getInitSqlJs()
	return await proto_queryFactory_getSolutionResults(json, SQL);
}


/*
	Returns columns and rows for the client

	Can be run on the server side or client side.
*/
async function queryFactory_getClientResults(json: any): Promise<{ rows: any[], titles: string[], error: string | null }> {
	const SQL = await getInitSqlJs()
	return await proto_queryFactory_getClientResults(json, SQL);	
}

export { queryFactory_getSolutionResults, queryFactory_getClientResults };