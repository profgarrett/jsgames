import React from 'react';
import PropTypes from 'prop-types';

import IfLevelList from './IfLevelList';
import {PageHeader} from './../components/Misc';

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
			isLoading: true,
			levels: [],
			grades: []
		};
		this.insertGame = this.insertGame.bind(this);
	}

	componentDidMount() {
		const code = this.props.match.params._code ? this.props.match.params._code : 'all';
		
		// Fetch levels
		fetch('/api/ifgame/levels/byCode/'+code, {
				credentials: 'include'
			})
			.then( response => response.json() )
			.then( json => {
				let ifLevels = json.map( j => new IfLevelSchema(j) );
				this.setState({
					levels: ifLevels,
					message: '',
					message_style: 'info',
					isLoading: false
				});
			})
			.catch( error => {
				this.setState({ 
					levels: [],
					message: 'Error: ' + error,
					message_style: 'danger',
					isLoading: false
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
					grades: json
				});
			})
			.catch( error => {
				this.setState({ 
					grades: [],
					message: 'Error: ' + error,
					messageStyle: 'Error',
					isLoading: false
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


	// Render levels that match the given code.
	// Hides add button if there are any uncompleted items.
	_render_code(code) {
		
		let button_level = IfLevels.filter( level => level.code === code )[0];
		let button;

		const crumbs = (
			<Breadcrumb>
				<Breadcrumb.Item href={'/ifgame/'}>Home</Breadcrumb.Item>
				<Breadcrumb.Item active>List</Breadcrumb.Item>
			</Breadcrumb>
			);


		if(this.state.isLoading === false
			&& this.state.levels.filter( l=> !l.completed ).length === 0) {
			button = (<Button 
						onClick={ e => this.insertGame(button_level.code, e) } 
						disabled={ this.state.isLoading } >
						Start
					</Button>); 
		} else {
			button = '';
		}

		return (
			<Container fluid='true'>
				<Row>
				<Col xs={12}>
					{ crumbs }
					<ForceLogin />
					<PageHeader header ={ button_level.label } />
					<Message message={this.state.message} style={this.state.message_style} />
					<Loading loading={this.state.isLoading } />
					<IfLevelList levels={this.state.levels} />
					{ button }		
				</Col>
			</Row>
			</Container>
		);
		
	}


	_render_all() {
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

		const debug_buttons = [];
		const restart_buttons = [];
		const completed_tutorials = this.state.levels.filter( l => l.completed ).map( l => l.code );

		// If an admin, allow restarting any level. Otherwise, just restart 
		// already completed levels.
		const codes = ADMIN ? IfLevels
				: IfLevels.filter( l => completed_tutorials.includes(l.code) );


		// Create a button for each tutorial that we have already completed.
		codes.map( (level,i) => {
			restart_buttons.push(
				<li key={'iflevellistcontainerbutton'+i}>
					<Button 
						onClick={ e => this.insertGame(level.code, e) } 
						variant='link'
						style={{ padding: 0 }}
						disabled={ this.state.isLoading } >
						{ level.label }
					</Button>
				</li>
			);

			if(ADMIN) {
				debug_buttons.push(
					<li key={'iflevellistdebugcontainerbutton'+i}>
						<a href={'/ifgame/leveldebug/'+level.code}>{level.code}</a>
					</li>
				);
			}
		});


		return (
			<Container fluid='true'>
				<Row>
					<Col>
						<ForceLogin />
						<div style={{ paddingTop: 10}} />
						<Message message={this.state.message} style={this.state.message_style} />
						<Loading loading={this.state.isLoading } />
						<MyProgress 
							grades={this.state.grades} 
							levels={this.state.levels} 
							onClickNewCode={ (code,e)=> that.insertGame(code,e)}
							onClickContinueLevel={ (ifLevel)=> this.context.router.history.push('/ifgame/level/'+ifLevel._id+'/play') } />
					</Col>
				</Row>
				<Row>
					<Col sm={8} style={{ padding: '1.25rem'}} >
						<IfLevelList levels={this.state.levels} />
						<ul>{ links.map( (l,i) => <li key={'link'+i}><a href={l}>{l}</a></li> )}
						</ul>
					</Col>
					<Col sm={4} style={{ padding: '1.25rem'}} >
						{ debug_buttons.length === 0 ? '' : 
							<div>
								<h4>Debug a tutorial</h4> 
								<ul>{ debug_buttons }</ul>
								<br/><br/>
							</div>
						}
						{ restart_buttons.length === 0 ? '' : <h4>Restart a tutorial</h4> }
						<ul>{ restart_buttons }</ul>
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

	render() {
		const code = this.props.match.params._code ? this.props.match.params._code : 'all';
		if(code === 'all') {
			return this._render_all();
		} else {
			return this._render_code(code);
		}
	}

}
IfLevelListContainer.propTypes = {
	match: PropTypes.object.isRequired
};
IfLevelListContainer.contextTypes = {
	router: PropTypes.object.isRequired
};
