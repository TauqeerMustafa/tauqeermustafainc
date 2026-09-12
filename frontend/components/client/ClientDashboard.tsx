"use client";

/**
 * The client portal dashboard.
 *
 * Reads `GET /client/overview` for projects, messages and the unread counter,
 * and writes through `POST /client/messages`, `POST /client/messages/read` and
 * `PUT /auth/me`. Everything on this page is live; the counter used to be a
 * hardcoded zero and the "Profile settings" row was a dead `<span>` with an
 * arrow on it, so a client had no way to change their own name or password.
 *
 * Presentation is deliberately its own light palette rather than the staff
 * portals' `--adm-*` tokens: this surface continues the public site's look, and
 * a client never sees the admin chrome.
 */

import { FormEvent, useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  FileText,
  MailOpen,
  MessageCircle,
  Send,
  UserRound,
} from "lucide-react";

import ClientGuard from "@/components/client/ClientGuard";
import ClientShell from "@/components/client/ClientShell";
import { PageHero } from "@/components/home/ui";
import { clientFetch } from "@/lib/client-auth";
import type { ClientMessage, ClientOverview } from "@/types/client";

const STATUS_LABEL: Record<string, string> = {
  discovery: "Discovery",
  design: "Design",
  build: "Build",
  review: "Review",
  live: "Live",
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

const CARD = "border border-line bg-surface";
const LABEL = "font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted";
const EYEBROW = "font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-action";
const BUTTON =
  "inline-flex min-h-11 items-center gap-2 bg-ink px-4 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-canvas transition hover:bg-action disabled:opacity-50";
const INPUT =
  "mt-2 w-full border border-line bg-card px-4 py-3 text-sm font-light leading-6 outline-none focus:border-action disabled:bg-line/20 disabled:text-ink-muted";

export default function ClientDashboard() {
  const [overview, setOverview] = useState<ClientOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    clientFetch<ClientOverview>("/client/overview")
      .then(setOverview)
      .catch((requestError: unknown) =>
        setError(requestError instanceof Error ? requestError.message : "Unable to load your workspace."),
      )
      .finally(() => setLoading(false));
  }, []);

  const firstName = overview?.user.name.split(" ")[0] ?? "";

  return (
    <ClientGuard>
      <ClientShell>
        <main>
          <PageHero
            eyebrow="Private Workspace // Client Portal"
            title="Your work, clearly in view."
            description={
              overview
                ? `Good to see you, ${firstName}. Here is the latest signal from your TMI projects.`
                : "Loading your latest project signal…"
            }
          />

          <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 sm:py-20 lg:px-12">
            {loading ? (
              <div className={`${CARD} p-8 text-sm text-ink-muted`}>Loading your workspace…</div>
            ) : error && !overview ? (
              <div className="border border-rose-500/30 bg-rose-500/10 p-5 text-sm text-rose-600" role="alert">
                {error}
              </div>
            ) : overview ? (
              <>
                <StatRow overview={overview} />
                <div className="mt-16 grid gap-16 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-24">
                  <ProjectList overview={overview} />
                  <Messages overview={overview} onChange={setOverview} />
                </div>
                <AccountSection overview={overview} onChange={setOverview} />
              </>
            ) : null}
          </div>
        </main>
      </ClientShell>
    </ClientGuard>
  );
}

function StatRow({ overview }: { overview: ClientOverview }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className={`${CARD} p-6`}>
        <p className={LABEL}>Active projects</p>
        <p className="mt-4 text-3xl font-bold text-ink">{overview.projects.length}</p>
      </div>
      <div className={`${CARD} p-6`}>
        <p className={LABEL}>Unread replies</p>
        <p
          className="mt-4 text-3xl font-bold"
          style={{ color: overview.unreadMessages > 0 ? "var(--action, #1c69d4)" : "inherit" }}
        >
          {overview.unreadMessages}
        </p>
      </div>
      <div className={`${CARD} p-6`}>
        <p className={LABEL}>Access</p>
        <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
          <CheckCircle2 className="h-4 w-4" aria-hidden /> Verified
        </p>
      </div>
    </div>
  );
}

function ProjectList({ overview }: { overview: ClientOverview }) {
  return (
    <section>
      <div className="flex items-end justify-between border-b border-line pb-5">
        <div>
          <p className={EYEBROW}>Delivery view</p>
          <h2 className="mt-3 text-3xl font-bold uppercase tracking-[-0.03em] text-ink">Your projects</h2>
        </div>
        <FileText className="h-5 w-5 text-ink-muted" aria-hidden />
      </div>

      {overview.projects.length === 0 ? (
        <div className="mt-6 border border-dashed border-line-2 bg-surface p-10 text-center">
          <FileText className="mx-auto h-6 w-6 text-ink-muted" aria-hidden />
          <p className="mt-4 font-semibold uppercase text-ink">No projects assigned yet</p>
          <p className="mt-2 text-sm font-light leading-6 text-ink-muted">
            Your project workspace will appear here as soon as the TMI team sets it up.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {overview.projects.map((project) => (
            <article key={project.id} className={`${CARD} p-6`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold uppercase text-ink">{project.name}</h3>
                  <p className="mt-2 max-w-xl text-sm font-light leading-6 text-ink-muted">
                    {project.summary || "Your TMI team will add the next project update here."}
                  </p>
                </div>
                <span className="border border-action/20 bg-action/[0.08] px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-action">
                  {STATUS_LABEL[project.status] || project.status}
                </span>
              </div>
              <div className="mt-7">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="mt-2 h-2 bg-line-2">
                  <div
                    className="h-2 bg-action"
                    style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-light text-ink-muted">
                <Clock3 className="h-3.5 w-3.5 text-action" aria-hidden /> Next milestone:{" "}
                <span className="font-semibold text-ink">
                  {project.nextMilestone || "To be confirmed"}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function Messages({
  overview,
  onChange,
}: {
  overview: ClientOverview;
  onChange: (next: ClientOverview) => void;
}) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [marking, setMarking] = useState(false);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setSent(false);
    setError("");
    try {
      const created = await clientFetch<ClientMessage>("/client/messages", {
        method: "POST",
        body: JSON.stringify({ body: message }),
      });
      onChange({ ...overview, messages: [created, ...overview.messages] });
      setMessage("");
      setSent(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to send your message.");
    } finally {
      setSending(false);
    }
  }

  /** Clears the unread counter server-side so it survives a reload. */
  async function markRead() {
    setMarking(true);
    setError("");
    try {
      await clientFetch<{ markedRead: number }>("/client/messages/read", { method: "POST" });
      onChange({
        ...overview,
        unreadMessages: 0,
        messages: overview.messages.map((item) =>
          item.fromTeam && !item.readAt ? { ...item, readAt: new Date().toISOString() } : item,
        ),
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update your messages.");
    } finally {
      setMarking(false);
    }
  }

  return (
    <section id="messages" className="scroll-mt-24">
      <div className="flex items-end justify-between border-b border-line pb-5">
        <div>
          <p className={EYEBROW}>Direct line</p>
          <h2 className="mt-3 text-3xl font-bold uppercase tracking-[-0.03em] text-ink">Messages</h2>
        </div>
        <MessageCircle className="h-5 w-5 text-ink-muted" aria-hidden />
      </div>

      <form onSubmit={send} className={`mt-6 ${CARD} p-5`}>
        <label htmlFor="client-message" className={LABEL}>
          Send a note to your TMI team
        </label>
        <textarea
          id="client-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          placeholder="Ask a question or share the next decision..."
          className={`${INPUT} mt-4 resize-y`}
        />
        <button disabled={sending} type="submit" className={`${BUTTON} mt-3`}>
          {sending ? "Sending..." : "Send message"}
          <Send className="h-3.5 w-3.5" aria-hidden />
        </button>
        {sent ? <p className="mt-3 text-xs text-emerald-600">Message sent to your TMI team.</p> : null}
        {error ? (
          <p className="mt-3 text-xs text-rose-600" role="alert">
            {error}
          </p>
        ) : null}
      </form>

      {overview.unreadMessages > 0 ? (
        <button
          type="button"
          onClick={markRead}
          disabled={marking}
          className="mt-4 inline-flex items-center gap-2 border border-action/20 bg-action/[0.08] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-action transition hover:border-action disabled:opacity-50"
        >
          <MailOpen className="h-3.5 w-3.5" aria-hidden />
          {marking ? "Marking…" : `Mark ${overview.unreadMessages} as read`}
        </button>
      ) : null}

      <div className="mt-6 space-y-4">
        {overview.messages.length === 0 ? (
          <p className="border-t border-line pt-4 text-sm font-light leading-6 text-ink-muted">
            No messages yet. Send the first note when you are ready.
          </p>
        ) : (
          overview.messages.slice(0, 8).map((item) => (
            <div key={item.id} className="border-t border-line pt-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-ink">
                  {item.authorName}
                  {item.fromTeam ? (
                    <span className="ml-2 border border-action/20 bg-action/[0.08] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-action">
                      TMI
                    </span>
                  ) : null}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-ink-muted">
                  {formatDate(item.createdAt)}
                </span>
              </div>
              <p className="mt-2 text-sm font-light leading-6 text-ink-muted">{item.body}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

/**
 * Real profile settings. This replaces a decorative "Profile settings →" row
 * that looked like a link but had no handler, leaving clients with no way to
 * change their own name, phone or password. Email stays read-only because it is
 * the verified login identity.
 */
function AccountSection({
  overview,
  onChange,
}: {
  overview: ClientOverview;
  onChange: (next: ClientOverview) => void;
}) {
  const [name, setName] = useState(overview.user.name);
  const [phone, setPhone] = useState(overview.user.phone ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");
    if (!name.trim()) {
      setError("Your name cannot be empty.");
      return;
    }
    setBusy(true);
    try {
      const updated = await clientFetch<ClientOverview["user"]>("/auth/me", {
        method: "PUT",
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });
      onChange({ ...overview, user: updated });
      setNotice("Profile updated.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update your profile.");
    } finally {
      setBusy(false);
    }
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");
    if (!currentPassword || !newPassword) {
      setError("Enter your current and new password.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Your new password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Your new password and confirmation do not match.");
      return;
    }
    setBusy(true);
    try {
      await clientFetch("/auth/me", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNotice("Password changed.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to change your password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="settings" className="mt-16 scroll-mt-24 border-t border-line pt-10">
      <div className="flex items-end justify-between border-b border-line pb-5">
        <div>
          <p className={EYEBROW}>Account</p>
          <h2 className="mt-3 text-3xl font-bold uppercase tracking-[-0.03em] text-ink">Profile settings</h2>
        </div>
        <UserRound className="h-5 w-5 text-ink-muted" aria-hidden />
      </div>

      {notice ? (
        <p className="mt-6 border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">{notice}</p>
      ) : null}
      {error ? (
        <p className="mt-6 border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form onSubmit={saveProfile} className={`${CARD} p-6`}>
          <div>
            <label htmlFor="client-name" className={LABEL}>
              Full name
            </label>
            <input
              id="client-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={INPUT}
            />
          </div>
          <div className="mt-5">
            <label htmlFor="client-email" className={LABEL}>
              Email
            </label>
            <input id="client-email" value={overview.user.email} readOnly disabled className={INPUT} />
            <p className="mt-2 text-xs font-light text-ink-muted">
              This is your verified sign-in address. Contact your TMI team to change it.
            </p>
          </div>
          <div className="mt-5">
            <label htmlFor="client-phone" className={LABEL}>
              Phone
            </label>
            <input
              id="client-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={INPUT}
              placeholder="Optional"
            />
          </div>
          <button type="submit" disabled={busy} className={`${BUTTON} mt-6`}>
            Save profile
          </button>
        </form>

        <form onSubmit={savePassword} className={`${CARD} p-6`}>
          <div>
            <label htmlFor="client-current-password" className={LABEL}>
              Current password
            </label>
            <input
              id="client-current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className={INPUT}
            />
          </div>
          <div className="mt-5">
            <label htmlFor="client-new-password" className={LABEL}>
              New password
            </label>
            <input
              id="client-new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className={INPUT}
            />
          </div>
          <div className="mt-5">
            <label htmlFor="client-confirm-password" className={LABEL}>
              Confirm new password
            </label>
            <input
              id="client-confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={INPUT}
            />
          </div>
          <button type="submit" disabled={busy} className={`${BUTTON} mt-6`}>
            Change password
          </button>
        </form>
      </div>
    </section>
  );
}
