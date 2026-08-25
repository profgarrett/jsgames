# Excel Functions

This module introduces the concept of functions in Excel, including text, summary, and date functions. Students will learn how to use functions to manipulate text, calculate summary statistics, and work with dates and times.

**Outcomes**

After completing this material, students should be able to:

* Explain the basic structure of a function, including function names, parentheses, arguments, and return values.
* Use text functions to measure, extract, and change text values.
* Combine text values, cell references, and literal text into a single result.
* Locate, replace, and substitute characters or substrings within text.
* Combine multiple functions to solve more complex text-processing problems.
* Use summary functions to calculate totals, counts, averages, minimums, and maximums.
* Use ranges, individual cell references, and values as function arguments.
* Use date and time functions to retrieve the current date and time and extract individual date or time components.
* Create dates and times from individual components.
* Perform arithmetic with dates and times to calculate future dates, elapsed time, and working days.

**Files**

- [Class practice file](file03-functions.xlsx)
- [More on your own practice](file03-scenarios.xlsx)


## Concept List

### Functions

A function performs a predefined operation and returns a value. Functions consist of a function name followed by parentheses.

```excel
=INT(4.75)
```

This returns `4` by removing the decimal portion of the number.

Functions may take zero or more **arguments**. Arguments are placed inside the parentheses and separated by commas.

```excel
=SUM(10,20,30)
```

Functions can also be combined, or **nested**, so that the result of one function becomes an argument for another function.

```excel
=UPPER(LEFT("Nathan",1))
```

This returns:

```text
N
```

## String Functions

### `LEN()`

Returns the number of characters in a text value, including spaces.

```excel
=LEN("ABC")
```

Result:

```text
3
```

### `RIGHT()`

Returns a specified number of characters from the right side of a text value.

```excel
=RIGHT("Starting",4)
```

Result:

```text
ting
```

### `LEFT()`

Returns a specified number of characters from the left side of a text value.

```excel
=LEFT("Starting",4)
```

Result:

```text
Star
```

### `UPPER()`

Converts all letters in a text value to uppercase.

```excel
=UPPER("Green")
```

Result:

```text
GREEN
```

### `LOWER()`

Converts all letters in a text value to lowercase.

```excel
=LOWER("Green")
```

Result:

```text
green
```

### `CONCAT()`

Combines multiple text values into one text value.

```excel
=CONCAT("It costs ",4)
```

Result:

```text
It costs 4
```

The `&` operator can also be used to combine text.

```excel
="It costs" & " you " & 4
```

Result:

```text
It costs you 4
```

Literal text included in a formula must be placed inside double quotation marks.

### `FIND()`

Returns the position at which one text value first appears within another text value. `FIND()` is case-sensitive, and character positions begin with 1.

```excel
=FIND("B","ABC")
```

Result:

```text
2
```

### `REPLACE()`

Replaces characters based on their position within a text value. The arguments specify the original text, starting position, number of characters to remove, and replacement text.

```excel
=REPLACE("ABC",2,1,"-")
```

Result:

```text
A-C
```

### `SUBSTITUTE()`

Replaces matching text with different text. Unlike `REPLACE()`, it identifies the characters by their contents rather than their position.

```excel
=SUBSTITUTE("ABC","B","-")
```

Result:

```text
A-C
```

### `MID()`

Returns a specified number of characters from the middle of a text value. The arguments specify the text, starting position, and number of characters to return.

```excel
=MID("Starting",3,2)
```

Result:

```text
ar
```

## Summary Functions

### `SUM()`

Adds numbers together. `SUM()` can accept ranges, individual cell references, numbers, or combinations of these inputs.

```excel
=SUM(B5:D6)
```

You can also provide individual values:

```excel
=SUM(1,2,3)
```

Result:

```text
6
```

### `COUNT()`

Counts the number of cells containing numeric values.

```excel
=COUNT(B13:D15)
```

Text and blank cells are not included in the count.

### `COUNTA()`

Counts the number of nonblank cells. Both numbers and text are counted.

```excel
=COUNTA(B13:D15)
```

### `AVERAGE()`

Calculates the arithmetic mean of a set of numeric values.

```excel
=AVERAGE(B13:D15)
```

### `MIN()`

Returns the smallest numeric value.

```excel
=MIN(B13:D15)
```

If the values are `1`, `2`, `3`, and `4`, the result is:

```text
1
```

### `MAX()`

Returns the largest numeric value.

```excel
=MAX(B13:D15)
```

If the values are `1`, `2`, `3`, and `4`, the result is:

```text
4
```

## Date Functions

### `NOW()`

Returns the current date and current time.

```excel
=NOW()
```

The result updates when Excel recalculates the workbook.

### `TODAY()`

Returns the current date without a time component.

```excel
=TODAY()
```

The result updates when Excel recalculates the workbook.

### `NETWORKDAYS()`

Returns the number of working days between two dates. Saturdays and Sundays are excluded.

```excel
=NETWORKDAYS(DATE(2019,1,1),DATE(2019,1,10))
```

Result:

```text
8
```

Optional holiday dates can also be supplied as an additional argument.

### `DAY()`

Returns the day of the month from a date.

```excel
=DAY(DATE(2019,1,15))
```

Result:

```text
15
```

### `YEAR()`

Returns the year portion of a date.

```excel
=YEAR(DATE(2019,1,15))
```

Result:

```text
2019
```

### `MONTH()`

Returns the month number from a date.

```excel
=MONTH(DATE(2019,4,15))
```

Result:

```text
4
```

### Date Addition and Subtraction

Dates are stored as numbers in Excel, so days can be added to or subtracted from dates using normal arithmetic.

```excel
=DATE(2019,1,1)+7
```

Result:

```text
January 8, 2019
```

### `DATE()`

Creates a date from separate year, month, and day values.

```excel
=DATE(2026,12,30)
```

Result:

```text
December 30, 2026
```

### `HOUR()`

Returns the hour component of a time.

```excel
=HOUR(TIME(14,4,28))
```

Result:

```text
14
```

### `MINUTE()`

Returns the minute component of a time.

```excel
=MINUTE(TIME(2,4,28))
```

Result:

```text
4
```

### `SECOND()`

Returns the seconds component of a time.

```excel
=SECOND(TIME(2,4,28))
```

Result:

```text
28
```

### `TIME()`

Creates a time value from separate hour, minute, and second values.

```excel
=TIME(3,1,23)
```

Result:

```text
3:01:23 AM
```

Like dates, Excel stores times as numeric values. This allows times to be added, subtracted, and used to calculate elapsed time.
