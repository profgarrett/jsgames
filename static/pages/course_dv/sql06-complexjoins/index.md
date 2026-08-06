
There are some more complex operations you can do with a join.

## Quick Reference Code

Connect two tables, returning only rows in tableA without a match in tableB

`SELECT * `
`FROM tableA `
`LEFT OUTER JOIN tableB`
`ON tableA.foreign_key = tableB.primary_key`
`WHERE tableB.primary_key IS NULL`

## Self-join

We can connect a table to itself. This typically requires understanding how to use AS, which lets us rename one of the tables. Below is an example Employee table.

|emp_pk|boss_fk|name|
|------:|------:|----------:|
|1|0|Sarah|
|2|1|Bill|
|3|1|Sam|

This returns a list of people with their boss. Note that use of re-naming fields and tables. We rename the 2nd time empl is used, marking it as the boss table. We then join the employee's foreign key for their boss with the primary key of the boss table. 

`SELECT boss.*, empl.*`
`FROM empl`
`LEFT OUTER JOIN empl AS boss `
`ON empl.boss_fk = boss.emp_pk`


## Relationship Types

There are multiple ways that tables can connect: 

- One-to-one
- One-to-many
- Many-to-many

## Subquery

It's possible to have an entire SQL query as a portion of another query. See the example below. It performs some filtering on staff before using it in the join.

`SELECT *`
`FROM sales`
`INNER JOIN ( SELECT id FROM staff WHERE id > 10 ) staffOver10`
`ON sales.employeeID = staffOver10.id`

## Full / cross join

A full join returns all rows from either side of a join. We don't typically use these in our class.

A cross join returns every row on each side for every row on the other side. It's rarely used. We could theoretically use it to join a table of years (2000, 2001, 2002, ...) and months (Jan, Feb, ...) to get a list of every month for every year.


# Optional Resources

- [YouTube: How to do subqueries](https://www.youtube.com/watch?v=GpC0XyiJPEo)

