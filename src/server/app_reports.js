// @flow

/**
	Node main event loop
*/
const express = require('express');
const router = express.Router();


const { ADMIN_USERNAME } = require('./secret.js'); 
const { IfLevels, IfLevelSchema, IfLevelPagelessSchema } = require('./../shared/IfLevelSchema');
const { build_answers_from_level } = require('./../shared/IfPageSchemas');

const { run_mysql_query, is_faculty } = require('./mysql.js');
const { require_logged_in_user, 
		nocache,
		log_error,
		get_username_or_emptystring, return_level_prepared_for_transmit} = require('./network.js');

const { turn_array_into_map, turn_object_keys_into_array } = require('./../shared/misc.js');
const { return_tagged_level } = require('./tag.js');


import type { $Request, $Response, NextFunction } from 'express';


////////////////////////////////////////////////////////////////////////
//  Reports
////////////////////////////////////////////////////////////////////////




// Grab first item from query.
function to_string_from_possible_array( s: string | Array<any>): string {
	if( typeof s === 'string') return s;

	if(typeof s.join !== 'undefined') {
		return s[0];
	} else {
		throw new Error('Invalid type in to_string_from_possible_array');
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
		const INTERVAL = 99999 + ' DAY';

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
			param_code, param_code, param_code,
			param_idsection, param_idsection,
			param_iduser, param_iduser
		];


		// Make sure that the given code is valid. If not, then immediately fail
		const code_in_array = IfLevels.filter( l => l.code === param_code).map( l => l.code );
		if( 
			param_code !== '*' 
			&& param_code !== 'if' 
			&& param_code !== null 
			&& code_in_array.length !== 1)
			throw new Error('Invalid code type '+ param_code + ' passed to questions');


		// Build SQL statement.
		// Note that we trust that all given params have already been cleaned up.
		console.log('DEBUG: Hax to retrieve correct 3 sections');
		
		const DEBUG_ID_SECTION = '(sections.idsection IN (16, 18, 19)) ';
			// '(sections.idsection = ? OR ? = '*') ';

		const sql = `select distinct iflevels.*
			from iflevels 
				inner join users on iflevels.username = users.username 
				left outer join users_sections on users_sections.iduser = users.iduser 
				left outer join sections on sections.idsection = users_sections.idsection 
				left outer join 
					(select TRUE as first, min(created) as created, username, code from iflevels group by username, code) as iflevelsmax 
					ON iflevels.created = iflevelsmax.created AND iflevels.username = iflevelsmax.username AND iflevels.code = iflevelsmax.code
			WHERE 

				(
					iflevels.code = ? 
					OR ? = '*'
					OR ? = 'if' && LEFT(iflevels.code, 2) = 'if'
				) AND
				
				${DEBUG_ID_SECTION} AND
				(users.iduser = ? OR ? = '*') AND 
				iflevels.updated > NOW() - INTERVAL ${INTERVAL} AND 
				iflevels.username NOT IN ('${ADMIN_USERNAME}') AND 
				iflevelsmax.first = 1`;



		let select_results = await run_mysql_query(sql, sql_params);

		if(select_results.length === 0) return res.json([]);

		let iflevels = select_results.map( (l: Object): Object => (new IfLevelSchema(l)) );

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
		
		const fields = turn_object_keys_into_array(IfLevelPagelessSchema._level_schema_no_pages());
		const fields_as_string = fields.map( l => 'iflevels.'+l).join(', ');


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
SELECT distinct "IfLevelPagelessSchema" as type, ${fields_as_string}
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

		let iflevels = select_results.map( (l: Object): Object => (new IfLevelPagelessSchema(l)) );

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
	Get progress for a list of users.
	Normally passed a section id.
*/
router.get('/progress?', nocache, require_logged_in_user,
	async (req: $Request, res: $Response, next: NextFunction): Promise<any> => {
	try {
		const username = get_username_or_emptystring(req, res);
		const is_faculty_result = await is_faculty(username);

		// Simple perm check.  
		if(!is_faculty_result) throw new Error('User does not have permission to see class progress');

		// SQL later on will also check to make sure that the user has permission
		// to see the given course id.
		const param_idsection = (typeof req.query.idsection === 'undefined') 
				? '*' 
				: parseInt(req.query.idsection, 10);

		const sql_where_values = [username, param_idsection, param_idsection];

		const fields = turn_object_keys_into_array(IfLevelPagelessSchema._level_schema_no_pages());
		const fields_as_string = fields.map( l => 'iflevels.'+l).join(', ');


		const sql = `
SELECT DISTINCT "IfLevelPagelessSchema" as type, ${fields_as_string}
FROM iflevels
INNER JOIN users ON iflevels.username = users.username
INNER JOIN users_sections 
	ON users.iduser = users_sections.iduser
    AND users_sections.role = 'student'
INNER JOIN sections ON users_sections.idsection = sections.idsection
INNER JOIN users_sections as faculty_sections 
	ON faculty_sections.idsection = sections.idsection
	AND faculty_sections.role = 'faculty'
INNER JOIN users as faculty 
	ON faculty.iduser = faculty_sections.iduser
WHERE 
	faculty.username = ? 
	AND (faculty_sections.idsection = ? OR ? = '*') 
ORDER BY iflevels.updated desc `;

		const select_results = await run_mysql_query(sql, sql_where_values);
		
		if(select_results.length === 0) return res.json([ ]);

		let pageless_levels = select_results.map( l => new IfLevelPagelessSchema(l) );
		//pageless_levels = pageless_levels.map( (l: Object): Object => return_tagged_level(l) );
		pageless_levels = pageless_levels.map( (l: Object): Object => return_level_prepared_for_transmit(l, true));

		return res.json(pageless_levels);
	} catch (e) {
		log_error(e);
		next(e);
	}
});




/**
	Get IfAnswers for the passed section and level.
*/
router.get('/answers?', nocache, require_logged_in_user,
	async (req: $Request, res: $Response, next: NextFunction): Promise<any> => {
	try {
		const username = get_username_or_emptystring(req, res);
		const is_faculty_result = await is_faculty(username);

		// Simple perm check.  
		if(!is_faculty_result) throw new Error('User does not have permission to see kcs');

		// SQL later on will also check to make sure that the user has permission
		// to see the given course id.
		const param_idsection = (typeof req.query.idsection === 'undefined') 
				? '*' 
				: parseInt(req.query.idsection, 10);
		const param_code = (typeof req.query.code === 'undefined') 
				? '*'
				: req.query.code;
		
		const sql_where_values = [username, param_idsection, param_idsection, param_code, param_code];

		const sql = `
SELECT DISTINCT iflevels.* 
FROM iflevels
INNER JOIN users ON iflevels.username = users.username
INNER JOIN users_sections 
	ON users.iduser = users_sections.iduser
    AND users_sections.role = 'student'
INNER JOIN sections ON users_sections.idsection = sections.idsection
INNER JOIN users_sections as faculty_sections 
	ON faculty_sections.idsection = sections.idsection
	AND faculty_sections.role = 'faculty'
INNER JOIN users as faculty 
	ON faculty.iduser = faculty_sections.iduser
WHERE 
	faculty.username = ? 
	AND (faculty_sections.idsection = ? OR ? = '*') 
	AND (iflevels.code = ? OR ? = '*')
	AND users.username LIKE '%@%'
ORDER BY iflevels.updated desc `;

		const select_results = await run_mysql_query(sql, sql_where_values);
		
		if(select_results.length === 0) return res.json([ ]);

		const iflevels = select_results
			.map( l => new IfLevelSchema(l) )
			.map( (l: Object): Object => return_tagged_level(l) );
		
		const answers = [];

		iflevels.forEach(l => {
			build_answers_from_level(l).forEach( a => answers.push(a));
		});

		return res.json(answers);
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
		const sql_where_values = [];
		const sql_where_clauses = [];
		const username = get_username_or_emptystring(req, res);
		const is_faculty_result = await is_faculty(username);

		const fields = turn_object_keys_into_array(IfLevelPagelessSchema._level_schema_no_pages());
		const fields_as_string = fields.map( l => 'iflevels.'+l).join(', ');


		// Two main workflows:
		//  If username provided, get self.  All are allowed to pull their own.
		// 	Else, only Faculty are allowed to poll with unique criteria.
		if(typeof req.query.username === 'undefined') {
			if(!is_faculty_result) throw new Error('Only faculty are allowed to get other user grades');

			// Mandatory completed levels only
			sql_where_clauses.push('iflevels.completed = ?');
			sql_where_values.push(1);	

			// Mandatory only return levels for the faculty's courses.
			sql_where_clauses.push('faculty.username = ?');
			sql_where_values.push(username);

			// Optional idUser
			if(typeof req.query.iduser !== 'undefined') {
				sql_where_values.push(req.query.iduser);
				sql_where_clauses.push('users.iduser = ?');
			}

			// Optional idSection
			if(typeof req.query.idsection !=='undefined') {
				sql_where_values.push(req.query.idsection);
				sql_where_clauses.push('sections.idsection = ?');
			}

			// OPtional level code
			if(typeof req.query.code !=='undefined') {
				sql_where_values.push(req.query.code);
				sql_where_clauses.push('iflevels.code = ?');
			}

			sql = `
SELECT DISTINCT "IfLevelPagelessSchema" as type, ${fields_as_string} 
FROM iflevels
INNER JOIN users ON iflevels.username = users.username
INNER JOIN users_sections 
	ON users.iduser = users_sections.iduser
    AND users_sections.role = 'student'
INNER JOIN sections 
	ON users_sections.idsection = sections.idsection
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
			SELECT DISTINCT "IfLevelPagelessSchema" as type, ${fields_as_string} 
			FROM iflevels
			WHERE username = ? and completed = 1`;
		}

		let select_results = await run_mysql_query(sql, sql_where_values);
		
		if(select_results.length === 0) return res.json([ ]);

		let iflevels = select_results.map( l => new IfLevelPagelessSchema(l) );

		const users = turn_array_into_map(iflevels, l => {
			return l.username.toLowerCase().trim();
		});

		// Grab biggest item for each user.
		const grades = [];
		
		users.forEach( (levels, user) => {

			// Build user object.
			const u = { username: user };
			const level_map = turn_array_into_map(levels, (l) => l.code );

			level_map.forEach( (levels, code) => {
				u[code] = levels.reduce( (max, l: IfLevelPagelessSchema) => 
						max > l.props.test_score_as_percent
						? max 
						: l.props.test_score_as_percent
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



module.exports = router;