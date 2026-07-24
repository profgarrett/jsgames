const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeUsername, buildAdminUserPayload, buildTestUserPayload } = require('../scripts/createadmin.cjs');

test('normalizeUsername lowercases and trims the configured name', () => {
	assert.equal(normalizeUsername(' ProfGarrett '), 'profgarrett');
	assert.equal(normalizeUsername(''), '');
});

test('buildAdminUserPayload creates a bcrypt hash from the secret password', () => {
	const payload = buildAdminUserPayload({
		ADMIN_USERNAME: ' ProfGarrett ',
		ADMIN_OVER_PASSWORD: 'super-secret',
	});

	assert.equal(payload.username, 'profgarrett');
	assert.match(payload.hashed_password, /^\$2[aby]\$/);
});

test('buildTestUserPayload creates a bcrypt hash for the load-test account', () => {
	const payload = buildTestUserPayload({
		TEST_USERNAME: ' ProfGarrett+Test@Example.com ',
		TEST_PASSWORD: 'another-secret',
	});

	assert.equal(payload.username, 'profgarrett+test@example.com');
	assert.match(payload.hashed_password, /^\$2[aby]\$/);
});
