"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalAppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Application Root Error]:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-[#0d1117] text-white">
      <div className="mx-auto max-w-md border border-neutral-800 bg-neutral-900/90 p-8 rounded-lg shadow-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-950/60 text-red-400 border border-red-800/40">
          <AlertTriangle size={28} />
        </div>

        <h1 className="mb-2 text-xl font-bold tracking-tight text-white">
          Application encountered an error
        </h1>

        <p className="mb-6 text-sm text-neutral-400">
          {error.message || "An unexpected error occurred while loading the application."}
        </p>

        {error.digest && (
          <p className="mb-6 font-mono text-[11px] text-neutral-500">
            Reference ID: {error.digest}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded bg-blue-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
          >
            <RefreshCw size={14} />
            Try Again
          </button>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded border border-neutral-700 bg-neutral-800 px-5 py-2.5 text-xs font-semibold text-neutral-200 transition hover:bg-neutral-700"
          >
            Reload
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded border border-neutral-700 bg-neutral-800 px-5 py-2.5 text-xs font-semibold text-neutral-200 transition hover:bg-neutral-700"
          >
            <Home size={14} />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
