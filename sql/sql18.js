// Remove bad record with unterminated json

module.exports.sql18 = [
	'ALTER TABLE `jsgames`.`iflevels` ADD INDEX `created` (`created` ASC) VISIBLE, ADD INDEX `updated` (`updated` ASC) VISIBLE, ADD INDEX `code` (`code` ASC) VISIBLE, ADD INDEX `completed` (`completed` ASC) VISIBLE;',
	'INSERT INTO schema_version (idversion) VALUES (18);'
]; 
