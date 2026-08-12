/**
	Node main event loop
*/
import express from 'express';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';

// @ts-ignore
import compression from 'compression';
// @ts-ignore
import cookieParser from 'cookie-parser';

import { DEBUG } from './secret.js'; 

// Add a more realistic delay when in debug, useful for making that loading status screens work properly.
const DEBUG_DELAY = DEBUG ? 500 : 0;

import { update_mysql_database_schema } from './mysql';
import { nocache, log_error, session_refresh, session_initialize } from './network';


import type { Request, Response, NextFunction } from 'express';
// import type { Connection } from 'mysql';

const app = express();

// Trust the proxy. Required both in development and on DreamHost, where Apache
// mod_proxy sits in front of this daemon and forwards the real scheme and client IP
// in X-Forwarded-* headers.
app.set('trust proxy', 1)

/*
	Force HTTPS.

	This used to live in .htaccess. Under DreamHost's proxy server the document root is
	no longer served by Apache, so none of the .htaccess rules run any more and the
	redirect has to happen here.

	Deliberately keyed on the header being present and equal to 'http' rather than on
	`!req.secure`. If Apache ever stops sending X-Forwarded-Proto, `!req.secure` would be
	true for every request and the app would redirect to itself forever; this version
	simply stops redirecting instead.
*/
app.use((req: Request, res: Response, next: NextFunction) => {
	if (!DEBUG && req.headers['x-forwarded-proto'] === 'http') {
		return res.redirect(301, 'https://' + req.headers.host + req.originalUrl);
	}
	next();
});

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

// Note: 'trust proxy' is already set to 1 at the top of this file, which trusts
// exactly one hop (DreamHost's Apache mod_proxy). Do not set it to `true` here --
// that trusts every hop and lets a client spoof X-Forwarded-For / X-Forwarded-Proto.


// Log requests and arguments to the console for easier debugging.
if(DEBUG)
	app.use(
		(req: Request, res: Response, next: NextFunction) => {
			const keys = Object.keys(req.params);

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

import { app_admin } from './app_admin';
app.use('/api/admin', app_admin);

import { app_pages } from './app_pages';
app.use('/api/pages', app_pages);

import { app_pageviews } from './app_pageviews';
app.use('/api/pageviews', app_pageviews);

import { app_quizviews } from './app_quizviews';
app.use('/api/quizviews', app_quizviews);

import { app_quizsessions } from './app_quizsessions';
app.use('/api/quizsessions', app_quizsessions);


////////////////////////////////////////////////////////////////////////
//  Some basic routes.
////////////////////////////////////////////////////////////////////////


// Update SQL schema to latest.  Safe to re-run.
app.get('/api/sql/', 
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	
	try {
		const v = await update_mysql_database_schema();
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

	res.json({ 
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

const getRouteParamString = (value: string | string[] | undefined, fallback = ''): string => {
	if (typeof value === 'undefined') return fallback;
	if (Array.isArray(value)) return value[0] ?? fallback;
	return value;
};

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

/*
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
	const p = getRouteParamString(req.params.p);
	res.sendFile(build_path('main'+p+'.js'));
});
app.get('/main:p.js.map', (req: Request, res: Response) => {
	const p = getRouteParamString(req.params.p);
	res.sendFile(build_path('main' + p + '.js.map'));
});
*/


// Load static files.
// When published for real, this should be set through .htaccess to avoid hitting express.
// In development we serve both built assets and the in-repo static tree so markdown images
// and other page assets resolve correctly under /static.
const staticRoots = [
	build_path('static'),
	path.resolve(__dirname, '../public/static'),
	path.resolve(__dirname, '../../static'),
].filter((candidate) => fs.existsSync(candidate));

for (const staticRoot of staticRoots) {
	app.use('/static', express.static(staticRoot));
}

/*
	Real 404s for /api and /static.

	These must come before the SPA catch-all below. Without them a mistyped API route
	or a missing image returns index.html with status 200, which makes every proxy or
	deploy problem ambiguous -- the browser sees "success" and renders HTML where it
	expected JSON or a PNG. Diagnose once, and this pays for itself.
*/
app.use('/api', (req: Request, res: Response) => {
	res.status(404).json({ error: 'Not found', path: req.originalUrl });
});

app.use('/static', (req: Request, res: Response) => {
	res.status(404).type('text/plain').send('Not found');
});

// Default case that returns the general index page.
// Needed for when client is on a subpage and refreshes the page to return the react app.
// Should be last.
// Only run when in production, signaled by DEBUG = false.  
// In development, webpack-dev-server handles this.
/*
app.get(/^(.*)$/, (req: Request, res: Response) => {
	// Note: do NOT log_error() here. In production log_error appends to log.txt, and
	// this route fires on every single page load, so logging grows the file without
	// bound and opens a write stream per request.
	res.sendFile(build_path('index.html'));
});
*/
//if (process.env.NODE_ENV !== 'production') {
//    app.use(express.static(path.join(__dirname, 'build')));
//    app.get(/^(?!\/api\/).*/, (req, res) => res.sendFile(indexPath));
//}

process.on('uncaughtException', function (er: any) {
  log_error(er);
  process.exit(1);
});

/*
	Listen port.

	Deliberately NOT tied to DEBUG. DreamHost's proxy server only forwards to ports
	8000-65535, so binding 80 in production means the proxy can never reach this daemon
	and the site goes dark. The port and the debug flag are independent concerns; keeping
	them coupled meant turning DEBUG off would take production down.

	Override with PORT if the proxy is ever pointed somewhere else.
*/
const PORT = Number(process.env.PORT) || 9000;

app.listen(PORT, function(){
	console.log('app started on port ' + PORT + ' (debug=' + DEBUG + ') - ' + (new Date()).toString() );
});
