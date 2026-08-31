"use client";

import { AlertTriangle, Edit, Megaphone, Plus, Trash2 } from "lucide-react";

import { useAnnouncements } from "@/hooks/useAnnouncements";
import type { Announcement } from "@/types";

export default function AnnouncementsPage({ isAdmin = false }) {
  // Employees only see what has been published; admins also see drafts so they
  // can manage them. The list endpoint is public, so both roles can read it.
  const { data, isLoading, isError, error } = useAnnouncements(
    isAdmin ? { pageSize: 50 } : { pageSize: 50, publishedOnly: true },
  );
  const announcements: Announcement[] = data?.data.items ?? [];

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full h-full min-h-[70vh]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase" style={{ color: "var(--adm-text)" }}>Company Announcements</h1>
          <p className="text-sm mt-1" style={{ color: "var(--adm-text-3)" }}>
            {isAdmin ? "Manage and broadcast news to all employees." : "Stay up to date with the latest company news."}
          </p>
        </div>
        {isAdmin && (
          <button className="flex items-center gap-2 bg-adm-blue px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90">
            <Plus size={16} /> New Broadcast
          </button>
        )}
      </div>

      <div className="flex flex-col gap-6 mt-4">
        {isLoading ? (
          <div className="p-12 text-center animate-pulse" style={{ color: "var(--adm-text-3)" }}>Loading announcements…</div>
        ) : isError ? (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-adm-surface border" style={{ borderColor: "var(--adm-red)" }}>
            <AlertTriangle size={40} className="mb-4" style={{ color: "var(--adm-red)" }} />
            <p className="font-bold text-adm-text">Could not load announcements</p>
            <p className="text-sm text-adm-text-3">{error instanceof Error ? error.message : "Confirm the backend is running and reachable."}</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-adm-surface border border-adm-border">
            <Megaphone size={48} className="mb-4" style={{ color: "var(--adm-text-3)" }} />
            <p className="font-bold text-adm-text">No Announcements</p>
            <p className="text-sm text-adm-text-3">There is no news to share right now.</p>
          </div>
        ) : (
          announcements.map((item) => (
            <div key={item.id} className="border border-adm-border bg-adm-surface p-8 flex flex-col hover:border-adm-blue transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-adm-blue-light text-adm-blue flex items-center justify-center">
                    <Megaphone size={18} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold uppercase text-adm-text">{item.title}</h2>
                    <p className="text-xs text-adm-text-3 font-semibold mt-0.5">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    {!item.isPublished && <span className="bg-adm-amber-light text-adm-amber text-[10px] uppercase font-bold tracking-wider px-2 py-1">Draft</span>}
                    <button className="h-8 w-8 rounded-full hover:bg-adm-surface-2 flex items-center justify-center text-adm-text-3 hover:text-adm-blue transition" aria-label="Edit announcement"><Edit size={14} /></button>
                    <button className="h-8 w-8 rounded-full hover:bg-adm-red-light flex items-center justify-center text-adm-text-3 hover:text-adm-red transition" aria-label="Delete announcement"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
              <p className="text-adm-text-2 whitespace-pre-wrap leading-relaxed mt-2">{item.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
