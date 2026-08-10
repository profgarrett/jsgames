// Enforce one enrollment row per (user, section).
//
// users_sections was created in sql08 with plain (non-unique) indexes on iduser
// and idsection, so nothing stopped a user from being added to the same section
// twice. Both current insert sites (app_users.ensure_section_membership and
// scripts/createuser.cjs) do a check-then-insert, which leaves a race open and
// is easy to forget in new code (e.g. the admin module's join endpoint). This
// pushes the rule down to the database.
//
// Step 1 removes any duplicates already in the table -- ALTER TABLE ... ADD
// UNIQUE fails outright if any exist. Within a duplicated (iduser, idsection)
// group we keep the most privileged role (admin > faculty > student > anything
// else), breaking ties by the lowest idusers_sections, so demoting a faculty
// member is not a side effect of the cleanup.
//
// GROUP_CONCAT + SUBSTRING_INDEX is an "argmax" that works on MySQL 5.7 as well
// as 8.x. The default 1024-byte group_concat_max_len can truncate the list, but
// we only read the first element, so truncation is harmless here.

// REMINDER: DO NOT prefix tables with the database name.
module.exports.sql27 = [

	// 1. Drop duplicate enrollments, keeping one row per (iduser, idsection).
	`DELETE us FROM users_sections us
		INNER JOIN (
			SELECT iduser, idsection,
				CAST(
					SUBSTRING_INDEX(
						GROUP_CONCAT(
							idusers_sections
							ORDER BY FIELD(role, 'student', 'faculty', 'admin') DESC,
								idusers_sections ASC
						), ',', 1)
					AS UNSIGNED) AS keep_id
			FROM users_sections
			GROUP BY iduser, idsection
			HAVING COUNT(*) > 1
		) dupes
			ON us.iduser = dupes.iduser
			AND us.idsection = dupes.idsection
		WHERE us.idusers_sections <> dupes.keep_id;`,

	// 2. Now that the data is clean, enforce the rule going forward.
	'ALTER TABLE users_sections ADD UNIQUE INDEX iduser_idsection_UNIQUE (iduser ASC, idsection ASC);',

	'INSERT INTO schema_version (idversion) VALUES (27);',
];
