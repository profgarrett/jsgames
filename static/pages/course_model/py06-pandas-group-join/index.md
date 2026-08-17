<script src="/course_model/toc.js"></script>

# Pandas Grouping and Joining

This tutorial shows how to group and join data using the Pandas library in Python.

**Outcomes**:
- Group data using `groupby` and `agg`
- Pick an appropriate aggregation function for a given question
- Join data from multiple DataFrames using a key column with `merge`

**Links:**
- [template](template.ipynb)

## Grouping Data

We can group data by one or more columns and then perform aggregate functions on the grouped data. This is done using the `groupby()` and `agg()` functions.

In this class, we will always use these two functions together in the *same call*. This is because `groupby()` does not return a DataFrame, but rather a GroupBy object that requires an aggregation function to produce a DataFrame.


*Group by* with `groupby()`

Not that this is one of the rare functions with a *side effect*; you do not get a new DataFrame back until you apply an aggregation function.

Arguments:
- `by`: column(s) to group by.
- `as_index`: if True, the grouped columns will be set as the index of the resulting DataFrame. Default is True.
- `sort`: if True, the grouped keys will be sorted. Default is True.

Example:
```python
df.groupby(by='column_name', as_index=False, sort=True)
```

*Aggregate* with `agg()`

There are *many* ways to call `agg()`.  I will try to consistently use this format, which has fewer surprises.

Each call needs aggregation function, such as `sum()`, `mean()`, `count()`, etc. It is generally a good idea to include a `n` column that counts the number of rows in each group, which can be done by counting any column (e.g., `student`) that is not null. Functions include: sum, mean, median, min, max, count, first, last, std, var, etc.

Arguments:
- `agg()`: takes a dictionary where the keys are the names of the new columns and the values are tuples of the form `(column_name, aggregation_function)`.


```python
import pandas as pd

# Create sample data
df = pd.DataFrame({
    "student": ['Bob', 'Bob', 'Sarah', 'Tim', 'John', 'John', 'John'],
    "class": ["Freshman", "Freshman", "Sophomore", "Sophomore", "Junior", "Senior", "Senior"],
    "score": [90, 80, 85, 88, 92, 95, 87]
})

print('Aggregated by student name')
df_result = df.groupby(by='student').agg(
    mean_student_score=('score', 'mean'),
    lowest_student_score=('score', 'min'),
    highest_student_score=('score', 'max'),
    n = ('student', 'count')
)
print(df_result)    

print('Aggregated by class')
df_class_result = df.groupby(by='class').agg(
    mean_student_score=('score', 'mean'),
    n = ('student', 'count')
)
print(df_class_result)


```

    Aggregated by student name
             mean_student_score  lowest_student_score  highest_student_score  n
    student                                                                    
    Bob               85.000000                    80                     90  2
    John              91.333333                    87                     95  3
    Sarah             85.000000                    85                     85  1
    Tim               88.000000                    88                     88  1
    Aggregated by class
               mean_student_score  n
    class                           
    Freshman                 85.0  2
    Junior                   92.0  1
    Senior                   91.0  2
    Sophomore                86.5  2


## Join data

We regularly need to combine data from multiple tables. This is called a *join* or a *merge*. In pandas, we can use the `merge()` function to do this.

Arguments:
- `how`: type of join to perform. Options are 'left', 'right', 'outer', 'inner'. Default is 'inner'.
- `on`: column(s) to join on. If not specified, pandas will use columns with the same name in both tables.
- `left_on`: column(s) from the left DataFrame to join on.
- `right_on`: column(s) from the right DataFrame to join on.
- `suffixes`: tuple of string suffixes to apply to overlapping column names in the left and right DataFrames.


```python
# Join data example
import pandas as pd

# Create sample data
df_students = pd.DataFrame({
    "id": [1, 2, 3],
    "name": ["Alice", "Bob", "Charlie"],
})

df_classes = pd.DataFrame({
    "student_id": [1, 1, 2, 4],
    "name": ["CS101", "Math101", "CS101", "History101"],
})

# Inner join
# Note the order, we want all students with classes, so first is df_students
# The 'how' parameter can be 'inner', 'left', 'right', or 'outer'   
# The left_on and right_on parameters specify the columns to join on
# The suffixes parameter specifies suffixes to add to overlapping column names
df_students_with_classes = pd.merge(df_students, 
                                    df_classes, 
                                    how='inner', 
                                    left_on='id', 
                                    right_on='student_id', 
                                    suffixes=('_student', '_class'))


df_students_with_classes

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
      <th>id</th>
      <th>name_student</th>
      <th>student_id</th>
      <th>name_class</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>1</td>
      <td>Alice</td>
      <td>1</td>
      <td>CS101</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1</td>
      <td>Alice</td>
      <td>1</td>
      <td>Math101</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2</td>
      <td>Bob</td>
      <td>2</td>
      <td>CS101</td>
    </tr>
  </tbody>
</table>
</div>


