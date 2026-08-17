# Python Functions

This chapter shows you how Python creates functions.

I will not ask you to write a function. However, the AI will often create them for you, especially list comprehensions and lambdas.  I expect that you will be able to walk through the code and explain what is happening.

**Outcomes**:
- Call functions with positional and keyword arguments.
- Explain a custom functions that uses the `def` statement.
- Explain how a function returns one or more values .
- Explain how default argument values are used in functions.
- Interpret short anonymous functions that use the `lambda` keyword.

**Reading Resources**:
- *Whirlwind Tour of Python Chapter 8*
  - [Whirlwind Tour: Functions](https://jakevdp.github.io/WhirlwindTourOfPython/08-defining-functions.html)

**Links**:
- [template](template.ipynb)

## Code samples

### Call functions with positional and keyword arguments


```python
# Using built-in print with keyword argument
print(1, 2, 3, sep=", ")
```

### Define your own functions using the `def` statement


```python
def square(x):
    return x * x
print(square(4))
```

### Return values from functions, including multiple values as tuples


```python
def min_and_max(lst):
    return min(lst), max(lst)
lo, hi = min_and_max([2, 8, 5])
print(lo, hi)
```

### Use default argument values in function definitions


```python
def power(x, exp=2):
    return x ** exp
print(power(3))      # 9
print(power(3, 3))   # 27
```

### Create short anonymous functions using the `lambda` keyword


```python
add = lambda x, y: x + y
print(add(2, 3))
```

## Sample Problems and Solutions

### Call functions with positional and keyword arguments

**Problem 1:** Print three numbers separated by dashes using the `sep` keyword argument.


```python
print(1, 2, 3, sep="-")
```

**Problem 2:** Print your name and age using the sep keyword argument and a custom separator.


```python
print("Name:", "Alice", "Age:", 30, sep=" | ")
```

**Problem 3:** Print two words on the same line by using the `end` keyword argument.


```python
print("Hello", end=" ")
print("World")
```

**Problem 4:** Print numbers 1 to 5 separated by commas using the `sep` keyword argument.


```python
print(1, 2, 3, 4, 5, sep=", ")
```

### Define your own functions using the `def` statement

**Problem 1:** Write a function that prints "Python is fun!"


```python
def fun():
    print("Python is fun!")
fun()
```

**Problem 2:** Write a function that returns the cube of a number. Hint: Use `x ** 3`.


```python
def cube(x):
    return x ** 3
print(cube(2))  # 8
```

**Problem 3:** Write a function that greets a user by name. Hint: use print


```python
def greet(name):
    print(f"Hello, {name}!")
greet("Bob")
```

**Problem 4:** Write a function that returns the sum of two numbers. Hint: use return


```python
def add(a, b):
    return a + b
print(add(3, 4))  # 7
```

### Return values from functions, including multiple values as tuples

**Problem 1:** Write a function that returns both the sum and product of two numbers using a tuple.


```python
def sum_and_product(a, b):
    return a + b, a * b
s, p = sum_and_product(2, 5)
print(s, p)
```

**Problem 2:** Write a function that returns the first and last elements of a list. Hint: use indexing.


```python
def ends(lst):
    return lst[0], lst[-1]
first, last = ends([10, 20, 30])
print(first, last)
```

**Problem 3:** Write a function that returns the quotient and remainder of two numbers. Hint: use `//` and `%`.


```python
def divmod_pair(a, b):
    return a // b, a % b
q, r = divmod_pair(7, 3)
print(q, r)
```

**Problem 4:** Write a function that returns the length and sum of a list.


```python
def length_and_sum(lst):
    return len(lst), sum(lst)
l, s = length_and_sum([1, 2, 3, 4])
print(l, s)
```

### Use default argument values in function definitions

**Problem 1:** Write a function that raises a number to a power, defaulting to square.


```python
def power(x, exp=2):
    return x ** exp
print(power(4))    # 16
print(power(4, 3)) # 64
```

**Problem 2:** Write a function that greets a user, defaulting to "World".


```python
def greet(name="World"):
    print(f"Hello, {name}!")
greet()
greet("Alice")
```

**Problem 3:** Write a function that prints a message a given number of times, defaulting to once.


```python
def repeat(msg, times=1):
    for _ in range(times):
        print(msg)
repeat("Hi!")
repeat("Hello!", 3)
```

### Create short anonymous functions using the `lambda` keyword

**Problem 1:** Create a lambda that multiplies two numbers. Save the lambda to a variable and call it.


```python
multiply = lambda x, y: x * y
print(multiply(3, 4))
```

**Problem 2:** Sort a list of tuples by their second part using a lambda. Hint: use the sorted function with a key argument (where the key is a lambda function).


```python
tuples = [(1, 3), (2, 2), (3, 1)]
sorted_tuples = sorted(tuples, key=lambda t: t[1])
print(sorted_tuples)
```

**Problem 3:** Filter a list to keep only even numbers using a lambda. Hint: use list(filter(..., nums)) with the ... replaced with your lambda function.


```python
nums = [1, 2, 3, 4, 5]
evens = list(filter(lambda x: x % 2 == 0, nums))
print(evens)
```
