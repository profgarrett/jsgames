// Add quiz answer tracking.
//   quizviews - one row per answer submitted by a logged-in user in quiz mode.
//     username        - the logged-in user (from the session, never client input).
//     iduser          - resolved server-side from username; NULL if the lookup fails.
//     page            - the page slug the quiz was generated from (e.g. 'course_dv/dv01-eda/index').
//     question        - the question prompt as shown to the student.
//     answer          - the answer text the student selected.
//     correct         - 1 if the selected answer was the right one, otherwise 0.
//     answer_datetime - when the answer was submitted (set server-side).
//
//   Every submission inserts a new row, so retaking a quiz produces a fresh set
//   of rows rather than overwriting the earlier attempt.

// REMINDER: DO NOT prefix tables with the database name.
module.exports.sql21 = [
	'CREATE TABLE quizviews ( idquizview INT NOT NULL AUTO_INCREMENT, username VARCHAR(100) NOT NULL, iduser INT NULL, page VARCHAR(255) NULL, question VARCHAR(1000) NOT NULL, answer VARCHAR(1000) NOT NULL, correct TINYINT(1) NOT NULL, answer_datetime DATETIME NOT NULL, PRIMARY KEY (idquizview), INDEX quizviews_username_idx (username ASC), INDEX quizviews_iduser_idx (iduser ASC), INDEX quizviews_datetime_idx (answer_datetime ASC));',
	'INSERT INTO schema_version (idversion) VALUES (21);',
];
