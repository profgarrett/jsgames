// @flow
import React from 'react';
//import { Panel, Popover, OverlayTrigger, Well } from 'react-bootstrap';

//import { HtmlDiv } from './../components/Misc';

import type { LevelType, PageType, FormulaPageType, HarsonsPageType, ChoicePageType } from './IfTypes';
import type { Node } from 'react';
import IfActivitySummaryChart from './IfActivitySummaryChart';
//import IfActivityMistakesChart from './IfActivityMistakesChart';

import {HtmlDiv} from './../components/Misc';
import ReactTable from 'react-table';
import 'react-table/react-table.css';



type PropsType = {
	levels: Array<LevelType>
};

function turn_array_into_map( a: Array<any>, get_p: any, sort_order_alpha: boolean = true ): Map {

	var m = new Map();
	var index = '';

	// Create a new array that is properly sorted by get_p
	// Map uses insertion order, so this sets insertion order 
	// the get_p function's result (i.e., string, date, etc..)

	var sorted_a = sort_order_alpha
		? a.sort( (a,b) => get_p(a) < get_p(b) ? -1 : 1 )
		: a.sort( (a,b) => get_p(a) > get_p(b) ? -1 : 1 );

	sorted_a.map( item => {
		// Add new map [] if the key doesn't exist.
		index = get_p(item);

		if( !m.has(index) ) m.set(index, []);
		m.get(index).push(item);
	});

	return m;
}


function toDate( max: Date ): string {
	return max.getFullYear() + '.'
		+ max.getMonth().toString().padStart(2, '0') + '.' + 
		max.getDate().toString().padStart(2, '0');
}

export default class IfActivity extends React.Component<PropsType> {
	constructor(props: any) {
		super(props);
	}



	/**
		Return historical information

	*/
	_render_users_pages(): Node {

		const table_css = {
			border: 'solid 1px black',
			width: '100%',
		};

		const td_css = {
			border: 'solid 1px black',
			verticalAlign: 'middle',
			padding: 2
		};
		const td_css_right = {
			...td_css, 
			textAlign: 'right',
		};

		// Create a list of distinct columns.
		const columns = [ 
			'tutorial',
			'math1', 'math2', 'summary', 'rounding',
			'if1', 'if2', 'if3', 'if4', 'if5', 'if6', 'if7', 'if8' ];

		const finished_levels = this.props.levels.filter( l => l.completed );

		// Organize into a map of users.
		const users = turn_array_into_map(finished_levels, 
			(l: LevelType): string => l.username
		);

		// Organize each date/user into a map of levels.
		const users_and_levels = new Map();

		users.forEach( (levels, user) => {
			const level_map = turn_array_into_map(levels,
				(l: LevelType) => l.code
			);

			const max_level_map = new Map();
			level_map.forEach( (levels, code) => {
				var max_level_score = levels.reduce( 
					(max, l) => max.get_score_as_percent() > l.get_score_as_percent() ? max : l,
					{ get_score_as_percent: () => 0 } );
				max_level_map.set(code, max_level_score);
			});

			users_and_levels.set( user, max_level_map );
		});



		// Start creating html.
		const table = [];
		var tds = [];
		var max_level = {};

		table.push(<tr>
			<td style={ td_css }>Username</td>
			{ columns.map( 
				c => <td style={ td_css }>{c}</td> 
				)
			}
			</tr>);

		users_and_levels.forEach( (map_of_levels, user_key ) => {
			//html.push( <b key={ 'render_users_pages'+user_key }>{ user_key}</b>);

			tds = [<td style={ td_css }>{ user_key }</td>];

			columns.map( c => {
				if(map_of_levels.has(c)) {
					max_level = map_of_levels.get(c);
					tds.push( <td style={ td_css_right}>{ max_level.get_score_as_percent() }%</td> );
				} else {
					tds.push( <td style={ td_css_right}></td> );
				}
			});

			/*

			map_of_levels.forEach( (levels, level_key) => {
				tds.push( <li key={'render_users_pages'+user_key+level_key}>
					<b>{ level_key }</b>: &nbsp;
					{ levels.map( l => { 
						return (l.completed ? 'Finished! ' : '')
							+ l.get_time_in_minutes() + 'm ['
							+ l.get_tutorial_pages_completed() + ' tutorials, ' 
							+ l.get_score_correct() + ' of ' 
							+ l.get_score_attempted() + ' tests'
							+ ']';
					}).join(', ')}
					</li>);
			}); 
			*/

			table.push( <tr>{ tds }</tr> );
		});


		return (<div>
				<h3>Student Tutorials</h3>
				<table style={table_css}>{ table }</table>
			</div>);
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




	/**
		Return historical information

	*/
	_render_users_pages_by_date(): Node {

		// Organize array into a map of dates.
		let dates = turn_array_into_map(
				this.props.levels,
				(l: LevelType): string => toDate(l.get_first_update_date()),
				false
			);

		// Organize each date into a map of users.
		const dates_and_users = new Map();

		dates.forEach( (levels, date_key) => {
			const users_map = turn_array_into_map(levels, 
				(l: LevelType): string => l.username
			);
			dates_and_users.set( date_key, users_map );
		});


		// Organize each date/user into a map of levels.
		const dates_and_users_and_levels = new Map();

		dates_and_users.forEach(( map_of_users, date) => {
			const new_map_of_users = new Map();

			map_of_users.forEach( (levels, user) => {
				const level_map = turn_array_into_map(levels,
					(l: LevelType) => l.code
				);
				new_map_of_users.set( user, level_map );
			});

			dates_and_users_and_levels.set( date, new_map_of_users);
		});


		// Start creating html.
		const html = [];
		var lis = [];

		dates_and_users_and_levels.forEach( (map_of_users, date_key) => {
			html.push(<h3 key={date_key}>{ date_key} </h3>);

			map_of_users.forEach( (map_of_levels, user_key) => {
				html.push( <b key={ date_key+user_key }>{ user_key}</b>);

				lis = [];

				map_of_levels.forEach( (levels, level_key) => {
					lis.push( <li key={date_key+user_key+level_key}>
						<b>{ level_key }</b>: &nbsp;
						{ levels.map( l => { 
							return (l.completed ? '' : '?')
								+ l.get_time_in_minutes() + 'm ['
								+ l.get_tutorial_pages_completed() + ' tutorials, ' 
								+ l.get_score_correct() + ' of ' 
								+ l.get_score_attempted() + ' tests,'
								
								+ ']';
						}).join(', ')}
						</li>);
				});
				html.push( <ul key={ date_key+user_key+'ul' }> { lis }</ul> );
			});
		});

		return (<div>
				<h3>Daily Activity</h3>
				{ html }
			</div>);
	}



	/**
		Return historical information

	*/
	_render_pages_summary(): Node {

		// Organize array into a map of levels.
		let levels = turn_array_into_map(
				this.props.levels,
				(l: LevelType): string => l.code,
				false
			);

		// Organize each level into a map of pages.
		const levels2 = new Map();

		levels.forEach( (ls, level_key) => {
			let key = '';
			const pages_map = new Map();

			// Create keys
			for(let i = 0; i<ls.length; i++) {

				// Go through each page.
				for(let j = 0; j<ls[i].pages.length; j++) {
					key = ls[i].pages[j].description+'\n'+ ls[i].pages[j].instruction;
					if(!pages_map.has(key)) pages_map.set(key, []);
					pages_map.get(key).push(ls[i].pages[j]);
				}
			}

			levels2.set( level_key, pages_map );
		});


		// Start creating html.
		const html = [];
		var lis = [];

		levels2.forEach( (pages_map, level_key) => {
			html.push(<h3 key={'pagesummary'+level_key}>{ level_key} </h3>);

			html.push(<p>Count: {pages_map.size})</p>);

			pages_map.forEach( (page_array, key) => {
				html.push( <b key={  'pagesummarykey'+key }>{ page_array[0].description }
						<br/> { page_array[0].instruction }</b>
					);

				lis = page_array.map( (p,i) => {
					return (<li key={'pagesummaryli'+i}>
							Change: { p.history.length } 
							
						</li>);
				});

				html.push( <ul key={ 'pagesummary'+key+'ul' }> { lis }</ul> );
			});
		});

		return (<div>
				<h3>Page Summary</h3>
				{ html }
			</div>);
	}



	render(): Node {
		if(this.props.levels.length < 1) 
			return <div/>;

		return (<div>
					{ this._render_level_solutions() }
					{this._render_users_pages() }
					{this._render_pages_summary() }
					{this._render_users_pages_by_date() }
				</div>);


		const levelDict = {};

		// Organize by level.code
		this.props.levels.map( (level: LevelType ) => {
			if(!levelDict.hasOwnProperty(level.code)) {
				levelDict[level.code] = [];
			}
			levelDict[level.code].push(level);
		});

		// Sort each level by username
		Object.keys(levelDict).forEach( 
			(key: string): any => levelDict[key] = levelDict[key].sort( 
				(a: LevelType, b: LevelType): boolean => a.username > b.username 
			)
		);

		// Make a unique row for each distinct level
		/*
		const rows = [];
		Object.keys(levelDict).forEach( 
			(key: string): Node => {

				rows.push((<div key={ key }>
					<h1>{ levelDict[key][0].code }</h1>
					<b>Items: { levelDict[key].length }</b>
					<IfActivitySummaryChart levels={levelDict[key]} />
					</div>
				));
			}
		);
		*/

		/*
		const data = 
			this.props.levels.reduce(
				(accumLevels, level) => accumLevels.concat( 
					level.pages.reduce(
						(accumPages, page) => accumPages.concat(
							page.history.map(
								(history, history_i) => {
										return {
											username: level.username, 
											code: level.code,
											page: 0,
											created: history.created.toString(),
											value: history.client_f ? history.client_f : '?'+page.toString() 
										}; 
									}
							)
						)
					,[])
				),[]);
		*/

		
		// Create a summary chart for each level.
		const summary_charts = [];

		Object.keys(levelDict).forEach( 
			(key: string): any => {
				summary_charts.push( (
					<div>
						<h1>{key}</h1>
						<IfActivitySummaryChart levels={levelDict[key]} />
					</div> 
				));
			}
		);
		/*
		IfActivitySummaryChart
			this.props.levels.reduce(
				(accumLevels, level) => accumLevels.concat( 
					level.pages.reduce(
						(accumPages, page) => accumPages.concat(
							page.history.map(
								(history, history_i) => {
										return {
											username: level.username, 
											code: level.code,
											page: 0,
											created: history.created.toString(),
											value: history.client_f ? history.client_f : '?'+page.toString() 
										}; 
									}
							)
						)
					,[])
				),[]);
		*/

		return (<div>
			{summary_charts}
			</div>
		);

	}

}
