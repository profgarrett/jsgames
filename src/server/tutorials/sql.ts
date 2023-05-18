// const { LinearGen, ShuffleGen } = require('./../Gens');
// const { bnt } = require('./../pages/bnt');
import { makeTutorialGenFromKC, makeAdaptiveReviewGenFromKC } from './../kcs/kc';

import { kc_sql_selectfrom } from './../kcs/kc_sql_selectfrom';

import type { GenType } from '../Gens';

const REVIEW_MINIMUM_CORRECT = 3;
const REVIEW_LIMIT = 5;


const sql_selectfrom = ({
	code: 'sql_selectfrom', 
	title: 'SQL - Select/From', 
	description: 'Select data from a table',
	show_score_after_completing: true,
	version: 0.1,
	show_progress: false,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
/*			{	type: 'IfPageTextSchema',
				description: `This tutorial introduces the SQL SELECT and FROM keywords.`,
			},
			*/
			makeTutorialGenFromKC(kc_sql_selectfrom),
		
			// Tell the user thanks and give them the code for the session.
			{	type: 'IfPageTextSchema',
				description: `Good job! You have completed this tutorial!`,
			},
			
		]
	})

});



export { sql_selectfrom };
