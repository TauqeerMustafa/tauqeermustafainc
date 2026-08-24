import type { Metadata } from "next";

import { PageHero, Section, SectionHeader, TextLink, ImagePlaceholder } from "@/components/home/ui";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { posts } from "@/lib/site-data";
import { buildMetadata } from "@/lib/metadata";
import { readingTime } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Blog",
  description:
    "Practical guidance on engineering, cybersecurity, AI automation, cloud infrastructure, and product design.",
  path: "/blog",
  image: "https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=1600&q=80",
});

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1600&q=80";

const imageByCategory: Record<string, string> = {
  Engineering: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?auto=format&fit=crop&w=1600&q=80",
  Automation: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1600&q=80",
  Cybersecurity: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1600&q=80",
  "Cloud Engineering": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80",
  "Product Design": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80",
  Culture: "https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=1600&q=80",
  "Product Strategy": "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1600&q=80",
};

export default function BlogPage() {
  const [featured, ...rest] = posts;

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Practical guidance for engineering, security, and automation leaders."
        description="Read concise perspectives on building secure platforms, evaluating operational risk, and adopting automation responsibly."
        image="https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=1600&q=80"
        imageTitle="Field notes"
        imageCaption="Short, practical writing from the delivery team."
      />

      <Section className="bg-[#FAFAFA]" labelledBy="featured-article">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <SectionHeader
            id="featured-article"
            eyebrow="Featured article"
            title={featured.title}
            description={featured.excerpt}
            action={<TextLink href={`/blog/${featured.slug}`}>Read Feature · {readingTime(featured.body)}</TextLink>}
          />
          <ImagePlaceholder
            src={imageByCategory[featured.category] ?? FALLBACK_IMAGE}
            title={featured.category}
            caption={featured.date}
            className="hidden lg:block"
          />
        </div>
      </Section>

      <Section className="bg-white" labelledBy="latest-posts">
        <SectionHeader
          id="latest-posts"
          eyebrow="Latest posts"
          title="Recent insights"
          description={`${posts.length} articles across engineering, security, cloud, design, and how we work.`}
        />
        <div className="mt-10">
          <BlogGrid posts={rest} imageByCategory={imageByCategory} fallbackImage={FALLBACK_IMAGE} />
        </div>
      </Section>
    </>
  );
}
