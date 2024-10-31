/*
	queryFactory is used to generate SQL results
	This is a modification of queryFactory_client, which defines the basic prototypes
	That one returns a version of SQL that we can override the SQL result.

	We have two separate versions, so that we can run one on the client and one on the server.
	As of 6/5/23, only being run on the server, so isn't strictly needed.
*/

import initSqlJs from 'sql.js';
import { proto_queryFactory_getClientResults, 
		 proto_queryFactory_getSolutionResults } from './queryFactory_client';
//import { debug } from 'webpack';


/** 
 * Update the page with the results of the query.
 */
async function queryFactory_updateClientResults(page: { client_results_rows: any[], 
														client_feedback: any[], 
														client_results_titles: any[],
														updateCorrect: () => void },
												refresh_client_results_regardless_of_non_null_prior_results: boolean = true) {
	// Look to see if results are null.
	// This is automatically done by the IfPageSqlSchema.updateUserFields,
	// showing that the server should re-generated the results and check for correctness. 
	if(refresh_client_results_regardless_of_non_null_prior_results 
			|| page.client_results_rows === null 
			|| page.client_results_titles === null) {
		let results = await queryFactory_getClientResults(page);
		page.client_results_rows = results.rows;
		page.client_results_titles = results.titles;
		page.client_feedback = [];
		if(results.error !== null) page.client_feedback.push(results.error);
		page.updateCorrect();
	}
}


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

export { queryFactory_getSolutionResults, queryFactory_getClientResults, queryFactory_updateClientResults };