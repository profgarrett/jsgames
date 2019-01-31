// Setup of initial database.

module.exports.sql08 = [

	'CREATE TABLE sections ( idsection INT NOT NULL AUTO_INCREMENT, code VARCHAR(45) NOT NULL,  year INT NOT NULL, term VARCHAR(45) NOT NULL, opens DATE NOT NULL,  closes DATE NOT NULL, PRIMARY KEY (idsection), UNIQUE INDEX code_UNIQUE (code ASC));',

	"CREATE TABLE users_sections (idusers_sections INT NOT NULL AUTO_INCREMENT, iduser INT NOT NULL,  idsection INT NOT NULL, role VARCHAR(10) NOT NULL DEFAULT 'student', PRIMARY KEY (idusers_sections), INDEX user_idx (iduser ASC), INDEX section_idx (idsection ASC), CONSTRAINT users   FOREIGN KEY (iduser)   REFERENCES users (iduser)  ON DELETE NO ACTION   ON UPDATE NO ACTION, CONSTRAINT sections   FOREIGN KEY (idsection)   REFERENCES sections (idsection)   ON DELETE NO ACTION   ON UPDATE NO ACTION);",

	'INSERT INTO schema_version (idversion) VALUES (8);',
];

// Useful code for adding bulk users to courses.
// INSERT INTO `jsgames`.`users_courses` (`idusers`, `idcourses`, `role`)  select iduser, 1, 'student' from users where iduser < 63