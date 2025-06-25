/**
	Node main event loop
*/
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';

// @ts-ignore
import compression from 'compression';
// @ts-ignore
import cookieParser from 'cookie-parser';

import { BUGSNAG_API, DEBUG, VERSION } from './secret.js'; 

// Add a more realistic delay when in debug, useful for making that loading status screens work properly.
const DEBUG_DELAY = DEBUG ? 500 : 0;

import { update_mysql_database_schema } from './mysql';
import { nocache, log_error, session_refresh, session_initialize } from './network';


import type { Request, Response, NextFunction } from 'express';
// import type { Connection } from 'mysql';

const app = express();

// Trust the proxy, as is used during development.
app.set('trust proxy', 1)

app.use( session_initialize() ) ;
app.use( session_refresh) ;

/////////////////////////////////////////////////////////////////////////////////////////
// Setup app
/////////////////////////////////////////////////////////////////////////////////////////


// Note: Compression only applies on this app.  You won't see it hit
// when developing with webpack, as that doesn't use this layer. When 
// deployed, and react is using the transformed.js file, then this works.
app.use(compression({filter: shouldCompress}));


function shouldCompress (req: Request, res: Response): boolean {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false;
  }

  // fallback to standard filter function
  return compression.filter(req, res);
}


// Set parsing for application/x-www-form-urlencoded
app.use(bodyParser.json({ limit: '10mb'}));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));

app.use(cookieParser());

// Allow trusting the IP from the proxy forwarding
app.set('trust proxy', true); //'loopback, linklocal');


// Log requests and arguments to the console for easier debugging.
if(DEBUG)
	app.use(
		(req: Request, res: Response, next: NextFunction) => {
			let keys = Object.keys(req.params);

			if(req.url !== '/favicon.ico') {
				console.log(req.method, req.url, keys);
			}
			next();
		});


// Slow down responses in debug mode.
if(DEBUG) 
	app.use(
		(req: Request, res: Response, next: NextFunction) => setTimeout(() => next(), DEBUG_DELAY)
	);




////////////////////////////////////////////////////////////////////////
//  Register routers
////////////////////////////////////////////////////////////////////////


import { app_levels } from './app_levels';
app.use('/api/levels', app_levels);

import { app_reports } from './app_reports';
app.use('/api/reports',app_reports);

import { app_sections } from './app_sections';
app.use('/api/sections',app_sections);

import { app_users } from './app_users';
app.use('/api/users', app_users);


////////////////////////////////////////////////////////////////////////
//  Some basic routes.
////////////////////////////////////////////////////////////////////////


// Update SQL schema to latest.  Safe to re-run.
app.get('/api/sql/', 
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	
	try {
		let v = await update_mysql_database_schema();
		res.json(v);
	} catch(e){
		log_error(e);
		res.json(e);
		return next(e);
	}
});

app.get('/api/version', nocache, (req: Request, res: Response) => {
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
	(req: Request, res: Response, next: NextFunction) => {

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

// Build files. Note that the paths work on :9000 when developing,
// and are essential when deploying.
app.get('/test', (req: Request, res: Response) => {
	res.send("<h1>Refresh 2</h1>");
});

app.get('/favicon.ico', (req: Request, res: Response) => {
	res.sendFile(build_path('favicon.ico'));
});
app.get('/transformed.js', (req: Request, res: Response) => {
	res.sendFile(build_path('transformed.js'));
});
app.get('/transformed.js.map', (req: Request, res: Response) => {
	res.sendFile(build_path('transformed.js.map'));
});
app.get('/meta.json', (req: Request, res: Response) => {
	res.sendFile(build_path('meta.json'));
});
app.get('/main:p.js', (req: Request, res: Response) => {
	res.sendFile(build_path('main'+req.params.p+'.js'));
});
app.get('/main:p.js.map', (req: Request, res: Response) => {
	res.sendFile(build_path('main' + req.params.p + '.js.map'));
});



// Load static files. 
// When published for real, this should be set through .htaccess to avoid hitting express
// However, it's useful to have this in place for development.
app.use('/static', express.static(build_path('static')));

// Default case that returns the general index page.
// Needed for when client is on a subpage and refreshes the page to return the react app.
// Should be last.
app.get('*', (req: Request, res: Response) => {
	// If on local, don't add jsgames. On server, code is in subfolder.
	log_error( build_path('index.html'));
	res.sendFile(build_path('index.html'));
});



process.on('uncaughtException', function (er: any) {
  log_error(er);
  process.exit(1);
});

app.listen(DEBUG ? 9000 : 80, function(){
	console.log('app started ' + (DEBUG ? 9000 : 80) + ' - ' + (new Date()).toString() );
});
