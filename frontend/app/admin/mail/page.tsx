import { AdminPageHeader } from "@/components/admin/AdminUI";
import { Mail } from "lucide-react";
import { fetchOpenEmailMailboxes, fetchOpenEmailMessages } from "@/lib/openemail";

export const dynamic = "force-dynamic";

// Helper function to extract email from address strings like "Name <email@example.com>"
function extractEmail(address: any) {
  if (!address) return "Unknown";
  if (Array.isArray(address) && address[0]) {
    return address[0].address || address[0].email || "Unknown";
  }
  return address.address || address.email || "Unknown";
}

export default async function AdminMailPage() {
  let mailboxes: any[] = [];
  let messages: any[] = [];
  let errorMsg = null;
  let firstMailbox = null;

  try {
    const data = await fetchOpenEmailMailboxes();
    mailboxes = data.mailboxes || [];
    firstMailbox = mailboxes[0];
    
    if (firstMailbox) {
      const msgsData = await fetchOpenEmailMessages(firstMailbox.id);
      messages = msgsData.messages || [];
    }
  } catch (err: any) {
    errorMsg = err.message;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Webmail" 
        description={firstMailbox ? `Inbox for ${firstMailbox.primaryAddress}` : "Manage your communications."} 
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
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 py-20">
                <Mail className="w-12 h-12 mb-4 text-gray-300" />
                <p>No messages found in this mailbox.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {messages.map((msg: any) => (
                  <div key={msg.id} className="p-4 hover:bg-blue-50 cursor-pointer transition-colors flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <div className="flex-shrink-0 w-48 font-medium text-gray-900 truncate">
                      {msg.from ? extractEmail(msg.from) : 'Unknown Sender'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{msg.subject || '(No Subject)'}</p>
                      <p className="text-sm text-gray-500 truncate">{msg.snippet || '...'}</p>
                    </div>
                    <div className="flex-shrink-0 text-xs text-gray-400 whitespace-nowrap">
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
