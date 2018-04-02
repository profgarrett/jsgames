import React from 'react';
import PropTypes from 'prop-types';
//import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Button } from 'react-bootstrap';
import CgBarChart from './CgBarChart';
import CgQuestion from './CgQuestion';



class CgLevelPlayScore extends React.Component {
	render() {
		let s = this.props.score;

		return (
			<div>
				Results: { s.correct } of { s.attempted }<br/>
				Streak: { s.streak }<br/>
				String: { s.toString() }<br/>				
			</div>
		);
	}
}
CgLevelPlayScore.propTypes = {
	score: PropTypes.object.isRequired
};


export default class CgLevelPlay extends React.Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	// Signal to the container that this page has been finished.
	handleSubmit(e) {
		e.preventDefault();
		this.props.onSubmit();
	}


	// On an update of a question, 
	//		clone the question, updating to add the user answer.
	handleChange(question, new_value) {
		//let clone = this.props.level.clone();
		let current_page = this.props.level.pages[this.props.selected_page_index];
		let new_items = current_page.items.map( 
			q => (q === question) ? question.clone({user_answer: new_value}) : q 
		);
		current_page.items = new_items;
		//let new_page = current_page.clone({ items: new_items });
		//let new_level = this.props.level.clone({ })
		this.props.onChange(this.props.level);
	}



	render() {
		let level = this.props.level;
		let current_page = level.pages[this.props.selected_page_index];
		let items = [];

		const CgTypes = {
			'CgBarChartSchema': CgBarChart,
			'CgQuestionSchema': CgQuestion
		};

		current_page.items.forEach( (item, index) => {
			items.push(
				React.createElement( CgTypes[item.type], {
					key: index,
					item: item,
					readOnly: false,
					onChange: this.handleChange
				})
			);
		});

		return (
			<div>
				<CgLevelPlayScore score={level.score} />
				<form name='c' onSubmit={this.handleSubmit}>
					{ items }
					<Button type='submit'>Submit</Button>
				</form>
			</div>
		);
	}
}
CgLevelPlay.propTypes = {
	level: PropTypes.object.isRequired,
	selected_page_index: PropTypes.number.isRequired,
	onChange: PropTypes.func.isRequired,
	onSubmit: PropTypes.func.isRequired
};
