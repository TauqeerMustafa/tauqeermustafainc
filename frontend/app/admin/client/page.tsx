"use client";

import { AdminPageHeader, AdminEmptyState } from "@/components/admin/AdminUI";

export default function AdminClientPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Client CRM"
        description="Manage inbound leads, clients, and active projects."
        actionLabel="New Lead"
        onAction={() => alert("Add Lead UI coming soon")}
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-4 mb-6">
        {[
          { label: "New Leads", value: 12, color: "var(--adm-blue)" },
          { label: "Active Clients", value: 45, color: "var(--adm-green)" },
          { label: "Projects in Progress", value: 8, color: "var(--adm-amber)" },
          { label: "Total Revenue (MRR)", value: "$12,400", color: "var(--adm-text)" },
        ].map((stat, i) => (
          <div key={i} className="border border-[var(--adm-border)] bg-[var(--adm-surface)] p-5 transition hover:border-[color:var(--adm-border-2)]">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--adm-text-3)]">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)]">
        <div className="border-b border-[var(--adm-border)] px-5 py-4">
          <h3 className="font-semibold text-[var(--adm-text)]">Recent Leads</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--adm-border)] bg-[var(--adm-surface-2)]">
            <tr>
              <th className="px-5 py-3 font-semibold text-[var(--adm-text-2)]">Company</th>
              <th className="px-5 py-3 font-semibold text-[var(--adm-text-2)]">Contact Person</th>
              <th className="px-5 py-3 font-semibold text-[var(--adm-text-2)]">Status</th>
              <th className="px-5 py-3 font-semibold text-[var(--adm-text-2)]">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--adm-border)]">
            {[
              { company: "TechNova Inc.", person: "Sarah Jenkins", status: "New", value: "$4,500" },
              { company: "Alpha Logistics", person: "Mike O'Donnell", status: "Follow Up", value: "$1,200" },
              { company: "Zephyr Energy", person: "Elena Rostova", status: "Proposal Sent", value: "$12,000" },
            ].map((lead, i) => (
              <tr key={i} className="transition hover:bg-[var(--adm-surface-2)]">
                <td className="px-5 py-3 font-medium text-[var(--adm-text)]">{lead.company}</td>
                <td className="px-5 py-3 text-[var(--adm-text-2)]">{lead.person}</td>
                <td className="px-5 py-3">
                  <span className="inline-block px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider" style={{ background: "var(--adm-blue-light)", color: "var(--adm-blue)" }}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-[var(--adm-text-2)]">{lead.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
