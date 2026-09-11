import type { Metadata } from "next";
import CompanyProfileHub from "@/components/company-profile/CompanyProfileHub";

export const metadata: Metadata = {
  title: "Company Profile & Client Kit | Admin Portal",
  description:
    "Official company profile, downloadable PPTX/PDF decks, verified credentials registry, and sales enablement outreach templates for administrators.",
};

export default function AdminCompanyProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <CompanyProfileHub isEmployeePortal={true} />
    </div>
  );
}
