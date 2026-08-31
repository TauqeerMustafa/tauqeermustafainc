"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Download, FileText, Lock, Search } from "lucide-react";

import { useAllDocuments, useMyDocuments } from "@/hooks/useDocuments";
import type { HrDocument } from "@/types";

function iconColor(type?: string) {
  if (type === "policy") return "bg-purple-100 text-purple-600";
  if (type === "contract") return "bg-adm-blue-light text-adm-blue";
  if (type === "payslip") return "bg-adm-green-light text-adm-green";
  return "bg-adm-surface-2 text-adm-text-2";
}

export default function DocumentsVault({ isAdmin = false }) {
  const [term, setTerm] = useState("");

  // `/documents/admin` is manager-gated; a member's vault reads `/documents/me`.
  // Only the matching query is enabled so a member never trips the 403.
  const allQuery = useAllDocuments(isAdmin);
  const myQuery = useMyDocuments(!isAdmin);
  const query = isAdmin ? allQuery : myQuery;
  const documents: HrDocument[] = query.data ?? [];

  const filtered = useMemo(() => {
    const needle = term.trim().toLowerCase();
    if (!needle) return documents;
    return documents.filter(
      (doc) =>
        doc.title.toLowerCase().includes(needle) ||
        (doc.documentType ?? "").toLowerCase().includes(needle),
    );
  }, [documents, term]);

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
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-adm-text-3" />
            <input
              type="text"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search documents..."
              className="pl-9 pr-4 py-2 border border-adm-border bg-adm-surface text-sm text-adm-text outline-none w-64"
            />
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {query.isLoading ? (
            <div className="col-span-full py-12 text-center text-adm-text-3">Loading vault…</div>
          ) : query.isError ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
              <AlertTriangle size={40} className="text-adm-red mb-4" />
              <p className="font-bold text-adm-text">Could not load documents</p>
              <p className="text-sm text-adm-text-3">{query.error instanceof Error ? query.error.message : "Confirm the backend is running and reachable."}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
              <Lock size={48} className="text-adm-text-3 mb-4" />
              <p className="font-bold text-adm-text">{term ? "No matches" : "Vault is empty"}</p>
              <p className="text-sm text-adm-text-3">{term ? "No documents match your search." : "No documents are available to view."}</p>
            </div>
          ) : (
            filtered.map((doc) => (
              <div key={doc.id} className="group border border-adm-border bg-adm-surface p-5 hover:border-adm-blue transition cursor-pointer relative overflow-hidden flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-12 w-12 flex items-center justify-center ${iconColor(doc.documentType)}`}>
                    <FileText size={24} />
                  </div>
                  {doc.fileUrl && (
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" aria-label={`Download ${doc.title}`} className="h-8 w-8 rounded-full hover:bg-adm-surface-2 flex items-center justify-center text-adm-text-3 hover:text-adm-blue transition opacity-0 group-hover:opacity-100">
                      <Download size={16} />
                    </a>
                  )}
                </div>

                <h3 className="font-bold text-adm-text leading-tight mb-2 flex-1">{doc.title}</h3>

                <div className="flex items-center justify-between text-xs mt-auto pt-4 border-t border-adm-border">
                  <span className="font-bold uppercase tracking-wider text-adm-text-3">{doc.documentType}</span>
                  <span className="text-adm-text-2">{new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>

                {isAdmin && doc.employeeName && (
                  <div className="absolute top-0 right-0 bg-adm-amber-light text-adm-amber text-[9px] font-bold px-2 py-1">
                    Private: {doc.employeeName}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
