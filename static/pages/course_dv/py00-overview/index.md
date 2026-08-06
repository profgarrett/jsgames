<script src="/course_dv/toc.js"></script>

# Python Overview

This module introduces you to Python programming. You will know how to write some basic code, as well as use Copilot.

**Outcomes**:

Python:

- Open Visual Studios and write Python code in a Jupyter notebook.
- Create numeric and string variables
- Use PEMBAS to write code that accomplishes specific tasks, such as calculating a new variable.
- Fix common syntax errors, such as missing parentheses, quotation marks, improper capitalization, and indentation.
- Predict the type of a variable (numeric, string, boolean) based on the code used to create it.
- Predict the output of a boolean logic comparison, such as `5 > 3` or `x == 10`
- Concatenate strings using the `+` operator, and predict the output of string concatenation.

Pandas:

- Interpret code that creates or loads a table
- Write code to filter a table using boolean logic, such as `df[df['population'] > 100]` or `df[df['ocean_proximity'] == '<1H OCEAN']`.
- Predict the result of a filter operation
- Write code to sort a table using `.sort_values()`, and predict the result of a sort operation.
- Explain the purpose of copying a table
- Explain the result of a mutate operation that creates or modifies a field.
- Explain the purpose of aggregation / group by.
- Explain the purpose of merge.
- Use Copilot to write pandas code

Statistical:

- Explain correlation vs causation
- Explain the purpose of a regression analysis
- Interpret p-values and coefficients from a regression output
- Interpret R-squared from a regression output
- Explain why regression can not use text as a predictor variable, and how to convert text to a numeric variable for regression analysis. 


**Files**:
- Basic [problems](python1_problems.docx) and [solution](python1_answers.docx)
- [Pandas table tutorial](pandas_table_tutorial.ipynb)
- OLS regression [tutorial](ols_problem.ipynb) and [solution](ols_solution.ipynb)

## Resources

See [slides](https://open.ed.ac.uk/introduction_to_python/) for an introduction to Python programming. My instructor notes are also available. These are more comprehensive than the slides and include additional examples and explanations.

Since we only have a week to cover Python, I will keep us at a very high level. We will cover the basics of Python syntax and data structures, but we won't have time to go into depth. 

My notes on these topics are available below. They are more comprehensive than we use in class, but can be a good resource for self-studying these topics. 

**Instructor Notes**:

- [Setup your computer](/course_dv/py00-setup/)
- [Basic types and syntax](https://profgarrett.github.io/course_model/py01-syntax/)
- [Data structures](https://profgarrett.github.io/course_model/py02-data-structures/)
- [Pandas Tables 1](https://profgarrett.github.io/course_model/py03-pandas-load-filter/)
- [Pandas Tables 2](https://profgarrett.github.io/course_model/py04-pandas-mutate/)

## Expectations

You should be able to complete all of the problems in the **files** section above. Focus on being able to *write* the Basic problems, and read/explain code in the pandas tutorial. You should also be able to use Copilot to write code that accomplishes the same tasks as the problems and tutorial.

You should also be able to run a basic OLS regression using statsmodels, and interpret the results. You should be able to explain what the coefficients mean, and how to interpret the p-values.
