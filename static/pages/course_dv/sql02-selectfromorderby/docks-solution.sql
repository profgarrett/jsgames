-- SQL 2 select questions 
-- https://profgarrett.github.io/course_eda/sql02-select.html
--
-- Updated May 23, 2025



------------------------------------------------------------------------------------------------
-- Lecture Questions
------------------------------------------------------------------------------------------------


------------------------------------------------
 -- 1) SELECT & FROM
 
-- 1a) Return all rows from the daily table. 
SELECT *
FROM daily;

-- 1b) Return temperature fields (those starting with t)
SELECT tmax, tmin
FROM daily;

-- 1c) Return tmax renamed as "temperature measure date"
SELECT  date AS "temperature measure date"
FROM daily;

-- 1d) Return the field that has a space in its name by surrounding it with `backticks`. Rename it.
 SELECT `snow depth` as snowdepth 
 FROM daily;
 
 
------------------------------------------------
 -- 2 ORDER BY and DISTINCT

-- 2a) Return the max temperature ordered from highest to lowest
SELECT tmax 
FROM daily 
ORDER BY tmax DESC;

-- 2b) Return the max temperature ordered from lowest to highest.
--   Notice the NULLs come first!
SELECT tmax 
FROM daily 
ORDER BY tmax ASC;

-- 2c) Return the unique max temperature ordered from highest to lowest
SELECT distinct tmax 
FROM daily 
ORDER BY tmax DESC;

-- 2d) Return the unique max temperature ordered from lowest to highest.
--   Notice the NULLs come first!
SELECT distinct tmax 
FROM daily 
ORDER BY tmax ASC;

-- 2e) Return the unique station names alphabetically
SELECT distinct stationname 
FROM daily 
ORDER BY stationname ASC;

-- 2f) Return the unique snow depth from largest to smallest
SELECT distinct `snow depth` 
FROM daily 
ORDER BY `snow depth` DESC;


------------------------------------------------ 
 -- 3 WHERE 
  
-- 3a) Return all dates with rain.
SELECT date, rain 
FROM daily
WHERE rain > 0;

-- 3b) Return all rows *without* values for snow depth (i.e., NULL)
SELECT *
FROM daily
WHERE `snow depth` IS NULL;

-- 3c) Return all rows *without* values for a stationname value (i.e., NULL). 
SELECT *
FROM daily
WHERE `snow depth` IS NULL;

-- 3d) Return all rows with a stationname value of a blank value (i.e., "")
SELECT *
FROM daily
WHERE `snow depth` = '';

-- 3e) Return meaurements at MORGANTOWN LOCK AND DAM, WV US
-- Remember to use 'single quotes' for values. These are different from `backticks`, which are used for field or 
-- tables with a space in their name.
SELECT *
FROM  daily
WHERE stationname = 'MORGANTOWN LOCK AND DAM, WV US';

-- 3f) Return meaurements not at MORGANTOWN LOCK AND DAM, WV US
SELECT *
FROM  daily
WHERE stationname != 'MORGANTOWN LOCK AND DAM, WV US';

-- 3g) Return meaurements at any site with the work MORGANTOWN in its name.
SELECT *
FROM  daily
WHERE stationname LIKE '%MORGANTOWN%';

-- 3h) Return all rows with a temperature between 60 and 70.
SELECT *
FROM daily
WHERE tmax BETWEEN 60 AND 70;

-- 3i) Return all rows with a temperature of 60, 70, or 80. 
SELECT *
FROM daily
WHERE tmax = 60 OR tmax = 70 OR tmax = 80;

-- 3j) Return all rows with rain of 0 and a temperature above 95.
SELECT *
FROM daily
WHERE rain = 0 AND tmax > 95;

-- 3j) Return all rows without a minimum temperature VALUE
SELECT date, tmin
FROM daily
WHERE tmin IS NULL;

-- 3k) Return all rows with a snow depth above 1.23
SELECT *
FROM daily
WHERE `snow depth`  > 1.23


------------------------------------------------------------------------------------------------
-- HW Questions
------------------------------------------------------------------------------------------------


-- 1) How many days had over 1/10 of an inch of snow with temperature over freezing? 
-- 13
SELECT *
FROM daily
WHERE snow > 0.1 AND tmin > 32;

-- 2) How many days have NULL values for tMax in 1930?
-- 333
SELECT *
FROM daily
WHERE tmax IS NULL AND year = 1930;

-- 3) How many unique station names are in the dataset?
-- 3
SELECT distinct stationname
FROM daily;

-- 4) What is the lowest minimum temperature in 2000?
-- 0 
SELECT tmin
FROM daily 
WHERE year = 2000
ORDER BY tmin;

-- 5) What is the lowest minimum temperature in 2000-2010?
-- NOTE: Include both 2000 and 2010.
-- -4
SELECT tmin
FROM daily 
WHERE year BETWEEN 2000 AND 2010 AND tmin IS NOT NULL
ORDER BY tmin;

-- 6) How many days had over 1/10 of an inch of snow while the maximum temperature was exactly 31 degrees? 
-- 31
SELECT *
FROM daily
WHERE snow > 0.1 AND tmax = 32;

-- 7) How many days have NULL values for tMin in 1950?
-- 0
SELECT *
FROM daily
WHERE tMIN  IS NULL AND year = 1950;

-- 8) How many unique years are in the dataset?
-- 171
SELECT distinct year
FROM daily;

-- 9) What is the highest maximum temperature between 1990-1995? 
-- 96
SELECT tmax
FROM daily 
WHERE year BETWEEN 1990 AND 1995
ORDER BY tmax DESC;


