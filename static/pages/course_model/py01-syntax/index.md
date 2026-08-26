# Python Basics

This module covers the fundamental concepts of Python programming, including symbols, basic data types, order of operations, lists, and tuples. Students will learn how to write and execute Python code, understand variable assignment, and manipulate data structures.

**Outcomes**:
- Understand types floats, integers, strings, and booleans
- Use PEMDAS, integer division, modulo, and exponents
- Create and pull data from lists and tuples

**Links:**
- [Slides](/static/pages/slides.html?course=course_model&module=py01-syntax)
- [Template](template.ipynb)
- [Python Quick Reference Sheet](python3-quick-reference.pdf)
- [Suno - Song for Python Starts at Zero](https://suno.com/s/ZzcN2X8dw0rwZJ62)

## Types

Every value in Python has a type. The type controls what you are allowed to do with the value. Adding two integers gives you math; adding two strings glues them together.

### Floating point numbers

A float is a number with a decimal point. Any measurement that can be fractional (price, ratio, temperature) is a float.

```python
price = 3.14
tax_rate = 0.06
print(price * tax_rate)     # 0.1884
```

Division always produces a float, even when the answer is whole:

```python
print(10 / 2)               # 5.0, not 5
```

Floats are stored in binary and are not exact. This surprises everyone the first time:

```python
print(0.1 + 0.2)            # 0.30000000000000004
print(0.1 + 0.2 == 0.3)     # False
```

That is not a bug in Python. It is a consequence of storing base-10 fractions in base-2. For money, round before comparing.

### Integers

An integer is a whole number with no decimal point. Counts, row numbers, and IDs are integers.

```python
students = 42
year = 2026
print(students + 1)         # 43
```

### Strings

A string is text. It is wrapped in `'single'` or `"double"` quotes. The two are interchangeable, so pick whichever avoids escaping a quote inside your text.

```python
first = 'Ada'
last = "Lovelace"
message = "It's a string with an apostrophe"

print(first + ' ' + last)   # Ada Lovelace
```

Backticks are **not** valid in Python. `` `Ada` `` is a syntax error.

The critical point: a number in quotes is text, not a number.

```python
print(7 + 3)                # 10
print('7' + '3')            # 73   (glued together)
print(7 == '7')             # False (different types)
```

Convert between them with `int()`, `float()`, and `str()`:

```python
print(int('7') + 3)         # 10
print(str(7) + '3')         # 73
```

### Booleans

A boolean is either `True` or `False`. Capitalization matters. `T`, `TRUE`, and `true` are all errors in Python, even though they work in Excel or R.

```python
passed = True
enrolled = False
print(passed and enrolled)  # False
print(passed or enrolled)   # True
print(not passed)           # False
```

Comparisons produce booleans, which is where you will meet them most often:

```python
score = 85
print(score >= 70)          # True
```

### Checking a type

When you are unsure, ask:

```python
print(type(3.14))           # <class 'float'>
print(type(1))              # <class 'int'>
print(type('1'))            # <class 'str'>
print(type(True))           # <class 'bool'>
```


## Operators and Symbols

### Comments

A `#` tells Python to ignore the rest of the line. Comments explain *why* the code does something, not *what* it does.

```python
# Convert the raw score to a percentage
percent = points / 100      # this part runs
```

### Assignment vs. equality

This is the single most common beginner error.

- `=` **stores** a value in a variable.
- `==` **asks** whether two values are the same.

```python
score = 10                  # store 10 in score
print(score == 10)          # True  (is score equal to 10?)
print(score == '10')        # False (int vs. string)
```

Writing `if score = 10:` is a syntax error, and that is deliberate — Python is protecting you from a typo that silently overwrites data in other languages.

### Arithmetic

```python
print(7 + 3)                # 10
print(7 - 3)                # 4
print(7 * 3)                # 21
print(7 / 3)                # 2.3333333333333335
```

### Exponents

`**` raises to a power. The caret `^` does something entirely different in Python (bitwise XOR), so do not use it for exponents.

```python
print(2 ** 8)               # 256
print(9 ** 0.5)             # 3.0  (square root)
```

### Integer division and modulo

`//` divides and throws away the remainder. `%` keeps only the remainder. Together they split a division into its two halves.

```python
print(10 / 3)               # 3.3333333333333335  (float, exact-ish)
print(10 // 3)              # 3                   (how many whole times)
print(10 % 3)               # 1                   (what is left over)
```

Modulo is genuinely useful, not just a trivia question:

```python
n = 14
print(n % 2 == 0)           # True -> n is even
print(125 // 60, 125 % 60)  # 2 5  -> 125 minutes is 2 hours, 5 minutes
```

### Comparison operators

```python
a = 5
print(a > 3)                # True
print(a < 3)                # False
print(a >= 5)               # True
print(a <= 4)               # False
print(a != 5)               # False  (!= means "not equal")
```

### Order of operations (PEMDAS)

Python follows the same precedence you learned in algebra: **P**arentheses, **E**xponents, **M**ultiplication/**D**ivision, **A**ddition/**S**ubtraction. Multiplication and division rank equally and evaluate left to right.

```python
print(3 * 2 ** 2 + 1)       # 13
```

Work it through: `2 ** 2` is 4 (exponent first), then `3 * 4` is 12, then `+ 1` is 13. It is not `(3 * 2) ** 2 + 1`, which would be 37.

Parentheses override everything, and there is no prize for leaving them out:

```python
print((3 * 2) ** 2 + 1)     # 37
print(3 * (2 ** 2 + 1))     # 15
```

Comparison operators rank below arithmetic, so the math finishes before the comparison happens:

```python
print(2 + 3 * 4 > 10)       # True  (14 > 10)
```


## Data Structures

### Tuples

A tuple is a fixed group of values separated by commas. Parentheses are optional but conventional.

```python
point = 1, 2
point = (1, 2)              # same thing, clearer
print(point)                # (1, 2)
print(point[0])             # 1
```

The everyday use of tuples is assigning several variables at once:

```python
x, y = 1, 2
print(x)                    # 1
print(y)                    # 2
```

That also gives you a one-line swap, with no temporary variable:

```python
x, y = y, x
print(x, y)                 # 2 1
```

Tuples are **immutable** — once created, they cannot be changed:

```python
scores = (100, 200, 300)
scores[1] = 25              # TypeError: 'tuple' object does not support item assignment
```

Use a tuple when the group should not change (a coordinate, a database row, a return value from a function). Use a list when it should.

### Lists

A list is an ordered, changeable collection written with square brackets.

```python
my_list = [10, 20, 30, 40, 50]
print(len(my_list))         # 5
```

Lists are **0-based**: the first item is at position 0, not 1.

```python
print(my_list[0])           # 10   first item
print(my_list[1])           # 20   second item
print(my_list[-1])          # 50   last item
print(my_list[-2])          # 40   second to last
```

Negative indexes count backward from the end, which saves you from writing `my_list[len(my_list) - 1]`.

Asking for an index that does not exist is an error, not a blank:

```python
print(my_list[5])           # IndexError: list index out of range
```

A five-item list has valid indexes 0 through 4. Off-by-one errors live here.

Unlike tuples, lists can be changed:

```python
my_list[1] = 25
print(my_list)              # [10, 25, 30, 40, 50]

my_list.append(60)
print(my_list)              # [10, 25, 30, 40, 50, 60]
```

### Slicing

A slice pulls out a range of items with `list[start:end]`. The start is included and the end is **excluded**.

```python
my_list = [10, 20, 30, 40, 50]
print(my_list[1:3])         # [20, 30]   items at index 1 and 2
print(my_list[:2])          # [10, 20]   from the beginning
print(my_list[2:])          # [30, 40, 50]  through the end
print(my_list[-2:])         # [40, 50]   last two
```

The exclusive end feels wrong until you notice two conveniences: the length of `list[a:b]` is always `b - a`, and `list[:n]` plus `list[n:]` reassembles the original with nothing duplicated or lost.

Unlike indexing, slicing past the end does not raise an error:

```python
print(my_list[3:99])        # [40, 50]
```

### The range function

`range(start, end)` generates a sequence of numbers, again with the end excluded. It is not a list until you make it one.

```python
print(range(0, 10))         # range(0, 10)
print(list(range(0, 10)))   # [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
print(list(range(5)))       # [0, 1, 2, 3, 4]  start defaults to 0
print(list(range(0, 10, 2)))# [0, 2, 4, 6, 8]  step by 2
```

`range(0, 10)` produces ten numbers starting at zero — exactly the valid indexes of a ten-item list. That is not a coincidence; it is why 0-based indexing and exclusive ends were chosen together.



## Key Terms

- **Type**: The category of a value, which controls what you can do with it
- **Float**: A number with a decimal point, such as 3.14
- **Integer**: A whole number with no decimal point, such as 42
- **String**: Text wrapped in single or double quotes, such as 'Ada'
- **Boolean**: A value that is either True or False
- **Variable**: A name that stores a value for later use
- **Assignment (=)**: Stores a value in a variable
- **Equality (==)**: Tests whether two values are the same
- **Comment (#)**: Text Python ignores, used to explain why the code does what it does
- **PEMDAS**: The order Python evaluates an expression — parentheses, exponents, multiplication and division, addition and subtraction
- **Exponent (\*\*)**: Raises a number to a power
- **Integer division (//)**: Divides and discards the remainder
- **Modulo (%)**: Returns only the remainder of a division
- **List**: An ordered, changeable collection written with square brackets
- **Tuple**: An ordered, unchangeable collection written with commas
- **Immutable**: Cannot be changed after it is created, as with a tuple
- **Index**: The position of an item in a list, counting from 0
- **Zero-based**: Numbering that starts at 0, so the first item is at index 0
- **Slice**: A range of items pulled from a list, where the end position is excluded
- **Range**: A function that generates a sequence of numbers, excluding the end value
- **IndexError**: The error raised when you ask for a position that does not exist


## Class Whiteboard Problems

### Basic Types and Operators

1. What is the difference between "x" and 'x' in Python?

2. Is 7 is equal "7"?

3. Write code to  store the value 10 in a variable named `score`.

4. Write code to see if the value 10 is in a variable named `score`.

5. What is the result of `8 % 3`?

6. Write code to raise 2 to the power of 8.

7. Combine operators: What is the result of `3 * 2 ** 2 + 1`?

8. Write a line of code that checks if a variable `a` is greater than or equal to 5.

9. What is the difference between  `10/3` and `10 // 3`?

10. What symbol keeps Python from executing a line of code?


### Lists and Tuples

1. Write the syntax to create a list of the numbers 10, 20, 30, 40, and 50.

2. Print the first item in the list.

3. Print the last item in the list.

4. What happens if you try to access my_list[5]?

5. Write the syntax to create a tuple with the values 100, 200, and 300.

6. Write the syntax to change the 2nd item in the tuple to 25.

7. Return the a slice of the list that contains the 2nd and 3rd items.


## Practice Questions

1. What type is the value `3.14`?
   - Float
   - Integer
   - String
   - Boolean
1. Which of these is a valid boolean in Python?
   - `True`
   - `TRUE`
   - `true`
   - `T`
1. What does `print(7 == '7')` display?
   - `False`, because an integer and a string are never equal
   - `True`, because both hold the value seven
   - `7`
   - An error, because you cannot compare different types
1. What is the difference between `=` and `==`?
   - `=` stores a value in a variable, `==` tests whether two values are equal
   - `=` tests whether two values are equal, `==` stores a value in a variable
   - They do the same thing, but `==` is preferred
   - `=` works on numbers and `==` works on strings
1. What is the result of `'7' + '3'`?
   - `'73'`
   - `10`
   - `'10'`
   - An error, because you cannot add strings
1. What is the result of `8 % 3`?
   - 2
   - 2.666
   - 3
   - 0
1. What is the result of `10 // 3`?
   - 3
   - 3.333
   - 1
   - 4
1. Which operator raises 2 to the power of 8?
   - `2 ** 8`
   - `2 ^ 8`
   - `2 * * 8`
   - `2 exp 8`
1. What is the result of `3 * 2 ** 2 + 1`?
   - 13
   - 37
   - 19
   - 15
1. What does `10 / 2` return?
   - `5.0`, a float
   - `5`, an integer
   - `5`, a string
   - An error, because the result is not fractional
1. What symbol keeps Python from executing the rest of a line?
   - `#`
   - `//`
   - `--`
   - `%`
1. Which index returns the first item of the list `my_list`?
   - `my_list[0]`
   - `my_list[1]`
   - `my_list[-1]`
   - `my_list.first()`
1. Given `my_list = [10, 20, 30, 40, 50]`, what does `my_list[-1]` return?
   - 50
   - 10
   - 40
   - An error, because indexes cannot be negative
1. Given `my_list = [10, 20, 30, 40, 50]`, what happens when you run `my_list[5]`?
   - An IndexError, because the valid indexes are 0 through 4
   - It returns 50, the fifth item
   - It returns `None`
   - It adds a sixth item to the list
1. Given `my_list = [10, 20, 30, 40, 50]`, what does `my_list[1:3]` return?
   - `[20, 30]`
   - `[20, 30, 40]`
   - `[10, 20, 30]`
   - `[10, 20]`
1. Why does `my_list[1:3]` return two items rather than three?
   - The end of a slice is exclusive
   - The start of a slice is exclusive
   - Slices always drop the largest value
   - Lists are 1-based, so index 3 does not exist
1. What happens when you try `my_tuple[1] = 25`?
   - A TypeError, because tuples cannot be changed after they are created
   - The second item becomes 25
   - The tuple grows by one item
   - The tuple is converted to a list automatically
1. What does the line `x, y = 1, 2` do?
   - Assigns 1 to `x` and 2 to `y` using a tuple
   - Assigns the tuple `(1, 2)` to both `x` and `y`
   - Creates a list containing `x`, `y`, 1, and 2
   - Raises an error, because you can only assign one variable per line
1. What does `list(range(0, 10))` produce?
   - The numbers 0 through 9
   - The numbers 0 through 10
   - The numbers 1 through 10
   - The numbers 1 through 9
1. Which comparison operator means "not equal to"?
   - `!=`
   - `=!`
   - `<>`
   - `not ==`