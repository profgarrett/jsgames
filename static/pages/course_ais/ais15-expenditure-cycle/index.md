# The Expenditure Cycle: Purchasing to Cash Disbursements

The expenditure cycle is the revenue cycle seen from the other side of the counter. This chapter (Chapter 15 in the textbook) follows a purchase from the decision to buy through ordering, receiving, approving the supplier's invoice, and paying. The central control is simple: before paying anyone, confirm that we ordered it, we received it, and the bill is correct.

**Outcomes**
- Define key terms
- List the four activities of the expenditure cycle and the documents created at each
- Compare the expenditure cycle to the revenue cycle
- Explain how companies decide what, when, and how much to order (EOQ, MRP, JIT)
- Explain the receiving process and its controls
- Explain the three-way match and the voucher package
- Match common expenditure cycle threats to the controls that address them

**Links**
- [Slides](ais15-expenditure-cycle.pptx)

## Overview

The **expenditure cycle** is the set of business activities and information processing operations for buying and paying for goods and services. The company gives cash and gets goods or services. Its main objective is to minimize the total cost of acquiring and maintaining inventory, supplies, and the services the organization needs.

It has four activities:

> Order goods and services → Receive them → Approve the supplier invoice → Pay

Picking up the example from Chapter 14, here is the coffee shop buying 50 cases of paper cups from its distributor:

| Step | What happens | Main documents | Journal entry |
|---|---|---|---|
| Order | The store manager requests cups; purchasing gets a quote and places the order | Purchase requisition, sales quote, purchase order | None |
| Receive | Receiving counts and inspects the cups | Bill of lading, receiving report | Dr. Inventory, Cr. Accounts payable (see note) |
| Approve invoice | Accounts payable matches the invoice to the purchase order and receiving report | Supplier invoice, voucher package | None (see note) |
| Pay | The CFO (or treasurer) signs the check; AP sends it with a remittance advice | Disbursement voucher, check, remittance advice | Dr. Accounts payable, Cr. Cash |

**Note:** The company has a legal obligation to pay once it accepts the goods, which is how the slides show the entry. In practice, many companies record the payable after the invoice is approved, so the amount matches the bill. Either way, the entry is the same.

### The mirror image of the revenue cycle

Every purchase is someone else's sale. Each expenditure cycle activity lines up with a revenue cycle activity at the supplier:

| Buyer (expenditure cycle) | Seller (revenue cycle) |
|---|---|
| Order goods and services | Sales order entry |
| Receive goods | Shipping |
| Approve supplier invoice | Billing |
| Cash disbursements | Cash collections |

The documents line up too. The buyer's purchase order becomes the seller's sales order. The seller's sales invoice is the buyer's supplier invoice. The buyer's check and remittance advice are the seller's cash receipt. When you get a question about a document, first ask whose side you are on.

### Key decisions

- What is the optimal level of inventory?
- Which suppliers provide the best quality at the best price?
- How can IT improve the efficiency and accuracy of logistics?
- How can we take advantage of supplier discounts?
- How can we maximize cash flow?

Most of these come back to one idea: get what you need, when you need it, at a good price, without tying up cash in inventory that sits on a shelf.

### General threats and controls

The same general threats from Chapter 14 apply:

| Threat | Controls |
|---|---|
| Inaccurate or invalid master data (wrong supplier address, bank account, or price) | Data processing integrity controls; restrict access to master data; review all changes to master data |
| Unauthorized disclosure of sensitive information (supplier bank accounts, negotiated prices) | Access controls; encryption |
| Loss or destruction of data | Backup and disaster recovery procedures |
| Poor performance | Managerial reports |

## Ordering goods and services

The goal of ordering is to buy exactly what we need, when we need it, at a good price, from a reliable supplier, and only with authorization. There are three steps:

1. **Identify what, when, and how much to buy.** The requesting department fills out a **purchase requisition**.
1. **Get the price, availability, and terms.** The supplier sends a **sales quote**.
1. **Authorize the purchase.** Purchasing sends the supplier a **purchase order**.

| Document | From → To | Key question |
|---|---|---|
| Purchase requisition | Production (or any department) → Purchasing | Why do we need it? The justification is the key field. |
| Sales quote | Supplier → Purchasing | What is the price, and when can we get it? |
| Purchase order | Purchasing → Supplier | A promise to pay once the items are delivered |

A **purchase order** formally asks the supplier to deliver specified items at set prices. It becomes a contract once the supplier accepts it. For things bought over and over, a **blanket purchase order** commits to buy specified items at set prices from one supplier for a period, often a year, so purchasing doesn't have to write a new PO every time.

### How much and when to order

There are three common approaches:

| Approach | Based on | How it works |
|---|---|---|
| **Economic order quantity (EOQ)** | Cost | Calculates the order size that minimizes total ordering, carrying, and stockout costs. A **reorder point** sets when to order: once inventory falls to a set level. |
| **Materials requirements planning (MRP)** | Forecasted sales | Uses better forecasts and production schedules to buy only what production will need. |
| **Just-in-time (JIT) inventory** | Actual sales | Buys and produces only in response to actual demand, keeping little or no inventory on hand. |

JIT saves the cost of holding inventory, but it leaves no cushion. Many companies relearned this during the supply chain disruptions of 2020–2021.

With **vendor-managed inventory (VMI)**, the supplier does the ordering. It watches the customer's point-of-sale data through EDI and restocks automatically when inventory falls to an agreed level.

### Threats and controls

| Threat | Controls |
|---|---|
| Stockouts and excess inventory | Perpetual inventory system; bar codes or RFID; periodic physical counts |
| Purchasing items not needed | Perpetual inventory system; review and approve purchase requisitions; centralized purchasing |
| Purchasing items at inflated prices | Price lists; competitive bids; review purchase orders |
| Purchasing goods of poor quality | Use approved suppliers; review and approve purchases from new suppliers; monitor product quality by supplier; hold purchasing managers responsible for rework and scrap costs |
| Unreliable suppliers | Monitor supplier performance; require quality certification |
| Purchasing from unauthorized suppliers | Buy only from approved suppliers; review and approve purchases from new suppliers; EDI-specific controls |
| Kickbacks | Supplier audits; prohibit gifts; job rotation and mandatory vacations; require disclosure of financial and personal interests in suppliers |

Two of these are worth a closer look:

- **Kickbacks** are gifts from suppliers to purchasing agents to influence which supplier they choose. A kickback scheme usually needs the same buyer to keep steering business to the same supplier. Job rotation and mandatory vacations break that pattern. When someone else covers the job for two weeks, the scheme tends to surface.
- Holding purchasing managers responsible for rework and scrap costs matters because a manager judged only on price will buy the cheapest goods, even if they cause problems later in production.

## Receiving

The goal of receiving is to accept only what we ordered, in the right quantity and condition. Once the company accepts a delivery, it has a legal obligation to pay for it.

1. **Goods arrive** with a **bill of lading** from the carrier, which shows what is supposed to be on the truck.
1. **Check for an approved purchase order.** If there is no purchase order, refuse the delivery.
1. **Count and inspect the goods**, and record the results on a **receiving report**: the date received, shipper, supplier, and quantity received. The receiving report shows what we actually got.
1. **Send the goods** to inventory.

| Document | From → To | Key question |
|---|---|---|
| Bill of lading | Supplier (carrier) → Receiving | What is supposed to be on the truck? |
| Receiving report | Receiving → Purchasing and AP | What did we actually receive? |

If 50 cases were ordered but only 45 arrived, the receiving report shows 45, and the company pays for 45. If goods arrive damaged and are sent back, purchasing issues a **debit memo** to record the reduction in the amount owed to the supplier. (A debit memo is the buyer's version of the seller's credit memo from Chapter 14.)

Receiving clerks are often not told the quantity ordered. If the clerk can see that the purchase order says 50 cases, it is tempting to glance at the pallet and write down 50. Without that number, they have to count.

Services are harder to verify, since there is no box to count. Did the consultant actually work 40 hours? Controls here include budget controls (comparing actual spending to budget) and audits.

| Threat | Controls |
|---|---|
| Accepting unordered items | Require an approved purchase order before accepting a delivery |
| Mistakes in counting | Bar codes or RFID; receiving employees sign the receiving report; do not tell receiving the quantity ordered |
| Verifying receipt of services | Budget controls; audits |
| Inventory theft | Restrict physical access to inventory; document all inventory transfers; segregate custody of inventory from receiving |

## Approving supplier invoices

The goal of this step is to pay only for goods we ordered and received, at the agreed price.

### The three-way match

Accounts payable compares three documents:

| Document | Answers |
|---|---|
| Purchase order | What did we order, and at what price? |
| Receiving report | What did we actually receive? |
| Supplier invoice | What is the supplier billing us for? |

If all three agree, the invoice is approved for payment. Together, these documents make up the **voucher package**.

For example, the purchase order is for 50 cases at $30 ($1,500). The receiving report shows 45 cases. The supplier's invoice bills for all 50 cases, $1,500. The company owes only $1,350 (45 × $30), and AP should contact the supplier before paying.

### Voucher and nonvoucher systems

There are two ways to process approved invoices:

- In a **nonvoucher system**, each approved invoice is posted to the supplier's record in the accounts payable file and kept in an open-invoice file until it is paid.
- In a **voucher system**, AP prepares a **disbursement voucher** instead. It identifies the supplier, lists the outstanding invoices, and shows the net amount to pay after discounts and allowances. Voucher systems write fewer checks (one voucher can cover several invoices), make payables easier to track (vouchers are prenumbered), and separate approving an invoice from paying it.

### Other approaches

- **Evaluated receipt settlement (ERS)** removes the supplier invoice. The company pays based on a two-way match of the purchase order and receiving report, at the price on the purchase order. This only works with trusted suppliers.
- **Procurement cards** (p-cards) are corporate credit cards that employees can use only at designated suppliers for specific kinds of items. They are useful for small purchases, where a full purchase order process would cost more than the item.

| Threat | Controls |
|---|---|
| Errors in supplier invoices | Verify invoice accuracy (three-way match); require detailed receipts for p-card purchases; restrict access to supplier master data |
| Mistakes in posting to accounts payable | Data entry edit controls; reconcile the detailed AP records to the AP control account in the general ledger |

Restricting access to supplier master data deserves emphasis. A common fraud is to add a fake supplier to the master file, then submit and approve invoices from it. If AP clerks cannot add suppliers, they cannot create someone to pay.

## Cash disbursements

The goal of cash disbursements is to pay the right supplier, the right amount, once, and on time.

Before signing a check, the CFO (or treasurer) reviews the payment package:

- the check
- the purchase order (what we ordered)
- the receiving report (what we received)
- the supplier invoice (what they are billing us for)

After the payment is made, the supporting documents are canceled (marked "Paid") so they cannot be used to pay the same invoice again. Payments go out with a remittance advice telling the supplier which invoices to apply the payment to.

### Taking discounts

Terms of 2/10, net 30 mean the buyer gets a 2% discount for paying within 10 days; otherwise, the full amount is due in 30 days. On a $10,000 invoice, paying $9,800 on day 10 instead of $10,000 on day 30 saves $200 for paying 20 days early. That works out to roughly 37% a year, better than almost any investment. This is why invoices are filed by due date, so discounts are not missed.

### Petty cash

Not everything is worth a check. An **imprest fund**, such as petty cash, is set at a fixed amount (say $200), and a voucher is required for every payment. At all times, cash plus vouchers should equal the fixed amount. If the vouchers total $145, there should be $55 in cash. To refill the fund, write a check for the total of the vouchers.

### Segregation of duties

The person who approves invoices for payment (accounts payable) should not also sign checks (CFO or treasurer), and neither should reconcile the bank account.

| Threat | Controls |
|---|---|
| Failure to take available discounts | File invoices by due date |
| Paying for items not received | Match the supplier invoice to the purchase order and receiving report before paying |
| Duplicate payments | Pay only original invoices; cancel supporting documents when payment is made |
| Theft of cash | Physical security of blank checks; segregation of duties; reconcile bank accounts |
| Check alteration | Check protection machines; special inks and papers |
| Cash flow problems | Cash flow budget |

## Key Terms

- **Blanket purchase order**: A commitment to buy specified items at set prices from one supplier for a set period, often one year.
- **Debit memo**: A document used to record a reduction in the amount owed to a supplier.
- **Disbursement voucher**: A document that identifies the supplier, lists the outstanding invoices, and shows the net amount to pay after discounts and allowances.
- **Economic order quantity (EOQ)**: An inventory approach that calculates the order size that minimizes total ordering, carrying, and stockout costs.
- **Evaluated receipt settlement (ERS)**: An invoiceless approach to accounts payable that replaces the three-way match with a two-way match of the purchase order and receiving report.
- **Expenditure cycle**: The recurring business activities and information processing for buying and paying for goods and services.
- **Imprest fund**: A cash fund set at a fixed amount, with a voucher required for every payment, so cash plus vouchers always equals the fixed amount.
- **Just-in-time (JIT) inventory system**: A system that minimizes inventory by buying and producing goods only in response to actual, rather than forecasted, sales.
- **Kickbacks**: Gifts from suppliers to purchasing agents to influence their choice of supplier.
- **Materials requirements planning (MRP)**: An inventory approach that reduces inventory by improving forecasts to better schedule purchases for production needs.
- **Nonvoucher system**: A way of processing accounts payable in which each approved invoice is posted to the supplier's record and kept in an open-invoice file.
- **Procurement card**: A corporate credit card that employees can use only at designated suppliers for specific kinds of items.
- **Purchase order**: A document that formally asks a supplier to sell and deliver specified items at set prices; a contract once the supplier accepts it.
- **Purchase requisition**: A document that requests goods, identifying the requester, items, quantities, and the date and place they are needed.
- **Receiving report**: A document recording details of each delivery, including the date received, shipper, supplier, and quantity received.
- **Reorder point**: The inventory level at which an order to replenish stock is placed.
- **Three-way match**: Comparing the purchase order, receiving report, and supplier invoice before approving payment.
- **Vendor-managed inventory (VMI)**: An arrangement in which the supplier monitors the customer's inventory through EDI and restocks it automatically.
- **Voucher package**: The documents used to authorize payment to a supplier: purchase order, receiving report, and supplier invoice.
- **Voucher system**: A way of processing accounts payable in which a disbursement voucher is prepared instead of posting invoices directly to the supplier's account.

## Practice Questions

1. What are the four activities of the expenditure cycle, in order?
   - Order, receive, approve supplier invoice, pay
   - Receive, order, pay, approve supplier invoice
   - Sales order entry, shipping, billing, cash collections
   - Order, approve supplier invoice, receive, pay
1. Receiving in the expenditure cycle is the mirror image of which revenue cycle activity?
   - Shipping
   - Billing
   - Sales order entry
   - Cash collections
1. The buyer sends a purchase order. How does the seller record it?
   - As a sales order
   - As a receiving report
   - As a debit memo
   - As a voucher package
1. Which inventory approach buys and produces goods only in response to actual sales?
   - Just-in-time (JIT)
   - Materials requirements planning (MRP)
   - Economic order quantity (EOQ)
   - Blanket purchase order
1. Which inventory approach schedules purchases based on forecasted sales?
   - Materials requirements planning (MRP)
   - Just-in-time (JIT)
   - Imprest fund
   - Evaluated receipt settlement (ERS)
1. A production supervisor asks purchasing to buy more steel. Which document does she prepare?
   - Purchase requisition
   - Purchase order
   - Receiving report
   - Disbursement voucher
1. Which document formally asks a supplier to deliver goods at a set price, and becomes a contract once accepted?
   - Purchase order
   - Purchase requisition
   - Sales quote
   - Receiving report
1. A purchasing agent accepts expensive gifts from a supplier and keeps ordering from them. What is this threat?
   - Kickbacks
   - Lapping
   - Evaluated receipt settlement
   - Stockouts
1. Which control is most likely to uncover a kickback scheme?
   - Job rotation and mandatory vacations for purchasing agents
   - Check protection machines
   - Bar codes on the receiving dock
   - Filing invoices by due date
1. Why are receiving clerks often not told the quantity ordered?
   - So they actually count the goods instead of copying the ordered amount
   - Because the quantity ordered is confidential
   - So they can reject all partial shipments
   - Because receiving prepares the purchase order
1. A truck arrives with goods, but there is no purchase order for them. What should receiving do?
   - Refuse the delivery
   - Accept the goods and create a purchase order afterward
   - Accept the goods and pay the driver
   - Accept the goods and record a back order
1. Goods arrive damaged and are returned to the supplier. Which document records the reduction in the amount owed?
   - Debit memo
   - Credit memo
   - Receiving report
   - Purchase requisition
1. Which documents are compared in a three-way match?
   - Purchase order, receiving report, and supplier invoice
   - Purchase requisition, sales quote, and purchase order
   - Sales order, picking ticket, and bill of lading
   - Check, remittance advice, and bank statement
1. The purchase order is for 50 cases at $30 each. The receiving report shows 45 cases. The invoice bills for 50 cases. How much does the company owe?
   - $1,350
   - $1,500
   - $150
   - $0
1. Which approach eliminates supplier invoices by paying based on the purchase order and receiving report?
   - Evaluated receipt settlement (ERS)
   - Voucher system
   - Nonvoucher system
   - Blanket purchase order
1. Why should access to the supplier master file be restricted?
   - Someone could add a fake supplier and approve payments to it
   - So suppliers cannot see each other's prices
   - It speeds up the three-way match
   - It is required to take early payment discounts
1. Which control best prevents paying the same invoice twice?
   - Pay only original invoices, and cancel supporting documents once paid
   - Use a blanket purchase order
   - Use check protection machines
   - Prepare a cash flow budget
1. Terms are 2/10, net 30 on a $10,000 invoice. How much is due if it is paid within 10 days?
   - $9,800
   - $10,000
   - $8,000
   - $9,980
1. A petty cash fund is set at $200. The vouchers in the box total $145. How much cash should be in the box?
   - $55
   - $145
   - $200
   - $345
