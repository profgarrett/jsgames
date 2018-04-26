// @flow
import React from 'react';
import PropTypes from 'prop-types';
import type { Node } from 'react';

import { Breadcrumb, Col, Row } from 'react-bootstrap';

import IfLevelPlay from './IfLevelPlay';
import { ErrorBoundary, Message } from './../components/Misc';
import { IfLevelSchema } from './../../shared/IfGame';

import ForceLogin from './../components/ForceLogin';


import type { LevelType } from './IfTypes';


type PropsType = {
	match: Object
};
type StateType = {
	message: string,
	messageStyle: string,
	isLoading: boolean,
	isSaving: boolean,
	level: ?LevelType,
	selected_page_index: number,
	show_feedback: boolean,
	show_feedback_on: number,
	_id: number
};


export default class IfLevelPlayContainer extends React.Component<PropsType, StateType> {
	constructor(props: PropsType) {
		super(props);
		this.state = { 
			message: 'Loading data from server',
			messageStyle: '',
			isLoading: true,
			isSaving: false,
			level: null,
			selected_page_index: -1,
			show_feedback: false,
			show_feedback_on: 0,
			_id: this.props.match.params._id
		};
		(this: any).onSubmit = this.onSubmit.bind(this);
		(this: any).onChange = this.onChange.bind(this);
		(this: any).onViewFeedback = this.onViewFeedback.bind(this);
	}


	// Mark that the user has finished viewing the feedback.
	onViewFeedback(){
		this.setState({ show_feedback: false });
	}


	// Get an update of the user's input.
	// Changes is passed a json object with the updated values.
	onChange(json: Object) {
		if(typeof this.state.level === 'undefined' || this.state.level === null) 
			throw new Error('Invalid onChange of undefined IfLevelPlayContainer');
		
		// Don't accept any input if we are currently loading
		if(this.state.isLoading) return;

		const i = this.state.selected_page_index;
		let new_history_item = { created: new Date(), ...json };
		let history = [...this.state.level.pages[i].history, new_history_item];

		// Create a fresh page.
		let page_json = { ...this.state.level.pages[i].toJson()};
		let page = this.state.level.get_new_page(page_json);

		// Update fresh page with new values.
		page.updateUserFields({ ...page_json, ...json, history  });
		
		let level = new IfLevelSchema(this.state.level.toJson());
		level.pages[i] = page;

		this.setState({ level });
	}

	// Update the current page and send to the server for an update.
	onSubmit() {

		// Don't accept any input if we are currently loading
		if(this.state.isLoading) return;

		// Make sure that we have a level.		
		if(typeof this.state.level === 'undefined' || this.state.level === null) 
			throw new Error('Invalid onSubmit of undefined IfLevelPlayContainer');

		// Make sure that we don't already have a future page loaded in front of the current page.
		if( this.state.selected_page_index < this.state.level.pages.length-1 )
			throw new Error('current_page_i < this.state.level.pages.length-1 in IfLevelPlayContainer.onSubmit');

		let id = this.state.level._id, 
			level = this.state.level,
			current_page_i = this.state.selected_page_index,
			current_page = level.pages[current_page_i];
	


		// NDG 4/23/18.  DISABLED: FORCE SERVER VALIDATION FOR VALIDATION RULES.
		//
		// Validate.  Note that some pages will allow local validation, but others require posting
		// 	to the server.  This check is prior to submission to the server.
		// 	Note that solution_feedback rules require posting to the server. So, it's possible to 
		//	pass local validation, but fail server valiation.
		/*
		if (current_page.correct === false) {
			// Don't continue if we know that page.correct is false (null is ok)
			this.setState({
				message: 'You must submit the correct answer before continuing.',
				messageStyle: 'warning'
			});
			return;
		}
		*/

		// Make sure that the user has submitted something
		if(!current_page.client_has_answered()) {
			this.setState({
				message: 'You must provide an answer before continuing.',
				messageStyle: 'warning'
			});
			return;
		}

		// Show loading status.
		this.setState({ 
			message: 'Saving',
			messageStyle: '',
			show_feedback_on: current_page_i, // remember what page to show feedback on.
			show_feedback: false, // set to true after we get back the results from the server
			isLoading: true
		});

		// Don't set state if we were looking at something that doesn't require a review.
		const show_feedback = (
					current_page.type !== 'IfPageTextSchema' && 
					current_page.type !== 'IfPageChoiceSchema'
				);


		// Fire AJAX.
		fetch('/api/ifgame/level/'+ id, {
				method: 'post',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: level.toJsonString()
			})
			.then( (response: any): Object => response.json() )
			.then( (json: Object): LevelType => {
				if(json._error) throw new Error(json._error); 
				return new IfLevelSchema(json);
			})
			.then( (ifLevel: LevelType) => {
				if(ifLevel.completed) {
					this.context.router.history.push('/ifgame/level/'+ifLevel._id+'/score');
				} else {
					
					this.setState({ 
						selected_page_index: ifLevel.pages.length-1,
						level: ifLevel,
						show_feedback: show_feedback,
						message: ifLevel.pages[ifLevel.pages.length-1].correct === false ? 'You must submit the correct answer before continuing' : '',
						messageStyle: ifLevel.pages[ifLevel.pages.length-1].correct === false ? 'warning' : '',
						isLoading: false
					});
				}
			})
			.catch( (error: any) => {
				this.setState({ 
					level: null, 
					message: error.message,
					isLoading: false
				});
			});

	}



	componentDidMount() {
		let _id = this.props.match.params._id;

		// After the screen loads, fire off the initial request populate the level.
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


	render(): Node {
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

					<Message spinner={this.state.isLoading } message={this.state.message} style={this.state.messageStyle} />
					<ErrorBoundary>
					{ this.state.level ? <IfLevelPlay 
							level={this.state.level} 
							selected_page_index={this.state.selected_page_index }
							onSubmit={this.onSubmit}
							onChange={this.onChange}
							show_feedback={this.state.show_feedback}
							show_feedback_on={this.state.show_feedback_on}
							onViewFeedback={this.onViewFeedback}
							isLoading={this.state.isLoading}
						/> : '' }
					</ErrorBoundary>
				</Col>
			</Row>
		);
	}
}

IfLevelPlayContainer.contextTypes = {
	router: PropTypes.object.isRequired
};

