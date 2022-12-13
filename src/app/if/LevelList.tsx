import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { PrettyDate } from '../components/Misc';
import type { IfLevelSchema } from '../../shared/IfLevelSchema';

type PropsType = {
	levels: Array<IfLevelSchema>
};

export default class IfLevelList extends React.Component<PropsType> {

	_render_link = (level: IfLevelSchema): ReactElement => {

		if(level.completed) {
			let d = level.get_last_update_date() || level.created;
			// Go to score
			return <Link to={'/ifgame/level/'+level._id+'/score'}>
						Scored { level.get_test_score_as_percent() }% on <PrettyDate date={ d } />
					</Link>;
		} else {
			// Go to play
			return <Link to={'/ifgame/level/'+level._id+'/play'}>
						Uncompleted level, started <PrettyDate date={ level.created } />
					</Link>;
		}
						
	}


	render = (): ReactElement => {
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
}
