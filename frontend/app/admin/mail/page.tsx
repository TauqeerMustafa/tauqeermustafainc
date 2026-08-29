import { AdminPageHeader } from "@/components/admin/AdminUI";
import { Mail, ExternalLink, ShieldCheck } from "lucide-react";
import { kv, isKVConfigured } from "@/lib/kv";

export const dynamic = "force-dynamic";

export default async function AdminMailPage() {
  let isConnected = false;
  if (isKVConfigured) {
    try {
      isConnected = !!(await kv!.get("zoho_access_token"));
    } catch {
      // KV read failed — treat as disconnected
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Mailbox" description="Manage your communications and Zoho Mail integration." />

      {!isConnected ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-20 text-center">
          <Mail className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-xl font-bold text-gray-900">Zoho Mail Not Connected</h3>
          <p className="mb-6 max-w-md text-gray-500">
            To view and manage your emails, please connect your Zoho One account in the settings panel.
          </p>
          <a
            href="/admin/settings"
            className="rounded bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Go to Settings
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Integrated Workspace iframe */}
          <div className="rounded-xl border border-[var(--adm-border)] bg-[var(--adm-surface)] overflow-hidden shadow-sm h-[75vh]">
            <iframe 
              src="https://mail.zoho.com/zm/" 
              title="Zoho Mail Workspace"
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Enterprise Webmail</h3>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                <ShieldCheck className="h-3.5 w-3.5" /> Connected
              </span>
            </div>
            <p className="mb-6 text-sm text-gray-500">
              Your portal is securely connected to Zoho One. You can access your full enterprise mailbox with a single click.
            </p>
            <a
              href="https://mail.zoho.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded bg-[#1051F1] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0D44CB] w-full sm:w-auto"
            >
              <Mail className="h-4 w-4" />
              Open Zoho Mail Inbox
              <ExternalLink className="h-4 w-4 opacity-70" />
            </a>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Mail Features Enabled</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Single Sign-On (SSO) Authentication</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Enterprise Spam &amp; Phishing Protection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Custom Domain Routing (@tauqeermustafa.tech)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Automated Inbox Organization</span>
              </li>
            </ul>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
