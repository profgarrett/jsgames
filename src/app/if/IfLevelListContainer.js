import React from 'react';
import PropTypes from 'prop-types';

import IfLevelList from './IfLevelList';

import { Breadcrumb, PageHeader, Row, Col, Well, Button } from 'react-bootstrap';

import { get_user_is_admin, get_username, Message, Loading } from './../components/Misc';

import { IfLevelSchema, IfLevels } from './../../shared/IfGame';

import IfGrades from './IfGrades';

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

	render() {
		const code = this.props.match.params._code ? this.props.match.params._code : 'all';
		if(code === 'all') {
			return this.render_all();
		} else {
			return this.render_code(code);
		}
	}


	// Render levels that match the given code.
	// Hides add button if there are any uncompleted items.
	render_code(code) {
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


	render_all() {

		const links = !get_user_is_admin() ? [] : [
			'/api/version',
			'/logout',
			'/ifgame/test/?USER_CREATION_SECRET=supersecret',
			'/ifgame/activity',
			'/ifgame/monitor',
			'/ifgame/grades',
			'/ifgame/answers'
		];

		const buttons = IfLevels.map( (level, i) => (
			<div key={i}>
				<h4>{level.label}</h4>
					<Button 
						onClick={ e => this.insertGame(level.code, e) } 
						disabled={ this.state.isLoading } >
						{ level.description }
					</Button>
			</div>
		));

		return (
			<div>
			<Row>
				<Col xs={12}>
					<ForceLogin />
					<PageHeader>Formula Trainer</PageHeader>
					<Message message={this.state.message} style={this.state.message_style} />
					<Loading loading={this.state.isLoading } />
					<IfGrades data={this.state.grades} />
				</Col>
			</Row>
			<Row>
				<Col xs={8}>
					<IfLevelList levels={this.state.levels} />
					<ul>{ links.map( (l,i) => <li key={'link'+i}><a href={l}>{l}</a></li> ) }</ul>
				</Col>
				<Col xs={4}>
					<div className='alert alert-warning' role='alert'>
						This site shows you how to write Excel formulas.
						<br/><br/>
						Report issues to &nbsp;
						<a className='alert-link' 
							href='mailto:nathan.garrett@woodbury.edu'>Nathan Garrett</a>.
					</div>
					{ buttons }
					<br/><br/>
				</Col>
			</Row>
			</div>
		);
	}
}
IfLevelListContainer.propTypes = {
	match: PropTypes.object.isRequired
};
IfLevelListContainer.contextTypes = {
	router: PropTypes.object.isRequired
};
