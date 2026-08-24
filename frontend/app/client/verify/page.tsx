import type { Metadata } from "next";
import { Suspense } from "react";
import VerificationForm from "@/components/client/VerificationForm";

export const metadata: Metadata = { title: "Verify Client Account | Tauqeer Mustafa Inc.", description: "Verify your email and phone number to activate your TMI client workspace." };

export default function ClientVerifyPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#f3f0ee] p-8 text-center text-sm">Loading verification…</div>}><VerificationForm /></Suspense>;
}
