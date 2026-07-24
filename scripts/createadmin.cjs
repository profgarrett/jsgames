#!/usr/bin/env node

require('@babel/register')({
	extensions: ['.js', '.jsx', '.ts', '.tsx'],
	ignore: [/node_modules/],
});

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const secret = require('../src/server/secret.js');

function normalizeUsername(username) {
	return (username || '').toLowerCase().trim();
}

function buildUserPayload({ username, password }) {
	const normalizedUsername = normalizeUsername(username);
	if (!normalizedUsername) {
		throw new Error('Username is empty in secret configuration');
	}
	if (!password) {
		throw new Error(`Password is empty for ${normalizedUsername}`);
	}

	return {
		username: normalizedUsername,
		hashed_password: bcrypt.hashSync(password, 8),
	};
}

function buildAdminUserPayload(config = secret) {
	return buildUserPayload({
		username: config.ADMIN_USERNAME,
		password: config.ADMIN_OVER_PASSWORD,
	});
}

function buildTestUserPayload(config = secret) {
	return buildUserPayload({
		username: config.TEST_USERNAME,
		password: config.TEST_PASSWORD,
	});
}

async function ensureUserAccount(payload, options = {}) {
	const mysqlConfig = options.mysqlConfig || {
		host: secret.MYSQL_HOST,
		user: secret.MYSQL_USER,
		password: secret.MYSQL_PASSWORD,
		database: secret.MYSQL_DATABASE,
	};

	const connection = await mysql.createConnection(mysqlConfig);
	try {
		const [existingRows] = await connection.execute(
			'SELECT iduser FROM users WHERE LOWER(username) = ? LIMIT 1',
			[payload.username],
		);

		if (existingRows.length > 0) {
			await connection.execute(
				'UPDATE users SET hashed_password = ?, ip = ? WHERE iduser = ?',
				[payload.hashed_password, '', existingRows[0].iduser],
			);
			return { created: false, username: payload.username };
		}

		await connection.execute(
			'INSERT INTO users (username, hashed_password, ip) VALUES (?, ?, ?)',
			[payload.username, payload.hashed_password, ''],
		);
		return { created: true, username: payload.username };
	} finally {
		await connection.end();
	}
}

async function ensureAdminUser(options = {}) {
	const payload = buildAdminUserPayload(options.secretConfig || secret);
	return ensureUserAccount(payload, options);
}

async function ensureTestUser(options = {}) {
	const payload = buildTestUserPayload(options.secretConfig || secret);
	return ensureUserAccount(payload, options);
}

async function main() {
	const adminResult = await ensureAdminUser();
	const testResult = await ensureTestUser();
	const adminAction = adminResult.created ? 'created' : 'updated';
	const testAction = testResult.created ? 'created' : 'updated';
	console.log(`Admin user ${adminAction}: ${adminResult.username}`);
	console.log(`Test user ${testAction}: ${testResult.username}`);
}

if (require.main === module) {
	main().catch((error) => {
		console.error(error.message);
		process.exitCode = 1;
	});
}

module.exports = {
	normalizeUsername,
	buildAdminUserPayload,
	buildTestUserPayload,
	ensureAdminUser,
	ensureTestUser,
	ensureUserAccount,
	main,
};
