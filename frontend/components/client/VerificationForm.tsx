"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, Mail, RefreshCw, Smartphone } from "lucide-react";
import { clientApiUrl, setClientToken } from "@/lib/client-auth";

export default function VerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("user") || (typeof window !== "undefined" ? sessionStorage.getItem("tmi_client_verification_user") : null) || "";
  const googleSession = searchParams.get("session") || "";
  const isGoogle = Boolean(googleSession);
  const [phone, setPhone] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [phoneSent, setPhoneSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(isGoogle);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestCode(channel: "email" | "phone") {
    setError(""); setNotice(""); setLoading(true);
    try {
      const path = isGoogle && channel === "phone" ? "/auth/client/google/phone/start" : "/auth/client/send-code";
      const body = isGoogle && channel === "phone" ? { session: googleSession, phone } : { user_id: userId, channel };
      const response = await fetch(clientApiUrl(path), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail || "Unable to send a verification code.");
      if (channel === "email") setEmailSent(true); else setPhoneSent(true);
      setNotice(payload.data?.debugCode ? `Development code: ${payload.data.debugCode}` : `A ${channel} verification code was sent.`);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to send a code."); } finally { setLoading(false); }
  }

  async function verifyCode(channel: "email" | "phone", event: FormEvent) {
    event.preventDefault(); setError(""); setNotice(""); setLoading(true);
    try {
      const path = isGoogle && channel === "phone" ? "/auth/client/google/phone/verify" : "/auth/client/verify-code";
      const body = isGoogle && channel === "phone" ? { session: googleSession, code: phoneCode } : { user_id: userId, channel, code: channel === "email" ? emailCode : phoneCode };
      const response = await fetch(clientApiUrl(path), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail || "That code could not be verified.");
      const data = payload.data;
      if (channel === "email") setEmailVerified(true); else setPhoneVerified(true);
      if (data.access_token) { setClientToken(data.access_token); router.replace("/client/dashboard"); return; }
      setNotice(`${channel === "email" ? "Email" : "Phone number"} verified. Complete the remaining step.`);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to verify this code."); } finally { setLoading(false); }
  }

  if (!isGoogle && !userId) return <div className="min-h-screen bg-[#f3f0ee] p-8 text-center"><p className="text-sm">Your verification session is missing.</p><Link href="/client/register" className="mt-4 inline-block font-semibold text-[#1c69d4]">Return to registration</Link></div>;
  return <main className="min-h-screen bg-[#f3f0ee] text-[#141413]"><div className="m-stripe" aria-hidden="true" /><section className="bg-[#1a2129] text-white"><div className="mx-auto max-w-[1000px] px-5 py-16 sm:px-8 sm:py-24"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#8fc1ff]">Secure onboarding</p><h1 className="mt-5 max-w-3xl text-[clamp(3rem,7vw,5.5rem)] font-bold uppercase leading-[0.94] tracking-[-0.04em]">Verify your<br /><span className="text-[#8fc1ff]">workspace access.</span></h1><p className="mt-7 max-w-xl text-base font-light leading-7 text-white/65">{isGoogle ? "Google confirmed your identity. Add and verify a mobile number to finish creating your client account." : "Two simple checks keep project conversations and files private: verify the email and mobile number attached to your account."}</p></div></section><div className="mx-auto max-w-[1000px] px-5 py-12 sm:px-8 sm:py-20"><div className="grid gap-5 lg:grid-cols-2">{!isGoogle ? <section className="border border-[#d8d4d1] bg-[#fcfbfa] p-6 sm:p-8"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><Mail className="h-5 w-5 text-[#1c69d4]" aria-hidden /><h2 className="text-xl font-bold uppercase">Email verification</h2></div>{emailVerified ? <CheckCircle2 className="h-5 w-5 text-[#26733b]" aria-hidden /> : null}</div><p className="mt-3 text-sm font-light leading-6 text-[#6a6a6a]">Check your inbox for a six-digit code.</p>{!emailVerified ? <form className="mt-7" onSubmit={(event) => verifyCode("email", event)}><div className="flex gap-2"><input value={emailCode} onChange={(event) => setEmailCode(event.target.value)} inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="000000" className="h-12 min-w-0 flex-1 border border-[#d8d4d1] bg-white px-4 font-mono text-lg tracking-[0.2em] outline-none focus:border-[#1c69d4]" required /><button disabled={loading || !emailSent} type="submit" className="inline-flex min-h-12 items-center gap-2 bg-[#141413] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-white disabled:opacity-40">Verify <ArrowRight className="h-3.5 w-3.5" aria-hidden /></button></div><button type="button" onClick={() => requestCode("email")} disabled={loading} className="mt-4 inline-flex min-h-10 items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#1c69d4]"><RefreshCw className="h-3.5 w-3.5" aria-hidden /> {emailSent ? "Resend email code" : "Send email code"}</button></form> : <p className="mt-7 text-sm font-semibold text-[#26733b]">Email verified.</p>}</section> : null}<section className="border border-[#d8d4d1] bg-[#fcfbfa] p-6 sm:p-8"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><Smartphone className="h-5 w-5 text-[#1c69d4]" aria-hidden /><h2 className="text-xl font-bold uppercase">Phone verification</h2></div>{phoneVerified ? <CheckCircle2 className="h-5 w-5 text-[#26733b]" aria-hidden /> : null}</div><p className="mt-3 text-sm font-light leading-6 text-[#6a6a6a]">We send one code by SMS. Use an international format.</p>{isGoogle && !phoneSent ? <div className="mt-7 flex gap-2"><input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" placeholder="+92 300 0000000" className="h-12 min-w-0 flex-1 border border-[#d8d4d1] bg-white px-4 text-sm outline-none focus:border-[#1c69d4]" /><button type="button" onClick={() => requestCode("phone")} disabled={loading || !phone} className="inline-flex min-h-12 items-center gap-2 bg-[#141413] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-white disabled:opacity-40">Send code</button></div> : !phoneVerified ? <form className="mt-7" onSubmit={(event) => verifyCode("phone", event)}><div className="flex gap-2"><input value={phoneCode} onChange={(event) => setPhoneCode(event.target.value)} inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="000000" className="h-12 min-w-0 flex-1 border border-[#d8d4d1] bg-white px-4 font-mono text-lg tracking-[0.2em] outline-none focus:border-[#1c69d4]" required /><button disabled={loading || !phoneSent} type="submit" className="inline-flex min-h-12 items-center gap-2 bg-[#141413] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-white disabled:opacity-40">Verify <ArrowRight className="h-3.5 w-3.5" aria-hidden /></button></div><button type="button" onClick={() => requestCode("phone")} disabled={loading} className="mt-4 inline-flex min-h-10 items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#1c69d4]"><RefreshCw className="h-3.5 w-3.5" aria-hidden /> {phoneSent ? "Resend SMS code" : "Send SMS code"}</button></form> : <p className="mt-7 text-sm font-semibold text-[#26733b]">Phone number verified.</p>}</section></div>{notice ? <p className="mt-6 border border-[#b9d5c2] bg-[#f2f8f3] p-4 text-sm text-[#26733b]" role="status">{notice}</p> : null}{error ? <p className="mt-6 border border-[#efb8b2] bg-[#fff5f4] p-4 text-sm text-[#a52c21]" role="alert">{error}</p> : null}<p className="mt-8 text-center text-xs font-light text-[#6a6a6a]">Need to start over? <Link href="/client/register" className="font-semibold text-[#1c69d4]">Return to registration</Link></p></div></main>;
}
