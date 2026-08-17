<script src="/course_model/toc.js"></script>

# Modeling to predict the future

Our prior course focused on visualizations as a means to understand. This course builds on that concept, but mainly focuses on creating models. A model is a simplified version of the real-world, expressed in mathematical terms (i.e., y = x + 1).

**Outcomes**
- Define key terms
- Compare statistical modeling v. machine learning
- Explain p-values and confidence intervals (traditional statistical approach)
- Simulate values and measure the results (modern machine-learning approach)

**Links**
- [Template](template.ipynb)
- [Quizlet terms](https://quizlet.com/1123323618/ml01-modeling-to-predict-the-future-flash-cards/)

## Key Terms

- **Independent variables**: the variables we use to predict the target (also called features or predictors)
- **Dependent variable**: the variable we want to predict (also called target or outcome) 
- **Model**: a mathematical representation of the relationship between independent variables and the dependent variable. In its simplest form, y = x.

## Approaches to Model Building

We have two different approaches to building a model:

- **Statistical modeling**: build understandable relationships between variables to understand the data
- **Machine learning**: build complex models that learn on their own from large datasets

Statistical modeling aims to understand relationships and test hypotheses, while machine learning aims to make accurate predictions regardless of interpretability.

- **Data Size**: statistical modeling often works with smaller datasets, while machine learning typically requires larger datasets.
- **Model Complexity**: statistical models are often simpler and more interpretable, while machine learning models can be more complex and less interpretable.

After we create a model, we want to evaluate its performance:

- **Accuracy**: how well does the model predict the target variable
- **Generalizability**: how well does the model perform on new data, not just the data it was trained on. This is the concept of *overlearning* - memorizing the data instead of learning patterns.
	- We avoid overlearning  by using test/train splits in ML, or with p-values in traditional statistical modeling.


## EDA Process

The EDA process (exploratory data analysis) is similar for both statistical modeling and machine learning. This is covered in our prior class, see [EDA Chapter](https://profgarrett.github.io/course_dv/dv01-eda/). If you did not take the class with me, please go back and review the data structure chapter.

We follow these steps:

- Load dataset 
- One a time, clean fields by:
  - Understanding data structure (wide, long, roll-up, aggregated, longitudinal, cross-sectional)
  - Clean field
    - Check data type
    - Find missing values, duplicates
  - Visualize distribution (find outliers)
  - Visualize relationships between variables

Once the data is clean, we can build a model:

- Select features (independent variables) and target (dependent variable)
- *If using ML*, split data into training and testing sets 
- Create a model 
- Evaluate the model
- If needed, repeat the process.

Finally, we communicate our results:

- Presentation
- Written memo
- Poster


