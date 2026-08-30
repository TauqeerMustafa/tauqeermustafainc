"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Briefcase, Save, ShieldCheck, User } from "lucide-react";

import {
  ErrorBlock,
  Field,
  Panel,
  PortalButton,
  PortalPageHeader,
  inputClass,
} from "@/components/portal/PortalUI";
import { useAdminRoles } from "@/hooks/useAdmin";
import { useCreateEmployee } from "@/hooks/useEmployees";
import type { CreateEmployeePayload } from "@/types";

const EMPTY: CreateEmployeePayload = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  roleId: null,
  employeeIdString: "",
  jobTitle: "",
  joiningDate: "",
  status: "active",
  address: "",
  emergencyContact: "",
};

export default function CreateEmployeePage() {
  const router = useRouter();
  const create = useCreateEmployee();
  const { data: rolesResponse } = useAdminRoles();
  const [form, setForm] = useState<CreateEmployeePayload>(EMPTY);

  const roles = rolesResponse?.data ?? [];

  function set<K extends keyof CreateEmployeePayload>(key: K, value: CreateEmployeePayload[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    // Blank optional strings must go up as null, not "", so Pydantic's UUID and
    // date fields don't reject them.
    create.mutate(
      {
        ...form,
        roleId: form.roleId || null,
        employeeIdString: form.employeeIdString || null,
        jobTitle: form.jobTitle || null,
        joiningDate: form.joiningDate || null,
        address: form.address || null,
        emergencyContact: form.emergencyContact || null,
      },
      { onSuccess: (employee) => router.push(`/admin/employees/${employee.id}`) },
    );
  }

  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/employees"
          aria-label="Back to employees"
          className="flex h-9 w-9 shrink-0 items-center justify-center border border-adm-border text-adm-text-2 transition hover:bg-adm-surface-2 hover:text-adm-text"
        >
          <ArrowLeft size={16} />
        </Link>
        <PortalPageHeader title="New Employee" description="Creates the login account and the employment record together." />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {create.isError && (
          <ErrorBlock
            message={(create.error as Error).message || "Could not create the employee."}
          />
        )}

        <Panel title="Personal information" icon={User}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="First name" htmlFor="firstName">
              <input
                id="firstName"
                required
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Last name" htmlFor="lastName">
              <input
                id="lastName"
                required
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field
              label="Phone / emergency contact"
              htmlFor="emergencyContact"
              hint="Stored on both the employee record and the user profile."
            >
              <input
                id="emergencyContact"
                value={form.emergencyContact ?? ""}
                onChange={(e) => set("emergencyContact", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Address" htmlFor="address">
              <input
                id="address"
                value={form.address ?? ""}
                onChange={(e) => set("address", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </Panel>

        <Panel title="Employment details" icon={Briefcase}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Employee ID" htmlFor="employeeIdString" hint="e.g. TMI-EMP-014">
              <input
                id="employeeIdString"
                value={form.employeeIdString ?? ""}
                onChange={(e) => set("employeeIdString", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Job title" htmlFor="jobTitle">
              <input
                id="jobTitle"
                value={form.jobTitle ?? ""}
                onChange={(e) => set("jobTitle", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Joining date" htmlFor="joiningDate">
              <input
                id="joiningDate"
                type="date"
                value={form.joiningDate ?? ""}
                onChange={(e) => set("joiningDate", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Status" htmlFor="status">
              <select
                id="status"
                value={form.status ?? "active"}
                onChange={(e) => set("status", e.target.value)}
                className={inputClass}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On leave</option>
              </select>
            </Field>
          </div>
        </Panel>

        <Panel title="Company account" icon={ShieldCheck}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Company email" htmlFor="email">
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field
              label="Temporary password"
              htmlFor="password"
              hint="Share it over a secure channel; the employee should change it on first login."
            >
              <input
                id="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Role" htmlFor="roleId" hint="Decides which portals this account can open.">
              <select
                id="roleId"
                value={form.roleId ?? ""}
                onChange={(e) => set("roleId", e.target.value || null)}
                className={inputClass}
              >
                <option value="">No role (portal access denied)</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Panel>

        <div className="flex justify-end gap-3">
          <PortalButton variant="ghost" onClick={() => router.push("/admin/employees")}>
            Cancel
          </PortalButton>
          <PortalButton type="submit" icon={Save} disabled={create.isPending}>
            {create.isPending ? "Creating…" : "Create employee"}
          </PortalButton>
        </div>
      </form>
    </div>
  );
}
