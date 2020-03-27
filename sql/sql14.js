/** 
	Add support for saving props.
 */

module.exports.sql14 = [
	'ALTER TABLE users ADD COLUMN `ip` VARCHAR(255) NOT NULL DEFAULT "" AFTER `hashed_password`',
	'INSERT INTO schema_version (idversion) VALUES (14);',
];