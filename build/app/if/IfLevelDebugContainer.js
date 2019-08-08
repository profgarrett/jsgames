import React from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col, Breadcrumb, Button  } from 'react-bootstrap';

import IfLevelDebug from './IfLevelDebug';
import { Message, Loading } from './../components/Misc';

import { IfLevelSchema } from './../../shared/IfGame';

import ForceLogin from './../components/ForceLogin';


export default class IfLevelScoreContainer extends React.Component {
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

		fetch('/api/ifgame/debuglevel/'+_id, {
				method: 'get',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			})
			.then( response => response.json() )
			.then( json => new IfLevelSchema(json) )
			.then( ifLevel => {
				this.setState({
					level: ifLevel,
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
		const crumbs = this.state.level ?
			<Breadcrumb>
				<Breadcrumb.Item href={'/ifgame/'}>Home</Breadcrumb.Item>
				<Breadcrumb.Item active>{ this.state.level.title }</Breadcrumb.Item>
			</Breadcrumb>
			: <span></span>;

		const back = this.state.level ?
			<Button variant='primary' 
					style={{ marginBottom: 20, marginTop: 20 }} 
					href={ '/ifgame/' }>
					Back to home page
			</Button>
			: <span />;

		return (
			<Container>
				<Row>
					<Col>
						<ForceLogin/>
						{ crumbs }
						<h3>{ this.state.level ? this.state.level.title : '' }</h3>

						<Message message={this.state.message} style={this.state.messageStyle} />
						<Loading loading={this.state.isLoading } />
						<div style={{ textAlign: 'center' }}>{ back }</div>
						{ this.state.level ? <IfLevelDebug level={this.state.level} /> : '' }
						<div style={{ textAlign: 'center' }}>{ back }</div>
						<br/>
					</Col>
				</Row>
			</Container>
		);
	}
}
IfLevelScoreContainer.propTypes = {
	match: PropTypes.object.isRequired
};
