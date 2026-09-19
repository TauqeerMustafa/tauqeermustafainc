"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for diagnostic reporting
    console.error("[Admin Portal Error]:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto max-w-md rounded-none border border-adm-border bg-adm-surface p-8 shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
          <AlertTriangle size={24} />
        </div>

        <h2 className="mb-2 text-lg font-bold text-adm-text">
          Something went wrong loading this admin section
        </h2>

        <p className="mb-4 text-xs text-adm-text-3">
          {error.message || "An unexpected error occurred while rendering the page."}
        </p>

        {error.digest && (
          <p className="mb-4 font-mono text-[10px] text-adm-text-3/70">
            Error digest: {error.digest}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded bg-adm-blue px-4 py-2 text-xs font-bold text-white transition hover:bg-adm-blue/90"
          >
            <RefreshCw size={13} />
            Try Again
          </button>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded border border-adm-border bg-adm-surface px-4 py-2 text-xs font-semibold text-adm-text transition hover:bg-adm-surface-2"
          >
            Reload Page
          </button>

          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 rounded border border-adm-border bg-adm-surface px-4 py-2 text-xs font-semibold text-adm-text transition hover:bg-adm-surface-2"
          >
            <ArrowLeft size={13} />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
