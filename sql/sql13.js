/** 
	Not currently used, need to code for next version.
 */

module.exports.sql13 = [
	'ALTER TABLE iflevels ADD COLUMN `test_score_as_percent` INT AFTER title;',
	'INSERT INTO schema_version (idversion) VALUES (13);',
];