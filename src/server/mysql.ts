import { MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } from './secret.js'; 
import { IfLevelSchema, LEVEL_DERIVED_PROPS_VERSION } from './../shared/IfLevelSchema';
import mysql from 'promise-mysql';

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

/**
	Initialize MYSQL with credentials from secret.js.

	Options:
		timezone: 
			This sets all server date/times to UTC.  The client always sends date in UTC int format.
			Without this setting, if MYSQL has a different date/time zone it'll convert the input.  
*/

// Create a new flow definition for MYSQL, as we are using a version providing Promises.
declare type ConnectionT = {
	then: Function,
	query: Function,
	end: Function
};
declare type MysqlErrorT = {
	code: string,
	sqlMessage: string
};

function get_mysql_connection(): ConnectionT {
	
	let conn = mysql.createConnection({
		host: MYSQL_HOST,
		user: MYSQL_USER,
		password: MYSQL_PASSWORD,
		database: MYSQL_DATABASE,
		timezone: '+0000'
	});

	// @ts-ignore
	return conn;
}

async function run_mysql_query(sql: string, values?: Array<any>) {
	let results = await get_mysql_connection().then( (conn: ConnectionT): Array<Object> => {
		let r = conn.query(sql, values);
		conn.end();
		return r;
	});
	return results;
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
	let dt = new Date(dt_or_string);

	return to_utc(dt);
};

// Convert a utc int value into a textual format usable for inserting into mysql
const from_utc_to_myql = (i: number): string => {
	let dt = new Date(i);

	// pull out the T and replace with a space.
	let mysql = dt.toISOString().slice(0, 19).replace('T', ' ');

	return mysql;
};

// Convert a date to a UTC int value (milliseconds from epoch)
// Used prior to sending any dates to client.
const to_utc = (dt: Date): number => {
	if(!(dt instanceof Date)) {
		throw new Error(dt + ' is not an instance of date, but instead ' + typeof dt);
	}
	let int = Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate(), 
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

	await _update_all_levels_to_latest_props();
	
	return { 'old_version': old_version, 'up_to_date': true };
}


/* Run the array of sql commands.
	@arg sql
*/
async function _update_update_version(sqls: Array<string> ): Promise<void> {
	for(let i=0; i<sqls.length; i++) {
		await get_mysql_connection().then( (conn: ConnectionT) => {
			return conn.query(sqls[i]);
		});
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
		let result = await run_mysql_query(sql);
		return result[0].idversion;
	}
	catch( e: any ) {
		// since version table isn't created, assume 0 version.
		if(e.code === 'ER_NO_SUCH_TABLE') return 0; 
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
	let values = [
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
	let select_results = await run_mysql_query(sql_select);

	let values: any[] = [];
	let ifLevel: IfLevelSchema;
	let json;

	// Remove any solution_feedback entries
	for(var i=0; i<select_results.length; i++) {
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
		let update_results = await run_mysql_query(sql_update, values);
		//console.log(update_results); //update_results);
		//console.log(ifLevel.pages);
		//console.log(values);
	}
}



export {
	to_utc, from_mysql_to_utc, from_utc_to_myql,
	is_faculty,
	get_mysql_connection, run_mysql_query,
	update_mysql_database_schema,
	update_level_in_db,
};
