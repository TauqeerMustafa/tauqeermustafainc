import type { Metadata } from "next";
import Link from "next/link";

import { Badge, Card, ImagePlaceholder, PageHero, Section, SectionHeader, TextLink } from "@/components/home/ui";
import { posts } from "@/lib/site-data";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Blog",
  description:
    "Practical guidance on engineering, cybersecurity, AI automation, cloud infrastructure, and product design.",
  path: "/blog",
  image: "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442687/tmi-bg-particles_pcaegw.jpg",
});

const imageByCategory: Record<string, string> = {
  Engineering: "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442688/tmi-hero-code_ub9idm.jpg",
  Automation: "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442690/tmi-service-ai-security_lgghxl.jpg",
  Cybersecurity: "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442692/tmi-service-cyber-shield_cly3ur.jpg",
  "Cloud Engineering": "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442692/tmi-service-global-network_cuiryi.jpg",
  "Product Design": "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442687/tmi-bg-bokeh_lffzh9.jpg",
};

export default function BlogPage() {
  const [featured, ...latest] = posts;

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Practical guidance for engineering, security, and automation leaders."
        description="Read concise perspectives on building secure platforms, evaluating operational risk, and adopting automation responsibly."
        image="https://res.cloudinary.com/b5cle1jv/image/upload/v1785442687/tmi-bg-particles_pcaegw.jpg"
        imageTitle="Field notes"
        imageCaption="Short, practical writing from the delivery team."
      />

      <Section className="bg-[#F8FAFC]" labelledBy="featured-article">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <SectionHeader
            id="featured-article"
            eyebrow="Featured article"
            title={featured.title}
            description={featured.excerpt}
            action={<TextLink href={`/blog/${featured.slug}`}>Read Feature</TextLink>}
          />
          <ImagePlaceholder
            src={imageByCategory[featured.category] ?? "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442688/tmi-hero-digital_cs7bvl.jpg"}
            title={featured.category}
            caption={featured.date}
            className="hidden lg:block"
          />
        </div>
      </Section>

      <Section className="bg-white" labelledBy="latest-posts">
        <SectionHeader id="latest-posts" eyebrow="Latest posts" title="Recent insights" />
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {latest.map((post) => (
            <Card key={post.slug} className="flex flex-col overflow-hidden p-0">
              <div className="relative h-40 w-full overflow-hidden border-b border-[#D7DEE8]">
                <ImagePlaceholder
                  src={imageByCategory[post.category] ?? "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442688/tmi-hero-digital_cs7bvl.jpg"}
                  title={post.category}
                  className="h-full"
                />
              </div>
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <div className="flex flex-wrap gap-2">
                  <Badge>{post.category}</Badge>
                  <Badge>{post.date}</Badge>
                </div>
                <h2 className="mt-5 text-xl font-semibold leading-snug text-[#0A1628]">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="transition hover:text-[#0A46A8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B5FFF]"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-4 text-base leading-7 text-[#6B7280]">{post.excerpt}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
