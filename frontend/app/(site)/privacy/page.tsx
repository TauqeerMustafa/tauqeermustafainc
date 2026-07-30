import type { Metadata } from "next";

import { Badge, PageHero, Section } from "@/components/home/ui";
import { company } from "@/data/company";

export const metadata: Metadata = {
  title: `Privacy Policy | ${company.name}`,
  description: `How ${company.name} collects, uses, and protects information across our website and client engagements.`,
};

const lastUpdated = "July 28, 2026";

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        description="This policy explains what information we collect, why we collect it, and the choices you have regarding your data when you use our website or work with us."
      >
        <div className="flex flex-wrap gap-2">
          <Badge>Last updated: {lastUpdated}</Badge>
        </div>
      </PageHero>

      <Section className="bg-[#F8FAFC]" labelledBy="privacy-content">
        <article
          id="privacy-content"
          className="mx-auto max-w-3xl rounded-none border border-[#E5E7EB] bg-white p-7 shadow-sm sm:p-10"
        >
          <p className="mb-6 text-base leading-8 text-[#374151]">
            {company.name} (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) respects your privacy and is
            committed to protecting it through compliance with this policy. This Privacy Policy describes the
            types of information we may collect from you or that you may provide when you visit our website at{" "}
            {company.website} (the &quot;Site&quot;) or engage us for consulting and software delivery services,
            and our practices for collecting, using, maintaining, protecting, and disclosing that information.
          </p>

          <h2 className="mb-4 mt-10 text-xl font-semibold text-[#0A1628]">1. Information We Collect</h2>
          <p className="mb-4 text-base leading-8 text-[#374151]">
            We collect several types of information from and about users of our Site and clients of our services,
            including:
          </p>
          <ul className="mb-6 list-disc space-y-2 pl-6 text-base leading-7 text-[#374151]">
            <li>
              Information you provide directly, such as your name, company, email address, phone number, and
              project details submitted through contact or intake forms.
            </li>
            <li>
              Information submitted when applying for open roles, including resumes, portfolios, and professional
              history.
            </li>
            <li>
              Technical information collected automatically as you navigate the Site, such as browser type, device
              information, pages visited, and referring URLs.
            </li>
            <li>
              Information shared during the course of a project engagement, which may include business data,
              system access details, or documentation necessary to deliver the contracted work.
            </li>
          </ul>

          <h2 className="mb-4 mt-10 text-xl font-semibold text-[#0A1628]">2. How We Use Your Information</h2>
          <p className="mb-4 text-base leading-8 text-[#374151]">
            We use the information we collect to:
          </p>
          <ul className="mb-6 list-disc space-y-2 pl-6 text-base leading-7 text-[#374151]">
            <li>Respond to inquiries, provide quotes, and deliver contracted services.</li>
            <li>Operate, maintain, and improve the functionality and security of our Site.</li>
            <li>Communicate with you about projects, proposals, invoices, and support requests.</li>
            <li>Evaluate job applications and communicate with candidates.</li>
            <li>Comply with legal obligations and enforce our agreements.</li>
          </ul>

          <h2 className="mb-4 mt-10 text-xl font-semibold text-[#0A1628]">3. Cookies and Tracking Technologies</h2>
          <p className="mb-6 text-base leading-8 text-[#374151]">
            We use cookies and similar technologies to operate and improve our Site. Details about the categories
            of cookies we use and how to manage your preferences are described in our{" "}
            <a href="/cookies" className="font-medium text-[#0A46A8] underline underline-offset-2">
              Cookie Policy
            </a>
            .
          </p>

          <h2 className="mb-4 mt-10 text-xl font-semibold text-[#0A1628]">4. How We Share Information</h2>
          <p className="mb-4 text-base leading-8 text-[#374151]">
            We do not sell personal information. We may share information with:
          </p>
          <ul className="mb-6 list-disc space-y-2 pl-6 text-base leading-7 text-[#374151]">
            <li>
              Service providers who perform functions on our behalf, such as hosting, analytics, and email
              delivery, under confidentiality obligations consistent with this policy.
            </li>
            <li>Professional advisors, including lawyers and accountants, where reasonably necessary.</li>
            <li>
              Authorities or third parties where required by law, to protect our rights, or to investigate fraud
              or security issues.
            </li>
            <li>A successor entity in the event of a merger, acquisition, or sale of company assets.</li>
          </ul>

          <h2 className="mb-4 mt-10 text-xl font-semibold text-[#0A1628]">5. Data Security</h2>
          <p className="mb-6 text-base leading-8 text-[#374151]">
            We implement reasonable administrative, technical, and physical safeguards designed to protect
            information from unauthorized access, disclosure, alteration, or destruction. No method of
            transmission or storage is completely secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="mb-4 mt-10 text-xl font-semibold text-[#0A1628]">6. Data Retention</h2>
          <p className="mb-6 text-base leading-8 text-[#374151]">
            We retain personal information for as long as necessary to fulfill the purposes described in this
            policy, unless a longer retention period is required or permitted by law, including for accounting,
            recordkeeping, or dispute resolution purposes.
          </p>

          <h2 className="mb-4 mt-10 text-xl font-semibold text-[#0A1628]">7. Your Rights and Choices</h2>
          <p className="mb-4 text-base leading-8 text-[#374151]">
            Depending on your location, you may have rights to access, correct, delete, or restrict the use of
            your personal information, and to object to certain processing. To exercise any of these rights,
            contact us using the details below and we will respond within a reasonable timeframe.
          </p>

          <h2 className="mb-4 mt-10 text-xl font-semibold text-[#0A1628]">8. International Data Transfers</h2>
          <p className="mb-6 text-base leading-8 text-[#374151]">
            Because we work with clients and collaborators in multiple regions, information may be transferred to
            and processed in countries other than your own. We take steps to ensure that any such transfer
            complies with applicable data protection requirements.
          </p>

          <h2 className="mb-4 mt-10 text-xl font-semibold text-[#0A1628]">9. Children&apos;s Privacy</h2>
          <p className="mb-6 text-base leading-8 text-[#374151]">
            Our Site and services are not directed to individuals under the age of 16, and we do not knowingly
            collect personal information from children.
          </p>

          <h2 className="mb-4 mt-10 text-xl font-semibold text-[#0A1628]">10. Changes to This Policy</h2>
          <p className="mb-6 text-base leading-8 text-[#374151]">
            We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at the top of
            this page reflects the most recent revision. Material changes will be communicated through a notice on
            the Site.
          </p>

          <h2 className="mb-4 mt-10 text-xl font-semibold text-[#0A1628]">11. Contact Us</h2>
          <p className="text-base leading-8 text-[#374151]">
            If you have questions about this Privacy Policy or our data practices, contact us at{" "}
            <a href={`mailto:${company.emails.legal}`} className="font-medium text-[#0A46A8] underline underline-offset-2">
              {company.emails.legal}
            </a>{" "}
            or by mail at {company.headquarters}.
          </p>
        </article>
      </Section>
    </>
  );
}
