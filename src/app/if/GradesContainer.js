// @flow
import React from 'react';
import Container from 'react-bootstrap/Container';
import { Row, Col, Breadcrumb  } from 'react-bootstrap';

import Grades from './Grades';
import { Message, Loading } from './../components/Misc';
import Filter from './Filter';
import { DEMO_MODE } from './../../server/secret';

import ForceLogin from './../components/ForceLogin';

import type { Node } from 'react';


type GradesPropsType = {};

type GradesContainerStateType = {
	message: string,
	messageStyle: string,
	isLoading: boolean,
	data: Array<any>
};

export default class GradesContainer extends React.Component<GradesPropsType, GradesContainerStateType> {
	constructor(props: any) {
		super(props);
		this.state = { 
			message: 'Loading data from server',
			messageStyle: '',
			isLoading: true,
			data: []
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

		if(filter.sections !== '') args.push('idsection='+filter.sections);

		this.setState({ isLoading: true, message: 'Loading grade data'});
		
		fetch('/api/reports/grades?'+args.join('&'), {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => response.json() )
			.then( json => {
				this.setState({
					data: json,
					messageStyle: '',
					message: '',
					isLoading: false
				});
			})
			.catch( error => {
				this.setState({ 
					data: [],
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
				<Breadcrumb.Item title='Grades' active>Grades</Breadcrumb.Item>
			</Breadcrumb>
			);


		const search = new URLSearchParams(window.location.search);
		const filter_defaults = search.has('idsection') 
			? { sections: search.get('idsection') }
			: {};
		
		const filter = <Filter 
				onChange={this.onRefreshData} 
				onReady={this.onReady} 
				disabled={this.state.isLoading} 
				defaults={filter_defaults}
				filters={{sections: [] }}
			/>;

		return (
			<Container fluid='true'>
			<Row>
				<Col>
					<ForceLogin/>
					{ crumbs }
					<h3>Grades</h3>
					<Message message={this.state.message} style={this.state.messageStyle} />
					<Loading loading={this.state.isLoading } />
					{ filter }
					<Grades data={this.state.data} />
				</Col>
			</Row>
			</Container>
		);
	}
}