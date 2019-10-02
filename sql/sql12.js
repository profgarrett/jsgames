// Setup of initial database.

module.exports.sql12 = [
	'ALTER TABLE iflevels ADD COLUMN show_progress TINYINT(1) NOT NULL DEFAULT 1 AFTER title;',
	'INSERT INTO schema_version (idversion) VALUES (12);',
];