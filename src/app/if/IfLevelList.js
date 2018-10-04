import React from 'react';
import PropTypes from 'prop-types';

//import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { PrettyDate } from './../components/Misc';

export default class IfLevelList extends React.Component {

	_render_levels() {
		// Filter returned values into finished and unfinished.
		let aCompleted = this.props.levels.filter( level => level.completed),
			aUncompleted =  this.props.levels.filter( level => !level.completed);

		const score = level => !level.completed ? '' : 'scored ' + level.get_test_score_as_percent()+ '%';


		// Put in most recent first order.
		aCompleted.sort( (a, b) => a.created > b.created ? -1 : 1 );
		aUncompleted.sort( (a, b) => a.created > b.created ? -1 : 1 );

		// Empty condition.
		if(this.props.levels.length < 1) return <div></div>;

		const open = aUncompleted.length < 1 ? <span /> : (
			<div>
				<h4>Your open tutorial{ aUncompleted.length > 1 ? 's' : '' }</h4>
				<ul>
					{ aUncompleted.map( 
						g=> (
							<li key={g._id}>
								<Link to={'/ifgame/level/'+g._id+'/play'}>
									<b>{g.code.substr(0,1).toUpperCase()+g.code.substr(1)}</b>: &nbsp;
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
				<h4>Review completed tutorials</h4>
				<ul>
					{ aCompleted.map( 
						g=> (
							<li key={g._id}>
								<Link to={'/ifgame/level/'+g._id+'/score'}>
									<b>{g.code.substr(0,1).toUpperCase()+g.code.substr(1)}</b>: &nbsp;
										{g.title}, { score(g) }	<PrettyDate date={ g.created } />  
								</Link>
							</li>
							)
						)}
				</ul>
			</div>);

		return <div>{ open } { closed }</div>;
	}

	render() {
		return this._render_levels();
	}
}
IfLevelList.propTypes = {
	levels: PropTypes.array.isRequired
};