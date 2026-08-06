<script src="/course_dv/toc.js"></script>

# Dashboards

This module covers creating and managing dashboards in Tableau.

**Outcomes:**
- Create a dashboard in Tableau and add charts to it
- Create dynamic filters and bookmarks
- Publish a dashboard to Tableau Public and share it with others

**Links**:
- See Datacamp *Creating Dashboards in Tableau*

**Common exam mistakes**:
- Have your Tableau account setup before the exam.
- Know how to create a data extract.


## Dynamic filters and bookmarks

Filters can be used to dynamically update charts in a dashboard. Bookmarks can also be used to create dynamic filters and navigate between pages.

Process to create a filter:
- Drag a dimension or measure to the Filters shelf
- Select filter options (i.e., range, specific values, etc...) 
- Apply the filter to specific sheets or all sheets in a dashboard
- Use filter controls in the dashboard to allow users to interactively filter data
- Use bookmarks to save specific filter states and navigate between different views in a dashboard

Process to create a bookmark:
- Set up the desired filter state in the dashboard
- Click on the "Bookmark" button in the toolbar
- Name the bookmark and save it
- Use the bookmark to quickly navigate to the saved filter state

Process to create a button:
- In the dashboard, click on the "Button" object in the Objects pane
- Drag the button to the desired location in the dashboard
- Configure the button action to navigate to a specific bookmark or sheet


## Publishing a dashboard
To share your dashboard with others, you can publish it to Tableau Public. This allows you to share your work online and make it accessible to anyone with the link.

Process to publish a dashboard:
- Click on "File" in the Tableau menu
- Select "Publish to Tableau Public"
- Sign in to your Tableau Public account (or create one if you don't have one)
- Choose the dashboard you want to publish and provide a name for it
- Click "Publish" to make your dashboard available online

You will often get an error message saying that you need to create a data extract before you can publish. To do this, click on "Data" in the Tableau menu, select your data source, and then click on "Extract Data". Follow the prompts to create the extract, and then try publishing again. If you have multiple connections to diffferent data files, you will need to create an extract for each one before you can publish.