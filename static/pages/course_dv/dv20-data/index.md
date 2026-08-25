# Understanding Your Data

You have to understand data before creating a chart. Many errors occur because an analyst does not understand the data being used. Most of these errors are silent, meaning that the computer will not tell you when you make a mistake.

This module introduces a systematic process for examining a dataset before visualization or analysis.

## Outcomes

After completing this module, you should be able to:

* Identify a field's storage type, and explain why some numbers (such as ZIP Codes) must be stored as text
* Define primary, foreign, and composite keys
* Classify a field by measurement scale (nominal, ordinal, interval, ratio)
* Recognize inconsistent coding, and explain the purpose of a data dictionary
* Distinguish cross-sectional from longitudinal data
* Distinguish transaction data from roll-up data, and explain why summing roll-up rows double-counts
* Distinguish wide from long data, and explain why long data is usually better for visualization
* Identify missing, invalid, outlier, and duplicate values, and explain why each requires investigation rather than automatic removal
* Select an appropriate aggregation for a field based on its meaning rather than its storage type
* Distinguish discrete from continuous variables
* Review a small business dataset and list its likely data problems


## Links

- [Slides](/static/pages/slides.html?course=course_dv&module=dv20-data)
- [Sample datafile](dv20_data_samples.xlsx)

## Further reading

* [Socviz.co Chapter 1](https://socviz.co/lookatdata.html)
* [Fundamentals of Data Visualization](https://clauswilke.com/dataviz/)



## Understand a Field

### Storage Type

A field's *storage type* describes how software stores the value. Common storage types are shown in the table below. 

| Field           | Value | Storage Type |
| --------------- | ------------- | --------------------- |
| Customer ID     | 10245         | Integer      |
| Customer Name |Bob Jones|String|
| Sale Count| 12 | Integer |
| Revenue         | 1250.75       | Decimal               |
| Order Date      | 2026-07-29    | Date                  |
| Active Customer | True          | Boolean               |

Some numbers have leading zeros. For example,  ZIP Codes for Connecticut, Massachusetts, Maine, New Hampshire, and New Jersey all start with a 0. Even those these are numbers, they need to be stored as text values to preserve the leading digits.

### Keys

An *key* distinguishes one entity or record from another. Keys can be numbers or text. Examples include:

* Customer ID.
* Product code.
* Transaction number.

A key could be a single field, or combination of fields. Keys can be stored in a table either as a *primary key* (where it uniquely defines a row in that table) or a *foreign key* (where it uniquely identifies a row in another table). Keys are generally composed of a single field, but two or more fields can be combined to create a *composite key*.


### Measurement scale

A field's *measurement scale* determines which comparisons and calculations are meaningful.

- *Nominal* variables identify categories with no inherent order. Examples include: department, customer ID, or state.
- *Ordinal* variables contain categories with a meaningful order, but the distance between categories may not be equal. Examples include: Low, medium, and high risk, or 1-5 star ratings.
- *Interval* variables have equal distances between values but no meaningful zero point. Temperature measured in degrees Fahrenheit or Celsius is a common example. The difference between 50°F and 60°F is meaningful, but 60°F is not twice as hot as 30°F.
- *Ratio* variables have equal intervals and a meaningful zero point. Examples include: revenue or distance. A value of $200 in revenue is meaningfully twice a value of $100.


### Coding

Coding describes how categories or conditions are represented. The same value might be recorded in several ways:

* `Male`, `M`, and `male`.
* `West Virginia`, `WV`, and `W.Va.`
* `Yes`, `Y`, `1`, and `True`.
* `Not Available`, `N/A`, and `Unknown`.

These values may refer to the same category, but software may treat them as different groups.

A *data dictionary* or *codebook* explains what fields and coded values mean. For example, a status code of 1 usually means `True`, and 0 means `False`.


## Understand a table

A table's structure describes how entities, variables, and time periods are organized.

### Number of rows per entity

*Cross-sectional data* contains observations from multiple entities at a single point in time (or period).  A simple example would be a query pulling average GPA for students.

|Student|Average GPA|Class Level|
|-------|-----------|-----------|
|Bob|4.0|Senior|
|Sarah|3.5|Junior|
|Tim|2.5|Freshman|

### Longitudinal 

*Longitudinal data* contains repeated observations. This means that a item or person can show up multiple times.

|Student|Average GPA|Class Level|
|-------|-----------|-----------|
|Bob|4.0|Senior|
|Bob|3.0|Junior|
|Sarah|3.5|Junior|
|Sarah|3.0|Junior|
|Sarah|1.5|Freshman|
|Tim|2.5|Freshman|


### Transaction or Summary Data

*Transaction data* records individual business events. Each entity shows up multiple times. For example, the below table shows transactions. Each customer shows up multiple times.

| Transaction ID | Customer ID | Date       | Amount |
| -------------- | ----------- | ---------- | -----: |
| T1001          | C204        | 2026-07-01 | 125.00 |
| T1002          | C318        | 2026-07-01 |  80.00 |
| T1003          | C204        | 2026-07-03 | 210.00 |


*Roll-up data* combines detailed records and summary records in the same table. The example below shows each city multiple times.

| Location      | Month    | Sales |
| ------------- | -------- | ----: |
| New York City | January  |  1000 |
| New York City | February |  1200 |
| New York City | Total    |  2200 |
| Los Angeles   | January  |   800 |
| Los Angeles   | February |   900 |
| Los Angeles   | Total    |  1700 |

If an analyst sums every row, the totals will be counted twice.

Roll-up data is very common in government datasets.  Summary rows may be identified using:

* Labels such as `Total`, `Subtotal`, or `All`.
* Geographic aggregation codes.
* Classification-level fields.
* Blank key values.
* Flags supplied by the data source.


### Data Width 

In *wide data*, values from one variable may be spread across multiple columns. Wide data is often convenient for human-readable reports and many statistical procedures. However, wide data may make visualization more difficult. 

| Student | Math | English | History |
| ------- | ---: | ------: | ------: |
| Alice   |   95 |      88 |      92 |
| Bob     |   87 |      91 |      85 |


In *long data*, the values of a category are stored in one column and the corresponding measurements are stored in another column.  Long data is very useful for data visualization.

| Student | Subject | Score |
| ------- | ------- | ----: |
| Alice   | Math    |    95 |
| Alice   | English |    88 |
| Alice   | History |    92 |
| Bob     | Math    |    87 |
| Bob     | English |    91 |
| Bob     | History |    85 |





## Check for problems 

After identifying the unit of observation and interpreting each field, inspect the values for potential data-quality problems.

### Missing Values

A missing value indicates that a value is not available in a field. They may appear as:

* `NULL`
* `NaN`
* An empty cell
* An empty string such as `""`
* `"N/A"`
* `"Unknown"`
* A placeholder such as `-999`

Missing values can have different meanings:

* The value was not collected.
* The value is unknown.
* The field does not apply to the observation.
* The value has not yet been entered.
* The value was lost during system processing.
* The value was suppressed for privacy.
* A respondent declined to answer.

Before removing or replacing missing values, determine why they are missing.

### Invalid Values

An invalid value violates a known business or logical rule.

Examples include:

* An employee age of `150`.
* A negative quantity sold.
* A shipment date before the order date.
* A state abbreviation not included in the list of valid states.
* A product code that does not exist in the product table.
* A percentage greater than 100 when values should range from 0 to 100.



### Outlier Values

An outlier is an observation that differs substantially from most other observations.

Examples include:

* A customer purchase of $1,000,000 when most purchases are under $500.
* A delivery requiring 30 days when most deliveries require three days.
* An employee working 120 hours in one week.
* An unusually large refund.

An outlier may represent:

* A data-entry error.
* A measurement error.
* A valid but unusual event.
* Fraud.
* A new customer segment.
* A seasonal spike.
* A business process failure.
* A combination of observations from different populations.

Outliers should not be removed automatically. In business analytics, unusual observations may be the most important records in the dataset.

Common methods for identifying outliers include:

* Sorting values.
* Examining minimum and maximum values.
* Using histograms.
* Using box plots.
* Calculating the interquartile range.
* Comparing values with domain-specific limits.
* Comparing observations within relevant groups.

For example, a $100,000 sale may be unusual for a retail customer but normal for a wholesale customer.

### Duplicate Records

A duplicate occurs when the same observation appears more than once.

Duplicates can cause:

* Revenue to be overstated.
* Customers to be counted more than once.
* Inventory quantities to be inflated.
* Survey results to give excessive weight to some respondents.
* Statistical models to overemphasize repeated observations.

Not every repeated value is a duplicate. A customer ID should appear multiple times in a transaction dataset when the customer makes multiple purchases. A true duplicate must be evaluated relative to the dataset's unit of observation.





## Aggregation

Aggregation combines multiple observations into a summary. Common aggregations include: sum, count, mean, median, minimum, and maximum. The appropriate aggregation depends on the field's meaning.

| Field               | Appropriate Aggregations                  |
| ------------------- | ----------------------------------------- |
| Revenue             | Sum, mean, median                         |
| Quantity sold       | Sum, mean                                 |
| Customer ID         | Count or distinct count                   |
| Product category    | Count or percentage                       |
| Satisfaction rating | Count, percentage, median, sometimes mean |
| ZIP Code            | Count or distinct count                   |

A numeric storage type does not automatically make averaging or summing appropriate.

## Tableau Discrete v. Continuous Role

The concept is discrete v. continuous is particularly important for Tableau. Tableau somewhat modifies the 
terms from traditional usage, so I follow its approach to simplify the course.


A **discrete variable** takes a limited number of potential values. Discrete data can be either text or numbers.
Examples include:

* Star rating: from to 1-5
* Customer Segment: high/low/medium or 1/2/3
* State: WV/CA/NY/etc...
* is Student: 1 or 0


A **continuous variable** takes on a large number of values within a range. Its recorded precision often depends on the measurement process. Examples include:

* Revenue: $23,287
* Product weight: 87.2345 lbs
* Customer Name: Bob Jones
* Mailing street address: 28 South St.


### Categorical Variables Are Not Continuous

Traditionally, we have a third role: *categorical*.  Names, addresses, product categories, and other text values generally treated as categorical. However, Tableau does not have a separate categorical type, so we will treat them as continuous. 


## Example Business Data Review

Consider the following data:

| Invoice | Customer | State         | Quantity | Revenue | Status |
| ------- | -------- | ------------- | -------: | ------: | ------ |
| 1001    | C101     | WV            |        2 |  200.00 | Paid   |
| 1002    | C102     | West Virginia |        1 |  125.00 | paid   |
| 1002    | C102     | West Virginia |        1 |  125.00 | paid   |
| 1003    | C103     | PA            |       -2 |  250.00 | NULL   |
| Total   |          |               |        2 |  700.00 |        |

Potential problems include:

* Invoice `1002` may be duplicated.
* `WV` and `West Virginia` use inconsistent coding.
* A quantity of `-2` may be invalid or may represent a return.
* The missing status for invoice `1003` requires investigation.
* The `Total` row is a roll-up record.
* Summing all revenue values would double-count the total.
* The unit of observation is unclear without additional documentation.
* The invoice field contains both numeric keys and the text value `Total`.


## Key Terms

- **Storage type**: How software stores a value, such as integer, decimal, string, date, or boolean.
- **Key**: A field, or combination of fields, that distinguishes one record from another.
- **Primary key**: A key that uniquely identifies a row within its own table.
- **Foreign key**: A field that identifies a row in another table.
- **Composite key**: A key made from two or more fields combined.
- **Nominal**: Categories with no inherent order, such as department or state.
- **Ordinal**: Categories with a meaningful order but unequal or unknown distances between them, such as low/medium/high risk.
- **Interval**: Values with equal distances but no meaningful zero, such as temperature in Fahrenheit.
- **Ratio**: Values with equal distances and a meaningful zero, such as revenue or distance.
- **Coding**: How categories or conditions are represented in the data, such as `Male`, `M`, and `male` for the same category.
- **Data dictionary (codebook)**: Documentation explaining what each field and coded value means.
- **Unit of observation**: What a single row of the table represents.
- **Cross-sectional data**: Observations from multiple entities at a single point in time.
- **Longitudinal data**: Repeated observations of the same entity over time.
- **Transaction data**: A record of individual business events, where an entity appears many times.
- **Roll-up data**: A table that mixes detailed records with summary rows, causing double-counting if all rows are summed.
- **Wide data**: A layout where values of one variable are spread across multiple columns.
- **Long data**: A layout where categories are in one column and measurements are in another. Usually preferred for visualization.
- **Missing value**: A value not available in a field, shown as `NULL`, `NaN`, an empty cell, or a placeholder such as `-999`.
- **Invalid value**: A value that violates a known business or logical rule, such as a shipment date before the order date.
- **Outlier**: An observation that differs substantially from most others. It may be an error, or the most important record in the dataset.
- **Duplicate record**: The same observation appearing more than once, judged relative to the unit of observation.
- **Aggregation**: Combining multiple observations into a summary such as sum, count, mean, median, minimum, or maximum.
- **Discrete variable**: A variable taking separate, countable values, such as number of invoices.
- **Continuous variable**: A variable that can take any value within a range, such as delivery time or product weight.


## Practice Questions

1. Why are data errors described as "silent"?
   - The software will not warn you when you make a mistake
   - The errors are hidden in fields you cannot open
   - The errors only appear after the chart is published
   - The errors are too small to change any results

1. A field's *storage type* describes:
   - How the software stores the value
   - Which comparisons and calculations are meaningful
   - How many rows the table contains
   - Whether the field is a primary or foreign key

1. Why should a ZIP Code be stored as text rather than a number?
   - To preserve leading zeros
   - To allow it to be summed
   - To make it sort numerically
   - To let the software treat it as an ordinal value

1. A key that uniquely identifies a row in *another* table is a:
   - Foreign key
   - Primary key
   - Composite key
   - Surrogate key

1. Two or more fields combined to identify a record form a:
   - Composite key
   - Foreign key
   - Nominal key
   - Coded key

1. Which field is measured on a nominal scale?
   - State
   - Revenue
   - Temperature in Celsius
   - A 1-5 star rating

1. A 1-5 satisfaction rating is best described as:
   - Ordinal
   - Nominal
   - Interval
   - Ratio

1. Temperature in Fahrenheit is an interval variable because:
   - Distances between values are equal, but there is no meaningful zero
   - Both the distances and the zero point are meaningful
   - The categories have an order but unequal distances
   - The values have no inherent order

1. Which statement is true of a ratio variable?
   - $200 in revenue is meaningfully twice $100
   - 60°F is twice as hot as 30°F
   - A 4-star rating is twice as good as a 2-star rating
   - Customer ID 200 is twice customer ID 100

1. `Male`, `M`, and `male` appearing in the same field is a problem of:
   - Coding
   - Storage type
   - Measurement scale
   - Aggregation

1. A document explaining what fields and coded values mean is a:
   - Data dictionary or codebook
   - Primary key
   - Roll-up table
   - Data provenance report

1. A table showing each student's current GPA, one row per student, for Fall 2026 is:
   - Cross-sectional data
   - Longitudinal data
   - Roll-up data
   - Wide data

1. Longitudinal data means that:
   - The same person or item can appear in multiple rows
   - Each entity appears exactly once
   - The table contains summary rows
   - The values of one variable are spread across columns

1. What is the main risk of roll-up data?
   - Summing every row double-counts the totals
   - Values are stored with the wrong storage type
   - The measurement scale is ambiguous
   - Categories are coded inconsistently

1. Which is *not* a common way to identify a summary row?
   - The number of decimal places in the value
   - A label such as `Total`, `Subtotal`, or `All`
   - A blank key value
   - A flag supplied by the data source

1. In a table with columns for Math, English, and History scores, the data is:
   - Wide
   - Long
   - Longitudinal
   - Cross-sectional

1. Long data is generally preferred for:
   - Data visualization
   - Human-readable printed reports
   - Reducing the number of rows
   - Storing primary keys

1. Which is *not* a common representation of a missing value?
   - `0.00`
   - `NULL`
   - `"N/A"`
   - `-999`

1. Before removing or replacing missing values, an analyst should:
   - Determine why they are missing
   - Replace them with the column mean
   - Delete the affected rows
   - Convert them to zero

1. An employee age of `150` is best described as:
   - An invalid value
   - A missing value
   - An outlier
   - A duplicate

1. Why should outliers not be removed automatically?
   - Unusual observations may be the most important records in the dataset
   - Removing them requires a data dictionary
   - Outliers are always caused by data-entry errors
   - Most software cannot detect them

1. Which is *not* listed as a common method for identifying outliers?
   - Checking for leading zeros
   - Examining minimum and maximum values
   - Using a box plot
   - Calculating the interquartile range

1. A customer ID appearing many times in a transaction table:
   - Is expected, because a customer can make many purchases
   - Always indicates duplicate records
   - Means the field is a composite key
   - Means the table is cross-sectional

1. Which aggregation is appropriate for a ZIP Code field?
   - Count or distinct count
   - Sum
   - Mean
   - Median

1. Which is a discrete variable?
   - Customer Category
   - Delivery time
   - Product weight
   - Machine temperature
