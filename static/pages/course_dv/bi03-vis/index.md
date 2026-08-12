<script src="/course_dv/toc.js"></script>

# PowerBI Visualizations

This module covers common visualizations in PowerBI.

**Outcomes**:
- Create common charts such as clustered/stacked column/row, line, scatter, pie, area, and combo charts
- Create non-chart data displays such as tables, matrixes, cards, slicers, and tooltips
- Set titles and axis labels
- Use bookmarks to switch between different views of the data and navigate between pages
- Create a custom tooltip page
- Create a custom view for mobile devices

**Modules**:
- [Design PowerBI Reports](https://learn.microsoft.com/en-us/training/modules/power-bi-effective-reports/)
- [Enhance Power BI report designs for the user experience](https://learn.microsoft.com/en-us/training/modules/power-bi-effective-user-experience/)

Note that we do not cover all of these features in detail. Focus on the items shown below.

**Data files**:
- AP v2 [data](ap-v2.xlsx) and [solution](ap-v2-solution.pbix) files


## Vis designs

Create the following charts

- Clustered/Stacked column/row (and 100%)
- Line
- Scatter
- Pie
- Area
- Combo

Create the following non-chart data displays:

- Table
- Matrix
- Card
- Slicer
- Tooltip

For each, be able to set the title and axis label.

## Report design suggestions

Tips:

- Design from top/down and left/right
- Add space around report elements
  - Set report size (page size custom)
- Theme to use consistent colors
- Time series
  - Show from left/right

Elements:

- Text box (apply font, hyperlinks)
- Buttons (back, open URL, bookmark)
  - Back
  - Bookmark
  - Drill through action
  - Page navigation
  - Format (hover, tool-tip)
- Shapes (arrows, hearts, etc...)
- Images (add)

Conditional formatting

See [Microsoft tutorial](https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-conditional-table-formatting)

- Right-click on a field in a table or matrix
- Select conditional formatting
  - Pick style, such as background or font
  - Pick a scale

Spark-line

- Right-click on a field
- Pick 'add a spark-line'

## Bookmark

A bookmark is used to save the state of a page. Define a bookmark, and then assign buttons to switch between different bookmarks.

### Process for switching between page states:

- Create your data displays
- Go to view and turn on both "Bookmarks" and "Selection"
- Repeat for each view of your data:
  - Hide/show charts
  - Create a bookmark 
- Create a button and assign it to activate the correct bookmark
  - Note that the text of the button is under Format / Style / Text
  - Control-click to activate the button

### Process for going to another page

You can also use bookmarks to navigate between pages.

- Create your pages
- Add a blank button
- Go to the button action, pick Page Navigation, and select the correct destination page.


## Custom Tooltip

You can create a custom tooltip page.

[Microsoft Tutorial](https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-tooltips?tabs=powerbi-desktop)

Process:

- Create a new report page
- Format page 
  - Change size (Canvas settings card, Tooltip size)
  - Allow use as tooltip (Page information)
- Manually register the page as a tooltip for your visual
  - Go to the report page and pick the chart
  - Go to Format Visual, and expand General
  - Scroll to tooltip and pick the page you created



## Mobile report

Create a custom view for mobile devices