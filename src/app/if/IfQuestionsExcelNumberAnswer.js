//@flow
import React from 'react';
import { DEMO_MODE } from './../../server/secret';

import { IfLevelSchema } from './../../shared/IfLevel';
import type { Node } from 'react';

type DetailPropsType = {
	levels: Array<IfLevelSchema>
};




// toLocaleTimeString is super slow when used with a larger number of objects.
// Create a custom little formatter to speed things up.  Changed from 6s to 
// almost nothing.
const formatDate = (dt: Date): string => {

	if(typeof dt === 'undefined') return 'undefined';
	if(typeof dt.getFullYear === 'undefined') return 'undefined';

	return dt.getFullYear().toString() + '/' +
		(1+parseInt(dt.getMonth(),10)) + '/' +
		dt.getDate() + ' ' +
		dt.getHours() + ':' + 
		(dt.getMinutes() + ':').padStart(3, '0') +
		(dt.getSeconds() + '').padStart(2, '0');

	//return '123'; //.toLocaleTimeString('en-US')
};


const padL = ( s_or_n: any, length: number ): string => {
	// If n, convert to string and return.
	if(typeof s_or_n === 'number') {
		return padL(s_or_n.toString(), length);
	}
	return s_or_n.padStart(length, '_');
};



export default class IfPagesExcelNumberAnswer extends React.Component<DetailPropsType> {

	// Convert the nested structure into a flat table of common values.
	flatten_levels(levels: any): any {
		const columns = [
			'level',
			'q_n', 
			'a_username', 
			'a_seconds', 
			'a_sequence_in_level',
			'a_correct', 
			'a_completed',
			'a_history_length', 
			'a_tutorial',
			'a_history_first_dt',
			'q_solution',
			'q_instruction',
			'q_description',
			'a_client', 
            'solution_f'
			];
		const rows = [];
        
		levels.map( level_summary => {
			const defaults = { 
				level: level_summary.code
			};
			this.flatten_level_questions( rows, level_summary, columns, defaults );
		});


		// Sort.  First by level, then user, then order in sequence.
		rows.sort( ( a, b) => {
			//(padL(a.level, 15) + '.' + padL(a.a_username,25) + '.' + padL(a.a_sequence_in_level, 3));
			
			if((padL(a.level, 15) + '.' + padL(a.a_username,25) + '.' + padL(a.a_sequence_in_level, 3)) > 
					(padL(b.level, 15) + '.' + padL(b.a_username,25) + '.' + padL(b.a_sequence_in_level, 3))
				) return 1;

			return -1;
		});

		return { columns, rows };
	}

	flatten_level_questions(rows: Array<any>, level_summary: any, columns: any, defaults: any) {

		level_summary.questions.map( question => {
			
			const local = {
				q_solution: question.solution ? "'" + question.solution : '',

				q_description: question.description,
				q_instruction: question.instruction,
				q_n: question.n,
				q_seconds_average: Math.round(question.seconds_average),
				...defaults
			};
			this.flatten_level_question_answers( rows, question, columns, local);
		});
	}

	

	flatten_level_question_answers(rows: Array<any>, question: any, columns: any, defaults: any) {

		question.answers.map( answer => {
			// Only track completed pages.
			if(!answer.page.completed) return;
			if(answer.page.type !== 'IfPageNumberAnswerSchema') return;


			const local = {
				'a_username': DEMO_MODE ? '****' : answer.username, 
				'a_seconds' : answer.seconds, 
				'a_correct': answer.correct ? 1 : 0,
				'a_completed': answer.completed ? 1 : 0, 
				'a_history_length': answer.page.history.length,
				'a_tutorial': answer.page.code === 'tutorial' ? 1 : 0,
				'a_type': answer.page.type.substr(6),
				'a_client': answer.client,
				'a_client_n': answer.client_n,
				'a_sequence_in_level': answer.sequence_in_level,
				'a_history_first_dt': answer.page.history.length > 0 ? formatDate(answer.page.history[0].dt) : null,
				...defaults
			};

			rows.push(local);
		});

	}



	render(): Node {
		const levels = this.props.levels;
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
				const tds = [];

				for(let i=0; i<columns.length; i++) {
					tds.push( <td key={'excel_td_'+i} style={td_style}>{ 
						typeof answer[columns[i]] === 'undefined' ? 0 : answer[columns[i]] 
					}</td> );
				}

				return <tr key={'excel_tr_'+n}>{ tds }</tr>;
			}
			);

		const ths = columns.map( (col,i) => <th key={'excel_ths_'+i} style={td_style}>{col}</th>);

		// If empty, return a div.
		if(rows.length < 1) return <table/>;

		return (<table>
				<thead><tr>{ ths }</tr></thead>
				<tbody>{ trs }</tbody>
				</table>);
	}
}

