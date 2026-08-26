
# Python Data Structures

### py02 — Lists, NumPy Arrays, Dictionaries, and Tuples

Nathan Garrett, PhD CPA

*Department of Accounting and Information Systems, WVU*

---

## What This Module Covers

1. **Lists** — create, access, modify, and delete elements; list methods; slicing and indexing
2. **NumPy arrays** — elementwise operations, broadcasting, aggregation, boolean indexing
3. **Dictionaries** — key-value pairs; access, add, update, delete; iterate over keys/values/items
4. **Tuples** — immutability; creation and access; returning multiple values from a function

---

## Choosing a Data Structure

- If you want to do arithmetic on every item, you want an **array**.
- If you want to find a specific item matching a label, you want a **dictionary**.

| Structure | Ordered | Changeable | Mixed types | Use it when |
| --- | --- | --- | --- | --- |
| List | Yes | Yes | Yes | A general sequence that will grow, shrink, or change |
| NumPy array | Yes | Yes (contents) | No | You have numbers and want math or speed |
| Dictionary | Yes (insertion) | Yes | Yes (values) | You look things up by name rather than position |
| Tuple | Yes | No | Yes | The group should not change, or you are returning several values |

---

# Part 1

## Lists

---

## Lists

An ordered, mutable collection written in square brackets.

```python
numbers = [10, 20, 30]
print(numbers[0], numbers[-1])   # 10 30

numbers[1] = 99                  # modify
numbers.append(40)               # add to the end
del numbers[0]                   # remove by position

print(numbers[1:3])              # [30, 40]
```

---

## Lists Hold Anything

A list does not care what you put in it, and the items do not have to match:

```python
mixed = [1, 'two', 3.0, True, [4, 5]]
print(len(mixed))           # 5
```

That flexibility is why lists are slow for math. Python has to check the type of every item, every time.

---

## Common List Methods

```python
numbers = [10, 20, 30]

numbers.append(40)          # add one item to the end -> [10, 20, 30, 40]
numbers.insert(0, 5)        # add at a position       -> [5, 10, 20, 30, 40]
numbers.remove(20)          # remove by value         -> [5, 10, 30, 40]
last = numbers.pop()        # remove and return last  -> last is 40
numbers.sort()              # sort in place
print(numbers)               # [5, 10, 30]
print(30 in numbers)         # True
```

`remove` deletes by **value**. `del` deletes by **position**. They are not interchangeable.

---

## Arithmetic Does Not Do What You Expect

The operators work on lists, but they work on the **container**, not the contents:

```python
print([1, 2, 3] * 2)        # [1, 2, 3, 1, 2, 3]  repeats the list
print([1, 2, 3] + 5)        # TypeError: can only concatenate list (not "int") to list
```

NumPy arrays do arithmetic on the *contents* instead — that difference is why we reach for arrays for math.

---

## Questions 1-3

```python
# Q1
numbers = [10, 20, 30]
numbers.append(40)
print(numbers[-1])
```

*Answer: `40`. `append()` adds to the end, and `-1` always means the last element, whatever the length is.*
<!-- .element: class="fragment" -->

```python
# Q2
numbers = [10, 20, 30, 40]
del numbers[0]
numbers.remove(30)
print(numbers)
```

*Answer: `[20, 40]`. `del numbers[0]` removes by **position** (the 10). `.remove(30)` removes by **value** (the 30), wherever it lives.*
<!-- .element: class="fragment" -->

```python
# Q3
print([1, 2, 3] * 2)
print([1, 2, 3] + 5)
```

*Answer: `[1, 2, 3, 1, 2, 3]`, then `TypeError`. `*` repeats the container. `+` only joins two lists — a list and a plain number is not a valid combination.*
<!-- .element: class="fragment" -->

---

## Questions 4-6

```python
# Q4
mixed = [1, 'two', 3.0, True, [4, 5]]
print(len(mixed))
```

*Answer: `5`. A list does not check that items match. Each entry — even the nested list — counts as one item.*
<!-- .element: class="fragment" -->

```python
# Q5
numbers = [10, 20, 30]
numbers[1] = 99
print(numbers[1:3])
```

*Answer: `[99, 30]`. The assignment makes the list `[10, 99, 30]` first. The slice then grabs index 1 up to (not including) index 3.*
<!-- .element: class="fragment" -->

```python
# Q6
numbers = [5, 10, 30, 40]
numbers.sort()
last = numbers.pop()
print(numbers, last)
```

*Answer: `[5, 10, 30] 40`. The list was already sorted, so `.sort()` changes nothing visibly. `.pop()` removes and returns the last item, shrinking the list.*
<!-- .element: class="fragment" -->

---

# Part 2

## NumPy Arrays

---

## NumPy Arrays

NumPy is built for numerical data. It provides elementwise math and broadcasting, with performance as the main benefit over a list. We only use a small fraction of its features in this class.

```python
import numpy as np

arr = np.array([1, 2, 3])

print(arr + 5)                    # [6 7 8]
print(np.mean(arr), np.std(arr))  # 2.0 0.816...

print(arr[arr > 1])                # [2 3]  boolean indexing
```

---

## Every Element Shares One Type

An array has a single `dtype`. NumPy picks the most flexible type for the values you give it — one stray text value turns a column of numbers into text.

```python
print(np.array([1, 2, 3]).dtype)        # int64
print(np.array([1.0, 2, 3]).dtype)      # float64  one float makes them all floats
print(np.array([1, 2, '3']).dtype)      # <U21     one string makes them all text
```

---

## Elementwise Operations and Vectorization

**This is different from base Python!** Every arithmetic operator applies to all elements at once, with no loop.

```python
arr = np.array([1, 2, 3])
print(arr + 5)              # [6 7 8]
print(arr * 2)              # [2 4 6]
print(arr ** 2)             # [1 4 9]

prices = np.array([10.0, 20.0, 30.0])
print(prices * 1.06)        # [10.6 21.2 31.8]  add 6% tax to every price
```

Writing `prices * 1.06` instead of a loop is called **vectorization**. It is shorter to read, and it runs in compiled C.

---

## Aggregation

Aggregate functions collapse an array down to a single number.

```python
arr = np.array([1, 2, 3])
print(np.sum(arr))                # 6
print(np.mean(arr))               # 2.0
print(np.min(arr), np.max(arr))   # 1 3
```

On a two-dimensional array, `axis` controls the direction:

```python
m = np.array([[1, 2, 3],
              [4, 5, 6]])
print(m.sum(axis=0))        # [5 7 9]   down the columns
print(m.sum(axis=1))        # [6 15]    across the rows
```

---

## A Caution on Standard Deviation

`np.std()` computes the **population** standard deviation by default — it divides by `n`.

```python
data = [2, 4, 4, 4, 5, 5, 7, 9]
print(np.std(data))         # 2.0                population, divides by n
print(np.std(data, ddof=1)) # 2.138089935299395  sample, divides by n-1
```

Pass `ddof=1` for the sample version taught in most statistics classes.

---

## Boolean Indexing

A comparison on an array returns a **boolean mask** — an array of True/False values.

```python
arr = np.array([1, 2, 3])
print(arr > 1)              # [False  True  True]
print(arr[arr > 1])         # [2 3]   keep where the mask is True
print(np.sum(arr > 1))      # 2       True counts as 1
```

This is the foundation of filtering in data analysis. `df[df['sales'] > 1000]` in pandas is the same idea applied to a table.

---

## Questions 7-9

```python
# Q7
arr = np.array([1, 2, 3])
print(arr + 5)
```

*Answer: `[6 7 8]`. The operation applies to every element in one step — no loop, no index needed.*
<!-- .element: class="fragment" -->

```python
# Q8
print(np.array([1, 2, '3']).dtype)
```

*Answer: `<U21`. NumPy needs one shared type for the whole array. One stray string forces everything — including the `1` and `2` — to text.*
<!-- .element: class="fragment" -->

```python
# Q9
prices = np.array([10.0, 20.0, 30.0])
print(prices * 1.06)
```

*Answer: `[10.6 21.2 31.8]`. This is vectorization: one operator call instead of a loop, running in compiled code for speed.*
<!-- .element: class="fragment" -->

---

## Questions 10-12

```python
# Q10
m = np.array([[1, 2, 3],
              [4, 5, 6]])
print(m.sum(axis=1))
```

*Answer: `[6 15]`. `axis=1` sums **across** each row: 1+2+3=6, 4+5+6=15. `axis=0` would sum down the columns instead.*
<!-- .element: class="fragment" -->

```python
# Q11
data = [2, 4, 4, 4, 5, 5, 7, 9]
print(np.std(data))
print(np.std(data, ddof=1))
```

*Answer: `2.0` then `2.138...`. The default divides by `n` (population). `ddof=1` divides by `n-1` (sample) — the version taught in most stats courses.*
<!-- .element: class="fragment" -->

```python
# Q12
arr = np.array([1, 2, 3])
print(arr[arr > 1])
print(np.sum(arr > 1))
```

*Answer: `[2 3]` then `2`. The mask keeps only the True positions when used inside `[]`. Summing the mask counts the Trues, since `True` behaves like `1`.*
<!-- .element: class="fragment" -->

---

# Part 3

## Dictionaries

---

## Dictionaries

A mutable collection of key-value pairs, ordered by insertion.

```python
d = {'a': 1, 'b': 2}

d['c'] = 3      # add
d['a'] = 10     # update

del d['b']      # delete

for k, v in d.items():
    print(k, v)   # a 10   then   c 3
```

---

## Lookup by Name, Not Position

A list answers "what is in position 2?" A dictionary answers "what is the price of the widget?"

```python
prices = {'widget': 9.99, 'gadget': 24.50, 'doohickey': 3.75}
print(prices['gadget'])     # 24.5
```

Adding and updating share the same syntax. If the key exists, you overwrite it; if not, you create it — there is no separate "add" command.

```python
prices['sprocket'] = 12.00  # new key -> adds
prices['widget'] = 10.99    # existing key -> replaces
```

---

## Missing Keys

Asking for a key that does not exist is an **error**, not a blank.

```python
print(prices['gizmo'])      # KeyError: 'gizmo'
```

Two safer approaches:

```python
print('gizmo' in prices)          # False   test first
print(prices.get('gizmo'))        # None    default to None
print(prices.get('gizmo', 0))     # 0       supply your own default
```

`in` checks **keys**, not values.

---

## Iterating and Key Rules

```python
d = {'a': 10, 'c': 3}
print(list(d.items()))      # [('a', 10), ('c', 3)]

for k, v in d.items():
    print(k, v)
```

Keys must be **immutable** — tuples work, lists do not:

```python
sales = {('WV', 2026): 500}       # a tuple key works
bad = {[1, 2]: 'x'}               # TypeError: unhashable type: 'list'
```

---

## Questions 13-15

```python
# Q13
d = {'a': 1, 'b': 2}
d['c'] = 3
d['a'] = 10
print(d)
```

*Answer: `{'a': 10, 'b': 2, 'c': 3}`. Assigning to an existing key updates it; assigning to a new key adds it. Same syntax does both.*
<!-- .element: class="fragment" -->

```python
# Q14
prices = {'widget': 9.99, 'gadget': 24.50}
print(prices['gizmo'])
```

*Answer: `KeyError: 'gizmo'`. A missing key raises an error, not `None` or a blank. Check first with `in`, or use `.get()`.*
<!-- .element: class="fragment" -->

```python
# Q15
prices = {'widget': 9.99, 'gadget': 24.50}
print(prices.get('gizmo', 0))
```

*Answer: `0`. `.get(key, default)` returns the supplied default instead of raising `KeyError` when the key is missing.*
<!-- .element: class="fragment" -->

---

## Questions 16-18

```python
# Q16
d = {'a': 10, 'c': 3}
print(list(d.items()))
```

*Answer: `[('a', 10), ('c', 3)]`. `.items()` produces a list of key-value tuples — exactly what `for k, v in d.items():` unpacks.*
<!-- .element: class="fragment" -->

```python
# Q17
sales = {('WV', 2026): 500}
bad = {[1, 2]: 'x'}
```

*Answer: The first line works; the second raises `TypeError: unhashable type: 'list'`. Dictionary keys must be immutable — tuples qualify, lists do not.*
<!-- .element: class="fragment" -->

```python
# Q18
prices = {'widget': 9.99}
print('widget' in prices)
print(9.99 in prices)
```

*Answer: `True` then `False`. `in` checks the **keys**, not the values — so testing for the price itself, instead of the product name, comes back False.*
<!-- .element: class="fragment" -->

---

# Part 4

## Tuples

---

## Tuples

Similar to a list, but **immutable** — its contents cannot change after creation.

```python
t = (1, 2, 3)
print(t[0])                 # 1

# t[1] = 5                  # TypeError: tuples are immutable
```

---

## Immutability Is the Point

The commas create the tuple; the parentheses only make it readable.

```python
t = 1, 2, 3
print(t)                    # (1, 2, 3)

t[1] = 5                    # TypeError: 'tuple' object does not support item assignment
```

A tuple handed to another part of a program cannot be modified behind your back — which is also what makes tuples eligible as dictionary keys.

---

## Unpacking

Assigning a tuple to several variables at once. The number of variables must match the number of values.

```python
lo, hi = (1, 4)
print(lo, hi)               # 1 4

x, y = 1, 2
x, y = y, x                 # swap, no temporary variable
print(x, y)                 # 2 1
```

---

## Returning Several Values

A function returns one object — but that object can be a tuple, which is how a function returns several values.

```python
def min_max(lst):
    return min(lst), max(lst)

print(min_max([3, 1, 4]))   # (1, 4)

lo, hi = min_max([3, 1, 4]) # unpacked into two variables
print(lo, hi)                # 1 4
```

Use a tuple when the grouping is fixed and small — a coordinate, a pair of results. Use a list when it will grow or change.

---

## Questions 19-21

```python
# Q19
t = (1, 2, 3)
t[1] = 5
```

*Answer: `TypeError: 'tuple' object does not support item assignment`. Tuples are immutable — once created, their contents cannot change.*
<!-- .element: class="fragment" -->

```python
# Q20
t = 1, 2, 3
print(type(t))
```

*Answer: `<class 'tuple'>`. The commas create the tuple. Parentheses are optional and added only for readability.*
<!-- .element: class="fragment" -->

```python
# Q21
x, y = 1, 2
x, y = y, x
print(x, y)
```

*Answer: `2 1`. The right side is built into a tuple `(y, x)` first, then unpacked — that is what lets the swap skip a temporary variable.*
<!-- .element: class="fragment" -->

---

## Questions 22-24

```python
# Q22
def min_max(lst):
    return min(lst), max(lst)

result = min_max([3, 1, 4])
print(result)
```

*Answer: `(1, 4)`. A function returns exactly one object, but that object can be a tuple — this is how Python fakes "returning two values."*
<!-- .element: class="fragment" -->

```python
# Q23
lo, hi = min_max([3, 1, 4])
print(lo, hi)
```

*Answer: `1 4`. Unpacking assigns each item of the returned tuple to its own variable, in order.*
<!-- .element: class="fragment" -->

```python
# Q24
point = (3, 7)
values = [point]
values[0] = (9, 9)
print(values)
```

*Answer: `[(9, 9)]`. The original tuple never changed — `values[0] = ...` replaced what the **list** points to, not the tuple's contents. Immutability protects the tuple, not the variable (or list slot) holding it.*
<!-- .element: class="fragment" -->

---

# Module Review

- **List** — general-purpose, ordered, mutable; slow for math because every item is type-checked
- **NumPy array** — one shared `dtype`; elementwise math and aggregation, at compiled speed
- **Dictionary** — lookup by key instead of position; missing keys raise `KeyError`
- **Tuple** — immutable; the shape you reach for when a group of values should not change, or a function needs to return more than one thing

| Symptom | Usual cause |
| --- | --- |
| `TypeError: can't multiply sequence by non-int` | Doing array math on a plain list |
| `KeyError` | Looking up a key that was never added, or was mistyped |
| `TypeError: ... does not support item assignment` | Trying to modify a tuple |
| A `dtype` of `object` or `<U..>` when you expected numbers | A stray string got mixed into a NumPy array |

---

## Application 1 — Sales Tax on a Column of Prices

```python
prices = [19.99, 24.50, 9.75]
with_tax = prices * 1.06
```

**What happens, and how would you fix it?**

--

### A — Sales Tax on a Column of Prices

```python
prices = [19.99, 24.50, 9.75]
with_tax = prices * 1.06
```

Raises `TypeError: can't multiply sequence by non-int of type 'float'`.

- **List arithmetic acts on the container.** `* 1.06` is not "multiply every element" — it is only defined for lists when the other side is an `int`, and even then it repeats the list.
- The task needs *elementwise* math, which means this needs to be an array, not a list.

Fix:

```python
import numpy as np
prices = np.array([19.99, 24.50, 9.75])
with_tax = prices * 1.06
print(with_tax)             # [21.1894 25.97   10.335 ]
```

---

## Application 2 — Customer Lookup

```python
customers = [('C001', 'Ada'), ('C002', 'Bob')]
print(customers['C001'])
```

**Critique this code. What is it trying to do, and what actually happens?**

--

### A — Customer Lookup

```python
customers = [('C001', 'Ada'), ('C002', 'Bob')]
print(customers['C001'])
```

Raises `TypeError: list indices must be integers or slices, not str`.

- A **list** is indexed by **position** — `customers[0]`, not by a label.
- The code is really trying to look something up **by name**, which is exactly the job a **dictionary** does.

Fix:

```python
customers = dict([('C001', 'Ada'), ('C002', 'Bob')])
print(customers['C001'])    # Ada
```

---

## Application 3 — Average Sales by Store

```python
import numpy as np

sales = {'store14': [2100, 1875, 2400], 'store22': [3050, 2890]}

for store, amounts in sales.items():
    arr = np.array(amounts)
    print(store, np.mean(arr), np.std(arr, ddof=1))
```

**Trace it. What prints for each store?**

--

### A — Average Sales by Store

```python
import numpy as np

sales = {'store14': [2100, 1875, 2400], 'store22': [3050, 2890]}

for store, amounts in sales.items():
    arr = np.array(amounts)
    print(store, np.mean(arr), np.std(arr, ddof=1))
```

```text
store14 2125.0 263.39 (rounded)
store22 2970.0 113.14 (rounded)
```

- **Dictionary** holds each store's sales as a list, looked up by name.
- **`.items()`** hands back each `(store, amounts)` pair for the loop to unpack.
- **`np.array(amounts)`** converts the list to an array so the aggregate functions can run.
- **`ddof=1`** requests the sample standard deviation — appropriate here, since each store's figures are a sample of its sales, not the entire population.

---

## Application 4 — Using a Tuple as a Dictionary Key

```python
inventory = {}
item = ('SKU100', 'Widget')
inventory[item] = 25
item[1] = 'Gadget'
print(inventory)
```

**What goes wrong, and why does the fix relate to why this works as a dictionary key at all?**

--

### A — Using a Tuple as a Dictionary Key

```python
inventory = {}
item = ('SKU100', 'Widget')
inventory[item] = 25
item[1] = 'Gadget'
print(inventory)
```

`inventory[item] = 25` succeeds — tuples are immutable, so Python can hash them and use them as keys. `item[1] = 'Gadget'` then raises `TypeError: 'tuple' object does not support item assignment`, before the `print()` line ever runs.

- Immutability is not just a restriction here — it is exactly **why** a tuple can be a key. A list could not be used the same way: `inventory[['SKU100', 'Widget']] = 25` would raise `TypeError: unhashable type: 'list'` immediately.
- If the item needs to change, build a new tuple instead of editing the old one: `item = ('SKU100', 'Gadget')`.

---

## Ending Thoughts

Lists, arrays, dictionaries, and tuples cover most of what you will reach for before you ever open pandas — in fact, a pandas `DataFrame` column is built on a NumPy array, and `df[df['sales'] > 1000]` is the same boolean-indexing idea you just practiced.
