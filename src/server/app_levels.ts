/**
	Node main event loop
*/
import express from 'express';
const router = express.Router();

import { ADMIN_USERNAME } from './secret.js'; 
import { IfLevels, IfLevelSchema } from './../shared/IfLevelSchema';
import { IfLevelSchemaFactory } from './IfLevelSchemaFactory';

import { from_utc_to_myql, run_mysql_query, is_faculty, to_utc, update_level_in_db } from './mysql';
import { user_require_logged_in, nocache, log_error, user_get_username_or_emptystring, return_level_prepared_for_transmit } from './network';

import { return_tagged_level } from './tag';

import { queryFactory_updateClientResults } from './../shared/queryFactory';


import type { Request, Response, NextFunction } from 'express';
import { IfPageBaseSchema, IfPageSqlSchema } from '../shared/IfPageSchemas.js';


////////////////////////////////////////////////////////////////////////
//  If Game
////////////////////////////////////////////////////////////////////////


// Create a new level for the currently logged in user with the given type.
router.post('/new_level_by_code/:code', 
	nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const code = req.params.code;
		const username = user_get_username_or_emptystring(req, res);
		const level = await IfLevelSchemaFactory.create(code, username);
		const now = from_utc_to_myql(to_utc(new Date()));

		// need to refresh, even though this is a new object, before saving. Otherwise, this will be null
		// derived props are only updated by MYSQL functions prior to saving, not by the object itself during updates.
		level.refresh_derived_props(); 

		const insert_sql = `INSERT INTO iflevels (type, username, code, title, description, completed, 
			pages, history, created, updated, seed, allow_skipping_tutorial, harsons_randomly_on_username, 
			predict_randomly_on_username, version,
			standardize_formula_case, show_score_after_completing, show_progress, props_version, props) 
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
		level.username = username;

					
		// Note: Must use toJson on pages, as that needs some extra care
		// before being stringified.
		const values = [level.type, level.username, level.code, level.title, level.description,
				level.completed ? 1 : 0, 
				JSON.stringify(level.pages.map( (p: any ): any => p.toJson() )), 
				JSON.stringify(level.history), 
				now, now,
				level.seed,
				level.allow_skipping_tutorial,
				level.harsons_randomly_on_username,
				level.predict_randomly_on_username,
				level.version,
				level.standardize_formula_case,
				level.show_score_after_completing,
				level.show_progress,
				level.props_version,
				JSON.stringify(level.props.toJson()),
				];

		let insert_results = await run_mysql_query(insert_sql, values);

		level._id = insert_results.insertId;

		res.json(return_level_prepared_for_transmit(level, true));
	} catch (e) {
		log_error(e);
		next(e);
	}
});


// List objects owned by the logged in user.
// :type may be 'all', or limited to a single code.
router.get('/levels/byCode/:code', 
	nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const sql = 'SELECT * FROM iflevels WHERE username = ? AND (code = ? OR ? = "all")';
		const code = req.params.code;
		const username = user_get_username_or_emptystring(req, res);

		let iflevels = await run_mysql_query(sql, [username, code, code]);

		// Convert into models, and then back to JSON.
		iflevels = iflevels.map( (l: any): any => { return new IfLevelSchema(l) });

		// Remove secret fields and transmit.
		iflevels = iflevels.map( (l: any): any => { return  return_level_prepared_for_transmit(l, true); } );
		res.json(iflevels);
	} catch (e) {
		log_error(e);
		next(e);
	}
});


// Get completed or uncompleted objects owned by the logged in user.
// :type may be 'all', or limited to a single code.
router.get('/levels/byCompleted/:code', 
	nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const sql = 'SELECT * FROM iflevels WHERE username = ? AND (completed = ?)';
		const code = req.params.code === 'true' || req.params.code === 'True';
		const username = user_get_username_or_emptystring(req, res);

		let iflevels = await run_mysql_query(sql, [username, code, code]);

		// Convert into models, and then back to JSON.
		iflevels = iflevels.map( (l: any): any => (new IfLevelSchema(l)) );

		// Remove secret fields and transmit.
		iflevels = iflevels.map( (l: any): any => return_level_prepared_for_transmit(l, true));
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
router.get('/debuglevel/:code', nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const param_code = req.params.code; // level code.
		const username = user_get_username_or_emptystring(req, res);
		let results;

		// Only allow faculty to have access to debug levels.
		const is_faculty_result = await is_faculty(username);
		if(!is_faculty_result) throw new Error('User do not have permission to debug levels');

		// Make sure that the given code is valid. If not, then immediately fail
		// to avoid having some type of SQL injection issue.
		const code_in_array = IfLevels.filter( l => l.code === param_code).map( l => l.code );
		if(code_in_array.length !== 1)
			throw new Error('Invalid code type '+param_code+' passed to debuglevel');

		const level = await IfLevelSchemaFactory.create(code_in_array[0], username);

		let loop_escape = 200;
		let last_page = {};

		while(!level.completed && loop_escape > 0) {
			loop_escape--; // emergency escape in case something goes wrong.

			// Complete last page.
			last_page = level.pages[level.pages.length-1];
			// @ts-ignore
			last_page.debug_answer();
			// @ts-ignore
			if(last_page.type === 'IfPageSqlSchema') await queryFactory_updateClientResults(last_page);

			results = await IfLevelSchemaFactory.addPageOrMarkAsComplete(level); 
		}

		res.json(return_level_prepared_for_transmit(level, false));
	} catch (e) {
		log_error(e);
		next(e);
	}
});


/**
	Gets a preview template for a given tutorial.
	Allowed for all users and anonymous users

	Builds a temporary level, wipes out all answers, and send to the user.
*/
router.get('/previewlevel/:code', nocache,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const param_code = req.params.code; // level code.
		let results;

		// Make sure that the given code is valid. If not, then immediately fail
		// to avoid having some type of SQL injection issue.
		const code_in_array = IfLevels.filter( l => l.code === param_code).map( l => l.code );
		if(code_in_array.length !== 1)
			throw new Error('Invalid code type '+param_code+' passed to debuglevel');

		const level = await IfLevelSchemaFactory.create(code_in_array[0], 'previewuser');

		let loop_escape = 200;
		let last_page = {};

		// Create level using debug codes
		while(!level.completed && loop_escape > 0) {
			loop_escape--; // emergency escape in case something goes wrong.

			// Complete last page.
			last_page = level.pages[level.pages.length-1];
			// @ts-ignore
			last_page.debug_answer();
			// @ts-ignore
			if(last_page.type === 'IfPageSqlSchema') await queryFactory_updateClientResults(last_page);

			results = await IfLevelSchemaFactory.addPageOrMarkAsComplete(level); 
		}

		// Wipe out all results and answers.
		level.pages.forEach( (p: IfPageBaseSchema) => {
			p.clear_answer_and_all_results();
		});

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



// Select object, provide it is owned by the logged in user OR a faculty teaching a section that
// the student is enrolled in.
router.get('/level/:id/:tagged?', 
	nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const username = user_get_username_or_emptystring(req, res);
		let sql = '';
		let params;

		const _id = req.params.id;
		const _tagged = typeof req.params.tagged === 'undefined' ? false : req.params.tagged === 'tagged';

		if(username === 'garrettn' ) {
			// Allow admin access to any item
			sql = 'SELECT * FROM iflevels WHERE _id = ?' 
			params = [_id];
		} else {
			// allow teacher or individual access 

			sql = `
			SELECT iflevels.* FROM iflevels WHERE _id = ? AND iflevels.username = ?
			UNION
			SELECT iflevels.* FROM iflevels 
			INNER JOIN users ON iflevels.username = users.username
			INNER JOIN users_sections as student_sections
				ON users.iduser = student_sections.iduser
				AND student_sections.role = 'student'
			INNER JOIN users_sections as faculty_sections 
				ON faculty_sections.idsection = student_sections.idsection
				AND faculty_sections.role = 'faculty'
			INNER JOIN users as faculty 
				ON faculty.iduser = faculty_sections.iduser
			WHERE 
				 _id = ? AND faculty.username = ?; `;

			params =  [_id, username, _id, username];
		}

		let select_results = await run_mysql_query(sql, params);

		if(select_results.length === 0) return res.sendStatus(404);
		
		let iflevel = new IfLevelSchema(select_results[0]); // initialize from sql
		
		// If needed, then process all of the history items 
		if( _tagged ) {
			iflevel = return_tagged_level(iflevel);
		}

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
	nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const sql = 'DELETE FROM iflevels WHERE username = "test" '; // AND _id = ?
		const username = user_get_username_or_emptystring(req, res);

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



/** 
	Delete a single level.
	Only allow for admins.
*/
router.post('/level/:id/delete', 
	nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const sql = 'DELETE FROM iflevels WHERE _id = ? ';
		const _id = req.params.id;
		const username = user_get_username_or_emptystring(req, res);

		if(username !== ADMIN_USERNAME) {
			return res.sendStatus(401); // unauthorized.
		}

		let delete_results = await run_mysql_query(sql, [_id] );

		res.json({success: (delete_results.affectedRows >= 1)});

	} catch (e) {
		log_error(e);
		next(e);
	}
});


// Update One
router.post('/level/:id', 
	nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const replace = req.query.replace === '1'; // replace the entire object?
		const validate_only = req.query.validate_only === '1'; // do we just check the current page?
		const username = user_get_username_or_emptystring(req, res);
		const is_admin = ADMIN_USERNAME === username;
		const _id = req.params.id;
		const sql_select = 'SELECT * FROM iflevels WHERE _id = ?';
		

		let select_results = await run_mysql_query(sql_select, [ _id ]);

		// Return 404 if no results match.
		if(select_results.length === 0) return res.sendStatus(404);

		// new iflevel object.
		let iflevel: IfLevelSchema; 

		
		// Check permissions. 
		// Different types of updates. If an admin, allow a whole-sale replacement
		// If not, then only allow updating legal client-provided stuff.
		if( replace  ) {
			if( is_admin ) {
				// Allow any changes. Replace old object with new object.
				// Used to fix issues with levels, so no validation is needed.
				iflevel = new IfLevelSchema(req.body);
			} else {
				return res.sendStatus(401);
			}

		} else {
			// Fail if the level is completed.
			if(select_results[0].completed) return res.sendStatus(401);

			// Fail if not the owner.
			if( select_results[0].username !== username ) {
				return res.sendStatus(401);
			} else {
				// initialize from sql
				iflevel = new IfLevelSchema(select_results[0]); 
				
				// update all properties from client that can be changed.
				iflevel.updateUserFields(req.body); 
			}
			
		}

		// If the last page is a SQL page, then refresh the results.
		// Note that this is done here, and not in the refresh correct property (which is run by updateUserFields)
		// This is done to more tightly control exactly when the code runs to create the SQL db.
		const last_page = iflevel.pages[iflevel.pages.length-1];
		if(last_page.type === 'IfPageSqlSchema') await queryFactory_updateClientResults(last_page);


		// Make sure that there is feedback.
		iflevel.pages.filter( (p: any) => p.client_feedback === null).filter( (p: any) => p.type === 'IfPageFormulaSchema').map( (p:any) => {
			throw new Error('Client feedback should not be null');
		});

		// Add a new page, unless we are only validating OR replacing.
		if( validate_only === false && replace === false  ) {
			// Update and add new page if needed.
			await IfLevelSchemaFactory.addPageOrMarkAsComplete(iflevel); 
		}

		// Update level in db.
		const update_results = await update_level_in_db(iflevel);

		// Ensure exactly 1 item was updated.
		if(update_results.changedRows !== 1) return res.sendStatus(500);

		res.json(return_level_prepared_for_transmit(iflevel, true));
	} catch (e) {
		console.log('Error in app_levels');
		console.log(e);
		log_error(e);
		next(e);
	}

});

const app_levels = router
export { app_levels }