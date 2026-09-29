# Systems Development and Systems Analysis

Most IT projects run late, over budget, or fail outright. This chapter (Chapter 22 in the textbook) introduces the systems development life cycle (SDLC), the people involved, how projects are planned and justified, why people resist new systems, and the first phase of the SDLC: systems analysis.

**Outcomes**
- Define key terms
- List the five phases of the SDLC and the deliverable of each
- Describe the people involved in systems development and their roles
- Explain the master plan and project development plan, and read a Gantt chart
- Evaluate a project using the five types of feasibility, including payback and NPV
- Explain why people resist system changes and how to reduce that resistance
- Describe the steps in systems analysis

**Links**
- [Slides](ais22-systems-development.pptx)
- [10 famous ERP disasters (CIO)](https://www.cio.com/article/278677/enterprise-resource-planning-10-famous-erp-disasters-dustups-and-disappointments.html)

## Why should we care?

The Standish Group's research on software projects (as cited in class) finds most projects are late (70%), over budget (54%), or unsuccessful (66%), and about 30% are cancelled. Some examples:

- The California DMV took 18 person-years to add Social Security numbers to its driver's license database. A seven-year, $44 million overhaul was cancelled.
- The IRS has spent billions trying to replace its aging systems, including a failed $3.3 billion effort and an $8 billion modernization program.
- Target Canada's supply chain collapsed at launch because the data typed into its new SAP system was riddled with errors. An investigation found only about 30% of it was correct.
- Woolworths Australia lost key knowledge when senior staff left during a six-year ERP rollout. Store profit-and-loss reports could not be produced for about 18 months.

Accountants are often the original users (and sometimes the original developers) of these systems. You will be asked to define requirements, test, and sign off.

## The systems development life cycle (SDLC)

The SDLC has five phases. Each ends with a deliverable.

| Phase | Key activities | Deliverable |
|---|---|---|
| 1. Systems analysis | Initial investigation, systems survey, feasibility study, determine information needs and requirements | Systems requirements (go/no-go) |
| 2. Conceptual design | Identify and evaluate design alternatives (buy, build, outsource), develop design specifications | Conceptual design requirements (a blueprint, not code) |
| 3. Physical design | Design output, database, input, programs, procedures, and controls | Developed system |
| 4. Implementation and conversion | Plan, install hardware and software, train, test, document, convert | Operational system |
| 5. Operations and maintenance | Post-implementation review, operate, modify, maintain | Improved system |

Feasibility is not a one-time check. It is re-evaluated at decision points throughout the project. Projects also loop backward: a change in scope sends you back to analysis, and an inadequate blueprint sends you back to conceptual design.

## Who is involved?

- **Management** supports the project, gets users involved, and aligns projects with strategy
- **Users** communicate their needs, help design and test the system
- **Information systems steering committee** executive-level group that plans and oversees the IS function and sets priorities
- **Project development team** plans and monitors a specific project
- **Systems analysts** determine information needs and prepare specifications for programmers
- **Computer programmers** write and test programs to the analysts' specifications

Two lessons from experience. First, include users in *every* phase. It improves the design and increases acceptance. Second, staff the project team with people who deeply understand the current ("as-is") process, even if they are busy. An experienced supervisor is more valuable to the team than a new hire who happens to be good with IT.

Communication is the biggest challenge. The classic "tree swing" cartoon shows the same project as proposed by the user, sold to management, designed by the analyst, written by the programmer, and what the user actually needed. They are all different.

## Planning

Two levels of plans:

- **Master plan** long-range, written by the steering committee. Lists prioritized projects and timetables.
- **Project development plan** specific to one project, written by the project team. Identifies the people, hardware, software, and money needed.

Two planning techniques:

- **PERT** (program evaluation and review technique): a diagram of all activities and their dependencies. The longest path through it is the **critical path**; any delay on it delays the whole project.
- **Gantt chart**: a bar chart with activities down the left and time across the top. Each bar shows when an activity is scheduled, and progress to date.

A simple Gantt chart for a traditional project shows the five SDLC phases as bars in sequence. Overlapping bars show work running at the same time, such as a pilot implementation starting before physical design is finished.

## Feasibility analysis

Before committing resources, build a business case. Five types of feasibility:

- **Economic** Do the benefits justify the costs?
- **Technical** Can it be built with available technology?
- **Legal** Does it comply with laws, regulations, and contracts?
- **Scheduling** Can it be done in the time available?
- **Operational** Do we have the people to build and run it, and will people use it?

Economic feasibility uses **capital budgeting** tools from your finance and managerial accounting classes:

- **Payback period** how long until savings repay the cost
- **Net present value (NPV)** the present value of future benefits minus the cost; accept if positive
- **Internal rate of return (IRR)** the discount rate that makes NPV zero; accept if above the required rate

For example, a system costs $100,000 and saves $40,000 a year for four years. The payback period is 2.5 years. At a 10% discount rate, the present value of the savings is about $126,800, so NPV is about $26,800 and the project is economically feasible.

## Behavioral aspects of change

New systems fail for people reasons as often as for technical ones.

> "It is difficult to get a man to understand something, when his salary depends on his not understanding it." — Upton Sinclair

**Why people resist** fear (of failure, the unknown, losing status), lack of top-management support, bad prior experiences, poor communication, disruption to their work, the way the change is introduced, biases and emotions, and personal background (such as comfort with technology).

**How resistance shows up**:

- **Aggression** behavior meant to make the system fail (errors, disruptions, sabotage)
- **Projection** blaming the new system for everything that goes wrong
- **Avoidance** ignoring the system in the hope it will go away

**How to reduce resistance**:

- Get management support, with resources and motivation
- Meet user needs, and involve users in the project
- Reduce fears and emphasize opportunities
- Avoid emotionalism; keep communication open
- Provide training
- Update performance evaluations and incentives to match the new system
- Test the system before it goes live
- Keep the system simple, and avoid radical changes
- Keep user expectations realistic

Concrete initiatives work better than general reassurance. For example: put respected employees on the project team, send regular project updates, and tie a bonus to successful adoption.

## Systems analysis

Systems analysis is the first phase of the SDLC. It has five steps and ends with a go/no-go decision.

1. **Initial investigation** define the problem, set the scope (what the project will and won't do), make a preliminary feasibility assessment, and prepare a proposal to conduct systems analysis.
1. **Systems survey** study the current system in depth using interviews, questionnaires, observation, and existing documentation. Document it with **physical models** (how it works: people, documents, locations) and **logical models** (what it does: data and processes). Summarize in a systems survey report.
1. **Feasibility study** a more thorough analysis, especially of economic costs and benefits.
1. **Information needs and systems requirements** determine what users need by asking them, analyzing existing external systems, examining the current system, or building a prototype.
1. **Systems analysis report** summarize the findings for management and the steering committee.

## Key Terms

- **Capital budgeting model**: A method of comparing a project's costs and benefits, such as payback, NPV, or IRR.
- **Computer programmers**: People who write and test programs according to the systems analysts' specifications.
- **Conceptual design**: The SDLC phase that evaluates design alternatives and produces design specifications.
- **Critical path**: The longest sequence of dependent activities in a PERT diagram; a delay on it delays the project.
- **Feasibility study**: An investigation of whether it is practical to develop a new system.
- **Gantt chart**: A bar chart showing project activities on one axis and time on the other.
- **Implementation and conversion**: The SDLC phase that installs, tests, and converts to the new system.
- **Information systems steering committee**: An executive-level committee that plans and oversees the IS function.
- **Logical models**: Documentation that shows what a system does (its data and processes), independent of how.
- **Operations and maintenance**: The SDLC phase in which the system is used, reviewed, and improved.
- **Payback period**: The time needed for a project's savings to repay its initial cost.
- **Physical design**: The SDLC phase that turns the conceptual design into detailed specifications and code.
- **Project development plan**: A plan for a single project listing the people, hardware, software, and money needed.
- **Systems analysis**: The first SDLC phase, which studies the current system and determines requirements for the new one.
- **Systems analyst**: A person who determines information needs and prepares specifications for programmers.
- **Systems development life cycle (SDLC)**: The five-phase process for developing a system: analysis, conceptual design, physical design, implementation and conversion, and operations and maintenance.
- **Systems documentation**: Material describing how a system works, such as flowcharts and narratives.

## Practice Questions

1. What are the five phases of the SDLC, in order?
   - Systems analysis, conceptual design, physical design, implementation and conversion, operations and maintenance
   - Conceptual design, systems analysis, physical design, operations and maintenance, implementation
   - Planning, coding, testing, conversion, review
   - Feasibility, design, programming, training, go-live
1. In which SDLC phase do we decide whether a project is feasible and determine requirements?
   - Systems analysis
   - Conceptual design
   - Physical design
   - Operations and maintenance
1. Who writes and tests programs according to specifications?
   - Computer programmers
   - Systems analysts
   - The IS steering committee
   - Users
1. Which group is executive-level and sets priorities across all IS projects?
   - Information systems steering committee
   - Project development team
   - Systems analysts
   - Computer programmers
1. A manager wants to show project activities and how far along each one is on a timeline. What should she use?
   - Gantt chart
   - Flowchart
   - Point-scoring evaluation
   - Systems survey
1. What is the critical path?
   - The longest sequence of dependent activities; a delay on it delays the project
   - The shortest route to project completion
   - The list of activities with the highest cost
   - The path data follows through the system
1. "Can we build this with the technology we have?" Which type of feasibility is this?
   - Technical
   - Economic
   - Operational
   - Legal
1. "Will employees actually use the new system?" Which type of feasibility is this?
   - Operational
   - Technical
   - Scheduling
   - Economic
1. A company is replacing its payroll system. When should the payroll clerks be involved?
   - In all phases, to improve the design and increase acceptance
   - Only during training
   - Only after the system goes live
   - Never, since they are not in IT
1. Which person would be most valuable on a project team replacing the warehouse inventory system?
   - The warehouse supervisor, who knows the current process well, even though she is busy
   - A summer intern who is good with IT but new to the company
   - A recent hire in marketing with spare time
   - An outside consultant with no industry experience
1. Which is the best way to reduce employee resistance to a new system?
   - Involve users on the project team and communicate openly and regularly
   - Keep the project secret until it is finished
   - Introduce as many changes as possible at once
   - Promise the system will solve every problem
1. What happens during the systems survey?
   - The team studies the current system in depth through interviews, observation, and documentation
   - The team writes the program code
   - The team converts data to the new system
   - The team reviews the system after it goes live
