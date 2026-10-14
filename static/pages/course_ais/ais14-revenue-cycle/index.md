# The Revenue Cycle: Sales to Cash Collections

The revenue cycle is how a company gets paid. This chapter (Chapter 14 in the textbook) follows a sale from the customer's order through shipping, billing, and cash collection. At each step, we look at the documents created, the journal entry (if any), what can go wrong, and the controls that prevent it.

**Outcomes**
- Define key terms
- List the four activities of the revenue cycle and the documents created at each
- Explain the sales order entry process, including credit approval and checking inventory
- Explain the shipping process, including the picking ticket, packing slip, and bill of lading
- Explain the billing process, including the open-invoice and balance-forward methods
- Explain the cash collections process, including lockboxes and electronic payments
- Match common revenue cycle threats to the controls that address them

**Links**
- [Slides](ais14-revenue-cycle.pptx)

## Overview

The **revenue cycle** is the set of business activities and information processing operations for providing goods and services to customers and collecting cash. In Chapter 1's give–get terms, the company gives goods and gets cash. It has four activities:

> Sales order entry → Shipping → Billing → Cash collections

Each step hands a document to the next one. Here is a distributor selling 50 cases of paper cups to a coffee shop:

| Step | What happens | Main documents | Journal entry |
|---|---|---|---|
| Sales order entry | Coffee shop asks for a price, then places an order | Sales quote, customer's purchase order, sales order | None |
| Shipping | Warehouse picks, packs, and ships the cups | Picking ticket, packing slip, bill of lading | Dr. Cost of goods sold, Cr. Inventory |
| Billing | Accounts receivable bills the coffee shop | Sales invoice, monthly statement | Dr. Accounts receivable, Cr. Sales |
| Cash collections | Cashier receives and deposits the payment | Remittance advice, check | Dr. Cash, Cr. Accounts receivable |

Taking an order does not touch the general ledger, since nothing has been shipped or earned yet. In most systems, the invoice is created right after shipment, so the sale is recorded at about the same time the goods leave.

The customer's purchase order becomes the seller's sales order. Chapter 15 covers the same transaction from the buyer's side.

### General threats and controls

Some threats apply to every step of the cycle:

| Threat | Controls |
|---|---|
| Inaccurate or invalid master data (wrong customer address, price, or credit limit) | Data processing integrity controls; restrict access to master data; review all changes to master data |
| Unauthorized disclosure of sensitive information (customer credit card numbers, pricing) | Access controls; encryption; tokenization of customer personal information |
| Loss or destruction of data | Backup and disaster recovery procedures |
| Poor performance | Managerial reports |

**Tokenization** replaces sensitive data, such as a credit card number, with a meaningless substitute (a token). Systems that don't need the real number never store it, so there is nothing to steal.

Do not try to memorize every threat and control in this chapter. Most controls fall into a few groups: documents that must match before the next step happens, segregation of duties so no one person can both take an asset and hide it, reconciliations, and restricted access. If you understand why each document exists, the controls follow.

## Sales order entry

The goal of sales order entry is to make sure every sale is legitimate (authorized) and accurate. It has four steps:

1. **Take the customer order.** The order is recorded on a **sales order**, which lists the items, quantities, prices, and terms. It often follows a **sales quote**, the seller's offer of price and availability. Orders can arrive by phone, website, or **electronic data interchange (EDI)**, where the customer's system sends its purchase order directly to ours in a standard format.
1. **Approve customer credit.** For a credit sale, check that the order will not push the customer over their **credit limit**. Orders over the limit need specific approval from the credit manager. The **accounts receivable aging report** lists each customer's balance by how long it has been outstanding, which helps set limits and spot customers who are slow to pay.
1. **Check inventory availability.** If there is not enough on hand, create a **back order** to buy or produce the missing items. Once the order is approved, a **picking ticket** tells the warehouse which items to release to shipping.
1. **Respond to customer inquiries.** Customers ask questions before and after the sale. **Customer relationship management (CRM) systems** organize customer data so the company can give efficient, personalized service.

For example, the coffee shop has a $5,000 credit limit and owes $4,200. A new $1,500 order would bring its balance to $5,700, so the system holds the order until the credit manager approves it.

Credit approval should be done by someone other than the salesperson. Salespeople are often paid on commission, so they have an incentive to approve every sale, whether or not the customer can pay.

| Threat | Controls |
|---|---|
| Incomplete or inaccurate orders | Data entry edit controls (the system fills in the customer's address and prices from master data); restrict access to master data |
| Invalid orders (customer denies placing the order) | Signature (or digital signature) to authorize the sale |
| Uncollectible accounts | Credit limits, with specific approval to exceed them; aging of accounts receivable |
| Stockouts and excess inventory | Perpetual inventory system; bar codes or RFID; physical inventory counts; sales forecasts and activity reports |
| Loss of customers | CRM systems; self-help websites; monitoring customer service ratings |

## Shipping

The goal of shipping is to send the right items, in the right quantity, to the right place.

1. **Pick and pack the order.** Warehouse staff use the picking ticket to pull the goods. The quantities picked are checked against the sales order.
1. **Ship the order.** Shipping compares the goods to the picking ticket and sales order, then prepares two documents:
   - a **packing slip**, which lists the quantity and description of each item in the shipment and goes in the box
   - a **bill of lading**, a legal contract that defines who is responsible for the goods while they are in transit. It identifies the carrier, source, destination, and any special instructions.

When the goods leave the warehouse, inventory decreases and cost of goods sold increases.

| Threat | Controls |
|---|---|
| Picking the wrong items or quantity | Bar codes or RFID; reconcile the picking list to the sales order |
| Theft of inventory | Restrict physical access to inventory; document all inventory transfers; physically count inventory and reconcile to recorded quantities |
| Shipping errors (failing to ship, wrong items or quantities, wrong address, duplicate shipments) | Reconcile shipping documents to sales orders, picking lists, and packing slips; data entry edit controls |

## Billing

The goal of billing is to bill the customer for exactly what was shipped, at the right price.

### Invoicing

The **sales invoice** tells the customer how much they owe and where to send payment. It is created by matching the shipping documents to the sales order: bill for what actually shipped, at the price on the sales order. If the coffee shop ordered 50 cases but only 45 shipped, bill for 45 and back-order the other 5.

Shipping and billing should be done by different people. If one person could do both, they could ship goods to a friend and never send a bill.

### Maintaining accounts receivable

There are two ways to apply customer payments:

| Method | Customers pay... | Common for |
|---|---|---|
| **Open-invoice method** | Each invoice separately | Business-to-business sales |
| **Balance-forward method** | The balance on their monthly statement, not individual invoices | Credit card companies and utilities |

A **monthly statement** lists every transaction with the customer during the past month and their current balance. Rather than mailing every statement on the same day, many companies use **cycle billing**: customers with last names A–F get statements on the 1st, G–L on the 8th, and so on. This spreads out the work (and the incoming payments) across the month.

A **credit memo**, approved by the credit manager, authorizes billing to reduce a customer's balance, such as for returned or damaged goods, or to write off an uncollectible account.

| Threat | Controls |
|---|---|
| Failure to bill customers | Reconcile invoices with sales orders and shipping documents; separate the shipping and billing functions |
| Billing errors (wrong price or quantity) | Configure the system to enter prices automatically from the price list; data entry edit controls; reconcile shipping documents to sales orders |
| Posting errors in accounts receivable | Reconcile the AR subsidiary ledger total to the AR control account in the general ledger; mail monthly statements to customers (who will complain if they are wrong) |
| Inaccurate or invalid credit memos | Segregate authorizing credit memos from recording them |

Credit memos need their own control because they are an easy way to hide theft. An employee who pockets a customer's payment could issue a credit memo to clear that customer's balance, and no one would notice the missing cash.

## Cash collections

The goal of cash collections is to reduce the risk of theft, and to make sure customer accounts are updated correctly.

### Processing payments

Customers send a **remittance advice** with their payment. This is a copy of the invoice, or a stub, that says which invoices the payment is for. When payments come by mail, a mailroom employee opens the mail, endorses each check "For deposit only," and lists every payment on a **remittance list**. The checks go to the cashier for deposit. The remittance advices go to accounts receivable to update customer accounts. In the slides' diagram, note that the remittance memo goes to AR and the check goes to the cashier. No single person sees both the cash and the customer records.

### Segregation of duties

Theft of cash is the biggest threat in this activity. The person who handles cash should not also:

- post payments to customer accounts
- authorize credit memos
- reconcile the bank account

Here is why. Suppose a cashier who also posts to accounts receivable steals a $500 check from Customer A. To hide it, they apply Customer B's payment to A's account, then Customer C's payment to B's account, and so on. This is called **lapping**. Segregation of duties prevents it, since the person with the checks cannot change customer accounts. Monthly statements also help, since Customer B will complain when their payment doesn't show up.

### Getting paid faster, and without handling checks

The safest check is one that employees never touch. Options include:

- **Lockbox** customers mail payments to a P.O. box maintained by the company's bank. The bank picks up the checks, deposits them, and sends the company the remittance data.
- **Electronic lockbox** the bank scans the checks and immediately sends the company each customer's account number and amount paid.
- **Electronic funds transfer (EFT)** customers pay through online banking, with no paper check.
- **Financial electronic data interchange (FEDI)** combines EFT with EDI, so the payment and the remittance data (which invoices are being paid) travel together in one electronic package.
- **Universal payment identification code (UPIC)** a number that lets customers pay by ACH credit without the seller revealing its actual bank account number.

| Threat | Controls |
|---|---|
| Theft of cash | Segregate cash handling from posting to customer accounts, authorizing credit memos, and reconciling the bank account; use a lockbox; open mail immediately, endorse checks promptly, and deposit all receipts daily; use cash registers |
| Cash flow problems | Lockbox (speeds up deposits); discounts for early payment; cash flow budget |

A **cash flow budget** projects cash inflows and outflows for a period. It tells the company ahead of time when it will be short of cash, so it can arrange a loan before it needs one.

## Key Terms

- **Accounts receivable aging report**: A report listing customer account balances by how long they have been outstanding.
- **Back order**: A document authorizing the purchase or production of items, created when there is not enough inventory to fill a customer order.
- **Balance-forward method**: A way of maintaining accounts receivable in which customers pay the amount shown on a monthly statement, rather than paying individual invoices.
- **Bill of lading**: A legal contract that defines responsibility for goods while they are in transit.
- **Cash flow budget**: A budget showing projected cash inflows and outflows for a period.
- **Credit limit**: The maximum balance a customer is allowed to owe, based on past credit history and ability to pay.
- **Credit memo**: A document, approved by the credit manager, authorizing billing to reduce (credit) a customer's account.
- **Customer relationship management (CRM) systems**: Software that organizes customer information to provide efficient, personalized service.
- **Cycle billing**: Sending monthly statements to different groups of customers at different times during the month.
- **Electronic data interchange (EDI)**: Sending business documents electronically in a standard format that the recipient's system can process automatically.
- **Electronic funds transfer (EFT)**: Transferring funds electronically using online banking software.
- **Electronic lockbox**: A lockbox in which the bank electronically sends the company each customer's account number and amount paid as soon as it receives the check.
- **Financial electronic data interchange (FEDI)**: The combination of EFT and EDI, which sends payment and remittance data together in one electronic package.
- **Lapping**: Hiding the theft of cash by applying later customer payments to the accounts of earlier customers, delaying posting.
- **Lockbox**: A postal address where customers send payments, maintained by the company's bank, which picks up and deposits the checks.
- **Monthly statement**: A document listing all of a customer's transactions during the past month and their current balance.
- **Open-invoice method**: A way of maintaining accounts receivable in which customers pay each invoice separately.
- **Packing slip**: A document listing the quantity and description of each item in a shipment.
- **Picking ticket**: A document listing the items and quantities ordered, which authorizes the warehouse to release the goods to shipping.
- **Remittance advice**: A document returned with a customer's payment that shows which invoices are being paid.
- **Remittance list**: A list of the names and amounts of all customer payments received in the mail.
- **Revenue cycle**: The recurring business activities and information processing for providing goods and services to customers and collecting cash.
- **Sales invoice**: A document telling the customer the amount of a sale and where to send payment.
- **Sales order**: The document created during sales order entry, listing the items, quantities, prices, and terms of the sale.
- **Sales quote**: The seller's offer to a customer, showing price and availability.
- **Tokenization**: Replacing sensitive data, such as a credit card number, with a meaningless substitute.
- **Universal payment identification code (UPIC)**: A number that lets customers pay by ACH credit without the seller revealing its bank account details.

## Practice Questions

1. What are the four activities of the revenue cycle, in order?
   - Sales order entry, shipping, billing, cash collections
   - Billing, sales order entry, shipping, cash collections
   - Ordering, receiving, approving supplier invoices, cash disbursements
   - Sales order entry, billing, cash collections, shipping
1. Which revenue cycle activity does not create a general ledger entry?
   - Sales order entry
   - Shipping
   - Billing
   - Cash collections
1. A customer with a $5,000 credit limit and a $4,200 balance places a $1,500 order. What should happen?
   - The order is held until the credit manager specifically approves it
   - The order ships, since the customer has paid on time in the past
   - The salesperson approves the order
   - The order is automatically cancelled
1. Why should credit be approved by someone other than the salesperson?
   - Salespeople paid on commission have an incentive to approve every sale
   - Salespeople do not have access to the customer master file
   - Credit approval must be done after shipping
   - Credit approval is a billing function
1. Which report helps a company identify customers who are slow to pay?
   - Accounts receivable aging report
   - Remittance list
   - Packing slip
   - Cash flow budget
1. A customer orders 100 units, but only 60 are in stock. What document is created for the other 40?
   - Back order
   - Credit memo
   - Bill of lading
   - Remittance advice
1. Which document authorizes the warehouse to release goods to shipping?
   - Picking ticket
   - Packing slip
   - Sales invoice
   - Remittance advice
1. Which document is a legal contract that defines responsibility for goods while they are in transit?
   - Bill of lading
   - Packing slip
   - Sales order
   - Picking ticket
1. Why should shipping and billing be separate functions?
   - So one person cannot ship goods without billing the customer
   - So that billing can happen before shipping
   - So that customers receive their goods faster
   - Because billing is part of the warehouse
1. A utility customer pays the total shown on their monthly statement, rather than paying each bill separately. Which method is this?
   - Balance-forward method
   - Open-invoice method
   - Cycle billing
   - Lockbox
1. A company sends statements to customers with last names A–F on the 1st of the month, G–L on the 8th, and so on. What is this?
   - Cycle billing
   - Balance-forward method
   - Open-invoice method
   - Lapping
1. Which control best catches posting errors in accounts receivable?
   - Reconcile the AR subsidiary ledger total to the AR control account in the general ledger
   - Use a lockbox
   - Use bar codes in the warehouse
   - Require a signature on the sales order
1. A customer returns damaged goods. Which document authorizes reducing the customer's balance?
   - Credit memo
   - Remittance advice
   - Sales invoice
   - Back order
1. What is the purpose of a remittance advice?
   - Show which invoices a customer's payment is for
   - Authorize the release of inventory
   - List the items in a shipment
   - Reduce a customer's balance for returned goods
1. Customers mail their payments to a P.O. box maintained by the company's bank, which deposits the checks. What is this?
   - Lockbox
   - Electronic funds transfer
   - Remittance list
   - Cycle billing
1. Which combination of duties creates the greatest risk of theft of cash?
   - Handling customer checks and posting payments to customer accounts
   - Taking sales orders and responding to customer inquiries
   - Picking and packing orders
   - Preparing the cash flow budget and reviewing sales forecasts
1. An employee steals Customer A's payment and hides it by applying Customer B's payment to A's account. What is this called?
   - Lapping
   - A kickback
   - Cycle billing
   - Tokenization
1. Which control best reduces the risk of customers' credit card numbers being stolen from the company's systems?
   - Tokenization of customer personal information
   - Cycle billing
   - Physical inventory counts
   - Discounts for early payment
1. What combines electronic funds transfer with remittance data in one electronic package?
   - Financial electronic data interchange (FEDI)
   - Universal payment identification code (UPIC)
   - Customer relationship management (CRM) system
   - Balance-forward method
