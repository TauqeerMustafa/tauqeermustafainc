/**
 * Multi-Tenant Company Profile
 * Defaults strictly to Tauqeer Mustafa Inc. (tauqeermustafa.com)
 * Dynamically switches to Qorlune LLC only when accessed from qorlune.co.uk / qorlune.com
 */

export interface Office {
  label: string;
  city: string;
  address: string;
  mapEmbedUrl?: string;
}

export interface WhatsAppChannel {
  name: string;
  number: string;
  url: string;
  displayNumber: string;
  description: string;
  action: string;
  badge: string;
}

export interface CompanyData {
  name: string;
  legalName: string;
  shortName: string;
  tagline: string;
  description: string;
  mission: string;
  vision: string;
  founded: string;
  hq: string;
  city: string;
  offices: Office[];
  email: string;
  emails: {
    general: string;
    contact: string;
    support: string;
    sales: string;
    marketing: string;
    legal: string;
    careers: string;
    business: string;
    billing: string;
  };
  mapEmbedUrl: string;
  phone: string;
  whatsapp: string;
  whatsappChannels: {
    general: WhatsAppChannel;
    support: WhatsAppChannel;
    direct: WhatsAppChannel;
  };
  website: string;
  workingHours: string;
  slogan: string;
  targetClients: string[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  social: {
    github: string;
    linkedin: string;
    twitter: string;
  };
}

export const tauqeerCompany: CompanyData = {
  name: "Tauqeer Mustafa Inc.",
  legalName: "Tauqeer Mustafa Inc.",
  shortName: "Tauqeer Mustafa",
  tagline: "Systems Architect & Cybersecurity Consultant",
  description:
    "Enterprise systems architecture, high-throughput cloud runtimes, zero-trust resilience, and defensive security engineering for enterprise platforms worldwide.",
  mission:
    "To architect and secure resilient, high-throughput systems that hold under real operational load.",
  vision:
    "To lead modern enterprise systems architecture and security consulting with uncompromising engineering rigor.",
  founded: "2024",
  hq: "Islamabad, Pakistan",
  city: "Islamabad, Pakistan",
  offices: [
    {
      label: "Headquarters",
      city: "Islamabad, Pakistan",
      address: "Islamabad, Pakistan",
      mapEmbedUrl: "",
    },
  ],
  email: "info@tauqeermustafa.com",
  emails: {
    general: "info@tauqeermustafa.com",
    contact: "contact@tauqeermustafa.com",
    support: "support@tauqeermustafa.com",
    sales: "sales@tauqeermustafa.com",
    marketing: "marketing@tauqeermustafa.com",
    legal: "legal@tauqeermustafa.com",
    careers: "careers@tauqeermustafa.com",
    business: "business@tauqeermustafa.com",
    billing: "billing@tauqeermustafa.com",
  },
  mapEmbedUrl: "",
  phone: "+92 335 6701199",
  whatsapp: "https://wa.me/923356701199",
  whatsappChannels: {
    general: {
      name: "Tauqeer Mustafa Inc. Official Desk",
      number: "+92 335 6701199",
      url: "https://wa.me/923356701199",
      displayNumber: "+92 335 6701199",
      description: "Direct client consultation, inquiries, enterprise proposals, and official support",
      action: "Chat with Tauqeer Mustafa",
      badge: "Official Line",
    },
    support: {
      name: "Technical & Architecture Support",
      number: "+92 335 6701199",
      url: "https://wa.me/923356701199",
      displayNumber: "+92 335 6701199",
      description: "24/7 enterprise systems helpdesk, cloud SLA, and live technical support",
      action: "Contact Support Desk",
      badge: "24/7 Support",
    },
    direct: {
      name: "Executive & Priority Desk",
      number: "+92 335 6701199",
      url: "https://wa.me/923356701199",
      displayNumber: "+92 335 6701199",
      description: "Executive desk, enterprise architecture proposals & strategic advisory",
      action: "Chat with Executive Desk",
      badge: "Priority Desk",
    },
  },
  website: "https://tauqeermustafa.com",
  workingHours: "Monday - Saturday | 9:00 AM - 6:00 PM PKT",
  slogan: "High-Throughput Cloud Runtimes, Zero-Trust Resilience & Enterprise Systems.",
  targetClients: [
    "Startups",
    "SMEs",
    "Enterprise Organizations",
    "Cloud Platforms",
    "Financial Services",
    "International Businesses",
  ],
  colors: {
    primary: "#0f172a",
    secondary: "#ffffff",
    accent: "#2563eb",
  },
  social: {
    github: "https://github.com/TauqeerMustafa",
    linkedin: "https://linkedin.com/in/tauqeer-mustafa",
    twitter: "https://x.com/tauqeermustafa",
  },
};

export const qorluneCompany: CompanyData = {
  name: "Qorlune LLC",
  legalName: "Qorlune LLC",
  shortName: "Qorlune",
  tagline: "Engineering that ships. Security that holds.",
  description:
    "A digital technology firm specializing in secure web platforms, cybersecurity consulting, AI integration, cloud engineering, and product design.",
  mission:
    "To deliver integrated engineering and security work that solves actual business problems.",
  vision:
    "To become the engineering partner that growing companies return to when the work matters.",
  founded: "2023",
  hq: "1808 Orleans Ave, New Orleans, LA 70116, United States",
  city: "New Orleans, United States",
  offices: [
    {
      label: "Headquarters",
      city: "New Orleans, United States",
      address: "1808 Orleans Ave, New Orleans, LA 70116, United States",
      mapEmbedUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3456.4971033504817!2d-90.07737629016616!3d29.96514072222164!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8620a50056d541c1%3A0xd62188e30053c7ed!2sQorlune!5e0!3m2!1sen!2s!4v1792247708181!5m2!1sen!2s",
    },
  ],
  email: "support@qorlune.co.uk",
  emails: {
    general: "info@qorlune.co.uk",
    contact: "contact@qorlune.co.uk",
    support: "support@qorlune.co.uk",
    sales: "sales@qorlune.co.uk",
    marketing: "marketing@qorlune.co.uk",
    legal: "legal@qorlune.co.uk",
    careers: "careers@qorlune.co.uk",
    business: "business@qorlune.co.uk",
    billing: "billing@qorlune.co.uk",
  },
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3456.4971033504817!2d-90.07737629016616!3d29.96514072222164!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8620a50056d541c1%3A0xd62188e30053c7ed!2sQorlune!5e0!3m2!1sen!2s!4v1792247708181!5m2!1sen!2s",
  phone: "+1 711-091-5975",
  whatsapp: "https://wa.me/17110915975",
  whatsappChannels: {
    general: {
      name: "Qorlune Official Desk",
      number: "+1 711-091-5975",
      url: "https://wa.me/17110915975",
      displayNumber: "+1 711-091-5975",
      description: "Direct client consultation, inquiries, enterprise proposals, and official support",
      action: "Chat with Qorlune",
      badge: "Official Line",
    },
    support: {
      name: "Technical & Client Support",
      number: "+1 711-091-5975",
      url: "https://wa.me/17110915975",
      displayNumber: "+1 711-091-5975",
      description: "24/7 client helpdesk, SLA ticket escalation, and live technical support",
      action: "Contact Support Desk",
      badge: "24/7 Support",
    },
    direct: {
      name: "Executive & Priority Desk",
      number: "+1 711-091-5975",
      url: "https://wa.me/17110915975",
      displayNumber: "+1 711-091-5975",
      description: "Executive desk, enterprise proposals & strategic partnerships",
      action: "Chat with Executive Desk",
      badge: "Priority Desk",
    },
  },
  website: "https://www.qorlune.co.uk",
  workingHours: "Monday - Friday | 9:00 AM - 6:00 PM EST",
  slogan: "Building secure digital experiences for the next generation of businesses.",
  targetClients: [
    "Startups",
    "SMEs",
    "Enterprise Organizations",
    "Government",
    "Healthcare",
    "Education",
    "Financial Services",
    "International Businesses",
  ],
  colors: {
    primary: "#111111",
    secondary: "#FFFFFF",
    accent: "#E5007D",
  },
  social: {
    github: "https://github.com/qorlune",
    linkedin: "https://linkedin.com/company/qorlune",
    twitter: "https://x.com/qorlune",
  },
};

export function getCompany(hostname?: string): CompanyData {
  let host = (hostname || "").toLowerCase();
  if (!host && typeof window !== "undefined") {
    host = window.location.hostname.toLowerCase();
  }
  if (host.includes("qorlune") || host.endsWith(".co.uk")) {
    return qorluneCompany;
  }
  return tauqeerCompany;
}

export const company: CompanyData = new Proxy(tauqeerCompany, {
  get(target, prop: keyof CompanyData) {
    const active = getCompany();
    return active[prop] ?? target[prop];
  },
});

export default company;
