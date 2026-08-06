<script src="/course_dv/toc.js"></script>

# Chart Refinements in Tableau

This section covers additional chart refinements in Tableau beyond the basics.

**Outcomes:**
- Understand continuous vs. discrete dates
- Modify chart display options
- Create a combo chart

**Links**:
- See Datacamp *Analyzing data in Tableau*
- [Problem Datafile](tb43_historicstockmarket.xlsx)
  - [Stock Market Predictions](https://docs.google.com/forms/d/e/1FAIpQLSeNcvqSpJVgpdpKp0f-ZVmtaTZxeBCTJxASKlC4jHx3ITZFHA/viewform?usp=publish-editor)
  - [Answers Spreadsheet](https://docs.google.com/forms/d/19M2EGjGGxa8cshY9xHvp_JFtP9I7WT40HX53agaAV8s/edit#responses)


## Continuous or Discrete Dates

We have a two approaches to showing dates in Tableau. These depend on if the date is continuous or discrete.

*Continuous* groups by time period (i.e, all Jan 2020, Feb 2020, March 2020, ..., Jan 2021, Feb 2021, etc...)

*Discrete* splits into groups (i.e., Jan 2020 & 2021, Feb 2020-2021, March 2020-2021)

In general, use lines for continuous data, and bars for discrete dates


## Chart Display Options

There are a wide variety of chart display options that can be modified in Tableau to improve the appearance and readability of charts. Some key options include:
- Title
  - Edit font, size, color, and alignment
- Caption
- Text
  - Change size / font /color for a cell
- Axis
  - Hide an axis
  - Label
    - Font, size, alignment, and rotation
    - Marks style
    - Set interval, min, and max values
    - Format date values
  - Data
    - Group dimensions and edit the grouped field
    - Relabel a dimension value using an alias
    - Exclude data (by range, null values)
- Tooltip
  - Add field to a tooltip
  - Edit font and layout of a tooltip


## Combo 

- Best for
  - 2 measures (one must be a date!)
  - 0-1 measures
- Process
  - Add 2 measures to row. Then, go to marks and change one type of bar. Then, right-lick the right-pill and change to a dual axis.
- Pre-attentive attributes
  - Position on a common scale
- Limits
  - Requires date information!
- Advanced features
  - Synchronize axis

Process:

- Drag a date dimension onto Columns or Rows
- Drag a measure onto the other shelf (Rows for vertical, Columns for horizontal)
- Drag a second measure onto the same shelf (Rows for vertical, Columns for horizontal)
- Go to Marks and change one type of bar. Then, right-click the right-pill and change to a dual axis. Note that you may need to synchronize the axes by right-clicking on one of the axes and selecting "Synchronize Axis."
  - Note that the order is important here! The bar chart should generally be the first measure added (on the left) so that the line goes on top of it.
- (If needed) Change the mark type to line
