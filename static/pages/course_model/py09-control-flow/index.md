<script src="/course_model/toc.js"></script>

# Python Control Flow

This chapter shows you some basic control flow statements in Python, including `if`, `elif`, and `else` statements for conditional logic, and `for` loops for iteration. 

I will not ask you to write these, but the AI will often create them for you.  I expect that you will be able to walk through the code and explain what is happening.

**Outcomes**:
- Explain how  `if`, `elif`, and `else` statements control the program flow
- Walk-through boolean expressions to compare values and make decisions.
- Explain how `for` loops process values in arrays or lists.
- Explain how the `break` and `continue` statements control loop execution.
- Understand and use the `range()` function for numeric iteration.

**Reading**:
- *Whirlwind Tour of Python Chapter 7*
  - [Whirlwind Tour: Control Flow](https://jakevdp.github.io/WhirlwindTourOfPython/07-control-flow-statements.html)

**Links**:
- [Predict Outcomes Exercise](predict_outcomes_inclass.docx)
- [Predict Outcomes Exercise Solution](predict_outcomes_inclass_solution.docx)
- [template](template.ipynb)

## Example Code

### If, Elif, Else Statements


```python
x = 10
if x > 0:
    print("x is positive")
elif x == 0:
    print("x is zero")
else:
    print("x is negative")
```

### Boolean Expressions


```python
n = 5
print(n > 3)      # True
print(n == 5)     # True
print(n != 2)     # True
```

### For Loops Over Lists/Arrays/Ranges


```python
nums = [1, 2, 3, 4]
for num in nums:
    print(num)

for i in range(5):
    print(i)
```

### For Loops to Process Numbers in Arrays/Lists


```python
squares = []
for n in [1, 2, 3, 4]:
    squares.append(n ** 2)
print(squares)
```

### Conditional Logic Inside Loops


```python
nums = [1, 2, 3, 4, 5]
evens = []
for n in nums:
    if n % 2 == 0:
        evens.append(n)
print(evens)
```

### Break and Continue


```python
for n in range(10):
    if n == 5:
        break  # Stop the loop when n is 5
    if n % 2 == 0:
        continue  # Skip even numbers
    print(n)
```

### Using range()


```python
for i in range(3, 8):
    print(i)
```

### Combining Loops and Conditionals for Data Analysis


```python
# Print all numbers greater than 10 in a list
arr = [4, 12, 7, 15, 3]
for n in arr:
    if n > 10:
        print(n)
```

### List comprehensions


```python
def is_odd(n):
    return n % 2 != 0

nums = range(0, 10)
squares = [n ** 2 for n in nums]
print(squares)

odd_squares = [n ** 2 for n in nums if is_odd(n)]
print(odd_squares)
```

## Practice Problems

- [Python Practice](template.ipynb)
- [Predict outcomes](predict_outcomes_inclass.docx) (word file)
  - [Solution](predict_outcomes_inclass_solution.docx) (word file)
