<script src="/course_model/toc.js"></script>

# Ethics

**Outcomes**:

- Define ethics in the context of data science and distinguish it from legal compliance
- Explain informed consent
- Explain issues around ownership of data
- Describe why anonymity is difficult to achieve
- Evaluate how bias enters models
- Explain how re-identification occurs through data linkage and metadata
- Assess real-world cases for ethical violations

**Links**:
- [Model fairness](https://www.lighthousereports.com/methodology/amsterdam-fairness/)


## Why are ethics important in AI and data science?

Ethics defined as societal standards of right/wrong, distinct from law. Focus is **practical ethical decision-making**, not abstract philosophy.

We have a core tension: the technical capability to extract insight from data is advancing faster than the ethical frameworks needed to govern its use. This creates a gap between what we can do and what we should do. For example, we have the ability to collect and analyze vast amounts of personal data, but we lack clear ethical guidelines on how to use that data responsibly. This is why it is important for data scientists to be aware of ethical considerations and to actively engage in discussions about the ethical implications of their work.

## Informed Consent 

Users often unknowingly participate in experiments. This violates autonomy and transparency.

Individuals must:

* Be informed about the nature and purpose of data collection and use
* Consent voluntarily
* Be able to withdraw 

This raises issues in large-scale digital experiments where users are unaware of the experiment.

However, users are constantly being experimented on, and it is not feasible to obtain informed consent for every data collection and use. This creates a tension between the need for data to improve services and the ethical obligation to respect user autonomy. For example, Facebook's emotional contagion experiment manipulated users' news feeds to study emotional effects without explicit consent, which was widely criticized for violating ethical standards of experimentation. This can be easily seen as wrong. But, what about using an a/b test to compare two different versions of a website? This is also an experiment, but it is generally considered acceptable because it is less invasive and has a lower risk of harm. The key is to consider the potential harm and the level of user awareness and control.

## Data Ownership and Control

Individuals typically **do not own their data**; organizations do. This raises tension between legal ownership and moral control over personal data 

Individuals underestimate how easily they can be identified. "Anonymized" data is often reversible. Data linkage and metadata can re-identify individuals. For example, the Netflix Prize dataset was supposed to be anonymous, but researchers were able to link it with IMDb data to identify individual users and infer sensitive attributes like sexual orientation.

Organizations hold disproportionate data and analytical capability. Individuals lack visibility and control.

Data collected for one purpose can be reused for another purpose, often without consent.


## Privacy and Surveillance

True anonymity is largely illusory. Data linkage enables identification even without explicit identifiers. Ethical harm often arises at **use**, not collection. Collecting data creates future risk.

* Central tension:
  * extracting value from data
  * vs. protecting individuals from harm

* Key ideas:
  * Privacy expectations vary across individuals
  * Big data creates **persistent, irreversible records** (no option to exit) 


## Bias and Transparency

Poor data or models can lead to poor decisions. Opaque models amplify harm, especially at the individual level

Models must be transparent, accountable, and auditable. If you are sued, can you prove that your model isn't using legally-protected categories to make decisions? As an example,  zip code can be used as a proxy for race, which is illegal.

How are models trained? Using biased sampling can result in a biased model. For example, if you train a model to predict creditworthiness using only data from wealthy individuals, it will not perform well on low-income individuals. This is because the model has not learned the patterns that are relevant for low-income individuals. Or, if you train a model to predict who will be a good employee, but you only train it on data from existing employees, it may learn to discriminate against certain groups of people who are underrepresented in the existing employee population.



## Legal Frameworks

Ethics and law are distinct, but knowing the relevant laws is part of practical ethical work. Laws set a **floor**, not a ceiling: legal compliance is the minimum, not the goal. A few rules data scientists encounter regularly:

### HIPAA — Health data

The Health Insurance Portability and Accountability Act (1996) governs **protected health information (PHI)** held by "covered entities" (providers, insurers, clearinghouses) and their business associates.

* Privacy Rule: limits use and disclosure
* Security Rule: requires administrative, physical, and technical safeguards
* Breach Notification Rule: mandatory disclosure of breaches
* De-identification: either the **Safe Harbor** method (strip 18 specific identifiers) or **Expert Determination**

Important limit: HIPAA only covers covered entities. A fitness tracker or symptom-checker app collecting the same information is usually *not* bound by HIPAA. This is a common ethics-vs.-law gap.

### PCI-DSS — Payment card data

The Payment Card Industry Data Security Standard is **not a law**. It is a contractual requirement imposed by the card networks (Visa, Mastercard, Amex, Discover) on anyone who stores, processes, or transmits cardholder data. Violations lead to fines and loss of processing privileges, not prosecution.

For data scientists, the working rule is: don't put raw card numbers in your analytics warehouse. Use **tokens**. Analytics on tokenized or aggregated data is out of scope for most PCI-DSS controls.

### GLBA — Financial data

The Gramm-Leach-Bliley Act (1999) covers financial institutions. Requires a written information security program, annual privacy notices, and safeguards for "nonpublic personal information." Relevant to any project touching banking, lending, or insurance data.

### ECOA and fair lending

The Equal Credit Opportunity Act prohibits credit decisions based on race, color, religion, national origin, sex, marital status, age, or receipt of public assistance.

A model that uses **ZIP code, name, or browsing history as a proxy** for a protected class can still violate ECOA. "Disparate impact" does not require intent. Fair-lending audits therefore look at **outcomes across groups**, not just the features in the model.

### Title VII — Employment discrimination

The Civil Rights Act (1964) prohibits employment discrimination based on race, color, religion, sex, or national origin. Most algorithmic bias cases in hiring (Amazon's scrapped recruiting tool; HireVue) sit here.

The EEOC's **four-fifths rule** is the common screen: if the selection rate for a protected group is less than 80% of the top group's rate, disparate impact is presumed and the employer must justify the selection process.

### Title IX — Sex discrimination in education

Title IX of the Education Amendments (1972) prohibits sex-based discrimination in any education program receiving federal funding. Relevant for predictive models used in admissions, advising, scholarships, grading, or student-support targeting. A model that routes men and women onto different advising paths based on predicted major or predicted success would raise Title IX concerns even if each group's accuracy looked fine in isolation.

### FERPA — Student records

The Family Educational Rights and Privacy Act (1974) protects student education records. You cannot disclose personally identifiable information from a record without written consent, with limited exceptions (directory information, school officials with a legitimate educational interest, some research uses under a written agreement).

Practical rule: analyzing an LMS extract for your own course is generally fine; handing that extract to an outside vendor without a data-sharing agreement usually is not.

### PII — Personally Identifiable Information

**Not a single law — a category.** NIST defines PII as information that can be used to distinguish or trace an individual's identity, either directly (name, SSN, email) or in combination with other data (DOB + ZIP + sex is enough to identify most U.S. residents — the Sweeney result).

Different laws define PII differently. GDPR uses the broader term **personal data**, which explicitly includes IP addresses, cookie identifiers, and device IDs. Treat PII as whatever can be linked back to a person in the context you are working in, not a fixed checklist.

### GDPR — EU personal data

The General Data Protection Regulation (enforceable May 2018) is the most expansive privacy law most data scientists touch.

* **Core principles**: lawful basis for processing, purpose limitation, data minimization, accuracy, storage limitation, integrity/confidentiality, accountability
* **Individual rights**: access, rectification, erasure ("right to be forgotten"), portability, objection, and the right not to be subject to solely automated decisions with legal or similarly significant effect
* **Scope**: applies to anyone processing EU residents' personal data, regardless of where the organization is located
* **Penalties**: up to €20 million or 4% of global annual revenue, whichever is greater

U.S. analogues are emerging state-by-state (CCPA/CPRA in California, VCDPA in Virginia, etc.) but there is no federal equivalent.

### Working note

These rules overlap and sometimes conflict. HIPAA allows research uses GDPR may not. ECOA bans features Title VII might allow. The operative question when you build a model is: **which laws apply to this data, this decision, and these people?** Compliance teams exist because the answer is rarely obvious, and "my training data didn't have a race column" is not a defense.
