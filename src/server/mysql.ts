import { MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, MYSQL_DEBUG_QUERIES, DEBUG } from './secret.js'; 
import { IfLevelSchema, LEVEL_DERIVED_PROPS_VERSION } from './../shared/IfLevelSchema';
//import mysql from 'promise-mysql';

import { sql01 } from './../../sql/sql01.js';
import { sql02 } from './../../sql/sql02.js';
import { sql03 } from './../../sql/sql03.js';
import { sql04 } from './../../sql/sql04.js';
import { sql05 } from './../../sql/sql05.js';
import { sql06 } from './../../sql/sql06.js';
import { sql07 } from './../../sql/sql07.js';
import { sql08 } from './../../sql/sql08.js';
import { sql09 } from './../../sql/sql09.js';
import { sql10 } from './../../sql/sql10.js';
import { sql11 } from './../../sql/sql11.js';
import { sql12 } from './../../sql/sql12.js';
import { sql13 } from './../../sql/sql13.js';
import { sql14 } from './../../sql/sql14.js';
import { sql15 } from './../../sql/sql15.js';
import { sql16 } from './../../sql/sql16.js';
import { sql17 } from './../../sql/sql17.js';
import { sql18 } from './../../sql/sql18.js';
import { sql19 } from './../../sql/sql19.js';
import { sql20 } from './../../sql/sql20.js';
import { sql21 } from './../../sql/sql21.js';
import { sql22 } from './../../sql/sql22.js';
import { sql23 } from './../../sql/sql23.js';
import { sql24 } from './../../sql/sql24.js';
import { sql25 } from './../../sql/sql25.js';
import { sql26 } from './../../sql/sql26.js';
import { sql27 } from './../../sql/sql27.js';


/**
	Initialize MYSQL with credentials from secret.js.

	Options:
		timezone: 
			This sets all server date/times to UTC.  The client always sends date in UTC int format.
			Without this setting, if MYSQL has a different date/time zone it'll convert the input.  
*/

// Create a new flow definition for MYSQL, as we are using a version providing Promises.
/*
declare type ConnectionT = {
	then: Function,
	query: Function,
	end: Function
};
declare type MysqlErrorT = {
	code: string,
	sqlMessage: string
};
*/
import mysql from 'mysql2/promise';


////////////////////////////////////////////////////////////////////////
// Database availability
////////////////////////////////////////////////////////////////////////

/*
	Tell "the database is unreachable" apart from "this query is broken".

	Everything in this set means the daemon could not be talked to at all (it is
	stopped, the host/port is wrong, the credentials or database name are wrong, the
	connection was dropped mid-flight). None of them are the caller's fault, and all of
	them should turn into a 503 with a human message rather than a 500 stack trace.

	A syntax error or a bad column name is NOT in this set: that is a bug in our code,
	and it should keep bubbling up as a plain 500 so it stays noisy.
*/
const DB_UNAVAILABLE_CODES: Set<string> = new Set([
	'ECONNREFUSED',            // nothing listening (mysqld stopped)
	'ETIMEDOUT',               // host unreachable / firewalled
	'ENOTFOUND',               // MYSQL_HOST does not resolve
	'EHOSTUNREACH',
	'ENETUNREACH',
	'ECONNRESET',
	'EPIPE',
	'PROTOCOL_CONNECTION_LOST',    // server closed the connection
	'PROTOCOL_SEQUENCE_TIMEOUT',
	'ER_CON_COUNT_ERROR',          // too many connections
	'ER_ACCESS_DENIED_ERROR',      // wrong user/password in secret.js
	'ER_BAD_DB_ERROR',             // database does not exist
	'ER_DBACCESS_DENIED_ERROR',
	'ER_SERVER_SHUTDOWN',
	'ER_NO_SUCH_TABLE',            // schema never installed; site cannot work
]);

/*
	Deliberately a tagged plain Error rather than a `class ... extends Error`.

	Babel transpiles this project down to ES5 (browserslist still lists IE 10), and an
	ES5-transpiled subclass of a builtin breaks `instanceof`. A boolean property that
	survives any transpile target is boring and always works. Check it with
	is_db_unavailable_error() rather than by hand.
*/
type DatabaseUnavailableError = Error & {
	db_unavailable: true,
	error_code: 'DB_UNAVAILABLE',
	cause?: any,
};

function make_db_unavailable_error(cause: any): DatabaseUnavailableError {
	const code = cause && cause.code ? cause.code : 'unknown';
	const e = new Error('The database is unavailable (' + code + ')') as DatabaseUnavailableError;

	e.db_unavailable = true;
	e.error_code = 'DB_UNAVAILABLE';
	e.cause = cause;

	return e;
}

/*
	True when this error means the database itself could not be reached.
	Accepts either an error already wrapped by run_mysql_query, or a raw mysql2 error.
*/
function is_db_unavailable_error(e: any): boolean {
	if(!e) return false;
	if(e.db_unavailable === true) return true;

	return typeof e.code === 'string' && DB_UNAVAILABLE_CODES.has(e.code);
}

/*
	Cheapest possible round trip to the database. Used by /api/health and by the
	startup check in app.ts. Throws (a DatabaseUnavailableError) when the DB is down.
*/
async function db_ping(): Promise<boolean> {
	await run_mysql_query('SELECT 1');
	return true;
}


/**
 * Execute a MYSQL query synchronously.
 * 
 * @param sql Query
 * @param values Array of values to insert into the query for each ? placeholder.
 * @returns Either an array of results, an empty array, or insertId if an insert, affectedRows if not a select.
 */
async function run_mysql_query(sql: string, values?: Array<any>): Promise<Array<any>| any> {
	let connection: mysql.Connection | null = null;
	let queryResults: Array<any> = [];
	if(!sql || sql.length === 0) {
		throw new Error('SQL query is empty');
	}

	try {
		connection = await mysql.createConnection({
			host: MYSQL_HOST,
			user: MYSQL_USER,
			password: MYSQL_PASSWORD,
			database: MYSQL_DATABASE,
		});

		if(MYSQL_DEBUG_QUERIES) {
			console.log('Running query: ' + sql);
			if(values) console.log('With values: ' + JSON.stringify(values));
		}

		const [results, fields] = await connection.query(sql, values);
		queryResults = results as Array<any>;
		
	} catch (error: any) {
		if(DEBUG) {
			console.error('Error in run_mysql_query: ' + error.code + ' ' + error.sqlMessage);
		}

		// Connection-level failures get tagged here, in the one place every query passes
		// through, so callers (and the error handler in app.ts) can answer 503 instead of
		// leaking a 500 stack trace. Query bugs are rethrown untouched.
		if(is_db_unavailable_error(error)) throw make_db_unavailable_error(error);

		throw error;
	} finally {
		// If we have a connection, close it.
		if(connection && connection.end) {
			await connection.end();
		}
	}

	return queryResults;
}



/**
	Mysql is irritating with date handling.
		When inserting a new object, then date is string format.
		When updating, a date object. 
	This function deals with both and returns a UTC int

	@dt_or_string
*/
const from_mysql_to_utc = (dt_or_string: Date | string): number => {
	if(dt_or_string instanceof Date) {
		return to_utc(dt_or_string);
	}
	const dt = new Date(dt_or_string);

	return to_utc(dt);
};

// Convert a utc int value into a textual format usable for inserting into mysql
const from_utc_to_myql = (i: number): string => {
	const dt = new Date(i);

	// pull out the T and replace with a space.
	const mysql = dt.toISOString().slice(0, 19).replace('T', ' ');

	return mysql;
};

// Convert a date to a UTC int value (milliseconds from epoch)
// Used prior to sending any dates to client.
const to_utc = (dt: Date): number => {
	if(!(dt instanceof Date)) {
		throw new Error(dt + ' is not an instance of date, but instead ' + typeof dt);
	}
	const int = Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate(), 
			dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds());
	
	return int;
};


////////////////////////////////////////////////////////////////////////
// Schema Update
////////////////////////////////////////////////////////////////////////

async function update_mysql_database_schema(): Promise<any> {
	const old_version = await _update_get_version();

	if(old_version < 1) await _update_update_version( sql01 );
	if(old_version < 2 ) await _update_update_version( sql02 );
	if(old_version < 3 ) await _update_update_version( sql03 );
	if(old_version < 4 ) await _update_update_version( sql04 );
	if(old_version < 5 ) await _update_update_version( sql05 );
	if(old_version < 6 ) {
		// Prune some bad data from earlier schemas.
		await _update_fix_bad_page_data6();
		await _update_update_version( sql06 );
	}
	if(old_version < 7 ) await _update_update_version( sql07 );
	if(old_version < 8 ) await _update_update_version( sql08 );
	if(old_version < 9 ) await _update_update_version( sql09 );
	if(old_version < 10 ) await _update_update_version( sql10 );
	if(old_version < 11 ) await _update_update_version( sql11 );
	if(old_version < 12 ) await _update_update_version( sql12 );
	if(old_version < 13 ) await _update_update_version( sql13 );
	if(old_version < 14 ) await _update_update_version( sql14 );
	if(old_version < 15 ) await _update_update_version( sql15 );
	if(old_version < 16 ) await _update_update_version( sql16 );
	if(old_version < 17 ) await _update_update_version( sql17 );
	if(old_version < 18 ) await _update_update_version( sql18 );
	if(old_version < 19 ) await _update_update_version( sql19 );
	if(old_version < 20 ) await _update_update_version( sql20 );
	if(old_version < 21 ) await _update_update_version( sql21 );
	if(old_version < 22 ) await _update_update_version( sql22 );
	if(old_version < 23 ) await _update_update_version( sql23 );
	if(old_version < 24 ) await _update_update_version( sql24 );
	if(old_version < 25 ) await _update_update_version( sql25 );
	if(old_version < 26 ) await _update_update_version( sql26 );
	if(old_version < 27 ) await _update_update_version( sql27 );

	await _update_all_levels_to_latest_props();
	
	return { 'old_version': old_version, 'up_to_date': true };
}


/* Run the array of sql commands.
	@arg sql
*/
async function _update_update_version(sqls: Array<string> ): Promise<void> {
	for(let i=0; i<sqls.length; i++) {
		try {
			const result = await run_mysql_query(sqls[i]);
			if(MYSQL_DEBUG_QUERIES) {
				console.log('Update query ' + i + ' completed: ' + result);
			}
		} catch (e: any) {
			console.error('Error in update query ' + i + ': ' + e.code + ' ' + e.sqlMessage);
			throw new Error('Error in update query ' + i + ': ' + e.code + ' ' + e.sqlMessage);
		}
	}
}


// Make sure that the current logged in user has the faculty role.
async function is_faculty(username: string): Promise<any> {

	const role_sql = `SELECT distinct	users.iduser, users.username, users_sections.role
		FROM users 
			INNER JOIN users_sections 
				ON users.iduser = users_sections.iduser
		        AND users_sections.role = 'faculty'
		WHERE username = ?`;
	const roles = await run_mysql_query(role_sql, [username]);
	
	return (roles.length === 1);
}

/*
	What is the current version of the DB?
	Looks at schema_version table.
*/
async function _update_get_version(): Promise<any> {
	const sql = 'select max(idversion) as idversion from schema_version';

	try {
		const result = await run_mysql_query(sql);
		return result[0].idversion;
	}
	catch( e: any ) {
		// if version table isn't created, assume 0 version.
		if(e.code === 'ER_NO_SUCH_TABLE'){ 
			console.log('No table found, assuming need to install');
			return 0;
		}
		console.error('Error in _update_get_version: ' + e.code + ' ' + e.sqlMessage);
		throw new Error(e.code);
	}
}



/*
	Used to update a single level in the database.
*/
async function update_level_in_db(level: IfLevelSchema ): Promise<any> {
	const sql_update = `UPDATE iflevels 
			SET completed = ?, 
				pages = ?, 
				history = ?, 
				updated = ?,
				props = ?,
				props_version = ?
				
			WHERE _id = ? AND username = ?`;
	
	// need to refresh before saving. Otherwise, this will be set to the old mysql version.
	// Derived props are only updated by MYSQL functions prior to saving, not by the object itself during updates.
	level.refresh_derived_props();

	const props = JSON.stringify(level.props.toJson());

	// Note: Use pages.toJson() to make sure that they properly convert to json.
	const values = [
		level.completed ? 1 : 0, 
		JSON.stringify(level.pages.map( (p: any ): any => p.toJson() )), 
		JSON.stringify(level.history), 
		from_utc_to_myql(to_utc(level.updated)), 
		props,
		level.props_version,
		level._id,
		level.username
	];

	return await run_mysql_query(sql_update, values);
}


/*
	Retrieve all levels with old versions of the props.
	Update to latest version. May take a long time during upgrades.
*/
async function _update_all_levels_to_latest_props(): Promise<any> {

	// Function currently disabled due to issues updating on dreamhost
	return false;
	console.log('Updating old props');
	const sql_old_levels = 'select * from iflevels WHERE props_version is null or props_version < ?';
	
	let level: IfLevelSchema;

	const select_results = await run_mysql_query(sql_old_levels, [ LEVEL_DERIVED_PROPS_VERSION ]);
	console.log(`Beginning to update ${select_results.length} records`);

	for(let i=0; i<select_results.length; i++ ) {
		level = new IfLevelSchema(select_results[i]);
		console.log(`Updating ${level._id}`)
		await update_level_in_db(level);
	};
	console.log('Ended update');
}


async function _update_fix_bad_page_data6(): Promise<any> {
	const sql_select = 'SELECT * FROM iflevels';
	const sql_update = 'UPDATE iflevels SET pages = ? WHERE _id = ?';
	const select_results = await run_mysql_query(sql_select);

	let values: any[] = [];
	let ifLevel: IfLevelSchema;
	let json;

	// Remove any solution_feedback entries
	for(let i=0; i<select_results.length; i++) {
		ifLevel = new IfLevelSchema(select_results[i]);

		ifLevel.pages = ifLevel.pages.map( (p: any) => {
			// Delete bad keys (used in earlier version of software)
			// $FlowFixMe
			if(p.solution_feedback) delete p.solution_feedback;
			
			// Delete unneeded tests to reduce file size.
			p.history = p.history.map( (h: any) => {
				if(typeof h.tests !== 'undefined') delete h.tests;
				return h;
			});

			// Rename "created" to server_created
			p.history = p.history.map( (h: any) => {
				if(h.code === 'created') h.code = 'server_created';
				return h;
			});

			return p;
		});
		json = ifLevel.pages.map( (p: any ): any => p.toJson() )
		values = [JSON.stringify(json), ifLevel._id];
		const update_results = await run_mysql_query(sql_update, values);
		//console.log(update_results); //update_results);
		//console.log(ifLevel.pages);
		//console.log(values);
	}
}



export {
	to_utc, from_mysql_to_utc, from_utc_to_myql,
	is_faculty,
	run_mysql_query,
	db_ping,
	is_db_unavailable_error,
	make_db_unavailable_error,
	DB_UNAVAILABLE_CODES,
	update_mysql_database_schema,
	update_level_in_db,
};
