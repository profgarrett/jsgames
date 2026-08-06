// Live quiz sessions became self-paced: each student now moves through the
// question deck independently (see quizsession_answers, whose row count per
// participant tells the server which question they're on), rather than the
// instructor driving one shared "current question" for everyone.
// quizsessions.current_question_index is no longer read or written anywhere,
// so drop it.

// REMINDER: DO NOT prefix tables with the database name.
module.exports.sql25 = [
	'ALTER TABLE quizsessions DROP COLUMN current_question_index;',
	'INSERT INTO schema_version (idversion) VALUES (25);',
];
