# Python Data Structures

This section covers data structures that are built into Python.

**Outcomes**:
- Choose the appropriate data structure for a task
- Understand differences in performance and use-cases
- List: create, access, modify, and delete elements; use list methods; perform slicing and indexing.
- Numpy Arrays: create arrays; perform elementwise operations and broadcasting; aggregate (sum, mean, std, etc.); use boolean indexing and filtering
- Dictionaries: store key-value pairs; access, add, update, and delete entries; iterate over keys/values/items
- Tuples: understand immutability; create and access tuples; use tuples for multiple return values.

**Links:**
- [Slides](/static/pages/slides.html?course=course_model&module=py02-data-structures)
- [Template](template.ipynb)
- [Whirlwind Tour: Built-in Data Structures](https://jakevdp.github.io/WhirlwindTourOfPython/06-built-in-data-structures.html)



## Choosing a Data Structure

The four structures overlap, but each serves a different purpose.

| Structure | Ordered | Changeable | Mixed types | Use it when |
|---|---|---|---|---|
| List | Yes | Yes | Yes | You have a general sequence that will grow, shrink, or change |
| NumPy array | Yes | Yes (contents) | No | You have numbers and want math or speed |
| Dictionary | Yes (insertion) | Yes | Yes (values) | You look things up by name rather than position |
| Tuple | Yes | No | Yes | The group should not change, or you are returning several values |

Two rules of thumb are:

- If you find yourself writing a loop to do arithmetic on every item of a list, you want an array.
- If you find yourself searching a list to find the item matching some label, you want a dictionary.


## Lists

A list is used to store an ordered collection of items. Lists are mutable, meaning you can change their contents.

You should be able to create, access, modify, and delete elements, use list methods, and perform slicing and indexing.

```python
# Create a list with square brackets
numbers = [10, 20, 30]

# Access elements, positive numbers start with the first element as 0, negative numbers start with -1 as the last element
print(numbers[0], numbers[-1])

# Modify an existing element
numbers[1] = 99

# Add a new element with append
numbers.append(40)

# Remove an element with del
del numbers[0]

# Bring back a new list containing some of the original elements.
# Start at index 1 and go to (but not including) index 3
print(numbers[1:3])
```

### Lists hold anything

A list does not care what you put in it, and the items do not have to match:

```python
mixed = [1, 'two', 3.0, True, [4, 5]]
print(len(mixed))           # 5
```

That flexibility is why lists are slow for math. Python has to check the type of every item every time.

### Common list methods

```python
numbers = [10, 20, 30]

numbers.append(40)          # add one item to the end -> [10, 20, 30, 40]
numbers.insert(0, 5)        # add at a position       -> [5, 10, 20, 30, 40]
numbers.remove(20)          # remove by value         -> [5, 10, 30, 40]
last = numbers.pop()        # remove and return last  -> last is 40
numbers.sort()              # sort in place
print(numbers)              # [5, 10, 30]
print(len(numbers))         # 3
print(30 in numbers)        # True
```

Note the difference between `remove` and `del`: `numbers.remove(20)` deletes the *value* 20, while `del numbers[0]` deletes whatever is at *position* 0.

### Arithmetic does not do what you expect

The operators work on lists, but they work on the container, not the contents:

```python
print([1, 2, 3] * 2)        # [1, 2, 3, 1, 2, 3]  repeats the list
print([1, 2, 3] + 5)        # TypeError: can only concatenate list (not "int") to list
```

Confusingly, Numpy arrays do arithmetic on the *contents*. This is why we use them for math. I try to avoid 
using lists for numbers, because the behavior is so different from arrays.


## Numpy Arrays

Numpy arrays are used for numerical data and support efficient mathematical operations. They are part of the NumPy library, which is widely used in data science and scientific computing. They offer some additional features over lists, such as elementwise operations and broadcasting. However, their main benefit is performance, especially for large datasets.

```python
# You have to import numpy
import numpy as np

# Create a numpy array by using np.array()
arr = np.array([1, 2, 3])

# Elementwise operations, add 5 to each element
print(arr + 5)

# Aggregate functions, including sum, mean, std, etc.
print(np.mean(arr), np.std(arr))

# We can also filter using boolean indexing
# This will be used more heavily in data analysis with the filtering operation
print(arr[arr > 1])  # Boolean indexing
```

### Every element shares one type

An array has a single `dtype`. NumPy picks the most flexible type for the values you give it. A single stray text value in a column of numbers turns the whole array into strings. This will stop all of your math from working.

```python
print(np.array([1, 2, 3]).dtype)        # int64
print(np.array([1.0, 2, 3]).dtype)      # float64  one float makes them all floats
print(np.array([1, 2, '3']).dtype)      # <U21     one string makes them all text
```



### Elementwise operations and vectorization

Every arithmetic operator applies to all elements at once, with no loop:

```python
arr = np.array([1, 2, 3])
print(arr + 5)              # [6 7 8]
print(arr * 2)              # [2 4 6]
print(arr ** 2)             # [1 4 9]

prices = np.array([10.0, 20.0, 30.0])
print(prices * 1.06)        # [10.6 21.2 31.8]  add 6% tax to every price
```

Writing `prices * 1.06` instead of a loop is called **vectorization**. It is shorter to read, and the arithmetic runs in compiled C rather than in Python, which is where the speed advantage comes from.


### Aggregation

Aggregate functions collapse an array down to a single number:

```python
arr = np.array([1, 2, 3])
print(np.sum(arr))          # 6
print(np.mean(arr))         # 2.0
print(np.min(arr), np.max(arr))   # 1 3
print(np.median(arr))       # 2.0
print(np.std(arr))          # 0.816496580927726
```

Most of these are available two ways — as a function, `np.mean(arr)`, or as a method, `arr.mean()`. They give the same answer. Prefer the `np.` form: it also accepts a plain Python list, so `np.mean([1, 2, 3])` works while `[1, 2, 3].mean()` does not.

On a two-dimensional array, `axis` controls the direction:

```python
m = np.array([[1, 2, 3],
              [4, 5, 6]])
print(m.sum(axis=0))        # [5 7 9]   down the columns
print(m.sum(axis=1))        # [6 15]    across the rows
```

One caution on `np.std`: it computes the *population* standard deviation by default. If you want the sample version taught in statistics, pass `ddof=1`:

```python
data = [2, 4, 4, 4, 5, 5, 7, 9]
print(np.std(data))         # 2.0                (population, divides by n)
print(np.std(data, ddof=1)) # 2.138089935299395  (sample, divides by n-1)
```

### Boolean indexing

A comparison on an array returns an array of True/False values, called a **boolean mask**:

```python
arr = np.array([1, 2, 3])
print(arr > 1)              # [False  True  True]
```

Putting that mask inside the brackets keeps only the elements where the mask is True:

```python
print(arr[arr > 1])         # [2 3]
```

Read `arr[arr > 1]` as "the elements of arr where arr is greater than 1." Because True counts as 1, summing a mask counts the matches:

```python
print(np.sum(arr > 1))      # 2
```

This is the foundation of filtering in data analysis. When you later write `df[df['sales'] > 1000]` in pandas, it is the same idea on a table.


## Dictionaries

A dictionary is used to store key-value pairs. Dictionaries are mutable, meaning you can change their contents.

```python
# Create a dictionary with curly braces. Each key is separated from its value by a colon.
d = {'a': 1, 'b': 2}

# Add or update an item with a specific key,
d['c'] = 3  # Add
d['a'] = 10  # Update

# Remove a value
del d['b']  # Delete

# Iterate over keys and values
for k, v in d.items():
    print(k, v)
```

### Lookup by name, not position

A list answers "what is in position 2?" A dictionary answers "what is the price of the widget?" That difference is the whole reason to reach for one:

```python
prices = {'widget': 9.99, 'gadget': 24.50, 'doohickey': 3.75}
print(prices['gadget'])     # 24.5
```

Adding and updating use the same syntax. If the key exists, you overwrite it; if it does not, you create it. There is no separate "add" command:

```python
prices['sprocket'] = 12.00  # key is new, so this adds
prices['widget'] = 10.99    # key exists, so this replaces
```

### Missing keys

Asking for a key that does not exist is an error, not a blank:

```python
print(prices['gizmo'])      # KeyError: 'gizmo'
```

Two safer approaches:

```python
print('gizmo' in prices)          # False    test first
print(prices.get('gizmo'))        # None     return None instead of failing
print(prices.get('gizmo', 0))     # 0        supply your own default
```

`in` checks keys, not values. `'gizmo' in prices` asks whether that key exists, not whether any product costs that much.

### Iterating

There are three ways to iterate over a dictionary. 

```python
d = {'a': 10, 'c': 3}

print(list(d.keys()))       # ['a', 'c']
print(list(d.values()))     # [10, 3]
print(list(d.items()))      # [('a', 10), ('c', 3)]

for k, v in d.items():
    print(k, v)
```

Notice that `.items()` produces tuples, which the `for k, v` line unpacks — the same unpacking you use for multiple return values below.

### Rules for keys

Keys must be immutable, so strings, numbers, and tuples work, but lists do not:

```python
sales = {('WV', 2026): 500}       # a tuple key works
print(sales[('WV', 2026)])        # 500

bad = {[1, 2]: 'x'}               # TypeError: unhashable type: 'list'
```

Keys are also unique. Assigning to an existing key replaces its value rather than adding a second entry, which is why `len(d)` counts keys.


## Tuples

A tuple is similar to a list, but it is immutable, meaning its contents cannot be changed after creation. We most often use it to group related values together.

```python
# Create a tuple with parentheses and value separated by commas
t = (1, 2, 3)

# Access elements
print(t[0])

# t[1] = 5  # Error: tuples are immutable

# Example usage of a tuple to return multiple values from a function
def min_max(lst):
    return min(lst), max(lst)

lo, hi = min_max([3, 1, 4])
print(lo, hi)
```

### Immutability is the point

The commas create the tuple; the parentheses only make it readable:

```python
t = 1, 2, 3
print(t)                    # (1, 2, 3)

t[1] = 5                    # TypeError: 'tuple' object does not support item assignment
```

Immutability sounds like a limitation, but it is a guarantee. A tuple you hand to another part of your program cannot be modified behind your back, which is also what makes tuples eligible as dictionary keys.

Note that immutable means the *tuple* cannot change, not that the objects inside it are frozen. A tuple's contents are fixed the moment it is created.

### Unpacking

Assigning a tuple to several variables at once is called unpacking. The number of variables has to match the number of values:

```python
lo, hi = (1, 4)
print(lo, hi)               # 1 4

x, y = 1, 2
x, y = y, x                 # swap with no temporary variable
print(x, y)                 # 2 1
```

### Returning several values

A Python function returns one object, but that object can be a tuple, which is how a function can return several values:

```python
def min_max(lst):
    return min(lst), max(lst)

print(min_max([3, 1, 4]))   # (1, 4)   one tuple

lo, hi = min_max([3, 1, 4]) # unpacked into two variables
print(lo, hi)               # 1 4
```

Use a tuple when the grouping is fixed and small — a coordinate, a date range, a function's pair of results. Use a list when the collection will grow or change.



## Key Terms

- **Data structure**: A container that organizes values so you can store and retrieve them
- **List**: An ordered, mutable collection written with square brackets
- **Mutable**: Can be changed after it is created, as with a list or dictionary
- **Immutable**: Cannot be changed after it is created, as with a tuple or string
- **Method**: A function attached to an object, called with a dot, such as `numbers.append(40)`
- **Index**: The position of an item, counting from 0
- **Slice**: A range of items pulled out with `[start:end]`, where the end is excluded
- **NumPy**: The numerical computing library that provides the array type
- **Array**: A fixed-type, fixed-size NumPy collection built for fast math
- **dtype**: The single data type shared by every element of an array
- **Elementwise operation**: An operation applied to every element at once, such as `arr + 5`
- **Vectorization**: Replacing a Python loop with a single array operation for speed
- **Aggregation**: Collapsing many values into one, such as sum, mean, or standard deviation
- **Boolean indexing**: Selecting elements with an array of True/False values
- **Boolean mask**: The True/False array used to do the selecting
- **Dictionary**: A mutable collection of key-value pairs written with curly braces
- **Key**: The immutable label used to look up a value in a dictionary
- **Value**: The data stored under a key
- **KeyError**: The error raised when you request a key that does not exist
- **Tuple**: An ordered, immutable collection, usually written with parentheses
- **Unpacking**: Assigning the items of a tuple to several variables at once

## Practice Questions

1. Which data structure is immutable?
   - Tuple
   - List
   - Dictionary
   - NumPy array
1. Which data structure would you use to look up a value by a name rather than a position?
   - Dictionary
   - List
   - Tuple
   - NumPy array
1. What does `numbers[-1]` return?
   - The last element
   - The first element
   - An error, because indexes cannot be negative
   - The element before the one you asked for
1. Given `numbers = [10, 20, 30, 40]`, what does `numbers[1:3]` return?
   - `[20, 30]`
   - `[20, 30, 40]`
   - `[10, 20, 30]`
   - `[20]`
1. What is the difference between `numbers.remove(20)` and `del numbers[0]`?
   - `remove` deletes by value, `del` deletes by position
   - `remove` deletes by position, `del` deletes by value
   - They do the same thing
   - `remove` empties the whole list
1. Given `arr = np.array([1, 2, 3])`, what does `arr + 5` return?
   - `[6 7 8]`
   - `[1 2 3 5]`
   - `[15]`
   - A TypeError, matching the behavior of a list
1. What is the term for applying an operation to every element of an array at once, with no loop?
   - Vectorization
   - Aggregation
   - Indexing
   - Unpacking
1. What is the dtype of `np.array([1.0, 2, 3])`?
   - float64, because one float makes every element a float
   - int64, because two of the three values are integers
   - A mix of float64 and int64
   - object, because the types do not match
1. Why is a NumPy array usually faster than a list for math?
   - Every element shares one type, so the operation runs in compiled code instead of a Python loop
   - Arrays are stored on the hard drive rather than in memory
   - Arrays are smaller because they drop duplicate values
   - Arrays skip the elements that would not change
1. Given `arr = np.array([1, 2, 3])`, what does `arr > 1` return?
   - `[False  True  True]`
   - `[2 3]`
   - `True`
   - `2`
1. Given `arr = np.array([1, 2, 3])`, what does `arr[arr > 1]` return?
   - `[2 3]`
   - `[False  True  True]`
   - `[1 2 3]`
   - `2`
1. Which function returns the average of a NumPy array?
   - `np.mean(arr)`
   - `np.avg(arr)`
   - `np.median(arr)`
   - `np.sum(arr)`
1. By default, `np.std()` computes which standard deviation?
   - Population, dividing by n
   - Sample, dividing by n-1
   - Whichever fits the data better
   - Neither, it returns the variance
1. How do you add a new key `'c'` with the value 3 to a dictionary `d`?
   - `d['c'] = 3`
   - `d.append('c', 3)`
   - `d['c'].add(3)`
   - `d + {'c': 3}`
1. What happens when you request a key that does not exist, as in `d['gizmo']`?
   - A KeyError
   - It returns `None`
   - It returns 0
   - It creates the key with an empty value
1. Which method returns the values of a dictionary safely, giving a default instead of an error when the key is missing?
   - `d.get(key, default)`
   - `d[key]`
   - `d.items()`
   - `d.default(key)`
1. Which of these can be used as a dictionary key?
   - A tuple, because it is immutable
   - A list, because it is ordered
   - Any object at all
   - Only strings
1. What does `d.items()` return for each entry?
   - A tuple of the key and the value
   - Just the keys
   - Just the values
   - A list of two separate dictionaries
1. What does the line `lo, hi = min_max([3, 1, 4])` do?
   - Unpacks the returned tuple into two variables
   - Calls the function twice, once for each variable
   - Assigns the whole list to both variables
   - Raises an error, because a function can only return one value
1. What happens when you run `t[1] = 5` on the tuple `t = (1, 2, 3)`?
   - A TypeError, because tuples do not support item assignment
   - The second item becomes 5
   - A new tuple `(1, 5, 3)` is returned
   - The tuple is converted to a list automatically
1. What actually creates a tuple in `t = 1, 2, 3`?
   - The commas
   - The parentheses, which are required
   - The assignment operator
   - The variable name
1. You have a column of 50,000 sales figures and need to add sales tax to each one. Which structure fits best?
   - A NumPy array, because the arithmetic is elementwise and fast
   - A list, because it can grow
   - A dictionary, because each sale needs a label
   - A tuple, because the figures should not change