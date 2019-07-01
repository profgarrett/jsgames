//@flow
import React from 'react';
import { ButtonToolbar, ButtonGroup, DropdownButton, Dropdown, Button  } from 'react-bootstrap';
import { IfLevels } from './../../shared/IfGame';

import type { Node } from 'react';


// onChagne will be passed an object with the filter values includ3ed.
type PropsType = {
	disabled: boolean, // provide a way to make it readonly, such as when data is being loaded externally.
	onChange: (Object) => void,
	onReady: () => void,
	defaults: Object
};

type ContainerStateType = {
	// Status.
	loading_data: boolean, // are we loading the filter data?

	// Filters. Will be passed to onChange.
	code: string,
	codes: Array<Object>,

	pagetype: string, 
	pagetypes: Array<string>,

	idsection: string, // note: this is a FK for the section's PK
	sections: Array<any>,

	iduser: string, // note: this is ID, not username.
	users: Array<any>
};

export default class Filter extends React.Component<PropsType, ContainerStateType> {
	constructor(props: any) {
		super(props);
		const defaults = this.props.defaults || {};

		this.state = { 
			loading_data: true,

			code: defaults.code || '',
			codes: IfLevels.map( l => {return { code: l.code, label: l.label }; }),

			pagetype: 'IfPageFormulaSchema|IfPageHarsonsSchema',
			pagetypes: [
				'IfPageNumberAnswerSchema',
				'IfPageChoiceSchema', 
				'IfPageHarsonsSchema',
				'IfPageFormulaSchema',
				'IfPageFormulaSchema|IfPageHarsonsSchema',
				'IfPageParsonsSchema'],

			idsection: '',
			sections: [], // loads to an array from server.

			iduser: '',
			users: [], // loads to array

		};
		(this: any).loadFilters = this.loadFilters.bind(this);
		(this: any).getFilter = this.getFilter.bind(this);
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
		this.setState({ idsection: value});
	}
	handleIdUserFilterChange(value: string) {
		this.setState({ iduser: value });
	}

	getFilter(): Object {
		return {
			code: this.state.code,
			pagetype: this.state.pagetype,
			idsection: this.state.idsection,
			iduser: this.state.iduser
		};
	}

	handleSubmit() {
		this.props.onChange(this.getFilter());
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
					newState.idsection = ''; // Default to no section.
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
						newState.disabled = false;
						if( json.length > 0) {
							newState.users = json;
							newState.iduser = ''; //  default to all users
						} else {
							newState.users = [];
						}

						// Now update state.
						this.setState(newState); 

						this.props.onReady(this.getFilter());

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
		const levels = [{ code: '', label: 'All'}];
		IfLevels.map(l => levels.push({ code: l.code, label: l.label }));

		const sections = [{ idsection: '', code: 'All' }];
		if(this.state.sections !== null) 
			this.state.sections.map( section => sections.push(section));

		const users = [{ iduser: '', username: 'All'}];
		if(this.state.users !== null) 
				this.state.users.map( user => users.push(user));


		const code_title = this.state.code === '' ? 'All Levels' : this.state.code;

		const section_title = this.state.idsection === '' 
				? 'Pick a section' 
				: 'Section: ' + this.state.sections.filter( 
						s => s.idsection == this.state.idsection )[0].code; // note: truthy for 4=="4"

		const user_title = this.state.iduser === '' 
				? 'Pick a user' 
				: 'User: ' + this.state.users.filter( 
						s => s.iduser == this.state.iduser )[0].username; // note: truthy for 4=="4"

		
		const filter = (
			<form name='c' >
				<ButtonToolbar>
				<ButtonGroup>
				<DropdownButton 
						disabled={ this.props.disabled } 
						onSelect={this.handleCodeFilterChange}
						variant='primary' 
						title= {code_title} 
						key='select_code' id='select_code'>
							{ levels.map( (level,i) => 
								<Dropdown.Item
									key={'select_code_dropdownitem'+i} 
									eventKey={level.code}>{level.label}
								</Dropdown.Item> 
							)}
				</DropdownButton>

				<DropdownButton 
						disabled={ this.props.disabled } 
						onSelect={this.handleIdSectionFilterChange}
						variant='primary' 
						title= {section_title}
						key='select_section' id='select_section'>
							{ sections.map( (section,i) => 
								<Dropdown.Item key={'select_section_dropdownitem'+i} 
								eventKey={section.idsection}>{section.code}</Dropdown.Item> )}
				</DropdownButton>

				<DropdownButton 
						disabled={ this.props.disabled } 
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
				<Button
						disabled={ this.props.disabled } 
						variant='primary'
						onClick={ () => this.handleSubmit()}
						>Refresh</Button>
				</ButtonGroup>
				</ButtonToolbar>
			</form>
			);
			
			/*
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

*/

		return filter;
	}
}