import React from 'react';
import PropTypes from 'prop-types';

import CgLevelList from './CgLevelList';

import { PageHeader, Row, Col, Well, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { Message, Loading } from './../components/Misc';
import { CgLevelSchema } from './../../shared/ChartGame';



class CgLevelInsert extends React.Component {
	render() {
		return (
			<Button onClick={this.props.on} disabled={ this.props.disabled } >
				Create a new '{ this.props.type }' game
			</Button>
		);
	}
}
CgLevelInsert.propTypes = {
	type: PropTypes.string.isRequired,
	on: PropTypes.func.isRequired,
	disabled: PropTypes.bool.isRequired
};


export default class CgLevelListContainer extends React.Component {

	constructor(props) {
		super(props);
		this.state = { 
			message: 'Loading data from server',
			message_style: 'info',
			isLoading: true,
			levels: []
		};
		this.insertGame = this.insertGame.bind(this);
	}

	componentDidMount() {
		
		fetch('/api/chartgame/level/')
			.then( response => response.json() )
			.then( json => {
				let cgLevels = json.map( j => new CgLevelSchema(j) );
				this.setState({
					levels: cgLevels,
					message: '',
					message_style: 'info',
					isLoading: false
				});
			})
			.catch( error => {
				this.setState({ 
					levels: [],
					message: 'Error: ' + error,
					message_style: 'alert',
					isLoading: false
				});
			});
	}

	insertGame(type) {
		//alert(1 + type);
		this.setState({ isLoading: true });
		fetch('/api/chartgame/level', { method: 'POST' })
			.then( response => response.json() )
			.then( json => new CgLevelSchema(json) )
			.then( new_level => this.setState( prevState => ({ levels: [...prevState.levels, new_level]	})) )
			.catch( error => {
				console.log(error);
				this.setState({ message: error });
			}).then( () => this.setState({ isLoading: false }));
	}

	render() {

		return (
			<div>
			<Row>
				<Col xs={12}>
					<PageHeader>Chart Game List</PageHeader>
					<Well>
						This chart game tests your ability to read data and identify chart types.
					</Well>
				</Col>
			</Row>
			<Row>
				<Col xs={8}>
					<Message message={this.state.message} style={this.state.message_style} />
					<Loading loading={this.state.isLoading } />
					<CgLevelList levels={this.state.levels} />
				</Col>
				<Col xs={4}>
					<CgLevelInsert type='Test' on={this.insertGame} disabled={this.state.isLoading} />
				</Col>
			</Row>
			</div>
		);
	}
}