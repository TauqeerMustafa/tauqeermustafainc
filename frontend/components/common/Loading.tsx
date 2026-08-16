import { Spinner } from "@/components/common/Spinner";

export function Loading({ message = "Loading content" }: { message?: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-none border border-[#e2ded9] bg-white p-8 text-center">
      <div>
        <Spinner label={message} />
        <p className="mt-4 text-sm font-medium text-[#737373]">{message}</p>
      </div>
    </div>
  );
}
