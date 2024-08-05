import React from 'react';
import { useEffect } from 'react';
import ReactDOM from 'react-dom/client';

//import 'url-search-params-polyfill'; // yeah for IE!
import { createBrowserRouter,
	RouterProvider,
	useRouteError,
	useLocation,
	Route, 
	useNavigate} from 'react-router-dom';



//  Old browser compatability.
//import Promise from 'promise-polyfill';
//if (!window.Promise) { window.Promise = Promise; }

// Number polyfill.
// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
/* if (!Number.MAX_SAFE_INTEGER) {
    Number.MAX_SAFE_INTEGER = Math.pow(2, 53) - 1; // 9007199254740991
} */

// String padStart polyfill.
// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
/*
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
} */

// [].includes polyfill.
// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes#Polyfill
// https://tc39.github.io/ecma262/#sec-array.prototype.includes
/*
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

      const sameValueZero = (x, y) => {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
      };

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
*/

// Import app components.
//import { Menu, PageNotFound } from './components/Misc';
import LoginContainer from './components/LoginContainer.tsx';
import ProfileContainer from './components/ProfileContainer.tsx';
import Logout from './components/Logout';
import PasswordContainer from './components/PasswordContainer.tsx';

//import Bugsnag from '@bugsnag/js'
//import BugsnagPluginReact from '@bugsnag/plugin-react'

let Root = null;

/*
if(window.location.hostname !== 'localhost') {
	throw Error('not tested');
	
  Bugsnag.start({
    apiKey: '9b68269d9ba2d11171ecafa393afbb8e',
    plugins: [new BugsnagPluginReact()],
  })

  var ErrorBoundary = Bugsnag.getPlugin('react')
    .createErrorBoundary(React)

	Root = () => (
		<BrowserRouter>
			<ErrorBoundary>
				<Menu page='/' />
				<Switch>
					<Route exact path='/' component={Homepage}></Route>
					<Route path='/login' component={LoginContainer}></Route>
        			<Route path='/password' component={PasswordContainer}></Route>
					<Route path='/logout' component={Logout}></Route>
					<Route path='/ifgame' component={Home}></Route>
					<Route path='/profile' component={ProfileContainer}></Route>
					<Route component={PageNotFound}></Route>
				</Switch>
			</ErrorBoundary>
		</BrowserRouter>
	);
		
} else {

	Root = <></>;

}
*/


import { StaticRouter } from "react-router-dom/server";

/*
import LevelPlayContainer from './LevelPlayContainer';
import LevelScoreContainer from './LevelScoreContainer';
import RecentContainer from './RecentContainer';
import GradesContainer from './GradesContainer';
import QuestionsContainer from './QuestionsContainer';
import LevelRawContainer from './LevelRawContainer';
import ClassProgressContainer from './ClassProgressContainer';
import {KCContainer} from './KCContainer';
				<Route exact path='/ifgame/' component={MyProgressContainer} />
				<Route exact path='/ifgame/progress' component={ClassProgressContainer} />
				<Route exact path='/ifgame/grades' component={GradesContainer} />
				<Route exact path='/ifgame/questions' component={QuestionsContainer} />
				<Route exact path='/ifgame/recent' component={RecentContainer} />
				<Route exact path='/ifgame/levels/:_code' component={LevelListContainer} />
				<Route exact path='/ifgame/level/:_id/play' component={LevelPlayContainer} />
				<Route exact path='/ifgame/level/:_id/score' component={LevelScoreContainer} />
				<Route exact path='/ifgame/leveldebug/:_id' component={LevelDebugContainer} />
				<Route exact path='/ifgame/levelraw/:_id/:_pageIndex?' component={LevelRawContainer} />
*/
import MyProgressContainer from './if/MyProgressContainer.tsx';
import LevelDebugContainer from './if/LevelDebugContainer.tsx';
import LevelListContainer from './if/LevelListContainer.tsx';
import LevelPlayContainer from './if/LevelPlayContainer';
import LevelScoreContainer from './if/LevelScoreContainer';
import ClassProgressContainer from './if/ClassProgressContainer';
import RecentContainer from './if/RecentContainer';
import GradesContainer from './if/GradesContainer';
import QuestionsContainer from './if/QuestionsContainer';
import KCContainer from './if/KCContainer';
import LevelRawContainer from './if/LevelRawContainer';


function ErrorPage() {
	const error = useRouteError();
	console.error(error);
  
	return (
	  <div id="error-page">
		<h1>Oops!</h1>
		<p>Sorry, an unexpected error has occurred.</p>
		<p>
		  <i>{error.statusText || error.message}</i>
		</p>
	  </div>
	);
}



const PageTitle = ({ title }) => {
	const location = useLocation();
  
	useEffect( () => {
	  document.title = title;
	}, [location, title]);
  
	return null;
  };
  

const t = (t, el ) => {
	return (<>
		<PageTitle title={t} />{ el }
	</>);
}


const router = createBrowserRouter([
	{ path: '/', element: t('Excel.fun', <MyProgressContainer />), errorElement: <ErrorPage/> },

	{ path: '/ifgame/', element: t('Excel.fun Home', <MyProgressContainer />) },

	{ path: '/ifgame/leveldebug/:_id', element: t('Debug', <LevelDebugContainer />) },
	{ path: '/ifgame/levels/:_code', element: t('Levels', <LevelListContainer />) },
	{ path: '/ifgame/level/:_id/play', element: t('Level', <LevelPlayContainer />) },
	{ path: '/ifgame/level/:_id/score', element: t('Grade', <LevelScoreContainer />) },
	{ path: '/ifgame/progress/:_idsection', element: t('Class progress',<ClassProgressContainer /> ) },
	{ path: '/ifgame/recent/:_idsection', element: t('Recent', <RecentContainer />) },
	{ path: '/ifgame/grades/:_idsection', element: t('Grades', <GradesContainer />) },
	{ path: '/ifgame/questions/:_idsection', element: t('Questions', <QuestionsContainer />) },
	{ path: '/ifgame/levelraw/:_id', element: t('Raw', <LevelRawContainer />) },

	{ path: '/ifgame/kcs/:_idsection', element: t('KCs', <KCContainer /> ) },

	{ path: '/login', element: t('Excel.fun Login', <LoginContainer />) },
	{ path: '/logout', element: t('Excel.fun Logout', <Logout />) },
	{ path: '/profile', element: t('Excel.fun Profile', <ProfileContainer />) },
	{ path: '/password', element: t('Excel.fun Password', <PasswordContainer />) },
  ]);



ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
  );
