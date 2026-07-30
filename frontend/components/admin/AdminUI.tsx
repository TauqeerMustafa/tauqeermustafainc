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
        <h1 className="text-xl font-bold text-white sm:text-2xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
      </div>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="flex items-center justify-center gap-2 rounded-none bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-300"
        >
          <Plus size={16} />
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export function AdminLoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 border border-white/10 bg-white/5 py-16 text-slate-400">
      <Loader2 size={18} className="animate-spin" />
      {label}
    </div>
  );
}

export function AdminErrorState({ message = "Something went wrong loading this data." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 border border-red-500/20 bg-red-500/5 py-16 text-center text-red-300">
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
    <div className="flex flex-col items-center gap-3 border border-white/10 bg-white/5 py-16 text-center">
      <Inbox size={22} className="text-slate-500" />
      <p className="font-semibold text-white">{title}</p>
      {description ? <p className="max-w-sm text-sm text-slate-400">{description}</p> : null}
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm border border-white/10 bg-[#0B1220] p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description ? <p className="mt-2 text-sm text-slate-400">{description}</p> : null}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400 disabled:opacity-50"
          >
            {isPending ? "Deleting..." : confirmLabel}
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
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/70">
      <div
        className="w-full max-w-lg overflow-y-auto border-l border-white/10 bg-[#0B1220] p-6 shadow-2xl sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center border border-white/10 text-slate-300 transition hover:border-yellow-400"
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
      <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-200">
        {label}
      </label>
      {children}
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}

export const adminInputClass =
  "w-full rounded-none border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-yellow-400";

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
    <div className="mt-8 flex justify-end gap-3 border-t border-white/10 pt-6">
      <button
        type="button"
        onClick={onCancel}
        className="border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isPending}
        className="bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:opacity-50"
      >
        {isPending ? "Saving..." : submitLabel}
      </button>
    </div>
  );
}
