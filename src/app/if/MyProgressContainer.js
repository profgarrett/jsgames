// @flow
import React from 'react';
import PropTypes from 'prop-types';

//import IfLevelList from './IfLevelList';
//import {PageHeader} from './../components/Misc';
import { Link } from 'react-router-dom';

import { Container, Row, Col } from 'react-bootstrap';

import { Message, Loading } from './../components/Misc';
import { getUserFromBrowser } from './../components/Authentication';

import { IfLevelSchema, IfLevels } from './../../shared/IfGame';

import MyProgress from './MyProgress';

import ForceLogin from './../components/ForceLogin';


import type { Node } from 'react';


type PropsType = {};

type StateType = {
	message: string,
	messageStyle: string,
	isLoadingGrades: boolean, 
	isLoadingSections: boolean,
	isLoadingUncompletedLevels: boolean,
	levels: Array<Object>,
	grades: Array<Object>,
	sections: Array<Object>
};


export default class IfLevelListContainer extends React.Component<PropsType, StateType>  {

	constructor(props: any) {
		super(props);
		this.state = { 
			message: '',
			messageStyle: '',
			isLoadingGrades: true,
			isLoadingUncompletedLevels: true,
			isLoadingSections: true,
			levels: [],
			grades: [],
			sections: []
		};

		(this: any).insertGame = this.insertGame.bind(this);
	}

	componentDidMount() {
		const user = getUserFromBrowser();


		// Fetch sections.
		fetch('/api/ifgame/sections', {
				credentials: 'include'
			})
			.then( response => response.json() )
			.then( json => {
				this.setState({
					sections: json,
					isLoadingSections: false
				});
			})
			.catch( error => {
				this.setState({ 
					levels: [],
					message: 'Error: ' + error,
					messageStyle: 'danger',
					isLoadingSections: false
				});
			});

		// Fetch levels
		fetch('/api/ifgame/levels/byCompleted/false', {
				credentials: 'include'
			})
			.then( response => response.json() )
			.then( json => {
				let ifLevels = json.map( j => new IfLevelSchema(j) );
				this.setState({
					levels: ifLevels,
					isLoadingUncompletedLevels: false
				});
			})
			.catch( error => {
				this.setState({ 
					levels: [],
					message: 'Error: ' + error,
					messageStyle: 'danger',
					isLoadingUncompletedLevels: false
				});
			});

		// Fetch grades
		fetch('/api/ifgame/grades?username=' + user.username, {
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
					grades: json,
					isLoadingGrades: false
				});
			})
			.catch( error => {
				this.setState({ 
					grades: [],
					message: 'Error: ' + error,
					messageStyle: 'Error',
					isLoadingGrades: false
				});
			});


	}

	insertGame(code: string) {
		this.setState({ isLoadingSections: true });

		fetch('/api/ifgame/new_level_by_code/'+code, {
				method: 'post',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => response.json() )
			.then( json => {

				let newLevel = new IfLevelSchema(json);
				this.context.router.history.push('/ifgame/level/'+newLevel._id+'/play');

			}).catch( error => {
				console.log(error);
				this.setState({ message: error, isLoadingSections: false });
			});
	}



	render(): Node {
		const is_loading = this.state.isLoadingUncompletedLevels || this.state.isLoadingGrades || this.state.isLoadingSections;
		const myProgress = is_loading ? <div/> :
						<MyProgress 
							sections={this.state.sections }
							grades={this.state.grades} 
							uncompleted_levels={this.state.levels} 
							onClickNewCode={ (code,e)=> this.insertGame(code)}
							onClickContinueLevel={ (ifLevel)=> this.context.router.history.push('/ifgame/level/'+ifLevel._id+'/play') } 
						/>;


		return (
			<Container fluid='true'>
				<Row>
					<Col>
						<ForceLogin />
						<div style={{ paddingTop: 10}} />
						<Message message={this.state.message} style={this.state.messageStyle} />
						<Loading loading={this.state.isLoadingGrades || this.state.isLoadingUncompletedLevels } />
						{ myProgress }
					</Col>
				</Row>
			</Container>
		);
	}

/*
					<div className='alert alert-warning' role='alert'>
						This site shows you how to write Excel formulas.
						<br/><br/>
						Report issues to &nbsp;
						<a className='alert-link' 
							href='mailto:nathan.garrett@woodbury.edu'>Nathan Garrett</a>.
					</div>

*/


}
IfLevelListContainer.contextTypes = {
	router: PropTypes.object.isRequired
};