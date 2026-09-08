import { legalDocs, type LegalDoc } from './legal-docs';

export type DocCategory = 'legal' | 'security' | 'commercial' | 'operations';

export interface DocCategoryMeta {
  id: DocCategory;
  name: string;
  tagline: string;
  badge: string;
}

export const DOC_CATEGORIES: Record<DocCategory, DocCategoryMeta> = {
  legal: {
    id: 'legal',
    name: 'Legal & Governance',
    tagline: 'Binding company agreements, website terms, codes of conduct, and core rules.',
    badge: '7 Documents',
  },
  security: {
    id: 'security',
    name: 'Security, Privacy & Compliance',
    tagline: 'Data protection standards, international privacy notices (GDPR, CCPA), and vulnerability disclosure.',
    badge: '9 Documents',
  },
  commercial: {
    id: 'commercial',
    name: 'Commercial & Treasury Policies',
    tagline: 'Client milestone billing terms, refund procedures, service SLAs, and product warranties.',
    badge: '5 Documents',
  },
  operations: {
    id: 'operations',
    name: 'Operational Playbooks & Guides',
    tagline: 'Internal workflow standards, lead generation playbooks, and community conduct.',
    badge: '2 Documents',
  },
};

export interface UnifiedDoc extends LegalDoc {
  category: DocCategory;
  estimatedReadTime: string;
}

const CATEGORY_MAP: Record<string, DocCategory> = {
  'company-rules': 'legal',
  'misconduct': 'legal',
  'nda': 'legal',
  'security-policy': 'security',
  'responsible-disclosure': 'security',
  'dpa': 'security',
  'gdpr': 'security',
  'ccpa': 'security',
  'pdpa': 'security',
  'popia': 'security',
  'anti-bribery': 'security',
  'modern-slavery': 'security',
  'payment-policy': 'commercial',
  'refund-policy': 'commercial',
  'return-policy': 'commercial',
  'product-policy': 'commercial',
  'sla': 'commercial',
};

const ADDITIONAL_DOCS: UnifiedDoc[] = [
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    shortDescription: 'How Tauqeer Mustafa Inc. collects, uses, protects, and handles personal data across our website and client engagements.',
    lastUpdated: 'July 28, 2026',
    estimatedReadTime: '7 min read',
    category: 'legal',
    intro: 'Tauqeer Mustafa Inc. respects your privacy and is committed to protecting it through compliance with this policy. This Privacy Policy describes the types of information we may collect from you or that you may provide when you visit our website or engage us for consulting and software delivery services.',
    sections: [
      {
        heading: '1. Information We Collect',
        body: [
          'We collect information you provide directly, such as your name, corporate email address, phone number, and project scopes submitted through contact or intake forms.',
          'Technical information collected automatically as you navigate the site, such as browser type, device information, telemetry, and referring URLs.',
          'Information shared during the course of a project engagement, which may include business data, technical system access, or credentials necessary to deliver contracted work.'
        ]
      },
      {
        heading: '2. How We Use Your Information',
        body: [
          'To respond to inquiries, provide customized proposals, and deliver contracted engineering and consulting services.',
          'To operate, maintain, and enhance the security and performance of our platforms and portals.',
          'To fulfill statutory, regulatory, and corporate tax compliance obligations in our operating jurisdictions.'
        ]
      },
      {
        heading: '3. Data Security & Storage',
        body: [
          'We implement industry-standard administrative, physical, and technical safeguards (including TLS 1.3 encryption, role-based access control, and least-privilege infrastructure) to secure customer data.',
          'We do not sell, rent, or trade your personal or corporate data with third-party advertising networks.'
        ]
      },
      {
        heading: '4. Your Rights and Contact',
        body: [
          'You may request access to, correction of, or deletion of your personal data by contacting our privacy compliance desk at privacy@tauqeermustafa.tech.'
        ]
      }
    ]
  },
  {
    slug: 'terms',
    title: 'Terms of Service',
    shortDescription: 'The terms and conditions governing use of the Tauqeer Mustafa Inc. website, client portals, and technical engagements.',
    lastUpdated: 'July 28, 2026',
    estimatedReadTime: '8 min read',
    category: 'legal',
    intro: 'By accessing or using the Tauqeer Mustafa Inc. website, subdomains, portals, or by engaging us to provide technology consulting and software engineering services, you agree to be bound by these Terms of Service.',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        body: [
          'By using our websites or client portals, you agree to comply with these terms, our Privacy Policy, and any signed Master Services Agreements (MSAs).',
          'If you are entering into this agreement on behalf of a company or legal entity, you represent that you hold the legal authority to bind such entity.'
        ]
      },
      {
        heading: '2. Description of Services',
        body: [
          'Tauqeer Mustafa Inc. delivers high-assurance technology consulting and engineering services, including enterprise web platforms, cybersecurity auditing, AI workflows, and cloud engineering.',
          'Specific engagement milestones, fees, and deliverables are defined in signed Statements of Work (SOW) or Proposals.'
        ]
      },
      {
        heading: '3. Intellectual Property Rights',
        body: [
          'Unless otherwise specified in a custom Master Services Agreement, client deliverable IP passes to the client upon full settlement of all corresponding milestone invoices.',
          'Pre-existing software frameworks, libraries, open-source utilities, and internal delivery tooling remain the proprietary intellectual property of Tauqeer Mustafa Inc.'
        ]
      },
      {
        heading: '4. Limitation of Liability',
        body: [
          'In no event will Tauqeer Mustafa Inc., its directors, employees, or contractors be liable for any indirect, exemplary, or punitive damages arising from site or service usage, except to the extent prohibited by law.'
        ]
      }
    ]
  },
  {
    slug: 'cookies',
    title: 'Cookie Policy',
    shortDescription: 'How we use essential cookies and tracking technologies to ensure site functionality, session security, and preferences.',
    lastUpdated: 'August 10, 2026',
    estimatedReadTime: '4 min read',
    category: 'legal',
    intro: 'This Cookie Policy explains how Tauqeer Mustafa Inc. uses cookies and similar technologies when you visit our website, portals, and client workspaces.',
    sections: [
      {
        heading: '1. What Are Cookies',
        body: [
          'Cookies are small text files stored on your browser or device when you load websites. They allow platforms to remember your preferences and keep your user sessions authenticated.'
        ]
      },
      {
        heading: '2. Types of Cookies We Use',
        body: [
          'Essential / Strictly Necessary: Required for core authentication, portal security, and CSRF token defense. These cannot be disabled.',
          'Preferences: Used to remember theme mode (dark / light) and selected billing currency (USD / PKR).',
          'Performance & Telemetry: Anonymized aggregated traffic metrics used to diagnose server latency and optimize page rendering speeds.'
        ]
      },
      {
        heading: '3. Managing Cookie Preferences',
        body: [
          'You can modify your browser settings to decline non-essential cookies. Disabling essential cookies may impair portal login sessions.'
        ]
      }
    ]
  },
  {
    slug: 'accessibility',
    title: 'Accessibility Statement',
    shortDescription: 'Our commitment to digital accessibility, inclusive design, and WCAG 2.1 AA compliance across all web experiences.',
    lastUpdated: 'August 15, 2026',
    estimatedReadTime: '3 min read',
    category: 'legal',
    intro: 'Tauqeer Mustafa Inc. is committed to ensuring digital accessibility for people of all abilities. We continually improve the user experience across our digital properties in accordance with WCAG 2.1 Level AA standards.',
    sections: [
      {
        heading: '1. Conformance Standard',
        body: [
          'We target the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA across our corporate website and customer portal touchpoints.',
          'This includes semantic HTML structure, keyboard navigation, screen reader compatibility, and strict color contrast ratios.'
        ]
      },
      {
        heading: '2. Accessibility Features',
        body: [
          'Keyboard-focusable elements with clear visual indicator rings.',
          'ARIA landmarks and descriptive text alternatives for non-text media.',
          'Fluid typography and responsive layouts that scale gracefully up to 200% zoom without horizontal clipping.'
        ]
      },
      {
        heading: '3. Feedback & Assistance',
        body: [
          'If you encounter an accessibility barrier on any TMI digital surface, please contact accessibility@tauqeermustafa.tech and our engineering team will respond within 48 hours.'
        ]
      }
    ]
  },
  {
    slug: 'lead-gen-playbook',
    title: 'Sales & Lead Generation Playbook',
    shortDescription: 'Operating playbook and outreach standards for business development, consultative prospecting, and client discovery.',
    lastUpdated: 'September 1, 2026',
    estimatedReadTime: '10 min read',
    category: 'operations',
    intro: 'This playbook defines the commercial outreach methodology and discovery protocol for Tauqeer Mustafa Inc. representatives, ensuring consultative, high-integrity sales execution.',
    sections: [
      {
        heading: '1. ICP Definition & Targeting Criteria',
        body: [
          'Ideal Client Profile: Mid-market to enterprise organizations seeking bespoke web platforms, AI workflow automation, or managed cybersecurity retainers.',
          'Target Roles: Chief Technology Officers (CTO), VPs of Engineering, Heads of Product, and Managing Directors.'
        ]
      },
      {
        heading: '2. Value-First Prospecting Methodology',
        body: [
          'All outreach must be strictly research-driven and bespoke. Generic copy-paste spam is strictly prohibited.',
          'Lead with tangible value: technical observations, security audit recommendations, or architectural efficiency benchmarks.'
        ]
      },
      {
        heading: '3. Discovery Call Framework',
        body: [
          'Phase 1: Diagnostic questioning around existing pain points and legacy technical debt.',
          'Phase 2: Business impact quantification (downtime cost, manual workflow bottlenecks).',
          'Phase 3: Collaborative scoping and defining initial milestone requirements for the proposal.'
        ]
      }
    ]
  },
  {
    slug: 'community-guidelines',
    title: 'Community Code of Conduct',
    shortDescription: 'Community standards, participation ethics, and moderation policies for members of the TMI community.',
    lastUpdated: 'August 18, 2026',
    estimatedReadTime: '5 min read',
    category: 'operations',
    intro: 'The TMI Community is a space for developers, founders, engineering leaders, and technology practitioners to exchange ideas, share technical progress, and collaborate respectfully.',
    sections: [
      {
        heading: '1. Our Standards',
        body: [
          'Demonstrate empathy and respect towards other contributors regardless of experience level.',
          'Focus on constructive technical feedback and objective problem-solving.',
          'Gracefully accept constructive criticism and respect differing technical philosophies.'
        ]
      },
      {
        heading: '2. Prohibited Behavior',
        body: [
          'Unsolicited commercial spamming, affiliate link dumping, or aggressive sales pitches in general discussion channels.',
          'Harassment, exclusionary language, trolling, or insulting personal commentary.',
          'Publishing private communications or proprietary code without explicit author consent.'
        ]
      },
      {
        heading: '3. Moderation & Enforcement',
        body: [
          'Community moderators have the right to remove any post, topic, or comment that breaches these guidelines.',
          'Severe or repeated infractions will result in immediate suspension or permanent bans from the community platform.'
        ]
      }
    ]
  }
];

export const ALL_DOCS: UnifiedDoc[] = [
  ...legalDocs.map((doc) => ({
    ...doc,
    category: CATEGORY_MAP[doc.slug] || ('legal' as DocCategory),
    estimatedReadTime: '5 min read',
  })),
  ...ADDITIONAL_DOCS,
];

export function getAllDocs(): UnifiedDoc[] {
  return ALL_DOCS;
}

export function getDocBySlug(slug: string): UnifiedDoc | undefined {
  return ALL_DOCS.find((d) => d.slug.toLowerCase() === slug.toLowerCase());
}

export function getDocsByCategory(category: DocCategory): UnifiedDoc[] {
  return ALL_DOCS.filter((d) => d.category === category);
}

export function searchDocs(query: string): UnifiedDoc[] {
  const q = query.trim().toLowerCase();
  if (!q) return ALL_DOCS;
  return ALL_DOCS.filter(
    (d) =>
      d.title.toLowerCase().includes(q) ||
      d.shortDescription.toLowerCase().includes(q) ||
      d.slug.toLowerCase().includes(q) ||
      d.sections.some((s) => s.heading.toLowerCase().includes(q) || s.body.some((b) => b.toLowerCase().includes(q)))
  );
}
