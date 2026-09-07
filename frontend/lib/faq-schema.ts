/**
 * FAQ Schema Component
 * Add this to pages where you answer common questions to get featured snippet eligibility
 */

import { appConfig } from "@/config/app";

interface FAQItem {
  question: string;
  answer: string;
}

export function faqSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// Common FAQs for homepage or about page
export const commonFAQs: FAQItem[] = [
  {
    question: "What services does Tauqeer Mustafa Inc. provide?",
    answer: "We provide full-stack web development, cybersecurity consulting, AI automation, cloud engineering, and product design services. Our security-first approach ensures every project is built with robust protection from day one.",
  },
  {
    question: "Where is Tauqeer Mustafa Inc. located?",
    answer: "We are based in Islamabad, Pakistan, and serve clients both locally and internationally across multiple time zones.",
  },
  {
    question: "Do you work with international clients?",
    answer: "Yes, we work with businesses worldwide. Our team is experienced in remote collaboration and has successfully delivered projects for clients across different countries and time zones.",
  },
  {
    question: "What makes your agency security-first?",
    answer: "Every engagement includes security considerations from the initial architecture phase. We conduct security audits, implement secure coding practices, perform penetration testing, and ensure compliance with industry standards like OWASP Top 10.",
  },
  {
    question: "How long does a typical web development project take?",
    answer: "Project timelines vary based on complexity and scope. A standard website takes 4-8 weeks, while complex web applications can take 12-24 weeks. We provide detailed timelines after understanding your specific requirements.",
  },
];

// Service-specific FAQs
export const webDevelopmentFAQs: FAQItem[] = [
  {
    question: "What technologies do you use for web development?",
    answer: "We specialize in React, Next.js, TypeScript, Node.js, Python (FastAPI/Django), PostgreSQL, and modern cloud platforms (AWS, Vercel, Render). We choose technologies based on project requirements and long-term maintainability.",
  },
  {
    question: "Do you provide ongoing maintenance after launch?",
    answer: "Yes, we offer post-launch support and maintenance packages that include security updates, bug fixes, performance optimization, and feature enhancements.",
  },
  {
    question: "Can you migrate an existing website to a modern stack?",
    answer: "Absolutely. We specialize in modernizing legacy applications, migrating from WordPress/PHP to React/Next.js, and improving performance and security through modern architecture.",
  },
];

export const cybersecurityFAQs: FAQItem[] = [
  {
    question: "What does a security audit include?",
    answer: "Our security audits include vulnerability scanning, penetration testing, code review, infrastructure assessment, compliance checking (OWASP, GDPR), and a detailed report with remediation recommendations.",
  },
  {
    question: "Are you certified in cybersecurity?",
    answer: "Yes, our team holds CompTIA Security+ certification and follows industry-standard methodologies including OWASP guidelines and NIST frameworks.",
  },
  {
    question: "How often should a business conduct security audits?",
    answer: "We recommend quarterly security audits for production applications, especially after major feature releases or infrastructure changes. High-risk systems should be audited more frequently.",
  },
];
