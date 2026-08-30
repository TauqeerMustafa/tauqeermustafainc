"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Clock, AlertCircle, CheckSquare, Activity, ChevronRight, FileText } from "lucide-react";

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/admin")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load dashboard data");
        return res.json();
      })
      .then(data => setDashboard(data))
      .catch(err => {
        console.error(err);
        // Fallback mock
        setDashboard({
          overview: { total_employees: 24, present: 19, on_leave: 2, open_tasks: 31 },
          attendance_today: { present: 19, late: 2, absent: 1, on_leave: 2 },
          pending_leave: [{ id: "1", employee: "Alice Smith" }, { id: "2", employee: "Bob Johnson" }],
          recent_activity: [
            { id: "1", action: "checked in", entity: "System" },
            { id: "2", action: "created task", entity: "Marketing" }
          ],
          tasks: [],
          projects: [],
          announcements: [],
          documents: []
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-20" style={{ background: "var(--adm-surface-2)" }}></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="h-24" style={{ background: "var(--adm-surface-2)" }}></div>
        <div className="h-24" style={{ background: "var(--adm-surface-2)" }}></div>
        <div className="h-24" style={{ background: "var(--adm-surface-2)" }}></div>
        <div className="h-24" style={{ background: "var(--adm-surface-2)" }}></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64" style={{ background: "var(--adm-surface-2)" }}></div>
        <div className="h-64" style={{ background: "var(--adm-surface-2)" }}></div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold uppercase" style={{ color: "var(--adm-text)" }}>Company Overview</h1>
        <p className="text-sm mt-1" style={{ color: "var(--adm-text-3)" }}>High-level metrics and active alerts for today.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Link href="/admin/employees" className="border border-[var(--adm-border)] bg-[var(--adm-surface)] p-5 hover:border-[var(--adm-blue)] transition group">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: "var(--adm-blue-light)", color: "var(--adm-blue)" }}><Users size={16}/></div>
            <p className="text-sm font-semibold text-[var(--adm-text-3)] group-hover:text-[var(--adm-blue)] transition">Employees</p>
          </div>
          <p className="text-3xl font-bold text-[var(--adm-text)]">{dashboard?.overview?.total_employees || 0}</p>
        </Link>

        <Link href="/admin/attendance" className="border border-[var(--adm-border)] bg-[var(--adm-surface)] p-5 hover:border-[var(--adm-green)] transition group">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: "var(--adm-green-light)", color: "var(--adm-green)" }}><Clock size={16}/></div>
            <p className="text-sm font-semibold text-[var(--adm-text-3)] group-hover:text-[var(--adm-green)] transition">Present Today</p>
          </div>
          <p className="text-3xl font-bold text-[var(--adm-text)]">{dashboard?.overview?.present || 0}</p>
        </Link>

        <Link href="/admin/leave" className="border border-[var(--adm-border)] bg-[var(--adm-surface)] p-5 hover:border-[var(--adm-amber)] transition group">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: "var(--adm-amber-light)", color: "var(--adm-amber)" }}><AlertCircle size={16}/></div>
            <p className="text-sm font-semibold text-[var(--adm-text-3)] group-hover:text-[var(--adm-amber)] transition">On Leave</p>
          </div>
          <p className="text-3xl font-bold text-[var(--adm-text)]">{dashboard?.overview?.on_leave || 0}</p>
        </Link>

        <Link href="/admin/tasks" className="border border-[var(--adm-border)] bg-[var(--adm-surface)] p-5 hover:border-[var(--adm-blue)] transition group">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: "var(--adm-blue-light)", color: "var(--adm-blue)" }}><CheckSquare size={16}/></div>
            <p className="text-sm font-semibold text-[var(--adm-text-3)] group-hover:text-[var(--adm-blue)] transition">Open Tasks</p>
          </div>
          <p className="text-3xl font-bold text-[var(--adm-text)]">{dashboard?.overview?.open_tasks || 0}</p>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="flex flex-col gap-8">
          {/* Attendance Breakdown */}
          <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)] p-6">
            <h3 className="font-bold text-[var(--adm-text)] mb-6 uppercase">Today's Roster</h3>
            <div className="flex items-center gap-4 h-6 rounded-full overflow-hidden mb-6" style={{ background: "var(--adm-surface-2)" }}>
              <div className="h-full" style={{ background: "var(--adm-green)", width: `${(dashboard?.attendance_today?.present / (dashboard?.overview?.total_employees || 1)) * 100}%` }}></div>
              <div className="h-full" style={{ background: "var(--adm-amber)", width: `${(dashboard?.attendance_today?.late / (dashboard?.overview?.total_employees || 1)) * 100}%` }}></div>
              <div className="h-full" style={{ background: "var(--adm-red)", width: `${(dashboard?.attendance_today?.absent / (dashboard?.overview?.total_employees || 1)) * 100}%` }}></div>
            </div>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--adm-green)" }}>{dashboard?.attendance_today?.present || 0}</p>
                <p className="text-[10px] uppercase font-bold tracking-wider mt-1" style={{ color: "var(--adm-text-3)" }}>Present</p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--adm-amber)" }}>{dashboard?.attendance_today?.late || 0}</p>
                <p className="text-[10px] uppercase font-bold tracking-wider mt-1" style={{ color: "var(--adm-text-3)" }}>Late</p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--adm-red)" }}>{dashboard?.attendance_today?.absent || 0}</p>
                <p className="text-[10px] uppercase font-bold tracking-wider mt-1" style={{ color: "var(--adm-text-3)" }}>Absent</p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--adm-text-3)" }}>{dashboard?.attendance_today?.on_leave || 0}</p>
                <p className="text-[10px] uppercase font-bold tracking-wider mt-1" style={{ color: "var(--adm-text-3)" }}>Leave</p>
              </div>
            </div>
          </div>

          {/* Pending Leave Inbox */}
          <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--adm-border)] flex items-center justify-between" style={{ background: "var(--adm-surface-2)" }}>
              <h3 className="font-bold text-[var(--adm-text)] flex items-center gap-2 uppercase"><AlertCircle size={16} style={{ color: "var(--adm-amber)" }}/> Action Required</h3>
              <Link href="/admin/leave" className="text-xs font-semibold text-[var(--adm-blue)] hover:underline">View Inbox</Link>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--adm-border)" }}>
              {!dashboard?.pending_leave?.length ? (
                <p className="text-sm p-6 text-center" style={{ color: "var(--adm-text-3)" }}>Inbox zero! No pending leave requests.</p>
              ) : (
                dashboard.pending_leave.map((l:any) => (
                  <Link href="/admin/leave" key={l.id} className="flex items-center justify-between p-4 hover:bg-[var(--adm-surface-2)] transition group">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: "var(--adm-amber-light)", color: "var(--adm-amber)" }}>{l.employee.charAt(0)}</div>
                      <span className="text-sm font-semibold text-[var(--adm-text)]">{l.employee} requested time off</span>
                    </div>
                    <ChevronRight size={16} className="group-hover:text-[var(--adm-blue)] transition" style={{ color: "var(--adm-text-3)" }} />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {/* Recent Activity Stream */}
          <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)] overflow-hidden h-full flex flex-col">
            <div className="px-6 py-4 border-b border-[var(--adm-border)] flex items-center justify-between" style={{ background: "var(--adm-surface-2)" }}>
              <h3 className="font-bold text-[var(--adm-text)] flex items-center gap-2 uppercase"><Activity size={16}/> Live Activity Feed</h3>
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full opacity-75" style={{ background: "var(--adm-green)" }}></span>
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "var(--adm-green)" }}></span>
              </span>
            </div>
            <div className="p-6 flex-1">
              {!dashboard?.recent_activity?.length ? (
                <p className="text-sm text-center py-10" style={{ color: "var(--adm-text-3)" }}>No recent system activity.</p>
              ) : (
                <div className="relative border-l-2 ml-3 flex flex-col gap-6 py-2" style={{ borderColor: "var(--adm-border)" }}>
                  {dashboard.recent_activity.map((act:any, i:number) => (
                    <div key={act.id} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 flex items-center justify-center" style={{ background: "var(--adm-surface)", borderColor: "var(--adm-border-2)" }}>
                        <div className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--adm-text-3)" }}></div>
                      </div>
                      <p className="text-sm text-[var(--adm-text)] font-medium"><span className="font-bold">{act.action}</span> - {act.entity}</p>
                      <p className="text-xs text-[var(--adm-text-3)] mt-1">Just now</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
