//@flow

const { MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } = require('./secret.js'); 
const { IfLevelModel } = require('./IfGame');
const mysql = require('promise-mysql');

const { sql01 } = require('./../../sql/sql01.js');
const { sql02 } = require('./../../sql/sql02.js');
const { sql03 } = require('./../../sql/sql03.js');
const { sql04 } = require('./../../sql/sql04.js');
const { sql05 } = require('./../../sql/sql05.js');
const { sql06 } = require('./../../sql/sql06.js');
const { sql07 } = require('./../../sql/sql07.js');
const { sql08 } = require('./../../sql/sql08.js');
const { sql09 } = require('./../../sql/sql09.js');
const { sql10 } = require('./../../sql/sql10.js');
const { sql11 } = require('./../../sql/sql11.js');
const { sql12 } = require('./../../sql/sql12.js');

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

	return conn;
}

async function run_mysql_query(sql: string, values?: Array<any>): Object {
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


	return { 'old_version': old_version, 'up_to_date': true };
}


/* Run the array of sql commands.
	@arg sql
*/
async function _update_update_version(sqls: Array<string> ): Promise<void> {
	for(let i=0; i<sqls.length; i++) {
		await get_mysql_connection().then( (conn: ConnectionT): mixed => {
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
	catch( e) {
		// since version table isn't created, assume 0 version.
		if(e.code === 'ER_NO_SUCH_TABLE') return 0; 
		throw new Error(e.code);
	}

}


async function _update_fix_bad_page_data6(): Promise<any> {
	const sql_select = 'SELECT * FROM iflevels';
	const sql_update = 'UPDATE iflevels SET pages = ? WHERE _id = ?';
	let select_results = await run_mysql_query(sql_select);

	let values = [];
	let ifLevel = null;

	// Remove any solution_feedback entries
	for(var i=0; i<select_results.length; i++) {
		ifLevel = new IfLevelModel(select_results[i]);

		ifLevel.pages = ifLevel.pages.map( p => {
			// Delete bad keys (used in earlier version of software)
			// $FlowFixMe
			if(p.solution_feedback) delete p.solution_feedback;
			
			// Delete unneeded tests to reduce file size.
			p.history = p.history.map( h => {
				if(typeof h.tests !== 'undefined') delete h.tests;
				return h;
			});

			// Rename "created" to server_created
			p.history = p.history.map( h => {
				if(h.code === 'created') h.code = 'server_created';
				return h;
			});

			return p;
		});

		values = [JSON.stringify(ifLevel.pages.map( (p: Object ): Object => p.toJson() )), ifLevel._id];
		let update_results = await run_mysql_query(sql_update, values);
		console.log(update_results); //update_results);
		//console.log(ifLevel.pages);
		//console.log(values);
	}
}



module.exports = {
	to_utc, 
	from_mysql_to_utc,
	from_utc_to_myql,
	is_faculty,
	get_mysql_connection, run_mysql_query,
	update_mysql_database_schema

};
