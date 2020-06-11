//@flow
import React from 'react';
import Container from 'react-bootstrap/Container';
import { Row, Col, Breadcrumb  } from 'react-bootstrap';

import Recent from './Recent';
import { Message, Loading } from './../components/Misc';
import Filter from './Filter';

import { IfLevelPagelessSchema } from './../../shared/IfLevelSchema';
import 'url-search-params-polyfill';

import ForceLogin from './../components/ForceLogin';

import type { Node } from 'react';


type PropsType = {};

type StateType = {
	message: string,
	messageStyle: string,
	isLoading: boolean,
	levels: Array<IfLevelPagelessSchema>
};

export default class IfRecentContainer extends React.Component<PropsType, StateType> {
	constructor(props: any) {
		super(props);
		this.state = { 
			message: 'Loading filter data',
			messageStyle: '',
			isLoading: true,
			levels: [],
		};
		(this: any).onRefreshData = this.onRefreshData.bind(this);
		(this: any).onReady = this.onReady.bind(this);
	}

	onReady(filter: Object) {
		this.setState({ isLoading: false, message: ''});
		this.onRefreshData(filter);
	}

	onRefreshData(filter: Object) {
		const args = [];
		
		if(filter.levels != '') args.push('code='+filter.levels);
		if(filter.sections !== '') args.push('idsection='+filter.sections);
		if(filter.users !== '') args.push('iduser='+filter.users);
		if(filter.days !== '') args.push('updated='+filter.days);

		this.setState({ isLoading: true, message: 'Loading data' });

		fetch('/api/reports/recent?'+args.join('&'), {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => response.json() )
			.then( json => json.map( j => new IfLevelPagelessSchema(j) ) )
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
				<Breadcrumb.Item title='Recent activity' active>Recent activity</Breadcrumb.Item>
			</Breadcrumb>
			);

		const search = new URLSearchParams(window.location.search);

		const filter_defaults = search.has('idsection') 
			? { days: 1, sections: search.get('idsection') }
			: { days: 1 };


		const filter_filters = {
			levels: [],
			sections: [],
			users: [],
			days: [ 
				{ value: 1, label: '1 day'} , 
				{ value: 3, label: '3 days'}, 
				{ value: 7, label: '1 week' },
				{ value: 14, label: '2 weeks' },
				{ value: 21, label: '3 weeks' },
				{ value: 28, label: '4 weeks' },
			]
		};

		const filter = <Filter 
				onChange={this.onRefreshData} 
				onReady={this.onReady} 
				disabled={this.state.isLoading} 
				defaults={filter_defaults}
				filters={filter_filters}
			/>;

		return (
			<Container fluid>
			<Row>
				<Col>
					<ForceLogin/>
					{ crumbs }
					<h3>Recent Activity</h3>

					<Message message={this.state.message} style={this.state.messageStyle} />
					<Loading loading={this.state.isLoading } />
					{ filter }
					<Recent levels={this.state.levels} />
				</Col>
			</Row>
			</Container>
		);
	}
}