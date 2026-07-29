// Add summed engagement time to pageviews.
//   active_seconds - total seconds the page was actually being used.
//
// This complements, rather than replaces, active_datetime:
//
//   active_datetime - active_seconds
//   ---------------   --------------
//   a high-water mark: when engagement  a true sum: the engaged intervals
//   last happened. Includes any idle    added together, excluding the gaps
//   gaps in the middle of a visit.      in between.
//   Measured by the server, so it       Measured by the client, so it is
//   cannot be forged.                   clamped server-side (see
//                                       app_pageviews.ts) to the wall-clock
//                                       time the page was open.
//
// Keeping both is deliberate. active_datetime is the trustworthy floor;
// active_seconds is the precise figure. A row where active_seconds greatly
// exceeds (active_datetime - start_datetime) is a sign of a tampered client.
//
// Existing rows keep 0, which is honest: they predate the measurement. Filter
// reporting to start_datetime >= the deploy date rather than reading 0 as
// "never engaged".

// REMINDER: DO NOT prefix tables with the database name.
module.exports.sql23 = [
	'ALTER TABLE pageviews ADD COLUMN active_seconds INT NOT NULL DEFAULT 0 AFTER active_datetime;',
	'INSERT INTO schema_version (idversion) VALUES (23);',
];
