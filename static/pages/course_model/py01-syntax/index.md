<script src="/course_model/toc.js"></script>

# Python Basics

This module covers the fundamental concepts of Python programming, including symbols, basic data types, order of operations, lists, and tuples. Students will learn how to write and execute Python code, understand variable assignment, and manipulate data structures.

**Outcomes**:
- Understand types floats, integers, strings, and booleans
- Use PEMDAS, integer division, modulo, and exponents
- Create and pull data from lists and tuples 

**Links:**
- [Template](template.ipynb)
- [Python Quick Reference Sheet](python3-quick-reference.pdf)


## Types

Basic types:
- Floating point number (e.g., 3.14)
- Integer number (e.g., 1)
- String/text uses 'single' or "double" (but not `backticks`)
- Boolean are True or False
   - T/TRUE/true are not valid in Python

Basic operators/symbols:
- Comments start with #
- Assignment =
- Equality == (type sensitive!)
- +-\*/ for addition, subtraction, multiplication, division
- Comparison: >, <, >=, <=, !=
- Exponents **
- Modulo %
- Integer division //
- Order of operations (PEMDAS)


## Data Structures

Tuple:

- Create a tuple: ```1, 2```
- Assign variables using a tuple: ```x, y = 1, 2```
	
Lists:

- Create a list: `[1, 2, 3]`
- Access 1st item from list: `list[0]`
- Access last item from list: `list[-1]`
- Lists are 0-based
- Create a list with a range function: `range(0, 10)`
   - Slicing: `list[start:end]` (end is exclusive)

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
