<script src="/course_dv/toc.js"></script>

# Tableau Interface

This module covers the Tableau interface: how to install Tableau, connect to a data file, read the interface, and build a basic table. Everything in later Tableau modules assumes the vocabulary introduced here.

Why not just use Excel? Excel asks you to *build* a chart by specifying its parts. Tableau asks you to *describe* your data by dragging fields onto shelves, and then draws the chart for you. That trade makes Tableau much faster, but only once you understand how Tableau classifies each field. Most beginner frustration in Tableau is a field classification problem, not a chart problem.

**Outcomes**:

- Install Tableau Desktop and activate a student license
- Connect to an Excel or CSV file, and explain the differences between the two formats
- Identify key interface elements: Data pane, shelves, Marks card, canvas, filters
- Save a Tableau workbook correctly, locally or on Tableau Public
- Identify common data types, including text, integers, decimals, dates, and booleans
- Differentiate between **dimensions** and **measures** (a field's *role*)
- Differentiate between **discrete** and **continuous** fields (how Tableau *draws* it)
- Select among aggregation functions, including sum, average, median, count, max, and min
- Create a basic text table

**Links**:

- See DataCamp *Introduction to Tableau*
- [Quizlet](https://quizlet.com/1128041976/tb01-interface-and-data-flash-cards/?i=2up6jq&x=1jqt)
- [Tableau's official interface reference](https://help.tableau.com/current/pro/desktop/en-us/environment_workspace.htm)

## Before Class: Installation

Install Tableau **before** the first Tableau class meeting. Do not wait; activation problems take time to resolve.

- Download the [latest version of Tableau Desktop](https://www.tableau.com/tft/activation).
- Click the link above and select "Download Tableau Desktop." On the form, enter your school email address for Business E-mail and the name of your school for Organization.
- Activate with your product key: *See eCampus for key*.
- Already have Tableau Desktop installed? Update your license in the application: `Help` → `Manage Product Keys`. Make sure you are on the latest version — workbooks saved in a newer version will not open in an older one.

You also need a **Tableau Public account**, which is free and separate from your Desktop license. Create it at [public.tableau.com](https://public.tableau.com) before class.

## The Interface

Tableau's window has five regions you will use constantly. Open any workbook and find each one before continuing.

![Annotated Tableau interface](interface_annotated.webp)

| Region | Location | What it does |
| --- | --- | --- |
| **Data pane** | Left sidebar | Lists every field in your data source. Fields are split into dimensions (top) and measures (bottom). |
| **Shelves** | Top: Columns, Rows | Where you drag fields to define the structure of the view. Columns is the x-axis; Rows is the y-axis. |
| **Marks card** | Left of the canvas | Controls *how* data is displayed — color, size, label, detail, tooltip, and mark type (bar, line, square, etc.). |
| **Canvas** | Center | The visualization itself. |
| **Filters shelf** | Above the Marks card | Limits which rows are included in the view. |

A field placed on a shelf is called a **pill**. Pills are the basic unit of work in Tableau.

Sheets, dashboards, and stories are managed by the tabs along the bottom of the window. A **sheet** holds one visualization; a **dashboard** combines several.

Buttons worth knowing on the toolbar:

- **Undo / Redo** — Tableau's undo history is deep. Use it freely; experimenting is cheap.
- **Show Me** — suggests chart types for the fields you have selected. Useful for learning, but it hides what is actually happening. Build charts manually in this course unless told otherwise.
- **Clear Sheet** — removes all pills and starts over.

Handy shortcut: hold **Ctrl** (Windows) or **Option** (Mac) while dragging a pill to *copy* it rather than move it.

### Saving

There are two Tableau file formats, and picking the wrong one is the most common way to lose credit on an assignment.

| Extension | Name | Contains data? |
| --- | --- | --- |
| `.twb` | Workbook | **No.** Only a pointer to the file on your computer. |
| `.twbx` | Packaged workbook | **Yes.** Data is bundled inside. |

A `.twb` opens correctly on your machine and appears broken on everyone else's, because the data file it points to does not exist there.

> **Submit all work in this class as a packaged workbook (`.twbx`).**
> `File` → `Save As` → choose *Tableau Packaged Workbook*.

You may also publish to **Tableau Public**, which hosts your workbook on the web. Anything you publish there is visible to anyone with the link and is indexed publicly. Never publish sensitive, confidential, or personally identifying data to Tableau Public.

## Connecting to Data

Tableau connects to many sources — databases, spreadsheets, flat files, and cloud services. This course uses Excel and CSV files. Databases are covered in the SQL modules.

| | Excel (`.xlsx`) | CSV (`.csv`) |
| --- | --- | --- |
| Sheets | Multiple | One |
| Formatting | Yes | None |
| Stored data types | Yes — Excel remembers a cell is a date | **No** — everything is text on disk |
| File size | Larger | Smaller |
| Opens in anything | No | Yes |

The last two rows matter most. Because a CSV stores no type information, Tableau has to *guess* the type of every column when it connects. It guesses well, but not always: leading zeros in a ZIP code get dropped, and an ID column becomes a number Tableau wants to add up. Always check the types on the Data Source tab after connecting to a CSV.

Once connected, Tableau shows a preview on the **Data Source** tab. Do basic cleaning here before building anything:

- Remove unnecessary fields (right-click → `Hide`)
- Rename fields to something readable (right-click → `Rename`)
- Fix any data type Tableau guessed wrong (click the type icon above the column name)

### Data Types

Every field has exactly one data type. Tableau shows it as a small icon next to the field name in the Data pane.

- **String** (`Abc`) — text such as names and categories
- **Number (whole)** (`#`) — integers, no decimal point
- **Number (decimal)** (`#`) — values with a decimal point, stored as floating point
- **Boolean** (`T|F`) — True or False
- **Date** (calendar icon) — a calendar date
- **Date & Time** (calendar + clock) — a date with a time of day

Two clarifications that trip students up:

**Money is not a Tableau data type.** Some databases have a dedicated money type (SQL Server's `MONEY` is a fixed-point number with four decimal places), which avoids the tiny rounding errors that come with floating-point decimals. Tableau has no such type. Currency in Tableau is a decimal number plus a *display format*: right-click the field → `Default Properties` → `Number Format` → `Currency`.

**Geographic is not a data type either.** Country, state, county, city, and ZIP are **geographic roles** layered on top of a string or number. Assign one with right-click → `Geographic Role`. Once assigned, Tableau generates Latitude and Longitude fields so the field can be mapped. Maps are covered in tb45.

Dates are more flexible than students expect. Tableau parses many written formats and does **not** require a full day/month/year — a column of years, or of year-months, works fine. What Tableau cannot do is parse an inconsistent column, so check the Data Source preview for nulls after connecting.

## The Two Questions Tableau Asks About Every Field

This is the central idea of the module. For every pill you place, Tableau needs two independent answers:

1. **Role — is it a dimension or a measure?** Dimensions *slice* the data; measures get *aggregated*. Tableau separates these in the Data pane.
2. **Type — is it discrete or continuous?** Discrete pills are **blue** and produce headers. Continuous pills are **green** and produce axes.

These are two separate questions, not one. A field can be any of the four combinations.

| | **Discrete (blue) — headers** | **Continuous (green) — axes** |
| --- | --- | --- |
| **Dimension**<br>*slices the data* | `Neighbourhood`, `Room Type`<br>(the common case) | `Order Date` as a continuous timeline |
| **Measure**<br>*gets aggregated* | `SUM(Price)` used as a text label in a table | `SUM(Price)` on an axis<br>(the common case) |

**The default: dimensions are discrete and measures are continuous.** That covers most of what you build. The other two cells exist, and you will use them, but they are the exception.

You can change either answer:

- Change the **role**: right-click the field in the Data pane → `Convert to Dimension` / `Convert to Measure`
- Change the **type**: right-click a pill on a shelf → `Discrete` / `Continuous`

A common real case for changing the role: a `Zip Code` or `Store ID` column arrives as a number, so Tableau files it under Measures and tries to sum it. Summing ZIP codes is meaningless. Convert it to a dimension.

### Why Blue and Green Matter Visually

- **Blue (discrete)** → Tableau draws a **header** — one labeled slot per distinct value, in whatever sort order you set.
- **Green (continuous)** → Tableau draws an **axis** — a number line, which may include values not present in your data.

![Blue header versus green axis](pill_blue_green.webp)

Dates show this clearly. Drag a date onto Columns and you get a blue `YEAR(Date)` pill — a discrete header per year, with a `+` to drill into quarters and months. Right-click it and choose the green continuous version and you get an unbroken timeline instead. Line charts usually want the green version.

## Aggregation

**Tableau aggregates measures automatically.** Drag `Price` onto a shelf and the pill reads `SUM(Price)` — one number, the total of every row. This surprises nearly everyone the first time. Tableau is not showing you rows; it is showing you a summary of the rows in each cell of your view.

The dimensions in your view control the level of that summary. `SUM(Price)` with no dimensions is one grand total. Add `Neighbourhood` to Rows and it becomes one sum per neighborhood.

To change the function, click the pill → `Measure` → and choose:

| Function | Returns |
| --- | --- |
| `SUM` | Total of all values (Tableau's default for numbers) |
| `AVG` | Mean — sum divided by count |
| `MEDIAN` | Middle value when sorted |
| `COUNT` | Number of non-null rows |
| `COUNTD` | Number of *distinct* values |
| `MIN` / `MAX` | Smallest / largest value |

"Average" is ambiguous in everyday speech, and the three meanings give different answers on skewed data:

- **Mean** — sum ÷ count. Pulled hard by outliers.
- **Median** — the middle value when sorted. Resistant to outliers.
- **Mode** — the most common value. Tableau has no `MODE` aggregation; it requires a calculated field.

Airbnb prices are a good illustration: a handful of $2,000/night listings pull the mean well above the median. Report the median unless you have a reason not to.

## Build a Table

The exercise uses `airbnb_listings.csv`, posted on eCampus. It has one row per listing, with fields including `Neighbourhood`, `Room Type`, `Price`, `Bedrooms`, `Review Scores Rating`, and `Last Review`.

**Process — average price by neighborhood and room type:**

1. `Connect` → `To a File` → `Text file` → select `airbnb_listings.csv`.
2. On the Data Source tab, confirm the types. `Price` should be Number (decimal); `Last Review` should be Date.
3. Click `Sheet 1`.
4. Drag `Neighbourhood` to **Rows**. Tableau draws a blue header — one row per neighborhood, no numbers yet.
5. Drag `Room Type` to **Columns**. You now have an empty grid.
6. Drag `Price` to **Marks → Text**. The pill reads `SUM(Price)`.
7. Click the `SUM(Price)` pill → `Measure` → `Average`. It now reads `AVG(Price)`.
8. Right-click `Price` in the Data pane → `Default Properties` → `Number Format` → `Currency (Standard)`, 0 decimals.
9. Sort by clicking the sort icon on the `Neighbourhood` header.
10. `File` → `Save As` → **Tableau Packaged Workbook (.twbx)**.

Then, to see the aggregation idea directly: change `AVG` to `MEDIAN` and watch which neighborhoods move most. Those are the ones with a few very expensive listings.

![Finished crosstab](table_airbnb_crosstab.webp)

### Is a Table a Chart?

Not quite. A table encodes values as **text**, which readers process one cell at a time. A chart encodes values as **visual properties** — position, length, color, size — which readers compare at a glance without reading anything.

That distinction is what module dv30 covers under *pre-attentive attributes*. The two forms are not rivals: tables are better when readers need exact values, charts are better when they need to see a pattern. You can also blend them by adding color to a table, which is what the example below does.

![Table example with highlight](table_25_years_oftv.webp)
Source: <https://www.reddit.com/r/dataisbeautiful/comments/1qaq7kz/a_quarter_century_of_television_oc/> by gammafission00

## Vocabulary

| Term | Meaning |
| --- | --- |
| Pill | A field placed on a shelf |
| Dimension | A field that slices data into groups |
| Measure | A field that gets aggregated |
| Discrete | Blue pill; produces headers |
| Continuous | Green pill; produces an axis |
| Shelf | A drop zone (Columns, Rows, Filters, Pages) |
| Marks card | Controls color, size, label, detail, and mark type |
| Aggregation | The function collapsing many rows to one value |
| `.twb` | Workbook — does **not** contain data |
| `.twbx` | Packaged workbook — contains data |
| Geographic role | A mapping role assigned on top of a string or number |

## Check Your Understanding

1. You drag `Price` onto Rows and see a single bar. Why, and what do you add to break it apart?
2. `Zip Code` appears under Measures. What is wrong, and how do you fix it?
3. A classmate emails you a `.twb` and it will not open. What happened?
4. When would you deliberately want a green (continuous) dimension?
5. Mean nightly price is \$210 and median is \$140. What does that gap tell you about the listings?

## Submission

Submit a `.twbx` containing one sheet: median price by neighborhood and room type, sorted descending by median price, with currency formatting applied. Include a caption sheet naming the neighborhood with the largest mean-to-median gap.

---

<!--
AUTHOR NOTES — delete before publishing.

FIGURES TO SHOOT (3 new, 1 reused):

1. interface_annotated.webp
   Full Tableau Desktop window, airbnb_listings.csv connected, a sheet in
   progress so all regions have content in them (empty shelves photograph
   badly). Five numbered callouts in a consistent accent color, matching the
   table order in the text: 1 Data pane, 2 Columns/Rows shelves, 3 Marks card,
   4 Canvas, 5 Filters shelf. Add a sixth small callout on a single pill
   labeled "pill." Crop out OS chrome. Shoot at >=1600px wide so the field
   names stay legible when the page scales down.

2. pill_blue_green.webp
   Side-by-side, same data both panels. LEFT: blue discrete YEAR(Last Review)
   on Columns -> labeled headers. RIGHT: same field as green continuous ->
   axis with tick marks. Caption each half "Blue = header" / "Green = axis."
   The point is the visual difference in the resulting view, so crop tight to
   the shelf plus the top of the canvas. Keep the pill colors true; do not
   apply a filter or color grade to the screenshot.

3. table_airbnb_crosstab.webp
   The finished step-10 crosstab: neighborhoods down Rows, room types across
   Columns, currency-formatted AVG(Price), sorted. Include the shelves and
   Marks card in frame so students can check their own work against the pill
   placement, not just the output.

4. table_25_years_oftv.webp
   Already have this one; reused unchanged.

VERIFY BEFORE PUBLISHING:

- Copy-a-pill shortcut. Ctrl+drag on Windows is certain; Option+drag on Mac is
  from memory and worth one test on your machine.
- No MODE aggregation in Tableau. Confident, but confirm in the current
  version's Measure menu since students will go looking.
- Dataset field names. I used Inside Airbnb-style names (Neighbourhood with
  the British spelling, Room Type, Last Review). Swap in whatever your posted
  CSV actually uses, in the walkthrough and in the exercise.
- Tableau Public account as a prerequisite. Added to the install section on
  the assumption you want it done before class; drop it if publishing comes
  later in the term.

CROSS-REFERENCES ADDED:
- dv30 (pre-attentive attributes) from the table-vs-chart section
- tb45 (maps) from the geographic roles paragraph
- SQL modules from the data sources paragraph
Note that dv20 covers discrete/continuous generically in Week 2, one week
after this module. This chapter now defines the terms in Tableau-specific
form (blue/green pills) first, so dv20 may want a back-reference rather than
a fresh definition.

CHANGES FROM THE ORIGINAL:
- Fixed the inverted sentence. Original read "We commonly use discrete
  measures and continuous dimensions"; the default is the reverse.
- Split role (dimension/measure) from type (discrete/continuous) into two
  independent questions with a 2x2. Originally discrete/continuous appeared as
  bullets under dimensions, implying it was a sub-type.
- Rewrote the money passage. Original said money is "an integer that records
  the number of pennies"; SQL Server's MONEY is fixed-point with four decimal
  places, and Tableau has no money type at all.
- Moved geographic from data types to geographic roles.
- Dropped the claim that dates require day + month + year.
- Removed mode from the aggregation list and explained why.
- Added: auto-aggregation, .twb/.twbx extensions, Tableau Public account,
  the walkthrough, vocabulary table, check-your-understanding, submission.
- Reframed table vs chart around text-vs-visual encoding rather than
  pre-attentive attributes, since a plain bar chart has neither color nor size.
-->
