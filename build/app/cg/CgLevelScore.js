import React from 'react';
import PropTypes from 'prop-types';
//import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Button } from 'react-bootstrap';
import CgBarChart from './CgBarChart';
import CgQuestion from './CgQuestion';



class CgLevelScoreGrade extends React.Component {
	render() {
		let s = this.props.score;

		return (
			<div>
				<h3>Score Summary</h3>
				Earned { s.correct } of { s.attempted}.  Final streak was { s.streak }.
			</div>
		);
	}
}
CgLevelScoreGrade.propTypes = {
	score: PropTypes.object.isRequired
};


export default class CgLevelScore extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		let level = this.props.level;
		let items = [];

		const CgTypes = {
			'CgBarChartSchema': CgBarChart,
			'CgQuestionSchema': CgQuestion
		};

		level.pages.forEach( (page, p_index) => {
			page.items.forEach( (item, i_index) => {
				items.push(
					React.createElement( CgTypes[item.type], {
						key: p_index + '.' + i_index,
						item: item,
						readOnly: true,
						onChange: this.handleChange
					})
				);
			});
		});

		return (
			<div>
				<CgLevelScoreGrade score={level.score} />
				{ items }
			</div>
		);
	}
}
CgLevelScore.propTypes = {
	level: PropTypes.object.isRequired
};
