# Regression data transformations

There are several other important concepts to understand when working with regression models.

**Outcomes**:
- Describe the overall process of building a model
    - Check data for potential issues and to understand how data is being stored (esp at what level of granularity)
    - Clean the data and create new features. However, don't get too carried away with feature engineering. You can always come back and add more features later if you need to.
    - Examine correlations to get a sense of which features are likely to be important and to check for multicolinearity.
    - Build the model and check the results.
    - Repeat!
- Transform data to make it work with regression
    - Convert numbers stored as text to regular numbers
    - Convert category (usually text) to hot-encoded variables (1 or 0) for each category. Know when to drop the first category.
    - Deal with NaN values by dropping the column, row, or by filling in a value (imputing, e.g. the mean of the column)
    - Bin/Group category data by using replace to combine categories into fewer categories (e.g. combine all zip codes into 5 regions) or with a lookup table.
    - Remove outliers by filtering out rows with values that are outside of a reasonable range (e.g. 3 standard deviations from the mean) or using the clip function to set a maximum value for the column.
    - Remove old columns after checking to make sure that the new column works as expected.
- Detect common pitfalls of regression
    - Describe the impaact of an outlier on a regression model, and how to detect and address outliers.
    - Describe the impact of a non-linear relationship between the independent and dependent variable, and how to detect and address non-linearity.
    - Describe the impact of multicolinearity on a regression model, and how to detect and address multicolinearity.
- Interpret regression results
    - Describe the meaning of R^2 and adjusted R^2, and how to use them to evaluate the fit of a regression model.
    - Describe the meaning of the coefficients for each independent variable, and how to interpret them in the context of the data.
    - Describe the meaning of p-values for each independent variable, and how to use them to determine which independent variables are significantly associated with the dependent variable.

**Links**:

- [Ames Regression](ames_template.ipynb) and [data](ames_lite.csv)

## Data transformations

### Handle missing values

We often want to exclude rows with missing values. We can do this with the `dropna` function.
However, this can sometimes remove too much data, so be careful! 

`df = df.dropna(subset=['column1', 'column2'])`


### Fix missing values

We sometimes will want to fill in missing values. We can do this with the `fillna` function.

`df = df.assign(column = df['column'].fillna(value))`


Or, we may want to change one or two specific column values. We can do this with the `replace` function.

`df = df.assign(column = df['column'].replace({old_value: new_value}))`


If you have a specific value you want to replace, you can also use the `np.where` function.

`df = df.assign(column = np.where(df['column'] == old_value, new_value, df['column']))`


### Convert text to numbers

We can use the `astype` function to convert text to numbers. This is useful for when a column is stored as text but contains numeric values.
Note that you will need to remove any non-numeric characters first, such as commas or dollar signs.

`df = df.assign(column = df['column'].str.replace('$', '').astype(float))`

### Collapse categories and create new columns

We can collapse categories by using the `replace` function. This is useful for categorical variables with many levels.

`data['column'] = data['column'].replace({'old_value': 'new_value'})`


### Create new columns with 1/0 variables

We can create new columns with 1/0 variables using the `np.where` function.

`data['new_column'] = np.where(data['column'] == 'value', 1, 0)`

### Remove or cap outliers

Outlier values can throw off our model. We can remove them by using the `np.where` function, or we can cap them by using the `clip` function.

`df = df.assign(column = df['column'].clip(lower=lower_limit, upper=upper_limit))`

### Remove old columns

We can remove old columns by using the `drop` function.

`df = df.drop(columns=['old_column1', 'old_column2'])`


```python
# Sample code
import pandas as pd
import numpy as np


# Sales table
df_raw = pd.DataFrame({
    'sales_id': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    'sales_as_text': ['1,000', '2,000', '2,500', '10,000', '1,900', np.nan, '3,000', '4,000', '5,000', '6,000'],
    'profit': [0, 400, 1600, 6250, 240, np.nan, 900, 1600, 500, 600],
    'office_size': [16, 1, 2, 3, 1, 3, 2, 4, 5, 2],
    'closed': [True, False, True, False, False, False, True, True, False, True],
    'state': ['ca', 'ca', np.nan, 'NY', 'ca', np.nan, 'NY', 'NY', 'ca', 'ca'],
})


# Create a copy of the raw data to clean
df = df_raw.copy()

# Drop bad rows with missing profit
df = df.dropna(subset=[ 'profit'])

# Change NY to ny
df = df.assign(
    state = df['state'].str.lower()
)

# Convert sales_as_text to numeric (remove commas and convert to float)
df = df.assign(
    sales_as_number = df['sales_as_text'].str.replace(',', '').astype(float)
)

# Create as is_ny column
df = df.assign(
    is_ny = np.where(df['state'] == 'ny', 1, 0)
)

# Fill empty states with ny
df = df.assign(
    state = df['state'].fillna('ny')
)

# Cap the number of office_size field to avoid outliers
df = df.assign(
    office_size_clipped = df['office_size'].clip(upper=10)
)

# Remove columns that we do not need for our model
df = df.drop(columns=['sales_as_text', 'sales_id', 'closed'])

df
```


|   | profit | office_size | state | sales_as_number | is_ny | office_size_clipped |
|---|---|---|---|---|---|---|
| 0 | 0.0 | 16 | ca | 1000.0 | 0 | 10 |
| 1 | 400.0 | 1 | ca | 2000.0 | 0 | 1 |
| 2 | 1600.0 | 2 | ny | 2500.0 | 0 | 2 |
| 3 | 6250.0 | 3 | ny | 10000.0 | 1 | 3 |
| 4 | 240.0 | 1 | ca | 1900.0 | 0 | 1 |
| 6 | 900.0 | 2 | ny | 3000.0 | 1 | 2 |
| 7 | 1600.0 | 4 | ny | 4000.0 | 1 | 4 |
| 8 | 500.0 | 5 | ca | 5000.0 | 0 | 5 |
| 9 | 600.0 | 2 | ca | 6000.0 | 0 | 2 |


## Interpretation tips:

- Follow the overall process:
    1. Check field types and values
    1. Clean the data and create new features
    1. Examine the relationship between the independent and dependent variables with a scatterplot or correlation matrix
    1. Fit the model and interpret the results
    1. Repeat 
- Start with a simple model, using just 1 independent and 1 dependent variable. This will help you understand the relationship between the two variables and how to interpret the coefficients. Then, go back and add another independent variable, and so on. This will help you understand how the coefficients change as you add more variables to the model.

Dealing with NaN values:

The best way to deal with NaN values depends on the context and the amount of missing data. 
- If you have a lot of missing data, it may be best to drop the column. For example, if you're missing 50% of the values in a column, it may be best to drop the column.
- For a rare occurance, you may want to drop the row. However, be careful when dropping rows, as this can introduce bias into your model if the missing values are not random. It may also result in droping a lot of rows, so count to see how much data you are throwing out. 
- If you can logically assume a value, imputation may be the best approach. However, this requires a logical reason for why the value is missing and what the value should be. For example, if you have a column for "number of children" and you have a missing value, you might assume that the missing value is 0 (i.e. the person has no children). However, if you have a column for "income" and you have a missing value, it may be more difficult to impute a reasonable value.

Common problems:

- Make sure that data types are clean! If you have a column that is supposed to be numeric but is stored as text, this can cause problems with the model. You can use the `astype` function to convert the column to the correct data type.
- Understand relationship between variables.
    - If the relationship between the independent and dependent variable is not linear, then a linear regression model may not be appropriate. In this case, you may want to consider using a different type of model, such as a polynomial regression or a non-parametric model.
    - If the relationship between the independent and dependent variable is not linear, you can try transforming the data to make it more linear. For example, you can take the logarithm of the independent variable.
- Check for outliers and influential points. Outliers can have a large impact on the coefficients and the overall model fit. You can use scatterplots or leverage plots to identify outliers and influential points. If you find any, you can try removing them or using a different type of model that is less sensitive to outliers.

Model Evaluation:

- R^2 ranges from 0 to 1, with higher values indicating a better fit. However, R^2 can be misleading when comparing models with different numbers of independent variables, as it will always increase as you add more variables. Adjusted R^2 accounts for the number of independent variables in the model and can be used to compare models with different numbers of independent variables.
    - R^2 over 0.9 may indicate a problem
    - R^2 over 0.7 or higher are very good
    - R^2 over 0.4 is moderate
    - R^2 over 0.2 is low
    - R^2 under 0.2 would not generally be acceptable.
    - However, these values vary a lot depending on the context and the field of study.
- Having a very high R^2 may indicate multicolinearity. This means that you are including multiple independent variables that are highly correlated with each other, which can make it difficult to interpret the coefficients and can lead to overfitting. You can check for multicolinearity by looking at the correlation matrix.
- Look at the coefficient for each independent variable and its p-value. A significant p-value (typically less than 0.05) indicates that the independent variable is significantly associated with the dependent variable, while a non-significant p-value indicates that there is no evidence of an association between the independent variable and the dependent variable.
    - However p-values can be misleading, as they are also based on the sample size. A true relationship may be non-significant if the sample size is too small. If you have a very large dataset, you may find that even very small effects are statistically significant. In this case, it is important to also look at the size of the coefficient and the confidence interval to determine if the effect is meaningful.

## Key Terms

- **Feature engineering**: Creating new input columns from existing data to help a model
- **Granularity**: The level of detail each row represents, such as one sale, one store, or one month
- **Missing value (NaN)**: An empty cell where no value was recorded
- **Dropping**: Removing rows (`dropna`) or columns (`drop`) that have missing or unneeded data
- **Imputation**: Filling in a missing value with a reasonable substitute, such as 0 or the column mean (`fillna`)
- **Type conversion**: Changing a column's data type, such as text to number, with `astype`
- **One-hot encoding (dummy variable)**: Turning a category into 1/0 columns, one per level
- **Dropping the first category**: Leaving out one dummy column so it becomes the reference level
- **Binning / collapsing categories**: Combining many category levels into fewer groups, such as zip codes into regions
- **Outlier**: A value far outside the normal range, such as more than 3 standard deviations from the mean
- **Clipping (capping)**: Setting a maximum or minimum value for a column with `clip`
- **Influential point**: A single observation that strongly changes the fitted line or coefficients
- **Non-linearity**: A curved relationship between an input and the output that a straight line cannot capture
- **Log transformation**: Taking the logarithm of a variable to straighten a curved or skewed relationship
- **Multicollinearity**: When input variables are highly correlated with each other
- **Adjusted R²**: R² with a penalty for each added input, used to compare models with different numbers of inputs


## Practice Questions

1. What is the first step in the overall model-building process?
   - Check field types and values to understand how the data is stored
   - Fit the model and read the p-values
   - Add as many new features as possible
   - Remove all outliers
1. What does "granularity" of a dataset mean?
   - The level of detail each row represents, such as one sale or one store
   - The number of columns in the dataset
   - The share of missing values
   - The precision of the numbers after the decimal point
1. Why should you start with a simple model of one input and one output?
   - It helps you understand the relationship and how coefficients change as you add inputs
   - Simple models always have the highest R²
   - Regression cannot handle more than one input at first
   - It removes the need to check for outliers
1. A `price` column contains values like "$1,200" stored as text. What must you do before using it in a regression?
   - Remove the "$" and "," characters, then convert with `astype(float)`
   - Convert it to dummy variables
   - Use `clip` to cap the values
   - Nothing; regression reads text numbers automatically
1. What does `df.dropna(subset=['profit'])` do?
   - Removes rows where profit is missing
   - Removes the profit column
   - Fills missing profit values with 0
   - Removes rows where profit is 0
1. What is the main risk of dropping rows with missing values?
   - You may throw out a lot of data and introduce bias if the missing values are not random
   - It always lowers R² to zero
   - It converts numeric columns to text
   - It creates multicollinearity
1. When is it usually best to drop an entire column?
   - When a large share of its values, such as 50%, are missing
   - When it has a single missing value
   - When it is strongly correlated with the output
   - When its values are all numeric
1. What is imputation?
   - Filling in a missing value with a reasonable substitute
   - Removing rows with missing values
   - Converting text to numbers
   - Combining categories into fewer groups
1. For which column is imputing a missing value as 0 most reasonable?
   - Number of children, if a blank likely means none
   - Annual income
   - Customer age
   - House sale price
1. Which pandas function fills in missing values?
   - `fillna`
   - `dropna`
   - `astype`
   - `clip`
1. What does `np.where(df['state'] == 'ny', 1, 0)` create?
   - A 1/0 column that is 1 for NY rows and 0 otherwise
   - A dataset with only NY rows
   - A text column with the value "ny"
   - A column counting the number of NY rows
1. A `color` column has four levels: red, blue, green, and yellow. How many dummy columns should go into a regression?
   - Three, with one level left out as the reference
   - Four, one for every level
   - One, coded 1 to 4
   - Two, for the two most common colors
1. Why do we drop the first category when one-hot encoding?
   - Including every level makes the columns perfectly redundant, and the dropped level becomes the reference
   - The first category is always the least important
   - It reduces the number of rows
   - Regression can only handle an odd number of columns
1. A column has 200 different zip codes. What is a good way to make it usable in a regression?
   - Bin the zip codes into a few regions with `replace` or a lookup table
   - Create 199 dummy variables
   - Convert the zip codes to numbers and use them directly
   - Drop every row with a rare zip code
1. What does `df['office_size'].clip(upper=10)` do?
   - Sets any office size above 10 to exactly 10
   - Removes rows where office size is above 10
   - Divides every office size by 10
   - Keeps only the first 10 rows
1. What is a common rule for identifying an outlier?
   - A value more than 3 standard deviations from the mean
   - Any value above the median
   - Any value that appears only once
   - Any negative value
1. How can a single outlier affect a regression model?
   - It can pull the fitted line and change the coefficients a lot
   - It has no effect because regression uses averages
   - It always increases the p-values to 1
   - It removes the intercept
1. A scatterplot shows the output rising steeply at first and then leveling off. What is a reasonable fix?
   - Take the log of the input to make the relationship more linear
   - Clip the output variable
   - Add a dummy variable for every row
   - Drop the input from the model
1. A model has an R² of 0.97. What should you suspect?
   - A possible problem, such as multicollinearity or an input that leaks the answer
   - The model is perfect and needs no further checks
   - The sample size is too small to compute p-values
   - The output variable is categorical
1. With a very large dataset, an input has p < 0.001 but a tiny coefficient. What should you conclude?
   - The effect is probably real but may be too small to matter; check the coefficient size and confidence interval
   - The input is the most important variable in the model
   - The p-value must be wrong
   - The input should be clipped
