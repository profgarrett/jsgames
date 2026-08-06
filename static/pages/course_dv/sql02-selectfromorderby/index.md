<script src="/course_dv/toc.js"></script>

# SQL 2 - Getting the right data using SELECT

This module accompanies the *Introduction to SQL* DataCamp tutorial. Some content can also be found in *Intermediate SQL*.

**Outcomes**:
- ``SELECT *, field, field2 as ABC, `field b` as fieldb`` 
	- `DISTINCT`
- `FROM table`
    - Use `as t2` to create an alias
- `WHERE field = value` 
	- Use the comparisons `>`, `>=`, `<`, `<=`, `=`, `!=` 
	- Match a number,  `"string value"`, "" (empty string), or `NULL`
	- Use `AND` 
    - Use `OR`
- `ORDER BY fieldname`
	- Either `ASC` or `DESC`
- Understand the role of capitalization

**Links**:
- [YouTube: SELECT & FROM](https://www.youtube.com/watch?v=rWRCEBWBClE)
- [YouTube: Order BY](https://www.youtube.com/watch?v=F5DCaowwwlA)
- [YouTube: WHERE](https://www.youtube.com/watch?v=yXFEBYirWXg)

**Problem Files**:
- [Morgantown Docks GHCN](morgantowndocks/index)

## Style guide

- Use UPPER CASE for keywords (SELECT, FROM, ...)
- Use lower-case for field names and tables
- Optionally, add a ; (semi-colon) at the end of the statement. This is useful when you are using our DB Browser program, as you often have multiple SQL statements.


### SELECT & FROM

SELECT and FROM are used in all data retrieval queries.
- Example: `SELECT * FROM employees`

AS renames a field or table.
- Example: `SELECT CategoryID AS NewFieldNAme FROM employees AS NewTableName`

Some fields or tables may have a space in their name.
- Wrap *fields* with backticks.
    - Example: ``SELECT `Category Name` FROM t1``
- Wrap *tables* with backticks
    - Example: ``SELECT * FROM `employees table` ``
- Generally you will want to rename a field or table with `AS` to make it easier to use.

### ORDER BY & DISTINCT

ORDER BY sorts rows returned. It defaults to ascending, but you can manually force the order by adding `ASC` or `DESC`.

- Example: `SELECT * FROM Employees ORDER BY FirstName`
- Example: `SELECT * FROM Employees ORDER BY FirstName DESC, LastName ASC`

DISTINCT includes only unique row results

- Example: `SELECT DISTINCT name FROM employees `


### WHERE

WHERE filters the returned fields. We use the pattern *left side* = *right side*, typically having *field name in sql* = *some value*
    - Example: `SELECT * FROM employees WHERE id > 2`

**Strings** are wrapped in single quotes. Avoid putting quotes around numbers. SQLite will try to convert between numbers and text automatically, but this can cause errors that are hard to debug.
- Good Example: `SELECT * FROM employees WHERE name = 'main'`
- Bad Example: `SELECT * FROM employees WHERE id > '2'`

LIKE allows using the % wildcard in a WHERE. You can also use a NOT LIKE. These are only used when comparing text values.
- Example: `SELECT * FROM employees WHERE name LIKE 'dark %'`

We can test for an empty string with '' or "" (two single or double quotes side by side)
- Example: `SELECT * FROM employees WHERE title = ''`

IN allows us to search for an item in a list.

- Example: `SELECT * FROM employees WHERE id IN (1, 2, 3)`

BETWEEN can be used for two number comparisons.

- Example: `SELECT * FROM employees WHERE id BETWEEN 10 and 30`

AND/OR allow us to use multiple conditions
- Example: `SELECT * FROM employees WHERE id <= 2 OR id >= 4`
- Example: `SELECT * FROM employees WHERE id <= 2 AND id >= 4`

NULL is a special value, meaning that there is no result for a field. This is different from 0 (often the default in a number field), or "" (an empty string).

When testing for NULL, you can not write `field_name = NULL`. Each NULL is unique. You can only test for them by writing `field_name IS NULL` (or `IS NOT NULL`).

- Example: `SELECT * FROM employees WHERE id IS NULL`
- Example: `SELECT * FROM employees WHERE id IS NOT NULL`



## Optional Resources

There are many online resources that can help you learn SQL. 

- [YouTube: How to filter with WHERE](https://www.youtube.com/watch?v=4Uv0o8IBqw0)

## Excel.fun

Go to [Excel.fun](https://excel.fun)

Complete the following tutorials:

- SQL - SELECT and FROM
- SQL - ORDER BY
- SQL - WHERE


## SQL Zoo

Go to [SQLZoo](https://sqlzoo.net/wiki/SQL_Tutorial)

Complete the following tutorials:

- 0 SELECT basics (all questions)
- 1 SELECT name (questions 1-4)
- 2 SELECT from WORLD (questions 1-7)
