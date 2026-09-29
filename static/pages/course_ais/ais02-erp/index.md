# Chapter 2:Transaction Processing and ERP Systems

In financial accounting, you learned which accounts to debit and credit. This chapter (Chapter 2 in the textbook) follows that same transaction through the system: how data is captured, where it is stored, how it is processed, and how it comes back out as information. We end with Enterprise Resource Planning (ERP) systems, which integrate all of these steps across the organization.

**Outcomes**
- Define key terms
- Describe the four steps of the data processing cycle (input, storage, processing, output)
- Identify source documents and explain how to capture accurate, complete data
- Trace a transaction from a source document through journals and ledgers (the audit trail)
- Distinguish master files from transaction files
- Select an appropriate coding technique
- Assign CRUD permissions to users based on their role
- Explain the advantages and disadvantages of ERP systems

**Links**
- [Slides](ais02-erp.pptx)

## The data processing cycle

Every AIS performs four steps:

> Input → Storage → Processing → Output

This maps onto the accounting cycle you already know. A source document is journalized, posted to the ledger, adjusted, and summarized in financial statements. The difference is that an AIS does most of this automatically, and in a database rather than on paper.

## Data input

Input has three steps:

1. Capture transaction data when a business activity (event) happens
2. Make sure the data is accurate and complete
3. Make sure company policies are followed (i.e., the transaction was approved)

For each activity, capture what happened (a sale), which resources were affected (inventory and cash), and which people were involved (the customer and the employee).

Data comes from **source documents**, which record a transaction when it happens:

- **Paper source documents**, such as a signed receipt or purchase order
- **Turnaround documents**, which the company sends out and the other party returns, such as the payment stub on a utility bill
- **Source data automation**, where machines capture data directly, such as barcode scanners at a grocery register or RFID tags

Prenumbering source documents is a simple but strong control. If invoice #155 and #157 are in the file, you know to go looking for #156.

Many transactions today never touch paper. A company selling coffee mugs through a third-party e-commerce site might have the website capture the order and credit card payment, and the distributor ship directly to the customer. The data is still captured and verified; it just happens electronically. Controls still apply, such as limiting new customers to 10 orders a month and reviewing chargebacks monthly.

## Data storage

### Journals and ledgers

- The **chart of accounts** lists every account and its code. Plan it carefully. If you will someday need results by store and rolled up by region, build that into the account codes now. Changing a chart of accounts later is painful.
- **Journals** record transactions in date order. Specialized journals (i.e., a sales journal) hold one type of repetitive transaction; the general journal holds everything else.
- A **subsidiary ledger** holds the detail for one account, such as accounts receivable by customer. Its total must equal the **control account** in the general ledger.
- The **general ledger** holds the summary for every account.

Together, these create an **audit trail**, a path you can follow from a source document to the financial statements, or backward. For example, invoice #156 for $1,876.50 to KDR Builders is recorded on page 5 of the sales journal (SJ5). It is posted to KDR's account in the AR subsidiary ledger, and the day's sales total of $15,511 is posted to the Accounts Receivable and Sales accounts in the general ledger, each referencing SJ5.

### Coding techniques

Codes identify and classify items. Four common types:

- **Sequence codes** are numbered consecutively so gaps are easy to spot (prenumbered checks)
- **Block codes** are ranges reserved for categories (products starting with 2 are refrigerators)
- **Group codes** are two or more subgroups of digits, each with meaning (a car's VIN)
- **Mnemonic codes** are letters and numbers that are easy to remember (DRY300W05 is a low-end, white dryer made by manufacturer 05)

Why assign a client a sequential ID instead of using their name or Social Security number? Names are not unique, and SSNs are sensitive, may be missing or mistyped, and should not be spread across every table in the system.

Examples of Codes:

- Sequence code: 0001, 0002, 0003, 0004, 0005
- Block code: 1000-1999 = refrigerators, 2000-2999 = ovens, 3000-3999 = dishwashers
- Group code: 1-234-567-890 = 1 = country, 234 = manufacturer, 567 = product, 890 = serial number
- Mnemonic code: DRY300W05 = DRY = dryer, 300 = mid-range, W = white, 05 = manufacturer 05

While technically block, group, and mnemonic codes are all sequence codes, they are often referred to by their own names because they are so common. In this class, I'm less concerned with you telling the difference between each type of code than with you understanding why we use codes at all: to identify and classify items, and to make it easier to spot missing or incorrect data.

### Files and databases

Data is organized in a hierarchy:

> Database → Files (tables) → Records → Fields (attributes) → Data values

- An **entity** is something we store data about (a customer). A **record** holds data about one entity.
- An **attribute** is a characteristic of the entity (credit limit). It is stored in a **field**.
- A **master file** stores information about resources and people that rarely changes, such as customers, vendors, or inventory items.
- A **transaction file** stores the individual transactions that happen during a period, such as sales or cash receipts.

A quick test: if each row is an *event* with a date, it is probably a transaction file. If each row is a *thing* that persists over time, it is probably a master file.

## Data processing

There are four types of processing, known as **CRUD**:

- **Create** new records (add a customer)
- **Read** existing data
- **Update** existing records
- **Delete** records

CRUD is also a useful way to think about permissions. A cashier at a register needs to *create* sales, but should not be able to update or delete them. In a well-controlled accounting system, very few people can delete a transaction; errors are fixed with a reversing entry, so the audit trail is preserved.

Processing can be done in **batches** (i.e., post all of the day's register sales as one journal entry at night) or in **real time** (update records as each transaction happens).

## Information output

Output can be viewed on screen (soft copy) or printed (hard copy). It takes three forms:

- **Documents** are records of a single transaction (a sales invoice)
- **Reports** are organized summaries for users (a monthly sales report)
- **Queries** are questions asked of the database for specific information (which division had the most sales this month?)

## Enterprise Resource Planning (ERP) systems

An **ERP system** integrates all of an organization's processes in one system with a shared database: the revenue, expenditure, production, and HR/payroll cycles, plus the general ledger and reporting system.

Advantages:

- A single, integrated view of the organization's data
- Data is captured once (sales and accounting don't both type in the same customer)
- Better visibility and monitoring for management
- Better access control through security settings
- Standardized procedures and reports
- Better customer service
- Higher productivity through automation

Disadvantages:

- Cost
- Implementation takes a long time
- The firm must either customize the software or change its business processes to fit it
- Complexity
- User resistance

Integration cuts both ways. Because data is entered once and used everywhere, a bad input spreads everywhere. Strong input controls and limited access are even more important in an ERP.

## Key Terms

- **Attribute**: A characteristic of an entity, such as a customer's credit limit, stored in a field.
- **Audit trail**: A path that allows a transaction to be traced from its source document to the financial statements, and back.
- **Batch processing**: Collecting transactions and processing them together at a set time, such as daily.
- **Block code**: A code where ranges of numbers are reserved for categories of data.
- **Chart of accounts**: The list of all general ledger accounts and their codes.
- **Control account**: A general ledger account whose balance equals the total of a subsidiary ledger.
- **CRUD**: The four types of data processing: create, read, update, and delete.
- **Data processing cycle**: The four operations performed on data: input, storage, processing, and output.
- **Database**: A set of interrelated, centrally coordinated files.
- **Document**: A record of a single transaction or event, such as an invoice.
- **Enterprise resource planning (ERP) system**: A system that integrates all aspects of an organization's activities in a shared database.
- **Entity**: The item about which information is stored, such as a customer or product.
- **Field**: The part of a record that stores one attribute.
- **General journal**: The journal for non-routine transactions and adjusting entries.
- **General ledger**: The summary-level record of every account.
- **Group code**: A code with two or more subgroups of digits, each with its own meaning.
- **Master file**: A file that stores information about resources and people that rarely changes.
- **Mnemonic code**: A code of letters and numbers that is easy to remember.
- **Query**: A request to the database for specific information.
- **Real-time processing**: Updating records as each transaction occurs.
- **Record**: The set of fields describing one entity.
- **Report**: An organized output of information, such as a monthly sales report.
- **Sequence code**: Items numbered consecutively so none are missing.
- **Source data automation**: Capturing transaction data electronically at the source, such as with a barcode scanner.
- **Source document**: The document that first records a transaction.
- **Specialized journal**: A journal that records a large number of similar transactions, such as sales.
- **Subsidiary ledger**: A ledger holding the detail for one general ledger account, such as AR by customer.
- **Transaction file**: A file of the individual business transactions that occur during a period.
- **Turnaround document**: A document the company sends out that is returned as input, such as a bill payment stub.

## Practice Questions

1. What are the four steps of the data processing cycle, in order?
   - Input, storage, processing, output
   - Input, processing, output, storage
   - Capture, verify, post, report
   - Create, read, update, delete
1. What is a source document?
   - The document where a transaction is first recorded
   - A report sent to external users
   - The general ledger
   - A query against the database
1. A utility company sends a bill with a stub that the customer returns with payment. What is the stub?
   - A turnaround document
   - A source data automation device
   - A subsidiary ledger
   - A master file
1. Why is prenumbering source documents a good control?
   - Gaps in the sequence reveal missing or unrecorded documents
   - It makes documents easier to read
   - It removes the need for approval
   - It allows documents to be stored in a database
1. A company tracks accounts receivable by customer. Where is this detail stored?
   - Subsidiary ledger
   - General journal
   - Chart of accounts
   - Transaction file
1. What does an audit trail allow you to do?
   - Trace a transaction from its source document to the financial statements, and back
   - Prevent all errors in data entry
   - Delete incorrect transactions
   - Compress data to save storage
1. A company's customer list stores each customer's name, address, and credit limit. What type of file is this?
   - Master file
   - Transaction file
   - Journal
   - Report
1. A file lists every sale made in October, one row per sale. What type of file is this?
   - Transaction file
   - Master file
   - Chart of accounts
   - Control account
1. Product numbers starting with 2 are refrigerators, and numbers starting with 3 are ovens. What coding technique is this?
   - Block code
   - Sequence code
   - Group code
   - Mnemonic code
1. Why would an ERP system use sequential integers to identify clients rather than names?
   - Names are not unique, so they cannot reliably identify one client
   - Integers use less paper
   - Names are always sensitive data
   - Integers are required by GAAP
1. Which CRUD permission does a cashier need to ring up sales?
   - Create
   - Update
   - Delete
   - None
1. A store posts all register sales as a single journal entry each night. What is this?
   - Batch processing
   - Real-time processing
   - Source data automation
   - A query
1. Which is a disadvantage of an ERP system?
   - It is costly and takes a long time to implement
   - Data must be entered separately in each department
   - It prevents management from monitoring operations
   - It cannot produce standardized reports
1. Why are input controls especially important in an ERP system?
   - Data is entered once and shared everywhere, so errors spread across the organization
   - ERP systems cannot store historical data
   - ERP systems do not have security settings
   - Only accountants enter data into an ERP
