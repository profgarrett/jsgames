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

const Root = () => (
	<BrowserRouter>
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
	</BrowserRouter>
);


ReactDOM.render(
	<Root />, 
	document.getElementById('contents')
);
