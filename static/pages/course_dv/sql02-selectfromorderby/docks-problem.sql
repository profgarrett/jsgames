-- SQL 2 select questions 
-- https://profgarrett.github.io/course_eda/sql02-select.html
--
-- Updated Aug 6, 2025



------------------------------------------------------------------------------------------------
-- Lecture Questions
------------------------------------------------------------------------------------------------


------------------------------------------------
 -- 1) SELECT & FROM
 
-- 1a) Return all rows from the daily table. 


-- 1b) Return temperature fields (those starting with t)


-- 1c) Return tmax renamed as "temperature measure date"


-- 1d) Return the field that has a space in its name by surrounding it with `backticks`. Rename it.

 
 
------------------------------------------------
 -- 2 ORDER BY and DISTINCT

-- 2a) Return the max temperature ordered from highest to lowest
SELECT tmax 
FROM daily 

-- 2b) Return the max temperature ordered from lowest to highest.
--   Notice the NULLs come first!
SELECT tmax 
FROM daily 

-- 2c) Return the unique max temperature ordered from highest to lowest
SELECT  tmax 
FROM daily 

-- 2d) Return the unique max temperature ordered from lowest to highest.
--   Notice the NULLs come first!
SELECT  tmax 
FROM daily 

-- 2e) Return the unique station names alphabetically


-- 2f) Return the unique snow depth from largest to smallest
SELECT *
FROM daily 



------------------------------------------------ 
 -- 3 WHERE 
  
-- 3a) Return all dates with rain.


-- 3b) Return all rows *without* values for snow depth (i.e., NULL)


-- 3c) Return all rows *without* values for a stationname value (i.e., NULL). 


-- 3d) Return all rows with a stationname value of a blank value (i.e., "")


-- 3e) Return meaurements at MORGANTOWN LOCK AND DAM, WV US
-- Remember to use 'single quotes' for values. These are different from `backticks`, which are used for field or 
-- tables with a space in their name.


-- 3f) Return meaurements not at MORGANTOWN LOCK AND DAM, WV US


-- 3g) Return meaurements at any site with the work MORGANTOWN in its name.


-- 3h) Return all rows with a temperature between 60 and 70.


-- 3i) Return all rows with a temperature of 60, 70, or 80. 


-- 3j) Return all rows with rain of 0 and a temperature above 95.


-- 3j) Return all rows without a minimum temperature VALUE


-- 3k) Return all rows with a snow depth above 1.23

