import Link from "next/link";

import { Badge, Card, PageHero, Section, SectionHeader, TextLink } from "@/components/home/ui";
import { posts } from "@/lib/site-data";

export default function BlogPage() {
  const [featured, ...latest] = posts;

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Practical guidance for engineering, security, and automation leaders."
        description="Read concise perspectives on building secure platforms, evaluating operational risk, and adopting automation responsibly."
      />

      <Section className="bg-[#F8FAFC]" labelledBy="featured-article">
        <SectionHeader
          id="featured-article"
          eyebrow="Featured article"
          title={featured.title}
          description={featured.excerpt}
          action={<TextLink href={`/blog/${featured.slug}`}>Read Feature</TextLink>}
        />
      </Section>

      <Section className="bg-white" labelledBy="latest-posts">
        <SectionHeader id="latest-posts" eyebrow="Latest posts" title="Recent insights" />
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {latest.map((post) => (
            <Card key={post.slug}>
              <div className="flex flex-wrap gap-2">
                <Badge>{post.category}</Badge>
                <Badge>{post.date}</Badge>
              </div>
              <h2 className="mt-5 text-xl font-semibold leading-snug text-[#111827]">
                <Link
                  href={`/blog/${post.slug}`}
                  className="transition hover:text-[#A67C00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A227]"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="mt-4 text-base leading-7 text-[#6B7280]">{post.excerpt}</p>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
