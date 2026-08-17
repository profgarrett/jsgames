<script src="/course_model/toc.js"></script>

# Data Cleanup and Manipulation with Python

**Outcomes**:
- Melting data (from wide to long format)
- Pivoting data (from long to wide format)

**Links**:
- [Recognize Changes Word Template](recognize_changes.docx)
- [Recognize Changes Word Solution](recognize_changes_solution.docx)

## Melting data from wide to long format

Our data can be in two main formats: tall or wide. Tall is better for charting, but wide is easier to read and better for most statistical analyses. We can convert between the two formats.

*Wide → Tall (long)*  with `pd.melt()`

Arguments:

- `id_vars = ['id', 'name']`: a list of columns to keep. Any column not present will be melted.
- `value_vars = ['math', 'english']`: Optional! Columns to melt. If not given, will melt all columns not in id_vars.
- `var_name = 'subject'`: name for the new *variable* column
- `value_name = 'score'`: name for the new *value* column



```python
# Shaping data with melt 
import pandas as pd

df = pd.DataFrame({
    "id": [1, 2],
    "name": ["Alice", "Bob"],
    "class": ["Freshman", "Freshman"],
    "math": [90, 80],
    "english": [85, 95]
})

# Wide to long
df_long = pd.melt(df, 
                  id_vars=['id', 'name'], 
                  value_vars=['math', 'english'], 
                  var_name='subject', 
                  value_name='score')


print("Original DataFrame:\n", df)
print("\nLong Format DataFrame:\n", df_long)
```

    Original DataFrame:
        id   name     class  math  english
    0   1  Alice  Freshman    90       85
    1   2    Bob  Freshman    80       95
    
    Long Format DataFrame:
        id   name  subject  score
    0   1  Alice     math     90
    1   2    Bob     math     80
    2   1  Alice  english     85
    3   2    Bob  english     95


## Pivoting data from long to wide format

We sometimes need to go back from tall to wide format. This is done with the `pivot()` function.

*Tall → Wide*  with `pivot()`

Arguments:

- `index = ['id', 'name']`: columns to keep as index for each row
- `columns = 'subject'`: column(s) to use as the new field names
- `values = 'score'`: column(s) to fill use as values in the new fields
- `aggfunc = 'mean'`: function to use to aggregate values if there are multiple values for the same index/column pair. Default is 'mean', but you can also use 'sum', 'count', 'min', 'max', etc.


```python
# Shaping data with pivot
import pandas as pd

df = pd.DataFrame({
    "id": [1, 2, 1, 2],
    "name": ["Alice", "Bob", "Alice", "Bob"],
    "subject": ['math', 'math', 'english', 'english'],
    "score": [90, 73, 95, 80],
})

# Long to wide
df_wide = df.pivot(index=['id', 'name'], 
                        columns='subject', 
                        values='score')


# flatten column titles. Otherwise, we often have a multi-index columns.
# Also, reset index turns the index that we created during the pivot back into a regular column.
df_wide2 = df_wide.copy()
df_wide2.columns = [col for col in df_wide.columns]
df_wide2 = df_wide2.reset_index()

print("Original DataFrame:\n", df)
print("\nWide Format DataFrame:\n", df_wide.reset_index())
print("\nWide Format DataFrame with flattened columns:\n", df_wide2)
```

    Original DataFrame:
        id   name  subject  score
    0   1  Alice     math     90
    1   2    Bob     math     73
    2   1  Alice  english     95
    3   2    Bob  english     80
    
    Wide Format DataFrame:
     subject  id   name  english  math
    0         1  Alice       95    90
    1         2    Bob       80    73
    
    Wide Format DataFrame with flattened columns:
        id   name  english  math
    0   1  Alice       95    90
    1   2    Bob       80    73

