-- SQL 3 Function questions 
--
-- Updated May 23, 2025



------------------------------------------------------------------------------------------------
-- Lecture Questions
------------------------------------------------------------------------------------------------


------------------------------------------------
 -- 1) Text Functions
 
-- 1a) Give station name in uppercase
SELECT UPPER(stationname) AS stationname_upper
FROM daily;

-- 1b) Give station name in lowercase
SELECT LOWER(stationname) AS stationname_lower
FROM daily;

-- 1c) Give the station name and state together in a single field.
SELECT CONCAT(stationname, state) AS station_state
FROM daily;

-- 1d) Give the station name and state together in a single field, 
-- but with a space and comma between them.
SELECT CONCAT(stationname, ', ', state) AS station_state
FROM daily;

-- 1e) Extract the year from the date field. 
-- Note that the date field is a string, not a date.
-- The date field is in the format YYYY-MM-DD.
SELECT SUBSTRING(date, 1, 4) AS year
FROM daily;

 -- 1e) Extract the month from the date field. 
-- Note that the date field is a string, not a date.
-- Add a sort, and show only unique values.
-- The date field is in the format YYYY-MM-DD.
SELECT DISTINCT SUBSTRING(date, 6, 2) AS month
FROM daily
ORDER BY month;



------------------------------------------------
 -- 2 Number Functions

-- 2a) What is the difference between the highest and lowest temperature each day?
-- Exclude all NULL values.
-- Sort by biggest difference first.
-- Give a name as t_diff
SELECT tmax - tmin as t_diff
FROM daily 
WHERE tmax IS NOT NULL AND tmin IS NOT NULL
ORDER BY t_diff DESC;

-- 2b) Return unique tmin sorted. Do you see a problem?
-- Figure out how to fix it by converting the tmin to a number.
SELECT distinct (tmin  + 0)
FROM daily 
ORDER BY (tmin+0) ASC;

-- 2c) Give the temperature as a ratio of tmax/tmin. (remove null values)
-- What issue do you see?
SELECT tmax / (1.0*tmin) AS t_ratio
FROM daily 
WHERE tmax IS NOT NULL AND tmin IS NOT NULL;

-- 2d) Give the unique rain values rounded to the nearest integer.
SELECT distinct round(rain,0) AS rain_rounded
FROM daily 
ORDER BY round(rain,0) DESC;

-- 2c) Give the unique rain values rounded to a single decimal.
SELECT distinct round(rain,0) AS rain_rounded
FROM daily 
ORDER BY round(rain,1) DESC;



------------------------------------------------------------------------------------------------
-- Application Questions
------------------------------------------------------------------------------------------------

-- 1) Return the station name and state together in a single field, 
-- with the state name in uppercase, the station name in lowercase,
-- and a space and comma between them.
-- What is the result for row 3 (sort by date)?
-- morgantown lock and dam, wv us, WV
SELECT CONCAT(LOWER(stationname), ', ', UPPER(state)) AS station_state_lower_upper
FROM daily
ORDER BY date;

-- 2) Give the unique state names in uppercase, ordered alphabetically.
-- What is the result for row 2?
-- UNKNOWN
SELECT DISTINCT UPPER(state) AS state_upper
FROM daily
ORDER BY state_upper;

-- 3) Convert the tmax into celsius.
-- Exclude all NULL values.
-- What is the result for row 4 (sort by date)? Round to a single decimal
-- 31.1
SELECT (tmax - 32) * 5.0 / 9.0 AS tmax_celsius
FROM daily
WHERE tmax IS NOT NULL
ORDER BY date;

-- 4) Give a unique list of snow depth
-- Round to the nearest integer.
-- Exlude all NULL values.
-- What is the result for row 23 (sort by snowdepth_rounded)?
-- 27
SELECT DISTINCT ROUND(`snow depth`, 0) AS snowdepth_rounded
FROM daily
WHERE `snow depth` IS NOT NULL
ORDER BY snowdepth_rounded;

-- 5) Find all of the unique day values from the data field.
-- The date field is in the format YYYY-MM-DD.
-- Sort by day, and show only unique values.
-- What is the result for row 4?
-- 04
SELECT DISTINCT SUBSTRING(date, 9, 2) AS day
FROM daily
ORDER BY day;

-- 5) Find all of the unique day values from the data field.
-- The date field is in the format YYYY-MM-DD.
-- Sort by day, and show only unique values
-- Convert to an integer
-- What is the result for row 4?
-- 4
SELECT DISTINCT 0+SUBSTRING(date, 9, 2) AS day
FROM daily
ORDER BY day;

-- 6) Show snow divided by the snow depth.
-- Exclude where snow is a NULL value
-- What is the result for row 3 (sort by snow_ratio)?
-- 3.0
SELECT snow / `snow depth` as snow_ratio, snow, `snow depth` 
FROM daily
WHERE `snow depth` IS NOT NULL
ORDER BY snow_ratio DESC;

-- 7) Same as above, but round to a single decimal.
-- What is the result for row 6?
-- 1.6
SELECT ROUND((snow / `snow depth`) , 1) as snow_ratio, snow, `snow depth` 
FROM daily
WHERE `snow depth` IS NOT NULL
ORDER BY snow_ratio DESC;