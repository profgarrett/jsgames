/**
	Node main event loop
*/
import express from 'express';
const router = express.Router();

import { ADMIN_USERNAME, OPENAI_API_KEY } from './secret.js'; 
import { IfLevels, IfLevelSchema } from './../shared/IfLevelSchema';
import { IfLevelSchemaFactory } from './IfLevelSchemaFactory';

import { from_utc_to_myql, run_mysql_query, is_faculty, to_utc, update_level_in_db } from './mysql';
import { user_require_logged_in, nocache, log_error, user_get_username_or_emptystring, return_level_prepared_for_transmit } from './network';

import { return_tagged_level } from './tag';
import { rate_limit_check } from './rate_limit';

import { queryFactory_updateClientResults } from './../shared/queryFactory';


import type { Request, Response, NextFunction } from 'express';
import { IfPageBaseSchema, IfPageSqlSchema, sanitize_chat_tab_views } from '../shared/IfPageSchemas.js';

// Convert a route parameter into a string. If it is an array, then grab the first item. If it is undefined, then return the fallback value.
const getRouteParamString = (value: string | string[] | undefined, fallback = ''): string => {
	if (typeof value === 'undefined') return fallback;
	if (Array.isArray(value)) return value[0] ?? fallback;
	return value;
};

// Pull the client IP from the request (behind a proxy, via x-forwarded-for).
// Mirrors app_users.ts's private helper of the same name -- not currently shared
// between route files, so duplicated here rather than adding a cross-file import
// for one small function (consistent with how e.g. to_string_from_possible_array
// is already duplicated across app_users.ts / app_reports.ts).
const get_request_ip = (req: Request): string => {
	const header = req.headers['x-forwarded-for'];
	const ip = Array.isArray(header) ? (header[0] || '') : (header || '');
	return ip.substr(0, 255);
};

////////////////////////////////////////////////////////////////////////
//  If Game
////////////////////////////////////////////////////////////////////////


// Create a new level for the currently logged in user with the given type.
router.post('/new_level_by_code/:code', 
	nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const code = getRouteParamString(req.params.code);
		const username = user_get_username_or_emptystring(req, res);

		// Blunt scripted abuse: cap how many new attempts one IP can start in a
		// window, regardless of account. Generous enough that no real student or
		// researcher should ever hit it.
		const ip = get_request_ip(req);
		if( !rate_limit_check('new_level_by_code:' + ip, 60, 15 * 60 * 1000) ) {
			return res.status(429).json({ _error: 'RateLimited' });
		}

		// Prolific-provisioned accounts (see POST /api/users/prolific_login) are
		// auto-created with no identity verification, so nothing stops a script from
		// looping this route to spin up unlimited attempts -- each one carrying its
		// own chat page's OpenAI-call budget. Cap attempts-of-this-code per username,
		// scoped to just those accounts so normal students/faculty retrying a
		// tutorial for practice are unaffected.
		if( username.indexOf('prolific_') === 0 ) {
			const MAX_ATTEMPTS_PER_CODE = 3;
			const existing_attempts = await run_mysql_query(
				'SELECT COUNT(*) as n FROM iflevels WHERE username = ? AND code = ?',
				[username, code]);
			if( existing_attempts[0].n >= MAX_ATTEMPTS_PER_CODE ) {
				return res.status(429).json({ _error: 'TooManyAttempts' });
			}
		}

		const level = await IfLevelSchemaFactory.create(code, username);

		// Optionally stamp Prolific study/session identifiers onto the level's history, for
		// provenance -- e.g. from the Prolific landing page (src/app/if/ProlificRouter.tsx).
		// No schema change: history is the same free-form JSON array every level already uses
		// for this kind of bookkeeping.
		const prolific_study_id = req.body && typeof req.body.prolific_study_id === 'string' ? req.body.prolific_study_id : '';
		const prolific_session_id = req.body && typeof req.body.prolific_session_id === 'string' ? req.body.prolific_session_id : '';
		if( prolific_study_id !== '' || prolific_session_id !== '' ) {
			level.history = [...level.history, { dt: new Date(), code: 'server_prolific_context', prolific_study_id, prolific_session_id }];
		}

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

		const insert_results = await run_mysql_query(insert_sql, values);

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
		const code = getRouteParamString(req.params.code);
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
		const code = getRouteParamString(req.params.code) === 'true' || getRouteParamString(req.params.code) === 'True';
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
		const param_code = getRouteParamString(req.params.code); // level code.
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
		const param_code = getRouteParamString(req.params.code); // level code.
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
router.get(['/level/:id', '/level/:id/:tagged'], 
	nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const username = user_get_username_or_emptystring(req, res);
		let sql = '';
		let params;

		const _id = getRouteParamString(req.params.id);
		const _tagged = getRouteParamString(req.params.tagged, 'false') === 'tagged';

		if(username === 'profgarrett' ) {
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

		const select_results = await run_mysql_query(sql, params);

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


/** 
	This end-point is only used for testing purposes.  Hard-coded for test user and *all*  test pages.
*/
router.get('/clear_all_profgarrett_test_pages/', 
	nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const sql = 'DELETE FROM iflevels WHERE username = "test" OR username = "profgarrett+test@gmail.com"'; // AND _id = ?
		const username = user_get_username_or_emptystring(req, res);

		if(username !== 'profgarrett+test@gmail.com' && username !== 'profgarrett') {
			return res.sendStatus(401); // unauthorized.
		}

		const delete_results = await run_mysql_query(sql); 

		res.json({
			message: `Deleted ${delete_results.affectedRows} levels for test user.`
		});

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
		const _id = getRouteParamString(req.params.id);
		const username = user_get_username_or_emptystring(req, res);

		if(username !== ADMIN_USERNAME) {
			return res.sendStatus(401); // unauthorized.
		}

		const delete_results = await run_mysql_query(sql, [_id] );

		res.json({success: (delete_results.affectedRows >= 1)});

	} catch (e) {
		log_error(e);
		next(e);
	}
});


/**
	Exchange one chat turn on the current (last) page of a level, which must be an
	IfPageChatSchema. Appends the student's message, calls the OpenAI Chat Completions API
	using the page's (hidden) condition-specific system prompt plus the transcript so far, and
	appends the AI's reply. This is a dedicated route -- separate from the generic
	POST /level/:id below -- specifically so that an arbitrary number of chat turns can happen
	on one page without each one trying to advance the level to the next page. See
	IfPageChatSchema.updateUserFields (src/shared/IfPageSchemas.ts) for why client_messages is
	only ever written here, never through the generic level-update route.
*/
router.post('/level/:id/chat',
	nocache, user_require_logged_in,
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const username = user_get_username_or_emptystring(req, res);
		const _id = getRouteParamString(req.params.id);
		const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';

		if(text.length === 0) return res.status(400).json({ _error: 'Message text is required' });
		if(text.length > 4000) return res.status(400).json({ _error: 'Message is too long (4000 character max)' });

		const sql_select = 'SELECT * FROM iflevels WHERE _id = ? AND username = ?';
		const select_results = await run_mysql_query(sql_select, [_id, username]);

		if(select_results.length === 0) return res.sendStatus(404);

		const iflevel = new IfLevelSchema(select_results[0]);

		if(iflevel.completed) return res.status(400).json({ _error: 'This level is already completed' });

		const page: any = iflevel.pages[iflevel.pages.length - 1];

		if(page.type !== 'IfPageChatSchema') return res.status(400).json({ _error: 'The current page is not a chat page' });
		if(page.completed) return res.status(400).json({ _error: 'This chat page is already completed' });

		// Save the info-tab views the client has recorded so far (if any), so they survive
		// even if the participant reloads or abandons the page before clicking "Next page".
		// Sanitized the same way as in IfPageChatSchema.updateUserFields; open views stay open.
		if(typeof req.body.client_tab_views !== 'undefined') {
			page.client_tab_views = sanitize_chat_tab_views(req.body.client_tab_views, page.tabs || [], null);
		}

		const turns_used = page.client_messages.filter( (m: any) => m.role === 'user').length;
		if(turns_used >= page.max_turns) {
			return res.status(400).json({ _error: 'You have reached the maximum number of messages for this chat' });
		}

		if(!OPENAI_API_KEY) {
			return res.status(500).json({ _error: 'AI chat is not configured on this server (missing OPENAI_API_KEY in secret.js)' });
		}

		// Append the student's message before calling the AI, so it's included in what's sent.
		page.client_messages = [
			...page.client_messages,
			{ role: 'user', text: text, dt: new Date() },
		];

		const openai_messages = [
			{ role: 'system', content: page.solution_system_prompt || 'You are a helpful assistant.' },
			...page.client_messages.map( (m: any) => ({ role: m.role, content: m.text }) ),
		];

		let assistant_text = '';
		try {
			const openai_response = await fetch('https://api.openai.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${OPENAI_API_KEY}`,
				},
				body: JSON.stringify({
					model: 'gpt-4o-mini',
					messages: openai_messages,
					max_tokens: 300,
					temperature: 0.8,
				}),
			});

			const openai_json: any = await openai_response.json();

			if(!openai_response.ok) {
				throw new Error('OpenAI API error: ' + (openai_json && openai_json.error && openai_json.error.message ? openai_json.error.message : openai_response.status));
			}

			assistant_text = (openai_json && openai_json.choices && openai_json.choices[0] && openai_json.choices[0].message && openai_json.choices[0].message.content || '').trim();
			if(assistant_text === '') throw new Error('OpenAI returned an empty response');

		} catch(openai_error) {
			log_error(openai_error);
			// Note: the student's message above is not persisted (we haven't saved yet), so it's
			// safe for them to retry without creating a duplicate.
			return res.status(502).json({ _error: 'The AI chat service is temporarily unavailable. Please try again.' });
		}

		// Append the AI's reply, right after the student's message that prompted it.
		page.client_messages = [
			...page.client_messages,
			{ role: 'assistant', text: assistant_text, dt: new Date() },
		];

		page.history.push({ dt: new Date(), code: 'server_chat_exchange', turn: turns_used + 1 });
		iflevel.history = [...iflevel.history, { dt: new Date(), code: 'server_chat_exchange', page_i: iflevel.pages.length - 1 }];

		const update_results = await update_level_in_db(iflevel);
		if(update_results.changedRows !== 1) return res.sendStatus(500);

		res.json(return_level_prepared_for_transmit(iflevel, true));

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
		const _id = getRouteParamString(req.params.id);
		const sql_select = 'SELECT * FROM iflevels WHERE _id = ?';
		

		const select_results = await run_mysql_query(sql_select, [ _id ]);

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