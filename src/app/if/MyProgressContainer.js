// @flow
import React from 'react';
import PropTypes from 'prop-types';

import Container from 'react-bootstrap/Container';
import { Row, Col } from 'react-bootstrap';

import { Message, Loading } from './../components/Misc';
import { getUserFromBrowser } from './../components/Authentication';

import { IfLevelSchema } from './../../shared/IfLevelSchema';

import MyProgress from './MyProgress';

import ForceLogin from './../components/ForceLogin';
import { CacheBuster } from './../components/CacheBuster';

import type { Node } from 'react';

//$FlowFixMe
//import { BrowserRouter, useHistory } from "react-router-dom";
import { withRouter } from "react-router";


type PropsType = {
	history: any,
};

type StateType = {
	message: string,
	messageStyle: string,
	isLoadingGrades: boolean, 
	isLoadingSections: boolean,
	isLoadingUncompletedLevels: boolean,
	levels: Array<Object>,
	grades: Array<Object>,
	sections: Array<Object>,
	
};


export default withRouter(class MyProgressContainer extends React.Component<PropsType, StateType>  {
	_isMounted: boolean;

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
		this._isMounted = true;

		// Don't even try to load until we are logged int. Redirect to login page
		// This goes a little bit faster than if we wait until we hit the forcelogin control.
		if(user.username === null || user.username === '') {
			this.props.history.push('/login/');
		}
	
		// Fetch sections.
		fetch('/api/sections/sections', {
				credentials: 'include'
			})
			.then( response => response.json() )
			.then( json => {
				if(this._isMounted) {
					this.setState({
						sections: json,
						isLoadingSections: false
					});
				}
			})
			.catch( error => {
				if(this._isMounted) {
					this.setState({ 
						levels: [],
						message: 'Error: ' + error,
						messageStyle: 'danger',
						isLoadingSections: false
					});
				}
			});

		// Fetch levels
		fetch('/api/levels/levels/byCompleted/false', {
				credentials: 'include'
			})
			.then( response => response.json() )
			.then( json => {
				let ifLevels = json.map( j => new IfLevelSchema(j) );
				if(this._isMounted) {
					this.setState({
						levels: ifLevels,
						isLoadingUncompletedLevels: false
					});
				}
			})
			.catch( error => {
				console.log(error);
				this.setState({ 
					levels: [],
					message: 'Error: ' + error,
					messageStyle: 'danger',
					isLoadingUncompletedLevels: false
				});
			});

		// Fetch grades
		fetch('/api/reports/grades?username=' + user.username, {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => response.json() )
			.then( json => {
				if(this._isMounted) {
					this.setState({
						grades: json,
						isLoadingGrades: false
					});
				}
			})
			.catch( error => {
				console.log(error);
				this.setState({ 
					grades: [],
					message: 'Error: ' + error,
					messageStyle: 'Error',
					isLoadingGrades: false
				});
			});
	}
 
	componentWillUnmount() {
		this._isMounted = false;
	}


	insertGame(code: string) {
		this.setState({ isLoadingSections: true });

		fetch('/api/levels/new_level_by_code/'+code, {
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
				this.props.history.push('/ifgame/level/'+newLevel._id+'/play');

			}).catch( error => {
				console.log(error);
				this.setState({ message: error, isLoadingSections: false });
			});
	}



	render(): Node {
		const history = this.props.history;
		const is_loading = this.state.isLoadingUncompletedLevels || this.state.isLoadingGrades || this.state.isLoadingSections;

		const myProgress = is_loading ? <div/> :
						<MyProgress 
							sections={this.state.sections }
							grades={this.state.grades} 
							uncompleted_levels={this.state.levels} 
							onClickNewCode={ (code,e)=> this.insertGame(code)}
							onClickContinueLevel={ (ifLevel)=> history.push('/ifgame/level/'+ifLevel._id+'/play') } 
						/>;


		return (
				<Container fluid>
					<Row>
						<Col>
							<ForceLogin />
							<CacheBuster/>
							<div style={{ paddingTop: 10}} />
							<Message message={this.state.message} style={this.state.messageStyle} />
							<Loading loading={this.state.isLoadingGrades || this.state.isLoadingUncompletedLevels } />
							{ myProgress }
						</Col>
					</Row>
				</Container>
		);
	}

});
