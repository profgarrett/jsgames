// Remove bad record with unterminated json

module.exports.sql17 = [
	'delete from iflevels where _id = 3372',
	'INSERT INTO schema_version (idversion) VALUES (17);'
]; 
