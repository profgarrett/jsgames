import { DEBUG, JWT_AUTH_SECRET, ADMIN_USERNAME } from './secret.js'; 
import { IfLevelSchema, IfLevelPagelessSchema } from './../shared/IfLevelSchema';
import { from_mysql_to_utc, run_mysql_query, is_db_unavailable_error } from './mysql';

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
	const new_json: IStringIndexJsonObject = {};

	// recursively iterate through.
	for(const property in input ) {
		if(input.hasOwnProperty(property)) {
			if(typeof input[property+'_visible'] !== 'undefined' && input[property+'_visible'] === false ) {
				// strip this property.
				//console.log('strip secret: ' + property);
			} else {
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
	const new_json: IStringIndexJsonObject = {};

	// recursively iterate through.
	for(const property in input ) {
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
	const clean_json = secure ? _strip_secrets(json) : json ;

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
		httpOnly: true,           // not readable by client JS (mitigates XSS cookie theft)
		sameSite: 'lax',          // sent on top-level navigations, not cross-site requests
		secure: !DEBUG,           // require HTTPS in production; allow http on localhost dev
	});

}


// Guard against a silent auth failure. cookie-session is configured with secure:true
// in production; if the proxy in front of us stops forwarding X-Forwarded-Proto then
// req.protocol is 'http', the cookie write throws inside cookie-session, and
// cookie-session catches and discards that error. Sessions then stop being written
// with no error anywhere. Warn once at startup rather than debugging it again later.
let _warned_insecure_proxy = false;

function session_refresh(req, res, next) {
	if(!DEBUG && !_warned_insecure_proxy && req.protocol !== 'https') {
		_warned_insecure_proxy = true;
		console.error(
			'FATAL-ish: req.protocol is "' + req.protocol + '" in production. The proxy is not ' +
			'sending X-Forwarded-Proto, so no session cookie can be set or cleared. ' +
			'Add `proxy_set_header X-Forwarded-Proto $scheme;` to the nginx /api/ location.');
	}

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

// Is the current session an admin? Single source of truth for the admin check.
function user_get_isadmin( req ): boolean {
	return req.session.username === ADMIN_USERNAME;
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
	req.session.isAdmin = username === ADMIN_USERNAME;
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



/*
	Serialize a thrown value for the log file.

	JSON.stringify(new Error('x')) is '{}' -- message, stack and code are all
	non-enumerable, so the old code wrote an empty object into log.txt for every real
	error. Pull the interesting fields off by hand first.
*/
function serialize_error_for_log(arg: any): string {
	if(arg instanceof Error) {
		const e: any = arg;
		const parts: any = {
			name: e.name,
			message: e.message,
			code: e.code,             // 'ECONNREFUSED', 'ER_PARSE_ERROR', ...
			error_code: e.error_code, // our own tag, eg 'DB_UNAVAILABLE'
			sqlMessage: e.sqlMessage,
			stack: e.stack,
		};
		if(e.cause) parts.cause = { message: e.cause.message, code: e.cause.code };

		return JSON.stringify(parts);
	}

	const maybe = JSON.stringify(arg);
	return typeof maybe === 'string' ? maybe : String(arg);
}

// If we're not debugging, throw all errors to log file.
const log_error = function (arg?: any) {
	if(DEBUG) {
		console.log(arg);
	} else {
		const logFile = fs.createWriteStream('log.txt', { flags: 'a' });
		const s = (new Date()).toISOString() + ' ' + serialize_error_for_log(arg) + '\n\n';
		logFile.write(s );
		//ogStdout.write(util.format.apply(null, arguments) + '\n');
	}
};


////////////////////////////////////////////////////////////////////////
// API error responses
////////////////////////////////////////////////////////////////////////

/*
	Copy shown to a student when the database is unreachable.

	Kept generic on purpose: this same text is used for a level save, a password reset
	and a login. The client adds the "so we can't log you in" clause for the specific
	action it was attempting (see src/app/components/Api.ts).
*/
const DB_UNAVAILABLE_MESSAGE =
	'The site\'s database is temporarily unavailable. This is a problem on our end, not with ' +
	'anything you typed. Please try again in a few minutes.';

const SERVER_ERROR_MESSAGE =
	'Something went wrong on our end. Please try again in a few minutes.';

type ApiErrorResponse = {
	status: number,
	headers: { [key: string]: string },
	body: {
		error_code: string,
		message: string,
		debug?: { message: string, code?: string, stack?: string },
	},
};

/*
	Turn a thrown value into the JSON body the API answers with.

	Pure, so it can be unit tested without standing up express or a database
	(see test/api_error_handling.test.cjs). app.ts wraps it in the error middleware.

	@param err   the value passed to next(e) / thrown by an async route
	@param debug true in development: adds the message and stack to the response
*/
function build_api_error_response(err: any, debug: boolean): ApiErrorResponse {
	const db_down = is_db_unavailable_error(err);

	const response: ApiErrorResponse = {
		status: db_down ? 503 : 500,
		// Ask well-behaved clients (and any proxy) to back off rather than hammer a
		// database that is already struggling.
		headers: db_down ? { 'Retry-After': '60' } : {},
		body: {
			error_code: db_down ? 'DB_UNAVAILABLE' : 'SERVER_ERROR',
			message: db_down ? DB_UNAVAILABLE_MESSAGE : SERVER_ERROR_MESSAGE,
		},
	};

	// Never in production: stacks in this project contain absolute filesystem paths.
	if(debug && err) {
		response.body.debug = {
			message: String(err.message || err),
			code: err.code,
			stack: err.stack,
		};
	}

	return response;
}

export {
	hash_password,
	is_matching_mysql_user,

	return_level_without,
	return_level_prepared_for_transmit,
	
	nocache,
	log_error,
	serialize_error_for_log,

	build_api_error_response,
	DB_UNAVAILABLE_MESSAGE,
	SERVER_ERROR_MESSAGE,

	session_initialize,
	session_refresh,

	user_logout,
	user_login,
	user_get_username_or_emptystring,
	user_get_isadmin,
	user_require_logged_in,
	user_require_admin,
};