# Confidentiality and Privacy Controls

Security (Chapter 11) is the foundation. This chapter (Chapter 12 in the textbook) covers two of the pillars that rest on it: protecting the confidentiality of the organization's sensitive information, and protecting the privacy of personal information about customers, employees, and suppliers. Along the way, we cover the tools that make both possible: encryption, hashing, digital signatures, and blockchain.

**Outcomes**
- Define key terms
- Distinguish confidentiality from privacy
- Describe controls that protect confidential and private information
- Describe the major privacy regulations and the Generally Accepted Privacy Principles (GAPP)
- Explain how symmetric and asymmetric encryption work
- Explain the difference between encryption and hashing
- Explain how a digital signature is created and why it is legally binding
- Explain how blockchain uses hashing to create a reliable record

**Links**
- [Slides](ais12-privacy.pptx)

## Confidentiality vs. privacy

| | Confidentiality | Privacy |
|---|---|---|
| Protects | The organization's sensitive information | Personal information about people |
| Examples | Strategic plans, trade secrets, cost data, legal documents | Customer names and addresses, Social Security numbers, credit card numbers, employee health records |
| Main driver | Competitive advantage | Laws and customer trust |

The controls are mostly the same for both.

## Protecting confidentiality and privacy

There are four steps:

1. **Identify and classify the information to be protected.** Find out where sensitive information is stored and who has access to it. Then classify it by value, such as public, internal, confidential, and restricted. You can't protect what you don't know you have.
1. **Protect it with encryption.** Encrypt information while it is stored and while it is being sent. Encryption cannot protect information while it is being used, since it must be decrypted to be processed. That's why encryption alone is not enough.
1. **Control access to it.** Authentication and authorization (Chapter 11), plus the tools below.
1. **Train employees.** Employees need to know what information is sensitive and how to handle it, such as not emailing customer lists to personal accounts.

### Tools for controlling access

| Tool | What it does | Type |
|---|---|---|
| **Information rights management (IRM)** | Controls not just who can open a file, but what they can do with it (read, copy, print, forward), even after it leaves the company | Preventive |
| **Data loss prevention (DLP)** | Works like antivirus in reverse: scans outgoing email and files and blocks ones containing sensitive information, such as credit card numbers | Preventive |
| **Digital watermark** | Hidden code embedded in a document that identifies it, so if it leaks, the company can tell where it came from | Detective |
| **Data masking** | Replaces sensitive data with realistic fake values, such as when giving programmers test data | Preventive |
| **Tokenization** | Replaces sensitive data with a random substitute (token); the real value is stored in a secure vault, so only authorized systems can look it up | Preventive |

Data masking and tokenization both mean a system that doesn't need the real Social Security number never has it. If that system is breached, there is nothing useful to steal.

Don't forget disposal. Shred paper, and wipe or destroy hard drives before discarding them. Deleting a file does not erase it.

## Privacy

### Privacy concerns

**Identity theft** is assuming someone's identity, usually to open accounts or make purchases in their name. Companies hold exactly the information identity thieves want, so a breach can harm thousands of customers at once. Stolen personal data is cheap on the dark web; a Social Security number can sell for a few dollars, and a full identity package (name, SSN, birth date) for more. Companies that collect personal information have a duty to protect it.

Websites track visitors with **cookies**, small text files a website stores on the visitor's computer to remember what they did on the site. Cookies make shopping carts and logins work, but they can also track people across sites, which raises privacy concerns.

### Privacy regulations

| Regulation | Applies to |
|---|---|
| **EU General Data Protection Regulation (GDPR)** | Any organization handling personal data of people in the EU, wherever the organization is located. Fines can reach 4% of global annual revenue (or €20 million, if higher) for failing to get proper consent or protect data. |
| **California Consumer Privacy Act (CCPA)** | Businesses handling personal information of California residents; gives consumers the right to know, delete, and opt out of the sale of their data |
| **Health Insurance Portability and Accountability Act (HIPAA)** | Protected health information held by health care providers, insurers, and their business associates |
| **Health Information Technology for Economic and Clinical Health Act (HITECH)** | Strengthens HIPAA, including breach notification requirements |
| **Financial Services Modernization Act** (Gramm-Leach-Bliley) | Financial institutions; requires them to protect customer information and explain their privacy practices |

### Generally Accepted Privacy Principles (GAPP)

The **Generally Accepted Privacy Principles (GAPP)**, developed by the AICPA and CPA Canada, are ten best practices for protecting privacy. Following them helps an organization comply with laws like GDPR. (In 2020, the AICPA replaced GAPP with an updated Privacy Management Framework built on the same ideas, but the textbook uses GAPP.)

| Principle | What it means |
|---|---|
| 1. Management | Assign responsibility and accountability for privacy policies and procedures |
| 2. Notice | Tell people about privacy policies and practices before collecting their data |
| 3. Choice and consent | Let people choose whether their data is collected and used |
| 4. Collection | Collect only the information that is needed |
| 5. Use, retention, and disposal | Use information only for its stated purpose; securely dispose of it when no longer needed |
| 6. Access | Let people review, correct, or delete the information collected about them |
| 7. Disclosure to third parties | Share information only for the stated purposes and with the person's consent |
| 8. Security | Protect personal information from loss and unauthorized access |
| 9. Quality | Keep personal information accurate and complete |
| 10. Monitoring and enforcement | Monitor compliance and have procedures for responding to complaints |

Choice and consent comes in two forms:

- With **opt-out**, the organization collects and uses information unless the person objects. A pre-checked "Send me offers" box is opt-out.
- With **opt-in**, the organization needs explicit permission before collecting or using information. GDPR requires opt-in when an organization relies on consent to use personal data.

## Encryption

**Encryption** transforms readable **plaintext** into unreadable **ciphertext** using an algorithm and a key. **Decryption** reverses the process. Encryption is a preventive control.

> Plaintext + key → encryption algorithm → ciphertext → decryption algorithm + key → plaintext

Three factors determine how strong encryption is:

1. **Key length.** Longer keys are stronger. Each added bit doubles the number of possible keys; a 256-bit key has 2^256 possible values, far too many to guess.
1. **Algorithm.** Use well-tested, published algorithms, such as AES, rather than homemade ones.
1. **Key management policies.** This is usually where encryption fails. If the key is stored on the same server as the encrypted data, a hacker who gets the server gets both. Keys should be stored securely, and copies kept in **key escrow** (stored safely elsewhere) so data can still be decrypted if a key is lost or an employee leaves.

### Symmetric and asymmetric encryption

| | Symmetric | Asymmetric |
|---|---|---|
| Keys | One shared key, used to encrypt and decrypt | Two keys: a **public key** (shared with everyone) and a **private key** (kept secret) |
| How it works | Sender and receiver both know the key | What one key encrypts, only the other can decrypt |
| Speed | Fast | Much slower |
| Main problem | Securely sharing the key; need a different key for each partner | Speed |
| Example | AES | RSA |
| Can create digital signatures? | No | Yes |

When you buy something online, your browser encrypts your credit card number with the store's public key. Anyone can have that key, but only the store's private key can decrypt the message. In practice, the two are combined: asymmetric encryption is used to safely exchange a symmetric key, and the faster symmetric key encrypts the rest of the session.

A **virtual private network (VPN)** uses encryption and authentication to create a secure "tunnel" over the Internet. Employees working from home can reach company systems as if they were in the office, and anyone intercepting the traffic sees only ciphertext.

## Hashing

**Hashing** transforms plaintext of any length into a short, fixed-length code called a **hash** (or message digest). Even a tiny change to the input produces a completely different hash:

| Input | SHA-256 hash (first 16 characters) |
|---|---|
| hello | 2cf24dba5fb0a30e... |
| Hello | 185f8db32271fe25... |
| This is a contract for $1,000. | cd6bb2ed3075d33c... |
| This is a contract for $9,000. | 3962dd904a35c4f0... |

| | Hashing | Encryption |
|---|---|---|
| Output size | Always the same, whatever the input size (SHA-256 is always 256 bits) | About the same size as the input |
| Reversible? | No; it is one-way. You can't "unhash" a hash | Yes; ciphertext can be decrypted back to plaintext |
| Used for | Checking integrity (has anything changed?) | Keeping information secret |

Hashing has two important uses:

- **Checking integrity.** If two copies of a document have the same hash, they are identical. If anyone changes a single character, the hash won't match.
- **Storing passwords.** A well-designed system never stores your password. It stores the hash. When you log in, it hashes what you typed and compares it to the stored hash. If the password file is stolen, the thief gets hashes, not passwords. (Attackers can still try hashing common passwords to find matches, which is another reason to use long passphrases.)

## Digital signatures

A **digital signature** makes an electronic document legally binding. Creating one takes two steps:

1. The document's creator hashes the document.
1. The creator encrypts that hash with their **private key**. The encrypted hash is the digital signature.

To verify it, the recipient:

1. Decrypts the signature using the creator's **public key**, which gives the original hash.
1. Hashes the document they received.
1. Compares the two hashes.

If they match, the recipient knows two things: the document hasn't been changed (since the hashes match), and it came from the creator (since only the creator's private key could have produced a signature their public key decrypts). This provides **nonrepudiation**: the creator can't later deny signing it.

How does the recipient know a public key really belongs to the creator? A **digital certificate**, issued by a trusted **certificate authority**, ties a public key to its owner's identity, much like a driver's license ties a photo to a name. The whole system of issuing key pairs and certificates is called a **public key infrastructure (PKI)**. The padlock in your browser's address bar means the website presented a valid certificate.

## Blockchain

A **blockchain** is a distributed ledger of hashed documents, with identical copies stored on many computers. It was created for Bitcoin, to keep people from spending the same coin twice, but it can provide a reliable audit trail for any business process. Adding a block takes three steps:

1. **Create a root hash for a block of documents.** Each document is hashed. Pairs of hashes are combined and hashed again, repeatedly, until a single root hash represents every document in the block.
1. **Validate the block.** The new block's root hash is combined with the root hash of the last block in the chain and a **nonce** (a random number). Computers try nonce after nonce until the resulting hash starts with a required number of zeros. This trial-and-error process is called mining.
1. **Append the block to the chain** on every computer in the network.

Because each block includes the previous block's hash, changing any document changes its hash, which changes the block's root hash, which breaks every block after it. The change also wouldn't match the copies on all the other computers. This makes the record tamper-evident: altering history would require redoing the work for every later block on most of the network's computers.

## Worked example: protecting taxpayer privacy

A state tax department is building a system that accepts returns online and by mail, processes them centrally, and lets taxpayers check their status by phone, in person, or on a website using their Social Security number. What could go wrong, and what controls help?

| Problem | Controls |
|---|---|
| Employees accessing paper returns without authorization | Restrict physical access to the mail and scanning room with ID badges or biometrics; log everyone who enters |
| Employees accessing electronic files without authorization | Multifactor authentication; access limited by role |
| Tax data intercepted when filed online | Encrypt all traffic to and from the website |
| Employees browsing returns by name or demographics instead of for work | Training; access controls; logging and reviewing who views which returns |
| Unauthorized access to taxpayer information on the website | Strong authentication using something other than the SSN (which many people know), preferably multifactor; encrypt stored data |
| Information released over the phone to the wrong person | Train staff to properly authenticate callers |
| Information exposed through improper disposal | Shred paper; wipe or destroy storage media before disposal |

## Key Terms

- **Asymmetric encryption systems**: Encryption systems that use two keys, a public key and a private key; what one key encrypts, only the other can decrypt.
- **Blockchain**: A distributed ledger of hashed documents with identical copies stored on multiple computers.
- **Certificate authority**: A trusted organization that issues public and private keys and records the public key in a digital certificate.
- **Ciphertext**: Plaintext that has been transformed into unreadable text by encryption.
- **Cookie**: A small text file a website stores on a visitor's computer to record what the visitor did on the site.
- **Data loss prevention (DLP)**: Software that blocks outgoing messages and files containing sensitive information.
- **Data masking**: Replacing sensitive data with realistic but fake values.
- **Decryption**: Transforming ciphertext back into plaintext.
- **Digital certificate**: An electronic document that certifies the identity of the owner of a public key and contains that public key.
- **Digital signature**: A hash of a document, encrypted with the creator's private key.
- **Digital watermark**: Code embedded in a document that lets an organization identify confidential information that has been disclosed.
- **Encryption**: Transforming plaintext into unreadable ciphertext.
- **Generally Accepted Privacy Principles (GAPP)**: Ten AICPA and CPA Canada best practices for protecting the privacy of personal information.
- **Hash**: The short, fixed-length code produced by hashing.
- **Hashing**: Transforming plaintext of any length into a short, fixed-length code; it cannot be reversed.
- **Identity theft**: Assuming someone's identity, usually for economic gain, by illegally obtaining their personal information.
- **Information rights management (IRM)**: Software that controls not only who can access a file but what they can do with it, such as read, copy, or print.
- **Key escrow**: Storing copies of encryption keys securely in another location.
- **Nonce**: A random number used in blockchain mining to generate a hash with the required number of leading zeros.
- **Nonrepudiation**: Creating legally binding agreements that neither party can deny.
- **Opt-in**: An approach requiring explicit consent before personal information is collected or used.
- **Opt-out**: An approach in which personal information is collected and used unless the person explicitly objects.
- **Plaintext**: Normal, readable text before encryption.
- **Private key**: In asymmetric encryption, the key kept secret and known only to its owner.
- **Public key**: In asymmetric encryption, the key that is widely distributed and available to everyone.
- **Public key infrastructure (PKI)**: The system for issuing pairs of public and private keys and their digital certificates.
- **Symmetric encryption systems**: Encryption systems that use the same key to encrypt and decrypt.
- **Tokenization**: Replacing sensitive data with a random substitute, with the real value stored securely so authorized systems can retrieve it.
- **Virtual private network (VPN)**: Using encryption and authentication to securely send information over the Internet, as if over a private network.

## Practice Questions

1. What is the difference between confidentiality and privacy?
   - Confidentiality protects the organization's sensitive information; privacy protects personal information about people
   - Confidentiality protects personal information; privacy protects trade secrets
   - Confidentiality applies only to paper records; privacy applies only to electronic records
   - They are two names for the same thing
1. What is the first step in protecting confidential information?
   - Identify where the information is and classify its value
   - Encrypt everything
   - Train employees
   - Buy data loss prevention software
1. Why can't encryption alone protect sensitive information?
   - Data must be decrypted while it is being used
   - Encryption cannot be used for stored data
   - Encryption makes data larger
   - Encryption is illegal for personal data
1. Software scans outgoing email and blocks any message containing a credit card number. What is this?
   - Data loss prevention (DLP)
   - Information rights management (IRM)
   - Digital watermark
   - Key escrow
1. A company wants to let a consultant read a report but prevent her from printing or forwarding it. What should it use?
   - Information rights management (IRM)
   - Data loss prevention (DLP)
   - Data masking
   - Hashing
1. A confidential document leaks to a competitor, and the company identifies which copy it was by a hidden code embedded in it. What control is this?
   - Digital watermark
   - Data masking
   - Tokenization
   - Digital certificate
1. Programmers are given a copy of the customer database with real names and SSNs replaced by realistic fake values. What is this?
   - Data masking
   - Encryption
   - Hashing
   - Key escrow
1. A website pre-checks a box saying "Share my information with partners," and the user must uncheck it to say no. What approach is this?
   - Opt-out
   - Opt-in
   - Nonrepudiation
   - Notice
1. Which Generally Accepted Privacy Principle says an organization should collect only the information it needs?
   - Collection
   - Notice
   - Access
   - Quality
1. A customer asks a company to show her the information it has collected about her and correct an error. Which GAPP principle applies?
   - Access
   - Choice and consent
   - Disclosure to third parties
   - Management
1. Which regulation can fine companies up to 4% of global annual revenue for privacy violations?
   - EU General Data Protection Regulation (GDPR)
   - HIPAA
   - Sarbanes-Oxley Act
   - Foreign Corrupt Practices Act
1. Which factor most often causes encryption to fail in practice?
   - Poor key management, such as storing the key on the same server as the data
   - Keys that are too long
   - Using a published algorithm
   - Encrypting data in transit
1. In symmetric encryption:
   - The same key is used to encrypt and decrypt
   - A public key encrypts and a private key decrypts
   - No key is needed
   - The output cannot be decrypted
1. A customer encrypts her credit card number with an online store's public key. Who can decrypt it?
   - Only the store, using its private key
   - Anyone with the store's public key
   - Only the customer
   - Anyone, since public keys are public
1. What is the main disadvantage of symmetric encryption?
   - The shared key must be exchanged securely, and each partner needs a different key
   - It is much slower than asymmetric encryption
   - It cannot encrypt large files
   - It cannot be decrypted
1. Which is true of hashing but NOT of encryption?
   - It is one-way and cannot be reversed
   - It requires a key
   - Its output is about the same size as its input
   - It keeps information secret
1. Why do well-designed systems store the hash of a password instead of the password itself?
   - If the password file is stolen, the thief gets hashes instead of passwords
   - Hashes are easier for users to remember
   - Hashes can be decrypted when the user forgets the password
   - Hashing makes the password longer
1. How is a digital signature created?
   - The creator hashes the document, then encrypts the hash with their private key
   - The creator encrypts the document with the recipient's public key
   - The creator types their name at the bottom of an email
   - The creator hashes the document, then encrypts the hash with their public key
1. A buyer signs a purchase contract with a digital signature, then later claims she never agreed to it. What property of digital signatures prevents this?
   - Nonrepudiation
   - Data masking
   - Opt-in consent
   - Key escrow
1. What does a digital certificate do?
   - Ties a public key to the identity of its owner
   - Stores a backup copy of a private key
   - Encrypts data in transit
   - Blocks outgoing emails with sensitive data
1. Why is it so difficult to alter a record in a blockchain?
   - Changing a document changes its hash, which breaks every later block and won't match other computers' copies
   - Blockchains are stored on a single secure server
   - Blockchain documents are encrypted with symmetric keys
   - Blockchains do not use hashing
1. In blockchain mining, what is the nonce?
   - A random number tried repeatedly to produce a hash with the required number of leading zeros
   - The private key of the miner
   - The first document in the chain
   - The root hash of the previous block
