// @flow
import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

import { PrettyDate } from './../components/Misc';

import IfLevelScore from './IfLevelScore';

import { IfLevelSchema } from './../../shared/IfLevel';
import type { Node } from 'react';

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


type StateType = {
	show: boolean,
	level: Object
};

type PropsType = {
	levels: Array<IfLevelSchema>
};

export default class IfRecent extends React.Component<PropsType,StateType> {
	constructor(props: any) {
		super(props);

		this.state = {
			show: false,
			level: null
		};

		(this: any).show = this.show.bind(this);
		(this: any).hide = this.hide.bind(this);
	}

	/*

	render_individual_results(): Node {
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
	*/
	dateAsString(d: Object): string {
		return d.getFullYear()+'/'+(d.getMonth()+1) +'/'+d.getDate() +
				' ' + d.getHours()+':'+ (d.getMinutes()<10 ? '0': '') + d.getMinutes();
	}

	show(l: any) {
		console.log(l);
		//this.setState({ });
		//debugger;
	}

	hide() {
		this.setState({ show: false, level: null });
	}

	render(): Node {
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
			Header: 'Pages',
			accessor: l => l.pages.length,
			width: 100
		}, {
			id: 'created',
			Header: 'Created',
			accessor: l => <PrettyDate date={l.created} /> 
		}, {
			id: 'updated',
			Header: 'Last Updated',
			accessor: l => <PrettyDate date={l.updated} /> //  this.dateAsString(l.updated)
		}, {
			id: 'score',
			Header: 'Score',
			accessor: l => l.completed ? l.get_test_score_as_percent() : ''
		}, {
			id: 'completed',
			Header: 'Done',
			accessor: l => l.completed ? 'Y' : 'N'
		}, {
			id: 'view',
			Header: 'View',
			accessor: l => <Button onClick={ () => this.setState({ level:l, show: true}) } >View</Button>
		}];

		const data = this.props.levels;
		const level = this.state.level === null ? <p>Hey!</p> : <IfLevelScore level={this.state.level} />;

		return (<div>
				<Modal show={this.state.show} onHide={this.hide}  dialogClassName="modal-90w" size='lg' centered>
					<Modal.Header closeButton>
						<Modal.Title>Review Level</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<h1>Completed Page</h1>
						{ level }
					</Modal.Body>
					<Modal.Footer>
						<Button variant='primary' onClick={this.hide}>Close</Button>
					</Modal.Footer>
				</Modal>
				<ReactTable 
					data={data} 

					filterable={true}
					columns={columns} 
				/>
			</div>
		);
	}
}
