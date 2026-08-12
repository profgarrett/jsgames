<script src="/course_dv/toc.js"></script>

# SQL 3 - Functions

There are are a variety of useful SQL functions. 

**Outcomes**:
- Use the text functions `lower`, `upper`, `||`, and `substr`
- Use the math functions `+`, `-`, `/`, `*`
	- Understand the difference between text and number fields
	- Use `ROUND()` on a decimal field
- Field types
	- Convert from a text field to a numeric field by multiplying by 1.0
	- Understand what happens when you divide an integer by another integer
	- Convert from an integer to a float field by multiplying by 1.0

**Links**:
- [Morgantown Docks v2](morgantowndocks2)


## Text Functions

`upper` and `lower` converts a field's case. They both take a single argument.
- `SELECT lower(name), upper(name) FROM people`

`Substr` returns part of a string. It uses three arguments:

- text_string: what text should be modified
- starting_number: which character should we start with?
- length_of_returned_string: how long should our returned string be?

As an example, the below will return *V* from *WV*:
- `SELECT substr(state_code, 2, 1) FROM states`

`||` is used to join together text values. The below will return NathanGarrett
- `SELECT firstname || lastname FROM people`

## Number Functions

You can use the normal arithmetic operators.
- `SELECT 1 + 2 - 3 / 5 * 4 - (1-1)`

SQL will turn text values into number if you use a math symbol
- `SELECT "1" + 1`

Note that some forms of SQL are very picky about decimals versus integers. If you divide 2 by 10, where both are integers, you will get 0. This is because SQL is returning an integer, which throws away all of the data past the decimal point.  Convert to a decimal by multiplying by 1.0.
- `SELECT (2 * 1.0)/10`

`ROUND` will clean up a number to the given decimal point. You can use 2 to round to the pennies, or -2 to round to the nearest hundred.
- `SELECT round(number_field, 0) FROM table_name`
