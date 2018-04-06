// Setup of initial database.

module.exports.sql02 = [
	'ALTER TABLE `iflevels` ADD COLUMN `seed` VARCHAR(45) NOT NULL AFTER `updated`,ADD INDEX `username` (`username` ASC);',
	'ALTER TABLE `iflevels` ADD CONSTRAINT `username` FOREIGN KEY (`username`) REFERENCES `users` (`username`) ON DELETE NO ACTION ON UPDATE NO ACTION;',
	'INSERT INTO schema_version (idversion) VALUES (2);'
];