//      
import React from 'react';
                                            
                                  
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { IfLevels } from './../../shared/IfGame';


                  
                       
  

// Return the average of the given items.
const avg_of = function(obj        , arr            )         {
	let totals = arr.map( a => typeof obj[a] === 'undefined' ? 0 : obj[a] );
	let sum = totals.reduce( (sum, i) => sum + i, 0);
	return Math.round(sum / arr.length);
};


export default class IfGrades extends React.Component            {
	constructor(props     ) {
		super(props);
	}

	/**
		Return historical information

	*/
	_render_grades_table()       {

		// Create a list of distinct columns.
		const tutorials = IfLevels.map( l => l.code );

		const columns = [{
			id: 'username',
			Header: 'Username', 
			accessor: l => l.username,
			width: 200
		}];

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


		return (<div>
				<h3>Student Grades</h3>
				<ReactTable 
					data={this.props.data} 
					filterable={true}
					columns={columns}
				/>
				</div>);
	}



	render()       {
		if(this.props.data.length < 1) 
			return <div/>;

		return this._render_grades_table();
	}

}
