//     
const { JWT_AUTH_SECRET } = require('./secret.js'); 
const { IfLevelModel } = require('./IfGame');
const { from_mysql_to_utc, run_mysql_query } = require('./mysql');
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const JWT_EXPIRE_SECONDS = 60*60*24*300; // 300 days.

const { DEBUG } = require('./secret.js'); 
const fs = require('fs');
const util = require('util');



                                                                 

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
const _strip_secrets = function(input        )         {

	// if is null, then return null.  Don't convert a null value in an array into an object.
	if(input === null) return input;

	// Return basic items, which may be contained in arrays.
	if(typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') return input;

	// if an array, recurse.
	if( Array.isArray(input)) {
		return input.map(_strip_secrets);
	}
	
	// create a clean new object.
	let new_json = {};

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
let return_level_without = (input, without) => {

	// if is null, then return null.  Don't convert a null value in an array into an object.
	if(input === null) return input;

	// Return basic items, which may be contained in arrays.
	if(typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') return input;

	// if an array, recurse.
	if( Array.isArray(input)) {
		return input.map( i => return_level_without(i, without));
	}
	
	// create a clean new object.
	let new_json = {};

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
const return_level_prepared_for_transmit = (level        , secure         )         => {
	// Do not accept IfLevels. Instead, need json.
	if(!(level instanceof IfLevelModel)) {
		throw new Error('Should submit IfLevel, not JSON');
	}
	if(typeof secure === 'undefined') throw Error('Secure level network/return_level_prepared_for_transmit?');

	const json = level.toJson();
	let clean_json = secure ? _strip_secrets(json) : json ;

	clean_json.updated = from_mysql_to_utc(clean_json.updated); 
	clean_json.created = from_mysql_to_utc(clean_json.created); 

	return clean_json;
};


////////////////////////////////////////////////////////////////////////
// Authentication
////////////////////////////////////////////////////////////////////////


// Find the current username.
// Side effect of logging the user out if the token has expired.
function get_username_or_emptystring(req          , res           )         {
	const token = req.cookies['x-access-token'];
	let result = {};
	if (!token) return '';

	if(typeof res === 'undefined') {
		throw new Error('undefined res for get_username_or_emptystring');
	}

	try {
		result = jwt.verify(token, JWT_AUTH_SECRET);
	} catch (e) {
		if(e.name === 'TokenExpiredError') {
			logout_user(req, res);
			return '';
		}
	}

	result = (result     ); // cast to fix flow issue converting mixed -> object.
	result = (result                     );

	if(typeof result.username === 'string') return result.username;
	return '';
}

// Logout user.
function logout_user(req          , res           ) {
	res.clearCookie('x-access-token');
	res.clearCookie('x-access-token-refreshed');
	res.clearCookie('x-access-token-username');
	res.clearCookie('iduser');
	res.clearCookie('is-admin');
	res.clearCookie('is-teacher');
}

/**
	Middleware requiring the user to be logged in.

	Fails with 401 error if not logged in.
*/
function require_logged_in_user(req          , res           , next              )      {
	const username = get_username_or_emptystring(req, res);
	
	// Refresh login token
	if(username !== '') {
		const token = jwt.sign({ username: username }, JWT_AUTH_SECRET, { expiresIn: JWT_EXPIRE_SECONDS });
		const last = (new Date()).toString().replace(/ /g, '_').replace('(', '').replace(')', '').replace(/:/g,'_').replace(/-/g, '_');
		res.cookie('x-access-token', token);
		res.cookie('x-access-token-username', username);
		res.cookie('x-access-token-refreshed', last);

		// Perms. Used on client side to enable/hide information.
		// @TODO Permissions
		// res.cookie('iduser', '?');
		// res.cookie('is-admin', 'False');
		// res.cookie('is-teacher', 'False');
		
		return next();
	} 

	// username is null.  Send invalid request.
	return res.sendStatus(401);
}


function hash_password(password        )         {
	return bcrypt.hashSync(password, 8);
}


// See if there is a matching user in the database.
async function is_matching_mysql_user(username        , password        )      {
	const hashed_password = bcrypt.hashSync(password, 8);

	const select_sql = 'SELECT iduser, hashed_password FROM users WHERE username = ?';
	const select_results = await run_mysql_query(select_sql, [username]);
	console.log(select_results);
	if(select_results.length !== 1) return false;

	// We have a user. Test password
	return bcrypt.compareSync(password, select_results[0].hashed_password);
}


// Log the user in.
async function login_user(username        , password        , res           )      {
	// We have a proper user.  Continue!
	let jwt_token = jwt.sign({ username: username }, JWT_AUTH_SECRET, { expiresIn: 864000 });
	const last = (new Date()).toString().replace(/ /g, '_').replace('(', '').replace(')', '').replace(/:/g,'_').replace(/-/g, '_');

	res.cookie('x-access-token', jwt_token);
	res.cookie('x-access-token-username', username);
	res.cookie('x-access-token-refreshed', last);


	// Perms. Used on client side to enable/hide information.
	//res.cookie('iduser', '?');
	//res.cookie('is-admin', 'False');
	//res.cookie('is-teacher', 'False');

}



// Force responses to not be cached. Since we don't server actual files, and just API requests,
// and those update, if a browser caches a response they may not stale/incorrect data later.
// @Thanks to https://stackoverflow.com/questions/20429592/no-cache-in-a-nodejs-server
function nocache(req          , res           , next              ) {
	res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	res.header('Expires', '-1');
	res.header('Pragma', 'no-cache');
	next();
}



// If we're not debugging, throw all errors to log file.
const log_error = function (arg      ) {
	if(DEBUG) {
		console.log(arg);
	} else {
		let logFile = fs.createWriteStream('log.txt', { flags: 'a' });
		logFile.write(util.format.apply(null, arguments) + '\n');
		//ogStdout.write(util.format.apply(null, arguments) + '\n');
	}
};

module.exports = {
	logout_user,
	hash_password,
	return_level_without,
	return_level_prepared_for_transmit,
	get_username_or_emptystring,
	require_logged_in_user,
	is_matching_mysql_user,
	login_user,
	nocache,
	log_error
};