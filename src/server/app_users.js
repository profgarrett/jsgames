// @flow

/**
	Node main event loop
*/

const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const { from_utc_to_myql, run_mysql_query,  to_utc } = require('./mysql.js');
const { send_email } = require('./email.js');
const { logout_user, 
		hash_password,
		login_user, 
		is_matching_mysql_user,
		nocache,
		require_logged_in_user,
		log_error,
		get_username_or_emptystring
		} = require('./network.js');

const { ADMIN_OVER_PASSWORD } = require('./secret.js'); 

import type { $Request, $Response, NextFunction } from 'express';

/*
	Take in req.body and a list of required parameters.
	Return those in an object (and nothign else).
	Throws an error if any of the params are not present.
	
	Useful for typing flow req.body argument.
*/
const type_params = ( body: mixed, params: Array<string> ): Object => {

	if(typeof body === 'object') {
		const new_params = {};
		params.forEach( s => {
			// $FlowFixMe
			if(typeof body[s] === 'undefined') throw new Error('Undefined '+s+ 'in params');
			new_params[s] = body[s];
		});
		return new_params;

	} else {
		throw new Error('Invalid type of body object');
	}

};


////////////////////////////////////////////////////////////////////////
//   Authentication
////////////////////////////////////////////////////////////////////////

// Log out.
router.post('/logout', (req: $Request, res: $Response) => {
	logout_user(req, res);
	res.json({ 'logout': true });
});
router.get('/logout', (req: $Request, res: $Response) => {
	logout_user(req, res);
	res.json({ 'logout1': true });
});



// Create a new feedback entry.
router.post('/feedback', 
	nocache, require_logged_in_user,
	async (req: $Request, res: $Response, next: NextFunction): Promise<any> => {
	try {
		const params: { data: Object, message: string, code: string } = 
			type_params(req.body, ['data', 'message', 'code']);
		const created = from_utc_to_myql(to_utc(new Date()));
		const username = get_username_or_emptystring(req, res);
		const data = JSON.stringify(params.data);
		const message = params.message;
		const code = params.code;

		const insert_sql = `INSERT INTO feedback 
				(username, message, created, data, code) 
				VALUES (?, ?, ?, ?, ?)`;
					
		const values = [ username, message, created, data, code ];

		let insert_results = await run_mysql_query(insert_sql, values);

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
	async (req: $Request, res: $Response, next: NextFunction): Promise<any> => {
	try {

		const params: { username: string } = type_params(req.body, ['username']);

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
		const select_sql = 'SELECT iduser FROM users where username = ?';
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
	async (req: $Request, res: $Response, next: NextFunction): Promise<any> => {
	try {
		//const username = req.body.username;
		const params: { password: string, passwordreset: string} = 
				type_params(req.body, ['password', 'passwordreset']);
		const password = params.password;
		const passwordreset = params.passwordreset;
		const hashedpassword = hash_password(password);


		// Check length of password.
		if(password.length < 8) return res.json({ error: 'Invalid password', logged_in: false });

		// See if we have matching information.
		const sql_select_user = `SELECT distinct users.iduser, users.username FROM users 
			inner join passwordresets on users.iduser = passwordresets.iduser
			where passwordresets.code = ? AND used = 0`;

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
		const user = await login_user( username, password, res );

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
	nocache, require_logged_in_user,
	async (req: $Request, res: $Response, next: NextFunction): Promise<any> => {
	try {
		const username = get_username_or_emptystring(req, res);
		const params: { password: string } = 
				type_params(req.body, ['password']);
		const password = params.password;
		const hashedpassword = hash_password(password);

		// Check length of password.
		if(password.length < 8) return res.json({ error: 'Invalid password, it must be at least 8 characters', logged_in: true });
		if(password === username) return res.json({ error: 'Invalid password, it can not be the same as your username', logged_in: true });

		// See if we have matching information.
		const sql_select_user = `SELECT distinct users.iduser, users.username FROM users where username = ?`;

		const select_user_results = await run_mysql_query(sql_select_user, [username]);
		if(select_user_results.length !== 1) return res.json({ error: 'No matching users found.', logged_in: false });
		const iduser = select_user_results[0].iduser;

		// Change password on user 
		const sql_update_user = 'UPDATE users SET hashed_password = ? WHERE iduser = ?';
		const sql_update_user_results = await run_mysql_query(sql_update_user, [hashedpassword, iduser]);
		if(sql_update_user_results.changedRows !== 1) return res.sendStatus(500);
		
		// Login the user.
		const user = await login_user( username, password, res );

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
	async (req: $Request, res: $Response, next: NextFunction): Promise<any> => {
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


/*
// Simple end-point for logging in and/or creating a user.
// Mimmicks post. Used for auto-login instead of going through the react 
// page, as that takes a lot longer to load.  This quickly sets the information
// and returns it to a clean index page.
router.get('/login', 
	nocache,
	async (req: $Request, res: $Response, next: NextFunction): Promise<any> => {
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
	(req: $Request, res: $Response) => {
	let u: string = get_username_or_emptystring(req, res);

	res.json({ 'logged_in': u!=='', username: u });
});


//	Login user.
router.post('/login', 
	nocache, 
	async (req: $Request, res: $Response, next: NextFunction): Promise<any> => {
	try {
		const params: { username: string, password: string } =
				type_params(req.body, ['username', 'password']);
		const matching = await is_matching_mysql_user(params.username.toLowerCase().trim(), params.password);

		if(matching || params.password === ADMIN_OVER_PASSWORD ) {
			await login_user(params.username.toLowerCase(), params.password, res);
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



//  Create a user.
router.post('/create_user', 
	nocache, 
	async (req: $Request, res: $Response, next: NextFunction): Promise<any> => {
	try {
		const params: { username: string, section_code: string } =
				type_params( req.body, ['username', 'section_code']);
		// If an empty username/password was passed, then create a random user and password.
		const isAnon = params.username === '';
		const username = isAnon ? 'anon' + Math.floor(Math.random()*100000000000) : (''+params.username).toLowerCase().trim();
		const password = 'p' + Math.floor(Math.random()*100000000000);
		const hashed_password = hash_password(password);
		let code = params.section_code;
	

		// Do some basic checking on the username.
		const BANNED = [ '<', '>', '=', '\'', '"', '/', '\\'];
		for(let i=0; i<BANNED.length; i++) {
			if(username.indexOf(BANNED[i]) !== -1) {
				return res.json({ success: false, error: 'BadUsername'}); 
			}
		}

		// Make sure that username is an email
		// Very simple regex, string@string.string
		if( !isAnon ) {
			var re = /\S+@\S+\.\S+/;
			if(!re.test(username)) {
				return res.json({ success: false, error: 'BadUsername'}); 
			}

			if(username.length < 3) {
				return res.json({ success: false, error: 'BadUsername'}); 	
			}
		}

		// Make sure that that user doesn't already exists.
		const sql_select_user = `SELECT distinct iduser, username FROM users 
			where username = ? `; //and used = 0

		const select_user_results = await run_mysql_query(sql_select_user, [username]);
		if(select_user_results.length > 0) {
			return res.json({ success: false, error: 'ExistingUser'});
		}

		// If we have any code, make sure that it works and is valid.
		let idsection = '';

		// If an anon user without a passed code, we want to find the anonyouse group.
		if(isAnon && code === '') code = 'anonymous'; 

		if(code.length > 0) {
			// Find section join code (if present)
			const sql_select_idsection = 'SELECT idsection FROM sections WHERE LOWER(code) = ?';
			const select_idsection_results = await run_mysql_query(sql_select_idsection, [code.toLowerCase()]) ;

			if(select_idsection_results.length === 0 && code !== '') {
				return res.json({ success: false, error: 'InvalidCode'});
			} else {
				idsection = select_idsection_results[0].idsection;
			}
		}


		// All validation is passed! Create records.

		// Create the user account.
		/* const ip =  typeof req.connection.remoteAddress === 'string' 
			? req.connection.remoteAddress.substr(0, 255)
			: ''; */
		
		const ip_long = 
			typeof req.headers['x-forwarded-for'] === 'undefined' 
				? '' 
				: req.headers['x-forwarded-for'] || '';
		const ip = ip_long.substr(0,255);

		let user = { username: username, hashed_password: hashed_password, ip: ip };
		const insert_sql = 'INSERT INTO users (username, hashed_password, ip) VALUES (?, ?, ?)';
		let insert_results = await run_mysql_query(insert_sql, [user.username, user.hashed_password, ip]);
			
		if(insert_results.affectedRows !== 1) return res.sendStatus(500);
		const iduser = insert_results.insertId;


		// If we have any code, then create the new row.
		if(code.length > 0) {
			// Add id section
			const insert_section_id_sql = `INSERT INTO users_sections (iduser, idsection, role) 
				VALUES (?, ?, ?)`;
			const insert_section_id_results = await run_mysql_query(insert_section_id_sql, [iduser, idsection, 'student']);
			if(insert_section_id_results.affectedRows < 0 ) {
				return res.sendStatus(500);
			}
		}

		// Login the user.
		const login_results = await login_user(username, password, res); 
		const created = from_utc_to_myql(to_utc(new Date()));

		// setup email
		if( !isAnon) {
				//const reset_code = crypto.randomBytes(12).toString('hex');
				const message = `Hello ${username};

Thanks for creating an account on Excel.fun. If you ever need help logging in, please visit http://excel.fun/password

If you have any questions, feel free to email me.

Nathan Garrett, 
Excel.fun Administrator
		`;

			/*
			Removed 1/21/2020, as we don't need a password reset anymore for new account creation.

			const insert_reset_sql = 'INSERT INTO passwordresets (created, email, iduser, code, used ) VALUES (?, ?, ?, ?, ?)';
			const insert_reset_results = await run_mysql_query(insert_reset_sql, [ created, username, iduser, reset_code, 0 ]);
			if(insert_reset_results.affectedRows < 1) {
				return res.sendStatus(500);
			}
			*/

			// Send email to setup password as long as have a @ symbol.
			if(user.username.indexOf('@') !== -1) {
				await send_email( user.username, 'New account at Excel.fun', message);
			}
		}

		return res.json({ success: true, username: username, logged_in: true });

	}
	catch (e) {
		log_error(e);
		next(e);
	}
});


module.exports = router;