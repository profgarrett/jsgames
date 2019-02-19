//@flow
import React from 'react';
import { Row, Col, Breadcrumb, Button  } from 'react-bootstrap';

import IfMonitor from './IfMonitor';
import { Message, Loading } from './../components/Misc';

import { IfLevelSchema } from './../../shared/IfGame';

import ForceLogin from './../components/ForceLogin';

import type { LevelType } from './IfTypes';
import type { Node } from 'react';


type MonitorPropsType = {};

type MonitorContainerStateType = {
	message: string,
	messageStyle: string,
	isLoading: boolean,
	levels: Array<LevelType>
};

export default class IfMonitorContainer extends React.Component<MonitorPropsType, MonitorContainerStateType> {
	constructor(props: any) {
		super(props);
		this.state = { 
			message: 'Loading data from server',
			isLoading: true,
			levels: [],
		};
		(this: any).refreshData = this.refreshData.bind(this);
		(this: any).handleSubmit = this.handleSubmit.bind(this);
	}

	componentDidMount() {
		// Load data.
		this.refreshData();
	}


	handleSubmit(e: ?SyntheticEvent<HTMLButtonElement>) {
		if(e) e.preventDefault();
		this.refreshData();
	}

	refreshData() {

		fetch('/api/ifgame/recent_levels', {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => response.json() )
			.then( json => json.map( j => new IfLevelSchema(j) ) )
			.then( ifLevels => {
				this.setState({
					levels: ifLevels,
					messageStyle: '',
					message: '',
					isLoading: false
				});
			})
			.catch( error => {
				this.setState({ 
					levels: [],
					message: 'Error: ' + error,
					messageStyle: 'Error',
					isLoading: false
				});
			});
	}



	render(): Node {

		const crumbs = (
			<Breadcrumb>
				<Breadcrumb.Item title='home' href='/ifgame/'>If Games</Breadcrumb.Item>
				<Breadcrumb.Item title='Monitor' active>Monitor</Breadcrumb.Item>
			</Breadcrumb>
			);

		const filter = (
			<form name='c' onSubmit={this.handleSubmit}>

				<Button variant='primary'>Refresh filter</Button>
			</form>
			);

		return (
			<Row>
				<Col>
					<ForceLogin/>
					{ crumbs }
					<h3>Recently Updated Levels</h3>

					<Message message={this.state.message} style={this.state.messageStyle} />
					<Loading loading={this.state.isLoading } />
					{ filter }
					<IfMonitor levels={this.state.levels} />
				</Col>
			</Row>
		);
	}
}