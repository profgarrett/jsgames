<script src="/course_model/toc.js"></script>

# Predicting Categories (Classification Task)

Some models predict a yes/no (categorical) variable. This is called *classification*.  We typically use it for comparing a prediction against actual results. For example, how well does our model predict which students will pass a class?

**Outcomes**:
- Create a confusion matrix
- Measure accuracy, precision, and recall
- Pick the most appropiate metric for your situation

**Links**
- [Quizlet terms](https://quizlet.com/1127449994/ml03-category-prediction-flash-cards/?i=2up6jq&x=1jqt)
- [Is Susan pregnant?)](susanpregnancy.docx)
- [Nice graphic](https://encord.com/glossary/confusion-matrix/)
- [ROC curve and AUC](https://mlu-explain.github.io/roc-auc/)
- [Precision and Recall](https://mlu-explain.github.io/precision-recall/)


<!-- Add ROC on section -->

## Confusion Matrix

Measuring error with is done with a confusion matrix. This compares predicted values against actual values.

As an example, imagine we are a hunter trying to find deer in the forest. Are we looking at a deer (positive) or a person (negative)?

Our model can be very simple, if we see something gray, it's a deer. If we see something else, it's a person. How well does this model work?

|                   | Predicted Positive, think yes deer | Predicted Negative, think no deer |
| ----------------- | ---------------------------------- | --------------------------------- |
| Positive = Deer   | True Positive (TP)                 | False Negative (FN)               |
| Negative = Person | False Positive (FP)                | True Negative (TN)                |



## Measuring Accuracy, Precision, and Recall


From this, we can calculate several metrics to evaluate our model:
- *Accuracy*: (TP + TN) / (TP + TN + FP + FN)
  - The proportion of correct predictions (both true positives and true negatives) out of all predictions
- *Precision*: TP / (TP + FP)
  - The proportion of true positive predictions out of all positive predictions
- *Recall* (Sensitivity): TP / (TP + FN)
  - The proportion of true positive predictions out of all actual positive cases


There are tradeoffs between precision and recall. For example, if we want to be very sure we are only shooting deer (high precision), we may miss some deer (low recall). Conversely, if we want to make sure we shoot all the deer (high recall), we may accidentally shoot some people (low precision).


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
| Negative = Ok.     | D, E (FP)         | F (TN)           |


From this, we can calculate:

- Accuracy
  - Correctly classified / all cases
  - (3 including A, B, & F) / 6 = 50% accuracy
- Precision: 
  - Predicted Correctly / Predicted
  - (A, B) / (A, B, D, E) = 2 / 4 = 50% precision
- Recall
  - Predicted Correctly / All fraudsters
  - (A, B) / (A, B, C) = 2/3 = 66% recall`

