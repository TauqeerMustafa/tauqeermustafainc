"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, Mail, RefreshCw } from "lucide-react";
import { clientApiUrl, setClientToken } from "@/lib/client-auth";

export default function VerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("user") || (typeof window !== "undefined" ? sessionStorage.getItem("tmi_client_verification_user") : null) || "";
  const [emailCode, setEmailCode] = useState("");
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestCode() {
    if (!userId) return;
    setError(""); setNotice(""); setLoading(true);
    try {
      const response = await fetch(clientApiUrl("/auth/client/send-code"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: userId, channel: "email" }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail || "Unable to send a verification code.");
      setSent(true); setNotice(payload.data?.debugCode ? `Development code: ${payload.data.debugCode}` : "A verification code was sent to your email.");
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to send a code."); } finally { setLoading(false); }
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault(); setError(""); setNotice(""); setLoading(true);
    try {
      const response = await fetch(clientApiUrl("/auth/client/verify-code"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: userId, channel: "email", code: emailCode }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail || "That code could not be verified.");
      setVerified(true);
      if (payload.data.access_token) { setClientToken(payload.data.access_token); router.replace("/client/dashboard"); return; }
      setNotice("Email verified. You can now sign in to your client workspace.");
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to verify this code."); } finally { setLoading(false); }
  }

  if (!userId) return <div className="min-h-screen bg-canvas p-8 text-center"><p className="text-sm text-ink">Your verification session is missing.</p><Link href="/client/register" className="mt-4 inline-block font-semibold text-action">Return to registration</Link></div>;
  return <main className="min-h-screen bg-canvas text-ink"><div className="m-stripe" aria-hidden="true" /><section className="border-b border-line bg-surface text-ink"><div className="mx-auto max-w-[1000px] px-5 py-16 sm:px-8 sm:py-24"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-action">Secure onboarding</p><h1 className="mt-5 max-w-3xl text-[clamp(3rem,7vw,5.5rem)] font-bold uppercase leading-[0.94] tracking-[-0.04em]">Verify your<br /><span className="text-action">email address.</span></h1><p className="mt-7 max-w-xl text-base font-light leading-7 text-ink-muted">One email code confirms your account and keeps your project workspace private. No paid phone verification is required.</p></div></section><div className="mx-auto max-w-[700px] px-5 py-12 sm:px-8 sm:py-20"><section className="border border-line-2 bg-surface p-6 sm:p-8"><div className="flex items-center gap-3"><Mail className="h-5 w-5 text-action" aria-hidden /><h2 className="text-2xl font-bold uppercase">Email verification</h2>{verified ? <CheckCircle2 className="ml-auto h-5 w-5 text-[#26733b]" aria-hidden /> : null}</div><p className="mt-3 text-sm font-light leading-6 text-ink-muted">{verified ? "Your email is verified and your workspace is ready." : "Enter the six-digit code from your inbox."}</p>{!verified ? <form className="mt-8" onSubmit={verifyCode}><div className="flex flex-col gap-3 sm:flex-row"><input value={emailCode} onChange={(event) => setEmailCode(event.target.value)} inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="000000" className="h-12 min-w-0 flex-1 border border-line-2 bg-white px-4 font-mono text-lg tracking-[0.2em] outline-none focus:border-action" required /><button disabled={loading || !sent} type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 bg-ink px-5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-canvas disabled:opacity-40">Verify code <ArrowRight className="h-3.5 w-3.5" aria-hidden /></button></div><button type="button" onClick={requestCode} disabled={loading} className="mt-4 inline-flex min-h-10 items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-action"><RefreshCw className="h-3.5 w-3.5" aria-hidden /> {sent ? "Resend email code" : "Send email code"}</button></form> : <Link href="/client/login" className="mt-7 inline-flex min-h-12 items-center gap-2 bg-ink px-5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-canvas transition hover:bg-action">Continue to sign in <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link>}</section>{notice ? <p className="mt-6 border border-[#b9d5c2] bg-[#f2f8f3] p-4 text-sm text-[#26733b]" role="status">{notice}</p> : null}{error ? <p className="mt-6 border border-[#efb8b2] bg-[#fff5f4] p-4 text-sm text-[#a52c21]" role="alert">{error}</p> : null}</div></main>;
}
