// @flow
import React from 'react';
import Container from 'react-bootstrap/Container';
import { Row, Col, Breadcrumb  } from 'react-bootstrap';

import { ClassProgressChart } from './ClassProgressChart';
import { ClassProgressStudent } from './ClassProgressStudent';
import { LevelModal } from './LevelModal';
import { Message, Loading } from './../components/Misc';
import Filter from './Filter';
import { DEMO_MODE } from './../../server/secret';

import ForceLogin from './../components/ForceLogin';
import { IfLevelSchema, IfLevelPagelessSchema } from './../../shared/IfLevelSchema';

import type { Node } from 'react';


type ProgressPropsType = {};

type ProgressContainerStateType = {
	message: string,
	messageStyle: string,
	data_loading: boolean,
	data: Array<IfLevelPagelessSchema>,
};

export default class ClassProgressContainer extends React.Component<ProgressPropsType, ProgressContainerStateType> {
	constructor(props: any) {
		super(props);
		this.state = { 
			message: 'Loading data from server',
			messageStyle: '',
			data: [],
			data_loading: true,
		};
		(this: any).onRefreshData = this.onRefreshData.bind(this);
		(this: any).onReady = this.onReady.bind(this);
	}

	onReady(filter: Object) {
		this.setState({ data_loading: false, message: ''});
		this.onRefreshData(filter);
	}

	onRefreshData(filter: Object) {
		const args = [];

		if(filter.sections !== '') args.push('idsection='+filter.sections);

		this.setState({ data_loading: true, message: 'Loading progress data'});
		
		fetch('/api/reports/progress?'+args.join('&'), {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => response.json() )
			.then( json => {
				const data = json.map( j => new IfLevelPagelessSchema(j) );
				this.setState({
					data: data,
					messageStyle: '',
					message: '',
					data_loading: false
				});
			})
			.catch( error => {
				this.setState({ 
					data: [],
					message: 'Error: ' + error,
					messageStyle: 'Error',
					data_loading: false
				});
			});
	}


	render(): Node {

		const crumbs = (
			<Breadcrumb>
				<Breadcrumb.Item title='home' href='/ifgame/'>If Games</Breadcrumb.Item>
				<Breadcrumb.Item title='Progress' active>Class Progress</Breadcrumb.Item>
			</Breadcrumb>
			);

		const search = new URLSearchParams(window.location.search);
		const filter_defaults = search.has('idsection') 
			? { sections: search.get('idsection') }
			: {};
		
		const filter = <Filter 
				onChange={this.onRefreshData} 
				onReady={this.onReady} 
				disabled={this.state.data_loading} 
				defaults={filter_defaults}
				filters={{sections: [] }}
			/>;

		const empty = this.state.data.length === 0 && this.state.data_loading === false
				? <p>No students in this section have yet started completing lessons. Once they get started, you'll see a chart here with their progress</p>
				: null;

		// Fixes old bug, where some people's levels didn't have a props value.
		const data = this.state.data.filter( l => l.props !== null ); 

		return (
			<Container fluid>
			<Row>
				<Col>
					<ForceLogin/>
					{ crumbs }
					<h3>Class Progress</h3>
					<Message message={this.state.message} style={this.state.messageStyle} />
					<Loading loading={ this.state.data_loading } />
					{ filter }
					{ empty }
					<ClassProgressChart data={data}  />
				</Col>
			</Row>
			</Container>
		);
	}
}