<script src="/course_model/toc.js"></script>

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
- [Template](template.ipynb)
- [Whirlwind Tour: Built-in Data Structures](https://jakevdp.github.io/WhirlwindTourOfPython/06-built-in-data-structures.html)

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
# Note that these functions are in the numpy module, not methods of the array object
# I.E., you call np.mean(arr), not arr.mean()
print(np.mean(arr), np.std(arr))

# We can also filter using boolean indexing
# This will be used more heavily in data analysis with the filtering operation
print(arr[arr > 1])  # Boolean indexing
```

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
}
```

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
