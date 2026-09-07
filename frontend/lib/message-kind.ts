/**
 * Contact-message classification.
 *
 * The public forms (contact, careers, community) all POST into the same
 * `contact_messages` table, and `app/api/contact/route.ts` flattens the extra
 * fields — subject, service, phone — into the free-text `message` body. There
 * is therefore no discriminator column on the row, so the kind has to be
 * derived from the body's prefix lines.
 *
 * Every screen must derive it *here*. Three pages previously each carried their
 * own `message.includes(...)` test, and because those tests disagreed, job and
 * community applications were filtered out of `/admin/messages` without
 * appearing anywhere else — they looked deleted when they were only hidden.
 *
 * If a real `kind` column is added to the table later, this module is the one
 * place to switch over: read `message.kind` and fall back to `classifyMessage`
 * for rows written before the migration.
 */

export const MESSAGE_KIND = {
  JOB: "job",
  COMMUNITY: "community",
  SERVICE: "service",
  CONTACT: "contact",
} as const;

export type MessageKind = (typeof MESSAGE_KIND)[keyof typeof MESSAGE_KIND];

export const MESSAGE_KIND_LABEL: Record<MessageKind, string> = {
  job: "Job Application",
  community: "Community Application",
  service: "Service Enquiry",
  contact: "Contact",
};

/**
 * Derive the kind from a message body. Ordered most-specific first, and
 * deliberately anchored on the exact prefixes the API writes — an earlier
 * version matched the bare word "Community", which swept up any general
 * enquiry that happened to use it.
 */
export function classifyMessage(body: string | null | undefined): MessageKind {
  const text = body ?? "";
  if (text.includes("Job Application:")) return MESSAGE_KIND.JOB;
  if (text.includes("Community Application:") || text.includes("Service: Community")) {
    return MESSAGE_KIND.COMMUNITY;
  }
  if (text.includes("Service:")) return MESSAGE_KIND.SERVICE;
  return MESSAGE_KIND.CONTACT;
}

export function isMessageKind(body: string | null | undefined, kind: MessageKind): boolean {
  return classifyMessage(body) === kind;
}
