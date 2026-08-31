# Pandas 1: Data loading and filtering

Pandas is the most popular Python library for data manipulation and analysis. It provides data structures and functions needed to work with structured data seamlessly.

This introduction shows you how to create a table (DataFrame), load from a CSV file, access a column, and filter rows.

**Outcomes**:
- Load data into a pandas DataFrame from a csv file
- Understand a pandas Series
- Understand a pandas DataFrame.
- Load data from a csv file (specifying the number of rows to skip)
- Access a Series
- Filter rows based on conditions (single and multiple with and/or)
- Reset an index after filtering
- Use functions `isin`, `between`, and `~` to filter data
- Learn how to use `.loc` to access rows and columns by label
- Learn how copy works with filtered DataFrames

**Links:**
- [Slides](/static/pages/slides.html?course=course_model&module=py03-pandas-load-filter)
- [Python Practice](template.ipynb)
    - Required datafile: [Students.csv file](students.csv)
- [Predict outcomes](predict_outcomes_inclass.docx) (word file)



## Series and DataFrames

Pandas has two major data structures.

A **DataFrame** is the whole table: rows and named columns, like a sheet in Excel. A **Series** is a single column of that table, plus its index.

```python
import pandas as pd

df = pd.DataFrame({'sales': [1, 2, 3], 'people': ['bob', 'tim', 'sue']})
print(df)
#    sales people
# 0      1    bob
# 1      2    tim
# 2      3    sue
```

The unlabeled column of numbers on the left is the **index** — the row labels. Pandas creates it automatically, starting at 0, unless you tell it otherwise.

Pulling out one column gives you a Series:

```python
print(type(df))            # DataFrame
print(type(df['sales']))   # Series

print(df['sales'])
# 0    1
# 1    2
# 2    3
# Name: sales, dtype: int64
```

Notice the Series prints its index alongside its values, and reports one dtype for the whole column. That single shared dtype is what a Series has in common with a NumPy array, and it is why column-wide math is fast.

Two brackets give you back a DataFrame with one column instead of a Series:

```python
print(type(df[['sales']]))   # DataFrame, not Series
```

The difference matters when a function expects one or the other. A useful mental model: a DataFrame is a dictionary of Series that all share the same index.


## Load Data

You can load data from a variety of file types, including CSV, Excel, SQL databases, and more. We will start with CSV files.

```python
import pandas as pd

# Load a CSV file
df = pd.read_csv('data.csv')

# You can skip some of the starting rows if needed
df = pd.read_csv('data.csv', skiprows=2)
```

`skiprows=2` throws away the first two lines of the file, then treats the next line as the header. Real-world exports often start with a title and a blank line before the actual column names.

Other arguments you may need:

```python
pd.read_csv('data.csv', nrows=100)              # read only the first 100 rows, good for testing
pd.read_csv('data.csv', usecols=['name', 'gpa'])  # read only these columns, good for massive datasets
pd.read_csv('data.csv', na_values=['N/A', '-'])   # treat these values as missing flags
```

### Always look at the data after loading it

Loading is not the same as loading *correctly*. 

```python
df = pd.DataFrame({
    'name':    ['Alice', 'Bob', 'Charlie', 'Dana', 'Eli'],
    'major':   ['ACCT', 'FIN', 'ACCT', 'MIS', None],
    'gpa':     [3.9, 2.8, 3.4, 3.1, 2.5],
    'credits': [90, 45, 120, 60, 30],
})

print(df.head(3))       # first few rows
#       name major  gpa  credits
# 0    Alice  ACCT  3.9       90
# 1      Bob   FIN  2.8       45
# 2  Charlie  ACCT  3.4      120

print(df.shape)             # (5, 4)  five rows, four columns
print(df.columns.tolist())  # ['name', 'major', 'gpa', 'credits']
```

`df.info()` reports each column's type and how many non-missing values it has, and `df.describe()` gives the descriptive statistics from the earlier module for every numeric column. If `shape` shows one column when you expected six, your separator is wrong. If a numeric column came in as text, something non-numeric is hiding in it.


## Access parts of the data

You can access individual columns (Series) inside of a dataframe.

```python
import pandas as pd
df = pd.DataFrame({'sales': [1, 2, 3], 'people': ['bob', 'tim', 'sue']})

print(df['sales'])  # Access the 'sales' column
```

Because a Series behaves like a NumPy array, you can aggregate or transform a whole column in one line:

```python
print(df['sales'].mean())   # 2.0
print(df['sales'].max())    # 3
print(df['sales'].sum())    # 6
print(df['sales'] * 2)      # every value doubled, as a new Series
```

Nothing above changes `df`. Pandas operations return new objects; the original is untouched unless you assign the result back.


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

The two-step version shows what is actually happening. The condition alone produces a Series of True/False, one value per row:

```python
print(df['sales'] > 1)
# 0    False
# 1     True
# 2     True
# Name: sales, dtype: bool
```

Putting that mask inside `df[...]` keeps only the rows marked True:

```python
print(df[df['sales'] > 1])
#    sales people
# 1      2    tim
# 2      3    sue
```

This is the same boolean indexing you used on NumPy arrays, applied to a whole table. Read `df[df['sales'] > 1]` as "the rows of df where sales is greater than 1."

Because True counts as 1, summing the mask counts matching rows without building the filtered table:

```python
print((df['sales'] > 1).sum())   # 2
```

### Note the surviving index

Look at the index above: the filtered result kept labels 1 and 2. Pandas does not renumber rows when you filter, which is deliberate — it lets you trace a row back to its original position. It also means the first row of a filtered table is usually *not* index 0, which surprises people. That is what `reset_index()` below is for.

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

Three more that save a lot of typing:

```python
students = pd.DataFrame({
    'name':  ['Alice', 'Bob', 'Charlie', 'Dana', 'Eli'],
    'major': ['ACCT', 'FIN', 'ACCT', 'MIS', None],
    'gpa':   [3.9, 2.8, 3.4, 3.1, 2.5],
})

# isin: match any value in a list, instead of chaining == with |
print(students[students['major'].isin(['ACCT', 'MIS'])])
#       name major  gpa
# 0    Alice  ACCT  3.9
# 2  Charlie  ACCT  3.4
# 3     Dana   MIS  3.1

# between: an inclusive range, instead of chaining >= and <= with &
print(students[students['gpa'].between(3.0, 3.5)])
#       name major  gpa
# 2  Charlie  ACCT  3.4
# 3     Dana   MIS  3.1

# ~ : NOT, which flips a whole mask
print(students[~(students['major'] == 'ACCT')])
```

Use `~` rather than `!=` when the condition is complicated: `~(a & b)` is clearer than rewriting the whole thing with the comparisons reversed.

### Working with text and missing values

Text conditions go through the `.str` accessor, and they are case-sensitive by default:

```python
print(students[students['name'].str.contains('a')])         # Charlie, Dana
print(students[students['name'].str.contains('a', case=False)])  # Alice too
```

Missing values need care. A comparison against `NaN` is always False, so `~(major == 'ACCT')` above quietly *included* Eli, whose major is missing — he is not ACCT, so the flipped mask keeps him. Whether that is what you wanted depends on the question.

For `.str` methods, get in the habit of passing `na=False`:

```python
print(students[students['major'].str.contains('A', na=False)])
```

Without it, older versions of pandas (2.x) return `NaN` for the missing rows and then raise an error when you try to filter with that mask. Pandas 3.0 treats them as False automatically. Passing `na=False` works correctly in both, so it is the safe habit.

Count missing values before you do anything else with a column:

```python
print(students['major'].isnull().sum())    # 1
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
#    sales people
# 1      2    tim
# 2      3    sue

# OR condition: sales < 2 OR sales > 3
filtered_df_or = df[(df['sales'] < 2) | (df['sales'] > 3)]
print(filtered_df_or)
#    sales people
# 0      1    bob
# 3      4    ann
```

**Why not `and`?** Python's `and` demands a single True or False, but each condition here is a whole Series of them. Pandas cannot guess whether you mean "all rows" or "any row," so it refuses:

```python
df[(df['sales'] > 1) and (df['sales'] < 4)]
# ValueError: The truth value of a Series is ambiguous.
```

`&` and `|` work elementwise, comparing the two masks row by row.

**Why the parentheses?** `&` binds more tightly than `>` in Python, so without them the expression groups as `df['sales'] > (1 & df['sales']) < 4` and fails. Wrap every condition in parentheses and you never have to think about it.

Seeing the masks side by side makes the row-by-row combination concrete:

```python
print((df['sales'] > 1).tolist())                        # [False, True, True, True]
print((df['sales'] < 4).tolist())                        # [True, True, True, False]
print(((df['sales'] > 1) & (df['sales'] < 4)).tolist())  # [False, True, True, False]
```

### Reset Index

We can reset the index of a DataFrame using the `reset_index()` function. This is useful after grouping or filtering data.

```python
import pandas as pd
df = pd.DataFrame({'sales': [1, 2, 3, 4], 'people': ['bob', 'tim', 'sue', 'ann']})
filtered_df = df[df['sales'] > 2]

print(filtered_df)
#    sales people
# 2      3    sue
# 3      4    ann

# Reset index so that our indexes start at 0, 1, 2, ...
# Note that we use drop=True to avoid adding the old index as a column
df_reset = filtered_df.reset_index(drop=True)
print(df_reset)
#    sales people
# 0      3    sue
# 1      4    ann
```

The filtered table kept the labels 2 and 3 from the original. After `reset_index(drop=True)` the rows are numbered 0 and 1 again.

`drop=True` is the part to remember. Without it, the old index is preserved as a new column rather than discarded:

```python
print(filtered_df.reset_index())
#    index  sales people
# 0      2      3    sue
# 1      3      4    ann
```

That is occasionally useful — it records where each row came from — but usually it is clutter, and it is a common source of mystery `index` columns in student assignments.

### Setting your own index

```python
# We can also manually set an index. For example, set 'student_id_number' as the index:
df = pd.DataFrame({
    'student_id_number': [100, 200, 300],
    'name': ['Alice', 'Bob', 'Charlie'],
    'grade': [90, 85, 95]
})
df.set_index('student_id_number', inplace=True)

print(df)
#                     name  grade
# student_id_number
# 100                Alice     90
# 200                  Bob     85
# 300              Charlie     95

# We can now easily access rows by index
print("Row with index 200:\n", df.loc[200])
# name     Bob
# grade     85
```

`student_id_number` is no longer a regular column — it has become the row label, which is why `df.loc[200]` returns Bob rather than the row in position 200.

`inplace=True` modifies `df` directly instead of returning a new DataFrame. The equivalent without it is `df = df.set_index('student_id_number')`, which many people prefer because the assignment makes the change visible.

`.loc` also takes a mask and a column name together, which is the cleanest way to pull one column from filtered rows:

```python
print(df.loc[df['grade'] > 88, 'name'])
# student_id_number
# 100      Alice
# 300    Charlie
```

**One caution.** If you plan to *modify* a filtered table, take an explicit copy first:

```python
high_scores = df[df['grade'] > 88].copy()
high_scores['grade'] = high_scores['grade'] + 5   # safe
```


## Key Terms

- **pandas**: The Python library for working with tables of data
- **DataFrame**: A two-dimensional table with rows and named columns
- **Series**: A single column of a DataFrame, one-dimensional and labeled
- **Index**: The row labels of a Series or DataFrame
- **CSV**: A plain-text file storing a table, one row per line, values separated by commas
- **Boolean mask**: A Series of True/False values used to select rows
- **Filtering**: Keeping only the rows where a condition is True
- **NaN**: Pandas' marker for a missing value
- **Chained condition**: Two or more tests combined with `&` or `|`
- **reset_index()**: Renumbers the index from 0 after filtering
- **set_index()**: Makes one of the columns the row label
- **.loc**: Selects rows and columns by label
- **Vectorized operation**: A comparison or calculation applied to a whole column at once


## Practice Questions

1. What is a pandas DataFrame?
   - A two-dimensional table with rows and named columns
   - A single column of data
   - A Python list of dictionaries
   - A file format for storing data
1. What is a pandas Series?
   - A single column of data with an index
   - A table with rows and columns
   - A list of DataFrames
   - The row labels of a table
1. What does `df['sales']` return?
   - A Series
   - A DataFrame
   - A list
   - A single value
1. What does `df[['sales']]` return?
   - A DataFrame with one column
   - A Series
   - A list of column names
   - An error, because of the double brackets
1. What is the index of a DataFrame?
   - The row labels
   - The column names
   - The number of rows
   - The position of the first column
1. Which function loads a CSV file into a DataFrame?
   - `pd.read_csv()`
   - `pd.load_csv()`
   - `pd.open_csv()`
   - `pd.import_csv()`
1. What does `skiprows=2` do in `pd.read_csv()`?
   - Ignores the first two lines of the file before reading the header
   - Skips the first two columns
   - Skips every second row
   - Removes the last two rows
1. A CSV export begins with a report title and a blank line before the column names. Which argument fixes the load?
   - `skiprows=2`
   - `nrows=2`
   - `usecols=2`
   - `na_values=2`
1. What does `df.shape` return?
   - A tuple of the number of rows and columns
   - The data types of each column
   - The first five rows
   - The number of missing values
1. Which method shows the first few rows of a DataFrame?
   - `df.head()`
   - `df.first()`
   - `df.top()`
   - `df.preview()`
1. What does the expression `df['sales'] > 1` produce on its own?
   - A Series of True/False values, one per row
   - The filtered DataFrame
   - A count of matching rows
   - A single True or False
1. What is a boolean mask used for?
   - Selecting the rows where a condition is True
   - Hiding columns from display
   - Converting numbers to text
   - Replacing missing values
1. How do you count the rows matching a condition without building the filtered table?
   - `(df['sales'] > 1).sum()`
   - `df['sales'].count()`
   - `len(df.columns)`
   - `df['sales'].sum()`
1. After `filtered = df[df['sales'] > 2]`, what does the index of `filtered` look like?
   - It keeps the original row labels rather than renumbering
   - It always restarts at 0
   - It is removed entirely
   - It becomes a column named `index`
1. Which symbol means AND when combining pandas conditions?
   - `&`
   - `and`
   - `+`
   - `&&`
1. Which symbol means OR when combining pandas conditions?
   - `|`
   - `or`
   - `||`
   - `/`
1. Why can't you use the word `and` to combine two pandas conditions?
   - `and` needs a single True or False, but each condition is a whole Series
   - `and` is a reserved word that pandas cannot access
   - `and` only works on text columns
   - `and` works, but it is slower
1. Why does each condition need its own parentheses, as in `(df['a'] > 1) & (df['a'] < 4)`?
   - `&` binds more tightly than the comparison operators, so the expression groups wrongly without them
   - Pandas requires parentheses around every function argument
   - The parentheses convert the conditions to booleans
   - They are optional and only improve readability
1. Which method filters rows whose value matches any item in a list?
   - `.isin(['ACCT', 'MIS'])`
   - `.contains(['ACCT', 'MIS'])`
   - `.match(['ACCT', 'MIS'])`
   - `.any(['ACCT', 'MIS'])`
1. Which method filters rows with a value in an inclusive numeric range?
   - `.between(3.0, 3.5)`
   - `.range(3.0, 3.5)`
   - `.within(3.0, 3.5)`
   - `.span(3.0, 3.5)`
1. What does the `~` operator do to a mask?
   - Reverses it, turning True into False and False into True
   - Sorts it
   - Counts the True values
   - Removes the missing values
1. Which expression finds rows where the `people` column contains the letter "o"?
   - `df[df['people'].str.contains('o')]`
   - `df[df['people'].contains('o')]`
   - `df[df['people'] == 'o']`
   - `df[df['people'].str('o')]`
1. Is `str.contains('a')` case-sensitive by default?
   - Yes, and you can pass `case=False` to change it
   - No, it ignores case automatically
   - Only for columns loaded from a CSV
   - Only when the column contains missing values
1. Why should you pass `na=False` to `.str.contains()`?
   - Missing values otherwise produce a non-boolean mask that can raise an error
   - It makes the search case-insensitive
   - It speeds up the comparison
   - It removes missing rows from the DataFrame permanently
1. Which method finds rows where a column is missing?
   - `df['major'].isnull()`
   - `df['major'] == None`
   - `df['major'] == 'NaN'`
   - `df['major'].missing()`
1. How many rows does `df['major'].isnull().sum()` report?
   - The count of missing values in that column
   - The number of rows in the DataFrame
   - The sum of the column's values
   - The number of unique values
1. What does `reset_index(drop=True)` do?
   - Renumbers the rows from 0 and discards the old index
   - Renumbers the rows and keeps the old index as a column
   - Deletes the first row
   - Sorts the DataFrame by its index
1. What happens if you call `reset_index()` without `drop=True`?
   - The old index is added back as a new column
   - The index is deleted entirely
   - Nothing changes
   - An error is raised
1. What does `df.set_index('student_id_number')` do?
   - Makes that column the row labels
   - Sorts the DataFrame by that column
   - Deletes that column
   - Renames the DataFrame
1. After setting `student_id_number` as the index, what does `df.loc[200]` return?
   - The row whose student ID is 200
   - The row in position 200
   - The value 200
   - An error, since there are only three rows
1. What does `inplace=True` do?
   - Modifies the DataFrame directly instead of returning a new one
   - Creates a copy before modifying
   - Applies the change only to the displayed output
   - Restricts the change to numeric columns
1. Why add `.copy()` when you plan to modify a filtered DataFrame?
   - It makes clear you are changing the filtered table, not the original
   - It speeds up the filtering
   - It resets the index automatically
   - It is required for all filtering