<script src="/course_dv/toc.js"></script>

# SQL 4 - Aggregations

**Outcomes**:
- Reduce data rows by pivoting the data and filter the results.
- Return the `sum()`, `avg()`, or `count()` of rows
- `GROUP BY` a field
- Use a `HAVING` clause to add a filter
- Describe the difference between `HAVING` and `WHERE`


**Problems**:
- [Morgantown Docks3](morgantowndocks3)
- [Northwind Comprehensive Review](northwind) 

## Aggregation Functions

- `COUNT(*)` number of rows
- `COUNT(field_name)` number of non-missing values in a field
- `DISTINCT COUNT(field_name)` find the number of unique values
  - Note that DISTINCT applies to each row, not field.
- `SUM(field_name)` totals the field
- `MIN(field_name)` and `MAX(field_name)` give the largest and smallest values

Note that we sometimes use `COUNT(*)` to count the number of rows, and othertimes we used `COUNT(field_name)` to count a specific field. This is particularly important when we start using joins.

## GROUP BY

Group by returns a single row for each unique value (or set of values). 
It's very useful in combination with an aggregation function.
- `SELECT year, sum(sales) as year_sales FROM sales GROUP BY year`

We also may need to limit the results. This can be tricky, as WHERE and HAVING appear similar. 

The key is the WHERE runs first! Then the group by runs, and finally the HAVING. The syntax of HAVING is identical to WHERE.

`SELECT year, sum(sales) as year_sales FROM sales`
`WHERE year < 2000`
`GROUP BY year`
`HAVING year_sales > 100`

## Further practice

See SQL Zoo *5 SUM and COUNT* (all questions)
