import type { ReactNode } from "react";

export function ErrorState({
  title = "Something went wrong",
  message = "The request could not be completed. Please try again.",
  action,
}: {
  title?: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="rounded-none border border-red-200 bg-red-50 p-6 text-[#141413]"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#737373]">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
