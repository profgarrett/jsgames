// Tests for src/app/pages/pageviewActivity.ts
//
// The engagement rules behind PageviewTracker: deciding whether a page counts
// as active, and which state changes are worth an immediate heartbeat.

const { test, describe } = require('node:test');
const assert = require('node:assert');

const {
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
} = require('../src/app/pages/pageviewActivity.ts');

// Convenience: a reading of a page being actively used.
const reading = (over = {}) => ({
	visibility: 'visible',
	focused: true,
	ms_since_interaction: 0,
	...over,
});

describe('compute_state', () => {
	test('visible, focused, recently touched is active', () => {
		assert.strictEqual(compute_state(reading()), 'active');
		assert.strictEqual(compute_state(reading({ ms_since_interaction: IDLE_MS - 1 })), 'active');
	});

	test('a backgrounded tab is hidden', () => {
		assert.strictEqual(compute_state(reading({ visibility: 'hidden' })), 'hidden');
	});

	test('visible but unfocused is hidden (side-by-side window)', () => {
		assert.strictEqual(compute_state(reading({ focused: false })), 'hidden');
	});

	test('hidden wins over idle when both apply', () => {
		const state = compute_state(reading({
			visibility: 'hidden',
			ms_since_interaction: IDLE_MS * 10,
		}));
		assert.strictEqual(state, 'hidden');
	});

	test('no interaction past the threshold is idle, not hidden', () => {
		assert.strictEqual(compute_state(reading({ ms_since_interaction: IDLE_MS + 1 })), 'idle');
	});

	test('the threshold boundary itself still counts as active', () => {
		assert.strictEqual(compute_state(reading({ ms_since_interaction: IDLE_MS })), 'active');
	});

	test('accepts a custom idle threshold', () => {
		assert.strictEqual(compute_state(reading({ ms_since_interaction: 500 }), 100), 'idle');
		assert.strictEqual(compute_state(reading({ ms_since_interaction: 50 }), 100), 'active');
	});
});

describe('is_active', () => {
	test('only the active state counts as engaged', () => {
		assert.strictEqual(is_active('active'), true);
		assert.strictEqual(is_active('idle'), false);
		assert.strictEqual(is_active('hidden'), false);
	});
});

describe('heartbeat_url', () => {
	test('carries both figures in the query string', () => {
		assert.strictEqual(
			heartbeat_url(12, true, 90),
			'/api/pageviews/12/heartbeat?active=1&active_seconds=90'
		);
		assert.strictEqual(
			heartbeat_url(12, false, 0),
			'/api/pageviews/12/heartbeat?active=0&active_seconds=0'
		);
	});

	test('never emits a fractional or negative total', () => {
		assert.match(heartbeat_url(1, true, 12.7), /active_seconds=12$/);
		assert.match(heartbeat_url(1, true, -5), /active_seconds=0$/);
	});
});

describe('active time accumulator', () => {
	test('a fresh total is empty and stopped', () => {
		const t = new_total();
		assert.strictEqual(total_ms(t, 1000), 0);
		assert.strictEqual(t.active_since_ms, null);
	});

	test('seeds from a baseline without going negative', () => {
		assert.strictEqual(total_ms(new_total(5000), 0), 5000);
		assert.strictEqual(total_ms(new_total(-5000), 0), 0);
	});

	test('counts an open interval as it runs', () => {
		const t = begin_active(new_total(), 1000);
		assert.strictEqual(total_ms(t, 1000), 0);
		assert.strictEqual(total_ms(t, 4000), 3000);
	});

	test('banks a closed interval', () => {
		let t = begin_active(new_total(), 1000);
		t = end_active(t, 4000);
		assert.strictEqual(total_ms(t, 999999), 3000);
	});

	test('sums several intervals, excluding the gaps between them', () => {
		let t = new_total();
		t = begin_active(t, 0);
		t = end_active(t, 10000);      // 10s active
		t = begin_active(t, 60000);    // 50s gap, not counted
		t = end_active(t, 65000);      // 5s active
		assert.strictEqual(total_ms(t, 999999), 15000);
	});

	test('begin_active is idempotent, so repeated readings do not restart the clock', () => {
		let t = begin_active(new_total(), 1000);
		t = begin_active(t, 3000);
		// Still measured from 1000, not 3000.
		assert.strictEqual(total_ms(t, 5000), 4000);
	});

	test('end_active on a stopped clock changes nothing', () => {
		let t = end_active(new_total(2000), 999999);
		assert.strictEqual(total_ms(t, 999999), 2000);
	});

	test('ignores a backwards clock rather than subtracting time', () => {
		const t = begin_active(new_total(1000), 5000);
		// Reading from before the interval started.
		assert.strictEqual(total_ms(t, 4000), 1000);
		assert.strictEqual(total_ms(end_active(t, 4000), 9999), 1000);
	});

	test('rounds down to whole seconds so the total never overstates', () => {
		const t = begin_active(new_total(), 0);
		assert.strictEqual(total_seconds(t, 1999), 1);
		assert.strictEqual(total_seconds(t, 2000), 2);
	});
});

describe('credit_timestamp', () => {
	test('going hidden credits up to the present moment', () => {
		// Observed as it happens, so nothing is guessed.
		assert.strictEqual(credit_timestamp('hidden', 50000, 10000), 50000);
	});

	test('going idle credits back to the last interaction', () => {
		// Idleness is noticed IDLE_MS late; crediting to now would hand the
		// student two minutes of engagement for having walked away.
		assert.strictEqual(credit_timestamp('idle', 50000, 10000), 10000);
	});

	test('never credits past the present, even with a stray future interaction', () => {
		assert.strictEqual(credit_timestamp('idle', 50000, 90000), 50000);
	});
});

describe('accumulator + credit_timestamp together', () => {
	test('walking away banks only the time up to the last interaction', () => {
		let t = begin_active(new_total(), 0);
		const last_interaction = 30000;
		const noticed_at = last_interaction + IDLE_MS;
		t = end_active(t, credit_timestamp('idle', noticed_at, last_interaction));
		// 30s of real use, not the 150s that elapsed before we noticed.
		assert.strictEqual(total_seconds(t, noticed_at), 30);
	});

	test('switching tabs banks the full stretch up to the switch', () => {
		let t = begin_active(new_total(), 0);
		t = end_active(t, credit_timestamp('hidden', 45000, 44000));
		assert.strictEqual(total_seconds(t, 45000), 45);
	});
});

describe('transition_heartbeat', () => {
	test('sends nothing when the state has not changed', () => {
		assert.deepStrictEqual(transition_heartbeat('active', 'active'), { send: false, active: false });
		assert.deepStrictEqual(transition_heartbeat('hidden', 'hidden'), { send: false, active: false });
	});

	test('reports active when leaving the active state', () => {
		// Pins active_datetime to the instant the student switched away.
		assert.deepStrictEqual(transition_heartbeat('active', 'hidden'), { send: true, active: true });
		assert.deepStrictEqual(transition_heartbeat('active', 'idle'), { send: true, active: true });
	});

	test('reports active when returning to the active state', () => {
		assert.deepStrictEqual(transition_heartbeat('hidden', 'active'), { send: true, active: true });
		assert.deepStrictEqual(transition_heartbeat('idle', 'active'), { send: true, active: true });
	});

	test('stays quiet moving between two inactive states', () => {
		// Nothing to record: neither side advances active_datetime, and the
		// scheduled heartbeat already keeps end_datetime current.
		assert.deepStrictEqual(transition_heartbeat('idle', 'hidden'), { send: false, active: false });
		assert.deepStrictEqual(transition_heartbeat('hidden', 'idle'), { send: false, active: false });
	});
});
