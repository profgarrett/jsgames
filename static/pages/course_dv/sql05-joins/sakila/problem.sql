-- SQL questions for Sakila Database
--
-- Updated May 27, 2025



------------------------------------------------------------------------------------------------
-- Lecture Questions
------------------------------------------------------------------------------------------------


------------------------------------------------
 -- 1) INNER JOIN
 
-- 1a) Return rental information & staff first name


-- 1b) Same as above, but use an alias for each table

 
-- 1c) Return customers and rental date


-- 1d) Return rental date, staff first name, and customer first name.


 -- 1f) Same as above, but use AS to rename customer and staff names


 
 -- 1g) Now group the results to find the total number of rentals per staff member and customer


 -- 1h) Now group the results to find the total number of rentals per staff member and customer, 
 -- but only show those with more than 30 rentals. Sort by the total rentals




------------------------------------------------
 -- 2 OUTER JOIN

-- 2a) Find all movies that have a matching inventory
-- Show the title and inventory ID


-- 2b) Group the prior query to find the total copies per movie


-- 2c) Same as 2a, but show all  films and inventory ids, even those that have no inventory
-- Use a LEFT JOIN


-- 3d) Modify above above to only show films with no matching inventory
-- Use WHERE and a NULL check


-- 2c) Now group the 2c query to find the total copies per movie, even those that have no inventory



