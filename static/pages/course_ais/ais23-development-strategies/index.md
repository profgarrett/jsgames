# AIS Development Strategies

Once a project is approved, the first big question is "buy or build?" This chapter (Chapter 23 in the textbook) covers the three ways to obtain a system (purchase, build in-house, or outsource), how to run a request for proposal, what custom software really costs, and faster alternatives to the traditional SDLC: business process management, prototyping, and agile development.

**Outcomes**
- Define key terms
- Compare the three ways to obtain an AIS: purchase, develop in-house, and outsource
- Describe the RFP process, and evaluate vendors using point scoring
- Decide when to buy and when to build software
- Explain the drivers of custom software cost, including ongoing maintenance
- List the advantages and disadvantages of outsourcing
- Describe business process management (BPM) and its tools
- Compare prototyping and agile development to the traditional SDLC

**Links**
- [Slides](ais23-development-strategies.pptx)
- [Request for proposal guide (Smartsheet)](https://www.smartsheet.com/request-for-proposal)
- [Cost of software development (SphereGen)](https://www.spheregen.com/cost-of-software-development/)

## Three ways to obtain an AIS

- **Purchase** commercial software. This includes off-the-shelf ("canned") packages, **turnkey systems** (hardware and software sold together), and **Software-as-a-Service (SaaS)**, where you rent the software online (i.e., QuickBooks Online).
- **Develop in-house**, either by the IT department (**custom software**) or by the users themselves (**end-user computing**, such as spreadsheets and small databases).
- **Outsource** development or operations to an outside organization.

## Purchasing software

The purchasing process:

1. Identify potential vendors (referrals, trade shows, research).
1. Send a **request for proposal (RFP)** describing your requirements.
1. Evaluate the proposals. Invite the top vendors to give demonstrations, or have them run a **benchmark problem** using your data.
1. Make a final selection using your criteria.

A typical RFP includes an introduction, statement of purpose, background, scope of work, technical requirements, budget, project schedule, contract terms, review timeline, vendor questionnaire, selection criteria, and a point of contact.

Be careful with vendor answers. Many will say "yes" to a requirement that actually needs custom programming. Treat those as *not* met by the package, and note the extra cost.

Two ways to compare vendors:

- **Point scoring** give each criterion a weight, score each vendor, multiply, and add. The highest total wins. In the textbook's example, three vendors scored 4,290, 4,680, and 4,870 on 12 weighted criteria such as software compatibility and vendor support.
- **Requirement costing** list every required feature, and add up the cost of getting the missing features for each vendor.

## Buy or build?

Buy when:

- The task is defined by outside parties (i.e., bookkeeping that follows GAAP)
- The task is common to many companies (i.e., accounts payable)
- The task needs large, complex, interrelated programming (i.e., an ERP or Excel)
- Many clients can share the development cost

Build when:

- The task is your company's "secret sauce" (i.e., UberEats' delivery algorithm)
- The task is unique to your environment (i.e., case management for expert witnesses)
- The task is glue between systems (i.e., robotic process automation, interfaces)
- You are customizing a larger package (i.e., Salesforce)
- The investment directly improves efficiency or the quality of your product

In general, it is easier to change a business process to fit good software than to build software around your current process. Building custom software is expensive, slow, and risky.

## Building in-house

The main advantage of custom software is competitive advantage: no one else has it. The risks are significant: it takes a lot of time, systems are complex, requirements are poorly defined, planning is insufficient, communication breaks down, qualified staff are scarce, and top management support fades.

### What does custom software cost?

Cost depends on the **type** of project (new, integration, modification), its **size** (screens, tables, reports, integrations), and the **team** needed (project manager, UI/UX designer, business analyst, architect, database administrator, developers, QA). Some example ranges from a software firm:

| Project | Size | Time | Cost |
|---|---|---|---|
| Bug fix (known issue) | Small | 1–2 weeks | $2k–$10k |
| Proof of concept | Small | 4–8 weeks | $25k–$35k |
| Mobile app with cloud database | Medium | 4 months | $60k–$70k |

Be skeptical of low estimates. Formal models, such as COCOMO, estimate effort from the size of the program.

Custom software isn't one-and-done. It needs ongoing maintenance and development for as long as it is used. Digital companies spend heavily on R&D: in 2017, Facebook spent 19% of sales and Alphabet 15%, compared to 2% for General Motors.

## Outsourcing

Advantages:

- Lets the company focus on its core competencies
- Better asset utilization
- Access to greater expertise and better technology
- Lower costs from shared, standardized applications
- Less development time
- Eliminates peaks and valleys in IT workload
- Makes downsizing easier

Disadvantages:

- Inflexibility, and being locked into a system
- Loss of control
- Reduced competitive advantage
- Unfulfilled goals and poor service
- Increased risk

Labor costs vary widely by region. A mid-level developer cost roughly $132–$140 an hour in the U.S. in 2018, compared to $24–$35 in Asia.

## Business process management (BPM)

**Business process reengineering (BPR)** is a one-time, radical redesign of a process. **Business process management (BPM)** is a continuous approach to improving and optimizing business processes. Its principles are that processes can produce competitive advantage, must be managed end to end, should be agile, and must align with strategy.

A **business process management system (BPMS)** automates and supports BPM with:

- A process engine to model and run processes and business rules
- Business analytics to identify issues, trends, and opportunities
- Collaboration tools to remove communication barriers
- A content manager to store electronic documents and images

Flowcharts (see [Chapter 3](/pages/course_ais/ais03-flowcharts/index)) are the starting point: document the current process, then redesign it. Many workflow tools let you draw the flowchart and then run it as an application.

## Prototyping

**Prototyping** builds a simplified working model of the system to get user feedback, then refines it. It works best when users can't clearly define their needs. An **operational prototype** is refined into the final system; a **nonoperational (throwaway) prototype** is discarded once requirements are clear.

Advantages: well-defined user needs, higher user satisfaction and involvement, faster development, fewer errors, more chances to suggest changes, and lower cost.

Disadvantages: requires significant user time, may not use resources efficiently, may be inadequately tested and documented, can trigger negative behavioral reactions, and endless iterations can leave the feeling that the project is never finished.

## Agile development

**Agile development** delivers software in small increments, adapting to change along the way. It values:

| More | Less |
|---|---|
| Responding to change | Following a plan |
| Individuals and interactions | Tools, processes, and controls |
| Customer collaboration | Contract negotiation |
| Working, quality software | Comprehensive documentation |

The most common agile method is **Scrum**. The **product owner** represents the customer and maintains the **product backlog**, a prioritized list of **user stories** (short descriptions of a feature from the user's view). The **scrum team** builds a set of backlog items during each **sprint**, a short fixed period of a few weeks. The **scrum master** removes obstacles and keeps the process on track.

Other approaches include **extreme programming (XP)**, which emphasizes testing (unit, integration, and acceptance tests), and the **unified process**, which builds an **executable architecture baseline** early. **CASE** tools automate parts of development.

When should you use each?

- **Traditional SDLC** well-structured and simpler to manage; cheaper when requirements are clear and stable.
- **Agile** reduces risk when requirements are uncertain, and lets the team learn and change direction during the project.

## Key Terms

- **Acceptance tests**: Tests, often written by users, that confirm the system does what the user needs.
- **Agile development**: An approach that delivers software in small increments, emphasizing collaboration and responding to change.
- **Business process reengineering (BPR)**: A thorough, one-time redesign of business processes to achieve dramatic improvements.
- **Commercial software**: Software sold by vendors to many companies, often called off-the-shelf or canned software.
- **Custom software**: Software developed and written in-house for a specific organization.
- **End-user computing (EUC)**: Users developing, using, and controlling their own information systems, such as spreadsheets.
- **Help desk**: A group that answers user questions and resolves technical problems.
- **Integration tests**: Tests that check whether separate parts of a system work correctly together.
- **Outsourcing**: Hiring an outside company to handle some or all of an organization's IT development or operations.
- **Prototyping**: Building a simplified working model of a system to get user feedback.
- **Request for proposal (RFP)**: A document sent to vendors describing requirements and asking them to propose a solution and price.
- **Scrum development**: An agile method in which a small team builds the system in short, fixed iterations called sprints.
- **Software-as-a-Service (SaaS)**: Software rented over the internet rather than installed and owned.
- **Turnkey system**: A complete package of hardware and software sold together, ready to use.
- **Unit tests**: Tests that check whether an individual piece of code works correctly.
- **User stories**: Short descriptions of a feature from the user's point of view.

## Practice Questions

1. What are the three primary ways to obtain an AIS?
   - Purchase, develop in-house, or outsource
   - Rent, lease, or borrow
   - Prototype, agile, or waterfall
   - Analyze, design, or implement
1. What document is sent to vendors to request bids for a system?
   - Request for proposal (RFP)
   - Gantt chart
   - Systems survey report
   - Post-implementation review
1. A company assigns weights to 12 criteria, scores each vendor, and totals the weighted scores. What is this?
   - Point scoring
   - Requirement costing
   - Benchmark problem
   - Capital budgeting
1. Which task is the best candidate for buying commercial software?
   - Accounts payable, which is common to many companies
   - A delivery-routing algorithm that is the company's competitive advantage
   - An interface connecting two in-house systems
   - Case management for an unusual line of business
1. Why do many firms prefer an off-the-shelf system over building a custom one?
   - Custom systems are expensive, slow, and risky; it is usually easier to change the business process
   - Off-the-shelf systems never require customization
   - Custom systems cannot be integrated with other software
   - Off-the-shelf systems provide a unique competitive advantage
1. What is the main advantage of developing custom software in-house?
   - It can provide a significant competitive advantage
   - It is faster than buying software
   - It is cheaper than buying software
   - It requires no ongoing maintenance
1. Which is a disadvantage of outsourcing?
   - Loss of control and reduced competitive advantage
   - Lets the company focus on core competencies
   - Access to greater expertise
   - Eliminates peaks and valleys in IT workload
1. Which best describes business process management (BPM)?
   - A continuous approach to improving and optimizing business processes
   - A one-time, radical redesign of a process
   - A method for estimating software cost
   - A type of feasibility analysis
1. When is prototyping most useful?
   - When users cannot clearly define their needs
   - When requirements are fully known and stable
   - When no users are available to give feedback
   - When the system must be documented before it is built
1. Which does agile development value more than traditional development?
   - Responding to change
   - Following a plan
   - Contract negotiation
   - Comprehensive documentation
1. In Scrum, what is a sprint?
   - A short, fixed period in which the team completes a set of backlog items
   - The final testing phase before go-live
   - A meeting with the steering committee
   - A list of user requirements
1. Which is a good reason to choose agile over a traditional approach?
   - Requirements are uncertain, and the team needs to learn and adjust during the project
   - Requirements are clear and will not change
   - The project must have complete documentation before any code is written
   - The project must follow a fixed contract with no changes
