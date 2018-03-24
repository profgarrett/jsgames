/**
	Node main event loop
*/
const DEBUG_DELAY = 250;
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const compression = require('compression');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const bugsnag = require('bugsnag');

const { USER_CREATION_SECRET, JWT_AUTH_SECRET, BUGSNAG_API, DEBUG,
	MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } = require('./../secret.js'); 

const { IfLevelModelFactory, IfLevelModel } = require('./IfGame');

const jwt = require('jsonwebtoken');

const mysql = require('promise-mysql');

const { sql01 } = require('./../sql/sql01.js');
const { sql02 } = require('./../sql/sql02.js');

var fs = require('fs');
var util = require('util');
var logFile = fs.createWriteStream('log.txt', { flags: 'a' });
var logStdout = process.stdout;



/////////////////////////////////////////////////////////////////////////////////////////
// Setup app
/////////////////////////////////////////////////////////////////////////////////////////
const app = express();


// Note: Compression only applies on this app.  You won't see it hit
// when developing with webpack, as that doesn't use this layer. When 
// deployed, and react is using the transformed.js file, then this works.
app.use(compression({filter: shouldCompress}));

function shouldCompress (req, res) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false;
  }

  // fallback to standard filter function
  return compression.filter(req, res);
}


// Load bugsnag if it is defined in secret.js.
if(!DEBUG && typeof BUGSNAG_API !== undefined && BUGSNAG_API.length > 0) {
	bugsnag.register(BUGSNAG_API);
	app.use(bugsnag.requestHandler);
	app.use(bugsnag.errorHandler);
}

// Set parsing for application/x-www-form-urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


// Force responses to not be cached. Since we don't server actual files, and just API requests,
// and those update, if a browser caches a response they may not stale/incorrect data later.
// @Thanks to https://stackoverflow.com/questions/20429592/no-cache-in-a-nodejs-server
function nocache(req, res, next) {
	//res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	//res.header('Expires', '-1');
	//res.header('Pragma', 'no-cache');
	next();
}


// If we're not debugging, throw all errors to log file.
if (!DEBUG) {
	console.log = function () {
		logFile.write(util.format.apply(null, arguments) + '\n');
		logStdout.write(util.format.apply(null, arguments) + '\n');
	};
	console.error = console.log;
}


// Log requests and arguments to the console for easier debugging.
if(DEBUG)
	app.use(
		(req, res, next) => {
			let keys = Object.keys(req.params);

			if(req.url !== '/favicon.ico') {
				console.log(req.method, req.url, keys);
			}
			next();
		});


// Slow down responses in debug mode.
if(DEBUG) 
	app.use(
		(req, res, next) => setTimeout(() => next(), DEBUG_DELAY)
	);




////////////////////////////////////////////////////////////////////////
//  Chart Game
////////////////////////////////////////////////////////////////////////

/*
// Create
app.post('/api/chartgame/level', (req, res) => {
	let level = CgLevelModelFactory.createTest();
	let _db = null;

	MongoClient.connect(url) //, {native_parser:true}, function(err, mongo) {
		.then( conn => _db = conn.db('jsgames') )
		.then( db => db.collection('chartlevels').insert( level.toJson() ) )
		.then( mongoresult => {
			let id = mongoresult.insertedIds[0];
			return _db.collection('chartlevels').findOne({ _id: new ObjectId(id) });
		})
		.then( mongoresult => res.json(mongoresult) )
		.catch( err => log_error(err, res) );
});

// List
app.get('/api/chartgame/level/', (req, res) => {

	MongoClient.connect(url) 
		.then( conn => conn.db('jsgames').collection('chartlevels').find() )
		.then( q => q.toArray() )
		.then( mongoresult => res.json(mongoresult) )
		.catch( err => log_error(err, res) );
});

// Select One
app.get('/api/chartgame/level/:id', (req, res) => {

	MongoClient.connect(url)
		.then( conn => conn.db('jsgames') )
		.then( db => db.collection('chartlevels').findOne({ _id: new ObjectId(req.params.id) }) )
		.then( mongoresult => res.json(mongoresult) )
		.catch( err => log_error(err, res) );
});

// Delete One
app.delete('/api/chartgame/level/:id', (req, res) => {

	MongoClient.connect(url)
		.then( conn => conn.db('jsgames') )
		.then( db => db.collection('chartlevels').remove({ _id: new ObjectId(req.params.id) }) )
		.then( mongoresult => res.json(mongoresult) )
		.catch( err => log_error(err, res) );
});

// Update One
app.post('/api/chartgame/level/:id', (req, res) => {
	let _db = null,
		_level_model = null;
	
	MongoClient.connect(url)
		.then( conn => _db = conn.db('jsgames') )
		.then( db => db.collection('chartlevels').findOne({ _id: new ObjectId(req.params.id) }) )
		.then( json => {
			if(json === null) throw Error('404');
			_level_model = new CgLevelModel(json);

			// Update user fields and (potentially) add a new page.
			_level_model.updateUserFields(req.body);
			CgLevelModelFactory.updateTest(_level_model);

			return _level_model.toJson();
		})
		.then( json => _db.collection('chartlevels').update({_id: new ObjectId(req.params.id) }, json) )
		.then( mongoresult => {
			if(mongoresult.result.ok === 1) {
				return res.json(_level_model);
			} else {
				throw Error('500');
			}
		})
		.catch( err => log_error(err, res) );
});

*/

////////////////////////////////////////////////////////////////////////
//  DB setup and maintenance
////////////////////////////////////////////////////////////////////////


/**
	Initialize MYSQL with credentials from secret.js.

	Options:
		timezone: 
			This sets all server date/times to UTC.  The client always sends date in UTC int format.
			Without this setting, if MYSQL has a different date/time zone it'll convert the input.  
*/
function get_mysql_connection() {
	
	let conn = mysql.createConnection({
		host: MYSQL_HOST,
		user: MYSQL_USER,
		password: MYSQL_PASSWORD,
		database: MYSQL_DATABASE,
		timezone: '+0000'
	});

	return conn;
}

/* Run the array of sql commands.
	@arg sql
*/
async function update_version(sqls) {
	for(let i=0; i<sqls.length; i++) {
		await get_mysql_connection().then( conn => {
			//console.log({'i':i, 'sql': sqls[i] });
			return conn.query(sqls[i]);
		});
	}
}

/*
	What is the current version of the DB?
	Looks at schema_version table.
*/
async function get_version() {
	const sql = 'select max(idversion) as idversion from schema_version';

	let result = await get_mysql_connection().then( conn => {
		return conn.query(sql);
	}).catch( e => {
		// since version table isn't created, assume 0 version.
		if(e.code === 'ER_NO_SUCH_TABLE') return 0; 
		// actual error.
		throw new Error( e.sqlMessage );
	});
	
	if(typeof result === 'number') {
		return result;
	} else if(typeof result === 'string') {
		return result;
	} else {
		return result[0].idversion;
	}
}

// Update SQL schema to latest.  Safe to re-run.
app.get('/api/sql/', async (req, res, next) => {
	
	let old_version = await get_version();

	if(old_version < 1) {
		await update_version( sql01, req, res);
	}
	if(old_version < 2 ) {
		await update_version( sql02, req, res);
	}
	res.json({ 'old_version': old_version, 'new_version': 2 });
	next('success');
});


////////////////////////////////////////////////////////////////////////
//  If Game
////////////////////////////////////////////////////////////////////////



/*
	Remove the elements of JSON that start with 'solution'
	Can pass either an object or an array of results.
	
	If finding a property with prefix solution..., will look for matching solution..._visible.  
		If that is true, then send anyway. 

	Test: 
		strip_secrets([{ x: 1, 'solution_show': 2, 'solution_show_visible': true, 'solution_hide': 2, 'solution_hide_visible': false }])
*/
const strip_secrets = function(input) {

	// if is null, then return null.  Don't convert a null value in an array into an object.
	if(input === null) return input;

	// if an array, recurse.
	if( Array.isArray(input)) {
		return input.map(strip_secrets);
	}

	// create a clean new object.
	let new_json = {};

	// recursively iterate through.
	for(let property in input ) {
		if(input.hasOwnProperty(property)) {
			if(property.substr(0,8) !== 'solution' || ( property.substr(0,8) === 'solution' && input[property+'_visible'] ) ) {
				if(Array.isArray(input[property])) {
					new_json[property] = strip_secrets(input[property]);
				} else {
					new_json[property] = input[property];	
				}
			}
		}
	}
	return new_json;
};

/**
	Mysql is irritating with date handling.
		When inserting a new object, then date is string format.
		When updating, a date object. 
	This function deals with both and returns a UTC int

	@dt_or_string
*/
const from_mysql_to_utc = dt_or_string => {
	if(dt_or_string instanceof Date) {
		//console.log('from_mysql_to_utc: ' + dt_or_string.toString() + ' (dt)' );
		return to_utc(dt_or_string);
	}
	let dt = new Date(dt_or_string);

	//console.log('from_mysql_to_utc: ' + dt_or_string + ' (string) --> ' + dt.toString() );
	return to_utc(dt);
};

// Convert a utc int value into a textual format usable for inserting into mysql
const from_utc_to_myql = (i) => {
	//console.assert(typeof i !== 'object' && typeof i === 'number');
	let dt = new Date(i);

	// pull out the T and replace with a space.
	let mysql = dt.toISOString().slice(0, 19).replace('T', ' ');

	//console.log('from_utc_to_myql: '+dt.toString() + ' --> '+ mysql);
	return mysql;
};

// Convert a date to a UTC int value (milliseconds from epoch)
// Used prior to sending any dates to client.
const to_utc = (dt) => {
	if(!(dt instanceof Date)) {
		throw new Error(dt + ' is not an instance of date, but instead ' + typeof dt);
	}
	let int = Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate(), 
			dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds());
	
	//console.log('to_utc: '+dt.toString() + ' --> '+ int);

	return int;
};

// Convenience function for cleaning up and preparing a level for returning.
// Includes both removing secrets, as well as converting dates to UTC format.
// @level_or_levels can deal with being either an array or a single item.
const return_level_or_levels_prepared_for_transmit = level_or_levels => {
	// Do not accept IfLevels. Instead, need json.
	if(level_or_levels instanceof IfLevelModel) {
		throw new Error('Should submit json instead of IfLevel');
	}

	// If an array, recursively prepare.
	if(level_or_levels instanceof Array) {
		return level_or_levels.map( l=> return_level_or_levels_prepared_for_transmit(l));
	}

	// Not an array.  Clean.
	let clean_level = strip_secrets(level_or_levels);

	clean_level.updated = from_mysql_to_utc(clean_level.updated); 
	clean_level.created = from_mysql_to_utc(clean_level.created); 

	//console.log('return ' + clean_level.updated + ', ' + clean_level.created);
	return clean_level;
};


// Create a new level for the currently logged in user with the given type.
app.post('/api/ifgame/new_level_by_code/:code', is_logged_in_user, nocache, async (req, res, next) => {
	try {
		const code = req.params.code;
		const level = IfLevelModelFactory.create(code);
		const now = from_utc_to_myql(to_utc(new Date()));

		const username = get_username_or_null(req);
		const insert_sql = `INSERT INTO iflevels (username, code, title, description, completed, 
			pages, history, created, updated, score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
		level.username = username;

		let insert_results = await get_mysql_connection().then( conn => {
			return conn.query(insert_sql, [level.username, level.code, level.title, level.description,
				level.completed ? 1 : 0, JSON.stringify(level.pages), JSON.stringify(level.history), 
				now, now, JSON.stringify(level.score) ]);
		});

		level._id = insert_results.insertId;

		res.json(return_level_or_levels_prepared_for_transmit(level.toJson()));
	} catch (e) {
		next(e);
	}
});


// List objects owned by the logged in user.
// :type may be 'all', or limited to a single code.
app.get('/api/ifgame/levels/byCode/:code', is_logged_in_user, nocache, async (req, res, next) => {
	try {
		const sql = 'SELECT * FROM iflevels WHERE username = ? AND (code = ? OR ? = "all")';
		const code = req.params.code;
		const username = get_username_or_null(req);

		let iflevels = await get_mysql_connection().then( conn => {
			return conn.query(sql, [username, code, code]);
		});

		// Remove secret fields and transmit.
		res.json(return_level_or_levels_prepared_for_transmit(iflevels));
	} catch (e) {
		next(e);
	}
});


// Select object, provide it is owned by the logged in user.
app.get('/api/ifgame/level/:id', is_logged_in_user, nocache, async (req, res, next) => {
	try {
		const sql = 'SELECT * FROM iflevels WHERE _id = ? AND username = ?';
		const _id = req.params.id;
		const username = get_username_or_null(req);

		let iflevels = await get_mysql_connection().then( conn => {
			return conn.query(sql, [_id, username]);
		});

		if(iflevels.length === 0) {
			return res.sendStatus(404);
		}

		res.json(return_level_or_levels_prepared_for_transmit(iflevels[0]));
	} catch (e) {
		next(e);
	}
});


// Delete One.  Only used for testing purposes.  Hard-coded for test user.
app.delete('/api/ifgame/level/:id', is_logged_in_user, nocache, async (req, res, next) => {
	try {
		const sql = 'DELETE FROM iflevels WHERE username = "test" AND _id = ?';
		const _id = req.params.id;
		const username = get_username_or_null(req);

		if(username !== 'test') {
			return res.sendStatus(401); // unauthorized.
		}

		let delete_results = await get_mysql_connection().then( conn => {
			return conn.query(sql, [_id]);
		});

		res.json({success: (delete_results.affectedRows === 1)});

	} catch (e) {
		next(e);
	}
});


// Update One
app.post('/api/ifgame/level/:id', is_logged_in_user, nocache, async (req, res, next) => {
	try {
		const username = get_username_or_null(req);
		const _id = req.params.id;
		const sql_select = 'SELECT * FROM iflevels WHERE _id = ? AND username = ?';
		const sql_update = `UPDATE iflevels SET completed = ?, pages = ?, history = ?, 
			updated = ?, score = ? WHERE _id = ? AND username = ?`;

		let select_results = await get_mysql_connection().then( conn => {
			return conn.query(sql_select, [_id, username]);
		});

		let iflevel = new IfLevelModel(select_results[0]);

		iflevel.updateUserFields(req.body);
		iflevel.updated = new Date();
		IfLevelModelFactory.update(iflevel);

		let update_results = await get_mysql_connection().then( conn => {
			return conn.query(sql_update, [
					iflevel.completed ? 1 : 0, 
					JSON.stringify(iflevel.pages), 
					JSON.stringify(iflevel.history), 
					from_utc_to_myql(to_utc(iflevel.updated)), 
					JSON.stringify(iflevel.score), 
					iflevel._id, 
					iflevel.username
				]);
		});

		// Ensure exactly 1 item was updated.
		if(update_results.changedRows !== 1) {
			return res.sendStatus(500);
		}

		res.json(return_level_or_levels_prepared_for_transmit(iflevel.toJson()));
	} catch (e) {
		next(e);
	}

});




////////////////////////////////////////////////////////////////////////
//   Authentication
////////////////////////////////////////////////////////////////////////


// Find the current username.
function get_username_or_null(req) {
	const  token = req.cookies['x-access-token'];
	if (!token) return null;

	const result = jwt.verify(token, JWT_AUTH_SECRET);

	return (result.username ? result.username : null);
}

// If the current request doesn't have a logged in user, assert a failure & return error.
function is_logged_in_user(req, res, next) {
	const username = get_username_or_null(req);
	//console.log({ username });

	// Refresh login token
	if(username !== null) {
		const token = jwt.sign({ username: username }, JWT_AUTH_SECRET, { expiresIn: 864000 });
		const last = (new Date()).toString().replace(/ /g, '_').replace('(', '').replace(')', '').replace(/:/g,'_').replace(/-/g, '_');
		res.cookie('x-access-token', token);
		res.cookie('x-access-token-username', username);
		res.cookie('x-access-token-refreshed', last);
		return next();
	}

	// username is null.  Send invalid request.
	res.sendStatus(401);
}


// Log out.
app.post('/api/logout', (req, res) => {
	res.clearCookie('x-access-token');
	res.clearCookie('x-access-token-refreshed');
	res.clearCookie('x-access-token-username');
	res.json({ 'logout': true });
});
app.get('/api/logout', (req, res) => {
	res.clearCookie('x-access-token');
	res.clearCookie('x-access-token-refreshed');
	res.clearCookie('x-access-token-username');
	res.json({ 'logout1': true });
});



// Simple end-point to test if the user is logged in or not.
app.get('/api/login/', is_logged_in_user, (req, res) => {
	res.json({ 'login': true });
});


// Delete the test user
app.post('/api/login_clear_test_user/', async (req, res, next) => {
	try {
		const sql = 'DELETE FROM users WHERE username = "test"';

		let results = await get_mysql_connection().then( conn => {
			return conn.query(sql);
		});

		return res.json({ success: true, affectedRows: results.affectedRows});
		
	} catch (e) {
		next(e);
	}
});


/*
	Login AND/OR create user.
	Creating a user requires a passed token, which much match the value given in secret.js
	Without this token, no users can be created.
*/
app.post('/api/login/', nocache, async (req, res, next) => {
	try {
		let token = req.body.token;
		let password = req.body.password;
		let hashed_password = bcrypt.hashSync(password, 8);
		let user = { username: req.body.username, hashed_password: hashed_password };
		const select_sql = 'SELECT * FROM users WHERE username = ?';

		let select_results = await get_mysql_connection().then( conn => {
			return conn.query(select_sql, [user.username]);
		});

		// test the db for presense of user.  If not found, create given proper perms.
		if(select_results.length === 0) {
			// Username not found.

			// Did the passed token match the value in secret.js?
			if(token !== USER_CREATION_SECRET ) {
				return res.sendStatus(403);// no, error hard.
			} else {
				// Yes, create user and log in.
				const insert_sql = 'INSERT INTO users (username, hashed_password) VALUES (?, ?)';
				let insert_results = await get_mysql_connection().then( conn => {
					return conn.query(insert_sql, [user.username, user.hashed_password]);
				});
				
				if(insert_results.affectedRows !== 1) throw new Error(500);
			}


		} else if(select_results.length === 1) {
			// We have a user. Test username.
			if(!bcrypt.compareSync(password, select_results[0].hashed_password)) {
				return res.sendStatus(401);  // Bad password or username.
			} 

		} else {
			// Multiple users found with same username.  Shouldn't be possible due to db constraints.
			throw new Error(500);
		}

		// We have a proper user.  Continue!
		let jwt_token = jwt.sign({ username: user.username }, JWT_AUTH_SECRET, { expiresIn: 864000 });
		const last = (new Date()).toString().replace(/ /g, '_').replace('(', '').replace(')', '').replace(/:/g,'_').replace(/-/g, '_');

		res.cookie('x-access-token', jwt_token);
		res.cookie('x-access-token-username', user.username);
		res.cookie('x-access-token-refreshed', last);
		return res.json({ username: user.username, logged_in: true });
	}
	catch (e) {
		next(e);
	}
});


////////////////////////////////////////////////////////////////////////
//  Final Express
////////////////////////////////////////////////////////////////////////

/*
app.get('/', (req, res) => {
	res.sendFile(path.resolve('jsgames/build/index.html'));
});
*/
app.get('/version', nocache, (req, res) => {
	res.json({ version: 1});
});


// Sample endpoint to generate an error.
app.get('/error', nocache, (req, res) => {
	throw new Error('test');
});


// Build files. Note that the paths don't work on :3000 when developing,
// but they do work when deployed due to passenger on dreamhost using that folder.
app.get('/favicon.ico', (req, res) => {
	res.sendFile(path.resolve('jsgames/build/favicon.ico'));
});
app.get('/transformed.js', (req, res) => {
	res.sendFile(path.resolve('jsgames/build/transformed.js'));
});
app.get('/transformed.js.map', (req, res) => {
	res.sendFile(path.resolve('jsgames/build/transformed.js.map'));
});

// Default case that returns the general index page.
// Needed for when client is on a subpage and refreshes the page to return the react app.
// SHould be last.
app.get('*', (req, res) => {
	res.sendFile(path.resolve('jsgames/build/index.html'));
});


app.listen(DEBUG ? 3000 : 80, function(){
	console.log('app started ' + (DEBUG ? 3000 : 80) + ' - ' + (new Date()).toString() );
});
