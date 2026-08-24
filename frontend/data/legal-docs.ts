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
];

export function getLegalDoc(slug: string): LegalDoc | undefined {
  return legalDocs.find((doc) => doc.slug === slug);
}
