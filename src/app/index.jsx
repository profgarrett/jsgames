import React from 'react';
import { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes, useRouteError } from 'react-router-dom';

// Import app components.
import LoginContainer from './components/LoginContainer.tsx';
import ProfileContainer from './components/ProfileContainer.tsx';
import Logout from './components/Logout';
import PasswordContainer from './components/PasswordContainer.tsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import MyProgressContainer from './if/MyProgressContainer.tsx';
import LevelDebugContainer from './if/LevelDebugContainer.tsx';
import LevelListContainer from './if/LevelListContainer.tsx';
import LevelPlayContainer from './if/LevelPlayContainer';
import LevelScoreContainer from './if/LevelScoreContainer';
import ClassProgressContainer from './if/ClassProgressContainer';
import RecentContainer from './if/RecentContainer';
import QuestionsContainer from './if/QuestionsContainer';
import KCContainer from './if/KCContainer';
import LevelRawContainer from './if/LevelRawContainer';
import PreviewContainer from './if/PreviewContainer';
import FeedbackContainer from './if/FeedbackContainer';
import FeedbackRouter from './if/FeedbackRouter';

/*
function ErrorPage() {
	const error = useRouteError();
	console.error('Route Error:', error);
  
	// Determine error message and status
	const errorMessage = error?.message || error?.statusText || 'Unknown error occurred';
	const errorStatus = error?.status || error?.statusText || '';
  
	return (
	  <div id="error-page" style={{ padding: '2rem', textAlign: 'center' }}>
		<h1>Oops!</h1>
		<p>Sorry, an unexpected error has occurred. Please contact profgarrett@gmail.com for help.</p>
		{errorStatus && <p><strong>Status:</strong> {errorStatus}</p>}
		<p>
		  <i>{errorMessage}</i>
		</p>
		{process.env.NODE_ENV === 'development' && error?.stack && (
		  <details style={{ textAlign: 'left', marginTop: '1rem' }}>
			<summary>Error Details (Development)</summary>
			<pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
			  {error.stack}
			</pre>
		  </details>
		)}
	  </div>
	);
}
	*/
// 				<Route path="/ifgame/*" element={<Root />} />

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<PreviewContainer />} />
					<Route path="/login" element={<LoginContainer />} />
					<Route path="/logout" element={<Logout />} />
					<Route path="/profile" element={<ProfileContainer />} />
					<Route path="/password" element={<PasswordContainer />} />

					<Route path="/ifgame" element={<MyProgressContainer />} />
					<Route path="/ifgame/levels/:_code" element={<LevelListContainer />} />
					<Route path="/ifgame/level/:_id/debug" element={<LevelDebugContainer />} />
					<Route path="/ifgame/level/:_id/play" element={<LevelPlayContainer />} />
					<Route path="/ifgame/level/:_id/score" element={<LevelScoreContainer />} />
					<Route path="/ifgame/level/:_id/raw" element={<LevelRawContainer />} />
					<Route path="/ifgame/progress/:_idsection" element={<ClassProgressContainer />} />
					<Route path="/ifgame/kcs/:_idsection" element={<KCContainer />} />
					<Route path="/ifgame/questions/:_idsection" element={<QuestionsContainer />} />
					<Route path="/ifgame/recent/:_idsection" element={<RecentContainer />} />
					<Route path="/ifgame/feedback/:_sectionid" element={<FeedbackContainer />} />
					<Route path="/ifgame/feedback/create/:_code" element={<FeedbackRouter />} />
				</Routes>
			</BrowserRouter>
	</React.StrictMode>
  );

//		<ErrorBoundary>

/* <Route path="*" element={<ErrorPage />} />*/
//		</ErrorBoundary>
