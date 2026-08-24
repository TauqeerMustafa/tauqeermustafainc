import type { ReactNode } from "react";

export function EmptyState({
  title = "No results found",
  message = "There is no content to show yet.",
  action,
}: {
  title?: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-[#E5E7EB] bg-[#F8FAFC] p-8 text-center">
      <h2 className="text-lg font-semibold text-[#111827]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
        {message}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
