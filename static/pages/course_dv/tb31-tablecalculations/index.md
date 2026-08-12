<script src="/course_dv/toc.js"></script>

# Table Calculations

This section introduces table calculations in Tableau. Table calculations are a powerful way to perform calculations on your data within Tableau, allowing you to create new fields based on existing data.

**Outcomes**:
- Distinguish between calculated fields and table calculations in Tableau
- Create a table calculation (rank, average % of of total, percent difference from previous)
- Filter a table with a calculation

**Links**:
- [Names Datafile](tb48-names.xlsx)

**Good Example**:
- [Academic majors over time](https://flowingdata.com/2026/02/19/fields-of-study-ranked-by-bachelors-degrees-since-1970/)

**Common exam mistakes**:
- Know the difference between calculated fields and table calculations! This is a common source of confusion, and you will need to be able to use both in the exam.
- Know when to use a table calculation to filter data. This is a common technique for filtering data based on a calculation (for example, showing only the top 10 categories based on sales). You will need to know how to set up the table calculation and then use it as a filter in the view.

## Difference between calculated fields and table calculations

A calculated field is a new field that you create based on existing data in your dataset. It is calculated at the row level and can be used in any part of your visualization. For example, you might create a calculated field to calculate the profit margin by dividing profit by sales.

A table calculation, on the other hand, is a calculation that is performed on the data after it has been aggregated in the view. It is calculated at the level of the visualization and can be used to perform calculations such as running totals, percent of total, or rank. For example, you might use a table calculation to calculate the running total of sales over time. 

The key difference is that calculated fields are calculated **before** the data is aggregated, while table calculations are calculated **after** the data is aggregated.

Examples:
- Calculated field
  - Profit Margin = Profit / Sales
  - ROI = (Profit - Cost) / Cost
- Table calculation
  - Running Total of Sales = RUNNING_SUM(SUM([Sales]))
  - Percent of Total Sales = SUM([Sales]) / TOTAL(SUM([Sales]))
  - Rank of Sales = RANK(SUM([Sales]))


## Create a Quick Table Calculation

Tableau has a feature called Quick Table Calculations that allows you to easily create common calculations on your data without writing complex formulas.

To use Quick Table Calculations:
- Right-click on a measure in the view
- Select "Quick Table Calculation"
- Choose the desired calculation from the list

You should be able to create the following table calculations:
- Running Total
- Percent of Total
- Percent Difference from Previous
- Rank

Common decisions include:
  - Function (i.e., running total, difference, percent of total)
  - Direction (across, down etc..)
  - Compare against first, previous, etc...
  - Show a field as a percent of the total row or column


## Tasks for Names dataset

- What are the most popular boy and girl names overall?
- How have these names changed over time?
- What problems are in the data? How would you fix them?
- How have births by year changed over time? How does that effect our analysis of names?