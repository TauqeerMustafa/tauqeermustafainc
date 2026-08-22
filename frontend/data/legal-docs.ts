export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalDoc {
  slug: string;
  title: string;
  shortDescription: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}

export const legalDocs: LegalDoc[] = [
  {
    slug: "sla",
    title: "Service Level Agreement",
    shortDescription: "The response times, uptime commitments, and support terms that apply to ongoing engagements.",
    lastUpdated: "July 28, 2026",
    intro:
      "This Service Level Agreement (SLA) sets out the standards Tauqeer Mustafa Inc. commits to for ongoing support, maintenance, and retainer engagements. It applies to any client with an active support or retainer contract, and supplements the master services agreement governing the relationship.",
    sections: [
      {
        heading: "1. Support Availability",
        body: [
          "Standard support is available Monday through Friday, 9:00 AM to 6:00 PM in the client's primary operating time zone, excluding public holidays observed in the delivery location.",
          "Clients on an enterprise retainer may contract for extended or 24/7 coverage; the specific hours are documented in the applicable statement of work.",
        ],
      },
      {
        heading: "2. Response Time Commitments",
        body: [
          "Critical issues (production outage, security incident, data loss risk) receive an initial response within 2 business hours.",
          "High-priority issues (major feature degraded, no workaround) receive an initial response within 8 business hours.",
          "Standard requests (minor bugs, enhancement requests, general questions) receive an initial response within 2 business days.",
        ],
      },
      {
        heading: "3. Uptime Commitment",
        body: [
          "For infrastructure we directly manage on a client's behalf, we target 99.9% monthly uptime, excluding scheduled maintenance windows communicated at least 48 hours in advance.",
          "Uptime is measured against the hosting provider's own reporting; we are not responsible for outages caused by third-party infrastructure, DNS providers, or upstream services outside our control.",
        ],
      },
      {
        heading: "4. Escalation Path",
        body: [
          "Issues that are not resolved within the target response window can be escalated to the account's assigned technical lead, and subsequently to the engagement's executive sponsor if needed.",
        ],
      },
      {
        heading: "5. Exclusions",
        body: [
          "This SLA does not cover issues caused by changes made outside our team, third-party service outages, force majeure events, or use of the delivered system outside its documented scope.",
        ],
      },
    ],
  },
  {
    slug: "dpa",
    title: "Data Processing Agreement",
    shortDescription: "Terms governing how we process personal data on behalf of clients, in line with GDPR and equivalent frameworks.",
    lastUpdated: "July 28, 2026",
    intro:
      "This Data Processing Agreement (DPA) forms part of the contract between Tauqeer Mustafa Inc. (the \"Processor\") and the client (the \"Controller\") whenever we process personal data on the client's behalf in the course of delivering services.",
    sections: [
      {
        heading: "1. Scope and Roles",
        body: [
          "Where a client engagement requires us to process personal data belonging to the client's own customers, employees, or users, we act as a data processor and the client acts as the data controller, consistent with the roles defined under GDPR Article 28 and equivalent provisions in other applicable frameworks.",
        ],
      },
      {
        heading: "2. Processing Instructions",
        body: [
          "We process personal data only on documented instructions from the controller, including with regard to transfers of personal data to a third country, unless required to do otherwise by applicable law.",
        ],
      },
      {
        heading: "3. Confidentiality",
        body: [
          "Personnel authorized to process personal data are bound by confidentiality obligations, whether contractual or statutory.",
        ],
      },
      {
        heading: "4. Security Measures",
        body: [
          "We implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk, including encryption in transit, access controls, and regular review of security practices.",
        ],
      },
      {
        heading: "5. Sub-processors",
        body: [
          "We maintain a list of approved sub-processors (such as cloud hosting and infrastructure providers) and will notify clients of any intended changes, giving them the opportunity to object on reasonable grounds.",
        ],
      },
      {
        heading: "6. Data Subject Rights",
        body: [
          "We assist the controller, insofar as reasonably possible, in fulfilling its obligations to respond to requests from data subjects exercising their rights under applicable data protection law.",
        ],
      },
      {
        heading: "7. Data Deletion",
        body: [
          "At the end of the provision of services, we delete or return all personal data to the controller, and delete existing copies, unless retention is required by law.",
        ],
      },
    ],
  },
  {
    slug: "nda",
    title: "Non-Disclosure Agreement",
    shortDescription: "Our standard mutual confidentiality terms, available on request before detailed project discussions begin.",
    lastUpdated: "July 28, 2026",
    intro:
      "Tauqeer Mustafa Inc. routinely enters into mutual non-disclosure agreements (NDAs) with prospective and existing clients before discussing sensitive project details, architecture, or business information. This page summarizes the standard terms; a signed copy is issued on request via our legal team.",
    sections: [
      {
        heading: "1. Purpose",
        body: [
          "The NDA protects confidential information shared by either party in the course of evaluating, scoping, or delivering a project, including technical specifications, business plans, and proprietary processes.",
        ],
      },
      {
        heading: "2. Mutual Obligation",
        body: [
          "Our standard NDA is mutual: both parties agree to protect confidential information they receive, not only information we disclose to a prospective client.",
        ],
      },
      {
        heading: "3. Term",
        body: [
          "Confidentiality obligations typically remain in effect for three years from the date of disclosure, unless a different term is negotiated for a specific engagement.",
        ],
      },
      {
        heading: "4. Exclusions",
        body: [
          "Information that is or becomes publicly available through no fault of the receiving party, was already known prior to disclosure, or is independently developed, is excluded from confidentiality obligations.",
        ],
      },
      {
        heading: "5. Requesting a Signed Copy",
        body: [
          "To request a countersigned NDA ahead of a discovery call, contact our legal team using the email address listed on our Contact page. We typically turn around signed NDAs within one business day.",
        ],
      },
    ],
  },
  {
    slug: "security-policy",
    title: "Security Policy",
    shortDescription: "How we protect client data, systems, and credentials across every engagement.",
    lastUpdated: "July 28, 2026",
    intro:
      "Security is treated as a first-class requirement throughout our delivery process, not an afterthought applied before launch. This policy outlines the practices we follow to protect client systems, data, and credentials.",
    sections: [
      {
        heading: "1. Access Control",
        body: [
          "Access to client systems and credentials is granted on a least-privilege basis, limited to the personnel actively working on an engagement, and revoked promptly when no longer needed.",
          "Multi-factor authentication is required for access to internal systems, source control, and cloud infrastructure accounts.",
        ],
      },
      {
        heading: "2. Secure Development Practices",
        body: [
          "Code is reviewed before merging to production branches, dependencies are monitored for known vulnerabilities, and secrets are never committed to source control.",
        ],
      },
      {
        heading: "3. Data Handling",
        body: [
          "Client data is encrypted in transit using TLS, and encrypted at rest where the underlying infrastructure supports it. Data is not copied to personal devices or unmanaged storage.",
        ],
      },
      {
        heading: "4. Incident Response",
        body: [
          "In the event of a suspected security incident affecting client data or systems, we notify the affected client without undue delay and provide a written summary of the incident, impact, and remediation steps.",
        ],
      },
      {
        heading: "5. Vendor and Sub-processor Review",
        body: [
          "Third-party tools and infrastructure providers used in delivery are evaluated for their own security posture and compliance certifications before adoption.",
        ],
      },
    ],
  },
  {
    slug: "responsible-disclosure",
    title: "Responsible Disclosure",
    shortDescription: "How to report a security vulnerability in our systems or a client-facing product we maintain.",
    lastUpdated: "July 28, 2026",
    intro:
      "We take security vulnerability reports seriously and appreciate the efforts of researchers who report issues responsibly. This page explains how to report a vulnerability and what to expect from us in return.",
    sections: [
      {
        heading: "1. Scope",
        body: [
          "This policy covers our own corporate website and infrastructure. For vulnerabilities found in a specific client product, please contact that organization directly unless we have been explicitly authorized to receive reports on their behalf.",
        ],
      },
      {
        heading: "2. How to Report",
        body: [
          "Send a detailed report to our security team, including steps to reproduce, potential impact, and any proof-of-concept material, using the security contact listed on our Contact page.",
        ],
      },
      {
        heading: "3. What to Expect",
        body: [
          "We acknowledge reports within two business days, provide an initial assessment within five business days, and keep the reporter informed of remediation progress until the issue is resolved.",
        ],
      },
      {
        heading: "4. Responsible Testing Guidelines",
        body: [
          "Please avoid accessing, modifying, or deleting data that does not belong to you, avoid disrupting production services, and give us reasonable time to remediate before any public disclosure.",
        ],
      },
      {
        heading: "5. Safe Harbor",
        body: [
          "We will not pursue legal action against researchers who make a good-faith effort to comply with this policy while identifying a vulnerability.",
        ],
      },
    ],
  },
  {
    slug: "modern-slavery",
    title: "Modern Slavery Statement",
    shortDescription: "Our commitment to preventing modern slavery and human trafficking across our business and supply chain.",
    lastUpdated: "July 28, 2026",
    intro:
      "Tauqeer Mustafa Inc. is committed to preventing acts of modern slavery and human trafficking within our business and supply chains, and to acting ethically and with integrity in all business dealings.",
    sections: [
      {
        heading: "1. Our Business",
        body: [
          "We are a technology consulting and software engineering company. Our workforce consists primarily of directly employed and contracted technical professionals engaged under fair, documented terms.",
        ],
      },
      {
        heading: "2. Our Supply Chain",
        body: [
          "Our supply chain is limited primarily to software tooling, cloud infrastructure, and professional services vendors. We assess new vendors for basic labor practice red flags before engagement.",
        ],
      },
      {
        heading: "3. Policies",
        body: [
          "Our employment practices, whistleblowing procedures, and code of conduct collectively reinforce a working environment free of forced, bonded, or child labor.",
        ],
      },
      {
        heading: "4. Due Diligence",
        body: [
          "We review our direct contractor relationships periodically to confirm fair compensation and working conditions consistent with local labor law.",
        ],
      },
    ],
  },
  {
    slug: "anti-bribery",
    title: "Anti-Bribery Policy",
    shortDescription: "Our zero-tolerance approach to bribery and corruption in every market we operate in.",
    lastUpdated: "July 28, 2026",
    intro:
      "Tauqeer Mustafa Inc. maintains a zero-tolerance approach to bribery and corruption in all forms, across every jurisdiction in which we operate or serve clients.",
    sections: [
      {
        heading: "1. Prohibited Conduct",
        body: [
          "Employees, contractors, and representatives acting on our behalf may not offer, give, solicit, or accept any bribe, kickback, or improper payment intended to influence a business decision.",
        ],
      },
      {
        heading: "2. Gifts and Hospitality",
        body: [
          "Modest, transparent business hospitality is permitted where customary and proportionate; anything beyond that requires prior approval and is logged internally.",
        ],
      },
      {
        heading: "3. Third Parties",
        body: [
          "We expect agents, subcontractors, and partners acting on our behalf to comply with equivalent anti-bribery standards, and we reserve the right to terminate relationships where this expectation is not met.",
        ],
      },
      {
        heading: "4. Reporting Concerns",
        body: [
          "Employees and partners who become aware of a suspected violation are expected to report it through our internal escalation process without fear of retaliation.",
        ],
      },
    ],
  },
  {
    slug: "gdpr",
    title: "GDPR Compliance",
    shortDescription: "How we meet our obligations under the EU General Data Protection Regulation for clients and their users.",
    lastUpdated: "July 28, 2026",
    intro:
      "For clients and website visitors in the European Union and European Economic Area, we apply the principles and obligations set out in the General Data Protection Regulation (GDPR) to our handling of personal data.",
    sections: [
      {
        heading: "1. Legal Basis for Processing",
        body: [
          "We process personal data only where we have a valid legal basis, such as consent, contractual necessity, or legitimate interest, and we document the basis relied on for each processing activity.",
        ],
      },
      {
        heading: "2. Data Subject Rights",
        body: [
          "Individuals in scope of GDPR have the right to access, correct, delete, restrict, or port their personal data, and to object to certain processing. Requests can be made through our privacy contact.",
        ],
      },
      {
        heading: "3. International Transfers",
        body: [
          "Where personal data is transferred outside the EEA, we rely on recognized transfer mechanisms such as Standard Contractual Clauses, and we document these transfers in our records of processing activity.",
        ],
      },
      {
        heading: "4. Data Protection by Design",
        body: [
          "Client-facing systems we build are designed with data minimization, purpose limitation, and appropriate retention periods considered from the outset of the project.",
        ],
      },
      {
        heading: "5. Breach Notification",
        body: [
          "In the event of a personal data breach affecting EU data subjects, we notify affected controllers without undue delay, in line with the 72-hour notification expectation set by GDPR.",
        ],
      },
    ],
  },
  {
    slug: "ccpa",
    title: "CCPA / CPRA Notice",
    shortDescription: "Rights and disclosures for California residents under the CCPA and CPRA.",
    lastUpdated: "July 28, 2026",
    intro:
      "This notice supplements our Privacy Policy for residents of California and describes rights available under the California Consumer Privacy Act (CCPA), as amended by the California Privacy Rights Act (CPRA).",
    sections: [
      {
        heading: "1. Categories of Information Collected",
        body: [
          "We may collect identifiers, commercial information, internet activity, and professional information submitted through our website's contact and career forms, consistent with the categories defined under CCPA.",
        ],
      },
      {
        heading: "2. No Sale or Sharing of Personal Information",
        body: [
          "We do not sell or share personal information as those terms are defined under the CCPA/CPRA.",
        ],
      },
      {
        heading: "3. Your Rights",
        body: [
          "California residents have the right to know what personal information is collected, request deletion, correct inaccurate information, and opt out of any future sale or sharing, exercised by contacting our privacy team.",
        ],
      },
      {
        heading: "4. Non-Discrimination",
        body: [
          "We will not discriminate against you for exercising any of your rights under the CCPA/CPRA.",
        ],
      },
    ],
  },
  {
    slug: "pdpa",
    title: "PDPA Compliance",
    shortDescription: "Our data handling practices for clients and users in Singapore, Thailand, and other PDPA jurisdictions.",
    lastUpdated: "July 28, 2026",
    intro:
      "For clients and users in jurisdictions governed by a Personal Data Protection Act (PDPA), including Singapore and Thailand, we apply data handling practices consistent with the applicable PDPA framework.",
    sections: [
      {
        heading: "1. Consent and Notification",
        body: [
          "We collect personal data only with appropriate notification of purpose, and where required, obtain consent before collection, use, or disclosure.",
        ],
      },
      {
        heading: "2. Purpose Limitation",
        body: [
          "Personal data collected through our website or during client engagements is used only for the purposes disclosed at the time of collection, or a reasonably related purpose.",
        ],
      },
      {
        heading: "3. Data Protection Measures",
        body: [
          "We apply reasonable security arrangements to protect personal data against unauthorized access, collection, use, or disclosure, consistent with PDPA's protection obligation.",
        ],
      },
      {
        heading: "4. Data Breach Notification",
        body: [
          "Where a data breach is likely to result in significant harm, we notify the relevant regulatory authority and affected individuals in line with applicable PDPA notification timelines.",
        ],
      },
    ],
  },
  {
    slug: "popia",
    title: "POPIA Compliance",
    shortDescription: "How we meet obligations under South Africa's Protection of Personal Information Act.",
    lastUpdated: "July 28, 2026",
    intro:
      "For clients and users in South Africa, we apply data handling practices consistent with the Protection of Personal Information Act (POPIA).",
    sections: [
      {
        heading: "1. Lawful Processing",
        body: [
          "Personal information is processed lawfully and in a reasonable manner that does not infringe the privacy of the data subject, consistent with POPIA's conditions for lawful processing.",
        ],
      },
      {
        heading: "2. Purpose Specification",
        body: [
          "Personal information is collected for a specific, explicitly defined purpose related to a function or activity of our business, and is not processed further in a manner incompatible with that purpose.",
        ],
      },
      {
        heading: "3. Security Safeguards",
        body: [
          "We take appropriate, reasonable technical and organizational measures to prevent loss, damage, or unauthorized access to personal information in our possession.",
        ],
      },
      {
        heading: "4. Data Subject Participation",
        body: [
          "Data subjects may request confirmation of what personal information we hold about them and request correction or deletion, subject to any legal retention requirements.",
        ],
      },
    ],
  },
  {
    slug: "payment-policy",
    title: "Payment Policy",
    shortDescription: "Accepted payment methods, invoicing schedules, currencies, taxes, and what happens when an invoice runs late.",
    lastUpdated: "August 22, 2026",
    intro:
      "This Payment Policy explains how Tauqeer Mustafa Inc. quotes, invoices, and collects payment for its services. It applies to all clients unless a signed proposal, statement of work, or master services agreement sets out different commercial terms — in which case that signed document takes precedence.",
    sections: [
      {
        heading: "1. Currency and Pricing",
        body: [
          "Project fees are quoted in US Dollars (USD) by default. Clients invoiced within Pakistan may be quoted and billed in Pakistani Rupees (PKR) at the exchange rate stated on the invoice.",
          "All quotes are valid for 30 days from the date of issue. Prices are exclusive of taxes, bank charges, and third-party costs unless the quote explicitly states otherwise.",
        ],
      },
      {
        heading: "2. Accepted Payment Methods",
        body: [
          "We accept bank transfer (local transfer or international wire), payment by debit or credit card through our payment processor, and transfers via recognised international remittance services such as Wise or PayPal where available.",
          "Card payments are handled entirely by a PCI DSS compliant payment processor. We do not see, handle, or store full card numbers, CVV codes, or bank credentials on our own systems.",
          "We do not accept cash, cryptocurrency, or payment from an account whose holder is unrelated to the contracting client, unless agreed in writing in advance.",
        ],
      },
      {
        heading: "3. Invoicing and Payment Schedule",
        body: [
          "Fixed-scope projects are invoiced against an advance payment that confirms the booking and reserves delivery capacity, followed by invoices at agreed milestones. The specific split is set out in the proposal for each engagement.",
          "Monthly retainers, support plans, and managed services are invoiced in advance for the upcoming service period.",
          "Time-and-materials work is invoiced in arrears for hours actually worked, with a summary of the work performed attached to the invoice.",
          "Unless the invoice states otherwise, payment is due within 7 calendar days of the invoice date.",
        ],
      },
      {
        heading: "4. Late Payment",
        body: [
          "We send a written reminder when an invoice becomes overdue. If an invoice remains unpaid 14 days past its due date, we may pause active work, suspend access to staging environments, and hold scheduled delivery dates until the account is brought current.",
          "Work paused for non-payment is rescheduled based on the capacity available when payment clears; the original delivery dates are not guaranteed after a pause.",
          "Where permitted by the applicable contract and by law, we may apply a late payment charge of 1.5% per month on the overdue balance.",
        ],
      },
      {
        heading: "5. Taxes, Withholding, and Bank Charges",
        body: [
          "Clients are responsible for any sales tax, VAT, GST, or equivalent indirect tax applicable in their jurisdiction, and for any import duties on hardware procured on their behalf.",
          "Where local law requires the client to deduct withholding tax from a payment, the client agrees to provide a valid withholding tax certificate. Amounts withheld without a certificate remain payable to us.",
          "The sending party is responsible for its own bank and intermediary wire fees. Invoices must be settled for the full invoiced amount net of fees.",
        ],
      },
      {
        heading: "6. Third-Party and Pass-Through Costs",
        body: [
          "Costs such as cloud hosting, domain registration, commercial software licences, paid APIs, stock assets, and app store fees are either billed to the client's own accounts or passed through to the client at cost.",
          "Pass-through costs above a nominal amount are approved by the client in writing before we incur them. Once incurred on the client's behalf, these costs are payable in full and are not refundable by us.",
        ],
      },
      {
        heading: "7. Payment Security and Fraud Prevention",
        body: [
          "Our official bank details appear only on invoices issued from our billing address. We will never ask you to send payment to a different account by chat message, and we will never request your card number, CVV, one-time passcode, or online banking password over email, WhatsApp, or phone.",
          "If you receive a payment request that appears to come from us but uses unfamiliar bank details, do not pay it. Contact our billing team using the address on this page to verify before transferring any funds.",
        ],
      },
      {
        heading: "8. Failed Payments and Chargebacks",
        body: [
          "If a card payment or bank transfer is reversed, declined, or returned, the underlying invoice is treated as unpaid and any bank charge we incur as a result is added to the balance.",
          "If you believe an invoice is incorrect, please contact our billing team so we can review it. Raising a chargeback before contacting us delays resolution, and we may suspend delivery while a disputed payment is under investigation with the processor.",
        ],
      },
      {
        heading: "9. Billing Contact",
        body: [
          "Questions about an invoice, a payment method, or a payment that has not appeared on your account should be sent to our billing team at billing@tauqeermustafa.tech. Please quote the invoice number in your message.",
        ],
      },
    ],
  },
  {
    slug: "refund-policy",
    title: "Refund Policy",
    shortDescription: "When advance payments, milestones, and retainers are refundable, and how to request a refund.",
    lastUpdated: "August 22, 2026",
    intro:
      "This Refund Policy explains when Tauqeer Mustafa Inc. issues refunds for professional services, retainers, and digital deliverables, and how to request one. It applies alongside our Payment Policy and Terms of Service, and is superseded by any refund terms written into a signed statement of work.",
    sections: [
      {
        heading: "1. General Principle",
        body: [
          "We are a services business. Our fees pay for engineering, design, security, and consulting time that is scheduled in advance and cannot be resold once it has been reserved or spent. Refunds are therefore assessed against work performed and capacity committed, not against your satisfaction with a subjective design or business outcome.",
          "Where work has been delivered but does not meet the agreed specification, our first remedy is correction at no additional cost under the rework terms in our Return Policy, rather than a refund.",
        ],
      },
      {
        heading: "2. Advance Payments and Deposits",
        body: [
          "The advance payment that confirms a booking covers discovery, planning, and the reservation of delivery capacity. It is refundable in full if you cancel in writing before we begin discovery or scheduled work.",
          "Once discovery or delivery work has started, the advance payment is non-refundable. If we are the party that cancels before starting work, or we are unable to staff the engagement, the advance payment is refunded in full.",
        ],
      },
      {
        heading: "3. Milestone-Based Projects",
        body: [
          "Milestones that have been delivered and accepted are non-refundable.",
          "If you cancel mid-project, we invoice for work completed up to the cancellation date, hand over the work produced to that point, and refund any prepaid amount that exceeds the value of the work performed.",
          "Work in progress at the point of cancellation is charged on a pro rata basis against the milestone it belongs to, based on our written time records.",
        ],
      },
      {
        heading: "4. Retainers and Support Plans",
        body: [
          "Retainers and support plans may be cancelled with 30 days written notice. The service period already in progress is non-refundable, because the capacity for that period is already reserved.",
          "Prepaid months that have not yet begun at the point of cancellation are refunded in full.",
          "Unused hours within a retainer period do not roll over and are not refundable unless the applicable statement of work provides otherwise.",
        ],
      },
      {
        heading: "5. Non-Refundable Items",
        body: [
          "Third-party costs already incurred on your behalf — cloud hosting, domains, commercial licences, paid APIs, app store fees, stock assets — are not refundable, as we cannot recover them from the vendor.",
          "Consulting sessions, audits, training, and security assessments that have already been delivered are not refundable.",
          "Custom source code, designs, or documents that have already been delivered to you are not refundable once handed over.",
        ],
      },
      {
        heading: "6. Refunds We Issue Without Question",
        body: [
          "Duplicate payments, overpayments, and amounts charged in error are refunded in full as soon as we identify or are notified of them.",
          "If we cancel an engagement for reasons within our control, or cannot deliver work you have paid for, we refund the undelivered portion in full.",
        ],
      },
      {
        heading: "7. How to Request a Refund",
        body: [
          "Send a written request to billing@tauqeermustafa.tech, including the invoice number, the amount in question, and a short description of the reason.",
          "We acknowledge every refund request within 2 business days and give a written decision within 7 business days of receiving the information needed to assess it.",
          "Approved refunds are issued to the original payment method within 10 business days of approval. Where the original method cannot receive a refund, we issue it by bank transfer to an account in the paying party's name. Bank charges on international refunds are deducted from the refunded amount.",
        ],
      },
      {
        heading: "8. Chargebacks",
        body: [
          "Please contact our billing team before filing a chargeback with your bank or card issuer. Most disputes are billing misunderstandings we can resolve within a day or two.",
          "Where a chargeback is filed on an invoice for work that was delivered and accepted, we will contest it and provide the processor with the relevant delivery records, and we may suspend further work until the dispute is closed.",
        ],
      },
    ],
  },
  {
    slug: "return-policy",
    title: "Return Policy",
    shortDescription: "How returns, cancellations, and rework requests work for digital deliverables and for hardware bought on your behalf.",
    lastUpdated: "August 22, 2026",
    intro:
      "This Return Policy explains what can and cannot be returned when you buy from Tauqeer Mustafa Inc. Most of what we deliver is professional services and custom digital work, which behaves differently from a physical product — so this policy sets out the practical equivalent: cancellation, rework, and, where relevant, the return of hardware procured on your behalf.",
    sections: [
      {
        heading: "1. What We Sell",
        body: [
          "We sell professional services and the digital deliverables produced by them: custom software, web platforms, source code, designs, security assessments, documentation, and consulting time. We are not a retail store and do not maintain a stock of physical goods for resale.",
          "Because digital deliverables are produced to your specification and cannot be un-delivered once handed over, they cannot be returned in the sense a physical product can. The remedies below apply instead.",
        ],
      },
      {
        heading: "2. Acceptance and Rework Window",
        body: [
          "Each delivery is accompanied by a delivery note describing what was built. You have 14 calendar days from delivery to review it against the agreed specification and raise anything that does not match.",
          "Anything that does not meet the agreed specification is corrected at no additional cost. This is our primary remedy in place of a return.",
          "Requests that add to or change the agreed specification are new work, quoted separately. A change of business direction after delivery is not a defect.",
          "If no issues are raised within the 14-day window, the delivery is treated as accepted.",
        ],
      },
      {
        heading: "3. Defect Warranty After Acceptance",
        body: [
          "Defects in delivered work that are reported within 30 days of acceptance are fixed at no cost under the warranty terms in our Product Policy, provided the affected code or configuration has not been modified by another party.",
        ],
      },
      {
        heading: "4. Cancellation Instead of Return",
        body: [
          "Before work begins, you may cancel an engagement in writing at no cost and receive a full refund of any advance payment.",
          "Once work is in progress, cancellation is handled as described in our Refund Policy: you are invoiced for the work completed, that work is handed over to you, and any prepaid balance above the value of the work performed is refunded.",
          "Retainers and support plans are cancelled with 30 days written notice rather than returned.",
        ],
      },
      {
        heading: "5. Hardware and Physical Items",
        body: [
          "Occasionally we procure hardware or physical items on a client's behalf — a server, a device for testing, or a licence delivered on physical media. These remain subject to the manufacturer's or vendor's own return terms, which we pass through to you unchanged.",
          "To request a return of such an item, notify us within 7 calendar days of delivery. The item must be unused, in its original packaging, and complete with all accessories and documentation.",
          "Return shipping and any vendor restocking fee are payable by the client, except where the item arrived damaged, faulty, or was not the item ordered — in which case we cover the cost of the return and the replacement.",
          "Items that are damaged after delivery, opened software media, activated licences, and custom-configured hardware cannot be returned.",
        ],
      },
      {
        heading: "6. Items That Cannot Be Returned",
        body: [
          "Consulting, audit, training, and support hours that have already been delivered.",
          "Custom source code, designs, and documents already handed over.",
          "Third-party subscriptions, licences, domains, and cloud usage already purchased or consumed on your behalf.",
          "Any deliverable that has been modified by you or a third party after handover.",
        ],
      },
      {
        heading: "7. How to Raise a Return or Rework Request",
        body: [
          "Send your request to support@tauqeermustafa.tech, including the project name, the relevant invoice or delivery note number, and a clear description of the problem, with screenshots or reproduction steps where applicable.",
          "We acknowledge requests within 2 business days and confirm the remedy — rework, replacement, return authorisation, or refund — within 5 business days.",
        ],
      },
    ],
  },
  {
    slug: "product-policy",
    title: "Product Policy",
    shortDescription: "Ownership, licensing, warranty, updates, and acceptable use for the products and software we deliver.",
    lastUpdated: "August 22, 2026",
    intro:
      "This Product Policy sets out the terms that apply to the products Tauqeer Mustafa Inc. builds and delivers — custom software, web platforms, internal tools, integrations, and any licensed components we supply with them. It covers who owns what, how third-party components are licensed, what our warranty covers, and how we handle updates and deprecation.",
    sections: [
      {
        heading: "1. Products Covered",
        body: [
          "This policy applies to custom-built software and platforms delivered under a statement of work, along with the configuration, infrastructure definitions, and documentation supplied with them.",
          "It also applies to any reusable component, template, or internal library we licence to you as part of a delivery.",
        ],
      },
      {
        heading: "2. Ownership and Intellectual Property",
        body: [
          "Intellectual property in the custom work produced for you transfers to you on receipt of full payment for that work. Until an engagement is paid in full, we retain ownership of the delivered work and grant only a temporary licence to evaluate it.",
          "We retain ownership of our pre-existing tools, internal libraries, boilerplate, and general know-how used in delivery. Where these are embedded in your product, you receive a perpetual, non-exclusive, royalty-free licence to use, modify, and host them as part of that product. You may not extract them and resell or redistribute them as a standalone product.",
          "You retain full ownership of your own content, data, trademarks, and brand assets at all times. Nothing in a delivery transfers any right in your data to us.",
        ],
      },
      {
        heading: "3. Third-Party and Open-Source Components",
        body: [
          "Our products are built on open-source frameworks and libraries. These remain under their own licences, and your use of the product is subject to those licences. We select components with permissive licences suitable for commercial use, and we can supply a dependency and licence inventory on request.",
          "Commercial third-party licences, paid APIs, and SaaS subscriptions required by a product are registered in your name and remain your property and your ongoing cost. We do not resell third-party licences.",
        ],
      },
      {
        heading: "4. Warranty",
        body: [
          "We warrant that delivered work will materially conform to the agreed specification for 30 days after acceptance. Defects reported within that period are corrected at no cost.",
          "The warranty does not cover new features or changes to the agreed scope, faults caused by modifications made by you or a third party, breakage caused by a third-party service or API changing or shutting down, issues arising from infrastructure or accounts we do not manage, or use of the product outside its documented purpose.",
          "Except as stated here and as required by applicable law, products are provided without further warranty. We do not warrant that any product will be entirely free of defects or that it will produce any particular commercial result.",
        ],
      },
      {
        heading: "5. Support and Maintenance After Warranty",
        body: [
          "After the warranty period, ongoing support, monitoring, and maintenance are provided under a retainer or support plan, with response times governed by our Service Level Agreement.",
          "Without an active support plan, work on a delivered product is quoted and scheduled as new work, subject to available capacity.",
        ],
      },
      {
        heading: "6. Updates, Versions, and Dependencies",
        body: [
          "Software dependencies age. Frameworks release breaking versions, and libraries are deprecated. Keeping a product current is ongoing work, not a one-time delivery, and is covered by a support plan rather than by the original project fee.",
          "For products under an active support plan, we monitor security advisories affecting the stack and apply security patches as part of the plan. Major version upgrades that require significant rework are quoted separately.",
          "Where a client declines recommended security updates, we document the recommendation and are not responsible for issues arising from the un-patched components.",
        ],
      },
      {
        heading: "7. Acceptable Use",
        body: [
          "Products we deliver may not be used for unlawful purposes, to send unsolicited bulk messaging, to infringe another party's intellectual property, or to process data in breach of applicable data protection law.",
          "You may not remove, disable, or circumvent security controls, authentication, licensing checks, or audit logging built into a delivered product and then hold us responsible for the consequences.",
          "Where a product includes a messaging, payment, or other regulated integration, you remain responsible for complying with that provider's own platform policies.",
        ],
      },
      {
        heading: "8. Hosting, Domains, and Accounts",
        body: [
          "Wherever possible, production hosting, domains, and third-party service accounts are registered in your name, with us granted access as a collaborator. This means you never lose control of your own product if our engagement ends.",
          "Where we host or hold an account on your behalf, ownership transfers to you on request, and the credentials and configuration required to run the product independently are handed over at the end of the engagement.",
        ],
      },
      {
        heading: "9. Data, Backups, and Continuity",
        body: [
          "Responsibility for production data, backup schedules, and retention periods rests with whichever party operates the environment, as documented in the statement of work. Where we process personal data on your behalf, our Data Processing Agreement applies.",
          "On termination, we return or delete client data as set out in the Data Processing Agreement, and provide a written handover of the product's architecture, environment variables, and operational runbook.",
        ],
      },
      {
        heading: "10. Changes to Products and This Policy",
        body: [
          "We may update this policy to reflect changes in our delivery practices or legal obligations. The date shown above records the most recent revision, and material changes affecting an active engagement are communicated to the client directly.",
          "Where we decide to discontinue a reusable component or template we licence to clients, we give at least 90 days written notice to clients using it and continue to support it under any active support plan through that period.",
        ],
      },
    ],
  },
];

export function getLegalDoc(slug: string): LegalDoc | undefined {
  return legalDocs.find((doc) => doc.slug === slug);
}
