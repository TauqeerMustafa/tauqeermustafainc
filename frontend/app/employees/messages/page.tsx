import Link from "next/link";
import { MessageCircle, ArrowRight } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import Webmail from "@/components/admin/mail/Webmail";

export const dynamic = "force-dynamic";

export default function EmployeeMessagesPage() {
  return (
    <div className="space-y-4">
      {/* Direct Chat Switch Banner */}
      <div className="border border-adm-blue/30 bg-adm-blue/5 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 bg-adm-blue/10 text-adm-blue border border-adm-blue/20">
            <MessageCircle size={16} />
          </span>
          <div>
            <p className="text-xs font-bold text-adm-text">
              Direct Communication Rail Available
            </p>
            <p className="text-[11px] text-adm-text-3">
              Need to urgently message your Department Head, Project Lead, or System Admin?
            </p>
          </div>
        </div>

        <Link
          href="/employees/chat"
          className="px-3 py-1.5 bg-adm-blue text-white font-mono text-[10px] font-bold uppercase tracking-wider hover:bg-adm-blue-hover transition inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          Open Direct Chat <ArrowRight size={12} />
        </Link>
      </div>

      <AdminPageHeader title="Webmail" description="Your secure company inbox. Read and send messages." />
      <Webmail />
    </div>
  );
}
