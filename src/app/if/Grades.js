// @flow
import React from 'react';
import ReactTable from 'react-table';
import { Table } from 'react-bootstrap';

import { IfLevelSchema } from './../../shared/IfLevelSchema';

import type { Node } from 'react';

import 'react-table/react-table.css';

import { IfLevels } from './../../shared/IfLevelSchema';
import { DEMO_MODE } from './../../server/secret';


type PropsType = {
	data: Array<IfLevelSchema>
};

// Return the average of the given items.
const avg_of = function(obj: Object, arr: Array<any>): number {
	let totals = arr.map( a => typeof obj[a] === 'undefined' ? 0 : obj[a] );
	let sum = totals.reduce( (sum, i) => sum + i, 0);
	return Math.round(sum / arr.length);
};


export default class Grades extends React.Component<PropsType> {
	constructor(props: any) {
		super(props);
	}

	/**
		Return historical information

	*/
	_render_grades_table(): Node {

		// Create a list of distinct columns.
		// Don't include the waivers.
		const tutorials = IfLevels.map( l => l.code ).filter( s => s.substr(0,13) !== 'surveywaiver_' );

		const columns = [{
			id: 'username',
			Header: 'Username', 
			accessor: l => DEMO_MODE ? '*****' : l.username,
			width: 200
		}];

		/*
		columns.push( {
			id:'part1',
			Header: 'P1 Avg',
			style: { textAlign: 'right' },
			textAlign: 'right',
			accessor: l => avg_of(l, ['tutorial', 'math1', 'math2', 'dates', 'rounding', 'summary', 'text']) + '%'
		});


		columns.push( {
			id:'if_total',
			Header: 'If Avg',
			style: { textAlign: 'right' },
			textAlign: 'right',
			accessor: l => avg_of(l, ['if1', 'if2', 'if3', 'if4', 'if5', 'if6', 'if7', 'if8']) + '%'
		});
		*/

		columns.push( {
			id:'total',
			Header: 'Avg',
			style: { textAlign: 'right' },
			textAlign: 'right',
			accessor: l => avg_of(l, tutorials) + '%'
		});


		tutorials.map( t => columns.push({ 
				id: t, 
				Header: t, 
				style: { textAlign: 'right' },
				accessor: l => typeof l[t] !== 'undefined' && l[t] !== null ? l[t]+'%' : '', 
				width: 60 }));


// <td style={tdstyle}>{DEMO_MODE ? '*****' : t.username}</td>

		const html = (<Table striped bordered hover>
			<thead><tr>{
				columns.map( (c,i) => <th key={'trcode'+i}>{c.id}</th>)
			}</tr>
			</thead>
			<tbody>
			{ this.props.data.map( 
				(t: Object,i) => <tr key={'tr'+i}>
					{
						columns.map( 
							(c,i) => ( <td key={'td'+i}> 
								{ typeof t[c.id] === 'undefined' ? '': 
									(DEMO_MODE && c.id === 'username' ? '****' : t[c.id]) }
								</td> )
							)
					}
					</tr>) 
			}
			</tbody>
		</Table>);
		
/*
<td style={tdstyle}>{ avg_of(t, ['if1', 'if2', 'if3', 'if4', 'if5', 'if6', 'if7', 'if8']) }</td>
					<td style={tdstyle}>{ avg_of(t, ['tutorial', 'math1', 'math2', 'dates', 'rounding', 'summary', 'text']) }</td>
					*/
		return (<div>
				<ReactTable 
					data={this.props.data} 
					filterable={true}
					columns={columns}
				/>
				<br/><br/><br/>
				<h3>Table for Copying to Excel</h3>
				{ html }
				</div>);
	}



	render(): Node {
		if(this.props.data.length < 1) 
			return <div/>;

		return this._render_grades_table();
	}

}