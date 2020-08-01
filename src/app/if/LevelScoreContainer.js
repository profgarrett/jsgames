// @flow
import React from 'react';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import { Row, Col, Breadcrumb, Button  } from 'react-bootstrap';
import { LevelScore } from './LevelScore';
import { LevelScoreChart } from './LevelScoreChart';
import { Message, Loading } from './../components/Misc';

import { IfLevelSchema } from './../../shared/IfLevelSchema';

import ForceLogin from './../components/ForceLogin';

type PropsType = {
	match: Object
};
type StateType = {
	message: string,
	messageStyle: string,
	isLoading: boolean,
	level: ?IfLevelSchema,
	_id: number
};

const DEBUG = true; // load a sample debug score result?

export default class LevelScoreContainer extends React.Component<PropsType, StateType> {
	constructor(props: PropsType) {
		super(props);
		console.log(this.props.match);
		this.state = { 
			message: 'Loading data from server',
			messageStyle: '',
			isLoading: true,
			level: null,
			_id: this.props.match.params._id
		};
	}

	componentDidMount() {
		let _id = this.props.match.params._id;
		const url = /* DEBUG 
			? '/api/levels/debuglevel/surveycharts_wu/'
			: */ '/api/levels/level/'+_id;

		fetch(url, {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => response.json() )
			.then( json => new IfLevelSchema(json) )
			.then( ifLevel => {
				this.setState({
					level: ifLevel,
					message: '',
					isLoading: false
				});
			})
			.catch( error => {
				this.setState({ 
					level: null,
					message: 'Error: ' + error,
					isLoading: false
				});
			});
	}

	render() {
		const crumbs = this.state.level ?
			<Breadcrumb>
				<Breadcrumb.Item href={'/ifgame/'}>Home</Breadcrumb.Item>
				<Breadcrumb.Item active>{ this.state.level.title }</Breadcrumb.Item>
			</Breadcrumb>
			: <span></span>;

		const back = this.state.level ?
			<Button variant='primary' 
					style={{ marginBottom: 20, marginTop: 20 }} 
					href={ '/ifgame/' }>
					Back to home page
			</Button>
			: <span />;

		const level = this.state.level;
		let score = null;
		
		// If we are looking at a chart, then show the specially-designed 
		// chart screen. Otherwise, go to the normal score.
		if(typeof level === 'undefined' || level == null) {
			score = null;
		} else if( level.code === 'surveycharts_amt' || level.code === 'surveycharts_wu') {
			score = <LevelScoreChart level={level} />;
		} else {
			score = <LevelScore level={level} />;
		}

		return (
			<Container fluid>
				<Row>
					<Col>
						<ForceLogin/>
						{ crumbs }
						<h3>{ this.state.level ? this.state.level.title : '' }</h3>

						<Message message={this.state.message} style={this.state.messageStyle} />
						<Loading loading={this.state.isLoading } />
						<div style={{ textAlign: 'center' }}>{ back }</div>
						{ score }
						<div style={{ textAlign: 'center' }}>{ back }</div>
						<br/>
					</Col>
				</Row>
			</Container>
		);
	}
}