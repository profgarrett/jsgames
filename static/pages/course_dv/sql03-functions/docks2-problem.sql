-- SQL 3 Functions questions 
-- Updated Aug 6, 2025



------------------------------------------------------------------------------------------------
-- Lecture Questions
------------------------------------------------------------------------------------------------


------------------------------------------------
 -- 1) Text Functions
 
-- 1a) Give station name in uppercase
SELECT 
FROM daily;

-- 1b) Give station name in lowercase
SELECT 
FROM daily;

-- 1c) Give the station name and state together in a single field.
SELECT 
FROM daily;

-- 1d) Give the station name and state together in a single field, 
-- but with a space and comma between them.
SELECT 
FROM daily;

-- 1e) Extract the year from the date field. 
-- Note that the date field is a string, not a date.
-- The date field is in the format YYYY-MM-DD.
SELECT 
FROM daily;

 -- 1e) Extract the month from the date field. 
-- Note that the date field is a string, not a date.
-- Add a sort, and show only unique values.
-- The date field is in the format YYYY-MM-DD.
SELECT 
FROM daily
ORDER BY month;



------------------------------------------------
 -- 2 Number Functions

-- 2a) What is the difference between the highest and lowest temperature each day?
-- Exclude all NULL values.
-- Sort by biggest difference first.
-- Give a name as t_diff
SELECT 
FROM daily 
WHERE 
ORDER BY ;

-- 2b) Return unique tmin sorted. Do you see a problem?
-- Figure out how to fix it by converting the tmin to a number.
SELECT 
FROM daily 
ORDER BY ;

-- 2c) Give the temperature as a ratio of tmax/tmin. (remove null values)
-- What issue do you see?
SELECT 
FROM daily 
WHERE 

-- 2d) Give the unique rain values rounded to the nearest integer.
SELECT 
FROM daily 
ORDER BY ;

-- 2c) Give the unique rain values rounded to a single decimal.
SELECT 
FROM daily 
ORDER BY 

