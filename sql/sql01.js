// Setup of initial database.

module.exports.sql01 = [
	'CREATE TABLE `users` (`iduser` INT NOT NULL AUTO_INCREMENT, `username` VARCHAR(100) NOT NULL,   `hashed_password` VARCHAR(100) NOT NULL, PRIMARY KEY (`iduser`), UNIQUE INDEX `username_UNIQUE` (`username` ASC));',
	'CREATE TABLE `iflevels` ( `_id` INT NOT NULL AUTO_INCREMENT,   `username` VARCHAR(100) NOT NULL,   `code` VARCHAR(45) NOT NULL,  `title` VARCHAR(255) NOT NULL,   `description` LONGTEXT NOT NULL,   `completed` TINYINT(1) NOT NULL,  `pages` LONGTEXT NOT NULL, `history` LONGTEXT NOT NULL, `created` DATETIME NOT NULL, `updated` DATETIME NOT NULL, PRIMARY KEY (`_id`));',
	'CREATE TABLE `schema_version` ( `idversion` INT NOT NULL,   PRIMARY KEY (`idversion`));',
	'INSERT INTO schema_version (idversion) VALUES (1);'
]; 