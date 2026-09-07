"use client";

import { useMemo, useRef, useState } from "react";
import { AlertTriangle, Download, FileText, Lock, Plus, Search, Trash2 } from "lucide-react";

import {
  AdminConfirmDialog,
  AdminDrawer,
  AdminField,
  AdminFormActions,
  adminInputClass,
  adminInputStyle,
} from "@/components/admin/AdminUI";
import { useEmployees } from "@/hooks/useEmployees";
import {
  useAllDocuments,
  useDeleteDocument,
  useMyDocuments,
  useUploadDocumentFile,
} from "@/hooks/useDocuments";
import { documentService } from "@/services";
import { useI18n } from "@/lib/i18n";
import type { HrDocument } from "@/types";

const DOCUMENT_TYPES = ["policy", "contract", "payslip", "certificate", "other"] as const;

function iconColor(type?: string) {
  if (type === "policy") return "bg-purple-100 text-purple-600";
  if (type === "contract") return "bg-adm-blue-light text-adm-blue";
  if (type === "payslip") return "bg-adm-green-light text-adm-green";
  return "bg-adm-surface-2 text-adm-text-2";
}

function formatBytes(bytes?: number | null) {
  if (!bytes) return null;
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value < 10 && unit > 0 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
}

/** A stored file is served by the API itself; anything else is an outside link. */
function isStoredFile(doc: HrDocument) {
  return Boolean(doc.fileName) || doc.fileUrl.startsWith("/documents/");
}

export default function DocumentsVault({ isAdmin = false }) {
  const { t } = useI18n();
  const [term, setTerm] = useState("");

  // `/documents/admin` is manager-gated; a member's vault reads `/documents/me`.
  // Only the matching query is enabled so a member never trips the 403.
  const allQuery = useAllDocuments(isAdmin);
  const myQuery = useMyDocuments(!isAdmin);
  const query = isAdmin ? allQuery : myQuery;
  const documents: HrDocument[] = query.data ?? [];

  // Upload form state.
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState<string>("other");
  const [employeeId, setEmployeeId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pendingDelete, setPendingDelete] = useState<HrDocument | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Only admins need the assignee list, and `/employees` is manager-gated.
  const employeesQuery = useEmployees(isAdmin && isUploadOpen);
  const uploadFile = useUploadDocumentFile();
  const deleteDocument = useDeleteDocument();

  const filtered = useMemo(() => {
    const needle = term.trim().toLowerCase();
    if (!needle) return documents;
    return documents.filter(
      (doc) =>
        doc.title.toLowerCase().includes(needle) ||
        (doc.documentType ?? "").toLowerCase().includes(needle) ||
        (doc.fileName ?? "").toLowerCase().includes(needle),
    );
  }, [documents, term]);

  function resetForm() {
    setFile(null);
    setTitle("");
    setDocType("other");
    setEmployeeId("");
    setFormError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function closeUpload() {
    setUploadOpen(false);
    resetForm();
  }

  async function handleUpload(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setFormError(t("Choose a file to upload."));
      return;
    }

    setFormError(null);
    try {
      await uploadFile.mutateAsync({
        file,
        title: title.trim() || file.name,
        documentType: docType,
        employeeId: employeeId || null,
      });
      closeUpload();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t("Upload failed."));
    }
  }

  /**
   * The download route needs the bearer token, and an `<a href>` sends no
   * headers — so fetch the bytes through the API client and hand the browser an
   * object URL instead.
   */
  async function handleDownload(doc: HrDocument) {
    if (!isStoredFile(doc)) {
      window.open(doc.fileUrl, "_blank", "noopener,noreferrer");
      return;
    }

    setBusyId(doc.id);
    try {
      const blob = await documentService.download(doc.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = doc.fileName ?? doc.title;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      // Revoked on the next tick: Safari cancels the download if the URL dies
      // while the click is still being handled.
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      window.alert(t("Could not download this document."));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    try {
      await deleteDocument.mutateAsync(pendingDelete.id);
    } finally {
      setPendingDelete(null);
    }
  }

  return (
    <div className="flex h-full min-h-[70vh] flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase" style={{ color: "var(--adm-text)" }}>
            {t("Document Vault")}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--adm-text-3)" }}>
            {isAdmin
              ? t("Manage and distribute company documents securely.")
              : t("Access your secure documents and company policies.")}
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="btn-press flex items-center justify-center gap-2 bg-adm-blue px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
          >
            <Plus size={16} />
            {t("Upload Document")}
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col overflow-hidden border border-adm-border bg-adm-surface">
        <div className="flex items-center justify-between border-b border-adm-border bg-adm-surface-2 p-6">
          <div className="relative">
            <Search size={16} className="absolute start-3 top-2.5 text-adm-text-3" />
            <input
              type="text"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder={t("Search documents…")}
              aria-label={t("Search documents…")}
              className="w-64 border border-adm-border bg-adm-surface py-2 pe-4 ps-9 text-sm text-adm-text outline-none"
            />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-adm-text-3">
            {filtered.length}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {query.isLoading ? (
            <div className="col-span-full py-12 text-center text-adm-text-3">
              {t("Loading vault…")}
            </div>
          ) : query.isError ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <AlertTriangle size={40} className="mb-4 text-adm-red" />
              <p className="font-bold text-adm-text">{t("Could not load documents")}</p>
              <p className="text-sm text-adm-text-3">
                {query.error instanceof Error
                  ? query.error.message
                  : t("Confirm the backend is running and reachable.")}
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <Lock size={48} className="mb-4 text-adm-text-3" />
              <p className="font-bold text-adm-text">
                {term ? t("No matches") : t("Vault is empty")}
              </p>
              <p className="text-sm text-adm-text-3">
                {term
                  ? t("No documents match your search.")
                  : t("No documents are available to view.")}
              </p>
            </div>
          ) : (
            filtered.map((doc) => {
              const size = formatBytes(doc.sizeBytes);

              return (
                <div
                  key={doc.id}
                  className="group relative flex flex-col overflow-hidden border border-adm-border bg-adm-surface p-5 transition hover:border-adm-blue"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center ${iconColor(doc.documentType)}`}
                    >
                      <FileText size={24} />
                    </div>
                    <div className="flex items-center gap-1">
                      {doc.fileUrl && (
                        <button
                          type="button"
                          onClick={() => handleDownload(doc)}
                          disabled={busyId === doc.id}
                          aria-label={`${t("Download")} ${doc.title}`}
                          title={t("Download")}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-adm-text-3 transition hover:bg-adm-surface-2 hover:text-adm-blue disabled:opacity-40 lg:opacity-0 lg:group-hover:opacity-100"
                        >
                          <Download size={16} />
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => setPendingDelete(doc)}
                          aria-label={`${t("Delete")} ${doc.title}`}
                          title={t("Delete")}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-adm-text-3 transition hover:bg-adm-red-light hover:text-adm-red lg:opacity-0 lg:group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="mb-1 flex-1 font-bold leading-tight text-adm-text">{doc.title}</h3>
                  {doc.fileName && (
                    <p className="mb-2 truncate text-[11px] text-adm-text-3" title={doc.fileName}>
                      {doc.fileName}
                      {size ? ` · ${size}` : ""}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between border-t border-adm-border pt-4 text-xs">
                    <span className="font-bold uppercase tracking-wider text-adm-text-3">
                      {t(doc.documentType)}
                    </span>
                    <span className="text-adm-text-2">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {isAdmin && doc.employeeName && (
                    <div className="absolute end-0 top-0 bg-adm-amber-light px-2 py-1 text-[9px] font-bold text-adm-amber">
                      {t("Private")}: {doc.employeeName}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {isAdmin && (
        <AdminDrawer open={isUploadOpen} title={t("Upload Document")} onClose={closeUpload}>
          <form onSubmit={handleUpload} className="grid gap-5">
            <AdminField label={t("File")} htmlFor="doc-file">
              <input
                id="doc-file"
                ref={fileInputRef}
                type="file"
                required
                onChange={(event) => {
                  const picked = event.target.files?.[0] ?? null;
                  setFile(picked);
                  // Pre-fill the title from the filename so the common case is
                  // pick-and-save.
                  if (picked && !title.trim()) {
                    setTitle(picked.name.replace(/\.[^.]+$/, ""));
                  }
                }}
                className={adminInputClass}
                style={adminInputStyle}
              />
            </AdminField>
            {file && (
              <p className="-mt-3 text-xs" style={{ color: "var(--adm-text-3)" }}>
                {file.name} · {formatBytes(file.size)}
              </p>
            )}

            <AdminField label={t("Title")} htmlFor="doc-title">
              <input
                id="doc-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={file?.name ?? ""}
                className={adminInputClass}
                style={adminInputStyle}
              />
            </AdminField>

            <AdminField label={t("Type")} htmlFor="doc-type">
              <select
                id="doc-type"
                value={docType}
                onChange={(event) => setDocType(event.target.value)}
                className={adminInputClass}
                style={adminInputStyle}
              >
                {DOCUMENT_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {t(value)}
                  </option>
                ))}
              </select>
            </AdminField>

            <AdminField label={t("Assign to")} htmlFor="doc-employee">
              <select
                id="doc-employee"
                value={employeeId}
                onChange={(event) => setEmployeeId(event.target.value)}
                className={adminInputClass}
                style={adminInputStyle}
              >
                {/* No employee = visible to everyone, which is how policies are
                    published. */}
                <option value="">{t("Company-wide")}</option>
                {(employeesQuery.data ?? []).map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name ?? employee.email ?? employee.id}
                  </option>
                ))}
              </select>
            </AdminField>

            {formError && (
              <p className="text-sm" style={{ color: "var(--adm-red)" }}>
                {formError}
              </p>
            )}

            <AdminFormActions
              onCancel={closeUpload}
              isPending={uploadFile.isPending}
              submitLabel={t("Upload")}
            />
          </form>
        </AdminDrawer>
      )}

      <AdminConfirmDialog
        open={Boolean(pendingDelete)}
        title={t("Delete document")}
        description={
          pendingDelete
            ? t("“{title}” will be removed from the vault for everyone. This cannot be undone.", {
                title: pendingDelete.title,
              })
            : undefined
        }
        confirmLabel={t("Delete")}
        isPending={deleteDocument.isPending}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

