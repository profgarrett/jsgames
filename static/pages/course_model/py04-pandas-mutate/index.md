<script src="/course_model/toc.js"></script>

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


## Create a new field

We can create a new field in several ways:
- Adding a field with a constant
- Adding a field with a new Series derived from other columns.

Note that we can add a field directly, or use the `assign` function. The `assign` function is often more convenient when adding multiple fields at once. It also works better in method chains, as well as filtered datsets.


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
# Note that I put the each new field on its own line for readability. This is optional.
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

df_students
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>name</th>
      <th>score</th>
      <th>passed</th>
      <th>honor_roll</th>
      <th>score_rounded</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>Alice</td>
      <td>85.0</td>
      <td>True</td>
      <td>True</td>
      <td>80.0</td>
    </tr>
    <tr>
      <th>1</th>
      <td>Bob</td>
      <td>90.0</td>
      <td>True</td>
      <td>True</td>
      <td>90.0</td>
    </tr>
    <tr>
      <th>2</th>
      <td>Charlie</td>
      <td>78.0</td>
      <td>True</td>
      <td>False</td>
      <td>80.0</td>
    </tr>
    <tr>
      <th>3</th>
      <td>David</td>
      <td>NaN</td>
      <td>True</td>
      <td>False</td>
      <td>NaN</td>
    </tr>
  </tbody>
</table>
</div>



## Conditional changes with np.where

A very common operation is to change values based on a condition. This can be done with `numpy.where`

The syntax is: ```np.where(condition, x, y)```

- *condition*: A boolean array or condition to evaluate.
- *x*: Value to set if condition is True. This can be a constant or an expression.
- *y*: Value to set if condition is False. This can also be a constant or an expression.



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
    is_not_david = np.where(
        (df_students['name'] == 'alice') | 
            (df_students['name'] == 'charlie') |
            (df_students['name'] == 'david'), 
        1, 
        0)
)


df_students
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>name</th>
      <th>class</th>
      <th>score</th>
      <th>score_not_na</th>
      <th>is_david</th>
      <th>score_plus_5</th>
      <th>name_contains_a</th>
      <th>is_not_david</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>alice</td>
      <td>Freshman</td>
      <td>85.0</td>
      <td>85.0</td>
      <td>0</td>
      <td>90.0</td>
      <td>1</td>
      <td>1</td>
    </tr>
    <tr>
      <th>1</th>
      <td>bob</td>
      <td>Sophomore</td>
      <td>90.0</td>
      <td>90.0</td>
      <td>0</td>
      <td>85.0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <th>2</th>
      <td>charlie</td>
      <td>Junior</td>
      <td>78.0</td>
      <td>78.0</td>
      <td>0</td>
      <td>73.0</td>
      <td>1</td>
      <td>1</td>
    </tr>
    <tr>
      <th>3</th>
      <td>david</td>
      <td>Senior</td>
      <td>NaN</td>
      <td>0.0</td>
      <td>1</td>
      <td>NaN</td>
      <td>1</td>
      <td>1</td>
    </tr>
  </tbody>
</table>
</div>



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

df_students
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>class</th>
      <th>year</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>Freshman</td>
      <td>1</td>
    </tr>
    <tr>
      <th>1</th>
      <td>Sophomore</td>
      <td>2</td>
    </tr>
    <tr>
      <th>2</th>
      <td>Junior</td>
      <td>3</td>
    </tr>
    <tr>
      <th>3</th>
      <td>Senior</td>
      <td>4</td>
    </tr>
  </tbody>
</table>
</div>


