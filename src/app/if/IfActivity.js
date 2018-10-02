// @flow
import React from 'react';
//import { Panel, Popover, OverlayTrigger, Well } from 'react-bootstrap';

//import { HtmlDiv } from './../components/Misc';

import type { LevelType, PageType, FormulaPageType, HarsonsPageType, ChoicePageType } from './IfTypes';
import type { Node } from 'react';

import { HtmlDiv } from './../components/Misc';
import { turn_array_into_map } from './../../shared/misc';

import ReactTable from 'react-table';
import 'react-table/react-table.css';


type PropsType = {
	levels: Array<LevelType>
};



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
					{this._render_users_pages() }
					{this._render_pages_summary() }
					{this._render_users_pages_by_date() }
				</div>);
	}

}
