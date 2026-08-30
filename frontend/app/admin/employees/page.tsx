"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Plus, MoreVertical, Edit2, UserX, Eye } from "lucide-react";

export default function EmployeesList() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/employees") // Ideally use proper api service
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => setEmployees(data))
      .catch(() => {
        // mock data if backend not running
        setEmployees([
          {
            id: "1",
            employee_id_string: "TM-EMP-001",
            user: { first_name: "Muhammad", last_name: "Ali", email: "ali@example.com" },
            job_title: "Business Development Exec",
            department: { name: "Sales" },
            status: "active",
          }
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const name = `${emp.user?.first_name} ${emp.user?.last_name}`.toLowerCase();
    return name.includes(search.toLowerCase()) || 
           emp.employee_id_string?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase" style={{ color: "var(--adm-text)" }}>Employees</h1>
          <p className="text-sm mt-1" style={{ color: "var(--adm-text-3)" }}>Manage company employees and roles.</p>
        </div>
        <Link
          href="/admin/employees/create"
          className="flex items-center gap-2 bg-[var(--adm-blue)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Plus size={16} /> Add Employee
        </Link>
      </div>

      <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)] overflow-hidden">
        <div className="p-4 border-b border-[var(--adm-border)] flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--adm-text-3)]" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-[var(--adm-border)] bg-transparent pl-10 pr-4 py-2 text-sm outline-none focus:border-[var(--adm-blue)] transition"
            />
          </div>
          {/* Add more filters here later */}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--adm-border)] bg-[var(--adm-surface-2)]">
                <th className="px-6 py-4 font-semibold text-[var(--adm-text-2)]">Employee</th>
                <th className="px-6 py-4 font-semibold text-[var(--adm-text-2)]">ID</th>
                <th className="px-6 py-4 font-semibold text-[var(--adm-text-2)]">Role & Dept</th>
                <th className="px-6 py-4 font-semibold text-[var(--adm-text-2)]">Status</th>
                <th className="px-6 py-4 font-semibold text-[var(--adm-text-2)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--adm-border)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--adm-text-3)]">Loading...</td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--adm-text-3)]">No employees found.</td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="transition hover:bg-[var(--adm-surface-2)]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--adm-blue-light)] text-[var(--adm-blue)] font-bold">
                          {emp.user?.first_name?.[0]}{emp.user?.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--adm-text)]">{emp.user?.first_name} {emp.user?.last_name}</p>
                          <p className="text-xs text-[var(--adm-text-3)]">{emp.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-[var(--adm-text-2)]">{emp.employee_id_string || "-"}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-[var(--adm-text-2)]">{emp.job_title || "Unknown Role"}</p>
                      <p className="text-xs text-[var(--adm-text-3)]">{emp.department?.name || "No Dept"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold" style={
                        emp.status === "active"
                          ? { background: "var(--adm-green-light)", color: "var(--adm-green)" }
                          : { background: "var(--adm-red-light)", color: "var(--adm-red)" }
                      }>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/employees/${emp.id}`} className="p-1.5 hover:bg-[var(--adm-surface-2)] transition text-[var(--adm-text-2)]" title="View Profile">
                          <Eye size={16} />
                        </Link>
                        <button className="p-1.5 hover:bg-[var(--adm-surface-2)] transition text-[var(--adm-text-2)]" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-1.5 hover:bg-[var(--adm-red-light)] transition" style={{ color: "var(--adm-red)" }} title="Deactivate">
                          <UserX size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
