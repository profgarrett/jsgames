/** 
	Not currently used, need to code for next version.
 */

module.exports.sql13 = [
	'ALTER TABLE iflevels ADD COLUMN `success` LONGTEXT NOT NULL AFTER title;',
	'INSERT INTO schema_version (idversion) VALUES (13);',
];