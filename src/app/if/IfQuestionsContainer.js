//@flow
import React from 'react';
import { Container, ButtonToolbar, ButtonGroup, Row, Col, Breadcrumb, DropdownButton, Dropdown, Button  } from 'react-bootstrap';

import IfQuestions from './IfQuestions';
import { Message, Loading } from './../components/Misc';

import { IfLevels, IfLevelSchema } from './../../shared/IfGame';

import ForceLogin from './../components/ForceLogin';

import type { LevelType } from './IfTypes';
import type { Node } from 'react';


type QuestionsPropsType = {};

type QuestionsContainerStateType = {
	message: string,
	messageStyle: string,

	// Status.
	loading_data: boolean,

	// Filters
	code: string,
	codes: Array<string>,

	idsection: ?number,
	sections: ?Array<any>,

	iduser: ?number,
	users: ?Array<any>,

	output: string,

	levels: Array<LevelType>
};

export default class IfQuestionsContainer extends React.Component<QuestionsPropsType, QuestionsContainerStateType> {
	constructor(props: any) {
		super(props);
		this.state = { 
			message: 'Loading data from server',
			messageStyle: '',

			loading_data: true,

			code: 'tutorial',
			codes: IfLevels.map( l => l.code ),

			idsection: null,
			sections: null, // loads to an array from server.

			iduser: null,
			users: null, // loads to array

			output: 'excel', // either table or excel.

			levels: [],
		};
		(this: any).refreshFilters = this.refreshFilters.bind(this);
		(this: any).refreshLevels = this.refreshLevels.bind(this);

		(this: any).handleCodeFilterChange = this.handleCodeFilterChange.bind(this);
		(this: any).handleIdSectionFilterChange = this.handleIdSectionFilterChange.bind(this);
		(this: any).handleIdUserFilterChange = this.handleIdUserFilterChange.bind(this);
		(this: any).handleOutputFilterChange = this.handleOutputFilterChange.bind(this);

	}

	componentDidMount() {
		this.refreshFilters();
	}
	handleCodeFilterChange(value: string) {
		this.setState({ code: value});
	}
	handleIdSectionFilterChange(value: string) {
		this.setState({ idsection: parseInt(value,10)});
	}
	handleIdUserFilterChange(value: string) {
		this.setState({ iduser: parseInt(value, 10)});
	}
	handleOutputFilterChange(value: string) {
		this.setState({ output: value });
	}


	// Load the filter values.
	refreshFilters() {
		this.setState({ loading_data: true, message: 'loading filters' });
		const newState = { loading_data: false, message: '' };

		// Start with sections.
		fetch('/api/ifgame/sections', {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => response.json() )
			.then( json => {
				if( json.length > 0) {
					// Set the section to the first item and load.
					newState.sections = json;
					newState.idsection = -1; // json[0].idsection; default to no section.
				} else {
					// No sections found.
					newState.sections = [];
				}

				// Now load list of people.
				fetch('/api/ifgame/users', {
						method: 'get',
						credentials: 'include',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						}
					})
					.then( response => response.json() )
					.then( json => {
						if( json.length > 0) {
							newState.users = json;
							newState.iduser = -1; // json[0].iduser; default to all users
						} else {
							newState.users = [];
						}

						// Now update state.
						this.setState(newState, this.refreshLevels()); 

					})
					.catch( error => {
						this.setState({ 
							message: 'Error: ' + error,
							messageStyle: 'danger',
							loading_data: false
						});
					});

			})
			.catch( error => {
				this.setState({ 
					message: 'Error: ' + error,
					messageStyle: 'danger',
					loading_data: false
				});
			});
	}


	refreshLevels() {
		const params = [];

		if(this.state.code !== null && this.state.code !== 'All') 
				params.push('code='+ this.state.code);

		if(this.state.idsection !== null && this.state.idsection !== -1) 
				params.push('idsection='+ this.state.idsection);

		if(this.state.iduser !== null && this.state.iduser !== -1) 
				params.push('iduser='+ this.state.iduser);

		const q_string = params.length === 0 ? '' :
				'?' + params.join('&');
 
		this.setState({ loading_data: true, message: 'Loading data from server' });

		fetch('/api/ifgame/recent_levels/'+ q_string, {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => response.json() )
			.then( json => json.map( j => new IfLevelSchema(j) ) )
			.then( ifLevels => {
				this.setState({
					levels: ifLevels,
					messageStyle: '',
					message: '',
					loading_data: false
				});
			})
			.catch( error => {
				this.setState({ 
					levels: [],
					message: 'Error: ' + error,
					messageStyle: 'danger',
					loading_data: false
				});
			});
	}



	render(): Node {

		const crumbs = (
			<Breadcrumb>
				<Breadcrumb.Item title='home' href='/ifgame/'>If Games</Breadcrumb.Item>
				<Breadcrumb.Item title='Questions' active>Questions</Breadcrumb.Item>
			</Breadcrumb>
			);

		// Build filter datasets, adding a -1 option for all.
		const levels = ['All'];
		IfLevels.map(l => levels.push(l.code));

		const sections = [{ idsection: -1, code: 'All' }];
		if(this.state.sections !== null) 
				this.state.sections.map( section => sections.push(section));

		const users = [{ iduser: -1, username: 'All'}];
		if(this.state.users !== null) 
				this.state.users.map( user => users.push(user));

		const section_title = this.state.idsection === -1 || this.state.idsection === null
				? 'Pick a section' 
				: 'Section: ' + this.state.sections.filter( 
						s => s.idsection === this.state.idsection )[0].code;

		const user_title = this.state.iduser === -1 || this.state.iduser === null
				? 'Pick a user' 
				: 'User: ' + this.state.users.filter( 
						s => s.iduser === this.state.iduser )[0].username;

		const filter = (
			<form name='c' >
				<ButtonToolbar>
				<ButtonGroup>
				<DropdownButton 
						onSelect={this.handleCodeFilterChange}
						variant='primary' 
						title= { this.state.code } 
						key='select_code' id='select_code'>
							{ levels.map( (code,i) => 
								<Dropdown.Item
									key={'select_code_dropdownitem'+i} 
									eventKey={code}>{code}
								</Dropdown.Item> 
							)}
				</DropdownButton>
				<DropdownButton 
						onSelect={this.handleIdSectionFilterChange}
						variant='primary' 
						title= {section_title}
						key='select_section' id='select_section'>
							{ sections.map( (section,i) => 
								<Dropdown.Item key={'select_section_dropdownitem'+i} 
								eventKey={section.idsection}>{section.code}</Dropdown.Item> )}
				</DropdownButton>
				<DropdownButton 
						onSelect={this.handleIdUserFilterChange}
						variant='primary' 
						title={user_title}
						key='select_user' id='select_user'>
							{ users.map( (user,i) => 
								<Dropdown.Item key={'select_user_dropdownitem'+i} 
								eventKey={user.iduser}>{user.username}</Dropdown.Item> )}
				</DropdownButton>
				</ButtonGroup> 

				<ButtonGroup>
				<DropdownButton 
						onSelect={this.handleOutputFilterChange}
						variant='primary' 
						title={this.state.output}
						key='select_output' id='select_output'>
							<Dropdown.Item eventKey='excel'>excel</Dropdown.Item>
							<Dropdown.Item eventKey='table'>table</Dropdown.Item>
				</DropdownButton>
				</ButtonGroup>

				<ButtonGroup>
				<Button
						disabled={this.state.loading_data}
						variant='primary'
						onClick={ () => this.refreshLevels()}
				>{ this.state.loading_data ? 'Loading...' : 'Refresh' }
				</Button>
				</ButtonGroup>
				</ButtonToolbar>
			</form>
			);

		return (
			<Container fluid='true'>
				<Row>
					<Col>
						<ForceLogin/>
						{ crumbs }
						<h3>Questions for { this.state.code }</h3>

						<Message message={this.state.message} style={this.state.messageStyle} />
						<Loading loading={this.state.loading_data } />
						{ filter }
						<IfQuestions levels={this.state.levels} output={this.state.output} />
					</Col>
				</Row>
			</Container>
		);
	}
}