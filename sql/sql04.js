// Setup of initial database.

module.exports.sql04 = [
	'ALTER TABLE `iflevels` ADD COLUMN `allow_skipping_tutorial` TINYINT(1) NOT NULL DEFAULT 0 AFTER `type`;'
]; 
