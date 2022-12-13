import { DEBUG, JWT_AUTH_SECRET, ADMIN_USERNAME } from './secret.js'; 
import { IfLevelSchema, IfLevelPagelessSchema } from './../shared/IfLevelSchema';
import { from_mysql_to_utc, run_mysql_query } from './mysql';

// @ts-ignore
import bcrypt from 'bcryptjs';
import fs from 'fs';

import cookieSession from 'cookie-session';

interface IStringIndexJsonObject {
	[key: string]: any
}

import type { Request, Response, NextFunction } from 'express';
import { config } from 'webpack';

////////////////////////////////////////////////////////////////////////
// Permission
////////////////////////////////////////////////////////////////////////


/*
	Remove the elements of JSON that start with 'solution'
	Can pass either an object or an array of results.
	
	If finding a property with prefix solution..., will look for matching solution..._visible.  
		If that is true, then send anyway. 

	@TODO: Remove any values in the template_values that are used in the solution and not shown in description or instruction.
	
	Test: 
		strip_secrets([{ x: 1, 'solution_show': 2, 'solution_show_visible': true, 'solution_hide': 2, 'solution_hide_visible': false }])
*/
const _strip_secrets = function(input: IStringIndexJsonObject): any {

	// if is null, then return null.  Don't convert a null value in an array into an object.
	if(input === null) return input;

	// Return basic items, which may be contained in arrays.
	if(typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') return input;

	// if an array, recurse.
	if( Array.isArray(input)) {
		return input.map(_strip_secrets);
	}
	
	// create a clean new object.
	let new_json: IStringIndexJsonObject = {};

	// recursively iterate through.
	for(let property in input ) {
		if(input.hasOwnProperty(property)) {
			if(property.substr(0,8) !== 'solution' 
				|| ( property.substr(0,8) === 'solution' && input[property+'_visible'] ) ) {

				if(Array.isArray(input[property])) {
					new_json[property] = _strip_secrets(input[property]);
				} else {
					new_json[property] = input[property];	
				}
			}
		}
	}
	return new_json;
};


// Returns pruned version of a level without the given attributes.
// Useful for cutting down on return size.
// Recursive.
// For example, without [ 'dt', 'o.x' ] will turn { dt:1, o:{x:2}} into { x:{} }
const return_level_without = (input: any, without: any): any => {

	// if is null, then return null.  Don't convert a null value in an array into an object.
	if(input === null) return input;

	// Return basic items, which may be contained in arrays.
	if(typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') return input;

	// if an array, recurse.
	if( Array.isArray(input)) {
		return input.map( i => return_level_without(i, without));
	}
	
	// create a clean new object.
	let new_json: IStringIndexJsonObject = {};

	// recursively iterate through.
	for(let property in input ) {
		if(input.hasOwnProperty(property)) {
			if(!without.includes(property)) {

				if(Array.isArray(input[property])) {
					new_json[property] = return_level_without(input[property], without);
				} else {
					new_json[property] = input[property];	
				}
			}
		}
	}
	return new_json;
};

// Convenience function for cleaning up and preparing a level for returning.
// Includes both removing secrets, as well as converting dates to UTC format.
// @level_or_levels can deal with being either an array or a single item.
const return_level_prepared_for_transmit = (level: any, secure: boolean): any => {
	// Do not accept IfLevels. Instead, need json.
	if(!(level instanceof IfLevelSchema || level instanceof IfLevelPagelessSchema)) {
		throw new Error('Should submit IfLevel, not JSON');
	}
	if(typeof secure === 'undefined') throw Error('Secure level network/return_level_prepared_for_transmit?');

	const json = level.toJson();
	let clean_json = false /*secure*/ ? _strip_secrets(json) : json ;

	clean_json.updated = from_mysql_to_utc(clean_json.updated); 
	clean_json.created = from_mysql_to_utc(clean_json.created); 

	return clean_json;
};


////////////////////////////////////////////////////////////////////////
// Authentication
////////////////////////////////////////////////////////////////////////

/**
 * Starts middleware for session handling.
 * 
 * Use as app.user(initialize_session())
 */
function session_initialize() {
	return cookieSession({
		name: 'session',
		keys: [ JWT_AUTH_SECRET ],
		maxAge: 356 * 24 * 60 * 60 * 1000, // 356 days
		httpOnly: false,
	});

}


function session_refresh(req, res, next) {
	req.session.nowInMinutes = Math.floor(Date.now() / 60e3)
	next()
}

// Find the current username.
function user_get_username_or_emptystring(req, res): string {
	const username = req.session.username || '';
	return username;
	/*
	let result = {};

	try {
		result = jwt.verify(token, JWT_AUTH_SECRET);
	} catch (e: any) {
		if(e.name === 'TokenExpiredError') {
			user_logout(req, res);
			return '';
		}
	}

	// @ts-ignore
	if(typeof result.username === 'string') return result.username;
	return '';
	*/
}

// Logout user.
function user_logout(req, res) {
	req.session = null;
	/*
	res.clearCookie('x-access-token');
	res.clearCookie('x-access-token-refreshed');
	res.clearCookie('x-access-token-username');
	res.clearCookie('username');
	res.clearCookie('is-admin');
	*/
}


/**
	Middleware requiring the user to be an admin.
*/
function user_require_admin( req, res, next: NextFunction): any {
	if( 	req.session.username != '' && 
			req.session.username == ADMIN_USERNAME ) {
		 next();
	} else {
		return res.sendStatus(401);
	}
}

/**
	Middleware requiring the user to be logged in.

	Fails with 401 error if not logged in.
*/
function user_require_logged_in(req, res: Response, next: NextFunction): any {
	
	// Make sure that there is a username defined and longer then ''
	if(typeof req.session.username != 'undefined' && req.session.username !== '') {
		next();
	} else {
		return res.sendStatus(401);
	}

	//?next('route');

	/*
	Old authentication settings
	const username = get_username_or_emptystring(req, res);
	const options = {
		maxAge: 3*2600000, 
		httpOnly: true,
	};

	// Refresh login token
	if(username !== '') {
		const token = jwt.sign({ username: username }, JWT_AUTH_SECRET, { expiresIn: JWT_EXPIRE_SECONDS });
		const last = (new Date()).toString().replace(/ /g, '_').replace('(', '').replace(')', '').replace(/:/g,'_').replace(/-/g, '_');
		res.cookie('x-access-token', token, options);
		res.cookie('x-access-token-username', username, options);
		res.cookie('x-access-token-refreshed', last, options);

		// Perms. Used on client side to enable/hide interface.
		res.cookie('is-admin', ADMIN_USERNAME === username ? 'True' : 'False', options );
		
		return next();
	} 

	// username is null.  Send invalid request.
	return res.sendStatus(401);
	*/
}


// Log the user in.
async function user_login(username: string, password: string, req, res) {
	req.session.username = username;
	req.session.isAdmin = username == ADMIN_USERNAME;
	/*
	const options = {
		maxAge: 3*2600000,
		httpOnly: true
	};
	// We have a proper user.  Continue!
	const un = username.trim().toLowerCase();
	let jwt_token = jwt.sign({ username: un }, JWT_AUTH_SECRET, { expiresIn: 864000 });
	const last = (new Date()).toString().replace(/ /g, '_').replace('(', '').replace(')', '').replace(/:/g,'_').replace(/-/g, '_');

	res.cookie('x-access-token', jwt_token, options);
	res.cookie('x-access-token-username', username, options);
	res.cookie('x-access-token-refreshed', last, options);

	// Perms. Used on client side to enable/hide interface.
	res.cookie('is-admin', ADMIN_USERNAME === username ? 'True' : 'False' );
	res.cookie('username', username );
	*/
}




function hash_password(password: string): string {
	return bcrypt.hashSync(password, 8);
}


// See if there is a matching user in the database.
async function is_matching_mysql_user(username: string, password: string): Promise<any> {
	//const hashed_password = bcrypt.hashSync(password, 8);

	const select_sql = 'SELECT iduser, hashed_password FROM users WHERE username = ?';
	const select_results = await run_mysql_query(select_sql, [username]);
	
	if(select_results.length !== 1) return false;

	// We have a user. Test password
	return bcrypt.compareSync(password, select_results[0].hashed_password);
}




// Force responses to not be cached. Since we don't serve actual files, and just API requests,
// and those update, if a browser caches a response they may not stale/incorrect data later.
// @Thanks to https://stackoverflow.com/questions/20429592/no-cache-in-a-nodejs-server
function nocache(req: Request, res: Response, next: NextFunction) {
	res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	res.header('Expires', '-1');
	res.header('Pragma', 'no-cache');
	next();
}



// If we're not debugging, throw all errors to log file.
const log_error = function (arg?: any) {
	if(DEBUG) {
		console.log(arg);
	} else {
		let logFile = fs.createWriteStream('log.txt', { flags: 'a' });
		let maybe = JSON.stringify(arg);
		let s = typeof maybe !== 'string' ? 'Unknown error' : maybe + '\n\n';
		logFile.write(s );
		//ogStdout.write(util.format.apply(null, arguments) + '\n');
	}
};

export {
	hash_password,
	is_matching_mysql_user,

	return_level_without,
	return_level_prepared_for_transmit,
	
	nocache,
	log_error,

	session_initialize,
	session_refresh,

	user_logout,
	user_login,
	user_get_username_or_emptystring,
	user_require_logged_in,
	user_require_admin,
};