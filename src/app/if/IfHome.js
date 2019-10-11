import React from 'react';
import { Switch, Route } from 'react-router-dom';


import IfLevelListContainer from './IfLevelListContainer';
import IfLevelPlayContainer from './IfLevelPlayContainer';
import IfLevelScoreContainer from './IfLevelScoreContainer';
import IfRecentContainer from './IfRecentContainer';
import IfGradesContainer from './IfGradesContainer';
import IfQuestionsContainer from './IfQuestionsContainer';
import IfLevelDebugContainer from './IfLevelDebugContainer';
import MyProgressContainer from './MyProgressContainer';


export default class IfHome extends React.Component {

	render() {
		
		return (
				<Switch>
					<Route exact path='/ifgame/' component={MyProgressContainer} />
					<Route exact path='/ifgame/grades' component={IfGradesContainer} />
					<Route exact path='/ifgame/questions' component={IfQuestionsContainer} />
					<Route exact path='/ifgame/recent' component={IfRecentContainer} /> 
					<Route exact path='/ifgame/levels/:_code' component={IfLevelListContainer} />
					<Route exact path='/ifgame/level/:_id/play' component={IfLevelPlayContainer} />
					<Route exact path='/ifgame/level/:_id/score' component={IfLevelScoreContainer} />
					<Route exact path='/ifgame/leveldebug/:_id' component={IfLevelDebugContainer} />
				</Switch>
		);
	}
}
