//@flow
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Breadcrumb, Button  } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import Monitor from './Monitor';
import { Message, Loading } from './../components/Misc';

import { IfLevelSchema } from './../../shared/IfGame';

import ForceLogin from './../components/ForceLogin';

import type { LevelType, PageType } from './IfTypes';
import type { Node } from 'react';


type MonitorPropsType = {};

type MonitorContainerStateType = {
	message: string,
	messageStyle: string,
	isLoading: boolean,
	levels: Array<LevelType>
};

export default class MonitorContainer extends React.Component<MonitorPropsType, MonitorContainerStateType> {
	constructor(props: any) {
		super(props);
		this.state = { 
			message: 'Loading data from server',
			isLoading: true,
			levels: [],
		};
		(this: any).refresh = this.refresh.bind(this);
	}

	componentDidMount() {
		// Load data.
		this.refresh();
	}

	refresh() {
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
		const that = this;

		const crumbs = (
			<Breadcrumb>
				<Breadcrumb.Item href='/ifgame/'>If Games</Breadcrumb.Item>
				<Breadcrumb.Item active>Monitor</Breadcrumb.Item>
			</Breadcrumb>
			);

		const reload = (
			<Button bsStyle='primary' 
					href={ that.refresh() }>
					Refresh page
			</Button>
			);

		return (
			<Row>
				<Col>
					<ForceLogin/>
					{ crumbs }
					<h3>Recently Updated Levels</h3>

					<Message message={this.state.message} style={this.state.messageStyle} />
					<Loading loading={this.state.isLoading } />
					<div style={{ textAlign: 'center' }}>{ reload }</div>
					<Monitor levels={this.state.levels} />
				</Col>
			</Row>
		);
	}
}