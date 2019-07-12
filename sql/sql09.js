// Setup of initial database.

module.exports.sql09 = [
	'CREATE TABLE passwordresets (   `idpasswordresets` INT NOT NULL AUTO_INCREMENT,   `created` DATETIME NULL,   `iduser` INT NOT NULL,   `email` VARCHAR(155) NULL,   `code` VARCHAR(155) NULL,   `used` TINYINT(1) NOT NULL DEFAULT 0,   PRIMARY KEY (`idpasswordresets`),   INDEX `users_idx` (`iduser` ASC),   CONSTRAINT `fk_to_users`     FOREIGN KEY (`iduser`)     REFERENCES users (`iduser`)     ON DELETE NO ACTION     ON UPDATE NO ACTION);',
	'INSERT INTO schema_version (idversion) VALUES (9);',
];