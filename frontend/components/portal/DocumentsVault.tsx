"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Lock,
  MessageSquare,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import {
  AdminConfirmDialog,
  AdminDrawer,
  AdminField,
  AdminFormActions,
  adminInputClass,
  adminInputStyle,
} from "@/components/admin/AdminUI";
import { Tabs } from "@/components/portal/PortalUI";
import PeopleBanner from "@/components/portal/PeopleBanner";
import { useEmployees } from "@/hooks/useEmployees";
import {
  useAllDocuments,
  useDeleteDocument,
  useDocumentResponses,
  useMyDocuments,
  useSubmitDocumentResponse,
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
  const [requiresAction, setRequiresAction] = useState(false);
  const [actionNote, setActionNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pendingDelete, setPendingDelete] = useState<HrDocument | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Response dialog state (for Agree, Disagree, Request Review)
  const [responseDoc, setResponseDoc] = useState<HrDocument | null>(null);
  const [responseStatus, setResponseStatus] = useState<"agreed" | "disagreed" | "review_requested">("agreed");
  const [responseNote, setResponseNote] = useState("");
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [responseDialogError, setResponseDialogError] = useState<string | null>(null);
  const [submittingDocId, setSubmittingDocId] = useState<string | null>(null);

  // Admin audit log / responses view
  const [viewResponsesDoc, setViewResponsesDoc] = useState<HrDocument | null>(null);

  // Only admins need the assignee list, and `/employees` is manager-gated.
  const employeesQuery = useEmployees(isAdmin && isUploadOpen);
  const uploadFile = useUploadDocumentFile();
  const deleteDocument = useDeleteDocument();
  const submitResponse = useSubmitDocumentResponse();
  const responsesQuery = useDocumentResponses(
    viewResponsesDoc?.id ?? null,
    Boolean(viewResponsesDoc && isAdmin),
  );

  const [category, setCategory] = useState<string>("all");

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: documents.length };
    let actionReqCount = 0;
    for (const doc of documents) {
      const docTypeKey = doc.documentType ?? "other";
      counts[docTypeKey] = (counts[docTypeKey] ?? 0) + 1;
      if (doc.requiresAction) {
        actionReqCount++;
      }
    }
    counts["action_required"] = actionReqCount;
    return counts;
  }, [documents]);

  const documentTabs = useMemo(
    () => [
      { id: "all", label: t("All Documents"), count: categoryCounts.all },
      { id: "action_required", label: t("Action Required"), count: categoryCounts.action_required ?? 0 },
      { id: "policy", label: t("Policies"), count: categoryCounts.policy ?? 0 },
      { id: "contract", label: t("Contracts"), count: categoryCounts.contract ?? 0 },
      { id: "payslip", label: t("Payslips"), count: categoryCounts.payslip ?? 0 },
      { id: "certificate", label: t("Certificates"), count: categoryCounts.certificate ?? 0 },
      { id: "other", label: t("Other"), count: categoryCounts.other ?? 0 },
    ],
    [categoryCounts, t],
  );

  const filtered = useMemo(() => {
    const needle = term.trim().toLowerCase();
    return documents.filter((doc) => {
      if (category === "action_required") {
        if (!doc.requiresAction) return false;
      } else if (category !== "all") {
        if ((doc.documentType ?? "other") !== category) return false;
      }
      if (!needle) return true;
      return (
        doc.title.toLowerCase().includes(needle) ||
        (doc.documentType ?? "").toLowerCase().includes(needle) ||
        (doc.fileName ?? "").toLowerCase().includes(needle) ||
        (doc.actionNote ?? "").toLowerCase().includes(needle)
      );
    });
  }, [documents, category, term]);

  function resetForm() {
    setFile(null);
    setTitle("");
    setDocType("other");
    setEmployeeId("");
    setRequiresAction(false);
    setActionNote("");
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
        requiresAction,
        actionNote: actionNote.trim() || undefined,
      });
      closeUpload();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t("Upload failed."));
    }
  }

  async function handleQuickAgree(doc: HrDocument) {
    setSubmittingDocId(doc.id);
    try {
      await submitResponse.mutateAsync({
        documentId: doc.id,
        payload: { status: "agreed", note: doc.myResponse?.note || undefined },
      });
    } catch (err) {
      window.alert(err instanceof Error ? err.message : t("Failed to submit response."));
    } finally {
      setSubmittingDocId(null);
    }
  }

  function openResponseModal(doc: HrDocument, status: "agreed" | "disagreed" | "review_requested") {
    setResponseDoc(doc);
    setResponseStatus(status);
    setResponseNote(doc.myResponse?.note || "");
    setResponseDialogError(null);
    setIsResponseDialogOpen(true);
  }

  async function handleResponseSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!responseDoc) return;
    setSubmittingDocId(responseDoc.id);
    setResponseDialogError(null);
    try {
      await submitResponse.mutateAsync({
        documentId: responseDoc.id,
        payload: { status: responseStatus, note: responseNote.trim() || undefined },
      });
      setIsResponseDialogOpen(false);
      setResponseDoc(null);
    } catch (err) {
      setResponseDialogError(err instanceof Error ? err.message : t("Failed to submit response."));
    } finally {
      setSubmittingDocId(null);
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
      {isAdmin && <PeopleBanner active="documents" />}

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
        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="btn-press flex items-center justify-center gap-2 bg-adm-blue px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
        >
          <Plus size={16} />
          {t("Upload Document")}
        </button>
      </div>

      <Tabs tabs={documentTabs} value={category} onChange={setCategory} />

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

                  {doc.requiresAction && (
                    <div className="my-3 rounded border border-adm-border bg-adm-surface-2 p-3 text-xs">
                      <div className="flex items-center justify-between gap-1 font-bold">
                        <span className="flex items-center gap-1.5 text-adm-blue">
                          <AlertCircle size={14} className="shrink-0" />
                          <span className="truncate">{t("Action Required")}</span>
                        </span>
                        {doc.myResponse ? (
                          <span
                            className={`inline-flex shrink-0 items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              doc.myResponse.status === "agreed"
                                ? "border border-green-300 bg-green-100 text-green-800"
                                : doc.myResponse.status === "disagreed"
                                ? "border border-red-300 bg-red-100 text-red-800"
                                : "border border-amber-300 bg-amber-100 text-amber-800"
                            }`}
                          >
                            {doc.myResponse.status === "agreed"
                              ? `✓ ${t("Agreed")}`
                              : doc.myResponse.status === "disagreed"
                              ? `✕ ${t("Disagreed")}`
                              : `✎ ${t("Review Requested")}`}
                          </span>
                        ) : (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded bg-adm-amber-light px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-adm-amber">
                            {t("Pending Response")}
                          </span>
                        )}
                      </div>

                      {doc.actionNote && (
                        <p className="mt-2 text-[11px] italic text-adm-text-3">
                          "{doc.actionNote}"
                        </p>
                      )}

                      {doc.myResponse?.note && (
                        <div className="mt-2 rounded border border-adm-border/70 bg-adm-surface p-2 text-[11px]">
                          <span className="font-semibold text-adm-text-2">{t("Your note")}:</span>{" "}
                          <span className="text-adm-text-3">{doc.myResponse.note}</span>
                        </div>
                      )}

                      {/* Interactive choices for users */}
                      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-adm-border/70 pt-2.5">
                        <button
                          type="button"
                          disabled={submittingDocId === doc.id}
                          onClick={() => handleQuickAgree(doc)}
                          className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-bold transition ${
                            doc.myResponse?.status === "agreed"
                              ? "bg-green-600 text-white shadow-sm"
                              : "border border-green-300 bg-adm-surface text-green-700 hover:bg-green-50"
                          }`}
                          title={t("Agree with this document")}
                        >
                          <Check size={13} /> {t("Agree")}
                        </button>

                        <button
                          type="button"
                          disabled={submittingDocId === doc.id}
                          onClick={() => openResponseModal(doc, "disagreed")}
                          className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-bold transition ${
                            doc.myResponse?.status === "disagreed"
                              ? "bg-red-600 text-white shadow-sm"
                              : "border border-red-300 bg-adm-surface text-red-700 hover:bg-red-50"
                          }`}
                          title={t("Disagree with this document")}
                        >
                          <X size={13} /> {t("Disagree")}
                        </button>

                        <button
                          type="button"
                          disabled={submittingDocId === doc.id}
                          onClick={() => openResponseModal(doc, "review_requested")}
                          className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-bold transition ${
                            doc.myResponse?.status === "review_requested"
                              ? "bg-amber-600 text-white shadow-sm"
                              : "border border-amber-300 bg-adm-surface text-amber-700 hover:bg-amber-50"
                          }`}
                          title={t("Request a review or clarification")}
                        >
                          <MessageSquare size={13} /> {t("Request Review")}
                        </button>
                      </div>

                      {/* Admin response tracker breakdown */}
                      {isAdmin && doc.responseCounts && (
                        <div className="mt-2.5 flex items-center justify-between border-t border-adm-border/70 pt-2 text-[11px]">
                          <span className="font-mono text-adm-text-3">
                            <strong className="text-green-700">{doc.responseCounts.agreed || 0}</strong> {t("agreed")} ·{" "}
                            <strong className="text-red-700">{doc.responseCounts.disagreed || 0}</strong> {t("disagreed")} ·{" "}
                            <strong className="text-amber-700">{doc.responseCounts.review_requested || 0}</strong> {t("review")}
                          </span>
                          <button
                            type="button"
                            onClick={() => setViewResponsesDoc(doc)}
                            className="font-bold text-adm-blue hover:underline"
                          >
                            {t("Audit")} →
                          </button>
                        </div>
                      )}
                    </div>
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

      <AdminDrawer
        open={isUploadOpen}
        title={isAdmin ? t("Upload Document") : t("Upload My Document")}
        onClose={closeUpload}
      >
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

          {isAdmin ? (
            <AdminField label={t("Assign to")} htmlFor="doc-employee">
              <select
                id="doc-employee"
                value={employeeId}
                onChange={(event) => setEmployeeId(event.target.value)}
                className={adminInputClass}
                style={adminInputStyle}
              >
                {/* No employee = visible to everyone, which is how policies are published. */}
                <option value="">{t("Company-wide")}</option>
                {(employeesQuery.data ?? []).map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name ?? employee.email ?? employee.id}
                  </option>
                ))}
              </select>
            </AdminField>
          ) : (
            <p className="text-xs text-adm-text-3 font-mono">
              {t("This document will be saved securely to your personal vault records.")}
            </p>
          )}

          {isAdmin && (
            <div className="rounded border border-adm-border bg-adm-surface-2 p-3.5 space-y-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-adm-text cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={requiresAction}
                  onChange={(e) => setRequiresAction(e.target.checked)}
                  className="h-4 w-4 rounded border-adm-border text-adm-blue focus:ring-adm-blue"
                />
                <span>{t("Require Response (Agree / Disagree / Request Review)")}</span>
              </label>
              <p className="text-[11px] text-adm-text-3">
                {t("Recipients will be prompted to acknowledge, agree, disagree, or request a review on this document.")}
              </p>

              {requiresAction && (
                <div className="pt-1">
                  <label htmlFor="doc-action-note" className="block text-[11px] font-semibold text-adm-text-2 mb-1">
                    {t("Instructions / Review Note (Optional)")}
                  </label>
                  <textarea
                    id="doc-action-note"
                    rows={2}
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    placeholder={t("e.g. Please read carefully and submit your decision before next week...")}
                    className={adminInputClass}
                    style={adminInputStyle}
                  />
                </div>
              )}
            </div>
          )}

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

      {/* Response submission modal for Agree / Disagree / Request Review */}
      {isResponseDialogOpen && responseDoc && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md">
          <div
            className="adm-dialog w-full max-w-md rounded-none border p-6 shadow-xl"
            style={{ background: "var(--adm-surface)", borderColor: "var(--adm-border-2)" }}
          >
            <div className="flex items-center justify-between border-b border-adm-border pb-3">
              <h3 className="text-base font-bold" style={{ color: "var(--adm-text)" }}>
                {responseStatus === "agreed"
                  ? t("Agree to Document")
                  : responseStatus === "disagreed"
                  ? t("Disagree with Document")
                  : t("Request Review")}
              </h3>
              <button
                type="button"
                onClick={() => setIsResponseDialogOpen(false)}
                className="text-adm-text-3 hover:text-adm-text"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-3 text-xs font-semibold text-adm-text">
              {t("Document")}: <span className="font-normal text-adm-text-2">{responseDoc.title}</span>
            </p>

            {responseDoc.actionNote && (
              <div className="mt-2 rounded bg-adm-surface-2 p-2.5 text-xs italic text-adm-text-3">
                <span className="font-bold not-italic text-adm-text-2">{t("Instructions")}:</span>{" "}
                {responseDoc.actionNote}
              </div>
            )}

            <form onSubmit={handleResponseSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-adm-text-2 mb-1.5">
                  {t("Your Decision")}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setResponseStatus("agreed")}
                    className={`flex items-center justify-center gap-1 rounded border px-2.5 py-2 text-xs font-bold transition ${
                      responseStatus === "agreed"
                        ? "border-green-500 bg-green-600 text-white"
                        : "border-adm-border bg-adm-surface text-adm-text hover:border-green-400"
                    }`}
                  >
                    <Check size={14} /> {t("Agree")}
                  </button>

                  <button
                    type="button"
                    onClick={() => setResponseStatus("disagreed")}
                    className={`flex items-center justify-center gap-1 rounded border px-2.5 py-2 text-xs font-bold transition ${
                      responseStatus === "disagreed"
                        ? "border-red-500 bg-red-600 text-white"
                        : "border-adm-border bg-adm-surface text-adm-text hover:border-red-400"
                    }`}
                  >
                    <X size={14} /> {t("Disagree")}
                  </button>

                  <button
                    type="button"
                    onClick={() => setResponseStatus("review_requested")}
                    className={`flex items-center justify-center gap-1 rounded border px-2.5 py-2 text-xs font-bold transition ${
                      responseStatus === "review_requested"
                        ? "border-amber-500 bg-amber-600 text-white"
                        : "border-adm-border bg-adm-surface text-adm-text hover:border-amber-400"
                    }`}
                  >
                    <MessageSquare size={14} /> {t("Review")}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="response-note" className="block text-xs font-bold text-adm-text-2 mb-1">
                  {responseStatus === "agreed"
                    ? t("Feedback / Comments (Optional)")
                    : responseStatus === "disagreed"
                    ? t("Reason for Disagreeing")
                    : t("Questions or Clarifications Requested")}
                </label>
                <textarea
                  id="response-note"
                  rows={3}
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                  placeholder={
                    responseStatus === "disagreed"
                      ? t("Please provide details on what you disagree with...")
                      : responseStatus === "review_requested"
                      ? t("What changes or questions do you have regarding this document?")
                      : t("Optional note...")
                  }
                  className={adminInputClass}
                  style={adminInputStyle}
                />
              </div>

              {responseDialogError && (
                <p className="text-xs font-semibold text-red-600">{responseDialogError}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResponseDialogOpen(false)}
                  className="rounded border border-adm-border px-3 py-1.5 text-xs font-semibold text-adm-text-2 hover:bg-black/5"
                >
                  {t("Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={submittingDocId === responseDoc.id}
                  className="rounded bg-adm-blue px-4 py-1.5 text-xs font-bold text-white hover:bg-adm-blue-mid disabled:opacity-50"
                >
                  {submittingDocId === responseDoc.id ? t("Submitting…") : t("Submit Response")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Audit Drawer for Document Responses */}
      <AdminDrawer
        open={Boolean(viewResponsesDoc)}
        title={t("Document Responses Audit")}
        onClose={() => setViewResponsesDoc(null)}
        width="wide"
      >
        {viewResponsesDoc && (
          <div className="space-y-6">
            <div className="rounded border border-adm-border bg-adm-surface-2 p-4">
              <h3 className="text-base font-bold text-adm-text">{viewResponsesDoc.title}</h3>
              <p className="mt-1 text-xs text-adm-text-3">
                {t(viewResponsesDoc.documentType)} · {t("Uploaded on")}{" "}
                {new Date(viewResponsesDoc.createdAt).toLocaleDateString()}
              </p>
              {viewResponsesDoc.actionNote && (
                <div className="mt-3 rounded border border-adm-border/70 bg-adm-surface p-2.5 text-xs">
                  <span className="font-bold text-adm-text-2">{t("Instructions Note")}:</span>{" "}
                  <span className="italic text-adm-text-3">{viewResponsesDoc.actionNote}</span>
                </div>
              )}

              {/* Tally cards */}
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded border border-green-200 bg-green-50 p-2.5">
                  <p className="text-xl font-extrabold text-green-700">
                    {viewResponsesDoc.responseCounts?.agreed ?? 0}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-green-800">
                    {t("Agreed")}
                  </p>
                </div>
                <div className="rounded border border-red-200 bg-red-50 p-2.5">
                  <p className="text-xl font-extrabold text-red-700">
                    {viewResponsesDoc.responseCounts?.disagreed ?? 0}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-red-800">
                    {t("Disagreed")}
                  </p>
                </div>
                <div className="rounded border border-amber-200 bg-amber-50 p-2.5">
                  <p className="text-xl font-extrabold text-amber-700">
                    {viewResponsesDoc.responseCounts?.review_requested ?? 0}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                    {t("Review Requested")}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-adm-text-2">
                {t("Employee Responses")}
              </h4>

              {responsesQuery.isLoading ? (
                <div className="flex items-center justify-center py-10 text-xs text-adm-text-3">
                  {t("Loading audit records...")}
                </div>
              ) : (responsesQuery.data ?? []).length === 0 ? (
                <div className="rounded border border-dashed border-adm-border p-8 text-center text-xs text-adm-text-3">
                  {t("No responses submitted yet by recipients.")}
                </div>
              ) : (
                <div className="divide-y divide-adm-border rounded border border-adm-border bg-adm-surface">
                  {(responsesQuery.data ?? []).map((resp) => (
                    <div key={resp.id} className="p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-adm-text">
                            {resp.userName || resp.userEmail || t("Unknown User")}
                          </span>
                          {resp.userEmail && resp.userName && (
                            <span className="ms-2 text-[11px] text-adm-text-3">({resp.userEmail})</span>
                          )}
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            resp.status === "agreed"
                              ? "border border-green-300 bg-green-100 text-green-800"
                              : resp.status === "disagreed"
                              ? "border border-red-300 bg-red-100 text-red-800"
                              : "border border-amber-300 bg-amber-100 text-amber-800"
                          }`}
                        >
                          {resp.status === "agreed"
                            ? `✓ ${t("Agreed")}`
                            : resp.status === "disagreed"
                            ? `✕ ${t("Disagreed")}`
                            : `✎ ${t("Review Requested")}`}
                        </span>
                      </div>

                      {resp.note && (
                        <p className="rounded bg-adm-surface-2 p-2 text-xs text-adm-text-2">
                          <span className="font-semibold text-adm-text-3">{t("Note")}:</span> {resp.note}
                        </p>
                      )}

                      <p className="text-[10px] text-adm-text-3">
                        {t("Submitted")}: {new Date(resp.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </AdminDrawer>
    </div>
  );
}

