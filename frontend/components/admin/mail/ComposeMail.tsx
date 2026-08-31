"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { Field, PortalButton, PortalDialog, inputClass } from "@/components/portal/PortalUI";

type Mailbox = { id: string; primaryAddress: string };

/**
 * In-app compose against the company's *own* OpenEmail mailbox.
 *
 * Replaces the old `mailto:` hand-off, which opened whatever external mail
 * client the browser/OS was configured for ("the outsider") instead of the
 * webmail the portal already authenticates. Posts through `/api/mail/send`,
 * which holds the OPENEMAIL server key — so this stays a client component with
 * no secret in it.
 *
 * Opens automatically when the page is reached with `?compose` or `?to=…`
 * (that's how "Reply by email" on the Messages screen lands here pre-addressed).
 */
export function ComposeMail({
  mailboxes,
  activeMailboxId,
  initialTo = "",
  initialSubject = "",
  autoOpen = false,
}: {
  mailboxes: Mailbox[];
  activeMailboxId: string;
  initialTo?: string;
  initialSubject?: string;
  autoOpen?: boolean;
}) {
  const [open, setOpen] = useState(autoOpen);
  const [fromId, setFromId] = useState(activeMailboxId);
  const [to, setTo] = useState(initialTo);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const fromAddress = mailboxes.find((m) => m.id === fromId)?.primaryAddress ?? "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    setSent(false);
    try {
      const res = await fetch("/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: fromId,
          fromAddress,
          toAddress: to.trim(),
          subject: subject.trim(),
          content: body,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send the message.");
      setSent(true);
      setBody("");
      setTimeout(() => setOpen(false), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-press px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white transition hover:opacity-90"
        style={{ background: "var(--adm-blue)" }}
      >
        Compose
      </button>

      <PortalDialog open={open} title="New message" onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="grid gap-5">
          <Field label="From" htmlFor="cm-from">
            <select
              id="cm-from"
              className={inputClass}
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
            >
              {mailboxes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.primaryAddress}
                </option>
              ))}
            </select>
          </Field>
          <Field label="To" htmlFor="cm-to">
            <input
              id="cm-to"
              type="email"
              required
              className={inputClass}
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="name@example.com"
            />
          </Field>
          <Field label="Subject" htmlFor="cm-subject">
            <input
              id="cm-subject"
              required
              className={inputClass}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </Field>
          <Field label="Message" htmlFor="cm-body">
            <textarea
              id="cm-body"
              required
              rows={8}
              className={inputClass}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </Field>

          {error && <p className="text-sm font-medium text-adm-red">{error}</p>}
          {sent && <p className="text-sm font-medium text-adm-green">Sent.</p>}

          <div className="flex items-center justify-end gap-3">
            <PortalButton variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </PortalButton>
            <PortalButton type="submit" icon={Send} disabled={sending}>
              {sending ? "Sending…" : "Send"}
            </PortalButton>
          </div>
        </form>
      </PortalDialog>
    </>
  );
}
