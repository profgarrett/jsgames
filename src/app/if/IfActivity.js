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
						<b >{ level_key }</b>: &nbsp;
						{ levels.map( (l,i) => { 
							return <span 
									key={ 'ifactivitydatesandusersandlevel'+l.code+i}  
									style={{ color: l.completed ? 'black' : 'red' }}>
								{l.get_time_in_minutes() + 'm ['
								+ l.get_tutorial_pages_completed() + ' tutorials, ' 
								+ l.get_test_score_correct() + ' of ' 
								+ l.get_test_score_attempted() + '] '
								}
								</span>;
						}) }
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



	render(): Node {
		if(this.props.levels.length < 1) 
			return <div/>;

		return (<div>
					{this._render_users_pages_by_date() }
				</div>);
	}

}
