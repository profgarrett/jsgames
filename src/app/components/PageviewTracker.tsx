/*
	Client-side pageview tracking.

	Rendered once inside <BrowserRouter> (see index.jsx). On each route change it
	posts an initial "load" event to /api/pageviews and then sends a heartbeat
	every 30 seconds that advances the row's end_datetime. When the route changes
	or the tab closes, a final heartbeat is sent so the last timestamp is captured.

	The server derives username, IP, and all timestamps itself, so this component
	only needs to report the current path. All network calls fail silently:
	tracking must never break the page.
*/
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { getUserFromBrowser } from './Authentication';

const HEARTBEAT_MS = 30000;

export default function PageviewTracker(): null {
	const location = useLocation();
	const idRef = useRef<number | null>(null);

	useEffect(() => {
		// Only track logged-in users; the API would 401 otherwise.
		if (getUserFromBrowser().username === '') return;

		const page = location.pathname;
		let cancelled = false;
		let interval: ReturnType<typeof setInterval> | null = null;
		idRef.current = null;

		const sendHeartbeat = () => {
			const id = idRef.current;
			if (id === null) return;
			fetch(`/api/pageviews/${id}/heartbeat`, {
				method: 'POST',
				credentials: 'include',
				keepalive: true,
			}).catch(() => {});
		};

		const beaconHeartbeat = () => {
			const id = idRef.current;
			if (id === null) return;
			// sendBeacon survives tab close / navigation better than fetch.
			if (navigator.sendBeacon) {
				navigator.sendBeacon(`/api/pageviews/${id}/heartbeat`);
			} else {
				sendHeartbeat();
			}
		};

		const onVisibility = () => {
			if (document.visibilityState === 'hidden') beaconHeartbeat();
		};

		// 1. Post the initial load event, then start the heartbeat loop.
		fetch('/api/pageviews', {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ page }),
		})
			.then((res) => (res.ok ? res.json() : null))
			.then((json) => {
				if (cancelled || !json || typeof json.idpageview !== 'number') return;
				idRef.current = json.idpageview;
				interval = setInterval(sendHeartbeat, HEARTBEAT_MS);
			})
			.catch(() => {});

		window.addEventListener('beforeunload', beaconHeartbeat);
		document.addEventListener('visibilitychange', onVisibility);

		// 2. Cleanup on route change / unmount: stop the loop and record a final time.
		return () => {
			cancelled = true;
			if (interval !== null) clearInterval(interval);
			window.removeEventListener('beforeunload', beaconHeartbeat);
			document.removeEventListener('visibilitychange', onVisibility);
			sendHeartbeat();
		};
	}, [location.pathname]);

	return null;
}
