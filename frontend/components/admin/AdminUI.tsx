"use client";

import { AlertTriangle, Inbox, Loader2, Plus, X } from "lucide-react";
import { type ReactNode } from "react";

import { useI18n } from "@/lib/i18n";

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
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
          style={{ color: "var(--adm-text)" }}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm font-normal" style={{ color: "var(--adm-text-3)" }}>
            {description}
          </p>
        )}
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center gap-2 rounded-none bg-adm-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-adm-blue-mid active:scale-[0.98]"
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
      className="flex items-center justify-center gap-3 rounded-none border py-16"
      style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)", color: "var(--adm-text-3)" }}
    >
      <Loader2 size={18} className="animate-spin" style={{ color: "var(--adm-blue)" }} />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

export function AdminErrorState({ message = "Something went wrong loading this data." }: { message?: string }) {
  return (
    <div
      className="flex flex-col items-center gap-3 rounded-none border py-14 text-center"
      style={{ borderColor: "var(--adm-red)", background: "var(--adm-red-light)", color: "var(--adm-red)" }}
    >
      <AlertTriangle size={22} />
      <p className="max-w-sm text-sm font-medium">{message}</p>
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
      className="flex flex-col items-center gap-3 rounded-none border py-16 text-center"
      style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}
    >
      <Inbox size={24} style={{ color: "var(--adm-text-3)" }} />
      <p className="text-base font-semibold" style={{ color: "var(--adm-text)" }}>{title}</p>
      {description && (
        <p className="max-w-sm text-sm font-normal" style={{ color: "var(--adm-text-3)" }}>
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
  const { t } = useI18n();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md">
      <div
        className="adm-dialog w-full max-w-sm rounded-none border p-6"
        style={{ background: "var(--adm-surface)", borderColor: "var(--adm-border-2)" }}
      >
        <h3 className="text-lg font-semibold tracking-tight" style={{ color: "var(--adm-text)" }}>
          {title}
        </h3>
        {description && (
          <p className="mt-2 text-sm" style={{ color: "var(--adm-text-2)" }}>
            {description}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-none border px-4 py-2 text-xs font-semibold transition hover:bg-black/5"
            style={{ borderColor: "var(--adm-border-2)", color: "var(--adm-text-2)" }}
          >
            {t("Cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="rounded-none px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            style={{ background: "var(--adm-red)" }}
          >
            {isPending ? t("Deleting…") : confirmLabel}
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
  width = "default",
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  width?: "default" | "wide";
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/40 backdrop-blur-md">
      <div
        className={`adm-drawer w-full ${width === "wide" ? "max-w-2xl" : "max-w-lg"} overflow-y-auto border-s p-6 sm:p-8`}
        style={{ background: "var(--adm-surface)", borderColor: "var(--adm-border-2)" }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight" style={{ color: "var(--adm-text)" }}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full border transition hover:bg-black/5"
            style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}
          >
            <X size={16} />
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
    <div className="grid gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-xs font-medium"
        style={{ color: "var(--adm-text-2)" }}
      >
        {label}
      </label>
      {children}
      {error && <p className="text-xs font-medium" style={{ color: "var(--adm-red)" }}>{error}</p>}
    </div>
  );
}

export const adminInputClass =
  "w-full rounded-none border px-3.5 py-2.5 text-[15px] outline-none transition focus:border-adm-blue focus:ring-2 focus:ring-adm-blue/15";

export const adminInputStyle = {
  borderColor: "var(--adm-border-2)",
  background: "var(--adm-surface)",
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
  const { t } = useI18n();

  return (
    <div
      className="mt-8 flex justify-end gap-2.5 border-t pt-6"
      style={{ borderColor: "var(--adm-border)" }}
    >
      <button
        type="button"
        onClick={onCancel}
        className="rounded-none border px-4 py-2 text-xs font-semibold transition hover:bg-black/5"
        style={{ borderColor: "var(--adm-border-2)", color: "var(--adm-text-2)" }}
      >
        {t("Cancel")}
      </button>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-none bg-adm-blue px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-adm-blue-mid active:scale-[0.98] disabled:opacity-50"
      >
        {isPending ? t("Saving…") : submitLabel}
      </button>
    </div>
  );
}
