/**
	Node main event loop
*/
import express from 'express';
const router = express.Router();

/*
const { ADMIN_USERNAME } = require('./secret'); 
const { IfLevels, IfLevelSchema } = require('./../shared/IfLevelSchema');
const { IfPageAnswer, build_answers_from_level } = require('./../shared/IfPageSchemas');
const { IfLevelSchemaFactory } = require('./IfLevelSchemaFactory');

const { turn_array_into_map } = require('./../shared/misc');
const { return_tagged_level } = require('./tag');
*/

import { run_mysql_query } from './mysql';
import { require_logged_in_user, nocache, log_error, get_username_or_emptystring } from './network';

interface IStringIndexJsonObject {
	[key: string]: any
}
		

import type { Request, Response, NextFunction } from 'express';


////////////////////////////////////////////////////////////////////////
//  Server-side functions relating to classes.
////////////////////////////////////////////////////////////////////////




// List a list of classes that the logged in user has access to.
// Allow access to all by garrettn (admin)
router.get('/sections', 
	nocache, require_logged_in_user, 
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
	try {
		const username = get_username_or_emptystring(req, res);

		if(username === '') throw new Error('Invalid username '+username+' for sections');

		const sql = `SELECT distinct sections.*, users_sections.role FROM users 
				INNER JOIN users_sections on users.iduser = users_sections.iduser
			    INNER JOIN sections on users_sections.idsection = sections.idsection
				WHERE (users.username = ?)
				ORDER BY title`;
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
	async (req: Request, res: Response, next: NextFunction): Promise<any> => {
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
		const clean_users = users.map( (u: any) => { return { iduser: u.iduser, username: u.username }; } );

		res.json(clean_users);
	} catch (e) {
		log_error(e);
		next(e);
	}
});


const app_sections = router;
export { app_sections }