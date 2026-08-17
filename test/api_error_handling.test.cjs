// Tests for the "database is down" failure path.
//
// Covers the three pure pieces that decide what a student sees when mysqld is
// stopped:
//   1. src/server/mysql.ts       - is this error "the DB is unreachable" or "my SQL is wrong"?
//   2. src/server/network.ts     - what status/body/headers does the API answer with?
//   3. src/app/components/Api.ts - what sentence does the browser show?
//
// The express wiring itself is not covered here: requiring src/server/app.ts would
// bind a port and open a real connection, and the rest of this suite deliberately
// stands up no server and no test database.

const { test, describe } = require('node:test');
const assert = require('node:assert');

const {
	is_db_unavailable_error,
	make_db_unavailable_error,
	DB_UNAVAILABLE_CODES,
} = require('../src/server/mysql.ts');

const {
	build_api_error_response,
	serialize_error_for_log,
} = require('../src/server/network.ts');

const { friendly_message } = require('../src/app/components/Api.ts');


// mysql2 throws Error objects carrying a .code, so fake them the same way.
function mysql_error(code, message) {
	const e = new Error(message || code);
	e.code = code;
	return e;
}


describe('is_db_unavailable_error', () => {

	test('true for connection-level failures', () => {
		// The big one: this is what a stopped mysqld produces.
		assert.strictEqual(is_db_unavailable_error(mysql_error('ECONNREFUSED')), true);

		assert.strictEqual(is_db_unavailable_error(mysql_error('ETIMEDOUT')), true);
		assert.strictEqual(is_db_unavailable_error(mysql_error('ENOTFOUND')), true);
		assert.strictEqual(is_db_unavailable_error(mysql_error('PROTOCOL_CONNECTION_LOST')), true);
		assert.strictEqual(is_db_unavailable_error(mysql_error('ER_ACCESS_DENIED_ERROR')), true);
		assert.strictEqual(is_db_unavailable_error(mysql_error('ER_BAD_DB_ERROR')), true);
		assert.strictEqual(is_db_unavailable_error(mysql_error('ER_CON_COUNT_ERROR')), true);
	});

	test('false for our own broken queries', () => {
		// A syntax error is a bug in our SQL. It must stay a noisy 500, not get
		// dressed up as "please try again in a few minutes".
		assert.strictEqual(is_db_unavailable_error(mysql_error('ER_PARSE_ERROR')), false);
		assert.strictEqual(is_db_unavailable_error(mysql_error('ER_BAD_FIELD_ERROR')), false);
		assert.strictEqual(is_db_unavailable_error(mysql_error('ER_DUP_ENTRY')), false);
	});

	test('false for plain errors and non-errors', () => {
		assert.strictEqual(is_db_unavailable_error(new Error('SQL query is empty')), false);
		assert.strictEqual(is_db_unavailable_error(null), false);
		assert.strictEqual(is_db_unavailable_error(undefined), false);
		assert.strictEqual(is_db_unavailable_error({}), false);
		assert.strictEqual(is_db_unavailable_error('ECONNREFUSED'), false);
	});

	test('every listed code is recognised', () => {
		for(const code of DB_UNAVAILABLE_CODES) {
			assert.strictEqual(is_db_unavailable_error(mysql_error(code)), true, code);
		}
	});
});


describe('make_db_unavailable_error', () => {

	test('is still recognised after wrapping', () => {
		// run_mysql_query wraps, then app.ts re-checks. The tag has to survive the trip.
		const wrapped = make_db_unavailable_error(mysql_error('ECONNREFUSED'));

		assert.strictEqual(is_db_unavailable_error(wrapped), true);
		assert.strictEqual(wrapped.error_code, 'DB_UNAVAILABLE');
	});

	test('keeps the underlying code in the message and the cause', () => {
		const cause = mysql_error('ECONNREFUSED', 'connect ECONNREFUSED 127.0.0.1:3306');
		const wrapped = make_db_unavailable_error(cause);

		assert.ok(wrapped.message.includes('ECONNREFUSED'), wrapped.message);
		assert.strictEqual(wrapped.cause, cause);
	});

	test('is a real Error, so throw/stack still work', () => {
		const wrapped = make_db_unavailable_error(mysql_error('ETIMEDOUT'));

		assert.ok(wrapped instanceof Error);
		assert.ok(typeof wrapped.stack === 'string' && wrapped.stack.length > 0);
	});
});


describe('build_api_error_response - database down', () => {

	const response = () => build_api_error_response(make_db_unavailable_error(mysql_error('ECONNREFUSED')), false);

	test('answers 503, not 500', () => {
		// 503 is the difference between "we are broken" and "you are broken".
		assert.strictEqual(response().status, 503);
	});

	test('carries the DB_UNAVAILABLE code the client switches on', () => {
		assert.strictEqual(response().body.error_code, 'DB_UNAVAILABLE');
	});

	test('asks callers to back off', () => {
		assert.strictEqual(response().headers['Retry-After'], '60');
	});

	test('tells the student it is not their fault', () => {
		assert.ok(response().body.message.includes('not with anything you typed'), response().body.message);
	});

	test('accepts a raw mysql error too, not just a wrapped one', () => {
		// Anything bypassing run_mysql_query's wrapper should still be classified.
		const raw = build_api_error_response(mysql_error('ECONNREFUSED'), false);
		assert.strictEqual(raw.status, 503);
		assert.strictEqual(raw.body.error_code, 'DB_UNAVAILABLE');
	});
});


describe('build_api_error_response - everything else', () => {

	test('an ordinary error is a 500 with no Retry-After', () => {
		const r = build_api_error_response(new Error('boom'), false);

		assert.strictEqual(r.status, 500);
		assert.strictEqual(r.body.error_code, 'SERVER_ERROR');
		assert.strictEqual(r.headers['Retry-After'], undefined);
	});

	test('a broken query is a 500, not a 503', () => {
		const r = build_api_error_response(mysql_error('ER_PARSE_ERROR'), false);
		assert.strictEqual(r.status, 500);
		assert.strictEqual(r.body.error_code, 'SERVER_ERROR');
	});

	test('handles being passed junk', () => {
		for(const junk of [null, undefined, 'a string', 42]) {
			const r = build_api_error_response(junk, false);
			assert.strictEqual(r.status, 500);
			assert.ok(r.body.message.length > 0);
		}
	});
});


describe('build_api_error_response - leaks', () => {

	test('production responses contain no stack and no file paths', () => {
		// The old default express handler shipped absolute paths like
		// /Users/ndg00008/Documents/... straight to the browser.
		const err = new Error('boom');
		const serialized = JSON.stringify(build_api_error_response(err, false).body);

		assert.strictEqual(build_api_error_response(err, false).body.debug, undefined);
		assert.ok(!serialized.includes('/src/server/'), serialized);
		assert.ok(!serialized.includes('boom'), serialized);
	});

	test('development responses do include the stack', () => {
		const body = build_api_error_response(new Error('boom'), true).body;

		assert.ok(body.debug);
		assert.strictEqual(body.debug.message, 'boom');
		assert.ok(typeof body.debug.stack === 'string');
	});
});


describe('serialize_error_for_log', () => {

	test('does not write an empty object for a real error', () => {
		// JSON.stringify(new Error('x')) === '{}': message/stack/code are all
		// non-enumerable. That is what log.txt used to record for every failure.
		const s = serialize_error_for_log(mysql_error('ECONNREFUSED', 'connect ECONNREFUSED'));

		assert.notStrictEqual(s, '{}');
		assert.ok(s.includes('ECONNREFUSED'), s);
		assert.ok(s.includes('connect ECONNREFUSED'), s);
	});

	test('records our own DB_UNAVAILABLE tag, so log.txt is greppable', () => {
		const s = serialize_error_for_log(make_db_unavailable_error(mysql_error('ECONNREFUSED')));
		assert.ok(s.includes('DB_UNAVAILABLE'), s);
	});

	test('still handles plain objects and strings', () => {
		assert.ok(serialize_error_for_log({ a: 1 }).includes('"a":1'));
		assert.ok(serialize_error_for_log('plain').includes('plain'));
	});
});


describe('friendly_message (client copy)', () => {

	test('database copy names the action, the blame and the error code', () => {
		const m = friendly_message('DB_UNAVAILABLE', 'log you in');

		assert.ok(m.includes('log you in'), m);
		assert.ok(m.includes('not with anything you typed'), m);
		assert.ok(m.includes('DB_UNAVAILABLE'), m);   // something to paste into an email
	});

	test('an unreachable server is not blamed on the database', () => {
		const m = friendly_message('NETWORK', 'log you in');

		assert.ok(m.toLowerCase().includes('internet connection'), m);
		assert.ok(!m.toLowerCase().includes('database'), m);
	});

	test('only UNAUTHORIZED blames the user', () => {
		assert.ok(friendly_message('UNAUTHORIZED').includes('Invalid username or password'));

		for(const code of ['DB_UNAVAILABLE', 'SERVER_ERROR', 'BAD_RESPONSE', 'NETWORK']) {
			assert.ok(!friendly_message(code, 'log you in').includes('Invalid username'), code);
		}
	});

	test('every code produces a real sentence', () => {
		for(const code of ['NETWORK', 'DB_UNAVAILABLE', 'UNAUTHORIZED', 'NOT_FOUND', 'SERVER_ERROR', 'BAD_RESPONSE', 'APP']) {
			const m = friendly_message(code, 'log you in');
			assert.ok(m.length > 20 && m.trim().endsWith('.'), code + ': ' + m);
		}
	});
});
