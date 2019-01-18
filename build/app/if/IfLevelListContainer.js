import React from 'react';
import PropTypes from 'prop-types';

import IfLevelList from './IfLevelList';

import { Breadcrumb, PageHeader, Row, Col, Well, Button } from 'react-bootstrap';

import { get_user_is_admin, get_username, Message, Loading } from './../components/Misc';

import { IfLevelSchema, IfLevels } from './../../shared/IfGame';

import IfMyProgress from './IfMyProgress';

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
		fetch('/api/ifgame/grades/' + get_username(), {
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
						Begin a new tutorial
					</Button>); 
		} else {
			button = '';
		}

		return (
			<div>
			<Row>
				<Col xs={12}>
					{ crumbs }
					<ForceLogin />
					<PageHeader>{ button_level.label }</PageHeader>
					<Message message={this.state.message} style={this.state.message_style} />
					<Loading loading={this.state.isLoading } />
					<Well>
						{button_level.description }
					</Well>
					{ button }		
					<IfLevelList levels={this.state.levels} />
				</Col>
			</Row>
			</div>
		);
	}


	_render_all() {
		const that = this;
		const ADMIN = get_user_is_admin();
		const links = !ADMIN ? [] : [
			'/api/version',
			'/logout',
			'/ifgame/test/?USER_CREATION_SECRET=supersecret',
			'/ifgame/activity',
			'/ifgame/monitor',
			'/ifgame/grades',
			'/ifgame/answers'
		];

		const buttons = [];
		const completed_tutorials = this.state.levels.filter( l => l.completed ).map( l => l.code );

		// If an admin, allow restarting any level. Otherwise, just restart 
		// already completed levels.
		const codes = ADMIN ? IfLevels
				: IfLevels.filter( l => completed_tutorials.includes(l.code) );

		// Create a button for each tutorial that we have already completed.
		codes.map( (level,i) => {
			buttons.push(
				<li key={'iflevellistcontainerbutton'+i}>
					<Button 
						onClick={ e => this.insertGame(level.code, e) } 
						bsStyle='link'
						style={{ padding: 0 }}
						disabled={ this.state.isLoading } >
						{ level.code.substr(0,1).toUpperCase() + level.code.substr(1) }
					</Button>
				</li>
			);
		});


		return (
			<div>
			<Row>
				<Col xs={12}>
					<ForceLogin />
					<div style={{ paddingTop: 10}} />
					<Message message={this.state.message} style={this.state.message_style} />
					<Loading loading={this.state.isLoading } />
					<IfMyProgress 
							grades={this.state.grades} 
							levels={this.state.levels} 
							onClickNewCode={ (code,e)=> that.insertGame(code,e)}
							onClickContinueLevel={ (ifLevel,e)=> this.context.router.history.push('/ifgame/level/'+ifLevel._id+'/play') } />
				</Col>
			</Row>
			<Row>
				<Col xs={8}>
					<IfLevelList levels={this.state.levels} />
					<ul>{ links.map( (l,i) => <li key={'link'+i}><a href={l}>{l}</a></li> )}
					</ul>
				</Col>
				<Col xs={4}>
					{ buttons.length === 0 ? '' : <h4>Restart a tutorial</h4> }
					<ul>{ buttons }</ul>
					<br/><br/>
				</Col>
			</Row>
			</div>
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
