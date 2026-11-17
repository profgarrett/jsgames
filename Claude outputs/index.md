# Ethics

**Outcomes**:

- Distinguish ethics from legal compliance, and explain why compliance is a floor, not the goal
- Apply a six-question checklist to assess a data project or a real-world case
- Explain informed consent and when experiments on users need it
- Explain who controls personal data and how data gets reused for new purposes
- Explain how re-identification happens through data linkage and metadata, and describe ways to reduce the risk
- Identify how bias enters a model, and measure disparities across groups
- Identify which laws apply to a given data project

**Links**:

- [Inside Amsterdam's high-stakes experiment to create fair welfare AI](https://www.technologyreview.com/2025/06/11/1118233/amsterdam-fair-welfare-ai-discriminatory-algorithms-failure/) (MIT Technology Review and Lighthouse Reports, 2025). Read before class.
- [How Lighthouse tested Amsterdam's model for fairness](https://www.lighthousereports.com/methodology/amsterdam-fairness/)
- [What does it mean for an algorithm to be "fair"?](https://www.technologyreview.com/2025/06/17/1118918/what-does-it-mean-for-an-algorithm-to-be-fair/)
- [Machine Bias](https://www.propublica.org/article/machine-bias-risk-assessments-in-criminal-sentencing) (ProPublica, 2016)
- [The Belmont Report](https://www.hhs.gov/ohrp/regulations-and-policy/belmont-report/index.html)


## Why ethics matters in data work

Three different questions often get mixed together:

- **Law**: what you *must* do. Break it and you can be fined or sued.
- **Custom**: what people in your field *usually* do.
- **Ethics**: what you *should* do, after weighing who benefits, who is harmed, and whether that is fair.

These usually agree, but not always. Plenty of harmful practices were both legal and customary for decades. In this chapter, ethics means practical decision-making on real projects, not abstract philosophy.

Data work raises the stakes in two ways:

- **Scale.** A person who makes a bad call affects one case. A model that makes the same bad call repeats it thousands of times a day.
- **Distance.** The people affected by a model usually never see it, can't question it, and may not know it exists.

Guidelines already exist: the ACM Code of Ethics, the American Statistical Association's ethical guidelines, and NIST's AI Risk Management Framework. The hard part is applying them to a specific project, with a deadline and a manager who wants results. That is what this chapter practices.


## A checklist for ethical decisions

Use these six questions on any project, from a class assignment to a production model:

1. **Who is affected?** Include the people in the data, the people the decisions are about, and people who are missing from the data entirely.
2. **What happens when the model is wrong, and who pays?** Every model makes errors. Ask what a false positive and a false negative cost, and whether those costs fall mostly on one group.
3. **Would the people in the data expect this use?** Data shared for one purpose (getting a loan, using a fitness app) often gets reused for another. Surprise is a warning sign.
4. **Is there a less invasive way?** Could you use less data, coarser data, or aggregated data, or keep it for less time, and still get most of the value?
5. **Can you explain and audit it?** Could you explain one decision to the person it affected? Could you show how outcomes differ across groups?
6. **Which laws apply?** Law is the floor. Clearing it doesn't finish the analysis.

The checklist draws on the **Belmont Report** (1979). It was written after the Tuskegee syphilis study, in which U.S. Public Health Service researchers withheld treatment from Black men for 40 years (1932–1972). Belmont sets three principles that still govern research on people:

- **Respect for persons**: people decide for themselves whether to take part. Informed consent comes from this principle.
- **Beneficence**: maximize benefits and minimize harm.
- **Justice**: spread burdens and benefits fairly. The people who bear the risk should share in the benefit.


## Informed consent

Informed consent means people:

- understand the nature and purpose of the data collection or experiment,
- agree voluntarily, and
- can withdraw.

At universities, research on people goes through an **Institutional Review Board (IRB)**, which reviews consent and risk under a federal regulation called the Common Rule. Companies running experiments on their own users usually aren't covered by those rules, so the decision falls to the people building the product.

Online, users are experimented on constantly, and asking consent for every test isn't practical. So where is the line? Consider three cases:

- **A/B test.** An online store shows half its visitors a new checkout page to see which version sells more. The risk is low, and the test changes the product, not the user.
- **OkCupid (2014).** The dating site told some pairs of users they were a strong match when its algorithm rated them a poor one, to see whether the match score itself changed how they behaved.
- **Facebook emotional contagion (2014).** For one week in January 2012, Facebook changed the News Feeds of 689,003 users, cutting positive or negative posts to see whether users' own posts shifted in mood. Facebook said its data use policy covered research. Critics said clicking "agree" on terms of service is not informed consent. The journal that published the study added an editorial expression of concern.

> **Discuss:** Rank the three cases from least to most troubling. What changes as you move along the line: the risk of harm, whether the test targets the user's wellbeing, whether users would be surprised, or whether they could opt out?


## Data ownership and control

People often say "it's my data." In U.S. law that is rarely true. Facts generally can't be owned (copyright protects creative expression, not facts), and nobody holds title to their own purchase history. In practice, the organization that holds the data **controls** it, through possession, contracts and terms of service. Individuals have rights only where a specific law grants them, such as GDPR in Europe or the state privacy laws described below.

The result is an imbalance. Organizations hold the data and the skills to analyze it. Individuals can't see what is collected or how it is used.

The biggest risk is **secondary use**: data collected for one purpose gets reused for another.

- **Cambridge Analytica (2018).** A personality-quiz app on Facebook gathered data on up to 87 million users, mostly friends of the people who took the quiz. The data was then used for political ad targeting. Facebook later paid a $5 billion FTC penalty.
- **GM OnStar (2024–2026).** GM collected precise location and driving-behavior data through its OnStar Smart Driver feature and sold it to third parties, including consumer reporting agencies used by insurers. The FTC said GM did this without drivers' consent. A final order in January 2026 bans GM from sharing that data with consumer reporting agencies for five years.
- **23andMe (2025).** When the genetic-testing company went bankrupt, the DNA data of about 13 million customers was sold along with its other assets, to a nonprofit led by its co-founder, for $305 million. Customers had shared their DNA to learn about their ancestry and health. Twenty-seven states and D.C. sued to block the sale of genetic data without customer consent.

> **Discuss:** Should a company's customer data be sold in bankruptcy like its furniture? If not, what should happen to it?


## Privacy and re-identification

### "Anonymized" data usually isn't

Removing names and Social Security numbers doesn't make data anonymous. Other fields, called **quasi-identifiers**, can be combined and matched against another dataset to find the person. This is **re-identification** through **data linkage**.

- **The Weld case (1997).** Massachusetts released "anonymized" hospital records for state employees that still included ZIP code, birth date and sex. Graduate student Latanya Sweeney bought the Cambridge voter roll for $20, matched those three fields, and found Governor William Weld's medical records. She later estimated that **87%** of Americans are unique by 5-digit ZIP code, full birth date and sex. A later study using 2000 census data put the figure near 63%, which is still most people.
- **The Netflix Prize (2006–2010).** Netflix released 100 million movie ratings from about 480,000 subscribers, with names replaced by random IDs. Researchers showed that a handful of ratings with approximate dates was enough to pick out a person's record. They matched some records to public IMDb reviews, revealing users' apparent political leanings. A closeted lesbian mother then sued, arguing the data could out her. Netflix settled and canceled a planned second contest.
- **Metadata** is data *about* data: when and where a call was made, rather than what was said. In a study of 1.5 million phone users, four points of location and time were enough to identify 95% of them.

### Collection creates risk; use creates harm

Most harm happens when data is **used**: a denied loan, a higher premium, someone outed. But collecting data creates future risk even when today's use is harmless. Stored data can be breached, subpoenaed, sold in a bankruptcy, or put to a new use nobody planned.

Big datasets are also hard to take back. GDPR's right to erasure (below) helps, but copies, backups and data already shared with others are hard to recall. And privacy expectations vary: some people happily share their location, while others never would.

### Reducing the risk

- **Data minimization.** Collect only what the project needs, and delete it on a schedule. The cheapest data to protect is data you never kept.
- **Generalization and aggregation.** Report birth year instead of birth date, the first three digits of a ZIP code instead of all five, or group totals instead of individual rows. HIPAA's Safe Harbor method uses rules like these. **k-anonymity** is the related test: every record should match at least *k − 1* other records on its quasi-identifiers.
- **Differential privacy.** Add carefully calibrated random noise so published results barely change whether or not any one person is in the data. The U.S. Census Bureau used it for the 2020 Census.
- **Access controls and data-sharing agreements.** Limit who can see raw data, and put the rules in writing before data leaves your organization.


## Bias in models

Poor data or careless modeling leads to poor decisions, and a model repeats the same poor decision at scale. Removing protected columns does not fix this.

### Where bias comes from

- **Sampling bias**: the training data doesn't represent the people the model will be used on. A credit model trained only on wealthy applicants will perform poorly on low-income applicants, because it never learned their patterns.
- **Historical (label) bias**: the target variable records past human decisions, including past discrimination. Amazon trained an experimental recruiting model on 10 years of resumes, mostly from men. It learned to penalize resumes containing the word "women's" (as in "women's chess club captain"). Amazon abandoned the tool; Reuters reported the story in 2018.
- **Measurement bias**: the target is a flawed stand-in for what you care about. A widely used health-care algorithm predicted patients' future medical *costs* as a proxy for their medical *needs*. Because less money had been spent on Black patients with the same illnesses, the model rated them as healthier than they were. Ranking patients by their actual chronic illnesses instead would have raised Black patients' share of those flagged for extra care from 17.7% to 46.5% (Obermeyer et al., 2019).
- **Proxy variables**: dropping a protected column doesn't remove its signal. ZIP code correlates with race because of decades of redlining and segregation. Names, shopping history and even word choice can correlate with sex or national origin.
- **Feedback loops**: the model's decisions shape its next round of training data. If a model sends more police patrols to a neighborhood, more arrests get recorded there, which then seems to confirm the model.
- **Distribution shift**: the model is used on people unlike those it was trained on. You saw this with the BodyM testB set in ml21.

### Measuring disparities

Start by looking at outcomes by group, not just overall accuracy.

The **selection rate** is the share of a group that gets the positive outcome (hired, approved, advanced). The **impact ratio** divides each group's selection rate by the highest group's rate. Under the **four-fifths rule**, federal agencies have generally treated a ratio below 0.80 as *evidence* of adverse impact. It is a rule of thumb that calls for a closer look, not proof of discrimination.

| Group | Applicants | Advanced | Selection rate | Impact ratio |
|---|---|---|---|---|
| Men | 100 | 50 | 0.50 | 1.00 |
| Women | 100 | 30 | 0.30 | 0.60 |

0.60 is below 0.80, so this screening step needs a closer look.

**Error rates by group** matter too. A model can be 90% accurate overall while most of its mistakes land on one group. Compare false positive and false negative rates for each group.

### Fairness definitions can conflict

In 2016, ProPublica analyzed COMPAS, a tool that scores criminal defendants' risk of reoffending. Among defendants who did *not* reoffend, Black defendants had been labeled higher-risk 45% of the time, compared with 23% for white defendants. The vendor responded that the scores were **calibrated**: a given score meant about the same chance of reoffending for both groups.

Both claims were true. Researchers then proved that when two groups have different underlying rates of the outcome, a model generally can't be calibrated and have equal error rates across groups at the same time. You have to choose. That makes **choosing a fairness definition a value judgment, not a technical setting**. The Amsterdam case below shows what happens in practice.

### Transparency and accountability

Opaque models make harm harder to catch: affected people can't contest decisions, and builders can't find errors. Two practices help:

- **Explain individual decisions.** In lending this is required. Under ECOA, a lender must be able to give a denied applicant the specific principal reasons, and using a complex model doesn't excuse that.
- **Audit outcomes by group, and document the model.** Record its intended use, training data and known limits. Formats such as *model cards* and *datasheets for datasets* exist for this.

"My training data didn't have a race column" is not a defense. It also creates a puzzle: you can't measure disparities across groups you never recorded. Lenders, for example, generally can't ask non-mortgage applicants their race, so fair-lending teams often estimate it from surname and address.


## Case study: Amsterdam's Smart Check

Read the MIT Technology Review story in the Links before class.

Starting in 2019, Amsterdam built a model called Smart Check to flag welfare applications for investigation. The city tried to do everything right:

- It used an explainable model (an explainable boosting machine) with 15 features, such as prior applications, assets and number of addresses, trained on 3,400 past investigations.
- It left out gender, nationality and age, and tried to avoid proxies such as postal code.
- It consulted outside experts and hired Deloitte to review the work. A council representing welfare recipients opposed the project.
- It defined fairness as spreading wrongful investigations evenly across groups, and reweighted the training data to get there.

Early tests showed the model wrongly flagged non-Dutch applicants and men far more often. (The human caseworkers it would replace showed the opposite pattern.) Reweighting closed the nationality gap in testing.

In a live pilot of about 1,600 applications in 2023, though, the model flagged *more* people than before and performed no better than the caseworkers. The bias came back in a new direction: now against Dutch nationals and women. Journalists also found it wrongly flagged applicants with children more often, a group the city hadn't checked. The city ended the pilot in November 2023 after spending about €500,000, and went back to caseworkers whose decisions its own analysis had found biased.

> **Discuss** using the checklist:
>
> 1. Who was affected, and who had a voice in the design?
> 2. What did a false positive cost an applicant? Who bore those costs?
> 3. The model left out nationality, gender and age. Why did bias still appear?
> 4. Fixing one disparity created another. What does that say about choosing a fairness definition?
> 5. Was ending the pilot the right call, given that the caseworkers were biased too? What would you have recommended?
> 6. The project was reviewed and approved. Was it legal? Was it ethical? Can those answers differ?


## Generative AI at work

The ethics question you will face most often in your first job is what you paste into an AI tool.

- **Inputs.** Treat a public chatbot like an outside vendor with no data-sharing agreement. Client financials, student records (FERPA), customer financial data (GLBA) and health information don't go in unless your organization has an agreement with the vendor that covers that data. Some consumer tools may use what you type to train future models unless you opt out. Accountants have their own version of this rule: the AICPA Code bars CPAs from disclosing confidential client information without the client's consent.
- **Outputs.** You are responsible for what you submit, no matter who or what drafted it. AI tools can produce numbers, citations and sources that look right and don't exist. In 2023, two lawyers were fined $5,000 for filing a brief that cited court cases ChatGPT had invented.
- **Disclosure.** Follow your course's or employer's policy on disclosing AI use. Where there is no policy, ask.
- **Training data.** Large models are trained on text and images gathered from the web, mostly without the creators' permission. Whether that is legal is being decided in court. Whether it is fair is a separate question worth asking.


## Legal frameworks

Ethics and law are distinct, but knowing the relevant laws is part of practical ethical work. Laws set a **floor**, not a ceiling. And the floor moves: several of the rules below changed in 2025–2026. Statuses below are current as of November 2026.

### Quick reference

| Law | Covers | Who it binds | What to watch for |
|---|---|---|---|
| **HIPAA** (1996) | Protected health information (PHI) | Health-care providers, insurers, clearinghouses, and their business associates | Fitness trackers and symptom-checker apps usually aren't covered, even when they hold the same data. (The FTC can still act on health-app breaches.) |
| **GLBA** (1999) | Nonpublic personal financial information | Financial institutions, broadly defined: banks and lenders, but also tax preparers and colleges that handle federal student aid | Requires a written information security program and privacy notices |
| **PCI-DSS** | Payment card data | Anyone who stores, processes or transmits card data. It is a contract with the card networks, **not a law** | Keep raw card numbers out of your analytics warehouse; use **tokens** |
| **FCRA** (1970) | Consumer reports: credit reports, background checks | Reporting agencies and anyone who uses their reports | Denying credit, a job or insurance based on a report requires an adverse-action notice |
| **ECOA** (1974) | Credit decisions | Lenders | Bans discrimination on protected traits; denied applicants get specific reasons |
| **Title VII** (1964), **ADEA** (1967) | Employment decisions | Employers | Title VII: race, color, religion, sex, national origin. ADEA: age 40 and over |
| **Title IX** (1972) | Education programs receiving federal funds | Schools and colleges | Covers models used in admissions, advising, scholarships and grading |
| **FERPA** (1974) | Student education records | Schools receiving federal funds | Analyzing your own course data is generally fine. Sending it to an outside vendor without an agreement usually is not |
| **COPPA** (1998) | Personal information from children under 13 | Sites and apps aimed at children, or that know they have child users | Requires parental consent |
| **BIPA** (2008, Illinois) | Biometrics: face geometry, fingerprints, voiceprints | Private companies | Written consent before collection, and people can sue directly (Facebook settled for $650 million) |
| **GDPR** (2018, EU) | Personal data | Organizations in the EU, or that serve or monitor people in the EU | The broadest privacy law most data scientists touch (details below) |
| **State privacy laws** | Personal data | Varies by state | 24 states had them as of October 2026; there is still no comprehensive federal law |
| **EU AI Act** (2024) | AI systems, by risk level | Providers and users of AI in the EU | Credit scoring, hiring, education and public-benefit models are "high-risk" |
| **NYC Local Law 144** (2023) | Automated hiring tools | Employers hiring for New York City jobs | Requires an annual independent bias audit using impact ratios, published online |

### Discrimination law: disparate treatment and disparate impact

- **Disparate treatment** means treating someone differently *because of* a protected trait. That includes deliberately using a proxy, such as ZIP code, to stand in for race. It is illegal under ECOA, Title VII, the ADEA and the Fair Housing Act.
- **Disparate impact** means a neutral-looking practice whose burden falls disproportionately on a protected group without adequate justification, even with no intent to discriminate.

ECOA's protected traits are race, color, religion, national origin, sex, marital status, age, receipt of public assistance income, and good-faith exercise of rights under federal consumer credit law.

The legal status of disparate impact is in flux:

- **Employment.** Title VII has included disparate impact in the statute itself since 1991. In June 2026, the Justice Department's Office of Legal Counsel concluded that the EEOC's disparate-impact guidelines are unconstitutional, and federal enforcement has pulled back. Private lawsuits under Title VII are still possible.
- **Lending.** The CFPB amended Regulation B, effective July 21, 2026, to state that ECOA does not recognize disparate impact. Fair-lending groups are challenging the change in two federal lawsuits.
- **Housing and states.** The Supreme Court recognized disparate impact under the Fair Housing Act in 2015, and many state laws still recognize it.

What this means for you: whatever the enforcement climate, the ethical question stays the same. If your model's burden falls heavily on one group, you should know it and be able to justify it. Keep measuring outcomes by group.

**Title IX example.** A model that routes men and women onto different advising paths based on predicted major or predicted success raises Title IX concerns, even if each group's accuracy looks fine on its own.

### PII and personal data

**PII (personally identifiable information)** is a category, not a single law. NIST defines it as information that can distinguish or trace a person's identity, either directly (name, SSN, email) or when combined with other data (ZIP code + birth date + sex, as in the Weld case).

Different laws define it differently. GDPR's **personal data** is broader and explicitly includes IP addresses, cookie IDs and device IDs. Treat PII as anything that can be linked back to a person in your context, not a fixed checklist.

### GDPR in more detail

- **Principles**: lawfulness, fairness and transparency; purpose limitation; data minimization; accuracy; storage limitation; integrity and confidentiality; accountability.
- **Individual rights**: access, correction, erasure (the "right to be forgotten"), portability, objection, and the right not to be subject to decisions made solely by automated processing that have legal or similarly significant effects.
- **Scope**: organizations based in the EU, plus organizations anywhere that offer goods or services to people *in* the EU or monitor their behavior there. What matters is where the person is, not their citizenship.
- **Penalties**: up to €20 million or 4% of worldwide annual revenue, whichever is higher.

### EU AI Act

The AI Act sorts AI systems by risk. A few uses are banned outright, such as social scoring (since February 2025). **High-risk** systems, including credit scoring, hiring, education and deciding who receives public benefits, must meet requirements for risk management, data quality, documentation, human oversight and accuracy. After a 2026 amendment, most of those high-risk rules apply from **December 2, 2027**. Amsterdam's Smart Check would fall into this category.

### Working note

These rules overlap and sometimes pull against each other. One real tension: to audit a model for bias, you need to know which group each person belongs to, but privacy law pushes you to collect as little as possible, and some rules (such as Regulation B for most loans) generally bar you from asking. The operative question when you build a model is: **which laws apply to this data, this decision and these people?** Compliance teams exist because the answer is rarely obvious, and "my training data didn't have a race column" is not a defense.

## Key Terms

- **Ethics**: Reasoning about what you *should* do, beyond what is legal or customary.
- **Belmont Report**: The 1979 report that set three principles for research on people: respect for persons, beneficence and justice.
- **Respect for persons**: The Belmont principle that people decide for themselves whether to take part; the source of informed consent.
- **Beneficence**: The Belmont principle of maximizing benefits and minimizing harm.
- **Justice (Belmont)**: The Belmont principle that research burdens and benefits should be distributed fairly.
- **Informed consent**: Agreement given voluntarily by someone who understands the nature and purpose of the data use or experiment and can withdraw.
- **Institutional Review Board (IRB)**: A committee that reviews research on people for consent and risk before it begins.
- **A/B test**: An experiment that shows two versions of a product to different users to see which performs better.
- **Secondary use**: Using data for a purpose other than the one it was collected for.
- **Quasi-identifier**: A field that isn't identifying on its own but can identify a person when combined with others, such as ZIP code, birth date and sex.
- **Re-identification**: Matching "anonymized" records back to the real people they describe.
- **Data linkage**: Joining two datasets on shared fields; the usual method of re-identification.
- **Metadata**: Data about data, such as when and where a call was made rather than what was said.
- **Data minimization**: Collecting and keeping only the data a project needs.
- **k-anonymity**: A property where every record matches at least *k − 1* other records on its quasi-identifiers.
- **Differential privacy**: Adding calibrated random noise so published results barely change whether or not any one person is in the data.
- **Sampling bias**: Bias from training data that doesn't represent the people the model will be used on.
- **Historical (label) bias**: Bias from a target variable that records past human decisions, including past discrimination.
- **Measurement bias**: Bias from a target or feature that is a flawed stand-in for what you care about, such as using health costs to measure health needs.
- **Proxy variable**: A feature that carries the signal of a protected trait, such as ZIP code standing in for race.
- **Feedback loop**: When a model's decisions shape the data it is later trained on.
- **Distribution shift**: When a model is used on a population that differs from its training data.
- **Selection rate**: The share of a group that receives the positive outcome.
- **Impact ratio**: A group's selection rate divided by the highest group's selection rate.
- **Four-fifths rule**: A rule of thumb that treats an impact ratio below 0.80 as evidence of adverse impact.
- **Calibration**: A property where a given model score means the same probability of the outcome for every group.
- **Disparate treatment**: Treating someone differently because of a protected trait, including deliberately using a proxy.
- **Disparate impact**: A neutral-looking practice whose burden falls disproportionately on a protected group without adequate justification, regardless of intent.
- **Adverse action notice**: A required notice explaining why credit, a job or insurance was denied based on a credit decision or consumer report.
- **PII**: Personally identifiable information; information that can distinguish or trace a person's identity, alone or combined with other data.
- **Personal data (GDPR)**: GDPR's broader term for any information relating to an identifiable person, including IP addresses and device IDs.
- **Protected health information (PHI)**: Health information held by a HIPAA-covered entity or its business associate.
- **Tokenization**: Replacing a sensitive value, such as a card number, with a substitute token that is useless if stolen.
- **High-risk AI system**: Under the EU AI Act, an AI system used in areas such as credit, hiring, education or public benefits, which must meet extra requirements.


## Practice Questions

1. Which statement best describes the relationship between law and ethics in data work?
    - Legal compliance is the minimum; an action can be legal and still unethical.
    - If an action is legal, it is ethical.
    - Ethics applies to academic research, while law applies to companies.
    - Ethics and law always agree once a law has been in place long enough.

2. Which Belmont Report principle concerns how the burdens and benefits of research are distributed?
    - Justice
    - Beneficence
    - Respect for persons
    - Transparency

3. Which of these is NOT one of the elements of informed consent?
    - The person is paid for taking part.
    - The person understands the nature and purpose of the data use.
    - The person agrees voluntarily.
    - The person can withdraw.

4. An A/B test of a new checkout page is usually considered acceptable without explicit consent, while Facebook's emotional contagion study was widely criticized. What best explains the difference?
    - The A/B test carries little risk and changes the product, while Facebook's study deliberately tried to change users' emotions.
    - A/B tests are always approved by an IRB.
    - Checkout pages don't involve any user data.
    - Users consent to A/B tests by making a purchase.

5. Which statement best describes who controls personal data held by a U.S. company?
    - The company controls it through possession, contracts and terms of service; individuals have rights only where a specific law grants them.
    - The individual legally owns all data about them.
    - The federal government owns all personal data collected by companies.
    - Data becomes public domain once it is collected.

6. A hospital releases patient records with names and Social Security numbers removed, but keeps 5-digit ZIP code, full birth date and sex. Why is this risky?
    - That combination is unique for most Americans, so records can be linked to public lists such as voter rolls.
    - ZIP codes are protected under ECOA.
    - The records can be re-identified only if the hospital also releases the Social Security numbers.
    - Once names are removed, the only risk comes from hackers.

7. Which technique adds calibrated random noise so published results barely change whether or not any one person is in the data?
    - Differential privacy
    - k-anonymity
    - Tokenization
    - Data minimization

8. Amazon's experimental recruiting model learned to penalize resumes containing the word "women's." Which type of bias best explains this?
    - Historical (label) bias: it learned from past hiring decisions that favored men.
    - Measurement bias: the resumes were scanned incorrectly.
    - A feedback loop: the model retrained itself on its own decisions.
    - Distribution shift: it was tested on a different country's resumes.

9. A health-care algorithm predicted future medical costs as a stand-in for medical needs. Because less had been spent on Black patients with the same illnesses, it underestimated their needs. Which type of bias is this?
    - Measurement bias: the target was a flawed proxy for what mattered.
    - Sampling bias: too few Black patients were in the data.
    - A feedback loop
    - Disparate treatment: the model used race as an input.

10. A loan model has no race column, but it uses ZIP code, which strongly correlates with race in the area it serves. What role is ZIP code playing?
    - A proxy variable
    - A protected class
    - A calibration variable
    - A tokenized identifier

11. A screening model advances 60 of 120 male applicants and 36 of 120 female applicants. What is the impact ratio for women, and does it fall below the four-fifths threshold?
    - 0.60; yes, it is below 0.80.
    - 0.80; it is exactly at the threshold.
    - 0.30; yes, it is below 0.80.
    - 1.67; no, it is above 0.80.

12. In the COMPAS debate, ProPublica showed unequal false positive rates across groups, while the vendor showed the scores were equally calibrated. What is the main lesson?
    - When groups have different base rates, a model generally can't satisfy both definitions at once, so choosing a fairness definition is a value judgment.
    - One of the two analyses must have contained a math error.
    - Removing race from the inputs would have satisfied both definitions.
    - Calibration and equal error rates are two names for the same thing.

13. Amsterdam's Smart Check excluded gender, nationality and age from its inputs. What happened in the live pilot?
    - The model wrongly flagged Dutch nationals and women more often, and the city ended the pilot.
    - The bias disappeared, and the city expanded the system citywide.
    - The model flagged fewer applicants and outperformed caseworkers.
    - The EU AI Act blocked the model before the pilot began.

14. A fitness-tracker app collects users' heart rate and sleep data. Which statement is most accurate?
    - HIPAA usually doesn't apply, because the app maker is not a covered entity.
    - HIPAA applies to all health-related data, regardless of who holds it.
    - PCI-DSS governs this data.
    - FERPA applies because the data describes individuals.

15. Which statement about PCI-DSS is correct?
    - It is a contractual standard set by the card networks, not a law.
    - It is a federal law enforced by the FTC.
    - It applies only to banks.
    - It requires raw card numbers to be kept in analytics warehouses for auditing.

16. A U.S. online retailer with no EU offices sells and ships products to customers in France. Does GDPR apply?
    - Yes, because it offers goods to people in the EU.
    - No, because the company has no EU offices.
    - Only if the customers are French citizens.
    - Only if the fine would exceed €20 million.

17. A lender uses a complex machine-learning model and denies an applicant. Under ECOA, what must the lender do?
    - Give the applicant the specific principal reasons for the denial.
    - Nothing, as long as the model doesn't use race.
    - Publish the model's source code.
    - Let the applicant retrain the model.

18. A hiring practice leads to far lower selection rates for one protected group, even though the employer never intended that result. What is this kind of claim called?
    - Disparate impact
    - Disparate treatment
    - Calibration error
    - Secondary use

19. Under FERPA, which use of course data is most likely a problem?
    - Sending an LMS export with student names to an outside analytics vendor without a data-sharing agreement.
    - An instructor analyzing quiz scores for their own course.
    - A school official with a legitimate educational interest reviewing a student's record.
    - Sharing a class's average exam score with the class.

20. An intern pastes a spreadsheet of client tax returns into a free public chatbot to get a summary. What is the main problem?
    - Confidential client data has been shared with an outside vendor without an agreement covering how it is used or stored.
    - Chatbots can't read spreadsheets.
    - The chatbot vendor would own the copyright on the summary.
    - There is no problem as long as the intern deletes the chat afterward.


## Mini-Project: Audit your own model

Use your ml21 BodyM notebook. You'll audit the models you already built, then write a short memo. Work one step at a time, as in ml21.

**Step 1: Error by group**

- **Predict first:** Will your measurement model's error be higher for women or for men? About 60% of the training subjects are men.
- **Ask the AI for:** code that computes MAE separately for women and men (`is_female`) for your best measurement model, on the validation set and on testA.
- **What you should see:** a small table with one MAE per group per data set.
- **Check your understanding:** Is the gap larger than you predicted? Does the training mix explain it?

**Step 2: Distribution shift**

- **Ask the AI for:** the same table for testB.
- **Check your understanding:** If a clothing retailer launched this model to customers who look more like testB than the training data, who would get worse-fitting clothes?

**Step 3: Classifier error rates**

- **Ask the AI for:** your gender classifier's overall accuracy, plus its error rate for true women and for true men separately.
- **Check your understanding:** Is the classifier equally accurate for both groups? Should a body-measurement app predict gender at all? What could go wrong, and for whom?

**Step 4: Impact ratios**

- **Ask the AI for:** a function `impact_ratios(df, group_col, selected_col)` that returns each group's selection rate and its ratio to the highest group's rate.
- **What you should see:** on the hiring table from this chapter (100 men, 50 advanced; 100 women, 30 advanced), an impact ratio of 0.60 for women.
- Then define a "good fit" as a waist prediction within 2 cm of the true value. Use your function to compute the share of women and men who get a good fit on testA, and the impact ratio.

**Step 5: Data provenance and memo**

Find the BodyM dataset's documentation and license. Who collected the data? Did participants consent, and to what? What uses does the license allow?

Then write a half-page memo to a retailer that wants to put your model in its shopping app. Answer the six checklist questions, using your numbers from Steps 1–4.

**Turn in:** your notebook and the memo.
