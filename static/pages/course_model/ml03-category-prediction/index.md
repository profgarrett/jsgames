# Predicting Categories (Classification Task)

Some models predict a yes/no (categorical) variable. This is called *classification*.  We typically use it for comparing a prediction against actual results. For example, how well does our model predict which students will pass a class?

**Outcomes**:
- Create a confusion matrix
- Measure accuracy, precision, and recall
- Pick the most appropriate metric for your situation

**Links**
- [Is Susan pregnant?](susanpregnancy.docx)
- [Nice graphic](https://encord.com/glossary/confusion-matrix/)
- [ROC curve and AUC](https://mlu-explain.github.io/roc-auc/)
- [Precision and Recall](https://mlu-explain.github.io/precision-recall/)


## Confusion Matrix

Imagine we are a hunter. We see a gray shape, and decide that it's a deer. Or, we see a shape and decide it's Kermit the frog. Do we shoot or do we hold our fire? 

![Deer versus Kermit](deer_vs_kermit.png)

A confusion matrix compares our prediction against reality.  The first word is whether you were **right**, and the the second word is what you **predicted**.

- **True Positive** a deer, and you thought deer. You take the shot and eat well.
- **True Negative** Kermit, and you thought Kermit. You hold your fire.
- **False Positive** Kermit, but you thought deer. You shoot a hiker. Also called a **Type I error**, or a false alarm.
- **False Negative** a deer, but you thought Kermit. You go hungry. Also called a **Type II error**, or a miss.


|                   | Predicted Positive, think yes deer | Predicted Negative, think no deer |
| ----------------- | ---------------------------------- | --------------------------------- |
| Reality = Deer   | True Positive (TP)                 | False Negative (FN)               |
| Reality = Kermit | False Positive (FP)                | True Negative (TN)                |


Importantly, the two errors are not the same.  A false positive means we shot a beloved Muppet. But, in another scenario, we may want to prioritize False Negatives. For example, if we are screening for cancer, a false negative means we missed a patient who needs treatment. A false positive means we sent a healthy patient for more tests. The cost of each error is different, and that is why we need to measure both.

### When accuracy misleads

Accuracy is the percentage of correct predictions out of all predictions (TP + TN) / (TP + TN + FP + FN). It intuitive but problematic. 

Suppose 10 of 1,000 transactions are fraud, and your model simply predicts "not fraud" every time. It would have 99% accuracy!  This is the **accuracy paradox**. We need other measures to evaluate model success.

## Metrics

We use several metrics to evaluate a model:

- *Accuracy*: (TP + TN) / (TP + TN + FP + FN)
   - The proportion of correct predictions (both true positives and true negatives) out of all of our data.
   - It asks: how often were we entirely right?
- *Precision*: TP / (TP + FP)
   - The proportion of true positive predictions out of all positive predictions
   - It uses the predicted-positive *column*. 
   - Precision is a question about your predictions
   - It asks: when we shot, how often was it a deer?
- *Recall* (Sensitivity): TP / (TP + FN)
  - The proportion of true positive predictions out of all actual positive cases
  - It uses the actual-positive *row*. 
  - Recall is a question about reality
  - It asks: of all deer, how many did we shoot?
- *Specificity*: TN / (TN + FP)
  - The proportion of actual negatives correctly identified. 
  - Recall is specificity's mirror image, one measured on each row of the matrix.
- *F1 score*: 2 × (Precision × Recall) / (Precision + Recall)
  - A single number balancing precision and recall. It uses the harmonic mean rather than a simple average, so a model that scores 1.0 on one and 0.0 on the other gets an F1 of 0, not 0.5.


### Tradeoffs

There are tradeoffs between our metrics.

For example, consider precision and recall. For example, if we want to be very sure we are only shooting deer (high precision), we may miss some deer (low recall). Conversely, if we want to make sure we shoot all the deer (high recall), we may accidentally shoot Kermit (low precision).

You can always push either metric to 1.0 by being extreme.

- **Perfect recall** is when you call everything positive. You catch every deer, because you shoot at everything. Recall = 100%, precision in the basement.
- **Perfect precision** is when you only call positive when you are absolutely certain. Shoot once all season, at an unmistakable deer. Precision = 100%, recall near zero.

Any single metric can be gamed.


### Choosing the Right Metric

The question is never "which metric is best?" It is "which error costs more?"

| Situation | Costly error | Optimize for |
|---|---|---|
| Cancer screening | Missing a sick patient (FN) | Recall |
| Spam filter | Sending a real email to junk (FP) | Precision |
| Fraud flagging for review | Missing fraud (FN) | Recall |
| Automatically freezing accounts | Freezing an innocent customer (FP) | Precision |
| Balanced classes, symmetric costs | Neither dominates | Accuracy or F1 |



```python
## Building metrics in Python
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.metrics import confusion_matrix, confusion_matrix_at_thresholds
from sklearn.metrics import classification_report, ConfusionMatrixDisplay

# Create a new table showing reality and predictions
df = pd.DataFrame({
    'actual': ['deer', 'deer', 'deer', 'deer', 'deer', 'deer', 'deer', 'a kermit', 'a kermit', 'a kermit'], 
    'green': [0, 0.2, 0.2, 0.4, .6, 0.8, 0.9, 0.2, 0.6, 1],
    'noise': [0, 0.1, 0.1, 0.1, 0.2, 0.2, 1, 0.2, 0.8, 0.9 ]})

# Create a new column with the predicted values based on a threshold of 0.5
GREEN_THRESHOLD = 0.5
df = df.assign( predicted = df['green'].apply(lambda x: 'a kermit' if x > GREEN_THRESHOLD else 'deer'))

# Show a table with the results of the predictions (TP, FP, TN, FN)
df = df.assign( result = df.apply(lambda x: 'TP' if x['actual'] == 'deer' and x['predicted'] == 'deer' else (
    'FP' if x['actual'] == 'a kermit' and x['predicted'] == 'deer' else (
    'TN' if x['actual'] == 'a kermit' and x['predicted'] == 'a kermit' else (
    'FN'))), axis=1))

# Print a count of each result
print(df['result'].value_counts())

df
```

    result
    TP    4
    FN    3
    TN    2
    FP    1
    Name: count, dtype: int64





<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>actual</th>
      <th>green</th>
      <th>noise</th>
      <th>predicted</th>
      <th>result</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>deer</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>deer</td>
      <td>TP</td>
    </tr>
    <tr>
      <th>1</th>
      <td>deer</td>
      <td>0.2</td>
      <td>0.1</td>
      <td>deer</td>
      <td>TP</td>
    </tr>
    <tr>
      <th>2</th>
      <td>deer</td>
      <td>0.2</td>
      <td>0.1</td>
      <td>deer</td>
      <td>TP</td>
    </tr>
    <tr>
      <th>3</th>
      <td>deer</td>
      <td>0.4</td>
      <td>0.1</td>
      <td>deer</td>
      <td>TP</td>
    </tr>
    <tr>
      <th>4</th>
      <td>deer</td>
      <td>0.6</td>
      <td>0.2</td>
      <td>a kermit</td>
      <td>FN</td>
    </tr>
    <tr>
      <th>5</th>
      <td>deer</td>
      <td>0.8</td>
      <td>0.2</td>
      <td>a kermit</td>
      <td>FN</td>
    </tr>
    <tr>
      <th>6</th>
      <td>deer</td>
      <td>0.9</td>
      <td>1.0</td>
      <td>a kermit</td>
      <td>FN</td>
    </tr>
    <tr>
      <th>7</th>
      <td>a kermit</td>
      <td>0.2</td>
      <td>0.2</td>
      <td>deer</td>
      <td>FP</td>
    </tr>
    <tr>
      <th>8</th>
      <td>a kermit</td>
      <td>0.6</td>
      <td>0.8</td>
      <td>a kermit</td>
      <td>TN</td>
    </tr>
    <tr>
      <th>9</th>
      <td>a kermit</td>
      <td>1.0</td>
      <td>0.9</td>
      <td>a kermit</td>
      <td>TN</td>
    </tr>
  </tbody>
</table>
</div>




```python
# Create a confusion matrix
#   actual values
#   predicted values
#   labels: gives a sort order of classes. 
#       In this case, we want to see the confusion matrix for the "deer" class (1) first,
#       followed by the "a kermit" class (0).
#   normalize: None or 'all' 
#       None is raw counts, 'all' is percentages.
cm = confusion_matrix(df['actual'], df['predicted'], 
    labels=['deer', 'a kermit'],
    normalize = None)

# Printing cm doesn't include any labels.
print(cm)

# Confusion matrix display is a prettier version
# However, note that it doesn't include the labels in the confusion matrix itself, so you have to pass them in separately.
# You must make sure that the labels match the order of the classes in the confusion matrix.
ConfusionMatrixDisplay(
    confusion_matrix=cm, 
    display_labels=['a normal deer', 'Kermit the frog']
).plot()
```

    [[4 3]
     [1 2]]





    <sklearn.metrics._plot.confusion_matrix.ConfusionMatrixDisplay at 0x119211cd0>




    
![png](index_files/index_3_2.png)
    



```python
# Print a classification report, which includes precision, recall, and F1 score for each class.
# Note that this is treating each class as a separate prediction task.
# This is useful when we're doing predictions for multiple classes,
#  and we want to see how well the model is doing for each class.
print(classification_report(df['actual'], df['predicted']))

```

                  precision    recall  f1-score   support
    
        a kermit       0.40      0.67      0.50         3
            deer       0.80      0.57      0.67         7
    
        accuracy                           0.60        10
       macro avg       0.60      0.62      0.58        10
    weighted avg       0.68      0.60      0.62        10
    


## Thresholds, ROC, and AUC

Most classifiers do not actually output a category. They output a **probability**, and a threshold converts it into a yes or no. The default threshold is 0.5, but nothing requires that. Moving the threshold is how you trade precision against recall in practice.

### The ROC curve

Because a single confusion matrix only describes one threshold, we need a way to evaluate a model across all of them. The **ROC curve** (Receiver Operating Characteristic) plots recall on the y-axis against the false positive rate on the x-axis, sweeping the threshold from high to low:

- **True positive rate (recall)** = TP / (TP + FN) — the deer you shot
- **False positive rate** = FP / (FP + TN) = 1 − specificity — times you shot Kermit the frog

Each point on the curve is one threshold's confusion matrix. A model that separates the classes well rises steeply toward the top-left corner, gaining recall before it starts accumulating false positives.

The ROC curve is about the threshold, not the model. It is a way to visualize the tradeoff between precision and recall as you move the threshold.

### AUC 

What if we have multiple models? An easy way to compare them is to plot their ROC curves, and measure the total **Area Under the Curve** (AUC). AUC can be defined as the probability that a randomly chosen positive case scores higher than a randomly chosen negative case. 

AUC is a number between 0 and 1, with higher numbers showing better performance:

- **1.0** perfect separation; every positive scored higher than every negative
- **0.9** excellent
- **0.8** good
- **0.7** fair
- **0.5** no better than a coin flip, the diagonal line on the plot
- **below 0.5** worse than guessing, which usually means your labels are reversed

The advantage of AUC is that it is threshold-independent, so it measures how well the model *ranks* cases rather than how well one particular cutoff performs.


```python
df
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>actual</th>
      <th>green</th>
      <th>predicted</th>
      <th>result</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>deer</td>
      <td>0.0</td>
      <td>deer</td>
      <td>TP</td>
    </tr>
    <tr>
      <th>1</th>
      <td>deer</td>
      <td>0.2</td>
      <td>deer</td>
      <td>TP</td>
    </tr>
    <tr>
      <th>2</th>
      <td>deer</td>
      <td>0.2</td>
      <td>deer</td>
      <td>TP</td>
    </tr>
    <tr>
      <th>3</th>
      <td>deer</td>
      <td>0.4</td>
      <td>deer</td>
      <td>TP</td>
    </tr>
    <tr>
      <th>4</th>
      <td>deer</td>
      <td>0.6</td>
      <td>a kermit</td>
      <td>FN</td>
    </tr>
    <tr>
      <th>5</th>
      <td>deer</td>
      <td>0.8</td>
      <td>a kermit</td>
      <td>FN</td>
    </tr>
    <tr>
      <th>6</th>
      <td>deer</td>
      <td>0.9</td>
      <td>a kermit</td>
      <td>FN</td>
    </tr>
    <tr>
      <th>7</th>
      <td>a kermit</td>
      <td>0.2</td>
      <td>deer</td>
      <td>FP</td>
    </tr>
    <tr>
      <th>8</th>
      <td>a kermit</td>
      <td>0.6</td>
      <td>a kermit</td>
      <td>TN</td>
    </tr>
    <tr>
      <th>9</th>
      <td>a kermit</td>
      <td>1.0</td>
      <td>a kermit</td>
      <td>TN</td>
    </tr>
  </tbody>
</table>
</div>




```python
import numpy as np
from sklearn.metrics import precision_score, recall_score, roc_curve, roc_auc_score, RocCurveDisplay

# plot a roc curve from our deer and Kermit predictions
#   y_true: the actual values
#   y_score: the predicted probabilities for the positive class (deer). Number!!! Not your class prediction
#   pos_label: the label of the positive class (deer)
#   name: the name of the curve, which will be displayed in the legend
RocCurveDisplay.from_predictions(
        y_true = df['actual'], 
        y_score = df['green'], 
        pos_label='a kermit',
        name='ROC curve for kermit',
    )
```




    <sklearn.metrics._plot.roc_curve.RocCurveDisplay at 0x116210f30>




    
![png](index_files/index_7_1.png)
    


### Try it: the hunter's confidence

The forest below has 25 fixed animals -- the same ones for everyone, so a class can compare notes. Each one has a hidden confidence score, exactly what a model like the ones above would output. Drag the slider to set how confident the hunter needs to be before pulling the trigger, and watch accuracy, precision, recall, specificity, and F1 update, along with where that threshold lands on the ROC curve.

The equipment picker is a separate question from the threshold. It swaps in a different model entirely -- same 25 animals, same true species, but a different confidence score for each one -- so you can see how model quality itself changes the ROC curve and the AUC, independent of where you set the trigger.

```widget-hunter-confidence
```


## Sources

- Kermit: https://en.wikipedia.org/wiki/Kermit_the_Frog#/media/File:Kermit_puppet.jpg
- Deer: https://en.wikipedia.org/wiki/Deer#/media/File:White-tailed_deer.jpg

## Key Terms

- **Classification**: Predicting which category a case belongs to, rather than a numeric value
- **Positive class**: The outcome you are trying to detect, such as fraud or disease
- **Confusion matrix**: A table comparing predicted categories against actual categories
- **True Positive (TP)**: Predicted positive, and actually positive
- **True Negative (TN)**: Predicted negative, and actually negative
- **False Positive (FP)**: Predicted positive, but actually negative — a false alarm
- **False Negative (FN)**: Predicted negative, but actually positive — a miss
- **Accuracy**: The share of all predictions that were correct
- **Precision**: Of the cases predicted positive, the share that really were positive
- **Recall (sensitivity)**: Of the cases that really were positive, the share the model caught
- **Specificity**: Of the cases that really were negative, the share the model correctly cleared
- **F1 score**: The harmonic mean of precision and recall, used when you need one number
- **Class imbalance**: When one outcome is far more common than the other
- **Accuracy paradox**: High accuracy achieved by always predicting the majority class
- **Threshold**: The cutoff probability at which a prediction is called positive
- **ROC curve**: A plot of recall against the false positive rate across every threshold
- **AUC**: The area under the ROC curve, summarizing performance across all thresholds


## Practice Questions

1. What kind of variable does a classification model predict?
   - A category, such as yes/no
   - A continuous number, such as price
   - A date
   - A probability distribution's variance
1. In a confusion matrix, what does a False Positive mean?
   - The model predicted positive, but the actual value was negative
   - The model predicted negative, but the actual value was positive
   - The model predicted negative, and the actual value was negative
   - The model predicted positive, and the actual value was positive
1. A hunter's model says "deer" when the shape is actually Kermit. Which cell is this?
   - False Positive
   - False Negative
   - True Positive
   - True Negative
1. A hunter's model says "Kermit" when the shape is actually a deer. Which cell is this?
   - False Negative
   - False Positive
   - True Negative
   - True Positive
1. In a fraud model, which outcome should be labeled the positive class?
   - Fraud, because it is the outcome you are trying to detect
   - Ok, because it is the more common outcome
   - Whichever appears first alphabetically
   - Whichever is more desirable in real life
1. What is the formula for accuracy?
   - (TP + TN) / (TP + TN + FP + FN)
   - TP / (TP + FP)
   - TP / (TP + FN)
   - TN / (TN + FP)
1. What is the formula for precision?
   - TP / (TP + FP)
   - TP / (TP + FN)
   - (TP + TN) / (TP + TN + FP + FN)
   - TN / (TN + FP)
1. What is the formula for recall?
   - TP / (TP + FN)
   - TP / (TP + FP)
   - TN / (TN + FP)
   - (TP + TN) / (TP + TN + FP + FN)
1. Which question does precision answer?
   - When the model predicted positive, how often was it right?
   - Of all the actual positives, how many did the model catch?
   - How often was the model right about anything?
   - How many negatives did the model correctly clear?
1. Which question does recall answer?
   - Of all the actual positives, how many did the model catch?
   - When the model predicted positive, how often was it right?
   - How often was the model right about anything?
   - How many predictions did the model make in total?
1. What is another name for recall?
   - Sensitivity
   - Specificity
   - Precision
   - Support
1. What does specificity measure?
   - The share of actual negatives correctly identified
   - The share of actual positives correctly identified
   - The share of positive predictions that were correct
   - The share of all predictions that were correct
1. In the fraud example (TP=2, FN=1, FP=2, TN=1), what is the accuracy?
   - 50%
   - 67%
   - 33%
   - 75%
1. In the fraud example (TP=2, FN=1, FP=2, TN=1), what is the precision?
   - 50%
   - 67%
   - 33%
   - 100%
1. In the fraud example (TP=2, FN=1, FP=2, TN=1), what is the recall?
   - 67%
   - 50%
   - 33%
   - 100%
1. What is the F1 score?
   - The harmonic mean of precision and recall
   - The simple average of precision and recall
   - Accuracy adjusted for class imbalance
   - The area under the ROC curve
1. Why does F1 use the harmonic mean rather than a simple average?
   - So a model that scores 1.0 on one metric and 0.0 on the other gets 0, not 0.5
   - Because it is faster to compute
   - Because precision is always larger than recall
   - So the result is always above 0.5
1. A model predicts "not fraud" for all 1,000 transactions, 10 of which are fraud. What is its accuracy?
   - 99%
   - 0%
   - 50%
   - 1%
1. In that same model, what is the recall?
   - 0%
   - 99%
   - 50%
   - 100%
1. What is the accuracy paradox?
   - A useless model can score high accuracy by always predicting the majority class
   - Accuracy decreases as a model improves
   - Precision and recall cannot both be high
   - Accuracy is undefined when classes are balanced
1. Which metric is least trustworthy when one class is very rare?
   - Accuracy
   - Recall
   - Precision
   - F1
1. How can a model achieve 100% recall?
   - By predicting positive for every case
   - By predicting negative for every case
   - By predicting positive only when certain
   - By balancing the classes first
1. For a cancer screening test, which metric matters most?
   - Recall, because missing a sick patient is the costly error
   - Precision, because a false alarm is the costly error
   - Specificity, because most patients are healthy
   - Accuracy, because it uses all four cells
1. For a spam filter, which metric matters most?
   - Precision, because sending a real email to junk is the costly error
   - Recall, because missing spam is the costly error
   - Accuracy, because spam and real mail are balanced
   - Support, because it counts the messages
1. Why might two fraud models call for different metrics?
   - Because the cost of a false positive depends on what the prediction triggers
   - Because fraud rates differ by industry
   - Because one uses a confusion matrix and one does not
   - Because precision is undefined for some models
1. What does the "support" column in `classification_report()` show?
   - The number of actual cases in each class
   - The confidence of the model's predictions
   - The number of features used
   - The threshold applied to each class
1. Most classifiers actually output what, before a category is assigned?
   - A probability, converted to a category by a threshold
   - A confusion matrix
   - An accuracy score
   - A category directly, with no intermediate step
1. What happens when you raise the classification threshold from 0.5 to 0.7?
   - Precision generally rises and recall generally falls
   - Precision generally falls and recall generally rises
   - Both rise
   - Neither changes, since the model is unchanged
1. What does the ROC curve plot?
   - Recall against the false positive rate, across all thresholds
   - Precision against recall, at a fixed threshold
   - Accuracy against the number of predictions
   - True positives against true negatives
1. What is the false positive rate equal to?
   - 1 − specificity
   - 1 − recall
   - 1 − precision
   - 1 − accuracy
1. What does an AUC of 0.5 indicate?
   - The model performs no better than a coin flip
   - The model is perfect
   - Half of the predictions were positive
   - The classes are perfectly balanced
1. How can you interpret an AUC of 0.81?
   - A randomly chosen positive case scores higher than a randomly chosen negative case about 81% of the time
   - The model is correct on 81% of predictions
   - 81% of positive cases were caught
   - 81% of positive predictions were correct
1. What is the main advantage of AUC over accuracy?
   - It evaluates the model across all thresholds rather than just one
   - It is always higher than accuracy
   - It does not require a confusion matrix
   - It works on continuous target variables
1. An AUC below 0.5 usually indicates what?
   - Something is wrong, often reversed labels
   - An unusually difficult dataset
   - A perfectly calibrated model
   - Too few positive cases to evaluate
