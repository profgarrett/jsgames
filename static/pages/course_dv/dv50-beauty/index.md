<script src="/course_dv/toc.js"></script>

# Beauty

What makes a chart beatiful? This section covers some of the principles of design and aesthetics that can help you create more visually appealing and effective charts.

**Outcomes**:
- Distingish between a explanatory chart and an exploratory chart
- Improve aesthetics by reducing eye travel
- Improve aesthetics by reducing visual clutter
- Use appropriate axis settings to improve aesthetics
- Use x axis for cause, and y axis for result
- Use lines for ratios or dates (continuous data) 
- Expect people to read from left to right and top to bottom
- Limit the number of distinct categories to 5-7
- Colors should align with cultural conventions (for example, using red for negative values and blue for positive values)
- Label key points in a chart to reduce eye travel and improve readability
- Create bins for continuous data to reduce visual clutter
- Create groups for categorical data to reduce visual clutter

**Links**:
- [Class slideshow](dv40-beauty.pptx)


## Explanatory vs Exploratory Charts

An explanatory chart is designed to communicate a specific message or insight to the audience. It is often used in presentations, reports, or articles to highlight a key finding or trend in the data. An explanatory chart is typically more polished and visually appealing, with a clear focus on the main message.

An exploratory chart, on the other hand, is designed to help the analyst explore the data and discover insights. It is often used in the early stages of data analysis to identify patterns, trends, or outliers in the data. An exploratory chart is typically more raw and less polished, with a focus on providing a comprehensive view of the data rather than highlighting a specific message.

When creating charts for the exam, you should aim to create explanatory charts that effectively communicate your insights to the audience. This means focusing on clarity, simplicity, and visual appeal, while also ensuring that your charts are accurate and informative.

## Aesthetics: Reduce Eye Travel

Eye travel refers to the distance that a viewer's eyes have to travel to read and interpret a chart. The more eye travel required, the more difficult it is for the viewer to understand the chart and extract insights from it. To reduce eye travel, you can use techniques such as:
- Placing labels directly on the chart instead of using a legend
- Using color to differentiate between categories instead of relying on position or shape
- Using a clear and consistent layout that guides the viewer's eye through the chart
- Avoiding unnecessary elements that do not add value to the chart (for example, gridlines, borders, or background colors)

## Aesthetics: Reduce Visual Clutter

Visual clutter refers to the presence of unnecessary or distracting elements in a chart that can make it difficult for the viewer to focus on the main message. To reduce visual clutter, you can use techniques such as:
- Removing gridlines or using lighter gridlines that do not compete with the data
- Using a simple color palette that does not overwhelm the viewer
- Avoiding the use of 3D effects or other visual embellishments that do not add value to the chart
- Using clear and concise labels that do not require the viewer to spend extra time deciphering them

The underlying principle is defined by Edward Tufte as "maximizing the data-ink ratio", which means that you should aim to use as much of the ink in your chart to represent data, and minimize the amount of ink used for non-data elements.

## Aesthetics: Use Appropriate Axis Settings

The settings of your axes can have a big impact on the aesthetics and readability of your chart. To improve aesthetics, you can use techniques such as:
- Fixing the axis to start at zero to avoid breaking the principle of proportionality
- Using a consistent scale across multiple charts to allow for easy comparison
- Use logarithmic scales for highly skewed data
- Reduce the number of tick marks and labels 
- Properly format numbers on tick marks (for example, using K for thousands and M for millions) to reduce clutter and improve readability
- Add a label to an axis

## Conventions

As a general rule, you should follow established conventions in data visualization to make your charts more understandable and effective. Some key conventions include:
- Use x axis for cause, and y axis for result
- Use lines for ratios or dates (continuous data) 
- Expect people to read from left to right and top to bottom, so place the most important information in the top left corner of the chart
- Use color to differentiate between categories, but avoid using too many colors that can overwhelm the viewer
- Use 5 or fewer distinct colors in a chart to avoid overwhelming the viewer and to make it easier to differentiate between categories. If you have more than 5 categories, consider using other visual properties such as shape or size to differentiate between them, or consider grouping similar categories together to reduce the number of distinct colors needed.
- Align with cultural conventions (for example, using red for negative values and blue for positive values) to make it easier for viewers to interpret the chart based on their prior knowledge and expectations.

## Label Key Points

Labeling key points in a chart can help reduce eye travel and improve readability by providing clear and concise information about the data. When labeling key points, you should:
- Identify the most important insights or trends in the data that you want to highlight
- Use clear and concise labels that directly point to the relevant data points in the chart
- Avoid using a legend if possible, and instead place labels directly on the chart to reduce eye travel and make it easier for viewers to understand the chart without having to look back and forth between the chart and the legend
- Use color or other visual cues to draw attention to the labeled points and make them stand out from the rest of the data in the chart.


## Bin data

Most data benefits from some type of grouping (or binning). For example, if you are showing sales by date, it is often more effective to group the data by month or quarter rather than showing daily sales, which can be very noisy and difficult to interpret. Binning can help reduce visual clutter and make it easier for viewers to identify trends and patterns in the data. When binning data, you should:
- Choose an appropriate level of granularity for the data (for example, grouping by month or quarter rather than by day)
- Use clear and concise labels for the bins to make it easy for viewers to understand what they represent
- Consider using a histogram or bar chart to show the distribution of the binned data, which can help viewers understand the underlying patterns and trends in the data.

You should use the *bin* feature in Tableau for grouping continuous data.
You should use teh *group* feature in Tableau for grouping categorical data.