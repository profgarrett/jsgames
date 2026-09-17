/**
	A minimal, dependency-free, in-memory rate limiter.

	Not distributed -- counts live in this Node process's memory, so they reset
	on restart and aren't shared across multiple server instances. That's an
	acceptable tradeoff for this app's single-server deployment; if that ever
	changes, swap this for a shared store (e.g. a rate-limit table in MySQL, or
	express-rate-limit backed by Redis) without changing callers' shape.

	Used to blunt scripted abuse of unauthenticated / self-service routes --
	e.g. POST /api/users/prolific_login (anyone can mint an account) and
	POST /api/levels/new_level_by_code/:code (anyone logged in can start an
	unlimited number of attempts) -- where each attempt can drive real cost
	(an AI chat page's OpenAI calls) or just load.
*/

type Bucket = { count: number, resetAt: number };

const buckets: Map<string, Bucket> = new Map();

/**
	Fixed-window check-and-increment.

	@key        Identifies what's being limited, e.g. 'prolific_login:' + ip.
				Callers should namespace their own keys (different routes must
				not share a bucket).
	@max        Maximum allowed calls within the window.
	@window_ms  Window length, in milliseconds.

	@return     true if this call is allowed (and has been counted against the
				window), false if the caller is over the limit for this window.
*/
function rate_limit_check(key: string, max: number, window_ms: number): boolean {
	const now = Date.now();
	const existing = buckets.get(key);

	if (typeof existing === 'undefined' || existing.resetAt <= now) {
		buckets.set(key, { count: 1, resetAt: now + window_ms });
		return true;
	}

	if (existing.count >= max) return false;

	existing.count += 1;
	return true;
}

// Occasionally drop expired buckets so this doesn't grow forever under
// sustained traffic. Cheap and approximate is fine -- this is a safety valve,
// not a precise accounting system.
setInterval(() => {
	const now = Date.now();
	buckets.forEach((bucket, key) => {
		if (bucket.resetAt <= now) buckets.delete(key);
	});
}, 10 * 60 * 1000).unref();

export { rate_limit_check };
