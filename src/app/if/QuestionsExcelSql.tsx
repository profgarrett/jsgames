import React, { ReactElement } from 'react';
import { DEMO_MODE } from '../../server/secret';

import { IfLevelSchema } from '../../shared/IfLevelSchema';
import { formatDate, padL } from '../../shared/misc';
//import { a } from 'react-spring';

type DetailPropsType = {
	levels: Array<IfLevelSchema>
};


// Do we want to output KC columns?
const ADD_KC_COLUMNS = false;


// Return the count for the given tag. 
// Returns 0 if not found.
function get_tag_n( tags: Array<any>, tag: string): number {
	if(typeof tags === 'undefined') return 0;
	for(let i=0; i<tags.length; i++) {
		if(tags[i].tag == tag) return tags[i].n;
	}
	return 0;
}



// Convert the data structure into a more useful approch.


export default class QuestionsPagesExcelFormula extends React.Component<DetailPropsType> {


	// Convert the nested structure into a flat table of common values.
	flatten_levels = (levels: any): any => {
		const columns = [
			'level',
			'q_code',
			'q_solution_sql', 
			'q_solution_sql_length',
			'q_description',
			'a_type',
			'q_n', 
			
			'a_username', 'a_seconds', 
			'a_sequence_in_level',
			'a_correct', 'a_completed',
			'a_history_length', 
			'a_tutorial',
			'a_answer_final', 
			'a_history_first_clientsql_dt',
			'a_history_last_clientsql_dt',
			'a_page_id',
			'a_paste',
			'level_completed',
			'server_page_added',
			'server_nextactivity',
			'hints_parsed',
			'hints_viewsolution',
			];
		const rows: any[] = [];

		levels.map( level_summary => {
			const defaults = { 
				level: level_summary.code
			};
			this.flatten_level_questions( rows, level_summary, columns, defaults );
		});


		// Sort.  First by level, then user, then order in sequence.
		rows.sort( ( a, b) => {
			(padL(a.level, 15) + '.' + padL(a.a_username,25) + '.' + padL(a.a_sequence_in_level, 3));
			
			if((padL(a.level, 15) + '.' + padL(a.a_username,25) + '.' + padL(a.a_sequence_in_level, 3)) > 
					(padL(b.level, 15) + '.' + padL(b.a_username,25) + '.' + padL(b.a_sequence_in_level, 3))
				) return 1;

			return -1;
		});

		return { columns, rows };
	}

	flatten_level_questions= (rows: Array<any>, level_summary: any, columns: any, defaults: any) => {

		level_summary.questions.map( question => {
			if( question.type !== 'IfPageSqlSchema') return;

			const local = {
				q_code: question.description + '. ' + question.instruction,
				q_solution_sql: question.solution_sql ? "'" + question.solution_sql : '',
				q_solution_sql_length: question.solution_sql ? question.solution_sql.length : '',

				q_description: question.description,
				q_instruction: question.instruction,
				q_n: question.n,
				q_correct_average: Math.round(question.correct_average*100)+'%',
				q_seconds_average: Math.round(question.seconds_average),
				q_tags: question.tags.map( t => t.n + ' ' + t.tag ).join(', '),
				
				...defaults
			};
			this.flatten_level_question_answers( rows, question, columns, local);
		});
	}

	replace_spans = (s: string): string => {
		if(s === null) return '';
		if(typeof s === 'undefined') return '';
		// @ts-ignore
		if(typeof s ===  'number') return s.toString();

		return s
			.replace( new RegExp('<span class="badge">', 'g'), '[')
			.replace( new RegExp('</span>', 'g'), ']');
	}
	

	flatten_level_question_answers = (rows: Array<any>, question: any, columns: any, defaults: any) => {

		question.answers.map( answer => {
			// Only track completed pages.
			if(!answer.page.completed) return;

			if(answer.page.type !== 'IfPageSqlSchema' ) return;

			let history = answer.page.history.filter( h => typeof h.client_sql !== 'undefined' && h.code === 'client_update' );

			const local = {
				'a_username': DEMO_MODE ? '****' : answer.username, 
				'a_seconds' : answer.seconds, 
				//'a_breaks': answer.breaks, 
				'a_correct': answer.correct ? 1 : 0,
				'a_completed': answer.completed ? 1 : 0, 
				'a_html': answer.html,
				
				a_history_length: answer.page.history.length,
				
				
				a_tutorial: answer.page.code === 'tutorial' ? 1 : 0,

				a_type: answer.page.type.substr(6),

				a_answer_final: "'" + this.replace_spans(answer.answer),
				a_answer_intermediate: "'" + this.replace_spans(answer.intermediate),
				a_answer_all: "'" + this.replace_spans(answer.all),
				a_sequence_in_level: answer.sequence_in_level,

				a_history_first_clientsql_dt: history.length > 0 ? formatDate(history[0].dt) : null,
				a_history_last_clientsql_dt: history.length > 0 ? formatDate(history[history.length-1].dt) : null,

				a_history_predicted_answers_used: answer.page.history.filter(
					h => typeof h.predicted_answers_used !== 'undefined' && typeof h.predicted_answers_used.client_sql === 'undefined'
				).length,

				a_page_id: answer.page.id,

				level_completed: answer.level_completed ? 1 : 0,
				server_page_added: formatDate(answer.server_page_added),
				server_nextactivity: formatDate(answer.server_nextactivity),
				hints_parsed: answer.hints_parsed,
				hints_viewsolution: answer.hints_viewsolution,
	
				...defaults
			};

			//debugger;

			rows.push(local);
		});

	}



	render = (): ReactElement => {
		const levels = this.props.levels;
		//if(levels) console.log(levels[0].questions[4]);
		const flat = this.flatten_levels(levels);
		const rows = flat.rows;
		const columns = flat.columns;
		const td_style = {
			'border': 'solid 1px black',
			'padding': 5,
			'textAlign': 'right'
		};


		// Go through each map of levels and return a table for each.
		const trs = rows.map( 
			(answer, n) => {
				const tds: ReactElement[] = [];

				for(let i=0; i<columns.length; i++) {
					// @ts-ignore
					tds.push( <td key={'excel_td_'+i} style={td_style}>{ 
						typeof answer[columns[i]] === 'undefined' ? 0 : answer[columns[i]] 
					}</td> );
				}

				return <tr key={'excel_tr_'+n}>{ tds }</tr>;
			}
			);

		// @ts-ignore
		const ths = columns.map( (col,i) => <th key={'excel_ths_'+i} style={td_style}>{col}</th>);

		// If empty, return a div.
		if(rows.length < 1) return <table/>;

		return (<table>
				<thead><tr>{ ths }</tr></thead>
				<tbody>{ trs }</tbody>
				</table>);
	}
}


