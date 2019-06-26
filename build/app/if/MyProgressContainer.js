import React from 'react';
import PropTypes from 'prop-types';

import IfLevelList from './IfLevelList';
import {PageHeader} from './../components/Misc';
import { Link } from 'react-router-dom';

import { Breadcrumb, Container, Row, Col, Card, Button } from 'react-bootstrap';

import { get_user_is_admin, get_username_or_emptystring, Message, Loading } from './../components/Misc';

import { IfLevelSchema, IfLevels } from './../../shared/IfGame';

import MyProgress from './MyProgress';

import ForceLogin from './../components/ForceLogin';



export default class IfLevelListContainer extends React.Component {

	constructor(props) {
		super(props);
		this.state = { 
			code: this.props.match.params._code,
			message: 'Loading data from server',
			message_style: 'info',
			isLoadingGrades: true,
			isLoadingUncompletedLevels: true,
			levels: [],
			grades: []
		};
		this.insertGame = this.insertGame.bind(this);
	}

	componentDidMount() {
		
		// Fetch levels
		fetch('/api/ifgame/levels/byCompleted/false', {
				credentials: 'include'
			})
			.then( response => response.json() )
			.then( json => {
				let ifLevels = json.map( j => new IfLevelSchema(j) );
				this.setState({
					levels: ifLevels,
					message: '',
					message_style: 'info',
					isLoadingUncompletedLevels: false
				});
			})
			.catch( error => {
				this.setState({ 
					levels: [],
					message: 'Error: ' + error,
					message_style: 'danger',
					isLoadingUncompletedLevels: false
				});
			});

		// Fetch grades
		fetch('/api/ifgame/grades/' + get_username_or_emptystring(), {
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

	insertGame(code) {
		this.setState({ isLoading: true });

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
				this.setState({ message: error });
			}).then( () => this.setState({ isLoading: false }));
	}



	render() {
		const that = this;
		const ADMIN = get_user_is_admin();
		const links = !ADMIN ? [] : [
			'/api/version',
			'/logout',
			'/ifgame/test/?USER_CREATION_SECRET=supersecret',
			'/ifgame/monitor',
			'/ifgame/grades',
			'/ifgame/questions',
			'/ifgame/surveys'
		];

		const debug_buttons = !ADMIN ? [] :
			IfLevels.map( (level,i) => 
						<li key={'iflevellistdebugcontainerbutton'+i}>
							<a href={'/ifgame/leveldebug/'+level.code}>{level.code}</a>
						</li>
					);

		const myProgress = this.state.isLoadingUncompletedLevels || this.state.isLoadingGrades ? <div/> :
						<MyProgress 
							grades={this.state.grades} 
							uncompleted_levels={this.state.levels} 
							onClickNewCode={ (code,e)=> that.insertGame(code,e)}
							onClickContinueLevel={ (ifLevel)=> this.context.router.history.push('/ifgame/level/'+ifLevel._id+'/play') } 
						/>;


		return (
			<Container fluid='true'>
				<Row>
					<Col>
						<ForceLogin />
						<div style={{ paddingTop: 10}} />
						<Message message={this.state.message} style={this.state.message_style} />
						<Loading loading={this.state.isLoadingGrades || this.state.isLoadingUncompletedLevels } />
						{ myProgress }
						{ debug_buttons.length === 0 ? '' : 
							<div>
								<h4>Debug a tutorial</h4> 
								<ul>{ debug_buttons }</ul>
								<br/><br/>
							</div>
						}
						<br/><br/>
						{ links.length === 0 ? '' : 
							<div>
								<h4>Links</h4> 
								<ul>{ links.map( (link,i) => (<li key={'link'+i}><Link to={link}>{link}</Link></li>) ) }</ul>
							</div>
						}
						<br/><br/>
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
IfLevelListContainer.propTypes = {
	match: PropTypes.object.isRequired
};
IfLevelListContainer.contextTypes = {
	router: PropTypes.object.isRequired
};
