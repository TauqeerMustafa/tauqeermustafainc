import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, PhoneCall, BookOpen, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Support | Tauqeer Mustafa Inc.",
  description: "Get help and support for your TMI services and portals.",
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-canvas pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            How can we help you?
          </h1>
          <p className="mt-4 text-lg text-ink-muted">
            Find answers, contact our team, and manage your services.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-line-2 bg-surface p-8 shadow-sm">
            <MessageSquare className="h-8 w-8 text-action mb-4" />
            <h3 className="text-xl font-semibold text-ink mb-2">Client Portal Help</h3>
            <p className="text-ink-lighter mb-6">Having trouble accessing your deliverables or invoices?</p>
            <Link href="/contact" className="text-sm font-semibold text-action hover:underline">
              Contact Support &rarr;
            </Link>
          </div>

          <div className="rounded-2xl border border-line-2 bg-surface p-8 shadow-sm">
            <Mail className="h-8 w-8 text-action mb-4" />
            <h3 className="text-xl font-semibold text-ink mb-2">Email Support</h3>
            <p className="text-ink-lighter mb-6">Send us a detailed message about your technical issue.</p>
            <a href="mailto:tauqeer@tauqeermustafa.tech" className="text-sm font-semibold text-action hover:underline">
              Email our team &rarr;
            </a>
          </div>

          <div className="rounded-2xl border border-line-2 bg-surface p-8 shadow-sm">
            <PhoneCall className="h-8 w-8 text-action mb-4" />
            <h3 className="text-xl font-semibold text-ink mb-2">Emergency Support</h3>
            <p className="text-ink-lighter mb-6">For critical system outages or security incidents only.</p>
            <a href="tel:+923281313982" className="text-sm font-semibold text-action hover:underline">
              Call Emergency Line &rarr;
            </a>
          </div>

          <div className="rounded-2xl border border-line-2 bg-surface p-8 shadow-sm">
            <BookOpen className="h-8 w-8 text-action mb-4" />
            <h3 className="text-xl font-semibold text-ink mb-2">Knowledge Base</h3>
            <p className="text-ink-lighter mb-6">Read our documentation and self-service guides.</p>
            <Link href="https://community.tauqeermustafa.tech" className="text-sm font-semibold text-action hover:underline">
              Visit Community &rarr;
            </Link>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-3xl font-bold text-ink mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid gap-4 max-w-3xl mx-auto">
            <div className="rounded-xl border border-line-2 bg-surface p-6">
              <h4 className="text-lg font-semibold text-ink mb-2">How do I access the client portal?</h4>
              <p className="text-ink-muted">You can log in to the client portal using the credentials provided during your onboarding. If you lost your password, click "Forgot Password" on the login screen.</p>
            </div>
            <div className="rounded-xl border border-line-2 bg-surface p-6">
              <h4 className="text-lg font-semibold text-ink mb-2">How fast do you respond to emergency tickets?</h4>
              <p className="text-ink-muted">Emergency tickets have a 1-hour SLA. For immediate attention, please call the emergency hotline provided in your SLA agreement.</p>
            </div>
            <div className="rounded-xl border border-line-2 bg-surface p-6">
              <h4 className="text-lg font-semibold text-ink mb-2">Where can I view my project deliverables?</h4>
              <p className="text-ink-muted">All deliverables, milestones, and invoices are available within your specific project dashboard in the Client Portal.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

