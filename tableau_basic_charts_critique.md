# Critique: "Tableau Basic Charts"

## Summary

The skeleton is strong — a consistent four-part template (Best for / Pre-attentive attributes / Limits / Features) plus a click-by-click Process is exactly right for a second Tableau chapter, and tying each chart to pre-attentive attributes is a genuinely good pedagogical move that most Tableau tutorials skip.

The problems are (1) several outright technical errors in Tableau vocabulary, (2) copy-paste boilerplate that has propagated wrong advice, and (3) the chapter states outcomes it never delivers — no combo charts, no chart-chooser, no exercises.

---

## 1. Technical errors (fix these first)

**Scatterplot: "2 *numeric* dimensions" is wrong.** A Tableau scatterplot requires two **continuous measures** on Columns and Rows. "Numeric dimension" means something specific and different in Tableau (a discrete numeric field), and dragging two of those produces a discrete grid, not a scatterplot. This error appears three times (Best for, and twice in Process). Students who follow it literally will not get a scatterplot. The section then contradicts itself with "0-1 measure."

**"Change the color scale to either categorical, sequential or diverging" — after dragging a *measure* to Color.** This line appears in Bar, Histogram, and Scatterplot. A continuous measure on Color offers only sequential/diverging palettes; categorical palettes require a **dimension** on Color. As written, students will look for an option that isn't there. Either say "drag a dimension to Color for categorical, or a measure for sequential/diverging," or split the bullet.

**"Change the size scale to either categorical, sequential or diverging" (Scatterplot).** Size has no palette concept at all. This is boilerplate pasted from the Color bullet.

**Boxplot → Basic features → "Change bin size."** Boxplots have no bins. Leftover from the Histogram section. Replace with something real: whisker extent (1.5 IQR vs. min/max), plot options, showing/hiding underlying marks.

**Heat map process may not produce a heat map.** Square marks + measure on Color + measure on Label is what Tableau calls a **highlight table**; Tableau's "heat map" in Show Me encodes magnitude with *size* and (optionally) a second measure with color. Worth either renaming the section or adding one line distinguishing the two — students will hit both names in Show Me and be confused.

**Line: "Requires date information!"** Overstated. Lines are appropriate for any ordered continuous x-axis (dose, distance, iteration). Dates are the common case, not a requirement. Consider: "Requires an *ordered* dimension — usually a date."

**Pie: "1 measure (a value showing % of whole)."** The measure doesn't need to be a percentage; Tableau computes the angle from the raw value. Only the *label* becomes a percentage.

**Histogram: "No dimensions."** The binned field Tableau creates *is* a dimension, and the Process says to drag it to Columns. Internally inconsistent. Say "1 measure, which you convert to bins."

---

## 2. The "n" problem

`n` is doing three different jobs and is never defined:

| Where | What n apparently means |
|---|---|
| Bar: "best for n<10" | number of categories |
| Histogram: "best for n>10" | number of observations (or bins?) |
| Scatterplot / Boxplot: "best for n>100" | number of rows |
| Pie / Scatterplot color: "n<5" | number of categories |

Juxtaposing "Bar: n<10" against "Histogram: n>10" strongly implies they're the same quantity, which sets up a real misconception. Define the symbol once in Terminology, or use explicit words ("fewer than ~10 categories," "at least ~100 rows").

Separately, some thresholds are questionable as stated. A scatterplot with 25 points is perfectly good; "best for n>100" is not defensible as a rule. If these are heuristics rather than rules, label them as such.

---

## 3. Outcome / content mismatch

The Outcomes list **combo charts** — there is no combo chart section. That's the one chart here that requires a technique students don't otherwise learn (dual axis + synchronize + per-measure mark types), so it's the most costly omission.

Conversely, **pie charts** are covered but absent from the Outcomes.

Outcome 3, "Match a chart to the data structure and analysis goal," is never operationalized. The information exists but is scattered across seven sections. **Highest-value single addition: a chart-chooser table at the top or bottom.** Something like:

| Dimensions | Measures | Goal | Chart |
|---|---|---|---|
| 1 categorical | 1 | Compare across categories | Bar |
| 0 | 1 | See the distribution | Histogram |
| 1 categorical | 1 (disaggregated) | Compare distributions | Boxplot |
| 0 | 2 | Relationship / correlation | Scatterplot |
| 1 date | 1 | Trend over time | Line |
| 1 categorical (<5) | 1 | Part-to-whole | Pie |
| 2 categorical | 1 | Spot patterns in a grid | Heat map |
| 1 date | 2 | Two trends, different units | Combo (dual axis) |

Outcome 4, "Match a chart type to the appropriate pre-attentive attributes," similarly has no synthesis. One paragraph would close the loop: position and length are the most accurately decoded, which is *why* bar and scatter beat pie and heat map — and why the ranking in the previous chapter matters. Right now the pre-attentive bullets read as trivia rather than as the argument that organizes the chapter.

---

## 4. Structure and pedagogy

**No exercises, dataset, or check-for-understanding.** For a hands-on software chapter this is the biggest gap after the chart-chooser. Students can read all seven Processes and build nothing. Suggest: one shared dataset named up front, then a short "Build these seven views" task list, plus 3–4 "which chart would you use for…?" items keyed to Outcome 3.

**Inconsistent use of examples.** Scatterplot, Line, and Pie have example images; Heat map, Bar, Histogram, and Boxplot have none. The unillustrated four include the two hardest to picture (heat map, boxplot). Every chart should show its output.

**Aggregated vs. disaggregated is the hardest idea here and it's handled twice, differently.** It appears in Scatterplot and Boxplot with slightly different framing, and the Scatterplot version conflates two distinct things: `Analysis → Aggregate Measures` (on/off) and adding a field to Marks → Detail (changing level of detail). These are related but not the same, and describing "drag a dimension to Detail" as "aggregate by a dimension" will mislead. Pull this out into its own short section before the charts that need it, and be precise about the two mechanisms.

**Ordering.** Heat map opens the chapter but is arguably the least familiar and most cognitively demanding chart in the set. Consider ordering by data structure — 1 measure (histogram) → 1 dim + 1 measure (bar) → distributions (boxplot) → 2 measures (scatter) → time (line) → part-to-whole (pie) → 2 dims (heat map) — which also reinforces the chart-chooser logic.

**Terminology section over-claims.** "x-axis should contain the independent variable (cause)" is right for scatterplots and time series, but for a bar chart the x-axis holds a category that is not a cause of anything. Worth one qualifying clause so students don't over-apply it — especially since the Scatterplot section repeats "best for a cause (x) and effect (y)," which also invites the correlation/causation confusion without naming it.

**The accessibility link is orphaned.** "Improving a line chart" sits in a Links block with no context and is never referenced from the Line section, where it would actually land.

**Missing common operations.** Nothing on tooltips, titles/captions, axis formatting, or sorting beyond a one-line mention. Sorting in particular is listed as a "basic feature" for heat map and bar but never explained (`Sort` icon vs. field-level sort vs. manual). Also no caveat that `Show Me` — used only in the Boxplot section — is available throughout and how it relates to building views manually.

---

## 5. Line edits

- L97: "A scatterplot us a shows the relationship" → "A scatterplot shows the relationship"
- L101: "technque" → "technique"
- L161: "for data that with a *date* dimension" → "for data with a *date* dimension"
- L138: "1 disaggregated measure " — trailing space
- L143: "Best for problems with too much data to see individual points, requiring quartiles to better understand." — awkward; e.g. "Best when there are too many points to read individually and quartiles summarize the spread."
- L101–103: the quadrant technique assumes both axes cross at a meaningful zero; the doctor-trust example may use scale midpoints instead. Worth one clarifying clause.

---

## Priority order

1. Fix the scatterplot dimension/measure error and the Color/Size palette boilerplate — these break the click-along.
2. Add the chart-chooser table (serves Outcome 3 directly).
3. Add the combo chart section (Outcome 1 currently promises it).
4. Add exercises + a named dataset.
5. Define `n`; add example images to the four sections missing them.
6. Extract aggregated vs. disaggregated into its own section.

## Caveats

Tableau's UI shifts between versions and between Desktop and Public; a few of the menu paths above should be spot-checked against whichever version students use. My comments on Show Me's "heat map" vs. "highlight table" naming reflect long-standing behavior but are worth verifying in your build.
