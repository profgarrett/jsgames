// @flow
import React from 'react';
//import { Panel, Popover, OverlayTrigger, Well } from 'react-bootstrap';

//import { HtmlDiv } from './../components/Misc';

import type { LevelType } from './IfTypes';
import type { Node } from 'react';
import IfActivitySummaryChart from './IfActivitySummaryChart';
//import IfActivityMistakesChart from './IfActivityMistakesChart';


// Simple function that adds an index if none exists.
function get_or_create(o: any, key: string, value: any, create: any) {
	if(typeof o === 'undefined') {
		o[key] = create = 'Array' ? [] : new Map();
	}
	if( typeof o[key] === 'Array') {
		o[key].push(value);
	} else {
		o[key]
	}
}




type PropsType = {
	levels: Array<LevelType>
};

function turn_array_into_map( a: Array<any>, get_p: any ): Map {

	var m = new Map();
	var index = '';

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
	_render_users_pages_by_date(): Node {

		// Organize array into a map of dates.
		let dates = turn_array_into_map(
				this.props.levels,
				(l: LevelType): string => toDate(l.get_first_update_date())
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

		dates_and_users_and_levels.forEach( (map_of_users, date_key) => {
			html.push(<h2>{ date_key} </h2>);

			map_of_users.forEach( (map_of_levels, user_key) => {
				html.push( <h3>{ user_key}</h3>);

				map_of_levels.forEach( (levels, level_key) => {
					html.push( <li>
						<b>{ level_key }</b>
						<br/>
						{ levels.map( l => l.get_first_update_date()+'<br/>' )}
						</li>);

				});
			});
		});

		return (<div>
				<h3>Daily Activity</h3>
				{ html }
			</div>);
	}


	render(): Node {
		if(this.props.levels.length < 1) 
			return <div/>;

		return this._render_users_pages_by_date();


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
