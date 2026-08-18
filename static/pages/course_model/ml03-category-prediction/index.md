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

Measuring error is done with a confusion matrix. This compares predicted values against actual values.

As an example, imagine we are a hunter trying to find deer in the forest. Are we looking at a deer (positive) or a person (negative)?

Our model can be very simple, if we see something gray, it's a deer. If we see something else, it's a person. How well does this model work?

|                   | Predicted Positive, think yes deer | Predicted Negative, think no deer |
| ----------------- | ---------------------------------- | --------------------------------- |
| Positive = Deer   | True Positive (TP)                 | False Negative (FN)               |
| Negative = Person | False Positive (FP)                | True Negative (TN)                |

### Reading the four cells

Every prediction lands in exactly one cell. The first word is whether you were **right**, and the the second word is what you **predicted**.

- **True Positive** a deer, and you thought deer. You take the shot and eat well.
- **True Negative** a person, and you thought person. You hold your fire.
- **False Positive** a person, but you thought deer. You shoot a hiker. Also called a Type I error, or a false alarm.
- **False Negative** a deer, but you thought person. You go hungry. Also called a Type II error, or a miss.

The two errors are not equally bad here.  A model with a handful of false negatives is a bad hunting trip. A model with one false positive is a manslaughter charge.

### Choosing the positive class

Before you can build a confusion matrix, you have to decide which outcome is "positive." Positive does not mean good — it means the thing you are trying to detect. Fraud is positive. Disease is positive. Dropping out is positive.

### Building one in Python

```python
from sklearn.metrics import confusion_matrix

# 1 = fraud (positive), 0 = ok (negative)
actual    = [1, 1, 1, 0, 0, 0]
predicted = [1, 1, 0, 1, 1, 0]

print(confusion_matrix(actual, predicted))
# [[1 2]
#  [1 2]]
```

**Watch the layout.** Scikit-learn sorts the labels ascending, so 0 (negative) comes first. Its default output is arranged as:

|                | Predicted 0 | Predicted 1 |
| -------------- | ----------- | ----------- |
| **Actual 0**   | TN          | FP          |
| **Actual 1**   | FN          | TP          |

That is the opposite corner from the table above, where positive comes first. Both are correct; they are just different conventions. Unpack the values by name so you never have to guess:

```python
tn, fp, fn, tp = confusion_matrix(actual, predicted).ravel()
print(tn, fp, fn, tp)      # 1 2 1 2
```

To match the course table, ask for positive first:

```python
print(confusion_matrix(actual, predicted, labels=[1, 0]))
# [[2 1]     TP FN
#  [2 1]]    FP TN
```


## Measuring Accuracy, Precision, and Recall


From this, we can calculate several metrics to evaluate our model:
- *Accuracy*: (TP + TN) / (TP + TN + FP + FN)
  - The proportion of correct predictions (both true positives and true negatives) out of all predictions
- *Precision*: TP / (TP + FP)
  - The proportion of true positive predictions out of all positive predictions
- *Recall* (Sensitivity): TP / (TP + FN)
  - The proportion of true positive predictions out of all actual positive cases

Two more that round out the set:

- *Specificity*: TN / (TN + FP)
  - The proportion of actual negatives correctly identified. Recall is specificity's mirror image, one measured on each row of the matrix.
- *F1 score*: 2 × (Precision × Recall) / (Precision + Recall)
  - A single number balancing precision and recall. It uses the harmonic mean rather than a simple average, so a model that scores 1.0 on one and 0.0 on the other gets an F1 of 0, not 0.5.

### Reading the formulas

Notice which part of the matrix each metric looks at, because that is what makes them memorable:

- **Accuracy** uses all four cells. It asks: how often were we right about anything?
- **Precision** uses the predicted-positive *column*. It asks: when we raised the alarm, how often was it real?
- **Recall** uses the actual-positive *row*. It asks: of everything we should have caught, how much did we catch?

Precision is a question about your predictions. Recall is a question about reality. They have the same numerator (TP) and different denominators, which is why improving one usually costs you the other.

### In code

```python
from sklearn.metrics import (accuracy_score, precision_score,
                             recall_score, f1_score, classification_report)

actual    = [1, 1, 1, 0, 0, 0]
predicted = [1, 1, 0, 1, 1, 0]

print(accuracy_score(actual, predicted))    # 0.5
print(precision_score(actual, predicted))   # 0.5
print(recall_score(actual, predicted))      # 0.6666666666666666
print(f1_score(actual, predicted))          # 0.5714285714285715
```

`classification_report()` gives all of it at once, broken out per class:

```python
print(classification_report(actual, predicted, target_names=['Ok', 'Fraud']))
#               precision    recall  f1-score   support
#
#           Ok       0.50      0.33      0.40         3
#        Fraud       0.50      0.67      0.57         3
#
#     accuracy                           0.50         6
```

The "support" column is the number of actual cases in each class — worth checking first, because a metric computed on 3 cases means very little.

### The tradeoff

There are tradeoffs between precision and recall. For example, if we want to be very sure we are only shooting deer (high precision), we may miss some deer (low recall). Conversely, if we want to make sure we shoot all the deer (high recall), we may accidentally shoot some people (low precision).

You can always push either metric to 1.0 by being extreme.

- **Perfect recall** is when you call everything positive. You catch every deer, because you shoot at everything. Recall = 100%, precision in the basement.
- **Perfect precision** is when you only call positive when you are absolutely certain. Shoot once all season, at an unmistakable deer. Precision = 100%, recall near zero.

Any single metric can be gamed.

### When accuracy misleads

Accuracy is the most intuitive metric and the most dangerous one, because a rare positive class lets a useless model score well. Suppose 10 of 1,000 transactions are fraud, and your model simply predicts "not fraud" every time:

```python
import numpy as np
from sklearn.metrics import accuracy_score, recall_score, confusion_matrix

actual = np.array([1]*10 + [0]*990)
lazy   = np.zeros(1000, dtype=int)      # predict "not fraud" for everyone

print(accuracy_score(actual, lazy))                    # 0.99
print(recall_score(actual, lazy, zero_division=0))     # 0.0

print(confusion_matrix(actual, lazy))
# [[990   0]
#  [ 10   0]]
```

99% accuracy, and the model caught zero fraudsters. This is the **accuracy paradox**, and it is why accuracy is nearly worthless on imbalanced data. The confusion matrix shows that an entire column is zero.


## Example : Fraud Prediction

Imagine we are predicting which people are fraudsters

We have 6 people:

- A Fraudster, Predicted Fraudster (success!)
- B Fraudster, Predicted Fraudster (success!)
- C Fraudster, Not predicted
- D Ok, Predicted Fraudster
- E Ok, Predicted Fraudster
- F Ok, Not predicted (success!)

This translates to the confusion matrix:

| Matrix             | Predicted Fraud   | Predicted Ok |
| ------------------ | ----------------- | ---------------- |
| Positive = Fraud   | A, B (TP)         | C (FN)           |
| Negative = Ok      | D, E (FP)         | F (TN)           |


From this, we can calculate:

- Accuracy
  - Correctly classified / all cases
  - (3 including A, B, & F) / 6 = 50% accuracy
- Precision:
  - Predicted Correctly / Predicted
  - (A, B) / (A, B, D, E) = 2 / 4 = 50% precision
- Recall
  - Predicted Correctly / All fraudsters
  - (A, B) / (A, B, C) = 2/3 = 67% recall

Two more from the same table:

- Specificity
  - Correctly cleared / all innocent people
  - (F) / (D, E, F) = 1/3 = 33% specificity
- F1
  - 2 × (0.50 × 0.67) / (0.50 + 0.67) = 57%

### What the numbers tell us

Read together, they describe a specific failure. Recall of 67% says we caught most fraudsters. Precision of 50% says half the people we accused were innocent. Specificity of 33% says we cleared only one of three innocent people.

This model is aggressive: it accuses too readily. Whether that is acceptable depends entirely on what happens next. If the "prediction" flags an account for a two-minute review, false positives are cheap and you would take this trade. If it freezes a customer's account, you have a serious problem, and you would want to raise the threshold and buy precision at the cost of recall.


## Choosing the Right Metric

The question is never "which metric is best?" It is "which error costs more?"

| Situation | Costly error | Optimize for |
|---|---|---|
| Cancer screening | Missing a sick patient (FN) | Recall |
| Spam filter | Sending a real email to junk (FP) | Precision |
| Fraud flagging for review | Missing fraud (FN) | Recall |
| Automatically freezing accounts | Freezing an innocent customer (FP) | Precision |
| Balanced classes, symmetric costs | Neither dominates | Accuracy or F1 |

Two rules that cover most cases:

- **Prioritize recall when a miss is expensive.** A cancer screen that misses a tumor costs a life; a false alarm costs a follow-up test.
- **Prioritize precision when a false alarm is expensive.** A spam filter that eats a job offer has failed, even if it catches every advertisement.

Notice the fraud example appears twice in the table with opposite answers. The same model and the same data can call for different metrics depending on what the prediction triggers. Ask what happens to the person on the other end of a false positive.


## Thresholds, ROC, and AUC

Most classifiers do not actually output a category. They output a **probability**, and a threshold converts it into a yes or no. The default threshold is 0.5, but nothing requires that. Moving the threshold is how you trade precision against recall in practice.

```python
import numpy as np
from sklearn.metrics import precision_score, recall_score

probs = np.array([0.95, 0.80, 0.65, 0.55, 0.40, 0.30, 0.20, 0.10])
truth = np.array([1,    1,    0,    1,    0,    1,    0,    0])

for t in [0.7, 0.5, 0.3]:
    pred = (probs >= t).astype(int)
    print(t, pred.tolist(),
          round(precision_score(truth, pred, zero_division=0), 3),
          round(recall_score(truth, pred), 3))

# 0.7 [1, 1, 0, 0, 0, 0, 0, 0]   precision 1.0     recall 0.5
# 0.5 [1, 1, 1, 1, 0, 0, 0, 0]   precision 0.75    recall 0.75
# 0.3 [1, 1, 1, 1, 1, 1, 0, 0]   precision 0.667   recall 1.0
```

The same model uses one set of predictions, but can give three different answers. Raising the threshold to 0.7 made every accusation correct but caught only half the positives. Lowering it to 0.3 caught them all but accused two innocents.

### The ROC curve

Because a single confusion matrix only describes one threshold, we need a way to evaluate a model across all of them. The **ROC curve** (Receiver Operating Characteristic) plots recall on the y-axis against the false positive rate on the x-axis, sweeping the threshold from high to low:

- **True positive rate (recall)** = TP / (TP + FN) — the positives you caught
- **False positive rate** = FP / (FP + TN) = 1 − specificity — the innocents you accused

Each point on the curve is one threshold's confusion matrix. A model that separates the classes well rises steeply toward the top-left corner, gaining recall before it starts accumulating false positives.

```python
from sklearn.metrics import roc_curve

fpr, tpr, thresholds = roc_curve(truth, probs)
print(np.round(fpr, 3).tolist())   # [0.0, 0.0, 0.0, 0.25, 0.25, 0.5, 0.5, 1.0]
print(np.round(tpr, 3).tolist())   # [0.0, 0.25, 0.5, 0.5, 0.75, 0.75, 1.0, 1.0]
```

### AUC

**AUC** is the area under that curve, condensing the whole picture into one number between 0 and 1:

```python
from sklearn.metrics import roc_auc_score

print(round(roc_auc_score(truth, probs), 4))     # 0.8125
```

Interpreting it:

- **1.0** perfect separation; every positive scored higher than every negative
- **0.9** excellent
- **0.8** good
- **0.7** fair
- **0.5** no better than a coin flip, the diagonal line on the plot
- **below 0.5** worse than guessing, which usually means your labels are reversed

AUC has a clean interpretation worth remembering: it is the probability that a randomly chosen positive case scores higher than a randomly chosen negative case. Our 0.8125 means that if you drew one real fraudster and one honest customer at random, the model would rank the fraudster as riskier about 81% of the time.

The advantage of AUC is that it is threshold-independent, so it measures how well the model *ranks* cases rather than how well one particular cutoff performs. The disadvantage is that it can look flattering on heavily imbalanced data, where a precision-recall curve tells a more honest story.


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
1. A hunter's model says "deer" when the shape is actually a person. Which cell is this?
   - False Positive
   - False Negative
   - True Positive
   - True Negative
1. A hunter's model says "person" when the shape is actually a deer. Which cell is this?
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