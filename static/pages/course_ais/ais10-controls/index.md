# Control and Accounting Information Systems

Chapters 8 and 9 covered what can go wrong. This chapter (Chapter 10 in the textbook) covers how organizations respond: internal controls. We look at the types of controls, the laws that require them, the major control frameworks (COBIT, COSO, and COSO-ERM), and the five components of COSO's internal control framework, from the control environment to monitoring.

**Outcomes**
- Define key terms
- Explain basic control concepts, including threats, impact, and likelihood
- Distinguish preventive, detective, and corrective controls, and general and application controls
- Explain how the FCPA and Sarbanes-Oxley Act affect internal control
- Compare the COBIT, COSO, and COSO-ERM frameworks
- Describe the elements of a company's control environment
- Assess and respond to risk, including calculating expected loss
- Describe common control activities, including segregation of duties
- Describe how organizations communicate information and monitor controls

**Links**
- [Slides](ais10-controls.pptx)

## Why control is needed

Three terms describe risk:

- A **threat** (or event) is anything that could harm the AIS or the organization.
- The **exposure** (or impact) is the potential dollar loss if the threat happens.
- The **likelihood** is the probability that the threat will happen.

Many organizations underestimate both the impact and the likelihood of threats. A primary objective of an AIS is to control the organization so it can achieve its objectives. Management expects accountants to take a proactive approach to eliminating threats, and to detect, correct, and recover from them when they happen.

## Internal controls

**Internal controls** are the processes a company uses to provide reasonable assurance that it will:

- Safeguard assets
- Maintain sufficient records
- Provide accurate and reliable information
- Prepare financial reports according to established criteria
- Promote and improve operational efficiency
- Encourage adherence to management policies
- Comply with laws and regulations

"Reasonable" assurance, not absolute. No set of controls is perfect, and a control that costs more than the loss it prevents is not worth having.

### Functions of controls

| Function | Purpose | Example |
|---|---|---|
| **Preventive controls** | Stop problems before they happen | Requiring a password; segregation of duties |
| **Detective controls** | Discover problems that weren't prevented | Bank reconciliations; reviewing logs |
| **Corrective controls** | Fix problems and recover from them | Restoring data from a backup; correcting an error and resubmitting |

Controls are also classified by scope:

- **General controls** make sure the organization's overall control environment is stable and well managed, such as security, IT infrastructure, and software acquisition and maintenance.
- **Application controls** prevent, detect, and correct errors and fraud in individual application programs. They focus on the accuracy, completeness, validity, and authorization of data. An edit check that rejects a negative quantity on a sales order is an application control.

### Levers of control

The textbook also describes four "levers" management can use to balance control with employee creativity:

| Lever | What it does | Example |
|---|---|---|
| **Belief system** | Communicates how the company creates value and its core values | Mission statement |
| **Boundary system** | Sets limits employees must not cross | Code of conduct |
| **Diagnostic control system** | Compares actual performance to goals | Budget variance reports |
| **Interactive control system** | Focuses managers and employees on key strategic issues | Regular strategy meetings with front-line managers |

## Laws that require internal control

| Law | Year | Key provisions |
|---|---|---|
| **Foreign Corrupt Practices Act (FCPA)** | 1977 | Prohibits bribing foreign officials to obtain business. Requires all publicly owned corporations to maintain a system of internal accounting controls. |
| **Sarbanes-Oxley Act (SOX)** | 2002 | Passed after the Enron and WorldCom frauds. Applies to public companies and their auditors. Aims to prevent financial statement fraud, make reports transparent, protect investors, strengthen internal controls, and punish executives who commit fraud. |

SOX changed how accountants work:

- It created the **Public Company Accounting Oversight Board (PCAOB)** to set and enforce auditing standards for public company audits.
- Section 302 requires the CEO and CFO to certify the financial statements.
- Section 404 requires management to report on the effectiveness of internal control over financial reporting; for larger companies, the auditor must also attest to it.
- Auditors cannot provide many non-audit services, such as bookkeeping or designing information systems, to companies they audit.
- Audit committees must be independent and must set up a way for employees to report concerns anonymously.

## Control frameworks

A framework gives everyone a common language and checklist for internal control.

| Framework | Issued by | Focus |
|---|---|---|
| **COBIT** | ISACA | IT governance and control |
| **COSO Internal Control–Integrated Framework** | COSO | Internal control across the whole enterprise (control-based) |
| **COSO-ERM** | COSO | Expands COSO to enterprise risk management (risk-based) |

### COBIT

**Control Objectives for Information and Related Technology (COBIT)** is a framework for IT governance and control. The current version is COBIT 2019. The textbook describes five principles:

1. Meeting stakeholder needs
1. Covering the enterprise end-to-end (IT runs through the whole business, not just the IT department)
1. Applying a single, integrated framework (it aligns with COSO and other frameworks)
1. Enabling a holistic approach
1. Separating governance from management

(These five come from COBIT 5. COBIT 2019 restates them as six principles, but the ideas are the same.)

COBIT 2019 separates governance from management. The board handles governance: evaluate, direct, and monitor (EDM). Management handles the day-to-day work, organized into four domains: align, plan, and organize (APO); build, acquire, and implement (BAI); deliver, service, and support (DSS); and monitor, evaluate, and assess (MEA).

### COSO

The **Committee of Sponsoring Organizations (COSO)** is a private-sector group sponsored by five professional organizations, including the AICPA and the Institute of Internal Auditors. Its **Internal Control–Integrated Framework (IC)** is the standard used for SOX compliance. It has five components, remembered as **CRIME**:

| Letter | Component |
|---|---|
| C | Control activities |
| R | Risk assessment |
| I | Information and communication |
| M | Monitoring |
| E | Control environment |

The control environment is listed last in the mnemonic, but it is the foundation for the other four. COSO's Enterprise Risk Management framework (COSO-ERM) builds on the same ideas, but starts from risk and strategy rather than controls.

The rest of this chapter walks through the five components.

## Control environment

The **control environment** is the company's culture: the "tone at the top." It is the foundation for every other component. If management doesn't care about controls, employees won't either. Elements include:

- **Management's philosophy, operating style, and risk appetite.** **Risk appetite** is the amount of risk a company is willing to accept to achieve its goals. Does management take unnecessary risks, or pressure employees to hit unrealistic targets?
- **Commitment to integrity, ethical values, and competence.** Is there a written code of conduct? Is dishonest behavior punished, even when it is profitable?
- **Internal control oversight by the board of directors.** Public companies must have an **audit committee** of independent board members who oversee financial reporting, internal control, and the internal and external auditors.
- **Organizational structure.** Clear lines of authority and reporting.
- **Methods of assigning authority and responsibility.** Written job descriptions and a **policy and procedures manual** that explains proper business practices and how to handle transactions.
- **Human resource standards.** Hiring (including a **background check** to verify education, work history, and criminal records), training, compensating, evaluating, and, when necessary, firing employees. Requiring vacations and rotating duties help uncover fraud.

## Risk assessment

Risk is assessed on two dimensions:

- **Likelihood**, the probability that the event will occur
- **Impact**, the estimated loss if it does

Multiplying the two gives the **expected loss**:

> Expected loss = Impact × Likelihood

There are also two types of risk:

- **Inherent risk** is the risk that exists before any controls are put in place.
- **Residual risk** is the risk that remains after controls are put in place.

### Is a control worth it?

Compare the reduction in expected loss to the cost of the control. Suppose a payroll error would cost $10,000 to fix, and has a 15% chance of happening each pay period:

| | Without control | With control |
|---|---|---|
| Impact | $10,000 | $10,000 |
| Likelihood | 15% | 1% |
| Expected loss | $1,500 | $100 |

The control reduces expected loss by $1,400. If it costs $600, it is worth implementing, for a net benefit of $800. If it cost $2,000, it would not be.

In practice, many companies can't estimate exact probabilities, so they rate risks as high, medium, or low and plot them on a heat map.

### Risk responses

Once a risk is assessed, management can respond in four ways. Take the risk of a car accident:

| Response | What it means | Car accident example |
|---|---|---|
| Reduce | Implement effective internal controls | Drive carefully; take a defensive driving course |
| Accept | Do nothing; accept the likelihood and impact | Choose a higher deductible |
| Share | Buy insurance, outsource, or hedge | Buy car insurance |
| Avoid | Don't engage in the activity | Don't drive; take the bus |

## Control activities

**Control activities** are the policies and procedures that make sure risk responses are carried out. There are seven categories.

### 1. Proper authorization

**Authorization** means management sets policies and empowers employees to carry them out.

- **General authorization** lets employees handle routine transactions without special approval, such as a cashier ringing up sales.
- **Specific authorization** requires special approval, such as a manager approving a sale on credit above the customer's limit.

Electronic documents can be authorized with a **digital signature**, which can't be forged (Chapter 12 explains how).

### 2. Segregation of duties

**Segregation of accounting duties** separates three functions (remember **ARC**):

| Function | Examples |
|---|---|
| Authorization | Approving transactions and decisions |
| Recording | Preparing source documents, entering data, maintaining journals and ledgers, preparing reconciliations |
| Custody | Handling cash, inventory, or fixed assets; writing checks; receiving checks in the mail |

If one person has two of these, they can commit and conceal fraud:

- Custody + recording: steal assets and falsify the records to hide it
- Authorization + custody: authorize a fake transaction and take the assets
- Authorization + recording: authorize a false transaction and record it to cover it up

Segregation of duties can be defeated by **collusion**, two or more people working together to commit fraud. That's why job rotation and mandatory vacations help.

**Segregation of systems duties** applies the same idea to IT. These roles should be held by different people:

| Role | Responsibility |
|---|---|
| **Systems analysts** | Work with users to determine needs and design systems |
| **Programmers** | Write the programs from the analysts' design |
| **Computer operators** | Run the computers and make sure data is processed correctly |
| **Users** | Record transactions, authorize processing, and use output |
| **Systems administrators** | Keep the system running smoothly |
| **Network managers** | Keep the networks running and devices connected |
| **Security management** | Protect systems from internal and external threats |
| **Change management** | Make sure changes are made smoothly without hurting reliability |
| **Data control** | Make sure source data is approved, reconcile input and output, handle errors |

A programmer who can also run programs on live data could change the payroll program to pay herself, then run it. Keeping programmers out of production systems prevents this.

### 3. Project development and acquisition controls

These keep systems projects (Chapters 22–24) on track:

- A **steering committee** of executives plans and oversees the IS function.
- A **strategic master plan** lists the projects needed over several years to reach long-range goals.
- A **project development plan** shows each project's tasks, who will do them, completion dates, and costs.
- **Project milestones** are checkpoints where progress is reviewed.
- A **data processing schedule** shows when each processing task should run.
- **System performance measurements** evaluate the system: **throughput** (output per unit of time), **utilization** (percentage of time the system is used productively), and **response time** (how long the system takes to respond).
- A **postimplementation review** checks whether a new system met its objectives.

When a company outsources development, a **systems integrator** may manage the work of the company's staff and several vendors.

### 4. Change management controls

Changes to systems should be formally requested, approved, tested, and documented before they go live. (Chapter 11 covers this in more detail.)

### 5. Design and use of documents and records

Well-designed documents help make sure transactions are recorded accurately and completely. Prenumbered documents make missing ones easy to spot (Chapter 2).

### 6. Safeguarding assets, records, and data

Restrict access to assets; keep records of all assets; protect against fire, theft, and environmental damage; back up data.

### 7. Independent checks on performance

Someone other than the person who did the work checks it:

- Top-level reviews of performance against budgets
- **Analytical review**, examining relationships between sets of data (sales up 20% but cost of goods sold flat is worth a question)
- Reconciling independently maintained records, such as the AR subsidiary ledger to the general ledger
- Comparing actual quantities to recorded amounts, such as a physical inventory count
- Double-entry accounting (debits must equal credits)

### Worked example: the movie theater

At a movie theater, you buy a prenumbered ticket from a cashier, then hand it to a different employee at the entrance, who tears it.

- **What it prevents.** The cashier can't pocket cash without issuing a ticket, because the cash in the drawer must match the number of tickets sold. People can't get in without paying, because the ticket taker checks every ticket.
- **Controls used.** Prenumbered tickets (documents), segregation of duties (the cashier has custody of cash; the ticket taker verifies), and reconciliation of cash to tickets sold (independent check).
- **What's left.** Collusion. The cashier and ticket taker could agree to let friends in, or the ticket taker could collect untorn tickets and hand them back to the cashier to resell.

## Information and communication

Three principles apply:

1. Obtain or generate relevant, high-quality information to support internal control.
1. Communicate information internally, including objectives and responsibilities.
1. Communicate relevant internal control matters to external parties.

An **audit trail** lets a transaction be traced from its source document to the financial statements, and back (Chapter 2).

## Monitoring

Monitoring checks that controls are working, and fixes them when they're not:

- Perform internal control evaluations, such as internal audits
- Implement effective supervision
- Use responsibility accounting systems, such as budgets
- Monitor system activities
- Track purchased software and mobile devices
- Conduct periodic external, internal, and network security audits
- Employ a **computer security officer (CSO)**, independent of the IS function, and a **chief compliance officer (CCO)** responsible for SOX and other legal compliance
- Engage **forensic investigators** and **computer forensics specialists**, who find and preserve evidence of fraud so it holds up in court
- Install fraud detection software, some of which uses **neural networks** to learn what normal activity looks like and flag what isn't
- Implement a **fraud hotline** so employees can report problems anonymously

## Key Terms

- **Analytical review**: Examining the relationships between different sets of data.
- **Application controls**: Controls that prevent, detect, and correct transaction errors and fraud in application programs.
- **Audit committee**: Independent board members responsible for overseeing financial reporting, regulatory compliance, internal control, and the internal and external auditors.
- **Audit trail**: A path that allows a transaction to be traced from its source to the final output, and back.
- **Authorization**: Establishing policies for employees to follow and empowering them to perform certain organizational functions.
- **Background check**: An investigation of a prospective or current employee, including verifying education and work history, checking references, and checking criminal records.
- **Belief system**: Communicates how a company creates value and its core values, to help employees understand management's vision.
- **Boundary system**: Helps employees act ethically by setting limits beyond which they must not pass.
- **Change management**: The process of making sure changes to systems are made smoothly and efficiently without harming reliability.
- **Chief compliance officer (CCO)**: The employee responsible for compliance with SOX and other laws and regulations.
- **Collusion**: Cooperation between two or more people to commit fraud.
- **Committee of Sponsoring Organizations (COSO)**: A private-sector group that issued the Internal Control–Integrated Framework.
- **Computer forensics specialists**: Computer experts who discover, extract, safeguard, and document computer evidence so it holds up to legal challenges.
- **Computer operators**: Employees who run the computers and make sure data is processed correctly and output is produced.
- **Computer security officer (CSO)**: An employee independent of the IS function who monitors the system and communicates about improper system uses and their consequences.
- **Control activities**: Policies, procedures, and rules that provide reasonable assurance that control objectives are met and risk responses are carried out.
- **Control environment**: The company culture that is the foundation for all other components of internal control.
- **Control Objectives for Information and Related Technology (COBIT)**: ISACA's framework for IT governance and control.
- **Corrective controls**: Controls that identify and correct problems and recover from them.
- **Data control**: The function that makes sure source data is approved, monitors processing, reconciles input and output, and handles errors.
- **Data processing schedule**: A schedule showing when each data processing task should be performed.
- **Detective controls**: Controls that discover problems that were not prevented.
- **Diagnostic control system**: Measures and monitors actual performance and compares it to budgets and goals.
- **Digital signature**: A means of electronically signing a document with data that cannot be forged.
- **Expected loss**: The impact of a threat multiplied by its likelihood.
- **Exposure/impact**: The potential dollar loss if a threat occurs.
- **Foreign Corrupt Practices Act (FCPA)**: A 1977 law that prohibits bribing foreign officials and requires public companies to maintain a system of internal accounting controls.
- **Forensic investigators**: Specialists in fraud investigation, often with law enforcement training or CPA or CFE credentials.
- **Fraud hotline**: A phone line or website employees can use to report fraud and abuse anonymously.
- **General authorization**: Authorization for employees to handle routine transactions without special approval.
- **General controls**: Controls that make sure the organization's control environment is stable and well managed.
- **Inherent risk**: The risk that exists before any controls are put in place.
- **Interactive control system**: Helps managers focus subordinates' attention on key strategic issues and be more involved in their decisions.
- **Internal Control–Integrated Framework (IC)**: COSO's framework for defining, evaluating, and improving internal control; its five components are the control environment, risk assessment, control activities, information and communication, and monitoring.
- **Internal controls**: Processes implemented to provide reasonable assurance that control objectives are achieved.
- **Likelihood/risk**: The probability that a threat will occur.
- **Network managers**: Employees who make sure devices are linked to the organization's networks and that the networks operate properly.
- **Neural networks**: Computing systems that imitate the brain's learning process; used to detect unusual patterns such as fraud.
- **Policy and procedures manual**: A document describing proper business practices, job duties, and how to handle transactions.
- **Postimplementation review**: A review, after a new system has been running for a while, of whether it meets its objectives.
- **Preventive controls**: Controls that deter problems before they arise.
- **Programmers**: Employees who write programs based on the systems analysts' design.
- **Project development plan**: A document showing a project's tasks, who will perform them, completion dates, and costs.
- **Project milestones**: Points in a project where progress is reviewed and actual and estimated completion times are compared.
- **Public Company Accounting Oversight Board (PCAOB)**: The board created by SOX to regulate the auditing of public companies.
- **Residual risk**: The risk that remains after controls are put in place.
- **Response time**: How long it takes a system to respond.
- **Risk appetite**: The amount of risk a company is willing to accept to achieve its goals.
- **Sarbanes-Oxley Act (SOX)**: A 2002 law that strengthened internal control and financial reporting requirements for public companies and their auditors.
- **Security management**: The function that makes sure systems are secure and protected from internal and external threats.
- **Segregation of accounting duties**: Separating the authorization, recording, and custody functions so no one person can commit and conceal fraud.
- **Segregation of systems duties**: Dividing IS functions among different people so no one can perform incompatible functions.
- **Specific authorization**: Special approval an employee needs before handling a transaction.
- **Steering committee**: An executive-level committee that plans and oversees the IS function.
- **Strategic master plan**: A multiyear plan of the projects a company must complete to achieve its long-range goals.
- **System performance measurements**: Measures used to evaluate a system, such as throughput, utilization, and response time.
- **Systems administrators**: Employees who make sure all IS components operate smoothly and efficiently.
- **Systems analysts**: Employees who help users determine their information needs and design systems to meet them.
- **Systems integrator**: A vendor who manages a cooperative development effort involving its own staff, the client's staff, and other vendors.
- **Threat**: Any potential adverse occurrence or unwanted event that could harm the AIS or the organization; also called an event.
- **Throughput**: The amount of output a system produces per unit of time.
- **Users**: Employees who record transactions, authorize data to be processed, and use system output.
- **Utilization**: The percentage of time a system is being used productively.

## Practice Questions

1. A threat has an impact of $50,000 and a likelihood of 10%. What is the expected loss?
   - $5,000
   - $50,000
   - $500,000
   - $45,000
1. A control would reduce the expected loss from a threat from $8,000 to $2,000. When is it worth implementing?
   - When it costs less than $6,000
   - When it costs less than $8,000
   - When it costs less than $2,000
   - Always, since it reduces risk
1. A bank reconciliation reveals an unrecorded withdrawal. What type of control is the bank reconciliation?
   - Detective
   - Preventive
   - Corrective
   - Diagnostic
1. Requiring a password before an employee can log in is what type of control?
   - Preventive
   - Detective
   - Corrective
   - Interactive
1. An edit check rejects a sales order with a negative quantity. What type of control is this?
   - Application control
   - General control
   - Boundary system
   - Corrective control
1. Which law requires public companies to maintain a system of internal accounting controls and prohibits bribing foreign officials?
   - Foreign Corrupt Practices Act (FCPA)
   - Sarbanes-Oxley Act (SOX)
   - General Data Protection Regulation (GDPR)
   - Health Insurance Portability and Accountability Act (HIPAA)
1. Which organization was created by the Sarbanes-Oxley Act to regulate audits of public companies?
   - Public Company Accounting Oversight Board (PCAOB)
   - Committee of Sponsoring Organizations (COSO)
   - ISACA
   - Financial Accounting Standards Board (FASB)
1. Which framework focuses specifically on IT governance and control?
   - COBIT
   - COSO Internal Control–Integrated Framework
   - COSO-ERM
   - GAAP
1. Which is NOT one of the five components of the COSO Internal Control–Integrated Framework?
   - Segregation of duties
   - Control environment
   - Risk assessment
   - Monitoring
1. Which COSO component is the foundation for all of the others?
   - Control environment
   - Control activities
   - Monitoring
   - Information and communication
1. A company's audit committee is made up of the controller, treasurer, and financial vice president. What is the problem?
   - The audit committee should be made up of independent outside directors
   - The audit committee is too small
   - The controller should not be on any committees
   - There is no problem
1. A company buys insurance against fire damage to its warehouse. Which risk response is this?
   - Share
   - Reduce
   - Accept
   - Avoid
1. A company stops selling a product line because of product liability risk. Which risk response is this?
   - Avoid
   - Share
   - Accept
   - Reduce
1. What is residual risk?
   - The risk that remains after controls are put in place
   - The risk that exists before any controls are put in place
   - The amount of risk a company is willing to accept
   - The probability that a threat will occur
1. Which three functions should be segregated?
   - Authorization, recording, and custody
   - Planning, organizing, and controlling
   - Input, processing, and output
   - Preventive, detective, and corrective
1. An employee who receives customer checks in the mail also posts payments to customer accounts. Which two functions are combined?
   - Custody and recording
   - Authorization and custody
   - Authorization and recording
   - Recording and monitoring
1. Segregation of duties is least effective against which threat?
   - Collusion between two employees
   - A single employee stealing cash
   - Recording fictitious transactions
   - Unauthorized purchases
1. Why should programmers not have access to run programs on live company data?
   - They could change a program to commit fraud and then run it
   - Programmers do not understand accounting
   - It slows down processing
   - It violates the FCPA
1. A cashier can ring up routine sales without a manager's approval. What type of authorization is this?
   - General authorization
   - Specific authorization
   - Digital signature
   - Boundary system
1. At a movie theater, the cashier sells prenumbered tickets and a separate employee collects them at the door. Which risk remains?
   - The cashier and ticket taker could collude
   - The cashier could keep cash without issuing tickets
   - Customers could enter without a ticket
   - Ticket sales could not be reconciled to cash
1. A company has reported higher earnings for 25 straight quarters, but earnings are now leveling off. Why does this concern an auditor?
   - It creates pressure on management to misstate results
   - It shows the control environment is strong
   - It means the company has no inherent risk
   - It violates COBIT
1. Purchasing agents wear clothing from major vendors and the purchasing manager vacations on a vendor's boat. What should an auditor be concerned about?
   - Kickbacks influencing which suppliers are chosen
   - Lapping
   - Inaccurate inventory counts
   - Weak password controls
