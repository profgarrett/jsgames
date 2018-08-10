import React from 'react';
import ReactDOM from 'react-dom';
import 'babel-polyfill'; // IE11 compatability.
import 'url-search-params-polyfill'; // yeah for IE!

import { BrowserRouter, Switch, Route } from 'react-router-dom';

//  Old browser compatability.
import Promise from 'promise-polyfill';
if (!window.Promise) { window.Promise = Promise; }

// Display components
import { Grid } from 'react-bootstrap';

// Import app components.
import CgHome from './cg/CgHome';
import IfHome from './if/IfHome';
import { Menu, PageNotFound } from './components/Misc';
import Login from './components/Login';
import Logout from './components/Logout';
import Homepage from './components/Homepage';

import bugsnag from 'bugsnag-js';
import createPlugin from 'bugsnag-react';


let Root = null;

if(window.location.hostname !== 'localhost') {

	const bugsnagClient = bugsnag({
		apiKey: '9b68269d9ba2d11171ecafa393afbb8e',
		autoCaptureSessions: true,
		releaseStage: 'production',
		notifyReleaseStages: [ 'development', 'production' ]
	});

	const ErrorBoundary = bugsnagClient.use(createPlugin(React));

	Root = () => (
		<BrowserRouter>
			<ErrorBoundary>
				<Grid>
				<Menu page='/' />
				<Switch>
					<Route exact path='/' component={Homepage}></Route>
					<Route path='/login' component={Login}></Route>
					<Route path='/logout' component={Logout}></Route>
					<Route path='/chartgame' component={CgHome}></Route>
					<Route path='/ifgame' component={IfHome}></Route>
					<Route component={PageNotFound}></Route>
				</Switch>
			</Grid>
			</ErrorBoundary>
		</BrowserRouter>
	);

} else {

	Root = () => ( <BrowserRouter>
				<Grid>
				<Menu page='/' />
				<Switch>
					<Route exact path='/' component={Homepage}></Route>
					<Route path='/login' component={Login}></Route>
					<Route path='/logout' component={Logout}></Route>
					<Route path='/chartgame' component={CgHome}></Route>
					<Route path='/ifgame' component={IfHome}></Route>
					<Route component={PageNotFound}></Route>
				</Switch>
				</Grid>
			</BrowserRouter>);
}


ReactDOM.render(
	<Root />, 
	document.getElementById('contents')
);
