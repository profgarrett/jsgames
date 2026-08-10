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
import PageListContainer from './pages/PageListContainer.tsx';
import PageSectionContainer from './pages/PageSectionContainer.tsx';
import PageViewContainer from './pages/PageViewContainer.tsx';
import LiveQuizJoin from './pages/LiveQuizJoin.tsx';
import AdminContainer from './admin/AdminContainer.tsx';
import { loadUserFromServer } from './components/Authentication';
import PageviewTracker from './components/PageviewTracker.tsx';
import SiteHeader from './components/SiteHeader.tsx';


// Load Google Analytics gtag.js script and initialize it
// NOTE: Update the tracking ID to your own Google Analytics property ID
function loadGtag() {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-FW5XCZZEW1';
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-FW5XCZZEW1');
}

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    loadGtag();
});

function renderApp() {
	ReactDOM.createRoot(document.getElementById("root")).render(
		<React.StrictMode>
				<BrowserRouter>
					<PageviewTracker />
					<SiteHeader />
					<Routes>
						<Route path="/" element={<PreviewContainer />} />
						<Route path="/login" element={<LoginContainer />} />
						<Route path="/logout" element={<Logout />} />
						<Route path="/profile" element={<ProfileContainer />} />
						<Route path="/password" element={<PasswordContainer />} />

						<Route path="/admin" element={<AdminContainer />} />

						<Route path="/pages" element={<PageSectionContainer />} />
						<Route path="/pages/list" element={<PageListContainer />} />
					<Route path="/pages/*" element={<PageViewContainer />} />
						<Route path="/live" element={<LiveQuizJoin />} />

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
}

// Load the current user (httpOnly cookie => must ask the server) before first render,
// so getUserFromBrowser() returns the right identity synchronously everywhere.
loadUserFromServer().finally(renderApp);

//		<ErrorBoundary>

/* <Route path="*" element={<ErrorPage />} />*/
//		</ErrorBoundary>
