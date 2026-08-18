# Pandas 2: Data mutation

This tutorial shows how to create and remove columns in Pandas.

**Outcomes**:
- Drop a field
- Rename a field
    - Rename all fields to be lowercase and replace spaces with underscores
- Create a new field with a constant value, or a modified version of another field
    - Use string functions like trim, lower, upper
    - Use arithmetic operations
    - Use number functions like round
    - Use a boolean comparison (like in a filter)
- Use np.where to conditionally change values in a field
    - Use isna to check for missing values and replace them with something else
    - Use a dictionary to map values from one set to another
    - Use string functions like contains to check for substrings
    - Use & (and) and \| (or) to combine multiple conditions

**Links:**
- [template](template.ipynb)
- [Predict Mutation Template](predict_mutation.docx)


## Fix fields with dropping and renaming

We often need to fix fields in a dataframe. Common operations include removing and renaming.


```python
# Sample fields
import pandas as pd

# Create sample data
df_students = pd.DataFrame({
    'Student Id': [1, 2, 3, 4],
    'Name': ['Alice', 'Bob', 'Charlie', 'David'],
    'Class': ['Freshman', 'Sophomore', 'Junior', 'Senior'],
    'Scr': [85, 90, 78, 10],
    'Extracurricular': ['Basketball', 'Soccer', 'Chess', 'Debate']
})

# Rename all fields to be lowercase and use underscores
# This is a common convention in pandas dataframes
df_students.columns = [col.lower().replace(' ', '_') for col in df_students.columns ]

# Remove fields we do not need in our analysis
df_students = df_students.drop(columns=['extracurricular', 'name', 'class'])

# Rename 'scr' to the easier to understand 'exam_score'
# This can be easier to read if you put columns on a new line
df_students = df_students.rename(
    columns={'scr': 'exam_score'}
)

print(df_students)
```

       student_id  exam_score
    0           1          85
    1           2          90
    2           3          78
    3           4          10

### Why rename everything to snake_case

`'Student Id'` is a legal column name, but a painful one. Spaces and capitals mean you can only ever reach it one way:

```python
df['Student Id']    # works
df.Student Id       # syntax error
```

Lowercase names with underscores let you use the shorter dot syntax, and remove any question of whether you capitalized correctly. Doing it once, immediately after loading, saves a great deal of debugging later.

### Reading the list comprehension

That renaming line does a lot of work in a small space. Unpacked, it is a loop:

```python
new_names = []
for col in df_students.columns:
    new_names.append(col.lower().replace(' ', '_'))
df_students.columns = new_names
```

The comprehension version says the same thing: "for each `col` in the columns, give me `col.lower().replace(' ', '_')`." Traced on one value:

```python
col = 'Student Id'
print(col.lower())                      # 'student id'
print(col.lower().replace(' ', '_'))    # 'student_id'
```

The two string methods are chained — `.lower()` returns a new string, and `.replace()` runs on that result.

### Dropping and renaming

`drop()` takes a list of columns, and `rename()` takes a dictionary of `{old: new}`:

```python
df = df.drop(columns=['extracurricular', 'name', 'class'])
df = df.rename(columns={'scr': 'exam_score'})
```

Two things to watch:

- Both return a **new** DataFrame. Without `df = `, nothing changes. This is the single most common bug in student assignments.
- `rename()` silently ignores names it cannot find. Misspell `'scr'` as `'src'` and you get no error and no rename — just a column that stubbornly keeps its old name.

You only need to list the columns you are actually renaming; everything else is left alone.


## Create a new field

We can create a new field in several ways:
- Adding a field with a constant
- Adding a field with a new Series derived from other columns.

Note that we can add a field directly, or use the `assign` function. The `assign` function is often more convenient when adding multiple fields at once. It also works better in method chains, as well as filtered datasets.

The two styles produce the same result:

```python
# Direct assignment, modifies df in place
df['passed'] = True

# assign(), returns a new DataFrame
df = df.assign(passed=True)
```

Note the difference in punctuation: direct assignment quotes the column name as a string, while `assign` uses it as a keyword argument with `=` and no quotes. That also means `assign` cannot create a name with a space in it — one more reason to fix your column names first.

```python
# Sample changing values
import pandas as pd
import numpy as np

# Create sample data
df_students = pd.DataFrame({
    'name': ['  alice ', 'bob', 'charlie', 'david'],
    'score': [85, 90, 78, np.nan],
})

# Create a new field with a constant value (same for all rows)
df_students = df_students.assign(passed=True)

# Create a new field based on a condition
# Note that it is either True or False based on the condition
# This uses the same syntax as filtering
# Note that I put each new field on its own line for readability. This is optional.
df_students = df_students.assign(
    honor_roll = df_students['score'] >= 85
)


# Use a function to create a new field
# Note that if we want to use a string function, use str and then our function.

# Trim whitespace
df_students = df_students.assign(
    name = df_students['name'].str.strip()
)

# Set to an all capitalized version of the tested field
df_students = df_students.assign(
    name = df_students['name'].str.capitalize()
)

# Round scores to nearest 10
df_students = df_students.assign(
    score_rounded = df_students['score'].round(-1)
)

print(df_students)
```

          name  score  passed  honor_roll  score_rounded
    0    Alice   85.0    True        True           80.0
    1      Bob   90.0    True        True           90.0
    2  Charlie   78.0    True       False           80.0
    3    David    NaN    True       False            NaN

### A constant fills every row

`assign(passed=True)` gives all four students the same value. Pandas broadcasts the single value down the column, the same way NumPy broadcasts a scalar across an array.

### A condition creates a True/False field

`df_students['score'] >= 85` is the identical expression you would put inside `df[...]` to filter. The difference is what you do with the mask: filtering uses it to *select* rows, while `assign` *stores* it as a column.

Watch David. His score is `NaN`, and every comparison against a missing value is False, so he is not on the honor roll. That is usually what you want, but pandas will not warn you that it treated "missing" as "did not qualify."

True/False columns convert to 1/0 with `.astype(int)`, which many models require:

```python
print(df_students['honor_roll'].astype(int).tolist())   # [1, 1, 0, 0]
```

### String functions go through .str

A plain Python string method will not work on a column. You need the `.str` accessor first, and then the methods chain just like they do on a single string:

```python
messy = pd.Series(['  Bob ', 'ANN'])
print(messy.str.strip().str.lower().tolist())   # ['bob', 'ann']
```

The ones named in the outcomes:

```python
names = pd.Series(['  alice ', 'bob'])
print(names.str.strip().tolist())        # ['alice', 'bob']      trim whitespace
print(names.str.lower().tolist())        # ['  alice ', 'bob']   all lowercase
print(names.str.upper().tolist())        # ['  ALICE ', 'BOB']   ALL UPPERCASE
print(names.str.strip().str.capitalize().tolist())   # ['Alice', 'Bob']
```

`capitalize()` uppercases the first character and lowercases the rest, which is why `'  alice '` had to be stripped first — otherwise the first character is a space and nothing gets capitalized.

### Arithmetic and rounding

Arithmetic on a column applies to every row at once, and `NaN` propagates through untouched:

```python
print((df_students['score'] + 5).tolist())    # [90.0, 95.0, 83.0, nan]
print((df_students['score'] / 100).tolist())  # [0.85, 0.9, 0.78, nan]
```

`round()` takes a negative argument to round to tens, hundreds, and so on:

```python
print(df_students['score'].round(-1).tolist())   # [80.0, 90.0, 80.0, nan]
```

**Why did 85 round down to 80?** Not a bug. Python and NumPy use **banker's rounding**, which sends a value exactly halfway between two options to the *even* one:

```python
print(pd.Series([85.0, 75.0, 65.0, 95.0]).round(-1).tolist())
# [80.0, 80.0, 60.0, 100.0]
```

85 and 75 both land on 80; 65 goes to 60; 95 goes to 100. The rule exists because always rounding halves upward biases a large dataset's total upward. Expect it, or your rounded column will not match a hand calculation.


## Conditional changes with np.where

A very common operation is to change values based on a condition. This can be done with `numpy.where`

The syntax is: ```np.where(condition, x, y)```

- *condition*: A boolean array or condition to evaluate.
- *x*: Value to set if condition is True. This can be a constant or an expression.
- *y*: Value to set if condition is False. This can also be a constant or an expression.

Read it as an Excel `IF()`: the condition, then the value-if-true, then the value-if-false. It evaluates row by row and returns a whole column of results.

```python
# Sample changing values
import pandas as pd
import numpy as np

# Create sample data
df_students = pd.DataFrame({
    'name': ['alice', 'bob', 'charlie', 'david'],
    'class': ['Freshman', 'Sophomore', 'Junior', 'Senior'],
    'score': [85, 90, 78, np.nan],
})

# Set NA values in a field.
# You can also test for *not* NA with ~(df['field'].isna()), ...
df_students = df_students.assign(
    score_not_na = np.where(df_students['score'].isna(), 0, df_students['score'])
)

# Set to a constant value.
df_students = df_students.assign(
    is_david = np.where(df_students['name'] == 'david', 1, 0)
)

# Set to a modified version of another field
# Note that we are only adding 5 when the condition is met, otherwise we subtract 5
df_students = df_students.assign(
    score_plus_5 = np.where(
        df_students['class'] == 'Freshman',
        df_students['score'] + 5,
        df_students['score'] - 5
    )
)

# Use a string function like contains to check for substrings
df_students = df_students.assign(
    name_contains_a = np.where(
        df_students['name'].str.contains('a'),
        1,
        0)
)

# Set to a constant value for one of two conditions using | (or) or & (and)
df_students = df_students.assign(
    name_in_list = np.where(
        (df_students['name'] == 'alice') |
            (df_students['name'] == 'charlie') |
            (df_students['name'] == 'david'),
        1,
        0)
)

print(df_students)
```

          name      class  score  score_not_na  is_david  score_plus_5  name_contains_a  name_in_list
    0    alice   Freshman   85.0          85.0         0          90.0                1             1
    1      bob  Sophomore   90.0          90.0         0          85.0                0             0
    2  charlie     Junior   78.0          78.0         0          73.0                1             1
    3    david     Senior    NaN           0.0         1           NaN                1             1

Note that only Alice is a Freshman, so only she gains 5 points; everyone else loses 5. And David's `score_plus_5` is `NaN`, because `NaN` minus 5 is still `NaN` — `np.where` selected the expression, but the arithmetic inside it had nothing to work with.

### A cleaner way to fill missing values

`np.where(df['score'].isna(), 0, df['score'])` works, and it is worth writing once to see the pattern. But pandas has a purpose-built method:

```python
print(df_students['score'].fillna(0).tolist())   # [85.0, 90.0, 78.0, 0.0]
```

Same result, less to read. Reach for `np.where` when the replacement depends on a condition other than missingness.

### Negating a condition

To test for *not* something, wrap the condition in parentheses and put `~` in front:

```python
print(np.where(~(df_students['name'] == 'david'), 1, 0))   # [1 1 1 0]
```

You can also just flip the two result values, which is often clearer:

```python
print(np.where(df_students['name'] == 'david', 0, 1))      # [1 1 1 0]
```

### Long OR chains: use isin

The `name_in_list` example above chains three `|` comparisons. `isin()` says the same thing in one line and does not need the parentheses:

```python
print(np.where(df_students['name'].isin(['alice', 'charlie', 'david']), 1, 0))
# [1 0 1 1]   identical to the three-way | chain above
```

Both give the same answer, but `isin()` scales: adding a fourth name means adding one item to the list rather than another parenthesized comparison. Use `|` when the conditions test *different* columns, and `isin()` when they all test the same column against a list of values.

### Three or more outcomes: np.select

`np.where` handles exactly two outcomes. Nesting it works but gets unreadable fast. For letter grades, use `np.select` with a list of conditions and a matching list of results:

```python
conditions = [
    df_students['score'] >= 90,
    df_students['score'] >= 80,
    df_students['score'] >= 70,
]
choices = ['A', 'B', 'C']

df_students = df_students.assign(
    grade = np.select(conditions, choices, default='F')
)
print(df_students[['name', 'score', 'grade']])
#       name  score grade
# 0    alice   85.0     B
# 1      bob   90.0     A
# 2  charlie   78.0     C
# 3    david    NaN     F
```

The order matters: `np.select` takes the **first** condition that is True. A 95 satisfies all three tests, but `>= 90` comes first, so it gets an A. Write the conditions from most to least restrictive.

`default` catches anything that matched nothing, which is why David's missing score becomes an F rather than an error. Decide deliberately whether that is right — a missing score is not the same as a failing one.


## Conditional changes with a dictionary and map

If we have a lot of fixes, it's often easier to use a dictionary and map the values.


```python
import pandas as pd

# Create sample data
df_students = pd.DataFrame({
    'class': ['Freshman', 'Sophomore', 'Junior', 'Senior'],
})

# Change values based on a dictionary mapping
class_mapping = {
    'Freshman': 1,
    'Sophomore': 2,
    'Junior': 3,
    'Senior': 4
}

df_students = df_students.assign(year = df_students['class'].map(class_mapping))

print(df_students)
```

           class  year
    0   Freshman     1
    1  Sophomore     2
    2     Junior     3
    3     Senior     4

`map()` looks up each value as a dictionary key and returns the matching value. Four `np.where` calls collapse into one readable dictionary, and adding a fifth category means adding one line rather than restructuring the logic.

### The trap: unmapped values become NaN

Anything missing from the dictionary is silently converted to `NaN`:

```python
df = pd.DataFrame({'class': ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Grad']})

print(df.assign(year = df['class'].map(class_mapping)))
#        class  year
# 0   Freshman   1.0
# 1  Sophomore   2.0
# 2     Junior   3.0
# 3     Senior   4.0
# 4       Grad   NaN
```

Two things happened. `'Grad'` became `NaN` with no warning, and the whole column turned from integer to float to hold it — the tell-tale `1.0` instead of `1`.

Always check afterward:

```python
print(df['class'].map(class_mapping).isna().sum())   # 1
```

A non-zero count means your dictionary is missing a category, usually because of a typo or a value you did not know existed. `.fillna()` supplies a default once you have decided what it should be:

```python
print(df['class'].map(class_mapping).fillna(0).tolist())   # [1.0, 2.0, 3.0, 4.0, 0.0]
```

Run `df['class'].value_counts()` before writing the dictionary and you will catch the surprises up front.


## Method chaining

This is what the introduction meant about `assign` working well in chains. Because each step returns a new DataFrame, you can string them together in one expression:

```python
df_students = pd.DataFrame({
    'name': ['  alice ', 'bob', 'charlie', 'david'],
    'score': [85, 90, 78, np.nan],
})

result = (df_students
    .assign(name = lambda x: x['name'].str.strip().str.capitalize())
    .assign(passed = lambda x: x['score'] >= 80)
    .drop(columns=['score'])
)
print(result)
#       name  passed
# 0    Alice    True
# 1      Bob    True
# 2  Charlie   False
# 3    David   False
```

Note the `lambda x:`. Inside a chain, the DataFrame does not have a name yet — `df_students` still refers to the *original*, before any of these steps ran. `lambda x:` means "whatever the table looks like at this point in the chain," so the second `assign` can use a column the first one just created.

The outer parentheses let you break the chain across lines. Chains are worth learning because they read top-to-bottom as a recipe and avoid a trail of `df1`, `df2`, `df3` variables.


## Key Terms

- **Mutation**: Changing a table by adding, removing, or modifying columns
- **Field**: A column of a DataFrame
- **drop()**: Removes columns (or rows) from a DataFrame
- **rename()**: Changes column names using a dictionary of old-to-new
- **List comprehension**: A one-line loop that builds a list, used here to rewrite every column name
- **snake_case**: The lowercase-with-underscores naming convention used for pandas columns
- **assign()**: Adds or replaces columns and returns a new DataFrame
- **Method chain**: Several operations strung together in one expression
- **.str accessor**: The gateway to string functions on a column, as in `df['name'].str.strip()`
- **np.where()**: Picks between two values row by row, based on a condition
- **np.select()**: Extends np.where to three or more conditions
- **isna()**: Tests whether each value is missing
- **fillna()**: Replaces missing values with something else
- **map()**: Translates values through a dictionary
- **Banker's rounding**: Python's round-half-to-even rule, which sends 85 to 80 rather than 90



## Practice Questions

1. What does the `drop()` function do?
   - Removes columns or rows from a DataFrame
   - Deletes the DataFrame from memory
   - Removes missing values
   - Renames columns
1. Which argument tells `drop()` to remove columns rather than rows?
   - `columns=['name']`
   - `fields=['name']`
   - `axis='column'`
   - `remove=['name']`
1. What does `df.rename(columns={'scr': 'exam_score'})` do?
   - Changes the column named `scr` to `exam_score`
   - Changes the column named `exam_score` to `scr`
   - Renames every column to `exam_score`
   - Creates a new column called `exam_score`
1. What happens if you misspell a column name inside `rename()`?
   - Nothing changes and no error is raised
   - An error is raised
   - A new empty column is created
   - Every column is renamed
1. Why must you write `df = df.drop(columns=['name'])` rather than just `df.drop(columns=['name'])`?
   - `drop()` returns a new DataFrame instead of changing the original
   - `drop()` requires an assignment to run at all
   - The equals sign tells pandas which axis to use
   - Without it, the column is removed twice
1. What does `col.lower().replace(' ', '_')` do to the string `'Student Id'`?
   - Produces `'student_id'`
   - Produces `'Student_Id'`
   - Produces `'STUDENT_ID'`
   - Produces `'studentid'`
1. Why rename columns to lowercase with underscores?
   - It avoids spaces and capitals, which make columns awkward to reference
   - Pandas rejects column names containing capital letters
   - It reduces the file size
   - It is required before filtering
1. What does `df.assign(passed=True)` do?
   - Adds a column named `passed` set to True for every row
   - Adds a column only for rows that passed
   - Tests whether every row passed
   - Renames an existing column to `passed`
1. How does `assign()` differ from `df['col'] = ...`?
   - `assign()` returns a new DataFrame, while direct assignment modifies in place
   - `assign()` only works on numeric columns
   - Direct assignment cannot create new columns
   - There is no difference at all
1. What does `df.assign(honor_roll = df['score'] >= 85)` create?
   - A True/False column indicating which rows meet the condition
   - A filtered DataFrame with only high scorers
   - A count of rows meeting the condition
   - The scores of students above 85
1. A student's score is `NaN`. What value does `score >= 85` give for that row?
   - False, because comparisons against a missing value are always False
   - True, because NaN is treated as infinity
   - NaN, which pandas carries through
   - An error
1. How do you convert a True/False column into 1/0?
   - `.astype(int)`
   - `.to_int()`
   - `.map(int)`
   - `.round()`
1. Why must you write `df['name'].str.strip()` rather than `df['name'].strip()`?
   - String methods on a column go through the `.str` accessor
   - `strip()` only works on numbers
   - `.str` converts the column to text first
   - `strip()` is not a pandas function at all
1. Which string function removes leading and trailing whitespace?
   - `.str.strip()`
   - `.str.trim()`
   - `.str.clean()`
   - `.str.replace()`
1. What does `.str.capitalize()` do to `'alice'`?
   - Produces `'Alice'` — first letter uppercase, the rest lowercase
   - Produces `'ALICE'`
   - Produces `'alice'` unchanged
   - Produces `'aLICE'`
1. What does `df['score'].round(-1)` do?
   - Rounds to the nearest 10
   - Rounds to one decimal place
   - Rounds down always
   - Removes the last digit
1. Why does `pd.Series([85.0]).round(-1)` return 80 rather than 90?
   - Python uses banker's rounding, sending exact halves to the even option
   - Pandas always rounds down
   - 85 is closer to 80 than to 90
   - The value was stored as 84.999
1. What is the purpose of banker's rounding?
   - It prevents a systematic upward bias when rounding many values
   - It makes calculations faster
   - It matches how Excel rounds
   - It guarantees whole numbers
1. What is the syntax of `np.where()`?
   - `np.where(condition, value_if_true, value_if_false)`
   - `np.where(value_if_true, condition, value_if_false)`
   - `np.where(condition, value_if_false, value_if_true)`
   - `np.where(dataframe, condition)`
1. Which spreadsheet function is `np.where()` most like?
   - `IF()`
   - `VLOOKUP()`
   - `SUMIF()`
   - `ROUND()`
1. What does `np.where(df['score'].isna(), 0, df['score'])` produce?
   - The score, with 0 substituted wherever the score is missing
   - Only the rows where the score is missing
   - A count of missing scores
   - The score with all values set to 0
1. Which pandas method replaces missing values more directly than `np.where` with `isna`?
   - `.fillna(0)`
   - `.dropna()`
   - `.isna(0)`
   - `.replace()`
1. In `np.where(df['class'] == 'Freshman', df['score'] + 5, df['score'] - 5)`, what happens to a Senior?
   - 5 is subtracted from the score
   - 5 is added to the score
   - The score is unchanged
   - The score becomes NaN
1. A student with a missing score has `np.where` add 5 to it. What is the result?
   - NaN, because arithmetic on a missing value stays missing
   - 5
   - 0
   - An error
1. How do you write "not equal to david" as a condition?
   - `~(df['name'] == 'david')`
   - `not df['name'] == 'david'`
   - `!df['name'] == 'david'`
   - `df['name'].not('david')`
1. Which method replaces a long chain of `|` comparisons against the same column?
   - `.isin(['alice', 'charlie'])`
   - `.contains(['alice', 'charlie'])`
   - `.any(['alice', 'charlie'])`
   - `.map(['alice', 'charlie'])`
1. Which function handles three or more outcomes, such as letter grades?
   - `np.select()`
   - `np.where()`
   - `np.choose_many()`
   - `np.case()`
1. In `np.select`, what happens when a value satisfies more than one condition?
   - The first matching condition wins
   - The last matching condition wins
   - An error is raised
   - The default value is used
1. What does the `default` argument of `np.select` do?
   - Supplies a value for rows matching no condition
   - Sets the value used for the first condition
   - Names the new column
   - Fills in missing values before evaluating
1. What does `df['class'].map(class_mapping)` do?
   - Looks up each value as a dictionary key and returns the matching value
   - Filters rows matching the dictionary keys
   - Renames the column using the dictionary
   - Counts how often each value appears
1. What happens to a value that is not a key in the mapping dictionary?
   - It becomes NaN, with no warning
   - It stays unchanged
   - It raises a KeyError
   - It becomes 0
1. After mapping, an integer column shows `1.0` instead of `1`. Why?
   - An unmapped value produced NaN, which forced the column to float
   - `map()` always returns floats
   - The dictionary values were floats
   - Pandas rounds during mapping
1. How do you check whether your mapping dictionary missed any categories?
   - `df['class'].map(mapping).isna().sum()`
   - `len(mapping)`
   - `df['class'].count()`
   - `mapping.keys()`
1. Which method should you run before writing a mapping dictionary?
   - `value_counts()`, to see every category that actually exists
   - `describe()`, to see the numeric range
   - `reset_index()`, to renumber the rows
   - `astype(int)`, to convert the column
1. Why do you need `lambda x:` inside a method chain?
   - The chained DataFrame has no name yet, so `x` refers to the table at that step
   - Lambdas run faster than named functions
   - `assign()` accepts only lambdas
   - It prevents the original DataFrame from being modified
1. What is the main benefit of method chaining?
   - The steps read as a recipe, without a trail of intermediate variables
   - It uses less memory than any other approach
   - It is the only way to add multiple columns
   - It automatically handles missing values