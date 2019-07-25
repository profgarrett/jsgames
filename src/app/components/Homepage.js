import React from 'react';
import { Row, Col } from 'react-bootstrap';


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