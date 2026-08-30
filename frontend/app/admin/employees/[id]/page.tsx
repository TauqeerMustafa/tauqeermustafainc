"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Edit2, Mail, Phone, MapPin, Briefcase } from "lucide-react";
import Link from "next/link";

export default function EmployeeProfile() {
  const { id } = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetch(`/api/employees/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then(data => setEmployee(data))
      .catch(() => {
        // mock for now
        setEmployee({
          id,
          employee_id_string: "TM-EMP-001",
          user: { first_name: "Muhammad", last_name: "Ali", email: "ali@example.com", phone: "+92 300 1234567" },
          job_title: "Business Development Exec",
          department: { name: "Sales" },
          status: "active",
          joining_date: "2024-01-15",
          address: "123 Main St, Lahore",
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--adm-blue)]" />
      </div>
    );
  }

  if (!employee) {
    return <div className="text-center p-8">Employee not found</div>;
  }

  const tabs = ["overview", "employment", "attendance", "leave", "tasks"];

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/employees" className="p-2 rounded-full hover:bg-[var(--adm-surface-2)] transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold uppercase" style={{ color: "var(--adm-text)" }}>Employee Profile</h1>
        </div>
        <button className="flex items-center gap-2 border border-[var(--adm-border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--adm-surface-2)]" style={{ background: "var(--adm-surface)", color: "var(--adm-text)" }}>
          <Edit2 size={16} /> Edit Profile
        </button>
      </div>

      {/* Header Card */}
      <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)] p-6 sm:p-8">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[var(--adm-blue-light)] text-[var(--adm-blue)] text-3xl font-bold">
            {employee.user?.first_name?.[0]}{employee.user?.last_name?.[0]}
          </div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[var(--adm-text)]">{employee.user?.first_name} {employee.user?.last_name}</h2>
                <p className="text-lg font-medium text-[var(--adm-text-2)]">{employee.job_title || "No Title"}</p>
              </div>
              <span className="inline-flex items-center px-3 py-1 text-sm font-semibold" style={
                employee.status === "active"
                  ? { background: "var(--adm-green-light)", color: "var(--adm-green)" }
                  : { background: "var(--adm-red-light)", color: "var(--adm-red)" }
              }>
                {employee.status}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 pt-4 border-t border-[var(--adm-border)]">
              <div className="flex items-center gap-2 text-sm text-[var(--adm-text-2)]">
                <Briefcase size={16} className="text-[var(--adm-text-3)]" />
                {employee.department?.name || "No Dept"}
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--adm-text-2)]">
                <Mail size={16} className="text-[var(--adm-text-3)]" />
                {employee.user?.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--adm-text-2)]">
                <Phone size={16} className="text-[var(--adm-text-3)]" />
                {employee.user?.phone || "No Phone"}
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--adm-text-2)]">
                <MapPin size={16} className="text-[var(--adm-text-3)]" />
                {employee.address || "No Address"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--adm-border)] overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold capitalize whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab 
                ? "border-[var(--adm-blue)] text-[var(--adm-blue)]" 
                : "border-transparent text-[var(--adm-text-3)] hover:text-[var(--adm-text-2)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-4">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)] p-6">
              <h3 className="font-bold mb-4 text-[var(--adm-text)] uppercase">Employment Information</h3>
              <dl className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--adm-text-3)]">Employee ID</dt>
                  <dd className="font-medium" style={{ color: "var(--adm-text)" }}>{employee.employee_id_string || "-"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--adm-text-3)]">Joining Date</dt>
                  <dd className="font-medium" style={{ color: "var(--adm-text)" }}>{employee.joining_date || "-"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--adm-text-3)]">Manager</dt>
                  <dd className="font-medium" style={{ color: "var(--adm-text)" }}>{employee.manager ? `${employee.manager.user?.first_name} ${employee.manager.user?.last_name}` : "None"}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab !== "overview" && (
          <div className="py-12 text-center text-[var(--adm-text-3)] bg-[var(--adm-surface-2)] border border-dashed border-[var(--adm-border)]">
            <p>This module is not yet implemented.</p>
          </div>
        )}
      </div>
    </div>
  );
}
