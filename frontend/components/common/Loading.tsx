import { Spinner } from "@/components/common/Spinner";

export function Loading({ message = "Loading content" }: { message?: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-none border border-line bg-white p-8 text-center">
      <div>
        <Spinner label={message} />
        <p className="mt-4 text-sm font-medium text-ink-muted">{message}</p>
      </div>
    </div>
  );
}
