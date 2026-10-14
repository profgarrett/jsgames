# Computer Fraud and Abuse Techniques

You can't defend against an attack you've never heard of. This chapter (Chapter 9 in the textbook) is a field guide to the techniques criminals use against information systems. They fall into three groups: hacking (attacking the system), social engineering (attacking the people), and malware (harmful software). There are a lot of terms. Focus on recognizing which technique a scenario describes, and on what would stop it.

**Outcomes**
- Define key terms
- Describe the steps criminals use to attack an information system
- Identify common hacking techniques, including spoofing and code-based attacks
- Explain how social engineering is used to gain physical or logical access, and why people fall for it
- Describe the different types of malware
- Identify basic steps to protect yourself and an organization from these attacks

**Links**
- [Slides](ais09-fraud-techniques.pptx)

## How an attack happens

Many attacks follow the same six steps:

1. **Conduct reconnaissance.** Learn about the target from public sources: the website, LinkedIn, news articles.
1. **Attempt social engineering.** Trick an employee into giving out information or access.
1. **Scan and map the target.** Find out which computers, programs, and services are running.
1. **Research.** Look up known vulnerabilities in what they found.
1. **Execute the attack.**
1. **Cover tracks.** Delete logs and hide malware so the attack isn't discovered.

There are three broad types of attack:

| Type | Target | What it is |
|---|---|---|
| Hacking | The system | Unauthorized access, modification, or use of a computer system |
| Social engineering | The people | Tricks that get people to give up physical or logical access |
| Malware | The software | Any software used to do harm |

## Hacking

**Hacking** is unauthorized access, modification, or use of an electronic device or some element of a computer system.

### Taking over and overwhelming computers

| Technique | How it works |
|---|---|
| **Hijacking** | Gaining control of someone else's computer to carry out illicit activities, usually without the owner knowing |
| **Botnet** | A network of hijacked computers (**zombies**) controlled by a **bot herder** |
| **Denial-of-service (DoS) attack** | Flooding a website or server with so much traffic that legitimate users can't reach it; botnets make this easy |
| **Spamming** | Sending the same unsolicited message to many people at once |

### Getting passwords

| Technique | How it works |
|---|---|
| **Brute force attack** | Software tries combination after combination until it guesses the user ID and password |
| **Password cracking** | Stealing the file of passwords from a system and decrypting it |
| **Dictionary attack** | In the textbook, using software to guess email addresses and send them blank messages; ones that don't bounce are valid addresses for spam lists. In general security usage, it also means guessing passwords from a list of common words |

### Spoofing

**Spoofing** makes a communication look like it came from someone else, someone the victim trusts.

| Form | What is faked |
|---|---|
| **E-mail spoofing** | The sender's email address (an email that looks like it came from your bank) |
| **Caller ID spoofing** | The phone number on caller ID |
| **IP address spoofing** | The source address on network traffic, often to hide who is behind a DoS attack |
| **SMS spoofing** | The sender's name or number on a text message |
| **Web-page spoofing** | A whole website, built to look like the real one (also called phishing) |

### Exploiting software flaws

Software has **vulnerabilities**, flaws that attackers can exploit. A **zero-day attack** takes place between the time a vulnerability is discovered and the time the developer releases a **patch** to fix it. Once a patch is out, attackers study it to learn the flaw, so systems that aren't updated quickly become easy targets.

| Technique | How it works |
|---|---|
| **Cross-site scripting (XSS)** | Injecting malicious code into a vulnerable website, which then runs in visitors' browsers and collects their data |
| **Buffer overflow attack** | Sending more data than a program's input area (buffer) can hold; the overflow can crash the program or run the attacker's instructions |
| **SQL injection (insertion) attack** | Typing database commands (SQL) into a web form, such as a login box, so the database runs them and returns data it shouldn't |

For example, if a login form puts whatever you type straight into a query, typing `' OR '1'='1` as the password can make the condition always true, letting the attacker in without a password. The fix is to validate input and never paste user input directly into a query.

### Getting into networks and devices

| Technique | How it works |
|---|---|
| **Man-in-the-middle (MITM) attack** | Placing the attacker between a user and a system to intercept or change the traffic between them |
| **Masquerading/impersonation** | Pretending to be an authorized user to get into a system |
| **Piggybacking** | Using someone else's connection or access: tapping into a communications line, using a neighbor's Wi-Fi, or following an authorized person through a locked door |
| **War dialing** | Having a computer dial thousands of phone numbers, looking for modems connected to computers |
| **War driving** | Driving around looking for unprotected wireless networks |
| **Phreaking** | Attacking phone systems |
| **Podslurping** | Using a small storage device, such as a USB drive or phone, to copy data from a computer without authorization |

### Hacking for money

Some techniques aim directly at stealing or extorting money:

| Technique | How it works |
|---|---|
| **Salami technique** | Stealing tiny amounts from many accounts, so no one notices any single loss |
| **Round-down fraud** | Rounding down interest calculations and sending the fractions of a cent to the fraudster's account (a type of salami technique) |
| **Economic espionage** | Stealing information, trade secrets, and intellectual property |
| **Cyber-extortion** | Threatening to harm a company or person unless money is paid |

Others are fraud and abuse carried out online: **Internet misinformation**, **e-mail threats**, **Internet auction fraud**, **Internet pump-and-dump fraud** (hyping a stock online, then selling it), **cryptocurrency fraud**, **click fraud** (faking clicks on ads to inflate advertising bills), and **software piracy**. The Internet is also used for **cyber-bullying** and **sexting**.

## Social engineering

**Social engineering** uses tricks on people, rather than computers, to gain physical or logical access. It is often the easiest way in. Why crack a password when you can ask for it?

### Techniques

| Technique | How it works |
|---|---|
| **Identity theft** | Assuming someone's identity, usually for financial gain, using information such as their Social Security number |
| **Pretexting** | Using an invented scenario (the pretext) to get the victim to give out information ("Hi, this is IT. We're resetting passwords today...") |
| **Posing** | Setting up a legitimate-looking business, collecting customers' personal information, and never delivering the product |
| **Phishing** | Sending a message that appears to come from a legitimate company, asking the victim to click a link and enter sensitive information |
| **Vishing** | Voice phishing, by phone |
| **Carding** | Using stolen credit card numbers, including small test purchases to see whether a card still works |
| **Pharming** | Redirecting traffic for a real website to a fake one, even when the user types the correct address |
| **Evil twin** | A fake Wi-Fi network with the same name as a legitimate one, such as a coffee shop's |
| **Typosquatting/URL hijacking** | Registering websites with names close to real ones, to catch users' typos |
| **Scavenging/dumpster diving** | Searching trash for confidential information |
| **Shoulder surfing** | Watching someone enter a PIN or password, in person or with a camera |
| **Lebanese looping** | Jamming an ATM so it keeps the card, "helping" the victim to learn the PIN, then retrieving the card later |
| **Skimming** | Swiping a credit card through a hidden reader that copies its data |
| **Chipping** | Planting a chip in a card reader that records card data |
| **Eavesdropping** | Listening to private conversations or tapping into data transmissions |

Phishing has become much more convincing. Attackers use real logos, a sender name that looks right, and a domain one letter off (`instrcture.com` instead of `instructure.com`). Many now use AI-generated voices and video, as with the $25 million deepfake video call in Chapter 8.

### Why people fall for it

| Reason | How attackers use it |
|---|---|
| Compassion | People want to help ("my child is sick and I need...") |
| Greed | People want a good deal or something for free |
| Sex appeal | People are more cooperative with someone flirtatious or attractive |
| Sloth | People take shortcuts and don't verify |
| Trust | People cooperate once trust is gained |
| Urgency | People act without thinking when there seems to be an emergency ("your account will be closed in 24 hours") |
| Vanity | People respond to flattery |

### Reducing the threat

- Never let people follow you into restricted areas.
- Never log in for someone else.
- Never give sensitive information over the phone or by email.
- Never share passwords or user IDs.
- Be cautious of anyone you don't know who is trying to gain access through you.

A good habit is to verify through a second channel. If your "boss" emails asking for an urgent wire transfer, call them at the number you already have.

## Malware

**Malware** is any software used to do harm. It often arrives through social engineering, such as an email attachment or a USB drive left in a parking lot.

| Type | What it does |
|---|---|
| **Spyware** | Secretly monitors computer use and sends personal information to someone else |
| **Adware** | Spyware that shows pop-up ads and tracks browsing |
| **Torpedo software** | Destroys competing malware already on a computer |
| **Scareware** | Uses scare tactics ("Your computer is infected!") to sell useless or harmful software |
| **Ransomware** | Encrypts the victim's files or locks the system, and demands payment to unlock them |
| **Keylogger** | Records every keystroke, capturing passwords and credit card numbers |
| **Trojan horse** | Malicious instructions hidden inside a program that appears to work normally |
| **Time bomb/logic bomb** | Lies idle until a date or event triggers it, such as a programmer's name being removed from payroll |
| **Trap door/back door** | A way into a system that bypasses its normal controls |
| **Packet sniffers** | Capture data as it travels over a network |
| **Steganography program** | Hides data inside another file, such as an image or song |
| **Rootkit** | Hides files and processes from the operating system, often to conceal other malware |
| **Virus** | Self-replicating code that attaches to a file or program, and spreads when a person runs it |
| **Worm** | Like a virus, but a stand-alone program that spreads over networks by itself, without anyone running it |
| **Bluesnarfing** | Stealing contacts, photos, and other data from a phone using Bluetooth |
| **Bluebugging** | Taking control of a phone through Bluetooth to make calls or read texts |

The difference between a virus and a worm comes up often: a virus needs a person to run the infected file, while a worm spreads by itself.

## Protecting yourself

A few habits stop most of the attacks in this chapter:

- **Use long passphrases.** Length matters more than odd characters. Four random common words ("correct horse battery staple," from a well-known xkcd comic) are harder to brute-force than a short password like `Tr0ub4dor&3`, and easier to remember.
- **Never reuse passwords.** When one site is breached, attackers try the same email and password everywhere else. A password manager makes unique passwords practical.
- **Turn on multifactor authentication.** A stolen password alone is then not enough.
- **Update your software.** Patches close the vulnerabilities attackers exploit.
- **Back up your files.** Hard drives fail, and ransomware encrypts everything it can reach. Keep at least one backup that is off-site or offline, such as a cloud backup service, so a single disaster or attack can't destroy both copies.

## Key Terms

- **Adware**: Spyware that displays pop-up ads and collects information about the user's browsing.
- **Bluebugging**: Taking control of someone else's phone through Bluetooth to make or listen to calls and send or read texts.
- **Bluesnarfing**: Stealing contact lists, images, and other data from a phone using Bluetooth.
- **Bot herder**: The person who creates a botnet by installing software on computers that responds to the herder's instructions.
- **Botnet**: A network of hijacked computers (zombies) used to carry out attacks such as denial of service and spam.
- **Brute force attack**: A trial-and-error method that uses software to guess information such as user IDs and passwords.
- **Buffer overflow attack**: Sending more data than a program's input area can hold, so the excess overwrites memory and can run the attacker's instructions.
- **Caller ID spoofing**: Displaying a false number on the recipient's caller ID.
- **Carding**: Activities performed on stolen credit cards, such as small test purchases and buying or selling stolen card numbers.
- **Chipping**: Planting a small chip in a card reader that records card data.
- **Click fraud**: Manipulating the number of times an ad is clicked to inflate advertising bills.
- **Cross-site scripting (XSS)**: Injecting malicious code into a vulnerable website so it runs in visitors' browsers.
- **Cryptocurrency fraud**: Schemes that use cryptocurrency to defraud investors, such as fake coin offerings, exchanges, or wallets.
- **Cyber-bullying**: Using the Internet, phones, or other technology for deliberate, repeated, hostile behavior that torments, threatens, or embarrasses someone.
- **Cyber-extortion**: Threatening to harm a company or person if a specified amount of money is not paid.
- **Denial-of-service (DoS) attack**: An attack designed to make computer resources unavailable to their users, often by flooding a server with requests.
- **Dictionary attack**: Using software to guess email addresses and send them blank messages; unreturned messages are likely valid addresses for spam lists.
- **E-mail spoofing**: Making an email appear to come from someone other than the real sender.
- **E-mail threats**: Threatening messages that ask recipients to do something that makes it possible to defraud them.
- **Eavesdropping**: Listening to private communications or tapping into data transmissions.
- **Economic espionage**: Theft of information, trade secrets, and intellectual property.
- **Evil twin**: A wireless network with the same name as a legitimate access point, used to intercept users' traffic.
- **Hacking**: Unauthorized access, modification, or use of an electronic device or some element of a computer system.
- **Hijacking**: Gaining control of someone else's computer to carry out illicit activities, often without the owner's knowledge.
- **Identity theft**: Assuming someone's identity, usually for economic gain, by illegally obtaining confidential information such as a Social Security number.
- **Internet auction fraud**: Using an Internet auction site to defraud another person, such as by bidding up prices or not delivering goods.
- **Internet misinformation**: Using the Internet to spread false or misleading information.
- **Internet pump-and-dump fraud**: Using the Internet to drive up the price of a stock, then selling it.
- **IP address spoofing**: Creating network packets with a forged IP address to hide the sender's identity or impersonate another computer.
- **Keylogger**: Software that records a user's keystrokes.
- **Lebanese looping**: Inserting a sleeve into an ATM so it keeps the card, learning the victim's PIN while pretending to help, and retrieving the card later.
- **Malware**: Any software used to do harm.
- **Man-in-the-middle (MITM) attack**: Placing an attacker between a user and a system to intercept or change the communications between them.
- **Masquerading/impersonation**: Pretending to be an authorized user to gain access to a system.
- **Packet sniffers**: Programs that capture data from packets as they travel over a network.
- **Password cracking**: Penetrating a system's defenses, stealing the file of passwords, and decrypting them to gain access.
- **Patch**: Code released by a software developer to fix a particular vulnerability.
- **Pharming**: Redirecting website traffic to a spoofed website.
- **Phishing**: Sending a message that pretends to be from a legitimate company, asking the recipient to provide or verify sensitive information.
- **Phreaking**: Attacking phone systems.
- **Piggybacking**: Using someone else's access without permission, such as tapping a communications line, using a neighbor's Wi-Fi, or following an authorized person through a secure door.
- **Podslurping**: Using a small device with storage, such as a USB drive, to download data from a computer without authorization.
- **Posing**: Creating a seemingly legitimate business, collecting personal information while making a sale, and never delivering the product.
- **Pretexting**: Using an invented scenario to increase the chance that a victim will give out information or do something.
- **Ransomware**: Malware that encrypts the victim's files or locks the system and demands payment to unlock them.
- **Rootkit**: Software that hides files, processes, and network connections from the operating system, often to conceal other malware.
- **Round-down fraud**: Rounding down interest calculations and sending the fractions of a cent to an account the fraudster controls.
- **Salami technique**: Stealing tiny amounts of money from many accounts over time.
- **Scareware**: Malicious software of no benefit, sold using scare tactics.
- **Scavenging/dumpster diving**: Searching documents and records, including trash, to find confidential information.
- **Sexting**: Exchanging sexually explicit text messages and images.
- **Shoulder surfing**: Watching or listening to people as they enter or share confidential information, such as a PIN.
- **Skimming**: Swiping a credit card through a hidden reader that copies its data.
- **SMS spoofing**: Changing the name or number a text message appears to come from.
- **Social engineering**: Techniques or psychological tricks used to get people to give access to buildings, computers, or data.
- **Software piracy**: Unauthorized copying or distribution of copyrighted software.
- **Spamming**: Sending the same unsolicited message to many people at the same time.
- **Spoofing**: Making a communication look as if someone else sent it, to gain the recipient's trust.
- **Spyware**: Software that secretly monitors computer use, collects personal information, and sends it to someone else.
- **SQL injection (insertion) attack**: Entering malicious database (SQL) commands into an input field so the database runs them.
- **Steganography program**: A program that hides data inside another file, such as an image or sound file.
- **Time bomb/logic bomb**: A program that lies idle until a specified date or event triggers it.
- **Torpedo software**: Software that destroys competing malware.
- **Trap door/back door**: A way into a system that bypasses its normal controls.
- **Trojan horse**: Malicious instructions hidden in an authorized, properly functioning program.
- **Typosquatting/URL hijacking**: Setting up websites with names similar to real ones, so users who make typing errors reach the fake site.
- **Virus**: Self-replicating code that attaches to a file or program and spreads when a person runs it.
- **Vishing**: Voice phishing; phishing by phone.
- **Vulnerabilities**: Flaws in programs that can be exploited to gain access to or damage a system.
- **War dialing**: Programming a computer to dial thousands of phone numbers, looking for modems connected to computers.
- **War driving**: Driving around looking for unprotected wireless networks.
- **Web-page spoofing**: Creating a fake website that looks like a real one, usually to collect login or financial information; also called phishing.
- **Worm**: A stand-alone program, similar to a virus, that copies and spreads itself over networks without human action.
- **Zero-day attack**: An attack between the time a software vulnerability is discovered and the time a patch is released.
- **Zombies**: Hijacked computers, usually part of a botnet, used to carry out attacks.

## Practice Questions

1. Which describes the difference between hacking and social engineering?
   - Hacking attacks the system; social engineering attacks the people
   - Hacking is legal; social engineering is not
   - Hacking requires malware; social engineering does not use computers
   - There is no difference
1. Thousands of hijacked computers send requests to a company's website at the same time, so customers cannot reach it. What is this?
   - A denial-of-service attack using a botnet
   - A man-in-the-middle attack
   - Pharming
   - A zero-day attack
1. Software tries millions of password combinations until it finds one that works. What is this?
   - Brute force attack
   - Phishing
   - Pretexting
   - Skimming
1. An email appears to come from your bank and asks you to click a link and confirm your account number. What is this?
   - Phishing
   - Vishing
   - Bluesnarfing
   - War driving
1. A caller claims to be from the IT help desk and says they need your password to finish a system upgrade. What technique is this?
   - Pretexting
   - Typosquatting
   - Salami technique
   - Packet sniffing
1. An attacker types database commands into a website's login box to get the database to return customer records. What is this?
   - SQL injection attack
   - Buffer overflow attack
   - Cross-site scripting
   - Dictionary attack
1. Attackers exploit a software flaw before the vendor has released a patch for it. What is this?
   - Zero-day attack
   - Trap door
   - Round-down fraud
   - Evil twin
1. A programmer writes code that sends the fractions of a cent from interest calculations to her own account. What is this?
   - Round-down fraud
   - Click fraud
   - Pump-and-dump fraud
   - Lebanese looping
1. A user mistypes a bank's web address and lands on a look-alike site that collects her password. What is this?
   - Typosquatting/URL hijacking
   - Spamming
   - Hijacking
   - Chipping
1. At a coffee shop, a customer connects to a Wi-Fi network with the same name as the shop's real network. The attacker reads all of her traffic. What is this?
   - Evil twin
   - War dialing
   - Phreaking
   - Torpedo software
1. Someone watches over a customer's shoulder at an ATM as she enters her PIN. What is this?
   - Shoulder surfing
   - Scavenging
   - Skimming
   - Eavesdropping
1. A thief installs a hidden card reader on a gas pump that copies the data from every card swiped. What is this?
   - Skimming
   - Carding
   - Posing
   - Pharming
1. An email says, "Your account will be closed in 24 hours unless you verify your information now." Which reason for falling victim does it exploit?
   - Urgency
   - Vanity
   - Compassion
   - Sloth
1. Malware encrypts all of a company's files and demands payment in cryptocurrency to unlock them. What is this?
   - Ransomware
   - Adware
   - Rootkit
   - Packet sniffer
1. A disgruntled programmer writes code that will delete the payroll files if his name is ever removed from the payroll. What is this?
   - Logic bomb
   - Trojan horse
   - Worm
   - Keylogger
1. What is the main difference between a virus and a worm?
   - A worm spreads by itself over networks; a virus needs a person to run the infected file
   - A virus spreads by itself; a worm needs a person to run it
   - A worm only infects phones
   - A virus cannot damage files
1. A free game works as advertised, but it also secretly installs a program that sends the user's files to an attacker. What is this?
   - Trojan horse
   - Worm
   - Scareware
   - Torpedo software
1. Software secretly records every key a user types, including passwords. What is this?
   - Keylogger
   - Steganography program
   - Spamming
   - Bluebugging
1. Which is the best defense against an urgent email from your "CEO" asking you to wire money to a new vendor?
   - Verify the request through a second channel, such as calling the CEO at a known number
   - Reply to the email asking if it is real
   - Wire the money quickly, since it is urgent
   - Forward the email to the vendor
1. Why is a long passphrase of four random words often stronger than a short password with symbols?
   - Length makes brute force attacks take far longer
   - Symbols are not allowed in most passwords
   - Passphrases are stored without encryption
   - Short passwords cannot be cracked
