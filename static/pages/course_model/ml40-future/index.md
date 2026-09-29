<script src="/course_model/toc.js"></script>

<script type="text/javascript">
  document.addEventListener("DOMContentLoaded", function() {
    window.MathJax = {
      tex: {
        inlineMath: {'[+]': [['$', '$']]}
      },
      svg: {
        fontCache: 'global'
      }
    };

    (function () {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@4/tex-svg.js';
      script.defer = true;
      document.head.appendChild(script);
    })();
  });
</script>

# Future topics

**Outcomes**:
- Differentiate between single models vs ensemble methods
- Describe modern ML pipelines
- Describe boosting
- Describe bagging
- Describe the Bayesian approach to modeling
- Describe the XGBoost algorithm 
- Define a hyperparameter and its role in model tuning

**Files**:
- [template](template.ipynb)


## Context 

Prior topics:
- OLS Regression → prediction of continuous outcomes
- Logistic Regression→ classification
- K-means → unsupervised segmentation
- Decision trees → interpretable nonlinear models
- Dimensionality reduction → unsupervised data simplification
- Neural Networks → flexible nonlinear models

Most modern machine learning methods are either extensions, combinations, or generalizations of these models.

## Hyperparameters

Hyperparameters are **configuration settings chosen before model training** that control how an algorithm learns, rather than what it learns from the data. Unlike model parameters (e.g., regression coefficients), which are estimated during training, hyperparameters are set by the analyst and shape the model’s behavior—such as complexity, flexibility, and sensitivity to noise. Examples include the number of trees in a random forest, the learning rate in boosting, the value of (k) in k-nearest neighbors, or the regularization strength in regression. Selecting appropriate hyperparameters is critical because poor choices can lead to overfitting or underfitting. In practice, they are tuned using systematic approaches like grid search or cross-validation, where different combinations are evaluated to identify the settings that produce the best out-of-sample performance. Conceptually, hyperparameters define the **learning strategy**, while the model parameters represent the **result of that strategy applied to data**.

## Pipelines

In modern analytics, a pipeline refers to a **structured sequence of data processing and modeling steps** that are executed together as a single workflow. Rather than treating tasks like data cleaning, feature engineering, model training, and evaluation as separate, manual steps, pipelines formalize them into a reproducible process. A typical pipeline might include imputation of missing values, scaling or encoding variables, dimensionality reduction (e.g., PCA), and then a predictive model (e.g., logistic regression or XGBoost). The key advantage is **consistency and integrity**: the exact same transformations applied during training are automatically applied to new data, which prevents issues like data leakage and inconsistent preprocessing. Pipelines also support **cross-validation and model tuning**, ensuring that all steps are evaluated together rather than in isolation. Conceptually, pipelines reflect how analytics is done in practice—less about individual algorithms, and more about **end-to-end systems that reliably produce predictions from raw data**.

## Ensemble Methods 

Combine multiple models to improve predictive performance.

Ensemble methods combine multiple models to produce a single, more accurate prediction. The underlying principle is that **a collection of models will outperform any individual model**, particularly when the individual models make different types of errors.

* Individual models are often noisy or unstable
* Averaging or combining them:

  * cancels out random errors
  * improves generalization

Ensemble methods represent a shift from:

* **finding the best single model** → **combining multiple models effectively**

They are central to modern analytics because they consistently deliver **strong predictive performance**, especially on real-world datasets.

### Main Approaches

#### 1. Bagging (Bootstrap Aggregation)

* Build many models independently on different random samples of the data
* Example: **Random Forests**
* Goal: **reduce variance**

#### 2. Boosting

* Build models sequentially, each correcting previous errors
* Example: **XGBoost**
* Goal: **reduce bias and improve accuracy**

#### 3. Stacking (less common at this level)

* Combine predictions from different model types using a meta-model



## Random Forests

Random forests are an **ensemble learning method** that builds on decision trees by combining many trees into a single predictive model. The core idea is straightforward: instead of relying on one tree (which can be unstable and prone to overfitting), a random forest aggregates the predictions of **many slightly different trees** to produce a more reliable result.

A single decision tree is highly sensitive to the data used to build it. Small changes in the dataset can produce very different trees. Random forests address this instability by introducing **two types of randomness**:

1. **Bootstrap Sampling (Bagging)**
   Each tree is trained on a different random sample of the data (with replacement).

2. **Random Feature Selection**
   At each split, the algorithm considers only a random subset of variables rather than all variables.

The final prediction is then:

* **Regression** → average of all trees
* **Classification** → majority vote across trees

### How the Algorithm Works (Step-by-Step)

1. Draw a bootstrap sample from the dataset
2. Grow a decision tree:
   * At each split, randomly select a subset of predictors
   * Choose the best split from that subset
   * Grow the tree fully (typically without pruning)
3. Repeat this process many times (e.g., 100–500 trees)
4. Aggregate predictions across all trees

Averaging many “noisy but unbiased” models produces a more stable prediction.

### Key Advantages

* Often performs very well on structured/tabular data
* Less prone to overfitting than a single tree

### Limitations

* Unlike a single decision tree, the model is not easily visualized
* Becomes a “black box” relative to simpler methods
* Training hundreds of trees increases runtime and memory usage
* Adding more trees eventually yields little improvement


### Comparison to Decision Trees

| Feature          | Decision Tree | Random Forest |
| ---------------- | ------------- | ------------- |
| Stability        | Low           | High          |
| Overfitting      | Common        | Reduced       |
| Interpretability | High          | Low           |
| Accuracy         | Moderate      | High          |


Random forests are best understood as:

> “A controlled way of building many different decision trees and averaging them to improve reliability.”

They are particularly effective when:

* The dataset has many predictors
* Relationships are nonlinear
* Prediction accuracy matters more than interpretability


### Position in the Modeling Landscape

Random forests represent a transition point in analytics:

* Before: simple, interpretable models (OLS, trees)
* After: more complex, performance-driven models (boosting, neural networks)

They are often a **default starting point** in modern analytics workflows because they balance:

* ease of use
* strong performance
* relatively low tuning requirements

## XGBoost (Extreme Gradient Boosting)

XGBoost is a high-performance **gradient boosting** algorithm that builds a model by adding decision trees **sequentially**, where each new tree is trained to correct the errors of the previous ones.

Instead of averaging many independent trees (as in random forests), XGBoost builds trees **one at a time**, focusing on residual errors. Each new tree improves the model by learning what prior trees missed.

It is often the **top-performing choice for tabular business data**, but requires more careful tuning than simpler ensemble methods.

### Key Features

* **Sequential learning**: each tree targets remaining error
* **Gradient optimization**: uses derivatives to minimize loss efficiently
* **Regularization**: controls overfitting (penalizes overly complex trees)
* **Shrinkage (learning rate)**: slows learning to improve generalization

### Why It Performs Well

* Captures complex nonlinear relationships
* Handles interactions automatically
* Often achieves **state-of-the-art performance on structured data**

### Comparison to Random Forests

| Aspect              | Random Forest   | XGBoost                   |
| ------------------- | --------------- | ------------------------- |
| Tree building       | Independent     | Sequential                |
| Goal                | Reduce variance | Reduce bias + variance    |
| Overfitting control | Averaging       | Regularization + tuning   |
| Performance         | Strong          | Often superior (if tuned) |

### Limitations

* More sensitive to parameter tuning
* Higher risk of overfitting if misconfigured
* Less interpretable than simpler models



## Bayesian Methods

Bayesian approaches are built on the idea that **probability represents a degree of belief**, not just long-run frequency. Instead of estimating a single “best” parameter (as in OLS or logistic regression), Bayesian methods treat parameters themselves as **random variables with distributions**.

The core mechanism is updating beliefs with data:

$$P(\theta \mid D) = \frac{P(D \mid \theta) \, P(\theta)}{P(D)}$$

* $P(\theta)$: **Prior** (what you believe before seeing data)
* $P(D \mid \theta)$: **Likelihood** (how probable the data is given parameters)
* $P(\theta \mid D)$: **Posterior** (updated belief after seeing data)


Frequentist methods ask:

  > “What would happen if we repeated this process many times?”

Bayesian methods ask:

  > “Given what we know, what should we believe now?”

In practice, modern analytics increasingly blends both perspectives, but Bayesian thinking is especially valuable when **uncertainty, judgment, and updating over time** are central to the problem.


### Key Features of Bayesian Methods

1. Parameters Are Distributions, Not Points

* Instead of estimating $\hat{\beta} = 2.3$, you estimate a **distribution over $\beta$**
* This directly captures uncertainty

2. Incorporation of Prior Information

* You can formally include:
  * expert knowledge
  * historical data
  * institutional constraints

3. Probabilistic Interpretation

* Statements like:
  * "There is a 95% probability that $\beta$ is between X and Y"
* This is fundamentally different from frequentist confidence intervals

4. Sequential Learning

* Naturally suited for:

  * real-time systems
  * streaming data
  * adaptive decision-making

### Common Bayesian Models 

* Bayesian regression → extension of OLS
* Bayesian logistic regression → extension of classification models
* Naive Bayes classifier → simple probabilistic classification model
* Bayesian networks → probabilistic dependency structures

