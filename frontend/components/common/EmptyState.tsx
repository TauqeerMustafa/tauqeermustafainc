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
    <div className="rounded-none border border-dashed border-[#E5E5E5] bg-[#FAFAFA] p-8 text-center">
      <h2 className="text-lg font-semibold text-[#0A0A0A]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#737373]">
        {message}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
