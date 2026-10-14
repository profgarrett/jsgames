<script src="/course_model/toc.js"></script>

# Neural Networks


**Outcomes**:
- Explain the structure of a feedforward neural network, including the role of neurons, layers, weights, and biases
- Describe the training process — forward pass, loss calculation, backpropagation, and weight updates — in plain language.
- Select an appropriate activation function and loss function for a given problem type (regression, binary classification, multi-class classification).
- Implement a neural network in Python using PyTorch and interpret its output.
- Apply standard preprocessing steps (normalization, train/test split) before training a neural network.
- Diagnose common training problems such as overfitting and underfitting, and apply appropriate remedies.
- Compare neural networks to simpler models (e.g., logistic regression, decision trees) and justify when each is appropriate.

**Links**:
- [Neural Network Explainer](https://mlu-explain.github.io/neural-networks/)
- [Template](template.ipynb)


## What Is a Neural Network?

A neural network is a computational model loosely inspired by the brain. It learns to map inputs to outputs by adjusting the strength of connections between layers of simple processing units called **neurons**.

The key insight: instead of writing rules by hand, you show the network many examples and let it figure out the rules itself.

## Core Concepts

### Neurons and Layers

A network is organized into **layers**. In a **feedforward** network, data flows in one direction, from the input layer through the hidden layers to the output layer:

- **Input layer** — receives raw features (e.g., pixel values, dollar amounts)
- **Hidden layers** — learn intermediate representations
- **Output layer** — produces the final prediction

Each neuron computes a weighted sum of its inputs, adds a bias term, then passes the result through an **activation function** to introduce non-linearity.

```
output = activation(w₁x₁ + w₂x₂ + ... + wₙxₙ + b)
```

The **weights** (w) are the strength of each connection, and the **bias** (b) is a constant, similar to the intercept in a regression. The weights and biases are the numbers the network learns during training.

For example, a neuron with inputs 3 and 1, weights 2 and -4, and a bias of 0.5 has a weighted sum of (2 × 3) + (-4 × 1) + 0.5 = 2.5. With a ReLU activation, the output is 2.5. If the sum had been negative, ReLU would output 0.

### Activation Functions

| Function | Formula | Use case |
|----------|---------|----------|
| ReLU | max(0, x) | Hidden layers (most common) |
| Sigmoid | 1 / (1 + e⁻ˣ) | Binary classification output |
| Softmax | eˣᵢ / Σeˣⱼ | Multi-class classification output |
| None (linear) | x | Regression output |

Sigmoid squeezes any number into the range 0 to 1, so it can be read as a probability. Softmax turns a set of outputs into probabilities that add up to 1, one per class.

### Choosing the Output and Loss for a Problem

The hidden layers usually use ReLU. The output layer and the loss function depend on what you are predicting:

| Problem type | Output activation | Loss function |
|--------------|-------------------|---------------|
| Regression (a number) | None (linear) | Mean squared error |
| Binary classification (yes/no) | Sigmoid | Binary cross-entropy |
| Multi-class classification (one of several) | Softmax | Cross-entropy |

Cross-entropy penalizes confident wrong predictions heavily.

### Learning: Forward Pass → Loss → Backpropagation

1. **Forward pass** — data flows through the network to produce a prediction
2. **Loss function** — measures how wrong the prediction is (e.g., mean squared error, cross-entropy)
3. **Backpropagation** — computes gradients of the loss with respect to each weight
4. **Optimizer** — adjusts weights to reduce loss (e.g., stochastic gradient descent, Adam)

This cycle repeats for many **epochs** (full passes over the training data).

A **gradient** tells the optimizer which way, and how much, the loss would change if a weight were nudged. The **learning rate** sets how large a step the optimizer takes each time. Too large and training becomes unstable; too small and training is very slow.

The **batch size** is the number of training rows used for each weight update. Large datasets are usually fed through in small batches (such as 32 or 64 rows), so the weights are updated many times per epoch.


## PyTorch Example: Classifying the Iris Dataset

PyTorch is the dominant research framework. This example classifies the Iris dataset.

The data is prepared with the same steps as earlier models: a train/test split (120 flowers for training, 30 for testing) and normalization. The scaler is fitted on the training rows only and then applied to the test rows, so no information leaks from the test set.

A few things to notice in the code:

- The network has 4 inputs (the four flower measurements), two hidden layers of 16 and 8 neurons, and 3 outputs (one per species).
- There is no softmax layer in the network. PyTorch's `nn.CrossEntropyLoss` applies softmax internally, so the network outputs raw scores and the predicted class is simply the largest one (`argmax`).
- The dataset is tiny, so each epoch uses all of the training rows at once rather than small batches.
- `torch.manual_seed(42)` fixes the random starting weights so the results are the same on every run.

You may need to run the pip install command below to get the required libraries.


```python
#%pip install torch scikit-learn
```


```python
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# --- Load and prepare data ---
iris = load_iris()
X, y = iris.data, iris.target

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Fit the scaler on the training rows only, then apply it to the test rows
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

X_train = torch.tensor(X_train, dtype=torch.float32)
X_test  = torch.tensor(X_test,  dtype=torch.float32)
y_train = torch.tensor(y_train, dtype=torch.long)
y_test  = torch.tensor(y_test,  dtype=torch.long)

# --- Define the network ---
class IrisNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(4, 16),   # 4 features → 16 hidden neurons
            nn.ReLU(),
            nn.Linear(16, 8),   # 16 → 8
            nn.ReLU(),
            nn.Linear(8, 3),    # 8 → 3 classes
        )

    def forward(self, x):
        return self.net(x)

torch.manual_seed(42)   # fix the random starting weights so results are repeatable
model = IrisNet()

# --- Loss and optimizer ---
criterion = nn.CrossEntropyLoss()   # applies softmax internally
optimizer = optim.Adam(model.parameters(), lr=0.01)

# --- Training loop ---
for epoch in range(200):
    model.train()
    optimizer.zero_grad()           # clear old gradients
    outputs = model(X_train)        # forward pass
    loss = criterion(outputs, y_train)
    loss.backward()                 # backpropagation
    optimizer.step()                # update weights

    if (epoch + 1) % 10 == 0:
        print(f"Epoch {epoch+1:3d} | Loss: {loss.item():.4f}")

# --- Evaluation ---
model.eval()
with torch.no_grad():
    train_preds = model(X_train).argmax(dim=1)
    train_accuracy = (train_preds == y_train).float().mean()
    print(f"\nTraining accuracy: {train_accuracy:.1%}")

    preds = model(X_test).argmax(dim=1)
    accuracy = (preds == y_test).float().mean()
    print(f"Test accuracy: {accuracy:.1%}")
```

    Epoch  10 | Loss: 0.8376
    Epoch  20 | Loss: 0.4498
    Epoch  30 | Loss: 0.2606
    Epoch  40 | Loss: 0.1662
    Epoch  50 | Loss: 0.0976
    Epoch  60 | Loss: 0.0666
    Epoch  70 | Loss: 0.0557
    Epoch  80 | Loss: 0.0501
    Epoch  90 | Loss: 0.0468
    Epoch 100 | Loss: 0.0439
    Epoch 110 | Loss: 0.0421
    Epoch 120 | Loss: 0.0408
    Epoch 130 | Loss: 0.0398
    Epoch 140 | Loss: 0.0390
    Epoch 150 | Loss: 0.0383
    Epoch 160 | Loss: 0.0377
    Epoch 170 | Loss: 0.0370
    Epoch 180 | Loss: 0.0363
    Epoch 190 | Loss: 0.0355
    Epoch 200 | Loss: 0.0347
    
    Training accuracy: 98.3%
    Test accuracy: 100.0%


## Practical Advice

**Data preprocessing matters more than architecture.** Normalize inputs (zero mean, unit variance) before training — neural networks are sensitive to scale.

**Start simple.** One or two hidden layers with 16–64 neurons usually beat a complex architecture on small tabular datasets.

**Watch for overfitting.** If training loss drops but validation loss rises, the network is memorizing the training data. Add dropout (`nn.Dropout(0.3)`), which randomly switches off a share of the neurons during training, or reduce model size.

**Watch for underfitting.** If the network does poorly even on the training data, it is too simple or has not trained long enough. Add neurons or layers, train for more epochs, or adjust the learning rate.

**Use a validation set.** A validation set is a third portion of the data, held out from training, that you use to compare settings and watch for overfitting. Never tune hyperparameters on the test set: it should stay untouched so it gives an honest measure of performance on new data. (The small iris example above skips this step and uses only a train/test split.)

**Common hyperparameters to tune.** Hyperparameters are settings you choose before training, as opposed to the weights, which the network learns:

| Parameter | Typical starting values |
|-----------|------------------------|
| Hidden layer size | 16, 32, 64, 128 |
| Learning rate | 0.001 (Adam), 0.01 (SGD) |
| Batch size | 32, 64 |
| Epochs | 100–500 for small data |
| Dropout rate | 0.2–0.5 |


## When to Use Neural Networks

Neural networks are not always the right tool. On **small tabular datasets** (< 10,000 rows), gradient-boosted trees (XGBoost, LightGBM) often win. Neural networks shine when:

- Data is large (images, text, audio, time series)
- Features have complex spatial or sequential structure
- Transfer learning from a pretrained model is possible

Compared to the simpler models from earlier in the course:

| | Logistic regression | Decision tree | Neural network |
|---|---|---|---|
| Interpretability | High: read the coefficients | High for small trees: follow the splits | Low: a blackbox of weights |
| Data needed | Small datasets are fine | Small datasets are fine | Works best with large datasets |
| Preprocessing | Scaling helpful | No scaling needed | Scaling required |
| Relationships captured | Linear | Non-linear | Highly complex, non-linear |
| Tuning effort | Low | Low | High: many hyperparameters |

Start with the simpler model. Use a neural network when the simpler model is not accurate enough, you have enough data, and you do not need to explain each prediction.


## Further Reading

- [PyTorch documentation](https://pytorch.org/docs/stable/index.html)
- [fast.ai Practical Deep Learning](https://course.fast.ai/)
- Nielsen, M. *Neural Networks and Deep Learning* — free at [neuralnetworksanddeeplearning.com](http://neuralnetworksanddeeplearning.com)


## Key Terms

- **Neural network**: A model, loosely inspired by the brain, that learns to map inputs to outputs by adjusting the strength of connections between layers of neurons
- **Feedforward network**: A neural network where data flows in one direction, from the input layer through the hidden layers to the output layer
- **Neuron**: A simple processing unit that computes a weighted sum of its inputs, adds a bias, and applies an activation function
- **Layer**: A group of neurons that all sit at the same stage of the network
- **Input layer**: Receives raw features (e.g., pixel values, dollar amounts)
- **Hidden layers**: Learn intermediate representations
- **Output layer**: Produces the final prediction
- **Weight**: The strength of a connection between two neurons; the numbers the network learns during training
- **Bias**: A constant added to a neuron's weighted sum, similar to the intercept in a regression
- **Activation function**: A function applied to a neuron's result that introduces non-linearity, such as ReLU
- **ReLU**: An activation function, max(0, x), that turns negative values into 0; the most common choice for hidden layers
- **Sigmoid**: An activation function that squeezes any number into the range 0 to 1; used for binary classification output
- **Softmax**: An activation function that turns a set of outputs into probabilities that add up to 1; used for multi-class classification output
- **Forward pass**: Data flowing through the network to produce a prediction
- **Loss function**: A measure of how wrong the predictions are, such as mean squared error or cross-entropy
- **Cross-entropy**: The loss function used for classification, which penalizes confident wrong predictions heavily
- **Gradient**: The direction and size of the change in loss when a weight is nudged; it tells the optimizer which way to adjust each weight
- **Backpropagation**: Computing the gradient of the loss with respect to each weight by working backward through the network
- **Optimizer**: The algorithm that adjusts the weights to reduce the loss, such as stochastic gradient descent or Adam
- **Learning rate**: How large a step the optimizer takes each time it updates the weights
- **Epoch**: One full pass over the training data
- **Batch size**: The number of training rows used for each weight update
- **Hyperparameter**: A setting chosen before training rather than learned from the data, such as the learning rate or the number of hidden neurons
- **Underfitting**: When a model is too simple, or trained too little, to capture the pattern, so it performs poorly even on the training data
- **Validation set**: A portion of the data held out from training and used to tune hyperparameters and watch for overfitting
- **Dropout**: Randomly switching off a share of neurons during training to reduce overfitting
- **Normalization (inputs)**: Rescaling each input to zero mean and unit variance before training


## Practice Questions

1. How does a neural network learn to map inputs to outputs?
   - By adjusting the weights of the connections between neurons as it is shown many examples
   - By following rules that a programmer writes by hand
   - By splitting the data with a series of yes/no questions
   - By grouping similar rows into clusters
1. What does a single neuron compute?
   - A weighted sum of its inputs plus a bias, passed through an activation function
   - The average of all the rows in the dataset
   - The distance between two data points
   - The p-value of each input
1. What are the three kinds of layers in a feedforward network?
   - Input, hidden, and output
   - Training, validation, and test
   - Forward, backward, and loss
   - Sigmoid, softmax, and ReLU
1. What do the hidden layers do?
   - Learn intermediate representations between the raw inputs and the final prediction
   - Receive the raw features
   - Produce the final prediction
   - Store the test data
1. What is the role of an activation function?
   - It introduces non-linearity, so the network can learn more than straight-line relationships
   - It measures how wrong the prediction is
   - It splits the data into training and test sets
   - It sets the learning rate
1. A neuron has inputs 2 and 3, weights 0.5 and -1, and a bias of 1. What is its output with a ReLU activation?
   - 0, because the weighted sum is -1 and ReLU turns negatives into 0
   - -1
   - 1
   - 5
1. Which activation function is the most common choice for hidden layers?
   - ReLU
   - Sigmoid
   - Softmax
   - Cross-entropy
1. Which output activation fits a multi-class problem such as predicting one of three iris species?
   - Softmax
   - ReLU
   - Sigmoid
   - None
1. Which loss function would you choose for a regression problem, such as predicting a house price?
   - Mean squared error
   - Cross-entropy
   - Softmax
   - Accuracy
1. What does the loss function measure?
   - How wrong the network's predictions are
   - How many layers the network has
   - How fast the network trains
   - How many rows are in the training set
1. What is the correct order of the steps in one training cycle?
   - Forward pass, loss calculation, backpropagation, weight update
   - Backpropagation, forward pass, weight update, loss calculation
   - Weight update, loss calculation, forward pass, backpropagation
   - Loss calculation, weight update, backpropagation, forward pass
1. What does backpropagation do?
   - Computes how much each weight contributed to the loss, so the weights can be adjusted
   - Sends the test data backward through the network to make predictions
   - Removes neurons that are not being used
   - Scales the inputs to zero mean and unit variance
1. What does the optimizer do?
   - Adjusts the weights to reduce the loss
   - Calculates the accuracy on the test set
   - Chooses the number of hidden layers
   - Converts the data into tensors
1. What is an epoch?
   - One full pass over the training data
   - A single neuron's output
   - The number of hidden layers
   - The size of the test set
1. What does the learning rate control?
   - How large a step the optimizer takes each time it updates the weights
   - How many rows are in each batch
   - How many neurons are in the hidden layers
   - How much of the data is held out for testing
1. In our iris network, the first layer is `nn.Linear(4, 16)`. What do the 4 and the 16 mean?
   - 4 input features feeding into 16 hidden neurons
   - 4 hidden layers with 16 epochs each
   - 4 classes and 16 rows
   - A learning rate of 4 and a batch size of 16
1. How many weights and biases does `nn.Linear(4, 16)` have?
   - 80: 4 × 16 weights plus 16 biases
   - 20
   - 64
   - 16
1. Why does the last layer of our iris network have 3 outputs?
   - There are 3 species to choose between, with one output per class
   - There are 3 hidden layers
   - The data has 3 features
   - The network trains for 3 epochs
1. Why do we normalize the inputs before training a neural network?
   - Neural networks are sensitive to the scale of their inputs
   - It increases the number of rows
   - It removes the need for an activation function
   - It converts the classes into numbers
1. Training loss keeps dropping, but validation loss starts to rise. What is happening?
   - Overfitting: the network is memorizing the training data
   - Underfitting: the network is too simple
   - The learning rate is zero
   - The data was not normalized
1. Which is a remedy for overfitting?
   - Add dropout or reduce the size of the model
   - Add more hidden layers and neurons
   - Train for many more epochs
   - Tune the hyperparameters on the test set
1. A network performs poorly on both the training data and the test data. What is the likely problem, and a remedy?
   - Underfitting; make the model larger or train it for longer
   - Overfitting; add dropout
   - Data leakage; remove the test set
   - Too many epochs; stop training earlier
1. Why should you tune hyperparameters on a validation set rather than the test set?
   - So the test set stays untouched and gives an honest measure of performance on new data
   - Because the validation set is always larger
   - Because the test set cannot be used with PyTorch
   - So the model trains faster
1. Compared with logistic regression or a small decision tree, what is a major downside of a neural network?
   - It is a blackbox: its weights are hard to interpret
   - It cannot handle more than two classes
   - It cannot be used with numeric data
   - It always has lower accuracy
1. For which kind of data do neural networks shine?
   - Large datasets with complex structure, such as images, text, and audio
   - Small tabular datasets with a few hundred rows
   - Datasets with no numeric columns
   - Datasets where every coefficient must be explained
