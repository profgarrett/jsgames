# How to Write a Good Report

A report is a concise argument for a specific conclusion from specific evidence. Your reader wants the conclusion first and the supporting detail second.  It is not a diary of your analysis process!

**Outcomes**:

- Organize a report with the standard sections
- Clearly present a thesis
- Support thesis with graphs and/or statistics


## Overview

- **Length**: No more than 3 pages, including figures.
- **File format**: Word Document *(NOT A PDF)*
- **Figures**: At least one, with a good title that states the takeaway.
- **AI Use**: You are responsible for everything in the report, including the parts a model wrote. "The AI produced that number" is not a defense. Not being able to explain what the AI wrote will result in no credit for the report..


## 1. Title and Introduction

Start with the title of your report, class, name, and date.  Then write a sentence with your thesis. Last, summarize the data and methods you used to reach that conclusion.

>  **Evidence for Santa Claus in Holiday Toy Orders.**
>
>  **Nathan Garrett. ACCT 425/BUDA 451. August 1, 2026.**
> 
> A 25% decline in toy orders around December provides clear evidence for the existence of Santa Claus. I use a dataset of 2.6 million holiday toy orders from Amazon and Target. This dataset includes information on toy sales, prices, and buyers. Graphing data over time shows a consistent pattern of declining orders in the weeks leading up to Christmas. If Santa did not exist, we should expect to see an increase in toy orders. However, the decline indicates another source of gifts. 
>
> *Chart (with a thesis as the title)*


## 2. Data

Describe your data in a short paragraph: source, time period, number of observations, and how it was collected. State every exclusion and the reason for it, with counts. Then list your key variables as bullets, marking which one is the outcome and giving the type and units of each.

> **Data**
> 
> Amazon and Target provided 3,048,112 order records from the 2020–2026 holiday seasons. Orders were included only if the gift-message field identified a giver. The analysis set contains 2,605,992 orders.
>
> Key variables:
>
> - **Sale price** — decimal, USD. *Outcome variable.* Range $0.99 to $499.00, mean $34.18, SD $14.90.
> - **Item type** — categorical: game, toy, or doll.
> - **Order date** — datetime, converted to `days_until_christmas` (integer, 0 to 53).


## 3. Method and Results

This is a more detailed paragraph than the introduction. State your main finding first, then provide the supporting evidence. Include a figure or table that illustrates your main finding.

This section demonstrates that you understand your model's output! It's very important to explain what each element means, and not just report a statistic. For example, "the coefficient for Santa is 0.42" is not enough; you must also explain what that means in the context of your data and question.

A model is not required for ACCT 425/BUDA 450, as those classes use a graphical approach instead of a model. If your analysis requires explanation, add it here (for example, for complicated data transformations). Students from ACCT 426/BUDA 451 should include their model (such as regression). 

> **Methods**
>
> The model explains 56% of the variation in sales (R² = 0.56, RMSE = $9.20, n = 2,605,992). However, the predicted line is only a match for non-December months. During December, we see a significant residual (error) as the actual sales drop below actual sales. 
>  
> *Include the regression output table.*
>
>  *Include a coefficient plot with confidence intervals, and a residual-versus-fitted plot.*
> 

## 4. Limitations

Explain potential problems your analysis. Be specific about three things: 

- Data issues (missing data, selection bias, etc.)
- Model issues (does your data fit the model requirements? Are there any violations of assumptions?)
- Causal inference issues (can you make a causal claim from your analysis?)

> **Limitations**
>
> The gift-message field records who a gift *claims* to be from, not who paid for it. The 412,006 orders with blank gift messages were dropped, and they may differ systematically from the rest.
> The data covers two large general retailers. Specialty toy stores, where average prices are higher, are absent.
> Finally, this is observational data. The analysis identifies an association between a text label and a price; it establishes nothing about what caused either.

## 5. Conclusion

Restate your thesis and summarize your evidence. Then, suggest a next step for research or analysis.

> **Conclusion**
>
> The decline in toy orders around December provides strong evidence for the existence of Santa Claus. Graphs of the data show a consistent pattern of declining orders in the weeks leading up to Christmas. Future research could examine specialty toy stores, where average prices are higher, to see if the same pattern holds.


## 6. References

List your data sources, your tools with versions, and AI assistance. Link to anything a reader could check. If a source is not public, say so rather than inventing a link.

> **References**
>
> - Amazon.com and Target holiday order extract, 2020–2026 season. Provided under data access request #4471; not publicly available.
> - R 4.4.1. Models estimated with `lm()` from the **stats** package; figures produced in Tableau 2024.2.
> - ChatGPT (GPT-4o, accessed 15 July 2026) was used to debug a date-parsing error in the `days_until_christmas` conversion and to draft an initial version of the Figure 2 caption. All output was checked against the source data.


## Good Examples

These are longer and less structured than the report you are being asked to write. But, they are excellent examples of how to communicate complex ideas clearly and effectively. 

- [Most Deadly Animals](https://www.gatesnotes.com/Most-Deadly-Animal-Mosquito-Week-2016) 
- [The limits of personal experience](https://ourworldindata.org/limits-personal-experience) 
- [Is 200k a year good?](https://ofdollarsanddata.com/is-200k-a-year-good/) 
- [Generational Wealth](https://ofdollarsanddata.com/generational-wealth/) 