import React from 'react';
import PropTypes from 'prop-types';

//import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { PrettyDate } from './../components/Misc';

export default class IfLevelList extends React.Component {

	render() {
		// Filter returned values into finished and unfinished.
		let aCompleted = this.props.levels.filter( level => level.completed),
			aUncompleted =  this.props.levels.filter( level => !level.completed);

		// Put in most recent first order.
		aCompleted.sort( (a, b) => a.created > b.created ? -1 : 1 );
		aUncompleted.sort( (a, b) => a.created > b.created ? -1 : 1 );

		// Empty condition.
		if(this.props.levels.length < 1) return <div></div>;

		const open = aUncompleted.length < 1 ? <span /> : (
			<div>
				<h3>Open Tutorial{ aUncompleted.length > 1 ? 's' : '' }</h3>
				<ul>
					{ aUncompleted.map( 
						g=> (
							<li key={g._id}>
								<Link to={'/ifgame/level/'+g._id+'/play'}>
									{g.title}, started&nbsp;
									<PrettyDate date={ g.created } />
								</Link>
							</li>
							)
						)}
				</ul>
			</div>);

		const closed = aCompleted.length < 1 ? <span /> : (
			<div>
				<h3>Completed Tutorial{ aCompleted.length > 1 ? 's' : '' }</h3>
				<ul>
					{ aCompleted.map( 
						g=> (
							<li key={g._id}>
								<Link to={'/ifgame/level/'+g._id+'/score'}>
									{g.title}, completed&nbsp;
									<PrettyDate date={ g.created } />.  
									Score {g.score.correct} of {g.score.attempted}
								</Link>
							</li>
							)
						)}
				</ul>
			</div>);

		return <div>{ open } { closed }</div>;
	}
}
IfLevelList.propTypes = {
	levels: PropTypes.array.isRequired
};