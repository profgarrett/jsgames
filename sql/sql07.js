// Setup of initial database.

module.exports.sql07 = [
	'ALTER TABLE iflevels ADD COLUMN standardize_formula_case TINYINT(1) NOT NULL DEFAULT 0 AFTER type;',
	'INSERT INTO schema_version (idversion) VALUES (7);'
]; 
