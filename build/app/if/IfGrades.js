//      
import React from 'react';
                                            
                                  
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { IfLevels } from './../../shared/IfGame';
import { DEMO_MODE } from './../../server/secret';


                  
                       
  

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
			accessor: l => DEMO_MODE ? '*****' : l.username,
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


		const tablestyle = {
			borders: 'solid 1px black !important',
			padding: 2
		};
		const tdstyle = {
			borders: 'solid 1px black !important',
			padding: 2
		};

		const html = (<table style={tablestyle}><tbody>
			{ this.props.data.map( (t,i) => <tr key={i}>
					<td style={tdstyle}>{DEMO_MODE ? '*****' : t.username}</td>
					<td style={tdstyle}>{ avg_of(t, ['if1', 'if2', 'if3', 'if4', 'if5', 'if6', 'if7', 'if8']) }</td>
					<td style={tdstyle}>{ avg_of(t, ['tutorial', 'math1', 'math2', 'dates', 'rounding', 'summary', 'text']) }</td>
				</tr>) }
			</tbody></table>);
		

		return (<div>
				<h3>Student Grades</h3>
				<ReactTable 
					data={this.props.data} 
					filterable={true}
					columns={columns}
				/>
				<br/><br/><br/>
				<h3>Copy and Paste Table</h3>
				{ html }
				</div>);
	}



	render()       {
		if(this.props.data.length < 1) 
			return <div/>;

		return this._render_grades_table();
	}

}
