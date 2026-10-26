import type { Metadata } from "next";
import StoreClient from "./StoreClient";
import { DIGITAL_PRODUCTS } from "@/data/digitalStoreCatalog";

export const metadata: Metadata = {
  title: "Digital Store — Software, Playbooks & Developer Toolkits | Qorlune",
  description:
    "Official digital store for Qorlune LLC. Purchase and download production web architectures, cybersecurity penetration test runbooks, AI agent orchestrators, and developer tools.",
  openGraph: {
    title: "Qorlune Digital Store — Enterprise Software & Developer Blueprints",
    description:
      "Instant digital downloads for enterprise software architectures, cloud blueprints, and security playbooks.",
    url: "https://store.qorlune.co.uk",
    siteName: "Qorlune Digital Store",
    images: [
      {
        url: "/jampack/slide1.jpg",
        width: 1200,
        height: 630,
        alt: "Qorlune Digital Store",
      },
    ],
  },
};

export default function StorePage() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "Qorlune Digital Store",
    itemListElement: DIGITAL_PRODUCTS.map((prod, idx) => ({
      "@type": "Product",
      position: idx + 1,
      name: prod.title,
      description: prod.shortDescription,
      image: `https://store.qorlune.co.uk${prod.icon}`,
      offers: {
        "@type": "Offer",
        price: prod.price,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <StoreClient />
    </>
  );
}
