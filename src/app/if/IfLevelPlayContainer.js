// @flow
import React from 'react';
import PropTypes from 'prop-types';
import type { Node } from 'react';

import Container from 'react-bootstrap/Container';
import { Breadcrumb, Col, Row } from 'react-bootstrap';

import { IfLevelSchema } from './../../shared/IfGame';

import IfLevelPlay from './IfLevelPlay';

import { ErrorBoundary, Message } from './../components/Misc';
import ForceLogin from './../components/ForceLogin';
import Feedback from './../components/Feedback';

type PropsType = {
	match: Object
};
type StateType = {
	message: string,
	messageStyle: string,
	isLoading: boolean,
	isSaving: boolean,
	level: ?IfLevelSchema,
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
		(this: any).onChange = this.onChange.bind(this);
		(this: any).onNext = this.onNext.bind(this);
		(this: any).onViewFeedback = this.onViewFeedback.bind(this);
	}


	// Mark that the user has finished viewing the feedback.
	onViewFeedback(){
		this.setState({ show_feedback: false });
	}


	// Get an update of the user's input.
	// Changes is passed a json object with the updated values.
	onChange(json: Object) {

		if(typeof this.state.level === 'undefined' || this.state.level === null) {
			throw new Error('Invalid onChange of undefined IfLevelPlayContainer');

		} else {
			// Don't accept any input if we are currently loading
			let level = this.state.level;

			if(this.state.isLoading) return;

			const i = this.state.selected_page_index;
			//let new_history_item = { created: new Date(), ...json };
			//let history = [...this.state.level.pages[i].history, new_history_item];

			// Create a fresh page.
			let page_json = { ...level.pages[i].toJson()};
			let page = level.get_new_page(page_json);

			// Update fresh page with new values.
			page.updateUserFields({ ...page_json, ...json });
			
			level = new IfLevelSchema(level.toJson());
			level.pages[i] = page;

			this.setState({ level });
		}
	}


	// Update the current page and send to the server for an update.
	// Next is true when we want to submit and get the next page. It's false when 
	// we just want to test the current page, and if wrong, then not continue.
	onNext( validate_only: boolean ) {
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
	

		// If the last page is a text-only one, update last page to show that it's been viewed.
		if(current_page.type === 'IfPageTextSchema') {
			current_page.toIfPageTextSchema().client_read = true;
		}

		// Make sure that the user has submitted something
		if(!current_page.client_has_answered() && current_page.correct_required) {
			this.setState({
				message: 'You must provide an answer before continuing.',
				messageStyle: 'warning'
			});
			return;
		}

		// Show loading status.
		this.setState({ 
			message: '',
			messageStyle: '',
			show_feedback_on: current_page_i, // remember what page to show feedback on.
			show_feedback: false, // set to true after we get back the results from the server
			isLoading: true
		});

		// User is allowed to just check the answer.  If they do, set URL
		// to pass this behavior to the server.
		const url = '/api/ifgame/level/'+id+'?validate_only=' + (validate_only ? '1': '0'); 

		// Fire AJAX.
		fetch(url, {
				method: 'post',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: level.toJsonString()
			})
			.then( (response: any): Object => response.json() )
			.then( (json: Object): IfLevelSchema => {
				if(json._error) throw new Error(json._error); 
				return new IfLevelSchema(json);
			})
			.then( (ifLevel: IfLevelSchema) => {
				const page = ifLevel.pages[current_page_i];

				// Test to see if we're at the end of the level. If so, go to the reviw screen.
				if(ifLevel.completed) { 
					if( ifLevel.show_score_after_completing ) {
						this.context.router.history.push('/ifgame/level/'+ifLevel._id+'/score');
					} else {
						this.context.router.history.push('/ifgame');;
					}
					return;
				} 

				// Did we try to validate? If so, show feedback no matter what.
				if(validate_only) {
					// Show feedback.
					this.setState({
						isLoading: false,
						level: ifLevel,
						show_feedback: true
					});
					return;
				} 

				// User clicked on 'next'.
				// Go back to the top of the page.
				window.scrollTo(0,0);


				// Does the submitted page *not* require feedback to be shown?
				// If not, set index to the latest page.
				if(!page.show_feedback_on) {
					this.setState({
						isLoading: false,
						level: ifLevel,
						selected_page_index: ifLevel.pages.length-1,
					});
					return;
				}

				// If !correct_required, then don't show feedback. Only show if user hit feedback.
				if(!page.correct_required && page.code === 'tutorial' ) {
					this.setState({
						isLoading: false,
						level: ifLevel,
						selected_page_index: ifLevel.pages.length-1,
					});
					return;
				}

				// Show feedback
				this.setState({ 
					isLoading: false,
					level: ifLevel,
					selected_page_index: ifLevel.pages.length-1,
					show_feedback: true
				});
				
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
		// <h3>{ this.state.level ? this.state.level.title : '' }</h3> 
		const crumbs = this.state.level ?
			<Breadcrumb>
				<Breadcrumb.Item href={'/ifgame/'}>Home</Breadcrumb.Item>
				<Breadcrumb.Item active>{ this.state.level.title }</Breadcrumb.Item>
			</Breadcrumb>
			: <span></span>;

		return (
			<Container fluid='true'>
				<Row>
					<Col>
						<ForceLogin />
						{ crumbs }
						

						<Message spinner={this.state.isLoading } message={this.state.message} style={this.state.messageStyle} />
						<ErrorBoundary>
						{ !this.state.level ? '' :
							<div id='iflevelplaycontainer'>
								<IfLevelPlay 
									level={this.state.level} 
									selected_page_index={this.state.selected_page_index }
									onNext={ ()=>this.onNext(false) }
									onValidate={ ()=>this.onNext(true) }
									onChange={ this.onChange }
									show_feedback={this.state.show_feedback}
									show_feedback_on={this.state.show_feedback_on}
									onViewFeedback={this.onViewFeedback}
									isLoading={this.state.isLoading}
								/>
								<Feedback
									data={this.state.level}
									code={this.state.level.code}
								/>
							</div>
						}
						</ErrorBoundary>
					</Col>
				</Row>
			</Container>
		);
	}
}

IfLevelPlayContainer.contextTypes = {
	router: PropTypes.object.isRequired
};

