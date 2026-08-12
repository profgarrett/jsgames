/*
	Client-side pageview tracking.

	Rendered once inside <BrowserRouter> (see index.jsx), so it sees every route
	change, but it only tracks the content pages under /pages/ — see
	should_track in pageviewActivity.ts. On any other route it does nothing at
	all: no row, no heartbeats, no listeners.

	On entering a tracked page it posts a "load" event to /api/pageviews and
	then sends a heartbeat every 30 seconds that advances the row's
	end_datetime. When the route changes or the tab closes, a final heartbeat is
	sent so the last timestamp is captured.

	The scheduled heartbeat only fires while the page is actually being used. A
	hidden, unfocused, or idle page stops the loop until the student comes back,
	so end_datetime reflects time on the page rather than time the tab existed.

	Each heartbeat also reports engagement (see pageviewActivity.ts):

	  active=1|0       whether the page is visible, focused, and recently used.
	                   Advances active_datetime server-side.
	  active_seconds   the summed time the page has actually been used, so a tab
	                   left open in the background stops accruing engaged time.

	The sum is kept here because only the client can see focus, visibility, and
	interaction. It is a *total*, not a delta, so a duplicated or retried beacon
	cannot double-count; the server clamps it to the wall-clock time the page was
	open, which the client cannot influence.

	The server still derives username, IP, and every timestamp itself. All
	network calls fail silently: tracking must never break the page.
*/
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { getUserFromBrowser } from '../components/Authentication';
import {
	compute_state,
	is_active,
	should_track,
	heartbeat_url,
	transition_heartbeat,
	new_total,
	begin_active,
	end_active,
	total_seconds,
	credit_timestamp,
	IDLE_MS,
} from './pageviewActivity';

import type { PageState, ActiveTotal } from './pageviewActivity';

const HEARTBEAT_MS = 30000;

// Don't fire transition heartbeats faster than this, so a student fidgeting on
// and off the page can't generate a burst of requests. Suppressed transitions
// still update the running total; the next scheduled heartbeat reports it.
const MIN_TRANSITION_GAP_MS = 5000;

// Interactions that count as "the student is doing something here".
const INTERACTION_EVENTS = [
	'mousemove', 'mousedown', 'keydown', 'scroll', 'wheel', 'touchstart', 'click',
];

// Monotonic where available. Date.now() jumps when the system clock is
// corrected or the machine wakes from sleep, which would corrupt the sum.
const clock = (): number => (
	typeof performance !== 'undefined' && typeof performance.now === 'function'
		? performance.now()
		: Date.now()
);

export default function PageviewTracker(): null {
	const location = useLocation();
	const idRef = useRef<number | null>(null);

	useEffect(() => {
		// Only track logged-in users; the API would 401 otherwise.
		if (getUserFromBrowser().username === '') return;

		// Only track the content pages. Leaving early here means the homepage,
		// login, admin, and the game routes register no listeners and open no
		// row — the component is inert everywhere else.
		if (!should_track(location.pathname)) return;

		const page = location.pathname;
		let cancelled = false;
		let interval: ReturnType<typeof setInterval> | null = null;
		let idle_timer: ReturnType<typeof setTimeout> | null = null;
		let last_interaction = clock();
		let last_transition_sent = 0;
		let state: PageState = 'active';

		// Seconds already banked on the row before this page session. Set from
		// the create response when an existing row is resumed, so a reload
		// continues the count instead of restarting it.
		let baseline_seconds = 0;
		// A page load is active by definition, so the clock starts running.
		let total: ActiveTotal = begin_active(new_total(), clock());
		idRef.current = null;

		const read_state = (): PageState => compute_state({
			visibility: typeof document !== 'undefined' ? document.visibilityState : 'visible',
			focused: typeof document.hasFocus === 'function' ? document.hasFocus() : true,
			ms_since_interaction: clock() - last_interaction,
		});

		const reported_seconds = (): number => baseline_seconds + total_seconds(total, clock());

		const sendHeartbeat = (active: boolean) => {
			const id = idRef.current;
			if (id === null) return;
			fetch(heartbeat_url(id, active, reported_seconds()), {
				method: 'POST',
				credentials: 'include',
				keepalive: true,
			})
				// 409 means the row went quiet long enough that the server
				// considers this sitting over — a closed laptop, a sleeping
				// machine, a long network drop. Start a fresh row rather than
				// stretching the old one across the gap.
				.then((res) => { if (res.status === 409) restartSession(); })
				.catch(() => {});
		};

		const beaconHeartbeat = (active: boolean) => {
			const id = idRef.current;
			if (id === null) return;
			// sendBeacon survives tab close / navigation better than fetch, and
			// carries no body — hence both figures living in the query string.
			if (navigator.sendBeacon) {
				navigator.sendBeacon(heartbeat_url(id, active, reported_seconds()));
			} else {
				sendHeartbeat(active);
			}
		};

		// Move the accumulator to match a new state, closing or opening the
		// running interval as needed.
		const applyState = (next: PageState) => {
			const now = clock();
			if (is_active(next)) {
				total = begin_active(total, now);
			} else {
				total = end_active(total, credit_timestamp(next, now, last_interaction));
			}
			state = next;
		};

		// Re-read the browser, and if the state changed, update the sum and tell
		// the server now rather than waiting up to 30 seconds for the next
		// heartbeat.
		const syncState = (use_beacon: boolean = false) => {
			const next = read_state();
			if (next === state) return;

			const { send, active } = transition_heartbeat(state, next);
			// Close the interval before reporting, so the heartbeat carries the
			// total including the stretch that just ended.
			applyState(next);

			if (!send) return;
			// Leaving the page is always worth reporting; ordinary flapping is not.
			const now = clock();
			if (!use_beacon && now - last_transition_sent < MIN_TRANSITION_GAP_MS) return;
			last_transition_sent = now;

			if (use_beacon) beaconHeartbeat(active);
			else sendHeartbeat(active);
		};

		// The idle threshold passing is a state change no event will announce,
		// so schedule a check for the moment it would happen.
		const armIdleTimer = () => {
			if (idle_timer !== null) clearTimeout(idle_timer);
			idle_timer = setTimeout(() => syncState(), IDLE_MS + 1000);
		};

		const onInteraction = () => {
			last_interaction = clock();
			armIdleTimer();
			// Catches idle -> active; no-op while already active.
			syncState();
		};

		const onVisibility = () => {
			if (document.visibilityState === 'hidden') {
				// Use a beacon: the tab may be about to be frozen or discarded.
				syncState(true);
			} else {
				last_interaction = clock();
				syncState();
			}
		};

		const onFocusChange = () => syncState();

		const onUnload = () => {
			// Bank the open interval so the final beacon carries a complete
			// total, then reopen it: pagehide also fires when a page enters the
			// back/forward cache, and such a page can be restored and keep
			// running. Closing and reopening at the same instant adds nothing to
			// the sum, so this is free insurance against a stopped clock.
			const now = clock();
			const was_active = is_active(state);
			total = end_active(total, now);
			if (was_active) total = begin_active(total, now);

			// Report active=1 when it was active up to this instant, which pins
			// active_datetime to the moment the student actually left.
			beaconHeartbeat(was_active);
		};

		// Post a load event and adopt the row it returns. The server decides
		// whether that is a new row or a recent one being resumed.
		const createRow = () => {
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
					// Continue the resumed row's tally rather than resetting it.
					// A brand new row reports 0, which resets the baseline — the
					// path a restart after a stale session takes.
					baseline_seconds = typeof json.active_seconds === 'number' && json.active_seconds > 0
						? Math.floor(json.active_seconds)
						: 0;
				})
				.catch(() => {});
		};

		/*
			Abandon a session the server has declared over and open a new one.

			The accumulator resets because the new row's start_datetime is now:
			carrying the old total across would immediately be clipped by the
			server's wall-clock clamp anyway, and would misattribute time spent
			before the gap to the sitting after it.
		*/
		const restartSession = () => {
			if (cancelled) return;
			idRef.current = null;
			baseline_seconds = 0;
			last_interaction = clock();
			total = new_total();
			state = read_state();
			if (is_active(state)) total = begin_active(total, clock());
			createRow();
		};

		/*
			1. Post the initial load event, then start the heartbeat loop.

			The loop re-reads the browser every tick but only reports while the
			page is actually being used. A hidden, unfocused, or idle page has
			nothing new to say: active_seconds has stopped growing, and
			advancing end_datetime would record a tab left open in another
			window as a long visit.

			Nothing is lost by staying quiet. The transition *out* of active
			already sent a heartbeat carrying the closed-out total (syncState),
			and the transition back in sends another. If the student is away
			long enough for the server to call the row stale, that returning
			heartbeat gets a 409 and restartSession opens a fresh row — which is
			the right record: two sittings, not one long one.
		*/
		createRow();
		interval = setInterval(() => {
			applyState(read_state());
			if (!is_active(state)) return;
			sendHeartbeat(true);
		}, HEARTBEAT_MS);

		INTERACTION_EVENTS.forEach((name) => {
			window.addEventListener(name, onInteraction, { passive: true });
		});
		window.addEventListener('beforeunload', onUnload);
		window.addEventListener('pagehide', onUnload);
		window.addEventListener('focus', onFocusChange);
		window.addEventListener('blur', onFocusChange);
		document.addEventListener('visibilitychange', onVisibility);
		armIdleTimer();

		// 2. Cleanup on route change / unmount: stop the loops and report the
		// final total.
		return () => {
			cancelled = true;
			if (interval !== null) clearInterval(interval);
			if (idle_timer !== null) clearTimeout(idle_timer);
			INTERACTION_EVENTS.forEach((name) => {
				window.removeEventListener(name, onInteraction);
			});
			window.removeEventListener('beforeunload', onUnload);
			window.removeEventListener('pagehide', onUnload);
			window.removeEventListener('focus', onFocusChange);
			window.removeEventListener('blur', onFocusChange);
			document.removeEventListener('visibilitychange', onVisibility);

			const was_active = is_active(state);
			// Bank whatever is still open before the last report.
			total = end_active(total, clock());
			sendHeartbeat(was_active);
		};
	}, [location.pathname]);

	return null;
}
