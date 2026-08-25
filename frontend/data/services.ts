export type Service = {
  id: string;
  slug: string;

  title: string;
  subtitle: string;

  category: string;

  heroImage: string;
  coverImage: string;
  gallery: string[];

  shortDescription: string;
  description: string;

  features: string[];

  benefits: string[];

  deliverables: string[];

  technologies: string[];

  industries: string[];

  process: string[];

  timeline: string;

  startingPrice: string;

  faq: {
    question: string;
    answer: string;
  }[];

  featured: boolean;

  icon: string;

  seo: {
    title: string;
    description: string;
  };
};