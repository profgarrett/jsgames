# Systems Design, Implementation, and Operation

This chapter (Chapter 24 in the textbook) walks through the last four phases of the SDLC: conceptual design, physical design, implementation and conversion, and operations and maintenance. The big themes are to plan on paper before you code, test early because bugs get more expensive over time, and pick a conversion approach that matches your tolerance for risk.

**Outcomes**
- Define key terms
- Describe the activities and deliverable of conceptual design, including use cases and test cases
- Describe the activities of physical design, including output, input, and database design
- Describe the activities of implementation, including documentation and testing
- Compare the four conversion approaches (direct, parallel, phase-in, pilot) by risk and cost
- Explain the purpose of a post-implementation review

**Links**
- [Slides](ais24-design-implementation.pptx)

## Phase 2: Conceptual design

Conceptual design turns the requirements from systems analysis into a general framework, or blueprint. It produces written documents, not code. There are three steps:

1. **Evaluate design alternatives**. The key question is buy vs. build (vs. outsource). Compare how well each alternative meets objectives and user needs, its feasibility, and its advantages and disadvantages.
1. **Prepare design specifications** for input, processing and operations, data storage, and output.
1. **Prepare the conceptual systems design report** for the steering committee.

This is also where you define **use cases** (how users will interact with the system to accomplish a goal) and **test cases** (specific inputs with an expected result). A good test case is precise enough that anyone can say whether it passed. For example:

- Enter a $900 purchase order, under the $5,000 approval limit. *Expected*: sent to the vendor without manager approval.
- Enter a $7,500 purchase order. *Expected*: held until a manager approves it.
- Record a $200 credit sale of goods that cost $120. *Expected*: accounts receivable and revenue up $200, cost of goods sold up $120, inventory down $120, net income up $80.

Include both normal transactions and the exceptions that trigger controls.

## Phase 3: Physical design

Physical design translates the blueprint into detailed specifications, and then into code. It covers six areas: output, file and database, input, programs, procedures, and controls.

**Output design** decides what reports are produced, and when:

- **Scheduled reports** produced on a regular schedule (monthly sales report)
- **Special-purpose analysis reports** no set format or schedule; produced for a specific question
- **Triggered exception reports** produced automatically when something unusual happens (inventory below reorder point)
- **Demand reports** produced when a user asks

Output considerations include who will use it and why, the medium (screen, paper), format (narrative, table, chart), who has access, level of detail, and timeliness.

**File and database design** considers the storage medium, processing mode (manual, batch, real time), maintenance, size, and how often records change.

**Input design** considers where data comes from, how it is entered (keyboard, barcode, RFID, EDI), volume, frequency, cost, and which errors are possible and how to catch them. Good forms group related information, follow the order data is collected, are prenumbered, and include space for approvals and signatures.

**Program design** uses **structured programming**, breaking a program into small modules. Programs then go through **debugging** and, once in use, **program maintenance**.

The phase ends with a **physical systems design report**.

## Phase 4: Implementation

Implementation installs the system and gets it ready to use. It includes:

- An **implementation plan**, including how the organization will convert (see below)
- Selecting and training personnel
- Completing documentation: **development documentation** (for programmers), **operations documentation** (for IT staff running the system), and **user documentation** (for the people using it)
- Testing the system

### Testing

Three types of testing:

- **Walk-throughs** step-by-step reviews of procedures or program logic
- **Processing test data** running all valid transactions *and* error conditions through the system
- **Acceptance tests** users test the system with copies of real data

Testing is not optional. Most defects are introduced during coding, and the cost to fix one rises sharply the later it is found. One widely cited estimate puts the cost at about $25 during coding, $100 in unit testing, $1,000 in system testing, and $16,000 after release. Squeezing QA time to hit a deadline usually raises total cost.

## Conversion

**Conversion** is the switch from the old system to the new. There are four approaches:

| Approach | How it works | Risk | Cost |
|---|---|---|---|
| **Direct** ("big bang") | Turn off the old system, turn on the new one (often over a weekend) | Highest | Lowest |
| **Parallel** | Run old and new systems side by side, and compare results | Lowest | Highest (two systems, double the work) |
| **Phase-in** | Replace the old system gradually, one module at a time | Moderate | Moderate |
| **Pilot** | Implement in one part of the organization first (i.e., one store or branch), then roll out | Moderate | Moderate |

Approaches can be combined. A retailer might pilot at one store, fix problems, then roll out to all stores. On a Gantt chart, the pilot bar can overlap the end of physical design, followed by a full implementation bar.

## Phase 5: Operations and maintenance

Operations and maintenance is the longest and most expensive phase; by one estimate, about 75% of a system's lifetime cost. It starts with a **post-implementation review**, which asks:

- Does the system meet the organization's goals? Are users satisfied?
- Were expected benefits achieved, and were costs in line with estimates?
- Is the system reliable? Does it produce accurate, complete, and timely data?
- Is it compatible with existing systems?
- Is it protected from errors, fraud, and intrusion? Are there adequate error-handling procedures?
- Is everyone trained, and is documentation complete and accurate?

The findings go into a **post-implementation review report**. Problems found here often send the project back to an earlier phase for adjustments.

## Key Terms

- **Acceptance tests**: Tests in which users run the new system using copies of real data.
- **Conceptual design specifications**: Requirements for the new system's input, processing, storage, and output, prepared during conceptual design.
- **Conceptual systems design report**: The report summarizing conceptual design, used to decide whether to proceed to physical design.
- **Conversion**: Changing from the old system to the new one, including hardware, software, data, and procedures.
- **Debugging**: Finding and removing errors in a program.
- **Demand reports**: Reports with a set format, produced only when a user requests them.
- **Direct conversion**: Terminating the old system and immediately starting the new one; also called "big bang." Highest risk.
- **Implementation plan**: The plan for installing the system, including tasks, timing, costs, and the conversion approach.
- **Parallel conversion**: Running the old and new systems at the same time for a period. Lowest risk, highest cost.
- **Phase-in conversion**: Gradually replacing parts of the old system with the new one.
- **Physical systems design report**: The report summarizing what was accomplished in physical design.
- **Pilot conversion**: Implementing the system in one part of the organization first, such as a single branch.
- **Post-implementation review**: A review, after the system is running, of whether it met its goals.
- **Post-implementation review report**: The report of the findings of the post-implementation review.
- **Processing test data**: Running valid transactions and error conditions through a system to check that it handles them correctly.
- **Program maintenance**: Updating programs after they are in use, to fix errors or meet new needs.
- **Scheduled reports**: Reports with a set format, produced on a regular schedule.
- **Special-purpose analysis reports**: Reports with no set format or schedule, produced for a specific question.
- **Structured programming**: Building programs from small, independent modules.
- **Systems implementation**: Installing hardware and software and getting the system ready to use.
- **Test case**: A specific input or scenario with an expected result, used to check whether a system works.
- **Triggered exception reports**: Reports produced automatically when an unusual condition occurs.
- **Use case**: A description of how a user interacts with the system to accomplish a goal.
- **Walk-throughs**: Step-by-step reviews of procedures or program logic.

## Practice Questions

1. Which phase of a project ends with a blueprint but no software?
   - Conceptual design
   - Physical design
   - Implementation and conversion
   - Operations and maintenance
1. In which phase do we evaluate whether to buy, build, or outsource?
   - Conceptual design
   - Physical design
   - Operations and maintenance
   - Implementation
1. In which phase do we create use cases?
   - Conceptual design
   - Physical design
   - Implementation and conversion
   - Operations and maintenance
1. In which phase is the program code written?
   - Physical design
   - Conceptual design
   - Systems analysis
   - Operations and maintenance
1. A report is generated automatically whenever inventory falls below its reorder point. What type of report is this?
   - Triggered exception report
   - Scheduled report
   - Demand report
   - Special-purpose analysis report
1. Which conversion approach has the lowest risk?
   - Parallel
   - Direct
   - Pilot
   - Phase-in
1. Which conversion approach has the highest risk?
   - Direct (big bang)
   - Parallel
   - Pilot
   - Phase-in
1. A bank implements a new system at one branch before rolling it out to all branches. What conversion approach is this?
   - Pilot
   - Parallel
   - Direct
   - Phase-in
1. A company switches from its old system to the new one over a single weekend. What conversion approach is this?
   - Direct
   - Parallel
   - Pilot
   - Phase-in
1. What is the main drawback of parallel conversion?
   - It is costly, since both systems must be operated at the same time
   - It is the riskiest approach
   - It cannot catch errors in the new system
   - It only works for small organizations
1. Users run the new system with copies of real data before go-live. What is this?
   - Acceptance test
   - Walk-through
   - Post-implementation review
   - Debugging
1. Why should QA time not be cut to meet an aggressive schedule?
   - Bugs are inevitable, and they cost far more to fix after release than during development
   - QA is only needed for small systems
   - Pressure makes programmers write code without defects
   - Testing can be done after release at the same cost
1. Which is a well-written test case for a new purchasing system?
   - Enter a $7,500 purchase order; expect it to be held until a manager approves it
   - Make sure the system works correctly
   - Test the purchase order screen
   - Check that users like the system
1. What is the purpose of a post-implementation review?
   - Determine whether the new system meets its goals and expected benefits
   - Select a vendor for the new system
   - Write the program specifications
   - Decide whether the project is feasible
1. Which phase accounts for the largest share of a system's lifetime cost?
   - Operations and maintenance
   - Systems analysis
   - Conceptual design
   - Implementation and conversion
