<script src="/course_model/toc.js"></script>

# Pandas 1: Data loading and filtering

Pandas is the most popular Python library for data manipulation and analysis. It provides data structures and functions needed to work with structured data seamlessly.

This introduction shows you to how to create a table (DataFrame), load from a CSV file, access a column, and filter rows.

**Outcomes**:
- Load data into a pandas DataFrame from a csv file
- Understand a pandas Series 
- Understand a pandas DataFrame.
- Load data from a csv file (specifying the number of rows to skip)
- Access a Series 
- Filter rows based on conditions (single and multiple with and/or)
- Reset an index after filtering

**Links:**
- [Python Practice](template.ipynb)
    - Required datafile: [Students.csv file](students.csv)
- [Predict outcomes](predict_outcomes_inclass.docx) (word file)


## Load Data

You can load data from a variety of file types, including CSV, Excel, SQL databases, and more. We will start with CSV files.

```python
import pandas as pd

# Load a CSV file
df = pd.read_csv('data.csv')

# You can skip some of the starting rows if needed
df = pd.read_csv('data.csv', skiprows=2)
```

## Access parts of the data

You can access individual columns (Series) inside of a dataframe.

```python
import pandas as pd
df = pd.DataFrame({'sales': [1, 2, 3], 'people': ['bob', 'tim', 'sue']})

print(df['sales'])  # Access the 'sales' column
```

## Filter

Filtering allows you to select rows that meet certain conditions. This is done by creating a boolean mask (True/False) and applying it to the DataFrame.

```python
import pandas as pd
df = pd.DataFrame({'sales': [1, 2, 3], 'people': ['bob', 'tim', 'sue']})

# Filter rows where sales > 1
filtered_df = df[df['sales'] > 1]
print(filtered_df)

# Or, broken into two steps,
filter_true_or_false = df['sales'] > 1
filtered_df = df[filter_true_or_false]
print(filtered_df)
```

### Conditional Tests

We have a variety of approaches to test conditions in pandas. Here are some common ones:
```python
import pandas as pd
df = pd.DataFrame({'sales': [1, 2, 3], 'people': ['bob', 'tim', 'sue']})

# Equal to
df[df['sales'] == 2]    

# Not equal to
df[df['sales'] != 2]
# Greater than
df[df['sales'] > 2]
# Less than
df[df['sales'] < 2]
# Greater than or equal to
df[df['sales'] >= 2]
# Less than or equal to
df[df['sales'] <= 2]

# Contains (for text)
df[df['people'].str.contains('o')]

# Starts with
df[df['people'].str.startswith('b')]

# Is null or NA
df[df['people'].isnull()]

# Is not null or NA
df[df['people'].notnull()]
```

### Multiple conditions (AND / OR)

We can combine multiple conditions using `&` (AND) and `|` (OR). Remember to use parentheses around each condition.

Note that we do not use the words "and" or "or" in pandas filtering; we use `&` and `|` instead.

```python
import pandas as pd
df = pd.DataFrame({'sales': [1, 2, 3, 4], 'people': ['bob', 'tim', 'sue', 'ann']})

# AND condition: sales > 1 AND sales < 4
filtered_df_and = df[(df['sales'] > 1) & (df['sales'] < 4)]
print(filtered_df_and)

# OR condition: sales < 2 OR sales > 3
filtered_df_or = df[(df['sales'] < 2) | (df['sales'] > 3)]
print(filtered_df_or)
```

### Reset Index

We can reset the index of a DataFrame using the `reset_index()` function. This is useful after grouping or filtering data.

```python
import pandas as pd
df = pd.DataFrame({'sales': [1, 2, 3, 4], 'people': ['bob', 'tim', 'sue', 'ann']})
filtered_df = df[df['sales'] > 2]

 # Reset index so that our indexes start at 0, 1, 2, ...
 # Note that we use drop=True to avoid adding the old index as a column
df_reset = filtered_df.reset_index(drop=True) 

# We can also manually set an index. For example, set 'student_id_number' as the index:
df = pd.DataFrame({
    'student_id_number': [100, 200, 300],
    'name': ['Alice', 'Bob', 'Charlie'],
    'grade': [90, 85, 95]
})
df.set_index('student_id_number', inplace=True)

# We can now easily access rows by index
print("Row with index 200:\n", df.loc[200])

```
