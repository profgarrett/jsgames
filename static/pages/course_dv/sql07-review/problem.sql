-- SQL 1-5 review
--
-- Updated Nov 11, 2026



------------------------------------------------------------------------------------------------
-- Problems 
------------------------------------------------------------------------------------------------


-- 1) How many total rows do we have?


-- 2) How many unique titles?


-- 3) How many people have the most common title?


-- 4) Make a list of all employees with their title, sorted by title. 
-- Combine the first and last name and title into into one column.
-- Use the format First Last (Title)


-- 5) How many people work in North American, Canada, and Mexico?



-- 6) How many unique cities do we ship orders to?


-- 7) How many shipments have we made to each city in France? Sort by count 


-- 8) How many rows are in Order Details?


-- 9) What is the average quantity ordered from product id 25?
-- Use the round function to round quantity to the nearest integer



-- 10) What is the sum and average quantity ordered from every product? 
-- Round all averages to 0 decimal points.
-- Sort by the sum
-- Only show products with over an average over 30 
-- What is the sum of quantity for the last item in the list?



------------------------------------------------------------------------------------------------
-- JOIN Problems (Questions 11-15)
------------------------------------------------------------------------------------------------


-- 11) Show the product names for each order. 
-- Sort by order id



-- 12) For each product, show the product name and the number of times it was ordered.
-- Sort by the number of orders in descending order


-- 13) List all employees and their customers (their orders).
-- Show employee first and last name, customer company name, and order id



-- 14) Show each order with the employee name who processed it and the customer company name
-- Sort by order id


-- 15) List all products with their supplier company name
-- Only show products with a unit price over 50
-- Sort by unit price descending



------------------------------------------------------------------------------------------------
-- WRAP-UP Problems (Questions 16-20)
------------------------------------------------------------------------------------------------


-- 16a) First, find the employee who processed the most orders
-- What is their employee id?


-- 16b) Now, using the employee id from 16a, show all their orders
-- How many orders total?


-- 17a) First, find the product that was ordered the most times
-- What is the product id?


-- 17b) Now, using the product id from 17a, show the product name and supplier company
-- Who supplied it?


-- 18a) First, find which customer placed the most orders
-- What is the customer id?



-- 18b) Now, using the customer id from 18a, show all their orders with the employee names
-- (Join orders to employees)
-- How many orders did they place?


-- 19a) First, find the average unit price of all products
-- What is it? (Round to 2 decimal places)



-- 19b) Now, show all products with a unit price above the average from 19a
-- Sort by unit price descending
-- How many products are above average?


-- 20a) First, find the order with the highest total quantity ordered
-- (sum up all quantities for each order, then find the max)
-- What is the order id?



-- 20b) Now, show all order details for the order from 20a
-- Include product names (join with products table)
-- What is the product name with the highest quantity in that order?
