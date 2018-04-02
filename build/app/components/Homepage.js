import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';


import ForceLogin from './ForceLogin';

export default class Homepage extends React.Component {
	render() {

		return (
			<Row>
				<Col xs={8}>
					<ForceLogin />
					Welcome to JSGames!  Play
						<ul>
							<li><Link to='/ifgame/all'>If Game</Link></li>
						</ul>
				</Col>
				<Col xs={4} className='alert alert-warning' role='alert'>
					This is an educational project.  It is currently under heavy development, and
					will regularly be updated.  
					<br/>
					<br/>
					Please report any issues to &nbsp;
					<a className='alert-link' 
						href='mailto:nathan.garrett@woodbury.edu'>Nathan Garrett</a>.
				</Col>
			</Row>
		);
	}
}