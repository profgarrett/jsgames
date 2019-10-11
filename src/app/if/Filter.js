// @flow
import React from 'react';
import { ButtonToolbar, ButtonGroup, DropdownButton, Dropdown, Button  } from 'react-bootstrap';
import { IfLevels } from './../../shared/IfLevelSchema';
import { getUserFromBrowser } from './../components/Authentication';

import 'url-search-params-polyfill';

import type { Node } from 'react';


// onChagne will be passed an object with the filter values includ3ed.
type PropsType = {
	disabled: boolean, // provide a way to make it readonly, such as when data is being loaded externally.
	onChange: (Object) => void,
	onReady: (Object) => void,
	defaults: Object,
	filters: Object
};

/* Filters expects the following 
{ 
	'sections': null   <-- initial set of possible options.  Use null if wanting filter to grab values.
	'randoms': ['a', 'b', 'c']  <-- initial set with specified list. 
}
*/

type ContainerStateType = {
	// Status.
	filters: Object,
	selection: Object,
	loading: Object

};

export default class Filter extends React.Component<PropsType, ContainerStateType> {
	constructor(props: any) {
		super(props);

		const filters = { ...this.props.filters };
		const selection = { ...this.props.defaults };

		// Initialize selection to make sure that there is a value for each item.
		// Empty array is uninitialized.
		for(let filter in filters) {
			if(filters.hasOwnProperty(filter)) {
				if( typeof selection[filter] === 'undefined' ) {
					selection[filter] = '';
				}
			}
			if(typeof filters[filter] !== 'object' || typeof filters[filter].slice !== 'function') 
				throw new Error('Filter needs to receive arrays for all args. Use empty for unset');
		}

		// Populate levels
		if(typeof filters.levels !== 'undefined') {
			filters.levels = IfLevels.map( l => { return { value: l.code, label: l.title }; });
			filters.levels.unshift({ value:'', label: 'All'}); // add the all option
		}

		// Populate page types
		if(typeof filters.pagetypes !== 'undefined') {
			filters.pagetypes = [
				{ value: 'IfGameNumberAnswerSchema', label:'Numbers' },
				{ value: 'IfPageChoiceSchema',  label:'Choice' },
				{ value: 'IfPageHarsonsSchema', label:'Harsons' },
				{ value: 'IfPageFormulaSchema', label:'Formula' },
				{ value: 'IfPageFormulaSchema|IfPageHarsonsSchema', label:'Harsons/Formula' },
				{ value: 'IfPageParsonsSchema', label:'Parsons' }
				];
		}

		this.state = {
			filters: filters,
			selection: selection,
			loading: []
		};

		(this: any).loadFilters = this.loadFilters.bind(this);
		(this: any).onChange = this.onChange.bind(this);
		(this: any).handleSubmit = this.handleSubmit.bind(this);
	}

	componentDidMount() {
		this.loadFilters();
	}

	onChange(key: any, e: any) {
		const label = e.target.innerText;
		const name = e.target.name.split('_')[0]; // grab first half of "field_1"
		const newState = { 'selection': { ...this.state.selection} };

		// Find matching value from the label.
		let value = this.state.filters[name].filter( item => item.label === label);
		if(value.length !== 1) throw new Error('Invalid key for Filter.onChange '+label);

		newState.selection[name] = value[0].value;
		
		this.setState(newState);
	}


	getFilter(): Object {
		const values = {};

		for(let filter in this.state.filters) {
			if(this.state.filters.hasOwnProperty(filter)) {
				values[filter] = this.state.selection[filter];
			}
		}

		return values;
	}


	handleSubmit() {
		this.props.onChange(this.getFilter());
	}


	// Load the filter values.
	loadFilters() {
		const user = getUserFromBrowser();

		// Load section filter.
		if( this.state.filters.sections ) {
			// Remember that we're loading this.
			this.setState((oldState) => {
				const loading = oldState.loading.slice();
				loading.push('sections');
				return { loading: loading };
			});

			// Request.
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
					this.setState((oldState) => {
						// Load new data.

						// remove loading info
						const loading = oldState.loading.filter( w => w !== 'sections');

						// Map the new data.
						const sections = json.map( j => { return { label: j.title, value: j.idsection }; });
						sections.unshift({ value:'', label: 'All'}); // add the all option

						// See if there is a matching default from the props. If so, set.
						// Note truthy comparison for "1" == 1 issues.
						const selection = { ...oldState.selection };
						if( typeof this.props.defaults['sections'] !== 'undefined') {
							if(sections.filter( s => s.value == this.props.defaults['sections']).length !== 1)
								throw new Error('Invalid section information passed to Filter');
							selection['sections'] = this.props.defaults['sections'];
						}

						return {
							filters: {...oldState.filters, sections: sections },
							loading: loading,
							selection: selection
						};
					}, () => { 	
						// Are we ready to notify that this is loaded?  
						if(this.state.loading.length === 0) {
							this.props.onReady(this.getFilter());
						}
					});
				})
				.catch( error => {
					console.log(error);
				});
		}


		// Load user filter.
		if( this.state.filters.users ) {
			// Remember that we're loading this.
			this.setState((oldState) => {
				const loading = oldState.loading.slice();
				loading.push('users');
				return { loading: loading };
			});

			// Request.
			fetch('/api/ifgame/users/', {
					method: 'get',
					credentials: 'include',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					}
				})
				.then( response => response.json() )
				.then( json => {
					this.setState((oldState) => {
						// Load new data.

						// remove loading info
						const loading = oldState.loading.filter( w => w !== 'users');

						// Map the new data.
						const users = json.map( j => { return { label: j.username, value: j.iduser }; });
						users.unshift({ value:'', label: 'All'}); // add the all option

						// See if there is a matching default from the props. If so, set.
						// Note truthy comparison for "1" == 1 issues.
						const selection = { ...oldState.selection };
						if( typeof this.props.defaults['users'] !== 'undefined') {
							if(users.filter( s => s.value == this.props.defaults['users']).length !== 1)
								throw new Error('Invalid user information passed to Filter');
							selection['users'] = this.props.defaults['users'];
						}

						return {
							filters: {...oldState.filters, users: users },
							loading: loading,
							selection: selection
						};
					}, () => { 	
						// Are we ready to notify that this is loaded?  
						if(this.state.loading.length === 0) {
							this.props.onReady(this.getFilter());
						}
					});
				})
				.catch( error => {
					console.log(error);
				});

		}
	}



	render(): Node {

		// Build filter datasets, adding a -1 option for all.


		// If we are still loading data, don't show filter options.
		if(this.state.loading.length > 0) return <div>Loading filter</div>;

		const buttons = [];
		let title = '';
		let button = null;

		// Build buttons for each filter.
		for(let filter in this.state.filters) {
			if(this.state.filters.hasOwnProperty(filter)) {

				// Find the matching title for the selected item (if any)
				// Note truthy == instead of true === due to conversion of int to string.
				const matching_items = this.state.filters[filter].filter( 
									f => f.value == this.state.selection[filter]);

				title = (this.state.selection[filter] == '' || matching_items.length === 0)
							? filter.substr(0,1).toUpperCase() + filter.substr(1)
							: filter.substr(0,1).toUpperCase() + filter.substr(1, filter.length-2) + ' ' + matching_items[0].label;
				
				button = <DropdownButton 
						id={'button_filter_'+filter}
						name ={'button_filter_'+filter}
						disabled={ this.props.disabled } 
						onSelect={ this.onChange }
						variant='primary' 
						title= { title }
						key={'select_code_'+filter} >
							{ this.state.filters[filter].map( (value,i) => 
								<Dropdown.Item
									key={'select_code_dropdownitem_'+filter+i} 
									eventKey={value.code}
									name={filter +'_'+i}
									>{value.label}
								</Dropdown.Item> 
							)}
				</DropdownButton>;
				buttons.push(button);
			}
		}
		
		const filter = (
			<form name='c' >
				<ButtonToolbar aria-label="Toolbar for filter">
				<ButtonGroup>
				
				{ buttons }
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
			
		return filter;
	}
}