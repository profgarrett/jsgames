import React from 'react';
import { Switch, Route } from 'react-router-dom';


import LevelListContainer from './LevelListContainer';
import LevelPlayContainer from './LevelPlayContainer';
import LevelScoreContainer from './LevelScoreContainer';
import RecentContainer from './RecentContainer';
import GradesContainer from './GradesContainer';
import QuestionsContainer from './QuestionsContainer';
import LevelDebugContainer from './LevelDebugContainer';
import MyProgressContainer from './MyProgressContainer';
import ClassProgressContainer from './ClassProgressContainer';
import {KCContainer} from './KCContainer';

export default class Home extends React.Component {

	render() {
		
		return (
				<Switch>
					<Route exact path='/ifgame/' component={MyProgressContainer} />
					<Route exact path='/ifgame/progress' component={ClassProgressContainer} />
					<Route exact path='/ifgame/kcs' component={KCContainer} />
					<Route exact path='/ifgame/grades' component={GradesContainer} />
					<Route exact path='/ifgame/questions' component={QuestionsContainer} />
					<Route exact path='/ifgame/recent' component={RecentContainer} /> 
					<Route exact path='/ifgame/levels/:_code' component={LevelListContainer} />
					<Route exact path='/ifgame/level/:_id/play' component={LevelPlayContainer} />
					<Route exact path='/ifgame/level/:_id/score' component={LevelScoreContainer} />
					<Route exact path='/ifgame/leveldebug/:_id' component={LevelDebugContainer} />
				</Switch>
		);
	}
}