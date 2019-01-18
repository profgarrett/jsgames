// @flow
import React from 'react';

import type { LevelType, PageType, FormulaPageType, HarsonsPageType, ChoicePageType } from './IfTypes';
import type { Node } from 'react';
import { DEMO_MODE } from './../../server/secret';

import { HtmlDiv } from './../components/Misc';
import { turn_array_into_map } from './../../shared/misc';

import ReactTable from 'react-table';
import 'react-table/react-table.css';

type PropsType = {
	levels: Array<LevelType>
};


// toLocaleTimeString is super slow when used with a larger number of objects.
// Create a custom little formatter to speed things up.  Changed from 6s to 
// almost nothing.
const formatDate = (dt: Date): string => {
	return dt.getMonth() + '/' +
		dt.getDate() + ', ' +
		dt.getHours() + ':' + 
		(dt.getMinutes() + ':').padStart(3, '0') +
		(dt.getSeconds() + '').padStart(2, '0');

	//return '123'; //.toLocaleTimeString('en-US')
};

// Show a history item in an appealing fashion.
const pretty_history = h => {
	const tags = h.tags
			.map( t => '<span class="badge">'+t.tag+'</span>' );

	return h.client_f + ' ' + tags.join(' ');
};

// Return if the tag array has a matching tag.
// T/F
const has_tag = (tags: Array<Object>, match: string): boolean => {
	return 0 < tags.filter( t => t.tag === match ).length;
};



export default class IfAnswers extends React.Component<PropsType> {
	constructor(props: any) {
		super(props);
	}


	/**
		Return historical information

	*/
	_render_level_solutions(): Node {
		//const finished_levels = this.props.levels.filter( l => l.completed );

		// Organize into a map of levels.
		const level_map = turn_array_into_map(this.props.levels, 
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
			accessor: p => DEMO_MODE ? '*****' : p.username,
			width: 150
		}, {
			id: 'seconds',
			Header: 'Time (s)',
			accessor: p => p.seconds,
			width: 75
		}, {
			id: 'correct',
			Header: 'Correct?',
			accessor: p => p.correct,
			width: 80
		}, {
			id: 'type',
			Header: 'type',
			accessor: p => p.type,
			width: 80
		}, {
			id: 'breaks',
			Header: 'breaks',
			accessor: p => p.breaks,
			width: 30
		}, {
			id: 'completed',
			Header: 'completed',
			accessor: p => p.completed ? '' : 'N' ,
			width: 50

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

		// Turn levels into a map, with each obj as an array of matching Answers.
		const q_map = new Map();

		levels.map( (l: LevelType) => {
			let key = '';

			l.pages.forEach( (p: PageType) => {
				key =  p.description+'<br>'+ p.instruction + ' ('+p.type + ')';
				if(!q_map.has(key)) q_map.set(key, []);
				q_map.get(key).push(p);
			});
		});

		// Html result, holding all of the keys and tables.
		const q_summaries = [];

		// For each question...
		q_map.forEach( (values: Array<PageType>, key) => {

			const formula_pages = values.filter( p => p.type === 'IfPageHarsonsSchema' || p.type === 'IfPageFormulaSchema' );
			const choice_pages = values.filter( p => p.type === 'IfPageChoiceSchema');
			const page_table_data = [];

			// For each type of answer to the question
			// Note that some can be harsons and/or formulas, so it isn't as weird 
			// as it looks.
			formula_pages.map( (p: HarsonsPageType) => {
				const history = p.history.filter( h => !has_tag(h.tags, 'INTERMEDIATE' ) );
				const history_string = history.map( h => pretty_history(h) ).join('<br/>');
				const expand_string = p.history
					.filter( h => typeof h.client_f !== 'undefined')
					.map( h => formatDate(h.dt) + ': ' + pretty_history(h) )
					.join('<br/>');

				page_table_data.push( { 
					username: p.username,
					seconds: p.get_time_in_seconds(),
					correct: p.correct ? 'Yes' : '',
					breaks: p.get_break_times_in_minutes().join(', '),
					completed: p.completed,
					type: 'formulas',
					value: history_string,
					expand: expand_string
				});
				
			});

			choice_pages.map( (p: ChoicePageType) => {
				page_table_data.push( {
					username: p.username,
					seconds: p.get_time_in_seconds(),
					correct: p.correct === true ? 'Yes' : (p.correct === false ? 'No' : ''),
					breaks: p.get_break_times_in_minutes().join(', '),
					completed: p.completed,
					type: 'choice',
					value: p.client,
					expand: ''
				});
			});

			const answer_table = (<div>
				<HtmlDiv style={{ backgroundColor: 'gray', marginTop: 20 }} html={key}/>
				{ page_table_data.length === 0 ? <div/> : 
				<ReactTable 
					data={page_table_data} 
					filterable={true}
					columns={columns}
					defaultSorted={['type', 'seconds']}
					defaultPageSize={page_table_data.length}
					style={{ backgroundColor: '#f5f5f5' }}
					SubComponent={ (p) => <HtmlDiv html={p.original.expand} /> }
				/> }
				</div>);

			// Create a summary row for the page.
			q_summaries.push( {
				key: key,
				type: values[0].type,
				count: values.length,
				code: values[0].code,
				correct_average: values.reduce( 
					(sum, p) => sum+ (p.correct?1:0), 0 
					) / (values.length === 0 ? 1 : values.length),
				seconds_average: values.reduce( 
					(sum, p) => sum+p.get_time_in_seconds(), 0 
					) / (values.length === 0 ? 1 : values.length),
				breaks: values.reduce( 
					(count, p) => count + p.get_break_times_in_minutes().length,
					0),
				completion: Math.round(
						values.reduce( (count, p) => count + (p.completed ? 1 : 0), 0) / values.length * 100
						) + '%',
				expand: answer_table
			});
		});



		const summary_columns = [{
			id: 'key',
			Header: 'Key', 
			accessor: p => p.key
		}, {
			id: 'type',
			Header: 'Type',
			accessor: p => p.type.substr(6),
			width: 100
		}, {
			id: 'count',
			Header: 'Count',
			accessor: p => p.count,
			width: 100
		}, {
			id: 'completion',
			Header: 'completion',
			accessor: p => p.completion,
			width: 75
		}, {
			id: 'code',
			Header: 'code',
			accessor: p => p.code,
			width: 100
		}, {
			id: 'correct',
			Header: 'Correct',
			accessor: p => Math.round(p.correct_average*100)+'%',
			width: 100
		}, {
			id: 'seconds',
			Header: 'Seconds',
			accessor: p => Math.round(p.seconds_average),
			width: 50
		}, {
			id: 'breaks',
			Header: 'breaks',
			accessor: p => p.breaks,
			width: 50
		}, {
			expander: true,
			Header: () => <b>More</b>,
			width: 65,
			Expander: ({ isExpanded, ...rest }) => 
				<span> 
					{ isExpanded 
						? <span>&#x2299;</span>
						: <span>&#x2295;</span>}
				</span>,
			style: {
				cursor: 'pointer',
				fontSize: 16
			}

		}];

		const summary = <ReactTable
			data={q_summaries}
			filterable={true}
			columns={summary_columns}
			SubComponent={ (q) => <div>X { q.original.expand }</div> }
			/>;

		return (<div id='IfAnswersTopDiv' key='IfAnswersTopDiv'>
				{ summary }
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
