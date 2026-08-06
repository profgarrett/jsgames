// Each student now gets every question in a session exactly once, but in an
// order unique to them, rather than everyone sharing one fixed sequence.
//
//   quizsession_participants.question_order - a JSON array of the frozen
//     deck's question indices (see quizsessions.questions_json), shuffled
//     once when the student joins and never touched again. Nullable so
//     participant rows created before this migration don't break; the server
//     falls back to sequential order for those (see parse_question_order in
//     app_quizsessions.ts).

// REMINDER: DO NOT prefix tables with the database name.
module.exports.sql26 = [
	'ALTER TABLE quizsession_participants ADD COLUMN question_order LONGTEXT NULL AFTER iduser;',
	'INSERT INTO schema_version (idversion) VALUES (26);',
];
