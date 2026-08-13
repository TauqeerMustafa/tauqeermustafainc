"use client";

import { Briefcase, FolderOpen, FileText, Mail } from "lucide-react";

import { useBlogs } from "@/hooks/useBlogs";
import { useMessages } from "@/hooks/useMessages";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useServices } from "@/hooks/useServices";

import DashboardCard from "./DashboardCard";

export default function StatGrid() {
  const services  = useServices({ pageSize: 1 });
  const portfolio = usePortfolio({ pageSize: 1 });
  const blogs     = useBlogs({ pageSize: 1, publishedOnly: false });
  const messages  = useMessages({ pageSize: 1, unreadOnly: true });

  const loading =
    services.isLoading || portfolio.isLoading || blogs.isLoading || messages.isLoading;

  const cards = [
    {
      title: "Services",
      value: loading ? "…" : (services.data?.data.pagination.total ?? 0),
      subtitle: "Active service lines",
      icon: Briefcase,
      color: "blue" as const,
      trend: 5,
    },
    {
      title: "Portfolio",
      value: loading ? "…" : (portfolio.data?.data.pagination.total ?? 0),
      subtitle: "Case studies published",
      icon: FolderOpen,
      color: "green" as const,
      trend: 12,
    },
    {
      title: "Blog Posts",
      value: loading ? "…" : (blogs.data?.data.pagination.total ?? 0),
      subtitle: "Articles (all statuses)",
      icon: FileText,
      color: "amber" as const,
      trend: 3,
    },
    {
      title: "Unread Messages",
      value: loading ? "…" : (messages.data?.data.pagination.total ?? 0),
      subtitle: "Awaiting a response",
      icon: Mail,
      color: "red" as const,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, i) => (
        <div
          key={card.title}
          className="animate-fade-up"
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          <DashboardCard {...card} />
        </div>
      ))}
    </section>
  );
}
