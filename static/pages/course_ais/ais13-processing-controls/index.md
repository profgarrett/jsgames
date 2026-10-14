# Processing Integrity and Availability Controls

This chapter (Chapter 13 in the textbook) covers the last two principles of the Trust Services Framework. Processing integrity means the system processes data accurately, completely, and only with authorization; most of these controls are the edit checks built into every data entry screen. Availability means the system is there when you need it, which comes down to preventing downtime and recovering quickly from disasters. We end with a related topic every accountant needs: controls for spreadsheets.

**Outcomes**
- Define key terms
- Identify input controls, including forms design and data entry edit checks
- Calculate and use batch totals (financial total, hash total, record count)
- Identify processing and output controls, including data transmission controls
- Describe controls that minimize the risk of system downtime
- Compare backup methods, and explain recovery point and recovery time objectives
- Distinguish a disaster recovery plan from a business continuity plan
- Apply design and debugging practices to reduce spreadsheet errors

**Links**
- [Slides](ais13-processing-controls.pptx)

## Processing integrity

Processing integrity controls follow the data processing cycle from Chapter 2:

> Input → Processing → Output

The principle behind them is "garbage in, garbage out." It is far cheaper to stop bad data at the door than to find and fix it after it has spread through the system.

## Input controls

### Forms design

Good source documents and screens reduce errors before data is even entered:

- **Sequentially prenumbered forms** make missing documents easy to spot. If invoices 155 and 157 are in the file, go find 156.
- **Turnaround documents**, like the stub returned with a credit card payment, come back with the account number already printed, so no one has to read a customer's handwriting.
- **Cancel and store source documents** once they're entered (stamp them "Entered" or "Paid") so they can't be entered twice.

For a real example, look at WVU's paper form to enroll in a 500-level course (in the slides). It has clear labels, eligibility checkboxes, and signature and date lines for each approval. But it has no form number, and nothing stops a student from writing an impossible GPA or leaving the student ID blank. An online version could enforce all of that with the checks below.

### Data entry edit checks

These checks run as data is entered, and reject or flag bad values:

| Check | What it tests | Example |
|---|---|---|
| **Field check** | Characters are the right type | Rejects the letter O in a dollar amount |
| **Sign check** | Value has the right sign (positive or negative) | Rejects a negative quantity ordered |
| **Limit check** | Value doesn't exceed a fixed limit | Flags hours worked over 60 in a week |
| **Range check** | Value falls between a lower and upper limit | GPA must be between 0.00 and 4.00 |
| **Size check** | Data fits in the field | A 5-digit zip code field rejects 400 characters |
| **Completeness check** | All required data is entered | A sales order can't be saved without a ship-to address |
| **Validity check** | Value exists in the master file | Customer number 45982 must match an existing customer |
| **Reasonableness test** | Logical relationship between two fields is correct | A 50% raise for an entry-level employee is flagged |
| **Check digit verification** | A **check digit** computed from the other digits still matches | Catches a mistyped or transposed account number |

A **check digit** is an extra digit added to an ID number, calculated from the other digits. When the number is entered, the system recalculates it. If it doesn't match, the number was mistyped. Credit card numbers have one, which is why a website can tell you a card number is invalid before contacting the bank. Check digits are especially good at catching **transposition errors**, where two adjacent digits are swapped (45892 typed as 45982).

Note the difference between a check digit and a validity check. A check digit catches typos without looking anything up. A validity check confirms the number belongs to a real record in the master file.

Online data entry adds two more controls:

- With **prompting**, the system asks for each item and waits for an acceptable answer.
- With **closed-loop verification**, after you enter a value, the system uses it to look up and display related information so you can confirm it. Type a customer number, and the screen shows "KDR Builders, Morgantown, WV." Type an item number, and it shows "Laser printer," not "Toner cartridge."

### Batch processing controls

When transactions are entered in batches, two more controls apply:

- A **sequence check** tests whether the batch is in the right numerical or alphabetical order, and reveals gaps and duplicates.
- **Batch totals** are calculated before the batch is entered, then compared with totals the system calculates after processing. If they don't match, something was lost, duplicated, or mistyped.

There are three types of batch totals. For a batch of three sales orders:

| Order | Customer number | Amount |
|---|---|---|
| 1 | 1001 | $250 |
| 2 | 1005 | $100 |
| 3 | 1012 | $75 |
| **Total** | **3018** | **$425** |

- A **financial total** sums a dollar field ($425).
- A **hash total** sums a nonfinancial numeric field, such as customer numbers (3018). The total means nothing by itself, but if any customer number is changed or mistyped, it won't match.
- A **record count** is the number of records in the batch (3).

If a batch of 73 time sheets goes to payroll and only 72 are processed, the record count catches it before payday instead of after.

## Processing controls

| Control | What it does | Example |
|---|---|---|
| Data matching | Two or more items must match before an action happens | The three-way match of purchase order, receiving report, and invoice (Chapter 15) |
| File labels | Make sure the correct and most current file is used | A **header record** at the start of a file identifies it; a **trailer record** at the end holds batch totals |
| **Cross-footing balance test** | Calculates the same total two ways and compares them | The sum of the row totals must equal the sum of the column totals |
| **Zero-balance test** | Checks that a control account is zero after all entries are posted | The payroll clearing account should be zero after payroll is paid |
| Write-protection mechanisms | Prevent data from being overwritten or erased | Read-only files |
| **Concurrent update controls** | Lock a record while one user updates it | Two salespeople can't both sell the last 55 units of part 723 |

File labels would have prevented one of the textbook's examples: the accounts receivable file was destroyed because it was accidentally used to update accounts payable. A header record check would have stopped the program from running on the wrong file.

## Output controls

- **User review of output.** The people who use a report are best placed to notice that it looks wrong.
- **Reconciliation procedures.** Reconcile system output to control totals, such as the AR subsidiary ledger to the AR control account in the general ledger.
- **External data reconciliation.** Compare to outside sources, such as reconciling the cash account to the bank statement.
- **Data transmission controls.** Make sure data isn't damaged when it is sent over a network:
  - A **checksum** is a hash of the file. The sender calculates it and the receiver recalculates it; if they differ, the data was changed in transit.
  - A **parity bit** is an extra bit added to each character so that the number of 1s is always even (or always odd). The receiver does **parity checking**: it counts the 1s, and if the count is wrong, a bit was flipped in transmission. For example, under even parity, the character 1011001 has four 1s, so its parity bit is 0.
  - Blockchain (Chapter 12) uses hashing to make records tamper-evident.

## Availability

Availability controls have two objectives:

1. Minimize the risk of system downtime
1. Recover quickly and completely, and resume normal operations, when something does go wrong

### Minimizing downtime

| Control | How it helps |
|---|---|
| Preventive maintenance | Cleaning and replacing hardware before it fails |
| **Fault tolerance** | The system keeps working when a component fails, using redundant components such as **redundant arrays of independent drives (RAID)**, which store data on several drives so one can fail without losing data |
| Data center location and design | Raised floors (protect against flooding and allow cabling), fire suppression, air conditioning, and limited physical access |
| **Uninterruptible power supply (UPS)** | Batteries keep systems running through a brownout or long enough to shut down safely |
| Surge protection | Protects equipment from power spikes |
| Training | Well-trained employees are less likely to make mistakes or fall for phishing |
| Patch management and antivirus software | Prevent attacks that could take systems down |

### Recovery: backups

A **backup** is an exact copy of a database, file, or program. How often to back up depends on two objectives:

- The **recovery point objective (RPO)** is how much data the organization is willing to lose or re-enter. Nightly backups mean an RPO of up to one day.
- The **recovery time objective (RTO)** is how long the organization can function without its system.

A bank may need an RPO of zero, which requires **real-time mirroring**: keeping two copies of the database in two separate data centers and updating both as each transaction occurs. A small business might accept losing a day of data.

Three types of backup:

| Type | What it copies | To restore, you need |
|---|---|---|
| **Full backup** | The entire database | The full backup |
| **Incremental backup** | Only what changed since the last backup of any kind | The last full backup plus every incremental since then |
| **Differential backup** | Everything that changed since the last full backup | The last full backup plus the most recent differential |

Suppose a company does a full backup every Sunday and the system crashes Thursday morning. With incremental backups, it restores Sunday's full backup, then Monday's, Tuesday's, and Wednesday's incrementals, in order. With differential backups, it restores Sunday's full backup and Wednesday's differential. Incremental backups are faster to make; differential backups are faster to restore.

**Deduplication** uses hashing to identify and back up only the parts of files that have changed, which saves storage. An **archive** is a copy kept indefinitely as a historical record, usually for legal or regulatory reasons. Backups are for recovery; archives are for the record.

Backups must be stored off-site, or in the cloud, and tested regularly. A backup stored in the same building as the data center burns in the same fire. A backup that has never been restored may not work when you need it.

### Recovery: disaster recovery and business continuity

| Plan | Scope |
|---|---|
| **Disaster recovery plan (DRP)** | How to restore the IT function if the data center is destroyed |
| **Business continuity plan (BCP)** | How to resume *all* business operations, not just IT: where employees will work, how to reach customers, temporary staffing |

A DRP needs somewhere to run the systems:

| Option | What it is | Cost | Recovery speed |
|---|---|---|---|
| **Cold site** | An empty facility, prewired for power, phone, and Internet, but with no computers | Lower | Slow (days or weeks, since equipment must be bought and installed) |
| **Hot site** | A fully equipped facility with the necessary hardware and software, ready to go | Higher | Fast (hours) |

Real-time mirroring to a second data center, or to the cloud, is the fastest option of all. The right choice depends on the RTO: the shorter the time the business can be down, the more it must spend.

## Spreadsheet controls

Many important business decisions run on spreadsheets that have none of the controls above. Ray Panko's research on spreadsheet errors found:

- Most spreadsheets contain errors; in field audits he reviewed, about 88% did.
- People make errors in about 0.5% to 5% of the actions they take, such as entering a formula. A large spreadsheet has thousands of formulas.
- The key problem is overconfidence. Developers believe their spreadsheets are correct.
- One person checking a spreadsheet finds only about half of the errors. Groups of three found about 80%.

### Designing spreadsheets to prevent errors

- **Structure** the workbook into inputs, calculations, and outputs. Work top to bottom and left to right, and keep rows and columns consistent so one formula can be copied across.
- **Use names and tables** for important cells and ranges, instead of cell addresses like `C14`.
- **Version** files (with a date or v1, v2) and **label units** (days, months, thousands).
- **Use visual cues**, such as borders for input cells, colors with a consistent meaning, appropriate number formats, and highlights for errors. Avoid merge and center.

### Debugging a spreadsheet

1. Show formulas, and look for error values (`#REF!`, `#N/A`) and circular references.
1. Trace precedents and dependents to see how cells connect.
1. For each formula, pull hard-coded numbers out into input cells, fix formulas that are inconsistent with their neighbors, and split overly complex formulas into steps.
1. Look for bad values: numbers stored as text, and blanks or text where there should be zeros.

## Key Terms

- **Archive**: A copy of a database, master file, or software kept indefinitely as a historical record, usually to meet legal and regulatory requirements.
- **Backup**: An exact copy of the most current version of a database, file, or software program.
- **Batch totals**: Sums of numeric values for a batch of input records, used to check that all records were processed correctly.
- **Business continuity plan (BCP)**: A plan for resuming all business operations, not just IT, after a major disaster.
- **Check digit**: An extra digit in an ID number, calculated from the other digits.
- **Check digit verification**: Recalculating a check digit to verify that a data entry error has not been made.
- **Checksum**: A data transmission control that compares a hash of a file calculated by the sender and the receiver.
- **Closed-loop verification**: An input control that uses entered data to retrieve and display related information so the person entering it can confirm its accuracy.
- **Cold site**: A disaster recovery facility prewired for power, phone, and Internet access, but without computing equipment.
- **Completeness check (or test)**: An edit check that verifies all required data has been entered.
- **Concurrent update controls**: Controls that lock a record so two users cannot update it at the same time.
- **Cross-footing balance test**: A processing control that compares two different ways of calculating the same total, such as row totals and column totals.
- **Deduplication**: Using hashing to identify and back up only the portions of files that have changed since the last backup.
- **Differential backup**: A backup that copies all changes made since the last full backup.
- **Disaster recovery plan (DRP)**: A plan to restore an organization's IT function if its data center is destroyed.
- **Fault tolerance**: The ability of a system to keep working when a hardware component fails.
- **Field check**: An edit check that tests whether the characters in a field are the correct type.
- **Financial total**: A batch total that sums a field containing dollar amounts.
- **Full backup**: An exact copy of an entire database.
- **Hash total**: A batch total that sums a nonfinancial numeric field, such as customer numbers.
- **Header record**: A label at the beginning of a file that contains the file name, expiration date, and other identifying information.
- **Hot site**: A fully equipped disaster recovery facility with the hardware and software needed to resume operations.
- **Incremental backup**: A backup that copies only the data that changed since the last backup.
- **Limit check**: An edit check that tests a numerical amount against a fixed value.
- **Parity bit**: An extra bit added to each character so the number of 1s is always even (or always odd).
- **Parity checking**: Recounting the 1s in each received character to verify that the data was transmitted correctly.
- **Prompting**: An online data entry control in which the system asks for each item and waits for an acceptable response.
- **Range check**: An edit check that tests whether a numerical amount falls between a lower and upper limit.
- **Real-time mirroring**: Keeping two copies of a database at two separate data centers and updating both as each transaction occurs.
- **Reasonableness test**: An edit check of the logical relationship between two data items.
- **Record count**: A batch total of the number of records in a batch.
- **Recovery point objective (RPO)**: The amount of data an organization is willing to lose or re-enter.
- **Recovery time objective (RTO)**: The length of time an organization is willing to function without its information system.
- **Redundant arrays of independent drives (RAID)**: A fault tolerance technique that stores data on multiple drives so one drive can fail without data loss.
- **Sequence check**: An edit check that tests whether a batch of data is in the proper numerical or alphabetical order.
- **Sign check**: An edit check that verifies data in a field has the appropriate sign (positive or negative).
- **Size check**: An edit check that ensures input data will fit in its field.
- **Trailer record**: A label at the end of a file that contains the batch totals calculated during input.
- **Transposition error**: An error that results when two adjacent digits are accidentally swapped, such as 46 for 64.
- **Uninterruptible power supply (UPS)**: A battery device that keeps systems running during power loss or fluctuations, long enough to back up data and shut down safely.
- **Validity check**: An edit check that compares an ID code or account number to the master file to verify that it exists.
- **Zero-balance test**: A processing control that verifies a control account has a zero balance after all entries are posted.

## Practice Questions

1. An employee's hours worked was entered as 400 instead of 40. Which control would best catch this?
   - Limit check
   - Field check
   - Validity check
   - Parity checking
1. A clerk typed the letter "O" instead of the digit 0 in a payment amount. Which control would best catch this?
   - Field check
   - Sign check
   - Completeness check
   - Record count
1. A customer order was saved without a shipping address, so it shipped late. Which control would best prevent this?
   - Completeness check
   - Range check
   - Hash total
   - Zero-balance test
1. A website visitor entered 400 characters into a 5-digit zip code field, crashing the server. Which control would best prevent this?
   - Size check
   - Sign check
   - Reasonableness test
   - Concurrent update control
1. A clerk entered a customer account number that does not exist. Which control would catch this by checking the master file?
   - Validity check
   - Field check
   - Size check
   - Sign check
1. Which control can catch a transposed account number (45892 typed as 45982) without looking up the master file?
   - Check digit verification
   - Validity check
   - Record count
   - Cross-footing balance test
1. After processing sales, the inventory report showed negative quantities on hand for several items. Which control would best prevent this?
   - Sign check
   - Size check
   - Field check
   - Header record
1. A salesperson enters an item number and the screen displays "Laser printer," letting him see he meant toner cartridges. What control is this?
   - Closed-loop verification
   - Prompting
   - Parity checking
   - Check digit verification
1. A batch of time sheets has employee numbers 101, 205, and 310, and hours of 40, 38, and 45. What is the hash total of the employee numbers?
   - 616
   - 123
   - 3
   - 739
1. In the same batch of three time sheets, what is the record count?
   - 3
   - 123
   - 616
   - 739
1. A batch of 73 time sheets was sent to payroll, but one was never processed. Which control would have caught this before payday?
   - Record count
   - Field check
   - Sign check
   - Closed-loop verification
1. Two salespeople in different states each sold the same 55 units in stock at the same time. Which control would prevent this?
   - Concurrent update controls
   - Zero-balance test
   - Cross-footing balance test
   - Parity checking
1. The accounts receivable file was destroyed because it was accidentally used to update accounts payable. Which control would best prevent this?
   - File labels (checking the header record)
   - Sign check
   - Check digit verification
   - A hot site
1. After payroll is processed, the payroll clearing account should have a balance of zero. What control is this?
   - Zero-balance test
   - Cross-footing balance test
   - Reasonableness test
   - Limit check
1. Some data sent to a regional office was corrupted in transmission and not discovered for days. Which control would best catch this?
   - Parity checking or a checksum
   - Completeness check
   - Concurrent update controls
   - Cold site
1. A 20-minute power brownout crashed a critical database server. Which control would best prevent this?
   - Uninterruptible power supply (UPS)
   - RAID
   - Differential backup
   - Business continuity plan
1. A fire destroyed the data center, including all backup copies of the accounts receivable files. What was the main control failure?
   - Backups were not stored off-site
   - The company did not use a check digit
   - The company used differential backups
   - There was no limit check
1. A company does a full backup every Sunday and differential backups every other night. The system crashes Thursday morning. What must be restored?
   - Sunday's full backup and Wednesday's differential backup
   - Sunday's full backup and the Monday, Tuesday, and Wednesday differential backups
   - Only Wednesday's differential backup
   - Only Sunday's full backup
1. A company does a full backup every Sunday and incremental backups every other night. The system crashes Thursday morning. What must be restored?
   - Sunday's full backup and the Monday, Tuesday, and Wednesday incremental backups
   - Sunday's full backup and Wednesday's incremental backup
   - Only Wednesday's incremental backup
   - Only Sunday's full backup
1. A company decides it can lose no more than one hour of transaction data. Which objective has it set?
   - Recovery point objective (RPO)
   - Recovery time objective (RTO)
   - Business continuity plan
   - Fault tolerance
1. Which disaster recovery option is fully equipped with hardware and software and can be running within hours?
   - Hot site
   - Cold site
   - Archive
   - Incremental backup
1. What is the difference between a disaster recovery plan and a business continuity plan?
   - A DRP restores IT; a BCP resumes all business operations
   - A DRP resumes all business operations; a BCP restores IT
   - A DRP is for fires; a BCP is for floods
   - They are the same
1. According to Panko's research, about what share of errors does one person find when checking a spreadsheet?
   - About half
   - Nearly all
   - About 10%
   - None, unless they wrote the spreadsheet
