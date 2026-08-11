/*
	Pure helpers behind PageviewTracker's engagement tracking.

	Kept free of React and DOM references so the rules can be unit tested
	directly; PageviewTracker supplies the live browser readings and clock.

	Three states, in decreasing order of confidence that the student is
	actually reading the page:

	  active  visible, focused, and interacted with inside the idle threshold
	  idle    visible and focused, but untouched for longer than the threshold
	  hidden  another tab is in front, the window is minimised, the page is in
	          the background on mobile, or the window lost focus (a second
	          window side by side, or another application on top)

	Time spent in 'active' is summed here and reported to the server as
	active_seconds. 'idle' and 'hidden' both stop the clock; they are kept
	distinct because an idle page may still be being read, whereas a hidden one
	certainly is not.
*/

// No interaction for this long, and we stop calling the page active. Reading a
// long page without touching anything is normal, so this is deliberately more
// generous than the 30s heartbeat.
const IDLE_MS = 120000;

type PageState = 'active' | 'idle' | 'hidden';

type ActivityReading = {
	// document.visibilityState
	visibility: string,
	// document.hasFocus()
	focused: boolean,
	// Milliseconds since the last mousemove / keydown / scroll / click / touch.
	ms_since_interaction: number,
};

/*
	The running sum.

	`accumulated_ms` is closed-out active time. `active_since_ms` marks an
	interval still in progress, or null when the clock is stopped. Splitting the
	two means the total can be read at any instant without mutating anything,
	which matters because heartbeats fire mid-interval.

	All timestamps must come from the same monotonic clock (performance.now()),
	never Date.now(): a laptop resuming from sleep or an NTP correction can jump
	the wall clock backwards, and this arithmetic would silently absorb it.
*/
type ActiveTotal = {
	accumulated_ms: number,
	active_since_ms: number | null,
};

const new_total = (accumulated_ms: number = 0): ActiveTotal => ({
	accumulated_ms: Math.max(0, accumulated_ms),
	active_since_ms: null,
});

// Start counting. A no-op if the clock is already running, so repeated
// 'active' readings don't restart the interval and lose time.
const begin_active = (total: ActiveTotal, now_ms: number): ActiveTotal => {
	if (total.active_since_ms !== null) return total;
	return { ...total, active_since_ms: now_ms };
};

/*
	Stop counting, crediting the open interval up to `credit_at_ms`.

	That is not always "now". Idleness is detected retroactively: the student
	stops touching the page at T, and we only notice at T + IDLE_MS. Crediting
	to now would hand them two free minutes of "engagement" for having walked
	away. So the caller passes the last interaction time instead — see
	credit_timestamp below.
*/
const end_active = (total: ActiveTotal, credit_at_ms: number): ActiveTotal => {
	if (total.active_since_ms === null) return total;
	const elapsed = Math.max(0, credit_at_ms - total.active_since_ms);
	return {
		accumulated_ms: total.accumulated_ms + elapsed,
		active_since_ms: null,
	};
};

// The sum as of now, including any interval still open.
const total_ms = (total: ActiveTotal, now_ms: number): number => {
	const open = total.active_since_ms === null
		? 0
		: Math.max(0, now_ms - total.active_since_ms);
	return total.accumulated_ms + open;
};

/*
	Where to close the active interval when leaving state `to`.

	Going hidden is observed the instant it happens, so it credits up to now.
	Going idle was noticed late, so it credits back to the last interaction —
	clamped to now in case a stray future timestamp arrives.
*/
const credit_timestamp = (to: PageState, now_ms: number, last_interaction_ms: number): number =>
	to === 'idle' ? Math.min(now_ms, last_interaction_ms) : now_ms;

// Whole seconds, rounded down so the reported figure never overstates.
const total_seconds = (total: ActiveTotal, now_ms: number): number =>
	Math.floor(total_ms(total, now_ms) / 1000);

// Collapse the three browser readings into a single state.
const compute_state = (reading: ActivityReading, idle_ms: number = IDLE_MS): PageState => {
	if (reading.visibility === 'hidden') return 'hidden';
	// A visible but unfocused window means the student is working in something
	// else on top of, or beside, the page.
	if (!reading.focused) return 'hidden';
	if (reading.ms_since_interaction > idle_ms) return 'idle';
	return 'active';
};

const is_active = (state: PageState): boolean => state === 'active';

/*
	Heartbeat URL.

	Both figures ride in the query string rather than a body because
	navigator.sendBeacon posts no body on unload, and the unload heartbeat is
	the one carrying the final total.

	`seconds` is the total for the whole row (the resumed baseline plus what
	this page session has accumulated), not a delta. Totals are idempotent: a
	duplicated or retried beacon can't double-count, and the server applies them
	with GREATEST so out-of-order arrivals can't walk the figure backwards.
*/
const heartbeat_url = (id: number, active: boolean, seconds: number): string => {
	const safe = Math.max(0, Math.floor(seconds));
	return `/api/pageviews/${id}/heartbeat?active=${active ? '1' : '0'}&active_seconds=${safe}`;
};

/*
	Whether a state change should be reported to the server immediately rather
	than waiting for the next scheduled heartbeat, and with what flag.

	The moment activity *stops* is the valuable one: reporting it as it happens
	pins active_datetime to the instant the student left and flushes the
	just-closed interval, rather than rounding to the heartbeat interval.
*/
const transition_heartbeat = (from: PageState, to: PageState): { send: boolean, active: boolean } => {
	if (from === to) return { send: false, active: false };
	const involves_active = is_active(from) || is_active(to);
	return { send: involves_active, active: involves_active };
};

export {
	compute_state,
	is_active,
	heartbeat_url,
	transition_heartbeat,
	new_total,
	begin_active,
	end_active,
	total_ms,
	total_seconds,
	credit_timestamp,
	IDLE_MS,
};

export type { PageState, ActivityReading, ActiveTotal };
