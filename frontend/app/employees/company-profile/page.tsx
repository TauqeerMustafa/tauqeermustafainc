import type { Metadata } from "next";
import CompanyProfileHub from "@/components/company-profile/CompanyProfileHub";

export const metadata: Metadata = {
  title: "Company Profile & Client Kit | Staff Portal",
  description:
    "Official company profile, downloadable PPTX/PDF decks, verified credentials registry, and sales enablement outreach templates for employees.",
};

export default function EmployeeCompanyProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <CompanyProfileHub isEmployeePortal={true} />
    </div>
  );
}
