# Fraud and Errors

Accountants are expected to catch fraud, or at least to build systems that make it hard to commit. This chapter (Chapter 8 in the textbook) covers the threats an AIS faces, what fraud is, why people commit it (the fraud triangle), how computers change fraud, and how organizations prevent and detect it.

**Outcomes**
- Define key terms
- Describe the four types of threats to an AIS
- Define fraud and distinguish misappropriation of assets from fraudulent financial reporting
- Describe the auditor's responsibility to detect fraud
- Explain the fraud triangle: pressure, opportunity, and rationalization
- Classify computer fraud by where it occurs (input, processor, computer instructions, data, output)
- Describe ways to prevent and detect fraud, including data analytics and Benford's Law

**Links**
- [Slides](ais08-fraud.pptx)

## Threats to an AIS

An AIS faces four types of threats:

| Threat | Examples |
|---|---|
| Natural and political disasters | Floods, fires, earthquakes, war, terrorism |
| Software errors and equipment malfunctions | Bugs, failed hard drives, power outages |
| Unintentional acts | Typos, lost data, misunderstood instructions |
| Intentional acts | Sabotage, computer crime, fraud |

Unintentional acts are the most common. By one estimate in the slides, about 80% of security problems come from human error. In 2024, Citigroup mistakenly credited a customer's account with $81 trillion instead of $280. Two employees reviewed the payment and missed the error. A third caught it about 90 minutes later, and it was reversed within hours; Citi said no money left the bank. No one intended harm, but controls still had to catch it.

**Sabotage** is an intentional act meant to destroy a system or some of its parts. The rest of this chapter focuses on the most common intentional act: fraud.

## What is fraud?

**Fraud** is any means a person uses to gain an unfair advantage over another person. Legally, five elements must be present:

1. A false statement, representation, or disclosure
1. A material fact, which induces a victim to act
1. An intent to deceive
1. The victim relied on the misrepresentation
1. The victim suffered an injury or loss

Most fraud is committed by **white-collar criminals**, businesspeople who use trickery or cunning rather than force, usually by violating trust. Two related crimes are **corruption** (dishonest conduct by those in power, often involving bribery) and **investment fraud** (misrepresenting facts to promote an investment that promises high returns with little or no risk, such as a Ponzi scheme).

Fraud can be surprisingly low-tech. In 2024, California investigators arrested four people accused of collecting about $142,000 from insurers by claiming a bear had damaged their luxury cars. A wildlife biologist reviewed the video and concluded it was "clearly a human in a bear suit."

### Two categories of fraud

| Category | What it is | How common | How costly |
|---|---|---|---|
| **Misappropriation of assets** | Theft of company assets, physical (cash, inventory) or digital (trade secrets, customer data) | About 90% of cases | Median loss about $100,000 |
| **Fraudulent financial reporting** | "Cooking the books," such as booking fictitious revenue or overstating assets | About 6% of cases | Median loss about $1 million |

*Figures are from the Association of Certified Fraud Examiners' (ACFE) Occupational Fraud 2026 report, which estimates that organizations lose about 5% of revenue to fraud each year.*

The pattern is the point: employees steal often but in smaller amounts, while financial statement fraud is rare but very costly. Charlie Javice sold her student-aid startup, Frank, to JPMorgan Chase for $175 million in 2021 after claiming it had over 4 million users. It had far fewer, and she was convicted of fraud in 2025. Theranos founder Elizabeth Holmes was convicted of defrauding investors with claims about blood-testing technology that did not work. Two young employees, Tyler Shultz and Erika Cheung, blew the whistle after seeing test results deleted to pass quality checks.

### Who commits fraud?

- Most fraudsters are first-time offenders, with no criminal record.
- Losses rise with rank. Owners and executives cause much larger losses than managers, who cause larger losses than employees. (In ACFE's 2024 study, median losses were about $500,000, $184,000, and $60,000.)
- Small companies are more vulnerable, since they often have fewer controls.
- Most fraudsters (84% in the 2026 report) show at least one behavioral red flag, most often living beyond their means, financial difficulties, or an unusually close relationship with a vendor.

### The auditor's responsibility

SAS No. 99 (now AU-C Section 240) requires auditors to:

1. Understand fraud
1. Discuss the risks of material fraudulent misstatements as a team
1. Obtain information about fraud risks
1. Identify, assess, and respond to those risks
1. Evaluate the results of their audit tests
1. Document and communicate their findings
1. Incorporate a technology focus

Undetected fraud is a factor in over half of lawsuits against auditors. Auditors themselves are not immune. In 2022, the SEC fined Ernst & Young a record $100 million after many of its auditors cheated on CPA ethics exams, and the firm misled investigators about it.

## Why fraud happens: the fraud triangle

Three conditions are usually present when fraud occurs:

> Pressure + Opportunity + Rationalization = Fraud

Remove any one, and fraud becomes much less likely. As accountants, the one we control best is opportunity.

### Pressure

**Pressure** is a person's incentive or motivation to commit fraud.

| Type | Examples |
|---|---|
| Financial | Living beyond one's means, high personal debt, inadequate salary, poor credit, heavy investment losses, unreasonable goals or quotas |
| Emotional | Greed, pride, ego; feeling unrecognized; fear of losing a job; envy or need to win; pressure from a boss |
| Lifestyle | Gambling, drugs, family problems |

For financial statement fraud, pressure often comes from the company's situation instead: industry conditions, management characteristics, or financial pressure such as a long streak of earnings increases that management doesn't want to break.

### Opportunity

**Opportunity** is the condition or situation that lets a person commit fraud. A fraudster needs the opportunity to do three things:

1. **Commit** the fraud (take the asset or misstate the records)
1. **Conceal** it (hide the theft, which is often the hardest part)
1. **Convert** the asset to personal use (sell stolen inventory, spend stolen cash)

Two classic concealment schemes:

- **Lapping** hides the theft of cash by delaying postings. An employee steals Customer A's payment, then applies Customer B's payment to A's account, then C's payment to B's account, and so on. (See Chapter 14.)
- **Check kiting** creates cash out of the delay between depositing a check and the check clearing. Suppose someone has accounts at Bank A and Bank B, both nearly empty. They write a $5,000 check on Bank A and deposit it in Bank B, then write a $5,000 check on Bank B and deposit it in Bank A before the first check clears. Repeating this makes both balances look funded while no real money exists.

Opportunity is where internal controls matter most. Segregation of duties, reconciliations, and restricted access all take away a fraudster's ability to commit or conceal.

### Rationalization

**Rationalization** lets fraudsters justify their behavior to themselves. Common examples:

- I am only "borrowing" the money and will repay it.
- You would understand if you knew how badly I needed it.
- What I did was not that serious.
- It was for a good cause (the Robin Hood syndrome).
- I occupy a very important position of trust. I am above the rules.
- Everyone else is doing it.
- No one will ever know.
- The company owes it to me.

When you read about a fraud in the news, try to identify all three sides of the triangle.

## Computer fraud

**Computer fraud** is any fraud that requires computer technology to commit. It is classified by where in the data processing cycle (Chapter 2) it happens:

| Type | What happens | Example |
|---|---|---|
| Input | Altering or falsifying data as it enters the system | Adding a fake vendor or a fake employee to payroll |
| Processor | Unauthorized use of the system itself | Using company servers to mine cryptocurrency |
| Computer instructions | Tampering with the software | Changing code to round down interest and send the fractions of a cent to the programmer's account |
| Data | Illegally using, copying, changing, or deleting stored data | Copying a customer list to take to a competitor |
| Output | Stealing or misusing system output | Pulling printed reports out of the trash |

Input fraud is the simplest and most common. It takes no programming skill, just access to enter data.

Computers also make fraud easier to scale. In 2024, an employee at a Hong Kong office of a multinational firm paid out about $25 million after a video call with what appeared to be the company's CFO and several colleagues. All of them were deepfakes.

## How fraud is caught

Tips are by far the most common way fraud is detected: 43% of cases in the 2026 ACFE report, more than any other method. This is why fraud hotlines matter. A typical asset misappropriation:

- starts with the fraudster gaining trust
- uses falsified records to hide the theft
- rarely stops on its own, and usually grows over time (stopping would likely lead to discovery)
- spends the money rather than saving or investing it

The median fraud lasts about 12 months before it is discovered.

## Preventing and detecting fraud

The textbook groups anti-fraud measures into four goals. Each has organizational and systems controls; we cover most of these in detail in Chapters 10–13.

| Goal | Organizational controls | Systems controls |
|---|---|---|
| 1. Make fraud less likely to occur | Create a culture of integrity; adopt a structure that minimizes fraud, with governance such as a board of directors; assign authority and hold people accountable; communicate policies | Develop security policies; implement change management and project development controls |
| 2. Make it difficult to commit | Strong internal controls; segregate accounting functions; properly designed forms; independent checks and reconciliations | Restrict access; authenticate users; controls over input, processing, storage, and output; encryption; fix bugs and update systems; destroy hard drives before disposal |
| 3. Improve detection | Assess fraud risk; external and internal audits; fraud hotline | Audit trail; fraud detection software; monitor system activity (user and error logs, intrusion detection) |
| 4. Reduce fraud losses | Insurance; business continuity and disaster recovery plans | Store backups off-site; monitor system activity |

### Data analytics

Fraud detection works much better when software examines the entire population of transactions instead of a sample. Every transaction can be compared against criteria, and anomalies flagged for a person to review. Data analytics doesn't detect fraud by itself. It finds unusual items, and an experienced person decides whether they are fraud. Common techniques include outlier detection, trend and pattern analysis, regression, and Benford's Law.

**Benford's Law** says that in many naturally occurring sets of numbers, the first digit is 1 about 30% of the time, and 9 less than 5% of the time, rather than the 11% you might expect. It applies to data that spans several orders of magnitude, such as invoice amounts or expense reports. It does not apply to assigned numbers (check numbers, zip codes) or amounts with caps.

| First digit | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|
| Expected frequency | 30.1% | 17.6% | 12.5% | 9.7% | 7.9% | 6.7% | 5.8% | 5.1% | 4.6% |

People who make up numbers tend to spread first digits evenly. If 15% of a clerk's expense claims start with 8 or 9, that is worth a look. A related red flag is a cluster of amounts just under an approval limit, such as many invoices for $4,900–$4,999 when purchases over $5,000 need a manager's approval.

## Key Terms

- **Benford's Law**: The pattern in which the first digits of many naturally occurring numbers are not evenly distributed; 1 appears about 30% of the time and 9 less than 5%.
- **Check kiting**: Creating cash using the time lag between depositing a check and the check clearing the bank.
- **Computer fraud**: Any type of fraud that requires computer technology to commit.
- **Corruption**: Dishonest conduct by those in power, often involving actions that are illegitimate, immoral, or incompatible with ethical standards, such as bribery.
- **Fraud**: Any means a person uses to gain an unfair advantage over another person.
- **Fraud triangle**: The three conditions usually present when fraud occurs: pressure, opportunity, and rationalization.
- **Fraudulent financial reporting**: Intentional or reckless conduct that results in materially misleading financial statements; "cooking the books."
- **Investment fraud**: Misrepresenting or leaving out facts to promote an investment that promises high profits with little or no risk.
- **Lapping**: Concealing the theft of cash through a series of delays in posting collections to accounts receivable.
- **Misappropriation of assets**: Theft of company assets by employees.
- **Opportunity**: The condition or situation that allows a person to commit and conceal a fraud and convert the theft to personal gain.
- **Pressure**: A person's incentive or motivation for committing fraud.
- **Rationalization**: The excuse fraudsters use to justify their illegal behavior.
- **Sabotage**: An intentional act meant to destroy a system or some of its components.
- **White-collar criminals**: Typically businesspeople who commit fraud through trickery or cunning, often by violating trust.

## Practice Questions

1. Which type of threat to an AIS is most common?
   - Unintentional acts, such as human error
   - Natural disasters
   - Sabotage
   - Equipment malfunctions
1. Which is NOT one of the elements required for an act to be legally considered fraud?
   - The perpetrator used a computer
   - A false statement or representation
   - An intent to deceive
   - The victim suffered a loss
1. An employee takes inventory home and sells it online. What category of fraud is this?
   - Misappropriation of assets
   - Fraudulent financial reporting
   - Corruption
   - Investment fraud
1. Executives record fictitious sales to meet analysts' earnings expectations. What category of fraud is this?
   - Fraudulent financial reporting
   - Misappropriation of assets
   - Check kiting
   - Lapping
1. Compared with misappropriation of assets, fraudulent financial reporting is:
   - Less common, but much more costly per case
   - More common, and more costly per case
   - More common, but less costly per case
   - About equally common and equally costly
1. What are the three sides of the fraud triangle?
   - Pressure, opportunity, rationalization
   - Commit, conceal, convert
   - Preventive, detective, corrective
   - Input, processing, output
1. Which side of the fraud triangle can an organization's internal controls most directly reduce?
   - Opportunity
   - Pressure
   - Rationalization
   - None of them
1. An employee says, "I'm only borrowing the money and will pay it back next month." This is an example of:
   - Rationalization
   - Pressure
   - Opportunity
   - Conversion
1. An employee has large gambling debts. Which part of the fraud triangle does this represent?
   - Pressure
   - Opportunity
   - Rationalization
   - Concealment
1. A fraudster needs the opportunity to commit, conceal, and convert. Which is usually the hardest?
   - Conceal
   - Commit
   - Convert
   - They are equally difficult
1. A person writes checks between two bank accounts to take advantage of the time it takes checks to clear, making both accounts look funded. What is this?
   - Check kiting
   - Lapping
   - Round-down fraud
   - Investment fraud
1. A payroll clerk adds a fictitious employee to the payroll file and collects the paychecks. What type of computer fraud is this?
   - Input fraud
   - Processor fraud
   - Computer instructions fraud
   - Output fraud
1. A programmer changes code so fractions of a cent from interest calculations go to her own account. What type of computer fraud is this?
   - Computer instructions fraud
   - Input fraud
   - Data fraud
   - Output fraud
1. Someone pulls printed customer reports out of a company's dumpster. What type of computer fraud is this?
   - Output fraud
   - Input fraud
   - Processor fraud
   - Computer instructions fraud
1. How is occupational fraud most often detected?
   - Tips
   - External audits
   - Data analytics software
   - Confessions
1. Which statement about using data analytics to detect fraud is true?
   - It flags unusual items, but a person must decide whether they are fraud
   - It proves that fraud occurred
   - It only works on a sample of transactions
   - It replaces the need for internal controls
1. Under Benford's Law, about how often should the first digit of a naturally occurring number be 1?
   - About 30% of the time
   - About 11% of the time
   - About 50% of the time
   - About 5% of the time
1. Which data set is LEAST appropriate for Benford's Law analysis?
   - Check numbers
   - Vendor invoice amounts
   - Employee expense claims
   - Customer sales amounts
1. Which is an example of reducing fraud losses, rather than preventing fraud?
   - Buying insurance
   - Segregating accounting duties
   - Creating a culture of integrity
   - Restricting access to the system
