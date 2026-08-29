import { fetchOpenEmailMailboxes, fetchOpenEmailMessages } from "@/lib/openemail";

// Helper function to extract email from address strings like "Name <email@example.com>"
function extractEmail(address: any) {
  if (!address) return "Unknown";
  if (Array.isArray(address) && address[0]) {
    return address[0].address || address[0].email || "Unknown";
  }
  return address.address || address.email || "Unknown";
}

export default async function MailPage() {
  try {
    const data = await fetchOpenEmailMailboxes();
    const mailboxes = data.mailboxes || [];
    const firstMailbox = mailboxes[0];
    
    let messages = [];
    if (firstMailbox) {
      const msgsData = await fetchOpenEmailMessages(firstMailbox.id);
      messages = msgsData.messages || [];
    }

    return (
      <div className="flex-1 flex flex-col h-full bg-white">
        <header className="h-16 px-6 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">
            {firstMailbox ? firstMailbox.primaryAddress : 'Inbox'}
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <svg className="w-12 h-12 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
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
    );
  } catch (error: any) {
    return (
      <div className="p-8 text-center text-red-600">
        <h2 className="text-2xl font-bold mb-4">Error loading mailbox</h2>
        <p>{error.message}</p>
        <p className="mt-4 text-sm text-gray-500">Please make sure OPENEMAIL_API_KEY is set in Vercel.</p>
      </div>
    );
  }
}
