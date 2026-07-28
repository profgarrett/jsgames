# Understand your data structure and values

This module focuses on understanding the underlying data before visualizing it. We will cover how to inspect data values for missing entries, outliers, and codings. We will also discuss different data structures, including cross-sectional, longitudinal, and roll-up data.

**Outcomes**:

- Understand data *values*
	- Identify missing values, outliers, and codings.
- Identify data *type*
	- Identify if a value is a string
	- Identify if a value is an integer or decimal
	- Identify if a value is continuous or discrete
- Understand data *structure*
	- Cross-sectional data
	- Longitudinal data
	- Roll-up data, where rows are both details and summary roll-ups (often found in government data)
	- Wide v. tall data


**Links**:

- [Quizlet Material](https://quizlet.com/1049122215/course_dv20-data-values-and-structure-flash-cards/)
- [Socviz.co Chapter 1](https://socviz.co/lookatdata.html)
- [Book, Fundamentals of Data Visualization](https://clauswilke.com/dataviz/)
- Good Cohort Example: [The generational collapse of American religion](https://www.graphsaboutreligion.com/p/the-generational-collapse-of-american)


## Data Values

We begin by inspecting individual cells. There are several questions we need to understand about the data before trying to visualize it.


**Missing values** are entries where data is not available. These can appear as `NULL`, `NaN`, empty strings (`""`), or even as placeholder text like `"N/A"` or `-999`. Missing values can distort averages, correlations, and trends. 

You may need to remove or impute (fill in) these values before visualization.

*Examples*

- In a dataset of students’ test scores, a missing value might indicate a student who didn’t take the test.
- A survey might have skipped questions, resulting in empty fields. 


**Outliers** are data points that fall far outside the range of the majority of values.Outliers can skew visualizations such as bar charts and histograms, making it hard to see patterns among the majority of the data.

*Examples*

- A person reporting an age of `150` in a demographic dataset.
- A customer spending `$1,000,000` in a store where the average is `$200`.


**Coding** refer to how values are recorded. For example, gender might be coded as `M/F`, `Male/Female`, or even `0/1`. Inconsistent codings can lead to improper grouping and inaccurate visual aggregation. Standardizing these formats is essential.

*Examples*

- `Gender` might be recorded as `M/F`, `Male/Female`, or even `0/1`.
- `Dates` might appear as `01/02/2023`, `2023-02-01`, or `February 1, 2023`.


## Data Types

Properly classifying the type of each field helps determine appropriate visual encodings (e.g., bar charts for categorical data, scatter plots for continuous numeric data).

**Strings** are textual fields. They store non-numeric data like names, categories, or descriptions.

*Examples*

- `City` = "New York" (string)
- `Status` = "Open" (or "Closed")    


**Numbers** can be divided into *integers* and *decimals*.  Integers are whole numbers, while decimals can represent fractions.

Codings can change the value of a number! For example, some systems store currency as pennies, so $1.00 is stored as `100`. 

Some numbers represent text through an encoding system. For example, 1 can be used to represent "Male" and 2 can be used to represent "Female".  In this case, the number is categorical, not continuous.

A common error is storing a number in a text field. This prevents the computer from summing or averaging until the field is converted into a number.

*Examples*

- *Integer*
	- `Age` = 21
	- `Number of Items Sold` = 5
- *Decimal*
	- `Temperature` = 98.6
	- `Sales Revenue` = 1234.56


**Dates** are a special type of data with some unique properties. Dates can be used to calculate durations, identify trends over time, and create time-based visualizations. They are generally stored as a number, representing the number of days since a reference date (e.g., January 1, 1970). Dates can also be stored as a string in a specific format (e.g., "YYYY-MM-DD").

**Boolean** values are a special type of categorical data that can only take on two values: `True` or `False`. They are often used to represent binary conditions, such as "Yes/No" or "On/Off". They are generally stored as either `1` or `0`.


### Value Distribution

We split all values into two categories: continuous and discrete. There are other ways to group variables, but these are the two commonly used in data visualization software.

**Continuous Fields** can take on _any value_ within a range. Their level of precision depends on the measurement instrument. They can be numbers (such as height or weight) or strings (such as names, which can be considered continuous in terms of length).

*Examples*

- `Revenue` = 982876.12
- `Days of Service` = 150
- `Company Address` = "123 Main St" 
- `Date of service` = "2023-01-15"


**Discrete Fields** consist of distinct and separate values.  They can be numbers or strings, but they are countable. They often represent categories or groups.

A numeric field doesn’t automatically mean it’s continuous. For instance, `ZIP Code` is numeric but discrete in nature.

- `Star rating` = 1  (possible values: 1, 2, or 3)
- `Product Category` = "Electronics" (possible values: "Electronics", "Clothing", "Home Goods")
- `Month of service` = 1 (possible values: 1-12, or "Jan", "Feb", "Mar", ...)


A related term is categorical. This means that a value represents one of a distinct set of possible values. 

In statistics, we use the following terms:
- Nominal
- Categorical
- Interval
- Ratio

Our value distributions lead to different potential **aggregation**.  Numeric fields can be aggregated (mean, median, sum), while string fields are usually grouped or counted.


## Data Structure

It's essential to understand _how_ data is structured and _what kind_ of measurements are being recorded. Different data shapes and measurement contexts dictate different types of visualizations and preprocessing steps. Below are common structural and temporal classifications of data.


**Cross-sectional data** refers to observations collected at a single point in time, typically across different subjects, such as individuals, organizations, or regions. Cross-sectional data is static—ideal for comparisons between entities using bar charts, box plots, or maps.

*Examples*

- A census dataset showing the population of each U.S. state in the year 2020.
- A marketing dataset showing ad spend across different campaigns for one specific quarter.
- Student test scores across multiple schools for a single semester.

Example dataset structure average freshman, sophomore, junior, and senior GPAs for different majors:

|Major|FreshmanGPA|SophomoreGPA|JuniorGPA|SeniorGPA|
|---|---|---|---|---|
|Biology|3.2|3.3|3.4|3.5|
|ComputerSci|3.5|3.6|3.7|3.8|
|History|3.1|3.2|3.3|3.4|


**Longitudinal Data**

Also known as _time series_ data, longitudinal data involves repeated observations of the same variables over time. Longitudinal data reveals trends, cycles, and patterns over time. Visualizations should emphasize temporal dynamics.

Best practices suggest that line charts are commonly used to visualize longitudinal data. Do not use a bar chart for longitudinal data, as it obscures trends and continuity.

*Examples*

- Daily stock prices for Apple over the past 5 years.    
- Monthly unemployment rates by country.    
- A student’s GPA recorded each semester.    

Example dataset structure for Longitudinal Data:

|Student ID|Semester|GPA|
|---|---|---|
|001|Fall 2020|3.5|
|001|Spring 2021|3.6|
|002|Fall 2020|3.8|
|002|Spring 2021|3.7|



**Roll-Up Data**

Roll-up data includes a mix of detailed and aggregated (summary) records in the same table. This is common in government or institutional data where subtotal or total rows are embedded within the raw dataset.

If not handled properly, roll-up rows can result in double-counting during analysis or incorrect visual representations.  For example, including both "New York City" and "All U.S. Cities" in the same bar chart can be misleading.


Handle these by:

- *Flag or remove* summary rows before aggregation.    
- *Separate* detail and summary records for different visualizations.    

Example Dataset with Roll-Up Rows:

|Location| Month|Sales|
|---|---|---|
|New York City|January|1000|
|New York City|February|1200|
|New York City|**Total**|**2200**|
|Los Angeles|January|800|
|Los Angeles|February|900|
|Los Angeles|**Total**|**1700**|

*Examples*

- A spreadsheet listing monthly spending by department, followed by yearly totals.    
- Education test data showing school-level results and then state-wide averages as separate rows.    
- Crime statistics by city with a final row for national totals.    


## Wide vs. Tall Data

In **wide data**, each variable gets its own column. This format is often used for human readability and spreadsheet reports. 

This structure is good for direct comparison between variables. However, most visualization libraries (e.g., ggplot2, Seaborn) expect data in tall format.

*Example*

|Student|Math|English|History|
|---|---|---|---|
|Alice|95|88|92|
|Bob|87|91|85|


**Tall** (or long) data is more normalized. One row per observation, with columns for entity, variable name, and value.

Tall data is better for:

- Faceted plots (small multiples)    
- Grouped summaries    
- Most tidy-data-based plotting systems    

*Example (same data as above, in tall format)*

|Student|Subject|Score|
|---|---|---|
|Alice|Math|95|
|Alice|English|88|
|Alice|History|92|
|Bob|Math|87|
|Bob|English|91|
|Bob|History|85|

