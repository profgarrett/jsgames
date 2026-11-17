
# Ethics

### ml30 — Consent, Privacy, Bias, and the Law

Nathan Garrett, PhD CPA

*Department of Accounting and Information Systems, WVU*

Note: Arrow keys or space to advance. Down arrow reveals answers on question slides.

---

## What This Module Covers

1. **Ethics vs. law** — and a six-question checklist
2. **Consent and control** — who agreed, who holds the data
3. **Privacy** — why "anonymized" data usually isn't
4. **Bias** — how it enters a model and how to measure it
5. **Case study** — Amsterdam's Smart Check
6. **Generative AI and the law** — what applies to your project

---

## The Central Idea

**Legal is the floor, not the ceiling.**

- **Law**: what you *must* do. Break it and you can be fined or sued.
- **Custom**: what people in your field *usually* do.
- **Ethics**: what you *should* do, after weighing who benefits, who is
  harmed, and whether that is fair.

Slavery was once both legal and customary.

---

# Part 1

## A Checklist for Ethical Decisions

---

## Six Questions

1. **Who is affected?** Including people *missing* from the data.
2. **What happens when the model is wrong, and who pays?**
3. **Would the people in the data expect this use?**
4. **Is there a less invasive way?**
5. **Can you explain and audit it?**
6. **Which laws apply?**

---

## Where the Checklist Comes From

The **Belmont Report** (1979), written after the Tuskegee syphilis study:
researchers withheld treatment from Black men for 40 years (1932–1972).

| Principle | Meaning |
| --- | --- |
| **Respect for persons** | People decide for themselves. Informed consent comes from here. |
| **Beneficence** | Maximize benefits, minimize harm. |
| **Justice** | Those who bear the risk should share the benefit. |

---

## Ethics or Law?

For each, decide: is this a question of **law**, **custom**, or **ethics**?

**A.** "Everyone in our industry buys location data from brokers."

*Custom. Common practice doesn't make it right — or legal.*
<!-- .element: class="fragment" -->

**B.** "Our lawyers say the terms of service cover it."

*Law. That clears the floor. It doesn't answer whether users would be
surprised.*
<!-- .element: class="fragment" -->

**C.** "Would our customers be upset if they found out?"

*Ethics. This is checklist question 3.*
<!-- .element: class="fragment" -->

---

# Part 2

## Consent and Control

---

## Informed Consent

People must:

- **understand** the nature and purpose of the data collection,
- **agree voluntarily**, and
- be able to **withdraw**.

Universities route research on people through an **IRB** (Common Rule).

Companies experimenting on their own users usually **aren't covered** —
the decision falls to the people building the product.

---

## Three Experiments on Users

- **A/B test.** A store shows half its visitors a new checkout page.
- **OkCupid (2014).** Told some pairs they were a strong match when the
  algorithm rated them poor — to see if the score itself changed behavior.
- **Facebook (2014).** Changed the News Feeds of **689,003** users,
  cutting positive or negative posts to see if their own posts shifted in
  mood.

**Rank the three from least to most troubling.** What changes?

- The risk of harm?
- Whether the test targets the user's wellbeing?
- Whether users would be surprised?
- Whether they could opt out?

---

## "It's My Data"

In U.S. law, that is rarely true.

- Facts generally can't be owned. Copyright protects expression, not facts.
- The organization that holds the data **controls** it — through
  possession, contracts and terms of service.
- Individuals have rights only where a **specific law** grants them
  (GDPR, state privacy laws).

---

## Secondary Use

Data collected for one purpose gets reused for another.

| Case | Collected for | Used for |
| --- | --- | --- |
| **Cambridge Analytica** (2018) | A personality quiz | Political ad targeting — 87M users, $5B FTC penalty |
| **GM OnStar** (2024–26) | Driving features | Sold to agencies used by insurers; 5-year ban |
| **23andMe** (2025) | Ancestry and health | Sold in bankruptcy — 13M customers, $305M |

**Should a company's customer data be sold in bankruptcy like its
furniture?** If not, what should happen to it?

---

# Part 3

## Privacy and Re-identification

---

## "Anonymized" Data Usually Isn't

Removing names and SSNs isn't enough.

**Quasi-identifiers** — fields that aren't identifying alone — can be
combined and matched against another dataset.

This is **re-identification** through **data linkage**.

---

## The Weld Case (1997)

- Massachusetts released "anonymized" state-employee hospital records.
- They kept ZIP code, birth date and sex.
- Grad student **Latanya Sweeney** bought the Cambridge voter roll for $20.
- Matched three fields. Found **Governor William Weld's** medical records.

Her estimate: **87%** of Americans are unique by ZIP + birth date + sex.
(A later study: ~63%. Still most people.)

---

## Netflix Prize and Metadata

**Netflix (2006–2010).** 100 million ratings, names replaced with random IDs.

- A handful of ratings with approximate dates picked out a person.
- Matched to public IMDb reviews → revealed apparent political leanings.
- A closeted lesbian mother sued. Netflix settled and canceled contest #2.

**Metadata** — when and where, not what. In 1.5 million phone users,
**four** location/time points identified **95%** of them.

---

## Collection Creates Risk; Use Creates Harm

Harm happens when data is **used**: a denied loan, a higher premium,
someone outed.

But stored data can later be:

- breached,
- subpoenaed,
- sold in a bankruptcy, or
- put to a new use nobody planned.

And big datasets are hard to take back.

---

## Reducing the Risk

| Technique | Example |
| --- | --- |
| **Data minimization** | Collect only what's needed; delete on a schedule |
| **Generalization / aggregation** | Birth year, 3-digit ZIP, group totals (HIPAA Safe Harbor) |
| **Differential privacy** | Calibrated noise; used for the 2020 Census |
| **Access controls / agreements** | Limit raw access; put rules in writing first |

---

## Questions 1-3

```text
Q1. A hospital removes names and SSNs but keeps 5-digit ZIP,
    full birth date and sex. Is the data anonymous?
```

*Answer: No. That combination is unique for most Americans, so records
can be linked to public lists such as voter rolls. Generalize: birth
year, 3-digit ZIP.*
<!-- .element: class="fragment" -->

```text
Q2. Which technique adds calibrated random noise so results barely
    change whether or not any one person is in the data?
```

*Answer: Differential privacy. Not tokenization (replaces a value) or
minimization (collects less).*
<!-- .element: class="fragment" -->

```text
Q3. Who controls customer data held by a U.S. company?
```

*Answer: The company — through possession, contracts and terms of
service. Individuals have rights only where a specific law grants them.*
<!-- .element: class="fragment" -->

---

# Part 4

## Bias in Models

---

## A Model Repeats Its Mistakes at Scale

Poor data or careless modeling → poor decisions

**Removing protected columns does not fix this.**

---

## Where Bias Comes From — Data

- **Sampling bias**: training data doesn't represent the people the model
  is used on. A credit model trained on wealthy applicants fails on
  low-income ones.
- **Historical (label) bias**: the target records past discrimination.
  Amazon's recruiting model penalized "women's" (as in "women's chess club
  captain").
- **Measurement bias**: the target is a flawed stand-in. A health model
  predicted *costs* as a proxy for *needs*. Less had been spent on Black
  patients, so it rated them healthier than they were.

---

## Where Bias Comes From — Design

- **Proxy variables**: ZIP code correlates with race (redlining). Names,
  shopping history and word choice can correlate with sex or national
  origin.
- **Feedback loops**: more patrols → more recorded arrests → model seems
  confirmed.
- **Distribution shift**: used on people unlike the training data. 

Think about the implications of this in the context of the BodyM testB in ml21.

---

## Measuring Disparities

Look at outcomes **by group**, not just overall accuracy.

- **Selection rate** = share of a group that gets the positive outcome
- **Impact ratio** = group's rate ÷ highest group's rate

| Group | Applicants | Advanced | Selection rate | Impact ratio |
| --- | -: | -: | -: | -: |
| Men | 100 | 50 | 0.50 | 1.00 |
| Women | 100 | 30 | 0.30 | **0.60** |

**Four-fifths rule:** below 0.80 is *evidence* of adverse impact — a
reason to look closer, not proof.

---

## Error Rates by Group

A model can be **90% accurate overall** while most of its mistakes land on
one group.

For each group, compare:

- **False positive rate** — flagged, but shouldn't have been
- **False negative rate** — missed, but shouldn't have been

Then ask checklist question 2: *who pays for each kind of error?*

---

## Fairness Definitions Can Conflict

**COMPAS** (ProPublica, 2016) scores defendants' risk of reoffending.

| Claim | Who | True? |
| --- | --- | --- |
| Among those who did *not* reoffend, Black defendants were labeled high-risk 45% vs. 23% for white | ProPublica | Yes |
| A given score means the same chance of reoffending for both groups (**calibrated**) | Vendor | Yes |

When base rates differ, a model generally **can't** be calibrated *and*
have equal error rates. You must choose.

**Choosing a fairness definition is a value judgment, not a technical
setting.**

---

## Transparency and Accountability

- Opaque models make harm harder to catch.
- In lending, it's required: under **ECOA** a denied applicant gets the
  specific principal reasons.
- "My training data didn't have a race column" is **not a defense**.

The puzzle: you can't measure disparities across groups you never
recorded. Fair-lending teams often *estimate* race from surname and
address.

---

## Questions 4-6

```text
Q4. A loan model has no race column but uses ZIP code, which strongly
    correlates with race in its area. What role is ZIP playing?
```

*Answer: A proxy variable. Dropping the protected column didn't remove its
signal.*
<!-- .element: class="fragment" -->

```text
Q5. 200 men apply and 80 advance. 200 women apply and 70 advance.
    Compute the impact ratio. Does it pass the four-fifths rule?
```

*Answer: Men 0.40, women 0.35. 0.35 ÷ 0.40 = **0.875**. Above 0.80, so
no flag under the rule of thumb — but still check error rates by group.*
<!-- .element: class="fragment" -->

```text
Q6. ProPublica and the COMPAS vendor reached opposite conclusions.
    Which one made a math error?
```

*Answer: Neither. With different base rates, calibration and equal error
rates can't both hold. The disagreement is about values.*
<!-- .element: class="fragment" -->

---

# Part 5

## Case Study: Amsterdam's Smart Check

---

## The City Tried to Do Everything Right

Starting in 2019, Amsterdam built a model to flag welfare applications for
investigation.

- **Explainable model** (explainable boosting machine), 15 features,
  trained on 3,400 past investigations
- **Left out** gender, nationality and age; tried to avoid proxies like
  postal code
- **Consulted** outside experts; hired Deloitte to review.
  A council of welfare recipients **opposed** it.
- **Defined fairness** as spreading wrongful investigations evenly;
  reweighted training data to get there

---

## What Happened

**Testing:** wrongly flagged non-Dutch applicants and men far more often.
(Human caseworkers showed the opposite pattern.) Reweighting closed the
nationality gap.

**Live pilot (2023, ~1,600 applications):**

- Flagged **more** people, performed no better than caseworkers
- Bias returned in a **new direction**: against Dutch nationals and women
- Wrongly flagged applicants **with children** — a group nobody checked

Ended November 2023, after about **€500,000**. Back to the caseworkers
the city had found biased.

---

## Discuss Using the Checklist

1. Who was affected, and who had a voice in the design?
2. What did a false positive cost an applicant? Who bore it?
3. Nationality, gender and age were left out. Why did bias still appear?
4. Fixing one disparity created another. What does that say about
   choosing a fairness definition?
5. The caseworkers were biased too. Was ending the pilot right?
6. It was reviewed and approved. Was it legal? Ethical? Can they differ?

--

### Some Things to Notice

- **Q3**: proxies, and groups that were never measured (parents).
  Excluding a column ≠ excluding its signal.
- **Q4**: reweighting optimized one definition on one set of groups. The
  error moved somewhere nobody was looking.
- **Q5**: "better than the status quo" is the real comparison — but it
  must be shown, not assumed.
- **Q6**: Yes, they can differ. Approval clears the floor.

---

# Part 6

## Generative AI at Work

---

## What You Paste Into an AI Tool

The ethics question you'll face most in your first job.

- **Inputs.** Treat a public chatbot like an outside vendor with **no
  agreement**. No client financials, student records (FERPA), customer
  financial data (GLBA) or health data unless your org has one.
  The AICPA Code bars disclosing confidential client info.
- **Outputs.** You are responsible for what you submit. In 2023, two
  lawyers were fined $5,000 for citing court cases ChatGPT invented.
- **Disclosure.** Follow the policy. No policy? Ask.
- **Training data.** Gathered mostly without permission. Legal? In court.
  Fair? A separate question.

---

# Part 7

## Legal Frameworks

---

## The Floor Moves

Laws set a **floor**, not a ceiling.

Several of these rules changed in 2025–2026. Status is as of
November 2026.

---

## Quick Reference — Data Type

| Law | Covers | Watch for |
| --- | --- | --- |
| **HIPAA** | Health info held by providers, insurers, their associates | Fitness apps usually *aren't* covered |
| **PCI-DSS** | Payment card data | A contract, **not a law**. Use tokens. |
| **FERPA** | Student records | Outside vendor needs an agreement |
| **COPPA** | Children under 13 | Parental consent |
| **GDPR** | Personal data (EU) | Applies if you serve people in the EU |

---

## Quick Reference — Decisions

| Law | Covers | Watch for |
| --- | --- | --- |
| **FCRA** | Credit reports, background checks | Adverse-action notice |
| **ECOA** | Credit decisions | Specific reasons for denial |
| **Title VII / ADEA** | Employment | Race, color, religion, sex, national origin; age 40+ |
| **Title IX** | Federally funded education | Admissions, advising, scholarships, grading |

---

## Disparate Treatment vs. Impact

- **Disparate treatment**: different treatment *because of* a protected
  trait — including deliberately using a proxy like ZIP code.
- **Disparate impact**: a neutral-looking practice whose burden falls
  disproportionately on a protected group, without adequate
  justification. **No intent required.**

---

## Disparate Impact Is in Flux

| Area | Status (Nov 2026) |
| --- | --- |
| **Employment** | In Title VII since 1991. June 2026 OLC opinion → federal enforcement pulled back. Private suits still possible. |
| **Lending** | CFPB Regulation B (eff. July 21, 2026): ECOA does not recognize it. |
| **Housing / states** | Recognized under the Fair Housing Act (2015) and many state laws. |

Whatever the enforcement climate, the ethical question doesn't change:
**keep measuring outcomes by group.**

---

## PII Is a Category, Not a Law

**NIST:** information that can distinguish or trace a person's identity —

- **directly** (name, SSN, email), or
- **combined** with other data (ZIP + birth date + sex)

GDPR's **personal data** is broader: IP addresses, cookie IDs, device IDs.

Treat PII as *anything that can be linked back to a person in your
context*.

---

## Questions 7-9

```text
Q7. A fitness-tracker app collects heart rate and sleep data.
    Does HIPAA apply?
```

*Answer: Usually not. The app maker isn't a covered entity. Same data,
different holder, different law. (The FTC can still act on breaches.)*
<!-- .element: class="fragment" -->

```text
Q8. A U.S. retailer with no EU offices ships products to France.
    Does GDPR apply?
```

*Answer: Yes. GDPR follows the people served, not the office location.*
<!-- .element: class="fragment" -->

```text
Q9. Is PCI-DSS a federal law?
```

*Answer: No. It's a contractual standard set by the card networks. Break
it and you can lose the ability to take cards.*
<!-- .element: class="fragment" -->

---

## Questions 10-12

```text
Q10. A hiring screen produces far lower selection rates for one
     protected group, with no intent. What kind of claim is this?
```

*Answer: Disparate impact. Disparate treatment requires acting **because
of** the trait.*
<!-- .element: class="fragment" -->

```text
Q11. An instructor analyzes quiz scores for their own course.
     Then emails the LMS export, with names, to an analytics startup.
     Which step is the FERPA problem?
```

*Answer: The second. Analyzing your own course data is generally fine.
Sending identified records to an outside vendor without an agreement
usually is not.*
<!-- .element: class="fragment" -->

```text
Q12. An intern pastes client tax returns into a free chatbot,
     then deletes the chat. Problem solved?
```

*Answer: No. Confidential data already went to an outside vendor with no
agreement on use or storage. Deleting the chat doesn't recall it.*
<!-- .element: class="fragment" -->

---

# Putting It Together

Run the checklist on each scenario.

---

## Scenario 1 — Fitness Rewards

Your employer's wellness program offers a discount on health premiums to
employees who share their fitness-tracker data. HR wants you to build a
model predicting which employees will file large claims.

**Which checklist questions raise flags?**

--

### A — Fitness Rewards

- **Expect this use?** Employees shared steps for a discount, not to be
  scored on future claims. **Secondary use.**
- **Voluntary?** Consent tied to money is weaker consent.
- **Who pays when wrong?** A false positive could follow an employee into
  HR decisions.
- **Proxies?** Activity and sleep correlate with age, disability and
  pregnancy — ADEA and Title VII territory.
- **Laws?** The tracker data may fall outside HIPAA. That makes the ethics
  question *more* important, not less.

---

## Scenario 2 — Releasing a Dataset

Your university wants to publish a dataset of student outcomes for
researchers. Names and IDs are removed. It keeps major, birth date, home
ZIP, gender, and GPA.

**What's the risk, and how would you reduce it?**

--

### A — Releasing a Dataset

- **Quasi-identifiers**: birth date + ZIP + gender + major will make many
  students unique. Small majors make it worse.
- **Linkage**: commencement programs, LinkedIn and club rosters are public.
- **FERPA**: these are education records.

Reduce it:

- Birth **year**, 3-digit ZIP, grouped majors
- Aggregate small groups or suppress them
- Release under a **data-sharing agreement**, not publicly
- Consider **differential privacy** for published statistics

---

## Scenario 3 — Loan Approvals

Your bank's new loan model is 92% accurate. It has no race column. A
manager says it's ready to ship.

**What would you check first?**

--

### A — Loan Approvals

- **Outcomes by group**, not overall accuracy. Selection rates and impact
  ratios.
- **Error rates by group**: who gets wrongly denied?
- **Proxies**: ZIP code, shopping history, surname.
- **Estimate** group membership (surname + address) if you never
  collected it — you can't audit what you can't measure.
- **Explainability**: ECOA requires specific reasons for each denial.

"No race column" is not a defense.

---

## Summary

Before you ship a data project, ask:

- **Who is affected** — including people missing from the data?
- **Who pays** when the model is wrong?
- **Would they be surprised** by this use?
- **Could you do it with less** data, or coarser data?
- **Can you explain and audit** outcomes by group?
- **Which laws apply** — and is that the end of the question?

---

## Common Traps

| Trap | Reality |
| --- | --- |
| "It's legal." | Law is the floor. |
| "They clicked agree." | Terms of service ≠ informed consent. |
| "It's anonymized." | Quasi-identifiers re-identify. |
| "We dropped the race column." | Proxies carry the signal. |
| "It's 90% accurate." | Check errors by group. |
| "We picked a fair metric." | That was a value judgment. Own it. |
