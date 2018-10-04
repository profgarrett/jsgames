//     
const { JWT_AUTH_SECRET, USER_CREATION_SECRET } = require('./secret.js'); 
const { IfLevelModel } = require('./IfGame');
const { from_mysql_to_utc, run_mysql_query } = require('./mysql');
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

                                                                 

////////////////////////////////////////////////////////////////////////
// Permission
////////////////////////////////////////////////////////////////////////


/*
	Remove the elements of JSON that start with 'solution'
	Can pass either an object or an array of results.
	
	If finding a property with prefix solution..., will look for matching solution..._visible.  
		If that is true, then send anyway. 

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
const return_level_prepared_for_transmit = (level        )         => {
	// Do not accept IfLevels. Instead, need json.
	if(level instanceof IfLevelModel) {
		throw new Error('Should submit json instead of IfLevel');
	}

	let clean_level = _strip_secrets(level);

	clean_level.updated = from_mysql_to_utc(clean_level.updated); 
	clean_level.created = from_mysql_to_utc(clean_level.created); 

	return clean_level;
};


////////////////////////////////////////////////////////////////////////
// Authentication
////////////////////////////////////////////////////////////////////////


// Find the current username.
function get_username_or_emptystring(req          )         {
	const  token = req.cookies['x-access-token'];
	if (!token) return '';

	let result = jwt.verify(token, JWT_AUTH_SECRET);
	result = (result     ); // cast to fix flow issue converting mixed -> object.
	result = (result                     );

	if(typeof result.username === 'string') return result.username;
	return '';
}

/**
	Middleware requiring the user to be logged in.

	Fails with 401 error if not logged in.
*/
function require_logged_in_user(req          , res           , next              )      {
	const username = get_username_or_emptystring(req);
	
	// Refresh login token
	if(username !== '') {
		const token = jwt.sign({ username: username }, JWT_AUTH_SECRET, { expiresIn: 864000 });
		const last = (new Date()).toString().replace(/ /g, '_').replace('(', '').replace(')', '').replace(/:/g,'_').replace(/-/g, '_');
		res.cookie('x-access-token', token);
		res.cookie('x-access-token-username', username);
		res.cookie('x-access-token-refreshed', last);
		return next();
	} 

	// username is null.  Send invalid request.
	return res.sendStatus(401);
}



// Log the user in.
async function login_and_maybe_create_user(params        )      {

	// Setup 
	// If a null username/password was passed, then create a random user and password.
	const username = params.username === '' ? 'anon' + Math.floor(Math.random()*100000000000) : params.username;
	const password = params.password === '' ? 'p' + Math.floor(Math.random()*100000000000) : params.password;

	const hashed_password = bcrypt.hashSync(password, 8);
	let user = { username: username, hashed_password: hashed_password };
	const select_sql = 'SELECT * FROM users WHERE username = ?';
	

	let select_results = await run_mysql_query(select_sql, [username]);

	// test the db for presense of user.  If not found, create given proper perms.
	if(select_results.length === 0) {
		// Username not found.

		// Did the passed token match the value in secret.js?
		if(params.token !== USER_CREATION_SECRET && params.token !== 'anonymous' ) {
			return 403;// no, error hard.
		} else {
			// Yes, create user and log in.
			const insert_sql = 'INSERT INTO users (username, hashed_password) VALUES (?, ?)';
			let insert_results = await run_mysql_query(insert_sql, [user.username, user.hashed_password]);
			
			if(insert_results.affectedRows !== 1) return 500;
		}


	} else if(select_results.length === 1) {
		// We have a user. Test username.
		if(!bcrypt.compareSync(password, select_results[0].hashed_password)) {
			return 401;  // Bad password or username.
		} 

	} else {
		// Multiple users found with same username.  Shouldn't be possible due to db constraints.
		throw 500;
	}

	// We have a proper user.  Continue!
	let jwt_token = jwt.sign({ username: username }, JWT_AUTH_SECRET, { expiresIn: 864000 });
	const last = (new Date()).toString().replace(/ /g, '_').replace('(', '').replace(')', '').replace(/:/g,'_').replace(/-/g, '_');

	params.res.cookie('x-access-token', jwt_token);
	params.res.cookie('x-access-token-username', user.username);
	params.res.cookie('x-access-token-refreshed', last);

	return user;
}


module.exports = {
	return_level_without,
	return_level_prepared_for_transmit,
	get_username_or_emptystring,
	require_logged_in_user,
	login_and_maybe_create_user
};