# Understanding Your Data

### dv20 — Data Values and Structure

Nathan Garrett, PhD CPA

*Department of Accounting and Information Systems, WVU*

Note: Arrow keys or space to advance. Down arrow reveals answers on question slides.

---

## Why This Module Exists

Most data errors are **silent**.

The computer will happily average a ZIP Code, sum a subtotal row, and
count the same invoice twice.

It will never warn you.

---

## Four Questions To Ask

1. What is **each field**? (type, key, scale, coding)
2. What is **each row**? (unit of observation, structure)
3. What is **wrong** with the values?
4. What **math** is allowed on this field?

---

# Part 1

## Understand a Field

---

## Storage Type

How the software physically stores the value.

| Field           | Value      | Storage Type |
| --------------- | ---------- | ------------ |
| Customer ID     | 10245      | Integer      |
| Customer Name   | Bob Jones  | String       |
| Revenue         | 1250.75    | Decimal      |
| Order Date      | 2026-07-29 | Date         |
| Active Customer | True       | Boolean      |

---

## Storage Type: The Leading Zero Trap

ZIP Codes in CT, MA, ME, NH, and NJ begin with `0`.

| Stored As | Newark, NJ |
| --------- | ---------- |
| Integer   | `7102` ❌   |
| Text      | `07102` ✅  |

A number is not always a *number*.

---

## Keys

A key distinguishes one record from another. It may be text or numeric.

**Primary key** — uniquely identifies a row *in this table*.

**Foreign key** — identifies a row *in another table*.

**Composite key** — two or more fields combined.

---

## Keys Illustrated

**Orders table**

| OrderID (PK) | CustomerID (FK) | Amount |
| ------------ | --------------- | -----: |
| 1001         | C204            | 125.00 |
| 1002         | C318            |  80.00 |

**Store-day sales** — neither field alone is unique

| StoreNum | Date       | Sales |
| -------- | ---------- | ----: |
| 14       | 2026-07-01 |  2100 |
| 14       | 2026-07-02 |  1875 |
| 22       | 2026-07-01 |  3050 |

`StoreNum + Date` = composite key

---

## Measurement Scale

Determines which comparisons and calculations are *meaningful*.

| Scale    | Order? | Equal gaps? | True zero? | Example         |
| -------- | ------ | ----------- | ---------- | --------------- |
| Nominal  | No     | No          | No         | State, Dept     |
| Ordinal  | Yes    | No          | No         | Low/Med/High    |
| Interval | Yes    | Yes         | No         | Temperature °F  |
| Ratio    | Yes    | Yes         | Yes        | Revenue, Weight |

---

## Nominal

Categories with no inherent order.

`WV` `PA` `OH` `CA`

Sorting them alphabetically is a convenience, not a meaning.
There is no "more" or "less."

---

## Ordinal

Ordered categories, but the distance between them is unknown or unequal.

`Low` → `Medium` → `High`

⭐ → ⭐⭐ → ⭐⭐⭐ → ⭐⭐⭐⭐ → ⭐⭐⭐⭐⭐

The gap from 1★ to 2★ is not necessarily the gap from 4★ to 5★.

---

## Interval

Equal distances, but **zero is arbitrary**.

60°F − 50°F = 10°F  ✅ meaningful

60°F ÷ 30°F = "twice as hot"  ❌ meaningless

0°F does not mean "no temperature."

---

## Ratio

Equal distances **and** a true zero.

$200 is meaningfully twice $100.

$0 in revenue means no revenue.

Ratios, growth rates, and percentages all work.

---

## Coding

How the same real-world category gets written down.

| Meant to be | Actually appears as               |
| ----------- | --------------------------------- |
| Male        | `Male`, `M`, `male`               |
| West Virginia | `West Virginia`, `WV`, `W.Va.`  |
| Yes         | `Yes`, `Y`, `1`, `True`           |
| Missing     | `Not Available`, `N/A`, `Unknown` |

Same meaning to a human. **Four different groups** to the software.

---

## Data Dictionary

A *data dictionary* (codebook) documents what each field and each coded
value means.

> `status` — 1 = active account, 0 = closed account, 9 = under review

Without it, you are guessing. Guessing is how silent errors start.

---

## Identify the Concept

The next slides give a situation.

Name which **field-level concept** it illustrates:

*storage type · primary key · foreign key · composite key ·
nominal · ordinal · interval · ratio · coding · data dictionary*

---

## Q1

An HR export stores Employee IDs as `00417`, `00418`, `00419`.

When opened in Excel they become `417`, `418`, `419`.

**Which concept?**

--

### A1 — Storage Type

The IDs must be stored as **text**, not integer, to preserve leading zeros.

Same trap as ZIP Codes: it looks numeric, but no arithmetic is ever
performed on it.

---

## Q2

A loan file rates each borrower as `Low`, `Moderate`, `High`, or `Severe`.

**Which concept?**

--

### A2 — Ordinal

The categories have a clear order, but we cannot claim the distance from
Low to Moderate equals the distance from High to Severe.

Median is defensible. Mean is questionable.

---

## Q3

An `Order` table has a `CustomerID` column. Every value in it also appears
in the `Customer` table's ID column.

**Which concept?**

--

### A3 — Foreign Key

`CustomerID` is the **primary key** in the Customer table and a
**foreign key** in the Order table.

It is how the two tables join.

---

## Q4

A daily inventory table repeats each SKU and repeats each warehouse.
Only `SKU + Warehouse + Date` together identify one row.

**Which concept?**

--

### A4 — Composite Key

No single field is unique. Three fields combine to form the key.

This also tells you the **unit of observation**: one SKU, in one
warehouse, on one day.

---

## Q5

A survey field contains `Y`, `Yes`, `1`, `TRUE`, and `yes`.

**Which concept?**

--

### A5 — Coding

Five representations of one category.

A bar chart of this field produces five bars where there should be one.

---

## Q6

A campus sensor records building temperature in °C. An analyst reports
that the atrium at 24°C is "twice as warm" as the lobby at 12°C.

**Which concept?**

--

### A6 — Interval

Celsius has equal intervals but no true zero, so ratios are meaningless.

The difference (12 degrees) is fine. The ratio is not.

---

# Part 2

## Understand a Table

---

## Cross-Sectional

Multiple entities, **one point in time**. One row per entity.

| Student | Average GPA | Class Level |
| ------- | ----------- | ----------- |
| Bob     | 4.0         | Senior      |
| Sarah   | 3.5         | Junior      |
| Tim     | 2.5         | Freshman    |

A snapshot.

---

## Longitudinal

Repeated observations. An entity appears **many times**.

| Student | Average GPA | Class Level |
| ------- | ----------- | ----------- |
| Bob     | 4.0         | Senior      |
| Bob     | 3.0         | Junior      |
| Sarah   | 3.5         | Junior      |
| Sarah   | 3.0         | Sophomore   |
| Tim     | 2.5         | Freshman    |

A history. Counting rows here does **not** count students.

---

## Transaction Data

One row per business event.

| Transaction ID | Customer ID | Date       | Amount |
| -------------- | ----------- | ---------- | -----: |
| T1001          | C204        | 2026-07-01 | 125.00 |
| T1002          | C318        | 2026-07-01 |  80.00 |
| T1003          | C204        | 2026-07-03 | 210.00 |

C204 appearing twice is **expected**, not an error.

---

## Roll-Up Data

Detail rows and summary rows **in the same table**.

| Location      | Month    | Sales |
| ------------- | -------- | ----: |
| New York City | January  |  1000 |
| New York City | February |  1200 |
| New York City | Total    |  2200 |
| Los Angeles   | January  |   800 |
| Los Angeles   | February |   900 |
| Los Angeles   | Total    |  1700 |

True total: **3,900**. Sum of every row: **7,800**.

---

## Spotting Summary Rows

Very common in government data. Look for:

- Labels such as `Total`, `Subtotal`, `All`
- Geographic aggregation codes (state row mixed with county rows)
- Classification-level fields (industry vs. sub-industry)
- Blank key values
- A flag supplied by the data source

---

## Wide Data

One variable spread across **several columns**.

| Student | Math | English | History |
| ------- | ---: | ------: | ------: |
| Alice   |   95 |      88 |      92 |
| Bob     |   87 |      91 |      85 |

Readable for humans. Awkward for charts — "Subject" is not a field
you can drop on an axis.

---

## Long Data

Categories in one column, measurements in another.

| Student | Subject | Score |
| ------- | ------- | ----: |
| Alice   | Math    |    95 |
| Alice   | English |    88 |
| Alice   | History |    92 |
| Bob     | Math    |    87 |
| Bob     | English |    91 |
| Bob     | History |    85 |

Now `Subject` is a field. This is what Tableau wants.

---

## Identify the Concept

Name which **table-level concept** applies:

*cross-sectional · longitudinal · transaction · roll-up · wide · long*

---

## Q7

An HR file lists every current employee with their salary as of
December 31, 2026. Each employee appears exactly once.

**Which concept?**

--

### A7 — Cross-Sectional

One row per entity, one point in time. A snapshot.

Row count = employee count.

---

## Q8

A utility file records one meter reading per customer per month for
three years.

**Which concept?**

--

### A8 — Longitudinal

Each customer appears 36 times.

`COUNT(rows)` counts readings, not customers. Use a **distinct count**
of customer ID.

---

## Q9

A downloaded BLS file lists employment for each county, and after every
group of counties there is a row for the state.

**Which concept?**

--

### A9 — Roll-Up

The state rows are summaries of the county rows above them.

Filter them out, or you double every number in the chart.

---

## Q10

A spreadsheet has columns: `Region`, `FY2023`, `FY2024`, `FY2025`, `FY2026`.

**Which concept?**

--

### A10 — Wide

The variable "fiscal year" is spread across four columns.

To chart revenue over time you must reshape it to
`Region | Year | Revenue`.

---

## Q11

A point-of-sale export has one row for every item scanned, with a
receipt number, timestamp, SKU, and price.

**Which concept?**

--

### A11 — Transaction

One row per business event. The unit of observation is the *line item*,
not the customer and not the receipt.

---

## Q12

A file has columns `Store`, `Quarter`, `Sales` — with four rows per store.

**Which concept?**

--

### A12 — Long

Quarter is a value in a column, not a set of columns.

Chart-ready.

---

# Part 3

## Check for Problems

---

## Missing Values

The value is not available. It hides in many costumes:

`NULL` · `NaN` · empty cell · `""` · `"N/A"` · `"Unknown"` · `-999`

---

## Missing Values: Why It Matters

The *reason* changes the fix:

- Not collected
- Unknown
- Does not apply to this row
- Not yet entered
- Lost in processing
- Suppressed for privacy
- Respondent declined

**Diagnose before you delete or impute.**

---

## Invalid Values

Violates a known business or logical rule.

| Value                          | Rule broken           |
| ------------------------------ | --------------------- |
| Employee age `150`             | Human lifespan        |
| Quantity sold `-2`             | Non-negative quantity |
| Ship date before order date    | Sequence of events    |
| State code `XX`                | Domain of valid codes |
| Percent complete `140`         | Range 0–100           |

---

## Outlier Values

Far from most other observations — but **not automatically wrong**.

| Observation                | Typical  |
| -------------------------- | -------- |
| Purchase of $1,000,000     | Under $500 |
| Delivery in 30 days        | 3 days   |
| 120 hours worked in a week | 40 hours |

---

## Outliers: What Might Cause It

Data-entry error · measurement error · a valid unusual event · fraud ·
a new customer segment · a seasonal spike · a broken business process ·
two different populations mixed together

In business analytics the outlier is often the **most important record
in the file**. Never delete it reflexively.

---

## Finding Outliers

- Sort the values
- Check min and max
- Histogram
- Box plot
- Interquartile range
- Compare to domain limits
- Compare **within relevant groups**

A $100,000 sale is an outlier for a retail customer and routine for a
wholesale customer.

---

## Duplicate Records

The same observation appears more than once. Consequences:

- Revenue overstated
- Customers counted twice
- Inventory inflated
- Some survey respondents weighted double
- Models over-fit to repeated rows

**But**: a repeated value is not a duplicate. Judge it against the
unit of observation.

---

## Identify the Concept

Name which **data-quality concept** applies:

*missing · invalid · outlier · duplicate · none of these*

---

## Q13

A shipping table shows an order placed `2026-03-15` and shipped
`2026-03-01`.

**Which concept?**

--

### A13 — Invalid

The ship date precedes the order date. This breaks a logical rule, no
matter how plausible each date looks alone.

Often caused by a bad join or a default date.

---

## Q14

In a customer table, the `Age` field contains `-999` for 40 rows.

**Which concept?**

--

### A14 — Missing

`-999` is a placeholder, not a value. If you average this column, every
one of those rows drags the mean down enormously.

Invalid is a defensible second answer — the key point is that it is
not a real age.

---

## Q15

Invoice `1002` appears twice: same customer, same date, same amount,
same everything.

**Which concept?**

--

### A15 — Duplicate

The invoice number should be a primary key, so it must appear once.

Check whether it is a true double entry or a legitimate second invoice
that was mis-numbered.

---

## Q16

Customer `C204` appears 12 times in a transaction table.

**Which concept?**

--

### A16 — None of These

Expected behavior. The unit of observation is the *transaction*, not the
customer. C204 bought 12 times.

Duplicates are only duplicates relative to the unit of observation.

---

## Q17

A nonprofit's donation file has a median gift of $75 and one gift of
$2.4 million.

**Which concept?**

--

### A17 — Outlier

Investigate — it could be a keying error, or it could be the single most
important donor in the file.

Do not drop it. Consider reporting median alongside mean.

---

## Q18

A project tracker's `PercentComplete` field contains `140`.

**Which concept?**

--

### A18 — Invalid

The field has a defined range of 0–100. A rule is broken.

Possibly a manager's optimism, possibly a formula that double-counted.

---

# Part 4

## Aggregation, Discrete, and Continuous

---

## Aggregation

Combining rows into a summary: sum, count, mean, median, min, max.

The right choice depends on the field's **meaning**, not its
storage type.

| Field               | Appropriate                          |
| ------------------- | ------------------------------------ |
| Revenue             | Sum, mean, median                    |
| Quantity sold       | Sum, mean                            |
| Customer ID         | Count or distinct count              |
| Product category    | Count or percentage                  |
| Satisfaction rating | Count, percentage, median, sometimes mean |
| ZIP Code            | Count or distinct count              |

---

## The Aggregation Rule

> A numeric storage type does not make summing or averaging appropriate.

An average ZIP Code is a number. It is also nonsense.

---

## Discrete (Tableau's Usage)

A **limited** number of possible values. Text or numeric.

- Star rating: 1–5
- Customer segment: high / medium / low, or 1 / 2 / 3
- State: WV, CA, NY
- Is Student: 1 or 0

Tableau draws these as separate headers — one per value.

---

## Continuous (Tableau's Usage)

A **large** number of values within a range. Precision depends on how
it was measured.

- Revenue: $23,287
- Product weight: 87.2345 lbs

Tableau draws these as an axis.

---

## A Note on Categorical

Traditionally there is a third role: **categorical** — names, addresses,
product categories.

Tableau has no separate categorical type. In this course we follow
Tableau's two-role model.

Note: Instructor note — the course text groups names and addresses under "continuous." In the Tableau interface itself a string field can only be placed as a discrete pill; Tableau will not offer a continuous option for text. Decide how you want to phrase this for your students.

---

## Identify the Concept

Name which **aggregation or role concept** applies:

*wrong aggregation · appropriate aggregation · discrete · continuous*

---

## Q19

A dashboard shows "Average ZIP Code: 41,208" for the customer base.

**Which concept?**

--

### A19 — Wrong Aggregation

ZIP Code is a **nominal label** that happens to be numeric.

Correct answer: count, or distinct count of ZIP Codes served.

---

## Q20

An analyst reports the **median** star rating for each product, plus the
count of reviews.

**Which concept?**

--

### A20 — Appropriate Aggregation

Ratings are ordinal. Median and counts respect the order without
assuming equal spacing between stars.

Reporting the count alongside prevents a 5.0 built on one review.

---

## Q21

A field records product weight to four decimal places: `87.2345` lbs.

**Which concept?**

--

### A21 — Continuous

Effectively unlimited values within a range. Precision is a property of
the scale used, not of the categories.

Tableau will give it an axis.

---

## Q22

A field records `Customer Segment` as `1`, `2`, or `3`.

**Which concept?**

--

### A22 — Discrete

Only three possible values, and the numbers are labels.

Summing segment codes is meaningless — Tableau's default of `SUM` here
is a trap. Convert it to a dimension.

---

## Q23

A finance team sums the `Revenue` column of a transaction table to get
annual revenue.

**Which concept?**

--

### A23 — Appropriate Aggregation

Revenue is a ratio-scaled measure and each row is a distinct event, so
sum is correct.

Only caveat: confirm there are no roll-up rows or duplicates hiding in
the table.

---

## Q24

A team sums the `InventoryOnHand` column across 12 monthly snapshot rows
for the same SKU.

**Which concept?**

--

### A24 — Wrong Aggregation

Each row is a snapshot of the *same* inventory, not a new quantity.
Summing counts the same units twelve times.

Use the latest value, or an average across periods.

---

# Putting It Together

---

## Application 1 — Invoice Extract

| Invoice | Customer | State         | Quantity | Revenue | Status |
| ------- | -------- | ------------- | -------: | ------: | ------ |
| 1001    | C101     | WV            |        2 |  200.00 | Paid   |
| 1002    | C102     | West Virginia |        1 |  125.00 | paid   |
| 1002    | C102     | West Virginia |        1 |  125.00 | paid   |
| 1003    | C103     | PA            |       -2 |  250.00 | NULL   |
| Total   |          |               |        2 |  700.00 |        |

**How many problems can you name?**

--

### Eight Problems

1. Invoice `1002` may be **duplicated**
2. `WV` vs. `West Virginia` — inconsistent **coding**
3. `Paid` vs. `paid` — inconsistent **coding**
4. Quantity `-2` — **invalid**, or a return
5. `NULL` status on 1003 — **missing**, investigate
6. The `Total` row is a **roll-up** record
7. Summing Revenue **double-counts** to 1,400
8. The `Invoice` field mixes numeric keys with the text `Total` —
   a **storage type** problem

And: the **unit of observation** is unclear without documentation.

---

## Application 2 — County Grant File

| FIPS  | County     | Program  | Awards | Amount     |
| ----- | ---------- | -------- | -----: | ---------- |
| 54061 | Monongalia | SNAP     |  1,204 | $482,100   |
| 54061 | Monongalia | S.N.A.P. |     96 | $38,400    |
| 54039 | Kanawha    | SNAP     |  2,310 | $915,300   |
| 54049 | Marion     | SNAP     |   -999 | $0         |
|       | Statewide  | All      |  3,610 | $1,435,800 |

**What is wrong here?**

--

### A — County Grant File

- **Roll-up**: the last row is a summary. Two tells — the label `Statewide` / `All`, and the **blank key value** in FIPS.
- **Coding**: `SNAP` and `S.N.A.P.` split one program into two bars.
- **Storage type**: `Amount` holds `$` and commas, so it is **text**. It will not sum until it is converted.
- **Storage type**: FIPS is a nominal label. Stored as an integer, Alabama's `01001` becomes `1001`.
- **Missing**: `-999` is a placeholder, not a count. The `$0` beside it is suspicious too.
- **Unit of observation**: county × program. Notice the statewide total (3,610) excludes Marion.

---

## Application 3 — Advising Report

| Student       | AdvisorID | Fall2025 | Spring2026 | Fall2026 |
| ------------- | --------- | -------: | ---------: | -------: |
| Alice         | A17       |     3.40 |       3.60 |     3.70 |
| Bob           | A17       |     2.90 |            |     4.50 |
| Chen          | A22       |     3.80 |       3.90 |     3.90 |
| Class Average |           |     3.37 |       3.75 |     4.03 |

**What is wrong here?**

--

### A — Advising Report

- **Wide data**: the variable "term" is spread across three columns. Reshape to `Student | Term | GPA` before charting.
- **Roll-up**: `Class Average` is a summary row, and it forces the text `Class Average` into the Student key field.
- **Invalid**: Bob's `4.50` on a 0–4.0 scale breaks a business rule — and it drags the Fall 2026 class average above 4.0.
- **Missing**: Bob's blank Spring GPA. Leave of absence? Not enrolled? Not yet posted? The Spring average silently used n = 2.
- **Foreign key**: `AdvisorID` points to a row in the Advisor table.
- **Ratio**: GPA has a true zero, so averages are defensible — once the invalid value is fixed.

---

## Application 4 — Facility Sensors

| SensorID | Timestamp        | TempF | StatusCode |
| -------- | ---------------- | ----: | ---------- |
| S-04     | 2026-07-14 08:00 |  71.2 | 1          |
| S-04     | 2026-07-14 09:00 |  72.0 | 1          |
| S-04     | 2026-07-14 09:00 |  72.0 | 1          |
| S-11     | 2026-07-14 08:00 |  70.8 | 9          |
| S-11     | 2026-07-14 09:00 | 214.0 | 1          |

**What is wrong here?**

--

### A — Facility Sensors

- **Longitudinal**: each sensor appears repeatedly. Row count ≠ sensor count.
- **Composite key**: `SensorID + Timestamp` identifies a row.
- **Duplicate**: S-04 at 09:00 appears twice — a real duplicate, because it violates that composite key.
- **Outlier**: `214.0` needs investigation. A fire, a failing sensor, or a Celsius reading in a Fahrenheit column.
- **Data dictionary**: what does `StatusCode` 9 mean? Without the codebook you cannot tell whether to keep that row.
- **Interval**: TempF has no true zero. Average it, difference it — but never say one room is "twice as warm."

---

## Application 5 — Retail Line Items

| ReceiptID | StoreZip | CustomerID | Tier | Qty | LineTotal |
| --------- | -------- | ---------- | ---- | --: | --------: |
| R-5001    | 07102    | C204       | 2    |   3 |     44.85 |
| R-5002    | 7102     | C204       | 2    |   1 |     14.95 |
| R-5003    | 02139    | C318       | 3    |  -1 |    -14.95 |
| R-5004    | 02139    | C401       | 1    |   2 |     29.90 |

**What is wrong here — and what is fine?**

--

### A — Retail Line Items

**Fine:**

- C204 appearing twice is **transaction** behavior, not a duplicate. The unit of observation is the receipt line.
- `LineTotal` is ratio-scaled, so **sum** is the right aggregation.

**Wrong:**

- **Storage type**: `07102` and `7102` are the same store. One row lost its leading zero, so the ZIP became a number.
- **Discrete / ordinal**: `Tier` 1–3 is a label with an order. Tableau will default to `SUM(Tier)` — meaningless. Convert it to a dimension.
- **Aggregation**: an average `CustomerID` is nonsense; use **distinct count** to get customers served.
- **Needs a rule**: `Qty = -1` is probably a return, not an invalid value. The data dictionary decides — and returns must be handled deliberately in any revenue chart.

---

## The Habit

Before any chart, for every dataset:

- **Field** → type, key, scale, coding
- **Table** → unit of observation, structure, width
- **Values** → missing, invalid, outlier, duplicate
- **Math** → which aggregation is meaningful

---

## Further Reading

- [Socviz.co, Chapter 1](https://socviz.co/lookatdata.html)
- [Fundamentals of Data Visualization](https://clauswilke.com/dataviz/)
- [The Generational Collapse of American Religion](https://www.graphsaboutreligion.com/p/the-generational-collapse-of-american)

---

# Questions?
