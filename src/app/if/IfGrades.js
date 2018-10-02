// @flow
import React from 'react';
import type { LevelType  } from './IfTypes';
import type { Node } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { Table, Glyphicon, Tooltip, OverlayTrigger } from 'react-bootstrap';


type PropsType = {
	data: Array<LevelType>
};

// Return the average of the given items.
const avg_of = function(obj: Object, arr: Array<any>): number {
	let totals = arr.map( a => typeof obj[a] === 'undefined' ? 0 : obj[a] );
	let sum = totals.reduce( (sum, i) => sum + i, 0);
	return Math.round(sum / arr.length);
};


export default class IfGrades extends React.Component<PropsType> {
	constructor(props: any) {
		super(props);
	}



	/**
		Return a single person's grades w/o the full table.
	*/
	_render_my_grades(): Node {

		// Create a list of distinct columns.
		const tutorials = [ 
			'tutorial',
			'math1', 'math2', 'summary', 'rounding', 'dates',
			'if1', 'if2', 'if3', 'if4', 'if5', 'if6', 'if7', 'if8' ];

		const td_style = { textAlign: 'center', width: '6%' };
		const th_style = { textAlign: 'center', verticalAlign: 'middle'};

		const tds = [];

		// Maximum grades.
		const max_grades = tutorials.reduce( (o, t) => { o[t] = 0; return o; }, {});

		const glyph = score => {
			if( score === 0) return '';

			if( score > 80 ) return (<span>
				<OverlayTrigger placement='top' overlay={<Tooltip id='render_my_grades_tooltip'>{ score+'% quiz results' }</Tooltip>}>
					<Glyphicon glyph='glyphicon glyphicon-thumbs-up' style={{ color: 'green'}} />
				</OverlayTrigger>
				</span>);
			
			return (<span>
				<OverlayTrigger placement='top' overlay={<Tooltip  id='render_my_grades_tooltip'>{ score+'% quiz results' }</Tooltip>}>
					<Glyphicon glyph='glyphicon glyphicon-minus-sign' style={{color: 'orange'}} />
				</OverlayTrigger>
				</span>);
			
		};

		this.props.data.map( d => {
			for(var key in d) {
				max_grades[key] = d[key];
			}
		});


		for(var key in max_grades) {
			if(key !== 'username') {
				tds.push(
					<td key={'ifgrades_render_my_grades_' + key} style={td_style}>
						{ glyph(max_grades[key]) }
					</td>
				);
			}
		}

		tds.push(
				<td key='ifgrades_render_my_grades_if_all' style={td_style}>
					{ avg_of(max_grades, ['if1', 'if2', 'if3', 'if4', 'if5', 'if6', 'if7', 'if8']) + '%' }
				</td>
			);

		tds.push(
				<td key='ifgrades_render_my_grades_all' style={td_style}>
					{ avg_of(max_grades, tutorials) + '%' }
				</td>
			);

		return (<div>
				<h3>My Progress</h3>
				<Table bordered condensed style={{ width: '100%' }} className='well'>
					<thead>
						<tr>
							{ tutorials.map(t=> <th key={t} style={th_style}>{t.substr(0,1).toUpperCase() + t.substr(1)}</th>)}
							<th style={th_style}>If 1-8</th>
							<th style={th_style}>Overall</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							{tds}
						</tr>
					</tbody>
				</Table>
				</div>);
	}


	/**
		Return historical information

	*/
	_render_grades_table(): Node {

		// Create a list of distinct columns.
		const tutorials = [ 
			'tutorial',
			'math1', 'math2', 'summary', 'rounding',
			'if1', 'if2', 'if3', 'if4', 'if5', 'if6', 'if7', 'if8' ];


		const columns = [{
			id: 'username',
			Header: 'Username', 
			accessor: l => l.username,
			width: 200
		}];

		tutorials.map( t => columns.push({ 
				id: t, 
				Header: t, 
				style: { textAlign: 'right' },
				accessor: l => typeof l[t] !== 'undefined' && l[t] !== null ? l[t]+'%' : '', 
				width: 60 }));

		columns.push( {
			id:'if_total',
			Header: 'If Avg',
			style: { textAlign: 'right' },
			textAlign: 'right',
			accessor: l => avg_of(l, ['if1', 'if2', 'if3', 'if4', 'if5', 'if6', 'if7', 'if8']) + '%'
		});

		return (<div>
				<h3>Student Grades</h3>
				<ReactTable 
					data={this.props.data} 
					filterable={true}
					columns={columns}
				/>
				</div>);
	}



	render(): Node {
		if(this.props.data.length < 1) 
			return <div/>;

		if(this.props.data.length < 2)
			return this._render_my_grades();


		return this._render_grades_table();
	}

}
