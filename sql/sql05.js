// Setup of initial database.

module.exports.sql05 = [
	'ALTER TABLE iflevels ADD COLUMN harsons_randomly_on_username TINYINT(1) NOT NULL DEFAULT 0 AFTER type;',
	'INSERT INTO schema_version (idversion) VALUES (5);'
]; 
