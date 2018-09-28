// @flow
import React from 'react';
import type { LevelType  } from './IfTypes';
import type { Node } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';


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

		return (<div>
					{ this._render_grades_table() }
				</div>);


	}

}
