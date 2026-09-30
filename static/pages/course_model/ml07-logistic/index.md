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
    

