"use client";

/**
 * Management → Pipeline. Leadership gets the same workbench as everyone else
 * (their `leads.*` scope decides how much of the book comes back) plus the
 * funnel breakdown, which is the one view that is reporting rather than work.
 */

import { BarChart3 } from "lucide-react";

import {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
  Panel,
} from "@/components/portal/PortalUI";
import LeadWorkbench from "@/components/portal/LeadWorkbench";
import { useLeadPipeline } from "@/hooks/useLeads";
import type { LeadPipeline } from "@/types";

function money(value: number | null | undefined, currency = "USD") {
  const amount = value ?? 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Unknown currency code — fall back to a plain number rather than throwing.
    return amount.toLocaleString();
  }
}

/** Funnel column list: count and value per stage, widths inline (data-driven). */
function Funnel({ pipeline }: { pipeline: LeadPipeline }) {
  const max = Math.max(1, ...pipeline.stages.map((stage) => stage.count));
  return (
    <ul className="flex flex-col gap-3.5">
      {pipeline.stages.map((stage) => (
        <li key={stage.status} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-4 text-sm">
            <span className="truncate text-adm-text-2">{stage.label}</span>
            <span className="flex items-baseline gap-3">
              <span className="text-xs text-adm-text-3">{money(stage.value)}</span>
              <span className="font-bold tabular-nums text-adm-text">{stage.count}</span>
            </span>
          </div>
          <div className="h-1.5 w-full bg-adm-surface-2">
            <div className="h-full bg-adm-blue" style={{ width: `${(stage.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function ManagementPipelinePage() {
  const pipeline = useLeadPipeline();
  const data = pipeline.data;

  return (
    <div className="flex flex-col gap-8">
      <LeadWorkbench title="Pipeline" description="Who is working what, and what is due next." />

      <Panel title="Funnel" icon={BarChart3}>
        {pipeline.isLoading ? (
          <LoadingBlock label="Loading funnel…" />
        ) : pipeline.isError || !data ? (
          <ErrorBlock
            message={
              pipeline.error instanceof Error ? pipeline.error.message : "Could not load the funnel."
            }
            onRetry={() => pipeline.refetch()}
          />
        ) : data.stages.length === 0 ? (
          <EmptyBlock title="No leads" description="Nothing is in the pipeline yet." />
        ) : (
          <Funnel pipeline={data} />
        )}
      </Panel>
    </div>
  );
}
