"use client";

import Link from "next/link";
import { Mail, MailOpen, ArrowRight } from "lucide-react";
import { useMessages } from "@/hooks/useMessages";

export default function RecentActivity() {
  const { data, isLoading, isError } = useMessages({ pageSize: 5 });
  const messages = data?.data.items ?? [];

  return (
    <section
      className="border p-5"
      style={{ background: "var(--adm-surface)", borderColor: "var(--adm-border)" }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold" style={{ color: "var(--adm-text)" }}>
          Recent Messages
        </h2>
        <Link
          href="/admin/messages"
          className="flex items-center gap-1 text-xs font-semibold transition hover:underline"
          style={{ color: "var(--adm-blue)" }}
        >
          View all <ArrowRight size={12} />
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-14 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm" style={{ color: "var(--adm-red)" }}>
          Could not load recent messages.
        </p>
      )}

      {!isLoading && !isError && messages.length === 0 && (
        <p className="text-sm" style={{ color: "var(--adm-text-3)" }}>
          No messages yet. Contact form submissions appear here.
        </p>
      )}

      <div className="space-y-2">
        {messages.map((message, i) => (
          <Link
            key={message.id}
            href="/admin/messages"
            className="adm-card flex items-start gap-3 p-3.5"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center border"
              style={{
                background: message.isRead ? "var(--adm-surface-2)" : "var(--adm-blue-light)",
                borderColor: message.isRead ? "var(--adm-border)" : "var(--adm-blue-mid)",
                color: message.isRead ? "var(--adm-text-3)" : "var(--adm-blue)",
              }}
            >
              {message.isRead ? <MailOpen size={15} /> : <Mail size={15} />}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold" style={{ color: "var(--adm-text)" }}>
                {message.name}
                {message.company ? (
                  <span className="font-normal" style={{ color: "var(--adm-text-3)" }}>
                    {" · "}{message.company}
                  </span>
                ) : null}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: "var(--adm-text-3)" }}>
                {new Date(message.createdAt).toLocaleString()}
              </p>
            </div>

            {!message.isRead && (
              <span
                className="mt-1 h-2 w-2 shrink-0 rounded-full"
                style={{ background: "var(--adm-blue)" }}
              />
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
