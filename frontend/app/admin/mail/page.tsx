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
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-300 bg-red-50 py-20 text-center">
          <Mail className="mb-4 h-12 w-12 text-red-400" />
          <h3 className="mb-2 text-xl font-bold text-red-900">Error loading mailbox</h3>
          <p className="mb-6 max-w-md text-red-500">
            {errorMsg}
          </p>
          <p className="text-sm text-red-400">Please make sure OPENEMAIL_API_KEY is set correctly.</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col h-[700px]">
          {/* Mailbox Header / Switcher */}
          {mailboxes.length > 0 && (
            <div className="border-b bg-gray-50 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">Inbox for:</span>
                <div className="relative group">
                  <button className="flex items-center gap-2 rounded border bg-white px-3 py-1.5 text-sm font-medium shadow-sm transition hover:bg-gray-50">
                    {activeMailbox?.primaryAddress}
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>
                  {/* Dropdown Menu */}
                  <div className="absolute left-0 top-full z-10 mt-1 hidden w-64 flex-col overflow-hidden rounded-md border bg-white shadow-lg group-hover:flex">
                    {mailboxes.map((mb) => (
                      <Link 
                        key={mb.id} 
                        href={`/admin/mail?mailbox=${mb.id}`}
                        className={`px-4 py-2 text-sm transition hover:bg-blue-50 ${mb.id === activeMailbox?.id ? 'bg-blue-50 font-semibold text-blue-600' : 'text-gray-700'}`}
                      >
                        {mb.primaryAddress}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <button 
                className="rounded bg-black px-4 py-1.5 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Compose
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {mailboxes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 py-20">
                <Mail className="w-12 h-12 mb-4 text-gray-300" />
                <p>No valid mailboxes found in this account.</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 py-20">
                <Mail className="w-12 h-12 mb-4 text-gray-300" />
                <p>No messages found in this mailbox.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {messages.map((msg: any) => (
                  <div key={msg.id} className="p-4 hover:bg-blue-50 cursor-pointer transition-colors flex flex-col md:flex-row md:items-center gap-2 md:gap-4 group">
                    <div className="flex-shrink-0 w-56 font-medium text-gray-900 truncate">
                      {msg.from ? extractEmail(msg.from) : 'Unknown Sender'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{msg.subject || '(No Subject)'}</p>
                      <p className="text-sm text-gray-500 truncate">{msg.snippet || '...'}</p>
                    </div>
                    <div className="flex-shrink-0 text-xs text-gray-400 whitespace-nowrap group-hover:text-blue-600">
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
