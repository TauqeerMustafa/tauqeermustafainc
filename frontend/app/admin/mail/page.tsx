import { AdminPageHeader } from "@/components/admin/AdminUI";
import CommunicationsBanner from "@/components/portal/CommunicationsBanner";
import Webmail from "@/components/admin/mail/Webmail";

export const dynamic = "force-dynamic";

const LEGAL_NOTICE_SUBJECT =
  'FORMAL LEGAL NOTICE: Unauthorized Use of "Qorlune" & Domain qorlune.store — Qorlune LLC';

const LEGAL_NOTICE_BODY = `LEGAL NOTICE & DEMAND TO REGULARIZE STATUS

Dear Domain Owner / Site Operator,

This communication serves as a formal legal notice issued on behalf of Qorlune LLC regarding your registration of the domain qorlune.store and the commercial use of the "Qorlune" trade name on your website.

The name "Qorlune" is the exclusive corporate identity, trade name, and proprietary brand of Qorlune LLC (official online presence: https://qorlune.co.uk). Your registration and operation of an identical domain name without our prior written authorization constitutes unauthorized commercial use, customer confusion, and bad-faith registration under international ICANN regulations.

MANDATORY RESOLUTION OPTIONS:
1. Authorization & Collaboration Agreement: If you wish to continue operations utilizing the Qorlune brand, you must promptly contact Qorlune LLC to seek formal licensing, authorization, and partnership terms. Continued unapproved use is strictly prohibited.
2. Cease & Desist / Domain Relinquishment: In the absence of an authorized agreement with Qorlune LLC, you must immediately cease all use of the name "Qorlune" and coordinate the voluntary transfer or cancellation of qorlune.store.

Deadline for Compliance: Please respond to legal@qorlune.co.uk within seven (7) business days (by 16 November 2026) confirming your intentions.

Failure to respond will compel Qorlune LLC to escalate this matter immediately to your registrar (RU-CENTER), hosting provider (SpaceWeb), and file an expedited UDRP/URS dispute with WIPO/ICANN.

------------------------------------------------------------
РУССКАЯ ВЕРСИЯ / RUSSIAN VERSION:

Уважаемый владелец ресурса qorlune.store,

Настоящее уведомление направлено юридическим отделом компании Qorlune LLC. Использование фирменного наименования «Qorlune» и домена qorlune.store осуществляется без согласия правообладателя (https://qorlune.co.uk).

Для досудебного урегулирования просим в срок до 16 ноября 2026 года направить ответ на legal@qorlune.co.uk:
- Для заключения официального соглашения об авторизации и сотрудничестве с Qorlune LLC, ЛИБО
- Для согласования прекращения использования наименования и передачи прав на домен.

Legal Department | Qorlune LLC
Email: legal@qorlune.co.uk
Website: https://qorlune.co.uk
`;

// Next 16: searchParams is a Promise and must be awaited.
export default async function AdminMailPage({
  searchParams,
}: {
  searchParams: Promise<{
    compose?: string;
    to?: string;
    cc?: string;
    subject?: string;
    body?: string;
    template?: string;
  }>;
}) {
  const sp = await searchParams;

  const isLegalNotice = sp.template === "legal_notice" || sp.template === "qorlune";

  const initialTo = isLegalNotice ? (sp.to || "info@qorlune.store") : (sp.to ?? "");
  const initialCc = isLegalNotice ? (sp.cc || "tld-adm@nic.ru, abuse@sweb.ru") : (sp.cc ?? "");
  const initialSubject = isLegalNotice ? (sp.subject || LEGAL_NOTICE_SUBJECT) : (sp.subject ?? "");
  const initialBody = isLegalNotice ? (sp.body || LEGAL_NOTICE_BODY) : (sp.body ?? "");

  return (
    <div className="space-y-4">
      <CommunicationsBanner active="mail" compact />
      <Webmail
        initialTo={initialTo}
        initialCc={initialCc}
        initialSubject={initialSubject}
        initialBody={initialBody}
        autoCompose={Boolean(sp.compose || sp.to || isLegalNotice)}
      />
    </div>
  );
}
