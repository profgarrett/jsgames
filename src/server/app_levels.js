// @flow

/**
	Node main event loop
*/
const express = require('express');
const router = express.Router();


const { ADMIN_USERNAME } = require('./secret.js'); 
const { IfLevels, IfLevelSchema } = require('./../shared/IfLevelSchema');
const { IfPageAnswer, build_answers_from_level } = require('./../shared/IfPageSchemas');
const { IfLevelSchemaFactory } = require('./IfLevelSchemaFactory');

const { from_utc_to_myql, run_mysql_query, is_faculty, to_utc, update_level_in_db } = require('./mysql.js');
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
		const level = IfLevelSchemaFactory.create(code, username);
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
				JSON.stringify(level.pages.map( (p: Object ): Object => p.toJson() )), 
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
	nocache, require_logged_in_user,
	async (req: $Request, res: $Response, next: NextFunction): Promise<any> => {
	try {
		const sql = 'SELECT * FROM iflevels WHERE username = ? AND (code = ? OR ? = "all")';
		const code = req.params.code;
		const username = get_username_or_emptystring(req, res);

		let iflevels = await run_mysql_query(sql, [username, code, code]);

		// Convert into models, and then back to JSON.
		iflevels = iflevels.map( (l: Object): Object => (new IfLevelSchema(l)) );

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
		iflevels = iflevels.map( (l: Object): Object => (new IfLevelSchema(l)) );

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

		const level = IfLevelSchemaFactory.create(code_in_array[0], username);

		let loop_escape = 200;
		let last_page = {};

		while(!level.completed && loop_escape > 0) {
			loop_escape--; // emergency escape in case something goes wrong.

			// Complete last page.
			last_page = level.pages[level.pages.length-1];
			last_page.debug_answer();
			IfLevelSchemaFactory.addPageOrMarkAsComplete(level); 
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



// Select object, provide it is owned by the logged in user.
router.get('/level/:id', nocache, require_logged_in_user,
	async (req: $Request, res: $Response, next: NextFunction): Promise<any> => {
	try {
		const username = get_username_or_emptystring(req, res);
		const sql = username === 'garrettn' 
			? 'SELECT * FROM iflevels WHERE _id = ? '   // allow admin access to any item
			: 'SELECT * FROM iflevels WHERE _id = ? AND username = ?';
		const _id = req.params.id;

		let select_results = await run_mysql_query(sql, [_id, username]);

		if(select_results.length === 0) return res.sendStatus(404);
		
		let iflevel = new IfLevelSchema(select_results[0]); // initialize from sql
		
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
		

		let select_results = await run_mysql_query(sql_select, [_id, username]);

		// Return 404 if no results match.
		if(select_results.length === 0) return res.sendStatus(404);

		// Ensure that this level isn't completed.
		if(select_results[0].completed) return res.sendStatus(401);

		// update.
		let iflevel = new IfLevelSchema(select_results[0]); // initialize from sql
		iflevel.updateUserFields(req.body); // update all properties from client that can be changed.

		// Make sure that there is feedback.
		iflevel.pages.filter( p => p.client_feedback === null).filter( p=> p.type === 'IfPageFormulaSchema').map( p => {
			throw new Error('Client feedback should not be null');
		});

		// Look to see if there is client_feedback. If so, then create a history event showing this and 
		// increment the hints
		//iflevel.pages.forEach( p:  => )

		// If we're just supposed to validate, don't add a new page.
		if(!validate_only) {
			// Update and add new page if needed.
			IfLevelSchemaFactory.addPageOrMarkAsComplete(iflevel); 
		}

		// Update level in db.
		const update_results = await update_level_in_db(iflevel);

		// Ensure exactly 1 item was updated.
		if(update_results.changedRows !== 1) return res.sendStatus(500);

		res.json(return_level_prepared_for_transmit(iflevel, true));
	} catch (e) {
		log_error(e);
		next(e);
	}

});


module.exports = router;