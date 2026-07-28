export function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      className="rounded-none border border-[#E5E7EB] bg-white p-7 shadow-sm"
    >
      <div className="h-4 w-24 rounded bg-[#E5E7EB]" />
      <div className="mt-6 h-6 w-3/4 rounded bg-[#E5E7EB]" />
      <div className="mt-4 space-y-3">
        <div className="h-3 rounded bg-[#E5E7EB]" />
        <div className="h-3 w-5/6 rounded bg-[#E5E7EB]" />
      </div>
    </div>
  );
}
