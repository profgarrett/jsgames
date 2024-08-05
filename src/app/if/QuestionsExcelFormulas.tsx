import React, { ReactElement } from 'react';
import { DEMO_MODE } from '../configuration';

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
			'a_standardize_formula_case',
			'q_code',
			'q_solution_f', 
			'q_solution_f_length',

			'q_kcs',
			//'q_complexity',
			//'q_complexity_functions', 'q_complexity_values', 'q_complexity_symbols', 'q_complexity_references',
			//'q_description', 'q_instruction', 
			//'q_type',
			//'q_type_formula', 
			'a_type',
			'q_n', 
			//'q_correct_average', 'q_seconds_average', 'q_tags',
			
			'a_username', 'a_seconds', 
			'a_sequence_in_level',
			//'a_breaks', 
			'a_correct', 'a_completed',
			// 'a_html',
			
			//'a_tag_ABS_REF', 
			
			'a_tag_NO_STARTING_EQUAL', 
			'a_tag_NON_ROW_1_REFERENCE', 
			'a_tag_NON_EXISTANT_COLUMN_REFERENCE', 'a_tag_USES_A_REFERENCE_NOT_IN_SOLUTION', 'a_tag_MISSING_A_REFERENCE_USED_IN_SOLUTION', 
			'a_tag_USES_FUNCTION_NOT_IN_SOLUTION', 'a_tag_FUNCTION_WITHOUT_PAREN', 
			'a_tag_USES_VALUE_NOT_IN_SOLUTION', 
			
			//'a_tag_USES_NUMBER_IN_QUOTES',
			
			'a_history_clientf_nonintermediate_length',

			//'a_tag_INTERMEDIATE',
			'a_history_length', 
			//'a_tag_TYPO', 'a_tag_CORRECT',
			'a_tutorial',
			'a_answer_final', 
			// 'a_answer_intermediate', 
			//'a_answer_all',
			'a_history_first_clientf_dt',
			'a_history_last_clientf_dt',
			'a_history_predicted_answers_used',
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


		// Add KC columns  
		if(ADD_KC_COLUMNS) {
			const kcs = this.add_kc_order_column_by_user(rows);
			for(let kc in kcs) {
				columns.push(kc);
			}
		}

		return { columns, rows };
	}

	flatten_level_questions= (rows: Array<any>, level_summary: any, columns: any, defaults: any) => {

		level_summary.questions.map( question => {
			if( question.type === 'IfPageChoiceSchema') return;

			const local = {
				q_code: question.description + '. ' + question.instruction,
				q_solution_f: question.solution_f ? "'" + question.solution_f : '',
				q_solution_f_length: question.solution_f ? question.solution_f.length : '',
				q_kcs: question.kcs.join(','),
				/*
				q_complexity: complexity.map( c => c.tag).join(', '),
				
				q_complexity_functions: complexity.filter( c => c.tag.substr(0,4) === 'func').length,
				q_complexity_values: complexity.filter( c => c.tag.substr(0,4) === 'valu').length,
				q_complexity_symbols: complexity.filter( c => c.tag.substr(0,4) === 'symb').length,
				q_complexity_references: complexity.filter( c => c.tag.substr(0,4) === 'refe').length,
				*/

				q_description: question.description,
				q_instruction: question.instruction,
				q_n: question.n,
				q_correct_average: Math.round(question.correct_average*100)+'%',
				q_seconds_average: Math.round(question.seconds_average),
				q_tags: question.tags.map( t => t.n + ' ' + t.tag ).join(', '),
				
				//q_solution_f: question.solution_f,
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
			if(answer.page.type === 'IfPageChoiceSchema' || answer.page.type === 'IfPageTextSchema' || answer.page.type === 'IfPageParsonsSchema') return;

			let history = answer.page.history.filter( h => typeof h.client_f !== 'undefined' && h.code === 'client_update' );

			const local = {
				a_standardize_formula_case: answer.page.standardize_formula_case ? 1 : 0,
				'a_username': DEMO_MODE ? '****' : answer.username, 
				'a_seconds' : answer.seconds, 
				//'a_breaks': answer.breaks, 
				'a_correct': answer.correct ? 1 : 0,
				'a_completed': answer.completed ? 1 : 0, 
				'a_html': answer.html,
				
				'a_tag_ABS_REF': get_tag_n(answer.tags, 'ABS_REF'),
				'a_tag_NO_STARTING_EQUAL': get_tag_n(answer.tags, 'NO_STARTING_EQUAL'),
				'a_tag_NON_ROW_1_REFERENCE': get_tag_n(answer.tags, 'NON_ROW_1_REFERENCE'),
				'a_tag_NON_EXISTANT_COLUMN_REFERENCE': get_tag_n(answer.tags, 'NON_EXISTANT_COLUMN_REFERENCE'),
				'a_tag_USES_A_REFERENCE_NOT_IN_SOLUTION': get_tag_n(answer.tags, 'USES_A_REFERENCE_NOT_IN_SOLUTION'),
				'a_tag_MISSING_A_REFERENCE_USED_IN_SOLUTION': get_tag_n(answer.tags, 'MISSING_A_REFERENCE_USED_IN_SOLUTION'),
				'a_tag_USES_FUNCTION_NOT_IN_SOLUTION': get_tag_n(answer.tags, 'USES_FUNCTION_NOT_IN_SOLUTION'),
				'a_tag_FUNCTION_WITHOUT_PAREN': get_tag_n(answer.tags, 'FUNCTION_WITHOUT_PAREN'),
				'a_tag_USES_NUMBER_IN_QUOTES': get_tag_n(answer.tags, 'USES_NUMBER_IN_QUOTES'),
				'a_tag_USES_VALUE_NOT_IN_SOLUTION': get_tag_n(answer.tags, 'USES_VALUE_NOT_IN_SOLUTION'),
				'a_tag_INTERMEDIATE': get_tag_n(answer.tags, 'INTERMEDIATE'),
				'a_tag_TYPO': get_tag_n(answer.tags, 'TYPO'),
				'a_tag_CORRECT': get_tag_n(answer.tags, 'CORRECT'),
				a_history_length: answer.page.history.length,
				
				a_history_clientf_nonintermediate_length: answer.page.history
					.filter( 
						h => typeof h.client_f !== 'undefined' )
					.filter(
						h => get_tag_n(h.tags, 'INTERMEDIATE') === 0
					).length,
				
				a_tutorial: answer.page.code === 'tutorial' ? 1 : 0,

				a_type: answer.page.type.substr(6),
				a_type_harsons: answer.page.type.substr(6) === 'HarsonsSchema' ? 1 : 0,
				a_type_formula: answer.page.type.substr(6) === 'FormulaSchema' ? 1 : 0,

				a_answer_final: "'" + this.replace_spans(answer.answer),
				a_answer_intermediate: "'" + this.replace_spans(answer.intermediate),
				a_answer_all: "'" + this.replace_spans(answer.all),
				a_sequence_in_level: answer.sequence_in_level,

				a_history_first_clientf_dt: history.length > 0 ? formatDate(history[0].dt) : null,
				a_history_last_clientf_dt: history.length > 0 ? formatDate(history[history.length-1].dt) : null,

				a_history_predicted_answers_used: answer.page.history.filter(
					h => typeof h.predicted_answers_used !== 'undefined' && typeof h.predicted_answers_used.client_f === 'undefined'
				).length,

				a_page_id: answer.page.id,

				a_paste: get_tag_n(answer.tags, 'PASTE'),
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


	/**
		Adds in a KC_Order column to the rows.
		Looks by user to find the order in which they experience each KC.
		Relies upon rows being in order being being sent.
	*/
	add_kc_order_column_by_user = ( rows: Array<any> ): any => {
		const users = {};
		const kcs = {};
		let username = '';
		let i =0;

		for(i=0; i<rows.length; i++) {

			username = rows[i].a_username;

			// Add user
			if(typeof users[username] === 'undefined') {
				users[username] = {};
			}

			// Add each KC
			rows[i].q_kcs.split(',').map( kc => {

				// Add new KC
				if(typeof users[username][kc] === 'undefined' ) {
					users[username][kc] = 0;
				}

				// Increment
				users[username][kc] = users[username][kc] + 1;

				// Save to row.
				rows[i][kc] = users[username][kc];

				// Is this a new KC? If so, save to list.
				if(typeof kcs[kc] === 'undefined') kcs[kc] = true;
			});
		}

		// Go thru and add empty values for all kcs 
		// Can't do it the first time, as we didn't know all of the KCs prior to going through.
		for(i=0; i<rows.length; i++) {

			for(let kc in kcs) {
				if(typeof rows[i][kc] === 'undefined') {
					rows[i][kc] = 0;
				}
			}
		}

		return kcs;
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


