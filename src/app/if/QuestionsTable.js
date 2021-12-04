//@flow
import React, { useState } from 'react';

import { DEMO_MODE } from './../../server/secret';

import { IfLevelSchema } from './../../shared/IfLevelSchema';
import type { Node } from 'react';
import { HtmlDiv } from './../components/Misc';
import { Collapse, Card } from 'react-bootstrap';


import { StyledReactTable } from './../components/StyledReactTable';

type DetailPropsType = {
	levels: Array<IfLevelSchema>
};




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Class used to show data in a react table that can be easily viewed.
////////////////////////////////////////////////////////////////////////////////
export default class PagesTable extends React.Component<DetailPropsType> {


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
			id: 'completed',
			Header: 'completed',
			accessor: answer => answer.completed ? 'Y' : 'N' ,
			width: 50
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
			id: 'html',
			Header: 'html',
			accessor: answer => { 
				const html = '<a href="/ifgame/levelraw/' + answer.page.id + '/' + answer.sequence_in_level +'" target="_blank">Raw</a>';
				return <Card>
					<HtmlDiv html={ html } />
					<Expandable title={ 'answer' } body={ typeof answer.html == 'undefined' ? '' : answer.html } />
				</Card>; 
			},
			width: 450
/*		}, {
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
*/
		}];

		/*
		{ question.description }
		{ question.instruction }
		<b>{ question.solution_f }</b>
		*/

		return (<Expandable title={'submissions'} body={
					<div style={{ }}>
						<div>{ question.kcs === false
							? ''
							: question.kcs.map( 
							(tag,i) => 
									<span key={'questioncomplexity'+i} className='badge badge-pill badge-info'>
										{ tag.tag }</span>) }
						</div>
						<StyledReactTable 
							data={question.answers}
							filterable={true}
							columns={columns} 
							defaultSorted={['type', 'seconds']}
							defaultPageSize={question.answers.length}
							style={{ backgroundColor: '#f5f5f5' }}
						/>
					</div>
					} 
				/>);

	}


	// Return a table with the questions for the given level.
	_render_a_levels_questions(level_summary: any): Node {

		const columns = [{
			id: 'description',
			Header: 'Desc',
			accessor: q => q.description,
			width: 300
		}, {
			id: 'type',
			Header: 'Type',
			accessor: q => q.type.substr(6).replace('Schema', ''),
			width: 75
		}, {
			id: 'count',
			Header: 'Count',
			accessor: q => q.n,
			style: {textAlign: 'right'},
			width: 75,
		}, {
			id: 'correct',
			Header: 'Correct',
			accessor: q => Math.round(q.correct_average*100)+'%',
			style: {textAlign: 'right'},
			sortMethod: (a, b) => {
				return parseInt(a,10) - parseInt(b,10);
			},
			width: 75,
		}, {
			id: 'seconds',
			Header: 'Seconds',
			accessor: q => Math.round(q.seconds_average),
			style: {textAlign: 'right'},
			width: 100,
/*		}, {
			id: 'tags',
			Header: 'Tags',
			accessor: q => q.tags.map( t => t.n + ' ' + t.tag ).join(', '),
			width: 150,
*/
		},  {
			id: 'breaks',
			Header: 'breaks',
			accessor: q => q.breaks === 0 ? '' : q.breaks,
			style: {textAlign: 'right'},
			width: 50,
		}, {
			id: 'expander',
			Header: 'More',
			width: 400,
			accessor: (q) => {
				return this._render_answers_for_pages_with_same_question(q);
			},				
			style: {
				cursor: 'pointer',
				fontSize: 16
			}
		}];

		return <StyledReactTable
			data={level_summary.questions}
			filterable={true}
			columns={columns}
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




  function Expandable(props: { title: string, body: any }): Node {
	const [open, setOpen] = useState(false);
  
	const body_as_dom = typeof props.body === 'string' 
			? <HtmlDiv html={ props.body } />
			: props.body;
	
	return (
		<div>
			<kbd
				onClick={() => setOpen(!open)}
				aria-controls='example-collapse-text'
				aria-expanded={open}
			>
				{props.title}
			</kbd>
			<Collapse in={open}>
				<div id='example-collapse-text'>
					{ body_as_dom }
				</div>
			</Collapse>
		</div>
	);
  }