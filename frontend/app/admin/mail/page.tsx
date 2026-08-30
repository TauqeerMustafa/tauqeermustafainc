import { AdminPageHeader } from "@/components/admin/AdminUI";
import { Mail, ChevronDown } from "lucide-react";
import { fetchOpenEmailMailboxes, fetchOpenEmailMessages } from "@/lib/openemail";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Helper function to extract email from address strings like "Name <email@example.com>"
function extractEmail(address: any) {
  if (!address) return "Unknown";
  if (Array.isArray(address) && address[0]) {
    return address[0].address || address[0].email || "Unknown";
  }
  return address.address || address.email || "Unknown";
}

export default async function AdminMailPage({
  searchParams,
}: {
  searchParams: { mailbox?: string };
}) {
  let mailboxes: any[] = [];
  let messages: any[] = [];
  let errorMsg = null;
  let activeMailbox = null;

  try {
    const data = await fetchOpenEmailMailboxes();
    // Filter out any broken mailboxes that have a null primary address
    mailboxes = (data.mailboxes || []).filter((m: any) => m.primaryAddress);
    
    if (mailboxes.length > 0) {
      if (searchParams.mailbox) {
        activeMailbox = mailboxes.find((m: any) => m.id === searchParams.mailbox) || mailboxes[0];
      } else {
        activeMailbox = mailboxes[0];
      }

      if (activeMailbox) {
        const msgsData = await fetchOpenEmailMessages(activeMailbox.id);
        messages = msgsData.messages || [];
      }
    }
  } catch (err: any) {
    errorMsg = err.message;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Webmail" 
        description="Manage your communications and multiple mailboxes." 
      />

      {errorMsg ? (
        <div className="flex flex-col items-center justify-center border border-dashed py-20 text-center"
          style={{ borderColor: "var(--adm-red)", background: "var(--adm-red-light)" }}
        >
          <Mail className="mb-4 h-12 w-12" style={{ color: "var(--adm-red)" }} />
          <h3 className="mb-2 text-xl font-bold uppercase" style={{ color: "var(--adm-text)" }}>Error loading mailbox</h3>
          <p className="mb-6 max-w-md" style={{ color: "var(--adm-text-2)" }}>
            {errorMsg}
          </p>
          <p className="text-sm" style={{ color: "var(--adm-text-3)" }}>Please make sure OPENEMAIL_API_KEY is set correctly.</p>
        </div>
      ) : (
        <div className="border overflow-hidden flex flex-col h-[700px]"
          style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}
        >
          {/* Mailbox Header / Switcher */}
          {mailboxes.length > 0 && (
            <div className="border-b px-4 py-3 flex items-center justify-between"
              style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface-2)" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--adm-text-3)" }}>Inbox for:</span>
                <div className="relative group">
                  <button className="flex items-center gap-2 border px-3 py-1.5 text-sm font-medium transition hover:bg-[var(--adm-surface)]"
                    style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)", color: "var(--adm-text)" }}
                  >
                    {activeMailbox?.primaryAddress}
                    <ChevronDown size={14} style={{ color: "var(--adm-text-3)" }} />
                  </button>
                  {/* Dropdown Menu */}
                  <div className="absolute left-0 top-full z-10 mt-1 hidden w-64 flex-col overflow-hidden border group-hover:flex"
                    style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}
                  >
                    {mailboxes.map((mb) => (
                      <Link
                        key={mb.id}
                        href={`/admin/mail?mailbox=${mb.id}`}
                        className="px-4 py-2 text-sm transition hover:bg-[var(--adm-surface-2)]"
                        style={{ color: mb.id === activeMailbox?.id ? "var(--adm-blue)" : "var(--adm-text-2)", fontWeight: mb.id === activeMailbox?.id ? 600 : 400 }}
                      >
                        {mb.primaryAddress}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <button
                className="btn-press px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white transition hover:opacity-90"
                style={{ background: "var(--adm-blue)" }}
              >
                Compose
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {mailboxes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-20" style={{ color: "var(--adm-text-3)" }}>
                <Mail className="w-12 h-12 mb-4" style={{ color: "var(--adm-border-2)" }} />
                <p>No valid mailboxes found in this account.</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-20" style={{ color: "var(--adm-text-3)" }}>
                <Mail className="w-12 h-12 mb-4" style={{ color: "var(--adm-border-2)" }} />
                <p>No messages found in this mailbox.</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--adm-border)" }}>
                {messages.map((msg: any) => (
                  <div
                    key={msg.id}
                    className="p-4 cursor-pointer transition-colors flex flex-col md:flex-row md:items-center gap-2 md:gap-4 group hover:bg-[var(--adm-surface-2)]"
                    style={{ borderColor: "var(--adm-border)" }}
                  >
                    <div className="flex-shrink-0 w-56 font-medium truncate" style={{ color: "var(--adm-text)" }}>
                      {msg.from ? extractEmail(msg.from) : 'Unknown Sender'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--adm-text)" }}>{msg.subject || '(No Subject)'}</p>
                      <p className="text-sm truncate" style={{ color: "var(--adm-text-3)" }}>{msg.snippet || '...'}</p>
                    </div>
                    <div className="flex-shrink-0 text-xs whitespace-nowrap" style={{ color: "var(--adm-text-3)" }}>
                      {msg.receivedAt ? new Date(msg.receivedAt).toLocaleDateString() : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
