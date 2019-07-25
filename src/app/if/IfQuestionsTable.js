//@flow
import React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

import { DEMO_MODE } from './../../server/secret';

import type { LevelType } from './IfTypes';
import type { Node } from 'react';
import { HtmlDiv } from './../components/Misc';

type DetailPropsType = {
	levels: Array<LevelType>
};



export default 
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Class used to show data in a react table that can be easily viewed.
////////////////////////////////////////////////////////////////////////////////
class IfPagesTable extends React.Component<DetailPropsType> {


	// Render a single summary row
	_render_answers_for_pages_with_same_question(question: any): Node {

		const columns = [{
			id: 'username',
			Header: 'Username', 
			accessor: answer => DEMO_MODE ? '*****' : answer.username,
			width: 150
		}, {
			id: 'seconds',
			Header: 'Time (s)',
			accessor: answer => answer.seconds,
			style: {textAlign: 'right'},
			width: 75
		}, {
			id: 'breaks',
			Header: 'breaks',
			accessor: answer => answer.breaks,
			style: {textAlign: 'right'},
			width: 30
		}, {
			id: 'correct',
			Header: 'Correct?',
			accessor: answer => answer.correct ? 'Y' : '',
			width: 80
		}, {
			id: 'completed',
			Header: 'completed',
			accessor: answer => answer.completed ? 'Y' : '' ,
			width: 50
		}, {
			id: 'html',
			Header: 'html',
			accessor: answer => <HtmlDiv html={answer.html} />,
			width: 450
		}, {
			expander: true,
			Header: () => <b>More</b>,
			width: 65,
			Expander: ({ isExpanded, ...rest }) => 
				<div> 
					{ isExpanded 
						? <span>&#x2299;</span>
						: <span>&#x2295;</span>}
				</div>,
			style: {
				cursor: 'pointer',
				fontSize: 32
			}
		}];


		return (<div>
					<div style={{ backgroundColor: 'gray', marginTop: 20 }}>
						{ question.description }
						{ question.instruction }
						<b>{ question.solution_f }</b>
						<div>{ question.kcs === false
							? ''
							: question.kcs.map( 
							(tag,i) => 
									<span key={'questioncomplexity'+i} className='badge badge-pill badge-info'>
										{ tag.tag }</span>) }
						</div>
					</div>
					<ReactTable 
						data={question.answers} 
						filterable={true}
						columns={columns}
						defaultSorted={['type', 'seconds']}
						defaultPageSize={question.answers.length}
						style={{ backgroundColor: '#f5f5f5' }}
						SubComponent={ (p) => <HtmlDiv html={p.original.expand} /> }
					/> 
				</div>);

	}


	// Return a table with the questions for the given level.
	_render_a_levels_questions(level_summary: any): Node {

		const columns = [{
			id: 'description',
			Header: 'Desc',
			accessor: q => q.description,
			width: 550
		}, {
			id: 'type',
			Header: 'Type',
			accessor: q => q.type.substr(6).replace('Schema', ''),
			width: 100
		}, {
			id: 'count',
			Header: 'Count',
			accessor: q => q.n,
			style: {textAlign: 'right'},
			width: 100
		}, {
			id: 'correct',
			Header: 'Correct',
			accessor: q => Math.round(q.correct_average*100)+'%',
			style: {textAlign: 'right'},
			width: 100
		}, {
			id: 'seconds',
			Header: 'Seconds',
			accessor: q => Math.round(q.seconds_average),
			style: {textAlign: 'right'},
			width: 100
			/*
		}, {
			id: 'tags',
			Header: 'Tags',
			accessor: q => q.tags.map( t => t.n + ' ' + t.tag ).join(', '),
			width: 400

		}, {
			id: 'breaks',
			Header: 'breaks',
			accessor: q => q.breaks === 0 ? '' : q.breaks,
			style: {textAlign: 'right'},
			width: 50
			*/
		}, {
			expander: true,
			Header: () => <b>More</b>,
			width: 65,
			Expander: ({ isExpanded, ...rest }) => 
				<span> 
					{ isExpanded 
						? <span>&#x2299;</span>
						: <span>&#x2295;</span>}
				</span>,
			style: {
				cursor: 'pointer',
				fontSize: 16
			}
		}];

		return <ReactTable
			data={level_summary.questions}
			filterable={true}
			columns={columns}
			SubComponent={ (q) => this._render_answers_for_pages_with_same_question(q.original) }
			/>;
		
	}


	render(): Node {
		const levels = this.props.levels;


		// If empty, return a div.
		if(levels.length < 1) 
			return <div/>;
		
		// Go through each map of levels and return a table for each.
		const html = levels.map( 
			(level_summary,i) => 
				<div key={'IfPagesTableRender' + i}>
					<h1>{ level_summary.code }</h1>
					{ this._render_a_levels_questions(level_summary) }
				</div>
			);

		return html;
	}
}

