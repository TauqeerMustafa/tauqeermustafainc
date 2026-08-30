"use client";

import { useEffect, useState } from "react";
import { Users, Clock, Search, Calendar as CalendarIcon } from "lucide-react";

export default function AdminAttendancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateStr, setDateStr] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/attendance/admin?date=${dateStr}`)
      .then(res => res.json())
      .then(data => {
        setRecords(data || []);
      })
      .catch(() => {
        // Mock data
        setRecords([
          { id: "1", employee_name: "Alice Smith", status: "present", check_in_time: new Date().toISOString(), check_out_time: null },
          { id: "2", employee_name: "Bob Johnson", status: "absent", check_in_time: null, check_out_time: null },
        ]);
      })
      .finally(() => setLoading(false));
  }, [dateStr]);

  const formatTime = (isoString: string | null) => {
    if (!isoString) return "--:--";
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase" style={{ color: "var(--adm-text)" }}>Daily Roster</h1>
          <p className="text-sm mt-1" style={{ color: "var(--adm-text-3)" }}>Monitor employee attendance and work hours.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-[var(--adm-border)] bg-[var(--adm-surface)] outline-none focus:border-[var(--adm-blue)] text-sm font-semibold"
            />
            <CalendarIcon size={16} className="absolute left-4 top-3 text-[var(--adm-text-3)]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)] p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ background: "var(--adm-blue-light)", color: "var(--adm-blue)" }}>
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--adm-text-3)] uppercase tracking-wider">Total Staff</p>
            <p className="text-2xl font-bold text-[var(--adm-text)]">{records.length}</p>
          </div>
        </div>
        <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)] p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ background: "var(--adm-green-light)", color: "var(--adm-green)" }}>
            <CheckCircleIcon />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--adm-text-3)] uppercase tracking-wider">Present</p>
            <p className="text-2xl font-bold text-[var(--adm-text)]">{records.filter(r => r.status === 'present').length}</p>
          </div>
        </div>
        <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)] p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ background: "var(--adm-red-light)", color: "var(--adm-red)" }}>
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--adm-text-3)] uppercase tracking-wider">Absent / Missing</p>
            <p className="text-2xl font-bold text-[var(--adm-text)]">{records.filter(r => r.status !== 'present').length}</p>
          </div>
        </div>
      </div>

      <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)] overflow-hidden">
        <div className="p-6 border-b border-[var(--adm-border)] flex items-center justify-between" style={{ background: "var(--adm-surface-2)" }}>
          <h2 className="font-bold text-[var(--adm-text)] uppercase">Roster for {new Date(dateStr).toLocaleDateString()}</h2>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-[var(--adm-text-3)]" />
            <input type="text" placeholder="Search employee..." className="pl-9 pr-4 py-2 border border-[var(--adm-border)] bg-transparent text-sm outline-none w-64 focus:border-[var(--adm-blue)]" />
          </div>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--adm-border)]" style={{ background: "var(--adm-surface-2)" }}>
            <tr>
              <th className="px-6 py-4 font-semibold text-[var(--adm-text-2)]">Employee</th>
              <th className="px-6 py-4 font-semibold text-[var(--adm-text-2)]">Status</th>
              <th className="px-6 py-4 font-semibold text-[var(--adm-text-2)]">Check In</th>
              <th className="px-6 py-4 font-semibold text-[var(--adm-text-2)]">Check Out</th>
              <th className="px-6 py-4 font-semibold text-[var(--adm-text-2)] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--adm-border)]">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-[var(--adm-text-3)]">Loading roster...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-[var(--adm-text-3)]">No records found for this date.</td></tr>
            ) : records.map((record) => (
              <tr key={record.id} className="transition hover:bg-[var(--adm-surface-2)]">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[var(--adm-blue-light)] flex items-center justify-center text-[var(--adm-blue)] font-bold">
                      {record.employee_name?.charAt(0) || "E"}
                    </div>
                    <span className="font-medium text-[var(--adm-text)]">{record.employee_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className="px-3 py-1 text-xs font-bold capitalize"
                    style={record.status === 'present'
                      ? { background: "var(--adm-green-light)", color: "var(--adm-green)" }
                      : { background: "var(--adm-red-light)", color: "var(--adm-red)" }}
                  >
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-[var(--adm-text)]">{formatTime(record.check_in_time)}</td>
                <td className="px-6 py-4 font-medium text-[var(--adm-text)]">{formatTime(record.check_out_time)}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-sm font-semibold text-[var(--adm-blue)] hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  );
}
