"use client";

import { useEffect, useState } from "react";
import { Calendar, Plus, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function EmployeeLeavePage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
    leave_type: "vacation",
    reason: ""
  });

  useEffect(() => {
    fetch("/api/leave/me")
      .then(res => res.json())
      .then(data => setRequests(data || []))
      .catch(() => {
        // Mock data
        setRequests([
          { id: "1", start_date: "2024-12-20", end_date: "2024-12-25", leave_type: "vacation", status: "approved", reason: "Family trip" },
          { id: "2", start_date: "2024-11-05", end_date: "2024-11-06", leave_type: "sick", status: "pending", reason: "Medical appointment" },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    const newReq = { ...formData, id: Date.now().toString(), status: "pending" };
    setRequests([newReq, ...requests]);
    setIsModalOpen(false);
    alert("Leave request submitted successfully!");
  };

  const getStatusIcon = (status: string) => {
    if (status === "approved") return <CheckCircle2 style={{ color: "var(--adm-green)" }} size={18} />;
    if (status === "rejected") return <XCircle style={{ color: "var(--adm-red)" }} size={18} />;
    return <Clock style={{ color: "var(--adm-amber)" }} size={18} />;
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase" style={{ color: "var(--adm-text)" }}>Leave Requests</h1>
          <p className="text-sm mt-1" style={{ color: "var(--adm-text-3)" }}>Request time off and track your approval status.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-[var(--adm-blue)] px-6 py-3 text-sm font-bold text-white transition hover:opacity-90">
          <Plus size={18} /> Request Leave
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)] p-6">
          <p className="text-sm font-semibold text-[var(--adm-text-3)] mb-1">Available Vacation</p>
          <p className="text-3xl font-bold text-[var(--adm-text)]">14 <span className="text-lg font-medium text-[var(--adm-text-3)]">days</span></p>
        </div>
        <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)] p-6">
          <p className="text-sm font-semibold text-[var(--adm-text-3)] mb-1">Available Sick Leave</p>
          <p className="text-3xl font-bold text-[var(--adm-text)]">5 <span className="text-lg font-medium text-[var(--adm-text-3)]">days</span></p>
        </div>
        <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)] p-6">
          <p className="text-sm font-semibold text-[var(--adm-text-3)] mb-1">Pending Requests</p>
          <p className="text-3xl font-bold text-[var(--adm-text)]">{requests.filter(r => r.status === 'pending').length}</p>
        </div>
      </div>

      <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--adm-surface-2)] border-b border-[var(--adm-border)]">
            <tr>
              <th className="px-6 py-4 font-semibold text-[var(--adm-text-2)]">Type</th>
              <th className="px-6 py-4 font-semibold text-[var(--adm-text-2)]">Duration</th>
              <th className="px-6 py-4 font-semibold text-[var(--adm-text-2)]">Reason</th>
              <th className="px-6 py-4 font-semibold text-[var(--adm-text-2)]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--adm-border)]">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-[var(--adm-text-3)]">Loading requests...</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-[var(--adm-text-3)]">No leave requests found.</td></tr>
            ) : requests.map((req) => (
              <tr key={req.id} className="hover:bg-[var(--adm-surface-2)] transition">
                <td className="px-6 py-4 font-medium capitalize text-[var(--adm-text)]">{req.leave_type}</td>
                <td className="px-6 py-4 text-[var(--adm-text-2)]">{req.start_date} to {req.end_date}</td>
                <td className="px-6 py-4 text-[var(--adm-text-3)] max-w-xs truncate">{req.reason}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(req.status)}
                    <span className="font-semibold capitalize text-[var(--adm-text)]">{req.status}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[var(--adm-surface)] w-full max-w-lg overflow-hidden border border-[var(--adm-border)]">
            <div className="px-8 py-6 border-b border-[var(--adm-border)]">
              <h2 className="text-xl font-bold text-[var(--adm-text)]">New Leave Request</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[var(--adm-text-2)]">Start Date</label>
                  <input required type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full border border-[var(--adm-border)] px-4 py-2.5 outline-none bg-[var(--adm-surface)] text-[var(--adm-text)]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[var(--adm-text-2)]">End Date</label>
                  <input required type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full border border-[var(--adm-border)] px-4 py-2.5 outline-none bg-[var(--adm-surface)] text-[var(--adm-text)]" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-[var(--adm-text-2)]">Leave Type</label>
                <select value={formData.leave_type} onChange={e => setFormData({...formData, leave_type: e.target.value})} className="w-full border border-[var(--adm-border)] px-4 py-2.5 outline-none bg-[var(--adm-surface)] text-[var(--adm-text)]">
                  <option value="vacation">Vacation / Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-[var(--adm-text-2)]">Reason</label>
                <textarea required rows={3} value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full border border-[var(--adm-border)] px-4 py-3 outline-none resize-none bg-[var(--adm-surface)] text-[var(--adm-text)]" placeholder="Briefly explain your reason for leave..."></textarea>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 text-sm font-bold text-[var(--adm-text-2)] hover:bg-[var(--adm-surface-2)] transition">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-[var(--adm-blue)] text-white text-sm font-bold hover:opacity-90 transition">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
