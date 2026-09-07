import type { Metadata } from "next";
import CommunityMembersView from "@/components/community/CommunityMembersView";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Members | TMI Community",
  description: "Meet the builders, designers, security practitioners, and leaders making up the TMI community.",
  path: "/community/members",
});

export default function CommunityMembersPage() {
  return <CommunityMembersView />;
}
