"use client";

import {
  Briefcase,
  FolderOpen,
  FileText,
  Mail,
} from "lucide-react";

import { useBlogs } from "@/hooks/useBlogs";
import { useCareers } from "@/hooks/useCareers";
import { useMessages } from "@/hooks/useMessages";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useServices } from "@/hooks/useServices";

import DashboardCard from "./DashboardCard";

export default function StatGrid() {
  const services = useServices({ pageSize: 1 });
  const portfolio = usePortfolio({ pageSize: 1 });
  const blogs = useBlogs({ pageSize: 1, publishedOnly: false });
  const messages = useMessages({ pageSize: 1, unreadOnly: true });

  const loading =
    services.isLoading || portfolio.isLoading || blogs.isLoading || messages.isLoading;

  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      <DashboardCard
        title="Services"
        value={loading ? "…" : (services.data?.data.pagination.total ?? 0)}
        subtitle="Active service lines"
        icon={Briefcase}
      />

      <DashboardCard
        title="Portfolio"
        value={loading ? "…" : (portfolio.data?.data.pagination.total ?? 0)}
        subtitle="Case studies published"
        icon={FolderOpen}
      />

      <DashboardCard
        title="Blog Posts"
        value={loading ? "…" : (blogs.data?.data.pagination.total ?? 0)}
        subtitle="Articles (all statuses)"
        icon={FileText}
      />

      <DashboardCard
        title="Unread Messages"
        value={loading ? "…" : (messages.data?.data.pagination.total ?? 0)}
        subtitle="Awaiting a response"
        icon={Mail}
      />

    </section>
  );
}
