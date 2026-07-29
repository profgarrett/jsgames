// Add engagement tracking to pageviews.
//   active_datetime - the last time the page was both on-screen and being used.
//
// end_datetime already answers "how long was this page open?". A tab left open
// in the background keeps sending heartbeats, so that number overstates real
// reading time. active_datetime is bumped only by heartbeats the client marks
// as 'active' (tab visible, window focused, user interacted recently), so
// (active_datetime - start_datetime) approximates engaged time while
// (end_datetime - start_datetime) stays the wall-clock time the page was open.
//
// Backfilled to end_datetime for existing rows: those were recorded before the
// client reported state, so the two measures are indistinguishable for them.

// REMINDER: DO NOT prefix tables with the database name.
module.exports.sql22 = [
	'ALTER TABLE pageviews ADD COLUMN active_datetime DATETIME NULL AFTER end_datetime;',
	'UPDATE pageviews SET active_datetime = end_datetime WHERE active_datetime IS NULL;',
	'INSERT INTO schema_version (idversion) VALUES (22);',
];
