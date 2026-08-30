"use client";

import { useEffect, useState } from "react";
import { Clock, CheckCircle, LogOut, Calendar } from "lucide-react";

export default function EmployeeAttendancePage() {
  const [history, setHistory] = useState<any[]>([]);
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/attendance/me")
      .then(res => res.json())
      .then(data => {
        // Just mocking for now
        setHistory(data || [
          { date: new Date().toISOString().split("T")[0], status: "present", check_in_time: new Date().toISOString(), check_out_time: null }
        ]);
        setTodayRecord(data?.[0] || { check_in_time: new Date().toISOString(), check_out_time: null });
      })
      .catch(() => {
        const today = new Date().toISOString().split("T")[0];
        setHistory([
          { date: today, status: "present", check_in_time: new Date().toISOString(), check_out_time: null }
        ]);
        setTodayRecord({ date: today, status: "present", check_in_time: new Date().toISOString(), check_out_time: null });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCheckIn = async () => {
    // API call to POST /api/attendance/check-in
    setTodayRecord({ ...todayRecord, check_in_time: new Date().toISOString() });
    alert("Checked in successfully!");
  };

  const handleCheckOut = async () => {
    // API call to POST /api/attendance/check-out
    setTodayRecord({ ...todayRecord, check_out_time: new Date().toISOString() });
    alert("Checked out successfully!");
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return "--:--";
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold uppercase" style={{ color: "var(--adm-text)" }}>My Attendance</h1>
        <p className="text-sm mt-1" style={{ color: "var(--adm-text-3)" }}>Log your daily work hours and view your attendance history.</p>
      </div>

      {/* Today's Action Card */}
      <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)] p-8 text-center flex flex-col items-center">
        <h2 className="text-xl font-bold text-[var(--adm-text)] mb-6">Today, {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
        
        <div className="flex items-center gap-12 mb-8">
          <div className="flex flex-col items-center">
            <p className="text-sm text-[var(--adm-text-3)] mb-2 uppercase font-semibold tracking-wider">Check In</p>
            <p className="text-3xl font-bold text-[var(--adm-text)]">{todayRecord?.check_in_time ? formatTime(todayRecord.check_in_time) : "--:--"}</p>
          </div>
          <div className="h-16 w-px bg-[var(--adm-border)]"></div>
          <div className="flex flex-col items-center">
            <p className="text-sm text-[var(--adm-text-3)] mb-2 uppercase font-semibold tracking-wider">Check Out</p>
            <p className="text-3xl font-bold text-[var(--adm-text)]">{todayRecord?.check_out_time ? formatTime(todayRecord.check_out_time) : "--:--"}</p>
          </div>
        </div>

        {!todayRecord?.check_in_time ? (
          <button onClick={handleCheckIn} className="flex items-center gap-2 bg-[var(--adm-blue)] px-8 py-4 text-lg font-bold text-white transition hover:opacity-90">
            <CheckCircle size={24} /> Check In Now
          </button>
        ) : !todayRecord?.check_out_time ? (
          <button onClick={handleCheckOut} className="flex items-center gap-2 px-8 py-4 text-lg font-bold text-white transition hover:opacity-90" style={{ background: "var(--adm-red)" }}>
            <LogOut size={24} /> Check Out Now
          </button>
        ) : (
          <div className="flex items-center gap-2 px-6 py-3 font-bold border" style={{ color: "var(--adm-green)", background: "var(--adm-green-light)", borderColor: "var(--adm-green)" }}>
            <CheckCircle size={20} /> Shift Completed
          </div>
        )}
      </div>

      {/* History */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={20} className="text-[var(--adm-text-2)]" />
          <h2 className="text-lg font-bold text-[var(--adm-text)]">Recent History</h2>
        </div>
        
        <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)] overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--adm-surface-2)] border-b border-[var(--adm-border)]">
              <tr>
                <th className="px-6 py-4 font-semibold text-[var(--adm-text-2)]">Date</th>
                <th className="px-6 py-4 font-semibold text-[var(--adm-text-2)]">Status</th>
                <th className="px-6 py-4 font-semibold text-[var(--adm-text-2)]">Check In</th>
                <th className="px-6 py-4 font-semibold text-[var(--adm-text-2)]">Check Out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--adm-border)]">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-[var(--adm-text-3)]">Loading history...</td></tr>
              ) : history.map((record, i) => (
                <tr key={i} className="hover:bg-[var(--adm-surface-2)] transition">
                  <td className="px-6 py-4 font-medium text-[var(--adm-text)]">{record.date}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs font-bold capitalize" style={record.status === 'present' ? { background: "var(--adm-green-light)", color: "var(--adm-green)" } : { background: "var(--adm-red-light)", color: "var(--adm-red)" }}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[var(--adm-text-2)]">{formatTime(record.check_in_time)}</td>
                  <td className="px-6 py-4 text-[var(--adm-text-2)]">{formatTime(record.check_out_time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
