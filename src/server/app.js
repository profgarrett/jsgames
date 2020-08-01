// @flow

/**
	Node main event loop
*/
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const Bugsnag = require('@bugsnag/js')
const BugsnagPluginExpress = require('@bugsnag/plugin-express')

let { BUGSNAG_API, DEBUG, VERSION } = require('./secret.js'); 

const DEBUG_DELAY = DEBUG ? 500 : 0;

const { update_mysql_database_schema } = require('./mysql.js');
const { nocache, log_error } = require('./network.js');

import type { $Request, $Response, NextFunction } from 'express';
// import type { Connection } from 'mysql';

const app = express();



/////////////////////////////////////////////////////////////////////////////////////////
// Setup app
/////////////////////////////////////////////////////////////////////////////////////////


// Note: Compression only applies on this app.  You won't see it hit
// when developing with webpack, as that doesn't use this layer. When 
// deployed, and react is using the transformed.js file, then this works.
app.use(compression({filter: shouldCompress}));


function shouldCompress (req: $Request, res: $Response): boolean {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false;
  }

  // fallback to standard filter function
  return compression.filter(req, res);
}


// Load bugsnag if it is defined in secret.js.
if(DEBUG === false && typeof BUGSNAG_API !== 'undefined' && BUGSNAG_API.length > 0) {
	console.log('loading bugsnag');

	Bugsnag.start({
		apiKey: BUGSNAG_API,
		plugins: [BugsnagPluginExpress],
	})

	var middleware = Bugsnag.getPlugin('express')

	// This must be the first piece of middleware in the stack.
	// It can only capture errors in downstream middleware
	app.use(middleware.requestHandler)

	/* all other middleware and application routes go here */

}



// Set parsing for application/x-www-form-urlencoded
app.use(bodyParser.json({ limit: '10mb'}));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));

// $FlowFixMe,  This is ok as the cookie parser has a flow type messed up.
app.use(cookieParser());

// Allow trusting the IP from the proxy forwarding
app.set('trust proxy', true); //'loopback, linklocal');


// Log requests and arguments to the console for easier debugging.
if(DEBUG)
	app.use(
		(req: $Request, res: $Response, next: NextFunction) => {
			let keys = Object.keys(req.params);

			if(req.url !== '/favicon.ico') {
				console.log(req.method, req.url, keys);
			}
			next();
		});


// Slow down responses in debug mode.
if(DEBUG) 
	app.use(
		(req: $Request, res: $Response, next: NextFunction): mixed => setTimeout((): mixed => next(), DEBUG_DELAY)
	);




////////////////////////////////////////////////////////////////////////
//  Register routers
////////////////////////////////////////////////////////////////////////


const app_levels = require('./app_levels');
app.use('/api/levels', app_levels);

const app_reports = require('./app_reports');
app.use('/api/reports',app_reports);

const app_sections = require('./app_sections');
app.use('/api/sections',app_sections);

const app_users = require('./app_users');
app.use('/api/users', app_users);


////////////////////////////////////////////////////////////////////////
//  Some basic routes.
////////////////////////////////////////////////////////////////////////


// Update SQL schema to latest.  Safe to re-run.
app.get('/api/sql/', 
	async (req: $Request, res: $Response, next: NextFunction): Promise<any> => {
	
	try {
		let v = await update_mysql_database_schema();
		res.json(v);
	} catch(e){
		log_error(e);
		res.json(e);
		return next(e);
	}
});

app.get('/api/version', nocache, (req: $Request, res: $Response) => {
	const ip = req.connection.remoteAddress;
	const os = require( 'os' );
	const ipheader = req.headers['x-forwarded-for'];

	res.json({ version: VERSION, 
		environment: process.env.NODE_ENV, 
		debug: DEBUG,
		ip: ip,
		ipheader: ipheader,
	});
});

// Sample endpoint to generate an error.
app.get('/api/error', nocache, 
	(req: $Request, res: $Response, next: NextFunction) => {

	try {
		throw new Error('test');
	} catch (e) {
		log_error(e);
		next(e);
	}
});

const build_path = (filename: string): string => {
	if(DEBUG) 
		return path.join(__dirname, '../../build/public/'+filename);
	else
		return path.join(__dirname, '../public/'+filename);
};

// Build files. Note that the paths don't work on :3000 when developing,
// but they do work when deployed due to passenger on dreamhost using that folder.
app.get('/favicon.ico', (req: $Request, res: $Response) => {
	res.sendFile(build_path('favicon.ico'));
});
app.get('/transformed.js', (req: $Request, res: $Response) => {
	res.sendFile(build_path('transformed.js'));
});
app.get('/transformed.js.map', (req: $Request, res: $Response) => {
	res.sendFile(build_path('transformed.js.map'));
});


// Load static files.
app.use('/static', express.static('public'));

// Default case that returns the general index page.
// Needed for when client is on a subpage and refreshes the page to return the react app.
// SHould be last.
app.get('*', (req: $Request, res: $Response) => {
	// If on local, don't add jsgames. On server, code is in subfolder.
	log_error( build_path('index.html'));
	res.sendFile(build_path('index.html'));
});


// Load bugsnag if it is defined in secret.js.
if(DEBUG === false && typeof BUGSNAG_API !== 'undefined' && BUGSNAG_API.length > 0) {
	var middleware = Bugsnag.getPlugin('express')

	// This handles any errors that Express catches. This needs to go before any
	// other error handlers. Bugsnag will call the `next` error handler they exist
	app.use(middleware.errorHandler)
}

process.on('uncaughtException', function (er: any) {
  log_error(er);
  process.exit(1);
});

app.listen(DEBUG ? 3000 : 80, function(){
	console.log('app started ' + (DEBUG ? 3000 : 80) + ' - ' + (new Date()).toString() );
});