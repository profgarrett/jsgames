-- SQL 4 aggregation questions 
-- https://profgarrett.github.io/course_eda/sql02-select.html
--
-- Updated May 23, 2025



------------------------------------------------------------------------------------------------
-- Lecture Questions
------------------------------------------------------------------------------------------------


------------------------------------------------
 -- 1) Aggregation Functions
 
-- 1a) Give the sum, count, and average of the tmax field.
-- Remove null tmax values.
SELECT SUM(tmax) AS tmax_sum, COUNT(tmax) AS tmax_count, AVG(tmax) AS tmax_avg
FROM daily
WHERE tmax IS NOT NULL;

-- 1b) Find the number of unique station names
-- Remove null station names.
SELECT COUNT(DISTINCT stationname) AS unique_station_count
FROM daily
WHERE stationname IS NOT NULL;

-- 1c) Find the smallest and largest tmax values for the year 2000.
-- Remove null tmax values.
SELECT MIN(tmax) AS tmax_min, MAX(tmax) AS tmax_max
FROM daily
WHERE tmax IS NOT NULL AND SUBSTRING(date, 1, 4) = '2000';

-- 1d) Find the total snow for the year 2000 in January.
-- Remove null snow values.
SELECT SUM(`snow depth`) AS total_snow
FROM daily
WHERE `snow depth` IS NOT NULL AND SUBSTRING(date, 1, 4) = '2000' AND SUBSTRING(date, 6, 2) = '01';


-- 1e) Find the number of unique rain values.
SELECT COUNT(DISTINCT rain) AS unique_rain_count
FROM daily
WHERE rain IS NOT NULL;



------------------------------------------------
 -- 2 Group By

-- 2a) Find the average tmax for each year.
SELECT year, AVG(tmax) AS avg_tmax
FROM daily
WHERE tmax IS NOT NULL
GROUP BY year;

-- 2b) Find the number of successful (not null) tmax values for each year.
SELECT year, COUNT(tmax) AS tmax_count
FROM daily
WHERE tmax IS NOT NULL
GROUP BY year;

-- 2b) Find the number unsuccessful (null) tmax values for each year.
-- Sort by the largest value first.
SELECT year, COUNT(*)
FROM daily
WHERE tmax IS NULL
GROUP BY year
ORDER BY COUNT(*) DESC;

-- 2d) Why do we have more than 365 rows in 1940? Show the count of records 
-- for each month in 1940. What is the problem?
SELECT year, month, COUNT(*) AS rowcount
FROM daily
WHERE  SUBSTRING(date, 1, 4) = '1940'
GROUP BY month
ORDER BY month;


------------------------------------------------
 -- 2 HAVING

-- 3a) What months in February have more than 28 records?
SELECT year, month, COUNT(*) AS rowcount
FROM daily
WHERE SUBSTRING(date, 6, 2) = '02'
GROUP BY year, month
HAVING COUNT(*) > 28
ORDER BY year, month;

-- 3b) What is the average tmax for January? Round to the nearest integer.
SELECT year, AVG(tmax) AS avg_tmax
from daily
where month = '01'

-- 3c) Which years have a January tmax average greater than this average?
SELECT year, AVG(tmax) AS avg_tmax
FROM daily
WHERE SUBSTRING(date, 6, 2) = '01' AND tmax IS NOT NULL
GROUP BY year
HAVING AVG(tmax) > (
    SELECT AVG(tmax)
    FROM daily
    WHERE SUBSTRING(date, 6, 2) = '01' AND tmax IS NOT NULL
)
ORDER BY year;

------------------------------------------------------------------------------------------------
-- Application Questions
------------------------------------------------------------------------------------------------

-- 1) Find the average tmax for each month
-- Exclude all NULL values. Order by month.
-- What month has the highest average tmax? Give your answer as a 01, 02, etc.
-- 07
SELECT month, AVG(tmax) AS avg_tmax
FROM daily
WHERE tmax IS NOT NULL
GROUP BY month
ORDER BY month;

-- 2) Find the sum of all snow for each year
-- Exclude all NULL values. Order by year.
-- What year has the most snow? 
-- 1982
SELECT year, sum(`snow`) AS snow
FROM daily
WHERE `snow` IS NOT NULL
GROUP BY year
ORDER BY snow DESC;

-- 3) What year has the highest average snow depth?
-- Exclude all NULL values. Order by average snow depth.
-- 1928
SELECT year, AVG(`snow depth`) AS avg_snow_depth
FROM daily
WHERE `snow depth` IS NOT NULL
GROUP BY year
ORDER BY avg_snow_depth DESC;


-- 4) Find the average tmax for each station.
-- Exclude all NULL values. Order by station name.
-- What is the average tmax for the station "Morgantown Lock and Dam, WV US"? 
-- Round your answer to a single decimal.
-- 64.2
SELECT stationname, AVG(tmax) AS avg_tmax
FROM daily
WHERE tmax IS NOT NULL
GROUP BY stationname
ORDER BY stationname;

-- 5) Find the average rain for each year.
-- Exclude all NULL values. Order by rain average.
-- What is the highest average rain? Round to a single decimal.
-- 0.2
SELECT year, AVG(rain) AS avg_rain
FROM daily
WHERE rain IS NOT NULL
GROUP BY year
ORDER BY avg_rain DESC;

-- 6) Find the average snow depth for each month.
-- Exclude all NULL values. Order by month.
-- What month has the *3rd* highest average snow depth? Give your answer as a 01, 02, etc.
-- 12
SELECT month, AVG(`snow depth`) AS avg_snow_depth
FROM daily
WHERE `snow depth` IS NOT NULL
GROUP BY month
ORDER BY avg_snow_depth DESC;

-- 7) Find the count of days with over 1 inch of snowfall for each year.
-- Exclude all NULL values. Order by snowfall.
-- What year has the most days with over 1 inch of snowfall?
-- 1922
SELECT year, COUNT(*) AS days_over_1_inch
FROM daily
WHERE `snow` IS NOT NULL AND `snow` > 1
GROUP BY snow;

-- 8) Find which months have over 10 days with rain falling in 2020
-- Order by month.
-- Exclude all months that do not have 10 days of rain, meaning that you
-- will need to use a HAVING clause.
-- How many months have more than 10 days with rain in 2020?
-- 8
SELECT month, COUNT(*) AS days_with_rain
FROM daily
WHERE `rain` IS NOT NULL AND `rain` > 0 and year = 2020
GROUP BY month
HAVING COUNT(*) > 10
ORDER BY month;


-- 9) Find the average tmax for each month in 2020.
-- Exclude all NULL values. Order by month.
-- Exclude any months with an average tmax less than 10 (i.e., HAVING)
-- How many months are returned?
-- 02
SELECT month, AVG(tmax) AS avg_tmax
FROM daily
WHERE tmax IS NOT NULL AND year = 2020
GROUP BY month
having avg_tmax > 80;