// Setup of initial database.

module.exports.sql10 = [
	"ALTER TABLE sections ADD COLUMN title VARCHAR(115) NOT NULL DEFAULT '' AFTER term;", 
	'ALTER TABLE sections ADD COLUMN levels LONGTEXT NULL AFTER title;',
	'INSERT INTO schema_version (idversion) VALUES (10);',
];