//@flow
import React from 'react';
import { Container, Row, Col, Breadcrumb, Button  } from 'react-bootstrap';

import IfGrades from './IfGrades';
import { Message, Loading } from './../components/Misc';
import Filter from './Filter';

import ForceLogin from './../components/ForceLogin';

import type { Node } from 'react';


type GradesPropsType = {};

type GradesContainerStateType = {
	message: string,
	messageStyle: string,
	isLoading: boolean,
	data: Array<any>,
	filter: Object
};

export default class IfGradesContainer extends React.Component<GradesPropsType, GradesContainerStateType> {
	constructor(props: any) {
		super(props);
		this.state = { 
			message: 'Loading data from server',
			messageStyle: '',
			isLoading: true,
			data: [],
			filter: false
		};
		(this: any).onRefreshData = this.onRefreshData.bind(this);
		(this: any).onReady = this.onReady.bind(this);
		//(this: any).handleSubmit = this.handleSubmit.bind(this);
	}

	/*
	componentDidMount() {
		// Load data.
		this.refreshData();
	}


	handleSubmit(e: ?SyntheticEvent<HTMLButtonElement>) {
		if(e) e.preventDefault();
		this.refreshData();
	}
	*/

	onReady(filter: Object) {
		this.setState({ isLoading: false, message: ''});
		this.onRefreshData(filter);
	}

	onRefreshData(filter: Object) {
		const args = [];

		if(filter.code != '') args.push('code='+filter.code);
		if(filter.idsection !== '') args.push('idsection='+filter.idsection);
		if(filter.iduser !== '') args.push('iduser='+filter.iduser);

		this.setState({ isLoading: true, message: 'Loading grade data'});
		
		fetch('/api/ifgame/grades?'+args.join('&'), {
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

		return (
			<Container fluid='true'>
			<Row>
				<Col>
					<ForceLogin/>
					{ crumbs }
					<h3>Grades</h3>
					<Message message={this.state.message} style={this.state.messageStyle} />
					<Loading loading={this.state.isLoading } />
					<Filter onChange={this.onRefreshData} onReady={this.onReady} disabled={this.state.isLoading} defaults={{code: 'tutorial'}} />
					<IfGrades data={this.state.data} />
				</Col>
			</Row>
			</Container>
		);
	}
}