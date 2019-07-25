//@flow
import React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { Table } from 'react-bootstrap';

import { DEMO_MODE } from './../../server/secret';

import type { LevelType } from './IfTypes';
import type { Node } from 'react';
import { HtmlDiv } from './../components/Misc';

type DetailPropsType = {
	levels: Array<LevelType>
};



function array_to_object( a: Array<string> ): Object {
	var o = {};
	a.map( s => o[s] = true );
	return o;
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Class used to show tag data.
////////////////////////////////////////////////////////////////////////////////
export default class IfPagesTags extends React.Component<DetailPropsType> {


	build_row( data: Object, columns: Object ): Node {
		const tds = [];

		for(let index in columns) {
			if( columns.hasOwnProperty(index)) {
				tds.push(<td>{ 
						typeof data[index] !== 'undefined' 
						? 
							data[index] === true ? '1' : data[index]
						: 0
					}</td>);
			}
		}

		return <tr>{ tds }</tr>;
	}



	build_row_data( rows: Array<Object>, question: Object) {

		const question_base = {
			level: question.level,
			description: question.description + '. '+question.instruction,
			solution_f: "'" + question.solution_f,
		};

		question.kcs.map( kc => question_base['KC_'+kc.tag] = true );
		
		// Add each answer
		question.answers.map( answer => {
			const page = answer.page;

			const ms = page.history.length === 0 
				? 0
				: typeof page.history[0].created !== 'undefined'
					? page.history[page.history.length-1].created.getTime() - page.history[0].created.getTime()
					: page.history[page.history.length-1].dt.getTime() - page.history[0].dt.getTime();

			const row = { 
				...question_base,
				correct: page.correct ? 1 : 0,
				client_f: "'" + page.client_f,
				username: page.username,
				sequence_in_level: page.sequence_in_level,
				code: page.code,

				time: ms/1000
			};

			answer.tags
				.filter( f => f.tag !== 'INTERMEDIATE' && f.gat !== 'CORRECT' )
				.map( t => row['TAG_'+t.tag] = true );
			
			rows.push(row);
		});
	}



	// Return a table with the questions for the given level.
	_render_a_levels_questions(level_summary: any): Node {

		const questions = level_summary.filter( 
				l => l.answers.length > 1 
					&& l.type === 'IfPageFormulaSchema' 
					&& l.answers[0].page.code === 'test');

		const data = [];
		questions.map( q => this.build_row_data(data, q) );


		const columns = data.reduce( (accum, d) => {
			for(let index in d) {
				if(d.hasOwnProperty(index)) {
					if(accum[index] !== true) accum[index] = true;
				}
			}
			return accum;
		}, {});

		console.log(questions);
		//console.log(data);
		//console.log(columns);
		const ths = [];

		for(let index in columns) {
			if( columns.hasOwnProperty(index)) {
				ths.push(<th>{ index }</th>);
			}
		}		

		return <Table><tbody><tr>{ ths }</tr>{ data.map( d => this.build_row(d, columns ) ) }</tbody></Table>;
	}



	render(): Node {
		const levels = this.props.levels;

		// If empty, return a div.
		if(levels.length < 1) return <div/>;

		// Move code into questions
		levels.map( l => l.questions.map( q => q.level = l.code ));

		// Join.
		const level = levels.reduce( (accum, level) => accum.concat(level.questions), []);

		//<h1>{ level_summary.code }</h1>

		// Go through each map of levels and return a table for each.
		const html = [level].map( 
			(level_summary,i) => 
				<div key={'IfPagesTableRender' + i}>
					{ this._render_a_levels_questions(level_summary) }
				</div>
			);

		return html;
	}
}

