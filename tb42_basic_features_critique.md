# Critique: "Tableau Basic Features" (tb42)

## Summary

This chapter is noticeably weaker than the two before it. tb01 and tb41 each have a **spine** — an organizing idea that makes the sections belong together (tb01: the two questions Tableau asks about every field; tb41: pre-attentive attributes ranked by decoding accuracy). tb42 has no spine. It is eight unrelated outcomes in a list, delivered as bullets, with no walkthrough, no vocabulary table, no check-your-understanding, no submission, and no figures.

Three problems in priority order:

1. **Curriculum collision.** Roughly half this chapter is content that tb44 and tb46 also claim. The chapter even admits it ("We will see this more when creating dashboards later in the course").
2. **One real technical error** (context filters) plus several imprecise definitions in the Filter section — which is the strongest and most salvageable part of the chapter.
3. **No apparatus.** By the standard tb01 and tb41 set, this reads as an outline you have not finished revising yet.

---

## 1. Curriculum collision — decide what belongs here

| Topic in tb42 | Also claimed by |
|---|---|
| Create a calculated field | tb44 outcome: "Create calculated fields using common functions: if statements, zn, basic math" |
| Join on a common key | tb44 outcome: "Group data values using a data source join" |
| Dashboards / Stories | tb46, the entire module |
| Filters (dashboard filters) | tb46: "Create dynamic filters and bookmarks" |

That is four of eight outcomes. The Dashboards section is 6 bullets that tb46 covers properly, and the chapter's own filter section defers to "later in the course." My recommendation: **cut Dashboards/Stories entirely from tb42** and move Split + Calculated Field into tb44, where they sit next to grouping, binning, and date functions and share the same conceptual home (creating new fields from existing ones).

That would leave tb42 as: **pivot, join, filter, sort, tooltip** — everything you do to shape data and shape a view, none of it new-chart material. That is a coherent chapter.

## 2. A spine you could use

If you keep roughly the current contents, the natural organizing idea is **Tableau's order of operations** — the query pipeline. It is the correct explanation for the filter distinctions you already make, it explains why pivot/join have to happen first, and it is the reason the TOP filter you list surprises students.

Simplified for a third chapter:

> Data source → context filters → row-level (dimension) filters and Top N → aggregate (measure) filters → the view

The WHERE/HAVING analogy you already have is the right hook — extend it rather than dropping it after one sentence. Your students see SQL elsewhere in the program, and "row filters run before the aggregation, aggregate filters run after" is one sentence that makes the whole section make sense.

This also fixes the ordering problem. The current sequence is Split → Calculated Field → Sort → Dashboards → Tooltip → Data Cleaning → Filter. Data cleaning (pivot/join) happens on the Data Source tab *before you build anything* and belongs first. Filters belong before Sort and Tooltip, not last.

## 3. Technical errors

**Context filters — this one is wrong.**

> "`Context` is used when clicking on items in a dashboard."

That describes a **dashboard filter action**, which is a different feature entirely. A context filter is a position in the order of operations: it executes *before* dimension filters and Top N, creating a temporary subset the later filters act on. The canonical example is the one Tableau's own docs use — "top 10 customers in New York City." Filter to New York City, then add a Top 10 filter, and you get the top 10 customers *overall*, because general dimension filters and Top N execute simultaneously. Right-click the City filter → `Add to Context` fixes it.

That example is worth including verbatim. It is the only reason a student ever needs to know context filters exist, and right now the chapter mentions the TOP filter as a bare bullet with no warning attached.

**"`Dimension`/`Measure` can be filtered on a row-level."**

Muddled. The real distinction is not dimension-vs-measure, it is what the filter runs *on*:

- A **dimension** filter is always row-level.
- A **measure** dragged to Filters defaults to **aggregate** (Tableau asks for SUM/AVG/etc. first). You get row-level behavior by choosing **All values** in that dialog.

You get this right two paragraphs later under "Add a filter by," so the earlier bullet just contradicts the correct version. Collapse them.

**"`Extraction filters`/`Data source` ... We don't use these options."**

tb46 lists "Know how to create a data extract" under *Common exam mistakes*. If extracts are examinable, tb42 should not tell students they are irrelevant. Softer and still short: "You will not need these for the assignments in this module, but see tb46 for extracts."

**"Use Pages for a different style of filter."**

Orphan sentence sitting at the bottom of the Sort section, unexplained, and not quite right — Pages is not a filter. It splits the view into a sequence you step through (or animate) one value at a time; all the data stays in the workbook. Either give it two sentences with a click path or cut it.

**"Split"** — worth adding that it works on **string fields only**, that `Custom Split` handles delimiters Tableau does not auto-detect, and that Split is also available on the Data Source tab. Your note about renaming and setting the datatype is good and specific; keep it.

## 4. The biggest content gap: joins

Two bullets:

> - *Pivot* columns to turn wide data into tall data.
> - *Join* on a common key value.

This is not enough to get a student through the county-data problem, and it omits the thing that most confuses people opening modern Tableau:

- **Relationships vs. joins.** Since 2020.2 the Data Source canvas defaults to **relationships** (the noodle) at the logical layer. Joins live in the physical layer — you get there by double-clicking a table to open it. A student told to "join on a common key" will drag a second table in, get a relationship, and not know why the screen does not match the instructions. This needs a paragraph and a screenshot.
- **Join types.** Inner / left / right / full outer, and what each does to unmatched rows. County data almost always has unmatched keys.
- **Join inflation (fan-out).** A one-to-many join duplicates rows on the "one" side, and `SUM()` then double-counts. This is the most consequential Tableau error an accounting student can make and it is invisible — the number just comes out wrong. It is also the best argument for relationships, which avoid the problem. If you add one thing to this chapter, add this.
- **Pivot** needs a click path (select columns on the Data Source tab → right-click → `Pivot`) and the caveat that it is available for file-based sources, not every connection.

## 5. Calculated fields — a missed connection

The section is three sentences and mentions no functions. Since you are keeping the Filter section's row-level/aggregate distinction, the calculated field section should make the *same* distinction, because it is the same idea and produces the classic wrong answer:

- `SUM([Profit]) / SUM([Sales])` — aggregate, correct
- `AVG([Profit] / [Sales])` — row-level then averaged, wrong for a profit margin

One example, two lines, and it reinforces the chapter's spine instead of sitting there inertly. (If you move calculated fields to tb44 as suggested above, this note goes with it.)

## 6. Smaller fixes

**Opening paragraph does not match the outcomes.** "This module introduces filtering and sorting techniques" — but only 3 of 8 outcomes are filter/sort. Same mismatch I flagged in tb41's outcomes list. Rewrite once the scope is settled.

**Sort** is vague where tb01 and tb41 are specific. Name the three mechanisms: toolbar sort buttons, the sort icon that appears when you hover an axis or header, and right-click pill → `Sort` (Data source order / Alphabetic / Field / Manual). Worth one line connecting back to tb41: sorting a bar chart converts an unordered comparison into a ranked one, which is most of what makes bar charts readable.

**Tooltip.** Two additions: `Viz in Tooltip` (embedding a whole sheet in a tooltip) is a genuine wow-feature and one click path. And a note that a dimension dropped on Tooltip is wrapped in `ATTR()` — if it shows `*`, that means multiple values exist at the current level of detail, which is a useful diagnostic rather than a bug.

**No figures at all.** tb01 has three and tb41 has four. The three that would earn their place here: the Data Source canvas showing a relationship vs. a join, the filter dialog with the All values / SUM choice visible, and a before/after of the Top-10-in-New-York context filter problem.

**No walkthrough, vocabulary table, check-your-understanding, or submission.** tb01 and tb41 have all four. `tb42_countydata.xlsx` is already posted and is presumably a good pivot/join case — build the walkthrough on it the way tb01 builds on the Airbnb file.

**Minor:** the posted solution is `tb42_solution.twb`. It works because the xlsx sits beside it, but tb01 tells students in bold that `.twb` does not contain data. Posting a `.twbx` avoids the mixed signal.

---

## Suggested revised outcomes

If you take the scope recommendation:

- Reshape source data by pivoting wide columns into tall
- Combine two tables, and explain the difference between a relationship and a join
- Predict what a one-to-many join does to a `SUM()`
- Filter at the row level and at the aggregate level, and explain which corresponds to SQL's `WHERE` and which to `HAVING`
- Use a context filter to make a Top N filter behave correctly
- Sort by value, by category name, and manually
- Add fields and formatting to a tooltip

Seven outcomes, all delivered in one chapter, all tied to a single order-of-operations spine.

---

## Uncertain / verify before publishing

- The relationships-vs-joins default behavior is stable across recent versions, but the exact Data Source canvas wording changes between releases — check against the version your students install.
- Pivot availability by connection type: certain for Excel/CSV/Google Sheets; I did not verify the current list for every database connector.
- I have not opened `tb42_countydata.xlsx` or the solution workbook, so the walkthrough suggestion assumes the file supports a pivot-and-join example.

Sources: [Tableau's Order of Operations](https://help.tableau.com/current/pro/desktop/en-us/order_of_operations.htm), [Create Views for Tooltips (Viz in Tooltip)](https://help.tableau.com/current/pro/desktop/en-us/viz_in_tooltip.htm)
