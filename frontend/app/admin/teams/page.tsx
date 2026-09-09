"use client";

import PeopleBanner from "@/components/portal/PeopleBanner";
import { TeamsManagement } from "@/components/admin/teams/TeamsManagement";

export default function AdminTeamsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PeopleBanner active="teams" />
      <TeamsManagement />
    </div>
  );
}
