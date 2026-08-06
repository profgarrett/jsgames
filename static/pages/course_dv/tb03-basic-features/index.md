# Shaping Data in Tableau

This module is about everything that happens to your data *before* a chart appears. You will reshape a source file, combine two tables, remove rows you do not want, and control the order things are drawn in.

The reason to treat these together is that Tableau applies them in a fixed sequence, called the **order of operations**. Many confusing results are the pipeline running in an order you did not expect.

**Outcomes**:

- Reshape wide columns into tall rows with a pivot
- Clean a messy spreadsheet header with the Data Interpreter
- Split one field into multiple fields, including a custom delimiter
- Combine two tables, and explain the difference between a relationship and a join
- Predict what a one-to-many join does to a `SUM()`
- Filter at the row level and at the aggregate level, and connect each to SQL's `WHERE` and `HAVING`
- Use a context filter to make a Top N filter behave correctly
- Sort by value, by category name, and manually
- Add fields and formatting to a tooltip

**Links**:

- See DataCamp *Analyzing Data in Tableau*
- [Problem Datafile](tb42_countydata.xlsx)
- [Tableau's Order of Operations](https://help.tableau.com/current/pro/desktop/en-us/order_of_operations.htm)

## The Pipeline

Tableau runs these steps in order, top to bottom. You do not choose the order; you choose where in it your work happens.

| Step | What happens | Where you control it |
| --- | --- | --- |
| 1. Source | Pivot, join/relate, split, Data Interpreter | Data Source tab |
| 2. Data source filters | Rows removed before anything else sees them | Data Source tab, top right |
| 3. **Context filters** | Creates a temporary subset for later filters to act on | Right-click a filter → `Add to Context` |
| 4. **Row-level filters** and **Top N** | Rows removed. Runs *before* aggregation | Filters shelf |
| 5. Aggregation | `SUM`, `AVG`, `COUNT` collapse many rows into one | The pills in your view |
| 6. **Aggregate filters** | Groups removed based on the aggregated result | Filters shelf |
| 7. The view | Sort, tooltip, formatting | Toolbar, Marks card |

If you know SQL, steps 4–6 are already familiar: a row-level filter is `WHERE`, and an aggregate filter is `HAVING`. `WHERE` throws out rows before `GROUP BY` runs; `HAVING` throws out groups after. Tableau works the same way with different words.


## Step 1: Reshaping at the Source

Everything in this section happens on the **Data Source** tab, before you touch a sheet.

### The Data Interpreter

Real spreadsheets have titles, blank rows, and source URLs above the actual data. Tableau connecting to one of these reads the title as a field name and the whole file becomes garbage.

When Tableau detects this, a **Use Data Interpreter** checkbox appears in the left pane of the Data Source tab. Check it. Tableau finds the real header row and re-reads the file. Click `Review the results` to confirm it guessed right before moving on.

### Pivot: wide to tall

Data collected by humans is usually **wide**, with one column per year, per month, or per product. Tableau wants it **tall**, with one column holding the category, one column holding the value.

**Wide (hard for Tableau)**

| State | 2024 | 2023 | 2022 |
| --- | ---: | ---: | ---: |
| Alabama | 65,560 | 62,230 | 63,870 |
| Alaska | 91,260 | 100,700 | 95,670 |

**Tall (what Tableau wants)**

| State | Year | Income |
| --- | --- | --- |
| Alabama | 2024 | 65,560 |
| Alabama | 2023 | 62,230 |
| Alabama | 2022 | 63,870 |
| Alaska | 2024 | 91,260 |
| Alaska | 2023 | 100,700 |
| Alaska | 2022 | 95,670 |

Wide data cannot be charted over time, because "year" is not a field — it is spread across three field *names*. Pivoting turns those names into values.

Process:

- On the **Data Source** tab, click the first column to pivot
- Ctrl-click (Cmd-click on Mac) each additional column
- Right-click any selected header → `Pivot`
- Rename the two new fields. Tableau names them `Pivot Field Names` and `Pivot Field Values`; call them something like `Year` and `Median Income`
- Set the data type on the new fields — a pivoted year usually arrives as a string


### Split

Split breaks one text field into several using a delimiter. `Autauga County, Alabama` becomes `Autauga County` and `Alabama`.

- Right-click a field → `Split`. Tableau guesses the delimiter and creates new fields.
- Right-click → `Custom Split` when Tableau guesses wrong, or when your delimiter is something Tableau does not look for (` - `, `|`, a tab). You choose the delimiter, whether to split from the first or last occurrence, and how many columns to produce.
- **Split works on string fields only.** It does not appear in the menu for numbers or dates.
- Split is available in both the Data pane and on the Data Source tab.

Always **rename** the new fields (`Split 1` tells you nothing) and **check the data type**. A field split off a text column arrives as text even when it looks numeric.

Some fields need two passes. `Alabama, AL - South` split on the comma gives `Alabama` and ` AL - South`; a custom split of that second field on ` - ` gives `AL` and `South`.

It's generally safer to pick `Custom Split` and tell Tableau exactly what to do, rather than relying on its guess. Also tell it it pick only the first item, or only the last item, if you know that is what you want. Otherwise it will create multiple new fields if you have a row in your datasource containing multiple delimiters.


### Relationships vs. Joins

This is the part of Tableau that has changed most, and the part most likely not to match older instructions you find online.

Drag a second table onto the Data Source canvas and Tableau draws a **noodle** — a flexible line — between the two tables. That is a **relationship**, not a join. Relationships live in the **logical layer** and are Tableau's default since 2020.2.

To create an actual **join**, double-click a table to open the **physical layer**, then drag the second table *inside* that window. You get the familiar Venn-diagram icon and can pick a join type.

| | Relationship (the noodle) | Join (the Venn icon) |
| --- | --- | --- |
| Layer | Logical (default canvas) | Physical (double-click a table to enter) |
| When it runs | At query time, per sheet, only if needed | Immediately, once, for the whole source |
| Level of detail | Each table keeps its own | Flattened into one wide table |
| Duplicates measures? | **No** | **Yes, easily** |

**Use a relationship unless you have a reason not to.** It is the default, it is safer, and it is what the rest of this course assumes.

### Join types

If you do drop into the physical layer, you choose how unmatched rows are handled:

| Join | Keeps |
| --- | --- |
| Inner | Only rows with a match in both tables |
| Left | All rows from the left table; nulls where the right has no match |
| Right | All rows from the right table |
| Full outer | Everything from both, nulls on either side |

Real data almost always has unmatched keys — a county with no state record, a state total row with no counties. After joining, check for nulls before you trust any number.

> **Join keys and leading zeros.** State FIPS codes are `01`, `02`, `04`. If one table stores them as text and the other as a number, `01` and `1` will not match and your join silently produces nothing. This is the same leading-zero problem from tb01 — check the data type icon on both key fields before joining.

### Join inflation, or why your total tripled

This is the most expensive mistake in this module, because it produces a wrong number rather than an error message.

A **one-to-many** join duplicates rows on the "one" side. Join a table of 3,136 counties to a table of state income that has *three rows per state* (2022, 2023, 2024), and every county now appears three times. Nothing looks broken. But:

- `SUM([Total Population])` is now **three times** the real population
- `COUNT()` of counties is three times too high
- `AVG()` happens to survive, since each value is duplicated equally — which makes the problem even easier to miss

Two defenses:

1. **Use a relationship instead of a join.** Relationships preserve each table's own level of detail and do not inflate `SUM()`. This is the single best reason they exist.
2. **Check your row count.** Before and after combining tables, put `Number of Records` (or `COUNT()`) on a sheet. If it jumped by a clean multiple, you inflated.

> **Check your work:** click any mark → `View Data`. If one county shows three rows, you have a problem.


## Steps 2–6: Filtering

### Row-level vs. aggregate

There are two questions a filter can ask, and they run at different points in the pipeline.

| | Row-level filter | Aggregate filter |
| --- | --- | --- |
| Asks | "Is *this row* included?" | "Is *this group's total* included?" |
| Runs | Before aggregation (step 4) | After aggregation (step 6) |
| SQL | `WHERE` | `HAVING` |
| Example | Population over 50,000 | States whose `SUM(Population)` exceeds 5 million |

A **dimension** dropped on Filters is always row-level — you pick which values to keep.

A **measure** dropped on Filters opens a dialog first, and *that dialog is where you choose which kind of filter you are making*:

- Pick `Sum`, `Average`, `Count`, etc. → **aggregate filter**
- Pick **`All values`** → **row-level filter**

Students who miss the `All values` option assume Tableau cannot filter a measure by row. It can; the option is just easy to click past.

### Adding a filter

- Right-click a cell or mark → `Keep Only` / `Exclude`. Fast, but it silently creates a filter you may forget about — check the Filters shelf afterward.
- Drag a field to the **Filters** shelf. This is the version you control.
  - Dimension → choose values on the `General` tab
  - Measure → choose `All values` for row-level, or an aggregation for aggregate

### Context filters and the Top N trap

Step 4 of the pipeline says row-level filters *and* Top N run at the same time. That sounds harmless until you combine them.

Suppose you want the **10 most distressed counties in West Virginia**:

1. Filter `State` to West Virginia — a row-level dimension filter.
2. Add a Top 10 filter on `County` by distress score.
3. You get the top 10 counties **in the entire country**, not in West Virginia.

Both filters are dimension filters, so they execute simultaneously. The Top N never sees the state filter's results.

The fix is to promote the state filter to an earlier step:

> Right-click `State` on the Filters shelf → **`Add to Context`**. The pill turns gray. It now runs at step 3, before the Top N at step 4, so Top N acts on West Virginia counties only.

That is the whole purpose of context filters. They are not about dashboards, and they are not about clicking on charts — that is a *dashboard filter action*, covered in tb46.

Use context filters sparingly. They create a temporary table, which costs performance, so add one when the order of operations requires it, not by habit.

### Data source and extract filters

These sit at the very top of the pipeline and remove rows before anything else runs. You will not need them for this module's assignment, because the datasets are small files. They matter when you are pulling from a large database or building an extract.

### Filter display options

Right-click a filter on the Filters shelf → `Show Filter` to give the reader a control. Then right-click the control that appears:

- **Single value** — radio list, dropdown, or slider
- **Multiple values** — checkbox list, dropdown, custom list, or wildcard match
- **Show "All" option**, **Show search box**, and **Floating** for placement
- Other useful tabs in the filter dialog: **Top** (top or bottom N by a measure), **Condition** (a formula), and **Wildcard** (text matching)

### Pages is not a filter

`Pages` looks like a filter and is not one. It splits the view into a sequence you step through — one page per value of the field, with playback controls. All the data stays in the workbook; you are looking at one slice at a time.

Drag a field to the `Pages` shelf to try it. Use it to animate change over time in a presentation. Do not use it to remove data — that is what the Filters shelf is for.


## Step 7: The View

### Sorting

An unsorted bar chart makes readers compare bars in an arbitrary order. Sorting turns it into a ranking, which is most of what makes bar charts readable. Sort almost every categorical chart you build.

Three ways to sort, in increasing order of control:

1. **Toolbar buttons.** The ascending/descending buttons sort the view by the measure.
2. **Hover icons.** Hover over an axis or a header and a small sort icon appears. Click to cycle through sort states.
3. **Right-click a pill → `Sort`.** The full dialog:
   - `Data source order` — the order rows appear in the file
   - `Alphabetic` — by the field's own name, A–Z or Z–A
   - `Field` — by another field's aggregated value, which is how you sort categories by something they are not displaying
   - `Manual` — drag values into whatever order you want

Manual sort is the one to remember for categories with an inherent order that is not alphabetical: `Quintile 1` through `Quintile 5` sorts correctly by accident, but `Small town / Small urban / Rural` does not.

### Tooltips

The tooltip is the panel that appears when a reader hovers a mark. It is free real estate — detail that would clutter the chart can live there instead.

- Drag a field to **Marks → Tooltip** to add it.
- Click the **Tooltip** button on the Marks card to edit the text, insert fields with the `Insert` menu, and set formatting.
- A **dimension** on Tooltip is wrapped in `ATTR()`. If it displays `*`, that means the mark covers more than one value of that field. That is information, not an error — it tells you your level of detail is coarser than you assumed.
- **Viz in Tooltip:** in the tooltip editor, `Insert` → `Sheets` → pick another worksheet. Hovering a mark now shows an entire chart inside the tooltip, filtered to that mark. It is one click and it is the most impressive thing in this module.


## Key terms

- **Order of operations**: The order of filters and aggregations.
- **Pivot**: Turning wide columns into tall rows.
- **Wide data**: One column per year, month, or product.
- **Tall data**: One column for the category, one column for the value.
- **Data Interpreter**: A feature that removes rows above a table and other spreadsheet problems.
- **Split**: Breaking one text field into several on a delimiter.
- **Delimiter**: A character that separates values in a text field, such as a comma or a dash.
- **Relationship**: A flexible link that preserves each table's level of detail.
- **Join**: A flattening combination that can duplicate rows, similar to a SQL join.
- **Fan-out / join inflation**: Row duplication from a one-to-many join, which inflates `SUM()`.
- **Row-level filter**: Removes rows before aggregation, similar to SQL's `WHERE`.
- **Aggregate filter**: Removes groups after aggregation, similar to SQL's `HAVING`.
- **Context filter**: A filter promoted to run before other filters and Top N. Expensive, as it creates a temporary table.
- **Pages**: Splits a view into a steppable sequence — not a filter.
- **Tooltip**: The panel that appears when a reader hovers a mark, which can contain text, fields, and even another chart.