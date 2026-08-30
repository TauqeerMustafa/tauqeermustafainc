"use client";

import { useEffect, useState } from "react";
import { FileText, Download, Lock, Search, Filter } from "lucide-react";

export default function DocumentsVault({ isAdmin = false }) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(isAdmin ? "/api/documents/admin" : "/api/documents/me")
      .then(res => res.json())
      .then(data => setDocuments(data || []))
      .catch(() => {
        // Mock data
        setDocuments([
          { id: "1", title: "Employee Handbook 2024", document_type: "policy", created_at: "2024-01-01T00:00:00Z" },
          { id: "2", title: "Non-Disclosure Agreement", document_type: "contract", created_at: "2024-02-15T00:00:00Z" },
          { id: "3", title: "Q3 Bonus Payslip", document_type: "payslip", created_at: "2024-10-01T00:00:00Z", employee_name: "Alice Smith" },
        ]);
      })
      .finally(() => setLoading(false));
  }, [isAdmin]);

  const getIconColor = (type: string) => {
    if (type === 'policy') return 'bg-purple-100 text-purple-600';
    if (type === 'contract') return 'bg-adm-blue-light text-adm-blue';
    if (type === 'payslip') return 'bg-adm-green-light text-adm-green';
    return 'bg-adm-surface-2 text-adm-text-2';
  };

  return (
    <div className="flex flex-col gap-6 h-full min-h-[70vh]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase" style={{ color: "var(--adm-text)" }}>Document Vault</h1>
          <p className="text-sm mt-1" style={{ color: "var(--adm-text-3)" }}>
            {isAdmin ? "Manage and distribute company documents securely." : "Access your secure documents and company policies."}
          </p>
        </div>
        {isAdmin && (
          <button className="flex items-center gap-2 bg-adm-blue px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90">
            Upload Document
          </button>
        )}
      </div>

      <div className="border border-adm-border bg-adm-surface overflow-hidden flex-1 flex flex-col">
        <div className="p-6 border-b border-adm-border flex items-center justify-between bg-adm-surface-2">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-2.5 text-adm-text-3" />
              <input type="text" placeholder="Search documents..." className="pl-9 pr-4 py-2 border border-adm-border text-sm outline-none w-64" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-adm-border text-sm font-semibold text-adm-text-2 hover:bg-adm-surface-2 transition">
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full py-12 text-center text-adm-text-3">Loading vault...</div>
          ) : documents.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
              <Lock size={48} className="text-adm-text-3 mb-4" />
              <p className="font-bold text-adm-text">Vault is empty</p>
              <p className="text-sm text-adm-text-3">No documents are available to view.</p>
            </div>
          ) : documents.map((doc) => (
            <div key={doc.id} className="group border border-adm-border bg-adm-surface p-5 hover:border-adm-blue transition cursor-pointer relative overflow-hidden flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className={`h-12 w-12 flex items-center justify-center ${getIconColor(doc.document_type)}`}>
                  <FileText size={24} />
                </div>
                <button className="h-8 w-8 rounded-full hover:bg-adm-surface-2 flex items-center justify-center text-adm-text-3 hover:text-adm-blue transition opacity-0 group-hover:opacity-100">
                  <Download size={16} />
                </button>
              </div>
              
              <h3 className="font-bold text-adm-text leading-tight mb-2 flex-1">{doc.title}</h3>
              
              <div className="flex items-center justify-between text-xs mt-auto pt-4 border-t border-adm-border">
                <span className="font-bold uppercase tracking-wider text-adm-text-3">{doc.document_type}</span>
                <span className="text-adm-text-2">{new Date(doc.created_at).toLocaleDateString()}</span>
              </div>
              
              {isAdmin && doc.employee_name && (
                <div className="absolute top-0 right-0 bg-adm-amber-light text-adm-amber text-[9px] font-bold px-2 py-1">
                  Private: {doc.employee_name}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
