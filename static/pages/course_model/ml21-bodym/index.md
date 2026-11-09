# Measuring Bodies from Silhouettes

Poor fit is one of the most common reasons people send back clothing bought online. What if a shopper could take two photos with a phone and get their measurements? Amazon released the **BodyM** dataset: black-and-white silhouettes (front and side) of about 2,500 people, matched with 14 body measurements taken by a 3D body scanner.

You will:

1. **Vet the data** keys, duplicates, missing values, reasonableness tests, and plenty of charts.
2. **Build a neural network** that predicts 14 body measurements from the two silhouettes, and compare its predictions with the scanner's measurements.
3. **Build a second network** that predicts whether a person is recorded as male or female.

You have seen part of this data before: the height, weight, and measurement tables from [ml03](../ml03-category-prediction/index) and [ml04](../ml04-number-prediction/index) come from BodyM. Now you get the photos.

**Outcomes**:
- Vet a dataset made of several linked tables: keys, duplicates, missing values, units, and reasonableness tests
- Use charts to check distributions, relationships, and image data before modeling
- Recognize grouped data (several photos of one person) and split by person to avoid leakage
- Compare a neural network against simple baselines using mean absolute error (MAE)
- Train a convolutional neural network (CNN) in PyTorch for multi-output regression and for binary classification
- Evaluate on a held-out test set and a test set taken under different conditions, and diagnose the errors
- Explain each line of code you prompted an AI assistant to write

**Links**:
- [Data: bodym_data.zip](bodym_data.zip) (download before Session 1)
- [Template](template.ipynb)
- [BodyM on the AWS Registry of Open Data](https://registry.opendata.aws/bodym/)
- [The research paper behind the dataset](https://arxiv.org/abs/2210.05667) (Ruiz et al., 2022)
- Review: [ml20 Neural Networks](../ml20-nn/index) and the MNIST lesson

## Starting

1. Make a folder for this assignment (outside OneDrive).
2. Download `bodym_data.zip` and `template.ipynb` into it.
3. Unzip the data so that a folder called `bodym` sits **next to** `template.ipynb`. Inside `bodym` you should see `train`, `testA`, and `testB`.
4. Open `template.ipynb` in VS Code. Run the install cell (remove the `#` first), then run the setup cell. It should list the files in each folder.

**Do not open the CSV files in Excel and save them.** Some `subject_id` values start with a `-`. Excel treats those as formulas and replaces them with `#NAME?`, which destroys the IDs you need to join the tables.

## Process

For each step:

1. **Prompt for one step only.** Paste the step's "Ask the AI for" list. Tell the assistant which variables already exist in your notebook.
2. **Read the code before you run it.** If you can't explain a line, ask the assistant to explain it, or to write a simpler version.
3. **Run it and compare with "What you should see."** If your result is very different, something is probably wrong. Find out why before moving on.
4. **Answer "Check your understanding" in your own words**, in a markdown cell under your code. Don't use AI for these answers. They are how you (and I) know you understand the algorithm, not just the output.
5. **"Predict first"** means write your guess in the notebook *before* you run the cell.


### Project brief: paste this at the start of every AI chat

```
I'm working in a Jupyter notebook (Python, pandas, matplotlib/seaborn, scikit-learn,
PyTorch on CPU). Dataset: Amazon BodyM, in a folder called bodym/ next to my notebook,
with subfolders train/, testA/, testB/. Each subfolder has:
  measurements.csv          one row per person: subject_id + 14 body measurements in cm
                            from a 3D scan: ankle, arm-length, bicep, calf, chest, forearm,
                            height, hip, leg-length, shoulder-breadth, shoulder-to-crotch,
                            thigh, waist, wrist
  hwg_metadata.csv          one row per person: subject_id, gender (male/female),
                            height_cm, weight_kg
  subject_to_photo_map.csv  one row per photo: subject_id, photo_id
  mask/<photo_id>.png       front silhouette (black and white)
  mask_left/<photo_id>.png  side silhouette
A person can have several photos. testA and testB are test sets: don't use them until
I ask. Write short, readable code with comments, one step at a time, and keep my
variable names.
```

### Shared variable names

Use these names so that later steps work with earlier ones. Tell the assistant about them.

| Name | What it holds | Created in |
|---|---|---|
| `DATA_DIR`, `SPLITS`, `MEAS_COLS` | Data folder, `['train', 'testA', 'testB']`, the 14 measurement column names | Step 0 (template) |
| `meas_all`, `meta_all`, `photos_all` | The three tables for all splits, stacked, with a `split` column | Step 1 |
| `subjects` | One row per person: measurements + metadata, plus `is_female` and `bmi` | Step 3 |
| `bad_subjects` | IDs of training people you decide to exclude | Step 3 |
| `front_files`, `side_files` | Dictionaries: `photo_id` → image file path | Step 6 |
| `load_silhouette()`, `pair_image()` | Load one silhouette; put front and side side by side | Step 7 |
| `photo_df`, `X` | One row per photo; the image array (row `i` of `photo_df` is `X[i]`) | Step 8 |
| `train_df`, `val_df`, `testA_df`, `testB_df` | The four sets of photos | Step 9 |
| `val_mae` | Table of validation MAE: one row per measurement, one column per model | Step 10 |
| `SilhouetteNet`, `train_model()`, `cnn` | The network class, the training loop, the image-only model | Step 11 |
| `hybrid`, `gender_cnn` | The image + height/weight model; the gender model | Steps 13, 16 |

# Session 1: Know your data

You have to understand your data before doing any modeling. See the EDA checklist in the [ml20 lesson](../ml20-nn/index#eda-checklist). The BodyM dataset has three linked tables, plus two images per photo. You will check the keys, duplicates, missing values, reasonableness tests, distributions, and relationships.

### Step 0. Setup (3 min)

The template's setup cell loads the libraries and defines `DATA_DIR`, `SPLITS`, and `MEAS_COLS`. Run it. Then read the project brief above, so you know what each file should contain.

### Step 1. Load the three tables

**Ask the AI for:**
- Code that reads `measurements.csv`, `hwg_metadata.csv`, and `subject_to_photo_map.csv` from each split folder
- A `split` column added to each table, then the three splits stacked into `meas_all`, `meta_all`, and `photos_all`
- A summary table: rows in each table, and the number of distinct people with photos, for each split
- `.head()` of each table

**What you should see:** about 2,000 people in `train`, fewer than 100 in `testA`, and about 400 in `testB`. Every split has more photos than people.

> If a CSV loads with odd column names (such as a first column called `bodym dataset`), the file has note rows above the header. Ask the AI to find the header row.

**Check your understanding:**
1. Which tables have one row per *person*, and which have one row per *photo*? What is the key column (the column that identifies a row) in each?
2. How is this like a customer master file and a sales transactions file in an accounting system?

### Step 2. Structure checks

Before checking any *values*, confirm the tables are complete and the keys line up.

**Ask the AI for:**
- The data types of each column, and the number of missing values in each table
- Counts of duplicate keys: `subject_id` repeated within a split (measurements and metadata), and `photo_id` repeated in the photo map
- `value_counts()` of `gender`, including missing values; then clean it with `.str.strip().str.lower()`
- The lengths of the `subject_id` values, how many start with `-`, and how many look broken (contain `#` or spaces)
- For each split, a key check (an *anti-join*): people with measurements but no metadata, metadata but no measurements, photos but no measurements, and measurements but no photos
- The number of people who appear in more than one split

**What you should see:** few or no missing values. Two different ID formats (lengths). Check whether any person appears in two splits; the answer should be zero.

**Check your understanding:**
1. What is an anti-join, and why is it a good audit test for linked tables?
2. Two different ID formats suggest something about how the data was collected. What?
3. Why would it be a problem if the same person appeared in `train` and `testA`?

### Step 3. Value checks: ranges, reasonableness tests, and the two heights 

**Ask the AI for:**
- A merge of measurements and metadata into `subjects` (one row per person), with two new columns: `is_female` (1 or 0) and `bmi` (weight in kg divided by height in metres squared)
- `.describe()` for the 14 measurements, `height_cm`, `weight_kg`, and `bmi`
- These **reasonableness tests**, with the number of people who fail each one: wrist < forearm, forearm < bicep, ankle < calf, calf < thigh, thigh < hip, leg-length < height, arm-length < height, and BMI between 15 and 60
- A table of the rows that fail
- A comparison of the two heights: `height_cm` (recorded at the visit) vs `height` (from the 3D scan). Make a scatter plot with a dashed 45° "perfect match" line, a histogram of the difference, and a list of people whose two heights differ by more than 10 cm
- A count of people with any measurement more than 4 standard deviations from the mean (|z| > 4), and a look at those rows

**Predict first:** Which reasonableness test do you expect to fail most often? How close should the two heights be?

**What you should see:** most tests pass for everyone. A few people fail the forearm/bicep test or the BMI test. The two heights usually agree within a centimetre or two, but a few disagree by more than 10 cm. Some people are extreme on several measurements at once.

**Decide:** Write down a cleaning rule, then have the AI store the affected training IDs in `bad_subjects`. A reasonable rule: exclude people whose two heights differ by more than 10 cm, or whose BMI is outside 15–60. Exclude them from **training and validation only**. Never remove people from the test sets.

**Check your understanding:**
1. Find one row that is *extreme but believable* and one that is *probably an error*. What evidence from other columns tells them apart?
2. Why remove suspected errors from the training data but not from the test sets?
3. Reasonableness tests are a kind of analytical procedure. What would an auditor do next with the failing rows?

### Step 4. Visualize distributions and relationships

**Ask the AI for:**
- A 4 × 4 grid of histograms, one per measurement plus weight and BMI, with men and women overlaid in two colors
- A correlation heatmap of the 14 measurements plus `height_cm` and `weight_kg`, with the values printed in each cell
- A table showing each measurement's correlation with `height_cm` and with `weight_kg`
- A seaborn `pairplot` of `height_cm`, `weight_kg`, `chest`, `waist`, and `hip`, colored by gender (use a random sample of 800 people so it draws quickly)

**Check your understanding:**
1. Which measurements follow **height** most closely, and which follow **weight**? What do the two groups have in common? (Hint: lengths vs girths.)
2. Based on the heatmap, which measurement should be easiest to predict from height and weight alone? Which should be hardest?
3. Which measurements look most different between men and women? Which overlap almost completely?

### Step 5. Compare the splits and count photos per person

**Ask the AI for:**
- A table for each split: number of people, percent female, and mean height, weight, and waist
- Side-by-side boxplots of `height_cm`, `weight_kg`, and `waist` by split
- The number of photos per person: summary statistics and a histogram for each split

**What you should see:** `testA` has very few people but many photos per person. `train` and `testB` have a few photos per person.

**Check your understanding:**
1. Do the test sets look like the training set? Why does that matter for a fair test?
2. `testA` has well over a thousand photos. How many *independent* pieces of evidence does it really give us about new people?
3. Why must we split the data by **person**, not by photo?

### Step 6. Image file checks

**Ask the AI for:**
- Two dictionaries, `front_files` and `side_files`, mapping `photo_id` to the image path (front images are in `mask/`, side images in `mask_left/`)
- For each split: photos in the map with no front image, no side image, and image files that aren't in the map
- A table of image sizes (width × height) and color modes. Read just the image header, which is fast
- For a random sample of 200 front images: the distinct pixel values, the number of blank images, and the share of the frame the person covers

**What you should see:** every photo has both images, or only a handful are missing. Note the image size. If the images are not all the same size, that's fine: Step 7's helper pads them to one shape. Only two pixel values (or very nearly), because these are silhouettes.

**Check your understanding:**
1. Why check that the images contain only two pixel values?
2. What would a blank image, or an image saved with the colors reversed, do to training?

### Step 7. Look at the images

**Ask the AI for** a helper function `load_silhouette(path)` that:
- opens the image in grayscale and makes the person white (255) on black (0). If the border is mostly white, flip it
- pads the image (never stretches it) to the most common aspect ratio from Step 6
- shrinks it to 128 pixels tall, returning a `uint8` array

Then a function `pair_image(photo_id)` that puts the front and side views side by side. **This is exactly what the network will see.**

Then ask for these charts:
- A row of 6 random training people (front + side), titled with gender, height, and weight. Then the same for `testB`
- Several photos of one person who has 3 or more photos
- The **average silhouette** for women and for men (the mean of 300 training images each), plus a third panel showing men minus women
- For 500 training photos: the silhouette's height in **pixels** vs the person's scanned height in cm (scatter plot), and a histogram of pixels per cm

**Predict first:** If every photo were taken from exactly the same distance, what would the pixels-per-cm histogram look like?

**What you should see:** pixel height rises with real height, but with real scatter. Pixels per cm varies from photo to photo.

**Check your understanding:**
1. Can one photo tell you how tall someone is? Why not? (Think about a child standing close to the camera.)
2. What one extra number would solve that problem? Keep this in mind for Session 3.
3. Compare the `train` and `testB` silhouettes. What looks different?

**Session 1 exit ticket:** In a markdown cell, list three data issues you found and the decision you made for each.

# Session 2: Baselines and a neural network

### Step 8. Build the photo table and the image array 

**Ask the AI for:**
- `photo_df`: one row per photo, with that person's measurements and metadata attached. Keep only photos that have both a front and a side image. Add a `row` column numbered 0, 1, 2, …
- `X`: a `uint8` NumPy array of shape (photos, 128, width), filled with `pair_image()` for each photo, so that `X[i]` matches row `i` of `photo_df`
- Progress messages while it loads, and a cache: save `X` to a `.npz` file, and load from that file if it already exists

**What you should see:** the first load takes a few minutes. After that, the cache loads in seconds. Note the shape of `X` and its memory use.

**Check your understanding:**
1. Why store the pixels as `uint8` (0–255) instead of decimals? How much memory does that save?
2. How many numbers describe one photo? Compare that with the 784 numbers per MNIST digit.

### Step 9. Split by person: train, validation, test-A, test-B

| Set | Where it comes from | Used for |
|---|---|---|
| `train_df` | 80% of the people in the `train` folder, minus `bad_subjects` | Fitting the weights (homework) |
| `val_df` | The other 20% of those people | Comparing models, choosing epochs (practice exam) |
| `testA_df` | The `testA` folder | One honest final score, same lab conditions (final exam) |
| `testB_df` | The `testB` folder | Final score when photo conditions change |

**Ask the AI for:**
- The split above, using scikit-learn's `GroupShuffleSplit` with `groups=subject_id` and `random_state=42`
- An `assert` that no person appears in more than one of the four sets
- A table of photos, people, and percent female in each set

**Predict first:** If we split by photo instead of by person, would validation scores go up or down? Would they be honest?

**Check your understanding:**
1. Explain the job of each of the four sets in one sentence each.
2. Why don't we use `testA` to decide how many epochs to train?

### Step 10. Baselines 

Before building a neural network, find out how well simple rules do. We will score every model with **mean absolute error (MAE) in cm**: on average, how far off is the prediction?

**Ask the AI for:**
- A function `mae_by_measure(df, pred)` that returns the MAE for each of the 14 measurements
- **Mean baseline:** predict the training average of each measurement for everyone
- **Linear baseline:** a `LinearRegression` that predicts all 14 measurements from `height_cm`, `weight_kg`, and `is_female`, fitted on `train_df`. These are three numbers a shopper could type in; no picture is used
- A table `val_mae`: one row per measurement, one column per model, plus an `AVERAGE` row

**Predict first:** Which measurement will the linear model predict best? Which worst?

**What you should see:** the linear model is far better than the mean baseline. Its `height` error is small (about 1 cm). Girths such as chest, waist, and hip have the largest errors.

**Check your understanding:**
1. What does an MAE of 3 cm on `waist` mean for a shopper choosing a pair of pants?
2. Why is the linear model so good at predicting `height`? Is that fair?
3. Why do we need baselines at all before building a neural network?

### Step 11. A convolutional neural network for 14 measurements (training takes 5–10)

**Ask the AI for:**
- Standardized targets: subtract the **training** mean of each measurement and divide by its **training** standard deviation. Do the same for `height_cm`, `weight_kg`, and `is_female` (you will need these in Step 13)
- A function `make_loader(df, y, shuffle)` that builds a PyTorch `DataLoader` with batches of 64. Each batch holds the images (as `uint8`, shape batch × 1 × 128 × width), the three standardized extra columns, and the targets
- A class `SilhouetteNet(n_outputs, n_extra=0)`:
  - **image features:** four convolution blocks with 16, 32, 64, and 64 filters. Each block is a 3 × 3 `Conv2d` (padding 1), then `BatchNorm2d`, `ReLU`, and `MaxPool2d(2)`. Then `Flatten`, a dense layer of 128 neurons, `ReLU`, and `Dropout(0.2)`
  - **head:** a dense layer of 64 neurons with ReLU, then an output layer with `n_outputs` neurons
  - `forward(images, extras)` divides the pixels by 255. If `n_extra > 0`, it joins `extras` to the 128 image features before the head, and adds a **shortcut**: one `Linear(n_extra, n_outputs)` layer from the extras straight to the outputs, added to the head's output. (You won't use the extras until Step 13.)
- The number of parameters in the model, and the loss of the **untrained** model on one batch
- A function `train_model(model, loss_fn, train_loader, val_loader, epochs=25, lr=0.001, patience=4)` that uses the Adam optimizer, prints the train and validation loss each epoch, keeps the weights from the epoch with the lowest validation loss, and stops early if validation loss hasn't improved for `patience` epochs
- Training `cnn = SilhouetteNet(14)` with `nn.MSELoss()`, then a plot of training and validation loss by epoch

**Predict first:**
1. With standardized targets, roughly what MSE does "predict the mean for everyone" give? Will the untrained network be better or worse?
2. How many weights and biases does the first `Conv2d(1, 16, 3)` layer have? Count by hand, then check.

**What you should see:** each epoch takes roughly 15–60 seconds on a laptop. Validation loss falls quickly, then levels off and bounces a little, and training stops early. If an epoch takes more than about a minute, rebuild `X` at 96 pixels tall instead of 128.

Training loss is measured with dropout switched on, so it can sit *above* validation loss. That's normal.

**Check your understanding:**
1. Why standardize the 14 targets before training? (What would happen to the loss if waist, in the 80s, and wrist, in the teens, were left in cm?)
2. What does a 3 × 3 convolution filter do? Why is a CNN a better fit for images than a dense layer on every pixel? (Remember Experiment D in the MNIST lesson.)
3. In your own words, what happens in one pass through the training loop: `zero_grad()`, the forward pass, `loss.backward()`, `optimizer.step()`?
4. What is early stopping, and which set does it watch?

### Step 12. How close are the predictions, in cm?

**Ask the AI for:**
- Predictions on `val_df`, converted back to cm (multiply by the training standard deviation, add the training mean)
- A new column `CNN (image only)` in `val_mae`
- A grouped bar chart: MAE by measurement, one bar per model
- Predicted vs actual scatter plots for `height`, `chest`, `waist`, and `hip`, each with a dashed 45° line and colored by gender

**Predict first:** Will the image-only CNN beat the linear model, which never sees a picture?

**What you should see:** the CNN clearly beats the mean baseline on most measurements. Its `height` error is clearly worse than the linear model's, which was *given* height. Compare the girths honestly: the picture doesn't automatically win.

**Check your understanding:**
1. In the scatter plots, does the model over-predict for small people and under-predict for large people? Why might that happen?
2. Using your Step 7 findings, explain why the image-only model struggles with `height`.
3. If you had to ship one model to a clothing website today, which would it be, and why?

**Session 2 exit ticket:** In two sentences, did the picture help? Use numbers from `val_mae`.

# Session 3: Improve, test, diagnose, classify

### Step 13. Picture plus three numbers: a hybrid network

A photo shows body **shape**, but not **scale**, because the camera distance varies. A shopper can type in their height and weight. Give the network both.

**Ask the AI for:**
- `hybrid = SilhouetteNet(14, n_extra=3)`, trained with the same loop. The three extras are the standardized `height_cm`, `weight_kg`, and `is_female`
- A new column in `val_mae` and the bar chart again, now with four models

Start training, then answer the questions while it runs.

**Predict first:** Will the hybrid beat both the linear model and the image-only CNN? On which measurements will it gain the most?

**Check your understanding:**
1. Where in the network do the three numbers enter? Why there, and not into the first convolution layer?
2. What does the shortcut compute on its own? (Compare it with your linear baseline from Step 10.) Why does it make the hybrid's job easier?
3. Describe what the picture contributes and what the three numbers contribute.

### Step 14. The final exam: test-A and test-B (run once)

**Ask the AI for:**
- The average MAE for the linear model, the image-only CNN, and the hybrid on validation, test-A, and test-B, as a table and a grouped bar chart
- The full per-measurement MAE table for the two test sets
- For test-A: the image-only CNN's MAE computed per photo, and again after averaging each person's predictions across all their photos

**Predict first:** Which test set will be harder? Will the linear model get worse on test-B?

**Check your understanding:**
1. Why should test-B's different photo conditions hurt the image models but not the linear model? Did they?
2. Did averaging a person's photos reduce the error? Why would you expect it to? Is the per-photo or the per-person number the better one to report?
3. Your validation score was used to make choices. Why is the test score the more honest estimate?

### Step 15. Diagnose the errors

**Ask the AI for**, using the hybrid model on test-A:
- A boxplot of the waist error (predicted − actual) by gender, with a line at zero
- A scatter plot of waist error vs BMI
- The six photos with the largest waist errors, titled with the actual and predicted waist

**Check your understanding:**
1. Is the error about the same for everyone? Who does the model serve worst?
2. Do the worst photos have anything in common?
3. What would those errors cost a clothing retailer, and its customers?

### Step 16. Predict gender from the silhouette 

The dataset records each person's gender as `male` or `female`. Code `is_female` as 1 for female. The input is the **image only**: no height, weight, or gender.

**Ask the AI for:**
- Two baselines on the validation set: always predict the majority class, and a `LogisticRegression` on `height_cm` and `weight_kg`
- New loaders with `is_female` as the target (shape photos × 1)
- `gender_cnn = SilhouetteNet(1)` trained with `nn.BCEWithLogitsLoss()`
- A function that converts the network's output into a probability of female (the sigmoid), and the validation accuracy

**Predict first:** What accuracy will each baseline get? The CNN?

**Check your understanding:**
1. Why does this network need only **one** output, when the iris network in ml20 had three?
2. `BCEWithLogitsLoss` applies the sigmoid for you. Which loss in ml20 worked the same way for softmax?
3. Why include a baseline that uses only height and weight?

### Step 17. Evaluate the gender model

**Ask the AI for:**
- Confusion matrices for test-A and test-B, and a `classification_report` for each
- ROC curves for the CNN and for the height + weight logistic regression on both test sets, with the AUC in the legend
- A histogram of the predicted probability of female, split by actual gender (test-A)
- Test-A accuracy per photo and per person (average each person's probabilities)
- The six most confident mistakes on test-B

**Check your understanding:**
1. What do precision and recall for `female` mean here, in plain words?
2. What does an AUC of 0.5 mean? An AUC of 1.0?
3. Look at the confident mistakes. Can you see a pattern (pose, body shape, photo quality)?

**Discuss with your neighbor** (a preview of next week's [ethics module](../ml30-ethics/index)): the model learns body shape, and the label is a single recorded category. When might a business want a prediction like this? When would using it be inappropriate or harmful? Who bears the cost of a wrong prediction?

### Step 18. Stretch goals

Pick one:
- **Saliency map:** ask the AI to compute the gradient of one output (for example, `waist`) with respect to the input pixels, and overlay it on the silhouette. Where does the network "look"? Compare with the gender model.
- **Data augmentation:** shift each training image a few pixels left or right at random during training. Does test-B improve?
- **Image size:** try 96 or 160 pixels tall. What happens to accuracy and training time?
- **Learning rate:** try 0.0003 and 0.003. Plot the loss curves together.

## Wrap-up questions

Answer in markdown cells at the end of your notebook:

1. Describe three data quality issues you found and how you handled each.
2. Why did we split by person? What would have happened otherwise?
3. Explain, in your own words, how the CNN turns a pair of silhouettes into 14 numbers, and how it learns.
4. Did the picture help? Compare the linear model, the image-only CNN, and the hybrid using test-A numbers.
5. Explain the differences between your validation, test-A, and test-B results.
6. How accurate was the gender model, compared with its baselines? Give one concern about using such a model.
7. Write a 4–5 sentence recommendation to an online clothing retailer: which model, which inputs to ask shoppers for, the expected error on the measurements that matter most for fit, and the main risks.


## Key Terms

- **Silhouette (mask)**: A black-and-white image where the person is one color and the background the other
- **Primary key**: The column (or columns) that uniquely identifies each row of a table
- **Anti-join**: Finding the rows in one table that have no match in another table
- **Reasonableness test**: A check that values make sense given what we know must be true (for example, a wrist is smaller than a forearm)
- **Grouped data**: Rows that are not independent because several come from the same source, such as several photos of one person
- **Data leakage**: When information about the test data sneaks into training, making the scores look better than they really are
- **Baseline**: A simple model that any new model must beat to be worth using
- **Mean absolute error (MAE)**: The average size of the prediction errors, in the units of the target (here, cm)
- **Standardization**: Subtracting the mean and dividing by the standard deviation, so a variable has mean 0 and standard deviation 1
- **Convolutional neural network (CNN)**: A neural network that slides small filters across an image to find local patterns, such as edges and curves
- **Multi-output regression**: One model predicting several numbers at once (here, 14 measurements)
- **Early stopping**: Stopping training when the validation loss stops improving, and keeping the best weights
- **Hybrid model**: A model that combines image features with ordinary numeric inputs
- **Distribution shift**: When the data a model sees in use differs from the data it was trained on
- **Saliency map**: An image showing which input pixels most affect a prediction
