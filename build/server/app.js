//      

/**
	Node main event loop
*/
const DEBUG_DELAY = 0;
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bugsnag = require('bugsnag');

const {BUGSNAG_API, DEBUG, ADMIN_USERNAME, VERSION } = require('./secret.js'); 

const { IfLevelModelFactory, IfLevelModel } = require('./IfGame');

const { from_utc_to_myql, run_mysql_query, update_mysql_database_schema, to_utc } = require('./mysql.js');
const { login_and_maybe_create_user, require_logged_in_user, 
		get_username_or_emptystring, return_level_prepared_for_transmit} = require('./network.js');

const { turn_array_into_map } = require('./../shared/misc.js');

var fs = require('fs');
var util = require('util');
var logFile = fs.createWriteStream('log.txt', { flags: 'a' });
//var logStdout = process.stdout;

                                                                 
// import type { Connection } from 'mysql';

const app = express();
//const http = require('http');
//const server = http.createServer(app);
//const io = require('socket.io')(server);


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


// Update SQL schema to latest.  Safe to re-run.
app.get('/api/sql/', 
	async (req          , res           , next              )               => {
	
	try {
		let v = await update_mysql_database_schema();
		res.json(v);
	} catch(e){
		log_error(e);
		res.json(e);
		return next(e);
	}
});


////////////////////////////////////////////////////////////////////////
//  If Game
////////////////////////////////////////////////////////////////////////



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



// Select object updated in the last time period..
// Require current user to match secret.js ADMIN_USERNAME.
app.get('/api/ifgame/recent_levels', nocache, require_logged_in_user,
	async (req          , res           , next              )               => {
	try {
		const INTERVAL = 60*24*7*4;
		const ignore = '"' + ['garrettn', 'test', 'bob'].join( '","')+'"';
		const sql = 'SELECT * FROM iflevels WHERE ' +
				'updated > NOW() - INTERVAL '+INTERVAL+' MINUTE ' +
				'AND username NOT IN ('+ignore+')';
				//' AND username = "caracozar" AND code="math1"';
		const username = get_username_or_emptystring(req);
		//const level = req.params.level ? req.params.level : 'tutorial';

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


// Get grades for registered users.
// If the param username is passed, then return that user's information only.
app.get('/api/ifgame/grades/:username?', nocache, require_logged_in_user,
	async (req          , res           , next              )               => {
	try {
		//const ignore = '"' + ['garrettn', 'test', 'bob'].join( '","')+'"';
		const username = get_username_or_emptystring(req);
		const param_username = typeof req.params.username === 'undefined' ? '' : req.params.username;
		const sql = 'SELECT * FROM iflevels WHERE COMPLETED = 1 ' +
				(param_username === '' ? '' : ' AND username = ?');
		//		: ' AND username NOT IN ('+ignore+')');

		// Make sure that if a username was given, that it equals the current user.
		if(param_username !== '' && param_username !== username) {
			throw new Error('Invalid username '+username+' for recent_levels');
		}

		// Ensure that if we want everything, that it's an admin user.
		if(param_username === '' && (username !== ADMIN_USERNAME && username !== 'test')) {
			throw new Error('Invalid user '+username+' for recent_levels');
		}

		let select_results = await run_mysql_query(sql, [param_username]);

		if(select_results.length === 0) return res.json([ { username: param_username} ]);

		let iflevels = select_results.map( l => new IfLevelModel(l) );

		// Organize into a map of users.
		const users = turn_array_into_map(iflevels, l => l.username	);

		// Grab biggest item for each user.
		const grades = [];
		users.forEach( (levels, user) => {
			// Build user object.
			const u = { username: user };
			const level_map = turn_array_into_map(levels, (l) => l.code );

			level_map.forEach( (levels, code) => {
				u[code] = levels.reduce( (max, l) => 
						max > l.get_test_score_as_percent() 
						? max 
						: l.get_test_score_as_percent()
						, 0);
			});

			grades.push(u);
		});

		return res.json(grades);
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
		const sql0 = 'DELETE FROM feedback WHERE username = "test"';
		const sql1 = 'DELETE FROM iflevels WHERE username = "test"';
		const sql2 = 'DELETE FROM users WHERE username = "test"';

		let results0 = await run_mysql_query(sql0);
		let results1 = await run_mysql_query(sql1);
		let results2 = await run_mysql_query(sql2);
		return res.json({ success: true, affectedRows: results2.affectedRows});
		
	} catch (e) {
		log_error(e);
		next(e);
	}
});



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
	res.json({ version: VERSION, 
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


