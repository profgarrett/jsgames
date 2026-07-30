<script src="/course_dv/toc.js"></script>

# Using Colors

**Outcomes**:
- Describe how common color vision deficiency is, and how the rate varies by sex and ancestry
- Identify the most common form of color vision deficiency and what it actually does to perception
- Differentiate between sequential, diverging, and categorical color scales, and select the correct one for a given dataset
- Explain why lightness, rather than hue, carries quantitative information
- Describe the emotional and cultural associations of color, and how they change interpretation
- Evaluate the palette in an existing visualization and fix what is wrong with it

**Links**

- [Color Blindness](https://www.theverge.com/23650428/colorblindness-design-ui-accessibility-wordle)
- [Color: From Hexcodes to Eyeballs](https://jamie-wong.com/post/color/)
- [Saccades and other weird things your eyes do](https://imgur.com/gallery/XNlmPi8)
- [Accessible data visualizations](https://ucdavisdatalab.github.io/workshop_data_viz_principles/accessible-data-visualizations.html)
- [Color scales](https://socviz.co/01-look-at-data.html#edges-contrasts-and-colors)
- [ColorBrewer: pick a safe palette](https://colorbrewer2.org/)
- [Viz Palette: test a palette you already have](https://projects.susielu.com/viz-palette)
- [WCAG 1.4.1: Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)
- [Activity: What is your color JND?](https://www.keithcirkel.co.uk/too-much-color/)
- [Activity: Is my blue your blue?](https://ismy.blue/)

**Common exam mistakes**:
- Using a red/green color scale without a second visual cue
- Using a rainbow or "jet" color scale for numeric data
- Using a sequential scale for data with a meaningful midpoint, or a diverging scale for data without one
- Using more than about seven colors in a categorical palette
- Using color to encode a value that the reader needs to compare precisely
- Assuming red always means "bad" and green always means "good"


## Color Vision Deficiency

Roughly 8% of men and 0.5% of women of Northern European descent have red-green color vision deficiency — about 1 in 12 men and 1 in 200 women. Ancestry matters: the rate among men is closer to 2.6% in Sub-Saharan African populations. For our class size, we would expect 1-3 people in class to have some form of color blindness. 

The most common specific form is **deuteranomaly**, affecting about 5% of men of Northern European descent. Deuteranomaly is not a missing green cone; it is a green cone whose sensitivity has shifted toward red. The result is compressed discrimination rather than total loss. Someone with deuteranomaly still sees red and green — they just cannot reliably tell your red bar from your green bar, especially when the two are small, thin, or far apart on the page.

![Same scatterplot under normal vision and simulated deuteranomaly, with a red/green palette and a blue/orange palette](colors-colorblind-demo.png)

In the top row, color is the only thing separating flagged from cleared transactions, so the chart stops working entirely. In the bottom row the categories survive, because blue and orange differ along a channel that deuteranomaly leaves intact. Note also that the large color swatches in the corner stay somewhat distinguishable even in the simulated panel, while the small scattered dots do not — mark size matters as much as hue choice.

In practice: avoid green/red pairs, and prefer blue/orange or purple/yellow. You may use green/red when the same information is also carried by another visual property — shape, position, direct labels, or a text annotation. This is the general rule, not a workaround: **never let color be the only carrier of meaning** (WCAG 1.4.1). Redundant encoding should be your default, and it is what makes red/green acceptable in the rare case you need it.


## Color Scales

Three types, and the question to ask for each:

- **Sequential**: the data has a natural low-to-high order with no meaningful middle. Population, sales, count of transactions. Use a single hue that runs light to dark.
- **Diverging**: the data has a **meaningful midpoint** that readers should be able to find. Zero, an average, a budget target, a break-even point. Profit vs. loss is one example, but so are temperature anomaly, election margin, and z-scores, none of which are "good vs. bad." The midpoint, not the good/bad framing, is what makes a scale diverging.
- **Categorical** (un-ordered hues): the data has groups with no order at all. Region, product line, department. Use distinct hues at similar lightness, so that no category looks "bigger" than another.

The most common error is a mismatch between the scale and the structure of the data: a sequential scale applied to profit and loss hides the break-even point, and a diverging scale applied to population invents a midpoint that does not exist.

![Color themes, sourced from https://socviz.co/lookatdata.html](color-themes.png)


## Lightness Does the Work

Most people think about color as hue — red, green, blue. But when color encodes a *number*, readers get almost all of their information from **lightness**, not hue. Light-to-dark is the channel the eye ranks reliably.

This is why the rainbow ("jet") scale fails. Rainbow scales do not get steadily lighter or darker as values increase. Their lightness rises and falls, so yellow appears as a bright false boundary in the middle of your data, while real differences in the dark blue and dark red ends get hidden. Readers see structure that is not in the data and miss structure that is.

It also gives you a rule that is easier to apply than "use a sequential scale for ordered data":

> For any scale that encodes a number, lightness must change monotonically across the scale.

Palettes such as **viridis**, **cividis**, and the ColorBrewer sequential sets are built to satisfy this. A useful test: convert your chart to grayscale. If the ordering survives, your lightness ramp is doing its job. If everything collapses into the same gray, you were relying on hue alone.

![Color lightness demonstration](colors-lightness.png)

## Color Is a Weak Channel for Magnitude

Color is near the bottom of the list of encodings people read accurately. Position on a common scale is at the top; length is next; area, angle, and color saturation trail well behind. Readers can compare two bar lengths to within a few percent. They cannot tell you that one shade of blue is 1.4 times another.

The practical consequence: if the reader needs to *compare quantities*, put them on a position or length scale. Reserve color for grouping, highlighting, and rough magnitude. A choropleth map is often the wrong chart for exactly this reason — it encodes your key number in the weakest channel and then distorts it further by geographic area.

![Color is a weak indicator of magnitude](colors-magnitude-vs-bars.png)

## How Many Colors, and Where to Point Them

Categorical palettes stop working past about **seven** hues. Beyond that, readers cannot match a color in the chart to a color in the legend, and you have built a puzzle rather than a chart. When you have twenty categories, the fix is never twenty colors. Group the small ones into "Other," facet into small multiples, or label the series directly and drop the legend.

The single most useful technique in this module: **gray out everything, then color the one thing you are talking about.** If your point is that the Northeast region collapsed, draw every other region in light gray and the Northeast in a single saturated color. This turns color from decoration into an argument. A chart where every series is colored is a chart with no emphasis at all.

![Fewer colors](colors-how-many.png)

## Small Marks Need Stronger Colors

The same fill color reads differently depending on how much of it there is. Large areas (filled bars, map regions, backgrounds) can use more muted and desaturated colors. A large block of saturated color can visually dominate the chart. Small marks (scatter points, thin lines, single-pixel strokes) need more saturated, higher-contrast colors, because the eye has less area to judge from.

## Color Emotion and Culture

Colors carry associations that shape how readers interpret your chart before they read a single number. Red suggests danger, heat, or urgency; blue suggests calm, cold, or trust. If you are showing a decline in sales, red reinforces the loss, while blue softens it. Choosing the color is part of making the argument, so choose deliberately.

But these associations are **learned, not universal**, and you should know your audience:

- In the US and Europe, red means loss in financial reporting. In China, Japan, Korea, and Taiwan, red conventionally means *gains* and green means losses — the opposite of the accounting convention you were taught.
- In the US, red and blue are strongly bound to political parties. A red-blue diverging scale on a US map will be read as partisan no matter what your data measures.
- Some conventions are worth respecting rather than fighting: traffic-light colors, established brand colors, and standard chart colors already used in a dashboard your reader knows.

When you build a set of charts, hold color meaning constant across all of them. If the Southeast is orange in one chart, it must be orange in every chart.


## Test Your Palette

Do not trust your own eyes, and do not stop at "I avoided red and green."

1. Simulate color vision deficiency. [Color Oracle](https://colororacle.org/) filters your whole screen; [Viz Palette](https://projects.susielu.com/viz-palette) checks a specific set of hex codes.
2. Convert to grayscale and confirm that ordered scales still read as ordered.
3. View the chart at the size it will actually be shown, including on a projector, which crushes contrast badly.
4. Print it in black and white, since someone will.


## Interpretation demonstrations

These are demonstrations of how the eye works, not just curiosities. Each one has a consequence for your charts.

We do not all interpret color the same. The link below compares your perception of blue versus green. If your own boundary between blue and green sits somewhere different than your neighbor's, you cannot assume readers will parse a fine hue distinction the way you do.

[Is my blue your blue?](https://ismy.blue/)

The picture below looks yellow, but a closer look reveals alternating green and red lines. Your eye combines the two colors into yellow. This is **optical mixing**, and its cousin **simultaneous contrast** — the same fill color looks different depending on what surrounds it. That is why readers cannot reliably compare two colored regions that are not adjacent, and why you should not build a chart that asks them to.

![Distance from Filtered Yellow, 1968 by Julian Stanczak, Source NDG](colors-yellow1.jpg)

![Closeup of Filtered Yellow, 1968 by Julian Stanczak, Source NDG](colors-yellow2.jpg)

Our eye invents movement. Even though the pixels do not move very far, we interpret the overall pattern as falling down the page. Perception adds things that are not in the data.

![Dot illusions](colors-illusion-dots.mp4)

Crowding together lines of text makes it less readable, and your eye fills in detail for fuzzy elements when you are far from the image. Both matter for axis labels on a projected slide.

[Video about spacing between lines / letters](https://www.youtube.com/watch?si=faN_Tz3MJ9m6I3Em&v=JTKwpqE9fsc)


## Key terms

- **Hue**: The attribute of a color that gives it a name — red, blue, green. Hue distinguishes categories well and communicates magnitude poorly.
- **Saturation**: How pure or intense a hue is, from gray to vivid. Saturation must be tuned to the size of the mark it is applied to.
- **Lightness**: How light or dark a color is. Lightness is the channel readers use to rank values, and it is what a sequential scale must vary.
- **Sequential scale**: A color scale for data with a natural low-to-high order and no meaningful middle, such as population. Runs light to dark in one hue.
- **Diverging scale**: A color scale for data with a **meaningful midpoint** — zero, an average, break-even, a target. The midpoint, not a good/bad meaning, is what makes a scale diverging.
- **Categorical scale**: A color scale for groups with no order, using distinct hues at similar lightness so no category appears larger than another.
- **Perceptually uniform palette**: A palette in which equal steps in the data produce equal-looking steps in color. Viridis and cividis are examples.
- **Monotonic lightness**: The property that lightness moves steadily in one direction across a scale. Required for any scale that encodes a number.
- **Rainbow (jet) scale**: A multi-hue scale whose lightness rises and falls rather than moving in one direction. It creates false boundaries and hides real differences; avoid it for numeric data.
- **Redundant encoding**: Carrying the same information in two channels at once, such as color plus shape or color plus a direct label. The default defense against color vision deficiency.
- **Direct labeling**: Placing a series name next to the series itself instead of in a legend. Removes the color-matching task from the reader.
- **Highlight technique**: Drawing every series in light gray and one series in a saturated color, so the palette states the argument rather than decorating the chart.
- **Simultaneous contrast**: The perceptual effect in which a color appears different depending on what surrounds it. It is why readers cannot reliably compare colored regions that are not adjacent.
- **Optical mixing**: The blending of small adjacent colors into a single perceived color, as in the Stanczak paintings where red and green lines read as yellow.
- **Choropleth**: A map that fills regions with color to encode a value. It uses the weakest channel for magnitude and distorts it further by geographic area.


## Practice questions

1. Roughly what share of men and women of Northern European descent have red-green color vision deficiency?
   - About 8% of men and 0.5% of women
   - About 1% of men and 8% of women
   - About 8% of men and 8% of women
   - About 25% of men and 5% of women

1. What is the most common specific form of color vision deficiency?
   - Deuteranomaly, a shift in the green cone's sensitivity toward red
   - Tritanopia, the absence of the blue cone
   - Monochromacy, the complete absence of color perception
   - Protanopia, the absence of the red cone

1. A student says "people with red-green color blindness cannot see the color red." What is wrong with this claim?
   - Most have anomalous cones rather than missing ones, so they see red but cannot reliably distinguish it from green
   - Nothing — the claim is accurate
   - They cannot see green either, so the claim is incomplete
   - Red-green color blindness affects only printed material, not screens

1. You are mapping profit and loss by region, where zero separates the two. Which color scale is correct?
   - Diverging, because the data has a meaningful midpoint
   - Sequential, because profit ranges from low to high
   - Categorical, because regions are categories
   - Rainbow, because it covers the widest range of values

1. You are shading a map by county population. Which color scale is correct?
   - Sequential, because the data is ordered with no meaningful midpoint
   - Diverging, because some counties are above average and some below
   - Categorical, because each county is a separate entity
   - Diverging, because population is always a good thing

1. Which of these requires a diverging scale even though no value is "good" or "bad"?
   - Temperature anomaly relative to the 20th-century average
   - Total units sold by product line
   - Number of employees per department
   - Days outstanding on accounts receivable

1. Why does the rainbow (jet) color scale fail for numeric data?
   - Its lightness rises and falls, creating false boundaries and hiding real differences
   - It contains too few distinct hues to show a range of values
   - It cannot be printed on a color printer
   - It uses red and green, which is its only real problem

1. Which channel do readers rely on most when decoding a number from a color?
   - Lightness
   - Hue
   - The name of the palette
   - The number of colors in the legend

1. What is a quick test of whether a sequential palette will work?
   - Convert the chart to grayscale and check that the ordering still reads correctly
   - Count the number of distinct hues it contains
   - Confirm that it starts with blue and ends with red
   - Check that no two adjacent colors share a hue

1. Your chart needs the reader to compare eight regional revenue figures precisely. What should carry the quantity?
   - Position or length, such as a sorted bar chart
   - Fill color on a sequential scale, with a legend
   - Fill color on a map of the regions
   - Circle area, sized proportionally to revenue

1. About how many hues can a categorical palette use before readers can no longer match a mark to its legend entry?
   - About seven
   - About three
   - About twelve
   - There is no practical limit if a legend is provided

1. You have twenty product lines to show in one chart. Which is *not* an appropriate fix?
   - Assign each product line its own distinct hue and add a legend
   - Group the smallest lines into an "Other" category
   - Split the chart into small multiples
   - Label the important series directly and drop the legend

1. Your point is that the Northeast region collapsed while the other seventeen held steady. What is the strongest use of color?
   - Draw all other regions in light gray and the Northeast in one saturated color
   - Give each of the eighteen regions a distinct color and add a legend
   - Use a diverging scale across all eighteen regions
   - Remove the other seventeen regions from the chart

1. Why is "a chart where every series is colored" a problem?
   - Coloring everything means nothing is emphasized, so the palette makes no argument
   - Colored series always print poorly in grayscale
   - Charts are limited to four colors by most software
   - Colored series cannot be read by people with color vision deficiency

1. A palette looks well balanced on your bar chart, but the same colors look washed out on your line chart. Why?
   - Perceived intensity depends on the area covered, so small marks need more saturation than large fills
   - Line charts render colors at a lower resolution than bar charts
   - The palette was built for a diverging scale rather than a categorical one
   - Line charts require a legend, and legends reduce color contrast

1. A US-based analyst uses red bars for gains and green bars for losses in a report for a Shanghai audience. What is the problem?
   - In several East Asian markets red conventionally signals gains and green signals losses, so the chart reads backwards
   - Red and green are the only colors that reproduce correctly in print
   - Red and green cannot be used together in any bar chart
   - The colors are fine; only the axis labels need translation

1. When is a red/green palette acceptable?
   - When the same information is also carried by another channel, such as shape or a direct label
   - When the chart is intended for an internal audience
   - When the red and green are far apart on the page
   - Never, under any circumstances

1. Which principle does WCAG 1.4.1 ("Use of Color") state?
   - Color must not be the only means of conveying information
   - Charts must use at least a 4.5:1 contrast ratio between series
   - Charts must not use more than seven colors
   - Red and green must never appear in the same visualization

1. Two counties are shaded nearly the same blue but sit on opposite sides of a large map. Why should you not ask readers to compare them?
   - Simultaneous contrast makes a color look different depending on its surroundings, so non-adjacent comparisons are unreliable
   - Maps always use diverging scales, which are not comparable
   - Readers can compare only three colors at a time
   - Blue is the hardest hue for the eye to distinguish

1. What is the correct order of operations when building a palette?
   - Identify the data type, choose a scale type, then test the palette at the mark size you will actually use
   - Choose colors you like, build the chart, then adjust if someone complains
   - Pick the software default, then swap in your organization's brand colors
   - Choose the number of colors first, then find data that fits
