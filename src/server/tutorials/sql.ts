import { makeTutorialGenFromKC } from './../kcs/kc';

import { kc_sql_selectfrom } from './../kcs/kc_sql_selectfrom';
import { kc_sql_orderby } from './../kcs/kc_sql_orderby';
import { kc_sql_where } from '../kcs/kc_sql_where';
import { kc_sql_where_and_or } from '../kcs/kc_sql_where_and_or';
import { kc_sql_join_inner } from '../kcs/kc_sql_join_inner';
//import type { GenType } from '../Gens';

const REVIEW_QUESTIONS = 4;


const sql_selectfrom = ({
	code: 'sql_selectfrom', 
	title: 'SQL - Select and From', 
	description: 'Select data from a table',
	show_score_after_completing: true,
	version: 0.1,
	show_progress: false,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			{	type: 'IfPageTextSchema',
				description: `This tutorial introduces the <code>SELECT</code> and <code>FROM</code> keywords.`,
			},
			
			makeTutorialGenFromKC(kc_sql_selectfrom, REVIEW_QUESTIONS),

			{	type: 'IfPageTextSchema',
				description: `Good job! You have completed this tutorial!`,
			},
			
		]
	})

});


const sql_orderby = ({
	code: 'sql_orderby', 
	title: 'SQL - Order By', 
	description: 'Order the returned values from a query',
	show_score_after_completing: true,
	version: 0.1,
	show_progress: false,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			{	type: 'IfPageTextSchema',
				description: `This tutorial introduces the <code>ORDER BY</code> keyword.`,
			},
			
			makeTutorialGenFromKC(kc_sql_orderby, REVIEW_QUESTIONS),

			{	type: 'IfPageTextSchema',
				description: `Good job! You have completed this tutorial!`,
			},
			
		]
	})

});


const sql_where = ({
	code: 'sql_where', 
	title: 'SQL - Where', 
	description: 'Filter the number of rows returned from a query',
	show_score_after_completing: true,
	version: 0.1,
	show_progress: false,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			{	type: 'IfPageTextSchema',
				description: `This tutorial introduces the <code>WHERE</code> keyword.`,
			},
			
			makeTutorialGenFromKC(kc_sql_where, REVIEW_QUESTIONS),

			{	type: 'IfPageTextSchema',
				description: `Good job! You have completed this tutorial!`,
			},
			
		]
	})

});




const sql_where_and_or = ({
	code: 'sql_where_and_or', 
	title: 'SQL - AND OR', 
	description: 'Have more complex logical tests',
	show_score_after_completing: true,
	version: 0.1,
	show_progress: false,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			{	type: 'IfPageTextSchema',
				description: `This tutorial introduces the <code>AND</code> & <code>OR</code> keywords.`,
			},
			
			makeTutorialGenFromKC(kc_sql_where_and_or, REVIEW_QUESTIONS),

			{	type: 'IfPageTextSchema',
				description: `Good job! You have completed this tutorial!`,
			},
			
		]
	})

});


const sql_join_inner = ({
	code: 'sql_join_inner', 
	title: 'SQL - INNER JOIN', 
	description: 'Connect two tables with matching keys',
	show_score_after_completing: true,
	version: 0.1,
	show_progress: false,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			{	type: 'IfPageTextSchema',
				description: `This tutorial introduces the <code>INNER JOIN</code> keyword.`,
			},
			
			makeTutorialGenFromKC(kc_sql_join_inner, REVIEW_QUESTIONS),

			{	type: 'IfPageTextSchema',
				description: `Good job! You have completed this tutorial!`,
			},
			
		]
	})

});

export { sql_selectfrom, sql_orderby, sql_where, sql_where_and_or, sql_join_inner };
