/*
	Client-side view of the current user.

	The session cookie is httpOnly, so client JS can no longer read it directly.
	Instead we fetch the identity once from the server (/api/users/login/status),
	cache it in this module, and hand it out synchronously via getUserFromBrowser()
	so existing call sites keep working unchanged.

	Call loadUserFromServer() at app startup (before render) and again after any
	login, so the cache stays in sync with the session.
*/

type BrowserUserType = {
	username: string,
	isAdmin: boolean
};

// Module-level cache. Populated by loadUserFromServer().
let _cachedUser: BrowserUserType = { username: '', isAdmin: false };


/**
	Fetch the current user from the server and update the cache.
	Returns the freshly loaded user. Safe to call multiple times.
*/
export async function loadUserFromServer(): Promise<BrowserUserType> {
	try {
		const res = await fetch('/api/users/login/status', {
			credentials: 'include',
			headers: { 'Accept': 'application/json' },
		});
		const json = await res.json();
		_cachedUser = {
			username: typeof json.username === 'string' ? json.username : '',
			isAdmin: json.isAdmin === true,
		};
	} catch {
		_cachedUser = { username: '', isAdmin: false };
	}
	return _cachedUser;
}


/**
	Return information about the current user (synchronous, from cache).

	If the user isn't logged in, username === ''.
*/
export function getUserFromBrowser(): BrowserUserType {
	return _cachedUser;
}
