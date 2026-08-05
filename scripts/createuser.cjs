#!/usr/bin/env node

/*
	Interactive account creation.

	Prompts for a username, password, and section join code, then creates
	(or updates) the user and adds them to the matching section.

	Usage: npm run createuser
*/

require('@babel/register')({
	extensions: ['.js', '.jsx', '.ts', '.tsx'],
	ignore: [/node_modules/],
});

const readline = require('readline');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const secret = require('../src/server/secret.js');
const { normalizeUsername } = require('./createadmin.cjs');

const VALID_ROLES = ['student', 'faculty', 'admin'];


function buildUserPayload({ username, password }) {
	const normalizedUsername = normalizeUsername(username);
	if (!normalizedUsername) {
		throw new Error('Username is required');
	}
	if (!password) {
		throw new Error(`Password is required for ${normalizedUsername}`);
	}

	return {
		username: normalizedUsername,
		hashed_password: bcrypt.hashSync(password, 8),
	};
}


// Look up a section by its join code. Throws if the code does not match.
async function resolveSectionCode(connection, code) {
	const normalizedCode = (code || '').toLowerCase().trim();
	if (!normalizedCode) {
		throw new Error('Section code is required');
	}

	const [rows] = await connection.execute(
		'SELECT idsection, code, title FROM sections WHERE LOWER(code) = ? LIMIT 1',
		[normalizedCode],
	);

	if (rows.length === 0) {
		throw new Error(`No section found with code "${normalizedCode}"`);
	}
	return rows[0];
}


// Insert or update the user, then make sure they belong to the section.
async function createUserInSection({ username, password, sectionCode, role = 'student' }, options = {}) {
	if (!VALID_ROLES.includes(role)) {
		throw new Error(`Role must be one of: ${VALID_ROLES.join(', ')}`);
	}

	const payload = buildUserPayload({ username, password });

	const mysqlConfig = options.mysqlConfig || {
		host: secret.MYSQL_HOST,
		user: secret.MYSQL_USER,
		password: secret.MYSQL_PASSWORD,
		database: secret.MYSQL_DATABASE,
	};

	const connection = options.connection || await mysql.createConnection(mysqlConfig);

	try {
		const section = await resolveSectionCode(connection, sectionCode);

		const [existingRows] = await connection.execute(
			'SELECT iduser FROM users WHERE LOWER(username) = ? LIMIT 1',
			[payload.username],
		);

		let iduser;
		let created;

		if (existingRows.length > 0) {
			iduser = existingRows[0].iduser;
			created = false;
			await connection.execute(
				'UPDATE users SET hashed_password = ? WHERE iduser = ?',
				[payload.hashed_password, iduser],
			);
		} else {
			const [insertResults] = await connection.execute(
				'INSERT INTO users (username, hashed_password, ip) VALUES (?, ?, ?)',
				[payload.username, payload.hashed_password, ''],
			);
			iduser = insertResults.insertId;
			created = true;
		}

		const [membershipRows] = await connection.execute(
			'SELECT idusers_sections FROM users_sections WHERE iduser = ? AND idsection = ? LIMIT 1',
			[iduser, section.idsection],
		);

		let addedToSection = false;
		if (membershipRows.length === 0) {
			await connection.execute(
				'INSERT INTO users_sections (iduser, idsection, role) VALUES (?, ?, ?)',
				[iduser, section.idsection, role],
			);
			addedToSection = true;
		}

		return {
			created,
			addedToSection,
			iduser,
			username: payload.username,
			idsection: section.idsection,
			section_code: section.code,
			role,
		};
	} finally {
		if (!options.connection) await connection.end();
	}
}


////////////////////////////////////////////////////////////////////////
//   Command line prompts
////////////////////////////////////////////////////////////////////////

function ask(rl, question) {
	return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}



async function main() {
	const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
	readline.emitKeypressEvents(process.stdin, rl);

	let answers;
	try {
		const username = await ask(rl, 'Username (email): ');
		const password = await ask(rl, 'Password: ');
		const sectionCode = await ask(rl, 'Section code: ');
		const roleInput = await ask(rl, `Role [${VALID_ROLES.join('/')}] (default student): `);
		answers = { username, password, sectionCode, role: roleInput || 'student' };
	} finally {
		rl.close();
	}

	const result = await createUserInSection(answers);

	console.log(`User ${result.created ? 'created' : 'updated'}: ${result.username}`);
	console.log(result.addedToSection
		? `Added to section ${result.section_code} as ${result.role}`
		: `Already a member of section ${result.section_code}`);
}


if (require.main === module) {
	main().catch(error => {
		console.error(error.message);
		process.exitCode = 1;
	});
}

module.exports = {
	VALID_ROLES,
	buildUserPayload,
	resolveSectionCode,
	createUserInSection,
	main,
};
