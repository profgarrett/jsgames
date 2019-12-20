// @flow
import React from 'react';
import Container from 'react-bootstrap/Container';
import { Row, Col, Breadcrumb  } from 'react-bootstrap';

import { IfPageAnswer } from './../../shared/IfPageSchemas';
import { ClassProgressChart } from './ClassProgressChart';
import { KCCharts } from './KCCharts';
import { LevelModal } from './LevelModal';
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
	answers: Array<any>,
	modal_level: ?IfLevelSchema,
	modal_level_loading: boolean,
};

export class KCContainer extends React.Component<ProgressPropsType, ProgressContainerStateType> {
	constructor(props: any) {
		super(props);
		this.state = { 
			message: 'Loading data from server',
			messageStyle: '',

			answers: [],
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

	onRefreshData(filter: Object, ) {
		const args = [];

		if(filter.sections !== '') args.push('idsection='+filter.sections);
        if(filter.levels !== '') args.push('code='+filter.levels);

		this.setState({ data_loading: true, message: 'Loading progress data'});
		
		fetch('/api/reports/answers?'+args.join('&'), {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => response.json() )
			.then( json => {
                const answers = json.map( j => new IfPageAnswer(j) )
				this.setState({
					answers: answers,
					messageStyle: '',
					message: '',
					data_loading: false
				});
			})
			.catch( error => {
				this.setState({ 
					answers: [],
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

		fetch('/api/reports/level/'+level_id , {
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
				<Breadcrumb.Item title='KC Analysis' active>KC Analysis</Breadcrumb.Item>
			</Breadcrumb>
			);
        
        const default_level = 'math1';

		const search = new URLSearchParams(window.location.search);
		const filter_defaults = search.has('idsection') 
			? { levels: default_level, sections: search.get('idsection') }
			: { levels: default_level };
		
		const filter = <Filter 
				onChange={this.onRefreshData} 
				onReady={this.onReady} 
				disabled={this.state.data_loading} 
				defaults={filter_defaults}
				filters={{
                    levels: [],
                    sections: []
                }}
			/>;

		const empty = this.state.answers.length === 0 && this.state.data_loading === false
				? <p>No students in this section have yet started completing lessons. Once they get started, you'll see a chart here with their progress</p>
				: null;
		const modal = this.state.modal_level === null || typeof this.state.modal_level === 'undefined'
				? null
				: <LevelModal level={this.state.modal_level} level_id={null} hide={ () => this.setState({ modal_level: null }) }/>;

		return (
			<Container fluid='true'>
			<Row>
				<Col>
					<ForceLogin/>
					{ crumbs }
					<h3>Student Learning</h3>
					<Message message={this.state.message} style={this.state.messageStyle} />
					<Loading loading={ this.state.data_loading || this.state.modal_level_loading } />
					{ modal }
					{ filter }
					{ empty }
					<KCCharts answers={this.state.answers} />

				</Col>
			</Row>
			</Container>
		);
	}
}