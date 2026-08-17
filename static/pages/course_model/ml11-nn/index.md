<script src="/course_model/toc.js"></script>

# Neural Networks


**Outcomes**
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

A network is organized into **layers**:

- **Input layer** — receives raw features (e.g., pixel values, dollar amounts)
- **Hidden layers** — learn intermediate representations
- **Output layer** — produces the final prediction

Each neuron computes a weighted sum of its inputs, adds a bias term, then passes the result through an **activation function** to introduce non-linearity.

```
output = activation(w₁x₁ + w₂x₂ + ... + wₙxₙ + b)
```

### Activation Functions

| Function | Formula | Use case |
|----------|---------|----------|
| ReLU | max(0, x) | Hidden layers (most common) |
| Sigmoid | 1 / (1 + e⁻ˣ) | Binary classification output |
| Softmax | eˣᵢ / Σeˣⱼ | Multi-class classification output |

### Learning: Forward Pass → Loss → Backpropagation

1. **Forward pass** — data flows through the network to produce a prediction
2. **Loss function** — measures how wrong the prediction is (e.g., mean squared error, cross-entropy)
3. **Backpropagation** — computes gradients of the loss with respect to each weight
4. **Optimizer** — adjusts weights to reduce loss (e.g., stochastic gradient descent, Adam)

This cycle repeats for many **epochs** (full passes over the training data).


## PyTorch Example: Classifying the Iris Dataset

PyTorch is the dominant research framework. This example classifies the Iris dataset.

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

scaler = StandardScaler()
X = scaler.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

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

model = IrisNet()

# --- Loss and optimizer ---
criterion = nn.CrossEntropyLoss()
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
    preds = model(X_test).argmax(dim=1)
    accuracy = (preds == y_test).float().mean()
    print(f"\nTest accuracy: {accuracy:.1%}")


```

    Epoch  10 | Loss: 0.8406
    Epoch  20 | Loss: 0.4869
    Epoch  30 | Loss: 0.2794
    Epoch  40 | Loss: 0.1609
    Epoch  50 | Loss: 0.0929
    Epoch  60 | Loss: 0.0647
    Epoch  70 | Loss: 0.0547
    Epoch  80 | Loss: 0.0501
    Epoch  90 | Loss: 0.0472
    Epoch 100 | Loss: 0.0453
    Epoch 110 | Loss: 0.0438
    Epoch 120 | Loss: 0.0426
    Epoch 130 | Loss: 0.0415
    Epoch 140 | Loss: 0.0403
    Epoch 150 | Loss: 0.0390
    Epoch 160 | Loss: 0.0375
    Epoch 170 | Loss: 0.0359
    Epoch 180 | Loss: 0.0340
    Epoch 190 | Loss: 0.0321
    Epoch 200 | Loss: 0.0301
    
    Test accuracy: 100.0%



## Practical Advice

**Data preprocessing matters more than architecture.** Normalize inputs (zero mean, unit variance) before training — neural networks are sensitive to scale.

**Start simple.** One or two hidden layers with 16–64 neurons usually beat a complex architecture on small tabular datasets.

**Watch for overfitting.** If training loss drops but validation loss rises, add dropout (`nn.Dropout(0.3)`) or reduce model size.

**Use a validation set.** Never tune hyperparameters on the test set.

**Common hyperparameters to tune:**

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



## Further Reading

- [PyTorch documentation](https://pytorch.org/docs/stable/index.html)
- [fast.ai Practical Deep Learning](https://course.fast.ai/)
- Nielsen, M. *Neural Networks and Deep Learning* — free at [neuralnetworksanddeeplearning.com](http://neuralnetworksanddeeplearning.com)

