"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, AlertTriangle, ExternalLink } from "lucide-react";

export default function MailInbox() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/mail/inbox")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load inbox");
        return res.json();
      })
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setData(json);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-[40px] border border-[var(--adm-border)] bg-[var(--adm-surface)] shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--adm-blue)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center rounded-[40px] border border-red-200 bg-red-50 text-red-600 shadow-sm">
        <AlertTriangle className="mb-2 h-8 w-8" />
        <p className="font-medium">{error}</p>
        <p className="mt-2 text-sm text-red-500">Could not fetch your Zoho Mail inbox.</p>
      </div>
    );
  }

  const messages = data?.messages || [];

  return (
    <div className="rounded-[40px] border border-[var(--adm-border)] bg-[var(--adm-surface)] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b px-6 py-4 border-[var(--adm-border)]">
        <h3 className="text-lg font-bold" style={{ color: "var(--adm-text)" }}>Inbox ({data?.account?.primaryEmailAddress})</h3>
        <a
          href="https://mail.zoho.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#CF4500] hover:underline"
        >
          Open Zoho <ExternalLink size={14} />
        </a>
      </div>
      <div className="divide-y border-t border-[var(--adm-border)]" style={{ borderColor: "var(--adm-border)" }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--adm-text-3)]">
            <Mail className="mb-2 h-8 w-8 opacity-50" />
            <p>Your inbox is empty.</p>
          </div>
        ) : (
          messages.map((msg: any) => (
            <div key={msg.messageId} className="flex flex-col px-6 py-4 hover:bg-[var(--adm-bg)] transition cursor-pointer">
              <div className="flex items-center justify-between">
                <p className="font-semibold" style={{ color: "var(--adm-text)" }}>{msg.sender}</p>
                <span className="text-xs" style={{ color: "var(--adm-text-3)" }}>
                  {new Date(parseInt(msg.receivedTime)).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium" style={{ color: "var(--adm-text-2)" }}>{msg.subject}</p>
              <p className="mt-1 text-xs truncate" style={{ color: "var(--adm-text-3)" }}>{msg.summary}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

