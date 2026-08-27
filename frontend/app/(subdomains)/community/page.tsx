import type { Metadata } from "next";
import CommunityHub from "@/components/community/CommunityHub";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Community | Tauqeer Mustafa Inc.",
  description: "Join the TMI community: thoughtful conversations about building products, strengthening systems, and learning together.",
  path: "/community",
});

export default function CommunityPage() {
  return <CommunityHub />;
}
