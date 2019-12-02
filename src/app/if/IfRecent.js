// @flow
import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

import { PrettyDate } from './../components/Misc';

import IfLevelScore from './IfLevelScore';

import { IfLevelSchema } from './../../shared/IfLevelSchema';
import type { Node } from 'react';
import { DEMO_MODE } from './../../server/secret';


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

		const columns = [{
			id: 'username',
			Header: 'Username', 
			accessor: l => DEMO_MODE ? '*****' : l.username,
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
		const id = this.state.level === null ? null : <i style={{ fontSize: 8}}>{this.state.level._id}</i>;

		return (<div>
				<Modal show={this.state.show} onHide={this.hide}  dialogClassName="modal-90w" size='lg' centered>
					<Modal.Header closeButton>
						<Modal.Title>Review Level</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<h1>Completed Page { id }</h1>
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
