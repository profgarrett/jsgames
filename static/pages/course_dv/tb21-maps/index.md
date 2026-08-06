<script src="/course_dv/toc.js"></script>

# Tableau Maps

This module introduces maps in Tableau. We will cover how to create different types of maps in Tableau.

**Outcomes**:
- Create fill, point, and combo maps in Tableau
- Use a background layer
- Customize map colors
- Distinguish between generated longitude/latitude and geographic data types in Tableau
  - Recognize when Tableau is having trouble matching rows to geographic locations, and how to resolve this using geocoding or GEOID numbers
  - Describe the purpose of a GEOID number and why is useful for mapping
- Describe problems with projection distortion

**Links**:
- [Class slideshow](tb45-maps.pptx) and [data](tb45-maps-dcidata.xlsx)

**Common exam mistakes**:
- Know the difference between a filled chart, point chart, and a combo map.
- Know how to resolve issues with geocoding (for example, when Tableau does not recognize a location). 


## Fill Map

A fill map in Tableau colors geographic regions (i.e., states, countries, counties) based on a measure. It relies on an *area* mapping, rather than points. Common areas include countries, states, counties, or zip codes.

A fill map connects a single data attribute to color. Color can represent either a continuous or discrete variable (such as population or region).

Tableau needs to be able to understand the geographic roles of the data. It does this by recognizing certain field names (i.e., "State", "Country", etc...) or by manually assigning geographic roles to fields. If it does not understand the geographic role, it will not be able to create a map.

**Creating a Fill Map**:
- Drag a geographic dimension (i.e., State, Country) to the Rows or Columns shelf.
- Drag a measure (i.e., Population, Sales) to the Color shelf.
- Adjust color settings as needed (e.g., color palette, opacity).

## Point Map

A point map in Tableau uses dots to represent data points on a map. Each dot corresponds to a specific location, such as a city or address. Point maps are useful for showing the distribution of data points across a geographic area.

Point data relies on longitude (runs from -180 to 180) and latitude (runs from -90 to 90). Longitude runs from west to east, while latitude runs from south to north. These can be in a dataset, or calculated by Tableau.

A fill map connects multiple data attributes to visual properties such as color, size, and shape. However, recognize that too many attributes can clutter the map.

**Creating a Point Map**:
- Drag a geographic dimension (i.e., City, Address) to the Rows or Columns shelf.
- Drag a measure (i.e., Sales, Population) to the Size shelf to adjust the size of the points.
- Optionally, drag another measure to the Color shelf to color the points based on a variable.
- Adjust size and color settings as needed.

## Dual Axis (or Combo Map)

You can combine a fill map and point map using dual axis. This allows you to show both area-based data and point-based data on the same map.

**Process**:
- Create a fill map as described above.
- Control-click on the map's axis and select "Duplicate Axis".
- Create a point map as described above.
- Right-click on the second map's axis and select "Dual Axis".
  - Note that the order matters! The first map you create will be the bottom layer.
- Synchronize the axes if necessary.  Do this by right-clicking on one of the axes and selecting "Synchronize Axis".

## Customization

You can customize the map layers and colors in Tableau to enhance the visual appeal and clarity of your maps. 

**Set a color scheme**:
- Click on the Color shelf and select "Edit Colors".
- Choose a color palette that fits your data and design preferences.

**Add a background layer**:
- Go to the Map menu and select "Map Layers".
- In the Map Layers pane, you can choose different background layers such as streets, satellite imagery, or terrain.
- You can also adjust the opacity of the background layer to make your data stand out more clearly.

**Add or remove roads**:
- In the Map Layers pane, you can toggle the visibility of roads and other map features to suit your visualization needs.

## Geographic Data Types vs. Generated Longitude/Latitude

In Tableau, geographic data types are special data types that represent geographic locations, such as countries, states, cities, or postal codes. When you assign a geographic role to a field, Tableau automatically generates the corresponding longitude and latitude values for those locations.

Generated longitude and latitude fields are created by Tableau when you use geographic data types. These fields are used to plot the locations on a map. You can also create your own longitude and latitude fields if you have specific coordinates in your dataset.

When working with maps in Tableau, it's important to understand the difference between using geographic data types and manually created longitude/latitude fields. Geographic data types allow for easier mapping and automatic recognition of locations, while manually created fields provide more control over the exact coordinates used.

If Tableau can't identify a location based on its name, it may not be able to generate the correct longitude and latitude values. Often, you can resolve this by dragging more dimensions to the grouping (for example, adding "County" to "State" can help Tableau recognize the location). If that doesn't work, you can use geocoding or GEOID numbers to map the data. Look at the bottom-right of the map to see if there are any warnings about unrecognized locations.

A **geoid** is a unique identifier for a geographic area, such as a state or county. It can be used to join geographic data with other datasets that contain the same geoid. This is particularly useful when Tableau does not recognize a location based on its name, but you have a geoid that can be used for mapping. A geoid is typically a series of numbers: the first two digits represent the state, and the next three digits represent the county within that state. For example, the geoid for Los Angeles County in California is 06037 (06 for California and 037 for Los Angeles County).

## Geographic Distortion and Projections

When creating maps, be aware of geographic distortion and projections. Different map projections can distort the size, shape, and distance of geographic features. Some common map projections include the Mercator projection, which preserves angles but distorts size, and the Robinson projection, which balances size and shape distortion.

When choosing a map projection, consider the purpose of your map and the geographic area you are representing. Some projections are better suited for certain regions or types of data.

Unfortunately, Tableau does not currently allow users to select different map projections. However, being aware of the limitations and potential distortions in the default projection can help you make informed decisions about how to present your geographic data effectively.

Example of distortion: Greenland appears much larger than it actually is compared to Africa on a Mercator projection map.

![Greenland true size](https://www.visualcapitalist.com/wp-content/uploads/2026/01/true-size-of-greenland-vs-maps.webp)

Source: [Visual Capitalist - The true size of Greenland](https://www.visualcapitalist.com/true-size-of-greenland-map-mercator-projection/)

