import React from 'react';
import PropTypes from 'prop-types';

//import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { PrettyDate } from './../components/Misc';

export default class IfLevelList extends React.Component {

/*
	_render_levels_buckets() {
		// Filter levels into finished and unfinished.
		let aCompleted = this.props.levels.filter( level => level.completed),
			aUncompleted =  this.props.levels.filter( level => !level.completed);

		const score = level => !level.completed ? '' : 'scored ' + level.get_test_score_as_percent()+ '%';

		// Put in most recent first order.
		aCompleted.sort( (a, b) => a.created > b.created ? -1 : 1 );
		aUncompleted.sort( (a, b) => a.created > b.created ? -1 : 1 );

		// Empty condition.
		if(this.props.levels.length < 1) return <div></div>;

		let open = null;

		
		if(aUncompleted.length < 1) {
			// No open.
			open = <span />;

		} else if (aUncompleted.length === 1) {
			// One open
			open = (<div style={{ marginBottom: 10}}>
						<b>You are currently working on&nbsp;
						<Link to={'/ifgame/level/'+aUncompleted[0]._id+'/play'}>
							{aUncompleted[0].title}, started&nbsp;
							<PrettyDate date={ aUncompleted[0].created } />
						</Link>
						</b>
					</div>);

		}  else if (aUncompleted.length > 1) {
			// Multiple open.
			open = (<div style={{ marginBottom: 20}}>
				<b>You are currently working on &nbsp;</b>
				<ul>
					{ aUncompleted.map( 
						g=> (
							<li key={g._id}>
								<Link to={'/ifgame/level/'+g._id+'/play'}>
									<b>{g.title}</b>: started&nbsp;
									<PrettyDate date={ g.created } />
								</Link>
							</li>
							)
						)} 
				</ul>

			</div>);
		}


		const closed = aCompleted.length < 1 ? <span /> : (
			<div>
				Completed Levels
				<ul>
					{ aCompleted.map( 
						g=> (
							<li key={g._id}>
								<Link to={'/ifgame/level/'+g._id+'/score'}>
									<b>{g.title}</b>: { score(g) } on <PrettyDate date={ g.created } />
								</Link>
							</li>
							)
						)}
				</ul>
			</div>);

		
		return <div>{ open } { closed }</div>;
	}
	*/

	_render_link(level) {

		if(level.completed) {
			// Go to score
			return <Link to={'/ifgame/level/'+level._id+'/score'}>
						Scored { level.get_test_score_as_percent() }% on <PrettyDate date={ level.created } />
					</Link>;
		} else {
			// Go to play
			return <Link to={'/ifgame/level/'+level._id+'/play'}>
						Uncompleted level, started <PrettyDate date={ level.created } />
					</Link>;
		}
						
	}


	_render_levels() {
		// Filter levels into finished and unfinished.
		let aLevels = this.props.levels;

		// Put in most recent first order.
		aLevels.sort( (a, b) => a.created > b.created ? -1 : 1 );

		// Empty condition.
		if(aLevels.length < 1) return <div></div>;

		return (<ul>
					{ aLevels.map( 
						g=> (
							<li key={g._id}>
								{ this._render_link(g) }
							</li>
							)
						)}
				</ul>);

	}

	render() {
		return this._render_levels();
	}
}
IfLevelList.propTypes = {
	levels: PropTypes.array.isRequired
};