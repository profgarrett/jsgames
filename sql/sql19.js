// Add Google login support to the users table.
//   google_sub    - Google's stable subject id ("sub"); authoritative binding once captured.
//   auth_provider - 'password' (default, existing users) or 'google'.
// hashed_password stays but is optional for google-only users.

// REMINDER: DO NOT prefix tables with the database name.
module.exports.sql19 = [
	"ALTER TABLE users ADD COLUMN google_sub VARCHAR(64) NULL AFTER hashed_password, ADD COLUMN auth_provider VARCHAR(20) NOT NULL DEFAULT 'password' AFTER google_sub;",
	'ALTER TABLE users ADD UNIQUE INDEX `google_sub_UNIQUE` (`google_sub` ASC);',
	'INSERT INTO schema_version (idversion) VALUES (19);'
];
