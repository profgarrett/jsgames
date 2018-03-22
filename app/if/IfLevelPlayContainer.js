import React from 'react';
import PropTypes from 'prop-types';
import { Breadcrumb, Col, Row } from 'react-bootstrap';

import IfLevelPlay from './IfLevelPlay';
import { Message, Loading } from './../components/Misc';
import { IfLevelSchema, IfLevels } from './../../shared/IfGame';

import ForceLogin from './../components/ForceLogin';


export default class IfLevelPlayContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = { 
			message: 'Loading data from server',
			messageStyle: '',
			isLoading: true,
			isSaving: false,
			level: null,
			selected_page_index: null,
			_id: this.props.match.params._id
		};
		this.onSubmit = this.onSubmit.bind(this);
		this.onChange = this.onChange.bind(this);
	}

	// Get an update of the user's input.
	onChange(client_f) {
		const i = this.state.selected_page_index;

		// Update level by replacing expired objects.
		let new_level = this.state.level.clone(); // clone level object
		let new_page = this.state.level.pages[i].clone( { client_f }); // clone page and update result
		new_page.parse(); // update this.correct.
		new_level.pages[i] = new_page;  // replace old page with new cloned page.

		this.setState({ level: new_level });
	}

	// Update the current page and send to the server for an update.
	onSubmit() {
		let id = this.state.level._id, 
			level = this.state.level,
			current_page_i = this.state.selected_page_index,
			current_page = level.pages[current_page_i];
		
		console.assert(typeof this !== 'undefined', 'Invalid this passed');

		// Validate.  
		if (current_page.client_f === null) {
			// Don't continue until all numbers on the current page are filled in.
			this.setState({
				message: 'Please fill in a formula before submitting',
				messageStyle: 'danger'
			});
			return;
		} else if (current_page.correct === false) {
			// Don't continue if we page.correct is false (null is ok)
			this.setState({
				message: 'You must submit the correct answer before continuing',
				messageStyle: 'warning'
			});
			return;
		} else {
			// Continue!
			if(this.state.message != '') {
				this.setState({
					message:'',
					messageStyle: ''
				});
			}
		}

		// Make sure that we don't already have a future page loaded in front of the current page.
		if( current_page_i < this.state.level.pages.length-1 ) {
			throw new Error('current_page_i < this.state.level.pages.length-1 in IfLevelPlayContainer.onSubmit');
		} 


		// We are on the last page.  

		// Show loading status.
		this.setState({ 
			message: 'Saving',
			isLoading: true
		});

		// Fire AJAX.
		fetch('/api/ifgame/level/'+ id, {
				method: 'post',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(level)
			})
			.then( response => response.json() )
			.then( json => {
				if(json._error) throw new Error(json._error); 
				return new IfLevelSchema(json);
			})
			.then( ifLevel => {

				if(ifLevel.completed)
					this.context.router.history.push('/ifgame/level/'+ifLevel._id+'/score');
				else
					this.setState({ 
						selected_page_index: current_page_i+1,
						level: ifLevel,
						message: '',
						isLoading: false
					});
			})
			.catch( error => {
				this.setState({ 
					level: null, 
					message: error.message,
					isLoading: false
				});
			});

	}



	componentDidMount() {
		let _id = this.props.match.params._id;

		fetch('/api/ifgame/level/'+_id, {
				credentials: 'include'
			})
			.then( response => response.json() )
			.then( json => new IfLevelSchema(json) )
			.then( ifLevel => {
				let latest_page_i = ifLevel.pages.length-1;

				this.setState({
					level: ifLevel,
					selected_page_index: latest_page_i,
					message: '',
					isLoading: false
				});
			})
			.catch( error => {
				this.setState({ 
					level: null,
					message: 'Error: ' + error.message,
					isLoading: false
				});
			});
	}

	render() {
		//<Breadcrumb.Item href='/'>Home</Breadcrumb.Item>-->
		const crumbs = this.state.level ?
			<Breadcrumb>
				<Breadcrumb.Item href={'/ifgame/'+this.state.level.code}>List</Breadcrumb.Item>
				<Breadcrumb.Item active>{ this.state.level.title }</Breadcrumb.Item>
			</Breadcrumb>
			: <span></span>;

		return (
			<Row>
				<Col>
					<ForceLogin />
					{ crumbs }
					<h3>{ this.state.level ? this.state.level.title : '' }</h3>

					<Message message={this.state.message} style={this.state.messageStyle} />
					<Loading loading={this.state.isLoading } />
					{ this.state.level ? <IfLevelPlay 
							level={this.state.level} 
							selected_page_index={this.state.selected_page_index }
							onSubmit={this.onSubmit}
							onChange={this.onChange}
						/> : '' }
				</Col>
			</Row>
		);
	}
}
IfLevelPlayContainer.propTypes = {
	match: PropTypes.object.isRequired
};
IfLevelPlayContainer.contextTypes = {
	router: PropTypes.object.isRequired
};