// @flow
import React from 'react';
import Container from 'react-bootstrap/Container';
import { Row, Col, Breadcrumb  } from 'react-bootstrap';

import { ClassProgressChart } from './ClassProgressChart';
import { ClassProgressKCs } from './ClassProgressKCs';
import { ClassProgressStudent } from './ClassProgressStudent';
import { ClassProgressModal } from './ClassProgressModal';
import { Message, Loading } from './../components/Misc';
import Filter from './Filter';
import { DEMO_MODE } from './../../server/secret';

import ForceLogin from './../components/ForceLogin';
import { IfLevelSchema } from './../../shared/IfLevelSchema';

import type { Node } from 'react';


type ProgressPropsType = {};

type ProgressContainerStateType = {
	message: string,
	messageStyle: string,
	data_loading: boolean,
	data: Array<any>,
	modal_level: ?IfLevelSchema,
	modal_level_loading: boolean,
};

export default class ClassProgressContainer extends React.Component<ProgressPropsType, ProgressContainerStateType> {
	constructor(props: any) {
		super(props);
		this.state = { 
			message: 'Loading data from server',
			messageStyle: '',

			data: [],
			data_loading: true,

			modal_level: null,
			modal_level_loading: false,
		};
		(this: any).onRefreshData = this.onRefreshData.bind(this);
		(this: any).onReady = this.onReady.bind(this);
		(this: any).hide_modal = this.hide_modal.bind(this);
		(this: any).show_modal = this.show_modal.bind(this);
	}

	onReady(filter: Object) {
		this.setState({ data_loading: false, message: ''});
		this.onRefreshData(filter);
	}

	onRefreshData(filter: Object) {
		const args = [];

		if(filter.sections !== '') args.push('idsection='+filter.sections);

		this.setState({ data_loading: true, message: 'Loading progress data'});
		
		fetch('/api/ifgame/progress?'+args.join('&'), {
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


	/*
		Load a level to view as a modal box.
	*/
	show_modal(level_id: number) {
		this.setState({ modal_level_loading: true });

		fetch('/api/ifgame/level/'+level_id, {
				credentials: 'include'
			})
			.then( response => response.json() )
			.then( json => new IfLevelSchema(json) )
			.then( ifLevel => {
				this.setState({
					modal_level: ifLevel,
					modal_level_loading: false,
				});
			})
			.catch( error => {
				this.setState({ 
					modal_level: null,
					message: 'Error: ' + error.message,
					modal_level_loading: false
				});
			});
	}

	hide_modal() {
		this.setState({ modal_level: null });
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
		const modal = this.state.modal_level === null || typeof this.state.modal_level === 'undefined'
				? null
				: <ClassProgressModal level={this.state.modal_level} hide={ () => this.setState({ modal_level: null }) }/>;

		return (
			<Container fluid='true'>
			<Row>
				<Col>
					<ForceLogin/>
					{ crumbs }
					<h3>Progress</h3>
					<Message message={this.state.message} style={this.state.messageStyle} />
					<Loading loading={ this.state.data_loading || this.state.modal_level_loading } />
					{ modal }
					{ filter }
					{ empty }
					<ClassProgressChart data={this.state.data} show_modal={ id => this.show_modal(id) } />
					<ClassProgressKCs data={this.state.data} />

				</Col>
			</Row>
			</Container>
		);
		//										
		//										

	}
}