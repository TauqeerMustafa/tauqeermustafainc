import type { Metadata } from "next";
import CompanyProfileHub from "@/components/company-profile/CompanyProfileHub";
import { buildMetadata } from "@/lib/metadata";
import { imageLibrary } from "@/data/media";
import { company } from "@/data/company";

export const metadata: Metadata = buildMetadata({
  title: "Company Profile & Capabilities | Tauqeer Mustafa Inc.",
  description:
    "Explore the official company profile of Tauqeer Mustafa Inc. (TMI). Download our complete PowerPoint pitch deck, PDF capabilities profile, and view verified engineering credentials.",
  path: "/company-profile",
  image: imageLibrary.about[0],
});

export default function PublicCompanyProfilePage() {
  return (
    <main className="min-h-screen bg-canvas py-10 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <CompanyProfileHub isEmployeePortal={false} />
      </div>
    </main>
  );
}
