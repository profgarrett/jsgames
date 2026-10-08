# Logistic Regression


**Outcomes**:
- Use logistic regression to predict a binary outcome

**Links**:
- [logistic template](logistic_template.ipynb)
- [Helpful tutorial on Logistic Regression](https://mlu-explain.github.io/logistic-regression/)

## Logistic regression

Logistic regression is used when the dependent variable is a categorical represented by 0 or 1. It estimates the probability that a given input point belongs to a certain class.

Key Concepts:
- The line drawn by logistic regression is an S-shaped curve (sigmoid function) that maps any real-valued number into the (0, 1) interval. This is different from linear regression, which draws a straight line.
- The major advantage of logistic regression is that it draw a steeper curve between classes, which can better capture the relationship when the outcome is either a zero or a one.
- The major downside of logistic regression is that it is less interpretable than linear regression. The coefficients represent the change in the log-odds of the outcome for a one-unit change in the predictor variable, which can be less intuitive than the coefficients in linear regression.

Interpretation:
- Logistic regression is is similar to linear regression, but with some key differences
- Overall model
    - Instead of adjusted R^2, we use Pseudo R^2 (e.g., McFadden's R^2) to assess model fit.
- Individual predictors
    - A coefficient in logistic regression indicates the change in the log-odds of the outcome for a one-unit increase in the predictor variable, holding all other variables constant.
    - To convert log-odds to odds, use the exponential function: odds = exp(coefficient).
    - To convert odds to probability, use the formula: probability = odds / (1 + odds).

When used in a classical statistics context, logistic regression typically does not involve train/test splits or cross-validation. Instead, the focus is on interpreting coefficients and assessing model fit using statistical tests and metrics specific to logistic regression.


```python
# Check field types and values
import pandas as pd
import numpy as np

# Sales table
df_logistic = pd.DataFrame({
    'office_size': [1, 3, 1, 6, 8, 9, 2, 4, 3, 2],
    'closed': [True, False, True, False, False, False, True, True, False, True],
})

# Fix columns
df_logistic = df_logistic.assign(closed = df_logistic['closed'].astype(int))  # Convert boolean to int (1/0)


df_logistic
```


|   | office_size | closed |
|---|---|---|
| 0 | 1 | 1 |
| 1 | 3 | 0 |
| 2 | 1 | 1 |
| 3 | 6 | 0 |
| 4 | 8 | 0 |
| 5 | 9 | 0 |
| 6 | 2 | 1 |
| 7 | 4 | 1 |
| 8 | 3 | 0 |
| 9 | 2 | 1 |


```python
# OLS regression example with statsmodels
import statsmodels.api as sm

# Prepare the data
X = df_logistic[['office_size']]
y = df_logistic['closed']

# Fit the model using OLS for comparison
X = sm.add_constant(X)  # Adds a constant term to the predictor
model_ols = sm.OLS(y, X).fit()
predictions = model_ols.predict(X)
print(model_ols.summary())

# Print a chart comparing actual vs predicted
import matplotlib.pyplot as plt
plt.scatter(df_logistic['office_size'], y, label='Actual', color='blue')
plt.scatter(df_logistic['office_size'], predictions, label='Predicted', color='red')
plt.xlabel('Office Size')
plt.ylabel('Closed')
plt.legend()
plt.show()


```

                                OLS Regression Results                            
    ==============================================================================
    Dep. Variable:                 closed   R-squared:                       0.495
    Model:                            OLS   Adj. R-squared:                  0.432
    Method:                 Least Squares   F-statistic:                     7.848
    Date:                Tue, 06 Jan 2026   Prob (F-statistic):             0.0231
    Time:                        11:53:33   Log-Likelihood:                -3.8400
    No. Observations:                  10   AIC:                             11.68
    Df Residuals:                       8   BIC:                             12.29
    Df Model:                           1                                         
    Covariance Type:            nonrobust                                         
    ===============================================================================
                      coef    std err          t      P>|t|      [0.025      0.975]
    -------------------------------------------------------------------------------
    const           1.0082      0.221      4.569      0.002       0.499       1.517
    office_size    -0.1303      0.047     -2.801      0.023      -0.238      -0.023
    ==============================================================================
    Omnibus:                        1.449   Durbin-Watson:                   2.701
    Prob(Omnibus):                  0.485   Jarque-Bera (JB):                0.965
    Skew:                          -0.684   Prob(JB):                        0.617
    Kurtosis:                       2.333   Cond. No.                         8.59
    ==============================================================================
    
    Notes:
    [1] Standard Errors assume that the covariance matrix of the errors is correctly specified.


    
![png](index_files/index_3_1.png)
    


```python
# Logistic regression example with statsmodels
import statsmodels.api as sm

# Prepare the data
X = df_logistic[['office_size']]
y = df_logistic['closed']
X = sm.add_constant(X)  # Adds a constant term to the predictor

# Fit the logistic regression model
model_logistic = sm.Logit(y, X)
result = model_logistic.fit()
# Display the summary of the model
print(result.summary())

predictions = result.predict(X)

# Print a chart comparing actual vs predicted
import matplotlib.pyplot as plt
plt.scatter(df_logistic['office_size'], y, label='Actual', color='blue')
plt.scatter(df_logistic['office_size'], predictions, label='Predicted', color='red')
plt.xlabel('Office Size')
plt.ylabel('Closed')
plt.legend()
plt.show()


```

    Optimization terminated successfully.
             Current function value: 0.352287
             Iterations 8
                               Logit Regression Results                           
    ==============================================================================
    Dep. Variable:                 closed   No. Observations:                   10
    Model:                          Logit   Df Residuals:                        8
    Method:                           MLE   Df Model:                            1
    Date:                Tue, 06 Jan 2026   Pseudo R-squ.:                  0.4918
    Time:                        11:53:33   Log-Likelihood:                -3.5229
    converged:                       True   LL-Null:                       -6.9315
    Covariance Type:            nonrobust   LLR p-value:                  0.009028
    ===============================================================================
                      coef    std err          z      P>|z|      [0.025      0.975]
    -------------------------------------------------------------------------------
    const           3.9810      2.645      1.505      0.132      -1.203       9.165
    office_size    -1.2246      0.875     -1.400      0.161      -2.939       0.490
    ===============================================================================


    
![png](index_files/index_4_1.png)
    


## Key Terms

- **Logistic regression**: A model that predicts the probability of a binary (0/1) outcome from one or more inputs
- **Binary outcome**: A dependent variable with only two possible values, coded as 1 and 0, such as closed or not closed
- **Probability**: The chance that the outcome is 1, always between 0 and 1
- **Pseudo R²**: A measure of model fit for logistic regression, such as McFadden's R², used in place of adjusted R²
- **Linear probability model**: An OLS regression fit to a 0/1 outcome, which can predict values below 0 or above 1
- **Logit function (statsmodels)**: `sm.Logit(y, X).fit()`, the statsmodels call that fits a logistic regression


## Practice Questions

1. What kind of output variable is logistic regression used to predict?
   - A binary outcome coded as 0 or 1
   - A continuous number, such as profit
   - A cluster label with no known answer
   - A count of missing values
1. What does a logistic regression model estimate for each row?
   - The probability that the row belongs to the 1 class
   - The exact dollar value of the output
   - The residual from a straight line
   - The number of inputs to keep
1. What shape does logistic regression fit to the data?
   - An S-shaped (sigmoid) curve that stays between 0 and 1
   - A straight line with no upper or lower limit
   - A U-shaped curve
   - A series of flat steps
1. Why is OLS a poor fit for a 0/1 outcome?
   - Its straight line can predict values below 0 or above 1, which are impossible probabilities
   - OLS cannot be calculated when the output is 0 or 1
   - OLS always produces an R² of zero for binary outcomes
   - OLS ignores the intercept for binary outcomes
1. Our OLS model has a const of 1.0082 and an `office_size` coefficient of -0.1303. What does it predict for an office size of 9?
   - About -0.16, an impossible negative probability
   - About 0.16
   - About 1.17
   - Exactly 0
1. What is the major advantage of logistic regression over linear regression for a 0/1 outcome?
   - It draws a steeper curve between the two classes that better fits an outcome that is either 0 or 1
   - Its coefficients are easier to interpret
   - It never needs an intercept
   - It always has a higher R²
1. What is the major downside of logistic regression compared with linear regression?
   - It is less interpretable, because coefficients are in log-odds
   - It cannot use more than one input
   - It cannot produce p-values
   - It only works with very large datasets
1. Which statsmodels call fits a logistic regression?
   - `sm.Logit(y, X).fit()`
   - `sm.OLS(y, X).fit()`
   - `sm.add_constant(X)`
   - `df.corr()`
1. What does a coefficient in logistic regression represent?
   - The change in the log-odds of the outcome for a one-unit increase in the input, holding other inputs constant
   - The change in the probability of the outcome for a one-unit increase in the input
   - The proportion of variance explained by the input
   - The predicted probability when the input is zero
1. What does a negative coefficient mean in logistic regression?
   - As that input increases, the probability of the outcome being 1 goes down
   - The input is not statistically significant
   - The predicted probability is negative
   - The model failed to converge
1. Which measure of overall fit replaces adjusted R² in logistic regression?
   - Pseudo R², such as McFadden's R²
   - RMSE
   - The correlation coefficient
   - The F-statistic
1. In our model with only 10 rows, `office_size` has a p-value of 0.161. What should you conclude?
   - It is not significant at 0.05; with so little data we cannot be confident in the effect
   - Office size has been proven to have no effect on closing
   - There is a 16.1% chance that an office closes
   - The coefficient must be positive
1. Which task is the best fit for logistic regression?
   - Predicting whether a customer will cancel their subscription
   - Predicting the sale price of a house
   - Predicting next month's total sales
   - Grouping customers into segments without a known outcome
