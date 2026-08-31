
# Pandas: Data Loading and Filtering

### py03 — DataFrames, Series, Loading CSVs, and Filtering

Nathan Garrett, PhD CPA

*Department of Accounting and Information Systems, WVU*

---

## What This Module Covers

1. **DataFrames and Series** — the two core pandas structures, and how they relate
2. **Loading data** — `read_csv`, skipping header rows, limiting rows/columns, handling missing-value markers
3. **Inspecting data** — `head`, `shape`, `columns`, `info`, `describe`
4. **Filtering** — boolean masks, comparison operators, `isin`/`between`/`~`, text and missing-value conditions
5. **Combining conditions** — `&` and `|`, parentheses, and why not `and`/`or`
6. **Index management** — `reset_index`, `set_index`, `.loc`, and the `.copy()` caution

---

## DataFrame vs. Series

- A **DataFrame** is the whole table: rows and named columns, like a sheet in Excel.
- A **Series** is a single column of that table, plus its index.
- Mental model: a DataFrame is a dictionary of Series that all share the same index.

| Structure | Dimensions | Shared dtype | Use it when |
| --- | --- | --- | --- |
| DataFrame | 2D (rows x columns) | No — each column has its own | You need the whole table |
| Series | 1D (one column) | Yes | You need a single column, plus its index |

---

# Part 1

## Series and DataFrames

---

## Creating a DataFrame

```python
import pandas as pd

df = pd.DataFrame({'sales': [1, 2, 3], 'people': ['bob', 'tim', 'sue']})
print(df)
#    sales people
# 0      1    bob
# 1      2    tim
# 2      3    sue

print(type(df))            # DataFrame
print(type(df['sales']))   # Series
```

The unlabeled column on the left is the **index** — pandas creates it automatically, starting at 0.

---

## One Bracket vs. Two

```python
print(df['sales'])
# 0    1
# 1    2
# 2    3
# Name: sales, dtype: int64

print(type(df[['sales']]))   # DataFrame, not Series
```

One bracket pulls out a Series. Two brackets keep it a DataFrame with one column. The difference matters when a function expects one or the other.

---

## Loading From a CSV

```python
import pandas as pd

df = pd.read_csv('data.csv')

# Skip a title row and a blank row before the real header
df = pd.read_csv('data.csv', skiprows=2)
```

`skiprows=2` throws away the first two lines, then treats the next line as the header. Real-world exports often start with a title and a blank line before the actual column names.

---

## Other Useful `read_csv` Arguments

```python
# only the first 100 rows -- good for testing
pd.read_csv('data.csv', nrows=100)                

# only these columns -- good for huge files
pd.read_csv('data.csv', usecols=['name', 'gpa'])  

# treat these values as missing
pd.read_csv('data.csv', na_values=['N/A', '-'])   
```

---

## Always Look at the Data After Loading

```python
print(df.head(3))           # first few rows
print(df.shape)              # (rows, columns)
print(df.columns.tolist())   # column names
```

If `shape` shows one column when you expected six, your separator is wrong. If a numeric column came in as text, something non-numeric is hiding in it.

`df.info()` reports each column's type and non-missing count. `df.describe()` gives descriptive statistics for numeric columns.

---

## Questions 1-3

```python
# Q1
df = pd.DataFrame({'sales': [1, 2, 3], 'people': ['bob', 'tim', 'sue']})
print(type(df['sales']))
```

*Answer: `<class 'pandas.core.series.Series'>`. A single bracket pulls out one column as a Series.*
<!-- .element: class="fragment" -->

```python
# Q2
print(type(df[['sales']]))
```

*Answer: `<class 'pandas.core.frame.DataFrame'>`. Double brackets keep it a DataFrame — one column, but still a table.*
<!-- .element: class="fragment" -->

```python
# Q3
# data.csv starts with a title line, a blank line, then: name,major,gpa
df = pd.read_csv('data.csv', skiprows=2)
```

*Answer: The title line and the blank line are discarded, and `name,major,gpa` becomes the header. Without `skiprows=2`, pandas would treat the title line itself as the header.*
<!-- .element: class="fragment" -->

---

## Questions 4-6

```python
# Q4
df = pd.DataFrame({'name': ['Alice', 'Bob'], 'major': ['ACCT', None]})
print(df.shape)
```

*Answer: `(2, 2)`. Two rows, two columns — `shape` counts rows and columns, it doesn't care whether values are missing.*
<!-- .element: class="fragment" -->

```python
# Q5
print(df.columns.tolist())
```

*Answer: `['name', 'major']`. `.columns` gives a pandas Index of the column names; `.tolist()` converts it to a plain list.*
<!-- .element: class="fragment" -->

```python
# Q6
# Which reports each column's dtype and non-missing count:
# head(), shape, info(), or describe()?
```

*Answer: `df.info()`. `df.describe()` gives statistics (mean, std, min, max, ...) for the numeric columns instead.*
<!-- .element: class="fragment" -->

---

# Part 2

## Filtering Basics

---

## Boolean Masks

```python
df = pd.DataFrame({'sales': [1, 2, 3], 'people': ['bob', 'tim', 'sue']})

print(df['sales'] > 1)
# 0    False
# 1     True
# 2     True
# Name: sales, dtype: bool

print(df[df['sales'] > 1])
#    sales people
# 1      2    tim
# 2      3    sue
```

Read `df[df['sales'] > 1]` as "the rows of df where sales is greater than 1." Because `True` counts as 1, `(df['sales'] > 1).sum()` counts matching rows without building the filtered table.

---

## The Surviving Index

```python
df = pd.DataFrame({'sales': [1, 2, 3, 4], 'people': ['bob', 'tim', 'sue', 'ann']})
filtered = df[df['sales'] > 2]
print(filtered)
#    sales people
# 2      3    sue
# 3      4    ann
```

Pandas does **not** renumber rows when you filter — it keeps the original labels so you can trace a row back to its source. The first row of a filtered table is usually not index 0.

---

## Conditional Tests

```python
df[df['sales'] == 2]                            # equal to
df[df['sales'] != 2]                            # not equal to
df[df['sales'] > 2]                              # greater than
df[df['sales'] <= 2]                             # less than or equal to

df[df['people'].str.contains('o')]               # contains (text)
df[df['people'].str.startswith('b')]             # starts with

df[df['people'].isnull()]                        # is missing
df[df['people'].notnull()]                       # is not missing
```

---

## Questions 7-9

```python
# Q7
sales = pd.Series([1, 2, 3, 4])
mask = sales > 2
print(mask.tolist())
```

*Answer: `[False, False, True, True]`. The comparison produces one True/False per row, matching element by element.*
<!-- .element: class="fragment" -->

```python
# Q8
df = pd.DataFrame({'sales': [1, 2, 3, 4]})
filtered = df[df['sales'] > 2]
print(filtered.index.tolist())
```

*Answer: `[2, 3]`. Filtering keeps the original row labels — it does not renumber from 0.*
<!-- .element: class="fragment" -->

```python
# Q9
people = pd.Series(['bob', 'tim', 'sue', 'ann'])
print(people[people.str.startswith('b')])
```

*Answer: `0    bob`, with `dtype: object` below it. Only 'bob' starts with 'b', and the result keeps its original index label, 0.*
<!-- .element: class="fragment" -->

---

## isin, between, and ~

```python
students = pd.DataFrame({
    'name':  ['Alice', 'Bob', 'Charlie', 'Dana', 'Eli'],
    'major': ['ACCT', 'FIN', 'ACCT', 'MIS', None],
    'gpa':   [3.9, 2.8, 3.4, 3.1, 2.5],
})

students[students['major'].isin(['ACCT', 'MIS'])]   # matches any value in the list
students[students['gpa'].between(3.0, 3.5)]          # inclusive range
students[~(students['major'] == 'ACCT')]             # NOT -- flips the whole mask
```

`isin` replaces chaining `==` with `|`. `between` replaces chaining `>=` and `<=` with `&`. `~` is clearer than rewriting a complex condition with every comparison reversed.

---

## Text and Missing Values

```python
students[students['name'].str.contains('a')]              # case-sensitive by default
students[students['name'].str.contains('a', case=False)]  # ignore case

students[students['major'].str.contains('A', na=False)]   # treat missing as no match
```

A comparison against a missing value is always False — so `~(major == 'ACCT')` above quietly *includes* Eli, whose major is missing. Whether that is what you want depends on the question.

---

## Questions 10-12

```python
# Q10
students = pd.DataFrame({
    'name': ['Alice', 'Bob', 'Charlie', 'Dana'],
    'major': ['ACCT', 'FIN', 'ACCT', 'MIS'],
})
print(students[students['major'].isin(['ACCT', 'MIS'])]['name'].tolist())
```

*Answer: `['Alice', 'Charlie', 'Dana']`. `isin` is shorthand for chaining `==` with `|` across every value in the list.*
<!-- .element: class="fragment" -->

```python
# Q11
gpa = pd.Series([3.9, 2.8, 3.4, 3.1, 2.5])
print(gpa[gpa.between(3.0, 3.5)].tolist())
```

*Answer: `[3.4, 3.1]`. `between` is inclusive on both ends; 3.9 is too high and 2.8/2.5 are too low.*
<!-- .element: class="fragment" -->

```python
# Q12
major = pd.Series(['ACCT', 'FIN', None])
print((~(major == 'ACCT')).tolist())
```

*Answer: `[False, True, True]`. `major == 'ACCT'` treats the missing value as False, so flipping it with `~` marks that row True — a missing major sneaks back in as "not ACCT."*
<!-- .element: class="fragment" -->

---

# Part 3

## Combining Conditions

---

## AND / OR with & and |

```python
df = pd.DataFrame({'sales': [1, 2, 3, 4], 'people': ['bob', 'tim', 'sue', 'ann']})

# AND: sales > 1 AND sales < 4
print(df[(df['sales'] > 1) & (df['sales'] < 4)])
#    sales people
# 1      2    tim
# 2      3    sue

# OR: sales < 2 OR sales > 3
print(df[(df['sales'] < 2) | (df['sales'] > 3)])
#    sales people
# 0      1    bob
# 3      4    ann
```

We never use the words `and`/`or` in pandas filtering — only `&` and `|`.

---

## Why Not `and`? Why the Parentheses?

```python
df[(df['sales'] > 1) and (df['sales'] < 4)]
# ValueError: The truth value of a Series is ambiguous.
```

Python's `and` demands one True/False; each condition here is a whole Series of them. `&`/`|` compare row by row instead.

`&` binds **more tightly** than `>` in Python — without parentheses, `df['sales'] > 1 & df['sales'] < 4` groups wrong and fails. Wrap every condition in parentheses and you never have to think about it.

---

## Questions 13-15

```python
# Q13
sales = pd.Series([1, 2, 3, 4])
mask = (sales > 1) & (sales < 4)
print(mask.tolist())
```

*Answer: `[False, True, True, False]`. `&` compares the two masks element by element — only positions where both are True survive.*
<!-- .element: class="fragment" -->

```python
# Q14
df = pd.DataFrame({'sales': [1, 2, 3, 4]})
df[(df['sales'] > 1) and (df['sales'] < 4)]
```

*Answer: `ValueError: The truth value of a Series is ambiguous.` Python's `and` needs one True/False, not a whole Series of them.*
<!-- .element: class="fragment" -->

```python
# Q15
df['sales'] > 1 & df['sales'] < 4
```

*Answer: This raises an error even with valid column names, because `&` binds tighter than `>`/`<` — it evaluates as `df['sales'] > (1 & df['sales']) < 4`, not what was intended. Parenthesize each condition.*
<!-- .element: class="fragment" -->

---

## Questions 16-18

```python
# Q16
sales = pd.Series([1, 2, 3, 4])
mask = ~((sales > 1) & (sales < 4))
print(mask.tolist())
```

*Answer: `[True, False, False, True]`. `(sales > 1) & (sales < 4)` is `[False, True, True, False]`; `~` flips every value.*
<!-- .element: class="fragment" -->

```python
# Q17
students = pd.DataFrame({'major': ['ACCT', 'FIN', 'MIS'], 'gpa': [3.9, 2.8, 3.1]})
result = students[(students['major'].isin(['ACCT', 'MIS'])) & (students['gpa'] > 3.0)]
print(len(result))
```

*Answer: `2`. `isin` keeps the ACCT and MIS rows (3.9 and 3.1); both also clear `gpa > 3.0`, so both survive.*
<!-- .element: class="fragment" -->

```python
# Q18
sales = pd.Series([1, 2, 3, 4])
print(sales[(sales < 2) | (sales > 3)].tolist())
```

*Answer: `[1, 4]`. OR keeps a row if either side is True — sales below 2, or above 3.*
<!-- .element: class="fragment" -->

---

# Part 4

## Index Management

---

## Reset Index

```python
df = pd.DataFrame({'sales': [1, 2, 3, 4], 'people': ['bob', 'tim', 'sue', 'ann']})
filtered = df[df['sales'] > 2]

df_reset = filtered.reset_index(drop=True)
print(df_reset)
#    sales people
# 0      3    sue
# 1      4    ann
```

`drop=True` is the part to remember. Without it, the old index survives as a new column named `index` — a common source of mystery columns in student work.

---

## Setting Your Own Index

```python
df = pd.DataFrame({
    'student_id_number': [100, 200, 300],
    'name': ['Alice', 'Bob', 'Charlie'],
    'grade': [90, 85, 95]
})
df.set_index('student_id_number', inplace=True)

print(df.loc[200])
# name     Bob
# grade     85

print(df.loc[df['grade'] > 88, 'name'])
# student_id_number
# 100      Alice
# 300    Charlie
```

`inplace=True` modifies `df` directly. Once `student_id_number` is the index, `.loc` looks rows up **by that label**, not by position.

---

## The .copy() Caution

```python
high_scores = df[df['grade'] > 88].copy()
high_scores['grade'] = high_scores['grade'] + 5   # safe, states your intent
```

In pandas 3.0, Copy-on-Write is the default: modifying a filtered table no longer silently risks changing the original the way it could in older pandas. `.copy()` is still worth adding — it makes it explicit, to you and to anyone reading the code, that you mean to work with an independent table.

---

## Questions 19-21

```python
# Q19
df = pd.DataFrame({'sales': [1, 2, 3, 4], 'people': ['bob', 'tim', 'sue', 'ann']})
filtered = df[df['sales'] > 2]
df_reset = filtered.reset_index(drop=True)
print(df_reset.index.tolist())
```

*Answer: `[0, 1]`. `reset_index(drop=True)` renumbers from 0 and discards the old labels.*
<!-- .element: class="fragment" -->

```python
# Q20
print(filtered.reset_index().columns.tolist())
```

*Answer: `['index', 'sales', 'people']`. Without `drop=True`, the old row labels are kept as a new column called `index`.*
<!-- .element: class="fragment" -->

```python
# Q21
df = pd.DataFrame({'id': [100, 200, 300]})
df.set_index('id', inplace=True)
print(df.index.tolist())
```

*Answer: `[100, 200, 300]`. `set_index` replaces the default 0, 1, 2 index with the values from that column.*
<!-- .element: class="fragment" -->

---

## Questions 22-24

```python
# Q22
df = pd.DataFrame({
    'id': [100, 200, 300],
    'name': ['Alice', 'Bob', 'Charlie'],
    'grade': [90, 85, 95]
})
df.set_index('id', inplace=True)
print(df.loc[df['grade'] > 88, 'name'].tolist())
```

*Answer: `['Alice', 'Charlie']`. `.loc` takes a boolean mask and a column name together — the cleanest way to pull one column from filtered rows.*
<!-- .element: class="fragment" -->

```python
# Q23
df2 = pd.DataFrame({'id': [1, 2, 3], 'val': [10, 20, 30]})
df3 = df2.set_index('id')
print(df2.index.tolist())
```

*Answer: `[0, 1, 2]`. Without `inplace=True`, `set_index` returns a new DataFrame (`df3`) and leaves `df2` untouched.*
<!-- .element: class="fragment" -->

```python
# Q24
df = pd.DataFrame({'grade': [70, 80, 90]})
high = df[df['grade'] > 75]
high_copy = high.copy()
high_copy['grade'] = high_copy['grade'] + 10
print(df['grade'].tolist())
```

*Answer: `[70, 80, 90]`. Because `high_copy` is an explicit copy, changing it never touches `df` — the original stays exactly as loaded.*
<!-- .element: class="fragment" -->

---

# Module Review

- **DataFrame** — the whole table; a dictionary of Series sharing one index
- **Series** — one column, plus its index; shares one dtype like a NumPy array
- **Boolean mask** — a Series of True/False that selects rows when placed inside `df[...]`
- **`&` / `|`** — row-by-row AND/OR; always parenthesize each condition
- **Index** — survives filtering by default; `reset_index(drop=True)` renumbers it, `set_index()` replaces it

| Symptom | Usual cause |
| --- | --- |
| `ValueError: The truth value of a Series is ambiguous` | Used `and`/`or` instead of `&`/`\|` |
| A mystery `index` column after filtering | Called `reset_index()` without `drop=True` |
| `df.shape` shows one column instead of many | Wrong separator, or a missing `skiprows` |
| `df[mask]` misses rows you expected | A missing value in the compared column — pass `na=False` for `.str` methods |

---

## Application 1 — Loading a Messy Export

```python
# sales_export.csv:
# Report generated 2026-08-01,,
# region,units,revenue
# East,120,4500.00
# West,95,3100.50

df = pd.read_csv('sales_export.csv')
print(df.shape)
print(df.columns.tolist())
```

**What happened, and how would you fix it?**

--

### A — Loading a Messy Export

```python
df = pd.read_csv('sales_export.csv')
print(df.shape)               # (3, 3)
print(df.columns.tolist())    # ['Report generated 2026-08-01', 'Unnamed: 1', 'Unnamed: 2']
```

- With no `skiprows`, the title line became the header. The real header row, `region,units,revenue`, was read as a **data row** instead.
- Columns with no name in that title row are auto-named `Unnamed: 1`, `Unnamed: 2`.

Fix:

```python
df = pd.read_csv('sales_export.csv', skiprows=1)
print(df.shape)               # (2, 3)
print(df.columns.tolist())    # ['region', 'units', 'revenue']
```

---

## Application 2 — Accounting Majors Above a 3.0

```python
students = pd.DataFrame({
    'name':  ['Alice', 'Bob', 'Charlie', 'Dana', 'Eli'],
    'major': ['ACCT', 'FIN', 'ACCT', 'MIS', None],
    'gpa':   [3.9, 2.8, 3.4, 3.1, 2.5],
})

top = students[students['major'] == 'ACCT' and students['gpa'] > 3.0]
```

**Critique this code. What is it trying to do, and what actually happens?**

--

### A — Accounting Majors Above a 3.0

```python
top = students[students['major'] == 'ACCT' and students['gpa'] > 3.0]
```

Raises `ValueError: The truth value of a Series is ambiguous.`

- Python's `and` needs a single True/False. Each condition here is a whole Series, one value per row.
- The fix is `&`, with each condition wrapped in its own parentheses.

Fix:

```python
top = students[(students['major'] == 'ACCT') & (students['gpa'] > 3.0)]
print(top['name'].tolist())     # ['Alice', 'Charlie']
```

---

## Application 3 — A Lookup That Won't Behave

```python
customers = pd.DataFrame({
    'cust_id': [1001, 1002, 1003],
    'balance': [250.0, 0.0, 1875.5]
})

print(customers.loc[1002])
```

**Trace it. What happens, and what would make `.loc[1002]` work the way it looks like it should?**

--

### A — A Lookup That Won't Behave

```python
print(customers.loc[1002])
```

Raises `KeyError: 1002`.

- `customers` still has the default index — 0, 1, 2. `cust_id` is just a regular column, not the row label.
- `.loc` looks rows up by **label**, and 1002 is not one of the current labels.

Fix — set the index first:

```python
customers.set_index('cust_id', inplace=True)
print(customers.loc[1002])
# balance    0.0
```

---

## Application 4 — The Missing-Value Trap

```python
df = pd.DataFrame({
    'name':  ['Alice', 'Bob', 'Carla'],
    'email': ['a@x.com', None, 'c@x.com']
})

result = df[df['email'].str.contains('x.com')]
print(len(result))
```

**What prints, and why might older code (or older pandas) not behave the same way?**

--

### A — The Missing-Value Trap

```python
result = df[df['email'].str.contains('x.com')]
print(len(result))          # 2
```

- Bob's missing email is excluded, and Alice and Carla's emails both contain `x.com` — `2` rows survive.
- In pandas 3.0's default string dtype, a missing value in `.str.contains()` defaults to `False` automatically. Older pandas, or a column that ends up as `object` dtype, can instead raise an error on that missing value.
- Passing `na=False` explicitly is the safe habit regardless of version:

```python
result = df[df['email'].str.contains('x.com', na=False)]
```

---

## Ending Thoughts

Filtering a DataFrame is the same boolean-indexing idea as a NumPy array — `df[df['sales'] > 1000]` reads just like `arr[arr > 1000]`. Real files are messier than the examples here: check `shape`, `head()`, and `info()` every time you load one, and treat filters and index changes as questions with checkable answers, not guesses.
