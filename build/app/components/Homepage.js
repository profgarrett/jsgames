import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';


import ForceLogin from './ForceLogin';

export default class Homepage extends React.Component {
	render() {
		window.location.replace('/ifgame');

		return (
			<Row>
				<Col xs={8}>
					<ForceLogin />
				</Col>
			</Row>
		);
	}
}