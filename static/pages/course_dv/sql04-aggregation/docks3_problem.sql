-- SQL 4 aggregation questions 
-- https://profgarrett.github.io/course_eda/sql02-select.html
--
-- Updated May 27, 2025



------------------------------------------------------------------------------------------------
-- Lecture Questions
------------------------------------------------------------------------------------------------


------------------------------------------------
 -- 1) Aggregation Functions
 
-- 1a) Give the sum, count, and average of the tmax field.
-- Remove null tmax values.
SELECT 
FROM daily
WHERE 

-- 1b) Find the number of unique station names
-- Remove null station names.
SELECT 
FROM daily
WHERE 

-- 1c) Find the smallest and largest tmax values for the year 2000.
-- Remove null tmax values.
SELECT 
FROM daily


-- 1d) Find the total snow for the year 2000 in January.
-- Remove null snow values.
SELECT 
FROM daily
WHERE 


-- 1e) Find the number of unique rain values.
SELECT 
FROM daily
WHERE 



------------------------------------------------
 -- 2 Group By

-- 2a) Find the average tmax for each year.
SELECT year, 
FROM daily
WHERE tmax IS NOT NULL
;

-- 2b) Find the number of successful (not null) tmax values for each year.
SELECT year, 
FROM daily

;

-- 2b) Find the number unsuccessful (null) tmax values for each year.
-- Sort by the largest value first.
SELECT year,
FROM daily
WHERE tmax IS NULL
;

-- 2d) Why do we have more than 365 rows in 1940? Show the count of records 
-- for each month in 1940. What is the problem?
SELECT 
FROM daily
WHERE  
;


------------------------------------------------
 -- 2 HAVING

-- 3a) What months in February have more than 28 records?
SELECT year, month, 
FROM daily

HAVING 
ORDER BY year, month;

-- 3b) What is the average tmax for January? Round to the nearest integer.
SELECT year, 
from daily


-- 3c) Which years have a January tmax average greater than this average?
SELECT year, 
FROM daily

ORDER BY year;
