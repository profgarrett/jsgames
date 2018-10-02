// @flow
import React from 'react';

import type { LevelType, PageType, FormulaPageType, HarsonsPageType, ChoicePageType } from './IfTypes';
import type { Node } from 'react';

import { HtmlDiv } from './../components/Misc';
import { turn_array_into_map } from './../../shared/misc';

import ReactTable from 'react-table';
import 'react-table/react-table.css';


type PropsType = {
	levels: Array<LevelType>
};


export default class IfAnswers extends React.Component<PropsType> {
	constructor(props: any) {
		super(props);
	}


	/**
		Return historical information

	*/
	_render_level_solutions(): Node {
		const finished_levels = this.props.levels.filter( l => l.completed );

		// Organize into a map of levels.
		const level_map = turn_array_into_map(finished_levels, 
			(l: LevelType): string => l.code
		);

		const html = [];

		level_map.forEach( ls => {
			html.push( this._render_level_solutions_level(ls) );
		});

		return html;
	}

	_render_level_solutions_level(levels: Array<LevelType>): Node {

		const columns = [{
			id: 'username',
			Header: 'Username', 
			accessor: p => p.username,
			width: 200
		}, {
			id: 'seconds',
			Header: 'Seconds',
			accessor: p => p.seconds,
			width: 100
		}, {
			id: 'correct',
			Header: 'Correct?',
			accessor: p => p.correct,
			width: 100
		}, {
			id: 'type',
			Header: 'type',
			accessor: p => p.type
		}, {
			id: 'value',
			Header: 'value',
			accessor: p => <HtmlDiv html={p.value} />
		}, {
			expander: true,
			Header: () => <b>More</b>,
			width: 65,
			Expander: ({ isExpanded, ...rest }) => 
				<div> 
					{ isExpanded 
						? <span>&#x2299;</span>
						: <span>&#x2295;</span>}
				</div>,
			style: {
				cursor: 'pointer',
				fontSize: 32
			}

		}];

		// Add username to all pages (since that data is stored in the level, not page)
		levels.map( l => l.pages.map( p => p.username = l.username ));

		// Convert to map.

		// Turn levels into a map, with each obj as an array of matching questions.
		const q_map = new Map();
		levels.map( (l: LevelType) => {
			let key = '';

			l.pages.forEach( (p: PageType) => {
				key = p.description+'<br>'+ p.instruction;
				if(!q_map.has(key)) q_map.set(key, []);
				q_map.get(key).push(p);
			});
		});


		const filter_history = 	(h) => h.filter( // filter non f and unused events.
									h => typeof h.client_f !== 'undefined' &&
										h.client_f !== null &&
										h.code !== 'created' &&
										h.code !== 'server_page_completed'
								).filter( // filter dups and progressively built items  A, A+, A+1, ...
									(h, i, h_array) => {
										// always return last item.
										if(i==h_array.length-1) return true; 

										// must be different than next.
										if (h.client_f === h_array[i+1].client_f) return false;

										// must be different than next + 1 or more characters, i.e. ignore intermediate typing
										if(h.client_f === h_array[i+1].client_f.substr(0, h.client_f.length)) return false;

										// see if we are deleting, i.e., the current entry could entirely fit inside 
										// of the previous entry.
										if(i>1 && h_array[i-1].client_f.indexOf(h.client_f) !== -1) return false;

										return true; // default to returning.
									}
								);


		// Html result, holding all of the keys and tables.
		const html = [];

		// For each question...
		q_map.forEach( (values: Array<PageType>, key) => {

			const harsons = values.filter( p => p.type === 'IfPageHarsonsSchema' );
			const formulas = values.filter( p => p.type === 'IfPageFormulaSchema' );
			const qs = values.filter( p => p.type === 'IfPageChoiceSchema');
			const table_data = [];
			// For each type of answer to the question
			// Note that some can be harsons and/or formulas, so it isn't as weird 
			// as it looks.
			formulas.map( (p: HarsonsPageType) => {
				const history = filter_history(p.history).map( h => h.client_f);
				const history_string = history.join('<br/>');
				const expand_string = p.history
					.filter( h => typeof h.client_f !== 'undefined')
					.map( h => h.dt.toLocaleTimeString('en-US') + ': ' + h.client_f )
					.join('<br/>');

				table_data.push( { 
					username: p.username,
					seconds: p.get_time_in_seconds(),
					correct: p.correct ? 'Yes' : '',
					type: 'formulas',
					value: history_string,
					expand: expand_string
				});
				
			});

			html.push( <div>
				<HtmlDiv style={{ backgroundColor: 'gray', marginTop: 20 }} html={key}/>
				{ table_data.length === 0 ? <div/> : 
				<ReactTable 
					data={table_data} 
					filterable={true}
					columns={columns}
					SubComponent={ (p) => <HtmlDiv html={p.original.expand} /> }
				/> }
				</div>);

		});


		return (<div>
				<h3>Level Page Answers by User</h3>
				{ html }
			</div>
		);
	}



	render(): Node {
		if(this.props.levels.length < 1) 
			return <div/>;

		return (<div>
					{this._render_level_solutions() }
				</div>);
	}

}
