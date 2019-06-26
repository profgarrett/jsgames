//@flow
import React from 'react';
import { Container, ButtonToolbar, ButtonGroup, Row, Col, Breadcrumb, DropdownButton, Dropdown, Button  } from 'react-bootstrap';
import { IfLevels, IfLevelSchema } from './../../shared/IfGame';

import type { Node } from 'react';


// onChagne will be passed an object with the filter values includ3ed.
type PropsType = {
	onChange: (Object) => void,
	onReady: () => void
};

type ContainerStateType = {
	// Status.
	loading_data: boolean,

	// Filters. Will be passed to onChange.
	code: string,
	codes: Array<string>,

	pagetype: string, 
	pagetypes: Array<string>,

	section: number,
	sections: Array<any>,

	user: number,
	users: Array<any>
};

export default class Filter extends React.Component<PropsType, ContainerStateType> {
	constructor(props: any) {
		super(props);
		this.state = { 
			loading_data: true,

			code: 'tutorial',
			codes: IfLevels.map( l => l.code ),

			pagetype: 'IfPageChoiceSchema',
			pagetypes: [
				'IfPageNumberAnswerSchema',
				'IfPageChoiceSchema', 
				'IfPageHarsonsSchema',
				'IfPageFormulaSchema',
				'IfPageFormulaSchema|IfPageHarsonsSchema',
				'IfPageParsonsSchema'],

			section: -1,
			sections: [], // loads to an array from server.

			user: -1,
			users: [], // loads to array

		};
		(this: any).loadFilters = this.loadFilters.bind(this);

		(this: any).handleCodeFilterChange = this.handleCodeFilterChange.bind(this);
		(this: any).handleIdSectionFilterChange = this.handleIdSectionFilterChange.bind(this);
		(this: any).handlePageTypeFilterChange = this.handlePageTypeFilterChange.bind(this);
		(this: any).handleIdUserFilterChange = this.handleIdUserFilterChange.bind(this);
		(this: any).handleSubmit = this.handleSubmit.bind(this);
	}

	componentDidMount() {
		this.loadFilters();
	}
	handleCodeFilterChange(value: string) {
		this.setState({ code: value});
	}
	handlePageTypeFilterChange(value: string) {
		this.setState({ pagetype: value});
	}
	handleIdSectionFilterChange(value: string) {
		this.setState({ section: parseInt(value,10)});
	}
	handleIdUserFilterChange(value: string) {
		this.setState({ user: parseInt(value, 10)});
	}

	handleSubmit() {
		const filter = {
			code: this.state.code,
			pagetype: this.state.pagetype,
			section: this.state.section,
			user: this.state.user
		};
		this.props.onChange(filter);
	}


	// Load the filter values.
	loadFilters() {
		this.setState({ loading_data: true });
		const newState = { ...this.state, loading_data: false };

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
					newState.section = -1; // json[0].idsection; default to no section.
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
							newState.user = -1; // json[0].iduser; default to all users
						} else {
							newState.users = [];
						}

						// Now update state.
						this.setState(newState); 

						this.props.onReady();

					})
					.catch( error => {
						console.log(error);
					});

			})
			.catch( error => {
				console.log(error);
			});
	}



	render(): Node {

		// Build filter datasets, adding a -1 option for all.


		// If we are still loading data, don't show filter options.
		if(this.state.loading_data) return <div>Loading filter</div>;


		// setup params 
		const levels = ['All'];
		IfLevels.map(l => levels.push(l.code));

		const sections = [{ idsection: -1, code: 'All' }];
		if(this.state.sections !== null) 
			this.state.sections.map( section => sections.push(section));

		const users = [{ iduser: -1, username: 'All'}];
		if(this.state.users !== null) 
				this.state.users.map( user => users.push(user));

		const section_title = this.state.section === -1 || this.state.section === null
				? 'Pick a section' 
				: 'Section: ' + this.state.sections.filter( 
						s => s.idsection === this.state.section )[0].code;

		const user_title = this.state.user === -1 || this.state.user === null
				? 'Pick a user' 
				: 'User: ' + this.state.users.filter( 
						s => s.iduser === this.state.user )[0].username;

		
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
						onSelect={this.handlePageTypeFilterChange}
						variant='primary' 
						title={this.state.pagetype}
						key='select_output' id='select_output'>
							{ this.state.pagetypes.map( (option,i) => 
								<Dropdown.Item key={'select_pagetype_dropdownitem'+i} 
								eventKey={option}>{option}</Dropdown.Item> )}
				</DropdownButton>
				</ButtonGroup>


				<ButtonGroup>
				<Button
						variant='primary'
						onClick={ () => this.handleSubmit()}
						>Refresh</Button>
				</ButtonGroup>
				</ButtonToolbar>
			</form>
			);
			

		return filter;
	}
}