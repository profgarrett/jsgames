import React, { ReactElement } from 'react';
import { Table } from 'react-bootstrap';

import { IfLevelPagelessSchema, IfLevelSchema } from '../../shared/IfLevelSchema';
import { StyledReactTable } from '../components/StyledReactTable';

import { turn_array_into_map,  } from './../../shared/misc';
import { IfLevels } from '../../shared/IfLevelSchema';
import { DEMO_MODE } from '../configuration';



export interface iStudentNickname {
	username: string;
	nickname: string;
}

type PropsType = {
	data: Array<IfLevelPagelessSchema>,
	// One entry per student in the section, from GET /api/reports/nicknames.
	// Optional so the table still renders (with a blank Nickname column) if that
	// request failed -- a missing display name must never cost the instructor
	// their grades.
	nicknames?: Array<iStudentNickname>
};


/*
	Nicknames keyed the same way the grade rows are.

	_convert_levels_into_highest_grades() keys students by
	username.toLowerCase().trim(), because that is what iflevels.username holds
	and it has not always been written consistently. The lookup has to be
	normalized the same way or a nickname silently fails to attach for anyone
	whose stored username differs in case.

	Blank and whitespace-only nicknames are dropped rather than stored as '': the
	column shows nothing for a student who has no nickname, and an entry that
	holds '' would be indistinguishable from one that is genuinely missing when
	debugging this later. Exported for unit testing.
*/
export function build_nickname_lookup( nicknames: Array<iStudentNickname> ): Map<string, string> {
	const lookup = new Map<string, string>();

	nicknames.forEach( n => {
		if( typeof n.username !== 'string' || typeof n.nickname !== 'string' ) return;

		const key = n.username.toLowerCase().trim();
		const value = n.nickname.trim();
		if( key === '' || value === '' ) return;

		lookup.set(key, value);
	});

	return lookup;
}

// Return the average of the given items.
const avg_of = function(obj: any, arr: Array<any>): number {
	const totals = arr.map( a => typeof obj[a] === 'undefined' ? 0 : obj[a] );
	const sum = totals.reduce( (sum, i) => sum + i, 0);
	return Math.round(sum / arr.length);
};


export default function ClassProgressGrades(props: PropsType): ReactElement {


	const _get_columns = (): Array<any> => {
		// Create a list of distinct columns. Don't include the waivers.
		const tutorials = IfLevels.map( l => l.code )
			.filter( s => s.substr(0,13) !== 'surveywaiver_' )
			.filter( s => !s.includes('review') );

		const columns = [{
			id: 'username',
			Header: 'Username', 
			accessor: l => DEMO_MODE ? '*****' : l.username,
			width: 200
		}, {
			// A separate column rather than a replacement for the username:
			// the username is the identity that matches the LMS gradebook, and
			// the nickname is the name you can actually read down a roster.
			// Blank for a student with no nickname -- the username column
			// beside it already says who they are.
			id: 'nickname',
			Header: 'Nickname',
			// Masked alongside the username in demo mode. A nickname is a real
			// person's name, so showing it while hiding the email would defeat
			// the point of the setting.
			accessor: l => DEMO_MODE ? '*****' : l.nickname,
			width: 200
		}];

		columns.push( {
			id:'total',
			Header: 'Avg',
			accessor: l => avg_of(l, tutorials) + '%',
			width: 100,
		});

		tutorials.map( t => columns.push({ 
				id: t, 
				Header: t, 
//				style: { textAlign: 'right' },
				accessor: l => typeof l[t] !== 'undefined' && l[t] !== null ? l[t]+'%' : '', 
				width: 60 }));
				
		return columns;
	};

	const _convert_levels_into_highest_grades = (iflevels: IfLevelPagelessSchema[] ) => {

		const users = turn_array_into_map(iflevels, (l: any) => {
			return l.username.toLowerCase().trim();
		});

		const nickname_lookup = build_nickname_lookup(props.nicknames ?? []);

		// Grab biggest item for each user.
		const grades: any[] = [];
		
		users.forEach( (levels: any, user: any) => {

			// Build user object. Both tables below read straight off these keys
			// by column id, so setting nickname here is all either one needs.
			const u = { username: user, nickname: nickname_lookup.get(user) ?? '' };
			const level_map = turn_array_into_map(levels, (l: any) => l.code );

			level_map.forEach( (levels: any, code: any) => {
				// @ts-ignore
				u[code] = levels.reduce( (max: any, l: IfLevelPagelessSchema) => 
						// @ts-ignore
						max > l.props.test_score_as_percent
						? max 
						: l.props.test_score_as_percent
						, 0);
			});

			grades.push(u);
		});

		return grades;
	}



	/* 
		Return table
	*/
	const _render_rich_grades_table = (columns, grades): ReactElement => {
		return 	<StyledReactTable 
					data={grades}
					columns={columns} 
				/>;
	};


	/**
		Return historical information
	*/
	const _render_grades_table = (columns, grades): ReactElement => {

		return <Table striped bordered hover>
			<thead><tr>{
				columns.map( (c,i) => <th key={'trcode'+i}>{c.id}</th>)
			}</tr>
			</thead>
			<tbody>
			{ grades.map( 
				(t: any,i) => <tr key={'tr'+i}>
					{
						columns.map( 
							(c,i) => ( <td key={'td'+i}> 
								{ typeof t[c.id] === 'undefined' ? '': 
									(DEMO_MODE && (c.id === 'username' || c.id === 'nickname') ? '****' : t[c.id]) }
								</td> )
							)
					}
					</tr>) 
			}
			</tbody>
		</Table>;		
	};


	if(props.data.length < 1) 
		return <div/>;

	const grades = _convert_levels_into_highest_grades(props.data);
	const columns = _get_columns();

	return (<div>
			{_render_rich_grades_table(columns, grades)}
			<br/><br/><br/>
			<h3>Basic table</h3>
			<p>This can be easier to copy to Excel or a similar spreadsheet program</p>
				{_render_grades_table(columns, grades)}
			</div>);

}
