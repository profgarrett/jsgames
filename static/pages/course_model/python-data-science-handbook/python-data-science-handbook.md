# Python Data Science Handbook

[Online Github](https://jakevdp.github.io/PythonDataScienceHandbook/)


## Chapter 1

- iPython
	- ?len for help(len)
	- Tab-completion using `l.<tab>`
	- Avoiding using `__internal__`
	- Use `_` for last thing put to shell

## Chapter 2: NumPy

- `import numpy as np`
- Arrays are fixed-type vectors, & are significantly more efficient that native 
	- `np.array([1, 2, 3])`: automatically create
		- Will upcast automatically
		- `np.array([1,2,3], dtype='float32')`
	- Can be multi-dimensional
	- Efficient ways to create arrays: `np.zeros`, `np.ones`, `np.full`, `np.arrange`, `no.linspace`, `np.random.random`, `np.random.normal`, `np.random.randint`, `np.empty` 
		- Example: `x2 = np.random.randint(10, size=(3, 4))  # Two-dimensional array`
	- Common types: `bool_`, `int_`, `float_`
	- Access
		- Individual items: `x[i], x[-1], x[1, 0]`
		- Subarrays: `x[start:stop:step]`
			- Does not make a new copy of the data!
	- Manipulation functions:
		- `arange`: sort
		- `copy`: create a new copy of underlying data
		- `reshape`: change shape of data
		- `concatenate`, `vstack`, `hstack`
		- `split`, `hsplit`, `vsplit`
	- Summary functions
		- `sum` v. `np.sum` have same output, but np is much faster!
		- `min`, `max`, `mean`, `std`, `median`, `percentile`
	- Properties
		- `size`, `shape`, `ndim`, `dtype`

## Chapter 3: Pandas

Built on top of numpy.

- `import pandas as pd`
- Series
	- One dimensional array of indexed data
	- Emulates np array, but adds more features
		- np uses integers
		- Series uses explicit index of any type value
			- IE, a dictionary!
- DataFrame
	- Two dimensional array of index data
	- `index`
	- `columns`
	- We can use standard Python approaches with index
		- `a in data.keys()` or `a in data.items()`
	- `df.head()` to see output
- Index
	- Slicing by explicit index `data['a':'c']`
	- Slicing by implicit index `data[1:3]`
		- Note: uses position, not explicit index when integers
		- Use `iloc[1:3]` for implicit integer index
		- Use `loc[1:3]` for explicit integer index		- 
	- Masking `data[(data > .3)]`
		- Preference for filtering data and selecting columns
		- `data.loc[data.density > 100, ['pop', 'density']]`
	- Fancy indexing `data[['a', 'b']]`
	- Access via `data['column'] or data.column`
		- Prefer [] dictionary style, as prevents confusion over built-in attributes in DataFrame.
- Manipulations
	- Adding/multiplying Series will automatically align the rows as per the index value. If no match is found, `NaN` is the result.
	- Use `fill_value` to fillin missing.
		- `A.add(B, fill_value=fill)`
	- add, sub/subtract, mul/multiply, truediv, div, divide, floordiv, mod, pow
- Missing Data
	- Uses either a `NaN` with floating-point data, or `None` for Python objects (strings).  `np.nan` or `None`
	- Use `isnull()`, `notnull()`, `dropna()`, `fillna()` to deal with null values.
		- `pd.Series([1, np.nan, 'x', None]).isnull() => [F,T,F,T]`
		- `dropna()` applied to a DataFrame does *any* column that is null.
- Merge DataFrames
	- `pd.merge(df1, df1)`
		- `how='inner' // or left or right
		- `on='keyname_in_both_dfs`
		- `left_on='df1_keyname'` and `right_on='df2_keyname`
	- `merged_ds.drop('name')` to remove unneeded or duplicate columns
	- `merged.isnull().any()` returns any rows with nulls.
- Sort
	- df.sort_values()
- Aggregation / Grouping
	- functions: 
		- `min`, `max`, `sum`, `median`, `mad` (median abs dev), `std`, `mean`
	- `describe` for summary statistics. Use `dropna` before to remove bad data
	- `groupby('fieldname')` applies grouping. 
		- Ex: `df.groupby('state')['population'].mean()`
	- aggregate allows generating multiple summary items for each field
		- planets.groupby('method')['year'].describe().unstack()
	- pivoting is a fast way of grouping by multiple columns
		- `titanic.pivot_table('survived', index=[]'sex','age'], columns='class')`
- Pivot Tables
	- `pivot_table` allows for multi-dimensional grouping
	- `pivot_table('value', index=['col1', 'col2'], columns='col3')`
	- `aggfunc` allows for multiple functions to be applied
		- `aggfunc=['mean', 'std']`
	- `fill_value` allows for filling in missing values
	- `margins=True` adds a total row/column
	- Example:
	- `titanic.pivot_table('survived', index='sex', columns='class')`


