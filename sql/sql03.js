// Setup of initial database.

module.exports.sql03 = [
	'INSERT INTO schema_version (idversion) VALUES (3);',
	'ALTER TABLE ifLevels DROP COLUMN score;'
]; 
