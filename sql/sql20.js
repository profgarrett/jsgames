// Add pageview tracking.
//   pageviews - one row per page visit by a logged-in user.
//     username       - the logged-in user (from the session, never client input).
//     page           - the route path being viewed (e.g. '/pages/intro').
//     ip             - request IP (req.ip; trust proxy is enabled in app.ts).
//     start_datetime - set once when the page loads.
//     end_datetime   - set = start on load, then bumped every 30s while the page is open.

// REMINDER: DO NOT prefix tables with the database name.
module.exports.sql20 = [
	'CREATE TABLE pageviews ( idpageview INT NOT NULL AUTO_INCREMENT, username VARCHAR(100) NOT NULL, page VARCHAR(255) NOT NULL, ip VARCHAR(45) NULL, start_datetime DATETIME NOT NULL, end_datetime DATETIME NOT NULL, PRIMARY KEY (idpageview), INDEX pageviews_username_idx (username ASC), INDEX pageviews_start_idx (start_datetime ASC));',
	'INSERT INTO schema_version (idversion) VALUES (20);',
];
