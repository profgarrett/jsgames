# Controls for Information Security

Chapter 10 introduced internal control in general. This chapter (Chapter 11 in the textbook) focuses on security, the foundation of a reliable system. We look at the Trust Services Framework, why people are the weakest link, and the controls organizations use to prevent, detect, and respond to attacks.

**Outcomes**
- Define key terms
- Explain how security supports the other four principles of the Trust Services Framework
- Explain why security is a management issue, how people affect security, and the time-based model of security
- Describe preventive controls: physical security, user access controls, and IT solutions
- Describe controls used to detect attacks
- Explain how organizations respond to attacks and keep their security current
- Explain how virtualization, cloud computing, and the Internet of Things affect security

**Links**
- [Slides](ais11-security.pptx)

## The Trust Services Framework

The **Trust Services Framework**, developed by the AICPA and CPA Canada, organizes IT controls into five principles that together make a system reliable:

| Principle | Means | Chapter |
|---|---|---|
| Security | Access to the system and its data is restricted to legitimate users | 11 |
| Confidentiality | Sensitive organizational information is protected from unauthorized disclosure | 12 |
| Privacy | Personal information about customers, employees, and others is collected, used, and disclosed properly | 12 |
| Processing integrity | Data is processed accurately, completely, on time, and only with authorization | 13 |
| Availability | The system and its information are available when needed | 13 |

Think of it as a house. Security is the foundation, and the other four are pillars that rest on it. Without security, you can't keep data confidential, protect privacy, stop unauthorized changes, or keep attackers from taking the system down.

## Three fundamental concepts

### 1. Security is a management issue

Security is not just an IT problem. Senior management must be involved and supportive throughout the security life cycle: assessing threats, developing policies, implementing them, and monitoring performance.

### 2. People are the critical factor

People can be the weakest link or the strongest defense. Phishing works because it attacks people, not technology. It is also cheap: a convincing fake login page can be built in minutes, and a sender domain one letter off (`instrcture.com` instead of `instructure.com`) is easy to miss. Training employees to spot phishing, and creating a culture where they report it, is one of the most effective controls available.

### 3. The time-based model of security

No preventive control is perfect, so the goal is to detect and respond to an attack before it succeeds. The **time-based model of information security** expresses this as:

> P > D + R

- P = the time it takes an attacker to break through preventive controls
- D = the time it takes to detect that an attack is happening
- R = the time it takes to respond and stop the attack

If preventive controls hold for 10 minutes, but it takes 4 minutes to detect the attack and 8 minutes to respond, then P (10) < D + R (12), and the attacker gets through. The company can strengthen prevention, speed up detection, or speed up response.

The model leads to **defense-in-depth**: using multiple layers of controls so that no single failure lets an attacker in. A thief who gets past the locked front door still has to get past the badge reader, the password, and the encrypted files.

## Preventive controls

Preventive controls fall into three groups: physical security, process (user access controls), and IT solutions.

### Physical security

If an attacker can walk up to a server, most other controls don't matter. Physical access controls:

- Limit entry to the building (one main entrance, a receptionist, badges, cameras)
- Restrict access to rooms with network equipment and servers (locked server rooms, logged entry)
- Restrict access to workstations, printers, and network jacks

### User access controls

User access controls answer two questions.

**Authentication** asks: are you who you say you are? There are three types of credentials:

| Type | Examples |
|---|---|
| Something you know | Password, PIN, answer to a security question |
| Something you have | Smart card, ID badge, phone app or security token that generates a code |
| Something you are | Fingerprint, face, voice (a **biometric identifier**) |

- **Multifactor authentication** uses two or more *different types*, such as a password plus a code from your phone. It is much stronger than any one type alone.
- **Multimodal authentication** uses several credentials of the *same type*, such as a password plus a security question. It is better than one password, but it is not multifactor; both can be stolen the same way.

**Authorization** asks: now that we know who you are, what can you do? An **access control matrix** lists what each user can access and what they can do with it:

| Username | Accounting file share | Production file share | QuickBooks |
|---|---|---|---|
| Bob | Yes | Yes | No |
| Sarah | Read only | No | Yes |
| Tim | No | Yes | No |

Each time a user requests something, the system runs a **compatibility test**, checking the matrix to decide whether to allow it. Users should get the least access needed to do their jobs.

### IT solutions

#### Antimalware controls

Antimalware software, plus policies such as scanning files and not plugging in unknown USB drives.

#### Network access controls

Traffic between the Internet and the company's network passes through several layers:

- A **border router** connects the organization's network to the Internet.
- A **firewall** filters traffic between the internal network and the outside.
- A **demilitarized zone (DMZ)** is a separate network, between the Internet and the internal network, for systems the public needs to reach, such as the company's web and email servers. If an attacker takes over the web server, they still have to get through the main firewall to reach internal systems.
- Internal firewalls can separate departments, such as payroll from sales.

Data travels in **packets**, each with a header listing its source and destination. **Routers** read the destination to decide where to send each packet next. Firewalls and routers use **access control lists (ACLs)**, sets of IF-THEN rules that decide what to do with each packet. Two ways of examining packets:

| Method | What it examines | Analogy |
|---|---|---|
| **Packet filtering** | Only the header (source and destination) | Reading the address on an envelope |
| **Deep packet inspection** | The contents of the packet too | Opening the envelope |

An **intrusion prevention system (IPS)** goes further, watching traffic patterns and automatically blocking attacks as they happen.

#### Device and software hardening

**Endpoints** are all the devices on the network: workstations, laptops, servers, and printers. (Many office printers store a copy of every document they print or scan, so they need protection too.) Controls include:

- **Hardening** changes default settings and turns off unneeded programs and services, so there are fewer ways in.
- **Vulnerability scanners** are automated tools that check systems for known weaknesses.
- **Patch management** means regularly applying **patches** that fix vulnerabilities before attackers can use an **exploit** (code that takes advantage of a vulnerability).

Many successful attacks use vulnerabilities that already had a patch available. Updating your software is one of the cheapest and most effective controls there is.

#### Encryption

Encryption makes data unreadable to anyone without the key. It is the last line of defense: if everything else fails and data is stolen, encrypted data is useless to the thief. Chapter 12 covers how it works.

## Detecting attacks

| Control | What it does |
|---|---|
| **Log analysis** | Examining logs of who accessed what, and when, for evidence of attacks (such as repeated failed logins at 3 a.m.) |
| **Intrusion detection system (IDS)** | Logs the network traffic that got past the firewall, and analyzes it for signs of attempted or successful intrusions |
| **Honeypot** | A decoy system with fake "confidential" data. No legitimate user should ever touch it, so anyone who does is an early warning |
| Continuous monitoring | Checking employee compliance with security policies and the overall performance of business processes |

An IDS detects and alerts; an IPS detects and blocks.

## Responding to attacks

A **computer incident response team (CIRT)** handles major security incidents. It should include technical staff and senior management, since some decisions (such as shutting down an e-commerce site) are business decisions. Response has four steps:

1. Recognize that a problem exists
1. Contain the problem
1. Recover (repair damage, restore from backups)
1. Follow up (analyze how it happened and change controls to prevent it next time)

Response should be planned in advance. If it takes 30 minutes after an attack is discovered just to figure out whom to call, the R in P > D + R gets too long.

A **chief information security officer (CISO)**, independent of other IT functions, is responsible for security across the organization and reports to senior management.

## Monitoring and revising security

Security is never finished. Two controls keep it current:

- A **penetration test** is an authorized attempt, by an internal audit team or an outside firm, to break into the organization's system. Testers try everything a real attacker would, including social engineering.
- **Change control and change management** is the formal process for making sure changes to hardware, software, or processes don't reduce reliability. Changes should be requested in writing, approved, tested in a separate environment (not on the live system), documented, and reviewed. Emergency changes still need to be documented and approved after the fact.

## Virtualization, cloud computing, and the Internet of Things

**Virtualization** runs many virtual computers on one physical machine. **Cloud computing** uses a provider's computing resources over the Internet. Both cut both ways:

- **Positive:** a cloud provider can afford better security than most small companies, and strong access controls in one place protect every system.
- **Negative:** the company outsources control of its data, so reliability depends on the provider. Physical access to one host machine exposes every virtual machine on it.

The **Internet of Things (IoT)** embeds sensors and network connections in everyday devices: thermostats, cameras, light bulbs, manufacturing equipment. Each one is another endpoint, and another possible way into the network. Researchers have shown that even smart light bulbs can be hacked. IoT devices need the same hardening, patching, and access controls as computers.

## Key Terms

- **Access control lists (ACLs)**: Sets of IF-THEN rules used to decide what to do with arriving packets.
- **Access control matrix**: A table specifying which parts of the system each user can access and what actions they can perform.
- **Authentication**: Verifying the identity of the person or device trying to access the system.
- **Authorization**: Restricting authenticated users to specific parts of the system and the actions they are allowed to perform.
- **Biometric identifier**: A physical or behavioral characteristic, such as a fingerprint, used as an authentication credential.
- **Border router**: A device that connects an organization's network to the Internet.
- **Compatibility test**: Matching a user's credentials against the access control matrix to decide whether to allow the requested access and action.
- **Computer incident response team (CIRT)**: A team responsible for dealing with major security incidents.
- **Deep packet inspection**: Examining the data in the body of a packet, not just its header.
- **Defense-in-depth**: Using multiple layers of controls to avoid a single point of failure.
- **Demilitarized zone (DMZ)**: A separate network outside the internal network that allows controlled access from the Internet to selected resources, such as a web server.
- **Endpoints**: The workstations, servers, printers, and other devices that make up an organization's network.
- **Exploit**: Software code that takes advantage of a vulnerability.
- **Firewall**: Hardware or software that filters traffic between an internal network and outside networks.
- **Hardening**: Changing the default configuration of endpoints to eliminate unnecessary settings and services.
- **Honeypot**: A decoy system that provides early warning that someone is searching for confidential information.
- **Intrusion detection system (IDS)**: A system that logs network traffic that got past the firewall and analyzes it for signs of attempted or successful intrusions.
- **Intrusion prevention system (IPS)**: Software or hardware that monitors traffic patterns to identify and automatically block attacks.
- **Log analysis**: Examining logs to identify evidence of possible attacks.
- **Multifactor authentication**: Using two or more types of authentication credentials (something you know, have, or are).
- **Multimodal authentication**: Using multiple authentication credentials of the same type, such as a password and a security question.
- **Packet filtering**: Screening individual packets based only on the source and destination information in the packet header.
- **Patch**: Code released by a software developer to fix a particular vulnerability.
- **Patch management**: Regularly applying patches and updates to software.
- **Penetration test**: An authorized attempt to break into an organization's information system.
- **Routers**: Devices that read the destination address of each packet to decide where to send it next.
- **Time-based model of information security**: A model stating that security is effective if the time it takes to break through preventive controls is greater than the time to detect and respond to an attack (P > D + R).
- **Trust Services Framework**: An AICPA framework that organizes IT controls into five principles of system reliability: security, confidentiality, privacy, processing integrity, and availability.
- **Vulnerability scanners**: Automated tools that check whether a system has well-known vulnerabilities.

## Practice Questions

1. Which Trust Services principle is the foundation for the other four?
   - Security
   - Confidentiality
   - Privacy
   - Availability
1. Which Trust Services principle means data is processed accurately, completely, and only with proper authorization?
   - Processing integrity
   - Availability
   - Confidentiality
   - Security
1. Preventive controls can delay an attacker for 10 minutes. It takes 6 minutes to detect an attack and 7 minutes to respond. According to the time-based model, is the system secure?
   - No, because detection plus response (13 minutes) is longer than prevention (10 minutes)
   - Yes, because prevention (10 minutes) is longer than detection alone (6 minutes)
   - Yes, because any system with preventive controls is secure
   - It cannot be determined
1. Using multiple layers of controls so that no single failure lets an attacker in is called:
   - Defense-in-depth
   - Hardening
   - Packet filtering
   - Multimodal authentication
1. Which is an example of multifactor authentication?
   - A password plus a code sent to the user's phone
   - A password plus a security question
   - Two different passwords
   - A user ID plus a password
1. A system requires a password and the answer to a security question. What is this?
   - Multimodal authentication
   - Multifactor authentication
   - Biometric authentication
   - Authorization
1. A salesperson logs into the payroll system by guessing the payroll supervisor's password. Which control would best prevent this?
   - Multifactor authentication
   - A honeypot
   - Log analysis
   - Packet filtering
1. What is the difference between authentication and authorization?
   - Authentication verifies who you are; authorization determines what you can do
   - Authentication determines what you can do; authorization verifies who you are
   - They are two names for the same control
   - Authentication applies to devices; authorization applies to people
1. When a user tries to open a file, the system checks the access control matrix to see whether that user may open it. What is this check called?
   - Compatibility test
   - Penetration test
   - Deep packet inspection
   - Vulnerability scan
1. Where should a company place its public web server?
   - In the demilitarized zone (DMZ)
   - On the internal accounting network
   - Outside the border router with no protection
   - On the same server as the payroll database
1. Which examines only the source and destination in a packet's header?
   - Packet filtering
   - Deep packet inspection
   - An intrusion prevention system
   - A honeypot
1. What is the difference between an intrusion detection system (IDS) and an intrusion prevention system (IPS)?
   - An IDS detects and alerts; an IPS also blocks attacks automatically
   - An IDS blocks attacks; an IPS only logs them
   - An IDS is hardware; an IPS is a written policy
   - There is no difference
1. Turning off unneeded programs and changing default settings on a new server is called:
   - Hardening
   - Patch management
   - Log analysis
   - Penetration testing
1. A decoy server with fake "confidential" files is set up so that anyone accessing it can be flagged. What is this?
   - Honeypot
   - Demilitarized zone
   - Border router
   - Evil twin
1. After an attack on the company website is discovered, it takes over 30 minutes to figure out whom to contact. Which control would best fix this?
   - A computer incident response team (CIRT) with a documented response plan
   - A stronger firewall
   - Deep packet inspection
   - Hardening
1. A company hires an outside firm to try to break into its systems, including through social engineering. What is this?
   - Penetration test
   - Vulnerability scan
   - Compatibility test
   - Log analysis
1. An employee finds a USB drive in the parking lot and plugs it into her laptop, which installs a keylogger. Which control would best prevent this?
   - Security awareness training, plus antimalware software
   - Packet filtering at the border router
   - A demilitarized zone
   - A post-implementation review
1. A store manager installs a wireless access point without telling IT, and attackers use it to break in. Which control best addresses this?
   - Policies against unauthorized devices, plus regular scans for rogue access points
   - Multimodal authentication
   - A larger DMZ
   - Cycle billing
1. Why should program changes be tested in a separate environment rather than on the live system?
   - Errors in the change could disrupt or corrupt the live system
   - Testing on the live system is illegal
   - It makes the change faster
   - Live systems cannot run new code
1. Why do Internet of Things (IoT) devices increase security risk?
   - Each device is another endpoint that could be used to get into the network
   - IoT devices cannot be connected to networks
   - IoT devices always encrypt their data
   - IoT devices replace firewalls
