<script src="/course_model/toc.js"></script>

# Understand your data and its distribution

Understand the type of data you are using! This is necessary to choose the right model.

**Outcomes**:
- Distinguish between continuous, discrete, and categorical data types
- Calculate measures of central tendency and measures of spread
- Distinguish between normal, uniform, and binomial distributions
- Transform data using log transformation and standardization
- Pick the right type of visualization for different data types


**Links:**
- [Quizlet terms](https://quizlet.com/1127346099/ml02-data-and-distributions-flash-cards/?i=2up6jq&x=1qqt)

**Good examples**:
- Distribution: [How good is good?](https://today.yougov.com/society/articles/21717-how-good-good-1)


## Data Types

There are several types of data. The main types are continuous, discrete, and categorical. These do not fully align with Python data types (such as int, float, str), but are more about the meaning of the data.

### Continuous data

**Continuous data**: Numerical data whose precision is set by the measuring tool, not the underlying value. A good example is height or weight.
- Can take on any value within a range, such as 5.1 inches, 5.12 inches, 5.123 inches, etc. There are infinite possible values within a range.
- In practice, continuous data is often stored as discrete data (for example, height in inches instead of feet and inches, or weight in pounds instead of pounds and ounces).
- *The most important definitional requirement is that continuous data can take on any value within a range, and that there are many unique values.*

Visualize with a histogram, line chart, or scatterplot. Continuous data does not show well on a bar chart, as it shows a lot of very small bars that are hard to read.


### Discrete data 

**Discrete Data** with a limited number of options (text or numbers) .
- Has no intermediate values, such as number of children, a 1-5 ranking on a survey question, or name.
  - In practice, discrete data is often stored as continuous data (for example, ranking on a survey question stored as 1.0, 2.0, 3.0, etc.).
  - *The most important definitional requirement is that discrete data has a limited number of possible values.*


Visualize with counting and a bar chart.
- Discrete data does not show well on a line chart, as it implies values between the discrete points.
- Discrete data can be hard to visualize on a scatterplot, as the dots will overlap. You can add "jitter" to the points to spread them out, or set a lower alpha transparency.


### Categorical data

**Categorical data** is a value describing a group or category with a limited number of options that do not have a meaningful numeric value.
- This is generally text (such as major), but can be stored as a number (such as a district code or zip code).
  - In practice, categorical data is often stored as continuous data (for example, district code stored as 101, 102, 103, etc.).
  - *The most important definitional requirement is that categorical data represents groups or categories.*


Visualize with a bar chart or pie chart.
- Categorical data does not show well on a line chart, as it implies values between the categories.
- Categorical data can be hard to visualize on a scatterplot, as the dots will overlap. You can add "jitter" to the points to spread them out, or set a lower alpha transparency.


## Descriptive Measures

After you understand your data type, you should calculate *descriptive statistics*. These summarize your data, and can be very useful for both understanding your data and communicating results.

- Measures of central tendency
  - **Mean, median, mode**: average, middle value, most common value
  - **Skewness**: asymmetry of the data
    - Positive skew: mean > median > mode
    - Negative skew: mean < median < mode
- Measures of spread
  - **Variance**: difference between mean and each data point, squared.
  - **Standard deviation**: square root of variance
  - **Mean absolute deviation**: similar to standard deviation, but does not square the difference.
  - **Quartiles**: data split into 4 categories
  - **Quantiles**: data split into 10 categories
- **Outliers**: extreme data values. 

![Mean versus average](statistics-meangirl.jpeg)

## Data Distributions

After understanding your data and calculating descriptive statistics, look at each value's distribution. This helps you choose the right model.

This normally requires some form of visualization, such as a histogram or density plot.

- **Normal distribution** is a bell-shaped curve that is symmetric around the mean.
  - A normal distribution (or bell curve) has most values near the mean, with fewer values as you move away.
  - Many natural phenomena follow a normal distribution, such as height or weight
  - Most classical statistical tests assume a normal distribution.
- **Uniform distribution** all outcomes have an equal probability.
  - Examples include rolling a fair die or selecting a random card from a deck.
- **Binomial distribution**: an outcome with either true or false (1 or 0). 
  - This could include a coin flip or pass/fail test.
  - The binomial distribution describes the number of successes in a fixed number of independent trials, each with the same probability of success.

[*3-minute data science* Normal distribution](https://www.youtube.com/watch?v=3VYupIsbLlY)
  
At times, you may need to transform your data to better fit a model. Common transformations include:
- **Log transformation**: finds the natural logarithm of the data, useful for right-skewed data (such as income)
- **Standardization**: puts data on the same numeric scale
  - We will use this in k-means clustering and other ML techniques
  - **Z-score scaling**: rescales data to have a mean of 0 and standard deviation of 1
  - **Min-max scaling**: rescales data to a 0-1 range (from minimum to maximum)
- **Removing outliers**: removes extreme values that can skew results