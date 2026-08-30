"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CreateEmployee() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    employeeId: "",
    jobTitle: "",
    departmentId: "",
    roleId: "",
    status: "active",
    phone: "",
    address: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          employee_id_string: formData.employeeId,
          job_title: formData.jobTitle,
          status: formData.status,
          address: formData.address,
          emergency_contact: formData.phone
        })
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.detail || "Failed to create employee");
      }
      router.push("/admin/employees");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/employees" className="p-2 rounded-full hover:bg-[var(--adm-surface-2)] transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold uppercase" style={{ color: "var(--adm-text)" }}>New Employee</h1>
          <p className="text-sm mt-1" style={{ color: "var(--adm-text-3)" }}>Create a new employee profile and account.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <div className="p-4 border" style={{ background: "var(--adm-red-light)", color: "var(--adm-red)", borderColor: "var(--adm-red)" }}>
            {error}
          </div>
        )}

        {/* Personal Info */}
        <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)] p-6 sm:p-8">
          <h2 className="text-lg font-bold mb-6 uppercase" style={{ color: "var(--adm-text)" }}>Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-[var(--adm-text-2)]">First Name *</label>
              <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full border border-[var(--adm-border)] bg-transparent px-4 py-2.5 outline-none focus:border-[var(--adm-blue)] transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-[var(--adm-text-2)]">Last Name *</label>
              <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full border border-[var(--adm-border)] bg-transparent px-4 py-2.5 outline-none focus:border-[var(--adm-blue)] transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-[var(--adm-text-2)]">Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-[var(--adm-border)] bg-transparent px-4 py-2.5 outline-none focus:border-[var(--adm-blue)] transition" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2 text-[var(--adm-text-2)]">Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full border border-[var(--adm-border)] bg-transparent px-4 py-2.5 outline-none focus:border-[var(--adm-blue)] transition" />
            </div>
          </div>
        </div>

        {/* Employment Info */}
        <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)] p-6 sm:p-8">
          <h2 className="text-lg font-bold mb-6 uppercase" style={{ color: "var(--adm-text)" }}>Employment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-[var(--adm-text-2)]">Employee ID</label>
              <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} className="w-full border border-[var(--adm-border)] bg-transparent px-4 py-2.5 outline-none focus:border-[var(--adm-blue)] transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-[var(--adm-text-2)]">Job Title *</label>
              <input required type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} className="w-full border border-[var(--adm-border)] bg-transparent px-4 py-2.5 outline-none focus:border-[var(--adm-blue)] transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-[var(--adm-text-2)]">Department</label>
              <select name="departmentId" value={formData.departmentId} onChange={handleChange} className="w-full border border-[var(--adm-border)] bg-transparent px-4 py-2.5 outline-none focus:border-[var(--adm-blue)] transition appearance-none">
                <option value="">Select Department</option>
                {/* Populate from API later */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-[var(--adm-text-2)]">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-[var(--adm-border)] bg-transparent px-4 py-2.5 outline-none focus:border-[var(--adm-blue)] transition appearance-none">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)] p-6 sm:p-8">
          <h2 className="text-lg font-bold mb-6 uppercase" style={{ color: "var(--adm-text)" }}>Company Account</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-[var(--adm-text-2)]">Company Email *</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-[var(--adm-border)] bg-transparent px-4 py-2.5 outline-none focus:border-[var(--adm-blue)] transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-[var(--adm-text-2)]">Temporary Password *</label>
              <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full border border-[var(--adm-border)] bg-transparent px-4 py-2.5 outline-none focus:border-[var(--adm-blue)] transition" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 bg-[var(--adm-blue)] px-8 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Create Employee
          </button>
        </div>
      </form>
    </div>
  );
}
