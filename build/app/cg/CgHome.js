import React from 'react';
import { Switch, Route } from 'react-router-dom';

import CgLevelListContainer from './CgLevelListContainer';
import CgLevelPlayContainer from './CgLevelPlayContainer';
import CgLevelScoreContainer from './CgLevelScoreContainer';

export default class CgHome extends React.Component {

	render() {
		
		return (
			<div>
				<Switch>
					<Route exact path='/chartgame/' component={CgLevelListContainer} />
					<Route exact path='/chartgame/level/:_id/play' component={CgLevelPlayContainer} />
					<Route exact path='/chartgame/level/:_id/score' component={CgLevelScoreContainer} />
				</Switch>
			</div>
		);
	}
}
//