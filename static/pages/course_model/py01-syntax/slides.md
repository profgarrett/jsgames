# Python Basics

### py00 — Types, Operators, and Data Structures

Nathan Garrett, PhD CPA

*Department of Accounting and Information Systems, WVU*

Note: Arrow keys or space to advance. Down arrow reveals answers on question slides.

---

## What This Module Covers

1. **Types** — float, integer, string, boolean
2. **Operators** — assignment, arithmetic, PEMDAS, `//` and `%`
3. **Data structures** — lists, tuples, indexing, slicing, `range()`

Python will not warn you when you use the wrong one. It will just
quietly do something else.

---

## The Central Idea

Every value has a **type**, and the type controls what an operator does.

```python
print(7 + 3)                # 10   -> addition
print('7' + '3')            # 73   -> gluing
```

Same operator. Same-looking values. Completely different result.

---

# Part 1

## Types

---

## Float

A number with a decimal point. Anything that can be fractional —
price, ratio, temperature.

```python
price = 3.14
tax_rate = 0.06
print(price * tax_rate)     # 0.1884
```

---

## Division Always Gives a Float

Even when the answer is whole.

```python
print(10 / 2)               # 5.0, not 5
print(type(10 / 2))         # <class 'float'>
```

This matters when you use the result as a list index — an index must
be an `int`.

---

## Floats Are Not Exact

```python
print(0.1 + 0.2)            # 0.30000000000000004
print(0.1 + 0.2 == 0.3)     # False
```

Not a bug. It is what happens when base-10 fractions are stored in
base-2.

For money: **round before comparing**.

```python
print(round(0.1 + 0.2, 2) == 0.3)   # True
```

---

## Integer

A whole number, no decimal point. Counts, row numbers, IDs.

```python
students = 42
year = 2026
print(students + 1)         # 43
print(type(students))       # <class 'int'>
```

---

## String

Text, wrapped in `'single'` or `"double"` quotes. The two are
interchangeable — pick the one that avoids escaping.

```python
first = 'Ada'
last = "Lovelace"
message = "It's a string with an apostrophe"

print(first + ' ' + last)   # Ada Lovelace
```

Backticks are **not** valid Python. `` `Ada` `` is a syntax error.

---

## A Number in Quotes Is Text

The single most common source of confusion.

```python
print(7 + 3)                # 10
print('7' + '3')            # 73     (glued)
print(7 == '7')             # False  (different types)
print('7' * 3)              # 777    (repeated)
```

`'7' * 3` does not raise an error. It gives you the wrong answer
silently.

---

## Converting Between Types

```python
print(int('7') + 3)         # 10
print(str(7) + '3')         # 73
print(float('3.14') * 2)    # 6.28
```

Conversion fails loudly when it cannot work:

```python
print(int('seven'))         # ValueError: invalid literal for int()
```

A loud error is a gift. The silent wrong answer is the dangerous one.

---

## Boolean

Either `True` or `False`. **Capitalization matters.**

`T`, `TRUE`, and `true` are errors in Python, even though they work in
Excel or R.

```python
passed = True
enrolled = False
print(passed and enrolled)  # False
print(passed or enrolled)   # True
print(not passed)           # False
```

---

## Comparisons Produce Booleans

This is where you will actually meet them.

```python
score = 85
print(score >= 70)          # True
print(type(score >= 70))    # <class 'bool'>
```

A comparison is not a question you ask the screen. It is a **value**
you can store.

```python
passed = score >= 70
```

---

## When Unsure, Ask

```python
print(type(3.14))           # <class 'float'>
print(type(1))              # <class 'int'>
print(type('1'))            # <class 'str'>
print(type(True))           # <class 'bool'>
print(type([1, 2]))         # <class 'list'>
print(type((1, 2)))         # <class 'tuple'>
```

---

## Identify the Type

The next slides show a value or an expression.

Name the **type** of the result, or the **output**.

---

## Q1

```python
print(type(10 / 5))
```

**What type prints?**

--

### A1 — `<class 'float'>`

Division always returns a float, even for 10 / 5 = 2.

Use `10 // 5` if you need an `int`.

---

## Q2

```python
x = '25'
y = 4
print(x * y)
```

**What prints?**

--

### A2 — `25252525`

`str * int` repeats the string. It is not multiplication and it is not
an error.

Fix: `int(x) * y` gives `100`.

---

## Q3

```python
print(0.1 + 0.2 == 0.3)
```

**What prints?**

--

### A3 — `False`

Binary floating point. The left side is `0.30000000000000004`.

Compare rounded values, or compare with a tolerance.

---

## Q4

```python
enrolled = TRUE
```

**What happens?**

--

### A4 — `NameError`

Python booleans are `True` and `False`, capital first letter only.

`TRUE` is read as a variable name that was never defined.

---

## Q5

```python
age = input('Age? ')    # user types 30
print(age + 5)
```

**What happens?**

--

### A5 — `TypeError`

`input()` always returns a **string**, even when the user types digits.

`'30' + 5` cannot concatenate a str and an int. Fix: `int(age) + 5`.

---

## Q6

```python
score = 91
result = score >= 90
print(type(result))
```

**What type prints?**

--

### A6 — `<class 'bool'>`

The comparison is evaluated first and produces `True`, which is a
boolean value stored in `result`.

---

# Part 2

## Operators and Symbols

---

## Comments

A `#` makes Python ignore the rest of the line.

```python
# Convert the raw score to a percentage
percent = points / 100      # this part still runs
```

Comments explain **why**, not what. `# add one to x` is noise.

---

## Assignment vs. Equality

The single most common beginner error.

- `=` **stores** a value in a variable
- `==` **asks** whether two values are the same

```python
score = 10                  # store 10 in score
print(score == 10)          # True
print(score == '10')        # False  (int vs. str)
```

`if score = 10:` is a **syntax error** — deliberately. Python is
blocking a typo that silently destroys data in other languages.

---

## Arithmetic

```python
print(7 + 3)                # 10
print(7 - 3)                # 4
print(7 * 3)                # 21
print(7 / 3)                # 2.3333333333333335
```

---

## Exponents

`**` raises to a power.

```python
print(2 ** 8)               # 256
print(9 ** 0.5)             # 3.0   (square root)
```

The caret `^` is **not** an exponent in Python — it is bitwise XOR.

```python
print(2 ^ 8)                # 10    (not 256)
```

Another silent wrong answer.

---

## Integer Division and Modulo

`//` keeps the whole times. `%` keeps what is left over.

```python
print(10 / 3)               # 3.3333333333333335
print(10 // 3)              # 3    how many whole times
print(10 % 3)               # 1    what remains
```

---

## Why Modulo Matters

```python
n = 14
print(n % 2 == 0)           # True  -> n is even

print(125 // 60, 125 % 60)  # 2 5   -> 125 min = 2 hr, 5 min
```

Any time you split a quantity into whole units plus a remainder, these
two operators are the tool.

---

## Comparison Operators

```python
a = 5
print(a > 3)                # True
print(a < 3)                # False
print(a >= 5)               # True
print(a <= 4)               # False
print(a != 5)               # False   (!= means "not equal")
```

---

## Order of Operations

**P**arentheses → **E**xponents → **M**ultiplication and **D**ivision →
**A**ddition and **S**ubtraction

Multiplication and division rank equally, left to right.

```python
print(3 * 2 ** 2 + 1)       # 13
```

`2 ** 2` is 4, then `3 * 4` is 12, then `+ 1` is 13.

It is **not** `(3 * 2) ** 2 + 1`, which would be 37.

---

## Parentheses Win

There is no prize for leaving them out.

```python
print((3 * 2) ** 2 + 1)     # 37
print(3 * (2 ** 2 + 1))     # 15
```

---

## Comparisons Rank Below Arithmetic

The math finishes first, then the comparison happens.

```python
print(2 + 3 * 4 > 10)       # True   (14 > 10)
```

Reading order: compute `2 + 3 * 4`, get 14, then ask `14 > 10`.

---

## Predict the Output

The next slides show an expression.

Give the **value** and, where it matters, the **type**.

---

## Q7

```python
print(8 % 3)
```

**What prints?**

--

### A7 — `2`

8 divided by 3 is 2 with a remainder of 2. Modulo keeps the remainder.

Compare: `8 // 3` is `2` (the whole times), `8 / 3` is
`2.6666666666666665`.

---

## Q8

```python
print(2 ^ 8)
```

**What prints?**

--

### A8 — `10`

`^` is bitwise XOR, not an exponent. Python does not complain.

For 256 you need `2 ** 8`.

---

## Q9

```python
print(10 + 2 * 3 ** 2)
```

**What prints?**

--

### A9 — `28`

Exponent first: `3 ** 2` is 9. Then `2 * 9` is 18. Then `10 + 18`
is 28.

Not `(10 + 2) * 3 ** 2`, which is 108.

---

## Q10

```python
score = 65
print(score >= 70 or score == 65)
```

**What prints?**

--

### A10 — `True`

`score >= 70` is `False`. `score == 65` is `True`.

`False or True` is `True`. Only one side of an `or` needs to hold.

---

## Q11

```python
if score = 70:
    print('passed')
```

**What happens?**

--

### A11 — `SyntaxError`

`=` assigns, `==` compares. A condition needs `==`.

Python refuses to run the file at all. Nothing before this line
executes either.

---

## Q12

```python
minutes = 200
print(minutes // 60, minutes % 60)
```

**What prints?**

--

### A12 — `3 20`

200 minutes is 3 whole hours (`//`) with 20 minutes left over (`%`).

The comma in `print()` puts a space between the two values.

---

# Part 3

## Data Structures

---

## Tuple

A fixed group of values separated by commas. Parentheses are optional
but conventional.

```python
point = 1, 2
point = (1, 2)              # same thing, clearer
print(point)                # (1, 2)
print(point[0])             # 1
```

---

## Tuples Assign Several Variables at Once

This is the everyday use.

```python
x, y = 1, 2
print(x)                    # 1
print(y)                    # 2
```

And it gives a one-line swap with no temporary variable:

```python
x, y = y, x
print(x, y)                 # 2 1
```

---

## Tuples Are Immutable

Once created, a tuple cannot be changed.

```python
scores = (100, 200, 300)
scores[1] = 25
# TypeError: 'tuple' object does not
# support item assignment
```

Use a **tuple** when the group should not change — a coordinate, a
database row, a function's return value.

Use a **list** when it should.

---

## List

An ordered, changeable collection in square brackets.

```python
my_list = [10, 20, 30, 40, 50]
print(len(my_list))         # 5
```

---

## Lists Are Zero-Based

The first item is at position **0**, not 1.

| Index    |  0 |  1 |  2 |  3 |  4 |
| -------- | -: | -: | -: | -: | -: |
| Value    | 10 | 20 | 30 | 40 | 50 |
| Negative | -5 | -4 | -3 | -2 | -1 |

```python
print(my_list[0])           # 10   first
print(my_list[-1])          # 50   last
print(my_list[-2])          # 40   second to last
```

Negative indexes count backward, saving you from
`my_list[len(my_list) - 1]`.

---

## A Bad Index Is an Error

Not a blank, not a `None`.

```python
print(my_list[5])
# IndexError: list index out of range
```

A five-item list has valid indexes **0 through 4**.

Off-by-one errors live here.

---

## Lists Can Be Changed

```python
my_list[1] = 25
print(my_list)              # [10, 25, 30, 40, 50]

my_list.append(60)
print(my_list)              # [10, 25, 30, 40, 50, 60]
```

The same line that raises `TypeError` on a tuple works on a list.

---

## Slicing

`list[start:end]` — start is **included**, end is **excluded**.

```python
my_list = [10, 20, 30, 40, 50]
print(my_list[1:3])         # [20, 30]
print(my_list[:2])          # [10, 20]      from the start
print(my_list[2:])          # [30, 40, 50]  through the end
print(my_list[-2:])         # [40, 50]      last two
```

---

## Why the End Is Excluded

Two conveniences make it worth the initial annoyance:

- The length of `list[a:b]` is always `b - a`
- `list[:n]` plus `list[n:]` rebuilds the original — nothing lost,
  nothing duplicated

Slicing past the end is also safe, unlike indexing:

```python
print(my_list[3:99])        # [40, 50]
```

---

## The range Function

`range(start, end)` generates numbers, end excluded. It is not a list
until you make it one.

```python
print(range(0, 10))         # range(0, 10)
print(list(range(0, 10)))   # [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
print(list(range(5)))       # [0, 1, 2, 3, 4]   start defaults to 0
print(list(range(0, 10, 2)))# [0, 2, 4, 6, 8]   step by 2
```

`range(0, 10)` gives exactly the valid indexes of a ten-item list.
That is not a coincidence — zero-based indexing and exclusive ends were
chosen together.

---

## Predict the Output

`my_list = [10, 20, 30, 40, 50]` for all of these.

---

## Q13

```python
print(my_list[1])
```

**What prints?**

--

### A13 — `20`

Index 1 is the **second** item. Index 0 is the first.

---

## Q14

```python
print(my_list[5])
```

**What happens?**

--

### A14 — `IndexError`

Valid indexes are 0 through 4. There is no index 5 in a five-item list.

Note this is *not* the same as slicing: `my_list[5:]` returns `[]`
without complaint.

---

## Q15

```python
print(my_list[1:3])
```

**What prints?**

--

### A15 — `[20, 30]`

Start 1 is included, end 3 is excluded. Two items, because 3 − 1 = 2.

---

## Q16

```python
print(my_list[-2:])
```

**What prints?**

--

### A16 — `[40, 50]`

Start two from the end, run to the end.

This is the idiom for "the last n items."

---

## Q17

```python
my_tuple = (100, 200, 300)
my_tuple[1] = 25
```

**What happens?**

--

### A17 — `TypeError`

Tuples are immutable. Item assignment is not supported.

If you need to change it, you needed a list.

---

## Q18

```python
x, y = 5, 9
x, y = y, x
print(x, y)
```

**What prints?**

--

### A18 — `9 5`

The right side is built into a tuple `(9, 5)` **first**, then unpacked
into x and y.

That is why no temporary variable is needed.

---

## Q19

```python
print(list(range(1, 5)))
```

**What prints?**

--

### A19 — `[1, 2, 3, 4]`

Start is included, end is excluded. Four numbers, because 5 − 1 = 4.

Same rule as slicing.

---

## Q20

```python
my_list.append(60)
print(len(my_list))
print(my_list[-1])
```

**What prints?**

--

### A20 — `6` then `60`

`append()` adds to the end and changes the list in place.

`len()` is now 6, so the valid indexes are 0 through 5.

---

# Putting It Together

Each of these mixes several concepts.

---

## Application 1 — Order Total

```python
price = '19.99'
qty = 3
total = price * qty
print(total)
print(type(total))
```

**What prints, and what was intended?**

--

### A — Order Total

Prints `19.9919.9919.99`, then `<class 'str'>`.

- **String vs. number**: `price` came in quoted, probably from a file
  or `input()`.
- **Operator depends on type**: `str * int` repeats. No error is raised.
- **Silent failure**: the receipt is wrong and nothing complains.

Fix:

```python
total = float(price) * qty
print(round(total, 2))      # 59.97
```

---

## Application 2 — Pass Rate

```python
score = 85
passed = score >= 70
honors = score >= 90
print(passed, honors)
print(passed and honors)
print(passed or honors)
```

**What prints?**

--

### A — Pass Rate

```text
True False
False
True
```

- **Comparisons produce booleans**, which can be stored in variables.
- **Precedence**: each comparison finishes before `and` / `or` runs.
- `and` needs both sides. `or` needs one.

Watch for: writing `if passed = True:` — that is a `SyntaxError`, and
`if passed:` is the idiomatic form anyway.

---

## Application 3 — Time Conversion

```python
total_minutes = 425
print(total_minutes // 60, total_minutes % 60)
print(2 + 3 * 4 ** 2 // 5)
```

**What prints?**

--

### A — Time Conversion

```text
7 5
11
```

- `425 // 60` is 7 whole hours; `425 % 60` is 5 minutes left over.
- Second line, in order: `4 ** 2` is 16 → `3 * 16` is 48 → `48 // 5` is
  9 → `2 + 9` is 11.
- `//` ranks with `*` and `/`, **above** `+`. It is not "do the
  addition first."

---

## Application 4 — Class Roster

```python
roster = ['Ada', 'Bob', 'Chen', 'Dee']
print(len(roster))
print(roster[1:3])
print(roster[-1])
roster.append('Eve')
print(roster[4])
print(roster[5])
```

**Trace it line by line.**

--

### A — Class Roster

```text
4
['Bob', 'Chen']
Dee
Eve
IndexError: list index out of range
```

- **Zero-based**: `roster[1:3]` is items 1 and 2 — Bob and Chen.
- **Negative index**: `-1` is the last item, whatever the length is.
- **Mutable**: `append()` changes the list in place, so index 4 now
  exists.
- **IndexError**: index 5 still does not. Five items means 0 through 4.

Everything before the error still printed. Python stops at the failing
line, not before it.

---

## Application 5 — Coordinates

```python
point = (3, 7)
x, y = point
x, y = y, x
print(x, y)
point[0] = 99
```

**What prints, and where does it stop?**

--

### A — Coordinates

Prints `7 3`, then raises
`TypeError: 'tuple' object does not support item assignment`.

- **Unpacking**: `x, y = point` pulls the tuple apart into two
  variables.
- **Swap**: the right side becomes `(7, 3)` before assignment.
- **Immutable**: reassigning `x` and `y` is fine — those are names.
  Changing `point[0]` is not — that is the tuple itself.

The distinction: you can point a name at something new, but you cannot
edit a tuple's contents.

---

## The Habit

Before you run it, ask:

- **What type is each value?** A number in quotes is text.
- **What does this operator do to *that* type?** `+` and `*` change
  meaning.
- **What order will Python evaluate this in?** Exponent, then
  multiply/divide, then add.
- **Is this index in range?** Zero through length minus one.

---

## Errors Worth Recognizing

| Error        | Usual cause                                  |
| ------------ | -------------------------------------------- |
| `SyntaxError` | `=` where `==` belongs; missing `:` or `)`  |
| `NameError`   | `TRUE`, or a typo'd variable name           |
| `TypeError`   | `'30' + 5`; changing a tuple                |
| `ValueError`  | `int('seven')`                              |
| `IndexError`  | Index past the end of the list              |

An error message is a diagnosis. Read the last line first.

---

## Resources

- [Notebook template](template.ipynb)
- [Python Quick Reference Sheet](python3-quick-reference.pdf)

---

# Questions?
