"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, FileText, Bell, CheckSquare, FolderOpen, AlertCircle } from "lucide-react";
import { useCurrentUser } from "@/hooks/useAuth";

export default function EmployeeDashboard() {
  const { data } = useCurrentUser();
  const user = data?.data;
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/employee")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load dashboard data");
        return res.json();
      })
      .then(data => setDashboard(data))
      .catch(err => {
        console.error(err);
        // Fallback mock for demo if DB is offline
        setDashboard({
          attendance: { status: "present", check_in_time: new Date().toISOString() },
          tasks: [
            { id: "1", title: "Review Q4 Marketing Assets", status: "in_progress" },
            { id: "2", title: "Submit Expense Report", status: "todo" }
          ],
          leave: { pending_count: 1 },
          projects: [{ id: "1", name: "Internal Portal Refactor", status: "active" }],
          announcements: [{ id: "1", title: "Welcome to the new portal!", date: "2024-10-01" }],
          documents: [{ id: "1", title: "Employee Handbook.pdf", type: "policy" }]
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCheckIn = async () => {
    try {
      await fetch("/api/attendance/check-in", { method: "POST" });
      alert("Checked in successfully!");
      window.location.reload();
    } catch (e) {
      alert("Error checking in");
    }
  };

  if (loading) return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-20 bg-[var(--adm-surface-2)]"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-32 bg-[var(--adm-surface-2)]"></div>
        <div className="h-32 bg-[var(--adm-surface-2)]"></div>
        <div className="h-32 bg-[var(--adm-surface-2)]"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-[var(--adm-surface-2)]"></div>
        <div className="h-64 bg-[var(--adm-surface-2)]"></div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold uppercase" style={{ color: "var(--adm-text)" }}>Good morning, {user?.name?.split(" ")[0] || "Employee"}!</h1>
        <p className="text-sm mt-1" style={{ color: "var(--adm-text-3)" }}>Here's what is happening today.</p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Attendance Widget */}
        <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)] p-6 flex flex-col justify-between hover:border-[var(--adm-blue)] transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--adm-text)] flex items-center gap-2"><Clock size={18} className="text-[var(--adm-blue)]"/> Attendance</h3>
            <Link href="/employees/attendance" className="text-xs font-semibold text-[var(--adm-blue)] hover:underline">View Log</Link>
          </div>
          {dashboard?.attendance?.status === "present" ? (
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ background: "var(--adm-green-light)", color: "var(--adm-green)" }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--adm-text)]">Present</p>
                <p className="text-xs text-[var(--adm-text-3)] font-medium">Checked in today</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-[var(--adm-text-2)] font-medium">You haven't checked in yet.</p>
              <button onClick={handleCheckIn} className="w-full py-2.5 bg-[var(--adm-blue)] text-white font-bold text-sm hover:opacity-90 transition">
                Check In Now
              </button>
            </div>
          )}
        </div>

        {/* Tasks Widget */}
        <Link href="/employees/tasks" className="border border-[var(--adm-border)] bg-[var(--adm-surface)] p-6 flex flex-col justify-between group hover:border-[var(--adm-blue)] transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--adm-text)] flex items-center gap-2"><CheckSquare size={18} style={{ color: "var(--adm-blue)" }}/> Tasks</h3>
            <span className="text-xs font-semibold text-[var(--adm-blue)] group-hover:underline">Go to Board</span>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-4xl font-black text-[var(--adm-text)]">{dashboard?.tasks?.filter((t:any) => t.status !== 'done').length || 0}</p>
            <p className="text-sm text-[var(--adm-text-3)] font-medium leading-tight">Open tasks<br/>require attention</p>
          </div>
        </Link>

        {/* Leave Widget */}
        <Link href="/employees/leave" className="border border-[var(--adm-border)] bg-[var(--adm-surface)] p-6 flex flex-col justify-between group hover:border-[var(--adm-blue)] transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--adm-text)] flex items-center gap-2"><AlertCircle size={18} className="text-amber-500"/> Leave</h3>
            <span className="text-xs font-semibold text-[var(--adm-blue)] group-hover:underline">Manage Requests</span>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-4xl font-black text-[var(--adm-text)]">{dashboard?.leave?.pending_count || 0}</p>
            <p className="text-sm text-[var(--adm-text-3)] font-medium leading-tight">Pending requests<br/>awaiting approval</p>
          </div>
        </Link>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column */}
        <div className="flex flex-col gap-8">
          
          {/* Today's Work */}
          <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--adm-border)] bg-[var(--adm-surface-2)] flex items-center justify-between">
              <h3 className="font-bold text-[var(--adm-text)]">Today's Work</h3>
              <Link href="/employees/tasks" className="text-xs font-semibold text-[var(--adm-blue)] hover:underline">View All</Link>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {!dashboard?.tasks?.length ? (
                <p className="text-sm text-[var(--adm-text-3)] p-4 text-center">No tasks on your plate today.</p>
              ) : (
                dashboard.tasks.slice(0, 4).map((t:any) => (
                  <div key={t.id} className="flex items-center justify-between p-3 hover:bg-[var(--adm-surface-2)] transition border border-transparent hover:border-[var(--adm-border)]">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${t.status === 'done' ? 'bg-[var(--adm-green)]' : 'bg-[var(--adm-blue)]'}`}></div>
                      <span className={`text-sm font-semibold text-[var(--adm-text)] ${t.status === 'done' ? 'line-through text-[var(--adm-text-3)]' : ''}`}>{t.title}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-[var(--adm-surface-2)] text-[var(--adm-text-2)]">{t.status.replace('_', ' ')}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Projects */}
          <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--adm-border)] bg-[var(--adm-surface-2)] flex items-center justify-between">
              <h3 className="font-bold text-[var(--adm-text)] flex items-center gap-2"><FolderOpen size={16}/> Active Projects</h3>
              <Link href="/employees/projects" className="text-xs font-semibold text-[var(--adm-blue)] hover:underline">View Hub</Link>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {!dashboard?.projects?.length ? (
                <p className="text-sm text-[var(--adm-text-3)] p-4 text-center">No active projects.</p>
              ) : (
                dashboard.projects.map((p:any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-[var(--adm-surface-2)] border border-[var(--adm-border)]">
                    <span className="text-sm font-bold text-[var(--adm-text)]">{p.name}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1" style={{ background: "var(--adm-blue-light)", color: "var(--adm-blue)" }}>{p.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-8">
          
          {/* Announcements */}
          <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--adm-border)] bg-[var(--adm-surface-2)] flex items-center justify-between">
              <h3 className="font-bold text-[var(--adm-text)] flex items-center gap-2"><Bell size={16} className="text-rose-500"/> Announcements</h3>
              <Link href="/employees/announcements" className="text-xs font-semibold text-[var(--adm-blue)] hover:underline">Read All</Link>
            </div>
            <div className="divide-y divide-[var(--adm-border)]">
              {!dashboard?.announcements?.length ? (
                <p className="text-sm text-[var(--adm-text-3)] p-6 text-center">No recent announcements.</p>
              ) : (
                dashboard.announcements.map((a:any) => (
                  <div key={a.id} className="p-6 hover:bg-[var(--adm-surface-2)] transition cursor-pointer">
                    <h4 className="font-bold text-[var(--adm-text)] mb-1">{a.title}</h4>
                    <p className="text-xs text-[var(--adm-text-3)] font-medium">{a.date}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Documents */}
          <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--adm-border)] bg-[var(--adm-surface-2)] flex items-center justify-between">
              <h3 className="font-bold text-[var(--adm-text)] flex items-center gap-2"><FileText size={16}/> Recent Documents</h3>
              <Link href="/employees/documents" className="text-xs font-semibold text-[var(--adm-blue)] hover:underline">Vault</Link>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {!dashboard?.documents?.length ? (
                <p className="text-sm text-[var(--adm-text-3)] p-4 text-center">Vault is empty.</p>
              ) : (
                dashboard.documents.map((d:any) => (
                  <div key={d.id} className="flex items-center gap-3 p-3 hover:bg-[var(--adm-surface-2)] transition cursor-pointer">
                    <div className="h-10 w-10 bg-[var(--adm-surface-2)] flex items-center justify-center text-[var(--adm-blue)] shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-sm text-[var(--adm-text)] truncate">{d.title}</h4>
                      <p className="text-xs text-[var(--adm-text-3)] uppercase font-semibold tracking-wider mt-0.5">{d.type}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
