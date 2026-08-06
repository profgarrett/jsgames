<script src="/course_dv/toc.js"></script>

# Shaping Data in Tableau

This module is about everything that happens to your data *before* a chart appears. You will reshape a source file, combine two tables, remove rows you do not want, and control the order things are drawn in.

The reason to treat these together is that Tableau applies them in a fixed sequence, called the **order of operations**. Most of the confusing results in this module — a filter that ignores what you told it, a total that is three times too large — are not bugs. They are the pipeline running in an order you did not expect.

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

Keep this table nearby. Every section below is a step in it.

---

## Step 1: Reshaping at the Source

Everything in this section happens on the **Data Source** tab, before you touch a sheet.

### The Data Interpreter

Real spreadsheets have titles, blank rows, and source URLs above the actual data. Tableau connecting to one of these reads the title as a field name and the whole file becomes garbage.

When Tableau detects this, a **Use Data Interpreter** checkbox appears in the left pane of the Data Source tab. Check it. Tableau finds the real header row and re-reads the file. Click `Review the results` to confirm it guessed right before moving on.

### Pivot: wide to tall

Data collected by humans is usually **wide** — one column per year, per month, or per product. Tableau wants it **tall** — one column holding the category, one column holding the value.

| Wide (hard for Tableau) | | | | Tall (what Tableau wants) | |
| --- | --- | --- | --- | --- | --- |
| **State** | **2024** | **2023** | **2022** | **State** | **Year** / **Income** |
| Alabama | 65,560 | 62,230 | 63,870 | Alabama | 2024 / 65,560 |
| Alaska | 91,260 | 100,700 | 95,670 | Alabama | 2023 / 62,230 |

Wide data cannot be charted over time, because "year" is not a field — it is spread across three field *names*. Pivoting turns those names into values.

Process:

- On the **Data Source** tab, click the first column to pivot
- Ctrl-click (Cmd-click on Mac) each additional column
- Right-click any selected header → `Pivot`
- Rename the two new fields. Tableau names them `Pivot Field Names` and `Pivot Field Values`; call them something like `Year` and `Median Income`
- Set the data type on the new fields — a pivoted year usually arrives as a string

> **Pivot is available for file-based sources** (Excel, CSV, Google Sheets) and some connectors, but not all. For a database connection that does not offer it, you reshape in SQL instead.

### Split

Split breaks one text field into several using a delimiter. `Autauga County, Alabama` becomes `Autauga County` and `Alabama`.

- Right-click a field → `Split`. Tableau guesses the delimiter and creates new fields.
- Right-click → `Custom Split` when Tableau guesses wrong, or when your delimiter is something Tableau does not look for (` - `, `|`, a tab). You choose the delimiter, whether to split from the first or last occurrence, and how many columns to produce.
- **Split works on string fields only.** It does not appear in the menu for numbers or dates.
- Split is available in both the Data pane and on the Data Source tab.

Always **rename** the new fields (`Split 1` tells you nothing) and **check the data type**. A field split off a text column arrives as text even when it looks numeric.

Some fields need two passes. `Alabama, AL - South` split on the comma gives `Alabama` and ` AL - South`; a custom split of that second field on ` - ` gives `AL` and `South`.

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

> **Check your work:** click any mark → `View Data`. If one county shows three rows, you have a fan-out.

---

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

These sit at the very top of the pipeline and remove rows before anything else runs. You will not need them for this module's assignment, because the datasets are small files. They matter when you are pulling from a large database or building an extract — see tb46, where extracts are covered.

### Filter display options

Right-click a filter on the Filters shelf → `Show Filter` to give the reader a control. Then right-click the control that appears:

- **Single value** — radio list, dropdown, or slider
- **Multiple values** — checkbox list, dropdown, custom list, or wildcard match
- **Show "All" option**, **Show search box**, and **Floating** for placement
- Other useful tabs in the filter dialog: **Top** (top or bottom N by a measure), **Condition** (a formula), and **Wildcard** (text matching)

### Pages is not a filter

`Pages` looks like a filter and is not one. It splits the view into a sequence you step through — one page per value of the field, with playback controls. All the data stays in the workbook; you are looking at one slice at a time.

Drag a field to the `Pages` shelf to try it. Use it to animate change over time in a presentation. Do not use it to remove data — that is what the Filters shelf is for.

---

## Step 7: The View

### Sorting

An unsorted bar chart makes readers compare bars in an arbitrary order. Sorting turns it into a ranking, which is most of what makes bar charts readable (tb41). Sort almost every categorical chart you build.

Three ways to sort, in increasing order of control:

1. **Toolbar buttons.** The ascending/descending buttons sort the view by the measure. Fastest, and the right choice most of the time.
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

---

## Walkthrough: County Distress Data

Uses `tb42_countydata.xlsx`, which has three sheets you need: `dci_counties` (one row per county), `State` (one row per state), and `State Income` (median household income, wide by year, with a messy header).

**Part A — connect and clean**

1. `Connect` → `To a File` → `Microsoft Excel` → select `tb42_countydata.xlsx`.
2. Drag `dci_counties` onto the canvas. Confirm `County ID` and `StateFIP` are **text**, not numbers — leading zeros matter.
3. Right-click `County` → `Split`. Tableau splits on the comma into county name and state name. Rename both.
4. Drag `State` onto the canvas next to `dci_counties`. Tableau draws a noodle and proposes `StateFIP` = `StateID`. Confirm the key.
5. Right-click the `State` field → `Split` on the comma, then `Custom Split` the remainder on ` - ` to get the abbreviation and the region. Rename all three.

**Part B — pivot and combine**

6. Drag `State Income` onto the canvas. Its header row is buried under a title and a URL, so check **Use Data Interpreter** in the left pane, then `Review the results`.
7. On the Data Source preview, select the `2024`, `2023`, and `2022` columns. Right-click → `Pivot`.
8. Rename `Pivot Field Names` → `Year` and `Pivot Field Values` → `Median Income`. Set `Median Income` to a number.
9. Relate `State Income` to `State` on the FIPS code. Check the type on both keys first.
10. **Verify you did not inflate.** New sheet, drag `dci_counties (Count)` to Text. It should read 3,136. If it reads 9,408, you joined instead of related — go back to step 9.

**Part C — filter and sort**

11. New sheet. `Region` to Rows, `Median Income` to Text, set the aggregation to `AVG`.
12. Notice the United States total row (FIPS `00`) contaminating the results. Drag `State Name` to Filters → `Exclude` → `The United States`. That is a row-level filter.
13. New sheet. `State Name` to Rows, `Total Population` to Columns as `SUM`.
14. Drag `Total Population` to Filters again. In the dialog choose `Sum`, then set a minimum of 5,000,000. That is an **aggregate** filter — it removes states, not counties. Compare it to choosing `All values`, which would remove individual counties instead.
15. Sort descending with the toolbar button.
16. Now the context filter: filter `State Name` to West Virginia, then add a Top 10 filter on your split county-name field by distress score. Note the wrong result. Right-click the state filter → `Add to Context`. Note the fix.

**Part D — finish**

17. Add `County Type` and `MSA` to Marks → Tooltip on your county sheet.
18. `File` → `Save As` → **Tableau Packaged Workbook (.twbx)**.

---

## Vocabulary

| Term | Meaning |
| --- | --- |
| Order of operations | The fixed sequence Tableau applies filters and aggregations in |
| Pivot | Turning wide columns into tall rows |
| Data Interpreter | Tableau's cleanup pass for messy spreadsheet headers |
| Split | Breaking one text field into several on a delimiter |
| Logical layer | The default Data Source canvas, where relationships live |
| Physical layer | Inside a table, where joins live |
| Relationship | A flexible link that preserves each table's level of detail |
| Join | A flattening combination that can duplicate rows |
| Fan-out / join inflation | Row duplication from a one-to-many join, which inflates `SUM()` |
| Row-level filter | Removes rows before aggregation — SQL's `WHERE` |
| Aggregate filter | Removes groups after aggregation — SQL's `HAVING` |
| Context filter | A filter promoted to run before other filters and Top N |
| `ATTR()` | Tableau's tooltip aggregation for dimensions; `*` means multiple values |
| Pages | Splits a view into a steppable sequence — not a filter |

## Check Your Understanding

1. You have a column for each of 2022, 2023, and 2024. Why can you not build a line chart, and what fixes it?
2. Your join key is `01` in one table and `1` in the other. What happens, and why?
3. After combining two tables, total population jumps from 340 million to 1.02 billion. What did you do, and what are two ways to fix it?
4. You filter to Ohio and add a Top 5 filter. You get five counties, none of them in Ohio. Explain using the order of operations.
5. You want to show only counties with population over 50,000. You want to show only *states* whose counties total over 5 million. Which filter is which, and which dialog option do you pick for each?
6. A tooltip shows `*` where you expected a county type. What is Tableau telling you?

## Submission

Submit a `.twbx` containing:

- One sheet showing average median household income by region, across all three years, with the national total row excluded.
- One sheet showing the 10 most distressed counties in a state of your choice, correctly filtered using a context filter, sorted descending, with county type in the tooltip.
- One caption sheet stating your record count after combining tables and one sentence explaining why it is or is not what you expected.

---

<!--
AUTHOR NOTES — delete before publishing.

SCOPE CHANGES FROM THE ORIGINAL:

- CUT Dashboards / Stories entirely. tb46 covers it properly, and the original
  chapter deferred to tb46 in its own filter section. The dashboard-filter
  bullets go there too.
- MOVED "Create a calculated field" to tb44, which already lists calculated
  fields, IF, ZN, date functions, and bins as outcomes. tb42 no longer teaches
  calculations.
- KEPT Split, contrary to my first recommendation. Once I opened the data file
  it was clear Split belongs here: it is a Data Source tab reshaping operation
  in the same family as pivot, it requires no functions, and the posted
  exercise depends on it. Only calculated fields moved.
- RETITLED "Tableau Basic Features" -> "Shaping Data in Tableau." The old title
  described nothing; the module number tb42 still identifies it.
- REORDERED around the order of operations, so pivot/join come first (they
  happen first) and sort/tooltip come last.

ERRORS FIXED:

- Context filters. The original said they are "used when clicking on items in a
  dashboard." That is a dashboard filter action. Rewritten as an
  order-of-operations concept with the Top N example.
- "Dimension/Measure can be filtered on a row-level." Muddled. Dimension
  filters are always row-level; measure filters default to aggregate and
  require "All values" for row-level.
- Pages described as "a different style of filter." It is not a filter.
- Extract/data source filters dismissed as "we don't use these," which
  contradicts tb46 listing extracts under common exam mistakes. Now points
  forward instead.

CONTENT ADDED:

- The pipeline table as the chapter spine, with the WHERE/HAVING mapping.
- Relationships vs. joins, logical vs. physical layer. Biggest gap in the
  original; modern Tableau shows a noodle, not a Venn diagram, so students
  following the old two-bullet instruction get lost immediately.
- Join types and join inflation. The fan-out example is real: relating
  State Income (3 rows per state after pivot) to 3,136 counties triples
  SUM(Total Population). This is the highest-stakes error for an accounting
  audience and it produces no error message.
- Data Interpreter. The State Income sheet in the posted file has a title and
  a FRED URL above the header row, so students hit this immediately.
- Leading zeros on FIPS join keys, tied back to tb01.
- Custom split, two-pass split, string-only restriction.
- Manual sort, sort-by-another-field.
- ATTR() and the asterisk; Viz in Tooltip.
- Walkthrough, vocabulary table, check-your-understanding, submission.

ACTION ITEMS FOR YOU:

1. UPDATE THE TASK SHEET in tb42_countydata.xlsx. It currently asks for a
   decile calculated field ("try round -1, then ceiling"). Since calculated
   fields moved to tb44, that task should move with them — it is a good tb44
   exercise. Replace with the pivot/join/context-filter task in Part C.
2. REPOST THE SOLUTION AS .twbx. It is currently tb42_solution.twb, and tb01
   tells students in bold never to submit .twb.
3. VERIFY THE ROW COUNT in walkthrough step 10. I read 3,136 data rows in
   dci_counties from the file, but confirm what Tableau reports after the
   Data Interpreter pass.
4. CHECK THE STATE FIELD SPLIT. The State sheet stores "Alabama, AL - South".
   I assumed Tableau auto-detects the comma and needs a custom split for
   " - ". Worth one test — Tableau sometimes offers a multi-delimiter guess.
5. WEST VIRGINIA in the context filter example is a placeholder that will
   resonate with your students; any state works.

FIGURES TO SHOOT (4 new):

1. datasource_relationship_vs_join.webp
   Side by side. LEFT: logical layer, two tables with the noodle between them.
   RIGHT: physical layer (double-clicked into a table), same two tables with
   the Venn icon and the join-type picker open. Label each half. This is the
   single most important figure in the chapter — students cannot follow the
   join instructions without seeing which canvas they should be on.

2. pivot_before_after.webp
   The State Income sheet on the Data Source preview, before and after the
   pivot. Show the three year columns selected with the right-click menu open
   on "Pivot" in the before shot; show Pivot Field Names/Values in the after.

3. filter_measure_dialog.webp
   The dialog that appears when you drop a measure on Filters, with "All
   values" and "Sum" both visible in the same frame. Circle "All values."
   Students click past it constantly.

4. context_filter_topn.webp
   Three panels: (a) state filter alone, correct list; (b) Top 10 added,
   wrong list, with the changed names highlighted; (c) after Add to Context,
   correct list, with the gray pill visible on the Filters shelf. The gray
   pill needs to be legible — that color change is the only visual confirmation
   students get.

CROSS-REFERENCES:
- tb01 (data types, leading zeros, .twb vs .twbx) from the join key warning
- tb41 (bar charts, position/length) from the sorting section
- tb44 (calculated fields, grouping, bins) from the split section
- tb46 (dashboards, dashboard filter actions, extracts) from context filters
  and from data source filters
-->
