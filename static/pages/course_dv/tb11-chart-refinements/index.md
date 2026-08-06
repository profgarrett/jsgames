# Chart Refinements in Tableau

This section covers additional chart refinements in Tableau beyond the basics.

**Outcomes**:

- Understand continuous vs. discrete dates
- Modify chart display options
- Create a combo chart

**Links**:

- [Problem Datafile](tb43_historicstockmarket.xlsx)
  - [Stock Market Predictions](https://docs.google.com/forms/d/e/1FAIpQLSeNcvqSpJVgpdpKp0f-ZVmtaTZxeBCTJxASKlC4jHx3ITZFHA/viewform?usp=publish-editor)
  - [Answers Spreadsheet](https://docs.google.com/forms/d/19M2EGjGGxa8cshY9xHvp_JFtP9I7WT40HX53agaAV8s/edit#responses)


## Continuous or Discrete Dates

Tableau treats every date field as either **continuous** (green pill) or **discrete** (blue pill) — the same distinction from tb41, applied specifically to dates. Right-click a date pill to switch between the two.

*Continuous* treats the date as a single unbroken timeline and produces an axis: Jan 2020, Feb 2020, March 2020, ..., Jan 2021, Feb 2021, etc. Each month appears once, in chronological order.

*Discrete* treats the date as separate labels and produces headers: by default, same-named periods collapse together, so Jan 2020 and Jan 2021 both fall under a single "January" header, alongside "February," "March," and so on.

In general, use continuous (a line) to show a single trend over time, and discrete (bars) when you want the reader to compare specific periods side by side — for example, year-over-year by month.


## Chart Display Options

There are a wide variety of chart display options that can be modified in Tableau to improve the appearance and readability of charts. Most are reached by right-clicking the element (title, axis, or a cell) and choosing `Format`, or by double-clicking directly on it. Some key options include:

- Title
  - Double-click to edit text; `Format Title` for font, size, color, and alignment
- Caption
  - Right-click the caption area → `Edit Caption`
- Text
  - Right-click a cell → `Format` to change size, font, and color
- Axis
  - Right-click an axis → `Hide` to remove it
  - Label (right-click an axis → `Edit Axis`)
    - Font, size, alignment, and rotation
    - Marks style
    - Set interval, min, and max values
    - Format date values
  - Data
    - Right-click a field → `Group` to combine dimension values and edit the grouped field
    - Double-click a value in the view to relabel it with an alias
    - Right-click a field → `Edit Filter` to exclude data by range or null values
- Tooltip
  - Drag a field onto Marks → Tooltip to add it
  - Click `Tooltip` on the Marks card to edit font and layout


## Combo Charts

A combo chart puts two measures on the same view, each with its own axis and mark type — for example, revenue as bars and profit margin as a line. See tb41 for a fuller discussion of pre-attentive attributes and when a combo chart is the right choice; this section focuses on building and refining one.

- Best for
  - 1 date (or other dimension) and 2 measures, usually in different units or magnitudes
- Pre-attentive attributes
  - Length (bars) and position on a common scale (line)
- Limits
  - Two axes make it easy to imply a relationship that isn't there
  - Only synchronize the axes when both measures share the same unit
- Advanced features
  - Synchronize axis

Process:

- Drag a date dimension onto Columns or Rows
- Drag a measure onto the other shelf (Rows for vertical, Columns for horizontal)
- Drag a second measure onto the same shelf
- On the Marks card, change one measure's mark type to Bar, then right-click that measure's axis and select `Dual Axis`
  - Order matters: add the bar measure first (on the left) so the line is drawn on top of it
- (If needed) Change the second measure's mark type to Line
- (If both measures share a unit) Right-click either axis → `Synchronize Axis`
