<script src="/course_dv/toc.js"></script>

# PowerBI Modeling

This module focuses on modeling in PowerBI. You will learn how to create a semantic model, and write DAX formulas to create calculated columns and measures.

**Outcomes**:
- Create a star schema model in PowerBI
- Create a date table and link it to other tables in the model
- Write DAX formulas to create calculated columns and measures
  - Common functions include IF, DIVIDE, CONCATENATE, and DATE
- Understand the difference between calculated columns and measures, and when to use each

**Modules**:
- [Design a semantic model](https://learn.microsoft.com/en-us/training/modules/design-model-power-bi/)
- [Use DAX](https://learn.microsoft.com/en-us/training/paths/dax-power-bi/)
  - Stop before DAX iterators

**Download data files**
- [Sales Data Model Data](sales_data_model.xlsx)
- [DAX Example Data](dax_class_example.xlsx)


## Design a semantic model

Key ideas:

- Creating a good semantic model makes your life easier in the future!
- Tables are joined through primary/foreign keys
- Relationships have cardinalities
- Star schema
  - A design that keeps a fact table in the centerl
  - Linked to dimension tables


### Models

Model view:

- Fix field type / definitions.
- Add formatting
- Add sort
- Pick an aggregation

### Date table

A date table acts as a common center for your tables. It greatly simplifies time-based reports.

### Create a date table with DAX. 

*Option 1*: specify start/end times

`Dates  = CALENDAR(DATE(2011, 5, 31), DATE(2022, 12, 31))`

*Option 2*: let DAX figure out start/end times

`Dates = CALENDARAUTO()`

#### Add columns

Once it is created, add columns for year, month, etc...

- `Year = YEAR(Dates[Date])`
- `WeekNum = WEEKNUM(Dates[Date])`
- `DayoftheWeek = FORMAT(Dates[Date], "DDDD")`


You probably also want to specify things like holidays, as well as [fiscal years](https://www.wallstreetmojo.com/fiscal-year-vs-calendar-year/). 

If your fiscal year is from July to June, then you would use the following code.

`FiscalYear = IF(month >= 7, year+1, year)`

#### Specify as date table

You should then mark the table as your official date table. Go to report view, fields, right-click the table, and select *Mark as date table*.

#### Create relationships

Now, go to the model and set the relationships. Join the new table (using date as a many to one) with all of your existing date values.

## Measures & Columns

### Calculated Columns v. Measures

Help link: [Calculated columns versus measures](https://www.sqlbi.com/articles/calculated-columns-and-measures-in-dax/)

A *calculated column* in PowerBI is different than a *measure* (note, we are not talking about PowerQuery!). A column is created, and exists for every row. This creates data which is then stored in PowerBI.

A *measure* is an aggregated value. These will always have a function used to collapse rows.

Both are written in DAX. You will generally go to the Table view to create a calculated column.

### Implicit v. Explicit Measure

We regularly use an implicit measure, where we drag a field over and pick an aggregation function. However, there are time when we will deliberately write a explicit measure. This helps us to better control access to our data. By hard-coding in a SUM or COUNT, we make sure that people using our data later use the proper field.

## Hierarchies

Dates are the most common hierarchies, but we may want to define our own.

Process:

- Go to a table, right-click on a field, and pick *New hierarchy*
- Drag and drop columns into the hierarchy.

Now you can drill down in a visual.

This section has a brief discussion of the `PATH` function, but that will not be covered in this course.

## Role-playing dimension

We will often want to use the same table in multiple ways. This is especially true to avoid having cycles in our relationships. 

You can accomplish this by duplicating a table, and then join it back to your fact table.

## Relationships

Understand the different relationships:

- One to one: when exactly one row in each table matches
- One to many: most common join
- Many to many: a major problem!  Avoid at all costs

Cross-filtering:

PowerBI has to understand how to go from one row in table A to another row in Table B. Typically, if you setup the joins correctly, this will work.

However, you sometimes need to look at the cross-filter direction. Avoid using cross-filter or bi-directional cross-filtering for many-to-many relationships. This can lead to significant data problems. PowerBI needs to have a single way of linking data.

## Use DAX


## Syntax

- 'Tables' have single-quotes, but they are only required if the name has a space or is a reserved word.
- [Columns] use brackets. You can also prefix columns with their table names.
- [Measures] also use brackets. Since they don't technically live in a table, you generally want to avoid using a prefix table name
- Whitespace is allowed! This includes spaces and newlines. Press shift+enter to add a newline.
- BLANK is a special datatype that covers NULL and blank cells. It is not zero!


### Column DAX formulas

Add a new column by going to the data view, clicking *new column*. 

Here are some functions you should know:

- IF(<logical_test>, <value_if_true>[, <value_if_false>])
- DIVIDE(<numerator>, <denominator>[, <alternate_result>])
  - Divide is useful for when we have division-by-zero errors.
- Model Color = 'Product'[Model] & "-" & 'Product'[Color]
  - This concatenates string values together
- Date functions, such as YEAR, MONTH, WEEKNUM, etc...
  - FORMAT is a good function to get a custom look.
  - DATE can be used to create a date from year, month, day values. This is useful when you have separate columns for year, month, and day, and want to combine them into a single date column.

Note that a new calculated column can only refer to fields in the same table. To get out of the table, you can use other functions like `RELATED`. But, those are out of scope for this class.


## Simple Measures

A new measure is created with an aggregation DAX function.

`Revenue = SUM(Sales[Sales Amount])`

Add by going to data view, and clicking the *add measure* button. Be sure to set formatting after you create it.

Measure functions:

- SUM
- MIN/MAX
- AVERAGE
- Count
  - COUNT is the number of non-BLANK rows
  - DISTINCTCOUNT is the number of unique values
  - ORDERROWS counts the rows in a table, including blank.

### Quick measure

A quick measure can be used to quickly add a measure. Use the Quick Measure button under Table tools.