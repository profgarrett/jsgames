// Setup of initial database.

module.exports.sql03 = [
	'CREATE TABLE feedback ( id INT NOT NULL AUTO_INCREMENT, username VARCHAR(100) NOT NULL, message LONGTEXT NOT NULL, data LONGTEXT NOT NULL, created DATETIME NOT NULL, code VARCHAR(45) NOT NULL, PRIMARY KEY (id), INDEX username (username ASC), INDEX created (created ASC), INDEX code (code ASC), CONSTRAINT user FOREIGN KEY (username) REFERENCES users (username) ON DELETE NO ACTION ON UPDATE NO ACTION);',
	'INSERT INTO schema_version (idversion) VALUES (3);'
]; 
