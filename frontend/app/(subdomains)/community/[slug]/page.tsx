import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CommunityPostView from "@/components/community/CommunityPostView";
import { communityPosts, getCommunityPost } from "@/data/community";
import { buildMetadata } from "@/lib/metadata";

export function generateStaticParams() {
  return communityPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getCommunityPost(slug);
  if (!post) return buildMetadata({ title: "Community post not found | TMI", description: "This community conversation could not be found.", path: `/community/${slug}`, noIndex: true });
  return buildMetadata({ title: `${post.title} | TMI Community`, description: post.excerpt, path: `/community/${post.slug}` });
}

export default async function CommunityPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getCommunityPost(slug);
  if (!post) notFound();
  return <CommunityPostView post={post} />;
}
