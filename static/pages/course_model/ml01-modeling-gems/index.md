# Modeling to predict the future

Our prior course focused on visualizations as a means to understand and make predictions. In this course, we focus on creating models. A model is a simplified version of the real-world, expressed in mathematical terms (i.e., y = x + 1).

**Outcomes**
- Define key terms (model, feature, target, error, overfitting)
- Distinguish explanation from prediction, and statistical modeling from machine learning
- Explain how p-values and confidence intervals express uncertainty (traditional statistical approach)
- Simulate values and measure the results (modern machine-learning approach)

**Links**
- [Template](template.ipynb)
- [Suno y = f(x) + error](https://suno.com/s/nrophQQjMMi5eYfP)

## What is a model?

A model is a deliberately simplified description of the real world, written in math:

> y = f(x) + ε

This course is all about building better *f*.

- **y** is what we want to know (the target)
- **x** is what we already know (the features)
- **f** is the pattern connecting them
- **ε** is error — everything affecting y that we did not, or could not, measure

Measuring error is a critical part of our process. Because the model is simpler than reality, it is never exactly right. We can't build a model that is always true, but we can build one that is predicably wrong.

> "All models are wrong, but some are useful." — George Box

### Model key terms

- **Features** (independent variables, predictors, X): what we use to predict
- **Target** (dependent variable, outcome, y): what we are predicting
- **Model**: the mathematical relationship between features and target
- **Parameters** (coefficients): the numbers the model learns from the data
- **Error** (residual): actual minus predicted, for a single observation
- **Training data**: the rows used to build the model
- **Test data**: rows held back, used only to check the finished model
- **Overfitting**: when a model memorizes the training data instead of learning the pattern

Expect multiple terms for everything. Statistics says "independent variable," machine learning says "feature," and your database says "column."

## Two goals: explain or predict

Before building anything, decide which question you are answering.

- **Explain** focuses on *why* do invoices go unpaid? Which factors matter, by how much, and can I defend that in a memo to the audit committee?
- **Predict** focuses on *which* of these 12,000 invoices will go unpaid? I want the best possible guess, and I do not much care whether I can explain it.

Two traditions grew up around these two goals:

| | Statistical modeling | Machine learning |
|---|---|---|
| Goal | Explain, test hypotheses | Predict |
| Typical data | Smaller, carefully collected | Larger, often opportunistic |
| Model | Simpler, interpretable | Complex, often opaque |
| Success means | Valid conclusions about the world | Accurate predictions on new data |
| Overfitting guard | Keep the model small, specify it in advance | Hold out test data |

These cultures sometimes share tools. Regression sits in both columns: we will use it to explain in one chapter and to predict in the next. Each culture uses different approaches.

**Prediction is not causation.** A model might predict unpaid invoices well using customer zip code, even though zip code doesn't directly influence customer behavior.  Asking "so what should we change?" is a causal question. Correlation isn't caustion, but it does suggest where to look.

![xkcd: I used to think correlation implied causation](https://imgs.xkcd.com/comics/correlation.png)


## How we judge a model

We judge a model with two separate criteria:

- **Predictive performance**: how close are the predictions to the actual values? 
- **Generalizability**: does the model perform on new data, or only on data it has already seen?

The right metric depends on the target.

- Predicting a number requires measuring error. Some metrics include RMSE and R² 
- Predicting a category requires true positive, false positive, etc...

Note that "accuracy" is one specific measure, not the general word for "how good is it."

Generalizability is very hard. If we add enough information, the model will fit its training data perfectly. It has memorized rather than learned. That is **overfitting**.

The two traditions guard against overfitting differently:

- **Machine learning defence against overfitting**: split the data into training and test sets. Build on training, judge on test. A large drop from one to the other means you overfit.
- **Statistical modeling defence against overfitting**: keep the model small, specify it before looking at the data, and penalize complexity with adjusted R², AIC, or BIC.

One warning, because this is a common misconception: **p-values do not protect against overfitting.** Choosing variables because they had small p-values (stepwise regression) actively causes it, and it invalidates the p-values themselves, since a p-value assumes you picked the model before you saw the data.

![Two traditions to modeling](traditions.png)

## How sure are we?

A model produces a number. Neither tradition trusts a number without a range around it.

- **Confidence interval**: a plausible range for something we estimated, such as 90% of people are between 5'1 and 6'0.
- **p-value**: how likely we would be to see a relationship this strong if there were truly no relationship at all. 

A small p-value says "probably not just noise." It does *not* say the effect is large, important, or causal.

Modern practice often answers the same question by brute force instead of algebra: **simulation**. Rather than deriving a formula for uncertainty, refit the model on 1,000 resamples of your data and watch how much the answer moves. The spread of those 1,000 answers *is* your uncertainty. 

We will use both approaches this semester.

## EDA process

Exploratory data analysis works the same way for statistical modeling and machine learning, and it is covered in our prior class — see the [EDA chapter](https://profgarrett.github.io/course_dv/dv01-eda/). If you did not take that course with me, review it before continuing.

The short version:

- Load the dataset
- One field at a time:
  - Understand the data structure (wide, long, roll-up, aggregated, longitudinal, cross-sectional)
  - Clean the field: check the data type, find missing values and duplicates
  - Visualize the distribution (find outliers)
- Visualize relationships between variables

Once the data is clean:

- Select features and a target
- *If using ML*, split the data into training and testing sets — **before** you look at the test set
- Fit the model
- Evaluate it, on data it has not seen
- Repeat as needed, remembering that every repetition is another chance to overfit

### Communicating results

A model that nobody acts on has accomplished nothing. Your deliverable is an argument, not a number:

- **Presentation** for decision-makers who want the recommendation and its uncertainty, not your feature engineering
- **Written memo** for the record — what you did, what you assumed, what would change your conclusion
- **Poster** for a mixed audience skimming in ninety seconds

In every format, report what the model does *not* know alongside what it predicts.

## Key Terms

- **Machine Learning**: A tradition emphasizing prediction
- **Statistics**: A tradition emphasizing explanation

## Practice Questions

1. In the expression y = f(x) + ε, what does ε represent?
   - Everything affecting y that we did not, or could not, measure
   - The slope of the relationship between x and y
   - A mistake made while writing the code
   - The number of features in the model
1. In a model predicting which invoices will go unpaid, the invoice amount and customer age are what?
   - Features
   - Targets
   - Parameters
   - Residuals
1. What are the numbers a model learns from the data called?
   - Parameters
   - Features
   - Residuals
   - Targets
1. What does George Box's line "all models are wrong, but some are useful" tell us to expect?
   - A model is a simplification, so the goal is to be predictably wrong rather than exactly right
   - Modeling rarely produces anything worth acting on
   - A model becomes correct once enough features are added
   - Statistical models are wrong, but machine learning models are not
1. You need to defend to the audit committee which factors drive unpaid invoices, and by how much. Which goal is this?
   - Explanation
   - Prediction
   - Clustering
   - Simulation
1. Which pairing describes the statistical modeling tradition?
   - Smaller carefully collected data, a simpler interpretable model, success measured by valid conclusions
   - Larger opportunistic data, a complex model, success measured by accuracy on new data
   - Larger opportunistic data, a simpler model, success measured by valid conclusions
   - Smaller carefully collected data, a complex model, success measured by accuracy on new data
1. What is overfitting?
   - The model memorizes the training data instead of learning the pattern
   - The model uses too few features to capture the relationship
   - The model produces predictions that are all too high
   - The model is fit on data that was collected incorrectly
1. How does the machine learning tradition guard against overfitting?
   - Hold out test data, build on the training set, and judge on data the model has not seen
   - Keep the model small and specify it before looking at the data
   - Report a p-value for every coefficient
   - Refit the model until the training error reaches zero
1. Why do p-values not protect against overfitting?
   - A p-value assumes the model was chosen before seeing the data, so picking variables by p-value invalidates them
   - P-values only apply to categorical targets
   - P-values measure the size of an effect rather than its consistency
   - P-values are calculated on the test set rather than the training set
1. What does a small p-value tell you?
   - The relationship is probably not just noise
   - The effect is large
   - The effect is important to the business
   - One variable causes the other
1. A model predicts unpaid invoices well using customer zip code. What can you conclude?
   - Zip code is useful for prediction, but that is not evidence that changing it would change anything
   - Zip code causes customers to pay late
   - The model is overfit and should be discarded
   - Zip code should be removed because it is categorical
1. What is a confidence interval?
   - A plausible range for something we estimated
   - The share of predictions the model gets right
   - The gap between the training error and the test error
   - The probability that the model is correct
1. How does simulation express uncertainty?
   - Refit the model on many resamples of the data; the spread of those answers is the uncertainty
   - Derive a formula for the standard error algebraically
   - Add random noise to the predictions until they look plausible
   - Run the model on the test set several times
1. Your target is a number, such as days until payment. Which metrics fit?
   - RMSE and R²
   - Precision and recall
   - True positive and false positive counts
   - Accuracy and AUC
1. What is wrong with using "accuracy" as the general word for how good a model is?
   - Accuracy is one specific measure, and the right metric depends on the target
   - Accuracy applies only to numeric targets
   - Accuracy cannot be calculated on test data
   - Accuracy is another name for R²
1. When should you split the data into training and test sets?
   - Before looking at the test set, once the data is clean and features and a target are selected
   - After fitting the model, to check the result
   - Before cleaning the data, so cleaning does not bias the split
   - Only when the target is categorical
1. Why is repeating the fit-and-evaluate cycle many times a risk?
   - Every repetition is another chance to overfit
   - The training data shrinks with each pass
   - Parameters can only be estimated once
   - The p-values grow larger each time
1. What belongs in every format used to communicate a model's results?
   - What the model does not know, alongside what it predicts
   - The full feature engineering process
   - The code used to fit the model
   - The raw training data