import React from 'react';
import { Switch, Route } from 'react-router-dom';


import IfLevelListContainer from './IfLevelListContainer';
import IfLevelPlayContainer from './IfLevelPlayContainer';
import IfLevelScoreContainer from './IfLevelScoreContainer';
import IfLevelTestContainer from './IfLevelTestContainer';
import IfMonitorContainer from './IfMonitorContainer';
import IfActivityContainer from './IfActivityContainer';
import IfGradesContainer from './IfGradesContainer';
import IfAnswersContainer from './IfAnswersContainer';
import IfQuestionsContainer from './IfQuestionsContainer';

export default class IfHome extends React.Component {

	render() {
		
		return (
			<div>
				<Switch>
					<Route exact path='/ifgame/' component={IfLevelListContainer} />
					<Route exact path='/ifgame/grades' component={IfGradesContainer} />
					<Route exact path='/ifgame/activity' component={IfActivityContainer} />
					<Route exact path='/ifgame/answers' component={IfAnswersContainer} />
					<Route exact path='/ifgame/questions' component={IfQuestionsContainer} />
					<Route exact path='/ifgame/monitor' component={IfMonitorContainer} />
					<Route exact path='/ifgame/test' component={IfLevelTestContainer} />
					<Route exact path='/ifgame/:_code' component={IfLevelListContainer} />
					<Route exact path='/ifgame/level/:_id/play' component={IfLevelPlayContainer} />
					<Route exact path='/ifgame/level/:_id/score' component={IfLevelScoreContainer} />
				</Switch>
			</div>
		);
	}
}
