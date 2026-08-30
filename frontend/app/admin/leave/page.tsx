"use client";

import { useEffect, useState } from "react";
import { Check, X, Inbox } from "lucide-react";

export default function AdminLeavePage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leave/admin?status=pending")
      .then(res => res.json())
      .then(data => setRequests(data || []))
      .catch(() => {
        // Mock data
        setRequests([
          { id: "1", employee_name: "Alice Smith", start_date: "2024-11-10", end_date: "2024-11-12", leave_type: "sick", reason: "Fever and rest" },
          { id: "2", employee_name: "Bob Johnson", start_date: "2024-12-01", end_date: "2024-12-14", leave_type: "vacation", reason: "Winter break" },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    // API call to PATCH /api/leave/admin/{id}/status
    setRequests(requests.filter(r => r.id !== id));
    alert(`Request ${action} successfully!`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold uppercase" style={{ color: "var(--adm-text)" }}>Leave Approvals</h1>
        <p className="text-sm mt-1" style={{ color: "var(--adm-text-3)" }}>Review and manage employee time-off requests.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-12 text-center text-[var(--adm-text-3)]">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center gap-4 bg-[var(--adm-surface)] border border-[var(--adm-border)]">
            <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ background: "var(--adm-surface-2)", color: "var(--adm-text-3)" }}>
              <Inbox size={32} />
            </div>
            <div>
              <p className="font-bold text-[var(--adm-text)]">Inbox Zero!</p>
              <p className="text-sm text-[var(--adm-text-3)]">There are no pending leave requests to review.</p>
            </div>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="border border-[var(--adm-border)] bg-[var(--adm-surface)] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-[var(--adm-blue-light)] flex items-center justify-center text-[var(--adm-blue)] font-bold text-lg shrink-0">
                  {req.employee_name?.charAt(0) || "E"}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-[var(--adm-text)]">{req.employee_name}</h3>
                    <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider" style={{ background: "var(--adm-surface-2)", color: "var(--adm-text-2)" }}>
                      {req.leave_type}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[var(--adm-text-2)] mb-2">
                    {req.start_date} &rarr; {req.end_date}
                  </p>
                  <p className="text-sm text-[var(--adm-text-3)] italic">"{req.reason}"</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button onClick={() => handleAction(req.id, 'rejected')} className="flex-1 md:flex-none px-6 py-2.5 border font-bold text-sm hover:bg-[var(--adm-red-light)] transition flex items-center justify-center gap-2" style={{ borderColor: "var(--adm-red)", color: "var(--adm-red)" }}>
                  <X size={16} /> Reject
                </button>
                <button onClick={() => handleAction(req.id, 'approved')} className="flex-1 md:flex-none px-6 py-2.5 text-white font-bold text-sm transition hover:opacity-90 flex items-center justify-center gap-2" style={{ background: "var(--adm-green)" }}>
                  <Check size={16} /> Approve
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
