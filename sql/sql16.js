// Setup of initial database.

module.exports.sql16 = [
	'ALTER TABLE iflevels ADD COLUMN version DECIMAL(6,2) NOT NULL DEFAULT 0 AFTER harsons_randomly_on_username;',
	'INSERT INTO schema_version (idversion) VALUES (16);'
]; 
