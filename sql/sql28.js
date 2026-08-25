// Student nicknames, uploaded from a Blackboard roster export.
//
//   nicknames  - one row per student on an uploaded roster. `username` is the
//     Username column straight out of the export (eg 'bj000'), NOT an email.
//     The email is derived at match time as username@STUDENT_EMAIL_DOMAIN
//     (src/server/secret.js) so that changing the campus domain does not
//     require rewriting stored rows. A value that already contains '@' is
//     treated as a complete address and used as-is.
//
//     UNIQUE on username is what makes re-uploading a roster an update rather
//     than a pile of duplicates -- see the ON DUPLICATE KEY UPDATE in
//     src/server/app_nicknames.ts. Class, availability, last access and the
//     rest of the export's columns are deliberately not stored.
//
//   users.nickname - the display name ('Bob Jones') copied out of nicknames
//     the first time a matching student logs in, or by the backfill that runs
//     at the end of an upload. Nullable, and only ever written when it is
//     null/blank, so a name set by hand is never overwritten by a later
//     roster upload.

// REMINDER: DO NOT prefix tables with the database name.
module.exports.sql28 = [

	`CREATE TABLE nicknames (
		idnickname INT NOT NULL AUTO_INCREMENT,
		username VARCHAR(255) NOT NULL,
		first_name VARCHAR(100) NOT NULL,
		last_name VARCHAR(100) NOT NULL,
		student_id VARCHAR(45) NULL,
		updated DATETIME NOT NULL,
		PRIMARY KEY (idnickname),
		UNIQUE INDEX nicknames_username_UNIQUE (username ASC)
	);`,

	'ALTER TABLE users ADD COLUMN nickname VARCHAR(255) NULL AFTER username;',

	'INSERT INTO schema_version (idversion) VALUES (28);',
];
