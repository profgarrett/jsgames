import React from 'react';
import ReactDOM from 'react-dom';
import 'babel-polyfill'; // IE11 compatability.
import 'url-search-params-polyfill'; // yeah for IE!

import { BrowserRouter, Switch, Route } from 'react-router-dom';

//  Old browser compatability.
import Promise from 'promise-polyfill';
if (!window.Promise) { window.Promise = Promise; }

// Number polyfill.
// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
if (!Number.MAX_SAFE_INTEGER) {
    Number.MAX_SAFE_INTEGER = Math.pow(2, 53) - 1; // 9007199254740991
}

// String padStart polyfill.
// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength, padString) {
        targetLength = targetLength >> 0; //truncate if number, or convert non-number to 0;
        padString = String(typeof padString !== 'undefined' ? padString : ' ');
        if (this.length >= targetLength) {
            return String(this);
        } else {
            targetLength = targetLength - this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0, targetLength) + String(this);
        }
    };
}

// [].includes polyfill.
// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes#Polyfill
// https://tc39.github.io/ecma262/#sec-array.prototype.includes
if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function(searchElement, fromIndex) {

      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      // 1. Let O be ? ToObject(this value).
      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If len is 0, return false.
      if (len === 0) {
        return false;
      }

      // 4. Let n be ? ToInteger(fromIndex).
      //    (If fromIndex is undefined, this step produces the value 0.)
      var n = fromIndex | 0;

      // 5. If n ≥ 0, then
      //  a. Let k be n.
      // 6. Else n < 0,
      //  a. Let k be len + n.
      //  b. If k < 0, let k be 0.
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      function sameValueZero(x, y) {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
      }

      // 7. Repeat, while k < len
      while (k < len) {
        // a. Let elementK be the result of ? Get(O, ! ToString(k)).
        // b. If SameValueZero(searchElement, elementK) is true, return true.
        if (sameValueZero(o[k], searchElement)) {
          return true;
        }
        // c. Increase k by 1. 
        k++;
      }

      // 8. Return false
      return false;
    }
  });
}

// Display components
import { Grid } from 'react-bootstrap';

// Import app components.
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
					<Route path='/ifgame' component={IfHome}></Route>
					<Route component={PageNotFound}></Route>
				</Switch>
			</Grid>
			</ErrorBoundary>
		</BrowserRouter>
	);

} else {

	Root = () => ( <BrowserRouter basename='/'>
				<Grid>
				<Menu page='/' />
				<Switch>
					<Route exact path='/' component={Homepage}></Route>
					<Route path='/login' component={Login}></Route>
					<Route path='/logout' component={Logout}></Route>
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
