"use client";

import { useCurrentUser } from "@/hooks/useAuth";

export default function EmployeeDashboardPage() {
  const { data } = useCurrentUser();
  const user = data?.data;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#141413]">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="mt-2 text-[#696969]">Here is an overview of your work.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-[40px] border border-[#e2ded9] bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-[#141413]">My Tasks</h2>
          <p className="mt-2 text-3xl font-bold text-[#CF4500]">0</p>
          <a href="/employees/tasks" className="mt-4 block text-sm font-medium text-[#141413] hover:underline">View tasks &rarr;</a>
        </div>
        <div className="rounded-[40px] border border-[#e2ded9] bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-[#141413]">My Leads</h2>
          <p className="mt-2 text-3xl font-bold text-[#CF4500]">0</p>
          <a href="/employees/leads" className="mt-4 block text-sm font-medium text-[#141413] hover:underline">View CRM &rarr;</a>
        </div>
      </div>
    </div>
  );
}

