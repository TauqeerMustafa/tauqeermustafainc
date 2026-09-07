"use client";

import { useCurrentUser } from "@/hooks/useAuth";
import { User, Mail, Phone, MapPin, Briefcase } from "lucide-react";

export default function MyProfilePage() {
  const { data } = useCurrentUser();
  const user = data?.data;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full h-full min-h-[70vh]">
      <div>
        <h1 className="text-2xl font-bold uppercase" style={{ color: "var(--adm-text)" }}>My Profile</h1>
        <p className="text-sm mt-1" style={{ color: "var(--adm-text-3)" }}>View your personal and employment information.</p>
      </div>

      <div className="border border-adm-border bg-adm-surface overflow-hidden flex flex-col md:flex-row mt-4">
        {/* Sidebar avatar */}
        <div className="w-full md:w-1/3 bg-adm-surface-2 border-r border-adm-border p-10 flex flex-col items-center justify-center text-center">
          <div className="h-32 w-32 rounded-full bg-adm-blue-light text-adm-blue flex items-center justify-center text-4xl font-bold mb-6">
            {user?.name?.charAt(0) || "U"}
          </div>
          <h2 className="text-xl font-bold text-adm-text">{user?.name}</h2>
          <p className="text-sm text-adm-text-3 font-semibold mt-1 uppercase tracking-wider">{user?.role || "Employee"}</p>
        </div>
        
        {/* Details */}
        <div className="w-full md:w-2/3 p-10 flex flex-col gap-8">
          <div>
            <h3 className="text-sm font-bold text-adm-text-2 uppercase tracking-widest mb-4">Contact Information</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 text-sm">
                <Mail size={18} className="text-adm-text-3" />
                <span className="font-medium text-adm-text">{user?.email || "No email provided"}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <Phone size={18} className="text-adm-text-3" />
                <span className="font-medium text-adm-text-3 italic">No phone number on record</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <MapPin size={18} className="text-adm-text-3" />
                <span className="font-medium text-adm-text-3 italic">No address on record</span>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-adm-border">
            <h3 className="text-sm font-bold text-adm-text-2 uppercase tracking-widest mb-4">Employment Details</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 text-sm">
                <Briefcase size={18} className="text-adm-text-3" />
                <span className="font-medium text-adm-text">{user?.role || "Employee"}</span>
              </div>
              <p className="text-xs font-semibold px-4 py-2 inline-flex self-start mt-2 border" style={{ color: "var(--adm-amber)", background: "var(--adm-amber-light)", borderColor: "var(--adm-amber)" }}>
                To update your employment information, please contact HR or an Administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
