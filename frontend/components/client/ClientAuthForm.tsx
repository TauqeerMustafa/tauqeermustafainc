"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, Mail, ShieldCheck } from "lucide-react";
import { clientApiUrl, setClientToken } from "@/lib/client-auth";

type Props = { mode: "login" | "register" };

export default function ClientAuthForm({ mode }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isRegister = mode === "register";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(clientApiUrl(isRegister ? "/auth/client/register" : "/auth/client/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isRegister ? form : { email: form.email, password: form.password }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail || "Unable to complete this request.");
      if (isRegister) {
        const userId = payload.data.userId || payload.data.user_id;
        sessionStorage.setItem("tmi_client_verification_user", userId);
        router.push(`/client/verify?user=${userId}`);
      } else {
        setClientToken(payload.data.access_token);
        router.push("/client/dashboard");
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to complete this request.");
    } finally {
      setLoading(false);
    }
  }

  return <div className="min-h-screen bg-[#f3f0ee] text-[#141413]"><div className="m-stripe" aria-hidden="true" /><div className="border-b border-[#262626] bg-[#1a2129] text-white"><div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12"><Link href="/" className="font-mono text-[11px] font-bold uppercase tracking-[0.14em]">TAUQEER MUSTAFA INC.</Link><Link href={isRegister ? "/client/login" : "/client/register"} className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white/65 transition hover:text-white">{isRegister ? "Already have an account? Sign in" : "Create a client account"}</Link></div></div><div className="mx-auto grid max-w-[1200px] gap-14 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-center lg:px-12"><div><div className="flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#1c69d4]"><span className="h-px w-8 bg-[#1c69d4]" /> Client portal</div><h1 className="mt-6 text-[clamp(3rem,7vw,6rem)] font-bold uppercase leading-[0.94] tracking-[-0.04em]">{isRegister ? "Your project. One clear place." : "Welcome back to your workspace."}</h1><p className="mt-7 max-w-xl text-base font-light leading-7 text-[#5a5a5a]">{isRegister ? "Create your secure account to follow delivery, share context, review milestones, and keep every project conversation moving." : "Sign in to review project progress, messages, files, and the next decisions waiting for your team."}</p><div className="mt-9 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">{[{ icon: ShieldCheck, label: "Private by design" }, { icon: CheckCircle2, label: "Verified access" }, { icon: Mail, label: "One source of truth" }].map(({ icon: Icon, label }) => <div key={label} className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#5a5a5a]"><Icon className="h-4 w-4 text-[#1c69d4]" aria-hidden />{label}</div>)}</div></div><div className="border border-[#d8d4d1] bg-[#fcfbfa] p-6 shadow-[0_20px_60px_rgba(20,20,19,0.06)] sm:p-8"><h2 className="text-2xl font-bold uppercase tracking-[-0.02em]">{isRegister ? "Create account" : "Client sign in"}</h2><p className="mt-2 text-sm font-light leading-6 text-[#6a6a6a]">{isRegister ? "Use a working email and mobile number. Both will receive a verification code." : "Email and phone verification are required for portal access."}</p><form onSubmit={submit} className="mt-7 space-y-4">{isRegister ? <label className="block text-xs font-semibold uppercase tracking-[0.08em]">Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 h-12 w-full border border-[#d8d4d1] bg-white px-4 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#1c69d4]" placeholder="Your name" /></label> : null}<label className="block text-xs font-semibold uppercase tracking-[0.08em]">Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-2 h-12 w-full border border-[#d8d4d1] bg-white px-4 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#1c69d4]" placeholder="you@company.com" /></label>{isRegister ? <label className="block text-xs font-semibold uppercase tracking-[0.08em]">Mobile number<input required type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="mt-2 h-12 w-full border border-[#d8d4d1] bg-white px-4 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#1c69d4]" placeholder="+92 300 0000000" /></label> : null}<label className="block text-xs font-semibold uppercase tracking-[0.08em]">Password<input required minLength={8} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-2 h-12 w-full border border-[#d8d4d1] bg-white px-4 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#1c69d4]" placeholder="At least 8 characters" /></label>{error ? <p className="border border-[#efb8b2] bg-[#fff5f4] p-3 text-sm text-[#a52c21]" role="alert">{error}</p> : null}<button disabled={loading} type="submit" className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#141413] px-5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#1c69d4] disabled:opacity-50">{loading ? "Please wait..." : isRegister ? "Create and verify" : "Sign in"}<ArrowRight className="h-3.5 w-3.5" aria-hidden /></button></form><div className="my-6 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.12em] text-[#9a9a96]"><span className="h-px flex-1 bg-[#e2ded9]" /> Or continue with <span className="h-px flex-1 bg-[#e2ded9]" /></div><a href={clientApiUrl("/auth/client/google/start")} className="inline-flex min-h-12 w-full items-center justify-center gap-3 border border-[#d8d4d1] bg-white px-5 text-sm font-semibold transition hover:border-[#1c69d4]"><span className="font-bold text-[#4285f4]">G</span> Continue with Google</a>{isRegister ? <p className="mt-5 text-center text-xs font-light leading-5 text-[#6a6a6a]">By continuing, you agree to keep client materials confidential and use the portal only for your authorized work.</p> : null}</div></div></div>;
}
