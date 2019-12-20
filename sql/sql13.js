/** 
	Add support for saving props.
 */

module.exports.sql13 = [
	'ALTER TABLE iflevels ADD COLUMN `props` LONGTEXT AFTER title;',
	'ALTER TABLE iflevels ADD COLUMN `props_version` INT AFTER title;',
	'INSERT INTO schema_version (idversion) VALUES (13);',
];