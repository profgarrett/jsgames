<script src="/course_dv/toc.js"></script>

# PowerBI Introduction and Data Transformation

This module introduces you to PowerBI, and focuses mostly on data connection and transformation. You will learn how to connect to different data sources, and clean and transform data using PowerQuery Editor.

**Outcomes**:
- Connect to different Excel and CSV files
- Cleanup and transform data using PowerQuery Editor
  - Use features such as pivot/unpivot, replace values, filter, remove duplicates, and change datatypes

**Modules**:
- [Data Analytics](https://learn.microsoft.com/en-us/training/modules/data-analytics-microsoft/)
- [Get Started with Power BI](https://learn.microsoft.com/en-us/training/modules/get-started-with-power-bi/)
- [Get data in PowerBI](https://learn.microsoft.com/en-us/training/modules/get-data/)
- [Clean, transform, and load data](https://learn.microsoft.com/en-us/training/modules/clean-data-power-bi/)

**Download data files**
- [Data Shaping](data_shaping.xlsx)
- [College Earnings](college_earnings.xlsx)
- [Titanic Data](titanic.xlsx)


**Common exam mistakes**:
- Datatypes! Understand the difference between text, numbers, dates, etc...
- Be able to copy/append tables.

## Installation

Install the *desktop* version PowerBI on your pc:

- Download the [latest version of PowerBI](https://app.powerbi.com/home)
- Log in with your *mail.wvu.edu* account, and not your *mix.wvu.edu* email. The former is a Microsoft Account, and the latter is a Google account.
- Click on the down arrow on the top-right corner of the screen.  Choose *Power BI Desktop*. You should be taken to the Microsoft Store.

## Data Analytics

Identify levels:

- Descriptive: what happened?
- Diagnostics: why did it happen?
- Predictive: What will happen?
- Prescriptive: What should happen?
- Cognitive: (newish) Machine learning algorithms

Identify roles:

- Business analyst: closer to business
- Data analyst: closer to data
- Data Engineer: Manage data pipeline
- Data Scientist: Statistics / data mining
- Database administrator: Tech person in charge of storing data

Tasks of a Business analyst:

- Prepare data: majority of time
- Model: create relationships
- Visualize: create charts
- Analyze: statistics, charts, etc...
- Manage: security, distribution, updates, etc...

## Get Started with Power BI

Software:

- PowerBI Desktop: desktop app, Windows-only
- PowerBI Service: online platform used with a browser
  - Workspace is a shared online space
    - Contains an app, a simplified interface to access reports and dashboards
    - Contains data and rules for controlling access
- PowerBI Mobile: app for iPhone/Android

Building blocks:

- Semantic model is a model of data sources, data tables, and transformations
- Visualization / Report
- Dashboard
  - Made of tiles
  

## Get Data in Power BI


- Database
  - Choose authentication mode
  - Select tables to import
  - Write SQL query
    - Know that you can use a custom parameter in a query
- File
  - Locations: Local file, OneDrive, SharePoint
  - Know how to refresh or change a datasource by clicking on *Data source settings*
- Non-relational database
  - Describe how you you can pick a non-relational database as a source.
- Storage mode
  - Import: load all data into a local copy
  - DirectQuery: keep data in database, ideal for large datasets
  - Dual: Some data is imported, others kept in database
- Errors
  - Understand how to relink a file to import

## Clean, transform, and load data

Understand the role of PowerQuery Editor, and how it is different from PowerBI

Features:

- Use First Row as Headers
- Rename columns
- Remove top/bottom/null rows and columns
- Pivot / Unpivot data
- Rename table
- Replace values (or null values)
- Remove duplicates
- Datatypes
  - Change datatype
  - Understand purpose for decimal, fixed decimal, whole, percentage, date/time, text, and boolean (TRUE/FALSE)
- Tables
  - Append queries: used for identical columns 
  - Merge (or join): use to do a left/right outer or inner join
- View table statistics to profile your data
- Copy a table to a new name to create a new table with the same data. This is useful when you want to do different transformations on the same data, or if you want to keep an original copy of the data before transforming it.