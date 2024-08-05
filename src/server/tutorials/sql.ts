import { makeTutorialGenFromKC } from './../kcs/kc';

import { kc_sql_selectfrom, kc_sql_selectfrom_quotes } from './../kcs/kc_sql_selectfrom';
import { kc_sql_orderby } from './../kcs/kc_sql_orderby';
import { kc_sql_where_numbers, kc_sql_where_text, kc_sql_where_quotes } from '../kcs/kc_sql_where';
import { kc_sql_where_and_or_numbers, kc_sql_where_and_or_text, kc_sql_where_and_or_quotes } from '../kcs/kc_sql_where_and_or';
import { kc_sql_join_inner_prep, kc_sql_join_inner_intro, kc_sql_join_inner_practice } from '../kcs/kc_sql_join_inner';
import { kc_sql_join_leftouter } from '../kcs/kc_sql_join_leftouter';
import { kc_sql_join_keys} from '../kcs/kc_sql_join_keys';
import { kc_sql_join_self } from '../kcs/kc_sql_join_self';
import { kc_sql_groupby } from '../kcs/kc_sql_groupby';

const REVIEW_QUESTIONS = 5;


const sql_selectfrom = ({
	code: 'sql_selectfrom', 
	title: 'SQL - Select and From (v2)', 
	description: 'Select data from a table',
	show_score_after_completing: true,
	version: 0.2,
	show_progress: true,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			{	type: 'IfPageTextSchema',
				description: `This tutorial introduces the <code>SELECT</code> and <code>FROM</code> keywords.`,
			},
			
			makeTutorialGenFromKC(kc_sql_selectfrom, REVIEW_QUESTIONS),
			makeTutorialGenFromKC(kc_sql_selectfrom_quotes, REVIEW_QUESTIONS),

			{	type: 'IfPageTextSchema',
				description: `Good job! You have completed this tutorial!`,
			},
			
		]
	})

});


const sql_orderby = ({
	code: 'sql_orderby', 
	title: 'SQL - Order By (v2)', 
	description: 'Order the returned values from a query',
	show_score_after_completing: true,
	version: 0.2,
	show_progress: true,

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
	title: 'SQL - Where (v2)', 
	description: 'Filter the number of rows returned from a query',
	show_score_after_completing: true,
	version: 0.2,
	show_progress: true,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			{	type: 'IfPageTextSchema',
				description: `This tutorial introduces the <code>WHERE</code> keyword.`,
			},
			
			makeTutorialGenFromKC(kc_sql_where_numbers, REVIEW_QUESTIONS),
			makeTutorialGenFromKC(kc_sql_where_text, REVIEW_QUESTIONS),
			makeTutorialGenFromKC(kc_sql_where_quotes, REVIEW_QUESTIONS),

			{	type: 'IfPageTextSchema',
				description: `Good job! You have completed this tutorial!`,
			},
			
		]
	})

});




const sql_where_and_or = ({
	code: 'sql_where_and_or', 
	title: 'SQL - AND OR (v2)', 
	description: 'Have more complex logical tests',
	show_score_after_completing: true,
	version: 0.2,
	show_progress: true,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			{	type: 'IfPageTextSchema',
				description: `This tutorial introduces the <code>AND</code> & <code>OR</code> keywords.`,
			},
			
			makeTutorialGenFromKC(kc_sql_where_and_or_numbers, REVIEW_QUESTIONS),
			makeTutorialGenFromKC(kc_sql_where_and_or_text, REVIEW_QUESTIONS),
			makeTutorialGenFromKC(kc_sql_where_and_or_quotes, REVIEW_QUESTIONS),

			{	type: 'IfPageTextSchema',
				description: `Good job! You have completed this tutorial!`,
			},
			
		]
	})

});


const sql_join_inner = ({
	code: 'sql_join_inner', 
	title: 'SQL - INNER JOIN', 
	description: 'Connect two tables with matching keys (v2)',
	show_score_after_completing: true,
	version: 0.2,
	show_progress: true,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			{	type: 'IfPageTextSchema',
				description: `This tutorial introduces the <code>INNER JOIN</code> keyword.`,
			},
			
			makeTutorialGenFromKC(kc_sql_join_inner_prep, REVIEW_QUESTIONS),
			makeTutorialGenFromKC(kc_sql_join_inner_intro, REVIEW_QUESTIONS),
			makeTutorialGenFromKC(kc_sql_join_inner_practice, REVIEW_QUESTIONS),
			 
			{	type: 'IfPageTextSchema',
				description: `Good job! You have completed this tutorial!`,
			},
			
		]
	})

});




const sql_join_leftouter = ({
	code: 'sql_join_leftouter', 
	title: 'SQL - LEFT OUTER JOIN', 
	description: 'Connect two tables with mismatched keys and use IS NULL',
	show_score_after_completing: true,
	version: 0.1,
	show_progress: true,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			{	type: 'IfPageTextSchema',
				description: `This tutorial introduces the <code>LEFT OUTER JOIN</code> and <code>IS NULL</code> keywords.`,
			},
			
			makeTutorialGenFromKC(kc_sql_join_leftouter, REVIEW_QUESTIONS),

			{	type: 'IfPageTextSchema',
				description: `Good job! You have completed this tutorial!`,
			},
			
		]
	})

});




const sql_join_keys = ({
	code: 'sql_join_keys', 
	title: 'SQL - Keys', 
	description: 'Practice joining tables on different keys',
	show_score_after_completing: true,
	version: 0.1,
	show_progress: true,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			{	type: 'IfPageTextSchema',
				description: `This tutorial provides practice using different keys to join tables.`,
			},
			
			makeTutorialGenFromKC(kc_sql_join_keys, REVIEW_QUESTIONS),

			{	type: 'IfPageTextSchema',
				description: `Good job! You have completed this tutorial!`,
			},
			
		]
	})

});





const sql_join_self = ({
	code: 'sql_join_self', 
	title: 'SQL - Self join', 
	description: 'Practice joining a table to itself',
	show_score_after_completing: true,
	version: 0.1,
	show_progress: true,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			{	type: 'IfPageTextSchema',
				description: `This tutorial shows you how to join a table to itself.`,
			},
			
			makeTutorialGenFromKC(kc_sql_join_self, REVIEW_QUESTIONS),

			{	type: 'IfPageTextSchema',
				description: `Good job! You have completed this tutorial!`,
			},
			
		]
	})

});



const sql_groupby = ({
	code: 'sql_groupby', 
	title: 'SQL - GROUP BY', 
	description: 'Group records to find summaries',
	show_score_after_completing: true,
	version: 0.1,
	show_progress: true,

	gen: ({
		gen_type: 'LinearGen',
		pages: [
			{	type: 'IfPageTextSchema',
				description: `This tutorial shows you how to group rows in a table.`,
			},
			
			makeTutorialGenFromKC(kc_sql_groupby, REVIEW_QUESTIONS),

			{	type: 'IfPageTextSchema',
				description: `Good job! You have completed this tutorial!`,
			},
			
		]
	})

});

export { sql_selectfrom, sql_orderby, sql_where, sql_where_and_or, sql_join_inner, sql_join_leftouter, sql_join_keys, sql_join_self, sql_groupby };
