/*
	One place where a call to our own API turns into either parsed data or an Error
	whose .message is already something you can show a student.

	Why this exists:

	Every container used to write its own fetch().then(r => r.json()) chain. That works
	right up until the server answers with something that is not JSON -- which is what
	happens whenever the database is down, a proxy hiccups, or a route 404s. The chain
	then rejects with a browser SyntaxError, and the container faithfully renders
	"Unexpected token '<', "<!DOCTYPE "... is not valid JSON" in a red alert box.

	So: check the status and the content type before parsing, map the result to a code,
	and attach human copy to the error. Call sites keep their existing
	.catch(e => setMessage(e.message)) shape and get better text for free.

	The errors are plain Errors with extra properties rather than an Error subclass:
	this code is transpiled to ES5 (browserslist still lists IE 10), and an
	ES5-transpiled subclass of a builtin breaks instanceof.
*/

export type ApiErrorCode =
	'NETWORK'          // fetch itself rejected: server unreachable, offline, DNS
	| 'DB_UNAVAILABLE' // server is up, database is not (503 from app.ts)
	| 'UNAUTHORIZED'   // 401 / 403
	| 'NOT_FOUND'      // 404
	| 'SERVER_ERROR'   // 500, or any other non-ok status
	| 'BAD_RESPONSE'   // 200, but the body was not JSON
	| 'APP';           // server said 200 with { error: ... } / { _error: ... }

export type ApiError = Error & {
	api_code: ApiErrorCode,
	status: number,
};

export interface ApiOptions {
	// Verb phrase describing what the user was trying to do, eg 'log you in'.
	// Used to write the failure sentence. Keep it lowercase and un-punctuated.
	action?: string;

	// Override the copy for a particular call. Login uses this to add a sentence
	// promising the student their password is not the problem.
	db_message?: string;
	unauthorized_message?: string;
}

const SUPPORT_EMAIL = 'profgarrett@gmail.com';


function api_error(code: ApiErrorCode, status: number, message: string): ApiError {
	const e = new Error(message) as ApiError;

	e.api_code = code;
	e.status = status;

	return e;
}


/*
	Human copy for each failure mode.

	Rules of thumb used here:
		- say whose fault it is (ours), because the default assumption is "I typed my password wrong",
		- say what to do next (wait, retry, email),
		- give a code worth pasting into that email.
*/
export function friendly_message(code: ApiErrorCode, action = 'finish that'): string {
	switch(code) {

		case 'NETWORK':
			return 'We can\'t reach Excel.fun right now, so we can\'t ' + action + '. '
				+ 'Check your internet connection and try again in a few minutes.';

		case 'DB_UNAVAILABLE':
			return 'The site\'s database is temporarily unavailable, so we can\'t ' + action + ' right now. '
				+ 'This is a problem on our end, not with anything you typed. '
				+ 'Please try again in a few minutes. If it is still down after 15 minutes, '
				+ 'email ' + SUPPORT_EMAIL + ' and mention error code DB_UNAVAILABLE.';

		case 'UNAUTHORIZED':
			return 'Invalid username or password.';

		case 'NOT_FOUND':
			return 'That page is no longer available. If you followed a link from the site, '
				+ 'please email ' + SUPPORT_EMAIL + '.';

		case 'BAD_RESPONSE':
		case 'SERVER_ERROR':
		default:
			return 'Something went wrong on our end, so we couldn\'t ' + action + '. '
				+ 'Please try again in a few minutes. If it keeps happening, email ' + SUPPORT_EMAIL + '.';
	}
}


// Content-Type can carry a charset, so match on the prefix.
function is_json_response(res: Response): boolean {
	const type = res.headers.get('content-type') || '';
	return type.indexOf('application/json') === 0 || type.indexOf('+json') > -1;
}


async function request_json<T>(method: string, url: string, body: any, options: ApiOptions): Promise<T> {
	const action = options.action || 'finish that';
	let res: Response;

	// 1. Transport. A rejection here means we never reached the server at all.
	try {
		res = await fetch(url, {
			method,
			credentials: 'include',
			mode: 'same-origin',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: typeof body === 'undefined' ? undefined : JSON.stringify(body),
		});
	} catch {
		throw api_error('NETWORK', 0, friendly_message('NETWORK', action));
	}

	// 2. Read once, as text. The body may not be JSON, and res.json() would throw a
	//    browser parse error we would then have to apologise for.
	let text: string;
	try {
		text = await res.text();
	} catch {
		text = '';
	}

	let json: any = null;
	if(is_json_response(res) && text !== '') {
		try {
			json = JSON.parse(text);
		} catch {
			json = null;
		}
	}

	// 3. Statuses we have specific copy for.
	if(res.status === 401 || res.status === 403) {
		throw api_error('UNAUTHORIZED', res.status,
			options.unauthorized_message || friendly_message('UNAUTHORIZED', action));
	}

	if(res.status === 503 || (json && json.error_code === 'DB_UNAVAILABLE')) {
		throw api_error('DB_UNAVAILABLE', res.status,
			options.db_message || friendly_message('DB_UNAVAILABLE', action));
	}

	if(res.status === 404) {
		throw api_error('NOT_FOUND', res.status, friendly_message('NOT_FOUND', action));
	}

	if(!res.ok) {
		throw api_error('SERVER_ERROR', res.status, friendly_message('SERVER_ERROR', action));
	}

	// 4. 200, but not JSON. Usually means a proxy or the SPA fallback answered instead
	//    of the API. Treat as a server problem, never as user error.
	if(json === null) {
		throw api_error('BAD_RESPONSE', res.status, friendly_message('BAD_RESPONSE', action));
	}

	/*
		5. This codebase's own convention: 200 with { error } or { _error }, carrying a
		token the caller switches on ('ExistingUser', 'InvalidCode', ...). Pass the token
		through untouched as the message so those call sites keep working.
	*/
	const app_error = json._error || json.error;
	if(app_error) {
		throw api_error('APP', res.status, String(app_error));
	}

	return json as T;
}


export function postJson<T = any>(url: string, body: any, options: ApiOptions = {}): Promise<T> {
	return request_json<T>('POST', url, body, options);
}

export function getJson<T = any>(url: string, options: ApiOptions = {}): Promise<T> {
	return request_json<T>('GET', url, undefined, options);
}


export interface HealthStatus {
	server_reachable: boolean;
	db_up: boolean;
}

/*
	Is the database up? Never throws -- callers use this to decide whether to warn, and
	a failing warning check should not itself break the page.

	server_reachable is reported separately so the client does not blame the database
	when the real problem is the student's wifi.
*/
export async function get_health(): Promise<HealthStatus> {
	try {
		const res = await fetch('/api/health', { headers: { 'Accept': 'application/json' } });

		if(!is_json_response(res)) return { server_reachable: true, db_up: false };

		const json = await res.json();

		return { server_reachable: true, db_up: !!json && json.db === 'up' };
	} catch {
		return { server_reachable: false, db_up: false };
	}
}
