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

import { DEBUG, MYSQL_HOST, MYSQL_DATABASE } from './secret.js';

// Add a more realistic delay when in debug, useful for making that loading status screens work properly.
const DEBUG_DELAY = DEBUG ? 500 : 0;

import { update_mysql_database_schema, db_ping, is_db_unavailable_error } from './mysql';
import { nocache, log_error, session_refresh, session_initialize, build_api_error_response } from './network';


import type { Request, Response, NextFunction } from 'express';
// import type { Connection } from 'mysql';

const app = express();

// Trust the proxy. Required both in development and on DreamHost, where nginx sits in
// front of this daemon and forwards the real scheme and client IP in X-Forwarded-*
// headers. See the /api/ location block in dreamhost_config/nginx/excel.fun/settings.conf.
app.set('trust proxy', 1)

/*
	HTTPS is NOT enforced here. It is enforced in nginx.

	There used to be an express middleware at this point that 301'd any request whose
	X-Forwarded-Proto was 'http'. It was dead code and was removed.

	Why it was dead: nginx serves index.html, /main.<hash>.js and /static/ straight off
	disk and only proxies `location /api/` to this daemon. A student typing "excel.fun"
	never reached node at all, so nothing redirected them -- they got the whole SPA over
	plain http with a 200. The only requests that DID reach the middleware were /api/
	calls, and 301'ing an XHR POST is actively harmful: fetch follows the redirect but
	rewrites the method to GET, so the body is silently dropped.

	Enforcement now lives in block 0 of dreamhost_config/nginx/excel.fun/settings.conf,
	at server level, so it runs before location matching and covers every path. HSTS is
	set there too, so after the first visit the browser never tries http again.
*/

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
				console.log(req.method, req.url, keys, 'ip=' + req.ip);
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

// Mounted under /api/admin, but a separate router: the traffic report reads
// pageviews rather than managing users and sections.
import { app_traffic } from './app_traffic';
app.use('/api/admin/traffic', app_traffic);

// Also mounted under /api/admin as its own router. app_admin has no /nicknames
// route, so express falls through to this one.
import { app_nicknames } from './app_nicknames';
app.use('/api/admin/nicknames', app_nicknames);

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
		// Note: only next(e). This used to also res.json(e) first, which sent an empty
		// {} (Error fields are non-enumerable) and then made express throw
		// ERR_HTTP_HEADERS_SENT on top of the original problem. The error middleware at
		// the bottom of this file now writes the response.
		return next(e);
	}
});


/*
	Health check.

	Answers 200 {db:'up'} or 503 {db:'down'}. Three uses:
		1. the client shows a banner before a student types anything (Api.ts / ServiceHealth.tsx),
		2. something to curl during a deploy,
		3. a URL for uptime monitoring that actually exercises the database rather than
		   just proving node is listening.

	Deliberately does NOT log_error(): this endpoint can be polled, and in production
	log_error appends to log.txt on every call.
*/
app.get('/api/health', nocache,
	async (req: Request, res: Response): Promise<any> => {

	const started = Date.now();

	try {
		await db_ping();
		return res.json({ status: 'ok', db: 'up', ms: Date.now() - started });
	} catch(e: any) {
		return res.status(503).set('Retry-After', '60').json({
			status: 'degraded',
			db: 'down',
			error_code: is_db_unavailable_error(e) ? 'DB_UNAVAILABLE' : 'SERVER_ERROR',
			ms: Date.now() - started,
		});
	}
});

/*
	Version and build metadata for /api/version.

	The version string comes from package.json. The build date comes from the webpack
	bundle filename, which webpack.production.config.js stamps as
	main.YYYYMMDD-HHMMSS.[chunkhash].js. Reading the timestamp off the filename rather
	than the file's mtime is deliberate: scp/rsync rewrite mtimes on deploy, so the
	filename is the only record of when the bundle was actually built.

	Neither value can change while the process is running, so both are read once and
	cached.
*/
type VersionInfo = {
	version: string | null;
	build_file: string | null;
	build_dt: string | null;
};

// The layout differs between development (src/server) and the VPS
// (jsgames/build/server, with package.json two levels further up in excel.fun/),
// so walk up rather than hard-coding either path.
const find_package_json = (): string | null => {
	let dir = __dirname;

	for (let i = 0; i < 6; i++) {
		const candidate = path.join(dir, 'package.json');
		if (fs.existsSync(candidate)) return candidate;

		const parent = path.dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}
	return null;
};

const read_build_info = (): { build_file: string | null, build_dt: string | null } => {
	try {
		const main = fs.readdirSync(build_path(''))
			.find( f => /^main\..*\.js$/.test(f) );

		if(!main) return { build_file: null, build_dt: null };

		const m = main.match(/^main\.(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})\./);
		if(!m) return { build_file: main, build_dt: null };

		/*
			Returned without a timezone offset on purpose. The stamp is the build
			machine's local time, and the server that reads it here may well be in
			a different zone, so appending 'Z' or the server's own offset would
			produce a confidently wrong instant.
		*/
		const build_dt = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}`;

		return { build_file: main, build_dt: build_dt };
	} catch (e) {
		return { build_file: null, build_dt: null };
	}
};

let version_info: VersionInfo | null = null;

const get_version_info = (): VersionInfo => {
	if(version_info !== null) return version_info;

	let version: string | null = null;

	try {
		const p = find_package_json();
		if(p) version = JSON.parse(fs.readFileSync(p, 'utf8')).version ?? null;
	} catch (e) {
		version = null;
	}

	version_info = { version, ...read_build_info() };
	return version_info;
};

app.get('/api/version', nocache, (req: Request, res: Response) => {
	const ip = req.connection.remoteAddress;
	const ipheader = req.headers['x-forwarded-for'];
	const info = get_version_info();

	res.json({
		version: info.version,
		build_file: info.build_file,
		build_dt: info.build_dt,
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
//
// Order matters: express.static returns the FIRST match, so whichever root is
// listed first wins. In development the repo's static/ folder must come first --
// build/public/static is a snapshot from the last build.sh run, so leaving it
// first means edits to static/styles.css silently do nothing until you rebuild.
// In production build/public/static is the only real copy, so it leads.
const staticRoots = (DEBUG
	? [
		path.resolve(__dirname, '../../static'),
		build_path('static'),
		path.resolve(__dirname, '../public/static'),
	]
	: [
		build_path('static'),
		path.resolve(__dirname, '../public/static'),
		path.resolve(__dirname, '../../static'),
	]
).filter((candidate) => fs.existsSync(candidate));

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

/*
	Error handler. MUST be last, and MUST take four arguments.

	Without this, express falls back to its own default handler, which answers with an
	HTML page -- a full stack trace (absolute paths and all) in development, the string
	"Internal Server Error" in production. Every API caller in src/app then does
	response.json() on that HTML, gets a SyntaxError, and shows the student
	"Unexpected token '<'..." in a red box. That is what a stopped database looked like
	from the login screen.

	Four arguments is not decoration: express decides a middleware is an error handler
	by its arity. Drop the unused `next` and this silently stops running.

	Note also that the /api and /static 404 handlers above are ordinary middleware, so
	express skips them once an error is in flight -- they cannot do this job.
*/
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, req: Request, res: Response, next: NextFunction) => {

	// Something already started writing (eg a route that sent a partial response and
	// then blew up). Hand back to express, which will close the connection.
	if(res.headersSent) return next(err);

	log_error(err);

	const { status, headers, body } = build_api_error_response(err, DEBUG);

	res.status(status).set(headers);

	// API callers get JSON (that is the whole point). A browser asking for a page gets
	// the same sentence as plain text rather than a JSON blob it cannot read.
	if(req.path.indexOf('/api') === 0) {
		return res.json(body);
	}
	return res.type('text/plain').send(body.message);
});


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

app.listen(PORT, async function(){
	console.log('app started on port ' + PORT + ' (debug=' + DEBUG + ') - ' + (new Date()).toString() );

	/*
		Prove the database is reachable at startup instead of finding out from a student.
		Deliberately non-fatal: the process stays up so /api/health can report what is
		wrong, and so a database that comes back on its own needs no restart here.
	*/
	try {
		await db_ping();
		console.log('database connection ok (' + MYSQL_HOST + '/' + MYSQL_DATABASE + ')');
	} catch(e: any) {
		console.error(
			'DATABASE UNREACHABLE at startup: ' + (e && e.code ? e.code : e) + '. ' +
			'Logins, saves and reports will all fail until this is fixed. Check that mysqld ' +
			'is running and that MYSQL_HOST / MYSQL_USER / MYSQL_PASSWORD / MYSQL_DATABASE ' +
			'in src/server/secret.js are right. /api/health reports current status.');
	}
});
