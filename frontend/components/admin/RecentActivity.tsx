"use client";

import Link from "next/link";
import { Mail, MailOpen } from "lucide-react";

import { useMessages } from "@/hooks/useMessages";

export default function RecentActivity() {
  const { data, isLoading, isError } = useMessages({ pageSize: 5 });
  const messages = data?.data.items ?? [];

  return (
    <section className="rounded-none border border-white/10 bg-white/5 p-6 backdrop-blur-xl">

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Recent Messages
        </h2>
        <Link href="/admin/messages" className="text-sm font-semibold text-yellow-400 hover:underline">
          View all
        </Link>
      </div>

      {isLoading ? <p className="text-sm text-slate-400">Loading...</p> : null}
      {isError ? <p className="text-sm text-red-400">Could not load recent messages.</p> : null}
      {!isLoading && !isError && messages.length === 0 ? (
        <p className="text-sm text-slate-400">No messages yet. New contact form submissions will show up here.</p>
      ) : null}

      <div className="space-y-3">

        {messages.map((message) => (
          <Link
            key={message.id}
            href="/admin/messages"
            className="flex items-start gap-4 rounded-none border border-white/10 bg-[#08101F] p-4 transition hover:border-yellow-400/50"
          >
            <div className="rounded-none bg-yellow-400/10 p-3 text-yellow-400">
              {message.isRead ? <MailOpen size={20} /> : <Mail size={20} />}
            </div>

            <div className="min-w-0">
              <h3 className="truncate font-semibold text-white">
                {message.name}{message.company ? ` · ${message.company}` : ""}
              </h3>

              <p className="mt-1 truncate text-sm text-slate-400">
                {new Date(message.createdAt).toLocaleString()}
              </p>
            </div>
          </Link>
        ))}

      </div>

    </section>
  );
}
