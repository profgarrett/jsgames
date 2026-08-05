const test = require('node:test');
const assert = require('node:assert/strict');

const { buildUserPayload, resolveSectionCode, createUserInSection } = require('../scripts/createuser.cjs');

// Minimal stand-in for a mysql2 connection. Returns queued results in order
// and records every statement it was given.
function fakeConnection(results) {
	const queries = [];
	let i = 0;
	return {
		queries,
		execute: async (sql, values) => {
			queries.push({ sql, values });
			return results[i++];
		},
		end: async () => {},
	};
}

test('buildUserPayload normalizes the username and hashes the password', () => {
	const payload = buildUserPayload({ username: ' NewStudent@WVU.edu ', password: 'pw' });

	assert.equal(payload.username, 'newstudent@wvu.edu');
	assert.match(payload.hashed_password, /^\$2[aby]\$/);
});

test('buildUserPayload rejects an empty username or password', () => {
	assert.throws(() => buildUserPayload({ username: '', password: 'pw' }), /Username is required/);
	assert.throws(() => buildUserPayload({ username: 'a', password: '' }), /Password is required/);
});

test('resolveSectionCode looks up the section by lowercased code', async () => {
	const connection = fakeConnection([[[{ idsection: 7, code: 'ACCT101', title: 'Intro' }]]]);
	const section = await resolveSectionCode(connection, ' ACCT101 ');

	assert.equal(section.idsection, 7);
	assert.deepEqual(connection.queries[0].values, ['acct101']);
});

test('resolveSectionCode throws on an unknown code', async () => {
	const connection = fakeConnection([[[]]]);
	await assert.rejects(() => resolveSectionCode(connection, 'nope'), /No section found/);
});

test('createUserInSection inserts a new user and a section membership', async () => {
	const connection = fakeConnection([
		[[{ idsection: 7, code: 'acct101', title: 'Intro' }]], // section lookup
		[[]], // existing user lookup
		[{ insertId: 42 }], // insert user
		[[]], // existing membership lookup
		[{ affectedRows: 1 }], // insert membership
	]);

	const result = await createUserInSection(
		{ username: 'Student@wvu.edu', password: 'pw', sectionCode: 'acct101' },
		{ connection });

	assert.equal(result.created, true);
	assert.equal(result.addedToSection, true);
	assert.equal(result.iduser, 42);
	assert.equal(result.role, 'student');
	assert.deepEqual(connection.queries[4].values, [42, 7, 'student']);
});

test('createUserInSection updates an existing user and skips a duplicate membership', async () => {
	const connection = fakeConnection([
		[[{ idsection: 7, code: 'acct101', title: 'Intro' }]],
		[[{ iduser: 42 }]], // user already exists
		[{ affectedRows: 1 }], // update password
		[[{ idusers_sections: 5 }]], // membership already exists
	]);

	const result = await createUserInSection(
		{ username: 'student@wvu.edu', password: 'pw', sectionCode: 'acct101' },
		{ connection });

	assert.equal(result.created, false);
	assert.equal(result.addedToSection, false);
	assert.equal(connection.queries.length, 4);
});

test('createUserInSection rejects an invalid role', async () => {
	await assert.rejects(
		() => createUserInSection(
			{ username: 'a@b.com', password: 'pw', sectionCode: 'acct101', role: 'wizard' },
			{ connection: fakeConnection([]) }),
		/Role must be one of/);
});
