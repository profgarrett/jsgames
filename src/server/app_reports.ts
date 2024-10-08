/**
	Node main event loop
*/
import express from 'express';
const router = express.Router();


import { ADMIN_USERNAME } from './secret'; 
import { IfLevels, IfLevelSchema, IfLevelPagelessSchema } from './../shared/IfLevelSchema';
import { build_answers_from_level } from './../shared/IfPageSchemas';

import { run_mysql_query, is_faculty } from './mysql';
import { user_get_username_or_emptystring, user_require_logged_in, 
		nocache, log_error, return_level_prepared_for_transmit } from './network';

import { turn_array_into_map, turn_object_keys_into_array } from './../shared/misc';
import { return_tagged_level } from './tag';


import type { Request, Response, NextFunction } from 'express';


////////////////////////////////////////////////////////////////////////
//  Reports
////////////////////////////////////////////////////////////////////////




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


/**
	Gets a list of data useful for deeper analysis.
	Allows retrieving solutions, as it requires admin use.
*/
router.get('/questions/', nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		// Time limit on returned data.
		const INTERVAL = 500 + ' DAY';

		// Only allow faculty to have access to questions
		const username = user_get_username_or_emptystring(req, res);

		if(username !=='garrettn') throw new Error('Only admins have access to this report');

		const is_faculty_result = await is_faculty(username);
		if(!is_faculty_result) throw new Error('User do not have permission to review questions');

		// Get cleaned-up params (string or int)

		const param_code: string = (typeof req.query.code === 'undefined') 
				? '*' 
				: to_string_from_possible_array(req.query.code);
		const param_idsection = (typeof req.query.idsection === 'undefined') 
				? '*' 
				: parseInt(to_string_from_possible_array(req.query.idsection), 10);
		const param_iduser = (typeof req.query.iduser === 'undefined') 
				? '*' 
				: parseInt(to_string_from_possible_array(req.query.iduser), 0);

		const sql_params = [
			param_code, param_code, param_code,
			param_idsection, param_idsection,
			param_iduser, param_iduser
		];


		// Make sure that the given code is valid. If not, then immediately fail
		const code_in_array = IfLevels.filter( (l: any) => l.code === param_code).map( (l:any) => l.code );
		if( 
			param_code !== '*' 
			&& param_code !== 'if' 
			&& param_code !== null 
			&& code_in_array.length !== 1)
			throw new Error('Invalid code type '+ param_code + ' passed to questions');


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

				(
					iflevels.code = ? 
					OR ? = '*'
					OR ? = 'if' && LEFT(iflevels.code, 2) = 'if'
				) AND
				
				(sections.idsection = ? OR ? = '*') AND
				(users.iduser = ? OR ? = '*') AND 
				iflevels.updated > NOW() - INTERVAL ${INTERVAL} AND 
				iflevels.username NOT IN ('${ADMIN_USERNAME}') AND 
				iflevelsmax.first = 1`;

		let select_results = await run_mysql_query(sql, sql_params);

		if(select_results.length === 0) return res.json([]);

		let iflevels = select_results.map( (l: any): any => (new IfLevelSchema(l)) );

		// Remove secret fields and transmit.
		iflevels = iflevels.map( (l: any): any => return_tagged_level(l) );
		iflevels = iflevels.map( (l: any): any => return_level_prepared_for_transmit(l, false));

		res.json(iflevels);
	} catch (e) {
		log_error(e);
		next(e);
	}
});


// Select object updated in the last time period..
// Allows retrieving solutions, as it requires faculty role.
router.get('/recent/', nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const username = user_get_username_or_emptystring(req, res);
		const is_faculty_result = await is_faculty(username);
		if(!is_faculty_result) throw new Error('User does not have permission to review questions');

		// Set a default interval (in minutes) of 1 week. Otherwise, use passed 'updated'
		// Assumes passed interval is in minutes.
		const INTERVAL = typeof req.query.updated === 'undefined' 
				? 7*1*24*60 + ' MINUTE'  // 1 week
				: parseInt( to_string_from_possible_array(req.query.updated) , 10) + ' MINUTE'; 

		const sql_where_clauses = ['iflevels.updated > NOW() - INTERVAL ' + INTERVAL];
		const sql_where_values: any[] = [];
		
		// Should we return with or withpage pages?
		// Default to false unless provided and with a 0 (false)
		const pageless = typeof req.query.pageless !=='undefined' && req.query.pageless == '0' ? false : true;
		const pageless_sql = pageless ? '"IfLevelPagelessSchema" as type,' : 'type,';
		console.log([pageless, pageless_sql]);

		const fields = pageless 
			? turn_object_keys_into_array(IfLevelPagelessSchema._level_schema_no_pages())
			: turn_object_keys_into_array(IfLevelSchema._level_schema_no_history());
		const fields_as_string = fields.map( (l: any) => 'iflevels.'+l).join(', ');


		// Build SQL values.
		if(typeof req.query.iduser !== 'undefined') {
			sql_where_values.push(req.query.iduser);
			sql_where_clauses.push('users.iduser = ?');
		}

		if(typeof req.query.idsection !=='undefined') {
			sql_where_values.push(req.query.idsection);
			sql_where_clauses.push('sections.idsection = ?');
		}

		if(typeof req.query.completed !=='undefined') {
			if(! (req.query.completed == '0' || req.query.completed == '1')) {
				throw new Error('Invalid completed value, must be 0 or 1, of '+req.query.completed);
			} 
			sql_where_values.push(req.query.completed);
			sql_where_clauses.push('iflevels.completed = ?');
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
SELECT distinct ${pageless_sql} ${fields_as_string}
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

		// Do we return with or without pages?
		let iflevels = pageless 
			? select_results.map( (l: any): any => (new IfLevelPagelessSchema(l)) )
			: select_results.map( (l: any): any => (new IfLevelSchema(l)) );

		// Remove secret fields and transmit.
		//iflevels = iflevels.map( (l: any): any => return_tagged_level(l) );
		iflevels = iflevels.map( (l: any): any => return_level_prepared_for_transmit(l, true));

		res.json(iflevels);
	} catch (e) {
		log_error(e);
		next(e);
	}
});




/**
	Get progress for a list of users.
	Requires a section id.
*/
router.get('/progress?', nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const username = user_get_username_or_emptystring(req, res);
		const is_faculty_result = await is_faculty(username);

		// Simple perm check.  
		if(!is_faculty_result) throw new Error('User does not have permission to see class progress');

		// SQL later on will also check to make sure that the user has permission
		// to see the given course id.
		if(typeof req.query.idsection === 'undefined') throw new Error('You must pass idsection');

		const param_idsection = parseInt( to_string_from_possible_array(req.query.idsection), 10);

		const sql_where_values = [username, param_idsection];

		const fields = turn_object_keys_into_array(IfLevelPagelessSchema._level_schema_no_pages());
		const fields_as_string = fields.map( (l: any) => 'iflevels.'+l).join(', ');


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
	AND (faculty_sections.idsection = ?) 
ORDER BY iflevels.updated desc `;

		const select_results = await run_mysql_query(sql, sql_where_values);
		
		if(select_results.length === 0) return res.json([ ]);

		let pageless_levels = select_results.map( (l: any) => new IfLevelPagelessSchema(l) );
		//pageless_levels = pageless_levels.map( (l: any): any => return_tagged_level(l) );
		pageless_levels = pageless_levels.map( (l: any): any => return_level_prepared_for_transmit(l, true));

		return res.json(pageless_levels);
	} catch (e) {
		log_error(e);
		next(e);
	}
});




/**
	Get IfAnswers for the passed section and level.
*/
router.get('/answers?', nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const username = user_get_username_or_emptystring(req, res);
		const is_faculty_result = await is_faculty(username);

		// Simple perm check.  
		if(!is_faculty_result) throw new Error('User does not have permission to see kcs');

		// SQL later on will also check to make sure that the user has permission
		// to see the given course id.
		const param_idsection = (typeof req.query.idsection === 'undefined') 
				? '*' 
				: parseInt( to_string_from_possible_array(req.query.idsection), 10);
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
			.map( (l: any): any => new IfLevelSchema(l) )
			.map( (l: any): any => return_tagged_level(l) );
		
		const answers: any = [];

		iflevels.forEach( (l:any) => {
			build_answers_from_level(l).forEach( (a: any) => answers.push(a));
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
router.get('/grades?', nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		let sql = ''; 
		const sql_where_values: any[] = [];
		const sql_where_clauses: any[] = [];
		const username = user_get_username_or_emptystring(req, res);
		const is_faculty_result = await is_faculty(username);

		const fields = turn_object_keys_into_array(IfLevelPagelessSchema._level_schema_no_pages());
		const fields_as_string = fields.map( (l: any) => 'iflevels.'+l).join(', ');


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

		let iflevels = select_results.map( (l: any) => new IfLevelPagelessSchema(l) );

		const users = turn_array_into_map(iflevels, (l: any) => {
			return l.username.toLowerCase().trim();
		});

		// Grab biggest item for each user.
		const grades: any[] = [];
		
		users.forEach( (levels: any, user: any) => {

			// Build user object.
			const u = { username: user };
			const level_map = turn_array_into_map(levels, (l: any) => l.code );

			level_map.forEach( (levels: any, code: any) => {
				// @ts-ignore
				u[code] = levels.reduce( (max: any, l: IfLevelPagelessSchema) => 
						// @ts-ignore
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



const app_reports = router;
export { app_reports }