import { appConfig } from "@/config/app";
import { company } from "@/data/company";

/**
 * JSON-LD Schema generators for SEO
 */

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${appConfig.siteUrl}/#organization`,
    name: company.name,
    url: appConfig.siteUrl,
    logo: `${appConfig.siteUrl}/logo-mark.svg`,
    email: company.email,
    telephone: company.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Islamabad",
      addressRegion: "Islamabad Capital Territory",
      addressCountry: "PK",
    },
    sameAs: [company.social.github, company.social.linkedin].filter(Boolean),
  };
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${appConfig.siteUrl}/#localbusiness`,
    name: company.name,
    image: `${appConfig.siteUrl}/logo-mark.svg`,
    url: appConfig.siteUrl,
    telephone: company.phone,
    email: company.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Islamabad",
      addressRegion: "ICT",
      addressCountry: "PK",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 33.6844,
      longitude: 73.0479,
    },
    priceRange: "$$",
    areaServed: [
      {
        "@type": "Country",
        name: "Pakistan",
      },
      {
        "@type": "Country",
        name: "Worldwide",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Digital Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Web Development",
            description: "Custom web application development with React, Next.js, and modern frameworks",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Cybersecurity Consulting",
            description: "Security audits, penetration testing, and security-first architecture",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "AI Automation",
            description: "AI integration, LLM applications, and intelligent automation solutions",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Cloud Engineering",
            description: "Cloud infrastructure, DevOps, and scalable system architecture",
          },
        },
      ],
    },
  };
}

export function serviceSchema(service: {
  name: string;
  description: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${appConfig.siteUrl}/services/${service.slug}#service`,
    name: service.name,
    description: service.description,
    provider: {
      "@id": `${appConfig.siteUrl}/#organization`,
    },
    areaServed: {
      "@type": "Country",
      name: "Worldwide",
    },
    url: `${appConfig.siteUrl}/services/${service.slug}`,
  };
}

export function articleSchema(article: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  author?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${appConfig.siteUrl}/blog/${article.slug}#article`,
    headline: article.title,
    description: article.description,
    image: article.image || `${appConfig.siteUrl}/logo-mark.svg`,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      "@type": "Person",
      name: article.author || "Tauqeer Mustafa",
      url: appConfig.siteUrl,
    },
    publisher: {
      "@id": `${appConfig.siteUrl}/#organization`,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${appConfig.siteUrl}/blog/${article.slug}`,
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${appConfig.siteUrl}/#website`,
    url: appConfig.siteUrl,
    name: company.name,
    description: "Full-stack web development, cybersecurity, AI automation, and cloud engineering services",
    publisher: {
      "@id": `${appConfig.siteUrl}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${appConfig.siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
