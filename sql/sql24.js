// Add live quiz session tables (instructor-led, synchronous quiz).
//
//   quizsessions - one row per live session started by the instructor.
//     code                    - short join code, unique among non-ended sessions.
//     username / iduser       - the instructor who started the session.
//     page                    - the page slug the questions came from.
//     status                  - 'waiting' | 'active' | 'ended'.
//     questions_json          - the frozen, pre-shuffled question/option deck for
//                                this session (JSON), so every participant sees the
//                                same order. Includes which option is correct;
//                                never sent to a non-admin client wholesale.
//     current_question_index  - -1 while waiting, else index into questions_json.
//     created_datetime        - when the session was created.
//     started_datetime        - when the instructor moved past the waiting room.
//     ended_datetime          - when the instructor ended the session.
//
//   quizsession_participants - one row per student who joined a session.
//     Unique on (idsession, username) so rejoining updates the same row.
//
//   quizsession_answers - one row per answer submitted by a participant.
//     Unique on (idparticipant, question_index) so a student's first answer to a
//     question locks in; later attempts for the same question are rejected by
//     the application rather than overwriting the row.

// REMINDER: DO NOT prefix tables with the database name.
module.exports.sql24 = [
	`CREATE TABLE quizsessions (
		idsession INT NOT NULL AUTO_INCREMENT,
		code VARCHAR(8) NOT NULL,
		username VARCHAR(100) NOT NULL,
		iduser INT NULL,
		page VARCHAR(255) NOT NULL,
		status VARCHAR(10) NOT NULL DEFAULT 'waiting',
		questions_json LONGTEXT NOT NULL,
		current_question_index INT NOT NULL DEFAULT -1,
		created_datetime DATETIME NOT NULL,
		started_datetime DATETIME NULL,
		ended_datetime DATETIME NULL,
		PRIMARY KEY (idsession),
		INDEX quizsessions_code_idx (code ASC),
		INDEX quizsessions_username_idx (username ASC)
	);`,
	`CREATE TABLE quizsession_participants (
		idparticipant INT NOT NULL AUTO_INCREMENT,
		idsession INT NOT NULL,
		username VARCHAR(100) NOT NULL,
		iduser INT NULL,
		joined_datetime DATETIME NOT NULL,
		PRIMARY KEY (idparticipant),
		UNIQUE INDEX quizsession_participants_unique (idsession ASC, username ASC),
		CONSTRAINT quizsession_participants_session FOREIGN KEY (idsession)
			REFERENCES quizsessions (idsession) ON DELETE NO ACTION ON UPDATE NO ACTION
	);`,
	`CREATE TABLE quizsession_answers (
		idanswer INT NOT NULL AUTO_INCREMENT,
		idsession INT NOT NULL,
		idparticipant INT NOT NULL,
		question_index INT NOT NULL,
		answer VARCHAR(1000) NOT NULL,
		correct TINYINT(1) NOT NULL,
		answer_datetime DATETIME NOT NULL,
		PRIMARY KEY (idanswer),
		UNIQUE INDEX quizsession_answers_unique (idparticipant ASC, question_index ASC),
		INDEX quizsession_answers_session_idx (idsession ASC),
		CONSTRAINT quizsession_answers_session FOREIGN KEY (idsession)
			REFERENCES quizsessions (idsession) ON DELETE NO ACTION ON UPDATE NO ACTION,
		CONSTRAINT quizsession_answers_participant FOREIGN KEY (idparticipant)
			REFERENCES quizsession_participants (idparticipant) ON DELETE NO ACTION ON UPDATE NO ACTION
	);`,
	'INSERT INTO schema_version (idversion) VALUES (24);',
];
