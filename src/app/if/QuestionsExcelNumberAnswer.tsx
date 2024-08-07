import React, {ReactElement} from 'react';
import { DEMO_MODE } from '../configuration';


import { IfLevelSchema } from '../../shared/IfLevelSchema';
import { formatDate, padL } from '../../shared/misc';

type DetailPropsType = {
	levels: Array<IfLevelSchema>
};

export default class QuestionsPagesExcelNumberAnswer extends React.Component<DetailPropsType> {

	// Convert the nested structure into a flat table of common values.
	flatten_levels = (levels: any): any => {
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
			'a_history_first_clientf_dt',
			'a_history_last_clientf_dt',
			'q_solution',
			'q_instruction',
			'q_description',
			'a_client', 
            'solution_f'
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
			//(padL(a.level, 15) + '.' + padL(a.a_username,25) + '.' + padL(a.a_sequence_in_level, 3));
			
			if((padL(a.level, 15) + '.' + padL(a.a_username,25) + '.' + padL(a.a_sequence_in_level, 3)) > 
					(padL(b.level, 15) + '.' + padL(b.a_username,25) + '.' + padL(b.a_sequence_in_level, 3))
				) return 1;

			return -1;
		});

		return { columns, rows };
	}

	flatten_level_questions = (rows: Array<any>, level_summary: any, columns: any, defaults: any) => {

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

	

	flatten_level_question_answers = (rows: Array<any>, question: any, columns: any, defaults: any) =>{

		question.answers.map( answer => {
			// Only track completed pages.
			if(!answer.page.completed) return;
			if(answer.page.type !== 'IfPageNumberAnswerSchema') return;

			let history = answer.page.history.filter( h => typeof h.client_f !== 'undefined' && h.code === 'client_update' );

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

				a_history_first_clientf_dt: history.length > 0 ? formatDate(history[0].dt) : null,
				a_history_last_clientf_dt: history.length > 0 ? formatDate(history[history.length-1].dt) : null,

				...defaults
			};

			rows.push(local);
		});

	}



	render = (): ReactElement => {
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

