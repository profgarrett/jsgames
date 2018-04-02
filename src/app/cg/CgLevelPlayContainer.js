import React from 'react';
import PropTypes from 'prop-types';
//import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Col, Row, PageHeader, Button } from 'react-bootstrap';
//import { ChartGameQuestionModel } from '../../shared/ChartGame';

import CgLevelPlay from './CgLevelPlay';
import { Message, Loading } from './../components/Misc';
import { CgLevelSchema } from './../../shared/ChartGame';

export default class CgLevelPlayContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = { 
			message: 'Loading data from server',
			isLoading: true,
			isSaving: false,
			level: null,
			selected_page_index: null,
			_id: this.props.match.params._id
		};
		this.onSubmit = this.onSubmit.bind(this);
		this.onChange = this.onChange.bind(this);
	}

	// Get an update from a child item.  Update the state.
	onChange(level) {
		if(level.type !== 'CgLevelSchema')
			throw new Error('Invalid type ' + level.type + ' passed to CgLevelPlayContainer.onChange');

		this.setState({ level });
	}

	// Update the current page and goto next.
	// Later, we can also go back to the server and see if new pages should be created based off of previous data.
	// For now, just save the updated data structure to the server.
	onSubmit() {
		let id = this.state.level._id, 
			level = this.state.level,
			current_page_i = this.state.selected_page_index,
			current_page = level.pages[current_page_i];
		
		if(typeof this === 'undefined') {
			console.log(this);
			throw new Error('what');
		}

		let empty_field_check = 
			current_page.items.reduce(
				(accum, item) => accum || (typeof item.user_answer !== 'undefined' && item.user_answer === null), false);

		// Validate.  Don't continue until all numbers on the current page are filled in.
		if (empty_field_check) {
			this.setState({
				message: 'Please fill in all answers before submitting'
			});
			return;
		}		


		if( current_page_i < this.state.level.pages.length-1 ) {
			// We are not yet on the last page.  Just move forward.
			this.setState({ selected_page_index: current_page_i + 1 });

		} else {
			// We are on the last page.  


			// Show loading status.
			this.setState({ 
				message: 'Saving',
				isLoading: true
			});

			// Fire AJAX.
			fetch('/api/chartgame/level/'+ id, {
					method: 'post',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(level)
				})
				.then( response => response.json() )
				.then( json => {
					if(json._error) throw new Error(json._error); 
					return new CgLevelSchema(json);
				})
				.then( cgLevel => {

					if(cgLevel.completed)
						this.context.router.history.push('/chartgame/level/'+cgLevel._id+'/score');
					else
						this.setState({ 
							selected_page_index: current_page_i+1,
							level: cgLevel,
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
	}

	componentDidMount() {
		let _id = this.props.match.params._id;

		fetch('/api/chartgame/level/'+_id)
			.then( response => response.json() )
			.then( json => new CgLevelSchema(json) )
			.then( cgLevel => {
				let latest_page_i = cgLevel.pages.length-1;

				this.setState({
					level: cgLevel,
					selected_page_index: latest_page_i,
					message: '',
					isLoading: false
				});
			})
			.catch( error => {
				this.setState({ 
					level: null,
					message: 'Error: ' + error._error,
					isLoading: false
				});
			});
	}

	render() {
		return (
			<Row>
				<Col>
				<PageHeader>Play a Chart Game</PageHeader>
				<Message message={this.state.message} />
				<Loading loading={this.state.isLoading } />
				{ this.state.level ? <CgLevelPlay 
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
CgLevelPlayContainer.propTypes = {
	match: PropTypes.object.isRequired
};
CgLevelPlayContainer.contextTypes = {
	router: PropTypes.object.isRequired
};