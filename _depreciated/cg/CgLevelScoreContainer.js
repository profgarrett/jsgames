import React from 'react';
import PropTypes from 'prop-types';
//import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { PageHeader, Button } from 'react-bootstrap';
//import { ChartGameQuestionModel } from '../../shared/ChartGame';
import { Link } from 'react-router-dom';

import CgLevelScore from './CgLevelScore';
import { Message, Loading } from './../components/Misc';
import { CgLevelSchema } from './../../shared/ChartGame';

export default class CgLevelScoreContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = { 
			message: 'Loading data from server',
			isLoading: true,
			level: null,
			_id: this.props.match.params._id
		};
	}

	componentDidMount() {
		let _id = this.props.match.params._id;

		fetch('/api/chartgame/level/'+_id)
			.then( response => response.json() )
			.then( json => new CgLevelSchema(json) )
			.then( cgLevel => {
				this.setState({
					level: cgLevel,
					message: '',
					isLoading: false
				});
			})
			.catch( error => {
				this.setState({ 
					level: null,
					message: 'Error: ' + error,
					isLoading: false
				});
			});
	}

	render() {
		return (
			<div>
				<PageHeader>Chart Game Scoring</PageHeader>
				<Link to='/chartgame'>Back to other levels</Link>
				<Message message={this.state.message} />
				<Loading loading={this.state.isLoading } />
				{ this.state.level ? <CgLevelScore level={this.state.level} /> : '' }
			</div>
		);
	}
}
CgLevelScoreContainer.propTypes = {
	match: PropTypes.object.isRequired
};
