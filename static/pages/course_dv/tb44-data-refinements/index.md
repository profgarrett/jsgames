<script src="/course_dv/toc.js"></script>

# Data Refinements in Tableau

This section covers data refinements in Tableau.

**Outcomes:**

- Group data values using the Tableau grouping feature
- Group data values using a calculated field
- Group data values using a data source join
- Create calculated fields using common functions: if statements, zn, and basic math
- Create date calculations using datediff, datepart, makedate
- Create bins

**Links**:
- See Datacamp *Analyzing data in Tableau*

## Grouping Data Values

We often have category data that we want to group together for analysis. For example, we may have sales data by state, but want to group states into regions (i.e., Northeast, Midwest, South, West).

There are several ways to group data in Tableau:

- Group inside of Tableau
  - Select multiple values in a dimension and right-click to create a group. 
  - This creates a new grouped field that you can use in your visualizations.
  - You can also add a custom sort order to the grouped field by right-clicking on the group and selecting "Edit Group".
- Group using a calculated field
  - Create a calculated field that uses an IF statement to assign values to groups based on conditions.
  - This is good when you have a fairly simple grouping logic.
- Group using data source
  - Create a separate data source that contains the grouping information and join it to your main data
  - For example, create a CSV file with states and their corresponding regions, then join it to your sales data on the state field.
  - This is good when you have complex grouping logic or want to maintain the grouping information separately.


## Calculation

Calculated fields allow you to create new data fields based on existing data. Each results in a new column displayed in your data pane that can be used in visualizations.

Common functions include:
- Math
  - Arithmetic operations (+, -, *, /)
  - Basic ratios (x / y)
- Dates
  - `DATEDIFF()` shows the difference between two dates, allowing you to pick the return type (i.e., days, months, years)
  - `DATEPART()` extracts a specific part of a date (i.e., year, month, day). Note that this returns a number, and not a date.
  - `makeDATE()` creates a date from year, month, and day components. This is used to construct dates from separate fields.
- Logical
  - `IF test THEN 1 ELSE 2 END` is the basic structure of an IF statement in Tableau.
- Null Handling
  - `ZN()` converts null values to zero, which is useful for calculations that cannot handle nulls.
  - `IFNULL()` allows you to specify a value to use when a field is null.
- Aggregations
  - `SUM()`, `MEDIAN()`, `AVG()` are all common aggregation functions used in calculated fields.


## Bins

A bin is a way to group continuous data into discrete intervals. For example, you may want to group ages into bins of 0-10, 11-20, 21-30, etc...

This is automatically done in Tableau by right-clicking on a continuous measure and selecting "Create Bins". You can then specify the bin size. These will be created for you when you create a histogram.

You may also want to create custom bins using calculated fields. For example, you can create a calculated field with an IF statement to define your own bin ranges. One good technique is to use the `FLOOR()` function to round down values to the nearest bin size. 

For example, to round 123 to the nearest 10, you can use:

```FLOOR([Value] / 10) * 10
```

Be sure to use floor instead of round, since round will round up values (i.e., 125 would round to 130, while floor would round to 120).

