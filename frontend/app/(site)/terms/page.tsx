import type { Metadata } from "next";

import { Badge, PageHero, Section } from "@/components/home/ui";
import { company } from "@/data/company";

export const metadata: Metadata = {
  title: `Terms of Service | ${company.name}`,
  description: `The terms and conditions governing use of the ${company.name} website and engagement of our services.`,
};

const lastUpdated = "July 28, 2026";

export default function TermsOfServicePage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        description="These terms govern your use of our website and any services delivered by Tauqeer Mustafa Inc. By using our Site or engaging our services, you agree to the terms below."
      >
        <div className="flex flex-wrap gap-2">
          <Badge>Last updated: {lastUpdated}</Badge>
        </div>
      </PageHero>

      <Section className="bg-[#f3f0ee]" labelledBy="terms-content">
        <article
          id="terms-content"
          className="mx-auto max-w-3xl rounded-none border border-[#e2ded9] bg-white p-7 shadow-sm sm:p-10"
        >
          <h2 className="mb-4 mt-0 text-xl font-semibold text-[#141413]">1. Acceptance of Terms</h2>
          <p className="mb-6 text-base leading-8 text-[#141413]">
            By accessing or using the {company.name} website at {company.website} (the &quot;Site&quot;), or by
            engaging us to provide software development, cybersecurity, AI, cloud, or design services
            (collectively, the &quot;Services&quot;), you agree to be bound by these Terms of Service. If you do
            not agree to these terms, please do not use the Site or engage our Services.
          </p>

          <h2 className="mb-4 mt-10 text-xl font-semibold text-[#141413]">2. Description of Services</h2>
          <p className="mb-6 text-base leading-8 text-[#141413]">
            {company.name} provides technology consulting and software engineering services, including enterprise
            web development, cybersecurity, AI solutions, cloud engineering, and product design. The specific
            scope, deliverables, timeline, and fees for any engagement will be set out in a separate proposal,
            statement of work, or signed agreement between {company.name} and the client, which will govern in
            the event of any conflict with these general terms.
          </p>

          <h2 className="mb-4 mt-10 text-xl font-semibold text-[#141413]">3. Use of the Website</h2>
          <p className="mb-4 text-base leading-8 text-[#141413]">
            You agree to use the Site only for lawful purposes and in a manner that does not infringe the rights
            of, or restrict or inhibit the use and enjoyment of, the Site by any third party. Prohibited uses
            include:
          </p>
          <ul className="mb-6 list-disc space-y-2 pl-6 text-base leading-7 text-[#141413]">
            <li>Attempting to gain unauthorized access to our systems, servers, or connected networks.</li>
            <li>Uploading or transmitting viruses, malware, or any code of a destructive nature.</li>
            <li>Scraping, harvesting, or collecting information about other users without consent.</li>
            <li>Misrepresenting your identity or affiliation with any person or organization.</li>
          </ul>

          <h2 className="mb-4 mt-10 text-xl font-semibold text-[#141413]">4. Intellectual Property</h2>
          <p className="mb-6 text-base leading-8 text-[#141413]">
            Unless otherwise agreed in a signed statement of work, all content on the Site, including text,
            graphics, logos, and software, is the property of {company.name} or its licensors and is protected by
            applicable intellectual property laws. Ownership of custom deliverables produced under a client
            engagement is governed by the terms of the corresponding agreement, which typically transfers
            ownership to the client upon full payment while {company.name} retains rights to general methodologies,
            frameworks, and pre-existing tools used in delivery.
          </p>

          <h2 className="mb-4 mt-10 text-xl font-semibold text-[#141413]">5. Fees and Payment</h2>
          <p className="mb-6 text-base leading-8 text-[#141413]">
            Fees, payment schedules, and invoicing terms for any engagement are defined in the applicable proposal
            or agreement. Unless stated otherwise, invoices are due within the period specified in that agreement,
            and late payments may result in a pause of active work until accounts are brought current.
          </p>

          <h2 className="mb-4 mt-10 text-xl font-semibold text-[#141413]">6. Confidentiality</h2>
          <p className="mb-6 text-base leading-8 text-[#141413]">
            Both parties agree to protect confidential information shared during an engagement using at least the
            same degree of care used to protect their own confidential information, and to use such information
            only for purposes related to the engagement.
          </p>

          <h2 className="mb-4 mt-10 text-xl font-semibold text-[#141413]">7. Warranties and Disclaimers</h2>
          <p className="mb-6 text-base leading-8 text-[#141413]">
            The Site and its content are provided on an &quot;as is&quot; and &quot;as available&quot; basis
            without warranties of any kind, either express or implied. While we take reasonable care in the
            performance of our Services, we do not warrant that the Site will be uninterrupted, error-free, or
            free of harmful components.
          </p>

          <h2 className="mb-4 mt-10 text-xl font-semibold text-[#141413]">8. Limitation of Liability</h2>
          <p className="mb-6 text-base leading-8 text-[#141413]">
            To the fullest extent permitted by law, {company.name} shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages arising from your use of the Site or our
            Services, except as otherwise set out in a specific client agreement.
          </p>

          <h2 className="mb-4 mt-10 text-xl font-semibold text-[#141413]">9. Termination</h2>
          <p className="mb-6 text-base leading-8 text-[#141413]">
            We reserve the right to suspend or terminate access to the Site at our discretion, without notice, for
            conduct that we believe violates these terms or is harmful to other users, us, or third parties.
            Termination of a services engagement is governed by the terms of the applicable client agreement.
          </p>

          <h2 className="mb-4 mt-10 text-xl font-semibold text-[#141413]">10. Governing Law</h2>
          <p className="mb-6 text-base leading-8 text-[#141413]">
            These terms are governed by the laws applicable in the jurisdiction where {company.name} is
            headquartered, without regard to its conflict of law provisions, unless a specific client agreement
            states otherwise.
          </p>

          <h2 className="mb-4 mt-10 text-xl font-semibold text-[#141413]">11. Changes to These Terms</h2>
          <p className="mb-6 text-base leading-8 text-[#141413]">
            We may revise these Terms of Service from time to time. The &quot;Last updated&quot; date at the top
            of this page reflects the most recent revision, and continued use of the Site after changes are
            posted constitutes acceptance of the revised terms.
          </p>

          <h2 className="mb-4 mt-10 text-xl font-semibold text-[#141413]">12. Contact Us</h2>
          <p className="text-base leading-8 text-[#141413]">
            Questions about these Terms of Service can be sent to{" "}
            <a href={`mailto:${company.emails.legal}`} className="font-medium text-[#2a2a28] underline underline-offset-2">
              {company.emails.legal}
            </a>{" "}
            or by mail at {company.city}.
          </p>
        </article>
      </Section>
    </>
  );
}
