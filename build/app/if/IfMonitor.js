//      
import React from 'react';
//import { Panel, Popover, OverlayTrigger, Well } from 'react-bootstrap';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

import { HtmlDiv, PrettyDate } from './../components/Misc';

import ExcelTable from './ExcelTable';
import Choice from './Choice';
import Parsons from './Parsons';
import Text from './Text';

                                                     
                                  

/*

type PersonPropsType = {
	levels: Array<LevelType>
};

class Person extends React.Component<PersonPropsType> {

	render(): Node {
		const person = this.props.levels[0].username;

		const levels = this.props.levels.map( 
				(l: LevelType, i: number): Node => 
					<PersonLevel person={person} level={l} key={i} />);
//				Date: <PrettyDate date={this.props.levels[0].updated} />
		
		return (<Table>
			<thead><tr>
				<th>Person</th><th>Date</th><th>Tutorial</th><th>Pages</th><th>Score</th>
			</tr></thead>
			<tbody>{ levels }</tbody>
		</Table>);
	}
}

type PersonLevelPropsType = {
	person: string,
	level: LevelType
};
class PersonLevel extends React.Component<PersonLevelPropsType> {


	render(): Node {
		const level = this.props.level;

		const row = (<tr>
			<td>{ this.props.person }</td>
			<td>{ level.code }</td>
			<td>Created: { level.created.toString() }</td>
			<td>{ level.pages.length }</td>
			<td>{ level.get_score_correct() } of { level.get_score_attempted() }</td>
			</tr>);

		return row;
	}
	render_actual_problem(): Node {

		// Figure out which control to use for the page.
		let problem;
		const page_at = this.props.level.pages[this.props.level.pages.length-1];
		const lead = <HtmlDiv className='lead' html={ page_at.description} />;
		const noop = () => {};

		if(page_at.type === 'IfPageFormulaSchema') {
			// Show solution?
					
			// Show problem.
			problem = (
				<Panel defaultExpanded={true}>
						<Panel.Heading>
							<Panel.Title toggle><div>{ page_at.client_f} </div></Panel.Title>
						</Panel.Heading>
						<Panel.Collapse >
							<Panel.Body>
								<ExcelTable page={page_at} handleChange={ noop } readonly={true} editable={false} />
							</Panel.Body>
						</Panel.Collapse>
					</Panel>
			);

		} else if(page_at.type === 'IfPageTextSchema') {
			problem = (<Text page={page_at} editable={false} handleChange={ noop } />);

		} else if(page_at.type === 'IfPageParsonsSchema') {
			problem = <Parsons page={page_at} editable={false} handleChange={ noop } show_solution={false} />;

		} else if(page_at.type === 'IfPageChoiceSchema') {
			problem = <Choice page={page_at} editable={false} handleChange={ noop } show_solution={true} />;

		} else {
			throw new Error('Invalid type in Monitor '+page_at.type);
		}


		return (
			<Panel>
				<Panel.Heading >
					Page {this.props.level.pages.length+1}
				</Panel.Heading>
				<Panel.Body>
					{ lead }
					{ problem }
				</Panel.Body>
			</Panel>
		);
	}
}
*/


                  
                         
  

export default class IfMonitor extends React.Component            {
	constructor(props     ) {
		super(props);
	}

	render()       {
		if(this.props.levels.length < 1) 
			return <div/>;

		const columns = [{
			id: 'username',
			Header: 'Username', 
			accessor: l => l.username,
			width: 200
		}, {
			id: 'code',
			Header: 'Code',
			accessor: l => l.code,
			width: 100
		}, {
			id: 'page',
			Header: 'Page #',
			accessor: l => l.page,
			width: 100
		}, {
			id: 'created',
			Header: 'Created',
			accessor: l => l.created.toString()
		}, {
			id: 'value',
			Header: 'value',
			accessor: l => l.value
		}];

		const data = 
			this.props.levels.reduce(
				(accumLevels, level) => accumLevels.concat( 
					level.pages.reduce(
						(accumPages, page, p_index) => accumPages.concat(
							page.history
								.filter( // filter non f and unused events.
									h => typeof h.client_f !== 'undefined' &&
										h.code !== 'created' && h.code !== 'server_page_completed'
								).filter( // filter dups and progressively built items  A, A+, A+1, ...
									(h, i, h_array) => {
										if(i==h_array.length-1) return true; // always return last item.
										return (h.client_f !== h_array[i+1].client_f 
											&& h.client_f !== h_array[i+1].client_f.substr(0, h.client_f.length));
									}
								).map( // reduce.
									(history) => {
										return {
											username: level.username, 
											code: level.code,
											page: p_index,
											created: history.dt.toLocaleTimeString(),
											value:  history.client_f
										}; 
									}
							)
						)
					,[])
				),[]);

		return (<div>
				<ReactTable 
					data={data} 

					filterable={true}
					columns={columns} 
				/>
			</div>
		);

	}

	render_overall()       {
		if(this.props.levels.length < 1) 
			return <div/>;
		
		// Sort levels into an object of people.
		/*
		const people = this.props.levels.reduce( 
			(accum: Object, l: LevelType): Object => {
				if(typeof accum[l.username] === 'undefined') {
					accum[l.username] = [];
				}
				accum[l.username].push(l);
				return accum;
			}, {});

		const p = [];
		for(let key in people) {
			if(people.hasOwnProperty(key)) {
				p.push( <Person key={key} levels={people[key]} /> );
			}
		}
		*/

		const columns = [{
			id: 'username',
			Header: 'Username', 
			accessor: l => l.username,
			width: 200
		}, {
			id: 'code',
			Header: 'Code',
			accessor: l => l.code,
			width: 100
		}, {
			id: 'pages',
			Header: 'Page #',
			accessor: l => l.pages.length,
			width: 100
		}, {
			id: 'created',
			Header: 'Created',
			accessor: l => l.created.toString()
		}, {
			id: 'score',
			Header: 'Score',
			accessor: l => l.get_score_correct() + ' of ' + l.get_score_attempted()
		}, {
			id: 'completed',
			Header: 'Done',
			accessor: l => l.completed ? 'Y' : 'N'
		}];

		const data = this.props.levels;

		return (<div>
				<ReactTable 
					data={data} 

					filterable={true}
					columns={columns} 
				/>
			</div>
		);
	}
}
