//      
import React from 'react';
import ReactTable from 'react-table';
import { Table } from 'react-bootstrap';

                                            
                                  

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
				(t,i) => <tr key={'tr'+i}>
					{
						columns.map( 
							(c,i) => ( <td key={'td'+i}> 
								{ typeof t[c.id] === 'undefined' ? '': t[c.id] }
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



	render()       {
		if(this.props.data.length < 1) 
			return <div/>;

		return this._render_grades_table();
	}

}
