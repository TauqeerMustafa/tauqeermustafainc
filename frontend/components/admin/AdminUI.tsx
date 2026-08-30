"use client";

import { AlertTriangle, Inbox, Loader2, Plus, X } from "lucide-react";
import { type ReactNode } from "react";

export function AdminPageHeader({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1
          className="text-xl font-bold uppercase sm:text-2xl"
          style={{ color: "var(--adm-text)", letterSpacing: "-0.01em" }}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm" style={{ color: "var(--adm-text-3)" }}>
            {description}
          </p>
        )}
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn-press flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:opacity-90"
          style={{ background: "var(--adm-blue)" }}
        >
          <Plus size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function AdminLoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex items-center justify-center gap-3 border py-16"
      style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-3)" }}
    >
      <Loader2 size={18} className="animate-spin" style={{ color: "var(--adm-blue)" }} />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function AdminErrorState({ message = "Something went wrong loading this data." }: { message?: string }) {
  return (
    <div
      className="flex flex-col items-center gap-3 border py-16 text-center"
      style={{ borderColor: "var(--adm-red)", background: "var(--adm-red-light)", color: "var(--adm-red)" }}
    >
      <AlertTriangle size={22} />
      <p className="max-w-sm text-sm">{message}</p>
    </div>
  );
}

export function AdminEmptyState({
  title = "Nothing here yet",
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div
      className="flex flex-col items-center gap-3 border py-16 text-center"
      style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface-2)" }}
    >
      <Inbox size={22} style={{ color: "var(--adm-text-3)" }} />
      <p className="font-semibold" style={{ color: "var(--adm-text)" }}>{title}</p>
      {description && (
        <p className="max-w-sm text-sm" style={{ color: "var(--adm-text-3)" }}>
          {description}
        </p>
      )}
    </div>
  );
}

export function AdminConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  isPending,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className="adm-dialog w-full max-w-sm border p-6"
        style={{ background: "var(--adm-surface)", borderColor: "var(--adm-border)" }}
      >
        <h3 className="text-lg font-semibold uppercase" style={{ color: "var(--adm-text)" }}>
          {title}
        </h3>
        {description && (
          <p className="mt-2 text-sm" style={{ color: "var(--adm-text-2)" }}>
            {description}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="border px-4 py-2 text-xs font-bold uppercase tracking-wider transition hover:bg-[var(--adm-surface-2)]"
            style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="btn-press px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--adm-red)" }}
          >
            {isPending ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminDrawer({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/60 backdrop-blur-sm">
      <div
        className="adm-drawer w-full max-w-lg overflow-y-auto border-l p-6 sm:p-8"
        style={{ background: "var(--adm-surface)", borderColor: "var(--adm-border)" }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold uppercase" style={{ color: "var(--adm-text)" }}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center border transition hover:bg-[var(--adm-surface-2)]"
            style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function AdminField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <label
        htmlFor={htmlFor}
        className="text-xs font-bold uppercase tracking-wider"
        style={{ color: "var(--adm-text-2)" }}
      >
        {label}
      </label>
      {children}
      {error && <p className="text-xs" style={{ color: "var(--adm-red)" }}>{error}</p>}
    </div>
  );
}

export const adminInputClass =
  "w-full border rounded-none px-4 py-3 text-[15px] outline-none transition focus:border-[color:var(--adm-blue)] focus:ring-2 focus:ring-[color:var(--adm-blue)]/25";

export const adminInputStyle = {
  borderColor: "var(--adm-border)",
  background: "var(--adm-surface-2)",
  color: "var(--adm-text)",
};

export function AdminFormActions({
  onCancel,
  isPending,
  submitLabel = "Save",
}: {
  onCancel: () => void;
  isPending?: boolean;
  submitLabel?: string;
}) {
  return (
    <div
      className="mt-8 flex justify-end gap-3 border-t pt-6"
      style={{ borderColor: "var(--adm-border)" }}
    >
      <button
        type="button"
        onClick={onCancel}
        className="border px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition hover:bg-[var(--adm-surface-2)]"
        style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isPending}
        className="btn-press px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:opacity-90 disabled:opacity-50"
        style={{ background: "var(--adm-blue)" }}
      >
        {isPending ? "Saving…" : submitLabel}
      </button>
    </div>
  );
}
