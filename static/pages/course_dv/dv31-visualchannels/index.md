# Visual channels

Data visualization represents *numbers* with *visual elements*.  This module covers how our visual system interprets different mapping approaches. We call these **visual channel**. This module covers channel definitions, accuracy, and usage.

**Outcomes**:
- Decide when to use a table versus a chart
- Understand visual channels 
- Rank the accuracy of different visual channels 
- Map visual channels to different chart types 

**Links**:
- [Socviz website's Look at Data](https://socviz.co/lookatdata.html)


## What is a chart?

There are multiple overlapping terms used to describe charts. A **chart** is a general term for any visual representation of data. This includes bar charts, line charts, pie charts, scatter plots, and more. I use *chart* and *graph* interchangeably in our class.

Some visual representations are better called diagrams. These include things like SmartArt, which has visual elements but does not map elements to numbers. We focus on the visual elements that map visuals to to data through a consistent function.

The diagram below shows some examples of charts versus non-charts.

![Examples of charts compared to diagrams that are not charts](images/what-is-a-graph.webp)


### What is a table?

**A table is not a chart!** It has rows and columns of numbers. A table can *contain* charts when it uses graphical elements to represent data values, such as a heatmap table or other conditional formatting.

Tables and charts answer different questions, so neither is "better":

| Use a table when | Use a chart when |
| --- | --- |
| Readers need exact values | Readers need a pattern, trend, or comparison |
| There are only a handful of numbers | There are many values |
| Values are looked up individually | Values are read together |

Tables have been around for a very long time. The image below shows an inventory of shepherds and herds from around 1300 BC. You can see that it has rows and columns, each with a cell recording data.

![Linear B clay tablet with ruled rows and columns of inscribed characters. Tablet from around 1200 BC, showing an inventory of shepherds & herds. Linear B, palace of Pylos. Image taken by Nathan Garrett, 2024.](table_images/tablet_1.png)


Historical tables:
- [Explanation of Cuneiform text](https://www.datafix.com.au/BASHing/2020-08-12.html)
- [Website with tables](https://www.are.na/joshua-kopin/tabular-presentation)


## Graphs use visual channels

A graph uses **visual channels** to represent data. Your visual system processes many of these channels very quickly and without conscious effort. Charts work better when we interpret values intuitively. We want to avoid forcing the user to conciously count or manipulate data.

Because these channels are interpreted by a biological visual system, they are limited by that system's capabilities. Some channels are far better than others for conveying information accurately.

### Per-attentive versus accurate

Two related ideas get mixed up constantly, so keep them separate:

- **Pre-attentive** describes what your eye detects in under a quarter of a second, without searching. A single red dot in a field of gray dots "pops out." This is about *noticing*.
- **Accuracy** describes how well you can judge *how much* a visual element represents. Reading that one bar is 1.4 times another is a slow, deliberate task.

A channel can be great at one and poor at the other. Color hue pops out instantly but is terrible for judging magnitude. The rest of this module is about accuracy. 

### Channels for quantities versus categories

Choose the channel to match the data type:

- **Number data** (sales, hours, temperature) needs a channel with an ordered magnitude: position, length, angle, area, luminance.
- **Categorical data** (region, product line, department) needs a channel that separates without implying order: hue, shape, texture.

Encoding categories with a magnitude channel implies a ranking that does not exist. Encoding quantities with hue throws away most of your precision. The accuracy ranking below applies only to number channels.

### Channels 

*Channels for numbers*, listed roughly from most to least accurate:

- Position on a common scale
- Position on unaligned scales
- Length
- Tilt or angle
- Area (2D as size)
- Depth (3D as position)
- Color luminance or brightness
- Color saturation or intensity
- Curvature
- Volume (3D as size)

![Ten visual channels illustrated, from position on a common scale down to volume. Source: socviz](images/preattentive1.png)

*Channels for categories*. Note that only a handful of levels are usable at once — see [dv36. Colors](../dv36-colors/index).

- Hue
- Shape
- Texture

![Three channels for quantitative data, source: NDG](images/categorymappingschemes.png)


### Accuracy

Cleveland and McGill (1984) tested how accurately people judge magnitudes from different chart designs. Heer and Bostock (2010) replicated the study using crowdsourced workers on Mechanical Turk. The charts below come from that work, by way of [socviz](https://socviz.co/lookatdata.html).

**How to read these charts.** The dot is average error and the bars are the confidence interval. The x-axis is *log error*, so **shorter is better** and a difference of 1.0 is large. Each label (T1, T2, and so on) is a different chart design that the study participants were asked to read.

#### Position and length: what T1 through T5 mean

This first chart compares five bar-chart designs, not five different channels.

- **T1–T3** are **position on a common scale**: the two bars being compared both sit on the same baseline. Accuracy drops slightly as the bars get farther apart.
- **T4–T5** are **length**: the segments being compared float inside a stacked bar and do not share a baseline, so the reader must judge length instead of position.

<!-- Verify the exact geometry of each of T1-T5 against Figure 1 of Cleveland & McGill (1984) before lecture. The T1-T3 / T4-T5 split is solid; the specific separation distances per type are worth double-checking. -->

![Cleveland and McGill results: log error rises steadily from T1 through T5](images/error01.png)

The takeaway: **position on a common scale beats length**, and this is why an ordinary bar chart outperforms a stacked bar chart for comparing values.



**Group 1: Best accuracy**

The most accurate charts use position on a common scale. Our visual systems are very good at comparing positions, especially when everything starts on the same axis. Bar charts are the most common chart type for a reason.

![Error rates for bars sharing an axis and placed adjacently](images/error02.png)

**Group 2: Moderate accuracy**

Next come judgments on unaligned scales and length judgments. This includes comparing values that do not share an axis, such as the upper segments of a stacked bar chart or bars in separate small-multiple panels. So bar charts are still the best option, but *stacking* them costs you accuracy.

![Error rates for length judgments in stacked bars](images/error03.png)

Pie charts also land here. They combine angle, arc length, and area. Pie charts are popular, but they are measurably less accurate than bar charts.

![Error rates for angle judgments in pie charts](images/error04.png)

**Group 3: Low accuracy**

Area is one of the least accurate channels. This includes bubble charts, where the size of a circle represents a value. People systematically underestimate large areas, and circles are read less accurately than rectangles.

![Error rates for area judgments in bubble charts](images/error05.png)


## Mapping chart types to channels

| Chart type | Main channel | Accuracy |
| --- | --- | --- |
| Bar chart (unstacked, shared axis) | Position on a common scale | High |
| Dot plot | Position on a common scale | High |
| Line chart | Position on a common scale, plus slope | High |
| Scatterplot | Position on two common scales | High |
| Stacked bar, bottom segment | Position on a common scale | High |
| Stacked bar, upper segments | Length | Moderate |
| Small multiples / separate panels | Position on unaligned scales | Moderate |
| Pie or donut chart | Angle, arc length, and area | Moderate |
| Bubble chart | Area | Low |
| Treemap | Area | Low |
| Heatmap | Color luminance or saturation | Low |
| Any 3D chart | Volume or depth | Lowest |

The practical rule: **if the reader needs to compare values, use position on a common scale.** Reach for area or color only when you are showing rough magnitude or adding a secondary variable to a chart that already uses position.

Accuracy is not the only thing that matters. A treemap handles hundreds of categories that would not fit in a bar chart, and a heatmap shows a whole matrix at once. Just be aware of what precision you are trading away.


## Check your understanding

1. Your manager wants to know the exact revenue for each of six regions to paste into a memo. Table or chart? Why?
2. You have a stacked bar chart of revenue by region and product line. Which comparisons are easy, and which are hard?
3. Why does a bubble chart understate large values?
4. A dashboard encodes "department" using a blue-to-red gradient. What is wrong with that choice?


## References

- Cleveland, W. S., & McGill, R. (1984). Graphical perception: Theory, experimentation, and application to the development of graphical methods. *Journal of the American Statistical Association*, 79(387), 531–554.
- Heer, J., & Bostock, M. (2010). Crowdsourcing graphical perception: Using Mechanical Turk to assess visualization design. *CHI '10*, 203–212.
- Healy, K. *Data Visualization: A Practical Introduction*, ch. 1, [Look at Data](https://socviz.co/lookatdata.html).
