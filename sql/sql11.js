// Setup of initial database.

module.exports.sql11 = [
	'ALTER TABLE iflevels ADD COLUMN show_score_after_completing TINYINT(1) NOT NULL DEFAULT 1 AFTER title;',
	'INSERT INTO schema_version (idversion) VALUES (11);',
];