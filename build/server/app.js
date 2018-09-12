//      

/**
	Node main event loop
*/
const DEBUG_DELAY = 0;
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const compression = require('compression');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const bugsnag = require('bugsnag');

const {USER_CREATION_SECRET, JWT_AUTH_SECRET, BUGSNAG_API, DEBUG,
		MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE,
		ADMIN_USERNAME
		} = require('./secret.js'); 


const { IfLevelModelFactory, IfLevelModel } = require('./IfGame');

const jwt = require('jsonwebtoken');

const mysql = require('promise-mysql');

const { sql01 } = require('./../../sql/sql01.js');
const { sql02 } = require('./../../sql/sql02.js');
const { sql03 } = require('./../../sql/sql03.js');
const { sql04 } = require('./../../sql/sql04.js');
const { sql05 } = require('./../../sql/sql05.js');



var fs = require('fs');
var util = require('util');
var logFile = fs.createWriteStream('log.txt', { flags: 'a' });
//var logStdout = process.stdout;

                                                                 
// import type { Connection } from 'mysql';

const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);


/*
io.on('connection', function(socket: any){
  console.log('a user connected ' + socket);
});

server.listen('3000', function(){
  console.log('listening on *:3000');
});
*/

/////////////////////////////////////////////////////////////////////////////////////////
// Setup app
/////////////////////////////////////////////////////////////////////////////////////////


// Note: Compression only applies on this app.  You won't see it hit
// when developing with webpack, as that doesn't use this layer. When 
// deployed, and react is using the transformed.js file, then this works.
app.use(compression({filter: shouldCompress}));


function shouldCompress (req          , res           )          {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false;
  }

  // fallback to standard filter function
  return compression.filter(req, res);
}


// Disable DEBUG as bugsnag doesn't work with passenger.
// 	Possibly due to STDOUT issue.
// Load bugsnag if it is defined in secret.js.
if(!DEBUG && typeof BUGSNAG_API !== undefined && BUGSNAG_API.length > 0) {
	bugsnag.register(BUGSNAG_API);
	app.use(bugsnag.requestHandler);
	app.use(bugsnag.errorHandler);
	console.log('loading bugsnag');
}


// Set parsing for application/x-www-form-urlencoded
app.use(bodyParser.json({ limit: '10mb'}));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));
app.use(cookieParser());


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
const log_error = DEBUG ? console.log : function (arg      ) {
		arg;
		logFile.write(util.format.apply(null, arguments) + '\n');
		//ogStdout.write(util.format.apply(null, arguments) + '\n');
};

// Log requests and arguments to the console for easier debugging.
if(DEBUG)
	app.use(
		(req          , res           , next              ) => {
			let keys = Object.keys(req.params);

			if(req.url !== '/favicon.ico') {
				console.log(req.method, req.url, keys);
			}
			next();
		});


// Slow down responses in debug mode.
if(DEBUG) 
	app.use(
		(req          , res           , next              )        => setTimeout(()        => next(), DEBUG_DELAY)
	);





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

// Create a new flow definition for MYSQL, as we are using a version providing Promises.
                            
                
                 
              
  
                            
              
                   
  

function get_mysql_connection()              {
	
	let conn = mysql.createConnection({
		host: MYSQL_HOST,
		user: MYSQL_USER,
		password: MYSQL_PASSWORD,
		database: MYSQL_DATABASE,
		timezone: '+0000'
	});

	return conn;
}

async function run_mysql_query(sql        , values             )         {
	let results = await get_mysql_connection().then( (conn             )                => {
		let r = conn.query(sql, values);
		conn.end();
		return r;
	});
	return results;
}

/* Run the array of sql commands.
	@arg sql
*/
async function update_version(sqls               )                {
	for(let i=0; i<sqls.length; i++) {
		await get_mysql_connection().then( (conn             )        => {
			return conn.query(sqls[i]);
		});
	}
}

/*
	What is the current version of the DB?
	Looks at schema_version table.
*/
async function get_version()               {
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


// Update SQL schema to latest.  Safe to re-run.
app.get('/api/sql/', 
	async (req          , res           , next              )               => {
	
	try {
		let old_version = await get_version();

		if(old_version < 1) {
			await update_version( sql01 );
		}
		if(old_version < 2 ) {
			await update_version( sql02 );
		}
		if(old_version < 3 ) {
			await update_version( sql03 );
		}
		if(old_version < 4 ) {
			await update_version( sql04 );
		}
		if(old_version < 5 ) {
			await update_version( sql05 );
		}
		res.json({ 'old_version': old_version, 'new_version': 5 });
	} catch(e){
		log_error(e);
		res.json(e);
		return next(e);
	}
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
const strip_secrets = function(input        )         {

	// if is null, then return null.  Don't convert a null value in an array into an object.
	if(input === null) return input;

	// Return basic items, which may be contained in arrays.
	if(typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') return input;

	// if an array, recurse.
	if( Array.isArray(input)) {
		return input.map(strip_secrets);
	}
	
	// create a clean new object.
	let new_json = {};

	// recursively iterate through.
	for(let property in input ) {
		if(input.hasOwnProperty(property)) {
			if(property.substr(0,8) !== 'solution' 
				|| ( property.substr(0,8) === 'solution' && input[property+'_visible'] ) ) {

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
const from_mysql_to_utc = (dt_or_string               )         => {
	if(dt_or_string instanceof Date) {
		return to_utc(dt_or_string);
	}
	let dt = new Date(dt_or_string);

	return to_utc(dt);
};

// Convert a utc int value into a textual format usable for inserting into mysql
const from_utc_to_myql = (i        )         => {
	let dt = new Date(i);

	// pull out the T and replace with a space.
	let mysql = dt.toISOString().slice(0, 19).replace('T', ' ');

	return mysql;
};

// Convert a date to a UTC int value (milliseconds from epoch)
// Used prior to sending any dates to client.
const to_utc = (dt      )         => {
	if(!(dt instanceof Date)) {
		throw new Error(dt + ' is not an instance of date, but instead ' + typeof dt);
	}
	let int = Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate(), 
			dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds());
	
	return int;
};

// Convenience function for cleaning up and preparing a level for returning.
// Includes both removing secrets, as well as converting dates to UTC format.
// @level_or_levels can deal with being either an array or a single item.
const return_level_prepared_for_transmit = (level        )         => {
	// Do not accept IfLevels. Instead, need json.
	if(level instanceof IfLevelModel) {
		throw new Error('Should submit json instead of IfLevel');
	}

	let clean_level = strip_secrets(level);

	clean_level.updated = from_mysql_to_utc(clean_level.updated); 
	clean_level.created = from_mysql_to_utc(clean_level.created); 

	return clean_level;
};



// Create a new level for the currently logged in user with the given type.
app.post('/api/ifgame/new_level_by_code/:code', 
	nocache, require_logged_in_user,
	async (req          , res           , next              )               => {
	try {
		const code = req.params.code;
		const username = get_username_or_emptystring(req);
		const level = IfLevelModelFactory.create(code, username);
		const now = from_utc_to_myql(to_utc(new Date()));

		const insert_sql = `INSERT INTO iflevels (type, username, code, title, description, completed, 
			pages, history, created, updated, seed, allow_skipping_tutorial, harsons_randomly_on_username) 
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
		level.username = username;

					
		// Note: Must use toJson on pages, as that needs some extra care
		// before being stringified.
		const values = [level.type, level.username, level.code, level.title, level.description,
				level.completed ? 1 : 0, 
				JSON.stringify(level.pages.map( (p         )         => p.toJson() )), 
				JSON.stringify(level.history), 
				now, now,
				level.seed,
				level.allow_skipping_tutorial,
				level.harsons_randomly_on_username
				];

		let insert_results = await run_mysql_query(insert_sql, values);

		level._id = insert_results.insertId;

		res.json(return_level_prepared_for_transmit(level.toJson()));
	} catch (e) {
		log_error(e);
		next(e);
	}
});



// List objects owned by the logged in user.
// :type may be 'all', or limited to a single code.
app.get('/api/ifgame/levels/byCode/:code', 
	nocache, require_logged_in_user,
	async (req          , res           , next              )               => {
	try {
		const sql = 'SELECT * FROM iflevels WHERE username = ? AND (code = ? OR ? = "all")';
		const code = req.params.code;
		const username = get_username_or_emptystring(req);

		let iflevels = await run_mysql_query(sql, [username, code, code]);

		// Convert into models, and then back to JSON.
		iflevels = iflevels.map( (l        )         => (new IfLevelModel(l)).toJson() );

		// Remove secret fields and transmit.
		iflevels = iflevels.map( (l        )         => return_level_prepared_for_transmit(l));
		res.json(iflevels);
	} catch (e) {
		log_error(e);
		next(e);
	}
});



// Select object updated in the last 30m.
// Require current user to match secret.js ADMIN_USERNAME.
app.get('/api/ifgame/recent_levels', nocache, require_logged_in_user,
	async (req          , res           , next              )               => {
	try {
		const INTERVAL = 60*24*7*4;
		const sql = 'SELECT * FROM iflevels WHERE updated > NOW() - INTERVAL '+INTERVAL+' MINUTE';
		const username = get_username_or_emptystring(req);

		if(username !== ADMIN_USERNAME && username !== 'test')
			throw new Error('Invalid username '+username+' for recent_levels');

		let select_results = await run_mysql_query(sql);

		if(select_results.length === 0) return res.json([]);

		let iflevels = select_results.map( (l        )         => (new IfLevelModel(l)).toJson() );

		// Remove secret fields and transmit.
		iflevels = iflevels.map( (l        )         => return_level_prepared_for_transmit(l));
		
		res.json(iflevels);
	} catch (e) {
		log_error(e);
		next(e);
	}
});



// Select object, provide it is owned by the logged in user.
app.get('/api/ifgame/level/:id', nocache, require_logged_in_user,
	async (req          , res           , next              )               => {
	try {
		const sql = 'SELECT * FROM iflevels WHERE _id = ? AND username = ?';
		const _id = req.params.id;
		const username = get_username_or_emptystring(req);

		let select_results = await run_mysql_query(sql, [_id, username]);

		if(select_results.length === 0) return res.sendStatus(404);
		
		let iflevel = new IfLevelModel(select_results[0]); // initialize from sql
		
		res.json(return_level_prepared_for_transmit(iflevel.toJson()));
	} catch (e) {
		log_error(e);
		next(e);
	}
});


/** Delete
	This end-point is only used for testing purposes.  Hard-coded for test user and *all*  test pages.
*/
app.delete('/api/ifgame/level/:id', 
	nocache, require_logged_in_user,
	async (req          , res           , next              )               => {
	try {
		const sql = 'DELETE FROM iflevels WHERE username = "test" '; // AND _id = ?
		const username = get_username_or_emptystring(req);

		if(username !== 'test') {
			return res.sendStatus(401); // unauthorized.
		}

		let delete_results = await run_mysql_query(sql); //, [_id]);

		res.json({success: (delete_results.affectedRows >= 1)});

	} catch (e) {
		log_error(e);
		next(e);
	}
});


// Update One
app.post('/api/ifgame/level/:id', 
	nocache, require_logged_in_user,
	async (req          , res           , next              )               => {
	try {
		const validate_only = req.query.validate_only === '1'; // do we just check the current page?
		const username = get_username_or_emptystring(req);
		const _id = req.params.id;
		const sql_select = 'SELECT * FROM iflevels WHERE _id = ? AND username = ?';
		const sql_update = `UPDATE iflevels SET completed = ?, pages = ?, history = ?, 
			updated = ? WHERE _id = ? AND username = ?`;

		let select_results = await run_mysql_query(sql_select, [_id, username]);

		// Return 404 if no results match.
		if(select_results.length === 0) return res.sendStatus(404);

		// Ensure that this level isn't completed.
		if(select_results[0].completed) return res.sendStatus(401);

		// update.
		let iflevel = new IfLevelModel(select_results[0]); // initialize from sql
		iflevel.updateUserFields(req.body); // update client_f and history

		// Make sure that there is feedback.
		iflevel.pages.filter( p => p.client_feedback === null).filter( p=> p.type === 'IfPageFormulaSchema').map( p => {
			throw new Error('Client feedback shoudl not be null');
		});



		// If we're just supposed to validate, don't add a new page.
		if(!validate_only) {
			// Update and add new page if needed.
			IfLevelModelFactory.addPageOrMarkAsComplete(iflevel); 
		}

		// Note: Use pages.toJson() to make sure that they properly convert to json.
		let values = [iflevel.completed ? 1 : 0, 
					JSON.stringify(iflevel.pages.map( (p         )         => p.toJson() )), 
					JSON.stringify(iflevel.history), 
					from_utc_to_myql(to_utc(iflevel.updated)), 
					iflevel._id, 
					iflevel.username];

		let update_results = await run_mysql_query(sql_update, values);

		// Ensure exactly 1 item was updated.
		if(update_results.changedRows !== 1) return res.sendStatus(500);


		res.json(return_level_prepared_for_transmit(iflevel.toJson()));
	} catch (e) {
		log_error(e);
		next(e);
	}

});




////////////////////////////////////////////////////////////////////////
//   Feedback Module
////////////////////////////////////////////////////////////////////////


// Create a new feedback entry.
app.post('/api/feedback/', 
	nocache, require_logged_in_user,
	async (req          , res           , next              )               => {
	try {
		const created = from_utc_to_myql(to_utc(new Date()));
		const username = get_username_or_emptystring(req);
		const data = JSON.stringify(req.body.data);
		const message = req.body.message;
		const code = req.body.code;

		const insert_sql = `INSERT INTO feedback 
				(username, message, created, data, code) 
				VALUES (?, ?, ?, ?, ?)`;
					
		const values = [ username, message, created, data, code ];

		let insert_results = await run_mysql_query(insert_sql, values);

		res.json({ success: true });
	} catch (e) {
		log_error(e);
		next(e);
	}
});

////////////////////////////////////////////////////////////////////////
//   Authentication
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


// Log out.
app.post('/api/logout', (req          , res           ) => {
	res.clearCookie('x-access-token');
	res.clearCookie('x-access-token-refreshed');
	res.clearCookie('x-access-token-username');
	res.json({ 'logout': true });
});
app.get('/api/logout', (req          , res           ) => {
	res.clearCookie('x-access-token');
	res.clearCookie('x-access-token-refreshed');
	res.clearCookie('x-access-token-username');
	res.json({ 'logout1': true });
});






// Delete the test user
app.post('/api/login_clear_test_user/', 
	nocache,
	async (req          , res           , next              )               => {
	try {
		const sql1 = 'DELETE FROM iflevels WHERE username = "test"';
		const sql2 = 'DELETE FROM users WHERE username = "test"';

		let results1 = await run_mysql_query(sql1);
		let results2 = await run_mysql_query(sql2);
		return res.json({ success: true, affectedRows: results2.affectedRows});
		
	} catch (e) {
		log_error(e);
		next(e);
	}
});


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

// Simple end-point for logging in and/or creating a user.
// Mimmicks post. Used for auto-login instead of going through the react 
// page, as that takes a lot longer to load.  This quickly sets the information
// and returns it to a clean index page.
app.get('/api/login/', 
	nocache,
	async (req          , res           , next              )               => {
	try {
		var user = await login_and_maybe_create_user({
			token: req.query.token,
			password: req.query.password,
			username: req.query.username,
			res: res
		});

		// If a number is returned, use that error status code.
		if(typeof user === 'number') res.sendStatus(user);

		// Otherwise, we have a valid user and have been logged in.
		// Issue redirect.
		const url = req.query.url;
		res.redirect('/'+url);
	}
	catch (e) {
		log_error(e);
		next(e);
	}
});


// Simple end-point to test if the user is logged in or not.
app.get('/api/login/status', 
	nocache,
	(req          , res           ) => {
	let u         = get_username_or_emptystring(req);

	res.json({ 'logged_in': u!=='', username: u });
});


/*
	Login AND/OR create user.
	Creating a user requires a passed token, which much match the value given in secret.js
	Without this token, no users can be created.
*/
app.post('/api/login/', 
	nocache, 
	async (req          , res           , next              )               => {
	try {
		const user = await login_and_maybe_create_user({
				token: req.body.token,
				password: req.body.password,
				username: req.body.username,
				res: res
			});

		if(typeof user === 'number') return res.sendStatus(user);

		return res.json({ username: user.username, logged_in: true });
	}
	catch (e) {
		log_error(e);
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
app.get('/api/version', nocache, (req          , res           ) => {
	res.json({ version: 1.2, 
		environment: process.env.NODE_ENV, 
		debug: DEBUG 
	});
});

// Sample endpoint to generate an error.
app.get('/api/error', nocache, 
	(req          , res           , next              ) => {

	try {
		throw new Error('test');
	} catch (e) {
		log_error(e);
		next(e);
	}
});


const build_path = (filename        )         => {
	if(DEBUG) 
		return path.join(__dirname, '../../build/public/'+filename);
	else
		return path.join(__dirname, '../public/'+filename);
};
///home/profgarrett/excel.fun/jsgames/build/server/index.html

// Build files. Note that the paths don't work on :3000 when developing,
// but they do work when deployed due to passenger on dreamhost using that folder.
app.get('/favicon.ico', (req          , res           ) => {
	res.sendFile(build_path('favicon.ico'));
});
app.get('/transformed.js', (req          , res           ) => {
	res.sendFile(build_path('transformed.js'));
});
app.get('/transformed.js.map', (req          , res           ) => {
	res.sendFile(build_path('transformed.js.map'));
});


// Load static files.
app.use('/static', express.static('public'));

// Default case that returns the general index page.
// Needed for when client is on a subpage and refreshes the page to return the react app.
// SHould be last.
app.get('*', (req          , res           ) => {
	// If on local, don't add jsgames. On server, code is in subfolder.
	log_error( build_path('index.html'));
	res.sendFile(build_path('index.html'));
});


//app.use(function (err, req, res, next) {
  // handle error

//});

process.on('uncaughtException', function (er) {
  log_error(er);
  process.exit(1);
});

app.listen(DEBUG ? 3000 : 80, function(){
	if(DEBUG) 
		console.log('app started ' + (DEBUG ? 3000 : 80) + ' - ' + (new Date()).toString() );
});


