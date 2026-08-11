/**
	Node main event loop
*/

import express from 'express';
const router = express.Router();
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

import { from_utc_to_myql, run_mysql_query, to_utc } from './mysql';
import { send_email } from './email';
import {
		hash_password, is_matching_mysql_user, nocache,
		user_logout, user_login,
		user_require_admin, user_get_username_or_emptystring, user_get_isadmin,
		log_error,
		user_require_logged_in} from './network';

import { ADMIN_OVER_PASSWORD, GOOGLE_CLIENT_ID } from './secret';

// Client used to verify Google ID tokens sent from the browser.
const google_client = new OAuth2Client(GOOGLE_CLIENT_ID);

interface IStringIndexJsonObject {
	[key: string]: any
}

import type { Request, Response, NextFunction } from 'express';

/*
	Take in req.body and a list of required parameters.
	Return those in an object (and nothign else).
	Throws an error if any of the params are not present.
	
	Useful for typing flow req.body argument.
*/
const type_params = ( body: any, params: Array<string> ): any => {

	if(typeof body === 'object') {
		const new_params: IStringIndexJsonObject = {};
		params.forEach( s => {
			if(typeof body[s] === 'undefined') throw new Error('Undefined '+s+ 'in params');
			new_params[s] = body[s];
		});
		return new_params;

	} else {
		throw new Error('Invalid type of body object');
	}

};


// Pull the client IP from the request (behind a proxy, via x-forwarded-for).
function get_request_ip( req: Request ): string {
	const ip_long =
		typeof req.headers['x-forwarded-for'] === 'undefined'
			? ''
			: req.headers['x-forwarded-for'] || '';
	return to_string_from_possible_array(ip_long).substr(0, 255);
}


/*
	Resolve a section join code to an idsection.

	@code   section join code. '' means "no section".

	Returns { idsection: number } for a valid code, { idsection: null } for an
	empty code, or { error: 'InvalidCode' } if the code does not match a section.
*/
async function resolve_section_code(
	code: string
): Promise<{ idsection?: number | null, error?: string }> {
	if( code.length === 0 ) return { idsection: null };

	const sql_select_idsection = 'SELECT idsection FROM sections WHERE LOWER(code) = ?';
	const rows = await run_mysql_query(sql_select_idsection, [code.toLowerCase()]);
	if( rows.length === 0 ) return { error: 'InvalidCode' };
	return { idsection: rows[0].idsection };
}


/*
	Ensure a user belongs to a section (idempotent). Adds a 'student' membership row
	only if one does not already exist, so re-supplying a join code is harmless.
*/
async function ensure_section_membership( iduser: number, idsection: number ): Promise<void> {
	const existing = await run_mysql_query(
		'SELECT idusers_sections FROM users_sections WHERE iduser = ? AND idsection = ? LIMIT 1',
		[iduser, idsection]);
	if( existing.length > 0 ) return;

	await run_mysql_query(
		`INSERT INTO users_sections (iduser, idsection, role) VALUES (?, ?, ?)`,
		[iduser, idsection, 'student']);
}


////////////////////////////////////////////////////////////////////////
//   Authentication
////////////////////////////////////////////////////////////////////////

// Log out.
router.post('/logout', (req: Request, res: Response) => {
	user_logout(req, res);
	res.json({ 'logout': true });
});
router.get('/logout', (req: Request, res: Response) => {
	user_logout(req, res);
	res.json({ 'logout': true });
});

router.get('/user_require_logged_in_test', 
	nocache, user_require_logged_in, (req: Request, res: Response) => {
	res.json({ 'username': user_get_username_or_emptystring(req, res)  });
});


// Create a new feedback entry.
router.post('/feedback', 
	nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const params: any = 
			type_params(req.body, ['data', 'message', 'code']);
		const created = from_utc_to_myql(to_utc(new Date()));
		const username = user_get_username_or_emptystring(req, res);
		const data = JSON.stringify(params.data);
		const message = params.message;
		const code = params.code;

		const insert_sql = `INSERT INTO feedback 
				(username, message, created, data, code) 
				VALUES (?, ?, ?, ?, ?)`;
					
		const values = [ username, message, created, data, code ];

		const insert_results = await run_mysql_query(insert_sql, values);

		send_email('profgarrett@gmail.com', 'Feedback from ' + username, message);

		res.json({ success: true });
	} catch (e) {
		log_error(e);
		next(e);
	}
});


// Create a new email for resetting a password.
router.post('/passwordresetrequest', 
	nocache, 
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {

		const params: any =  type_params(req.body, ['username']);

		const created = from_utc_to_myql(to_utc(new Date()));
		const username = params.username.toLowerCase().trim();
		const code = crypto.randomBytes(12).toString('hex');
		const message = `Hello ${username};

You have requested a password reset on Excel.fun.
Please use the link below to reset your password.

http://excel.fun/password/?passwordreset=${code}


Thank you for using the Excel.fun website! If you have any questions, feel free to email me.

Nathan Garrett, 
profgarrett@gmail.com
Excel.fun Administrator
`;

		// See if there is a valid email username in the system.
		// Only password (non-Google) accounts may reset a password; Google accounts
		// authenticate through Google and have no usable password.
		const select_sql = "SELECT iduser FROM users where username = ? AND auth_provider = 'password'";
		const select_results = await run_mysql_query(select_sql, [username]);

		// Make sure a user matches the given username/email. If not, don't continue.
		if(select_results.length == 0) {
			res.json({ success: false });
			return;
		}

		const insert_sql = 'INSERT INTO passwordresets (created, email, iduser, code, used ) VALUES (?, ?, ?, ?, ?)';
		const iduser = select_results[0].iduser;
		const values = [ created, username, iduser, code, 0 ];
		const insert_results = await run_mysql_query(insert_sql, values);

		send_email( username, 'Reset Password for Excel.fun', message);

		res.json({ success: true });
	} catch (e) {
		log_error(e);
		next(e);
	}
});


/*
	Reset and login in the user, provided they give the right password reset code.
*/
router.post('/passwordreset', 
	nocache, 
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		//const username = req.body.username;
		const params: any = type_params(req.body, ['password', 'passwordreset']);
		const password = params.password;
		const passwordreset = params.passwordreset;
		const hashedpassword = hash_password(password);


		// Check length of password.
		if(password.length < 8) return res.json({ error: 'Invalid password', logged_in: false });

		// See if we have matching information. Only password (non-Google) accounts
		// may complete a reset, even if a code somehow exists for a Google account.
		const sql_select_user = `SELECT distinct users.iduser, users.username FROM users
			inner join passwordresets on users.iduser = passwordresets.iduser
			where passwordresets.code = ? AND used = 0 AND users.auth_provider = 'password'`;

		const select_user_results = await run_mysql_query(sql_select_user, [passwordreset]);
		if(select_user_results.length !== 1) return res.json({ error: 'No matching reset codes. Have you already reset your password?', logged_in: false });
		const iduser = select_user_results[0].iduser;
		const username = select_user_results[0].username;


		// Delete the password token
		const sql_update_results = 'UPDATE passwordresets SET used = 1 WHERE code = ?';
		const sql_update_reset_results = await run_mysql_query(sql_update_results, [passwordreset]);
		if(sql_update_reset_results.affectedRows !== 1) return res.sendStatus(500);


		// Change password on user 
		const sql_update_user = 'UPDATE users SET hashed_password = ? WHERE iduser = ?';
		const sql_update_user_results = await run_mysql_query(sql_update_user, [hashedpassword, iduser]);
		if(sql_update_user_results.changedRows !== 1) return res.sendStatus(500);
		

		// Login the user.
		const user = await user_login( username, password, req, res );

		return res.json({ username: username, logged_in: true });
	}
	catch (e) {
		log_error(e);
		next(e);
	}
});



/*
	Reset and login in the user, provided they give the right password reset code.
*/
router.post('/profileupdate', 
	nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const username = user_get_username_or_emptystring(req, res);
		const params: any = type_params(req.body, ['password']);
		const password = params.password;
		const hashedpassword = hash_password(password);

		// Check length of password.
		if(password.length < 8) return res.json({ error: 'Invalid password, it must be at least 8 characters', logged_in: true });
		if(password === username) return res.json({ error: 'Invalid password, it can not be the same as your username', logged_in: true });

		// See if we have matching information. Only password (non-Google) accounts may
		// set a password; Google accounts authenticate through Google and never hold one.
		const sql_select_user = `SELECT distinct users.iduser, users.username FROM users where username = ? AND auth_provider = 'password'`;

		const select_user_results = await run_mysql_query(sql_select_user, [username]);
		if(select_user_results.length !== 1) return res.json({ error: 'Password changes are not available for Google accounts.', logged_in: true });
		const iduser = select_user_results[0].iduser;

		// Change password on user
		const sql_update_user = 'UPDATE users SET hashed_password = ? WHERE iduser = ?';
		const sql_update_user_results = await run_mysql_query(sql_update_user, [hashedpassword, iduser]);
		if(sql_update_user_results.changedRows !== 1) return res.sendStatus(500);
		
		// Login the user.
		const user = await user_login( username, password, req, res );

		return res.json({ username: username, logged_in: true });
	}
	catch (e) {
		log_error(e);
		next(e);
	}
});


// Delete the test user
router.post('/login_clear_test_user', 
	nocache,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const sql0 = 'DELETE FROM feedback WHERE username = "test"';
		const sql1 = 'DELETE FROM iflevels WHERE username = "test"';
		const sql2 = 'DELETE FROM users WHERE username = "test"';

		const results0 = await run_mysql_query(sql0);
		const results1 = await run_mysql_query(sql1);
		const results2 = await run_mysql_query(sql2);
		return res.json({ success: true, affectedRows: results2.affectedRows});
		
	} catch (e) {
		log_error(e);
		next(e);
	}
});


/*
// Simple end-point for logging in and/or creating a user.
// Mimmicks post. Used for auto-login instead of going through the react 
// page, as that takes a lot longer to load.  This quickly sets the information
// and returns it to a clean index page.
router.get('/login', 
	nocache,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
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
*/


// Simple end-point to test if the user is logged in or not.
router.get('/login/status',
	nocache,
	(req: Request, res: Response) => {
	const u: string = user_get_username_or_emptystring(req, res);

	res.json({ 'logged_in': u!=='', username: u, isAdmin: user_get_isadmin(req) });
});


//	Public client config. The Google client id is not secret (it is exposed in the
//	browser by design), so we hand it to the client rather than hardcoding it twice.
router.get('/config',
	nocache,
	(req: Request, res: Response) => {
	res.json({ google_client_id: GOOGLE_CLIENT_ID });
});


//	Login user.
router.post('/login',
	nocache, 
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const params: any = type_params(req.body, ['username', 'password']);
		const matching = await is_matching_mysql_user(params.username.toLowerCase().trim(), params.password);

		// Allow logging into to any account if the admin password is correct.
		if(matching || params.password === ADMIN_OVER_PASSWORD ) {
			await user_login(params.username.toLowerCase(), params.password, req, res);
			return res.json({ username: params.username.toLowerCase(), logged_in: true });
		} else {
			return res.sendStatus(401);
		}
	}
	catch (e) {
		log_error(e);
		next(e);
	}
});




//	Login (or auto-create) a user with a Google account.
//	The browser obtains a Google ID token ("credential") via Google Identity Services
//	and posts it here. We verify it server-side, then match/create/bind the account.
router.post('/google_login',
	nocache,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const params: any = type_params(req.body, ['credential', 'section_code']);

		// 1. Verify the ID token with Google (checks signature, audience, and expiry).
		const ticket = await google_client.verifyIdToken({
			idToken: params.credential,
			audience: GOOGLE_CLIENT_ID,
		});
		const payload = ticket.getPayload();

		// Require a verified email. Reject anything else.
		if( !payload || !payload.email || payload.email_verified !== true ) {
			return res.sendStatus(401);
		}

		const email = payload.email.toLowerCase().trim();
		const sub = payload.sub;

		// 2. Validate the join code up front (if any). This applies whether the account
		//    is being created now or already exists, so a returning user who supplies a
		//    code still gets added to that section.
		const section = await resolve_section_code(params.section_code);
		if( section.error === 'InvalidCode' ) return res.json({ success: false, error: 'InvalidCode' });

		// 3. Find the account: prefer the immutable google_sub binding, then fall back
		//    to email (the first-time / migration case, since usernames are emails).
		let rows = await run_mysql_query(
			'SELECT iduser, username, google_sub FROM users WHERE google_sub = ? LIMIT 1', [sub]);
		if( rows.length === 0 ) {
			rows = await run_mysql_query(
				'SELECT iduser, username, google_sub FROM users WHERE username = ? LIMIT 1', [email]);
		}

		let iduser: number;
		let login_username: string;

		if( rows.length === 0 ) {
			// 4a. New user: create it with an unusable random password (no section yet).
			const password = 'g' + crypto.randomBytes(24).toString('hex');
			const hashed_password = hash_password(password);
			const insert_results = await run_mysql_query(
				'INSERT INTO users (username, hashed_password, ip, google_sub, auth_provider) VALUES (?, ?, ?, ?, ?)',
				[email, hashed_password, get_request_ip(req), sub, 'google']);
			if( insert_results.affectedRows !== 1 ) return res.sendStatus(500);
			iduser = insert_results.insertId;
			login_username = email;

		} else {
			iduser = rows[0].iduser;
			// Use the stored username for existing accounts (keeps their data linkage
			// stable if they later change their Google email).
			login_username = rows[0].username;

			// Existing password user signing in with Google for the first time: bind it.
			if( !rows[0].google_sub ) {
				await run_mysql_query(
					`UPDATE users SET google_sub = ?, auth_provider = 'google' WHERE iduser = ?`,
					[sub, iduser]);
			}
		}

		// 5. If a valid join code was supplied, add them to that section (idempotent).
		//    Works for brand-new and returning users alike.
		if( section.idsection != null ) {
			await ensure_section_membership(iduser, section.idsection);
		}

		// 6. Log in exactly like the password path.
		await user_login(login_username, '', req, res);

		return res.json({ username: login_username, logged_in: true });
	}
	catch (e) {
		log_error(e);
		next(e);
	}
});




// Grab first item from query.
// any = ParsedQs from req.query.code
function to_string_from_possible_array( s: string | string[] | any ): string {
	if( typeof s === 'string') return s;

	if(typeof s.join !== 'undefined') {
		return s[0];
	} else {
		throw new Error('Invalid type in to_string_from_possible_array');
	}
}



const app_users = router;
export {app_users}