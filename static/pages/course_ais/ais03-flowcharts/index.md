# Systems Documentation: Flowcharts

Before you can audit, improve, or replace a system, you have to understand how it works. This chapter (Chapter 3 in the textbook) covers flowcharts, the most common way to document a process. We will use them again when we design new systems.

**Outcomes**
- Define key terms
- Explain why accountants need to read and create system documentation
- Identify common flowchart symbols
- Draw a flowchart of a business process, including decisions and documents
- Apply flowcharting guidelines to make a diagram clear and readable

**Links**
- [Slides](ais03-flowcharts.pptx)

## Why document systems?

A picture is worth a thousand words, particularly for a complex process. Accountants use documentation to:

- **Understand how a system works**. Auditors read documentation to assess risk and find weak controls.
- **Comply with regulations**. The Sarbanes-Oxley Act (SOX) requires management to assess internal controls, and auditors to evaluate that assessment. Both require documented processes.
- **Develop and change systems**. You can't design a better process until you have documented the current one.

The textbook covers three documentation tools: data flow diagrams, flowcharts, and Business Process Model and Notation (BPMN). In this course, we focus on flowcharts.

## Flowcharts

A **flowchart** is a diagram that shows how a process works. It shows:

- Inputs and outputs
- Processing activities
- Data storage
- Data flows
- Decision steps

The key strengths of flowcharts are that they show controls clearly (a decision point is often a control, such as "Is the amount over $10,000?"), and they distinguish manual from automated steps.

## Common symbols

You do not need to memorize every symbol in the textbook. These are the ones we use most:

| Symbol | Shape | Use |
|---|---|---|
| Terminal | Rounded rectangle or circle | Start or end of a process; also an external party |
| Process | Rectangle | A processing step (computer or general) |
| Decision | Diamond | A yes/no question; each branch is labeled |
| Document | Rectangle with a wavy bottom | A paper or electronic document or report |
| Database | Cylinder | Data stored electronically |
| Annotation | Open bracket | A comment or explanation |

## Example: buying coffee

Here is the process of buying a coffee, drawn as a flowchart would read:

```
(Start) → [Stand in line] → <Wait over 5 minutes?>
    Yes → (End: leave)
    No  → [Place order] → [Receive receipt (document)] → [Stand in line]
          → [Receive coffee] → <Correct drink?>
              Yes → (End)
              No  → ["Excuse me"] → back to [Stand in line]
```

Notice three things. First, each decision (diamond) has two labeled branches. Second, the receipt is shown with the document symbol, since it is a document the customer receives. Third, every path eventually reaches an end.

A good practice exercise is to design a flowchart for a process you know, such as contesting an unfairly graded assignment.

## Guidelines for drawing flowcharts

1. Understand the system you are trying to represent. Interview the people involved, and walk through the process.
1. Identify the business processes, documents, data flows, and processing steps.
1. Organize the flowchart so it reads top to bottom and left to right.
1. Clearly label every symbol, and label every branch coming out of a decision.
1. Use page connectors if the flowchart does not fit on a single page.
1. Edit, review, and refine until it is easy to read.

A common mistake is to include steps done by other people when the question asks only for one person's part of the process. Draw the scope you were asked for. Another common mistake is to forget the decision. If the description says "only if," "unless," or "over $X," you need a diamond.

## Key Terms

- **Annotation**: A symbol used to add a descriptive comment to a flowchart.
- **Decision symbol**: A diamond representing a yes/no decision, with a labeled branch for each outcome.
- **Document symbol**: A rectangle with a wavy bottom representing a paper or electronic document or report.
- **Documentation**: Narratives, flowcharts, diagrams, and other written material that explain how a system works.
- **Flowchart**: A diagram that shows the inputs, processing, storage, data flows, and decisions in a process.
- **Sarbanes-Oxley Act (SOX)**: A 2002 U.S. law requiring management to assess, and auditors to evaluate, internal controls over financial reporting.
- **Terminal symbol**: A symbol showing the beginning or end of a process, or an external party.

## Practice Questions

1. Which flowchart symbol represents a decision?
   - Diamond
   - Rectangle
   - Cylinder
   - Rectangle with a wavy bottom
1. Which flowchart symbol represents a document, such as an invoice?
   - Rectangle with a wavy bottom
   - Diamond
   - Cylinder
   - Circle
1. Which flowchart symbol represents data stored in a database?
   - Cylinder
   - Trapezoid
   - Pentagon
   - Diamond
1. What does a terminal symbol represent?
   - The start or end of a process, or an external party
   - A computer processing step
   - A paper file
   - A decision
1. In which direction should a flowchart normally read?
   - Top to bottom and left to right
   - Bottom to top and right to left
   - Clockwise in a circle
   - Any direction, as long as arrows are used
1. Which law requires management to assess internal controls, making documentation important?
   - Sarbanes-Oxley Act
   - Foreign Corrupt Practices Act
   - Dodd-Frank Act
   - Securities Act of 1933
1. What is a key strength of flowcharts compared to a written narrative?
   - They show decision points (often controls) and manual versus automated steps clearly
   - They show the dollar value of each transaction
   - They replace the need for internal controls
   - They can only be read by IT staff
1. A process says, "Invoices over $10,000 receive review by the CFO." How should this appear in a flowchart?
   - A decision diamond with labeled yes and no branches
   - A document symbol
   - An annotation only
   - A database symbol
1. Why would an auditor read a client's flowcharts?
   - To understand how the system works and assess risk
   - To calculate depreciation
   - To write the client's software
   - To replace the need for testing controls
