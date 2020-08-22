// Setup of initial database.

module.exports.sql15 = [
	'ALTER TABLE iflevels ADD COLUMN predict_randomly_on_username TINYINT(1) NOT NULL DEFAULT 0 AFTER harsons_randomly_on_username;',
	'INSERT INTO schema_version (idversion) VALUES (15);'
]; 
