// @flow

/**
	Node main event loop
*/

const express = require('express');
const router = express.Router();


const { ADMIN_USERNAME } = require('./secret.js'); 

const { IfLevelModelFactory, IfLevelModel } = require('./IfGame');
const { IfLevels } = require('./../shared/IfGame');

const { from_utc_to_myql, run_mysql_query, is_faculty, to_utc } = require('./mysql.js');
const { require_logged_in_user, 
		nocache,
		log_error,
		get_username_or_emptystring, return_level_prepared_for_transmit} = require('./network.js');

const { turn_array_into_map } = require('./../shared/misc.js');
const { return_tagged_level } = require('./tag.js');


import type { $Request, $Response, NextFunction } from 'express';


////////////////////////////////////////////////////////////////////////
//  If Game
////////////////////////////////////////////////////////////////////////


// Create a new level for the currently logged in user with the given type.
router.post('/new_level_by_code/:code', 
	nocache, require_logged_in_user,
	async (req: $Request, res: $Response, next: NextFunction): Promise<any> => {
	try {
		const code = req.params.code;
		const username = get_username_or_emptystring(req, res);
		const level = IfLevelModelFactory.create(code, username);
		const now = from_utc_to_myql(to_utc(new Date()));

		const insert_sql = `INSERT INTO iflevels (type, username, code, title, description, completed, 
			pages, history, created, updated, seed, allow_skipping_tutorial, harsons_randomly_on_username, 
			standardize_formula_case, show_score_after_completing) 
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
		level.username = username;

					
		// Note: Must use toJson on pages, as that needs some extra care
		// before being stringified.
		const values = [level.type, level.username, level.code, level.title, level.description,
				level.completed ? 1 : 0, 
				JSON.stringify(level.pages.map( (p: Object ): Object => p.toJson() )), 
				JSON.stringify(level.history), 
				now, now,
				level.seed,
				level.allow_skipping_tutorial,
				level.harsons_randomly_on_username,
				level.standardize_formula_case,
				level.show_score_after_completing
				];

		let insert_results = await run_mysql_query(insert_sql, values);

		level._id = insert_results.insertId;

		res.json(return_level_prepared_for_transmit(level, true));
	} catch (e) {
		log_error(e);
		next(e);
	}
});


// List a list of classes that the logged in user has access to.
router.get('/sections', 
	nocache, require_logged_in_user, 
	async (req: $Request, res: $Response, next: NextFunction): Promise<any> => {
	try {
		const username = get_username_or_emptystring(req, res);

		if(username === '') throw new Error('Invalid username '+username+' for sections');

		const sql = `SELECT sections.*, users_sections.role FROM users 
				INNER JOIN users_sections on users.iduser = users_sections.iduser
			    INNER JOIN sections on users_sections.idsection = sections.idsection
				where users.username = ? ORDER BY opens DESC`;
		const params = [username];

		const sections = await run_mysql_query(sql, params);
		res.json(sections);

	} catch (e) {
		log_error(e);
		next(e);
	}
});



// List users in classes which this person is recorded as teaching.
router.get('/users', 
	nocache, require_logged_in_user,
	async (req: $Request, res: $Response, next: NextFunction): Promise<any> => {
	try {
		const username = get_username_or_emptystring(req, res);

		const sql = `SELECT DISTINCT student.iduser, student.username
				FROM users as teacher
				INNER JOIN users_sections as teacher_sections 
					ON teacher.iduser = teacher_sections.iduser
			        AND teacher_sections.role = 'faculty'
				LEFT OUTER JOIN users_sections as student_sections 
					ON student_sections.idsection = teacher_sections.idsection
			        AND student_sections.role = 'student'
				LEFT OUTER JOIN users as student 
					ON student_sections.iduser = student.iduser
			WHERE teacher.username = ?  
			ORDER BY username ASC`;
			
		const users = await run_mysql_query(sql, [username]);
		const clean_users = users.map( u => { return { iduser: u.iduser, username: u.username }; } );

		res.json(clean_users);
	} catch (e) {
		log_error(e);
		next(e);
	}
});


// List objects owned by the logged in user.
// :type may be 'all', or limited to a single code.
router.get('/levels/byCode/:code', 
	nocache, require_logged_in_user,
	async (req: $Request, res: $Response, next: NextFunction): Promise<any> => {
	try {
		const sql = 'SELECT * FROM iflevels WHERE username = ? AND (code = ? OR ? = "all")';
		const code = req.params.code;
		const username = get_username_or_emptystring(req, res);

		let iflevels = await run_mysql_query(sql, [username, code, code]);

		// Convert into models, and then back to JSON.
		iflevels = iflevels.map( (l: Object): Object => (new IfLevelModel(l)) );

		// Remove secret fields and transmit.
		iflevels = iflevels.map( (l: Object): Object => return_level_prepared_for_transmit(l, true));
		res.json(iflevels);
	} catch (e) {
		log_error(e);
		next(e);
	}
});


// Get completed or uncompleted objects owned by the logged in user.
// :type may be 'all', or limited to a single code.
router.get('/levels/byCompleted/:code', 
	nocache, require_logged_in_user,
	async (req: $Request, res: $Response, next: NextFunction): Promise<any> => {
	try {
		const sql = 'SELECT * FROM iflevels WHERE username = ? AND (completed = ?)';
		const code = req.params.code === 'true' || req.params.code === 'True';
		const username = get_username_or_emptystring(req, res);

		let iflevels = await run_mysql_query(sql, [username, code, code]);

		// Convert into models, and then back to JSON.
		iflevels = iflevels.map( (l: Object): Object => (new IfLevelModel(l)) );

		// Remove secret fields and transmit.
		iflevels = iflevels.map( (l: Object): Object => return_level_prepared_for_transmit(l, true));
		res.json(iflevels);
	} catch (e) {
		log_error(e);
		next(e);
	}
});


/**
	Gets a debug template for a given tutorial.
	Require current user to have the faculty role.

	Note that this doesn't hit the database at all, but instead builds a temporary 
	level and returns it to the user.
*/
router.get('/debuglevel/:code', nocache, require_logged_in_user,
	async (req: $Request, res: $Response, next: NextFunction): Promise<any> => {
	try {
		const param_code = req.params.code; // level code.
		const username = get_username_or_emptystring(req, res);

		// Only allow faculty to have access to debug levels.
		const is_faculty_result = await is_faculty(username);
		if(!is_faculty_result) throw new Error('User do not have permission to debug levels');

		// Make sure that the given code is valid. If not, then immediately fail
		// to avoid having some type of SQL injection issue.
		const code_in_array = IfLevels.filter( l => l.code === param_code).map( l => l.code );
		if(code_in_array.length !== 1)
			throw new Error('Invalid code type '+param_code+' passed to debuglevel');

		const level = IfLevelModelFactory.create(code_in_array[0], username);

		let loop_escape = 50;
		let last_page = {};

		while(!level.completed && loop_escape > 0) {
			loop_escape--; // emergency escape in case something goes wrong.

			// Complete last page.
			last_page = level.pages[level.pages.length-1];
			last_page.debug_answer();
			IfLevelModelFactory.addPageOrMarkAsComplete(level); 
		}

		res.json(return_level_prepared_for_transmit(level, false));
	} catch (e) {
		log_error(e);
		next(e);
	}
});


// Grab first item from query.
function to_string_from_possible_array( s: string | Array<any>): string {
	if( typeof s === 'string') return s;

	if(typeof s.join !== 'undefined') {
		return s[0];
	} else {
		throw new Error('Invalid type in to_string_from_possible_array')
	}
}


/**
	Gets a list of data useful for deeper analysis.
	Allows retrieving solutions, as it requires admin use.
*/
router.get('/questions/', nocache, require_logged_in_user,
	async (req: $Request, res: $Response, next: NextFunction): Promise<any> => {
	try {
		// Time limit on returned data.
		const INTERVAL = 360 + ' DAY';  // roughly one year

		// Only allow faculty to have access to questions
		const username = get_username_or_emptystring(req, res);
		const is_faculty_result = await is_faculty(username);
		if(!is_faculty_result) throw new Error('User do not have permission to review questions');

		// Get cleaned-up params (string or int)

		const param_code: string = (typeof req.query.code === 'undefined') 
				? '*' 
				: to_string_from_possible_array(req.query.code);
		const param_idsection = (typeof req.query.idsection === 'undefined') 
				? '*' 
				: parseInt(req.query.idsection, 10);
		const param_iduser = (typeof req.query.iduser === 'undefined') 
				? '*' 
				: parseInt(req.query.iduser, 0);

		const sql_params = [
			param_code, param_code,
			param_idsection, param_idsection,
			param_iduser, param_iduser
		];


		// Make sure that the given code is valid. If not, then immediately fail
		const code_in_array = IfLevels.filter( l => l.code === param_code).map( l => l.code );
		if(param_code !== '*' && param_code !== null && code_in_array.length !== 1)
			throw new Error('Invalid code type '+ param_code + ' passed to recent_levels');


		// Build SQL statement.
		// Note that we trust that all given params have already been cleaned up.
		const sql = `select distinct iflevels.* 
			from iflevels 
				inner join users on iflevels.username = users.username 
				left outer join users_sections on users_sections.iduser = users.iduser 
				left outer join sections on sections.idsection = users_sections.idsection 
				left outer join 
					(select TRUE as first, min(created) as created, username, code from iflevels group by username, code) as iflevelsmax 
					ON iflevels.created = iflevelsmax.created AND iflevels.username = iflevelsmax.username AND iflevels.code = iflevelsmax.code
			WHERE 
			
				(iflevels.code = ? OR ? = '*') AND 
				(sections.idsection = ? OR ? = '*') AND 
				(users.iduser = ? OR ? = '*') AND 
				iflevels.updated > NOW() - INTERVAL ${INTERVAL} AND 
				iflevels.username NOT IN ('xgarrettn') AND 
				iflevelsmax.first = 1`;


		let select_results = await run_mysql_query(sql, sql_params);

		if(select_results.length === 0) return res.json([]);

		let iflevels = select_results.map( (l: Object): Object => (new IfLevelModel(l)) );

		// Remove secret fields and transmit.
		iflevels = iflevels.map( (l: Object): Object => return_tagged_level(l) );
		iflevels = iflevels.map( (l: Object): Object => return_level_prepared_for_transmit(l, false));

		res.json(iflevels);
	} catch (e) {
		log_error(e);
		next(e);
	}
});


// Select object updated in the last time period..
// Allows retrieving solutions, as it requires faculty role.
router.get('/recent/', nocache, require_logged_in_user,
	async (req: $Request, res: $Response, next: NextFunction): Promise<any> => {
	try {
		const username = get_username_or_emptystring(req, res);
		const is_faculty_result = await is_faculty(username);
		if(!is_faculty_result) throw new Error('User does not have permission to review questions');

		// Set a default interval (in minutes) of 1 week. Otherwise, use passed 'updated'
		// Assumes passed interval is in days.
		const INTERVAL = typeof req.query.updated === 'undefined' 
				? 7*1 + ' DAY'  // 1 week
				: parseInt(req.query.updated,10) + ' DAY'; 

		const sql_where_clauses = ['iflevels.updated > NOW() - INTERVAL ' + INTERVAL];
		const sql_where_values = [];
		

		// Build SQL values.
		if(typeof req.query.iduser !== 'undefined') {
			sql_where_values.push(req.query.iduser);
			sql_where_clauses.push('users.iduser = ?');
		}

		if(typeof req.query.idsection !=='undefined') {
			sql_where_values.push(req.query.idsection);
			sql_where_clauses.push('sections.idsection = ?');
		}

		if(typeof req.query.code !=='undefined') {
			sql_where_values.push(req.query.code);
			sql_where_clauses.push('iflevels.code = ?');
		}

		// Permissions.
		sql_where_clauses.push('faculty.username = ?');
		sql_where_values.push(username);

		// Build SQL statement.
		const sql = `
SELECT distinct iflevels.* 
FROM iflevels
INNER JOIN users ON iflevels.username = users.username
INNER JOIN users_sections ON users.iduser = users_sections.iduser
INNER JOIN sections ON users_sections.idsection = sections.idsection
INNER JOIN users_sections as faculty_sections 
	ON faculty_sections.idsection = sections.idsection
	AND faculty_sections.role = 'faculty'
INNER JOIN users as faculty 
	ON faculty.iduser = faculty_sections.iduser
WHERE  ` + sql_where_clauses.join(' AND ') +
' ORDER BY iflevels.updated desc LIMIT 100';

		let select_results = await run_mysql_query(sql, sql_where_values);

		if(select_results.length === 0) return res.json([]);

		let iflevels = select_results.map( (l: Object): Object => (new IfLevelModel(l)) );

		// Remove secret fields and transmit.
		//iflevels = iflevels.map( (l: Object): Object => return_tagged_level(l) );
		iflevels = iflevels.map( (l: Object): Object => return_level_prepared_for_transmit(l, true));

		res.json(iflevels);
	} catch (e) {
		log_error(e);
		next(e);
	}
});


/**
	Get grades for registered users.
	
	If the param username is passed, then return that user's information only.
*/
router.get('/grades?', nocache, require_logged_in_user,
	async (req: $Request, res: $Response, next: NextFunction): Promise<any> => {
	try {
		let sql = ''; 
		const username = get_username_or_emptystring(req, res);
		const is_faculty_result = await is_faculty(username);
		const sql_where_values = [];


		// Two main workflows:
		//  If username provided, get self.  All are allowed to pull their own.
		// 	Else, only Faculty are allowed to poll with unique criteria.
		if(typeof req.query.username === 'undefined') {

			if(!is_faculty_result) throw new Error('Only faculty are allowed to get other user grades');

			const sql_where_clauses = ['iflevels.completed = ?'];
			sql_where_values.push(1);	

			// Set permissions to only return levels for the faculty's courses.
			sql_where_clauses.push('faculty.username = ?');
			sql_where_values.push(username);

			// We have a username given. Add it to conditions
			if(typeof req.query.username !== 'undefined') {
				sql_where_values.push(req.query.username);
				sql_where_clauses.push('users.username = ?');
			}

			// Build SQL values.  Only care about these params if it's a faculty user.
			if(typeof req.query.iduser !== 'undefined') {
				sql_where_values.push(req.query.iduser);
				sql_where_clauses.push('users.iduser = ?');
			}

			if(typeof req.query.idsection !=='undefined') {
				sql_where_values.push(req.query.idsection);
				sql_where_clauses.push('sections.idsection = ?');
			}

			if(typeof req.query.code !=='undefined') {
				sql_where_values.push(req.query.code);
				sql_where_clauses.push('iflevels.code = ?');
			}

			sql = `
SELECT DISTINCT iflevels.* 
FROM iflevels
INNER JOIN users ON iflevels.username = users.username
INNER JOIN users_sections ON users.iduser = users_sections.iduser
INNER JOIN sections ON users_sections.idsection = sections.idsection
INNER JOIN users_sections as faculty_sections 
	ON faculty_sections.idsection = sections.idsection
	AND faculty_sections.role = 'faculty'
INNER JOIN users as faculty 
	ON faculty.iduser = faculty_sections.iduser
WHERE ` + sql_where_clauses.join(' AND ') + ' ORDER BY iflevels.updated desc ';

		} else {
			// Make sure that we're getting records for the current user.
			if(username !== req.query.username ) throw new Error('You can not view grades for another user');

			// Set perms to only get results for the current logged in user.
			sql_where_values.push(username);

			sql = `
			SELECT DISTINCT iflevels.* 
			FROM iflevels
			WHERE username = ? and completed = 1`;
		}

		let select_results = await run_mysql_query(sql, sql_where_values);
		
		if(select_results.length === 0) return res.json([ ]);

		let iflevels = select_results.map( l => new IfLevelModel(l) );

		// Organize into a map of users.
		const users = turn_array_into_map(iflevels, l => l.username.toLowerCase().trim() );

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
router.get('/level/:id', nocache, require_logged_in_user,
	async (req: $Request, res: $Response, next: NextFunction): Promise<any> => {
	try {
		const sql = 'SELECT * FROM iflevels WHERE _id = ? AND username = ?';
		const _id = req.params.id;
		const username = get_username_or_emptystring(req, res);

		let select_results = await run_mysql_query(sql, [_id, username]);

		if(select_results.length === 0) return res.sendStatus(404);
		
		let iflevel = new IfLevelModel(select_results[0]); // initialize from sql
		
		res.json(return_level_prepared_for_transmit(iflevel, true));
	} catch (e) {
		log_error(e);
		next(e);
	}
});


/** Delete
	This end-point is only used for testing purposes.  Hard-coded for test user and *all*  test pages.
*/
router.delete('/level/:id', 
	nocache, require_logged_in_user,
	async (req: $Request, res: $Response, next: NextFunction): Promise<any> => {
	try {
		const sql = 'DELETE FROM iflevels WHERE username = "test" '; // AND _id = ?
		const username = get_username_or_emptystring(req, res);

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
router.post('/level/:id', 
	nocache, require_logged_in_user,
	async (req: $Request, res: $Response, next: NextFunction): Promise<any> => {
	try {
		const validate_only = req.query.validate_only === '1'; // do we just check the current page?
		const username = get_username_or_emptystring(req, res);
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
			throw new Error('Client feedback should not be null');
		});



		// If we're just supposed to validate, don't add a new page.
		if(!validate_only) {
			// Update and add new page if needed.
			IfLevelModelFactory.addPageOrMarkAsComplete(iflevel); 
		}

		// Note: Use pages.toJson() to make sure that they properly convert to json.
		let values = [iflevel.completed ? 1 : 0, 
					JSON.stringify(iflevel.pages.map( (p: Object ): Object => p.toJson() )), 
					JSON.stringify(iflevel.history), 
					from_utc_to_myql(to_utc(iflevel.updated)), 
					iflevel._id, 
					iflevel.username];

		let update_results = await run_mysql_query(sql_update, values);

		// Ensure exactly 1 item was updated.
		if(update_results.changedRows !== 1) return res.sendStatus(500);

		res.json(return_level_prepared_for_transmit(iflevel, true));
	} catch (e) {
		log_error(e);
		next(e);
	}

});


module.exports = router;